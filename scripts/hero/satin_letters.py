"""Make the satin bubble letters used in the hero, logo and icons.

usage: python3 scripts/hero/satin_letters.py

Starts from the glossy black render in public/hero/letters/<letter>.webp. The body gets the colour with
gentle shading lit from the upper left; the render's folds stay, faintly, and its big highlights stay crisp
but dimmer. Writes <letter>-satin-gold.webp for GHANA and <letter>-satin-green.webp for MAXXING. Needs numpy,
Pillow and scipy. Afterwards run scripts/hero/brand_images.py.
"""
import numpy as np
from PIL import Image
from scipy.ndimage import distance_transform_edt, gaussian_filter, label

LETTERS = "public/hero/letters"
COLOURS = {"gold": ((237, 169, 0), "GHAN"), "green": ((12, 128, 78), "MAXING")}
LIGHT = np.array([-0.45, -0.6, 0.66], np.float32)
LIGHT /= np.linalg.norm(LIGHT)


def satin(ch, colour):
    im = np.asarray(Image.open(f"{LETTERS}/{ch}.webp").convert("RGBA")).astype(np.float32) / 255
    alpha, s = im[..., 3], im.shape[0]
    lum = im[..., :3].mean(axis=2)

    # The source has pinholes where its highlights were; they'd dent the shading. Fill all but real counters.
    holes, count = label(alpha <= 0.5)
    sizes = np.bincount(holes.ravel())
    small = np.isin(holes, [i for i in range(1, count + 1) if sizes[i] < alpha.size * 0.002])
    solid = (alpha > 0.5) | small

    # A puffy height map from the outline, for the body's shading.
    d = distance_transform_edt(solid)
    p = np.clip(d / np.percentile(d[solid], 98), 0, 1)
    height = gaussian_filter(np.sqrt(1 - (1 - p) ** 2) * s * 0.075, s * 0.009)
    gy, gx = np.gradient(height)
    n = np.dstack([-gx, -gy, np.ones_like(height)])
    n /= np.linalg.norm(n, axis=2, keepdims=True)
    lit = np.clip((n * LIGHT).sum(axis=2), 0, 1)
    rgb = colour[None, None] * (0.8 + 0.3 * lit)[..., None]

    rgb = rgb + (0.14 * np.clip(lum, 0, 0.3) / 0.3)[..., None]
    high = gaussian_filter(np.clip((lum - 0.35) / 0.5, 0, 1), 0.9) * 0.62
    rgb = rgb * (1 - high[..., None]) + high[..., None]
    return Image.fromarray((np.dstack([np.clip(rgb, 0, 1), alpha]) * 255).astype(np.uint8))


for name, (rgb, letters) in COLOURS.items():
    colour = np.array(rgb, np.float32) / 255
    for ch in letters:
        path = f"{LETTERS}/{ch}-satin-{name}.webp"
        satin(ch, colour).save(path, "WEBP", quality=86, method=6)
        print("wrote", path)
