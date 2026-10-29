import Link from "next/link";
import { SITE } from "@/config/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-ink/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4">
        <Link href="/" aria-label="Ghanamaxxing home" className="flex shrink-0 items-center gap-2 font-display text-lg font-semibold tracking-tight">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/hero/letters/G.webp" alt="" width={22} height={25} className="h-[25px] w-auto" />
          <span className="hidden min-[400px]:inline">ghanamaxxing</span>
        </Link>
        <nav aria-label="Main" className="ml-auto flex items-center font-display text-[14px] font-medium whitespace-nowrap sm:gap-1 sm:text-[15px]">
          {SITE.nav.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-full px-2 py-1.5 text-muted transition-colors hover:text-chalk sm:px-3">
              {item.label}
            </Link>
          ))}
          <Link href="/signin" className="btn ml-1 !px-3 !py-1.5 text-[14px] sm:!px-4 sm:text-[15px]">
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}
