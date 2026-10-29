import Link from "next/link";
import { SITE } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center">
        <p>
          <span className="font-display tracking-wide text-cream">GHANAMAXXING</span> · Built for Ghana&apos;s builders.
        </p>
        <nav aria-label="Footer" className="flex gap-4 sm:ml-auto">
          {SITE.footer.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-cream">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
