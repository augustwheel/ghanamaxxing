import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LaunchLogo } from "@/components/launch-logo";
import { SourceLabel } from "@/components/source-label";
import { TypeChip } from "@/components/type-chip";
import { getLaunchType } from "@/config/launch-types";
import { formatDate, plural } from "@/lib/format";
import { getLaunchBySlug } from "@/lib/launches";
import type { MakerSocials } from "@/lib/types";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const launch = await getLaunchBySlug((await params).slug);
  if (!launch) return { title: "Launch not found" };
  const title = `${launch.name}: ${launch.tagline}`;
  const images = launch.image_url ? [launch.image_url] : launch.logo_url ? [launch.logo_url] : undefined;
  return {
    title,
    description: launch.description ?? launch.tagline,
    alternates: { canonical: `/launch/${launch.slug}` },
    openGraph: { title, description: launch.tagline, images },
  };
}

const SOCIAL_LABELS: Record<keyof MakerSocials, string> = {
  x: "X",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  github: "GitHub",
  tiktok: "TikTok",
  website: "Website",
};

export default async function LaunchPage({ params }: Props) {
  const launch = await getLaunchBySlug((await params).slug);
  if (!launch) notFound();

  const type = getLaunchType(launch.type);
  const socials = Object.entries(launch.maker_socials ?? {}).filter(([, url]) => url) as [keyof MakerSocials, string][];

  return (
    <article className="mx-auto max-w-3xl px-4 pt-10">
      <Link href={`/launches?type=${type.value}`} className="text-sm text-muted hover:text-cream">
        ← {type.label} launches
      </Link>

      <header className="mt-6 flex items-start gap-4 sm:gap-6">
        <LaunchLogo name={launch.name} logoUrl={launch.logo_url} type={launch.type} size={80} priority />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-4xl leading-none tracking-wide break-words sm:text-5xl">
            {launch.name.toUpperCase()}
          </h1>
          <p className="mt-2 text-lg text-cream/90">{launch.tagline}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <TypeChip type={launch.type} />
            <SourceLabel source={launch.source} claimed={Boolean(launch.claimed_by)} />
          </div>
        </div>
      </header>

      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href={launch.url}
          target="_blank"
          rel="noopener"
          className="rounded-full bg-gold px-5 py-2.5 font-semibold text-ink transition-colors hover:bg-cream"
        >
          Visit {launch.name} ↗
        </a>
        <span className="rounded-full border border-line px-5 py-2.5 text-cream">
          ▲ {plural(launch.vote_count, "vote")}
        </span>
      </div>

      {launch.image_url && (
        <div className="relative mt-8 aspect-video overflow-hidden rounded-2xl border border-line bg-surface">
          <Image
            src={launch.image_url}
            alt={`Screenshot of ${launch.name}`}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>
      )}

      {launch.description && <p className="mt-8 text-lg leading-relaxed whitespace-pre-line">{launch.description}</p>}

      <dl className="mt-10 grid grid-cols-1 gap-4 rounded-2xl border border-line bg-surface p-5 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-muted">Made by</dt>
          <dd className="mt-1 text-cream">{launch.maker_name ?? "—"}</dd>
          {socials.length > 0 && (
            <dd className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
              {socials.map(([key, url]) => (
                <a key={key} href={url} target="_blank" rel="noopener nofollow" className="text-gold hover:underline">
                  {SOCIAL_LABELS[key] ?? key}
                </a>
              ))}
            </dd>
          )}
        </div>
        <div>
          <dt className="text-muted">Based in</dt>
          <dd className="mt-1 text-cream">{launch.city ?? "Ghana"}</dd>
        </div>
        <div>
          <dt className="text-muted">Launched</dt>
          <dd className="mt-1 text-cream">{formatDate(launch.launched_at) ?? "—"}</dd>
        </div>
      </dl>
    </article>
  );
}
