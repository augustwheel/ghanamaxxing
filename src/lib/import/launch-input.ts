import Papa from "papaparse";
import { z } from "zod";
import { LAUNCH_TYPES } from "@/config/launch-types";
import { findPlace } from "@/config/places";
import { SEED_DEFAULT_AGE_DAYS } from "@/config/rankings";
import { slugify, uniqueSlug } from "@/lib/slug";
import type { MakerSocials } from "@/lib/types";

// Shared by the admin import page, the admin "add one" form and `npm run seed`.

const SOCIAL_KEYS = ["x", "instagram", "linkedin", "github", "tiktok", "website"] as const;

const optionalText = (max: number) =>
  z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? undefined : v), z.string().trim().max(max).optional());

const optionalUrl = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  z.string().trim().regex(/^https?:\/\/\S+$/i, "must start with http:// or https://").optional(),
);

const optionalNumber = (min: number, max: number) =>
  z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
    z.number().min(min).max(max).optional(),
  );

const launchType = z.preprocess(
  (v) => {
    if (typeof v !== "string") return v;
    const s = v.trim().toLowerCase();
    return LAUNCH_TYPES.find((t) => t.value === s || t.label.toLowerCase() === s)?.value ?? s;
  },
  z.enum(LAUNCH_TYPES.map((t) => t.value) as [string, ...string[]], {
    error: `must be one of: ${LAUNCH_TYPES.map((t) => t.label).join(", ")}`,
  }),
);

export const launchInputSchema = z.object({
  name: z.string().trim().min(1, "is required").max(80),
  slug: optionalText(60),
  tagline: z.string().trim().min(1, "is required").max(100),
  description: optionalText(800),
  url: z.string().trim().regex(/^https?:\/\/\S+$/i, "must start with http:// or https://"),
  logo_url: optionalUrl,
  image_url: optionalUrl,
  type: launchType,
  city: optionalText(80),
  lat: optionalNumber(-90, 90),
  lng: optionalNumber(-180, 180),
  maker_name: optionalText(80),
  launched_at: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.coerce.date().optional(),
  ),
  ...Object.fromEntries(SOCIAL_KEYS.map((k) => [`maker_${k}`, optionalUrl])),
});

export type LaunchInsert = {
  slug: string;
  name: string;
  tagline: string;
  description: string | null;
  url: string;
  logo_url: string | null;
  image_url: string | null;
  type: string;
  city: string | null;
  lat: number | null;
  lng: number | null;
  maker_name: string | null;
  maker_socials: MakerSocials;
  source: "ghanamaxxing";
  status: "approved";
  launched_at: string;
};

export type RowProblem = { row: number; name?: string; messages: string[] };

export type PrepareResult = {
  rows: LaunchInsert[];
  errors: RowProblem[];
  skipped: RowProblem[];
};

// Turns a CSV or JSON file's text into raw objects. JSON may be an array or { launches: [...] }.
export function parseLaunchFile(text: string, filename: string): Record<string, unknown>[] {
  const trimmed = text.trim();
  if (filename.toLowerCase().endsWith(".json") || trimmed.startsWith("[") || trimmed.startsWith("{")) {
    const data = JSON.parse(trimmed);
    const list = Array.isArray(data) ? data : data.launches;
    if (!Array.isArray(list)) throw new Error("JSON must be an array of launches, or { \"launches\": [...] }");
    // Flatten a nested maker_socials object into maker_x, maker_github…
    return list.map((item: Record<string, unknown>) => {
      const socials = (item.maker_socials ?? {}) as Record<string, unknown>;
      const flat = { ...item };
      delete flat.maker_socials;
      for (const k of SOCIAL_KEYS) if (socials[k] && !flat[`maker_${k}`]) flat[`maker_${k}`] = socials[k];
      return flat;
    });
  }
  const parsed = Papa.parse<Record<string, string>>(trimmed, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, "_"),
  });
  if (parsed.errors.length) {
    const e = parsed.errors[0];
    throw new Error(`CSV problem on row ${(e.row ?? 0) + 2}: ${e.message}`);
  }
  return parsed.data;
}

/**
 * Validates raw rows and turns them into inserts for seeded launches.
 * Rows whose URL or slug already exist (in the database or earlier in the file) are skipped, not errors.
 */
export function prepareSeedLaunches(
  raw: Record<string, unknown>[],
  existing: { slugs: Iterable<string>; urls: Iterable<string> },
  now = new Date(),
): PrepareResult {
  const takenSlugs = new Set(Array.from(existing.slugs, (s) => s.toLowerCase()));
  const takenUrls = new Set(Array.from(existing.urls, normaliseUrl));
  const defaultLaunchedAt = new Date(now.getTime() - SEED_DEFAULT_AGE_DAYS * 86_400_000).toISOString();
  const result: PrepareResult = { rows: [], errors: [], skipped: [] };

  raw.forEach((item, i) => {
    const row = i + 1;
    const parsed = launchInputSchema.safeParse(item);
    if (!parsed.success) {
      result.errors.push({
        row,
        name: typeof item.name === "string" ? item.name : undefined,
        messages: parsed.error.issues.map((iss) => `${iss.path.join(".") || "row"} ${iss.message}`),
      });
      return;
    }
    const d = parsed.data as z.infer<typeof launchInputSchema> & Record<string, string | undefined>;

    const urlKey = normaliseUrl(d.url);
    if (takenUrls.has(urlKey)) {
      result.skipped.push({ row, name: d.name, messages: [`${d.url} is already listed`] });
      return;
    }
    const wantedSlug = slugify(d.slug ?? d.name);
    if (d.slug && takenSlugs.has(wantedSlug)) {
      result.skipped.push({ row, name: d.name, messages: [`slug "${wantedSlug}" is already taken`] });
      return;
    }

    let { lat, lng } = d;
    if (lat === undefined || lng === undefined) {
      const place = findPlace(d.city);
      if (place) ({ lat, lng } = place);
    }

    const socials: MakerSocials = {};
    for (const k of SOCIAL_KEYS) if (d[`maker_${k}`]) socials[k] = d[`maker_${k}`];

    takenUrls.add(urlKey);
    result.rows.push({
      slug: uniqueSlug(wantedSlug, takenSlugs),
      name: d.name,
      tagline: d.tagline,
      description: d.description ?? null,
      url: d.url,
      logo_url: d.logo_url ?? null,
      image_url: d.image_url ?? null,
      type: d.type,
      city: d.city ?? null,
      lat: lat ?? null,
      lng: lng ?? null,
      maker_name: d.maker_name ?? null,
      maker_socials: socials,
      source: "ghanamaxxing",
      status: "approved",
      launched_at: d.launched_at ? d.launched_at.toISOString() : defaultLaunchedAt,
    });
  });

  return result;
}

export function normaliseUrl(url: string) {
  return url.trim().toLowerCase().replace(/\/+$/, "");
}
