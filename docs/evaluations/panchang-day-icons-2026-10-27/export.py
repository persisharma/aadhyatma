"""Rebuild the six Panchang PNG exports and their manifest from retained original masters."""
from pathlib import Path
import hashlib
import json
from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
ASSETS = ROOT / 'mobile/assets/icons/storybook'

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def export():
    manifest_path = ASSETS / 'manifest.json'
    manifest = json.loads(manifest_path.read_text())
    sources = json.loads((HERE / 'sources.json').read_text())
    names = {source['name'] for source in sources}
    manifest['icons'] = [icon for icon in manifest['icons'] if icon['name'] not in names]
    for source in sources:
        name = source['name']
        master = HERE / 'masters' / f'{name}.png'
        assert sha(master) == source['sourceSha256']
        image = Image.open(master).convert('RGBA')
        image.putalpha(image.getchannel('A').point(lambda a: 0 if a < 8 else a))
        bounds = image.getbbox()
        image = image.crop(bounds)
        scale = 432 / max(image.size)
        image = image.resize(tuple(round(side * scale) for side in image.size), Image.Resampling.LANCZOS)
        canvas = Image.new('RGBA', (512, 512))
        canvas.paste(image, ((512 - image.width) // 2, (512 - image.height) // 2))
        canvas.putalpha(canvas.getchannel('A').point(lambda a: 0 if a < 8 else a))
        palette = canvas.quantize(colors=256, method=Image.Quantize.FASTOCTREE)
        shipped = ASSETS / f'{name}.png'
        palette.save(shipped, optimize=True)
        decoded = Image.open(shipped).convert('RGBA')
        manifest['icons'].append({
            'name': name, 'file': shipped.name, 'width': 512, 'height': 512,
            'bytes': shipped.stat().st_size, 'sha256': sha(shipped),
            'masterSha256': sha(master), 'sourceSha256': source['sourceSha256'],
            'visibleBounds': list(decoded.getbbox()), 'alphaExtrema': list(decoded.getchannel('A').getextrema()),
            'provenanceFile': f'../../../../docs/evaluations/panchang-day-icons-2026-10-27/masters/{name}.png',
            'source': 'Original individually generated transparent master; codex-brief.md, prompts.json and sources.json retain provenance',
        })
    manifest_path.write_text(json.dumps(manifest, indent=2) + '\n')

if __name__ == '__main__':
    export()
