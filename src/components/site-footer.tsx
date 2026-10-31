import Link from "next/link";
import { FooterArch } from "@/components/footer-arch";
import { NewsletterForm } from "@/components/newsletter-form";
import { TOPICS } from "@/config/collections";
import { SITE } from "@/config/site";

const external = "underline decoration-line underline-offset-4";
const heading = "font-display text-lg font-semibold gm-footer-ink";
const list = "mt-4 space-y-3 text-[15px]";

export function SiteFooter() {
  return (
    <footer className="gm-footer mt-24">
      <section id="newsletter" aria-labelledby="newsletter-heading" className="mx-auto grid max-w-6xl scroll-mt-16 items-end gap-8 border-b border-line/70 px-4 py-14 md:grid-cols-2 md:gap-12 md:py-16">
        <div>
          <p className="font-display text-sm font-semibold text-muted">Stay in the loop</p>
          <h2 id="newsletter-heading" className="mt-3 max-w-lg font-display text-3xl font-semibold leading-tight tracking-tight text-chalk sm:text-4xl">
            Good things from Ghana, in your inbox.
          </h2>
          <p className="mt-3 max-w-lg text-muted">
            Join the list for occasional notes about spotlighted apps, new apps and what&apos;s happening with Ghanamaxxing.
          </p>
        </div>
        <NewsletterForm />
      </section>
      <FooterArch
        links={
          <>
            <p className="font-display text-3xl font-semibold tracking-tight gm-footer-ink">ghanamaxxing</p>
            <p className="mt-3 max-w-xs text-lg text-pretty">Made for the people building Ghana.</p>
            <div className="mt-10 grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-6">
              <nav aria-label="Browse by topic">
                <p className={heading}>Explore</p>
                <ul className={list}>
                  {TOPICS.map((c) => (
                    <li key={c.slug}>
                      <Link href={`/${c.slug}`}>{c.title}</Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <nav aria-label="Footer">
                <p className={heading}>The site</p>
                <ul className={list}>
                  {[...SITE.nav.filter((item) => item.href !== "/launches"), ...SITE.footer].map((item) => (
                    <li key={item.href}>
                      <Link href={item.href}>{item.label}</Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </>
        }
        credits={
          <div className="text-xs leading-relaxed">
            <p>
              A project of{" "}
              <a href="https://www.augustengine.com" target="_blank" rel="noopener" className={external}>August Engine</a>, founded by{" "}
              <a href="https://www.linkedin.com/in/augustineosei/" target="_blank" rel="noopener" className={external}>Augustine Osei</a>.
            </p>
            <p>
              The Independence Arch, drawn in ASCII after a{" "}
              <a href="https://commons.wikimedia.org/wiki/File:Independence_Arch.jpg" target="_blank" rel="noopener" className={external}>photograph by Stig Nygaard</a>{" "}
              (<a href="https://creativecommons.org/licenses/by/2.0/" target="_blank" rel="noopener" className={external}>CC BY 2.0</a>).
            </p>
          </div>
        }
      />
    </footer>
  );
}
