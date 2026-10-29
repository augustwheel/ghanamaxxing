import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 pt-24 text-center">
      <h1 className="font-display text-6xl tracking-wide">CHALE, 404</h1>
      <p className="mt-3 text-muted">We couldn&apos;t find that page. It may have been removed.</p>
      <Link href="/launches" className="mt-8 inline-block rounded-full bg-cream px-5 py-2.5 font-medium text-ink hover:bg-gold">
        See all launches
      </Link>
    </div>
  );
}
