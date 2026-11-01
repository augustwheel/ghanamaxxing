import { NextResponse } from "next/server";
import { findLogo } from "@/lib/logo-finder";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BUCKET = "ghanamaxxing-media";
const LOOK_BACK_DAYS = 3; // a site with no usable logo isn't tried forever; those listings show initials

// Called every few minutes by the n8n workflow: finds logos for newly approved listings that don't have one. It only ever
// fills an empty logo, so a logo set by hand is never replaced.
export async function POST(request: Request) {
  const secret = process.env.ALERT_WEBHOOK_SECRET;
  if (!secret || request.headers.get("x-webhook-secret") !== secret) return NextResponse.json({ error: "Not allowed" }, { status: 401 });
  const db = createServiceClient();
  if (!db) return NextResponse.json({ error: "No database" }, { status: 503 });

  const since = new Date(Date.now() - LOOK_BACK_DAYS * 86_400_000).toISOString();
  const { data, error } = await db
    .from("launches")
    .select("id, slug, url")
    .eq("status", "approved")
    .is("logo_url", null)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(3);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const results: { slug: string; source: string | null }[] = [];
  for (const listing of data ?? []) {
    const found = await findLogo(listing.url).catch(() => null);
    if (!found) {
      results.push({ slug: listing.slug, source: null });
      continue;
    }
    const path = `logos/${listing.slug}.webp`;
    const { error: uploadError } = await db.storage.from(BUCKET).upload(path, found.logo, { contentType: "image/webp", upsert: true, cacheControl: "31536000" });
    if (uploadError) {
      console.error("Logo upload failed", listing.slug, uploadError.message);
      continue;
    }
    const logoUrl = db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    await db.from("launches").update({ logo_url: logoUrl }).eq("id", listing.id).is("logo_url", null);
    results.push({ slug: listing.slug, source: found.source });
  }
  return NextResponse.json({ results });
}
