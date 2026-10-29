import type { Metadata } from "next";
import { LaunchCard } from "@/components/launch-card";
import { TypeFilter } from "@/components/type-filter";
import { getLaunchType } from "@/config/launch-types";
import { getApprovedLaunches, parseTypeParam } from "@/lib/launches";

export const revalidate = 60;

type Props = { searchParams: Promise<{ type?: string | string[] }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const type = parseTypeParam((await searchParams).type);
  const label = type ? `${getLaunchType(type).label} launches` : "Launches";
  return {
    title: label,
    description: `${label} from Ghanaian builders: startups, apps, side projects, AI tools and games.`,
    alternates: { canonical: type ? `/launches?type=${type}` : "/launches" },
  };
}

export default async function LaunchesPage({ searchParams }: Props) {
  const type = parseTypeParam((await searchParams).type);
  const launches = await getApprovedLaunches({ type });

  return (
    <div className="mx-auto max-w-3xl px-4 pt-10">
      <h1 className="font-display text-5xl tracking-wide sm:text-6xl">LAUNCHES</h1>
      <p className="mt-2 text-muted">Newest first. Rankings and voting arrive in the next phase.</p>
      <div className="mt-6">
        <TypeFilter active={type} basePath="/launches" />
      </div>
      {launches.length ? (
        <ol className="mt-6 flex flex-col gap-1">
          {launches.map((launch) => (
            <LaunchCard key={launch.id} launch={launch} />
          ))}
        </ol>
      ) : (
        <p className="mt-16 text-center text-muted">Nothing here yet. Be the first to launch.</p>
      )}
    </div>
  );
}
