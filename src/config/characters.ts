// Hero characters that walk out from behind the bubble letters.
//
// Each character is one swappable set of files in /public/hero/characters/<id>.*:
//   <id>.webm  VP9 with alpha (Chrome, Firefox, Android)
//   <id>.mov   HEVC with alpha (Safari, iOS)
//   <id>.webp  a still frame, used with reduced motion
// Every clip is square and starts and ends on an empty frame. The character enters from the
// right edge, does their thing, and leaves through the right edge again. The page mirrors the
// clip when the character needs to walk the other way.

export type HeroCharacter = {
  id: string;
  /** Describes the still for screen readers when motion is reduced. */
  label: string;
  /** Which row they come out of. Picked in this order, one at a time. */
  row: "top" | "middle" | "bottom";
  /** Seconds into the clip when they bump into their letter (it wobbles). */
  bumpAt?: number;
  /** Size tweak on top of HERO_TIMING.characterHeight (the desk rig is wider than a person). */
  scale?: number;
};

export const HERO_CHARACTERS: HeroCharacter[] = [
  { id: "laptop", label: "A young woman in a kente jacket typing on a laptop", row: "top" },
  { id: "selfie", label: "A guy in a purple tracksuit filming a selfie video", row: "top" },
  { id: "desk", label: "A developer rolling past at a desk on wheels", row: "middle", scale: 1.05 },
  { id: "vr", label: "A boy in a VR headset stumbling about", row: "bottom", bumpAt: 3.3 },
  { id: "robot", label: "A schoolgirl walking with the cardboard robot she built", row: "bottom" },
];

export const HERO_TIMING = {
  /** Pause between one character leaving and the next appearing. */
  gapMs: [1200, 2200] as const,
  firstDelayMs: 700,
  /** Character height as a fraction of the letter's height. */
  characterHeight: 0.6,
  /** Letters with straight vertical sides, so a character steps cleanly out from behind the edge. */
  walkOutLetters: ["H", "N", "M"],
} as const;
