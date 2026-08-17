// preflight.mjs — verify the toolchain + a booted sim before a render.

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { IS_NATIVE } from './flow.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MOBILE_DIR = path.resolve(HERE, '..', '..', 'mobile');

const has = (bin) => {
  try { execSync(`command -v ${bin}`, { stdio: 'pipe' }); return true; } catch { return false; }
};

export function preflight({ needSim = true } = {}) {
  const problems = [];
  const ffmpeg = process.env.FFMPEG_BIN || 'ffmpeg';
  const ffprobe = process.env.FFPROBE_BIN || 'ffprobe';
  const maestro = process.env.MAESTRO_BIN || 'maestro';
  const chrome = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

  if (!has(ffmpeg)) problems.push(`ffmpeg not found (${ffmpeg}). brew install ffmpeg`);
  if (!has(ffprobe)) problems.push(`ffprobe not found (${ffprobe}).`);
  if (!has(maestro)) problems.push(`maestro not found (${maestro}). https://maestro.mobile.dev`);
  if (!has('xcrun')) problems.push('xcrun not found — Xcode command line tools required.');
  if (!fs.existsSync(chrome)) problems.push(`Chrome not found (${chrome}). Set CHROME_BIN.`);

  if (needSim) {
    try {
      const out = execSync('xcrun simctl list devices booted', { encoding: 'utf8' });
      if (!/Booted/.test(out)) problems.push('No booted iOS simulator. Boot one in Simulator.app.');
    } catch {
      problems.push('Could not query simulators (xcrun simctl).');
    }
    if (!IS_NATIVE && !fs.existsSync(path.join(MOBILE_DIR, 'node_modules', 'expo'))) {
      problems.push(`mobile deps not installed — run: (cd ${MOBILE_DIR} && npm install)`);
    }
  }
  if (!process.env.OPENAI_API_KEY) {
    console.log('  ℹ OPENAI_API_KEY not set — narration uses macOS `say` (set the key for premium TTS).');
  }
  return problems;
}
