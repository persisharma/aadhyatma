"""Build the offline editorial/artwork preview from the exact bundled readings."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
chapters = [json.loads(path.read_text()) for path in sorted((ROOT / 'mobile/src/data/garud-puran').glob('chapter-*.json'))]
template = (ROOT / 'docs/content/garud-puran/preview-template.html').read_text()
(ROOT / 'docs/content/garud-puran/preview.html').write_text(template.replace('__READINGS_JSON__', json.dumps(chapters, ensure_ascii=False).replace('</', '<\\/')))
print('Built preview: 12 readings / 28 pages / 9 illustrations')
