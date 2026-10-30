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
  /** Where their feet sit in the clip, as a fraction of its height. They stand on the letter's baseline. */
  feet: number;
  /** Where the letter's outer edge sits across the clip, where 1 is the side they enter from. Lower
   *  means they stand closer to the letter and are hidden sooner on the way back. */
  edge: number;
  /** Seconds into the clip when the next character starts walking out, as this one heads back. */
  handoffAt: number;
  /** Seconds into the clip when they bump into their letter (it wobbles). */
  bumpAt?: number;
  /** Extra push toward the letter, for clips that would still be in view when the fade starts. */
  exit?: { from: number; amount: number };
  /** Size tweak on top of HERO_TIMING.characterHeight (the desk rig is wider than a person). */
  scale?: number;
};

export const HERO_CHARACTERS: HeroCharacter[] = [
  { id: "laptop", label: "A young woman in a kente jacket typing on a laptop", row: "top", feet: 0.973, edge: 0.74, handoffAt: 3.4 },
  { id: "selfie", label: "A guy in a purple tracksuit filming a selfie video", row: "top", feet: 0.964, edge: 0.74, handoffAt: 3.85 },
  {
    id: "desk",
    label: "A developer rolling past at a desk on wheels",
    row: "middle",
    feet: 0.938,
    edge: 0.82,
    handoffAt: 4.1,
    exit: { from: 3.95, amount: 0.44 },
    scale: 1.05,
  },
  {
    id: "vr",
    label: "A boy in a VR headset stumbling about",
    row: "bottom",
    feet: 0.909,
    edge: 0.86,
    handoffAt: 3.9,
    bumpAt: 3.0,
    exit: { from: 4.3, amount: 0.12 },
  },
  {
    id: "robot",
    label: "A schoolgirl walking with the cardboard robot she built",
    row: "bottom",
    feet: 0.887,
    edge: 0.78,
    handoffAt: 3.9,
    exit: { from: 4.25, amount: 0.09 },
  },
];

export const HERO_TIMING = {
  /** Every clip fades out from here (baked in), so each character must be behind their letter by now. */
  fadeStartsAt: 4.67,
  /** How far inside the letter the character is cut off, as a fraction of its width. Deep enough to stay
   *  covered by the stroke when the letter wobbles, shallow enough not to show through its gaps. */
  cutInset: 0.12,
  /** Pause after all five have appeared, before the cycle starts again. */
  cycleRestMs: [1500, 2000] as const,
  firstDelayMs: 700,
  /** Character height as a fraction of the letter's height. */
  characterHeight: 0.6,
  /** Letters with straight vertical sides, so a character steps cleanly out from behind the edge. */
  walkOutLetters: ["H", "N", "M"],
} as const;
