import Link from "next/link";
import { SITE } from "@/config/site";
import type { LaunchSource } from "@/lib/types";

const link = "underline decoration-line underline-offset-4 hover:text-chalk hover:decoration-chalk";

// Makers didn't ask to be listed, so listings we added say why, and hand them control.
export function SourceLabel({ name, slug, source, claimed }: { name: string; slug: string; source: LaunchSource; claimed: boolean }) {
  if (source === "maker" || claimed) {
    return <p className="mt-10 text-sm text-muted">Posted by the team behind {name}.</p>;
  }
  return (
    <p className="mt-10 rounded-[2rem] bg-coal px-6 py-5 text-muted">
      We added {name} because we think it&apos;s great. Is it yours?{" "}
      <a href={`mailto:${SITE.contactEmail}?subject=${encodeURIComponent(`Claim ${name} on Ghanamaxxing`)}`} className={link}>
        Claim it
      </a>{" "}
      or{" "}
      <Link href={`/remove?launch=${slug}`} className={link}>
        ask us to take it down
      </Link>
      .
    </p>
  );
}
