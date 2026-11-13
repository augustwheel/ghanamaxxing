// Turns the flag frames from scripts/hero/flag_cloth.py into a seamless loop for the cedi band hero:
// crossfades the last second into the first, crops to the flag, and writes
//   public/hero/flag/ghana-flag.webm (VP9 with alpha: Chrome, Firefox, Android)
//   public/hero/flag/ghana-flag.mov  (HEVC with alpha: Safari)
//   public/hero/flag/ghana-flag.webp (still, for reduced motion and while the video loads)
//   public/hero/flag/ghana-flag.json (size, and where the pole edge sits, as fractions of the frame)
// Usage: node scripts/hero/flag_loop.mjs FRAMES_DIR
// Needs ffmpeg with libvpx-vp9 and hevc_videotoolbox (macOS), like make_character_clip.py.
import { spawnSync, spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const dir = process.argv[2];
const meta = JSON.parse(fs.readFileSync(path.join(dir, "meta.json"), "utf8"));
const files = fs.readdirSync(dir).filter((f) => /^frame_\d+\.png$/.test(f)).sort();
const FADE = 24; // one second
const LOOP = files.length - FADE;
const [W, H] = meta.size;
const out = "public/hero/flag";
fs.mkdirSync(out, { recursive: true });

const frames = await Promise.all(files.map((f) => sharp(path.join(dir, f)).ensureAlpha().raw().toBuffer()));

// Crop to everything the flag covers across the loop, with a little room.
let x0 = W, y0 = H, x1 = 0, y1 = 0;
for (const fr of frames)
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++)
      if (fr[(y * W + x) * 4 + 3] > 8) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
const pad = 6;
x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad);
x1 = Math.min(W - 1, x1 + pad); y1 = Math.min(H - 1, y1 + pad);
let cw = x1 - x0 + 1, ch = y1 - y0 + 1;
cw -= cw % 2; ch -= ch % 2;
// Final size: no wider than 820 px (about twice its size on the page).
const scale = Math.min(1, 820 / cw);
const ow = Math.round((cw * scale) / 2) * 2, oh = Math.round((ch * scale) / 2) * 2;

// Blend in premultiplied alpha so the crossfade doesn't fringe.
function blend(a, b, t) {
  const o = Buffer.alloc(a.length);
  for (let i = 0; i < a.length; i += 4) {
    const aa = a[i + 3] / 255, ba = b[i + 3] / 255;
    const al = aa * (1 - t) + ba * t;
    for (let c = 0; c < 3; c++) {
      const v = (a[i + c] * aa * (1 - t) + b[i + c] * ba * t) / (al || 1);
      o[i + c] = Math.round(v);
    }
    o[i + 3] = Math.round(al * 255);
  }
  return o;
}
async function finalFrame(k) {
  const buf = k < FADE ? blend(frames[LOOP + k], frames[k], k / FADE) : frames[k];
  return sharp(buf, { raw: { width: W, height: H, channels: 4 } })
    .extract({ left: x0, top: y0, width: cw, height: ch })
    .resize(ow, oh)
    .raw()
    .toBuffer();
}

const webm = path.join(out, "ghana-flag.webm");
const ff = spawn("ffmpeg", [
  "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", `${ow}x${oh}`, "-r", String(meta.fps), "-i", "-",
  "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "0", "-crf", "36", "-row-mt", "1", "-auto-alt-ref", "0", "-an", webm,
], { stdio: ["pipe", "inherit", "inherit"] });
for (let k = 0; k < LOOP; k++) {
  const f = await finalFrame(k);
  if (!ff.stdin.write(f)) await new Promise((r) => ff.stdin.once("drain", r));
}
ff.stdin.end();
await new Promise((r) => ff.on("close", r));

spawnSync("ffmpeg", ["-loglevel", "error", "-y", "-c:v", "libvpx-vp9", "-i", webm, "-c:v", "hevc_videotoolbox",
  "-alpha_quality", "0.8", "-b:v", "1800k", "-tag:v", "hvc1", "-allow_sw", "1", "-an", path.join(out, "ghana-flag.mov")], { stdio: "inherit" });
await sharp(await finalFrame(FADE + 10), { raw: { width: ow, height: oh, channels: 4 } }).webp({ quality: 85 }).toFile(path.join(out, "ghana-flag.webp"));

// Where the pole edge (hoist) is, as a share of the output frame, so the page can pin it to the pole.
const fx = (p) => +((p[0] - x0) / cw).toFixed(4);
const fy = (p) => +((p[1] - y0) / ch).toFixed(4);
const info = {
  width: ow, height: oh, fps: meta.fps, frames: LOOP,
  hoistX: fx(meta.hoistTop), hoistTop: fy(meta.hoistTop), hoistBottom: fy(meta.hoistBottom),
};
fs.writeFileSync(path.join(out, "ghana-flag.json"), JSON.stringify(info, null, 2) + "\n");
for (const f of fs.readdirSync(out)) console.log(f, (fs.statSync(path.join(out, f)).size / 1024).toFixed(0) + " KB");
console.log(info);
