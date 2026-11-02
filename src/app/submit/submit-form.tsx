"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { submitLaunch, type SubmitState } from "./actions";
import { LAUNCH_TYPES } from "@/config/launch-types";

const input =
  "mt-2 w-full rounded-2xl border-[1.5px] border-line bg-coal px-4 py-3 text-chalk placeholder:text-muted/70 focus:border-muted focus:outline-none";
const label = "font-display text-lg font-semibold";
const hint = "ml-2 text-muted";

export function SubmitForm() {
  const [state, action, pending] = useActionState<SubmitState, FormData>(submitLaunch, {});
  const v = state.values ?? {};
  const [madeIt, setMadeIt] = useState(v.made_it === "on");
  const [updates, setUpdates] = useState(v.ayekoo_updates === "on");
  // Inputs are keyed on the echoed value so they refill after an error.
  const k = (name: string) => `${name}-${v[name] ?? ""}`;

  if (state.done) {
    return (
      <div className="mt-8 rounded-[2rem] bg-coal p-7">
        <p className="font-display text-2xl font-semibold">Got it, thank you</p>
        <p className="mt-2 text-muted">We take a quick look before it goes live, usually within a couple of days.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/launches" className="btn">
            Explore
          </Link>
          <button type="button" onClick={() => window.location.reload()} className="btn-quiet">
            Add another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="mt-8 space-y-6">
      {/* Honeypot: hidden from people, irresistible to bots. */}
      <div aria-hidden className="absolute -left-[9999px]">
        <label>
          Nickname <input name="nickname" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <label className="block">
        <span className={label}>Link</span>
        <input key={k("url")} name="url" required inputMode="url" placeholder="https://" defaultValue={v.url} className={input} />
      </label>
      <label className="block">
        <span className={label}>Name</span>
        <input key={k("name")} name="name" required maxLength={80} defaultValue={v.name} className={input} />
      </label>
      <div>
        <label className="block">
          <span className={label}>What it does</span>
          <span className={hint}>optional, one line</span>
          <input key={k("tagline")} name="tagline" maxLength={100} placeholder="e.g. Split bills with mobile money in one tap" defaultValue={v.tagline} className={input} />
        </label>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          A short line is enough, but you can leave this blank. During review, we&apos;ll look for public details we can verify to make the app&apos;s page more useful and easier to find.
        </p>
      </div>

      <fieldset>
        <legend className={label}>Category</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {LAUNCH_TYPES.map((t) => (
            <label key={t.value} className="cursor-pointer">
              <input type="radio" name="type" value={t.value} required defaultChecked={v.type === t.value} className="peer sr-only" />
              <span
                className="inline-block rounded-full border-[1.5px] border-line px-4 py-2 font-display text-[15px] font-semibold transition-colors peer-checked:border-current peer-checked:bg-surface-2 peer-focus-visible:outline-2 peer-focus-visible:outline-chalk"
                style={{ color: t.color }}
              >
                {t.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className={label}>Where</span>
          <span className={hint}>optional</span>
          <input key={k("city")} name="city" maxLength={80} placeholder="e.g. Osu, Accra" defaultValue={v.city} className={input} />
        </label>
        <label className="block">
          <span className={label}>Who built it</span>
          <span className={hint}>optional</span>
          <input key={k("maker_name")} name="maker_name" maxLength={80} defaultValue={v.maker_name} className={input} />
        </label>
      </div>

      <label className="block">
        <span className={label}>Your email</span>
        <span className={hint}>{updates ? "needed for Ayekoo updates" : "optional, so we can reach you about this app"}</span>
        <input key={k("email")} name="email" type="email" required={updates} maxLength={200} defaultValue={v.email} className={input} />
      </label>

      <label className="flex cursor-pointer items-center gap-3">
        <input type="checkbox" name="made_it" checked={madeIt} onChange={(event) => {
          setMadeIt(event.target.checked);
          if (!event.target.checked) setUpdates(false);
        }} className="h-5 w-5 accent-chalk" />
        <span className="font-display text-lg font-semibold">I built this</span>
      </label>
      {madeIt && (
        <label className="ml-8 flex cursor-pointer items-center gap-3 text-sm text-chalk">
          <input
            type="checkbox"
            name="ayekoo_updates"
            checked={updates}
            onChange={(event) => setUpdates(event.target.checked)}
            className="h-5 w-5 shrink-0 accent-chalk"
          />
          <span>Email me Ayekoo milestones (10 Ayekoos, etc.)</span>
        </label>
      )}

      {state.existing && (
        <p className="rounded-2xl bg-surface px-4 py-3">
          We already have {state.existing.name}.{" "}
          <Link href={`/launch/${state.existing.slug}`} className="underline underline-offset-4">
            Say ayekoo to it
          </Link>
        </p>
      )}
      {state.error && (
        <p role="alert" className="rounded-2xl bg-red/15 px-4 py-3 text-red">
          {state.error}
        </p>
      )}

      <button className="btn !px-6 !py-3 text-lg" disabled={pending}>
        {pending ? "Sending…" : "Add it"}
      </button>
    </form>
  );
}
