// All ranking and spotlight thresholds live here (used from phase 2).
export const RANKINGS = {
  peoplesChoiceWindowDays: 7,
  risingMaxAgeDays: 14,
  underdogMaxTotalVotes: 50,
  underdogWindowDays: 7,
  builtThisWeekDays: 7,
  previewSize: 3,
} as const;

export const SPOTLIGHT = {
  excludePeoplesChoiceTop: 10,
  noRepeatDays: 30,
  stripSize: 7,
} as const;

// Seeded launches without a launch date are back-dated by this many days,
// so a day-one import doesn't flood "Built This Week" and "Rising".
export const SEED_DEFAULT_AGE_DAYS = 30;

export const TIMEZONE = "Africa/Accra";
