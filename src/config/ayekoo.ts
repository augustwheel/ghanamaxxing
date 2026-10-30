// How people cheer a launch on. One tap, never ranked, never used to sort anything.
//
// The phrase rotates through Ghanaian languages. Add a language by adding a line; only add phrases
// you've checked with a fluent speaker. `ACTIVE` picks which one shows: a fixed index, or "weekly"
// to rotate through the list every Monday.

export type AyekooPhrase = {
  /** What's on the button, e.g. "Ayekoo". */
  word: string;
  /** English meaning, shown in brackets. */
  english: string;
  /** The language it's from. */
  language: string;
};

export const AYEKOO_PHRASES: AyekooPhrase[] = [
  { word: "Ayekoo", english: "Well done", language: "Twi" },
  // { word: "…", english: "Well done", language: "Ga" },
  // { word: "…", english: "Well done", language: "Ewe" },
  // { word: "…", english: "Well done", language: "Dagbani" },
];

const ACTIVE: number | "weekly" = 0;

export function currentAyekoo(date = new Date()): AyekooPhrase {
  if (ACTIVE !== "weekly") return AYEKOO_PHRASES[ACTIVE] ?? AYEKOO_PHRASES[0];
  const week = Math.floor((date.getTime() / 86_400_000 + 3) / 7); // weeks since 1970, rolling over on Mondays
  return AYEKOO_PHRASES[week % AYEKOO_PHRASES.length];
}

/** "Ayekoo (Well done, Twi)" */
export function ayekooLabel(p: AyekooPhrase = currentAyekoo()) {
  return `${p.word} (${p.english}, ${p.language})`;
}
