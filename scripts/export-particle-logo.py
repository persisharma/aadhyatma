#!/usr/bin/env python3
"""Export a review animation from the draft native reveal's exact assets/timing.
Requires Pillow (RAQM enabled) and ffmpeg; run from any working directory.
This is a source-based review export, not a capture or native fidelity verdict.
"""
from pathlib import Path
import argparse, hashlib, json, math, subprocess
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument("--output", type=Path, default=ROOT / "tmp/brand-reveal-export")
args = parser.parse_args()
args.output.mkdir(parents=True, exist_ok=True)
W, H, FPS = 720, 900, 30
SIZE, TOP = 280, 185
PAPER = (255, 241, 213)
data = json.loads((ROOT / "mobile/src/components/brandParticles.json").read_text())
asset = ROOT / "mobile/assets/splash-icon.png"
assert hashlib.sha256(asset.read_bytes()).hexdigest() == data["sha256"]
icon = Image.open(asset).convert("RGBA").resize((SIZE, SIZE), Image.Resampling.LANCZOS)
fonts = ROOT / "mobile/node_modules/@expo-google-fonts"
hi = ImageFont.truetype(str(fonts / "noto-serif-devanagari/600SemiBold/NotoSerifDevanagari_600SemiBold.ttf"), 58)
en = ImageFont.truetype(str(fonts / "cormorant-garamond/600SemiBold/CormorantGaramond_600SemiBold.ttf"), 43)
tag = ImageFont.truetype(str(fonts / "noto-serif-devanagari/500Medium/NotoSerifDevanagari_500Medium.ttf"), 29)

def interpolate(t, keys, values):
    for i in range(1, len(keys)):
        if t <= keys[i]:
            f = max(0, (t-keys[i-1]) / (keys[i]-keys[i-1]))
            return values[i-1] + f * (values[i]-values[i-1])
    return values[-1]

def frame(seconds):
    progress = 1 - (1-min(1, seconds/1.5))**3
    image = Image.new("RGBA", (W, H), PAPER+(255,))
    dots = Image.new("RGBA", (W, H))
    draw = ImageDraw.Draw(dots)
    alpha = interpolate(progress, [0, .5, .8, 1], [0, 1, 0, 0])
    drift = interpolate(progress, [0, .7, 1], [1, 0, 0])
    for i, (x,y,color) in enumerate(data["points"]):
        angle = i*2.399963
        radius = SIZE*(.6+(i%7)/14)
        x = (W-SIZE)/2+x*SIZE+math.cos(angle)*radius*drift
        y = TOP+y*SIZE+math.sin(angle)*radius*drift
        rgb = tuple(int(v) for v in color[4:-1].split(","))
        draw.ellipse((x-2.7,y-2.7,x+2.7,y+2.7), fill=rgb+(round(alpha*255),))
    image = Image.alpha_composite(image, dots)
    opacity = interpolate(progress, [0, .6, 1], [0, 1, 1])
    logo = icon.copy()
    logo.putalpha(logo.getchannel("A").point(lambda a: round(a*opacity)))
    image.alpha_composite(logo, (int((W-SIZE)/2), TOP))
    labels = Image.new("RGBA", (W,H))
    draw = ImageDraw.Draw(labels)
    dy = interpolate(progress, [0,.6,1], [33,0,0])
    for text, font, y, color in [
        ("वेदांश",hi, TOP+SIZE+37, (26,14,3)),
        ("Vedansh",en, TOP+SIZE+136, (138,62,11)),
        ("आपका आध्यात्मिक साथी",tag, TOP+SIZE+213, (90,58,30)),
    ]:
        draw.text((W/2, y+dy), text, font=font, fill=color+(round(opacity*255),), anchor="mt")
    return Image.alpha_composite(image, labels).convert("RGB")

mp4 = args.output / "vedansh-particle-logo.mp4"
process = subprocess.Popen(["ffmpeg","-y","-v","error","-f","rawvideo","-pix_fmt","rgb24",
    "-s",f"{W}x{H}","-r",str(FPS),"-i","pipe:0","-an","-c:v","libx264","-crf","18",
    "-pix_fmt","yuv420p","-movflags","+faststart",str(mp4)], stdin=subprocess.PIPE)
for index in range(FPS*3):
    process.stdin.write(frame(index/FPS).tobytes())
process.stdin.close()
assert process.wait() == 0
gif = args.output / "vedansh-particle-logo.gif"
subprocess.run(["ffmpeg","-y","-v","error","-i",str(mp4),"-filter_complex",
    "fps=18,scale=480:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=192[p];[b][p]paletteuse=dither=sierra2_4a",
    "-loop","0",str(gif)], check=True)
frame(1.5).save(args.output / "vedansh-particle-logo-poster.png")
manifest = {"commit": "see PR head", "source_sha256": data["sha256"], "duration_seconds": 3,
    "native_reveal_seconds": 1.5, "size": [W,H], "fonts": "existing Cormorant/Noto; custom reference lettering pending",
    "status": "source-based draft review export; not native device evidence",
    "files": {p.name: {"bytes":p.stat().st_size, "sha256":hashlib.sha256(p.read_bytes()).hexdigest()}
              for p in [mp4,gif]}}
(args.output / "manifest.json").write_text(json.dumps(manifest, indent=2)+"\n")
print(json.dumps(manifest, indent=2))

