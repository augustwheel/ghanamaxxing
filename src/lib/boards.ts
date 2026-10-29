import "server-only";
import { BOARDS, STAR_OF_THE_WEEK } from "@/config/rankings";
import type { Launch } from "@/lib/types";

// The boards are honest about what they are: nothing claims to be "the people's choice" until
// people have actually starred things.
//
// For now these are computed in memory from each launch's total star_count. Once sign-in and
// starring are live, "Most starred" switches to stars given in the last BOARDS.mostStarredWindowDays.

export const BOARD_TABS = [
  { id: "newest", label: "Newest", blurb: "Just added to the board" },
  { id: "most-starred", label: "Most starred", blurb: "The launches people starred most this week" },
  { id: "rare-finds", label: "Rare finds", blurb: "Good things with only a few stars so far. Go find them." },
] as const;

export type BoardId = (typeof BOARD_TABS)[number]["id"];
export type Board = { launches: Launch[]; locked?: { have: number; need: number } };

export function parseBoardParam(value: string | string[] | undefined): BoardId {
  const v = Array.isArray(value) ? value[0] : value;
  return BOARD_TABS.find((t) => t.id === v)?.id ?? "newest";
}

const newestFirst = (a: Launch, b: Launch) => (b.launched_at ?? b.created_at).localeCompare(a.launched_at ?? a.created_at);

// A shuffle that stays the same for everyone all day (Accra time is UTC).
function dailyShuffle<T extends { slug: string }>(list: T[], date = new Date()) {
  const day = date.toISOString().slice(0, 10);
  const score = (s: string) => {
    let h = 2166136261;
    for (const c of day + s) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
    return h;
  };
  return [...list].sort((a, b) => score(a.slug) - score(b.slug));
}

export function computeBoards(launches: Launch[], n: number = BOARDS.previewSize): Record<BoardId, Board> {
  const totalStars = launches.reduce((sum, l) => sum + l.star_count, 0);
  const starred = launches.filter((l) => l.star_count > 0).sort((a, b) => b.star_count - a.star_count || newestFirst(a, b));
  return {
    newest: { launches: [...launches].sort(newestFirst).slice(0, n) },
    "most-starred":
      totalStars < BOARDS.mostStarredUnlockStars
        ? { launches: [], locked: { have: totalStars, need: BOARDS.mostStarredUnlockStars } }
        : { launches: starred.slice(0, n) },
    "rare-finds": { launches: dailyShuffle(launches.filter((l) => l.star_count <= BOARDS.rareMaxStars)).slice(0, n) },
  };
}

/** Monday (Accra time = UTC) of the week containing `date`, as YYYY-MM-DD. */
export function weekStart(date = new Date()) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}

// Star of the week: your pin if set, otherwise a random pick for the week from launches that look
// good in the spotlight (logo and description first; logo-only if none are complete yet).
// Once Supabase is live the pick is saved in the spotlights table, which also enforces no repeats.
export function starOfTheWeek(launches: Launch[], date = new Date()) {
  const pinned = STAR_OF_THE_WEEK.pinned && launches.find((l) => l.slug === STAR_OF_THE_WEEK.pinned);
  if (pinned) return pinned;
  const topStarred = new Set(
    [...launches]
      .filter((l) => l.star_count > 0)
      .sort((a, b) => b.star_count - a.star_count)
      .slice(0, STAR_OF_THE_WEEK.excludeMostStarredTop)
      .map((l) => l.id),
  );
  const pool = launches.filter((l) => !topStarred.has(l.id));
  const complete = pool.filter((l) => l.logo_url && l.description);
  const eligible = complete.length ? complete : pool.filter((l) => l.logo_url);
  const monday = new Date(`${weekStart(date)}T00:00:00Z`);
  return dailyShuffle(eligible.length ? eligible : pool, monday)[0] ?? null;
}
