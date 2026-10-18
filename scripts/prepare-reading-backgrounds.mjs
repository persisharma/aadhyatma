#!/usr/bin/env node
/** Stage the existing paintings for the R2 publisher without bundling them. */
import { mkdirSync, copyFileSync, readdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Expo's installed image reader runs only at publication time, never in the app.
const { imageSize } = createRequire(path.join(root, 'mobile/package.json'))('image-size');
const stage = path.join(root, 'scripts/.cache/reading-backgrounds');
// Rebuild this generated directory so renamed/deleted paintings cannot leak
// stale entries into a later manifest publication.
rmSync(stage, { recursive: true, force: true });
mkdirSync(stage, { recursive: true });
for (const folder of ['backgrounds', 'gita', 'chalisa', 'shiva-strotam', 'garud-puran']) {
  const directory = path.join(root, 'mobile/assets', folder);
  for (const name of readdirSync(directory).filter(name => /\.(webp|jpeg|jpg|png)$/.test(name))) {
    copyFileSync(path.join(directory, name), path.join(stage, `${folder}--${name}`));
  }
}
const args = [path.join(root, 'scripts/upload-r2-assets.mjs'), '--dir', stage,
  '--prefix', 'reading-backgrounds', '--manifest', path.join(root, 'mobile/src/data/backgroundAssetManifest.json')];
if (!process.argv.includes('--upload')) args.push('--dry-run');
if (process.argv.includes('--wrangler')) args.push('--wrangler');
if (process.argv.includes('--verify')) {
  const manifest = JSON.parse(readFileSync(path.join(root, 'mobile/src/data/backgroundAssetManifest.json'), 'utf8'));
  const expected = readdirSync(stage).filter(name => /\.(webp|jpeg|jpg|png)$/.test(name));
  if (expected.length !== Object.keys(manifest.assets).length) throw new Error('Background manifest count differs');
  for (const name of expected) {
    const ext = path.extname(name).slice(1);
    const stem = path.basename(name, `.${ext}`);
    const hash = createHash('sha256').update(readFileSync(path.join(stage, name))).digest('hex').slice(0, 16);
    if (manifest.assets[stem]?.hash !== hash || manifest.assets[stem]?.ext !== ext) throw new Error(`Stale manifest: ${name}`);
    const dimensions = imageSize(readFileSync(path.join(stage, name)));
    if (manifest.assets[stem]?.width !== dimensions.width || manifest.assets[stem]?.height !== dimensions.height) {
      throw new Error(`Stale image dimensions: ${name}`);
    }
  }
  console.log(`Verified ${expected.length} background hashes and dimensions against source paintings`);
} else {
  const result = spawnSync(process.execPath, args, { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
  const manifestPath = path.join(root, 'mobile/src/data/backgroundAssetManifest.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  for (const [stem, asset] of Object.entries(manifest.assets)) {
    const { width, height } = imageSize(readFileSync(path.join(stage, `${stem}.${asset.ext}`)));
    if (!(width > 0 && height > 0)) throw new Error(`Missing image dimensions: ${stem}`);
    Object.assign(asset, { width, height });
  }
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
}
