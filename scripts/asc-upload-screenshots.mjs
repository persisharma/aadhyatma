#!/usr/bin/env node
/*
 * asc-upload-screenshots.mjs — upload App Store screenshots to the editable App Store version
 * via the App Store Connect API. Self-contained (Node built-ins only; no Ruby/fastlane).
 *
 * `eas metadata` pushes listing TEXT but not media — this fills that gap. The ASC API key is
 * read from a LOCAL, gitignored location or env vars and is NEVER written to the repo.
 *
 * Usage:
 *   node scripts/asc-upload-screenshots.mjs [--kit .context/appstore-1.4.3] [--version 1.4.3]
 *        [--locale en-US] [--only ios|ipad] [--keep] [--dry-run]
 *
 * Auth (all via env, or place the key at mobile/credentials/asc-api-key.p8):
 *   ASC_KEY_ID       App Store Connect API key id       (required)
 *   ASC_ISSUER_ID    App Store Connect issuer id        (required)
 *   ASC_KEY_PATH     path to the .p8 (default: mobile/credentials/asc-api-key.p8)
 *   ASC_APP_ID       numeric app id (default: 6766086529)
 *
 * --dry-run stops after discovery (auth + find version/localization + list files) — nothing is
 * created or uploaded. --keep leaves existing screenshots in place (default: replace the set).
 */
import { createSign, createHash } from 'node:crypto';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const API = 'https://api.appstoreconnect.apple.com';

// device folder -> ASC screenshotDisplayType
// iPhone frames are 1242×2688 (6.5") to match the existing listing slot.
const DISPLAY = { ios: 'APP_IPHONE_65', ipad: 'APP_IPAD_PRO_3GEN_129' };

// ── args ──
const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const KIT = path.resolve(ROOT, opt('--kit', '.context/appstore-1.4.3'));
const LOCALE = opt('--locale', 'en-GB');
const ONLY = opt('--only', null);
const DRY = flag('--dry-run');
const KEEP = flag('--keep');
const APP_ID = process.env.ASC_APP_ID || '6766086529';
const VERSION = opt('--version', JSON.parse(readFileSync(path.join(ROOT, 'mobile/app.json'))).expo.version);

const die = (m) => { console.error('ERROR: ' + m); process.exit(1); };
const log = (m) => console.log(m);

// ── ES256 JWT for ASC ──
function token() {
  const keyId = process.env.ASC_KEY_ID || die('ASC_KEY_ID not set');
  const issuer = process.env.ASC_ISSUER_ID || die('ASC_ISSUER_ID not set');
  const keyPath = process.env.ASC_KEY_PATH || path.join(ROOT, 'mobile/credentials/asc-api-key.p8');
  const pem = process.env.ASC_KEY || (existsSync(keyPath)
    ? readFileSync(keyPath, 'utf8')
    : die(`ASC key not found — set ASC_KEY or place the .p8 at ${keyPath}`));
  const b64u = (o) => Buffer.from(typeof o === 'string' ? o : JSON.stringify(o)).toString('base64url');
  const iat = Math.floor(Date.now() / 1000);
  const head = b64u({ alg: 'ES256', kid: keyId, typ: 'JWT' });
  const body = b64u({ iss: issuer, iat, exp: iat + 20 * 60, aud: 'appstoreconnect-v1' });
  const sig = createSign('SHA256').update(`${head}.${body}`).sign({ key: pem, dsaEncoding: 'ieee-p1363' }).toString('base64url');
  return `${head}.${body}.${sig}`;
}
let JWT;

async function api(method, urlPath, body, raw) {
  const res = await fetch(urlPath.startsWith('http') ? urlPath : API + urlPath, {
    method,
    headers: { Authorization: `Bearer ${JWT}`, ...(body && !raw ? { 'Content-Type': 'application/json' } : {}) },
    body: raw ? body : body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`${method} ${urlPath} → ${res.status} ${res.statusText}\n${t.slice(0, 800)}`);
  }
  if (res.status === 204) return null;
  const ct = res.headers.get('content-type') || '';
  return ct.includes('json') ? res.json() : res.text();
}

async function findVersion() {
  const r = await api('GET', `/v1/apps/${APP_ID}/appStoreVersions?filter[versionString]=${VERSION}&filter[platform]=IOS&limit=10`);
  const v = (r.data || [])[0];
  if (!v) die(`no App Store version ${VERSION} found for app ${APP_ID} — create the version in App Store Connect first`);
  return v;
}
async function findLocalization(versionId) {
  const r = await api('GET', `/v1/appStoreVersions/${versionId}/appStoreVersionLocalizations?limit=50`);
  const loc = (r.data || []).find((l) => l.attributes.locale === LOCALE) || (r.data || [])[0];
  if (!loc) die(`no localization on version ${VERSION}`);
  return loc;
}
async function getOrCreateSet(locId, displayType) {
  const r = await api('GET', `/v1/appStoreVersionLocalizations/${locId}/appScreenshotSets?limit=50`);
  const found = (r.data || []).find((s) => s.attributes.screenshotDisplayType === displayType);
  if (found) return found.id;
  const c = await api('POST', '/v1/appScreenshotSets', {
    data: { type: 'appScreenshotSets', attributes: { screenshotDisplayType: displayType },
      relationships: { appStoreVersionLocalization: { data: { type: 'appStoreVersionLocalizations', id: locId } } } },
  });
  return c.data.id;
}
async function clearSet(setId) {
  const r = await api('GET', `/v1/appScreenshotSets/${setId}/appScreenshots?limit=50`);
  for (const s of r.data || []) await api('DELETE', `/v1/appScreenshots/${s.id}`);
  return (r.data || []).length;
}
async function uploadOne(setId, file) {
  const buf = readFileSync(file);
  const reserve = await api('POST', '/v1/appScreenshots', {
    data: { type: 'appScreenshots', attributes: { fileName: path.basename(file), fileSize: buf.length },
      relationships: { appScreenshotSet: { data: { type: 'appScreenshotSets', id: setId } } } },
  });
  const id = reserve.data.id;
  for (const op of reserve.data.attributes.uploadOperations) {
    const headers = Object.fromEntries((op.requestHeaders || []).map((h) => [h.name, h.value]));
    const part = buf.subarray(op.offset, op.offset + op.length);
    const res = await fetch(op.url, { method: op.method, headers, body: part });
    if (!res.ok) throw new Error(`upload PUT ${res.status} for ${path.basename(file)}`);
  }
  const md5 = createHash('md5').update(buf).digest('hex');
  await api('PATCH', `/v1/appScreenshots/${id}`, { data: { type: 'appScreenshots', id, attributes: { uploaded: true, sourceFileChecksum: md5 } } });
  return id;
}

async function main() {
  JWT = token();
  log(`ASC screenshot upload — app ${APP_ID}, version ${VERSION}, locale ${LOCALE}${DRY ? '  [DRY-RUN]' : ''}`);
  const v = await findVersion();
  log(`  version ${v.attributes.versionString} — state ${v.attributes.appStoreState} (id ${v.id})`);
  const loc = await findLocalization(v.id);
  log(`  localization ${loc.attributes.locale} (id ${loc.id})`);

  const devices = ONLY ? [ONLY] : ['ios', 'ipad'];
  for (const dev of devices) {
    const dir = path.join(KIT, 'frames', dev);
    if (!existsSync(dir)) { log(`  ⚠ ${dir} missing — skipping ${dev}`); continue; }
    const files = readdirSync(dir).filter((f) => f.endsWith('.png')).sort();
    log(`\n▸ ${dev} → ${DISPLAY[dev]} (${files.length} files)`);
    files.forEach((f) => log(`    ${f}`));
    if (DRY) continue;
    const setId = await getOrCreateSet(loc.id, DISPLAY[dev]);
    if (!KEEP) { const n = await clearSet(setId); if (n) log(`    cleared ${n} existing`); }
    const ids = [];
    for (const f of files) { process.stdout.write(`    uploading ${f} … `); ids.push(await uploadOne(setId, path.join(dir, f))); console.log('ok'); }
    await api('PATCH', `/v1/appScreenshotSets/${setId}/relationships/appScreenshots`, { data: ids.map((id) => ({ type: 'appScreenshots', id })) });
    log(`    ordered ${ids.length} screenshots`);
  }
  log(DRY ? '\n[DRY-RUN] auth + discovery OK — no changes made.' : '\n✅ screenshots uploaded. Verify in App Store Connect → the inflight version.');
}
main().catch((e) => die(e.message));
