import Link from "next/link";
import { SiteSearch } from "@/components/app-search";
import { SITE } from "@/config/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-ink/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-2 sm:h-14 sm:flex-nowrap sm:py-0">
        <Link href="/" aria-label="Ghanamaxxing home" className="flex shrink-0 items-center gap-2 font-display text-lg font-semibold tracking-tight">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/hero/letters/G-satin-gold.webp" alt="" width={22} height={25} className="h-[25px] w-auto" />
          <span className="hidden lg:inline">ghanamaxxing</span>
        </Link>
        <SiteSearch />
        <nav aria-label="Main" className="order-3 flex w-full items-center justify-between font-display text-[14px] font-medium whitespace-nowrap sm:order-none sm:ml-auto sm:w-auto sm:gap-1 sm:text-[15px]">
          {SITE.nav.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-full px-1.5 py-1.5 text-muted transition-colors hover:text-chalk sm:px-3">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
