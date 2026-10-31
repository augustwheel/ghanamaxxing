import "server-only";

// Tells the team when a visitor sends something in: posts to the n8n workflow (n8n/ghanamaxxing-alerts.json), which
// emails August through Gmail. It does nothing until the webhook is set, and a failed alert never fails the form: what
// they sent is already saved in the database.
export async function notifyTeam({ subject, lines, replyTo }: { subject: string; lines: [string, string | null | undefined][]; replyTo?: string | null }) {
  const url = process.env.ALERT_WEBHOOK_URL;
  const secret = process.env.ALERT_WEBHOOK_SECRET;
  if (!url || !secret) return;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Webhook-Secret": secret },
      body: JSON.stringify({ subject, lines: lines.filter(([, value]) => value), replyTo: replyTo || null }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.error("Alert failed", res.status);
  } catch (err) {
    console.error("Alert failed", err);
  }
}
