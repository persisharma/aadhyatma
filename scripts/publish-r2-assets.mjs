#!/usr/bin/env node
/** Publish the merged manifest's exact bytes. Never regenerate/activate app manifests. */
import { readFile, readdir, realpath, mkdir, writeFile, appendFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONTENT_TYPES, createR2Client, missingSecrets, sha256 } from './r2-client.mjs';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const readJSON = async file => JSON.parse(await readFile(file, 'utf8'));

async function inside(root, relative) {
  if (typeof relative !== 'string' || path.isAbsolute(relative)) throw Error('Expected a repository-relative path');
  const resolved = await realpath(path.resolve(root, relative));
  const rel = path.relative(await realpath(root), resolved);
  if (rel === '..' || rel.startsWith(`..${path.sep}`) || path.isAbsolute(rel)) throw Error(`Path outside repository: ${relative}`);
  return resolved;
}

async function sourceIndex(root, sources) {
  const index = new Map();
  async function walk(directory) {
    for (const entry of (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      const file = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) throw Error(`Symlink source is not supported: ${entry.name}`);
      if (entry.isDirectory()) { await walk(file); continue; }
      const ext = path.extname(entry.name).slice(1).toLowerCase();
      if (!entry.isFile() || !Object.hasOwn(CONTENT_TYPES, ext)) continue;
      const bytes = await readFile(file), digest = sha256(bytes), key = `${digest.slice(0, 16)}.${ext}`;
      if (index.has(key) && index.get(key).sha256 !== digest) throw Error(`Content hash collision: ${key}`);
      index.set(key, { source: path.relative(root, file), sha256: digest, bytes: bytes.length });
    }
  }
  for (const source of sources) await walk(await inside(root, source));
  return index;
}

export async function buildPlan(root, collections) {
  const objects = new Map();
  for (const collection of collections) {
    if (!/^[a-z0-9]+(?:[/-][a-z0-9]+)*$/.test(collection.prefix)) throw Error(`Invalid prefix: ${collection.id}`);
    const manifest = await readJSON(await inside(root, collection.manifest));
    if (manifest.prefix !== collection.prefix || !manifest.assets || Array.isArray(manifest.assets)) throw Error(`Invalid manifest: ${collection.manifest}`);
    const sources = await sourceIndex(root, collection.sources);
    for (const [stem, entry] of Object.entries(manifest.assets)) {
      if (!/^[a-f0-9]{16}$/.test(entry.hash) || !Object.hasOwn(CONTENT_TYPES, entry.ext)) throw Error(`Invalid asset: ${collection.id}/${stem}`);
      const basename = `${entry.hash}.${entry.ext}`, source = sources.get(basename);
      if (!source) throw Error(`Source bytes do not match manifest: ${collection.id}/${stem} (${basename})`);
      const key = `${collection.prefix}/${basename}`;
      const prior = objects.get(key);
      if (prior && prior.sha256 !== source.sha256) throw Error(`Content hash collision: ${key}`);
      if (prior) prior.stems.push(stem);
      else objects.set(key, { ...source, key, collection: collection.id, manifest: collection.manifest, stems: [stem], contentType: CONTENT_TYPES[entry.ext] });
    }
  }
  return [...objects.values()];
}

export async function publishPlan(root, plan, { client, request = fetch, onVerified = () => {} }) {
  for (const item of plan) {
    const bytes = await readFile(await inside(root, item.source));
    if (sha256(bytes) !== item.sha256) throw Error(`Source changed after planning: ${item.source}`);
    const upload = await client.uploadIfMissing(item.key, bytes, item.contentType);
    const url = `https://cdn.vedansh.app/${item.key}`;
    // GET every object, including HEAD-skipped objects: existence is not byte verification.
    const response = await request(url, { cache: 'no-store', signal: AbortSignal.timeout(30000) });
    if (response.status !== 200) throw Error(`CDN ${item.key}: HTTP ${response.status}`);
    if (response.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== item.contentType) throw Error(`CDN content type mismatch: ${item.key}`);
    if (sha256(Buffer.from(await response.arrayBuffer())) !== item.sha256) throw Error(`CDN hash mismatch: ${item.key}`);
    await onVerified({ ...item, upload, url, verified: true });
  }
}

export async function checkSecrets(env = process.env) {
  const missing = missingSecrets(env), ready = missing.length === 0;
  if (env.GITHUB_OUTPUT) await appendFile(env.GITHUB_OUTPUT, `ready=${ready}\n`);
  const message = ready ? 'R2 credentials configured; publication enabled.' : `R2 upload skipped: configure ${missing.join(', ')} in Actions secrets, then run R2 Upload on main or wait for the next relevant merge. R2_BUCKET is optional (default: vedansh).`;
  console.log(message);
  if (env.GITHUB_STEP_SUMMARY) await appendFile(env.GITHUB_STEP_SUMMARY, `${message}\n`);
  return ready;
}

export async function main(argv = process.argv.slice(2), root = ROOT) {
  if (argv.includes('--check-secrets')) { await checkSecrets(); return; }
  const options = { collection: 'all', output: 'tmp/r2-publication/report.json', dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--dry-run') options.dryRun = true;
    else if (['--collection', '--output'].includes(argv[i]) && argv[i + 1] && !argv[i + 1].startsWith('--')) {
      const key = argv[i].slice(2); options[key] = argv[++i];
    }
    else throw Error(`Unknown/incomplete option: ${argv[i]}`);
  }
  const catalog = await readJSON(path.join(root, 'scripts/r2-collections.json'));
  const selected = catalog.filter(c => options.collection === 'all' || c.id === options.collection);
  if (!selected.length) throw Error(`Unknown collection: ${options.collection}`);
  const report = { commit: process.env.GITHUB_SHA || null, dryRun: options.dryRun, status: 'planning', collections: selected.map(c => c.id), plan: [], verified: [] };
  const destination = path.resolve(root, options.output);
  const save = async () => { await mkdir(path.dirname(destination), { recursive: true }); await writeFile(destination, JSON.stringify(report, null, 2) + '\n'); };
  try {
    // Validate every selected collection before the first remote write.
    report.plan = await buildPlan(root, selected);
    report.status = options.dryRun ? 'dry-run' : 'publishing'; await save();
    if (!options.dryRun) {
      await publishPlan(root, report.plan, { client: createR2Client(), onVerified: async proof => {
        report.verified.push(proof); console.log(`VERIFIED ${proof.key} (${proof.upload})`);
      } });
      report.status = 'verified';
    }
    console.log(`${report.status}: ${report.plan.length} unique objects in ${selected.length} collections`);
  } catch (error) { report.status = 'failed'; report.error = error.message; throw error; }
  finally {
    await save();
    if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, `R2: **${report.status}**, ${report.plan.length} planned objects, ${report.verified.length} CDN-verified. Runtime manifests and activation flags are unchanged.\n`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
