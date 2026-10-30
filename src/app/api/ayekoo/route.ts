import { createHash, randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

// One-tap "Ayekoo" (well done). No sign-in: a browser is identified by a random id in a private
// cookie, and a salted hash of the IP is kept to stop someone clearing cookies to pile on.

const COOKIE = "gm_vk";
const LIMITS = { perIpPerHour: 120, perIpPerLaunchPerDay: 5 };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function voterKey(create: boolean) {
  const jar = await cookies();
  const existing = jar.get(COOKIE)?.value;
  if (existing && /^[A-Za-z0-9_-]{16,64}$/.test(existing)) return existing;
  if (!create) return null;
  const key = randomBytes(18).toString("base64url");
  jar.set(COOKIE, key, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 365 * 2, path: "/" });
  return key;
}

async function ipHash() {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const salt = process.env.AYEKOO_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

async function state(db: NonNullable<ReturnType<typeof createServiceClient>>, launchId: string, key: string | null) {
  const [{ data: launch }, given] = await Promise.all([
    db.from("launches").select("ayekoo_count").eq("id", launchId).eq("status", "approved").maybeSingle(),
    key
      ? db.from("ayekoos").select("launch_id").eq("launch_id", launchId).eq("voter_key", key).is("removed_at", null).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);
  if (!launch) return null;
  return { count: launch.ayekoo_count as number, given: Boolean(given.data) };
}

export async function GET(request: NextRequest) {
  const launchId = request.nextUrl.searchParams.get("launchId") ?? "";
  const db = createServiceClient();
  if (!db || !UUID.test(launchId)) return NextResponse.json({ error: "unavailable" }, { status: 400 });
  const s = await state(db, launchId, await voterKey(false));
  return s ? NextResponse.json(s) : NextResponse.json({ error: "not found" }, { status: 404 });
}

// Toggle: say ayekoo, or take it back.
export async function POST(request: NextRequest) {
  const { launchId } = (await request.json().catch(() => ({}))) as { launchId?: string };
  const db = createServiceClient();
  if (!db || !launchId || !UUID.test(launchId)) return NextResponse.json({ error: "unavailable" }, { status: 400 });

  const key = (await voterKey(true))!;
  const current = await state(db, launchId, key);
  if (!current) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (current.given) {
    await db.from("ayekoos").delete().eq("launch_id", launchId).eq("voter_key", key);
  } else {
    const hash = await ipHash();
    const hourAgo = new Date(Date.now() - 3_600_000).toISOString();
    const dayAgo = new Date(Date.now() - 86_400_000).toISOString();
    const [{ count: perHour }, { count: perLaunch }] = await Promise.all([
      db.from("ayekoos").select("launch_id", { count: "exact", head: true }).eq("ip_hash", hash).gte("created_at", hourAgo),
      db.from("ayekoos").select("launch_id", { count: "exact", head: true }).eq("ip_hash", hash).eq("launch_id", launchId).gte("created_at", dayAgo),
    ]);
    if ((perHour ?? 0) >= LIMITS.perIpPerHour || (perLaunch ?? 0) >= LIMITS.perIpPerLaunchPerDay) {
      return NextResponse.json({ ...current, error: "slow down" }, { status: 429 });
    }
    const { error } = await db.from("ayekoos").insert({ launch_id: launchId, voter_key: key, ip_hash: hash });
    if (error && error.code !== "23505") return NextResponse.json({ ...current, error: "failed" }, { status: 500 });
  }
  return NextResponse.json(await state(db, launchId, key));
}
