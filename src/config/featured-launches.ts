// Curated details for a spotlighted app while the wider listing research is still to come.
// Sources: https://fourcornersgh.com/ (game, preview image, credits),
// https://x.com/WofaYamoah/status/2115824778078527932 (maker's launch clip),
// and https://flyteblocks.com/ (Flyte's product details, image, and video).
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
  videoPoster?: string;
};

export const FEATURED_LAUNCHES: Record<string, FeaturedLaunch> = {
  flyte: {
    imageUrl: "https://flyteblocks.com/og-image.jpg",
    imageAlt: "A student using Flyte's block coding interface on a computer",
    imageCredit: "Image from Flyte",
    makerName: "Arnson Innovate",
    makerX: "https://x.com/flyteblocks",
    spotlightCopy: "Children can code a simulated drone, then train an image model and use what it sees in a flight program. Flyte runs free in a browser, with no drone kit needed.",
    details: "Build a flight by snapping coding blocks together, then press Run to watch the drone move through a 3D simulator. Children can use loops and conditions alongside drone controls such as throttle, pitch, roll and yaw, while reading altitude, speed and battery data. In the AI Sense lab, they can train an image model with their device's camera and connect its predictions to flight commands. Flyte is designed for ages 6 to 17 and needs no download or drone kit.",
    facts: ["Free in your browser", "Ages 6 to 17", "No drone kit needed", "Train an image model"],
    videoUrl: "https://flyteblocks.com/product-video/product-video.mp4",
    videoLabel: "Watch Flyte in action",
    videoPoster: "https://flyteblocks.com/product-video/product-video-poster.webp",
  },
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
