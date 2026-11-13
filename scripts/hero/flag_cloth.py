"""Ghana's flag as satin cloth waving in a gusty wind, rendered with a transparent background for the cedi
band hero (src/components/cedi/cedi-band-hero.tsx).

Run headless (no Blender window needed):
  /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P scripts/hero/flag_cloth.py -- OUT_DIR

Writes OUT_DIR/frame_####.png (RGBA) and OUT_DIR/meta.json with where the pole edge (the hoist) lands in
the frame, so the page can line the cloth up with its pole. scripts/hero/flag_loop.mjs turns the frames into
a seamless loop.
"""
import json
import math
import sys
from pathlib import Path

import bpy
import numpy as np
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector

OUT = Path(sys.argv[sys.argv.index("--") + 1]) if "--" in sys.argv else Path("/tmp/flag")
OUT.mkdir(parents=True, exist_ok=True)

W, H = 1.5, 1.0  # half-width, half-height of the flag in metres (3:2)
RES = (1000, 800)
WARMUP = 90  # frames of wind before the ones we keep, so the flag is already flying
KEEP = 120  # 5 s at 24 fps; the last 24 get crossfaded into the first for the loop
if "--test" in sys.argv:  # a quick look: three frames
    KEEP = 3

scene = bpy.context.scene
for o in list(bpy.data.objects):
    bpy.data.objects.remove(o, do_unlink=True)

# --- The flag texture: red, gold, green with the black star. ---------------------------------------------
TW, TH = 1500, 1000
img = bpy.data.images.new("ghana_flag", TW, TH, alpha=False)
px = np.zeros((TH, TW, 4), dtype=np.float32)
px[..., 3] = 1
# Blender image rows run bottom to top.
def srgb(h):  # byte images take display (sRGB) values directly
    return [int(h[i : i + 2], 16) / 255 for i in (1, 3, 5)]
px[2 * TH // 3 :, :, :3] = srgb("#ce1126")
px[TH // 3 : 2 * TH // 3, :, :3] = srgb("#fcd116")
px[: TH // 3, :, :3] = srgb("#006b3f")
# Star: point-in-polygon on a 5-point star centred on the flag, as tall as the gold band.
yy, xx = np.mgrid[0:TH, 0:TW]
cx, cy, R = TW / 2, TH / 2, TH / 6 * 0.98
pts = []
for k in range(10):
    a = math.pi / 2 + k * math.pi / 5
    r = R if k % 2 == 0 else R * 0.382
    pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
inside = np.zeros((TH, TW), dtype=bool)
j = len(pts) - 1
for i in range(len(pts)):
    xi, yi = pts[i]
    xj, yj = pts[j]
    cond = ((yi > yy) != (yj > yy)) & (xx < (xj - xi) * (yy - yi) / (yj - yi + 1e-9) + xi)
    inside ^= cond
    j = i
px[inside, :3] = srgb("#111111")
img.pixels.foreach_set(px.ravel())
img.pack()

# --- The cloth. --------------------------------------------------------------------------------------------
bpy.ops.mesh.primitive_grid_add(x_subdivisions=96, y_subdivisions=64, size=2)
flag = bpy.context.active_object
flag.name = "Flag"
flag.scale = (W, H, 1)
bpy.ops.object.transform_apply(scale=True)
flag.rotation_euler = (math.pi / 2, 0, 0)  # stand it up in the XZ plane, facing -Y (the camera)
bpy.ops.object.transform_apply(rotation=True)
flag.location = (W, 0, 0)  # hoist edge on the pole at x = 0
bpy.ops.object.transform_apply(location=True)

pin = flag.vertex_groups.new(name="pin")
pin.add([v.index for v in flag.data.vertices if v.co.x < 0.02], 1.0, "REPLACE")

cloth = flag.modifiers.new("Cloth", "CLOTH")
s = cloth.settings
s.quality = 10
s.mass = 0.08  # light silk
s.air_damping = 3  # air drag is what carries the flag out along the wind
s.tension_stiffness = 12
s.compression_stiffness = 12
s.shear_stiffness = 6
s.bending_stiffness = 0.3  # soft folds, but no crinkles
s.vertex_group_mass = "pin"
s.effector_weights.gravity = 0.15  # silk in a good breeze barely sags
cloth.point_cache.frame_start = 1
cloth.point_cache.frame_end = WARMUP + KEEP + 2
flag.modifiers.new("Smooth", "SUBSURF").levels = 1

# Wind from the pole side, with gusts, plus turbulence for ripples in every direction.
# Cloth only feels wind pushing on its faces, so it comes in at an angle (mostly along the flag, partly
# across it), the way a real flag catches the breeze.
bpy.ops.object.effector_add(type="WIND", location=(-2.5, -1.2, 0.2))
wind = bpy.context.active_object
wind.rotation_euler = Vector((1, 0.45, 0.12)).to_track_quat("Z", "Y").to_euler()
wind.field.strength = 270
wind.field.flow = 1.5
wind.field.noise = 0.7
wind.field.seed = 7
bpy.ops.object.effector_add(type="TURBULENCE", location=(1.5, 0, 0))
turb = bpy.context.active_object
turb.field.strength = 400
turb.field.size = 2.6  # big, slow waves rather than ripples
turb.field.flow = 0.5
# Gusts: let the wind breathe so the flag lifts and falls back.
wind.field.keyframe_insert("strength", frame=1)
for f, v in [(40, 350), (80, 220), (120, 370), (160, 230), (200, 360), (240, 225)]:
    wind.field.strength = v
    wind.field.keyframe_insert("strength", frame=f)

# --- Satin: soft sheen and a long, brushed highlight. ---------------------------------------------------
mat = bpy.data.materials.new("FlagSatin")
mat.use_nodes = True
nt = mat.node_tree
bsdf = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
tex = nt.nodes.new("ShaderNodeTexImage")
tex.image = img
nt.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
def set_input(name, value):
    if name in bsdf.inputs:
        bsdf.inputs[name].default_value = value
set_input("Roughness", 0.5)
set_input("Sheen Weight", 1.0)
set_input("Sheen Roughness", 0.28)
set_input("Specular IOR Level", 0.32)
set_input("Anisotropic", 0.4)
flag.data.materials.append(mat)
for p in flag.data.polygons:
    p.use_smooth = True

# --- Light and camera. --------------------------------------------------------------------------------------
def area(name, loc, energy, size, color=(1, 1, 1)):
    bpy.ops.object.light_add(type="AREA", location=loc)
    l = bpy.context.active_object
    l.name = name
    l.data.energy = energy
    l.data.size = size
    l.data.color = color
    direction = Vector((1.5, 0, 0)) - Vector(loc)
    l.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
area("Key", (-2.5, -5, 4), 900, 4, (1, 0.98, 0.95))
area("Fill", (5, -4, 0.5), 300, 5, (0.95, 0.97, 1))
area("Rim", (2, 4, 3), 500, 3)

bpy.ops.object.camera_add(location=(1.6, -12, -0.45), rotation=(math.pi / 2, 0, 0))
cam = bpy.context.active_object
cam.data.type = "ORTHO"
cam.data.ortho_scale = 4.6  # the flag plus room to wave and sag
scene.camera = cam

world = scene.world or bpy.data.worlds.new("World")
scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes.get("Background")
bg.inputs["Color"].default_value = (0.9, 0.9, 0.9, 1)
bg.inputs["Strength"].default_value = 0.35

r = scene.render
for engine in ("BLENDER_EEVEE_NEXT", "BLENDER_EEVEE"):
    try:
        r.engine = engine
        break
    except TypeError:
        pass
r.resolution_x, r.resolution_y = RES
r.resolution_percentage = 100
r.film_transparent = True
scene.view_settings.view_transform = "Standard"  # keep the flag's colours true
r.image_settings.file_format = "PNG"
r.image_settings.color_mode = "RGBA"
scene.render.fps = 24
scene.frame_start = 1
scene.frame_end = WARMUP + KEEP

# Where the hoist (top and bottom of the pole edge) lands in the frame, in pixels from the top left.
def to_px(co):
    v = world_to_camera_view(scene, cam, Vector(co))
    return [round(v.x * RES[0], 1), round((1 - v.y) * RES[1], 1)]
meta = {"size": RES, "fps": 24, "hoistTop": to_px((0, 0, H)), "hoistBottom": to_px((0, 0, -H)), "keep": KEEP}
(OUT / "meta.json").write_text(json.dumps(meta))
print("META", meta, "engine", r.engine)

# Run the wind up, then render the frames we keep. Stepping frame by frame keeps the cloth cache in order.
for f in range(1, WARMUP + 1):
    scene.frame_set(f)
for k, f in enumerate(range(WARMUP + 1, WARMUP + KEEP + 1)):
    scene.frame_set(f)
    r.filepath = str(OUT / f"frame_{k:04d}.png")
    bpy.ops.render.render(write_still=True)
    if k % 20 == 0:
        print("rendered", k, flush=True)
print("DONE")
