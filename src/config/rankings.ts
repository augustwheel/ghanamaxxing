// Browsing and Spotlight settings. Nothing on Ghanamaxxing is ranked: ayekoo counts are never
// used to sort or pick anything.
export const BOARDS = {
  /** How many launches each board shows on the home page. */
  previewSize: 3,
} as const;

// Spotlight of the week: picked every Monday (Accra time), the same for everyone all week.
export const SPOTLIGHT = {
  /** Slug to feature this week instead of the automatic pick. Set to null to go back to automatic. */
  pinned: "four-corners" as string | null,
  /** A launch isn't picked again within this many weeks (or until everyone eligible has had a turn). */
  noRepeatWeeks: 12,
  /** How many past picks the "Past spotlights" strip shows. */
  stripSize: 6,
} as const;

// Seeded launches without a launch date are back-dated by this many days,
// so a day-one import doesn't fill "Newest" with the seed list.
export const SEED_DEFAULT_AGE_DAYS = 30;

export const TIMEZONE = "Africa/Accra";
