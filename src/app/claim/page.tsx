import type { Metadata } from "next";
import { SITE } from "@/config/site";
import { ClaimForm } from "./claim-form";

export const metadata: Metadata = { title: "Claim a listing", robots: { index: false } };

type Props = { searchParams: Promise<{ launch?: string }> };

export default async function ClaimPage({ searchParams }: Props) {
  const { launch } = await searchParams;
  return (
    <div className="mx-auto max-w-2xl px-4 pt-10 sm:pt-14">
      <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Claim a listing</h1>
      <p className="mt-3 text-lg text-muted">
        Did you make this? Tell us who you are and we&apos;ll get in touch to mark it as yours and update its details.
      </p>
      <ClaimForm launch={launch ?? ""} />
      <p className="mt-8 text-sm text-muted">
        Prefer email? Write to{" "}
        <a href={`mailto:${SITE.contactEmail}`} className="underline decoration-line underline-offset-4 hover:text-chalk">
          {SITE.contactEmail}
        </a>
        .
      </p>
    </div>
  );
}
