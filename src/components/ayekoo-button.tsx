"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LaunchLogo } from "@/components/launch-logo";
import { ayekooLabel, currentAyekoo } from "@/config/ayekoo";

type Other = { slug: string; name: string; logo_url: string | null; type: string };

// Ghana red, gold, green, and the black star.
const CONFETTI_COLORS = ["#CE1126", "#FCD116", "#006B3F", "#F5C542", "#111111"];
const FILL_MS = 700;

// One tap to cheer a launch on. Not a vote: counts are never ranked or used to sort anything.
// Tapping fills the button with gold; when it's full it bursts into confetti, then offers ways to
// tell the makers and three more launches to cheer on.
export function AyekooButton({
  launchId,
  initialCount,
  name,
  slug,
  others,
}: {
  launchId: string;
  initialCount: number;
  name: string;
  slug: string;
  others: Other[];
}) {
  const phrase = currentAyekoo();
  const word = phrase.word.toLowerCase();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [count, setCount] = useState(initialCount);
  const [given, setGiven] = useState(false);
  const [phase, setPhase] = useState<"idle" | "filling" | "burst">("idle");
  const [celebrated, setCelebrated] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [suggestions, setSuggestions] = useState<Other[]>([]);

  useEffect(() => {
    fetch(`/api/ayekoo?launchId=${launchId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => {
        if (s) {
          setCount(s.count);
          setGiven(s.given);
        }
      })
      .catch(() => {});
  }, [launchId]);

  async function burst() {
    const el = buttonRef.current;
    if (!el) return;
    const confetti = (await import("canvas-confetti")).default;
    const r = el.getBoundingClientRect();
    const origin = { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight };
    const star = confetti.shapeFromPath({ path: "M12 1l3.1 7 7.6.6-5.8 5 1.8 7.4L12 17l-6.7 4 1.8-7.4-5.8-5 7.6-.6z" });
    const shared = { origin, colors: CONFETTI_COLORS, disableForReducedMotion: true, zIndex: 60 };
    confetti({ ...shared, particleCount: 90, spread: 75, startVelocity: 42, scalar: 1.05 });
    confetti({ ...shared, particleCount: 40, spread: 120, startVelocity: 30, decay: 0.92, scalar: 0.8, shapes: ["circle"] });
    setTimeout(() => confetti({ ...shared, particleCount: 14, spread: 100, startVelocity: 34, scalar: 1.6, shapes: [star], colors: ["#111111", "#FCD116"] }), 120);
  }

  async function toggle() {
    if (phase !== "idle") return;
    setNote(null);
    const next = !given;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Optimistic update; the server call runs while the button fills.
    setGiven(next);
    setCount((c) => Math.max(0, c + (next ? 1 : -1)));
    const request = fetch("/api/ayekoo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ launchId }) })
      .then(async (r) => ({ status: r.status, body: await r.json() }))
      .catch(() => null);

    if (next) {
      setPhase("filling");
      await new Promise((res) => setTimeout(res, reduce ? 150 : FILL_MS));
      setPhase("burst");
      if (!reduce) burst();
      navigator.vibrate?.([18, 40, 28]);
      setTimeout(() => setPhase("idle"), 450);
      setCelebrated(true);
      setSuggestions([...others].sort(() => Math.random() - 0.5).slice(0, 3));
    }

    const res = await request;
    if (!res) {
      setGiven(!next);
      setCount((c) => Math.max(0, c + (next ? -1 : 1)));
      setNote("Couldn't reach Ghanamaxxing. Try again.");
      return;
    }
    if (typeof res.body.count === "number") {
      setCount(res.body.count);
      setGiven(res.body.given);
    }
    if (res.status === 429) setNote(`That's a lot of ${word} from here. Try again later.`);
  }

  const shareText = `${phrase.word} to ${name} for building something great 👏🇬🇭`;
  const url = typeof window !== "undefined" ? `${window.location.origin}/launch/${slug}` : `/launch/${slug}`;
  const others_ = given ? count - 1 : count;
  const line =
    count === 0
      ? `Be the first to say ${word}`
      : given
        ? others_ === 0
          ? `You said ${word}`
          : `You and ${others_} ${others_ === 1 ? "other" : "others"} said ${word}`
        : `${count} ${count === 1 ? "person" : "people"} said ${word}`;

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        aria-pressed={given}
        aria-label={`${ayekooLabel(phrase)}${given ? ", said" : ""}`}
        data-phase={phase}
        data-given={given || undefined}
        className="gm-ayekoo"
      >
        <span aria-hidden className="gm-ayekoo-fill" />
        <span className="relative flex items-center gap-2">
          <span aria-hidden className={phase === "burst" ? "gm-clap" : undefined}>
            👏
          </span>
          {phrase.word}
          <span className="gm-ayekoo-sub">
            ({phrase.english}, {phrase.language})
          </span>
        </span>
      </button>
      <p className="text-sm text-muted" aria-live="polite">
        {note ?? line}
      </p>

      {celebrated && given && (
        <div className="gm-rise mt-4 w-full max-w-md rounded-[2rem] bg-coal p-5">
          <p className="font-display text-lg font-semibold">Tell the {name} team</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              className="btn-quiet !py-2 text-sm"
              target="_blank"
              rel="noopener"
              href={`https://x.com/intent/post?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`}
            >
              Share on X
            </a>
            <a className="btn-quiet !py-2 text-sm" target="_blank" rel="noopener" href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${url}`)}`}>
              WhatsApp
            </a>
            <button
              type="button"
              className="btn-quiet !py-2 text-sm"
              onClick={() => navigator.clipboard.writeText(`${shareText} ${url}`).then(() => setCopied(true))}
            >
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>

          {suggestions.length > 0 && (
            <>
              <p className="mt-6 font-display text-lg font-semibold">Who else deserves an {word}?</p>
              <ul className="mt-2 space-y-1">
                {suggestions.map((o) => (
                  <li key={o.slug}>
                    <Link href={`/launch/${o.slug}`} className="-mx-2 flex items-center gap-3 rounded-2xl px-2 py-2 hover:bg-surface">
                      <LaunchLogo name={o.name} logoUrl={o.logo_url} type={o.type} size={36} />
                      <span className="font-display font-semibold">{o.name}</span>
                      <span aria-hidden className="ml-auto text-muted">
                        👏
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
