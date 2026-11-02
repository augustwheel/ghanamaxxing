"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { LaunchLogo } from "@/components/launch-logo";
import { searchByName, type SearchItem } from "@/lib/search";

let searchIndex: Promise<SearchItem[]> | null = null;
let searchIndexAt = 0;

function loadSearchIndex() {
  if (!searchIndex || Date.now() - searchIndexAt > 60_000) {
    searchIndexAt = Date.now();
    searchIndex = fetch("/api/search", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Search unavailable");
        return response.json() as Promise<SearchItem[]>;
      })
      .catch((error) => {
        searchIndex = null;
        throw error;
      });
  }
  return searchIndex;
}

function SearchIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
      <circle cx="10.8" cy="10.8" r="6.8" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  );
}

export function SearchField({ initialQuery = "", roomy = false, onNavigate }: {
  initialQuery?: string;
  roomy?: boolean;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const listId = useId();
  const [query, setQuery] = useState(initialQuery);
  const [items, setItems] = useState<SearchItem[] | null>(null);
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(-1);
  const [error, setError] = useState(false);
  const matches = items ? searchByName(items, query).slice(0, 5) : [];
  const open = focused && Boolean(query.trim());

  const getIndex = () => {
    if (items && Date.now() - searchIndexAt < 60_000) return;
    if (error) return;
    void loadSearchIndex().then(setItems).catch(() => setError(true));
  };

  const navigate = (path: string) => {
    setFocused(false);
    onNavigate?.();
    router.push(path);
  };

  return (
    <form action="/launches" method="get" className="relative w-full" onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
    }}>
      <div className={`flex items-center gap-3 rounded-full border border-line bg-coal text-muted transition-colors focus-within:border-chalk/70 ${roomy ? "px-4 py-3.5" : "px-3.5 py-2"}`}>
        <SearchIcon className="h-5 w-5 shrink-0" />
        <input
          type="search"
          name="q"
          role="combobox"
          aria-label="Search apps by name"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={open && items && matches.length ? listId : undefined}
          aria-activedescendant={open && active >= 0 && matches[active] ? `${listId}-${active}` : undefined}
          autoComplete="off"
          maxLength={80}
          placeholder="Search apps by name"
          value={query}
          onFocus={() => { setFocused(true); getIndex(); }}
          onChange={(event) => { setQuery(event.target.value); setActive(-1); setFocused(true); getIndex(); }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" && matches.length) {
              event.preventDefault();
              setActive((current) => Math.min(current + 1, matches.length - 1));
            } else if (event.key === "ArrowUp" && matches.length) {
              event.preventDefault();
              setActive((current) => Math.max(current - 1, 0));
            } else if (event.key === "Enter" && query.trim()) {
              event.preventDefault();
              navigate(active >= 0 && matches[active]
                ? `/launch/${matches[active].slug}`
                : `/launches?q=${encodeURIComponent(query.trim())}`);
            } else if (event.key === "Escape") {
              setFocused(false);
              setActive(-1);
            }
          }}
          style={{ outline: "none" }}
          className="min-w-0 flex-1 bg-transparent font-sans text-base text-chalk outline-none focus:outline-none placeholder:text-muted [&::-webkit-search-cancel-button]:cursor-pointer"
        />
      </div>

      {open && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-line bg-surface p-2 shadow-2xl shadow-black/50">
          {!items && !error && <p className="px-3 py-3 text-sm text-muted">Finding apps…</p>}
          {error && <p className="px-3 py-3 text-sm text-muted">Search is unavailable right now. <Link href="/launches" className="text-chalk underline">Explore apps</Link></p>}
          {items && matches.length > 0 && (
            <ul id={listId} role="listbox" aria-label="Matching apps" className="max-h-[55vh] overflow-y-auto">
              {matches.map((item, index) => (
                <li
                  key={item.slug}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={active === index}
                  onMouseEnter={() => setActive(index)}
                  onPointerDown={(event) => event.preventDefault()}
                  onClick={() => navigate(`/launch/${item.slug}`)}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 ${active === index ? "bg-surface-2" : "hover:bg-surface-2"}`}
                >
                  <LaunchLogo name={item.name} logoUrl={item.logo_url} type={item.type} size={36} />
                  <span className="min-w-0">
                    <span className="block truncate font-display font-semibold text-chalk">{item.name}</span>
                    <span className="block truncate text-sm text-muted">{item.tagline}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
          {items && matches.length === 0 && (
            <p className="px-3 py-3 text-sm text-muted">No app with that name here yet. <Link href="/submit" className="text-chalk underline">Add yours</Link></p>
          )}
          {items && matches.length > 0 && (
            <Link href={`/launches?q=${encodeURIComponent(query.trim())}`} onClick={() => { setFocused(false); onNavigate?.(); }} className="mt-1 block rounded-xl px-3 py-2 text-sm font-semibold text-chalk hover:bg-surface-2">
              See all matches
            </Link>
          )}
        </div>
      )}
    </form>
  );
}

export function SiteSearch() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      dialog.querySelector("input")?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <>
      <div className="ml-3 hidden w-full max-w-sm lg:block">
        <SearchField />
      </div>
      <button type="button" onClick={() => setOpen(true)} aria-label="Search apps" className="flex shrink-0 items-center gap-1.5 rounded-full border border-line px-2.5 py-1.5 font-display text-sm font-semibold text-chalk hover:border-muted lg:hidden">
        <SearchIcon className="h-4 w-4" />
        <span className="hidden min-[360px]:inline">Search</span>
      </button>
      <dialog
        ref={dialogRef}
        aria-label="Search apps"
        onClose={() => setOpen(false)}
        onCancel={() => setOpen(false)}
        onClick={(event) => { if (event.target === dialogRef.current) setOpen(false); }}
        className="fixed inset-x-0 top-16 bottom-auto mx-auto my-0 w-[calc(100%-1.5rem)] max-w-xl overflow-visible rounded-[1.75rem] border border-line bg-ink p-4 text-chalk shadow-2xl backdrop:bg-black/75 lg:hidden"
      >
        {open && (
          <div className="flex items-start gap-2">
            <SearchField roomy onNavigate={() => setOpen(false)} />
            <button type="button" onClick={() => setOpen(false)} aria-label="Close search" className="shrink-0 rounded-full px-2 py-3 text-muted hover:text-chalk">✕</button>
          </div>
        )}
      </dialog>
    </>
  );
}
