// The Bank of Ghana's Heritage Series (unveiled 12 Nov 2026, in circulation from 1 Dec 2026), for the cedi
// band hero (src/components/cedi/cedi-band-hero.tsx). Images are the Bank's own (from its launch slides as
// published by 3News), credited on the page. The Bank asks for prior approval to use images of the cedi; the
// owner chose to use them with credit. Colours and themes from 3News's note-by-note list.

export type CediNote = {
  value: number;
  theme: string;
  honoree: string;
  landmark: string;
  /** Main colour of the note. */
  color: string;
  /** Darker ink for linework and type. */
  ink: string;
  front: string;
  back: string;
};

export const CEDI_NOTES: CediNote[] = [
  { value: 1, theme: "Commerce", honoree: "Agnes Oforiwa Tagoe-Quarcoopome", landmark: "Makola Market traders", color: "#8f949c", ink: "#3c4048", front: "/hero/cedi/1-f.webp", back: "/hero/cedi/1-b.webp" },
  { value: 2, theme: "Religious freedom", honoree: "Cardinal Peter Poreku Dery", landmark: "Larabanga Mosque", color: "#e38b2c", ink: "#7a3d0a", front: "/hero/cedi/2-f.webp", back: "/hero/cedi/2-b.webp" },
  { value: 5, theme: "Education", honoree: "Dr J.E.K. Aggrey", landmark: "Achimota School", color: "#3f7fd4", ink: "#173d73", front: "/hero/cedi/5-f.webp", back: "/hero/cedi/5-b.webp" },
  { value: 10, theme: "Justice and equality", honoree: "Justice Annie Jiagge", landmark: "Supreme Court of Ghana", color: "#2f9a5b", ink: "#124a2a", front: "/hero/cedi/10-f.webp", back: "/hero/cedi/10-b.webp" },
  { value: 20, theme: "Arts and entertainment", honoree: "Dr Ephraim Amu", landmark: "National Theatre", color: "#8a55cf", ink: "#3f1f6e", front: "/hero/cedi/20-f.webp", back: "/hero/cedi/20-b.webp" },
  { value: 50, theme: "Nationalism", honoree: "Theodosia Okoh", landmark: "Jubilee House", color: "#e0552f", ink: "#7a2310", front: "/hero/cedi/50-f.webp", back: "/hero/cedi/50-b.webp" },
  { value: 100, theme: "Peace", honoree: "Kofi Annan", landmark: "Kofi Annan Peacekeeping Training Centre", color: "#22aeb0", ink: "#0b5254", front: "/hero/cedi/100-f.webp", back: "/hero/cedi/100-b.webp" },
  { value: 200, theme: "Sovereignty", honoree: "Dr Kwame Nkrumah", landmark: "Kwame Nkrumah Memorial Park", color: "#df5a8a", ink: "#7a1d43", front: "/hero/cedi/200-f.webp", back: "/hero/cedi/200-b.webp" },
];

export const CEDI_LAUNCH = { unveiled: "2026-11-12", inCirculation: "2026-12-01" };

/** The lighter version of a note image, for the spinning band (the full one loads when a note is opened). */
export const small = (src: string) => src.replace(/\.webp$/, "-sm.webp");
