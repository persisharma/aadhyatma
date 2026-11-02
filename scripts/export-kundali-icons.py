"""Export the approved masters without repainting. Usage: python script.py MASTERS_DIR"""
import hashlib
import json
import sys
from pathlib import Path
from PIL import Image

SUBJECTS = {
    'sun': 'Radiant golden Surya sun.png',
    'moon': 'Pearly Chandra Moon Icon.png',
    'mars': 'Terracotta Mars Icon.png',
    'mercury': 'Cratered Mercury in Antique Gold.png',
    'jupiter': 'Ochre-ivory Jupiter icon.png',
    'venus': 'Shukra’s Golden Cloud Planet.png',
    'saturn': 'Honey-ochre Shani with tilted rings.png',
    'rahu': 'Golden Rahu eclipse icon.png',
    'ketu': 'Golden Ketu Eclipse Medallion.png',
    'lagna': 'Golden Ascendant at Dawn.png',
    'nakshatra': 'Golden Nakshatra and Crescent Moon.png',
}

if __name__ == '__main__':
    masters = Path(sys.argv[1])
    output = Path(__file__).resolve().parents[1] / 'mobile/assets/icons/kundali'
    output.mkdir(parents=True, exist_ok=True)
    assets = []
    for name, filename in SUBJECTS.items():
        source = masters / filename
        image = Image.open(source).convert('RGBA')
        image.thumbnail((256, 256), Image.Resampling.LANCZOS)
        image = image.quantize(colors=256, method=Image.Quantize.FASTOCTREE)
        target = output / (name + '.png')
        image.save(target, optimize=True)
        data = target.read_bytes()
        assets.append({
            'id': name, 'file': target.name, 'width': image.width, 'height': image.height,
            'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest(),
            'masterName': filename, 'masterSha256': hashlib.sha256(source.read_bytes()).hexdigest(),
            'source': 'Owner-approved ImageGen master from the 1 November 2026 Kundali design conversation',
        })
    manifest = {
        'version': 1, 'budgetBytes': 300000,
        'export': '256px transparent palette PNG; Lanczos fit, FASTOCTREE 256 colors, optimize; no repainting',
        'promptProvenance': 'Exact original generation-prompt transcript pending recovery; these are reused approved masters',
        'assets': assets,
    }
    (output / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'subjects': len(assets), 'shippedBytes': sum(item['bytes'] for item in assets)}))
