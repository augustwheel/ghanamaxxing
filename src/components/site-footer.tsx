import Link from "next/link";
import { COLLECTIONS } from "@/config/collections";
import { SITE } from "@/config/site";

const external = "underline decoration-line underline-offset-4 hover:text-chalk hover:decoration-chalk";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-coal">
      <nav aria-label="Browse by topic" className="mx-auto max-w-6xl px-4 pt-10 text-sm text-muted">
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {COLLECTIONS.map((c) => (
            <li key={c.slug}>
              <Link href={`/${c.slug}`} className="hover:text-chalk">{c.title}</Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 text-sm text-muted sm:flex-row sm:items-end">
        <div>
          <p className="font-display text-base text-chalk">Made for the people building Ghana.</p>
          <p className="mt-2 max-w-md">
            A project of{" "}
            <a href="https://www.augustengine.com" target="_blank" rel="noopener" className={external}>
              August Engine
            </a>
            , founded by{" "}
            <a href="https://www.linkedin.com/in/augustineosei/" target="_blank" rel="noopener" className={external}>
              Augustine Osei
            </a>
            .
          </p>
        </div>
        <nav aria-label="Footer" className="flex gap-5 sm:ml-auto">
          {SITE.footer.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-chalk">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
