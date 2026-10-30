import "server-only";
import { BOARDS, SPOTLIGHT } from "@/config/rankings";
import type { Launch } from "@/lib/types";

// Ways to browse, not rankings. The makers didn't ask to be here, so nothing pits them against
// each other: no "most popular", and ayekoo counts never decide order.

export const BOARD_TABS = [
  { id: "newest", label: "Newest", blurb: "Just added to the board" },
  { id: "shuffle", label: "Shuffle", blurb: "A different mix every time you look, so everyone gets seen" },
] as const;

export type BoardId = (typeof BOARD_TABS)[number]["id"];

export function parseBoardParam(value: string | string[] | undefined): BoardId {
  const v = Array.isArray(value) ? value[0] : value;
  return BOARD_TABS.find((t) => t.id === v)?.id ?? "newest";
}

const newestFirst = (a: Launch, b: Launch) => (b.launched_at ?? b.created_at).localeCompare(a.launched_at ?? a.created_at);

export function newestLaunches(launches: Launch[], n = Infinity) {
  return [...launches].sort(newestFirst).slice(0, n);
}

/** Server-side preview for the home page; the shuffle tab reshuffles in the browser on every visit. */
export function boardPreviews(launches: Launch[], n: number = BOARDS.previewSize): Record<BoardId, Launch[]> {
  return { newest: newestLaunches(launches, n), shuffle: weeklyShuffle(launches).slice(0, n) };
}

// A shuffle that stays the same for everyone for a given key (used for the weekly spotlight).
function seededShuffle<T extends { slug: string }>(list: T[], seed: string) {
  const score = (s: string) => {
    let h = 2166136261;
    for (const c of seed + s) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
    return h;
  };
  return [...list].sort((a, b) => score(a.slug) - score(b.slug));
}

function weeklyShuffle<T extends { slug: string }>(list: T[], date = new Date()) {
  return seededShuffle(list, weekStart(date));
}

/** Monday (Accra time = UTC) of the week containing `date`, as YYYY-MM-DD. */
export function weekStart(date = new Date()) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}

// Spotlight of the week: your pin if set, otherwise a random pick for the week from launches that
// look good in the spotlight (logo and description first; logo-only if none are complete yet).
// Once picks are saved in the spotlights table, that also enforces no repeats.
export function spotlightOfTheWeek(launches: Launch[], date = new Date()) {
  const pinned = SPOTLIGHT.pinned && launches.find((l) => l.slug === SPOTLIGHT.pinned);
  if (pinned) return pinned;
  const complete = launches.filter((l) => l.logo_url && l.description);
  const eligible = complete.length ? complete : launches.filter((l) => l.logo_url);
  return weeklyShuffle(eligible.length ? eligible : launches, date)[0] ?? null;
}
