"""Build the faint Adinkra pattern behind the hero, public/hero/adinkra-pattern.svg.

usage: python3 scripts/hero/adinkra_pattern.py

The symbols in scripts/hero/adinkra come from Wikimedia Commons, all public domain or CC0. Please don't redraw them or
add a symbol without checking it with someone who knows them, the same care as the Ayekoo phrases.

  gye-nyame                   Gye Nyame, CC0, kasahorow via Openclipart
  adinkrahene                 Adinkrahene, public domain, Pablo Busatto
  dwennimmen                  Dwennimmen, public domain, Pablo Busatto
  boa-me-na-me-boa-wo         Boa me na me boa wo, public domain, Pablo Busatto
  kuntinkantan                Kuntinkantan, public domain, Pablo Busatto
  funtunfunefu-denkyemfunefu  Funtunfunefu Denkyemfunefu, CC0, GeorgesMbakop
  abe-dua                     Abe dua, CC0, kasahorow
"""
import re
import xml.etree.ElementTree as ET
from pathlib import Path

HERE = Path(__file__).parent / "adinkra"
OUT = Path("public/hero/adinkra-pattern.svg")
INK = "#111114"
SVG = "http://www.w3.org/2000/svg"
SYMBOLS = ["gye-nyame", "dwennimmen", "adinkrahene", "boa-me-na-me-boa-wo", "abe-dua", "funtunfunefu-denkyemfunefu", "kuntinkantan"]
SIZE = 84  # each symbol's box
STEP = 110  # distance between symbols: close together, so it reads as a wall
COLUMNS = len(SYMBOLS)
ROWS = 4
TILE = STEP * COLUMNS
HEIGHT = STEP * ROWS
# Each row starts further along the list and sits half a step across, so no straight lines of the same symbol show.
LAYOUT = [
    (SYMBOLS[(col + row * 3) % COLUMNS], col * STEP + (STEP // 2 if row % 2 else 0), row * STEP + (STEP - SIZE) // 2)
    for row in range(ROWS)
    for col in range(COLUMNS)
]
# A symbol crossing the tile's right edge is drawn again on the left, so it stays whole when the tile repeats.
LAYOUT += [(name, x - TILE, y) for name, x, y in LAYOUT if x + SIZE > TILE]
KEEP = {"path", "circle", "ellipse", "rect", "polygon", "polyline", "line", "g"}


def number(value):
    return float(re.match(r"[\d.]+", value).group())


def stylesheet(src):
    """Some files draw their outlines through a <style> block: without it, rings turn into solid discs."""
    rules = {}
    for style in src.iter(f"{{{SVG}}}style"):
        for names, body in re.findall(r"([^{}]+)\{([^}]*)\}", style.text or ""):
            for name in names.split(","):
                rules.setdefault(name.strip().lstrip("."), {}).update(declarations(body))
    return rules


def declarations(text):
    return {k.strip(): v.strip() for k, v in (p.split(":", 1) for p in text.split(";") if ":" in p)}


def clean(el, rules):
    """Only shapes, every colour set to the one ink, nothing else carried over."""
    tag = el.tag.split("}")[-1]
    out = ET.Element(f"{{{SVG}}}{tag}")
    for k, v in el.attrib.items():
        if "}" in k or k in ("id", "class", "style", "fill", "stroke"):
            continue
        out.set(k, v)
    style = {}
    for name in el.get("class", "").split():
        style.update(rules.get(name, {}))
    style.update(declarations(el.get("style", "")))
    for prop in ("fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin", "fill-rule", "stroke-miterlimit"):
        value = el.get(prop) or style.get(prop)
        if value is None:
            continue
        if prop in ("fill", "stroke"):
            out.set(prop, "none" if value == "none" else INK)
        else:
            out.set(prop, value.replace("px", ""))
    for child in el:
        if child.tag.split("}")[-1] in KEEP:
            out.append(clean(child, rules))
    return out


ET.register_namespace("", SVG)
root = ET.Element(f"{{{SVG}}}svg", {"width": str(TILE), "height": str(HEIGHT), "viewBox": f"0 0 {TILE} {HEIGHT}", "fill": INK, "opacity": "0.42"})
defs = ET.SubElement(root, f"{{{SVG}}}defs")
# Each symbol is defined once and reused, which keeps the file small however dense the wall gets.
for name in SYMBOLS:
    src = ET.parse(HERE / f"{name}.svg").getroot()
    viewbox = src.get("viewBox") or f"0 0 {number(src.get('width'))} {number(src.get('height'))}"
    symbol = ET.SubElement(defs, f"{{{SVG}}}symbol", {"id": name, "viewBox": viewbox})
    rules = stylesheet(src)
    for child in src:
        if child.tag.split("}")[-1] in KEEP:
            symbol.append(clean(child, rules))
for name, x, y in LAYOUT:
    ET.SubElement(root, f"{{{SVG}}}use", {"href": f"#{name}", "x": str(x), "y": str(y), "width": str(SIZE), "height": str(SIZE)})
OUT.write_text(re.sub(r">\s+<", "><", ET.tostring(root, encoding="unicode")))
print("wrote", OUT, OUT.stat().st_size, "bytes")
