"use client";

import { useActionState } from "react";
import { importLaunches, type ImportState } from "../actions";
import { getLaunchType } from "@/config/launch-types";
import type { RowProblem } from "@/lib/import/launch-input";

function Problems({ title, items, tone }: { title: string; items: RowProblem[]; tone: "red" | "muted" }) {
  if (!items.length) return null;
  return (
    <section className="mt-6">
      <h2 className={`font-semibold ${tone === "red" ? "text-red" : "text-muted"}`}>
        {title} ({items.length})
      </h2>
      <ul className="mt-2 space-y-1 text-sm">
        {items.map((p) => (
          <li key={p.row}>
            <span className="text-muted">Row {p.row}</span> {p.name && <strong>{p.name}</strong>}: {p.messages.join("; ")}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ImportForm() {
  const [state, action, pending] = useActionState<ImportState, FormData>(importLaunches, { stage: "idle" });

  return (
    <div className="mt-6">
      <form action={action} className="flex flex-wrap items-center gap-3">
        <input
          type="file"
          name="file"
          accept=".csv,.json,text/csv,application/json"
          required
          className="text-sm file:mr-3 file:rounded-full file:border-0 file:bg-surface-2 file:px-4 file:py-2 file:text-chalk"
        />
        <button
          name="intent"
          value="preview"
          disabled={pending}
          className="btn !py-2 text-sm"
        >
          {pending ? "Checking…" : "Preview"}
        </button>
      </form>

      {state.stage === "error" && <p className="mt-6 rounded-lg bg-red/15 px-3 py-2 text-sm text-red">{state.message}</p>}
      {state.stage === "done" && <p className="mt-6 rounded-lg bg-green/15 px-3 py-2 text-sm text-green">{state.message}</p>}

      {state.stage === "preview" && (
        <>
          <Problems title="Errors: fix these and re-upload" items={state.errors ?? []} tone="red" />
          <Problems title="Skipped (already listed)" items={state.skipped ?? []} tone="muted" />
          <section className="mt-6">
            <h2 className="font-semibold">Ready to import ({state.ready?.length ?? 0})</h2>
            <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
              {state.ready?.map((r) => (
                <li key={r.slug} className="truncate">
                  <span aria-hidden style={{ color: getLaunchType(r.type).color }}>●</span> {r.name}{" "}
                  <span className="text-muted">
                    /{r.slug} · {r.city ?? "no location"}
                  </span>
                </li>
              ))}
            </ul>
          </section>
          {!state.errors?.length && (state.ready?.length ?? 0) > 0 && (
            <form action={action} className="mt-6">
              <input type="hidden" name="fileText" value={state.fileText} />
              <input type="hidden" name="fileName" value={state.fileName} />
              <button
                name="intent"
                value="commit"
                disabled={pending}
                className="btn"
              >
                {pending ? "Importing…" : `Import ${state.ready?.length} launches`}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
