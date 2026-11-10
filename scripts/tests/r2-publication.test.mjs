import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, mkdir, writeFile, readFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createR2Client, sha256 } from '../r2-client.mjs';
import { buildPlan, publishPlan, checkSecrets, main } from '../publish-r2-assets.mjs';

const env = { R2_ACCOUNT_ID: 'testaccount', R2_ACCESS_KEY_ID: 'test-access', R2_SECRET_ACCESS_KEY: 'test-secret' };
const bytes = Buffer.from('reviewed artwork bytes'), hash = sha256(bytes);
async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'r2-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, 'art'));
  await writeFile(path.join(root, 'art/approved.webp'), bytes);
  await writeFile(path.join(root, 'art/unreferenced-draft.webp'), 'do not publish this draft');
  const manifest = { prefix: 'reviewed', publication: 'pending', assets: { scene: { hash: hash.slice(0, 16), ext: 'webp' }, alias: { hash: hash.slice(0, 16), ext: 'webp' } } };
  await writeFile(path.join(root, 'manifest.json'), JSON.stringify(manifest));
  const catalog = [{ id: 'test', manifest: 'manifest.json', prefix: 'reviewed', sources: ['art'] }];
  await mkdir(path.join(root, 'scripts'));
  await writeFile(path.join(root, 'scripts/r2-collections.json'), JSON.stringify(catalog));
  return { root, catalog, manifest };
}
const cdn = body => new Response(body, { headers: { 'content-type': 'image/webp' } });

test('plans only committed hashes, deduplicates aliases and keeps pending activation unchanged', async t => {
  const { root, catalog, manifest } = await fixture(t);
  const plan = await buildPlan(root, catalog);
  assert.equal(plan.length, 1);
  assert.deepEqual(plan[0].stems, ['scene', 'alias']);
  assert.equal(plan[0].sha256, hash);
  assert.equal(plan[0].key, `reviewed/${hash.slice(0, 16)}.webp`);
  assert.deepEqual(JSON.parse(await readFile(path.join(root, 'manifest.json'), 'utf8')), manifest);
});

test('rejects stale manifests, wrong prefixes and unsafe keys before any upload', async t => {
  const { root, catalog, manifest } = await fixture(t);
  manifest.assets.scene.hash = '0000000000000000';
  await writeFile(path.join(root, 'manifest.json'), JSON.stringify(manifest));
  await assert.rejects(buildPlan(root, catalog), /Source bytes do not match/);
  await assert.rejects(buildPlan(root, [{ ...catalog[0], prefix: 'wrong' }]), /Invalid manifest/);
  await assert.rejects(buildPlan(root, [{ ...catalog[0], prefix: '../escape' }]), /Invalid prefix/);
  manifest.assets.scene.hash = hash.slice(0, 16); manifest.assets.scene.ext = 'html';
  await writeFile(path.join(root, 'manifest.json'), JSON.stringify(manifest));
  await assert.rejects(buildPlan(root, catalog), /Invalid asset/);
});

test('rejects source symlinks and paths outside the checkout', async t => {
  const { root, catalog } = await fixture(t);
  await symlink(path.join(root, 'art/approved.webp'), path.join(root, 'art/link.webp'));
  await assert.rejects(buildPlan(root, catalog), /Symlink source/);
  await assert.rejects(buildPlan(root, [{ ...catalog[0], manifest: '../' }]), /outside repository/);
});

test('missing secrets create a clear successful skip; configured secrets enable publication', async t => {
  const { root } = await fixture(t);
  const output = path.join(root, 'outputs'), summary = path.join(root, 'summary');
  assert.equal(await checkSecrets({ GITHUB_OUTPUT: output, GITHUB_STEP_SUMMARY: summary }), false);
  assert.equal(await readFile(output, 'utf8'), 'ready=false\n');
  assert.match(await readFile(summary, 'utf8'), /R2 upload skipped.*R2_ACCOUNT_ID/);
  assert.equal(await checkSecrets({ ...env, GITHUB_OUTPUT: output }), true);
  assert.match(await readFile(output, 'utf8'), /ready=true/);
  assert.throws(() => createR2Client({ ...env, R2_SECRET_ACCESS_KEY: ' ' }), /Missing/);
});

test('end-to-end publication signs PUT, verifies CDN bytes and reruns without another PUT', async t => {
  const { root, catalog, manifest } = await fixture(t);
  const plan = await buildPlan(root, catalog), calls = [], proofs = [];
  let stored;
  const request = async (url, options = {}) => {
    calls.push({ url, method: options.method || 'GET' });
    assert.ok(options.signal, 'network operations are bounded');
    if (url.startsWith('https://cdn.vedansh.app/')) { assert.equal(options.headers?.Authorization, undefined); return cdn(stored); }
    assert.match(options.headers.Authorization, /^AWS4-HMAC-SHA256 Credential=test-access\//);
    if (options.method === 'HEAD') return new Response(null, { status: stored ? 200 : 404 });
    assert.equal(options.method, 'PUT');
    assert.equal(options.headers['cache-control'], 'public, max-age=31536000, immutable');
    assert.equal(options.headers['content-type'], 'image/webp');
    assert.equal(options.headers['x-amz-content-sha256'], hash);
    stored = options.body; return new Response(null, { status: 200 });
  };
  const client = createR2Client(env, request);
  await publishPlan(root, plan, { client, request, onVerified: p => proofs.push(p) });
  await publishPlan(root, plan, { client, request, onVerified: p => proofs.push(p) });
  assert.deepEqual(calls.map(c => c.method), ['HEAD', 'PUT', 'GET', 'HEAD', 'GET']);
  assert.deepEqual(proofs.map(p => p.upload), ['uploaded', 'existing']);
  assert.ok(proofs.every(p => p.verified && p.sha256 === hash));
  assert.deepEqual(JSON.parse(await readFile(path.join(root, 'manifest.json'), 'utf8')), manifest);
});

test('R2 auth/server failures are not treated as missing objects or followed by PUT', async () => {
  for (const status of [401, 403, 429, 500]) {
    const methods = [];
    const client = createR2Client(env, async (_url, options) => { methods.push(options.method); return new Response(null, { status }); });
    await assert.rejects(client.uploadIfMissing('reviewed/a.webp', bytes, 'image/webp'), new RegExp(`HEAD.*${status}`));
    assert.deepEqual(methods, ['HEAD']);
  }
  const client = createR2Client(env, async (_url, options) => new Response(null, { status: options.method === 'HEAD' ? 404 : 403 }));
  await assert.rejects(client.uploadIfMissing('reviewed/a.webp', bytes, 'image/webp'), /PUT.*403/);
});

test('failed CDN availability, content type or full SHA-256 never produces verified evidence', async t => {
  const { root, catalog } = await fixture(t), plan = await buildPlan(root, catalog);
  const responses = [new Response(null, { status: 404 }), new Response(bytes, { headers: { 'content-type': 'text/html' } }), cdn('wrong bytes')];
  for (const response of responses) {
    let verified = false;
    await assert.rejects(publishPlan(root, plan, {
      client: { uploadIfMissing: async () => 'existing' }, request: async () => response,
      onVerified: () => { verified = true; },
    }), /CDN/);
    assert.equal(verified, false);
  }
});

test('changed source after planning aborts before the remote write', async t => {
  const { root, catalog } = await fixture(t), plan = await buildPlan(root, catalog);
  await writeFile(path.join(root, plan[0].source), 'changed after review');
  await assert.rejects(publishPlan(root, plan, { client: { uploadIfMissing: () => { throw Error('must not upload'); } } }), /Source changed/);
});

test('dry-run CLI produces a source report with no credentials or network and leaves manifests intact', async t => {
  const { root, manifest } = await fixture(t);
  const network = t.mock.method(globalThis, 'fetch', () => { throw Error('unexpected network call'); });
  await main(['--dry-run', '--collection', 'test', '--output', 'report.json'], root);
  const report = JSON.parse(await readFile(path.join(root, 'report.json'), 'utf8'));
  assert.equal(report.status, 'dry-run');
  assert.equal(report.plan.length, 1);
  assert.deepEqual(report.verified, []);
  assert.equal(network.mock.callCount(), 0);
  assert.deepEqual(JSON.parse(await readFile(path.join(root, 'manifest.json'), 'utf8')), manifest);
  await assert.rejects(main(['--dry-run', '--collection', 'unknown'], root), /Unknown collection/);
  await assert.rejects(main(['--dry-run', '--output'], root), /Unknown\/incomplete option/);
});

test('preflight failure retains a failed report and never calls the network', async t => {
  const { root } = await fixture(t);
  await writeFile(path.join(root, 'art/approved.webp'), 'unreviewed replacement');
  const network = t.mock.method(globalThis, 'fetch', () => { throw Error('unexpected network call'); });
  await assert.rejects(main(['--output', 'failed.json'], root), /Source bytes do not match/);
  const report = JSON.parse(await readFile(path.join(root, 'failed.json'), 'utf8'));
  assert.equal(report.status, 'failed');
  assert.equal(report.verified.length, 0);
  assert.equal(network.mock.callCount(), 0);
});

test('reader publication resolves the reviewed Parshuram background alias', async () => {
  const root = path.resolve(import.meta.dirname, '../..');
  const catalog = JSON.parse(await readFile(path.join(root, 'scripts/r2-collections.json'), 'utf8'));
  const record = JSON.parse(await readFile(path.join(root, 'docs/content-parity/parshuram/artwork.json'), 'utf8'));
  const reviewed = record.assets.find(a => a.prefix === 'reader-illustrations' && a.stem === 'deity-parshuram');
  assert.ok(reviewed);
  const plan = await buildPlan(root, catalog.filter(c => c.id === 'reader-illustrations'));
  const alias = plan.find(item => item.stems.includes(reviewed.stem));
  assert.ok(alias);
  assert.equal(alias.source, reviewed.file);
  assert.equal(alias.sha256, reviewed.sha256);
  assert.equal(alias.key, `reader-illustrations/${reviewed.sha256.slice(0, 16)}.webp`);
});
