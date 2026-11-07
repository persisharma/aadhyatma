/** Optional offline font measurement, never imported by the app. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const canvasRequire = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
  ? createRequire(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, 'package.json')) : require;
const { createCanvas, GlobalFonts } = canvasRequire('@napi-rs/canvas');
const font = '@expo-google-fonts/inter/600SemiBold/Inter_600SemiBold.ttf';
const file = require.resolve(font);
GlobalFonts.registerFromPath(file, 'Compact-clock');
const ctx = createCanvas(2, 2).getContext('2d');
ctx.font = '18px Compact-clock';
let maxClockAdvance = 0, widestClock = '';
for (let hour = 0; hour < 24; hour++) for (let minute = 0; minute < 60; minute++) {
  const value = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  const width = ctx.measureText(value).width;
  if (width > maxClockAdvance) { maxClockAdvance = width; widestClock = value; }
}
const result = { font, sha256: crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),
  fontSize: 18, clocksMeasured: 1440, maxClockAdvance, widestClock, dashAdvance: ctx.measureText('–').width };
fs.writeFileSync('src/components/__tests__/fixtures/compactOccasionClockWidths.json', JSON.stringify(result, null, 2) + '\n');
console.log(result);
