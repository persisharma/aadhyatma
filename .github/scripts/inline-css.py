"""Inline website/styles.css into every page, in the CI working copy only.

The stylesheet is render-blocking: on a phone it costs a full round trip before
anything can paint. Inlining it at deploy time removes that trip while the
repository keeps one editable styles.css. Run from website/.
"""
import pathlib, re

css = pathlib.Path('styles.css').read_text()
# Strip comments and collapse whitespace; the file has no strings that care.
css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
css = re.sub(r'\s+', ' ', css).strip()

link = re.compile(r'<link rel="stylesheet" href="(?:\.\./)*/?styles\.css">')
count = 0
for page in pathlib.Path('.').rglob('*.html'):
    if 'node_modules' in page.parts:
        continue
    html = page.read_text()
    new, n = link.subn(lambda _: '<style>' + css + '</style>', html)
    if n:
        page.write_text(new)
        count += 1
print(f'inlined styles.css ({len(css)} bytes) into {count} pages')
