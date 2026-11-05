"""Facebook Page profile picture from the approved app icon, made safe for Facebook's circular crop.

The icon's outer ring nearly touches its square edge, so a direct upload clips the ring in the circle crop.
The yantra is scaled to 86 % on a parchment field matching the icon's own background, and a feathered
edge blends the icon's square border into it. Writes a 1080x1080 PNG plus a 176/196 px circle preview.
Usage: python profile.py [out_dir]
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[4]
out = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "marketing/reels/out/fb-cover"
out.mkdir(parents=True, exist_ok=True)
N, SCALE = 1080, 0.86

yy, xx = np.mgrid[0:N, 0:N]
r = np.hypot(xx - N / 2, yy - N / 2) / (N / 2)
inner, outer = np.array([252, 233, 188]), np.array([245, 214, 152])  # sampled from the icon's parchment
field = (inner + (outer - inner) * np.clip(r, 0, 1)[..., None] ** 1.6).astype(np.uint8)
canvas = Image.fromarray(field, "RGB")

size = int(N * SCALE)
icon = Image.open(ROOT / "mobile/assets/icon.png").convert("RGB").resize((size, size), Image.LANCZOS)
mask = Image.new("L", (size, size), 0)
ImageDraw.Draw(mask).rectangle((size * 0.03, size * 0.03, size * 0.97, size * 0.97), fill=255)  # feather only the square edge
mask = mask.filter(ImageFilter.GaussianBlur(size * 0.012))
off = (N - size) // 2
canvas.paste(icon, (off, off), mask)
canvas.save(out / "vedansh-fb-profile-1080.png")

previews = []
for px in (196, 176):
    p = canvas.resize((px, px), Image.LANCZOS)
    m = Image.new("L", (px * 4, px * 4), 0)
    ImageDraw.Draw(m).ellipse((0, 0, px * 4 - 1, px * 4 - 1), fill=255)
    tile = Image.new("RGB", (px, px), (255, 255, 255))
    tile.paste(p, (0, 0), m.resize((px, px), Image.LANCZOS))
    previews.append(tile)
sheet = Image.new("RGB", (196 + 176 + 60, 236), (255, 255, 255))
sheet.paste(previews[0], (20, 20)); sheet.paste(previews[1], (236, 30))
sheet.save(out / "preview-profile-circle.png")
print(out / "vedansh-fb-profile-1080.png")
