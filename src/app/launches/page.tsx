import type { Metadata } from "next";
import Link from "next/link";
import { LaunchList } from "@/components/launch-list";
import { TypeFilter } from "@/components/type-filter";
import { getLaunchType } from "@/config/launch-types";
import { BOARD_TABS, newestLaunches, parseBoardParam } from "@/lib/boards";
import { getApprovedLaunches, parseTypeParam } from "@/lib/launches";

export const revalidate = 60;

type Props = { searchParams: Promise<{ type?: string | string[]; board?: string | string[] }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const type = parseTypeParam(sp.type);
  const tab = BOARD_TABS.find((t) => t.id === parseBoardParam(sp.board))!;
  const title = type ? `${tab.label}: ${getLaunchType(type).label}` : tab.label;
  return {
    title,
    description: `${title} on Ghanamaxxing: startups, apps, side projects, AI tools and games from Ghanaian builders.`,
    alternates: { canonical: `/launches?board=${tab.id}${type ? `&type=${type}` : ""}` },
  };
}

export default async function LaunchesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const type = parseTypeParam(sp.type);
  const tabId = parseBoardParam(sp.board);
  const tab = BOARD_TABS.find((t) => t.id === tabId)!;
  const launches = await getApprovedLaunches({ type });
  const list = newestLaunches(launches);

  return (
    <div className="mx-auto max-w-3xl px-4 pt-10 sm:pt-14">
      <h1 className="font-display text-5xl font-bold tracking-tight sm:text-6xl">Explore</h1>
      <p className="mt-3 max-w-xl text-lg text-muted">
        Apps and startups from across Ghana. Browse what&apos;s new, shuffle for something unexpected, and say ayekoo to the ones you love.
      </p>

      <nav aria-label="Browse" className="mt-8 flex gap-1 overflow-x-auto rounded-full bg-surface p-1.5 [scrollbar-width:none]">
        {BOARD_TABS.map((t) => {
          const q = new URLSearchParams({ board: t.id, ...(type ? { type } : {}) });
          const on = t.id === tabId;
          return (
            <Link
              key={t.id}
              href={`/launches?${q}`}
              scroll={false}
              aria-current={on ? "page" : undefined}
              className={`shrink-0 flex-1 rounded-full px-4 py-2.5 text-center font-display font-semibold whitespace-nowrap transition-colors ${
                on ? "btn !py-2.5" : "text-muted hover:text-chalk"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-4">
        <TypeFilter active={type} basePath="/launches" params={{ board: tabId }} />
      </div>

      <p className="mt-6 px-2 text-sm text-muted">{tab.blurb}</p>
      {list.length ? (
        <LaunchList launches={list} shuffle={tabId === "shuffle"} />
      ) : (
        <div className="mt-6 rounded-[2rem] bg-surface px-6 py-12 text-center">
          <p className="font-display text-2xl font-semibold">Nothing here yet</p>
          <p className="mt-2 text-muted">Know one from Ghana we&apos;re missing?</p>
          <Link href="/submit" className="btn mt-6">Add it</Link>
        </div>
      )}
    </div>
  );
}
