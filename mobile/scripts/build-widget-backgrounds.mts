/**
 * Cut the home-screen widget background plates (design.md §59) from the app's own
 * sketches: one pre-cropped, sepia-toned JPEG per (content, size) the catalog
 * offers, written to `assets/widget-backgrounds/`. Both native config plugins and
 * the in-app gallery read that one folder.
 *
 *   npx tsx scripts/build-widget-backgrounds.mts
 *
 * Requires ImageMagick 6 (`convert`). The plates are committed, so this only runs
 * when the art, `WIDGET_TEXT_TOKENS`, or `WIDGET_BACKGROUND_DIMENSIONS` change. It refuses to
 * write a plate on which any widget text token would fall below 4.5:1.
 * The sketch is tone-mapped as a sepia duotone between the darkest background the
 * text allows and parchment, so it is as visible as the text colours permit.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { WIDGET_BACKGROUND_DIMENSIONS, WIDGET_BACKGROUND_SOURCES, WIDGET_TEXT_TOKENS, widgetBackgroundPlates } from '../src/widgets/catalog';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_DIR = path.join(ROOT, 'assets', 'backgrounds');
const OUT_DIR = path.join(ROOT, 'assets', 'widget-backgrounds');

const PARCHMENT = '#F8EFD6'; // colors.parchmentSoft — the widgets' container background
/** The sepia the sketch's lines are drawn in, mixed toward parchment until it reaches the contrast floor. */
const SEPIA = '#7A5A34';
/** The sketches carry a burnt-paper border; it reads as a dirty edge on a rounded widget, so it is cropped away. */
const INSET = 0.08;
/** Clip the sketch's paper grain (the light end) and its deepest lines (the dark end) before tone-mapping. */
const LEVELS = '8%,94%';
/** < 1 lifts the mid-tone linework toward the floor so more of the drawing shows, not just its darkest strokes. */
const GAMMA = '0.8';
/** The text drawn over the plates; `gold` is the decorative ॐ mark and is not held to the gate. */
const { gold: _gold, ...TEXT_TOKENS } = WIDGET_TEXT_TOKENS;
const MIN_CONTRAST = 4.5;
/** Headroom over the gate for JPEG ringing and the blur measure below. */
const TARGET_CONTRAST = 4.75;

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
const linearLuminance = ([r, g, b]: number[]) => {
  const [lr, lg, lb] = [r, g, b].map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
};
const luminance = (hex: string) => linearLuminance(rgb(hex));
const contrast = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

/**
 * The darkest background every text token still reads on at TARGET_CONTRAST: the
 * SEPIA→PARCHMENT mix found by bisection. The plates are tone-mapped so their
 * darkest line lands here and their paper on PARCHMENT — the full range the text
 * allows, which is what makes the sketch visible rather than a faint wash.
 */
function contrastFloor(): string {
  const lightestText = Math.max(...Object.values(TEXT_TOKENS).map(luminance));
  const [p, s] = [rgb(PARCHMENT), rgb(SEPIA)];
  const mix = (t: number) => p.map((c, i) => c * (1 - t) + s[i] * t);
  let lo = 0; let hi = 1;
  for (let i = 0; i < 40; i += 1) {
    const t = (lo + hi) / 2;
    if (contrast(lightestText, linearLuminance(mix(t))) > TARGET_CONTRAST) lo = t; else hi = t;
  }
  return `#${mix(lo).map((c) => Math.round(c * 255).toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}

const FLOOR = contrastFloor();
fs.mkdirSync(OUT_DIR, { recursive: true });
const index: string[] = [];
for (const { content, size, name } of widgetBackgroundPlates()) {
  const { file, focusY } = WIDGET_BACKGROUND_SOURCES[content];
  const [width, height] = WIDGET_BACKGROUND_DIMENSIONS[size];
  const source = path.join(SOURCE_DIR, file);
  const [sw, sh] = execFileSync('identify', ['-format', '%w %h', source], { encoding: 'utf8' }).trim().split(' ').map(Number);
  // The usable square inside the burnt border, then the largest box of the plate's
  // aspect that fits it, centred on the subject's height and clamped inside.
  const left = Math.round(sw * INSET); const top = Math.round(sh * INSET);
  const innerW = sw - 2 * left; const innerH = sh - 2 * top;
  const aspect = width / height;
  const cropW = Math.round(Math.min(innerW, innerH * aspect));
  const cropH = Math.round(cropW / aspect);
  const cropX = left + Math.round((innerW - cropW) / 2);
  const cropY = Math.min(top + innerH - cropH, Math.max(top, Math.round(sh * focusY - cropH / 2)));
  const out = path.join(OUT_DIR, `${name}.jpg`);
  execFileSync('convert', [
    source, '-crop', `${cropW}x${cropH}+${cropX}+${cropY}`, '+repage', '-resize', `${width}x${height}!`,
    '-colorspace', 'Gray', '-level', LEVELS, '-gamma', GAMMA, '-colorspace', 'sRGB',
    '+level-colors', `${FLOOR},${PARCHMENT}`,
    '-strip', '-interlace', 'none', '-sampling-factor', '4:2:0', '-quality', '82', out,
  ]);
  // Darkest the background gets under a glyph-sized area (a 1.5 px blur ignores single-pixel grain).
  const floor = Number(execFileSync('convert', [out, '-colorspace', 'RGB', '-grayscale', 'Rec709Luminance', '-blur', '0x1.5', '-format', '%[fx:minima]', 'info:'], { encoding: 'utf8' }));
  const [token, worst] = Object.entries(TEXT_TOKENS)
    .map(([key, hex]) => [key, contrast(luminance(hex), floor)] as const)
    .reduce((a, b) => (b[1] < a[1] ? b : a));
  if (worst < MIN_CONTRAST) {
    fs.rmSync(out);
    throw new Error(`${name}: ${token} reaches only ${worst.toFixed(2)}:1 on the darkest area — raise TARGET_CONTRAST`);
  }
  console.log(`${name}.jpg ${width}x${height} ${(fs.statSync(out).size / 1024).toFixed(1)} KB · worst text contrast ${worst.toFixed(2)}:1 (${token})`);
  index.push(`  ${name}: require('./${name}.jpg'),`);
}

fs.writeFileSync(path.join(OUT_DIR, 'index.ts'), `// Generated by scripts/build-widget-backgrounds.mts — do not edit by hand.
// The in-app Widget Gallery's copy of the plates the native widgets bundle.
export const widgetBackgroundImages: Record<string, number> = {
${index.join('\n')}
};
`);
