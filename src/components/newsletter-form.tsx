"use client";

import Link from "next/link";
import { useActionState } from "react";
import { subscribeNewsletter, type NewsletterState } from "@/app/newsletter/actions";

export function NewsletterForm() {
  const [state, action, pending] = useActionState<NewsletterState, FormData>(subscribeNewsletter, {});

  if (state.done) {
    return (
      <div role="status" className="rounded-[1.5rem] border border-line bg-ink px-5 py-6">
        <p className="font-display text-xl font-semibold text-chalk">You&apos;re on the list</p>
        <p className="mt-1 text-sm text-muted">We&apos;ve saved your email. We&apos;ll be in touch when there&apos;s something to share.</p>
      </div>
    );
  }

  return (
    <form action={action} className="w-full max-w-lg">
      <div aria-hidden className="absolute -left-[9999px]">
        <label>Website <input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <label htmlFor="newsletter-email" className="mb-2 block font-display text-sm font-semibold text-chalk">Your email</label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="newsletter-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={200}
          defaultValue={state.email}
          disabled={pending}
          placeholder="you@example.com"
          className="min-w-0 flex-1 rounded-full border-[1.5px] border-line bg-ink px-5 py-3 text-chalk placeholder:text-muted/70 focus:border-muted focus:outline-none disabled:opacity-60"
        />
        <button type="submit" className="btn shrink-0 !py-3" disabled={pending}>
          {pending ? "Saving…" : "Join the list"}
        </button>
      </div>
      <p className="mt-3 text-sm text-muted">Only Ghanamaxxing updates. No set schedule. You can <Link href="/contact" className="underline underline-offset-4 hover:text-chalk">ask us to remove your email</Link> anytime.</p>
      {state.error && <p role="alert" className="mt-3 text-sm text-red">{state.error}</p>}
    </form>
  );
}
