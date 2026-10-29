import Link from "next/link";
import { LAUNCH_TYPES } from "@/config/launch-types";

export function TypeFilter({ active, basePath }: { active?: string; basePath: string }) {
  const chip = (href: string, label: string, selected: boolean, color?: string) => (
    <Link
      key={href}
      href={href}
      scroll={false}
      aria-current={selected ? "page" : undefined}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
        selected ? "border-cream bg-cream text-ink" : "border-line text-muted hover:border-muted hover:text-cream"
      }`}
    >
      {color && <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: color }} />}
      {label}
    </Link>
  );
  return (
    <nav aria-label="Filter by type" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
      {chip(basePath, "All", !active)}
      {LAUNCH_TYPES.map((t) => chip(`${basePath}?type=${t.value}`, t.label, active === t.value, t.color))}
    </nav>
  );
}
