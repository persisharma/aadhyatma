import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';

// Painted art only (RULEBOOK §3, design.md §42): once a surface carries the
// Storybook artwork, the old single-akshara `thumb` text glyph is never drawn
// there again — not as an icon and not as a fallback. `thumb` stays DATA.
// Run: npx tsx --test src/data/__tests__/paintedIconsOnly.test.ts

const SRC = path.join(__dirname, '..', '..');

function uiSources(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const full = path.join(dir, d.name);
    if (d.isDirectory()) return d.name === '__tests__' ? [] : uiSources(full);
    return d.name.endsWith('.tsx') ? [full] : [];
  });
}

const files = uiSources(SRC).map((file) => ({ file: path.relative(SRC, file), text: fs.readFileSync(file, 'utf8') }));

test('no UI file renders an entry, track or program `thumb` glyph', () => {
  // `styles.thumb` / `rowStyles.thumb` are layout boxes and `typography.thumb` is a font token.
  const field = /(?<![\w.])(?!styles\.|rowStyles\.|typography\.)[A-Za-z_$][\w$]*\??\.thumb\b/g;
  const hits = files.flatMap(({ file, text }) => (text.match(field) ?? []).map((m) => `${file}: ${m}`));
  assert.deepEqual(hits, []);
});

test('DeityIcon takes no text fallback — an unknown key draws the painted deity seal', () => {
  const hits = files.filter(({ text }) => text.includes('fallbackText')).map(({ file }) => file);
  assert.deepEqual(hits, []);
});
