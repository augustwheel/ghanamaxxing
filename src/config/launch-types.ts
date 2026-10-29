// The single place to add, rename or recolour launch types.
// `value` is what's stored in the database — don't change it once launches use it.
export const LAUNCH_TYPES = [
  { value: "ai", label: "AI", color: "#8B5CF6" },
  { value: "fintech", label: "Fintech", color: "#F4B400" },
  { value: "games", label: "Games", color: "#E23B2E" },
  { value: "edtech", label: "Edtech", color: "#3B82F6" },
  { value: "creative", label: "Creative", color: "#EC4899" },
  { value: "student", label: "Student projects", color: "#1E9E5A" },
  { value: "other", label: "Other", color: "#9CA3AF" },
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
