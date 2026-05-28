#!/usr/bin/env node
// Fixes systematic data corruption in source markdown files for Bhagavad Gita.
// Corruption patterns:
//   1. `?` used as comma mid-sentence (e.g., "past? present" → "past, present")
//   2. Bengali danda `৷` instead of Devanagari `।`
//   3. Missing space after `.` before uppercase letter (e.g., "Lord.The" → "Lord. The")
//
// Run from repo root:  node scripts/fix-gita-corruption.mjs

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const SRC_DIR = join(REPO_ROOT, 'BhagwadGita', 'chapters');

// --- Fix 1: Replace ? used as comma mid-sentence ---
// Safe pattern: lowercase letter followed by ? then space then any word char.
// This avoids actual questions (which end sentences) and quoted questions.
function fixQuestionMarkAsComma(text) {
  return text.replace(/([a-z])\? ([a-zA-Z])/g, '$1, $2');
}

// --- Fix 2: Replace Bengali danda ৷ with Devanagari danda । ---
function fixBengaliDanda(text) {
  return text.replace(/৷/g, '।');
}

// --- Fix 3: Add space after . before uppercase letter ---
// Exceptions: scripture refs like V.5, Ch.1, Cf., abbreviations like e.g., i.e., viz., etc.
function fixMissingSpaceAfterDot(text) {
  return text.replace(/\.([A-Z])/g, (match, nextChar, offset, str) => {
    // Look at what precedes the dot to decide if this is an abbreviation
    const before = str.slice(Math.max(0, offset - 4), offset);

    // Skip single uppercase letter followed by dot (scripture refs like V.5, I.1, X.25)
    if (/[A-Z]$/.test(before)) return match;

    // Skip common abbreviations: Cf, Ch, Dr, Mr, Ms, St, vs
    if (/(?:Cf|Ch|Dr|Mr|Ms|St|vs)$/i.test(before)) return match;

    // Skip e.g., i.e., viz., etc. (look for these specific endings)
    if (/(?:e\.g|i\.e|viz|etc)$/i.test(before)) return match;

    // Skip numbered references like II.48, IV.21, IX.24
    if (/[IVX]+$/.test(before)) return match;

    return '. ' + nextChar;
  });
}

function processFile(filePath) {
  const original = readFileSync(filePath, 'utf8');
  let fixed = original;

  fixed = fixQuestionMarkAsComma(fixed);
  fixed = fixBengaliDanda(fixed);
  fixed = fixMissingSpaceAfterDot(fixed);

  const stats = {
    questionMarks: (original.match(/([a-z])\? ([a-zA-Z])/g) || []).length,
    bengaliDandas: (original.match(/৷/g) || []).length,
    missingSpaces: countMissingSpaces(original),
  };

  if (fixed !== original) {
    writeFileSync(filePath, fixed, 'utf8');
  }

  return stats;
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

function main() {
  const files = readdirSync(SRC_DIR)
    .filter((f) => /^chapter-\d{2}-.+\.md$/.test(f))
    .sort();

  if (files.length !== 18) {
    throw new Error(`expected 18 chapter files in ${SRC_DIR}, found ${files.length}`);
  }

  let totalQM = 0;
  let totalBD = 0;
  let totalMS = 0;

  console.log('Fixing Gita source markdown corruption...\n');

  for (const file of files) {
    const fullPath = join(SRC_DIR, file);
    const stats = processFile(fullPath);
    totalQM += stats.questionMarks;
    totalBD += stats.bengaliDandas;
    totalMS += stats.missingSpaces;

    if (stats.questionMarks || stats.bengaliDandas || stats.missingSpaces) {
      console.log(
        `  ${file}: ? → , : ${stats.questionMarks} | ৷ → । : ${stats.bengaliDandas} | .X → . X : ${stats.missingSpaces}`
      );
    }
  }

  console.log('\n--- TOTALS ---');
  console.log(`  ? replaced with , : ${totalQM}`);
  console.log(`  ৷ replaced with । : ${totalBD}`);
  console.log(`  missing spaces added: ${totalMS}`);
  console.log('\nDone. Source markdown files fixed.');
}

main();
