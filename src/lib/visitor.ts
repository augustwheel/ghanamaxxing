import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";

// A salted hash of the visitor's IP, for spam limits. The raw IP is never stored.
export async function visitorIpHash() {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const salt = process.env.AYEKOO_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}
