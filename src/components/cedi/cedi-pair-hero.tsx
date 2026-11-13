"use client";

// Cedi hero, take three: a young woman and man shoulder to shoulder, watching the eight Heritage Series
// notes circle above them. The notes are paper (src/components/cedi/paper.ts): they curve and ripple as they
// go round. Tap one: the pair steps back, the note flies forward spinning to its face, then a page turns
// over to show its back beside it. GSAP runs the open and close.
import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { CEDI_NOTES } from "@/config/cedi-notes";
import { makePaper, type Paper } from "./paper";

const WORD = "GHANAMAXXING";
const N = CEDI_NOTES.length;
const RATIO = 2.12;
const PERSPECTIVE = 1400; // keep in step with .gm-pair-stage in globals.css

type Pose = { x: number; y: number; s: number; ry: number };

function layout(W: number, H: number) {
  const phone = W < 640;
  const cardW = phone ? 116 : Math.max(130, Math.min(210, W * 0.14));
  const openW = phone ? Math.min(W - 48, 340) : Math.min((W - 140) / 2, 500);
  return {
    phone,
    cardW,
    cx: W / 2,
    cy: H * (phone ? 0.42 : 0.33),
    rx: W * (phone ? 0.44 : 0.37),
    ry: H * (phone ? 0.07 : 0.1),
    openW,
    openH: openW / RATIO,
    // Where the open note sits before and after its back turns out.
    openY: H * (phone ? 0.4 : 0.34),
  };
}

/** headY: where their heads are, as a share of the pair image's height from its top. The ring circles there. */
export function CediPairHero({ pair = "/lab/cedi/pair-standin.webp", headY = 0.2 }: { pair?: string; headY?: number }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const peopleRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const papers = useRef<Paper[]>([]);
  const openRef = useRef<HTMLDivElement>(null);
  const poses = useRef<Pose[]>([]);
  const focusRef = useRef<number | null>(null);
  const hoverRef = useRef<number | null>(null);
  const busy = useRef(false);
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
  const cardW = L ? Math.round(L.cardW) : 0;

  // Build a paper note inside each orbit card (rebuilt only when the card size changes).
  useEffect(() => {
    if (!cardW) return;
    papers.current = CEDI_NOTES.map((n, i) => {
      const host = cardRefs.current[i]!;
      host.querySelector(".pp")?.remove();
      const p = makePaper({
        front: n.front!,
        back: n.back!,
        width: cardW,
        height: cardW / RATIO,
        strips: 6,
        chains: [
          { dir: "right", from: cardW / 2 },
          { dir: "left", from: cardW / 2 },
        ],
      });
      host.appendChild(p.el);
      return p;
    });
  }, [cardW]);

  // The ring: a real cylinder in 3D perspective (the stage's CSS perspective, PERSPECTIVE below). Every
  // note faces the pair in the middle and curves along the cylinder. The far side, above and behind their
  // heads, reads like a carousel; the near side passes in front of them showing the notes' backs.
  // Drag to spin it; it carries on with momentum, and the paper bends harder the faster it goes.
  const angleRef = useRef(0.4);
  const spinRef = useRef(0); // extra speed from a drag, decays back to the resting drift
  const dragRef = useRef<{ x: number; last: number; t: number; moved: boolean } | null>(null);
  const draggedRef = useRef(false);

  useEffect(() => {
    if (!size) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const live = reduced ? 0 : 1;
    let raf = 0;
    let last = performance.now();
    let drift = 0.16;
    const bend = CEDI_NOTES.map(() => ({ x: 0, v: 0 }));
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = now / 1000;
      const people = peopleRef.current;
      const pw = people?.querySelector("img")?.offsetWidth || size.W * 0.6;
      const headLine = people ? people.offsetTop + people.offsetHeight * headY : size.H * 0.4;
      const phone = size.W < 640;
      const R = Math.min(size.W * (phone ? 0.42 : 0.36), Math.max(pw * 0.55, 150));
      // A slight tilt only, so the ring stays level like a carousel but the near side clears their faces.
      const tilt = R * (phone ? 0.42 : 0.3);
      const goal = focusRef.current !== null ? 0.02 : hoverRef.current !== null ? 0.05 : reduced ? 0.03 : 0.16;
      drift += (goal - drift) * Math.min(1, dt * 2);
      if (!dragRef.current) {
        spinRef.current *= Math.exp(-dt * 1.4);
        angleRef.current += (drift + spinRef.current) * dt;
      }
      const speed = Math.abs(drift + spinRef.current);
      const a0 = angleRef.current;
      const cx = size.W / 2;
      const cy = size.H / 2;
      cardRefs.current.forEach((el, i) => {
        const p = papers.current[i];
        if (!el || !p) return;
        const a = a0 + (i / N) * Math.PI * 2;
        const x = cx + R * Math.sin(a);
        const z = R * Math.cos(a); // + is toward you
        const y = headLine + tilt * Math.cos(a) + Math.sin(t * 1.1 + i * 1.7) * 3 * live;
        const ry = (a * 180) / Math.PI + 180; // facing the middle of the ring
        const hover = hoverRef.current === i ? 1.06 : 1;
        el.style.transform = `translate3d(${x}px, ${y}px, ${z}px) translate(-50%, -50%) rotateY(${ry}deg) scale(${hover})`;
        // Where it lands on screen, for flying it out of the ring and back.
        const k = PERSPECTIVE / (PERSPECTIVE - z);
        poses.current[i] = { x: cx + (x - cx) * k, y: cy + (y - cy) * k, s: k * hover, ry };
        const dim = focusRef.current !== null && focusRef.current !== i;
        el.style.visibility = focusRef.current === i ? "hidden" : "visible";
        el.style.setProperty("--o", dim ? "0.15" : z < 0 ? (0.8 + 0.2 * (1 + z / R)).toFixed(2) : "1");

        // Curved along the cylinder: each strip turns by its share of the arc it covers.
        const cyl = -(((cardW / 2 / R) * 180) / Math.PI / 6) * 1.15;
        // Spinning flings the loose ends outward (away from the middle); a spring makes it lag and settle.
        const push = Math.min(10, speed * speed * 30) * live;
        const b = bend[i];
        b.v += (-40 * (b.x - push) - 6 * b.v) * dt;
        b.x += b.v * dt;
        const ph = t * 4.5 + i * 1.3;
        const amp = (0.8 + Math.min(6, speed * 9) + (hoverRef.current === i ? 3 : 0)) * live;
        p.set(cyl + b.x * 0.8, Math.sin(ph) * amp, Math.cos(ph) * amp, cyl + b.x * 1.2);
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [size, headY, cardW]);

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
    const dx = e.clientX - d.last;
    const step = dx / (size.W * 0.36); // about a radian per ring radius dragged
    angleRef.current += step;
    spinRef.current = Math.max(-4, Math.min(4, step / Math.max(0.008, (now - d.t) / 1000)));
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
      focusRef.current = i;
      setFocus(i);
      setShown(true);
    },
    [size],
  );

  // Once the open note's elements exist, build the page and run the timeline.
  useEffect(() => {
    if (focus === null || !size || !openRef.current) return;
    const lay = layout(size.W, size.H);
    const note = CEDI_NOTES[focus];
    const box = openRef.current;
    const pageHost = box.querySelector<HTMLDivElement>(".gm-open-page")!;
    pageHost.innerHTML = "";
    const page = makePaper({
      front: note.front!,
      back: note.back!,
      width: lay.openW,
      height: lay.openH,
      strips: 12,
      chains: lay.phone ? [{ dir: "up", from: lay.openH }] : [{ dir: "left", from: lay.openW }],
    });
    pageHost.appendChild(page.el);

    const start = poses.current[focus];
    const s0 = (lay.cardW * start.s) / lay.openW;
    const ry0 = ((start.ry % 360) + 360) % 360;
    const ryEnd = ry0 > 180 ? 360 : 0;
    const pose = { x: start.x, y: start.y, s: s0, ry: ry0, rz: 0, curl: 0, wave: 0, turn: 0, lift: 0, shift: 0 };
    const draw = () => {
      const sx = lay.phone ? 0 : -pose.shift;
      const sy = lay.phone ? -pose.shift : 0;
      box.style.transform = `translate3d(${pose.x + sx}px, ${pose.y + sy}px, 0) translate(-50%, -50%) rotateY(${pose.ry}deg) rotateZ(${pose.rz}deg) scale(${pose.s})`;
      const turnSin = Math.sin((pose.turn / 180) * Math.PI);
      pageHost.style.transform = lay.phone
        ? `translateZ(${pose.lift + turnSin * 40}px) rotateX(${-pose.turn}deg)`
        : `translateZ(${pose.lift + turnSin * 40}px) rotateY(${pose.turn}deg)`;
      const ph = performance.now() / 260;
      page.set(pose.curl + turnSin * 9, Math.sin(ph) * pose.wave, Math.cos(ph) * pose.wave);
    };
    draw();

    const tl = gsap.timeline({ onUpdate: draw, onComplete: () => { busy.current = false; } });
    tl.to(peopleRef.current, { scale: 0.84, yPercent: 7, filter: "blur(8px) saturate(0.8)", opacity: 0.35, duration: 1, ease: "power3.out" }, 0)
      // Fly in, spinning round to its face, the paper flapping as it goes.
      .to(pose, { x: lay.cx, y: lay.openY, s: 1, ry: ryEnd, duration: 1.05, ease: "expo.out" }, 0)
      .to(pose, { rz: -4, duration: 0.5, ease: "sine.out" }, 0)
      .to(pose, { rz: 0, duration: 0.7, ease: "elastic.out(1, 0.45)" }, 0.5)
      .fromTo(pose, { wave: 10 }, { wave: 0, duration: 1.3, ease: "power2.out" }, 0)
      .fromTo(pose, { curl: -6 }, { curl: 0, duration: 1.4, ease: "elastic.out(1, 0.35)" }, 0.1)
      // Then the page turns over on its edge to show the back beside the front.
      .addLabel("turn", 0.95)
      .set(box.querySelector(".gm-open-base"), { opacity: 1 }, "turn")
      .to(pose, { turn: 180, duration: 1.1, ease: "power3.inOut" }, "turn")
      .to(pose, { shift: (lay.phone ? lay.openH : lay.openW) / 2 + 6, duration: 1.1, ease: "power3.inOut" }, "turn")
      .to(pose, { keyframes: { curl: [0, -5, 3, 0] }, duration: 1.1, ease: "none" }, "turn")
      .to(".gm-pair-caption-open", { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "turn+=0.6")
      .to(".gm-pair-close", { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }, "turn+=0.7");
    tlRef.current = { tl, pose, draw, lay };
    return () => {
      tl.kill();
    };
  }, [focus, size]);

  const tlRef = useRef<{ tl: gsap.core.Timeline; pose: Record<string, number>; draw: () => void; lay: ReturnType<typeof layout> } | null>(null);

  const close = useCallback(() => {
    const cur = tlRef.current;
    const i = focusRef.current;
    if (!cur || i === null || busy.current) return;
    busy.current = true;
    cur.tl.kill();
    const { pose, draw } = cur;
    const back = gsap.timeline({
      onUpdate: draw,
      onComplete: () => {
        focusRef.current = null;
        busy.current = false;
        tlRef.current = null;
        setFocus(null);
        setShown(false);
      },
    });
    back
      .to([".gm-pair-close", ".gm-pair-caption-open"], { opacity: 0, duration: 0.25 }, 0)
      .to(pose, { turn: 0, shift: 0, duration: 0.75, ease: "power3.inOut" }, 0)
      .to(pose, { curl: 4, duration: 0.4, yoyo: true, repeat: 1, ease: "sine.inOut" }, 0)
      .addLabel("fly", 0.7)
      // Back to wherever its place in the ring has got to by now.
      .to(
        pose,
        {
          x: () => poses.current[i].x,
          y: () => poses.current[i].y,
          s: () => (cur.lay.cardW * poses.current[i].s) / cur.lay.openW,
          ry: () => poses.current[i].ry,
          duration: 0.85,
          ease: "power3.inOut",
        },
        "fly",
      )
      .fromTo(pose, { wave: 0 }, { wave: 8, duration: 0.85, ease: "power2.in" }, "fly")
      .to(peopleRef.current, { scale: 1, yPercent: 0, filter: "blur(0px) saturate(1)", opacity: 1, duration: 0.9, ease: "power2.inOut" }, "fly");
  }, []);

  useEffect(() => {
    if (focus === null) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focus, close]);

  const note = focus === null ? null : CEDI_NOTES[focus];

  return (
    <section aria-label="Ghanamaxxing and Ghana's new cedi notes" className={`gm-pair${shown ? " is-open" : ""}`}>
      <h1 className="sr-only">Ghanamaxxing</h1>
      <div className="gm-pair-word" aria-hidden>
        {[...WORD].map((ch, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={`/hero/letters/${ch}-satin-${i < 5 ? "gold" : "green"}.webp`} alt="" draggable={false} />
        ))}
      </div>

      <div
        ref={stageRef}
        className="gm-pair-stage"
        onPointerDown={onDragStart}
        onPointerMove={onDragMove}
        onPointerUp={onDragEnd}
        onPointerCancel={onDragEnd}
        onPointerLeave={onDragEnd}
      >
        <div ref={peopleRef} className="gm-pair-people">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={pair} alt="A young woman and man looking up at Ghana's new cedi notes" />
        </div>

        {CEDI_NOTES.map((n, i) => (
          <button
            key={n.value}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            type="button"
            className="gm-pair-card"
            style={{ width: cardW || undefined, height: cardW ? cardW / RATIO : undefined }}
            aria-label={`GH₵${n.value} note, ${n.theme}`}
            // A tap shouldn't move focus: the browser would scroll the page to the (moving) button.
            onPointerDown={(e) => e.preventDefault()}
            onClick={() => open(i)}
            onPointerEnter={() => (hoverRef.current = i)}
            onPointerLeave={() => (hoverRef.current = null)}
            tabIndex={focus === null ? 0 : -1}
          />
        ))}
      </div>

      {/* The open note lives in its own layer above the ring, so ring notes can't pass through it. */}
      <div className="gm-pair-front">
        {note && L && (
          <div ref={openRef} className="gm-open" style={{ width: L.openW, height: L.openH }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="gm-open-base" src={note.front} alt={`Front of the GH₵${note.value} note, honouring ${note.honoree}`} />
            <div className={`gm-open-page${L.phone ? " is-phone" : ""}`} role="img" aria-label={`Back of the GH₵${note.value} note, showing ${note.landmark}`} />
          </div>
        )}
      </div>

      <div className="gm-pair-caption" aria-live="polite">
        {note ? (
          <div className="gm-pair-caption-open">
            <p className="font-display text-2xl text-[#17181c] sm:text-3xl">
              GH₵{note.value} <span className="text-[#6a6d75]">· {note.theme}</span>
            </p>
            <p className="mt-1 text-sm text-[#5b5e66] sm:text-base">
              Front honours {note.honoree}. Back shows {note.landmark}.
            </p>
          </div>
        ) : (
          <p className="gm-pair-hint text-sm text-[#5b5e66] sm:text-base">Ghana&apos;s new cedi notes are here. Tap one to see both sides.</p>
        )}
      </div>

      {note && (
        <button type="button" className="gm-pair-close" aria-label="Put the note back" onClick={close}>
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </button>
      )}
      <p className="gm-pair-credit">Note images: Bank of Ghana, Heritage Series</p>
    </section>
  );
}
