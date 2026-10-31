"use server";

import { z } from "zod";
import { notifyTeam } from "@/lib/notify";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type ClaimState = { done?: boolean; error?: string; values?: Record<string, string> };

const schema = z.object({
  launch: z.string().trim().min(1, "Tell us which listing").max(300),
  name: z.string().trim().min(1, "Add your name").max(120),
  email: z.string().trim().email("That email doesn't look right").max(200),
  connection: z.string().trim().min(2, "Tell us how you're connected to it").max(2000),
  website: z.string().max(0), // honeypot
});

export async function requestClaim(_prev: ClaimState, formData: FormData): Promise<ClaimState> {
  const values = Object.fromEntries([...formData.entries()].filter(([, v]) => typeof v === "string")) as Record<string, string>;
  if (!isSupabaseConfigured) return { values, error: "Requests open once the site's database is connected." };
  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    if (issue.path[0] === "website") return { done: true };
    return { values, error: issue.message };
  }
  const { launch, name, email, connection } = parsed.data;
  const supabase = await createClient();
  // Match a slug or a link to one of our launch pages, if we can.
  const slug = launch.replace(/^.*\/launch\//, "").replace(/[/?#].*$/, "").toLowerCase();
  const { data: match } = await supabase.from("launches").select("id").eq("slug", slug).maybeSingle();
  const { error } = await supabase.from("claim_requests").insert({
    launch_id: match?.id ?? null,
    launch_reference: launch,
    requester_name: name,
    requester_email: email,
    connection,
  });
  if (error) return { values, error: "Couldn't send that. Try again, or email us." };
  await notifyTeam({
    subject: `claim request for ${launch}`,
    lines: [["Listing", launch], ["From", name], ["Email", email], ["Connection", connection]],
    replyTo: email,
  });
  return { done: true };
}
