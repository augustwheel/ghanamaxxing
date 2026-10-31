"""Draw the Independence Arch as dense ASCII for the footer: public/hero/arch-ascii.json.

usage: python3 scripts/hero/arch_ascii.py <photo.jpg> [preview.png]

From "Independence Arch" by Stig Nygaard, CC BY 2.0, credited in the footer:
https://commons.wikimedia.org/wiki/File:Independence_Arch.jpg

The arch is cut out of the photo, so nothing stray surrounds it, and drawn in light characters for a black footer. Every cell inside the outline gets a character,
which is what makes the edge crisp, and the photo's tones are reduced to a few flat steps of density, so it reads as a
picture and not as noise. One colour only: shading comes from the characters. The black star is left empty, cut out of the
bright stone behind it, so the footer's own black forms it. Also makes the clouds, the same way.
All measurements are in the photo's pixels.
"""
import json
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

OUT = "public/hero/arch-ascii.json"
CROP = (235, 100, 2020, 1600)
# Bright to dim, in ordinary letters so it stays airy. Each step has two characters, mixed, so it feels like text.
RAMP = ["MW", "NH", "S8", "Ii", "l1", ";:", ",'", "."]
SS = 10  # sample points across each cell

ARCH = [
    (976, 262), (1040, 325), (1128, 215), (1190, 325), (1272, 255), (1285, 490), (1353, 492), (1353, 562), (1933, 565),
    (1943, 770), (2010, 772), (1990, 846), (1943, 846), (1955, 1595), (305, 1595), (312, 846), (270, 846), (245, 772),
    (312, 770), (322, 565), (902, 562), (902, 492), (972, 490),
]
OPENINGS = [(737, 1000, 808, 1600), (920, 1000, 1335, 1600), (1450, 1000, 1518, 1600)]
STAR = ((1127, 320), 208)  # a little larger than life, so it stays a clear star at this coarse size
# The real fins don't reach the star's top point, and a black star needs bright stone all round it to show.
STAR_BACKING = [(902, 172), (1060, 172), (1088, 104), (1166, 104), (1194, 172), (1353, 172), (1353, 492), (902, 492)]
INSCRIPTIONS = [((1127, 664), "A D   1 9 5 7"), ((1127, 858), "F R E E D O M   A N D   J U S T I C E")]


def star_polygon():
    (cx, cy), radius = STAR
    points = []
    for i in range(10):
        r = radius if i % 2 == 0 else radius * 0.382
        a = -np.pi / 2 + i * np.pi / 5
        points.append((cx + r * np.cos(a), cy + r * np.sin(a)))
    return points


def render(photo, cols):
    x0, y0, x1, y1 = CROP
    cw = (x1 - x0) / cols
    ch = cw / 0.6
    rows = round((y1 - y0) / ch)

    mask = Image.new("L", photo.size, 0)
    d = ImageDraw.Draw(mask)
    d.polygon(ARCH, fill=255)
    d.polygon(STAR_BACKING, fill=255)
    for box in OPENINGS:
        d.rectangle(box, fill=0)
    star = Image.new("L", photo.size, 0)
    ImageDraw.Draw(star).polygon(star_polygon(), fill=255)

    # Smooth away grain and small specks before anything else: this is what stops it looking messy.
    grey = photo.convert("L").filter(ImageFilter.GaussianBlur(cw * 0.3))
    size = (cols, rows)
    tone = np.asarray(grey.crop(CROP).resize(size, Image.BOX)).astype(np.float32) / 255
    cover = np.asarray(mask.crop(CROP).resize(size, Image.BOX)).astype(np.float32) / 255
    in_star = np.asarray(star.crop(CROP).resize(size, Image.BOX)).astype(np.float32) / 255

    # Brightness, stretched so the stone is dense and shadows fall away to the thinnest characters.
    light = np.clip((tone - 0.16) / 0.78, 0, 1)
    backing = Image.new("L", photo.size, 0)
    ImageDraw.Draw(backing).polygon(STAR_BACKING, fill=255)
    around_star = np.asarray(backing.crop(CROP).resize(size, Image.BOX)).astype(np.float32) / 255
    chars = []
    for r in range(rows):
        line = ""
        for c in range(cols):
            if in_star[r, c] >= 0.5 or cover[r, c] < 0.5:
                line += " "
            elif around_star[r, c] >= 0.5:
                line += RAMP[0][(r * 7 + c * 13) % 2]  # solid, so the star's edge is crisp
            else:
                # Even the deepest shadow gets a thin character, so the shape stays solid.
                step = int((1 - light[r, c]) * len(RAMP))
                group = RAMP[min(step, len(RAMP) - 1)]
                line += group[(r * 7 + c * 13) % len(group)]
        chars.append(line)

    for (cx, cy), text in INSCRIPTIONS:
        r = int((cy - y0) / ch)
        c = int((cx - x0) / cw - len(text) / 2)
        line = list(chars[r])
        for i in range(c - 2, c + len(text) + 2):
            line[i] = " "
        for i, k in enumerate(text):
            line[c + i] = k
        chars[r] = "".join(line)
    return {"cols": cols, "rows": rows, "chars": chars}


def cloud(cols, rows, puffs):
    """A filled cloud from a few overlapping ovals with a flat bottom. Puffs are (x, y, rx, ry) as fractions of its box."""
    im = Image.new("L", (cols * SS, rows * SS), 0)
    d = ImageDraw.Draw(im)
    for x, y, rx, ry in puffs:
        d.ellipse([(x - rx) * cols * SS, (y - ry) * rows * SS, (x + rx) * cols * SS, (y + ry) * rows * SS], fill=255)
    a = np.asarray(im.resize((cols, rows), Image.BOX)).astype(np.float32) / 255
    lines = []
    for r in range(rows):
        line = ""
        for c in range(cols):
            line += "il"[(r * 7 + c * 13) % 2] if a[r, c] > 0.82 else ":" if a[r, c] > 0.42 else " "
        lines.append(line.rstrip())
    return lines


CLOUDS = [
    cloud(40, 8, [(0.28, 0.66, 0.22, 0.34), (0.52, 0.5, 0.25, 0.5), (0.74, 0.68, 0.2, 0.32), (0.5, 0.82, 0.46, 0.18)]),
    cloud(26, 6, [(0.3, 0.62, 0.24, 0.36), (0.58, 0.48, 0.26, 0.48), (0.5, 0.8, 0.44, 0.2)]),
    cloud(54, 10, [(0.2, 0.7, 0.18, 0.28), (0.4, 0.46, 0.22, 0.46), (0.62, 0.52, 0.24, 0.5), (0.82, 0.72, 0.16, 0.26), (0.5, 0.84, 0.47, 0.16)]),
]

photo = Image.open(sys.argv[1]).convert("RGB")
data = {"wide": render(photo, 112), "narrow": render(photo, 72), "clouds": CLOUDS}
with open(OUT, "w") as f:
    json.dump(data, f, separators=(",", ":"))
print("wrote", OUT, {k: (data[k]["cols"], data[k]["rows"]) for k in ("wide", "narrow")})

if len(sys.argv) > 2:
    art = data["wide"]
    w, h = 6, 10
    font = ImageFont.truetype("/System/Library/Fonts/Menlo.ttc", 10)
    im = Image.new("RGB", (art["cols"] * w, (art["rows"] + 12) * h), (9, 9, 10))
    d = ImageDraw.Draw(im)
    for r, line in enumerate(CLOUDS[2]):
        d.text((90 * w, r * h), line, font=font, fill=(120, 120, 128))
    for r, line in enumerate(art["chars"]):
        d.text((0, (r + 12) * h), line, font=font, fill=(150, 150, 160))
    im.save(sys.argv[2])
