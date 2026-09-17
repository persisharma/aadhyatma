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
// Target device: defaults to the single booted sim, but can be pinned to a specific UDID so a
// render runs on a dedicated simulator without colliding with another booted sim (e.g. a parallel
// e2e run). Applied to every simctl call and passed to Maestro via --device.
const DEVICE = process.env.REEL_SIM_UDID || 'booted';

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
  try { sh(`xcrun simctl terminate ${DEVICE} ${EXPO_GO}`); } catch {}
  sh(`xcrun simctl openurl ${DEVICE} "exp://127.0.0.1:${METRO_PORT}"`);
  for (let i = 0; i < 70; i++) {
    if (fs.existsSync(metroLog) && fs.readFileSync(metroLog, 'utf8').includes('Bundled')) {
      console.log('  bundle built');
      break;
    }
    await sleep(3000);
  }
  await sleep(8000);
  try { sh(`xcrun simctl terminate ${DEVICE} ${EXPO_GO}`); } catch {}
  await sleep(2000);
}

function statusBar(on) {
  try {
    if (on)
      sh(
        `xcrun simctl status_bar ${DEVICE} override --time "9:41" --batteryState charged ` +
          '--batteryLevel 100 --dataNetwork wifi --wifiMode active --wifiBars 3 --cellularMode active --cellularBars 4',
      );
    else sh(`xcrun simctl status_bar ${DEVICE} clear`);
  } catch {}
}

function runFlow(flow) {
  const deviceArgs = DEVICE === 'booted' ? [] : ['--device', DEVICE];
  execFileSync(MAESTRO, ['test', ...deviceArgs, '--config', CONFIG, flow], { stdio: 'inherit' });
}

/**
 * @param flows { prep, beats: string[] } — prep + one recorded flow per beat
 * @returns string[] — one raw .mov clip per beat (assemble scales each to its caption window)
 */
export async function capture(reel, lang, flows, outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  const metroLog = path.join(outDir, '.metro.log');
  const clips = flows.beats.map((_, i) => path.join(outDir, `${reel.slug}.${lang}.beat${i}.mov`));
  for (const c of clips) if (fs.existsSync(c)) fs.rmSync(c);

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

  // Record each beat as its own clip. Beat i+1 resumes where beat i left off (its flow foregrounds
  // with stopApp:false), so the app must stay on-screen between the separate `maestro test` runs —
  // which it does (Maestro doesn't reset the app on flow exit, same as the prep→beats handoff).
  for (let i = 0; i < flows.beats.length; i++) {
    const clip = clips[i];
    console.log(`  recording beat ${i} → ${path.basename(clip)}`);
    // Guard: kill any recorder that outlived the previous beat (SIGINT to xcrun doesn't always stop
    // the underlying simctl recording — a straggler steals this beat's clip). Start from a clean slate.
    try { sh(`pkill -f "simctl io ${DEVICE} recordVideo" 2>/dev/null`); } catch {}
    await sleep(800);
    const rec = spawn('xcrun', ['simctl', 'io', DEVICE, 'recordVideo', '--codec=h264', '--force', clip], {
      stdio: 'ignore',
    });
    await sleep(4000); // let the recorder fully attach before the first action — simctl recordVideo
                       // can take ~4s to start capturing on these sims, and a short beat that runs
                       // during that window yields a ~0.1s frozen clip. Wait it out first.
    try {
      runFlow(flows.beats[i]);
    } finally {
      await sleep(1000);
      rec.kill('SIGINT'); // simctl finalizes the file on SIGINT
      await new Promise((resolve) => rec.on('close', resolve));
      // Belt-and-braces: SIGINT to xcrun sometimes leaves the simctl recording alive (→ a clip that
      // over-runs into the next beat). Force-stop any straggler for this device so it finalizes here.
      try { sh(`pkill -f "simctl io ${DEVICE} recordVideo" 2>/dev/null`); } catch {}
    }
    // simctl allows only ONE recordVideo at a time and is slow to release the capture device after
    // the process exits. Without this settle, the next beat's recorder spawns before the device is
    // free — it either over-runs (a 20-30s clip spanning neighbours) or gets starved to a ~0.1s
    // frozen clip. Wait for the device to actually free, verified by size stabilising on disk.
    await sleep(2500);
    let prevSize = -1;
    for (let w = 0; w < 20; w++) {
      const sz = fs.existsSync(clip) ? fs.statSync(clip).size : 0;
      if (sz > 0 && sz === prevSize) break;
      prevSize = sz;
      await sleep(500);
    }
    if (!fs.existsSync(clip) || fs.statSync(clip).size === 0) {
      throw new Error('recordVideo produced no output: ' + clip);
    }
    console.log(`    beat ${i}: ${(fs.statSync(clip).size / 1e6).toFixed(1)} MB`);
  }

  statusBar(false);
  try { sh(`xcrun simctl terminate ${DEVICE} ${APP_ID}`); } catch {}
  return clips;
}
