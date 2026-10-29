// Board and Star of the Day settings. Every board is computed from launches + stars.
export const BOARDS = {
  /** "Most starred": stars given in this many days. */
  mostStarredWindowDays: 7,
  /** "Most starred" stays hidden until the whole site has received this many stars in the window,
   *  so it never ranks launches on a handful of clicks. */
  mostStarredUnlockStars: 20,
  /** "Rare finds": launches with at most this many stars, in a fresh order every day. */
  rareMaxStars: 5,
  /** How many launches each board shows on the home page. */
  previewSize: 3,
} as const;

// Star of the week: picked every Monday (Accra time), the same for everyone all week.
export const STAR_OF_THE_WEEK = {
  /** Slug to feature this week instead of the automatic pick. Set to null to go back to automatic. */
  pinned: "four-corners" as string | null,
  /** A launch isn't picked again within this many weeks (or until everyone eligible has had a turn). */
  noRepeatWeeks: 12,
  /** Leave out launches in the Most starred top N, so the spotlight goes to someone who needs it. */
  excludeMostStarredTop: 10,
  /** How many past picks the "Past stars" strip shows. */
  stripSize: 6,
} as const;

// Seeded launches without a launch date are back-dated by this many days,
// so a day-one import doesn't fill "Newest" with the seed list.
export const SEED_DEFAULT_AGE_DAYS = 30;

export const TIMEZONE = "Africa/Accra";
