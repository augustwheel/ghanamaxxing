import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LaunchLogo } from "@/components/launch-logo";
import { SourceLabel } from "@/components/source-label";
import { StarIcon } from "@/components/star-icon";
import { getLaunchType } from "@/config/launch-types";
import { plural } from "@/lib/format";
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
    <article className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-35"
        style={{ background: `radial-gradient(50% 60% at 50% 0%, ${type.color}, transparent 70%)` }}
      />
      <div className="relative mx-auto max-w-3xl px-4 pt-10 sm:pt-14">
        <Link href={`/launches?type=${type.value}`} className="font-display font-semibold text-muted hover:text-chalk">
          More {type.label} launches
        </Link>

        <header className="mt-8 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <LaunchLogo name={launch.name} logoUrl={launch.logo_url} type={launch.type} size={112} priority />
          <div className="min-w-0">
            <h1 className="font-display text-5xl leading-[0.95] font-bold tracking-tight break-words sm:text-6xl">{launch.name}</h1>
            <p className="mt-3 text-xl text-chalk/85 text-pretty">{launch.tagline}</p>
            <p className="mt-3 text-sm">
              <span style={{ color: type.color }}>{type.label}</span>
              {launch.city && <span className="text-muted"> in {launch.city}</span>}
            </p>
            <p className="mt-1 text-sm">
              <SourceLabel source={launch.source} claimed={Boolean(launch.claimed_by)} />
            </p>
          </div>
        </header>

        <div className="mt-8 flex flex-wrap gap-3">
          <a href={launch.url} target="_blank" rel="noopener" className="btn !px-6 !py-3 text-lg">
            Visit {launch.name}
          </a>
          <span className="btn-quiet !px-5 !py-3 text-lg" title="Starring opens soon">
            <StarIcon className="h-4 w-4" />
            {plural(launch.star_count, "star")}
          </span>
        </div>

        {launch.image_url && (
          <div className="relative mt-10 aspect-video overflow-hidden rounded-[2rem] bg-coal shadow-2xl">
            <Image
              src={launch.image_url}
              alt={`Screenshot of ${launch.name}`}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        )}

        {launch.description && (
          <p className="mt-10 max-w-[65ch] text-lg leading-relaxed whitespace-pre-line text-chalk/90">{launch.description}</p>
        )}

        {(launch.maker_name || socials.length > 0) && (
          <p className="mt-8 text-muted">
            {launch.maker_name && (
              <>
                Made by <span className="font-display font-semibold text-chalk">{launch.maker_name}</span>
              </>
            )}
            {socials.map(([key, url]) => (
              <a key={key} href={url} target="_blank" rel="noopener nofollow" className="ml-3 underline decoration-line underline-offset-4 hover:text-chalk hover:decoration-chalk">
                {SOCIAL_LABELS[key] ?? key}
              </a>
            ))}
          </p>
        )}

        <p className="mt-10 text-sm text-muted">
          Something wrong or missing?{" "}
          <Link href={`/launch/${launch.slug}/suggest`} className="underline decoration-line underline-offset-4 hover:text-chalk hover:decoration-chalk">
            Suggest an edit
          </Link>
        </p>
      </div>
    </article>
  );
}
