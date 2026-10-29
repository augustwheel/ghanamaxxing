import Link from "next/link";
import { LaunchCard } from "@/components/launch-card";
import { getApprovedLaunches } from "@/lib/launches";

export const revalidate = 60;

// Temporary landing page. The giant-word hero, rankings preview, spotlight and map arrive in later phases.
export default async function HomePage() {
  const latest = await getApprovedLaunches({ limit: 5 });
  return (
    <div className="mx-auto max-w-3xl px-4 pt-16">
      <h1 className="font-display text-[18vw] leading-[0.85] tracking-tight sm:text-[9rem]">
        GHANA<span className="block text-gold">MAXXING</span>
      </h1>
      <p className="mt-6 max-w-xl text-lg text-muted">
        The launch board and live map of what Ghanaians are building.
      </p>
      <h2 className="mt-12 font-display text-2xl tracking-wide">LATEST LAUNCHES</h2>
      <ol className="mt-3 flex flex-col gap-1">
        {latest.map((launch) => (
          <LaunchCard key={launch.id} launch={launch} />
        ))}
      </ol>
      <Link href="/launches" className="mt-4 inline-block text-gold hover:underline">
        See all launches →
      </Link>
    </div>
  );
}
