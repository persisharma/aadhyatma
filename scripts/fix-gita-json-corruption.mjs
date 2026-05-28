#!/usr/bin/env node
// Fixes systematic data corruption in generated Gita JSON files.
// Corruption patterns:
//   1. commentaryEn: `?` used as comma mid-sentence
//   2. commentaryEn: missing space after `.` before uppercase letter
//   3. commentaryHi: Bengali danda `৷` instead of Devanagari `।`
//   4. BG 18.2 meaningHi contains placeholder text instead of actual translation
//
// Run from repo root:  node scripts/fix-gita-json-corruption.mjs

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const JSON_DIR = join(REPO_ROOT, 'mobile', 'src', 'data', 'gita');

// --- Fix 1: Replace ? used as comma mid-sentence ---
function fixQuestionMarkAsComma(text) {
  return text.replace(/([a-z])\? ([a-zA-Z])/g, '$1, $2');
}

// --- Fix 2: Replace Bengali danda ৷ with Devanagari danda । ---
function fixBengaliDanda(text) {
  return text.replace(/৷/g, '।');
}

// --- Fix 3: Add space after . before uppercase letter ---
function fixMissingSpaceAfterDot(text) {
  return text.replace(/\.([A-Z])/g, (match, nextChar, offset, str) => {
    const before = str.slice(Math.max(0, offset - 4), offset);

    // Skip single uppercase letter followed by dot (scripture refs like V.5, I.1, X.25)
    if (/[A-Z]$/.test(before)) return match;

    // Skip common abbreviations: Cf, Ch, Dr, Mr, Ms, St, vs
    if (/(?:Cf|Ch|Dr|Mr|Ms|St|vs)$/i.test(before)) return match;

    // Skip e.g., i.e., viz., etc.
    if (/(?:e\.g|i\.e|viz|etc)$/i.test(before)) return match;

    // Skip numbered references like II.48, IV.21, IX.24
    if (/[IVX]+$/.test(before)) return match;

    return '. ' + nextChar;
  });
}

function countMissingSpaces(text) {
  let count = 0;
  const re = /\.([A-Z])/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const offset = m.index;
    const before = text.slice(Math.max(0, offset - 4), offset);
    if (/[A-Z]$/.test(before)) continue;
    if (/(?:Cf|Ch|Dr|Mr|Ms|St|vs)$/i.test(before)) continue;
    if (/(?:e\.g|i\.e|viz|etc)$/i.test(before)) continue;
    if (/[IVX]+$/.test(before)) continue;
    count++;
  }
  return count;
}

function processChapter(chapterNum) {
  const filePath = join(JSON_DIR, `chapter-${String(chapterNum).padStart(2, '0')}.json`);
  const data = JSON.parse(readFileSync(filePath, 'utf8'));

  let qmFixes = 0;
  let bdFixes = 0;
  let msFixes = 0;
  let meaningFix = false;

  for (const verse of data.verses) {
    // Fix commentaryEn: question marks as commas and missing spaces
    if (verse.commentaryEn && Array.isArray(verse.commentaryEn)) {
      verse.commentaryEn = verse.commentaryEn.map((para) => {
        const qmCount = (para.match(/([a-z])\? ([a-zA-Z])/g) || []).length;
        const msCount = countMissingSpaces(para);
        qmFixes += qmCount;
        msFixes += msCount;

        let fixed = fixQuestionMarkAsComma(para);
        fixed = fixMissingSpaceAfterDot(fixed);
        return fixed;
      });
    }

    // Fix commentaryHi: Bengali dandas
    if (verse.commentaryHi && Array.isArray(verse.commentaryHi)) {
      verse.commentaryHi = verse.commentaryHi.map((para) => {
        const bdCount = (para.match(/৷/g) || []).length;
        bdFixes += bdCount;
        return fixBengaliDanda(para);
      });
    }

    // Fix BG 18.2 meaningHi placeholder
    if (chapterNum === 18 && verse.number === 2) {
      if (verse.meaningHi === 'Hindi Translation By Swami Ramsukhdas') {
        verse.meaningHi = '';
        meaningFix = true;
      }
    }
  }

  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');

  return { qmFixes, bdFixes, msFixes, meaningFix };
}

function main() {
  let totalQM = 0;
  let totalBD = 0;
  let totalMS = 0;

  console.log('Fixing Gita JSON corruption...\n');

  for (let ch = 1; ch <= 18; ch++) {
    const stats = processChapter(ch);
    totalQM += stats.qmFixes;
    totalBD += stats.bdFixes;
    totalMS += stats.msFixes;

    const parts = [];
    if (stats.qmFixes) parts.push(`? → , : ${stats.qmFixes}`);
    if (stats.bdFixes) parts.push(`৷ → । : ${stats.bdFixes}`);
    if (stats.msFixes) parts.push(`.X → . X : ${stats.msFixes}`);
    if (stats.meaningFix) parts.push('BG 18.2 meaningHi cleared');

    if (parts.length > 0) {
      console.log(`  chapter-${String(ch).padStart(2, '0')}.json: ${parts.join(' | ')}`);
    }
  }

  console.log('\n--- TOTALS ---');
  console.log(`  ? replaced with , : ${totalQM}`);
  console.log(`  ৷ replaced with । : ${totalBD}`);
  console.log(`  missing spaces added: ${totalMS}`);
  console.log('\nDone. JSON files fixed.');
}

main();
