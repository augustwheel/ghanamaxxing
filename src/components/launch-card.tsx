import Link from "next/link";
import { LaunchLogo } from "@/components/launch-logo";
import { TypeChip } from "@/components/type-chip";
import type { Launch } from "@/lib/types";

export function LaunchCard({ launch, rank }: { launch: Launch; rank?: number }) {
  return (
    <li>
      <Link
        href={`/launch/${launch.slug}`}
        className="group flex items-center gap-4 rounded-2xl border border-transparent p-3 transition-colors hover:border-line hover:bg-surface"
      >
        {rank !== undefined && (
          <span className="w-6 text-center font-display text-lg text-muted" aria-label={`Rank ${rank}`}>
            {rank}
          </span>
        )}
        <LaunchLogo name={launch.name} logoUrl={launch.logo_url} type={launch.type} size={52} />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-cream group-hover:text-gold">{launch.name}</span>
          <span className="block truncate text-sm text-muted">{launch.tagline}</span>
          <span className="mt-1.5 flex items-center gap-2">
            <TypeChip type={launch.type} />
            {launch.city && <span className="truncate text-xs text-muted">{launch.city}</span>}
          </span>
        </span>
        <span className="flex w-12 shrink-0 flex-col items-center rounded-xl border border-line py-1.5 text-cream">
          <svg aria-hidden viewBox="0 0 12 12" className="h-3 w-3 fill-current">
            <path d="M6 1 11 9H1z" />
          </svg>
          <span className="text-sm font-semibold tabular-nums">{launch.vote_count}</span>
          <span className="sr-only">votes</span>
        </span>
      </Link>
    </li>
  );
}
