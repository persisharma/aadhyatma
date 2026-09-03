// seed.mjs — pre-seed Expo Go's AsyncStorage so the first-run coach-mark tour and onboarding
// setup sheet are suppressed and the reading language is set, BEFORE Maestro's `launchApp`
// cold-starts the app and reads it.
//
// Why this exists: the onboarding sheet is an iOS RN <Modal> (a separate UIWindow) whose buttons
// Maestro can't reliably tap, and it forces a language choice on first run. Seeding the persisted
// flags is the robust way past it. `launchApp` (not `openurl`) is what actually cold-reads the seed.

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '..', '..');

const safeReaddir = (d) => { try { return fs.readdirSync(d); } catch { return []; } };

/** Read APP_TOUR_VERSION from source so the seeded "seen" versions always match the build. */
export function appTourVersion() {
  const f = path.join(REPO_ROOT, 'mobile', 'src', 'data', 'tour', 'whatsNew.ts');
  const m = fs.readFileSync(f, 'utf8').match(/APP_TOUR_VERSION\s*=\s*['"]([^'"]+)['"]/);
  if (!m) throw new Error('seed: could not read APP_TOUR_VERSION from ' + f);
  return m[1];
}

export function bootedUdid() {
  const out = execSync('xcrun simctl list devices booted', { encoding: 'utf8' });
  const m = out.match(/\(([0-9A-Fa-f-]{36})\)\s*\(Booted\)/);
  if (!m) throw new Error('seed: no booted simulator');
  return m[1];
}

/** Find Expo Go AsyncStorage manifests for a slug across all Expo Go app containers on the sim. */
export function findManifests(udid, slug) {
  const base = path.join(
    os.homedir(), 'Library/Developer/CoreSimulator/Devices', udid,
    'data/Containers/Data/Application',
  );
  const out = [];
  for (const app of safeReaddir(base)) {
    const exp = path.join(base, app, 'Documents', 'ExponentExperienceData');
    for (const owner of safeReaddir(exp)) {
      const man = path.join(exp, owner, slug, 'RCTAsyncLocalStorage', 'manifest.json');
      if (fs.existsSync(man)) out.push(man);
    }
  }
  return out;
}

/**
 * Seed language + first-run flags. Call while Expo Go is terminated; the next launchApp reads it.
 * @param lang 'en' | 'hi'
 * @param opts { slug='vedansh', udid }
 * @returns { version, files: string[] }
 */
export function seedStorage(lang, opts = {}) {
  const slug = opts.slug || 'vedansh';
  const udid = opts.udid || bootedUdid();
  const v = appTourVersion();
  const files = findManifests(udid, slug);
  if (!files.length) {
    throw new Error(`seed: no Expo Go AsyncStorage manifest for "${slug}" — open the app once in Expo Go first`);
  }
  for (const man of files) {
    let m = {};
    try { m = JSON.parse(fs.readFileSync(man, 'utf8')); } catch {}
    m['@vedansh/language'] = lang;
    m['@vedansh/onboarding-setup-v'] = v;
    m['@vedansh/tour-completed-v'] = v;
    m['@vedansh/whats-new-seen-v'] = v;
    fs.writeFileSync(man, JSON.stringify(m));
  }
  return { version: v, files };
}
