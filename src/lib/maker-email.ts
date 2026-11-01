import "server-only";
import { SITE } from "@/config/site";

// Emails to the person who submitted a listing, sent through the n8n workflow (n8n/ghanamaxxing-maker-emails.json), which
// escapes the text and sends from Gmail. It does nothing until the webhook is set.
type MakerEmail = { to: string; subject: string; paragraphs: string[]; link?: { url: string; label: string } };

export async function sendMakerEmail(email: MakerEmail) {
  const url = process.env.MAKER_EMAIL_WEBHOOK_URL;
  const secret = process.env.ALERT_WEBHOOK_SECRET;
  if (!url || !secret) return false;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Webhook-Secret": secret },
      body: JSON.stringify({ ...email, replyTo: SITE.contactEmail }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.error("Maker email failed", res.status);
    return res.ok;
  } catch (err) {
    console.error("Maker email failed", err);
    return false;
  }
}

// Doesn't repeat what they typed: anyone can enter any address on the form, so this must never carry someone's text to a stranger.
export function receiptEmail(to: string): MakerEmail {
  return {
    to,
    subject: "Thanks, we got it",
    paragraphs: [
      "Thanks for adding an app or startup to Ghanamaxxing. I'll take a look, and you'll get another email as soon as it's live.",
      "If you didn't send this, you can ignore this email.",
    ],
  };
}

export function liveEmail(to: string, name: string, slug: string, madeIt: boolean): MakerEmail {
  return {
    to,
    subject: `${name} is live on Ghanamaxxing`,
    paragraphs: madeIt
      ? [`Ayekoo! ${name} is now live on Ghanamaxxing, so people can find it and cheer you on.`, "Reply to this email if anything needs changing."]
      : [`${name}, which you added, is now live on Ghanamaxxing. Thanks for helping people find it.`, "Reply to this email if anything needs changing."],
    link: { url: `${SITE.url}/launch/${slug}`, label: `See ${name} on Ghanamaxxing` },
  };
}
