#!/usr/bin/env node
// Copy the approved illustrated edition; never import artwork into Metro.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../../', import.meta.url));
const source = path.join(root, 'docs/content-parity/ramayan-comic/balakanda-illustrated-v3');
const book = JSON.parse(readFileSync(path.join(source, 'book.json'), 'utf8'));
const manifest = JSON.parse(readFileSync(path.join(source, 'asset-manifest.json'), 'utf8'));
for (const panel of book.episodes.flatMap(e => e.panels)) {
  const hash = createHash('sha256').update(readFileSync(path.join(source, 'assets', panel.art + '.png'))).digest('hex');
  if (hash !== panel.sha256 || manifest.assets[panel.art]?.hash !== hash.slice(0, 16)) throw new Error(`Unreviewed art: ${panel.id}`);
}
const outputs = [
  ['mobile/src/data/comicBooks/balakanda.json', book],
  ['mobile/src/data/comicAssetManifest.json', manifest],
];
for (const [relative, data] of outputs) {
  const file = path.join(root, relative), output = JSON.stringify(data, null, 2) + '\n';
  if (process.argv.includes('--check')) {
    if (readFileSync(file, 'utf8') !== output) throw new Error(`Out of sync: ${relative}`);
  } else writeFileSync(file, output);
}
console.log(`Native comic: ${book.episodes.length} episodes, ${book.pages.length} pages, ${book.panelCount} shots, four languages`);
