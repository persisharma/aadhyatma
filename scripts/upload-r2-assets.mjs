#!/usr/bin/env node
/*
 * upload-r2-assets.mjs — content-hash + upload a folder of heavy assets to a
 * Cloudflare R2 bucket, and emit a manifest the app reads to resolve each asset
 * to its remote URL. Self-contained (Node built-ins only; signs its own AWS
 * SigV4 requests — no @aws-sdk, no wrangler).
 *
 * Why hashed names: the stored key is the file's own SHA-256 (`<hash>.<ext>`),
 * so the URLs are unguessable (you can't walk kj-01..kj-99), changed art lands
 * at a NEW key fetched once, and re-uploading identical bytes is a no-op.
 *
 * The R2 credentials are read from env / a LOCAL gitignored file and are NEVER
 * written to the repo or the manifest. The app only ever sees public URLs.
 *
 * Usage:
 *   node scripts/upload-r2-assets.mjs \
 *     --dir mobile/assets/kids-stories \
 *     --prefix kids-stories \
 *     --manifest mobile/src/data/kidsStoryAssetManifest.json
 *   node scripts/upload-r2-assets.mjs --dir mobile/assets/kids-stories --dry-run
 *
 * Auth (all via env):
 *   R2_ACCOUNT_ID          Cloudflare account id                     (required)
 *   R2_ACCESS_KEY_ID       R2 API token Access Key ID                (required)
 *   R2_SECRET_ACCESS_KEY   R2 API token Secret Access Key            (required)
 *   R2_BUCKET              bucket name                 (default: vedansh)
 *
 * --dry-run hashes + builds the manifest and reports what WOULD upload, but
 * makes no network call. Re-runs skip any object already present (HEAD check).
 */
import { CONTENT_TYPES, createR2Client, sha256 as sha256hex } from './r2-client.mjs';
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// ── args ──
const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const DIR = path.resolve(ROOT, opt('--dir', 'mobile/assets/kids-stories'));
const PREFIX = opt('--prefix', path.basename(DIR));
const MANIFEST = path.resolve(ROOT, opt('--manifest', 'mobile/src/data/kidsStoryAssetManifest.json'));
const DRY = flag('--dry-run');
// Optional existing Wrangler OAuth login; never copy credentials into this repo.
const WRANGLER = flag('--wrangler');

// ── env / auth ──
const ACCOUNT = process.env.R2_ACCOUNT_ID;
const AKID = process.env.R2_ACCESS_KEY_ID;
const SECRET = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET = process.env.R2_BUCKET || 'vedansh';
if (!DRY && !WRANGLER && (!ACCOUNT || !AKID || !SECRET)) {
  console.error('Missing R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY env.');
  process.exit(1);
}
const client = !DRY && !WRANGLER ? createR2Client() : null;

// ── run ──
const files = readdirSync(DIR).filter((f) => CONTENT_TYPES[f.split('.').pop().toLowerCase()]);
if (files.length === 0) { console.error(`No uploadable files in ${DIR}`); process.exit(1); }

const manifest = {};
let uploaded = 0, skipped = 0;
for (const name of files.sort()) {
  const ext = name.split('.').pop().toLowerCase();
  const stem = name.slice(0, -(ext.length + 1));
  const body = readFileSync(path.join(DIR, name));
  const hash = sha256hex(body).slice(0, 16);
  const key = `${PREFIX}/${hash}.${ext}`;
  manifest[stem] = { hash, ext };
  if (DRY) { console.log(`would upload ${name} → ${key} (${body.length} B)`); continue; }
  if (WRANGLER) {
    const result = spawnSync('npx', ['--yes', 'wrangler', 'r2', 'object', 'put', `${BUCKET}/${key}`,
      '--file', path.join(DIR, name), '--content-type', CONTENT_TYPES[ext], '--remote'], { stdio: 'inherit' });
    if (result.status !== 0) throw new Error(`Wrangler upload failed: ${key}`);
    uploaded++;
    continue;
  }
  const result = await client.uploadIfMissing(key, body, CONTENT_TYPES[ext]);
  if (result === 'existing') { skipped++; console.log(`skip  ${name} → ${key} (exists)`); }
  else { uploaded++; console.log(`put   ${name} → ${key}`); }
}

mkdirSync(path.dirname(MANIFEST), { recursive: true });
writeFileSync(MANIFEST, JSON.stringify({ prefix: PREFIX, assets: manifest }, null, 2) + '\n');
console.log(`\nmanifest → ${path.relative(ROOT, MANIFEST)}  (${files.length} assets, ${uploaded} uploaded, ${skipped} skipped${DRY ? ', DRY-RUN' : ''})`);
