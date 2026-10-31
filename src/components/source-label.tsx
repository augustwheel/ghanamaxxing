import Link from "next/link";
import type { LaunchSource } from "@/lib/types";

const link = "underline decoration-line underline-offset-4 hover:text-chalk hover:decoration-chalk";

// Makers didn't ask to be listed, so listings we added invite them to take it over. Removal lives in the footer and on About.
export function SourceLabel({ name, slug, source, claimed }: { name: string; slug: string; source: LaunchSource; claimed: boolean }) {
  if (source === "maker" || claimed) {
    return <p className="mt-10 text-sm text-muted">Posted by the team behind {name}.</p>;
  }
  return (
    <p className="mt-10 text-sm text-muted">
      Is this yours?{" "}
      <Link href={`/claim?launch=${slug}`} className={link}>
        Claim it
      </Link>{" "}
      to update the details.
    </p>
  );
}
