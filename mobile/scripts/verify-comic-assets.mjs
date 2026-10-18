#!/usr/bin/env node
// Verify reviewed originals, native frames, CDN bytes, and optional export maps.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
const root = fileURLToPath(new URL('../../', import.meta.url));
const source = path.join(root, 'docs/content-parity/ramayan-comic/balakanda-illustrated-v3');
const reviewed = JSON.parse(readFileSync(path.join(source, 'asset-manifest.json'), 'utf8'));
const manifest = JSON.parse(readFileSync(path.join(root, 'mobile/src/data/comicAssetManifest.json'), 'utf8'));
const book = JSON.parse(readFileSync(path.join(root, 'mobile/src/data/comicBooks/balakanda.json'), 'utf8'));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
assert.equal(reviewed.prefix, manifest.prefix);
const assets = Object.entries(reviewed.assets).map(([stem, entry]) => {
  const file = path.join(source, 'assets', `${stem}.png`);
  const bytes = readFileSync(file);
  const sha256 = hash(bytes);
  assert.equal(sha256.slice(0, 16), entry.hash, `${stem} manifest hash`);
  assert.equal(manifest.assets[stem].hash, entry.hash, `${stem} app manifest hash`);
  return { stem, file, sha256, bytes: bytes.length,
    url: `https://cdn.vedansh.app/${manifest.prefix}/${entry.hash}.png` };
});
const results = [], exports = [];
for (const asset of assets) {
  const bytes = readFileSync(asset.file);
  const panels = book.episodes.flatMap(e => e.panels).filter(p => p.art === asset.stem);
  assert(panels.length > 0, `${asset.stem} has no native panels`);
  for (const panel of panels) assert.equal(panel.sha256, asset.sha256, `${panel.id} source hash`);
  if (process.argv.includes('--cdn')) {
    const response = await fetch(asset.url, { signal: AbortSignal.timeout(30000) });
    assert.equal(response.status, 200, asset.url);
    const data = Buffer.from(await response.arrayBuffer());
    assert.match(response.headers.get('content-type'), /image\/png/);
    assert.equal(hash(data), asset.sha256, asset.url);
    results.push({ url: asset.url, bytes: data.length, sha256: asset.sha256, status: response.status });
  }
}
for (const [index, arg] of process.argv.entries()) {
  if (arg !== '--assetmap') continue;
  const filename = process.argv[index + 1];
  const map = JSON.parse(readFileSync(filename, 'utf8'));
  const bundled = [];
  for (const asset of Object.values(map)) {
    for (const file of asset.files ?? []) {
      assert(!file.includes('ramayan-comic'), `Comic art bundled: ${file}`);
      const bytes = readFileSync(path.resolve(root, 'mobile', file));
      assert(!assets.some(a => a.sha256 === hash(bytes)), `Renamed comic art bundled: ${file}`);
      if (/\.(?:png|jpe?g|webp)$/i.test(file)) bundled.push(file);
    }
  }
  exports.push({ assetmap: path.relative(root, filename), sha256: hash(readFileSync(filename)),
    groups: Object.keys(map).length, imageFiles: bundled.length, comicArtworkBundled: false });
}
const report = { checkedAt: new Date().toISOString(), assets: assets.length, panels: book.panelCount, exports, cdn: results };
const output = process.argv.indexOf('--output');
if (output !== -1) writeFileSync(process.argv[output + 1], JSON.stringify(report, null, 2) + '\n');
console.log(`Verified ${assets.length} reviewed originals and ${book.panelCount} native panels; ${results.length} complete CDN GET/hash checks`);
