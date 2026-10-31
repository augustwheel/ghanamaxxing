"use client";

import { useEffect, useRef } from "react";

// The footer's picture: the Independence Arch in dense ASCII (scripts/hero/arch_ascii.py), with clouds of the same
// kind drifting across the sky above it. Slow and quiet on purpose. Only loads and runs near the screen, and holds still
// with reduced motion.
type Art = { cols: number; rows: number; chars: string[] };
type Data = { wide: Art; narrow: Art; clouds: string[][] };

const INK = "#8f8f9a";
const CLOUD = "#7c7c86";
const FONT = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const CHAR_RATIO = 0.6;
const TICK_MS = 500; // clouds move one character at a time, so slow keeps them calm

// Each cloud's start (across and down, as fractions of the sky) and how many characters it moves per tick.
const FLEET = [
  { shape: 2, x: 0.08, y: 0.08, speed: 0.5 },
  { shape: 1, x: 0.5, y: 0.5, speed: 0.34 },
  { shape: 0, x: 0.78, y: 0.02, speed: 0.25 },
];

export function FooterArch({ links, credits }: { links: React.ReactNode; credits: React.ReactNode }) {
  const skyRef = useRef<HTMLCanvasElement>(null);
  const archRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const sky = skyRef.current;
    const arch = archRef.current;
    const skyCtx = sky?.getContext("2d");
    const archCtx = arch?.getContext("2d");
    if (!sky || !arch || !skyCtx || !archCtx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let data: Data | null = null;
    let cell = 4;
    let ticks = 0;
    let visible = false;
    let dead = false;

    const setUp = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, w: number, h: number, ch: number) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `500 ${ch * 0.98}px ${FONT}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
    };
    const drawLines = (ctx: CanvasRenderingContext2D, lines: string[], left: number, top: number, cw: number, ch: number) => {
      lines.forEach((line, r) => {
        for (let c = 0; c < line.length; c++) {
          if (line[c] !== " ") ctx.fillText(line[c], (left + c + 0.5) * cw, (top + r + 0.5) * ch);
        }
      });
    };

    const drawClouds = () => {
      if (!data) return;
      const w = sky.clientWidth;
      const h = sky.clientHeight;
      const ch = cell / CHAR_RATIO;
      skyCtx.clearRect(0, 0, w, h);
      skyCtx.fillStyle = CLOUD;
      const cols = Math.ceil(w / cell);
      for (const cloud of FLEET) {
        const lines = data.clouds[cloud.shape];
        const width = Math.max(...lines.map((l) => l.length));
        const span = cols + width; // off one side and back in from the other
        const left = Math.round((cloud.x * span + ticks * cloud.speed) % span) - width;
        drawLines(skyCtx, lines, left, Math.round((cloud.y * h) / ch), cell, ch);
      }
    };

    const layout = () => {
      if (!data) return;
      const box = arch.parentElement!.clientWidth;
      const art = box < 420 ? data.narrow : data.wide;
      const cw = box / art.cols;
      const ch = cw / CHAR_RATIO;
      const height = art.rows * ch;
      arch.style.height = `${height}px`;
      setUp(archCtx, arch, box, height, ch);
      archCtx.fillStyle = INK;
      drawLines(archCtx, art.chars, 0, 0, cw, ch);
      cell = cw;
      // The sky stops where the arch starts, so no cloud shows through the star's empty space.
      sky.style.height = `${arch.parentElement!.offsetTop}px`;
      setUp(skyCtx, sky, sky.clientWidth, sky.clientHeight, ch);
      drawClouds();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !data) {
          fetch("/hero/arch-ascii.json")
            .then((res) => res.json())
            .then((json) => {
              if (dead) return;
              data = json;
              layout();
            })
            .catch(() => {});
        }
      },
      { rootMargin: "400px" },
    );
    io.observe(arch);
    const ro = new ResizeObserver(layout);
    ro.observe(arch.parentElement!);

    const timer = reduced
      ? undefined
      : setInterval(() => {
          if (!visible || document.hidden || !data) return;
          ticks++;
          drawClouds();
        }, TICK_MS);

    return () => {
      dead = true;
      clearInterval(timer);
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  return (
    <div className="gm-footer-layout">
      <div className="gm-footer-links">{links}</div>
      <div aria-hidden className="gm-footer-arch">
        <canvas ref={skyRef} className="gm-footer-sky" />
        <div className="gm-footer-picture">
          <canvas ref={archRef} />
        </div>
      </div>
      <div className="gm-footer-credits">{credits}</div>
    </div>
  );
}
