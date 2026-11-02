"use client";

import type { CSSProperties, PointerEvent, ReactNode } from "react";

export function SpotlightMotion({ children, color }: { children: ReactNode; color: string }) {
  const reset = (event: PointerEvent<HTMLElement>) => {
    const style = event.currentTarget.style;
    style.setProperty("--spot-tilt-x", "0deg");
    style.setProperty("--spot-tilt-y", "0deg");
  };

  const move = (event: PointerEvent<HTMLElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (event.pointerType === "touch" && event.buttons === 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    const style = event.currentTarget.style;
    style.setProperty("--spot-tilt-x", `${((0.5 - y) * 1.4).toFixed(2)}deg`);
    style.setProperty("--spot-tilt-y", `${((x - 0.5) * 1.8).toFixed(2)}deg`);
  };

  return (
    <article
      className="spotlight-motion group relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-coal"
      style={{ "--spot-color": color } as CSSProperties}
      onPointerMove={move}
      onPointerLeave={reset}
      onPointerUp={(event) => { if (event.pointerType === "touch") reset(event); }}
      onPointerCancel={reset}
    >
      {children}
    </article>
  );
}
