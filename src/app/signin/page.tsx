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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/hero/letters/G.webp" alt="" width={72} height={81} className="mx-auto h-20 w-auto" />
      <h1 className="mt-6 font-display text-4xl font-bold tracking-tight">Sign in to Ghanamaxxing</h1>
      <p className="mt-3 text-muted">Sign in to add your launch or claim one.</p>
      {error && <p className="mt-4 rounded-2xl bg-red/15 px-4 py-2 text-sm text-red">Google sign-in didn&apos;t finish. Try again.</p>}
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
