// Known places used to fill in coordinates when an import or form gives only a city/area.
// Coordinates are approximate area centres. Launches placed this way are spread within the
// place's radius (see spread() in lib/import/launch-input.ts): wide for a whole city, tight for an area.
const CITY_KM = 2.6;
const TOWN_KM = 2.5;
const AREA_KM = 0.6;

const RAW: Record<string, { lat: number; lng: number; label: string; radiusKm?: number }> = {
  // Centred on the Osu / Ridge / Airport belt where most of Accra's tech companies sit.
  accra: { label: "Accra", lat: 5.583, lng: -0.185, radiusKm: CITY_KM },
  nima: { label: "Nima, Accra", lat: 5.5845, lng: -0.1985 },
  osu: { label: "Osu, Accra", lat: 5.556, lng: -0.182 },
  "east legon": { label: "East Legon, Accra", lat: 5.6355, lng: -0.161 },
  "airport residential": { label: "Airport Residential, Accra", lat: 5.605, lng: -0.176 },
  airport: { label: "Airport, Accra", lat: 5.605, lng: -0.176 },
  cantonments: { label: "Cantonments, Accra", lat: 5.58, lng: -0.17 },
  labone: { label: "Labone, Accra", lat: 5.565, lng: -0.17 },
  ridge: { label: "Ridge, Accra", lat: 5.563, lng: -0.2 },
  dzorwulu: { label: "Dzorwulu, Accra", lat: 5.607, lng: -0.2 },
  tesano: { label: "Tesano, Accra", lat: 5.6, lng: -0.225 },
  achimota: { label: "Achimota, Accra", lat: 5.62, lng: -0.23 },
  dansoman: { label: "Dansoman, Accra", lat: 5.55, lng: -0.26 },
  spintex: { label: "Spintex, Accra", lat: 5.63, lng: -0.1 },
  madina: { label: "Madina, Accra", lat: 5.68, lng: -0.166 },
  legon: { label: "Legon, Accra", lat: 5.6508, lng: -0.187 },
  haatso: { label: "Haatso, Accra", lat: 5.675, lng: -0.2 },
  adenta: { label: "Adenta, Accra", lat: 5.709, lng: -0.155 },
  tema: { label: "Tema", lat: 5.6698, lng: -0.0166 },
  kasoa: { label: "Kasoa", lat: 5.534, lng: -0.417 },
  kumasi: { label: "Kumasi", lat: 6.6885, lng: -1.6244, radiusKm: TOWN_KM },
  takoradi: { label: "Takoradi", lat: 4.8845, lng: -1.7554 },
  "cape coast": { label: "Cape Coast", lat: 5.1053, lng: -1.2466 },
  winneba: { label: "Winneba", lat: 5.3511, lng: -0.6231 },
  koforidua: { label: "Koforidua", lat: 6.0941, lng: -0.2591 },
  ho: { label: "Ho", lat: 6.6008, lng: 0.4713 },
  tamale: { label: "Tamale", lat: 9.4008, lng: -0.8393 },
  sunyani: { label: "Sunyani", lat: 7.3349, lng: -2.3123 },
  techiman: { label: "Techiman", lat: 7.5833, lng: -1.9333 },
  obuasi: { label: "Obuasi", lat: 6.2056, lng: -1.665 },
  wa: { label: "Wa", lat: 10.0601, lng: -2.5099 },
  bolgatanga: { label: "Bolgatanga", lat: 10.7856, lng: -0.8514 },
};

const TOWNS = new Set(["tema", "kasoa", "takoradi", "cape coast", "winneba", "koforidua", "ho", "tamale", "sunyani", "techiman", "obuasi", "wa", "bolgatanga"]);

export const PLACES = Object.fromEntries(
  Object.entries(RAW).map(([k, v]) => [k, { ...v, radiusKm: v.radiusKm ?? (TOWNS.has(k) ? TOWN_KM : AREA_KM) }]),
) as Record<string, { lat: number; lng: number; label: string; radiusKm: number }>;

export function findPlace(city: string | null | undefined) {
  if (!city) return undefined;
  const key = city.toLowerCase().split(",")[0].trim();
  return PLACES[key];
}
