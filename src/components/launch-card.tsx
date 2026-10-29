import Link from "next/link";
import { LaunchLogo } from "@/components/launch-logo";
import { StarIcon } from "@/components/star-icon";
import { getLaunchType } from "@/config/launch-types";
import type { Launch } from "@/lib/types";

export function LaunchCard({ launch, rank }: { launch: Launch; rank?: number }) {
  const type = getLaunchType(launch.type);
  return (
    <li>
      <Link href={`/launch/${launch.slug}`} className="group flex items-center gap-4 rounded-3xl px-2 py-3 transition-colors hover:bg-surface sm:gap-5 sm:px-4">
        {rank !== undefined && (
          <span className="w-7 shrink-0 text-center font-display text-2xl font-bold text-muted tabular-nums" aria-label={`Number ${rank}`}>
            {rank}
          </span>
        )}
        <LaunchLogo name={launch.name} logoUrl={launch.logo_url} type={launch.type} size={56} />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-display text-xl font-semibold">{launch.name}</span>
          <span className="block truncate text-muted">{launch.tagline}</span>
          <span className="mt-1 block truncate text-sm">
            <span style={{ color: type.color }}>{type.label}</span>
            {launch.city && <span className="text-muted"> in {launch.city}</span>}
          </span>
        </span>
        <span className="btn shrink-0 flex-col !gap-0 !rounded-2xl !px-3.5 !py-2 text-center leading-tight">
          <StarIcon className="h-3.5 w-3.5" />
          <span className="tabular-nums">{launch.star_count}</span>
          <span className="sr-only">stars</span>
        </span>
      </Link>
    </li>
  );
}
