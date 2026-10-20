"""Authoring only: python scripts/build-devotional-font.py VARIABLE_FONT.ttf (requires fonttools)."""
from pathlib import Path
import hashlib
import json
import sys
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

root = Path(__file__).resolve().parent.parent / 'assets/fonts'
spec = json.loads((root / 'manifest.json').read_text())
source = Path(sys.argv[1])
if hashlib.sha256(source.read_bytes()).hexdigest() != spec['sourceSha256']:
    raise ValueError('Source font hash mismatch')
font = instantiateVariableFont(TTFont(source), spec['axes'], inplace=True)
for name in font['name'].names:
    if name.nameID in (1, 4, 6, 16):
        name.string = spec['family'].encode(name.getEncoding())
    elif name.nameID in (2, 17):
        name.string = 'Regular'.encode(name.getEncoding())
font.recalcTimestamp = False
font.save(root / spec['file'])
print(root / spec['file'])
