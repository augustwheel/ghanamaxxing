import "server-only";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

// For admin pages and actions. Signed-out users go to sign-in; signed-in non-admins get a 404-style redirect.
export async function requireAdmin(next = "/admin") {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect(`/signin?next=${encodeURIComponent(next)}`);
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", data.user.id).single();
  if (!profile?.is_admin) redirect("/");
  return { supabase, user: data.user };
}
