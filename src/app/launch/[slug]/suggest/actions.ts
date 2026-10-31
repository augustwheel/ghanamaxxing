"use server";

import { z } from "zod";
import { notifyTeam } from "@/lib/notify";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

// value/email are echoed back on errors so the form can refill what the visitor typed.
export type SuggestState = { done?: boolean; error?: string; value?: string; email?: string };

const schema = z.object({
  launchId: z.string().uuid(),
  value: z.string().trim().min(2, "Add a bit more detail").max(1000),
  email: z.union([z.literal(""), z.string().trim().email("That email doesn't look right").max(200)]),
  website: z.string().max(0), // honeypot: real people never see or fill this
});

export async function submitSuggestion(_prev: SuggestState, formData: FormData): Promise<SuggestState> {
  const typed = { value: String(formData.get("value") ?? ""), email: String(formData.get("email") ?? "") };
  if (!isSupabaseConfigured) return { ...typed, error: "Suggestions open once the site's database is connected." };

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    // Bots that fill the honeypot get a quiet "thanks" and nothing is saved.
    if (issue.path[0] === "website") return { done: true };
    return { ...typed, error: issue.message };
  }

  const { launchId, value, email } = parsed.data;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const { error } = await supabase.from("suggestions").insert({
    launch_id: launchId,
    value,
    contact_email: email || null,
    user_id: auth.user?.id ?? null,
  });
  if (error) return { ...typed, error: error.message.includes("Too many") ? error.message : "Couldn't send that. Try again." };
  const { data: launch } = await supabase.from("launches").select("name").eq("id", launchId).maybeSingle();
  await notifyTeam({
    subject: `suggested edit for ${launch?.name ?? "a listing"}`,
    lines: [["Listing", launch?.name], ["Suggestion", value], ["Email", email]],
    replyTo: email,
  });
  return { done: true };
}
