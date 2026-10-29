import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SuggestForm } from "./suggest-form";
import { LaunchLogo } from "@/components/launch-logo";
import { getLaunchBySlug } from "@/lib/launches";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const launch = await getLaunchBySlug((await params).slug);
  return { title: launch ? `Suggest an edit to ${launch.name}` : "Suggest an edit", robots: { index: false } };
}

export default async function SuggestPage({ params }: Props) {
  const { slug } = await params;
  const launch = await getLaunchBySlug(slug);
  if (!launch) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 pt-10 sm:pt-14">
      <Link href={`/launch/${launch.slug}`} className="flex items-center gap-3 font-display font-semibold text-muted hover:text-chalk">
        <LaunchLogo name={launch.name} logoUrl={launch.logo_url} type={launch.type} size={32} />
        {launch.name}
      </Link>
      <h1 className="mt-6 font-display text-4xl font-bold tracking-tight sm:text-5xl">Suggest an edit</h1>
      <p className="mt-3 text-lg text-muted">
        Spotted something wrong or out of date on {launch.name}? Tell us and we&apos;ll fix it. If it&apos;s your product,
        you&apos;ll soon be able to claim it and edit it yourself.
      </p>
      <SuggestForm launchId={launch.id} slug={launch.slug} name={launch.name} />
    </div>
  );
}
