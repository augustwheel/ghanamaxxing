import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

const LINKS = [
  { href: "/admin", label: "Launches" },
  { href: "/admin/new", label: "Add one" },
  { href: "/admin/import", label: "Import" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured) {
    return (
      <div className="mx-auto max-w-xl px-4 pt-20 text-center text-muted">
        Admin needs Supabase. Follow the setup steps in the README.
      </div>
    );
  }
  const { user } = await requireAdmin();
  return (
    <div className="mx-auto max-w-5xl px-4 pt-8">
      <div className="flex flex-wrap items-center gap-2 border-b border-line pb-4">
        <span className="mr-2 font-display text-2xl tracking-wide">ADMIN</span>
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="rounded-full px-3 py-1.5 text-sm text-muted hover:bg-surface-2 hover:text-cream">
            {l.label}
          </Link>
        ))}
        <form action="/auth/signout" method="post" className="ml-auto flex items-center gap-3 text-sm text-muted">
          <span className="hidden sm:inline">{user.email}</span>
          <button className="rounded-full border border-line px-3 py-1.5 hover:text-cream">Sign out</button>
        </form>
      </div>
      <div className="py-6">{children}</div>
    </div>
  );
}
