import type { Metadata } from "next";
import Link from "next/link";
import { NEWEST_GUIDES } from "@/config/resources";

export const metadata: Metadata = {
  title: "Guides for Ghanaian makers",
  description: "Practical guides for Ghanaian app makers and startup founders, with the newest guides first.",
  alternates: { canonical: "/resources/guides" },
};

export default function GuidesPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 pt-10 sm:pt-16">
      <Link href="/resources" className="font-display text-sm font-semibold text-muted underline decoration-line underline-offset-4 hover:text-chalk">← Resources</Link>
      <div className="mt-10 flex flex-col justify-between gap-5 border-b border-line pb-8 sm:flex-row sm:items-end">
        <div><p className="font-display text-sm font-semibold text-muted">For makers</p><h1 className="mt-2 font-display text-5xl font-bold tracking-tight sm:text-7xl">Guides</h1><p className="mt-5 max-w-xl text-lg leading-relaxed text-chalk/80">Practical advice for the questions that come up while building in Ghana.</p></div>
        <Link href="/resources/directory" className="btn-quiet self-start whitespace-nowrap">Find your people <span aria-hidden="true">→</span></Link>
      </div>
      <p className="mt-8 font-display text-sm text-muted">Newest first</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {NEWEST_GUIDES.map((guide) => (
          <Link key={guide.href} href={guide.href} className="group flex min-h-64 flex-col justify-between rounded-3xl border border-line bg-surface p-6 transition-colors hover:border-muted sm:p-8">
            <span className="font-display text-sm font-semibold text-muted">Guide · {guide.readingTime}</span>
            <span><span className="block font-display text-2xl font-bold leading-tight tracking-tight group-hover:underline group-hover:underline-offset-4 sm:text-3xl">{guide.title} <span aria-hidden="true">→</span></span><span className="mt-3 block max-w-md leading-relaxed text-chalk/75">{guide.description}</span></span>
          </Link>
        ))}
      </div>
    </main>
  );
}
