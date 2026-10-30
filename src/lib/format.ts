import { TIMEZONE } from "@/config/rankings";

export function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: TIMEZONE }).format(
    new Date(iso),
  );
}

// Our own files and Supabase Storage go through next/image's optimiser (see next.config.ts); SVGs and
// images on makers' own sites load as they are.
export function isOptimizable(url: string) {
  if (url.toLowerCase().endsWith(".svg")) return false;
  const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url.startsWith("/") || (!!supabase && url.startsWith(`${supabase}/`));
}

export function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}
