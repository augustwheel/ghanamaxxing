"use client";

import Link from "next/link";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 pt-16 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/hero/characters/vr.webp" alt="A boy in a VR headset, lost" width={220} height={220} className="h-56 w-56 object-contain" />
      <h1 className="mt-2 font-display text-5xl font-bold tracking-tight">Chale, something slipped</h1>
      <p className="mt-3 text-lg text-muted">That one&apos;s on us. Give it another go.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="btn">
          Try again
        </button>
        <Link href="/" className="btn-quiet">
          Home
        </Link>
      </div>
    </div>
  );
}
