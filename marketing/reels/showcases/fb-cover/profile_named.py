"""Facebook profile picture variant: the yantra above the Hindi wordmark वेदांश, sized for the 176 px circle crop.
Usage: python profile_named.py [out_dir]   -> vedansh-fb-profile-hindi-1080.png + circle previews.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[4]
out = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "marketing/reels/out/fb-cover"
out.mkdir(parents=True, exist_ok=True)
N = 1080
yy, xx = np.mgrid[0:N, 0:N]
r = np.hypot(xx - N / 2, yy - N / 2) / (N / 2)
inner, outer = np.array([253, 238, 200]), np.array([245, 214, 152])
canvas = Image.fromarray((inner + (outer - inner) * np.clip(r, 0, 1)[..., None] ** 1.6).astype(np.uint8), "RGB")

ICON, TOP = 450, 168
# Lift only the yantra's linework off the icon's own parchment (lines are darker than their local background),
# so no lighter square shows on the field.
icon = Image.open(ROOT / "mobile/assets/icon.png").convert("RGB").resize((ICON, ICON), Image.LANCZOS)
lum = np.asarray(icon.convert("L"), np.float32)
local = np.asarray(icon.convert("L").filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(6)), np.float32)
alpha = np.clip((local - lum - 8) / 38, 0, 1)
alpha[np.hypot(*np.mgrid[0:ICON, 0:ICON] - ICON / 2) > ICON * 0.5] = 0
canvas.paste(icon, ((N - ICON) // 2, TOP), Image.fromarray((alpha * 255).astype(np.uint8), "L"))

mark = Image.open(ROOT / "mobile/assets/branding/wordmarks/hindi.png").convert("RGBA")
mw = 700
mark = mark.resize((mw, round(mark.height * mw / mark.width)), Image.LANCZOS)
my = TOP + ICON + 18
canvas.paste(mark, ((N - mw) // 2 + 18, my), mark)  # +18: optical centre (the feather overhangs right)

# Everything must sit inside the circle crop with a margin.
alpha = np.zeros((N, N), bool)
alpha[my:my + mark.height, (N - mw) // 2 + 18:(N - mw) // 2 + 18 + mw] |= np.array(mark.split()[-1]) > 40
assert r[alpha].max() < 0.95, f"wordmark reaches r={r[alpha].max():.2f} of the circle"
canvas.save(out / "vedansh-fb-profile-hindi-1080.png")

sheet = Image.new("RGB", (196 + 176 + 60, 236), (255, 255, 255))
for x, px in ((20, 196), (236, 176)):
    m = Image.new("L", (px * 4, px * 4), 0)
    ImageDraw.Draw(m).ellipse((0, 0, px * 4 - 1, px * 4 - 1), fill=255)
    sheet.paste(canvas.resize((px, px), Image.LANCZOS), (x, 20 if px == 196 else 30), m.resize((px, px), Image.LANCZOS))
sheet.save(out / "preview-profile-hindi-circle.png")
print(f"wordmark max radius {r[alpha].max():.2f}")
