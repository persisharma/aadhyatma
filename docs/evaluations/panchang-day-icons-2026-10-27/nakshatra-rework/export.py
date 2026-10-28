"""Normalize the retained Image Gen master; preserve painted colors and alpha."""
from pathlib import Path
import hashlib
import json
from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
ASSETS = ROOT / 'mobile/assets/icons/storybook'

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

master = HERE / 'master.png'
image = Image.open(master).convert('RGBA')
image.putalpha(image.getchannel('A').point(lambda a: 0 if a < 8 else a))
image = image.crop(image.getbbox())
scale = 432 / max(image.size)
image = image.resize(tuple(round(side * scale) for side in image.size), Image.Resampling.LANCZOS)
canvas = Image.new('RGBA', (512, 512))
canvas.paste(image, ((512 - image.width) // 2, (512 - image.height) // 2))
canvas.putalpha(canvas.getchannel('A').point(lambda a: 0 if a < 8 else a))
shipped = ASSETS / 'nakshatra.png'
canvas.quantize(colors=256, method=Image.Quantize.FASTOCTREE).save(shipped, optimize=True)
decoded = Image.open(shipped).convert('RGBA')
manifest_path = ASSETS / 'manifest.json'
manifest = json.loads(manifest_path.read_text())
icon = next(icon for icon in manifest['icons'] if icon['name'] == 'nakshatra')
icon.update({
    'bytes': shipped.stat().st_size, 'sha256': sha(shipped),
    'masterSha256': sha(master), 'sourceSha256': sha(master),
    'visibleBounds': list(decoded.getbbox()), 'alphaExtrema': list(decoded.getchannel('A').getextrema()),
    'provenanceFile': '../../../../docs/evaluations/panchang-day-icons-2026-10-27/nakshatra-rework/master.png',
    'source': 'Image Gen edit of retained reference; prompt.json and export.py retain provenance',
})
manifest_path.write_text(json.dumps(manifest, indent=2) + '\n')
print(json.dumps(icon, indent=2))
