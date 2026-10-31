import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { LaunchList } from "@/components/launch-list";
import { COLLECTIONS, TOPICS, findCollection, inCollection } from "@/config/collections";
import { SITE } from "@/config/site";
import { newestLaunches } from "@/lib/boards";
import { getApprovedLaunches } from "@/lib/launches";

export const revalidate = 60;
// Only the pages in COLLECTIONS exist here; every other top-level address is a 404.
export const dynamicParams = false;

type Props = { params: Promise<{ collection: string }> };

export function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ collection: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const collection = findCollection((await params).collection);
  if (!collection) return { title: "Not found" };
  return {
    title: collection.title,
    description: collection.description,
    alternates: { canonical: `/${collection.slug}` },
    openGraph: { title: collection.title, description: collection.description },
  };
}

export default async function CollectionPage({ params }: Props) {
  const collection = findCollection((await params).collection);
  if (!collection) notFound();
  const launches = newestLaunches((await getApprovedLaunches({ limit: 1000 })).filter((l) => inCollection(collection, l)));
  const pageUrl = `${SITE.url}/${collection.slug}`;

  return (
    <div className="mx-auto max-w-3xl px-4 pt-10 sm:pt-14">
      <JsonLd
        data={{
          "@type": "CollectionPage",
          name: collection.title,
          description: collection.description,
          url: pageUrl,
          isPartOf: { "@type": "WebSite", name: SITE.name, url: SITE.url },
          breadcrumb: {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Explore", item: `${SITE.url}/launches` },
              { "@type": "ListItem", position: 2, name: collection.title, item: pageUrl },
            ],
          },
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: launches.length,
            itemListElement: launches.map((l, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: l.name,
              url: `${SITE.url}/launch/${l.slug}`,
            })),
          },
        }}
      />
      <Link href="/launches" className="font-display font-semibold text-muted hover:text-chalk">
        Explore everything
      </Link>
      <h1 className="mt-6 font-display text-5xl leading-[0.95] font-bold tracking-tight text-balance sm:text-6xl">{collection.title}</h1>
      <p className="mt-4 max-w-xl text-lg text-muted text-pretty">{collection.intro}</p>

      <LaunchList launches={launches} />

      <section className="mt-12 rounded-[2rem] bg-surface px-6 py-8">
        <h2 className="font-display text-2xl font-semibold">Know one we&apos;re missing?</h2>
        <p className="mt-2 text-muted">If you&apos;re building it or you just love it, add it.</p>
        <Link href="/submit" className="btn mt-5">Add yours</Link>
      </section>

      <CollectionLinks current={collection.slug} />
    </div>
  );
}

function CollectionLinks({ current }: { current: string }) {
  return (
    <nav aria-label="More from Ghana" className="mt-12">
      <h2 className="font-display text-2xl font-semibold">More from Ghana</h2>
      <ul className="mt-4 flex flex-wrap gap-2">
        {TOPICS.filter((c) => c.slug !== current).map((c) => (
          <li key={c.slug}>
            <Link href={`/${c.slug}`} className="btn-quiet !py-2 text-sm">{c.title}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
