import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Profiles are created on first sign-in (not by a trigger, since the project is shared).
      await supabase.rpc("ensure_profile");
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }
  return NextResponse.redirect(`${origin}/signin?error=1`);
}
