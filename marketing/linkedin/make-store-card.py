"""
Build the side-by-side store-listing card used by posts/post-3-milestone.md.

    python3 make-store-card.py <play-screenshot.png> <ios-screenshot.png> [out.png]

Takes two raw phone screenshots of the store listings and produces one on-brand
landscape card: status bars and browser chrome cropped away, the developer
name/handle masked out of BOTH listings, and a caption under each panel carrying
the downloads-over-time figure the post is about.

Crop and mask rectangles are tuned to 1170x2532 (iPhone 13/14-class) screenshots
taken August 2026. New screenshots at a different size or with a different listing
layout will need the constants re-measured — crop a probe region and eyeball it
before trusting the output, and always check the masks actually landed on the
developer name.

Requires Pillow (pip install Pillow).
"""
import sys

from PIL import Image, ImageDraw, ImageFont

_here = __file__.rsplit('/', 1)[0]
SRC_PLAY = sys.argv[1] if len(sys.argv) > 1 else f'{_here}/shots/store-play.png'
SRC_IOS  = sys.argv[2] if len(sys.argv) > 2 else f'{_here}/shots/store-ios.png'
OUT      = sys.argv[3] if len(sys.argv) > 3 else f'{_here}/posts/milestone-stores.png'

# Caption under each panel — update alongside the numbers in the post copy.
CAP_IOS  = ('~90 downloads', 'in ~10 weeks')
CAP_PLAY = ('50+ downloads', 'in the first week')

# Brand palette (mirrors mobile/src/theme)
PARCHMENT = (243, 231, 201)
INK       = (26, 14, 3)
SAFFRON   = (184, 98, 27)
MUTED     = (120, 96, 62)

B  = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R  = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
f_label   = ImageFont.truetype(B, 40)
f_cap_big = ImageFont.truetype(B, 46)
f_cap_sm  = ImageFont.truetype(R, 36)

play = Image.open(SRC_PLAY).convert('RGB')
ios  = Image.open(SRC_IOS).convert('RGB')

# --- Play: crop below the status bar + Play header, through the stats row -----
# Mask the developer handle line (PII) with the listing's white background.
play_panel = play.crop((0, 356, 1170, 1090))  # through the Install button
ImageDraw.Draw(play_panel).rectangle([340, 480 - 356, 780, 566 - 356], fill=(255, 255, 255))

# --- iOS: crop below the status bar/nav, through the stats row ---------------
# Mask the truncated DEVELOPER column (PII) with the listing's black background,
# keeping the horizontal hairlines above and below the row intact.
ios_panel = ios.crop((0, 300, 1170, 1040))
ImageDraw.Draw(ios_panel).rectangle([1006, 748 - 300, 1170, 1012 - 300], fill=(0, 0, 0))

# --- Scale both panels to a common width ------------------------------------
PW = 1000
def scaled(im):
    return im.resize((PW, round(im.height * PW / im.width)), Image.LANCZOS)
play_panel, ios_panel = scaled(play_panel), scaled(ios_panel)
PH = max(play_panel.height, ios_panel.height)

def padded(im, bg):
    """Centre a shorter panel on its own listing background so both match height."""
    if im.height == PH:
        return im
    canvas = Image.new('RGB', (PW, PH), bg)
    canvas.paste(im, (0, (PH - im.height) // 2))
    return canvas
play_panel = padded(play_panel, (255, 255, 255))
ios_panel  = padded(ios_panel, (0, 0, 0))

def rounded(im, r=28):
    """Rounded corners over the parchment canvas."""
    mask = Image.new('L', im.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, im.width - 1, im.height - 1], r, fill=255)
    out = Image.new('RGBA', im.size)
    out.paste(im, (0, 0), mask)
    return out
play_panel, ios_panel = rounded(play_panel), rounded(ios_panel)

# --- Compose -----------------------------------------------------------------
M, GAP, LBL, CAP = 80, 70, 62, 130
W = M * 2 + PW * 2 + GAP
H = M + LBL + PH + CAP + M
card = Image.new('RGB', (W, H), PARCHMENT)
d = ImageDraw.Draw(card)

def centre(text, font, cx, y, fill):
    w = d.textbbox((0, 0), text, font=font)[2]
    d.text((cx - w / 2, y), text, font=font, fill=fill)

cols = [
    (M,            ios_panel,  'App Store',   CAP_IOS,  INK),
    (M + PW + GAP, play_panel, 'Google Play', CAP_PLAY, SAFFRON),  # saffron = the milestone
]
for x, panel, label, (big, small), big_fill in cols:
    cx = x + PW / 2
    centre(label.upper(), f_label, cx, M - 4, MUTED)
    card.paste(panel, (x, M + LBL), panel)
    y = M + LBL + PH + 26
    centre(big, f_cap_big, cx, y, big_fill)
    centre(small, f_cap_sm, cx, y + 56, MUTED)

card.save(OUT)
print(f'{OUT}  {card.size[0]}x{card.size[1]}')
