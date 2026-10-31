import type { MetadataRoute } from "next";
import { COLLECTIONS } from "@/config/collections";
import { SITE } from "@/config/site";
import { getApprovedLaunches } from "@/lib/launches";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const launches = await getApprovedLaunches({ limit: 1000 });
  return [
    ...["", "/launches", "/map", "/submit", "/about"].map((path) => ({ url: `${SITE.url}${path}` })),
    ...COLLECTIONS.map((c) => ({ url: `${SITE.url}/${c.slug}` })),
    ...launches.map((l) => ({ url: `${SITE.url}/launch/${l.slug}`, lastModified: l.launched_at ?? l.created_at })),
  ];
}
