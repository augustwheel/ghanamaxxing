import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "Why Ghanamaxxing exists: a place to discover and back the apps and startups coming out of Ghana.",
};

const link = "underline decoration-line underline-offset-4 hover:decoration-chalk";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-10">
      <h1 className="font-display text-5xl font-bold tracking-tight">About</h1>
      <div className="mt-6 space-y-4 text-lg leading-relaxed text-chalk/90">
        <p>
          So many good apps and startups are coming out of Ghana, and they&apos;re scattered across X threads,
          WhatsApp groups and word of mouth. Ghanamaxxing is my attempt to gather them somewhere you can{" "}
          <Link href="/launches" className={link}>browse</Link> them and see where they&apos;re made on a live{" "}
          <Link href="/#map" className={link}>map</Link>. It won&apos;t have everything, but with your help it&apos;ll
          keep growing.
        </p>
        <p>
          Signed-in people star the launches they love. Every launch starts with zero stars, and the most-starred board
          only opens once there are enough stars to mean something. Until then, browse what&apos;s newest or dig up the{" "}
          <Link href="/launches?board=rare-finds" className={link}>rare finds</Link>.
        </p>
        <p>
          We added the first listings ourselves so you can explore from day one. They&apos;re labelled{" "}
          <em>Added by Ghanamaxxing</em>. If you know a detail we got wrong or left out, use{" "}
          <em>Suggest an edit</em> on any listing. If it&apos;s yours, you&apos;ll be able to claim it.
        </p>
        <p>
          Building something? <Link href="/submit" className={link}>Add it</Link>.
        </p>
      </div>
    </div>
  );
}
