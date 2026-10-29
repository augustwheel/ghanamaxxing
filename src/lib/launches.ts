import "server-only";
import sample from "../../data/seed-launches.json";
import { isLaunchType, type LaunchType } from "@/config/launch-types";
import { prepareSeedLaunches } from "@/lib/import/launch-input";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";
import type { Launch } from "@/lib/types";

const LAUNCH_COLUMNS =
  "id, slug, name, tagline, description, url, logo_url, image_url, type, city, lat, lng, maker_name, maker_socials, source, status, claimed_by, launched_at, star_count, created_at";

export async function getApprovedLaunches({ type, limit = 200 }: { type?: LaunchType; limit?: number } = {}) {
  if (!isSupabaseConfigured) {
    return sampleLaunches()
      .filter((l) => !type || l.type === type)
      .slice(0, limit);
  }
  let query = createPublicClient()
    .from("launches")
    .select(LAUNCH_COLUMNS)
    .eq("status", "approved")
    .order("launched_at", { ascending: false })
    .limit(limit);
  if (type) query = query.eq("type", type);
  const { data, error } = await query;
  if (error) throw error;
  return data as Launch[];
}

export async function getLaunchBySlug(slug: string) {
  if (!isSupabaseConfigured) return sampleLaunches().find((l) => l.slug === slug) ?? null;
  const { data, error } = await createPublicClient()
    .from("launches")
    .select(LAUNCH_COLUMNS)
    .eq("status", "approved")
    .eq("slug", slug.toLowerCase())
    .maybeSingle();
  if (error) throw error;
  return data as Launch | null;
}

export function parseTypeParam(value: string | string[] | undefined) {
  const v = Array.isArray(value) ? value[0] : value;
  return isLaunchType(v) ? v : undefined;
}

// Preview data for running the site before Supabase is set up: the real seed list.
function sampleLaunches(): Launch[] {
  const { rows } = prepareSeedLaunches(sample, { slugs: [], urls: [] });
  return rows
    .map((r, i) => ({
      ...r,
      id: `sample-${i}`,
      type: r.type as LaunchType,
      claimed_by: null,
      star_count: 0,
      created_at: r.launched_at,
    }))
    .sort((a, b) => b.launched_at.localeCompare(a.launched_at));
}
