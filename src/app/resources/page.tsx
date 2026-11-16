import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { NEWEST_GUIDES } from "@/config/resources";

export const metadata: Metadata = {
  title: "Resources for Ghanaian makers",
  description: "Practical guides and a growing directory of communities, investors, programmes and public support for apps and startups in Ghana.",
  alternates: { canonical: "/resources" },
};

export default function ResourcesPage() {
  const latest = NEWEST_GUIDES[0];

  return (
    <main className="mx-auto max-w-6xl px-4 pt-10 sm:pt-16">
      <p className="font-display text-sm font-semibold text-muted">For makers in Ghana</p>
      <h1 className="mt-3 max-w-4xl font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl">Find your next step.</h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-chalk/80 sm:text-xl">Clear advice for building your app or startup, and useful places to meet people who can help it grow.</p>

      <nav aria-label="Explore resources" className="mt-10 grid gap-4 md:grid-cols-2">
        <Link href="/resources/guides" className="group overflow-hidden rounded-3xl border border-line bg-surface transition-colors hover:border-muted">
          <div className="relative h-48 overflow-hidden sm:h-56"><Image src="/resources-guides-v2.svg" alt="Ghanaian makers and a small robot studying a map of Accra" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" /></div>
          <span className="block p-6 sm:p-8"><span className="font-display text-sm font-semibold text-muted">01 / Learn</span><span className="mt-5 block font-display text-3xl font-bold tracking-tight sm:text-4xl">Guides <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">→</span></span><span className="mt-3 block max-w-sm text-base leading-relaxed text-chalk/75">Practical reads on finding support, preparing to pitch and making your next move.</span></span>
        </Link>
        <Link href="/resources/directory" className="group overflow-hidden rounded-3xl border border-line bg-coal transition-colors hover:border-muted">
          <div className="relative h-48 overflow-hidden sm:h-56"><Image src="/resources-people-v3.svg" alt="Three Ghanaian makers with an Accra streetscape behind them" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" /></div>
          <span className="block p-6 sm:p-8"><span className="font-display text-sm font-semibold text-muted">02 / Connect</span><span className="mt-5 block font-display text-3xl font-bold tracking-tight sm:text-4xl">Find your people <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">→</span></span><span className="mt-3 block max-w-sm text-base leading-relaxed text-chalk/75">Explore communities, programmes, investor networks and public support in Ghana.</span></span>
        </Link>
      </nav>

      <section className="mt-14 border-t border-line pt-7 sm:mt-20" aria-labelledby="latest-guide">
        <p className="font-display text-sm font-semibold text-muted">Start here</p>
        <h2 id="latest-guide" className="mt-2 font-display text-2xl font-bold tracking-tight">Latest guide</h2>
        <Link href={latest.href} className="group mt-5 flex flex-col gap-3 rounded-2xl border border-line p-5 transition-colors hover:border-muted sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <span><span className="block font-display text-xl font-semibold group-hover:underline group-hover:underline-offset-4">{latest.title}</span><span className="mt-2 block text-sm text-muted">{latest.description}</span></span>
          <span aria-hidden="true" className="font-display text-2xl">→</span>
        </Link>
      </section>
    </main>
  );
}
