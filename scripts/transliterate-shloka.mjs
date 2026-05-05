#!/usr/bin/env node
// Regenerates `linesEn` (IAST) from `lines` (Devanagari) for **Sanskrit shlokas only**.
// Run from repo root:
//   node scripts/transliterate-shloka.mjs
//
// Currently scoped to Sundarkand's three opening shlokas (verses where
// section === 'shloka'). Awadhi/Hindi verse forms (chaupai, doha, sortha,
// chhand, and the entirety of Hanuman Chalisa) keep their pronunciation-based
// ASCII linesEn — IAST is a Sanskrit-spelling transliteration and does not
// reflect how those texts are actually recited. See design.md §3.1.
//
// Idempotent: re-running produces a byte-identical diff once committed.
// Style standard: design.md §3.1 — IAST diacritics + Hunterian-style digraphs.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

// Each target lists the file plus a predicate selecting the verses to rewrite.
// Verses not matching the predicate are left untouched.
const TARGETS = {
  sundarkand: {
    path: join(REPO_ROOT, 'mobile', 'src', 'data', 'sundarkand', 'sundarkand.json'),
    selector: (verse) => verse.section === 'shloka',
  },
};

// --- Devanagari → IAST mapping --------------------------------------------------

const INDEPENDENT_VOWELS = {
  'अ': 'a', 'आ': 'ā', 'इ': 'i', 'ई': 'ī', 'उ': 'u', 'ऊ': 'ū',
  'ऋ': 'ṛ', 'ॠ': 'ṝ', 'ऌ': 'ḷ', 'ॡ': 'ḹ',
  'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
};

const CONSONANTS = {
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ṅ',
  'च': 'c', 'छ': 'ch', 'ज': 'j', 'झ': 'jh', 'ञ': 'ñ',
  'ट': 'ṭ', 'ठ': 'ṭh', 'ड': 'ḍ', 'ढ': 'ḍh', 'ण': 'ṇ',
  'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
  'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v',
  'श': 'ś', 'ष': 'ṣ', 'स': 's', 'ह': 'h',
  'ळ': 'ḻ',
};

const VOWEL_SIGNS = {
  'ा': 'ā', 'ि': 'i', 'ी': 'ī', 'ु': 'u', 'ू': 'ū',
  'ृ': 'ṛ', 'ॄ': 'ṝ', 'ॢ': 'ḷ', 'ॣ': 'ḹ',
  'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au',
};

const VIRAMA = '्';        // halant
const ANUSVARA = 'ं';      // → ṁ
const VISARGA = 'ः';       // → ḥ
const CHANDRABINDU = 'ँ';  // → ṁ (folded to anusvara to match Gita corpus)
const AVAGRAHA = 'ऽ';      // → '
const NUKTA = '़';
const DANDA = '।';
const DOUBLE_DANDA = '॥';

const DEV_DIGITS = /[०-९]/;

function diacriticFor(char) {
  if (char === ANUSVARA) return 'ṁ';
  if (char === VISARGA) return 'ḥ';
  if (char === CHANDRABINDU) return 'ṁ';
  return null;
}

function devanagariToIASTBase(text) {
  let out = '';
  let i = 0;
  while (i < text.length) {
    const ch = text[i];

    if (CONSONANTS[ch]) {
      const base = CONSONANTS[ch];
      i += 1;
      // Skip nukta — we don't preserve nukta-modified phonemes (rare in HC/Sundarkand)
      if (text[i] === NUKTA) i += 1;
      const after = text[i];
      if (after === VIRAMA) {
        out += base;
        i += 1;
      } else if (VOWEL_SIGNS[after]) {
        out += base + VOWEL_SIGNS[after];
        i += 1;
        const post = diacriticFor(text[i]);
        if (post !== null) {
          out += post;
          i += 1;
        }
      } else {
        out += base + 'a';
        const post = diacriticFor(after);
        if (post !== null) {
          out += post;
          i += 1;
        }
      }
      continue;
    }

    if (INDEPENDENT_VOWELS[ch]) {
      out += INDEPENDENT_VOWELS[ch];
      i += 1;
      const post = diacriticFor(text[i]);
      if (post !== null) {
        out += post;
        i += 1;
      }
      continue;
    }

    if (ch === ANUSVARA || ch === VISARGA || ch === CHANDRABINDU) {
      out += diacriticFor(ch);
      i += 1;
      continue;
    }

    if (ch === AVAGRAHA) {
      out += "'";
      i += 1;
      continue;
    }

    if (ch === VIRAMA || ch === NUKTA) {
      i += 1;
      continue;
    }

    if (ch === DANDA || ch === DOUBLE_DANDA) {
      // Strip; consume any adjacent verse-marker characters: dandas, ASCII
      // and Devanagari digits, periods, and pipe separators (e.g. ।।1.1।।).
      i += 1;
      while (
        i < text.length &&
        (DEV_DIGITS.test(text[i]) ||
          /[0-9]/.test(text[i]) ||
          text[i] === DANDA ||
          text[i] === DOUBLE_DANDA ||
          text[i] === '.' ||
          text[i] === '|')
      ) {
        i += 1;
      }
      out = out.replace(/\s+$/, '');
      continue;
    }

    if (DEV_DIGITS.test(ch)) {
      i += 1;
      continue;
    }

    // Drop zero-width formatting marks (ZWNJ, ZWJ, BOM, soft hyphen) that
    // sometimes leak in from copy-paste sources.
    const code = ch.charCodeAt(0);
    if (code === 0x200C || code === 0x200D || code === 0xFEFF || code === 0x00AD) {
      i += 1;
      continue;
    }

    out += ch;
    i += 1;
  }
  return out;
}

// --- Hunterian post-processing -------------------------------------------------
//
// Order matters and uses negative lookahead so re-running on already-processed
// text is a no-op (idempotency requirement, design.md §10).
//
//   छ → 'ch' base → 'chh'
//   च → 'c'  base → 'ch'
//   ष → 'ṣ'  → 'ṣh'
//   श → 'ś'  → 'śh'
//   ृ/ऋ → 'ṛ' → 'ṛi' (epenthetic i)

// Vowels that trigger Hunterian aspiration on a preceding sibilant
// (ś / ṣ → śh / ṣh only when followed by a vowel).
const VOWEL_FOR_ASPIRATE = '[aāiīuūeoṛṝ]';

function applyHunterian(iast) {
  let s = iast;
  s = s.replace(/ch(?!h)/g, 'chh');
  s = s.replace(/c(?!h)/g, 'ch');
  s = s.replace(new RegExp(`ṣ(?=${VOWEL_FOR_ASPIRATE})`, 'g'), 'ṣh');
  s = s.replace(new RegExp(`ś(?=${VOWEL_FOR_ASPIRATE})`, 'g'), 'śh');
  s = s.replace(/ṛ(?!i)/g, 'ṛi');
  return s;
}

export function transliterateLine(devanagari) {
  return applyHunterian(devanagariToIASTBase(devanagari));
}

// --- Driver --------------------------------------------------------------------

function processFile({ path, selector }, label) {
  const raw = readFileSync(path, 'utf8');
  const data = JSON.parse(raw);
  const verses = data.verses;
  if (!Array.isArray(verses)) {
    throw new Error(`${label}: expected top-level "verses" array`);
  }

  let matched = 0;
  let updated = 0;
  for (const verse of verses) {
    if (!selector(verse)) continue;
    matched += 1;
    if (!Array.isArray(verse.lines) || !Array.isArray(verse.linesEn)) {
      throw new Error(`${label}: verse ${verse.id} missing lines or linesEn`);
    }
    if (verse.lines.length !== verse.linesEn.length) {
      throw new Error(
        `${label}: verse ${verse.id} has lines.length=${verse.lines.length} but linesEn.length=${verse.linesEn.length}`,
      );
    }
    const next = verse.lines.map((line) => transliterateLine(line));
    if (JSON.stringify(next) !== JSON.stringify(verse.linesEn)) {
      verse.linesEn = next;
      updated += 1;
    }
  }

  const out = JSON.stringify(data, null, 2) + '\n';
  const fileChanged = out !== raw;
  if (fileChanged) writeFileSync(path, out, 'utf8');
  return { matched, updated, fileChanged };
}

function main() {
  const args = process.argv.slice(2);
  let target = null;
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--target') {
      target = args[i + 1];
      i += 1;
    }
  }

  const targets = target ? [target] : Object.keys(TARGETS);
  for (const t of targets) {
    if (!TARGETS[t]) {
      console.error(`Unknown target: ${t}. Known: ${Object.keys(TARGETS).join(', ')}`);
      process.exit(1);
    }
    const stats = processFile(TARGETS[t], t);
    const fileMsg = stats.fileChanged ? 'file rewritten' : 'no changes';
    console.log(`${t}: ${stats.updated}/${stats.matched} matching verses updated (${fileMsg})`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
