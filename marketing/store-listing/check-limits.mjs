#!/usr/bin/env node
/**
 * Store-listing limit checker — run before `./release.sh --metadata` or before pasting
 * Play copy into Play Console.
 *
 *   node marketing/store-listing/check-limits.mjs
 *
 * Checks (Unicode code points, which is how both consoles count Devanagari):
 *   App Store (mobile/store.config.json, every locale)
 *     title ≤ 30 · subtitle ≤ 30 · keywords (joined by ",") ≤ 100 · promoText ≤ 170
 *     description ≤ 4000 · releaseNotes ≤ 4000
 *     + warnings: keyword repeats a title/subtitle word, keyword contains a space
 *   Google Play (marketing/store-listing/play/<locale>/*.txt)
 *     title ≤ 30 · short_description ≤ 80 · full_description ≤ 4000
 * Exit 1 on any hard failure so release.sh / CI can gate on it.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const len = (s) => Array.from(s ?? '').length;
const words = (s) => new Set((s ?? '').toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean));

let failures = 0;
const row = (scope, field, n, max) => {
  const ok = n <= max;
  if (!ok) failures++;
  console.log(`${ok ? '  ok ' : ' FAIL'}  ${scope.padEnd(14)} ${field.padEnd(18)} ${String(n).padStart(4)} / ${max}`);
};
const warn = (msg) => console.log(`  warn ${msg}`);

// ---- App Store -------------------------------------------------------------
const cfgPath = join(root, 'mobile', 'store.config.json');
const cfg = JSON.parse(readFileSync(cfgPath, 'utf8'));
console.log('\nApp Store — mobile/store.config.json');
for (const [locale, info] of Object.entries(cfg.apple?.info ?? {})) {
  const scope = `apple/${locale}`;
  row(scope, 'title', len(info.title), 30);
  row(scope, 'subtitle', len(info.subtitle), 30);
  const kw = (info.keywords ?? []).join(',');
  row(scope, 'keywords', len(kw), 100);
  row(scope, 'promoText', len(info.promoText), 170);
  row(scope, 'description', len(info.description), 4000);
  row(scope, 'releaseNotes', len(info.releaseNotes), 4000);
  const used = new Set([...words(info.title), ...words(info.subtitle)]);
  for (const k of info.keywords ?? []) {
    if (/\s/.test(k)) warn(`${scope}: keyword "${k}" contains a space — Apple matches combinations across fields; split it`);
    if (used.has(k.toLowerCase())) warn(`${scope}: keyword "${k}" already appears in title/subtitle — wasted characters`);
  }
  const seen = new Set();
  for (const k of info.keywords ?? []) {
    if (seen.has(k.toLowerCase())) warn(`${scope}: duplicate keyword "${k}"`);
    seen.add(k.toLowerCase());
  }
}

// ---- Google Play -----------------------------------------------------------
const playDir = join(here, 'play');
console.log('\nGoogle Play — marketing/store-listing/play/<locale>/');
for (const locale of readdirSync(playDir).sort()) {
  const dir = join(playDir, locale);
  const read = (f) => (existsSync(join(dir, f)) ? readFileSync(join(dir, f), 'utf8').replace(/\n$/, '') : null);
  const scope = `play/${locale}`;
  const title = read('title.txt');
  const short = read('short_description.txt');
  const full = read('full_description.txt');
  if (title !== null) row(scope, 'title', len(title), 30);
  if (short !== null) row(scope, 'short_description', len(short), 80);
  if (full !== null) row(scope, 'full_description', len(full), 4000);
  if (title === null && short === null && full === null) warn(`${scope}: no listing files`);
}

console.log(failures ? `\n${failures} field(s) over limit.` : '\nAll fields within limits.');
process.exit(failures ? 1 : 0);
