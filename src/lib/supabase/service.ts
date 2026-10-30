import "server-only";
import { createClient } from "@supabase/supabase-js";
import { DB_SCHEMA, SUPABASE_URL } from "./env";

// Full-access client for server code that writes on visitors' behalf (ayekoos). Never import
// this into anything that runs in the browser.
export function createServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !key) return null;
  return createClient(SUPABASE_URL, key, {
    db: { schema: DB_SCHEMA },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
