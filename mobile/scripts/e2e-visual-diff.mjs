#!/usr/bin/env node
// Pixel-diff two same-size PNGs and print a one-line text verdict.
// Part of the token-cheap e2e verification harness (wiki/runbooks/e2e-verification.md):
// unchanged screens verify at zero LLM-token cost; only a flagged diff needs eyes.
//
// Usage: node scripts/e2e-visual-diff.mjs <golden.png> <capture.png> [diff-out.png]
//   env: E2E_DIFF_TOL       per-channel delta to count a pixel changed (default 10/255)
//        E2E_DIFF_MASK_TOP  fraction of height ignored at the top (default 0.05 — status bar clock)
//
// Output (stdout): "<pct-changed> <x1>,<y1>,<x2>,<y2>" — percentage of compared
// pixels that changed plus the bounding box of the change. Exits 2 on size
// mismatch, 1 on read errors. Threshold policy lives in e2e-visual-check.sh.
//
// pngjs is a transitive dependency of the app's toolchain (present in
// mobile/node_modules); run from mobile/ so require() resolves.
import { createRequire } from 'module';
import fs from 'fs';

const require = createRequire(import.meta.url);
const { PNG } = require('pngjs');

const [goldenPath, capturePath, diffOutPath] = process.argv.slice(2);
if (!goldenPath || !capturePath) {
  console.error('usage: e2e-visual-diff.mjs <golden.png> <capture.png> [diff-out.png]');
  process.exit(1);
}

const TOL = Number(process.env.E2E_DIFF_TOL ?? 10);
const MASK_TOP = Number(process.env.E2E_DIFF_MASK_TOP ?? 0.05);

const golden = PNG.sync.read(fs.readFileSync(goldenPath));
const capture = PNG.sync.read(fs.readFileSync(capturePath));

if (golden.width !== capture.width || golden.height !== capture.height) {
  console.error(
    `size mismatch: golden ${golden.width}x${golden.height} vs capture ${capture.width}x${capture.height}`,
  );
  process.exit(2);
}

const { width, height } = golden;
const startRow = Math.floor(height * MASK_TOP);
let changed = 0;
let compared = 0;
let minX = width, minY = height, maxX = -1, maxY = -1;

const diff = diffOutPath ? new PNG({ width, height }) : null;

for (let y = startRow; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 4;
    compared++;
    const delta = Math.max(
      Math.abs(golden.data[i] - capture.data[i]),
      Math.abs(golden.data[i + 1] - capture.data[i + 1]),
      Math.abs(golden.data[i + 2] - capture.data[i + 2]),
    );
    const isChanged = delta > TOL;
    if (isChanged) {
      changed++;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    if (diff) {
      // faded capture as context, changed pixels in solid red
      diff.data[i] = isChanged ? 255 : capture.data[i] >> 1;
      diff.data[i + 1] = isChanged ? 0 : capture.data[i + 1] >> 1;
      diff.data[i + 2] = isChanged ? 0 : capture.data[i + 2] >> 1;
      diff.data[i + 3] = 255;
    }
  }
}

if (diff && changed > 0) fs.writeFileSync(diffOutPath, PNG.sync.write(diff));

const pct = (changed / compared) * 100;
const bbox = changed > 0 ? `${minX},${minY},${maxX},${maxY}` : '-';
console.log(`${pct.toFixed(3)} ${bbox}`);
