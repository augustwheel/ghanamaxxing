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

export function Hero({ children }: { children?: React.ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const letterRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [walk, setWalk] = useState<Walk | null>(null);
  const [bumped, setBumped] = useState<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  // Safari (Low Power Mode, some site settings) can refuse to autoplay even muted video. Then we
  // show the characters as stills and start the animation on the visitor's first tap or scroll.
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Works out where a character should stand for a given letter, from the live layout.
  const placeFor = useCallback(
    (character: HeroCharacter): Omit<Walk, "key" | "character"> | null => {
      const stage = stageRef.current;
      if (!stage) return null;
      const s = stage.getBoundingClientRect();
      const cells = letterRefs.current.map((el, i) => ({
        el,
        i,
        r: el!.getBoundingClientRect(),
      }));
      const rowTops = [...new Set(cells.map((c) => Math.round(c.r.top)))].sort((a, b) => a - b);
    const eligible = cells.filter((c) => (HERO_TIMING.walkOutLetters as readonly string[]).includes(WORD[c.i]));
    const inRow = (row: number) => eligible.filter((c) => Math.round(c.r.top) === rowTops[row]);
    // Top and bottom mean the first/last row that has a straight-edged letter; middle is any row between.
    const rows = rowTops.map((_, k) => k).filter((k) => inRow(k).length);
    if (!rows.length) return null;
    const middle = rows.slice(1, -1);
    const row =
      character.row === "top" ? rows[0] : character.row === "bottom" ? rows[rows.length - 1] : pick(middle.length ? middle : rows);
    const candidates = inRow(row);
    const c = pick(candidates);
      const img = c.el!.querySelector("img")!.getBoundingClientRect();
      // The character fills ~85% of its square clip, so this makes them about half the letter's height.
      const size =
        ((img.height * HERO_TIMING.characterHeight) / 0.85) *
        (character.scale ?? 1);
      const centerX = img.left + img.width / 2 - s.left;
      const mirror = centerX < s.width / 2; // always walk toward the middle of the screen
      // The clip's entry edge sits just inside the letter's outer edge, and everything on the letter's
      // side of that edge is cut away, so the character is unseen until they step past the letter.
      const edge = mirror
        ? img.right - s.left - img.width * 0.04
        : img.left - s.left + img.width * 0.04;
      const left = mirror ? edge - size * 0.1 : edge - size * 0.9;
      const clip = mirror
        ? { left: edge, width: s.width - edge }
        : { left: 0, width: edge };
      return {
        letter: c.i,
        mirror,
        clip,
        box: { left, bottom: s.bottom - img.bottom - size * 0.05, size },
      };
    },
    [],
  );

  // The sequencer: characters take turns in config order (top, top, middle, bottom, bottom),
  // one at a time. Pauses while the hero is off-screen or the tab is hidden.
  useEffect(() => {
    if (reducedMotion || blocked) return;
    let turn = 0;
    let failures = 0;
    let watchdog: ReturnType<typeof setTimeout> | undefined;
    let key = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let visible = true;
    let playing = false;

    const queueNext = (delay: number) => {
      clearTimeout(timer);
      if (!visible || document.hidden || playing) return;
      const next = HERO_CHARACTERS[turn % HERO_CHARACTERS.length];
      fetch(clipUrl(next.id), { priority: "low" } as RequestInit).catch(
        () => {},
      ); // warm the cache
      timer = setTimeout(start, delay);
    };

    const start = () => {
      const character = HERO_CHARACTERS[turn++ % HERO_CHARACTERS.length];
      const place = placeFor(character);
      if (!place) return queueNext(500);
      playing = true;
      setWalk({ key: ++key, character, ...place });
      // Safari sometimes blocks playback without saying so. If the clip has loaded but still isn't
      // playing after a few seconds, treat it as blocked; if it's still loading, give it longer.
      clearTimeout(watchdog);
      const check = (waited: number) => {
        const el = videoRef.current;
        if (!el || !el.paused) return;
        if (el.readyState >= 2) return failRef.current(true);
        if (waited >= 9000) return failRef.current(false);
        watchdog = setTimeout(() => check(waited + 1500), 1500);
      };
      watchdog = setTimeout(() => check(3500), 3500);
    };

    finishRef.current = () => {
      clearTimeout(watchdog);
      playing = false;
      setWalk(null);
      const [a, b] = HERO_TIMING.gapMs;
      queueNext(a + Math.random() * (b - a));
    };

    startedRef.current = () => {
      clearTimeout(watchdog);
      failures = 0;
    };

    // A clip that couldn't play. `refused` means the browser said no (autoplay blocked); twice in a
    // row switches to stills until the visitor interacts. Slow or broken clips are just skipped.
    failRef.current = (refused) => {
      clearTimeout(watchdog);
      playing = false;
      setWalk(null);
      if (refused && ++failures >= 2) setBlocked(true);
      else queueNext(HERO_TIMING.firstDelayMs);
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) queueNext(HERO_TIMING.firstDelayMs);
      else clearTimeout(timer);
    });
    if (stageRef.current) io.observe(stageRef.current);
    const onVis = () =>
      document.hidden
        ? clearTimeout(timer)
        : queueNext(HERO_TIMING.firstDelayMs);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearTimeout(timer);
      clearTimeout(watchdog);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [reducedMotion, blocked, placeFor]);

  // Play the walk's clip on the one reusable video element.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (!walk) {
      el.pause();
      el.removeAttribute("data-playing");
      return;
    }
    el.removeAttribute("data-playing");
    el.src = clipUrl(walk.character.id);
    el.play()?.catch((err: DOMException) => {
      if (err?.name !== "AbortError") failRef.current(err?.name === "NotAllowedError");
    });
  }, [walk]);

  // While blocked, wait for a tap, click or key press: Safari only allows video to start while it's
  // handling one, so the element is unlocked right inside the handler. Once an element has played
  // from a gesture, Safari lets it keep playing, which is why every character shares one element.
  useEffect(() => {
    if (!blocked) return;
    const el = videoRef.current;
    if (el && !el.getAttribute("src")) el.src = clipUrl(HERO_CHARACTERS[0].id);
    const unlock = () => {
      const v = videoRef.current;
      if (!v) return;
      v.muted = true;
      const p = v.play();
      if (!p) return setBlocked(false);
      p.then(() => {
        v.pause();
        v.currentTime = 0;
        setBlocked(false);
      }).catch(() => {}); // still refused: keep waiting for the next gesture
    };
    const events = ["pointerdown", "touchend", "keydown", "click"] as const;
    events.forEach((e) => window.addEventListener(e, unlock, { passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, unlock));
  }, [blocked]);

  const finishRef = useRef<() => void>(() => {});
  const startedRef = useRef<() => void>(() => {});
  const failRef = useRef<(refused: boolean) => void>(() => {});
  const videoRef = useRef<HTMLVideoElement | null>(null);

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
                className={`gm-cell${walk?.letter === i ? " gm-cell-source" : ""}${bumped === i ? " gm-wobble" : ""}`}
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

        {/* One video element, reused for every character (see the unlock effect above). */}
        <div
          className="gm-walk-clip"
          style={walk ? { left: walk.clip.left, width: walk.clip.width } : { left: 0, width: 0 }}
        >
          <video
            ref={(el) => {
              videoRef.current = el;
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
              const at = walk?.character.bumpAt;
              if (walk && at && bumped === null && Math.abs(e.currentTarget.currentTime - at) < 0.15) setBumped(walk.letter);
            }}
            onPlaying={(e) => {
              if (!walk) return;
              e.currentTarget.setAttribute("data-playing", "");
              startedRef.current();
            }}
            onEnded={() => walk && finishRef.current()}
            onError={() => walk && failRef.current(false)}
          />
        </div>

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
    <img
      src={`/hero/characters/${c.id}.webp`}
      alt={c.label}
      className="gm-still"
    />
  );
}
