import type { CSSProperties } from "react";
import Link from "next/link";
import { CategoryDrawing } from "./category-drawing";
import { collectionForType } from "@/config/collections";
import { LAUNCH_TYPES, type LaunchType } from "@/config/launch-types";
import type { Launch } from "@/lib/types";

const DESCRIPTIONS: Record<LaunchType, string> = {
  ai: "Language and intelligence",
  fintech: "Money and payments",
  games: "Games to play",
  edtech: "Tools for learning",
  healthtech: "Care and research",
  agritech: "Farming and food",
  logistics: "Delivery and fulfilment",
  creative: "Tools for making",
  other: "More to discover",
};

export function CategoryGrid({ launches }: { launches: Pick<Launch, "type">[] }) {
  const counts = Object.fromEntries(LAUNCH_TYPES.map((type) => [type.value, 0])) as Record<LaunchType, number>;
  for (const launch of launches) counts[launch.type] += 1;
  return (
    <section aria-labelledby="home-categories-title" className="mx-auto mt-20 max-w-6xl px-4 sm:mt-24">
      <div className="mb-7 sm:mb-8">
        <h2 id="home-categories-title" className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Explore by category</h2>
        <p className="mt-2 text-muted">Find apps and startups by what they do.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {LAUNCH_TYPES.map((type) => {
          const collection = collectionForType(type.value);
          const href = collection ? `/${collection.slug}` : `/launches?type=${type.value}`;
          return (
            <Link
              key={type.value}
              href={href}
              className="category-card group relative flex min-h-44 flex-col justify-end overflow-hidden rounded-[1.5rem] border border-line bg-surface p-4 focus-visible:border-chalk sm:p-5"
              style={{ color: type.color, "--category-color": type.color } as CSSProperties}
            >
              <CategoryDrawing type={type.value} />
              <span className="relative z-10 flex flex-col">
                <span className="mb-3 inline-flex items-baseline gap-1.5 self-start font-display text-chalk">
                  <span className="text-3xl font-bold leading-none tabular-nums sm:text-4xl">{counts[type.value]}</span>
                  <span className="text-xs font-semibold text-muted sm:text-sm">{counts[type.value] === 1 ? "app" : "apps"}</span>
                </span>
                <span className="font-display text-xl font-semibold leading-tight text-chalk sm:text-2xl">{type.label}</span>
                <span className="mt-1 text-xs leading-snug text-muted sm:text-sm">{DESCRIPTIONS[type.value]}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
