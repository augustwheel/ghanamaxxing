import { createClient } from "@supabase/supabase-js";
import { DB_SCHEMA, SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";

// Cookie-less client for public, cacheable reads (launch lists and pages).
export function createPublicClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    db: { schema: DB_SCHEMA },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
