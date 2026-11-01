import { NextResponse } from "next/server";
import { liveEmail, sendMakerEmail } from "@/lib/maker-email";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

type Row = { launch_id: string; contact_email: string; made_it: boolean; launches: { name: string; slug: string } };

// Called every few minutes by the n8n workflow: emails whoever submitted a listing that has since been approved.
export async function POST(request: Request) {
  const secret = process.env.ALERT_WEBHOOK_SECRET;
  if (!secret || request.headers.get("x-webhook-secret") !== secret) return NextResponse.json({ error: "Not allowed" }, { status: 401 });
  const db = createServiceClient();
  if (!db) return NextResponse.json({ error: "No database" }, { status: 503 });

  const { data, error } = await db
    .from("launch_submissions")
    .select("launch_id, contact_email, made_it, launches!inner(name, slug, status)")
    .is("approval_email_sent_at", null)
    .not("contact_email", "is", null)
    .eq("launches.status", "approved")
    .limit(20);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let sent = 0;
  for (const row of (data ?? []) as unknown as Row[]) {
    // Mark it first, and only if nothing else has: two runs overlapping must not email anyone twice.
    const { data: claimed } = await db
      .from("launch_submissions")
      .update({ approval_email_sent_at: new Date().toISOString() })
      .eq("launch_id", row.launch_id)
      .is("approval_email_sent_at", null)
      .select("launch_id");
    if (!claimed?.length) continue;
    const ok = await sendMakerEmail(liveEmail(row.contact_email, row.launches.name, row.launches.slug, row.made_it));
    if (ok) sent++;
    else await db.from("launch_submissions").update({ approval_email_sent_at: null }).eq("launch_id", row.launch_id);
  }
  return NextResponse.json({ sent });
}
