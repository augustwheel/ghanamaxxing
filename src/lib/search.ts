export type SearchItem = {
  slug: string;
  name: string;
  tagline: string;
  logo_url: string | null;
  type: string;
};

function normalise(value: string) {
  return value.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

// Search is about the name a visitor remembers, not popularity or Ayekoo counts.
export function searchByName<T extends { name: string }>(items: T[], query: string): T[] {
  const needle = normalise(query);
  if (!needle) return [];
  return items
    .map((item) => {
      const name = normalise(item.name);
      const position = name.indexOf(needle);
      const score = position === 0 ? 0 : position > 0 && name[position - 1] === " " ? 1 : position >= 0 ? 2 : -1;
      return { item, score };
    })
    .filter(({ score }) => score >= 0)
    .sort((a, b) => a.score - b.score || a.item.name.localeCompare(b.item.name))
    .map(({ item }) => item);
}
