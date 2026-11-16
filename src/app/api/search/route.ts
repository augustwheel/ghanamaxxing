import { getApprovedLaunches } from "@/lib/launches";
import type { SearchItem } from "@/lib/search";

// Build-time prerendering can freeze the fallback seed list when the database is unavailable.
export const dynamic = "force-dynamic";

// Only public, approved listing details leave the server. Vercel shares this
// response for five minutes so each visitor does not start a function.
// Keep errors uncached so the search can recover as soon as the database does.
export async function GET() {
  try {
    const launches = await getApprovedLaunches({ limit: 1000 });
    const items: SearchItem[] = launches.map(({ slug, name, tagline, logo_url, type }) => ({
      slug, name, tagline, logo_url, type,
    }));
    return Response.json(items, { headers: { "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=60" } });
  } catch {
    return Response.json({ error: "Search is unavailable" }, { status: 503 });
  }
}
