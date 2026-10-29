import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "Ghanamaxxing is a launch board and live map of what Ghanaians are building.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-10">
      <h1 className="font-display text-5xl tracking-wide">ABOUT</h1>
      <div className="mt-6 space-y-4 text-lg leading-relaxed text-cream/90">
        <p>
          Ghanamaxxing is a launch board and live map of what Ghanaians are building: startups, apps, side projects,
          AI tools and games.
        </p>
        <p>
          Anyone can <Link href="/submit" className="text-gold underline">post a launch</Link>. Signed-in people vote for
          what they like, and launches are ranked in a few fair categories so new and small builders get seen too.
          Every launch starts at zero votes. No fake hype.
        </p>
        <p>
          Some early listings were added by us so the board isn&apos;t empty on day one. They&apos;re labelled{" "}
          <em>Added by Ghanamaxxing</em>, and makers can claim them.
        </p>
      </div>
    </div>
  );
}
