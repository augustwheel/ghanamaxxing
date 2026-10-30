import type { Metadata } from "next";
import { RemoveForm } from "./remove-form";

export const metadata: Metadata = { title: "Remove a listing", robots: { index: false } };

type Props = { searchParams: Promise<{ launch?: string }> };

export default async function RemovePage({ searchParams }: Props) {
  const { launch } = await searchParams;
  return (
    <div className="mx-auto max-w-2xl px-4 pt-10 sm:pt-14">
      <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Remove a listing</h1>
      <p className="mt-3 text-lg text-muted">
        We list products because we think they&apos;re worth celebrating, but it&apos;s your call. If you make it and
        would rather not be here, tell us and we&apos;ll take it down.
      </p>
      <RemoveForm launch={launch ?? ""} />
    </div>
  );
}
