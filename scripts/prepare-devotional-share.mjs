#!/usr/bin/env node
/**
 * Publish the Daily Bhakti devotional share masters to R2 (prefix `devotional-share`).
 * The reviewed provenance lives in mobile/assets/devotional-share/manifest.json
 * (sha256, size, dimensions); this script checks every source against it, stages
 * the files, and writes the app manifest the share card resolves through.
 *   node scripts/prepare-devotional-share.mjs --verify        # sources == provenance == app manifest
 *   node scripts/prepare-devotional-share.mjs                 # stage under scripts/.cache (no network)
 *   node scripts/prepare-devotional-share.mjs --verify --cdn  # public objects match the source bytes
 * Upload the staged files with the shared uploader or wrangler (immutable cache-control).
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const folder = path.join(root, 'mobile/assets/devotional-share');
const provenance = JSON.parse(readFileSync(path.join(folder, 'manifest.json'), 'utf8'));
const manifestPath = path.join(root, 'mobile/src/data/devotionalShareManifest.json');
const stage = path.join(root, 'scripts/.cache/devotional-share');
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const manifest = { prefix: 'devotional-share', assets: {} };
const sources = { ...provenance.assets, ...provenance.subjects };
for (const [stem, source] of Object.entries(sources).sort(([a], [b]) => a.localeCompare(b))) {
  const bytes = readFileSync(path.join(folder, source.file));
  assert.equal(sha256(bytes), source.sha256, `Changed/unreviewed master: ${stem}`);
  assert.equal(bytes.length, source.bytes, stem);
  if (source.publication === 'pending') continue;
  manifest.assets[stem] = { hash: source.sha256.slice(0, 16), ext: path.extname(source.file).slice(1), width: source.width, height: source.height };
}

if (process.argv.includes('--verify')) {
  assert.deepEqual(JSON.parse(readFileSync(manifestPath, 'utf8')), manifest, 'App manifest differs from the reviewed masters');
  console.log(`Verified ${Object.keys(manifest.assets).length} devotional share masters against their provenance`);
} else {
  rmSync(stage, { recursive: true, force: true });
  mkdirSync(stage, { recursive: true });
  for (const [stem, asset] of Object.entries(manifest.assets)) copyFileSync(path.join(folder, sources[stem].file), path.join(stage, `${asset.hash}.${asset.ext}`));
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`Staged ${Object.keys(manifest.assets).length} masters as <hash>.<ext> in ${path.relative(root, stage)}; upload pending`);
}

if (process.argv.includes('--cdn')) {
  const base = (process.env.EXPO_PUBLIC_ASSET_BASE_URL || 'https://cdn.vedansh.app').replace(/\/+$/, '');
  for (const [stem, asset] of Object.entries(manifest.assets)) {
    const response = await fetch(`${base}/${manifest.prefix}/${asset.hash}.${asset.ext}`);
    assert.ok(response.ok, `${stem}: HTTP ${response.status}`);
    assert.equal(sha256(Buffer.from(await response.arrayBuffer())), sources[stem].sha256, `${stem}: CDN bytes differ`);
  }
  console.log('All public devotional share objects match the reviewed source SHA-256 values');
}
