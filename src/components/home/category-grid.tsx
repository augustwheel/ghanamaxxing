import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
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
  student: "Student ideas",
  other: "More to discover",
};

function CategoryDrawing({ type }: { type: LaunchType }) {
  let drawing: ReactNode;
  switch (type) {
    case "ai":
      drawing = <><path d="M54 29v-9m0 0 8-5" /><circle cx="63" cy="14" r="4" fill="currentColor" /><rect x="26" y="30" width="56" height="46" rx="16" fill="currentColor" fillOpacity=".2" /><rect x="26" y="30" width="56" height="46" rx="16" /><path d="M26 47h-7v14h7m56-14h7v14h-7M43 64c6 5 16 5 22 0" /><circle cx="43" cy="51" r="3" fill="currentColor" stroke="none" /><circle cx="65" cy="51" r="3" fill="currentColor" stroke="none" /></>;
      break;
    case "fintech":
      drawing = <><rect x="20" y="31" width="64" height="46" rx="13" fill="currentColor" fillOpacity=".2" /><rect x="20" y="31" width="64" height="46" rx="13" /><path d="M20 43h64" /><rect x="59" y="50" width="25" height="17" rx="8" fill="currentColor" fillOpacity=".3" /><rect x="59" y="50" width="25" height="17" rx="8" /><circle cx="68" cy="58" r="2" fill="currentColor" stroke="none" /><circle cx="76" cy="58" r="2" fill="currentColor" stroke="none" /><path d="M31 60h16" /></>;
      break;
    case "games":
      drawing = <><path d="M34 37h39c8 0 13 5 16 16l2 10c2 8-3 14-10 14-5 0-8-3-12-8H38c-4 5-7 8-12 8-7 0-12-6-10-14l2-10c3-11 8-16 16-16Z" fill="currentColor" fillOpacity=".2" /><path d="M34 37h39c8 0 13 5 16 16l2 10c2 8-3 14-10 14-5 0-8-3-12-8H38c-4 5-7 8-12 8-7 0-12-6-10-14l2-10c3-11 8-16 16-16Z" /><path d="M36 48v16m-8-8h16" /><circle cx="69" cy="51" r="3" fill="currentColor" /><circle cx="79" cy="61" r="3" fill="currentColor" /><path d="M49 58c4 3 9 3 13 0" /></>;
      break;
    case "edtech":
      drawing = <><path d="M52 76c-9-6-19-8-32-7V30c13-1 23 1 32 7 9-6 19-8 32-7v39c-13-1-23 1-32 7Z" fill="currentColor" fillOpacity=".18" /><path d="M52 76c-9-6-19-8-32-7V30c13-1 23 1 32 7 9-6 19-8 32-7v39c-13-1-23 1-32 7Zm0-39v39M28 43c6 0 11 1 16 4m16 0c5-3 10-4 16-4M29 56c5 0 10 1 15 4m16 0c5-3 10-4 15-4" /><circle cx="43" cy="31" r="2" fill="currentColor" /><circle cx="61" cy="31" r="2" fill="currentColor" /></>;
      break;
    case "healthtech":
      drawing = <><path d="M53 80 28 57C13 43 21 26 36 26c8 0 13 4 17 10 4-6 9-10 17-10 15 0 23 17 8 31L53 80Z" fill="currentColor" fillOpacity=".2" /><path d="M53 80 28 57C13 43 21 26 36 26c8 0 13 4 17 10 4-6 9-10 17-10 15 0 23 17 8 31L53 80Z" /><path d="M27 55h17l7-12 8 24 7-12h13" /><circle cx="43" cy="42" r="2" fill="currentColor" stroke="none" /><circle cx="63" cy="42" r="2" fill="currentColor" stroke="none" /></>;
      break;
    case "agritech":
      drawing = <><path d="M33 65h40l-5 23H38l-5-23Z" fill="currentColor" fillOpacity=".25" /><path d="M33 65h40l-5 23H38l-5-23ZM53 65V39m0 14C38 53 30 45 29 33c14 0 22 7 24 20Zm0-14c1-14 9-22 23-24-1 14-9 22-23 24Z" /><circle cx="47" cy="75" r="2" fill="currentColor" stroke="none" /><circle cx="60" cy="75" r="2" fill="currentColor" stroke="none" /><path d="M49 82c3 2 6 2 9 0" /></>;
      break;
    case "logistics":
      drawing = <><path d="m53 23 29 15v34L53 87 24 72V38l29-15Z" fill="currentColor" fillOpacity=".2" /><path d="m53 23 29 15v34L53 87 24 72V38l29-15Zm-29 15 29 15 29-15M53 53v34M40 30l29 15M14 52h10M10 64h14" /><circle cx="43" cy="65" r="2" fill="currentColor" stroke="none" /><circle cx="61" cy="65" r="2" fill="currentColor" stroke="none" /><path d="M47 73c4 2 8 2 12 0" /></>;
      break;
    case "creative":
      drawing = <><path d="M49 26c-18 0-32 13-32 31 0 17 13 30 30 30h5c7 0 11-6 8-12-2-5 0-9 6-9h5c10 0 16-8 16-17 0-14-17-23-38-23Z" fill="currentColor" fillOpacity=".2" /><path d="M49 26c-18 0-32 13-32 31 0 17 13 30 30 30h5c7 0 11-6 8-12-2-5 0-9 6-9h5c10 0 16-8 16-17 0-14-17-23-38-23Z" /><circle cx="34" cy="45" r="4" fill="currentColor" /><circle cx="52" cy="38" r="4" fill="currentColor" /><circle cx="70" cy="46" r="4" fill="currentColor" /><path d="M39 64c4 4 10 4 14 0" /></>;
      break;
    case "student":
      drawing = <><circle cx="52" cy="58" r="23" fill="currentColor" fillOpacity=".2" /><circle cx="52" cy="58" r="23" /><path d="m19 35 33-16 33 16-33 16-33-16Zm13 7v17m53-24v28" /><circle cx="85" cy="67" r="3" fill="currentColor" /><circle cx="43" cy="60" r="2" fill="currentColor" stroke="none" /><circle cx="61" cy="60" r="2" fill="currentColor" stroke="none" /><path d="M46 69c4 3 8 3 12 0" /></>;
      break;
    case "other":
      drawing = <><path d="M31 37c0-13 9-22 22-22s22 9 22 22c0 9-5 15-11 20-6 5-9 10-9 17H42c0-7-3-12-9-17-6-5-11-11-11-20Z" fill="currentColor" fillOpacity=".2" /><path d="M31 37c0-13 9-22 22-22s22 9 22 22c0 9-5 15-11 20-6 5-9 10-9 17H42c0-7-3-12-9-17-6-5-11-11-11-20ZM42 81h13m-11 6h9" /><circle cx="44" cy="40" r="2" fill="currentColor" stroke="none" /><circle cx="62" cy="40" r="2" fill="currentColor" stroke="none" /><path d="M47 50c4 3 8 3 12 0" /></>;
  }
  return (
    <svg aria-hidden="true" viewBox="0 0 108 108" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="category-illustration pointer-events-none absolute -right-3 -top-3 h-24 w-24 sm:h-28 sm:w-28">
      <circle cx="54" cy="54" r="49" fill="currentColor" fillOpacity=".09" stroke="none" />
      <g className="category-character">{drawing}</g>
      <path className="category-sparkle" d="M16 21v8m-4-4h8" />
    </svg>
  );
}

export function CategoryGrid({ launches }: { launches: Pick<Launch, "type">[] }) {
  const counts = Object.fromEntries(LAUNCH_TYPES.map((type) => [type.value, 0])) as Record<LaunchType, number>;
  for (const launch of launches) counts[launch.type] += 1;
  return (
    <section aria-labelledby="home-categories-title" className="mx-auto mt-20 max-w-6xl px-4 sm:mt-24">
      <div className="mb-7 sm:mb-8">
        <h2 id="home-categories-title" className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Explore by category</h2>
        <p className="mt-2 text-muted">Find apps and startups by what they do.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
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
