/**
 * Static guards for two Indic-typography antipatterns that kept recurring
 * (July 2026 TestFlight review — routine screens, theerth chips):
 *
 * 1. Passing a Latin-only token (Cormorant faces) as the scriptBodyFont /
 *    scriptTitleFont fallback. Those helpers return the fallback for `hi`, so
 *    Hindi text silently falls to the OS system face.
 * 2. `letterSpacing` applied to the always-Devanagari tokens — tracking splits
 *    the shirorekha ("शि व"). Localized labels must use pillTextStyle() or a
 *    `lang === 'en'` conditional instead (both patterns are allowed by guard 1).
 */
import * as fs from 'fs';
import * as path from 'path';

const SRC_ROOT = path.resolve(__dirname, '..', '..');

// Tokens unsafe as Indic fallbacks — Cormorant cuts are Latin-only, and cardMeta
// is Inter UI chrome, which leaves Hindi text on a system fallback.
const UNSAFE_INDIC_FALLBACK_TOKENS = [
  'cardLatin',
  'cardMeta',
  'pageCounter',
  'subtitle',
  'swipeHint',
  'meaningLabel',
  'verseLatin',
  'meaningEnglish',
];

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return entry.name === '__tests__' || entry.name === 'node_modules' ? [] : sourceFiles(full);
    }
    return /\.(ts|tsx)$/.test(entry.name) ? [full] : [];
  });
}

test('no scriptBodyFont/scriptTitleFont call falls back to an Indic-unsafe token', () => {
  const antipattern = new RegExp(
    `script(?:Body|Title)Font\\(\\s*[\\w.]+\\s*,\\s*typography\\.(${UNSAFE_INDIC_FALLBACK_TOKENS.join('|')})\\b`
  );
  const offenders: string[] = [];
  for (const file of sourceFiles(SRC_ROOT)) {
    const src = fs.readFileSync(file, 'utf8');
    src.split('\n').forEach((line, i) => {
      if (antipattern.test(line)) offenders.push(`${path.relative(SRC_ROOT, file)}:${i + 1}: ${line.trim()}`);
    });
  }
  expect(offenders).toEqual([]);
});

test('always-Devanagari tokens carry no letterSpacing (tracking splits the shirorekha)', () => {
  const typographySrc = fs.readFileSync(path.join(SRC_ROOT, 'theme', 'typography.ts'), 'utf8');
  const devanagariTokens = ['screenTitle', 'verse', 'meaning', 'readerTitle', 'cardHindi', 'thumb', 'footerMantra'];
  for (const token of devanagariTokens) {
    const block = typographySrc.match(new RegExp(`  ${token}: \\{[^}]*\\}`, 's'))?.[0] ?? '';
    expect(block).not.toBe('');
    // property with a numeric value — comments mentioning the word don't count
    expect(`${token}: ${/letterSpacing:\s*-?[\d.]/.test(block)}`).toBe(`${token}: false`);
  }
});
