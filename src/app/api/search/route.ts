import { getApprovedLaunches } from "@/lib/launches";
import type { SearchItem } from "@/lib/search";

// Build-time prerendering can freeze the fallback seed list when the database is unavailable.
export const dynamic = "force-dynamic";

// Fetch once when search opens. Only public, approved listing details leave the server.
export async function GET() {
  try {
    const launches = await getApprovedLaunches({ limit: 1000 });
    const items: SearchItem[] = launches.map(({ slug, name, tagline, logo_url, type }) => ({
      slug, name, tagline, logo_url, type,
    }));
    return Response.json(items, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Search is unavailable" }, { status: 503 });
  }
}
