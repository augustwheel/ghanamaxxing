"""Rebuild the share card and app icons from the hero letters, into src/app.

usage: python3 scripts/hero/brand_images.py

Needs numpy and Pillow. Run it after scripts/hero/satin_letters.py.
"""
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

LETTERS = "public/hero/letters"
APP = "src/app"
ASPECT = dict(G=0.8878, H=0.9122, A=0.8422, N=0.9422, M=1.1256, X=0.8533, I=0.5767)  # as in hero.tsx
STAR = [(50, 5), (61, 37), (95, 37), (68, 57), (78, 90), (50, 70), (22, 90), (32, 57), (5, 37), (39, 37)]


def backdrop(w, h):
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    t = (y / (h - 1))[..., None]
    base = np.array([38, 38, 43], np.float32) * (1 - t) + np.array([27, 27, 31], np.float32) * t
    d = np.sqrt(((x - w * 0.5) / (w * 0.7)) ** 2 + ((y - h * 0.4) / (h * 0.6)) ** 2)
    k = (1 - np.clip(d / 0.85, 0, 1))[..., None]
    out = base * (1 - k) + np.array([66, 66, 75], np.float32) * k
    return Image.fromarray(out.astype(np.uint8)).convert("RGBA")


def draw_star(img, size):
    s = 4
    pts = [(x / 100 * size * s, y / 100 * size * s) for x, y in STAR]
    mask = Image.new("L", (size * s, size * s), 0)
    d = ImageDraw.Draw(mask)
    d.polygon(pts, fill=255)
    d.line(pts + pts[:1], fill=255, width=int(size * s * 0.03), joint="curve")
    r = size * s * 0.015
    for x, y in pts:
        d.ellipse([x - r, y - r, x + r, y + r], fill=255)
    mask = mask.resize((size, size), Image.LANCZOS)
    img.paste((10, 10, 11, 255), ((img.width - size) // 2, (img.height - size) // 2), mask)


def place(img, letter, x, y):
    x, y = round(x), round(y)
    a = Image.new("L", img.size, 0)
    a.paste(letter.getchannel("A"), (x, y + 9))
    shadow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    shadow.putalpha(a.filter(ImageFilter.GaussianBlur(11)).point(lambda v: int(v * 0.45)))
    img.alpha_composite(shadow)
    img.alpha_composite(letter, (x, y))


def share_card():
    W, H = 1200, 630
    card = backdrop(W, H)
    draw_star(card, 600)
    lh = (W - 48) / sum(ASPECT[c] for c in "MAXXING")
    h = lh * 1.22
    top = (H - 2 * h) / 2
    for word, tint, y in (("GHANA", "gold", top), ("MAXXING", "green", top + h)):
        x = (W - sum(ASPECT[c] * lh for c in word)) / 2
        for c in word:
            w = ASPECT[c] * lh
            letter = Image.open(f"{LETTERS}/{c}-satin-{tint}.webp").convert("RGBA")
            place(card, letter.resize((round(w), round(h)), Image.LANCZOS), x, y)
            x += w
    card.convert("RGB").save(f"{APP}/opengraph-image.png", optimize=True)


def icon(size, rounded):
    big = size * 4
    y = np.linspace(0, 1, big)[:, None, None]
    grad = (np.array([44, 44, 50]) * (1 - y) + np.array([26, 26, 30]) * y) * np.ones((big, big, 3))
    fill = Image.fromarray(grad.astype(np.uint8)).convert("RGBA")
    mask = Image.new("L", (big, big), 255)
    if rounded:
        mask = Image.new("L", (big, big), 0)
        ImageDraw.Draw(mask).rounded_rectangle([0, 0, big - 1, big - 1], radius=big * 0.2, fill=255)
    tile = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    tile.paste(fill, (0, 0), mask)
    tile = tile.resize((size, size), Image.LANCZOS)
    g = Image.open(f"{LETTERS}/G-satin-gold.webp").convert("RGBA")
    gh = round(size * 0.72)
    g = g.resize((round(gh * g.width / g.height), gh), Image.LANCZOS)
    tile.alpha_composite(g, ((size - g.width) // 2, (size - g.height) // 2))
    return tile


share_card()
icon(512, True).save(f"{APP}/icon.png", optimize=True)
icon(180, False).convert("RGB").save(f"{APP}/apple-icon.png", optimize=True)
icon(256, True).save(f"{APP}/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
print("done")
