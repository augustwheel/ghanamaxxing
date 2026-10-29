"use client";

import Link from "next/link";
import { useActionState } from "react";
import { submitSuggestion, type SuggestState } from "./actions";

const input =
  "mt-2 w-full rounded-2xl border-[1.5px] border-line bg-coal px-4 py-3 text-chalk placeholder:text-muted/70 focus:border-muted focus:outline-none";

export function SuggestForm({ launchId, slug, name }: { launchId: string; slug: string; name: string }) {
  const [state, action, pending] = useActionState<SuggestState, FormData>(submitSuggestion, {});

  if (state.done) {
    return (
      <div className="mt-8 rounded-[2rem] bg-coal p-7">
        <p className="font-display text-2xl font-semibold">Thanks, that helps</p>
        <p className="mt-2 text-muted">We&apos;ll check it and update {name}.</p>
        <Link href={`/launch/${slug}`} className="btn mt-6">
          Back to {name}
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="mt-8 space-y-6">
      <input type="hidden" name="launchId" value={launchId} />
      {/* Honeypot: hidden from people, irresistible to bots. */}
      <div aria-hidden className="absolute -left-[9999px]">
        <label>
          Website <input name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <label className="block">
        <span className="font-display text-lg font-semibold">What should we fix or add?</span>
        <textarea
          key={`v-${state.value}`}
          defaultValue={state.value}
          name="value"
          required
          minLength={2}
          maxLength={1000}
          rows={4}
          placeholder="Wrong link, who built it, it's shut down, anything"
          className={input}
        />
      </label>

      <label className="block">
        <span className="font-display text-lg font-semibold">Your email</span>
        <span className="ml-2 text-muted">optional</span>
        <input key={`e-${state.email}`} defaultValue={state.email} name="email" type="email" maxLength={200} className={input} />
      </label>

      {state.error && (
        <p role="alert" className="rounded-2xl bg-red/15 px-4 py-3 text-red">
          {state.error}
        </p>
      )}

      <button className="btn !px-6 !py-3 text-lg" disabled={pending}>
        {pending ? "Sending…" : "Send"}
      </button>
    </form>
  );
}
