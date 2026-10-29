import Link from "next/link";
import { Hero } from "@/components/hero/hero";
import { RankingsPreview } from "@/components/home/rankings-preview";
import { SpotlightCard } from "@/components/home/spotlight-card";
import { LaunchMap } from "@/components/map/launch-map";
import { BOARD_TABS, computeBoards, starOfTheWeek, weekStart } from "@/lib/boards";
import { getApprovedLaunches } from "@/lib/launches";

export const revalidate = 60;

const link = "underline decoration-2 decoration-line underline-offset-[0.18em] transition-colors hover:decoration-chalk";

export default async function HomePage() {
  const launches = await getApprovedLaunches();
  const spotlight = starOfTheWeek(launches);
  const boards = computeBoards(launches);

  return (
    <>
      <Hero />

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
          beyond. Star the ones you love, find the builders on the <a href="#map" className={link}>map</a>, and if
          you know one we&apos;ve missed or you&apos;re building your own, <Link href="/submit" className={link}>add it</Link>.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/launches" className="btn">Explore launches</Link>
          <Link href="/submit" className="btn-quiet">Add yours</Link>
        </div>
      </section>

      <section aria-label="Star of the week and boards" className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 lg:grid-cols-[5fr_7fr]">
        {spotlight && <SpotlightCard launch={spotlight} week={weekStart()} />}
        <RankingsPreview tabs={BOARD_TABS.map((t) => ({ ...t, ...boards[t.id] }))} />
      </section>

      <section id="map" aria-label="Map of launches" className="mt-24 scroll-mt-14">
        <LaunchMap launches={launches} className="h-[80svh] min-h-[480px]" />
      </section>
    </>
  );
}
