#!/usr/bin/env node
/** Upload immutable art, verify public bytes, then activate the complete feature. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, mkdtemp, copyFile, rename, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const recordPath = join(root, 'docs/content-parity/parshuram/artwork.json');
const publicationPath = join(root, 'mobile/src/data/parshuramPublication.json');
const record = JSON.parse(await readFile(recordPath, 'utf8'));
const publish = process.argv.includes('--publish');
const verify = process.argv.includes('--verify');
if (!publish && !verify) throw new Error('Use --publish [--wrangler] or --verify');
if (publish && !process.argv.includes('--wrangler') && !['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY'].every(k => process.env[k])) {
  throw new Error('R2 publishing credentials are unavailable; feature and runtime manifests remain unchanged.');
}
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const assets = record.assets.filter(a => a.prefix);
assert.equal(assets.length, 6, 'Five unique remote paintings, including the reader illustration alias');
const stage = await mkdtemp(join(tmpdir(), 'parshuram-publish-'));
try {
  for (const prefix of new Set(assets.map(a => a.prefix))) {
    const group = assets.filter(a => a.prefix === prefix);
    const dir = join(stage, prefix);
    await mkdir(dir, { recursive: true });
    for (const a of group) {
      const bytes = await readFile(join(root, a.file));
      assert.equal(sha(bytes), a.sha256, `Unreviewed artwork: ${a.file}`);
      assert.equal(bytes.length, a.bytes, a.file);
      await copyFile(join(root, a.file), join(dir, `${a.stem}.webp`));
    }
    if (publish) {
      const result = spawnSync(process.execPath, [join(root, 'scripts/upload-r2-assets.mjs'), '--dir', dir, '--prefix', prefix, '--manifest', join(stage, `${prefix}.json`), ...(process.argv.includes('--wrangler') ? ['--wrangler'] : [])], { cwd: root, stdio: 'inherit' });
      if (result.status !== 0) throw new Error(`Upload failed: ${prefix}; feature remains inactive.`);
    }
  }
  // Validate every URL before changing even one runtime manifest.
  for (const a of assets) {
    const url = `https://cdn.vedansh.app/${a.prefix}/${a.sha256.slice(0, 16)}.webp`;
    const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
    assert.equal(response.status, 200, url);
    assert.equal(sha(Buffer.from(await response.arrayBuffer())), a.sha256, `Public hash mismatch: ${url}`);
  }
  if (publish) {
    const manifests = new Map();
    for (const a of assets) {
      if (!manifests.has(a.manifest)) manifests.set(a.manifest, JSON.parse(await readFile(join(root, a.manifest), 'utf8')));
      assert.equal(manifests.get(a.manifest).prefix, a.prefix, `Manifest prefix mismatch: ${a.manifest}`);
      manifests.get(a.manifest).assets[a.stem] = { hash: a.sha256.slice(0, 16), ext: 'webp', width: a.width, height: a.height };
    }
    for (const [file, manifest] of manifests) {
      const path = join(root, file); await writeFile(`${path}.next`, JSON.stringify(manifest, null, 2) + '\n'); await rename(`${path}.next`, path);
    }
    const devotionalPath = join(root, 'mobile/assets/devotional-share/manifest.json');
    const devotional = JSON.parse(await readFile(devotionalPath, 'utf8'));
    devotional.subjects.parshuram.publication = 'verified';
    await writeFile(devotionalPath, JSON.stringify(devotional, null, 2) + '\n');
    record.publication = 'verified'; record.verifiedOn = new Date().toISOString();
    await writeFile(recordPath, JSON.stringify(record, null, 2) + '\n');
    // This final write is the activation boundary. Partial/interrupted publication stays hidden.
    const publication = { publication: 'verified', assets: assets.map(a => ({ prefix: a.prefix, stem: a.stem, hash: a.sha256.slice(0, 16) })) };
    await writeFile(`${publicationPath}.next`, JSON.stringify(publication, null, 2) + '\n'); await rename(`${publicationPath}.next`, publicationPath);
  }
  console.log(`Verified ${assets.length} Parshuram public objects${publish ? '; feature activated' : ''}.`);
} finally { await rm(stage, { recursive: true, force: true }); }
