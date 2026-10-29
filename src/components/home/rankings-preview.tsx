"use client";

import Link from "next/link";
import { useState } from "react";
import { LaunchLogo } from "@/components/launch-logo";
import { StarIcon } from "@/components/star-icon";
import type { Launch } from "@/lib/types";

type Tab = { id: string; label: string; blurb: string; launches: Launch[]; locked?: { have: number; need: number } };

// The boards, top 3 each. One list at a time reads better on a phone than four boxes.
export function RankingsPreview({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0].id);
  const tab = tabs.find((t) => t.id === active)!;
  return (
    <div className="flex h-full flex-col rounded-[2rem] bg-surface p-5 sm:p-7">
      <div role="tablist" aria-label="Boards" className="-mx-1 flex gap-1 overflow-x-auto px-1 [scrollbar-width:none]">
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
      {tab.locked ? (
        <LockedBoard {...tab.locked} />
      ) : (
        <ol role="tabpanel" className="mt-3 flex-1 space-y-1">
          {tab.launches.map((l, i) => (
            <li key={l.id}>
              <Link href={`/launch/${l.slug}`} className="group flex items-center gap-4 rounded-2xl px-2 py-3 hover:bg-surface-2">
                <span className="w-5 text-center font-display text-xl font-bold text-muted">{i + 1}</span>
                <LaunchLogo name={l.name} logoUrl={l.logo_url} type={l.type} size={44} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-display text-lg font-semibold">{l.name}</span>
                  <span className="block truncate text-sm text-muted">{l.tagline}</span>
                </span>
                <span className="flex items-center gap-1 font-display tabular-nums text-muted">
                  <StarIcon />
                  {l.star_count}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
      <Link href={`/launches?board=${tab.id}`} className="mt-4 self-start px-1 font-display font-semibold underline decoration-line underline-offset-4 hover:decoration-chalk">
        See all of {tab.label}
      </Link>
    </div>
  );
}

export function LockedBoard({ have, need }: { have: number; need: number }) {
  return (
    <div role="tabpanel" className="mt-3 flex flex-1 flex-col items-start justify-center rounded-2xl bg-coal px-5 py-6">
      <p className="font-display text-xl font-semibold">Opens at {need} stars</p>
      <p className="mt-1 text-muted">
        This board ranks what people actually star, so it stays closed until there are enough stars to mean something.
        Star the launches you like to open it.
      </p>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuemin={0} aria-valuemax={need} aria-valuenow={have} aria-label="Stars so far">
        <div className="h-full rounded-full bg-chalk" style={{ width: `${Math.min(100, (have / need) * 100)}%` }} />
      </div>
      <p className="mt-2 text-sm text-muted tabular-nums">
        {have} of {need} stars
      </p>
    </div>
  );
}
