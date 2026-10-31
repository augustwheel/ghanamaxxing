"use server";

import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { visitorIpHash } from "@/lib/visitor";

export type NewsletterState = { done?: boolean; error?: string; email?: string };

const schema = z.object({
  email: z.email("That email doesn't look right").max(200).transform((value) => value.trim().toLowerCase()),
  website: z.string().max(0), // honeypot
});
export async function subscribeNewsletter(_previous: NewsletterState, formData: FormData): Promise<NewsletterState> {
  const email = String(formData.get("email") ?? "").trim();
  const parsed = schema.safeParse({ email, website: String(formData.get("website") ?? "") });
  if (!parsed.success) {
    if (parsed.error.issues[0].path[0] === "website") return { done: true };
    return { email, error: parsed.error.issues[0].message };
  }
  const db = createServiceClient();
  if (!db) return { email, error: "Newsletter signup isn't available right now. Please try again later." };

  const address = parsed.data.email;
  const { data: existing, error: lookupError } = await db.from("newsletter_subscribers")
    .select("status").eq("email", address).maybeSingle();
  if (lookupError) return { email, error: "Couldn't save that. Please try again." };
  if (existing && existing.status !== "unsubscribed") return { done: true };

  const ipHash = await visitorIpHash();
  const hourAgo = new Date(Date.now() - 3_600_000).toISOString();
  const { count, error: limitError } = await db.from("newsletter_subscribers")
    .select("email", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", hourAgo);
  if (limitError) return { email, error: "Couldn't save that. Please try again." };
  if ((count ?? 0) >= 5) return { email, error: "That's a lot of signups from here. Try again in an hour." };

  const now = new Date().toISOString();
  const { error } = await db.from("newsletter_subscribers").upsert({
    email: address,
    status: "pending",
    consent_at: now,
    unsubscribed_at: null,
    ip_hash: ipHash,
  }, { onConflict: "email" });
  if (error) return { email, error: "Couldn't save that. Please try again." };
  return { done: true };
}
