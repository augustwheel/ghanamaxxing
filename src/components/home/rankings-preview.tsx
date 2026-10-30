"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LaunchLogo } from "@/components/launch-logo";
import type { Launch } from "@/lib/types";

type Tab = { id: string; label: string; blurb: string; launches: Launch[] };

// Newest and Shuffle, three each. Shuffle draws a fresh three from everything on every visit.
export function RankingsPreview({ tabs, all }: { tabs: Tab[]; all: Launch[] }) {
  const [active, setActive] = useState(tabs[0].id);
  const [shuffled, setShuffled] = useState<Launch[] | null>(null);
  useEffect(() => {
    const a = [...all];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    setShuffled(a.slice(0, 3));
  }, [all]);

  const tab = tabs.find((t) => t.id === active)!;
  const launches = tab.id === "shuffle" && shuffled ? shuffled : tab.launches;
  return (
    <div className="flex h-full flex-col rounded-[2rem] bg-surface p-5 sm:p-7">
      <div role="tablist" aria-label="Browse" className="-mx-1 flex gap-1 overflow-x-auto px-1 [scrollbar-width:none]">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={t.id === active}
            onClick={() => setActive(t.id)}
            className={`shrink-0 rounded-full px-4 py-2 font-display text-[15px] font-semibold transition-colors ${
              t.id === active ? "bg-coal text-chalk shadow-[inset_0_1px_0_rgb(255_255_255/0.12)]" : "text-muted hover:text-chalk"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <p className="mt-4 px-1 text-sm text-muted">{tab.blurb}</p>
      <ul role="tabpanel" className="mt-3 flex-1 space-y-1">
        {launches.map((l) => (
          <li key={l.id}>
            <Link href={`/launch/${l.slug}`} className="group flex items-center gap-4 rounded-2xl px-2 py-3 hover:bg-surface-2">
              <LaunchLogo name={l.name} logoUrl={l.logo_url} type={l.type} size={44} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-lg font-semibold">{l.name}</span>
                <span className="block truncate text-sm text-muted">{l.tagline}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <Link href={`/launches?board=${tab.id}`} className="mt-4 self-start px-1 font-display font-semibold underline decoration-line underline-offset-4 hover:decoration-chalk">
        {tab.id === "shuffle" ? "Shuffle everything" : "See everything new"}
      </Link>
    </div>
  );
}
