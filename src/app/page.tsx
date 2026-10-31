import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "@/components/hero/hero";
import { JsonLd } from "@/components/json-ld";
import { RankingsPreview } from "@/components/home/rankings-preview";
import { SpotlightCard } from "@/components/home/spotlight-card";
import { LaunchMap } from "@/components/map/launch-map";
import { BOARD_TABS, boardPreviews, spotlightOfTheWeek, weekStart } from "@/lib/boards";
import { getApprovedLaunches } from "@/lib/launches";
import { SITE } from "@/config/site";

export const revalidate = 60;

export const metadata: Metadata = { alternates: { canonical: "/" } };

const link = "underline decoration-2 decoration-line underline-offset-[0.18em] transition-colors hover:decoration-chalk";

export default async function HomePage() {
  const launches = await getApprovedLaunches();
  const spotlight = spotlightOfTheWeek(launches);
  const boards = boardPreviews(launches);
  const weekAgo = Date.now() - 7 * 86_400_000;
  const addedThisWeek = launches.filter((l) => new Date(l.launched_at ?? l.created_at).getTime() > weekAgo).length;

  return (
    <>
      <JsonLd
        data={{
          "@type": "WebSite",
          name: SITE.name,
          url: SITE.url,
          description: SITE.description,
          publisher: { "@type": "Organization", name: "August Engine", url: "https://www.augustengine.com" },
        }}
      />
      <Hero />

      <div className="gm-adinkra">
      <section className="mx-auto max-w-6xl px-4 pt-16 pb-20 sm:pt-24">
        <p className="max-w-4xl font-display text-[clamp(1.75rem,5vw,3.25rem)] leading-[1.12] font-semibold tracking-tight text-balance">
          So many wonderful apps and startups are coming out of Ghana, I thought I&apos;d build something to help people{" "}
          <Link href="/launches" className={link}>discover</Link> them and{" "}
          <Link href="/launches" className={link}>back</Link> them. Call it Ghanamaxxing.
        </p>
        <p className="mt-6 max-w-2xl text-lg text-muted text-pretty">
          <Link href="/launches?type=ai" className={link}>AI</Link> tools,{" "}
          <Link href="/launches?type=fintech" className={link}>fintech</Link>,{" "}
          <Link href="/launches?type=games" className={link}>games</Link> and more, from Accra, Kumasi, Tamale and
          beyond. Say ayekoo to the ones you love, find the builders on the <a href="#map" className={link}>map</a>, and if
          you know one we&apos;ve missed or you&apos;re building your own, <Link href="/submit" className={link}>add it</Link>.
        </p>
        {/* Live count: grows with every approved launch. "Added this week" only shows when it's true. */}
        <p className="mt-8 flex items-center gap-2.5 font-display text-lg">
          <span aria-hidden className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green" />
          </span>
          <span>
            <strong className="font-semibold tabular-nums">{launches.length}</strong> apps and startups from Ghana so far, and counting
            {addedThisWeek > 0 && <span className="text-muted">. {addedThisWeek} added this week</span>}
          </span>
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/launches" className="btn">Explore</Link>
          <Link href="/submit" className="btn-quiet">Add yours</Link>
        </div>
      </section>
      </div>

      <section aria-label="Spotlight of the week and browse" className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 lg:grid-cols-[5fr_7fr]">
        {spotlight && <SpotlightCard launch={spotlight} week={weekStart()} />}
        <RankingsPreview tabs={BOARD_TABS.map((t) => ({ ...t, launches: boards[t.id] }))} all={launches} />
      </section>

      <section id="map" aria-label="Map of apps and startups" className="mt-24 scroll-mt-14">
        <LaunchMap launches={launches} className="h-[80svh] min-h-[480px]" />
      </section>
    </>
  );
}
