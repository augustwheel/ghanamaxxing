import { getLaunchType } from "@/config/launch-types";

export function TypeChip({ type }: { type: string }) {
  const t = getLaunchType(type);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2 py-0.5 text-xs text-muted">
      <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: t.color }} />
      {t.label}
    </span>
  );
}
