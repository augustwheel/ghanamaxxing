// The single place to add, rename or recolour launch types.
// `value` is what's stored in the database — don't change it once launches use it.
export const LAUNCH_TYPES = [
  { value: "ai", label: "AI", color: "#A78BFA" },
  { value: "fintech", label: "Fintech", color: "#34D399" },
  { value: "games", label: "Games", color: "#F87171" },
  { value: "edtech", label: "Edtech", color: "#60A5FA" },
  { value: "creative", label: "Creative", color: "#F472B6" },
  { value: "student", label: "Student projects", color: "#FB923C" },
  { value: "other", label: "Other", color: "#A1A1AA" },
] as const;

export type LaunchType = (typeof LAUNCH_TYPES)[number]["value"];

export const LAUNCH_TYPE_VALUES = LAUNCH_TYPES.map((t) => t.value) as [
  LaunchType,
  ...LaunchType[],
];

export function getLaunchType(value: string) {
  return LAUNCH_TYPES.find((t) => t.value === value) ?? LAUNCH_TYPES[LAUNCH_TYPES.length - 1];
}

export function isLaunchType(value: unknown): value is LaunchType {
  return typeof value === "string" && LAUNCH_TYPES.some((t) => t.value === value);
}
