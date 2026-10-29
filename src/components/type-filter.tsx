import Link from "next/link";
import { LAUNCH_TYPES } from "@/config/launch-types";

// Type chips, coloured like the map's. `params` keeps other query values (e.g. the ranking tab).
export function TypeFilter({ active, basePath, params = {} }: { active?: string; basePath: string; params?: Record<string, string> }) {
  const href = (type?: string) => {
    const q = new URLSearchParams(params);
    if (type) q.set("type", type);
    const s = q.toString();
    return s ? `${basePath}?${s}` : basePath;
  };
  return (
    <nav aria-label="Filter by type" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
      <Link
        href={href()}
        scroll={false}
        aria-current={!active ? "page" : undefined}
        className={`shrink-0 rounded-full px-4 py-2 font-display text-[15px] font-semibold transition-colors ${
          !active ? "bg-surface-2 text-chalk" : "text-muted hover:text-chalk"
        }`}
      >
        All types
      </Link>
      {LAUNCH_TYPES.map((t) => {
        const on = active === t.value;
        return (
          <Link
            key={t.value}
            href={href(t.value)}
            scroll={false}
            aria-current={on ? "page" : undefined}
            className="shrink-0 rounded-full px-4 py-2 font-display text-[15px] font-semibold transition-opacity hover:opacity-100"
            style={{ color: t.color, background: on ? `${t.color}2e` : "transparent", opacity: on ? 1 : 0.75 }}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
