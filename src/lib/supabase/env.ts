export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// All Ghanamaxxing tables live in their own schema, so the Supabase project can be shared.
// It must be listed under Project Settings → API → Exposed schemas.
export const DB_SCHEMA = "ghanamaxxing";

// When Supabase isn't configured yet (fresh clone), pages fall back to the sample data
// in data/seed-launches.json so the UI can still be previewed.
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
