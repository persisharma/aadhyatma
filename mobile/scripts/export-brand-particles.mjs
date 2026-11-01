import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { PNG } from 'pngjs';

// Deterministic colour/position samples from the existing approved splash export.
// No image generation, tint, geometry redrawing, or runtime pixel processing.
const source = new URL('../assets/splash-icon.png', import.meta.url);
const bytes = readFileSync(source);
const png = PNG.sync.read(bytes);
const candidates = [];
for (let gy = 0; gy < 24; gy++) for (let gx = 0; gx < 24; gx++) {
  const x = Math.floor((gx + 0.5) * png.width / 24);
  const y = Math.floor((gy + 0.5) * png.height / 24);
  const i = (y * png.width + x) * 4;
  const [r, g, b, a] = png.data.subarray(i, i + 4);
  if (a < 128 || g > 178) continue;
  candidates.push([+(x / png.width).toFixed(4), +(y / png.height).toFixed(4), `rgb(${r},${g},${b})`]);
}
const points = candidates.filter((_, i) => candidates.length <= 192 ||
  Math.floor(i * 192 / candidates.length) !== Math.floor((i - 1) * 192 / candidates.length));
const output = JSON.stringify({ source: 'mobile/assets/splash-icon.png',
  sha256: createHash('sha256').update(bytes).digest('hex'), points }, null, 2) + '\n';
const target = new URL('../src/components/brandParticles.json', import.meta.url);
if (process.argv.includes('--check')) {
  if (readFileSync(target, 'utf8') !== output) throw new Error('Brand particle samples need regeneration');
} else writeFileSync(target, output);
console.log(`${points.length} exact-colour brand particles`);
