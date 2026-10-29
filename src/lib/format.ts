import { TIMEZONE } from "@/config/rankings";

export function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: TIMEZONE }).format(
    new Date(iso),
  );
}

export function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}
