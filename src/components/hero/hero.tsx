"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import {
  HERO_CHARACTERS,
  HERO_TIMING,
  type HeroCharacter,
} from "@/config/characters";

const WORD = "GHANAMAXXING";
// MAXXING gets its own colour so the word reads as "Ghana maxxing". Options: "ghana-green",
// "emerald", "silver", "violet" (files are /hero/letters/<letter>-<tint>.webp), or null for all black.
const MAXXING_TINT: "ghana-green" | "emerald" | "silver" | "violet" | null = "ghana-green";
const letterSrc = (ch: string, i: number) =>
  i >= 5 && MAXXING_TINT ? `/hero/letters/${ch}-${MAXXING_TINT}.webp` : `/hero/letters/${ch}.webp`;
// Width ÷ height of each letter image (public/hero/letters).
const ASPECT: Record<string, number> = {
  G: 0.8878,
  H: 0.9122,
  A: 0.8422,
  N: 0.9422,
  M: 1.1256,
  X: 0.8533,
  I: 0.5767,
};

type Walk = {
  key: number;
  character: HeroCharacter;
  letter: number;
  mirror: boolean;
  box: { left: number; bottom: number; size: number };
  /** Only the strip beyond the letter's outer edge shows the character. */
  clip: { left: number; width: number };
};

function pick<T>(list: T[]) {
  return list[Math.floor(Math.random() * list.length)];
}

// Transparent video: Safari only does alpha in HEVC, everyone else in VP9 WebM. Browsers don't report
// alpha support, so pick by engine rather than canPlayType.
const canHevcAlpha = () =>
  typeof navigator !== "undefined" &&
  /Safari/.test(navigator.userAgent) &&
  !/Chrome|Chromium|Android|Firefox/.test(navigator.userAgent);

const clipUrl = (id: string) =>
  `/hero/characters/${id}.${canHevcAlpha() ? "mov" : "webm"}`;

// Two players, so the next character can walk out while the current one walks back in.
const PLAYERS = 2;
type Slots = (Walk | null)[];

export function Hero({ children }: { children?: React.ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const letterRefs = useRef<(HTMLDivElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>(Array(PLAYERS).fill(null));
  const [walks, setWalks] = useState<Slots>(Array(PLAYERS).fill(null));
  const walksRef = useRef<Slots>(Array(PLAYERS).fill(null));
  const [bumped, setBumped] = useState<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  // Safari (Low Power Mode, some site settings) can refuse to autoplay even muted video. Then a
  // still character shows, and the first tap, click or key press unlocks the players.
  const [blocked, setBlocked] = useState(false);

  const setSlot = useCallback((slot: number, walk: Walk | null) => {
    walksRef.current = walksRef.current.map((w, i) => (i === slot ? walk : w));
    setWalks(walksRef.current);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Works out where a character should stand, from the live layout. `busy` letters are already in
  // use by the other player, so two characters never come out of the same letter at once.
  const placeFor = useCallback((character: HeroCharacter, busy: number[]): Omit<Walk, "key" | "character"> | null => {
    const stage = stageRef.current;
    if (!stage) return null;
    const s = stage.getBoundingClientRect();
    const cells = letterRefs.current.map((el, i) => ({ el, i, r: el!.getBoundingClientRect() }));
    const rowTops = [...new Set(cells.map((c) => Math.round(c.r.top)))].sort((a, b) => a - b);
    const eligible = cells.filter((c) => (HERO_TIMING.walkOutLetters as readonly string[]).includes(WORD[c.i]));
    const inRow = (row: number) => eligible.filter((c) => Math.round(c.r.top) === rowTops[row]);
    // Top and bottom mean the first/last row that has a straight-edged letter; middle is any row between.
    const rows = rowTops.map((_, k) => k).filter((k) => inRow(k).length);
    if (!rows.length) return null;
    const middle = rows.slice(1, -1);
    const row = character.row === "top" ? rows[0] : character.row === "bottom" ? rows[rows.length - 1] : pick(middle.length ? middle : rows);
    const free = (list: typeof eligible) => list.filter((c) => !busy.includes(c.i));
    const candidates = free(inRow(row)).length ? free(inRow(row)) : free(eligible);
    if (!candidates.length) return null;
    const c = pick(candidates);
    const img = c.el!.querySelector("img")!.getBoundingClientRect();
    // The character fills ~85% of its square clip.
    const size = ((img.height * HERO_TIMING.characterHeight) / 0.85) * (character.scale ?? 1);
    const centerX = img.left + img.width / 2 - s.left;
    const mirror = centerX < s.width / 2; // always walk toward the middle of the screen
    // The clip's entry edge sits just inside the letter's outer edge, and everything on the letter's
    // side of that edge is cut away, so the character is unseen until they step past the letter.
    const edge = mirror ? img.right - s.left - img.width * 0.04 : img.left - s.left + img.width * 0.04;
    const left = mirror ? edge - size * 0.1 : edge - size * 0.9;
    const clip = mirror ? { left: edge, width: s.width - edge } : { left: 0, width: edge };
    return { letter: c.i, mirror, clip, box: { left, bottom: s.bottom - img.bottom - size * 0.05, size } };
  }, []);

  // The sequencer: the five characters appear in config order as a chain. Each new one starts
  // walking out as the previous one turns back into its letter. After all five, a short rest,
  // then the cycle repeats. Pauses while the hero is off-screen or the tab is hidden.
  useEffect(() => {
    if (reducedMotion || blocked) return;
    const N = HERO_CHARACTERS.length;
    let next = 0; // next character in this cycle
    let key = 0;
    let failures = 0;
    let visible = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const watchdogs: (ReturnType<typeof setTimeout> | undefined)[] = Array(PLAYERS).fill(undefined);
    const handedOff: boolean[] = Array(PLAYERS).fill(true);
    const idle = () => walksRef.current.every((w) => !w);

    const launch = () => {
      clearTimeout(timer);
      if (!visible || document.hidden || next >= N) return;
      const slot = walksRef.current.findIndex((w) => !w);
      if (slot < 0) return;
      const character = HERO_CHARACTERS[next++];
      const busy = walksRef.current.filter(Boolean).map((w) => w!.letter);
      const place = placeFor(character, busy);
      if (!place) return launch();
      handedOff[slot] = false;
      setSlot(slot, { key: ++key, character, ...place });
      if (next < N) fetch(clipUrl(HERO_CHARACTERS[next].id), { priority: "low" } as RequestInit).catch(() => {});
      // Safari sometimes blocks playback without saying so. If the clip has loaded but still isn't
      // playing after a few seconds, treat it as blocked; if it's still loading, give it longer.
      clearTimeout(watchdogs[slot]);
      const check = (waited: number) => {
        const el = videoRefs.current[slot];
        if (!el || !el.paused) return;
        if (el.readyState >= 2) return failRef.current(slot, true);
        if (waited >= 9000) return failRef.current(slot, false);
        watchdogs[slot] = setTimeout(() => check(waited + 1500), 1500);
      };
      watchdogs[slot] = setTimeout(() => check(3500), 3500);
    };

    // After a player finishes (or gives up): free it, keep the chain going, rest after a full cycle.
    const release = (slot: number) => {
      clearTimeout(watchdogs[slot]);
      setSlot(slot, null);
      if (!handedOff[slot]) {
        handedOff[slot] = true;
        launch();
      }
      if (next >= N && idle()) {
        next = 0;
        const [a, b] = HERO_TIMING.cycleRestMs;
        timer = setTimeout(launch, a + Math.random() * (b - a));
      }
    };

    handoffRef.current = (slot) => {
      if (handedOff[slot]) return;
      handedOff[slot] = true;
      launch();
    };
    endRef.current = release;
    startedRef.current = (slot) => {
      clearTimeout(watchdogs[slot]);
      failures = 0;
    };
    // `refused` means the browser said no (autoplay blocked); twice switches to the still fallback.
    failRef.current = (slot, refused) => {
      if (refused && ++failures >= 2) {
        watchdogs.forEach((w) => clearTimeout(w));
        walksRef.current.forEach((_, i) => setSlot(i, null));
        return setBlocked(true);
      }
      release(slot);
    };

    const resume = () => {
      if (!idle()) return;
      if (next >= N) next = 0;
      clearTimeout(timer);
      timer = setTimeout(launch, HERO_TIMING.firstDelayMs);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) resume();
      else clearTimeout(timer);
    });
    if (stageRef.current) io.observe(stageRef.current);
    const onVis = () => (document.hidden ? clearTimeout(timer) : resume());
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearTimeout(timer);
      watchdogs.forEach((w) => clearTimeout(w));
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [reducedMotion, blocked, placeFor, setSlot]);

  // Play each player's clip when its walk changes.
  const walkKeys = walks.map((w) => w?.key ?? 0).join(",");
  useEffect(() => {
    walksRef.current.forEach((walk, slot) => {
      const el = videoRefs.current[slot];
      if (!el) return;
      if (!walk) {
        el.pause();
        el.removeAttribute("data-playing");
        return;
      }
      if (el.dataset.key === String(walk.key)) return;
      el.dataset.key = String(walk.key);
      el.removeAttribute("data-playing");
      el.src = clipUrl(walk.character.id);
      el.play()?.catch((err: DOMException) => {
        if (err?.name !== "AbortError") failRef.current(slot, err?.name === "NotAllowedError");
      });
    });
  }, [walkKeys]);

  // While blocked, wait for a tap, click or key press: Safari only lets video start while it's
  // handling one, so both players are unlocked right inside the handler. Once a player has played
  // from a gesture, Safari lets it keep playing, which is why the players are reused.
  useEffect(() => {
    if (!blocked) return;
    videoRefs.current.forEach((el, i) => {
      if (el && !el.getAttribute("src")) el.src = clipUrl(HERO_CHARACTERS[i % HERO_CHARACTERS.length].id);
    });
    const unlock = () => {
      const plays = videoRefs.current.map((v) => {
        if (!v) return Promise.resolve();
        v.muted = true;
        return (v.play() ?? Promise.resolve()).then(() => {
          v.pause();
          v.currentTime = 0;
        });
      });
      Promise.all(plays)
        .then(() => setBlocked(false))
        .catch(() => {}); // still refused: keep waiting for the next gesture
    };
    const events = ["pointerdown", "touchend", "keydown", "click"] as const;
    events.forEach((e) => window.addEventListener(e, unlock, { passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, unlock));
  }, [blocked]);

  const handoffRef = useRef<(slot: number) => void>(() => {});
  const endRef = useRef<(slot: number) => void>(() => {});
  const startedRef = useRef<(slot: number) => void>(() => {});
  const failRef = useRef<(slot: number, refused: boolean) => void>(() => {});
  const sourceLetters = walks.filter(Boolean).map((w) => w!.letter);

  return (
    <section aria-label="Ghanamaxxing" className="gm-hero">
      <h1 className="sr-only">Ghanamaxxing</h1>
      <div ref={stageRef} className="gm-stage">
        {/* Phones: GHA / NAM / AXX / ING. Wider screens: GHANA / MAXXING. The breaks are toggled in CSS. */}
        <div className="gm-word" aria-hidden>
          {[...WORD].map((ch, i) => (
            <Fragment key={i}>
              <div
                ref={(el) => {
                  letterRefs.current[i] = el;
                }}
                className={`gm-cell${sourceLetters.includes(i) ? " gm-cell-source" : ""}${bumped === i ? " gm-wobble" : ""}`}
                style={{ "--a": ASPECT[ch] } as React.CSSProperties}
                onAnimationEnd={() => setBumped(null)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized WebP, needs no optimisation */}
                <img src={letterSrc(ch, i)} alt="" draggable={false} fetchPriority={i < 5 ? "high" : "auto"} />
              </div>
              {(i === 2 || i === 5 || i === 8) && <span className="gm-break gm-break-phone" />}
              {i === 4 && <span className="gm-break gm-break-wide" />}
            </Fragment>
          ))}
        </div>

        {walks.map((walk, slot) => (
          <div
            key={slot}
            className="gm-walk-clip"
            style={walk ? { left: walk.clip.left, width: walk.clip.width } : { left: 0, width: 0 }}
          >
            <video
              ref={(el) => {
                videoRefs.current[slot] = el;
                if (el && !el.dataset.ready) {
                  // Safari only allows autoplay for video that is muted before it loads.
                  el.dataset.ready = "1";
                  el.muted = true;
                  el.defaultMuted = true;
                  el.setAttribute("muted", "");
                  el.setAttribute("playsinline", "");
                }
              }}
              className="gm-walker"
              style={
                walk
                  ? {
                      left: walk.box.left - walk.clip.left,
                      bottom: walk.box.bottom,
                      width: walk.box.size,
                      height: walk.box.size,
                      transform: walk.mirror ? "scaleX(-1)" : undefined,
                    }
                  : { width: 1, height: 1 }
              }
              muted
              playsInline
              preload="auto"
              onTimeUpdate={(e) => {
                if (!walk) return;
                const t = e.currentTarget.currentTime;
                const at = walk.character.bumpAt;
                if (at && bumped === null && Math.abs(t - at) < 0.15) setBumped(walk.letter);
                if (t >= HERO_TIMING.handoffAt) handoffRef.current(slot);
              }}
              onPlaying={(e) => {
                if (!walk) return;
                e.currentTarget.setAttribute("data-playing", "");
                startedRef.current(slot);
              }}
              onEnded={() => walk && endRef.current(slot)}
              onError={() => walk && failRef.current(slot, false)}
            />
          </div>
        ))}

        {(reducedMotion || blocked) && <ReducedMotionStill />}
      </div>
      {children}
    </section>
  );
}

// With reduced motion, or while the browser blocks video: one character stands still in front of the word.
function ReducedMotionStill() {
  const c = HERO_CHARACTERS[0];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={`/hero/characters/${c.id}.webp`} alt={c.label} className="gm-still" />
  );
}
