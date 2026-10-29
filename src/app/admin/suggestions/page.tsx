import Link from "next/link";
import { reviewSuggestion } from "../actions";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/format";

type Row = {
  id: string;
  value: string;
  contact_email: string | null;
  created_at: string;
  launch: { name: string; slug: string } | null;
};

export default async function AdminSuggestionsPage() {
  const { supabase } = await requireAdmin("/admin/suggestions");
  const { data, error } = await supabase
    .from("suggestions")
    .select("id, value, contact_email, created_at, launch:launches(name, slug)")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(200);
  if (error) throw error;
  const rows = data as unknown as Row[];

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-semibold">Suggestions</h1>
      <p className="mt-1 text-sm text-muted">
        Make the change on the launch yourself, then mark it done.
      </p>
      {rows.length === 0 ? (
        <p className="mt-10 text-muted">No suggestions waiting.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {rows.map((s) => {
            return (
              <li key={s.id} className="rounded-3xl bg-coal p-5">
                <p className="text-sm text-muted">
                  {s.launch ? (
                    <Link href={`/launch/${s.launch.slug}`} className="font-semibold text-chalk hover:underline">
                      {s.launch.name}
                    </Link>
                  ) : (
                    "Deleted launch"
                  )}{" "}
                  · {formatDate(s.created_at)}
                  {s.contact_email && <> · {s.contact_email}</>}
                </p>
                <p className="mt-2 whitespace-pre-line">{s.value}</p>
                <div className="mt-4 flex gap-2">
                  <form action={reviewSuggestion}>
                    <input type="hidden" name="id" value={s.id} />
                    <button name="decision" value="done" className="btn !py-1.5 text-sm">
                      Mark done
                    </button>
                  </form>
                  <form action={reviewSuggestion}>
                    <input type="hidden" name="id" value={s.id} />
                    <button name="decision" value="reject" className="btn-quiet !py-1.5 text-sm">
                      Reject
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
