import Image from "next/image";
import Link from "next/link";
import { LaunchLogo } from "@/components/launch-logo";
import { FEATURED_LAUNCHES } from "@/config/featured-launches";
import { getLaunchType } from "@/config/launch-types";
import { isOptimizable } from "@/lib/format";
import type { Launch } from "@/lib/types";
import { SpotlightMotion } from "./spotlight-motion";

const formatDay = (isoDate: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${isoDate}T00:00:00Z`));

function SpotlightLabel({ week, color }: { week: string; color: string }) {
  return (
    <span className="inline-flex max-w-full items-center gap-2.5 rounded-full border border-white/15 bg-coal/90 px-3.5 py-2 font-display text-xs font-semibold text-chalk shadow-lg sm:text-sm">
      <span aria-hidden style={{ color }} className="text-lg leading-none">✦</span>
      <span>Spotlight of the week</span>
      <span className="border-l border-white/20 pl-2.5 text-muted">{formatDay(week)}</span>
    </span>
  );
}

// Spotlight of the week: a celebration, not a winner. The launch's own type colour is the only colour on it.
export function SpotlightCard({ launch, week }: { launch: Launch; week: string }) {
  const type = getLaunchType(launch.type);
  const feature = FEATURED_LAUNCHES[launch.slug];
  if (feature) {
    return (
      <SpotlightMotion color={type.color}>
        <div className="relative aspect-[2.1/1] overflow-hidden bg-surface">
          <Image
            src={feature.imageUrl}
            alt={feature.imageAlt}
            fill
            unoptimized={!isOptimizable(feature.imageUrl)}
            sizes="(max-width: 1024px) 100vw, 480px"
            className="object-cover"
          />
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-14 bg-gradient-to-t from-coal to-transparent" />
          <div className="absolute left-4 top-4 z-20 sm:left-6 sm:top-6">
            <SpotlightLabel week={week} color={type.color} />
          </div>
        </div>
        <div className="relative -mt-3 flex flex-col px-7 pb-7 pt-4 sm:px-8 sm:pb-8">
          <div className="flex items-center gap-4">
            <LaunchLogo name={launch.name} logoUrl={launch.logo_url} type={launch.type} size={56} />
            <h3 className="font-display text-3xl leading-none font-bold tracking-tight sm:text-4xl">
              <Link href={`/launch/${launch.slug}`} className="hover:underline">{launch.name}</Link>
            </h3>
          </div>
          <p className="mt-4 max-w-md text-base leading-relaxed text-chalk/85">{feature.spotlightCopy}</p>
          <p className="mt-4 text-sm text-muted">
            <span style={{ color: type.color }}>{type.label}</span>
            {launch.city && <> in {launch.city}</>}
            <> · Made by {feature.makerName}</>
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-6">
            <Link href={`/launch/${launch.slug}`} className="btn">See the app</Link>
            <a href={feature.videoUrl} target="_blank" rel="noopener noreferrer" className="font-display text-sm font-semibold text-chalk underline decoration-line underline-offset-4 hover:decoration-chalk">
              Watch the launch clip ↗
            </a>
          </div>
        </div>
      </SpotlightMotion>
    );
  }
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
