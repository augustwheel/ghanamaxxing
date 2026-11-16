import Link from "next/link";
import { LaunchLogo } from "@/components/launch-logo";
import { getLaunchType } from "@/config/launch-types";
import { boardPreviews } from "@/lib/boards";
import { getApprovedLaunches } from "@/lib/launches";

export const revalidate = 3600;

export default async function ResourcesLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const launches = await getApprovedLaunches({ limit: 200 });
  const suggestions = boardPreviews(launches, 3).shuffle;

  return (
    <>
      {children}
      {suggestions.length > 0 && (
        <section aria-labelledby="apps-to-check-out" className="mx-auto mt-20 max-w-6xl px-4 pb-16 sm:mt-28 sm:pb-24">
          <div className="flex flex-wrap items-end justify-between gap-4 border-t border-line pt-8">
            <div>
              <p className="font-display text-sm font-semibold text-muted">Made in Ghana</p>
              <h2 id="apps-to-check-out" className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">Apps to check out</h2>
              <p className="mt-3 max-w-xl text-chalk/75">A few of the apps and startups people are making here. Take a look at what they&apos;re building.</p>
            </div>
            <Link href="/launches?board=shuffle" className="btn-quiet shrink-0">Explore more <span aria-hidden="true">→</span></Link>
          </div>
          <ul className="mt-7 grid gap-3 md:grid-cols-3">
            {suggestions.map((launch) => {
              const type = getLaunchType(launch.type);
              return (
                <li key={launch.id}>
                  <Link href={`/launch/${launch.slug}`} className="group flex h-full min-h-40 flex-col rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-muted">
                    <span className="flex items-start justify-between gap-4">
                      <LaunchLogo name={launch.name} logoUrl={launch.logo_url} type={launch.type} size={48} />
                      <span aria-hidden="true" className="font-display text-xl text-muted transition-transform group-hover:translate-x-1">→</span>
                    </span>
                    <span className="mt-5 block min-w-0 font-display text-xl font-semibold">{launch.name}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-chalk/75">{launch.tagline}</span>
                    <span className="mt-3 block text-xs font-medium" style={{ color: type.color }}>{type.label}{launch.city ? ` · ${launch.city}` : ""}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </>
  );
}
