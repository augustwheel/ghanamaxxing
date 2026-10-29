import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 pt-16 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/hero/characters/vr.webp" alt="A boy in a VR headset, lost" width={220} height={220} className="h-56 w-56 object-contain" />
      <h1 className="mt-2 font-display text-5xl font-bold tracking-tight">Chale, wrong turn</h1>
      <p className="mt-3 text-lg text-muted">This page doesn&apos;t exist, or the launch was taken down.</p>
      <Link href="/launches" className="btn mt-8">
        Back to launches
      </Link>
    </div>
  );
}
