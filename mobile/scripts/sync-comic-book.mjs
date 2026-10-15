#!/usr/bin/env node
// Preserve the reviewed bilingual edition verbatim; native screens consume data,
// never the authoring website or its navigation/review chrome.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../../', import.meta.url));
const source = path.join(root, 'docs/content-parity/ramayan-comic/balakanda-bilingual-v2');
const book = JSON.parse(readFileSync(path.join(source, 'book.json'), 'utf8'));
const manifest = JSON.parse(readFileSync(path.join(root, 'mobile/src/data/comicAssetManifest.json'), 'utf8'));
const episodes = book.episodes.map(episode => ({
  ...episode,
  panels: episode.panels.map(panel => {
    const art = path.basename(panel.asset, '.png');
    const hash = createHash('sha256').update(readFileSync(path.resolve(source, panel.asset))).digest('hex');
    if (manifest.assets[art]?.hash !== hash.slice(0, 16)) throw new Error(`Unreviewed art: ${panel.id}`);
    const { asset, ...rest } = panel;
    return { ...rest, art, sha256: hash };
  }),
}));
const output = JSON.stringify({ ...book, episodes }, null, 2) + '\n';
const destination = path.join(root, 'mobile/src/data/comicBooks/balakanda.json');
if (process.argv.includes('--check')) {
  if (readFileSync(destination, 'utf8') !== output) throw new Error('Run node mobile/scripts/sync-comic-book.mjs');
} else writeFileSync(destination, output);
console.log(`Native comic: ${episodes.length} episodes, ${episodes.flatMap(e => e.panels).length} panels, reviewed text/frames/anchors preserved`);
