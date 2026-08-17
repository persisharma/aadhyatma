// capture.mjs — boot Vedansh in Expo Go on the booted iOS sim, run the (unrecorded) prep flow,
// then record the beats flow to a raw .mov. Boot logic mirrors marketing/linkedin/capture.sh.

import { execFileSync, spawn, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { seedStorage } from './seed.mjs';
import { APP_ID, IS_NATIVE } from './flow.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '..', '..');
const MOBILE_DIR = path.join(REPO_ROOT, 'mobile');
const MAESTRO = process.env.MAESTRO_BIN || 'maestro';
const CONFIG = path.join(MOBILE_DIR, '.maestro', 'config.yaml');
const EXPO_GO = 'host.exp.Exponent';
const METRO_PORT = process.env.REEL_METRO_PORT || '8081';

const sh = (cmd) => execSync(cmd, { stdio: 'pipe', encoding: 'utf8' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function metroUp() {
  try {
    return sh(`curl -s -m 3 http://localhost:${METRO_PORT}/status`).includes('packager-status:running');
  } catch {
    return false;
  }
}

async function ensureMetro(metroLog) {
  if (metroUp()) return console.log('  metro already up on :' + METRO_PORT);
  console.log('  starting production Metro (--no-dev --minify)…');
  const out = fs.openSync(metroLog, 'a');
  const child = spawn('npx', ['expo', 'start', '--no-dev', '--minify', '--host', 'localhost', '--port', METRO_PORT], {
    cwd: MOBILE_DIR,
    detached: true,
    stdio: ['ignore', out, out],
    env: { ...process.env, CI: '1', EXPO_NO_TELEMETRY: '1' },
  });
  child.unref();
  for (let i = 0; i < 60; i++) {
    if (metroUp()) return console.log('  metro up');
    await sleep(2000);
  }
  throw new Error('Metro did not come up on :' + METRO_PORT);
}

async function bootApp(metroLog) {
  console.log('  loading Vedansh into Expo Go…');
  try { sh(`xcrun simctl terminate booted ${EXPO_GO}`); } catch {}
  sh(`xcrun simctl openurl booted "exp://127.0.0.1:${METRO_PORT}"`);
  for (let i = 0; i < 70; i++) {
    if (fs.existsSync(metroLog) && fs.readFileSync(metroLog, 'utf8').includes('Bundled')) {
      console.log('  bundle built');
      break;
    }
    await sleep(3000);
  }
  await sleep(8000);
  try { sh(`xcrun simctl terminate booted ${EXPO_GO}`); } catch {}
  await sleep(2000);
}

function statusBar(on) {
  try {
    if (on)
      sh(
        'xcrun simctl status_bar booted override --time "9:41" --batteryState charged ' +
          '--batteryLevel 100 --dataNetwork wifi --wifiMode active --wifiBars 3 --cellularMode active --cellularBars 4',
      );
    else sh('xcrun simctl status_bar booted clear');
  } catch {}
}

function runFlow(flow) {
  execFileSync(MAESTRO, ['test', '--config', CONFIG, flow], { stdio: 'inherit' });
}

/**
 * @param flows { prep, beats } yaml paths
 * @returns raw .mov path
 */
export async function capture(reel, lang, flows, outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  const metroLog = path.join(outDir, '.metro.log');
  const rawMov = path.join(outDir, `${reel.slug}.${lang}.raw.mov`);
  if (fs.existsSync(rawMov)) fs.rmSync(rawMov);

  if (IS_NATIVE) {
    console.log(`  native build (${APP_ID}) — no Metro/Expo Go/seed needed`);
  } else {
    await ensureMetro(metroLog);
    await bootApp(metroLog); // warm the bundle; leaves Expo Go terminated
    // Seed language + suppress first-run tour/onboarding (Expo Go is terminated here, so the prep
    // flow's launchApp cold-reads it). Works around the un-tappable onboarding Modal.
    try {
      const { version, files } = seedStorage(lang);
      console.log(`  seeded storage (lang=${lang}, v=${version}) → ${files.length} manifest(s)`);
    } catch (e) {
      console.log('  ⚠ seed skipped: ' + e.message);
    }
  }
  statusBar(true);

  console.log('  prep flow (launch + land on Home)…');
  runFlow(flows.prep);

  console.log('  recording beats flow → ' + path.basename(rawMov));
  const rec = spawn('xcrun', ['simctl', 'io', 'booted', 'recordVideo', '--codec=h264', '--force', rawMov], {
    stdio: 'ignore',
  });
  await sleep(1500); // let the recorder attach before the first action

  try {
    runFlow(flows.beats);
  } finally {
    await sleep(600);
    rec.kill('SIGINT'); // simctl finalizes the file on SIGINT
    await new Promise((resolve) => rec.on('close', resolve));
  }
  statusBar(false);
  try { sh(`xcrun simctl terminate booted ${APP_ID}`); } catch {}

  if (!fs.existsSync(rawMov) || fs.statSync(rawMov).size === 0) {
    throw new Error('recordVideo produced no output: ' + rawMov);
  }
  console.log('  captured ' + (fs.statSync(rawMov).size / 1e6).toFixed(1) + ' MB');
  return rawMov;
}
