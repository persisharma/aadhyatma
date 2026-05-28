#!/usr/bin/env node
/**
 * Fix Sundarkand transliteration leaks.
 *
 * For any verse where `linesEn` array contains Devanagari characters,
 * replace that specific line with an empty string "" (placeholder).
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, '..', 'mobile', 'src', 'data', 'sundarkand');
const DEVANAGARI_RE = /[ऀ-ॿ]/;

const files = readdirSync(DATA_DIR)
  .filter(f => f.startsWith('chapter-') && f.endsWith('.json'))
  .sort();

let totalFixed = 0;

for (const file of files) {
  const filePath = join(DATA_DIR, file);
  const chapter = JSON.parse(readFileSync(filePath, 'utf8'));
  let fileChanged = false;

  for (const verse of chapter.verses) {
    if (!verse.linesEn || !Array.isArray(verse.linesEn)) continue;

    for (let i = 0; i < verse.linesEn.length; i++) {
      if (DEVANAGARI_RE.test(verse.linesEn[i])) {
        console.log(`  ${file} | ${verse.id || verse.stanza} line ${i}: replaced Devanagari`);
        verse.linesEn[i] = '';
        fileChanged = true;
        totalFixed++;
      }
    }
  }

  if (fileChanged) {
    writeFileSync(filePath, JSON.stringify(chapter, null, 2) + '\n', 'utf8');
    console.log(`  -> Wrote ${file}`);
  }
}

console.log(`\nDone! Replaced ${totalFixed} Devanagari line(s) in Sundarkand linesEn with empty strings.`);
