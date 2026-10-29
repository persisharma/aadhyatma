#!/usr/bin/env node
/** Publish first, verify public bytes, then atomically activate all catalog masters. */
import { createHash } from 'node:crypto';
import { readFile, writeFile, rename, mkdtemp, rm, readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const sources = resolve(root, 'mobile/assets/suvichar');
const destination = resolve(root, 'mobile/src/data/suvicharManifest.json');
const sha = bytes => createHash('sha256').update(bytes).digest('hex').slice(0, 16);
const deities = ['krishna','rama','hanuman','shiva','ganesha','durga','lakshmi','saraswati','vishnu','radha-krishna','ram-darbar','salasar-balaji','khatu-shyam','tirupati-balaji','sanwariya-seth','jagannath','mahakaal','annapurna'];
const frames = ['mandir-jharokha','pushp-aangan','bhakti-patra'];
const keys = deities.flatMap(d => frames.map(f => `${d}--${f}`));
async function verify(manifest) {
  if (manifest.prefix !== 'suvichar' || Object.keys(manifest.assets).length !== keys.length) throw new Error(`Expected exactly ${keys.length} Suvichar masters`);
  for (const key of keys) {
    const entry = manifest.assets[key];
    if (!entry || entry.ext !== 'webp') throw new Error(`Missing master: ${key}`);
    const local = await readFile(join(sources, `${key}.webp`));
    if (sha(local) !== entry.hash) throw new Error(`Source hash mismatch: ${key}`);
    const response = await fetch(`https://cdn.vedansh.app/suvichar/${entry.hash}.webp`, { signal: AbortSignal.timeout(15000) });
    if (!response.ok || sha(Buffer.from(await response.arrayBuffer())) !== entry.hash) throw new Error(`Public bytes not verified: ${key}`);
  }
}
if (process.argv.includes('--verify')) {
  await verify(JSON.parse(await readFile(destination, 'utf8')));
  console.log(`Verified ${keys.length} published Suvichar masters.`);
} else if (process.argv.includes('--publish')) {
  const files = (await readdir(sources)).filter(f => f.endsWith('.webp'));
  if (files.length !== keys.length || keys.some(k => !files.includes(`${k}.webp`))) throw new Error(`Complete all ${keys.length} source masters before publishing`);
  const temp = await mkdtemp(join(tmpdir(), 'suvichar-publish-'));
  try {
    const staged = join(temp, 'manifest.json');
    const result = spawnSync(process.execPath, [join(root, 'scripts/upload-r2-assets.mjs'), '--dir', sources, '--prefix', 'suvichar', '--manifest', staged, ...(process.argv.includes('--wrangler') ? ['--wrangler'] : [])], { cwd: root, stdio: 'inherit' });
    if (result.status !== 0) throw new Error('Artwork upload failed; runtime manifest unchanged');
    const manifest = JSON.parse(await readFile(staged, 'utf8'));
    await verify(manifest);
    await writeFile(`${destination}.next`, JSON.stringify(manifest, null, 2) + '\n');
    await rename(`${destination}.next`, destination);
    console.log(`Activated ${keys.length} byte-verified Suvichar masters.`);
  } finally { await rm(temp, { recursive: true, force: true }); }
} else { throw new Error('Use --publish [--wrangler] or --verify'); }
