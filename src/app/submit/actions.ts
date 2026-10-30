"use server";

import { z } from "zod";
import { LAUNCH_TYPE_VALUES } from "@/config/launch-types";
import { normaliseUrl, prepareSeedLaunches } from "@/lib/import/launch-input";
import { createServiceClient } from "@/lib/supabase/service";
import { visitorIpHash } from "@/lib/visitor";

export type SubmitState = { done?: boolean; error?: string; existing?: { name: string; slug: string }; values?: Record<string, string> };

const PER_IP_PER_HOUR = 5;

const schema = z.object({
  url: z.string().trim().min(1, "Add the link"),
  name: z.string().trim().min(1, "Add the name").max(80),
  tagline: z.string().trim().min(3, "Add a one-line description").max(100, "Keep the description under 100 characters"),
  type: z.enum(LAUNCH_TYPE_VALUES, { error: "Pick a category" }),
  city: z.string().trim().max(80).optional(),
  maker_name: z.string().trim().max(80).optional(),
  email: z.union([z.literal(""), z.string().trim().email("That email doesn't look right").max(200)]).optional(),
  made_it: z.literal("on").optional(),
  nickname: z.string().max(0), // honeypot: hidden from people
});

export async function submitLaunch(_prev: SubmitState, formData: FormData): Promise<SubmitState> {
  const values = Object.fromEntries([...formData.entries()].filter(([, v]) => typeof v === "string")) as Record<string, string>;
  const db = createServiceClient();
  if (!db) return { values, error: "Adding launches opens once the site's database is connected." };

  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    if (issue.path[0] === "nickname") return { done: true }; // bots get a quiet thanks
    return { values, error: issue.message };
  }
  const d = parsed.data;
  const url = /^https?:\/\//i.test(d.url) ? d.url : `https://${d.url}`;

  const ipHash = await visitorIpHash();
  const hourAgo = new Date(Date.now() - 3_600_000).toISOString();
  const { count } = await db.from("launch_submissions").select("launch_id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", hourAgo);
  if ((count ?? 0) >= PER_IP_PER_HOUR) return { values, error: "That's a lot of launches from here. Try again in an hour." };

  const { data: existing, error: listError } = await db.from("launches").select("slug, url, name, status");
  if (listError) return { values, error: "Couldn't save that. Try again." };
  const dupe = existing.find((l) => normaliseUrl(l.url) === normaliseUrl(url));
  if (dupe) {
    return dupe.status === "approved"
      ? { values, existing: { name: dupe.name, slug: dupe.slug } }
      : { done: true }; // already waiting for review
  }

  // Same validation and place lookup as the seed import, then marked pending for review.
  const { rows, errors } = prepareSeedLaunches(
    [{ name: d.name, tagline: d.tagline, url, type: d.type, city: d.city, maker_name: d.maker_name }],
    { slugs: existing.map((l) => l.slug), urls: existing.map((l) => l.url) },
  );
  if (errors.length) return { values, error: errors[0].messages[0] };
  const row = { ...rows[0], status: "pending" as const, source: d.made_it ? ("maker" as const) : ("ghanamaxxing" as const), launched_at: null };

  const { data: launch, error } = await db.from("launches").insert(row).select("id").single();
  if (error) return { values, error: "Couldn't save that. Try again." };
  await db.from("launch_submissions").insert({ launch_id: launch.id, contact_email: d.email || null, made_it: Boolean(d.made_it), ip_hash: ipHash });
  return { done: true };
}
