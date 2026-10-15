#!/usr/bin/env node
// Verify reviewed originals, native frames, CDN bytes, and optional export maps.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
const root = fileURLToPath(new URL('../../', import.meta.url));
const source = path.join(root, 'docs/content-parity/ramayan-comic/balakanda-bilingual-v2');
const reviewed = JSON.parse(readFileSync(path.join(source, 'asset-manifest.json'), 'utf8'));
const manifest = JSON.parse(readFileSync(path.join(root, 'mobile/src/data/comicAssetManifest.json'), 'utf8'));
const book = JSON.parse(readFileSync(path.join(root, 'mobile/src/data/comicBooks/balakanda.json'), 'utf8'));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const assets = Object.entries(reviewed.assets).map(([relative, asset]) => ({ relative, ...asset, file: path.resolve(source, relative), stem: path.basename(relative, '.png') }));
const results = [];
for (const asset of assets) {
  const bytes = readFileSync(asset.file);
  assert.equal(hash(bytes), asset.sha256);
  assert.equal(manifest.assets[asset.stem].hash, asset.sha256.slice(0, 16));
  for (const frame of asset.panels) {
    const panel = book.episodes.flatMap(e => e.panels).find(p => p.id === frame.id);
    assert.deepEqual(panel.frame, frame.frame);
    assert.equal(panel.sha256, asset.sha256);
  }
  const url = `https://cdn.vedansh.app/${manifest.prefix}/${asset.sha256.slice(0, 16)}.png`;
  if (process.argv.includes('--cdn')) {
    const response = await fetch(url);
    assert.equal(response.status, 200, url);
    const data = Buffer.from(await response.arrayBuffer());
    assert.match(response.headers.get('content-type'), /image\/png/);
    assert.equal(hash(data), asset.sha256, url);
    results.push({ url, bytes: data.length, sha256: asset.sha256, status: response.status });
  }
}
for (const [index, arg] of process.argv.entries()) {
  if (arg !== '--assetmap') continue;
  const filename = process.argv[index + 1];
  const map = JSON.parse(readFileSync(filename, 'utf8'));
  for (const asset of Object.values(map)) {
    for (const file of asset.files ?? []) {
      assert(!file.includes('ramayan-comic'), `Comic art bundled: ${file}`);
      const bytes = readFileSync(path.resolve(root, 'mobile', file));
      assert(!assets.some(a => a.sha256 === hash(bytes)), `Renamed comic art bundled: ${file}`);
    }
  }
}
const report = { checkedAt: new Date().toISOString(), assets: assets.length, panels: book.panelCount, cdn: results };
const output = process.argv.indexOf('--output');
if (output !== -1) writeFileSync(process.argv[output + 1], JSON.stringify(report, null, 2) + '\n');
console.log(`Verified ${assets.length} reviewed originals and 140 native frames; ${results.length} complete CDN GET/hash checks`);
