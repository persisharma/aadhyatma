#!/usr/bin/env node
/** Publish approved standalone banners independently of reading backgrounds. */
import { createHash } from 'node:crypto';
import { copyFileSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const directory = path.join(root, 'mobile/assets/reader-illustrations');
const manifestPath = path.join(root, 'mobile/src/data/readerIllustrationManifest.json');
const stage = path.join(root, 'scripts/.cache/reader-illustrations');
const candidatePath = path.join(stage, 'manifest.json');
const { imageSize } = createRequire(path.join(root, 'mobile/package.json'))('image-size');
const approval = JSON.parse(readFileSync(path.join(directory, 'approved.json'), 'utf8'));
const files = readdirSync(directory).filter(name => /\.(webp|png|jpeg|jpg)$/i.test(name)).sort();
const supportedStyles = new Set(['krishna-storybook-v1', 'krishna-storybook-detail-v2']);
if (!supportedStyles.has(approval.style)) throw new Error('Unknown reader illustration style');
if (files.length !== Object.keys(approval.assets).length) throw new Error('Illustration files and visual approvals differ');

const manifest = { prefix: 'reader-illustrations', assets: {} };
for (const name of files) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*\.webp$/.test(name)) throw new Error(`Expected a semantic lowercase WebP filename: ${name}`);
  const stem = path.basename(name, '.webp');
  const body = readFileSync(path.join(directory, name));
  const digest = createHash('sha256').update(body).digest('hex');
  if (approval.assets[stem] !== digest) throw new Error(`Missing/stale visual approval: ${stem}`);
  const { width, height } = imageSize(body);
  if (!(width > 0 && height > 0 && width === height * 2)) throw new Error(`Banner must be a complete 2:1 canvas: ${stem}`);
  manifest.assets[stem] = { hash: digest.slice(0, 16), ext: 'webp', width, height };
}

if (process.argv.includes('--verify')) {
  const current = JSON.parse(readFileSync(manifestPath, 'utf8'));
  if (current.prefix !== manifest.prefix || Object.keys(current.assets).length !== files.length) throw new Error('Illustration manifest category/count differs');
  for (const [stem, expected] of Object.entries(manifest.assets)) {
    const actual = current.assets[stem];
    if (!actual || Object.entries(expected).some(([key, value]) => actual[key] !== value)) throw new Error(`Stale illustration manifest: ${stem}`);
  }
  console.log(`Verified ${files.length} approved reader illustrations; backgrounds unchanged`);
} else {
  rmSync(stage, { recursive: true, force: true });
  mkdirSync(stage, { recursive: true });
  for (const name of files) copyFileSync(path.join(directory, name), path.join(stage, name));
  if (process.argv.includes('--upload')) {
    if (!files.length) throw new Error('No approved reader illustrations to upload');
    const args = [path.join(root, 'scripts/upload-r2-assets.mjs'), '--dir', stage,
      '--prefix', manifest.prefix, '--manifest', candidatePath];
    if (process.argv.includes('--wrangler')) args.push('--wrangler');
    const result = spawnSync(process.execPath, args, { stdio: 'inherit' });
    if (result.status !== 0) process.exit(result.status ?? 1);
    // The app manifest changes only after all approved objects have uploaded.
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  }
  writeFileSync(candidatePath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`${process.argv.includes('--upload') ? 'Published' : 'Staged locally'} ${files.length} approved reader illustrations → ${candidatePath}`);
}
