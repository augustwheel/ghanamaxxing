import type { Metadata } from "next";
import { GoogleSignInButton } from "./google-button";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

type Props = { searchParams: Promise<{ next?: string; error?: string }> };

export default async function SignInPage({ searchParams }: Props) {
  const { next, error } = await searchParams;
  const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : "/";
  return (
    <div className="mx-auto max-w-sm px-4 pt-20 text-center">
      <h1 className="font-display text-5xl tracking-wide">SIGN IN</h1>
      <p className="mt-3 text-muted">Sign in to vote, post your launch or claim one.</p>
      {error && <p className="mt-4 rounded-lg bg-red/15 px-3 py-2 text-sm text-red">Sign-in didn&apos;t work. Please try again.</p>}
      <div className="mt-8">
        {isSupabaseConfigured ? (
          <GoogleSignInButton next={safeNext} />
        ) : (
          <p className="text-sm text-muted">Sign-in needs Supabase. See the README to connect it.</p>
        )}
      </div>
    </div>
  );
}
