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
          Nothing here is a competition. The makers didn&apos;t ask to be listed, so there are no rankings or leaderboards.
          If you love something, tap <em>Ayekoo</em> (well done, in Twi) to cheer the team on. Browse what&apos;s newest,
          or <Link href="/launches?board=shuffle" className={link}>shuffle</Link> for something you haven&apos;t seen.
        </p>
        <p>
          We added the first listings ourselves so you can explore from day one. They&apos;re labelled{" "}
          <em>Added by Ghanamaxxing</em>. If you know a detail we got wrong or left out, use{" "}
          <em>Suggest an edit</em> on any listing. If it&apos;s yours, you can claim it, or ask us to take it down.
        </p>
        <p>
          Building something? <Link href="/submit" className={link}>Add it</Link>.
        </p>
      </div>
    </div>
  );
}
