import Link from "next/link";
import { setLaunchStatus } from "./actions";
import { TypeChip } from "@/components/type-chip";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import type { Launch, LaunchStatus } from "@/lib/types";

const STATUSES: LaunchStatus[] = ["pending", "approved", "rejected", "removed"];

type Props = { searchParams: Promise<{ status?: string }> };

export default async function AdminLaunchesPage({ searchParams }: Props) {
  const { supabase } = await requireAdmin();
  const wanted = (await searchParams).status;
  const status = STATUSES.includes(wanted as LaunchStatus) ? (wanted as LaunchStatus) : "approved";

  const [{ data: launches, error }, counts] = await Promise.all([
    supabase
      .from("launches")
      .select("id, slug, name, type, city, source, status, ayekoo_count, launched_at, created_at")
      .eq("status", status)
      .order("created_at", { ascending: false })
      .limit(500),
    Promise.all(
      STATUSES.map(async (s) => {
        const { count } = await supabase.from("launches").select("id", { count: "exact", head: true }).eq("status", s);
        return [s, count ?? 0] as const;
      }),
    ),
  ]);
  if (error) throw error;

  return (
    <div>
      <nav className="flex flex-wrap gap-2" aria-label="Status">
        {counts.map(([s, n]) => (
          <Link
            key={s}
            href={`/admin?status=${s}`}
            aria-current={s === status ? "page" : undefined}
            className={`rounded-full border px-3 py-1.5 text-sm capitalize ${
              s === status ? "border-chalk bg-surface-2 text-chalk" : "border-line text-muted hover:text-chalk"
            }`}
          >
            {s} <span className="tabular-nums opacity-70">{n}</span>
          </Link>
        ))}
      </nav>

      {launches.length === 0 ? (
        <p className="mt-10 text-muted">No {status} launches.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-muted">
              <tr className="border-b border-line">
                <th className="py-2 pr-4 font-normal">Launch</th>
                <th className="py-2 pr-4 font-normal">Type</th>
                <th className="py-2 pr-4 font-normal">Source</th>
                <th className="py-2 pr-4 font-normal">Ayekoo</th>
                <th className="py-2 pr-4 font-normal">Launched</th>
                <th className="py-2 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(launches as Pick<Launch, "id" | "slug" | "name" | "type" | "city" | "source" | "ayekoo_count" | "launched_at">[]).map((l) => (
                <tr key={l.id} className="border-b border-line/50">
                  <td className="py-2 pr-4">
                    <Link href={`/launch/${l.slug}`} className="font-medium hover:text-chalk">
                      {l.name}
                    </Link>
                    <div className="text-xs text-muted">{l.city ?? "No location"}</div>
                  </td>
                  <td className="py-2 pr-4"><TypeChip type={l.type} /></td>
                  <td className="py-2 pr-4 text-muted">{l.source}</td>
                  <td className="py-2 pr-4 tabular-nums">{l.ayekoo_count}</td>
                  <td className="py-2 pr-4 text-muted">{formatDate(l.launched_at) ?? "—"}</td>
                  <td className="py-2">
                    <div className="flex gap-2">
                      {STATUSES.filter((s) => s !== status && s !== "pending").map((s) => (
                        <form key={s} action={setLaunchStatus}>
                          <input type="hidden" name="id" value={l.id} />
                          <input type="hidden" name="status" value={s} />
                          <button className="rounded-full border border-line px-2.5 py-1 text-xs capitalize hover:border-chalk">
                            {s === "approved" ? "Approve" : s === "rejected" ? "Reject" : "Remove"}
                          </button>
                        </form>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
