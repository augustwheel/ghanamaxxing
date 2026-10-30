import Link from "next/link";
import { LaunchLogo } from "@/components/launch-logo";
import { getLaunchType } from "@/config/launch-types";
import type { Launch } from "@/lib/types";

// No numbers here: lists are for browsing, not ranking.
export function LaunchCard({ launch }: { launch: Launch }) {
  const type = getLaunchType(launch.type);
  return (
    <li>
      <Link href={`/launch/${launch.slug}`} className="group flex items-center gap-4 rounded-3xl px-2 py-3 transition-colors hover:bg-surface sm:gap-5 sm:px-4">
        <LaunchLogo name={launch.name} logoUrl={launch.logo_url} type={launch.type} size={56} />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-display text-xl font-semibold">{launch.name}</span>
          <span className="block truncate text-muted">{launch.tagline}</span>
          <span className="mt-1 block truncate text-sm">
            <span style={{ color: type.color }}>{type.label}</span>
            {launch.city && <span className="text-muted"> in {launch.city}</span>}
          </span>
        </span>
        <span aria-hidden className="shrink-0 font-display text-xl text-muted transition-transform group-hover:translate-x-1">
          ›
        </span>
      </Link>
    </li>
  );
}
