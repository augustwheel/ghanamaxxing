import { findPlace } from "@/config/places";
import type { LaunchType } from "@/config/launch-types";
import type { Launch } from "@/lib/types";

// Pages built for what people search, like "games made in Ghana". They are plain lists: keep the copy honest,
// and no "top" or "best" in titles, because the site doesn't rank anyone.
export type Collection = {
  slug: string;
  /** The page's heading, and its title in search results. */
  title: string;
  description: string;
  intro: string;
  type?: LaunchType;
  /** Keeps listings whose place is in this city, e.g. "Accra" also takes Osu and East Legon. */
  city?: string;
  /** Findable through search and the sitemap, but not linked from the site. It's Ghanamaxxing: no city gets singled out. */
  unlinked?: boolean;
};

export const COLLECTIONS: Collection[] = [
  {
    slug: "apps-made-in-ghana",
    title: "Apps and startups made in Ghana",
    description: "Discover apps and startups from Ghana: fintech, AI, edtech, games and more, with a link to each one.",
    intro: "Apps and startups from across Ghana, in fintech, AI, education, games, health, farming and more. Open any of them, try it, and say ayekoo to the ones you love.",
  },
  {
    slug: "games-made-in-ghana",
    title: "Games made in Ghana",
    description: "Games from Ghanaian builders, from street football to trotro driving and African legends. Many are free to play in your browser.",
    intro: "Games from Ghanaian builders, from street football and trotro driving to life in Accra and the legends of African history. Many are free to play in your browser.",
    type: "games",
  },
  {
    slug: "ai-startups-in-ghana",
    title: "AI startups in Ghana",
    description: "AI companies and tools from Ghana, including language tools for Twi, Ewe and Ga, data services and healthcare.",
    intro: "AI companies and tools from Ghana, including language tools for Twi, Ewe and Ga, data services, analytics and healthcare.",
    type: "ai",
  },
  {
    slug: "fintech-startups-in-ghana",
    title: "Fintech startups in Ghana",
    description: "Fintech companies in Ghana: mobile money, payments, digital banking, remittances and tools for small businesses.",
    intro: "Fintech companies in Ghana working on mobile money, payments, digital banking, sending money home and tools for small businesses.",
    type: "fintech",
  },
  {
    slug: "edtech-startups-in-ghana",
    title: "Edtech startups in Ghana",
    description: "Edtech in Ghana: BECE and WASSCE exam prep, coding lessons, school tools and learning for every age.",
    intro: "Education tools and programmes from Ghana, including BECE and WASSCE exam prep, coding lessons, teacher support and learning for every age.",
    type: "edtech",
  },
  {
    slug: "startups-in-accra",
    title: "Startups in Accra",
    description: "Apps and startups based in Accra, Ghana, from Osu and East Legon to Labone and Nima.",
    intro: "Apps and startups based in Accra, from Osu and East Legon to Labone and Nima. See them all on the map too.",
    city: "Accra",
    unlinked: true,
  },
];

export const TOPICS = COLLECTIONS.filter((c) => !c.unlinked);

export const findCollection = (slug: string) => COLLECTIONS.find((c) => c.slug === slug);
export const collectionForType = (type: LaunchType) => COLLECTIONS.find((c) => c.type === type);

export function inCollection(collection: Collection, launch: Launch) {
  if (collection.type && launch.type !== collection.type) return false;
  if (!collection.city) return true;
  // Places are labelled like "Osu, Accra".
  const label = findPlace(launch.city)?.label ?? launch.city ?? "";
  return label.includes(collection.city);
}
