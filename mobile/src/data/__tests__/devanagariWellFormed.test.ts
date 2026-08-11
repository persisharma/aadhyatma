/**
 * Devanagari well-formedness gate (RULEBOOK §11.14).
 *
 * Fails when any Devanagari string in shipped content carries a combining mark
 * with no legal base — the sequence that renders as ◌ (U+25CC DOTTED CIRCLE) on
 * device. See devanagariWellFormed.ts for why a character-range check cannot
 * catch this class.
 *
 * `devanagariWellFormed.baseline.json` quarantines the instances that were already
 * in the corpus when this gate was written. It is a debt ledger, not a config knob:
 * every entry is a real reader-visible defect, the file may only ever shrink, and
 * adding an entry to unblock a red build is a rulebook violation. Fixing a word
 * deletes its line; the test fails if a baselined word is *no longer* defective,
 * so the ledger cannot silently rot.
 *
 * Run: npx tsx --test src/data/__tests__/devanagariWellFormed.test.ts
 */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import {
  findDevanagariDefects,
  isDevanagariWellFormed,
  describeDevanagariDefect,
} from '../devanagariWellFormed';

const DATA = join(__dirname, '..');
const BASELINE_PATH = join(__dirname, 'devanagariWellFormed.baseline.json');

// ─── 1. The validator itself ─────────────────────────────────────────────────

for (const good of [
  'भक्तियोगेन', // the correct form of the BG 14.26 defect
  'निश्चितं',
  'पितॄन्', // long vocalic-R, the correct form of पितृ़न्
  'जोड़ना', // nukta on a consonant is legal
  'क्षत्रियान्',
  'श्रीमद्भगवद्गीता',
  'ॐ नमः शिवाय',
  'मूर्च्छित',
  'क्‌त', // ZWNJ after virama forces an explicit halant — legal
  'Daily Verse · 14.26', // no Devanagari at all
  '',
]) {
  assert.ok(
    isDevanagariWellFormed(good),
    `well-formed string rejected: "${good}" → ${findDevanagariDefects(good).map(describeDevanagariDefect).join('; ')}`
  );
}

const BAD_CASES: Array<[string, string]> = [
  ['भक्ितयोगेन', 'matra-after-virama'],
  ['निश्िचतं', 'matra-after-virama'],
  ['पितृ़न्', 'nukta-after-matra'],
  ['जो़ड़ना', 'nukta-after-matra'],
  ['मूिर्च्छत', 'matra-after-matra'],
  ['क्षत्ऺित्रयान्', 'matra-after-virama'],
  ['्वं', 'mark-at-start'],
  ['कोऽंशुमान्', 'mark-on-non-base'],
  ['श\u200dृत्यागम', 'mark-after-zero-width-joiner'],
];

for (const [bad, expectedKind] of BAD_CASES) {
  const defects = findDevanagariDefects(bad);
  assert.ok(defects.length > 0, `malformed string accepted: "${bad}"`);
  assert.ok(
    defects.some((d) => d.kind === expectedKind),
    `"${bad}" should report ${expectedKind}, got ${defects.map((d) => d.kind).join(', ')}`
  );
  assert.ok(defects[0].word.length > 0, `"${bad}" should report the enclosing word`);
}

// A defect inside a longer sentence must still be found, and located.
const sentence = 'मां च योऽव्यभिचारेण भक्ितयोगेन सेवते।';
const sentenceDefects = findDevanagariDefects(sentence);
assert.equal(sentenceDefects.length, 1, 'one defect expected in the BG 14.26 line');
assert.equal(sentenceDefects[0].word, 'भक्ितयोगेन');
assert.equal(sentenceDefects[0].codepoint, 'U+093F');

// ─── 2. Every Devanagari string in shipped content ───────────────────────────

type Ledger = Record<string, Record<string, number>>;

const baseline: Ledger = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));

function jsonFilesUnder(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === '__tests__' || entry === 'node_modules') continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...jsonFilesUnder(full));
    else if (entry.endsWith('.json')) out.push(full);
  }
  return out;
}

/** Collects every string value in a parsed JSON tree, with a dotted path. */
function walkStrings(node: unknown, path: string, visit: (value: string, at: string) => void): void {
  if (typeof node === 'string') visit(node, path);
  else if (Array.isArray(node)) node.forEach((child, i) => walkStrings(child, `${path}[${i}]`, visit));
  else if (node && typeof node === 'object') {
    for (const [key, child] of Object.entries(node)) {
      walkStrings(child, path ? `${path}.${key}` : key, visit);
    }
  }
}

const observed: Ledger = {};
const failures: string[] = [];

for (const file of jsonFilesUnder(DATA)) {
  const rel = relative(DATA, file).split('\\').join('/');
  const parsed = JSON.parse(readFileSync(file, 'utf8'));
  walkStrings(parsed, '', (value, at) => {
    for (const defect of findDevanagariDefects(value)) {
      observed[rel] ??= {};
      observed[rel][defect.word] = (observed[rel][defect.word] ?? 0) + 1;
      const allowed = baseline[rel]?.[defect.word] ?? 0;
      if (observed[rel][defect.word] > allowed) {
        failures.push(`${rel} → ${at}: ${describeDevanagariDefect(defect)}`);
      }
    }
  });
}

assert.deepEqual(
  failures,
  [],
  `Malformed Devanagari renders as ◌ (U+25CC) on device. ` +
    `Fix the source text — do NOT add it to devanagariWellFormed.baseline.json (RULEBOOK §11.14):\n  ` +
    failures.join('\n  ')
);

// The ledger may only shrink. A stale entry means the word was fixed (delete the
// line) or the file moved — either way the baseline is lying about the corpus.
const stale: string[] = [];
for (const [rel, words] of Object.entries(baseline)) {
  for (const [word, count] of Object.entries(words)) {
    const seen = observed[rel]?.[word] ?? 0;
    if (seen < count) stale.push(`${rel} → "${word}": baseline says ${count}, corpus now has ${seen}`);
  }
}

assert.deepEqual(
  stale,
  [],
  `devanagariWellFormed.baseline.json is stale — these entries are fixed or gone. ` +
    `Delete them (that is the win):\n  ` + stale.join('\n  ')
);

const remaining = Object.values(observed).reduce(
  (sum, words) => sum + Object.values(words).reduce((a, b) => a + b, 0),
  0
);
console.log(
  `Devanagari well-formedness: no new defects. ` +
    `${remaining} baselined instance(s) remain across ${Object.keys(observed).length} file(s) — see RULEBOOK §11.14.`
);
