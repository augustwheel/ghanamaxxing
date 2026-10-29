import type { Metadata } from "next";
import { LaunchMap } from "@/components/map/launch-map";
import { getApprovedLaunches } from "@/lib/launches";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Map",
  description: "A live map of the apps and startups coming out of Ghana.",
  alternates: { canonical: "/map" },
};

// Full-screen map. Unlike the one on the home page, it takes scroll and pinch straight away.
export default async function MapPage() {
  const launches = await getApprovedLaunches();
  return (
    <>
      <h1 className="sr-only">Map of launches</h1>
      <LaunchMap launches={launches} interactiveScroll className="h-[calc(100svh-3.5rem)] min-h-[420px]" />
    </>
  );
}
