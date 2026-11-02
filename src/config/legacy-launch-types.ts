import type { LaunchType } from "@/config/launch-types";

// Keep approved listings in the right category while the numbered SQL migrations
// are applied after the matching site code is deployed. Only override rows still in Other.
const LEGACY_TYPE_BY_SLUG: Record<string, LaunchType> = {
  "drdogood": "healthtech",
  "mpharma": "healthtech",
  "rivia-clinics": "healthtech",
  "yemaachi-biotech": "healthtech",
  "agrocenta": "agritech",
  "complete-farmer": "agritech",
  "esoko": "agritech",
  "farmerline": "agritech",
  "farmsmart": "agritech",
  "sesi-technologies": "agritech",
  "trotro-tractor": "agritech",
  "shaq-express": "logistics",
  "swoove": "logistics",
  "vdl-fulfilment": "logistics",
};

export function withLegacyType<T extends { slug: string; type: LaunchType }>(launch: T): T {
  const type = launch.type === "other" ? LEGACY_TYPE_BY_SLUG[launch.slug] : undefined;
  return type ? { ...launch, type } : launch;
}
