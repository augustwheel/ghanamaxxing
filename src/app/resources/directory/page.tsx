import type { Metadata } from "next";
import Link from "next/link";
import { DIRECTORY } from "@/config/resources";

export const metadata: Metadata = {
  title: "Ghana startup communities, investors and support",
  description: "A growing directory of Ghanaian maker communities, startup programmes, investor networks and public support.",
  alternates: { canonical: "/resources/directory" },
};

export default function DirectoryPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 pt-10 sm:pt-16">
      <Link href="/resources" className="font-display text-sm font-semibold text-muted underline decoration-line underline-offset-4 hover:text-chalk">← Resources</Link>
      <div className="mt-10 max-w-3xl"><p className="font-display text-sm font-semibold text-muted">A growing directory</p><h1 className="mt-2 font-display text-5xl font-bold leading-tight tracking-tight sm:text-7xl">Find your people</h1><p className="mt-5 text-lg leading-relaxed text-chalk/80">Communities to join, programmes to explore, and organisations supporting startups in Ghana. Start with the area that fits what you need.</p></div>
      <nav aria-label="Directory sections" className="mt-9 flex flex-wrap gap-2 border-b border-line pb-9">
        {DIRECTORY.map((section) => <a key={section.id} href={`#${section.id}`} className="btn-quiet text-sm">{section.title} <span aria-hidden="true">↓</span></a>)}
      </nav>
      <div className="mt-5 flex items-center justify-between gap-4 text-sm text-muted"><span>Checked 16 November 2026 · Check each site for current dates and eligibility.</span><Link href="/resources/guides" className="shrink-0 font-display font-semibold underline decoration-line underline-offset-4 hover:text-chalk">Read guides →</Link></div>
      {DIRECTORY.map((section) => (
        <section key={section.id} id={section.id} className="scroll-mt-6 border-b border-line py-12 sm:py-16" aria-labelledby={`${section.id}-heading`}>
          <div className="mb-6 max-w-2xl"><h2 id={`${section.id}-heading`} className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{section.title}</h2><p className="mt-3 text-chalk/75">{section.intro}</p></div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {section.entries.map((entry) => (
              <a key={entry.name} href={entry.url} target="_blank" rel="noopener noreferrer" className="group flex min-h-48 flex-col rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-muted">
                <span className="font-display text-xs font-semibold text-muted">{entry.location}</span><span className="mt-4 font-display text-xl font-semibold group-hover:underline group-hover:underline-offset-4">{entry.name} <span aria-hidden="true">→</span></span><span className="mt-3 text-sm leading-relaxed text-chalk/75">{entry.description}</span>
              </a>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
