#!/usr/bin/env node
/** Publish only the four Mahakaal masters; activate after all public bytes match. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdtemp, copyFile, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = async path => JSON.parse(await readFile(join(root, path), 'utf8'));
const write = async (path, data) => writeFile(join(root, path), JSON.stringify(data, null, 2) + '\n');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const suvicharPath = 'mobile/src/data/suvicharManifest.json';
const dailyPath = 'mobile/src/data/devotionalShareManifest.json';
const provenancePath = 'mobile/assets/devotional-share/manifest.json';
const sources = await read('docs/evaluations/mahakaal/sources.json');
const publish = process.argv.includes('--publish');
const activate = publish || process.argv.includes('--activate');
const cdn = activate || process.argv.includes('--cdn');
const records = [];
for (const [frame, source] of Object.entries(sources)) {
  const prefix = frame === 'daily' ? 'devotional-share' : 'suvichar';
  const bytes = await readFile(join(root, 'mobile/assets', prefix, source.file));
  assert.equal(sha(bytes), source.sha256, source.file);
  assert.equal(bytes.length, source.bytes, source.file);
  records.push({ frame, source, prefix });
}
if (publish) {
  const temp = await mkdtemp(join(tmpdir(), 'vedansh-mahakaal-'));
  try {
    for (const prefix of ['devotional-share', 'suvichar']) {
      const { mkdir } = await import('node:fs/promises');
      const folder = join(temp, prefix);
      await mkdir(folder);
      for (const record of records.filter(r => r.prefix === prefix)) {
        await copyFile(join(root, 'mobile/assets', prefix, record.source.file), join(folder, record.source.file));
      }
      const result = spawnSync(process.execPath, [join(root, 'scripts/upload-r2-assets.mjs'),
        '--dir', folder, '--prefix', prefix, '--manifest', join(temp, `${prefix}.json`),
        ...(process.argv.includes('--wrangler') ? ['--wrangler'] : [])], { stdio: 'inherit', cwd: root });
      assert.equal(result.status, 0, 'Upload failed; runtime manifests remain unchanged');
    }
  } finally { await rm(temp, { recursive: true, force: true }); }
}
if (cdn) {
  for (const { source, prefix } of records) {
    const url = `https://cdn.vedansh.app/${prefix}/${source.sha256.slice(0, 16)}.webp`;
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    assert.ok(response.ok, `${source.file}: HTTP ${response.status}`);
    assert.equal(sha(Buffer.from(await response.arrayBuffer())), source.sha256, `${source.file}: public bytes differ`);
  }
}
if (activate) {
  const suvichar = await read(suvicharPath), daily = await read(dailyPath), provenance = await read(provenancePath);
  for (const { frame, source } of records) {
    const manifest = frame === 'daily' ? daily : suvichar;
    manifest.assets[frame === 'daily' ? 'mahakaal' : `mahakaal--${frame}`] = {
      hash: source.sha256.slice(0, 16), ext: 'webp',
      ...(frame === 'daily' ? { width: source.width, height: source.height } : {}),
    };
  }
  delete provenance.subjects.mahakaal.publication;
  provenance.subjects.mahakaal.provenance = 'Full shrine illustration generated from Shiva frame reference; original Shiva master retained. Public R2 bytes verified by prepare-mahakaal.mjs.';
  await write(suvicharPath, suvichar);
  await write(dailyPath, daily);
  await write(provenancePath, provenance);
}
console.log(`Verified four Mahakaal sources${cdn ? ' and public bytes' : ''}${activate ? '; activated both manifests' : '; runtime manifests unchanged'}.`);
