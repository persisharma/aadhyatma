#!/usr/bin/env node
// Publish inert source assets first. Activation requires every public CDN hash.
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const path = resolve(root, 'mobile/src/data/festivalHeroManifest.json');
const manifest = JSON.parse(readFileSync(path));
const records = JSON.parse(readFileSync(resolve(root, 'docs/reviews/festival-hero/provenance.json')));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
for (const r of records) {
  const bytes = readFileSync(resolve(root, r.path));
  if (hash(bytes) !== r.sha256 || manifest.assets[r.name]?.hash !== r.sha256.slice(0, 16)) throw Error(`Unreviewed bytes: ${r.name}`);
}
if (records.length !== Object.keys(manifest.assets).length) throw Error('Incomplete source ledger');
const stage = mkdtempSync(join(tmpdir(), 'vedansh-festival-'));
try {
  if (!process.argv.includes('--verify-only')) {
    const result = spawnSync(process.execPath, [resolve(root, 'scripts/upload-r2-assets.mjs'), '--dir', 'mobile/assets/festival-hero', '--prefix', manifest.prefix, '--manifest', join(stage, 'uploaded.json')], { cwd: root, stdio: 'inherit' });
    if (result.status !== 0) throw Error('Publication did not complete; activation withheld');
  }
  const proof = [];
  for (const r of records) {
    const entry = manifest.assets[r.name];
    const url = `https://cdn.vedansh.app/${manifest.prefix}/${entry.hash}.${entry.ext}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(30000), cache: 'no-store' });
    if (!response.ok) throw Error(`Public CDN unavailable: ${r.name} (${response.status})`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (hash(bytes) !== r.sha256) throw Error(`Public CDN hash mismatch: ${r.name}`);
    proof.push({ name: r.name, url, sha256: r.sha256, bytes: bytes.length });
    console.log(`VERIFIED ${r.name}`);
  }
  const out = resolve(process.env.FESTIVAL_PUBLICATION_OUTPUT || join(root, 'festival-publication'));
  const { mkdirSync } = await import('node:fs'); mkdirSync(out, { recursive: true });
  writeFileSync(join(out, 'festivalHeroManifest.json'), JSON.stringify({ ...manifest, publication: 'verified' }, null, 2) + '\n');
  writeFileSync(join(out, 'cdn-proof.json'), JSON.stringify({ verifiedAt: new Date().toISOString(), assets: proof }, null, 2) + '\n');
  console.log('Verified manifest is an artifact. Commit it only after reviewing all public hashes.');
} finally { rmSync(stage, { recursive: true, force: true }); }
