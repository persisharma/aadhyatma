#!/usr/bin/env node
/**
 * Fix transliteration spillover/corruption in Gita JSON files.
 *
 * For each spillover pair, the script uses the sanskrit line count as the
 * correct count. If transliteration has MORE lines than sanskrit, excess lines
 * at the end are moved to the start of the next verse's transliteration.
 *
 * Special cases:
 * - Ch10 v33: remove first transliteration line if it contains Devanagari
 * - Ch11 v19: if transliteration contains Devanagari, replace with empty array
 */

import { readFileSync, writeFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, '..', 'mobile', 'src', 'data', 'gita');
const DEVANAGARI_RE = /[ऀ-ॿ]/;

function readChapter(num) {
  const filePath = join(DATA_DIR, `chapter-${String(num).padStart(2, '0')}.json`);
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function writeChapter(num, data) {
  const filePath = join(DATA_DIR, `chapter-${String(num).padStart(2, '0')}.json`);
  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

/**
 * Fix a spillover pair: verse N has extra transliteration lines that belong to verse N+1.
 * Uses sanskrit line count as the correct count.
 */
function fixSpillover(chapterData, verseNumFrom, verseNumTo) {
  const vFrom = chapterData.verses.find(v => v.number === verseNumFrom);
  const vTo = chapterData.verses.find(v => v.number === verseNumTo);

  if (!vFrom || !vTo) {
    console.error(`  ERROR: Could not find verse ${verseNumFrom} or ${verseNumTo}`);
    return false;
  }

  const expectedFrom = vFrom.sanskrit.length;
  const expectedTo = vTo.sanskrit.length;
  const actualFrom = vFrom.transliteration.length;

  if (actualFrom <= expectedFrom) {
    console.log(`  v${verseNumFrom}: already correct (${actualFrom} translit, ${expectedFrom} sanskrit)`);
    return false;
  }

  const excess = actualFrom - expectedFrom;
  const spilledLines = vFrom.transliteration.slice(expectedFrom);

  console.log(`  v${verseNumFrom}: ${actualFrom} translit lines, expected ${expectedFrom} — moving ${excess} line(s) to v${verseNumTo}`);

  // Trim the source verse
  vFrom.transliteration = vFrom.transliteration.slice(0, expectedFrom);

  // Prepend spilled lines to the target verse
  vTo.transliteration = [...spilledLines, ...vTo.transliteration];

  // If the target now has too many lines (because it already had a concatenated duplicate),
  // trim to match its expected count, preferring the properly split lines from spillover
  if (vTo.transliteration.length > expectedTo) {
    vTo.transliteration = vTo.transliteration.slice(0, expectedTo);
  }

  console.log(`  v${verseNumTo}: now ${vTo.transliteration.length} translit lines (expected ${expectedTo})`);
  return true;
}

// --- Main ---

let changed = false;

// 1. Ch1 v5->v6
console.log('Ch1 v5->v6:');
let ch1 = readChapter(1);
changed = fixSpillover(ch1, 5, 6) || changed;

// 2. Ch1 v20->v21
console.log('Ch1 v20->v21:');
changed = fixSpillover(ch1, 20, 21) || changed;

// 3. Ch1 v26->v27
console.log('Ch1 v26->v27:');
changed = fixSpillover(ch1, 26, 27) || changed;

if (changed) {
  writeChapter(1, ch1);
  console.log('  -> Wrote chapter-01.json\n');
} else {
  console.log('  -> No changes needed for chapter 1\n');
}

// 4. Ch5 v8->v9
console.log('Ch5 v8->v9:');
let ch5 = readChapter(5);
changed = false;
changed = fixSpillover(ch5, 8, 9) || changed;

// 5. Ch5 v27->v28
console.log('Ch5 v27->v28:');
changed = fixSpillover(ch5, 27, 28) || changed;

if (changed) {
  writeChapter(5, ch5);
  console.log('  -> Wrote chapter-05.json\n');
} else {
  console.log('  -> No changes needed for chapter 5\n');
}

// 6. Ch10 v33: remove line 0 if it contains Devanagari
console.log('Ch10 v33:');
let ch10 = readChapter(10);
changed = false;
const v33 = ch10.verses.find(v => v.number === 33);
if (v33 && v33.transliteration.length > 0 && DEVANAGARI_RE.test(v33.transliteration[0])) {
  console.log(`  Removing Devanagari line: "${v33.transliteration[0].substring(0, 60)}..."`);
  v33.transliteration = v33.transliteration.slice(1);
  changed = true;
  console.log(`  Now ${v33.transliteration.length} lines (sanskrit: ${v33.sanskrit.length})`);
}
if (changed) {
  writeChapter(10, ch10);
  console.log('  -> Wrote chapter-10.json\n');
} else {
  console.log('  -> No changes needed for chapter 10\n');
}

// 7. Ch11 v19: if transliteration contains Devanagari, replace with empty array
console.log('Ch11 v19:');
let ch11 = readChapter(11);
changed = false;
const v19 = ch11.verses.find(v => v.number === 19);
if (v19) {
  const hasDevanagari = v19.transliteration.some(line => DEVANAGARI_RE.test(line));
  if (hasDevanagari) {
    console.log(`  Transliteration contains Devanagari — replacing with empty array (needs manual fix)`);
    v19.transliteration = [];
    changed = true;
  } else {
    console.log(`  No Devanagari found in transliteration`);
  }
}

// 8. Ch11 v26->v27
console.log('Ch11 v26->v27:');
changed = fixSpillover(ch11, 26, 27) || changed;

if (changed) {
  writeChapter(11, ch11);
  console.log('  -> Wrote chapter-11.json\n');
} else {
  console.log('  -> No changes needed for chapter 11\n');
}

// 9. Ch12 v3->v4
console.log('Ch12 v3->v4:');
let ch12 = readChapter(12);
changed = false;
changed = fixSpillover(ch12, 3, 4) || changed;
if (changed) {
  writeChapter(12, ch12);
  console.log('  -> Wrote chapter-12.json\n');
} else {
  console.log('  -> No changes needed for chapter 12\n');
}

// 10. Ch16 v15->v16
console.log('Ch16 v15->v16:');
let ch16 = readChapter(16);
changed = false;
changed = fixSpillover(ch16, 15, 16) || changed;
if (changed) {
  writeChapter(16, ch16);
  console.log('  -> Wrote chapter-16.json\n');
} else {
  console.log('  -> No changes needed for chapter 16\n');
}

// 11. Ch18 v36->v37
console.log('Ch18 v36->v37:');
let ch18 = readChapter(18);
changed = false;
changed = fixSpillover(ch18, 36, 37) || changed;
if (changed) {
  writeChapter(18, ch18);
  console.log('  -> Wrote chapter-18.json\n');
} else {
  console.log('  -> No changes needed for chapter 18\n');
}

console.log('Done! Gita transliteration spillover fixes applied.');
