import Link from "next/link";
import { SITE } from "@/config/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-ink/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4">
        <Link href="/" className="shrink-0 font-display text-lg tracking-wide text-cream sm:text-xl">
          GHANA<span className="text-gold">MAXXING</span>
        </Link>
        <nav aria-label="Main" className="ml-auto flex items-center text-sm sm:gap-1">
          {SITE.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-2 py-1.5 text-muted sm:px-3 transition-colors hover:bg-surface-2 hover:text-cream"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/signin"
            aria-label="Sign in"
            className="ml-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream font-medium text-ink transition-colors hover:bg-gold sm:h-auto sm:w-auto sm:px-3 sm:py-1.5"
          >
            <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 fill-current sm:hidden">
              <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-4.4 0-8 2.2-8 5v3h16v-3c0-2.8-3.6-5-8-5z" />
            </svg>
            <span className="hidden sm:inline">Sign in</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
