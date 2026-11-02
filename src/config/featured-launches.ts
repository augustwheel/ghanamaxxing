// Curated details for a spotlighted app while the wider listing research is still to come.
// Sources: https://fourcornersgh.com/ (game, preview image, credits)
// and https://x.com/WofaYamoah/status/2115824778078527932 (maker's launch clip).
type FeaturedLaunch = {
  imageUrl: string;
  imageAlt: string;
  imageCredit: string;
  makerName: string;
  makerX: string;
  spotlightCopy: string;
  details: string;
  facts: string[];
  videoUrl: string;
  videoLabel: string;
};

export const FEATURED_LAUNCHES: Record<string, FeaturedLaunch> = {
  "four-corners": {
    imageUrl: "https://fourcornersgh.com/og-image.jpg",
    imageAlt: "Four Corners artwork with a player performing a football move on a neighbourhood pitch",
    imageCredit: "Image from Four Corners",
    makerName: "Wofa Yamoah F. Attafuah",
    makerX: "https://x.com/WofaYamoah",
    spotlightCopy: "Play three-a-side street football in your browser. Build your player and face the computer or friends online.",
    details: "Build your player and play three-a-side against the computer or friends online. Beyond Kanda Park, the game takes you to Ashaiman, Jamestown and Pent. It's free in a phone browser.",
    facts: ["Free in your browser", "Three-a-side football", "Solo and online play"],
    videoUrl: "https://x.com/WofaYamoah/status/2115824778078527932",
    videoLabel: "Watch the 46-second launch clip",
  },
};
