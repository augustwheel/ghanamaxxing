"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { LAUNCH_TYPES, type LaunchType } from "@/config/launch-types";

// Type chips, coloured like the map's. `params` keeps other query values (e.g. the browse tab).
export function TypeFilter({ active, basePath, params = {}, counts, total }: {
  active?: string;
  basePath: string;
  params?: Record<string, string>;
  counts: Record<LaunchType, number>;
  total: number;
}) {
  const scroller = useRef<HTMLElement>(null);
  const [scrollPosition, setScrollPosition] = useState({ left: false, right: false });

  const updateScrollPosition = useCallback(() => {
    const nav = scroller.current;
    if (!nav) return;
    const left = nav.scrollLeft > 2;
    const right = nav.scrollLeft + nav.clientWidth < nav.scrollWidth - 2;
    setScrollPosition((previous) => previous.left === left && previous.right === right ? previous : { left, right });
  }, []);

  useEffect(() => {
    const nav = scroller.current;
    if (!nav) return;
    updateScrollPosition();
    const observer = new ResizeObserver(updateScrollPosition);
    observer.observe(nav);
    window.addEventListener("resize", updateScrollPosition);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScrollPosition);
    };
  }, [active, counts, total, updateScrollPosition]);

  const scrollCategories = (direction: -1 | 1) => {
    const nav = scroller.current;
    if (nav) nav.scrollBy({ left: direction * nav.clientWidth * 0.7, behavior: "smooth" });
  };

  const href = (type?: string) => {
    const q = new URLSearchParams(params);
    if (type) q.set("type", type);
    const s = q.toString();
    return s ? `${basePath}?${s}` : basePath;
  };
  return (
    <div className="relative -mx-4">
      <nav
        ref={scroller}
        aria-label="Filter by type"
        onScroll={updateScrollPosition}
        className="flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]"
      >
        <Link
          href={href()}
          scroll={false}
          aria-current={!active ? "page" : undefined}
          className={`shrink-0 rounded-full px-4 py-2 font-display text-[15px] font-semibold transition-colors ${
            !active ? "bg-surface-2 text-chalk" : "text-muted hover:text-chalk"
          }`}
        >
          All types <span className="ml-1 tabular-nums text-xs opacity-70">{total}</span>
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
              {t.label} <span className="ml-1 tabular-nums text-xs opacity-70">{counts[t.value]}</span>
            </Link>
          );
        })}
      </nav>
      {scrollPosition.left && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex w-20 items-center bg-gradient-to-r from-ink via-ink/95 to-transparent pl-4">
          <button type="button" onClick={() => scrollCategories(-1)} aria-label="Scroll to previous categories" className="pointer-events-auto rounded-full border border-line bg-surface-2 px-2.5 py-1.5 font-display text-xs font-semibold text-chalk hover:border-muted">
            ‹ Back
          </button>
        </div>
      )}
      {scrollPosition.right && (
        <div className="pointer-events-none absolute inset-y-0 right-0 flex w-20 items-center justify-end bg-gradient-to-l from-ink via-ink/95 to-transparent pr-4">
          <button type="button" onClick={() => scrollCategories(1)} aria-label="Scroll to more categories" className="pointer-events-auto rounded-full border border-line bg-surface-2 px-2.5 py-1.5 font-display text-xs font-semibold text-chalk hover:border-muted">
            More ›
          </button>
        </div>
      )}
    </div>
  );
}
