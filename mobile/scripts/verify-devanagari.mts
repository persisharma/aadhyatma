// Devanagari well-formedness verification for content SOURCES (RULEBOOK §11.14).
//
// WHY: src/data/__tests__/devanagariWellFormed.test.ts gates the shipped JSON, but the
// Gita JSON is generated from BhagwadGita/chapters/*.md by scripts/parse-gita.mjs, and
// that generator is a whitespace-only pass-through. So a malformed cluster in the source
// markdown lands in shipped content verbatim, and fixing the JSON by hand is erased by
// the next regeneration. This harness validates the generator INPUTS, so the defect is
// caught where it can actually be fixed for good.
//
// It also scans the raw scrape at the repo root, which is the upstream of the chapter
// split and therefore the true origin of the class.
//
// Run:  npx tsx scripts/verify-devanagari.mts
//       npx tsx scripts/verify-devanagari.mts <path> [<path>...]
// Exit: non-zero if any scanned file contains a mark with no legal base.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import {
  findDevanagariDefects,
  describeDevanagariDefect,
  type DevanagariDefectKind,
} from '../src/data/devanagariWellFormed';

const REPO_ROOT = resolve(import.meta.dirname, '..', '..');

// Generator inputs, in pipeline order: raw scrape → per-chapter split → shipped JSON.
const DEFAULT_TARGETS = [
  'bhagavad-gita-complete-hi-en.md',
  'BhagwadGita/chapters',
  'HanumanChalisa',
  'Sundarkand',
  'mobile/src/data',
];

const TEXT_EXTENSIONS = new Set(['.md', '.json', '.txt']);

function expand(target: string): string[] {
  const full = resolve(REPO_ROOT, target);
  let stat;
  try {
    stat = statSync(full);
  } catch {
    return [];
  }
  if (stat.isFile()) return [full];
  const out: string[] = [];
  for (const entry of readdirSync(full)) {
    // __tests__ holds the baseline ledger, which quotes every known-broken word by
    // design — scanning it would report the debt file as fresh corruption.
    if (entry === 'node_modules' || entry === '__tests__' || entry.startsWith('.')) continue;
    const child = join(full, entry);
    if (statSync(child).isDirectory()) out.push(...expand(relative(REPO_ROOT, child)));
    else if (TEXT_EXTENSIONS.has(entry.slice(entry.lastIndexOf('.')))) out.push(child);
  }
  return out;
}

const targets = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_TARGETS;
const files = [...new Set(targets.flatMap(expand))].sort();

if (files.length === 0) {
  console.error(`No readable files under: ${targets.join(', ')}`);
  process.exit(1);
}

let defectCount = 0;
let fileCount = 0;
const byKind = new Map<DevanagariDefectKind, number>();
const byWord = new Map<string, number>();

for (const file of files) {
  const rel = relative(REPO_ROOT, file);
  const text = readFileSync(file, 'utf8');
  const defects = findDevanagariDefects(text);
  if (defects.length === 0) continue;

  fileCount += 1;
  defectCount += defects.length;
  console.log(`\n${rel}  —  ${defects.length} defect(s)`);

  // One line per distinct broken word: the same OCR artifact repeats, and a
  // reviewer needs the vocabulary of the corruption, not 28 identical rows.
  const seen = new Map<string, { count: number; line: number; kind: DevanagariDefectKind }>();
  for (const defect of defects) {
    byKind.set(defect.kind, (byKind.get(defect.kind) ?? 0) + 1);
    byWord.set(defect.word, (byWord.get(defect.word) ?? 0) + 1);
    const existing = seen.get(defect.word);
    if (existing) existing.count += 1;
    else {
      const line = text.slice(0, defect.index).split('\n').length;
      seen.set(defect.word, { count: 1, line, kind: defect.kind });
    }
  }
  for (const [word, { count, line, kind }] of seen) {
    const times = count > 1 ? ` ×${count}` : '';
    console.log(`  L${line}\t${kind}\t"${word}"${times}`);
  }
}

console.log(`\n${'─'.repeat(70)}`);
console.log(`Scanned ${files.length} file(s).`);

if (defectCount === 0) {
  console.log('Devanagari well-formed: no combining mark is missing a legal base.');
  process.exit(0);
}

console.log(`${defectCount} defect(s) in ${fileCount} file(s). These render as ◌ (U+25CC) on device.`);
console.log('\nBy kind:');
for (const [kind, n] of [...byKind].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(4)}  ${kind}`);
}
console.log(`\n${byWord.size} distinct broken word form(s). Most frequent:`);
for (const [word, n] of [...byWord].sort((a, b) => b[1] - a[1]).slice(0, 15)) {
  console.log(`  ${String(n).padStart(4)}  ${word}`);
}
console.log(
  '\nFix the SOURCE (BhagwadGita/chapters/*.md for the Gita, the pinned corpus for Valmiki),\n' +
    'then regenerate — hand-editing generated JSON is erased by the next build. RULEBOOK §11.14.'
);
process.exit(1);
