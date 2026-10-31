"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestClaim, type ClaimState } from "./actions";

const input =
  "mt-2 w-full rounded-2xl border-[1.5px] border-line bg-coal px-4 py-3 text-chalk placeholder:text-muted/70 focus:border-muted focus:outline-none";

export function ClaimForm({ launch }: { launch: string }) {
  const [state, action, pending] = useActionState<ClaimState, FormData>(requestClaim, {});
  const v = state.values ?? {};

  if (state.done) {
    return (
      <div className="mt-8 rounded-[2rem] bg-coal p-7">
        <p className="font-display text-2xl font-semibold">Got it, ayekoo!</p>
        <p className="mt-2 text-muted">We&apos;ll take a look and reply by email, usually within a couple of days.</p>
        <Link href="/launches" className="btn mt-6">
          Back to Explore
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="mt-8 space-y-6">
      <div aria-hidden className="absolute -left-[9999px]">
        <label>
          Website <input name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      <label className="block">
        <span className="font-display text-lg font-semibold">Which listing?</span>
        <input key={`l-${v.launch}`} name="launch" required defaultValue={v.launch ?? launch} placeholder="Name or link" className={input} />
      </label>
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className="font-display text-lg font-semibold">Your name</span>
          <input key={`n-${v.name}`} name="name" required defaultValue={v.name} className={input} />
        </label>
        <label className="block">
          <span className="font-display text-lg font-semibold">Your email</span>
          <input key={`e-${v.email}`} name="email" type="email" required defaultValue={v.email} placeholder="A work email helps" className={input} />
        </label>
      </div>
      <label className="block">
        <span className="font-display text-lg font-semibold">How are you connected to it?</span>
        <textarea key={`c-${v.connection}`} name="connection" required rows={4} defaultValue={v.connection} placeholder="For example: I'm the founder. Here's my LinkedIn" className={input} />
      </label>
      {state.error && (
        <p role="alert" className="rounded-2xl bg-red/15 px-4 py-3 text-red">
          {state.error}
        </p>
      )}
      <button className="btn !px-6 !py-3 text-lg" disabled={pending}>
        {pending ? "Sending…" : "Send request"}
      </button>
    </form>
  );
}
