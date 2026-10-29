"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { parseLaunchFile, prepareSeedLaunches, type RowProblem } from "@/lib/import/launch-input";
import type { LaunchStatus } from "@/lib/types";

type Supabase = Awaited<ReturnType<typeof requireAdmin>>["supabase"];

async function existingKeys(supabase: Supabase) {
  const { data, error } = await supabase.from("launches").select("slug, url");
  if (error) throw error;
  return { slugs: data.map((d) => d.slug as string), urls: data.map((d) => d.url as string) };
}

function revalidatePublic() {
  revalidatePath("/");
  revalidatePath("/launches");
  revalidatePath("/launch/[slug]", "page");
}

// ─── Bulk import ──────────────────────────────────────────────────────────

export type ImportState = {
  stage: "idle" | "preview" | "done" | "error";
  message?: string;
  fileText?: string;
  fileName?: string;
  ready?: { name: string; slug: string; type: string; city: string | null }[];
  errors?: RowProblem[];
  skipped?: RowProblem[];
};

export async function importLaunches(_prev: ImportState, formData: FormData): Promise<ImportState> {
  const { supabase } = await requireAdmin("/admin/import");
  const commit = formData.get("intent") === "commit";

  let fileText = String(formData.get("fileText") ?? "");
  let fileName = String(formData.get("fileName") ?? "");
  const file = formData.get("file");
  if (!commit && file instanceof File && file.size > 0) {
    if (file.size > 2_000_000) return { stage: "error", message: "File is over 2 MB. Split it into smaller files." };
    fileText = await file.text();
    fileName = file.name;
  }
  if (!fileText.trim()) return { stage: "error", message: "Choose a CSV or JSON file first." };

  let raw: Record<string, unknown>[];
  try {
    raw = parseLaunchFile(fileText, fileName);
  } catch (e) {
    return { stage: "error", message: e instanceof Error ? e.message : "Couldn't read that file." };
  }

  const { rows, errors, skipped } = prepareSeedLaunches(raw, await existingKeys(supabase));

  if (!commit || errors.length) {
    return {
      stage: "preview",
      fileText,
      fileName,
      ready: rows.map((r) => ({ name: r.name, slug: r.slug, type: r.type, city: r.city })),
      errors,
      skipped,
    };
  }

  if (rows.length) {
    const { error } = await supabase.from("launches").insert(rows);
    if (error) return { stage: "error", message: `Import failed, nothing was saved: ${error.message}` };
  }
  revalidatePublic();
  return {
    stage: "done",
    message: `Imported ${rows.length} launch${rows.length === 1 ? "" : "es"}${skipped.length ? `, skipped ${skipped.length}` : ""}.`,
    skipped,
  };
}

// ─── Add one ──────────────────────────────────────────────────────────────

export type AddState = { error?: string; fieldErrors?: string[] };

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/gif"];

async function uploadImage(supabase: Supabase, file: FormDataEntryValue | null, slug: string, kind: "logo" | "image") {
  if (!(file instanceof File) || file.size === 0) return undefined;
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) throw new Error(`${kind} must be PNG, JPG, WebP, SVG or GIF`);
  if (file.size > 2_097_152) throw new Error(`${kind} must be under 2 MB`);
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const path = `seed/${slug}/${kind}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("launch-media").upload(path, file, { contentType: file.type });
  if (error) throw new Error(`Couldn't upload ${kind}: ${error.message}`);
  return supabase.storage.from("launch-media").getPublicUrl(path).data.publicUrl;
}

export async function addLaunch(_prev: AddState, formData: FormData): Promise<AddState> {
  const { supabase } = await requireAdmin("/admin/new");
  const input = Object.fromEntries(
    [...formData.entries()].filter(([, v]) => typeof v === "string") as [string, string][],
  );

  const { rows, errors, skipped } = prepareSeedLaunches([input], await existingKeys(supabase));
  if (errors.length) return { fieldErrors: errors[0].messages };
  if (skipped.length) return { error: skipped[0].messages[0] };

  const row = rows[0];
  try {
    row.logo_url = (await uploadImage(supabase, formData.get("logo_file"), row.slug, "logo")) ?? row.logo_url;
    row.image_url = (await uploadImage(supabase, formData.get("image_file"), row.slug, "image")) ?? row.image_url;
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload failed" };
  }

  const { error } = await supabase.from("launches").insert(row);
  if (error) return { error: error.message };
  revalidatePublic();
  redirect(`/launch/${row.slug}`);
}

// ─── Status changes ───────────────────────────────────────────────────────

export async function setLaunchStatus(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as LaunchStatus;
  if (!["approved", "rejected", "removed", "pending"].includes(status)) return;
  const { error } = await supabase.from("launches").update({ status }).eq("id", id);
  if (error) throw error;
  revalidatePath("/admin");
  revalidatePublic();
}
