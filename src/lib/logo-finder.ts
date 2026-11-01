import "server-only";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import sharp from "sharp";

// Finds a listing's logo from its own website: its app icons, then its favicon. These are the site's own marks, unlike
// images merely named "logo" on the page, which are often partners' logos. The address comes from a public form, so fetching
// it has limits: public hosts only, small files only, and a short timeout.
const MAX_BYTES = 5 * 1024 * 1024;
const TIMEOUT_MS = 8000;
const SIZE = 160;
// Starter icons that come with web frameworks, and say nothing about the app.
const STARTER_ICON = /\/(vite|next|vercel|react|nuxt|svelte|astro|turbo|netlify|wordpress)[-_.\w]*\.(svg|png|ico)$/i;

function isPrivateAddress(ip: string) {
  if (isIP(ip) === 4) {
    const [a, b] = ip.split(".").map(Number);
    return a === 0 || a === 10 || a === 127 || a >= 224 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
  }
  const v6 = ip.toLowerCase();
  if (v6.startsWith("::ffff:")) return isPrivateAddress(v6.slice(7));
  return v6 === "::" || v6 === "::1" || /^f[cd]/.test(v6) || /^fe[89ab]/.test(v6) || /^ff/.test(v6);
}

async function isPublicUrl(url: URL) {
  if (url.protocol !== "https:" && url.protocol !== "http:") return false;
  if (url.username || url.password) return false;
  if (url.port && url.port !== "80" && url.port !== "443") return false;
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (isIP(host)) return !isPrivateAddress(host);
  try {
    const addresses = await lookup(host, { all: true });
    return addresses.length > 0 && addresses.every((a) => !isPrivateAddress(a.address));
  } catch {
    return false;
  }
}

// Follows redirects by hand so every hop gets the same check.
async function fetchLimited(start: string): Promise<{ bytes: Buffer; url: string; type: string } | null> {
  let url = start;
  for (let hop = 0; hop < 4; hop++) {
    const parsed = new URL(url);
    if (!(await isPublicUrl(parsed))) return null;
    const res = await fetch(parsed, {
      redirect: "manual",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; GhanamaxxingLogoFinder/1.0; +https://www.ghanamaxxing.com)" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const next = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && next) {
      await res.body?.cancel();
      url = new URL(next, url).href;
      continue;
    }
    if (!res.ok || !res.body) {
      await res.body?.cancel();
      return null;
    }
    const chunks: Buffer[] = [];
    let total = 0;
    const reader = res.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.length;
      if (total > MAX_BYTES) {
        await reader.cancel();
        return null;
      }
      chunks.push(Buffer.from(value));
    }
    return { bytes: Buffer.concat(chunks), url, type: res.headers.get("content-type") ?? "" };
  }
  return null;
}

const attr = (tag: string, name: string) => tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"))?.slice(1).find(Boolean);
const largestSide = (sizes = "") => Math.max(0, ...sizes.split(/\s+/).map((s) => Number(s.toLowerCase().split("x")[0]) || 0));

// The site's own icons, best first.
async function candidates(siteUrl: string) {
  const found: { url: string; score: number }[] = [];
  const add = (href: string | undefined, base: string, score: number) => {
    if (!href) return;
    try {
      const url = new URL(href, base).href;
      if (!STARTER_ICON.test(new URL(url).pathname)) found.push({ url, score });
    } catch {}
  };
  const page = await fetchLimited(siteUrl).catch(() => null);
  const base = page?.url ?? siteUrl;
  if (page?.type.includes("html")) {
    const html = page.bytes.toString("utf8");
    let manifest: string | undefined;
    for (const tag of html.match(/<link\b[^>]*>/gi) ?? []) {
      const rel = (attr(tag, "rel") ?? "").toLowerCase();
      const href = attr(tag, "href");
      if (rel === "manifest") manifest = href;
      else if (rel.includes("apple-touch-icon")) add(href, base, Math.max(180, largestSide(attr(tag, "sizes"))));
      else if (rel.split(/\s+/).includes("icon")) add(href, base, href?.toLowerCase().includes(".svg") ? 400 : largestSide(attr(tag, "sizes")) || 32);
    }
    if (manifest) {
      const file = await fetchLimited(new URL(manifest, base).href).catch(() => null);
      if (file) {
        try {
          const icons = JSON.parse(file.bytes.toString("utf8")).icons ?? [];
          for (const icon of icons) add(icon.src, file.url, largestSide(icon.sizes) || 64);
        } catch {}
      }
    }
  }
  add("/apple-touch-icon.png", base, 170);
  found.sort((a, b) => b.score - a.score);
  // Last resort, which also covers sites that only have a .ico: Google's copy of the site's favicon.
  found.push({ url: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(new URL(base).hostname)}&sz=128`, score: 0 });
  return [...new Map(found.map((c) => [c.url, c])).values()];
}

// A square, on a backing that shows it: logos with no background get black or white to contrast with them.
async function toSquareLogo(bytes: Buffer, minSide: number) {
  const image = sharp(bytes, { limitInputPixels: 40_000_000, density: 300 });
  const meta = await image.metadata();
  if (!meta.width || !meta.height) return null;
  if (meta.format !== "svg" && Math.min(meta.width, meta.height) < minSide) return null;
  const rgba = await image.clone().ensureAlpha().resize(64, 64, { fit: "inside" }).raw().toBuffer({ resolveWithObject: true });
  const px = rgba.data;
  let seen = 0;
  let sum = 0;
  let sumSq = 0;
  for (let i = 0; i < px.length; i += 4) {
    if (px[i + 3] < 128) continue;
    const lum = 0.3 * px[i] + 0.59 * px[i + 1] + 0.11 * px[i + 2];
    seen++;
    sum += lum;
    sumSq += lum * lum;
  }
  const transparent = (px.length / 4 - seen) / (px.length / 4) > 0.02;
  const mean = seen ? sum / seen : 0;
  const spread = seen ? Math.sqrt(Math.max(0, sumSq / seen - mean * mean)) : 0;
  if (seen < 8 || (!transparent && spread < 2)) return null; // blank
  const background = transparent
    ? mean > 110
      ? { r: 17, g: 17, b: 19, alpha: 1 }
      : { r: 255, g: 255, b: 255, alpha: 1 }
    : { r: px[0], g: px[1], b: px[2], alpha: 1 };
  const square = meta.width === meta.height;
  const inner = transparent || !square ? Math.round(SIZE * 0.72) : SIZE;
  const fitted = await image.clone().resize(inner, inner, { fit: "contain", background: { ...background, alpha: 0 } }).png().toBuffer();
  return sharp({ create: { width: SIZE, height: SIZE, channels: 4, background } })
    .composite([{ input: fitted, gravity: "centre" }])
    .flatten({ background })
    .webp({ quality: 88 })
    .toBuffer();
}

export async function findLogo(siteUrl: string) {
  for (const candidate of (await candidates(siteUrl)).slice(0, 8)) {
    const fromGoogle = candidate.score === 0;
    const file = await fetchLimited(candidate.url).catch(() => null);
    if (!file) continue;
    const logo = await toSquareLogo(file.bytes, fromGoogle ? 64 : 48).catch(() => null);
    if (logo) return { logo, source: candidate.url };
  }
  return null;
}
