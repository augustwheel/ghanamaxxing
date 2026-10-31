"""Make coloured versions of the glossy black bubble letters (used for MAXXING).

usage: python3 scripts/hero/tint_letters.py <name> <r> <g> <b>
       e.g. python3 scripts/hero/tint_letters.py ghana-green 0 128 72

Writes public/hero/letters/<letter>-<name>.webp for M, A, X, I, N, G. A "screen" blend: the black
body takes the colour and the white highlights stay white, so they still look like the same
glossy letters. Needs numpy and Pillow. No longer used by the hero: see scripts/hero/satin_letters.py.
"""
import sys

import numpy as np
from PIL import Image

name, r, g, b = sys.argv[1], *map(int, sys.argv[2:5])
LETTERS = "public/hero/letters"
colour = np.array([r, g, b], np.float32) / 255

for ch in "MAXING":
    im = np.asarray(Image.open(f"{LETTERS}/{ch}.webp").convert("RGBA")).astype(np.float32) / 255
    rgb = 1 - (1 - im[..., :3]) * (1 - colour)
    out = np.dstack([np.clip(rgb, 0, 1), im[..., 3:]])
    Image.fromarray((out * 255).astype(np.uint8)).save(f"{LETTERS}/{ch}-{name}.webp", "WEBP", quality=86, method=6)
    print("wrote", f"{LETTERS}/{ch}-{name}.webp")
