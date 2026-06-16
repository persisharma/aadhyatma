#!/usr/bin/env python3
"""Generate the Panchang screen's faded-sketch background.

Follows design.md §6 (Background Image System) + §2 (filters): a warm
parchment-tone sketch, low-contrast sepia line art at ~50% strength, subject
top-anchored so the bottom third of the frame stays clean for content. The
motif is a celestial almanac — a rashi/zodiac wheel with a Surya (sun) hub, a
Chandra (crescent moon), and scattered nakshatra stars — the iconography of a
Hindu panchang.

Output: mobile/assets/backgrounds/panchang-celestial-almanac.png (1024×1024,
matching the other background plates). Re-running produces a byte-identical
diff. Image assets are normally commissioned externally; this generator keeps
the panchang plate reproducible since it is purely procedural line art.
"""

import math
import os

from PIL import Image, ImageDraw, ImageFilter

# --- canvas -----------------------------------------------------------------
OUT = os.path.join(
    os.path.dirname(__file__),
    "..",
    "mobile",
    "assets",
    "backgrounds",
    "panchang-celestial-almanac.png",
)
SIZE = 1024
SS = 2  # supersample factor for antialiasing
W = SIZE * SS

# --- palette (from design.md §2 tokens) -------------------------------------
PARCHMENT_TOP = (246, 236, 208)      # #F6ECD0  home gradient top
PARCHMENT_BOTTOM = (233, 217, 177)   # #E9D9B1  parchment-deep
SEPIA = (138, 62, 11)                # #8A3E0B  saffron-deep — the "ink" of the sketch
GOLD = (166, 124, 52)                # #A67C34  gold accent

# Centre the celestial wheel in the TOP third so the bottom stays clean.
CX = W * 0.5
CY = W * 0.34


def lerp(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def base_parchment():
    """Vertical parchment gradient with a soft saffron glow behind the hub."""
    img = Image.new("RGB", (W, W))
    px = img.load()
    for y in range(W):
        row = lerp(PARCHMENT_TOP, PARCHMENT_BOTTOM, y / (W - 1))
        for x in range(W):
            px[x, y] = row
    # radial saffron glow behind the wheel hub, drawn on an alpha overlay
    glow = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    rmax = W * 0.42
    steps = 60
    for i in range(steps, 0, -1):
        r = rmax * i / steps
        a = int(26 * (1 - i / steps))  # subtle, peaks at centre
        gd.ellipse([CX - r, CY - r, CX + r, CY + r], fill=(184, 98, 27, a))
    img = Image.alpha_composite(img.convert("RGBA"), glow)
    return img


def ring(d, cx, cy, r, width, color, alpha):
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=color + (alpha,), width=width)


def draw_sketch(overlay):
    """Draw the faded celestial line art onto a transparent RGBA overlay."""
    d = ImageDraw.Draw(overlay)

    R_OUTER = W * 0.30
    R_MID = W * 0.255
    R_INNER = W * 0.205
    R_HUB = W * 0.085

    lw = max(2, round(2.2 * SS))

    # --- concentric rashi-chakra rings --------------------------------------
    ring(d, CX, CY, R_OUTER, lw, SEPIA, 70)
    ring(d, CX, CY, R_MID, max(2, round(1.4 * SS)), GOLD, 60)
    ring(d, CX, CY, R_INNER, lw, SEPIA, 70)

    # --- 12 rashi spokes between the inner and mid rings --------------------
    for k in range(12):
        ang = math.pi * 2 * k / 12 - math.pi / 2
        x1 = CX + R_INNER * math.cos(ang)
        y1 = CY + R_INNER * math.sin(ang)
        x2 = CX + R_MID * math.cos(ang)
        y2 = CY + R_MID * math.sin(ang)
        d.line([x1, y1, x2, y2], fill=SEPIA + (55,), width=max(1, round(1.3 * SS)))

    # --- 27 nakshatra ticks on the outer ring -------------------------------
    for k in range(27):
        ang = math.pi * 2 * k / 27 - math.pi / 2
        x1 = CX + (R_MID + 4 * SS) * math.cos(ang)
        y1 = CY + (R_MID + 4 * SS) * math.sin(ang)
        x2 = CX + R_OUTER * math.cos(ang)
        y2 = CY + R_OUTER * math.sin(ang)
        d.line([x1, y1, x2, y2], fill=GOLD + (45,), width=max(1, round(1.1 * SS)))

    # --- Surya (sun) hub with radiating rays --------------------------------
    ring(d, CX, CY, R_HUB, lw, SEPIA, 80)
    n_rays = 24
    for k in range(n_rays):
        ang = math.pi * 2 * k / n_rays
        rr = R_HUB + (W * 0.05 if k % 2 == 0 else W * 0.03)
        x1 = CX + (R_HUB + 3 * SS) * math.cos(ang)
        y1 = CY + (R_HUB + 3 * SS) * math.sin(ang)
        x2 = CX + rr * math.cos(ang)
        y2 = CY + rr * math.sin(ang)
        d.line([x1, y1, x2, y2], fill=SEPIA + (60,), width=max(1, round(1.4 * SS)))
    # tiny inner sun disc outline
    ring(d, CX, CY, R_HUB * 0.5, max(1, round(1.4 * SS)), GOLD, 70)

    # --- Chandra (crescent moon), upper-left, drawn by ring subtraction -----
    mx, my, mr = CX - R_OUTER * 0.92, CY - R_OUTER * 0.78, W * 0.05
    crescent = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    cd = ImageDraw.Draw(crescent)
    cd.ellipse([mx - mr, my - mr, mx + mr, my + mr], outline=SEPIA + (85,),
               width=max(2, round(2.2 * SS)))
    # erase a shifted disc to carve the crescent
    off = mr * 0.62
    cd.ellipse([mx - mr + off, my - mr - off * 0.3,
                mx + mr + off, my + mr - off * 0.3], fill=(0, 0, 0, 0))
    overlay.alpha_composite(crescent)

    # --- nakshatra stars scattered across the upper sky ---------------------
    stars = [
        (0.18, 0.10), (0.30, 0.07), (0.44, 0.12), (0.62, 0.06), (0.74, 0.11),
        (0.86, 0.09), (0.12, 0.22), (0.88, 0.24), (0.08, 0.40), (0.93, 0.42),
        (0.70, 0.20), (0.26, 0.18), (0.55, 0.04), (0.40, 0.46), (0.60, 0.46),
    ]
    for fx, fy in stars:
        sx, sy = fx * W, fy * W
        s = W * 0.006
        d.line([sx - s * 2, sy, sx + s * 2, sy], fill=GOLD + (70,),
               width=max(1, round(1.2 * SS)))
        d.line([sx, sy - s * 2, sx, sy + s * 2], fill=GOLD + (70,),
               width=max(1, round(1.2 * SS)))
        d.ellipse([sx - s, sy - s, sx + s, sy + s], fill=SEPIA + (55,))


def main():
    img = base_parchment()

    overlay = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    draw_sketch(overlay)
    # soften the line art so it reads as a faint sketch, never fighting text
    overlay = overlay.filter(ImageFilter.GaussianBlur(radius=0.6 * SS))
    img = Image.alpha_composite(img, overlay)

    # downsample for antialiasing, flatten to RGB
    img = img.convert("RGB").resize((SIZE, SIZE), Image.LANCZOS)

    img.save(OUT, optimize=True)
    print(f"wrote {OUT} ({SIZE}x{SIZE})")


if __name__ == "__main__":
    main()
