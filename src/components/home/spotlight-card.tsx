import Link from "next/link";
import { LaunchLogo } from "@/components/launch-logo";
import { getLaunchType } from "@/config/launch-types";
import type { Launch } from "@/lib/types";

const formatDay = (isoDate: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${isoDate}T00:00:00Z`));

// Spotlight of the week: a celebration, not a winner. The launch's own type colour is the only colour on it.
export function SpotlightCard({ launch, week }: { launch: Launch; week: string }) {
  const type = getLaunchType(launch.type);
  return (
    <Link
      href={`/launch/${launch.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-coal p-7 sm:p-9"
      style={{ boxShadow: `inset 0 0 0 1.5px ${type.color}40` }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -bottom-28 h-72 w-72 rounded-full opacity-30 blur-3xl transition-opacity group-hover:opacity-50"
        style={{ background: type.color }}
      />
      <p className="flex items-center gap-2 font-display text-muted">
        Spotlight of the week
        <span className="text-sm">from {formatDay(week)}</span>
      </p>
      <div className="mt-6">
        <LaunchLogo name={launch.name} logoUrl={launch.logo_url} type={launch.type} size={88} />
      </div>
      <h3 className="mt-5 font-display text-4xl leading-none font-bold tracking-tight sm:text-5xl">{launch.name}</h3>
      <p className="mt-3 max-w-md text-lg text-chalk/85">{launch.tagline}</p>
      <p className="mt-auto pt-8 text-sm text-muted">
        <span style={{ color: type.color }}>{type.label}</span>
        {launch.city && <> in {launch.city}</>}
        {launch.maker_name && <>, made by {launch.maker_name}</>}
      </p>
    </Link>
  );
}
