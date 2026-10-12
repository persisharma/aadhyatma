#!/usr/bin/env node
/** Release gate: exact CDN bytes and zero story images in production export maps.
 * node scripts/verify-kids-story-assets.mjs --cdn \
 *   --assetmap tmp/ios/assetmap.json --assetmap tmp/android/assetmap.json \
 *   --output tmp/kids-story-asset-check.json
 * Uses Node built-ins; never uploads or changes source/manifest files.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { values } = parseArgs({ options: {
  cdn: { type: 'boolean', default: false },
  assetmap: { type: 'string', multiple: true, default: [] },
  output: { type: 'string' },
} });
if (!values.cdn && !values.assetmap.length) {
  console.error('Pass --cdn and/or --assetmap <production export assetmap.json> (repeat for both platforms).');
  process.exit(1);
}
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const webp = bytes => bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF'
  && bytes.toString('ascii', 8, 12) === 'WEBP' && bytes.readUInt32LE(4) + 8 === bytes.length;
const manifestPath = path.join(root, 'mobile/src/data/kidsStoryAssetManifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath));
const config = fs.readFileSync(path.join(root, 'mobile/src/data/assetManifest.ts'), 'utf8');
const baseUrl = config.match(/PRODUCTION_ASSET_BASE_URL\s*=\s*['"]([^'"]+)['"]/)?.[1];
if (!baseUrl?.startsWith('https://')) throw Error('Missing production HTTPS asset base URL');
const assets = Object.entries(manifest.assets).map(([stem, entry]) => {
  const source = path.join(root, 'mobile/assets/kids-stories', `${stem}.${entry.ext}`);
  const bytes = fs.readFileSync(source);
  const sha256 = hash(bytes);
  if (!webp(bytes) || sha256.slice(0, 16) !== entry.hash) throw Error(`Invalid source/manifest: ${stem}`);
  return { stem, sha256, bytes: bytes.length, url: `${baseUrl}/${manifest.prefix}/${entry.hash}.${entry.ext}` };
});
const storyHashes = new Set(assets.map(a => a.sha256));
const proof = { checkedAtUtc: new Date().toISOString(), baseUrl,
  manifestSha256: hash(fs.readFileSync(manifestPath)), sourceAssets: assets.length,
  method: 'Compare full source SHA-256 and WebP container for every manifest object. Export gate checks image bytes as well as story paths, catching renamed/copied files. Full visual decode/native/offline review remains separate.',
  exports: [], cdn: [], failures: [] };

for (const filename of values.assetmap) {
  const assetmap = JSON.parse(fs.readFileSync(filename));
  const bundled = new Set();
  for (const asset of Object.values(assetmap)) for (const filename of asset.files ?? []) {
    if (/\.(?:webp|png|jpe?g)$/i.test(filename)) {
      const isStoryPath = /(?:^|[/\\])(?:kids-stories|krishna-janma)[/\\]/.test(filename);
      // Read every image so a renamed or relocated copy is also rejected.
      if (isStoryPath || storyHashes.has(hash(fs.readFileSync(filename)))) bundled.add(filename);
    }
  }
  proof.exports.push({ assetmap: filename, sha256: hash(fs.readFileSync(filename)),
    groups: Object.keys(assetmap).length, bundledStoryImages: [...bundled] });
  if (bundled.size) proof.failures.push(`${filename}: ${bundled.size} bundled story image(s)`);
}

if (values.cdn) {
  let next = 0;
  await Promise.all(Array.from({ length: 6 }, async () => {
    while (next < assets.length) {
      const asset = assets[next++];
      try {
        const response = await fetch(asset.url, { signal: AbortSignal.timeout(30000), redirect: 'follow' });
        const bytes = Buffer.from(await response.arrayBuffer());
        const sha256 = hash(bytes);
        const contentType = response.headers.get('content-type');
        const passed = response.status === 200 && sha256 === asset.sha256 && webp(bytes)
          && contentType?.split(';')[0].trim() === 'image/webp';
        proof.cdn.push({ ...asset, expectedSha256: asset.sha256, sha256, status: response.status,
          responseBytes: bytes.length, contentType, cacheControl: response.headers.get('cache-control'), passed });
        if (!passed) proof.failures.push(`${asset.stem}: HTTP ${response.status}, hash/container/type mismatch`);
      } catch (error) {
        proof.cdn.push({ ...asset, passed: false, error: String(error.message) });
        proof.failures.push(`${asset.stem}: ${error.message}`);
      }
    }
  }));
  proof.cdn.sort((a, b) => a.stem.localeCompare(b.stem));
}
if (values.output) {
  fs.mkdirSync(path.dirname(values.output), { recursive: true });
  fs.writeFileSync(values.output, JSON.stringify(proof, null, 2) + '\n');
}
console.log(JSON.stringify({ sourceAssets: assets.length, cdnChecked: proof.cdn.length,
  cdnPassed: proof.cdn.filter(a => a.passed).length,
  exports: proof.exports.map(e => ({ assetmap: e.assetmap, bundledStoryImages: e.bundledStoryImages.length })),
  failures: proof.failures }, null, 2));
if (proof.failures.length) process.exitCode = 1;
