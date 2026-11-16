import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: "Getting ready to seek investment in Ghana",
  description: "Building an app or startup in Ghana and thinking about investors? Start with customers, choose the right kind of support, organise your numbers and check the rules that apply to your work.",
  alternates: { canonical: "/resources/getting-ready-for-investment-in-ghana" },
};

const link = "underline decoration-line underline-offset-4 hover:decoration-chalk";

export default function GettingReadyForInvestmentPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 sm:pt-16">
      <JsonLd data={{
        "@type": "Article",
        headline: "Getting ready to seek investment in Ghana",
        description: metadata.description,
        url: `${SITE.url}/resources/getting-ready-for-investment-in-ghana`,
        datePublished: "2026-11-16",
        dateModified: "2026-11-16",
        author: { "@type": "Organization", name: "Ghanamaxxing", url: SITE.url },
      }} />
      <article className="max-w-3xl">
        <Link href="/resources/guides" className="font-display text-sm font-semibold text-muted underline decoration-line underline-offset-4 hover:text-chalk">← Guides</Link>
        <p className="mt-10 font-display text-sm font-semibold text-muted">Guide for makers · 5 minute read</p>
        <h1 className="mt-3 font-display text-4xl font-bold leading-tight tracking-tight sm:text-6xl">Getting ready to seek investment in Ghana</h1>
        <p className="mt-6 text-lg leading-relaxed text-chalk/90 sm:text-xl">
          You have an app or startup you believe in, and money could help it grow. Before you start looking for an investor, get clear on what you&apos;ve learned, what you need next and whether investment is the right kind of help.
        </p>
        <p className="mt-4 text-sm text-muted">Published 16 November 2026</p>

        <div className="mt-10 rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <h2 className="font-display text-xl font-semibold">Start with these three questions</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-chalk/90 marker:text-muted">
            <li>Who in Ghana is already using or paying for this?</li>
            <li>What would new money make possible in the next 12 to 18 months?</li>
            <li>Is an investor the best way to get that money and support?</li>
          </ol>
        </div>

        <div className="mt-12 space-y-10 text-lg leading-relaxed text-chalk/85">
          <section className="border-t border-line pt-7">
            <p className="font-display text-sm font-semibold text-muted">01</p>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-chalk sm:text-3xl">Show the problem is real</h2>
            <p className="mt-4">Talk to the people who would use your product. Watch what they do today and what they are willing to pay for. If you have launched, track repeat use, paying customers and the reasons people leave. Early evidence from a small group can be more useful than a big estimate of everyone who might one day need your app.</p>
            <p className="mt-4">Be specific about where the evidence comes from. A pilot in Accra says something useful; it does not automatically tell you what will happen in Kumasi or Tamale. If customers pay in cedis or through mobile money, show the numbers in the way the business actually operates.</p>
          </section>

          <section className="border-t border-line pt-7">
            <p className="font-display text-sm font-semibold text-muted">02</p>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-chalk sm:text-3xl">Work out what the money is for</h2>
            <p className="mt-4">Write down the next milestone: a reliable first release, a pilot with paying customers, a stronger team or expansion into another market. Estimate what it will cost and how you would know you reached it. That gives you a reason for the amount you seek.</p>
            <p className="mt-4">Consider other routes too. Customer revenue, a grant, an accelerator or a commercial partnership may fit your stage better. Equity investment means sharing ownership and brings an ongoing relationship with an investor. The right choice depends on the business you want to build.</p>
          </section>

          <section className="border-t border-line pt-7">
            <p className="font-display text-sm font-semibold text-muted">03</p>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-chalk sm:text-3xl">Put your records in order</h2>
            <p className="mt-4">Keep a clear record of who owns the business, what the product earns and spends, and any agreements with co-founders, staff or customers. Be able to explain how your figures were calculated. It is much easier to answer questions when the basic documents are in one place.</p>
            <p className="mt-4">For Ghanaian business registration and filing information, use the <a href="https://www.orc.gov.gh/" target="_blank" rel="noopener noreferrer" className={link}>Office of the Registrar of Companies</a>. If your app handles payments or other regulated financial services, check the <a href="https://www.bog.gov.gh/fintech-innovation/" target="_blank" rel="noopener noreferrer" className={link}>Bank of Ghana&apos;s FinTech and Innovation guidance</a> early. The requirements depend on what your company actually does, so get qualified advice where you need it.</p>
          </section>

          <section className="border-t border-line pt-7">
            <p className="font-display text-sm font-semibold text-muted">04</p>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-chalk sm:text-3xl">Find people who fit your stage</h2>
            <p className="mt-4">Look at an investor&apos;s own site before reaching out. Do they back companies at your stage, in your sector and in Ghana? Have they supported businesses with a similar path? A short, relevant introduction will usually make more sense than sending the same pitch to everyone.</p>
            <p className="mt-4">Programmes can also be a way to learn and meet people. For example, <a href="https://meltwater.org/" target="_blank" rel="noopener noreferrer" className={link}>MEST</a> is based in Accra and runs entrepreneurship programmes and early stage support. Check each programme&apos;s own page for its current focus and dates.</p>
          </section>

          <section className="border-t border-line pt-7">
            <p className="font-display text-sm font-semibold text-muted">05</p>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-chalk sm:text-3xl">Prepare a clear first introduction</h2>
            <p className="mt-4">You should be able to explain the customer, the problem, your product, what you have learned and what you are asking for in a few sentences. Keep a short deck or product demo ready if someone wants more. Say what is working and what still needs proving.</p>
            <p className="mt-4">When someone agrees to meet, shift from finding investment to having a useful conversation. Our <Link href="/resources/prepare-to-meet-an-investor" className={link}>investor meeting guide</Link> walks through that next step.</p>
          </section>
        </div>

        <div className="mt-14 rounded-2xl border border-line bg-coal p-6">
          <h2 className="font-display text-xl font-semibold">Ready to meet people?</h2>
          <p className="mt-2 text-muted">Find Ghana based communities and programmes in the directory.</p>
          <Link href="/resources/directory" className="mt-5 inline-block font-display font-semibold underline decoration-line underline-offset-4 hover:decoration-chalk">Find your people <span aria-hidden="true">→</span></Link>
        </div>
      </article>
    </div>
  );
}
