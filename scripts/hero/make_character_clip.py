"""Make a transparent character clip from a Higgsfield clip on a plain grey background.

usage: python3 scripts/hero/make_character_clip.py <orig.mp4> <nobg.mp4> <out_basename>

  orig.mp4   the generated clip (character walks in from the right edge on a plain grey studio
             background, starting and ending on an empty frame)
  nobg.mp4   the same clip run through Higgsfield's background remover (it outputs the subject on
             black, not real transparency, which is why this script exists)
  writes     <out>.webm (VP9 alpha, Chrome/Firefox), <out>.mov (HEVC alpha, Safari), <out>.webp still

Copy the three files to public/hero/characters/ and add the character to src/config/characters.ts.
Needs ffmpeg (with libvpx-vp9 and hevc_videotoolbox, i.e. on macOS), numpy and Pillow.

Alpha comes from two signals:
  A  where the background-removed clip still matches the original (the remover's subject mask)
  B  where the original differs from its own empty first frame (catches objects the remover dropped)
A is only trusted where B says something is actually there (the remover's first frames are garbage).
Floor shadows (neutral, slightly darker than the plate) become soft *black* shadows instead of a
light grey halo. Edges are eroded a pixel and softened so no grey fringe shows on a dark page.
"""
import subprocess
import sys

import numpy as np

orig, nobg, out = sys.argv[1:4]
S = 640


def frames(path):
    raw = subprocess.run(
        ["ffmpeg", "-loglevel", "error", "-i", path, "-vf", f"scale={S}:{S}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
        check=True, capture_output=True,
    ).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, S, S, 3)


def smooth(x, a, b):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


# Both helpers pad first: a plain np.roll wraps a character at the right edge round to the left edge.
def shift_reduce(m, r, fn):
    out = np.pad(m, r, mode="edge")
    for axis in (0, 1):
        acc = out.copy()
        for k in range(1, r + 1):
            acc = fn(acc, np.roll(out, k, axis))
            acc = fn(acc, np.roll(out, -k, axis))
        out = acc
    return out[r:-r, r:-r]


def blur(m, r=1):
    padded = np.pad(m, r, mode="edge")
    acc = np.zeros_like(padded)
    n = 0
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1):
            acc += np.roll(np.roll(padded, dy, 0), dx, 1)
            n += 1
    return (acc / n)[r:-r, r:-r]


O = frames(orig)
N = frames(nobg)
count = min(len(O), len(N))
plate = O[0].astype(np.float32) / 255

enc = subprocess.Popen(
    ["ffmpeg", "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{S}x{S}", "-r", "24", "-i", "-",
     "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "0", "-crf", "34", "-row-mt", "1", "-auto-alt-ref", "0",
     f"{out}.webm"],
    stdin=subprocess.PIPE,
)

fade = 8
for i in range(count):
    o = O[i].astype(np.float32) / 255
    n = N[i].astype(np.float32) / 255

    d = np.abs(o - plate).max(-1)
    present = shift_reduce(smooth(d, 0.03, 0.08), 6, np.maximum)  # something is here (holes filled)
    changed = smooth(d, 0.06, 0.16)

    ratio = (o + 0.01) / (plate + 0.01)
    neutral = (ratio.max(-1) - ratio.min(-1)) < 0.06
    mean_r = ratio.mean(-1)
    is_shadow = neutral & (mean_r > 0.4) & (mean_r < 0.97)

    remover = 1 - smooth(np.abs(o - n).max(-1), 0.06, 0.22)
    subject = np.maximum(remover * present, changed * ~is_shadow)
    subject = blur(shift_reduce(subject, 1, np.minimum))  # erode 1px, soften: no grey fringe

    shadow = np.where(is_shadow, np.clip((1 - mean_r) * 1.4, 0, 0.55), 0) * (1 - subject)
    shadow = blur(shadow, 2)

    alpha = subject + shadow * (1 - subject)
    rgb = np.where(alpha[..., None] > 1e-3, o * (subject / np.maximum(alpha, 1e-3))[..., None], 0)

    if i == 0:
        alpha[:] = 0
    if i >= count - fade:
        alpha *= (count - 1 - i) / fade

    frame = np.dstack([np.clip(rgb, 0, 1), np.clip(alpha, 0, 1)])
    enc.stdin.write((frame * 255 + 0.5).astype(np.uint8).tobytes())

enc.stdin.close()
enc.wait()

subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-c:v", "libvpx-vp9", "-i", f"{out}.webm", "-c:v", "hevc_videotoolbox",
                "-alpha_quality", "0.8", "-b:v", "2200k", "-tag:v", "hvc1", "-allow_sw", "1", "-an", f"{out}.mov"], check=True)
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-c:v", "libvpx-vp9", "-ss", "2.2", "-i", f"{out}.webm", "-frames:v", "1",
                f"{out}.png"], check=True)
from PIL import Image  # noqa: E402

Image.open(f"{out}.png").save(f"{out}.webp", quality=85)
print(out, "done")
