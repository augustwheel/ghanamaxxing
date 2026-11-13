"use client";

// Cedi hero, the band: the eight Heritage Series notes edge to edge as one ribbon, each bent round a
// cylinder, tilted toward you so the inside of the far side shows above the near side. The near side
// shows the fronts, the far side the backs. Drag to spin; tap a note to bring it out and turn it over.
// Plain DOM with the Bank of Ghana's own images (paper strips in ./paper.ts), GSAP for the open and close.
import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { CEDI_NOTES, small } from "@/config/cedi-notes";
import { makePaper, type Paper } from "./paper";
import { FLAG_PAD, ShaderFlag } from "./shader-flag";

const WORD = "GHANAMAXXING";
const N = CEDI_NOTES.length;
const RATIO = 2.12;
const STRIPS = 8; // per half of each note
const STEP = 360 / N;

type Pose = { x: number; y: number; s: number; ry: number };

function layout(W: number, H: number) {
  const phone = W < 640;
  // Each note covers 1/8 of the circle, so the radius follows from the note's width.
  const noteW = Math.round(phone ? Math.min(W * 0.28, 150) : Math.min(W * 0.18, 290)); // phones: small enough that the whole ring fits
  const noteH = noteW / RATIO;
  const R = (noteW / ((STEP * Math.PI) / 180)) * 1.05; // a small gap between notes
  const openW = phone ? Math.min(W - 48, 340) : Math.min((W - 140) / 2, 500);
  const cx = W / 2;
  const cy = H * (phone ? 0.5 : 0.6);
  const tiltDeg = phone ? 26 : 17;
  // The flag flies from a pole on the ring's axis, just above the far side of the band.
  // The cloth is about this wide, and never runs off a phone screen.
  const flagW = Math.round(Math.min(noteW * (phone ? 1.75 : 1.3), (W / 2 - 12) / (1 + FLAG_PAD.r / 1.5)));
  const flagH = flagW / 1.5;
  const ringTop = cy - R * Math.sin((tiltDeg * Math.PI) / 180) - noteH * 0.5;
  const flagTop = Math.max(phone ? 70 : 96, ringTop - flagH * 0.75);
  return { phone, noteW, noteH, R, openW, openH: openW / RATIO, cx, cy, tiltDeg, flagW, flagH, flagTop, openY: H * (phone ? 0.42 : 0.4) };
}

export function CediBandHero({ theme = "light" }: { theme?: "light" | "dark" }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const papers = useRef<Paper[]>([]);
  const openRef = useRef<HTMLDivElement>(null);
  const focusRef = useRef<number | null>(null);
  const hoverRef = useRef<number | null>(null);
  const busy = useRef(false);
  const spinRef = useRef(-200); // degrees
  // Extra degrees per second from a drag. It starts high so the band whirls in on load and settles.
  const velRef = useRef(260);
  const dragRef = useRef<{ x: number; last: number; t: number; moved: boolean } | null>(null);
  const draggedRef = useRef(false);
  const [focus, setFocus] = useState<number | null>(null);
  const [shown, setShown] = useState(false);
  const [size, setSize] = useState<{ W: number; H: number } | null>(null);

  useEffect(() => {
    const el = stageRef.current!;
    const ro = new ResizeObserver(() => setSize({ W: el.clientWidth, H: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const L = size ? layout(size.W, size.H) : null;
  const noteW = L?.noteW ?? 0;

  // One paper note per card, bent from its middle so it can follow the cylinder.
  useEffect(() => {
    if (!noteW) return;
    papers.current = CEDI_NOTES.map((n, i) => {
      const host = cardRefs.current[i]!;
      host.querySelector(".pp")?.remove();
      const p = makePaper({
        front: small(n.front),
        back: small(n.back),
        width: noteW,
        height: noteW / RATIO,
        strips: STRIPS,
        chains: [
          { dir: "right", from: noteW / 2 },
          { dir: "left", from: noteW / 2 },
        ],
      });
      host.appendChild(p.el);
      return p;
    });
  }, [noteW]);

  useEffect(() => {
    if (!size) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const live = reduced ? 0 : 1;
    if (reduced) velRef.current = 0;
    const lay = layout(size.W, size.H);
    let raf = 0;
    let last = performance.now();
    let drift = 9;
    const flex = CEDI_NOTES.map(() => ({ x: 0, v: 0 }));
    // How far each strip turns so the note lies exactly on the cylinder.
    const arc = (lay.noteW / 2 / STRIPS / lay.R) * (180 / Math.PI);
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = now / 1000;
      const goal = focusRef.current !== null ? 1.5 : hoverRef.current !== null ? 3 : reduced ? 2 : 9;
      drift += (goal - drift) * Math.min(1, dt * 2);
      if (!dragRef.current) {
        velRef.current *= Math.exp(-dt * 1.3);
        spinRef.current += (drift + velRef.current) * dt;
      }
      const speed = Math.abs(drift + velRef.current);
      // The band leans toward you and rolls a little, breathing slowly.
      const tilt = -lay.tiltDeg + Math.sin(t * 0.4) * 3 * live; // phones tip further so it fills the height
      const roll = -9 + Math.sin(t * 0.3 + 1) * 3 * live;
      const ring = ringRef.current;
      if (ring) ring.style.transform = `translate3d(${lay.cx}px, ${lay.cy}px, 0) rotateX(${tilt}deg) rotateZ(${roll}deg) rotateY(${spinRef.current}deg)`;
      cardRefs.current.forEach((el, i) => {
        const p = papers.current[i];
        if (!el || !p) return;
        const deg = i * STEP;
        const world = ((deg + spinRef.current) * Math.PI) / 180; // 0 = nearest you
        // A gentle twist runs round the band.
        const twist = Math.sin(world + t * 0.6) * 11 * live;
        const lift = hoverRef.current === i ? 26 : 0;
        el.style.transform = `rotateY(${deg}deg) translateZ(${lay.R + lift}px) rotateX(${twist}deg)`;
        // Light from the front: faces turn darker as they turn away, and the inside of the band sits in shade.
        const c = Math.cos(world);
        el.style.setProperty("--shf", (0.26 * (1 - Math.max(0, c))).toFixed(3));
        el.style.setProperty("--shb", (0.1 + 0.2 * (1 - Math.max(0, -c))).toFixed(3));
        const dim = focusRef.current !== null && focusRef.current !== i;
        el.style.visibility = focusRef.current === i ? "hidden" : "visible";
        el.style.setProperty("--o", dim ? "0.12" : "1");
        // Spinning fast flings the loose edges out a little; a spring lets them lag and settle.
        const push = Math.min(4, (speed / 9) ** 2 * 0.6) * live;
        const f = flex[i];
        f.v += (-45 * (f.x - push) - 7 * f.v) * dt;
        f.x += f.v * dt;
        const ph = t * 4 + i * 1.1;
        const amp = Math.min(2.5, Math.max(0, speed - 12) * 0.08) * live;
        p.set(arc - f.x * 0.6, Math.sin(ph) * amp, Math.cos(ph) * amp, arc - f.x);
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [size]);

  // Where a card is on screen right now, in the open note's terms.
  const poseOf = useCallback((i: number): Pose => {
    const el = cardRefs.current[i]!;
    const r = el.getBoundingClientRect();
    const s = stageRef.current!.getBoundingClientRect();
    const lay = layout(s.width, s.height);
    return {
      x: r.left - s.left + r.width / 2,
      y: r.top - s.top + r.height / 2,
      s: r.height / lay.noteH,
      ry: i * STEP + spinRef.current,
    };
  }, []);

  const onDragStart = (e: React.PointerEvent) => {
    if (focusRef.current !== null) return;
    dragRef.current = { x: e.clientX, last: e.clientX, t: performance.now(), moved: false };
    draggedRef.current = false;
  };
  const onDragMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d || !size) return;
    if (!d.moved && Math.abs(e.clientX - d.x) > 6) d.moved = draggedRef.current = true;
    if (!d.moved) return;
    const now = performance.now();
    const step = ((e.clientX - d.last) / size.W) * 220; // degrees
    spinRef.current += step;
    velRef.current = Math.max(-300, Math.min(300, step / Math.max(0.008, (now - d.t) / 1000)));
    d.last = e.clientX;
    d.t = now;
  };
  const onDragEnd = () => {
    dragRef.current = null;
  };

  const open = useCallback(
    (i: number) => {
      if (busy.current || focusRef.current !== null || !size || draggedRef.current) return;
      busy.current = true;
      startPose.current = poseOf(i);
      focusRef.current = i;
      setFocus(i);
      setShown(true);
    },
    [size, poseOf],
  );
  const startPose = useRef<Pose | null>(null);
  const tlRef = useRef<{ tl: gsap.core.Timeline; pose: Record<string, number>; draw: () => void; lay: ReturnType<typeof layout> } | null>(null);

  useEffect(() => {
    if (focus === null || !size || !openRef.current || !startPose.current) return;
    const lay = layout(size.W, size.H);
    const note = CEDI_NOTES[focus];
    const box = openRef.current;
    const pageHost = box.querySelector<HTMLDivElement>(".gm-open-page")!;
    pageHost.innerHTML = "";
    const page = makePaper({
      front: note.front,
      back: note.back,
      width: lay.openW,
      height: lay.openH,
      strips: 12,
      chains: lay.phone ? [{ dir: "up", from: lay.openH }] : [{ dir: "left", from: lay.openW }],
    });
    pageHost.appendChild(page.el);

    const start = startPose.current;
    const ry0 = ((start.ry % 360) + 360) % 360;
    const ryEnd = ry0 > 180 ? 360 : 0;
    const pose = { x: start.x, y: start.y, s: (lay.noteW * start.s) / lay.openW, ry: ry0, rz: 0, curl: 4, wave: 0, turn: 0, shift: 0 };
    const draw = () => {
      const sx = lay.phone ? 0 : -pose.shift;
      const sy = lay.phone ? -pose.shift : 0;
      box.style.transform = `translate3d(${pose.x + sx}px, ${pose.y + sy}px, 0) translate(-50%, -50%) rotateY(${pose.ry}deg) rotateZ(${pose.rz}deg) scale(${pose.s})`;
      const turnSin = Math.sin((pose.turn / 180) * Math.PI);
      pageHost.style.transform = lay.phone
        ? `translateZ(${turnSin * 40}px) rotateX(${-pose.turn}deg)`
        : `translateZ(${turnSin * 40}px) rotateY(${pose.turn}deg)`;
      const ph = performance.now() / 260;
      page.set(pose.curl + turnSin * 9, Math.sin(ph) * pose.wave, Math.cos(ph) * pose.wave);
    };
    draw();
    const tl = gsap.timeline({ onUpdate: draw, onComplete: () => { busy.current = false; } });
    tl.to(".gm-band-word", { opacity: 0, y: -12, duration: 0.5 }, 0)
      // Out of the band: it straightens as it comes, spinning round to its face.
      .to(pose, { x: lay.cx, y: lay.openY, s: 1, ry: ryEnd, duration: 1.05, ease: "expo.out" }, 0)
      .to(pose, { rz: -4, duration: 0.5, ease: "sine.out" }, 0)
      .to(pose, { rz: 0, duration: 0.7, ease: "elastic.out(1, 0.45)" }, 0.5)
      .fromTo(pose, { wave: 9 }, { wave: 0, duration: 1.3, ease: "power2.out" }, 0)
      .to(pose, { curl: 0, duration: 1.4, ease: "elastic.out(1, 0.35)" }, 0.05)
      .addLabel("turn", 0.95)
      .set(box.querySelector(".gm-open-base"), { opacity: 1 }, "turn")
      .to(pose, { turn: 180, duration: 1.1, ease: "power3.inOut" }, "turn")
      .to(pose, { shift: (lay.phone ? lay.openH : lay.openW) / 2 + 6, duration: 1.1, ease: "power3.inOut" }, "turn")
      .to(pose, { keyframes: { curl: [0, -5, 3, 0] }, duration: 1.1, ease: "none" }, "turn")
      .to(".gm-band-caption-open", { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "turn+=0.6")
      .to(".gm-band-close", { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }, "turn+=0.7");
    tlRef.current = { tl, pose, draw, lay };
    return () => {
      tl.kill();
    };
  }, [focus, size]);

  const close = useCallback(() => {
    const cur = tlRef.current;
    const i = focusRef.current;
    if (!cur || i === null || busy.current) return;
    busy.current = true;
    cur.tl.kill();
    const { pose, draw } = cur;
    let target: Pose | null = null;
    const tgt = () => (target ??= poseOf(i));
    gsap
      .timeline({
        onUpdate: draw,
        onComplete: () => {
          focusRef.current = null;
          busy.current = false;
          tlRef.current = null;
          setFocus(null);
          setShown(false);
        },
      })
      .to([".gm-band-close", ".gm-band-caption-open"], { opacity: 0, duration: 0.25 }, 0)
      .to(pose, { turn: 0, shift: 0, duration: 0.75, ease: "power3.inOut" }, 0)
      .addLabel("fly", 0.7)
      // Back into its place in the band, wherever that has got to.
      .to(
        pose,
        {
          x: () => tgt().x,
          y: () => tgt().y,
          s: () => (cur.lay.noteW * tgt().s) / cur.lay.openW,
          ry: () => tgt().ry,
          curl: 4,
          duration: 0.85,
          ease: "power3.inOut",
        },
        "fly",
      )
      .to(".gm-band-word", { opacity: 1, y: 0, duration: 0.6 }, "fly+=0.3");
  }, [poseOf]);

  useEffect(() => {
    if (focus === null) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focus, close]);

  const note = focus === null ? null : CEDI_NOTES[focus];

  return (
    <section aria-label="Ghanamaxxing and Ghana's new cedi notes" className={`gm-band gm-band-${theme}${shown ? " is-open" : ""}`}>
      <h1 className="sr-only">Ghanamaxxing</h1>
      <div className="gm-band-word" aria-hidden>
        {[...WORD].map((ch, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={`/hero/letters/${ch}-satin-${i < 5 ? "gold" : "green"}.webp`} alt="" draggable={false} />
        ))}
      </div>

      {/* The pole is split at the ring's middle instead of trusting the browser's 3D depth sort: the lower
          half sits behind the band (only near notes cross it), the upper half and the flag in front (only far
          notes cross them). */}
      {L && <div className="gm-flag-pole gm-flag-pole-low" style={{ left: L.cx - 3, top: L.cy }} aria-hidden />}
      <div className="gm-flag-layer" aria-hidden>
        {L && <div className="gm-flag-pole gm-flag-pole-high" style={{ left: L.cx - 3, top: L.flagTop - 16, height: L.cy - L.flagTop + 16 }} />}
        {L && (
          <ShaderFlag
            width={L.flagW}
            className="gm-flag-cloth"
            style={{ left: L.cx + 2 - FLAG_PAD.l * (L.flagW / 1.5), top: L.flagTop - FLAG_PAD.t * (L.flagW / 1.5) }}
          />
        )}
      </div>
      <div
        ref={stageRef}
        className="gm-band-stage"
        onPointerDown={onDragStart}
        onPointerMove={onDragMove}
        onPointerUp={onDragEnd}
        onPointerCancel={onDragEnd}
        onPointerLeave={onDragEnd}
      >
        <div className="gm-band-shadow" style={L ? { top: L.cy + L.R * 0.42, width: L.R * 2.1, marginLeft: -L.R * 1.05 } : undefined} />
        <div ref={ringRef} className="gm-band-ring">
          {CEDI_NOTES.map((n, i) => (
            <button
              key={n.value}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              type="button"
              className="gm-band-card"
              style={L ? { width: L.noteW, height: L.noteH, marginLeft: -L.noteW / 2, marginTop: -L.noteH / 2 } : undefined}
              aria-label={`GH₵${n.value} note, ${n.theme}`}
              // A tap shouldn't move focus: the browser would scroll the page to the moving button.
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => open(i)}
              onPointerEnter={() => (hoverRef.current = i)}
              onPointerLeave={() => (hoverRef.current = null)}
              tabIndex={focus === null ? 0 : -1}
            />
          ))}
        </div>
      </div>

      <div className="gm-band-front">
        {note && L && (
          <div ref={openRef} className="gm-open" style={{ width: L.openW, height: L.openH }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="gm-open-base" src={note.front} alt={`Front of the GH₵${note.value} note, honouring ${note.honoree}`} />
            <div className={`gm-open-page${L.phone ? " is-phone" : ""}`} role="img" aria-label={`Back of the GH₵${note.value} note, showing ${note.landmark}`} />
          </div>
        )}
      </div>

      <div className="gm-band-caption" aria-live="polite">
        {note ? (
          <div className="gm-band-caption-open">
            <p className="font-display text-2xl text-[var(--band-ink)] sm:text-3xl">
              GH₵{note.value} <span className="text-[var(--band-soft)]">· {note.theme}</span>
            </p>
            <p className="mt-1 text-sm text-[var(--band-soft)] sm:text-base">
              Front honours {note.honoree}. Back shows {note.landmark}.
            </p>
          </div>
        ) : (
          <p className="gm-band-hint text-sm text-[var(--band-soft)]">Meet Ghana&apos;s new cedi notes. Drag to spin, tap one to see both sides.</p>
        )}
      </div>

      {note && (
        <button type="button" className="gm-band-close" aria-label="Put the note back" onClick={close}>
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </button>
      )}
      <p className="gm-band-credit">Note images: Bank of Ghana, Heritage Series</p>
    </section>
  );
}
