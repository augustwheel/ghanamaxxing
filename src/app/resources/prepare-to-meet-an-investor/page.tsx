import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: "How to prepare to meet an investor",
  description: "A practical checklist for makers in Ghana: explain the problem, show what you've learned, prepare your numbers and make the most of an investor meeting.",
  alternates: { canonical: "/resources/prepare-to-meet-an-investor" },
};

const sections = [
  {
    title: "Know why you're meeting",
    body: "Are you looking for funding now, feedback on your idea, an introduction, or simply a first relationship? Say so early. If you are raising money, be ready to explain how much you hope to raise and what it would help you do next.",
  },
  {
    title: "Explain the problem in plain words",
    body: "Describe who has the problem, how they deal with it today, and why your approach helps. Show the app if you can. A short, working demonstration often explains more than a long slide deck.",
  },
  {
    title: "Bring evidence of what you've learned",
    body: "You don't need a dramatic growth chart. Share what you can verify: conversations with users, repeat use, paying customers, pilots, or lessons from a first release. Be clear about what is still an assumption.",
  },
  {
    title: "Get comfortable with your numbers",
    body: "Know your revenue, costs, cash needs and the main measure you use to tell whether the product is working. Bring the period and source for each figure. If you don't know an answer, say you'll check and follow up.",
  },
  {
    title: "Learn about the person across the table",
    body: "Read the investor's own website before you meet. Look at the sectors, stages and places they say they support. Ask how they work with founders, what their process looks like, and whether your company fits their focus.",
  },
  {
    title: "Leave with a next step",
    body: "Agree on what happens after the conversation. Send a short note with any promised information, a link to the product, and a clear way to reach you. Keep a record of the questions you heard; they can help improve your next explanation.",
  },
];

export default function InvestorMeetingGuidePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 sm:pt-16">
      <JsonLd data={{
        "@type": "Article",
        headline: "How to prepare to meet an investor",
        description: metadata.description,
        url: `${SITE.url}/resources/prepare-to-meet-an-investor`,
        datePublished: "2026-11-16",
        dateModified: "2026-11-16",
        author: { "@type": "Organization", name: "Ghanamaxxing", url: SITE.url },
      }} />
      <article className="max-w-3xl">
        <Link href="/resources/guides" className="font-display text-sm font-semibold text-muted underline decoration-line underline-offset-4 hover:text-chalk">← Guides</Link>
        <p className="mt-10 font-display text-sm font-semibold text-muted">Guide for makers · 4 minute read</p>
        <h1 className="mt-3 font-display text-4xl font-bold leading-tight tracking-tight sm:text-6xl">How to prepare to meet an investor</h1>
        <p className="mt-6 text-lg leading-relaxed text-chalk/90 sm:text-xl">
          You have a chance to talk with someone who might back what you&apos;re building. Here&apos;s a simple way to get ready and make the conversation useful, wherever your app or startup is today.
        </p>
        <p className="mt-4 text-sm text-muted">Published 16 November 2026</p>

        <div className="mt-10 rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <h2 className="font-display text-xl font-semibold">A quick checklist</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-chalk/90 marker:text-muted">
            <li>A short explanation of the problem and who has it</li>
            <li>A working demo or a clear picture of the product</li>
            <li>What users or customers have told you</li>
            <li>Your key numbers, with their dates and sources</li>
            <li>What you hope to get from this particular meeting</li>
          </ul>
        </div>

        <div className="mt-12 space-y-10">
          {sections.map((section, index) => (
            <section key={section.title} className="border-t border-line pt-7">
              <p className="font-display text-sm font-semibold text-muted">{String(index + 1).padStart(2, "0")}</p>
              <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">{section.title}</h2>
              <p className="mt-4 text-lg leading-relaxed text-chalk/85">{section.body}</p>
            </section>
          ))}
        </div>

        <section className="mt-12 border-t border-line pt-7">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Questions you can ask</h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-lg leading-relaxed text-chalk/85 marker:text-muted">
            <li>What kinds of companies do you usually work with?</li>
            <li>What would you need to learn before considering an investment?</li>
            <li>How do you support founders after investing?</li>
            <li>What is a sensible next step from here?</li>
          </ul>
        </section>

        <div className="mt-14 rounded-2xl border border-line bg-coal p-6">
          <h2 className="font-display text-xl font-semibold">Looking for people and programmes?</h2>
          <p className="mt-2 text-muted">Explore communities and support organisations with a presence in Ghana.</p>
          <Link href="/resources/directory" className="mt-5 inline-block font-display font-semibold underline decoration-line underline-offset-4 hover:decoration-chalk">Browse the directory <span aria-hidden="true">→</span></Link>
        </div>
      </article>
    </div>
  );
}
