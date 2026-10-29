import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/config/site";

export const metadata: Metadata = { title: "Add yours", description: "Add your app or startup to Ghanamaxxing." };

// Sign-in and the add-a-launch form arrive with phase 2. Until then, say so plainly.
export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-xl px-4 pt-16 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/hero/characters/laptop.webp" alt="A young woman typing on a laptop" width={200} height={200} className="mx-auto h-48 w-48 object-contain" />
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">Adding launches opens soon</h1>
      <p className="mt-3 text-lg text-muted">
        You&apos;ll be able to sign in and add your app or startup here. Until then, send us the link and we&apos;ll add it
        for you.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a href={`mailto:${SITE.contactEmail}?subject=Add%20to%20Ghanamaxxing`} className="btn">
          Email us the link
        </a>
        <Link href="/launches" className="btn-quiet">
          Explore launches
        </Link>
      </div>
    </div>
  );
}
