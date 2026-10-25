#!/usr/bin/env node
/** Stage the reviewed puja paintings for R2; default mode makes no network calls. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sources = JSON.parse(readFileSync(path.join(root, 'mobile/src/data/vidhiArtworkSources.json'), 'utf8'));
const manifestPath = path.join(root, 'mobile/src/data/vidhiArtworkManifest.json');
const stage = path.join(root, 'scripts/.cache/vidhi-steps');
const candidate = path.join(stage, 'manifest.json');
const { imageSize } = createRequire(path.join(root, 'mobile/package.json'))('image-size');
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const manifest = { prefix: 'vidhi-steps', assets: {} };
assert.equal(sources.prefix, manifest.prefix);
for (const [stem, source] of Object.entries(sources.assets).sort(([a], [b]) => a.localeCompare(b))) {
  assert.match(stem, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  const bytes = readFileSync(path.join(root, source.file));
  const { width, height } = imageSize(bytes);
  assert.equal(sha256(bytes), source.sha256, `Changed/unreviewed painting: ${stem}`);
  assert.equal(width, source.width, stem);
  assert.equal(height, source.height, stem);
  assert.ok(existsSync(path.join(root, source.review)), `Missing review: ${stem}`);
  manifest.assets[stem] = { hash: source.sha256.slice(0, 16), ext: 'webp', width, height };
}

if (process.argv.includes('--verify')) {
  assert.deepEqual(JSON.parse(readFileSync(manifestPath, 'utf8')), manifest, 'App manifest differs from reviewed source paintings');
  console.log(`Verified ${Object.keys(manifest.assets).length} reviewed R2 mappings locally; no CDN claim`);
} else {
  rmSync(stage, { recursive: true, force: true });
  mkdirSync(stage, { recursive: true });
  for (const [stem, source] of Object.entries(sources.assets)) copyFileSync(path.join(root, source.file), path.join(stage, `${stem}.webp`));
  writeFileSync(candidate, JSON.stringify(manifest, null, 2) + '\n');
  if (process.argv.includes('--upload')) {
    const args = [path.join(root, 'scripts/upload-r2-assets.mjs'), '--dir', stage,
      '--prefix', manifest.prefix, '--manifest', candidate];
    if (process.argv.includes('--wrangler')) args.push('--wrangler');
    const result = spawnSync(process.execPath, args, { stdio: 'inherit' });
    if (result.status !== 0) process.exit(result.status ?? 1);
    // The shared uploader writes hash/ext only; restore reviewed dimensions.
    writeFileSync(candidate, JSON.stringify(manifest, null, 2) + '\n');
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  }
  console.log(`Staged ${Object.keys(manifest.assets).length} paintings at ${path.relative(root, stage)}${process.argv.includes('--upload') ? '; R2 upload finished' : '; upload pending'}`);
}

if (process.argv.includes('--cdn')) {
  const base = (process.env.EXPO_PUBLIC_ASSET_BASE_URL || 'https://cdn.vedansh.app').replace(/\/+$/, '');
  assert.ok(base.startsWith('https://'), 'CDN verification requires HTTPS');
  for (const [stem, asset] of Object.entries(manifest.assets)) {
    const response = await fetch(`${base}/${manifest.prefix}/${asset.hash}.${asset.ext}`);
    assert.ok(response.ok, `${stem}: HTTP ${response.status}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    assert.equal(sha256(bytes), sources.assets[stem].sha256, `${stem}: CDN bytes differ`);
  }
  console.log('All public CDN objects match the reviewed source SHA-256 values');
}
