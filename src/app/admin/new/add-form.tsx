"use client";

import { useActionState } from "react";
import { addLaunch, type AddState } from "../actions";
import { LAUNCH_TYPES } from "@/config/launch-types";
import { PLACES } from "@/config/places";

const input =
  "mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-chalk placeholder:text-muted/60 focus:border-muted focus:outline-none";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="text-chalk">{label}</span>
      {hint && <span className="ml-2 text-muted">{hint}</span>}
      {children}
    </label>
  );
}

export function AddLaunchForm() {
  const [state, action, pending] = useActionState<AddState, FormData>(addLaunch, {});

  return (
    <form action={action} className="mt-6 space-y-5">
      {(state.error || state.fieldErrors) && (
        <div role="alert" className="rounded-lg bg-red/15 px-3 py-2 text-sm text-red">
          {state.error ?? state.fieldErrors?.join("; ")}
        </div>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name">
          <input name="name" required maxLength={80} className={input} />
        </Field>
        <Field label="Type">
          <select name="type" required className={input} defaultValue="">
            <option value="" disabled>
              Choose…
            </option>
            {LAUNCH_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Tagline" hint="one line, max 100">
        <input name="tagline" required maxLength={100} className={input} />
      </Field>
      <Field label="Description" hint="optional, max 800">
        <textarea name="description" maxLength={800} rows={4} className={input} />
      </Field>
      <Field label="Link">
        <input name="url" type="url" required placeholder="https://" className={input} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Logo" hint="upload or URL">
          <input name="logo_file" type="file" accept="image/*" className="mt-1 block w-full text-sm" />
          <input name="logo_url" type="url" placeholder="https://…/logo.png" className={input} />
        </Field>
        <Field label="Screenshot" hint="upload or URL">
          <input name="image_file" type="file" accept="image/*" className="mt-1 block w-full text-sm" />
          <input name="image_url" type="url" placeholder="https://…/screenshot.png" className={input} />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="City / area">
          <input name="city" list="places" className={input} placeholder="Osu" />
          <datalist id="places">
            {Object.values(PLACES).map((p) => (
              <option key={p.label} value={p.label.split(",")[0]} />
            ))}
          </datalist>
        </Field>
        <Field label="Latitude" hint="optional">
          <input name="lat" inputMode="decimal" className={input} />
        </Field>
        <Field label="Longitude" hint="optional">
          <input name="lng" inputMode="decimal" className={input} />
        </Field>
      </div>
      <p className="-mt-3 text-xs text-muted">Known cities and areas fill in coordinates automatically.</p>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Maker name">
          <input name="maker_name" className={input} />
        </Field>
        <Field label="Launched on" hint="optional">
          <input name="launched_at" type="date" className={input} />
        </Field>
      </div>
      <fieldset className="grid gap-3 sm:grid-cols-2">
        <legend className="mb-2 text-sm text-chalk">Maker links (optional)</legend>
        {(["x", "instagram", "linkedin", "github", "tiktok", "website"] as const).map((k) => (
          <input key={k} name={`maker_${k}`} type="url" placeholder={`${k === "x" ? "X" : k[0].toUpperCase() + k.slice(1)} URL`} className={input} aria-label={`Maker ${k} URL`} />
        ))}
      </fieldset>
      <button
        disabled={pending}
        className="btn"
      >
        {pending ? "Saving…" : "Add launch"}
      </button>
    </form>
  );
}
