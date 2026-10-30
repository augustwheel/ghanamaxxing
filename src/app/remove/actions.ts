"use server";

import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type RemoveState = { done?: boolean; error?: string; values?: Record<string, string> };

const schema = z.object({
  launch: z.string().trim().min(1, "Tell us which listing").max(300),
  name: z.string().trim().min(1, "Add your name").max(120),
  email: z.string().trim().email("That email doesn't look right").max(200),
  reason: z.string().trim().min(2, "Tell us a little about why").max(2000),
  website: z.string().max(0), // honeypot
});

export async function requestRemoval(_prev: RemoveState, formData: FormData): Promise<RemoveState> {
  const values = Object.fromEntries([...formData.entries()].filter(([, v]) => typeof v === "string")) as Record<string, string>;
  if (!isSupabaseConfigured) return { values, error: "Requests open once the site's database is connected." };
  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    if (issue.path[0] === "website") return { done: true };
    return { values, error: issue.message };
  }
  const { launch, name, email, reason } = parsed.data;
  const supabase = await createClient();
  // Match a slug or a link to one of our launch pages, if we can.
  const slug = launch.replace(/^.*\/launch\//, "").replace(/[/?#].*$/, "").toLowerCase();
  const { data: match } = await supabase.from("launches").select("id").eq("slug", slug).maybeSingle();
  const { error } = await supabase.from("removal_requests").insert({
    launch_id: match?.id ?? null,
    launch_reference: launch,
    requester_name: name,
    requester_email: email,
    reason,
  });
  if (error) return { values, error: "Couldn't send that. Try again, or email us." };
  return { done: true };
}
