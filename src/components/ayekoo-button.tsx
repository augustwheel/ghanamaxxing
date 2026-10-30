"use client";

import { useEffect, useState } from "react";
import { ayekooLabel, currentAyekoo } from "@/config/ayekoo";

// One tap to cheer a launch on. Not a vote: counts are never ranked or used to sort anything.
export function AyekooButton({ launchId, initialCount }: { launchId: string; initialCount: number }) {
  const phrase = currentAyekoo();
  const [count, setCount] = useState(initialCount);
  const [given, setGiven] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pop, setPop] = useState(0);
  const [note, setNote] = useState<string | null>(null);

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

  async function toggle() {
    if (busy) return;
    setBusy(true);
    setNote(null);
    const next = !given;
    setGiven(next); // optimistic
    setCount((c) => Math.max(0, c + (next ? 1 : -1)));
    if (next) setPop((p) => p + 1);
    try {
      const r = await fetch("/api/ayekoo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ launchId }) });
      const s = await r.json();
      if (typeof s.count === "number") {
        setCount(s.count);
        setGiven(s.given);
      }
      if (r.status === 429) setNote("That's a lot of ayekoo from here. Try again later.");
    } catch {
      setGiven(!next);
      setCount((c) => Math.max(0, c + (next ? -1 : 1)));
    } finally {
      setBusy(false);
    }
  }

  const others = given ? count - 1 : count;
  const line =
    count === 0
      ? `Be the first to say ${phrase.word.toLowerCase()}`
      : given
        ? others === 0
          ? `You said ${phrase.word.toLowerCase()}`
          : `You and ${others} ${others === 1 ? "other" : "others"} said ${phrase.word.toLowerCase()}`
        : `${count} ${count === 1 ? "person" : "people"} said ${phrase.word.toLowerCase()}`;

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={given}
        aria-label={`${ayekooLabel(phrase)}${given ? ", said" : ""}`}
        className={`${given ? "btn" : "btn-quiet"} !px-5 !py-3 text-lg`}
      >
        <span key={pop} aria-hidden className={pop ? "gm-clap" : undefined}>
          👏
        </span>
        {phrase.word}
        <span className="text-sm font-normal text-muted">
          ({phrase.english}, {phrase.language})
        </span>
      </button>
      <p className="text-sm text-muted" aria-live="polite">
        {note ?? line}
      </p>
    </div>
  );
}
