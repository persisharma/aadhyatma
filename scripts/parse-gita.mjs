#!/usr/bin/env node
// Parses BhagwadGita/chapters/chapter-NN-*.md into mobile-ready JSON.
// Run from repo root:  node scripts/parse-gita.mjs

import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const SRC_DIR = join(REPO_ROOT, 'BhagwadGita', 'chapters');
const OUT_DIR = join(REPO_ROOT, 'mobile', 'src', 'data', 'gita');

const REQUIRED_SECTIONS = [
  'Sanskrit Shloka',
  'Transliteration',
  'Hindi Meaning',
  'English Meaning',
  'Hindi Commentary',
  'English Commentary',
];

function parseFrontmatter(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) throw new Error('missing frontmatter');
  const out = {};
  for (const line of match[1].split('\n')) {
    const m = line.match(/^([a-z_]+):\s*"?(.*?)"?$/);
    if (m) out[m[1]] = m[2];
  }
  return { frontmatter: out, rest: source.slice(match[0].length) };
}

function parseChapterHeader(source, chapterNumber) {
  const headerRe = new RegExp(`^## Chapter ${chapterNumber} \\| ([^|]+?) \\| (.+)$`, 'm');
  const m = source.match(headerRe);
  if (!m) throw new Error(`chapter ${chapterNumber}: could not find '## Chapter N | hi | en' line`);
  return { titleHi: m[1].trim(), titleEn: m[2].trim() };
}

function extractChapterSummary(source) {
  const summaryStart = source.indexOf('### Chapter Summary');
  if (summaryStart === -1) return { summaryHi: undefined, summaryEn: undefined };
  const firstVerse = source.indexOf('\n### BG ');
  const block = firstVerse === -1 ? source.slice(summaryStart) : source.slice(summaryStart, firstVerse);
  const hiMatch = block.match(/\*\*Hindi\*\*\n\n([\s\S]*?)(?=\n\n\*\*English\*\*|\n---|$)/);
  const enMatch = block.match(/\*\*English\*\*\n\n([\s\S]*?)(?=\n### |\n---|$)/);
  return {
    summaryHi: hiMatch ? hiMatch[1].trim() : undefined,
    summaryEn: enMatch ? enMatch[1].trim() : undefined,
  };
}

function splitIntoVerseBlocks(source) {
  const lines = source.split('\n');
  const blocks = [];
  let current = null;
  for (const line of lines) {
    const m = line.match(/^### BG (\d+)\.(\d+)\s*$/);
    if (m) {
      if (current) blocks.push(current);
      current = { chapter: Number(m[1]), number: Number(m[2]), lines: [] };
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (current) blocks.push(current);
  return blocks;
}

function extractVerseSections(block) {
  const sectionRe = /^\*\*([A-Za-z ]+)\*\*\s*$/;
  const sections = {};
  let currentName = null;
  let currentBody = [];
  const flush = () => {
    if (currentName) sections[currentName] = currentBody.join('\n').trim();
    currentName = null;
    currentBody = [];
  };
  for (const line of block.lines) {
    const m = line.match(sectionRe);
    if (m) {
      flush();
      currentName = m[1].trim();
    } else if (currentName) {
      currentBody.push(line);
    }
  }
  flush();
  return sections;
}

// Some source verses cram all Sanskrit onto a single line. Split on single daṇḍa
// (।) — not double daṇḍa (।।) which is the verse-end marker. Also split speaker
// prefixes ("अर्जुन उवाच") when they're glued to the following verse text.
const SPEAKER_RE = /^((?:श्री\s*)?(?:भगवान्?|धृतराष्ट्र|सञ्जय|संजय|अर्जुन|श्रीकृष्ण|कृष्ण)\s*उवाच)([।]?)(.*)$/u;

function mergeVerseNumberTrailing(chunks) {
  const result = [];
  for (const chunk of chunks) {
    if (/^[\d.।]+$/.test(chunk) && result.length > 0) {
      result[result.length - 1] += chunk;
    } else {
      result.push(chunk);
    }
  }
  return result;
}

function toSanskritLines(raw) {
  let lines = raw.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length === 1) {
    const src = lines[0];
    const chunks = [];
    let buf = '';
    for (let i = 0; i < src.length; i++) {
      buf += src[i];
      if (src[i] === '।' && src[i + 1] !== '।') {
        chunks.push(buf.trim());
        buf = '';
      }
    }
    if (buf.trim().length > 0) chunks.push(buf.trim());
    if (chunks.length >= 1) lines = chunks;
  }
  const expanded = [];
  for (const line of lines) {
    const m = line.match(SPEAKER_RE);
    if (m && m[3].trim().length > 0) {
      expanded.push((m[1] + (m[2] || '')).trim());
      expanded.push(m[3].trim());
    } else {
      expanded.push(line);
    }
  }
  return mergeVerseNumberTrailing(expanded);
}

function toTransliterationLines(raw) {
  return raw.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
}

function toParagraphs(raw) {
  return raw
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter((p) => {
      // Drop paragraphs that are just punctuation / placeholder markers
      // (source data sometimes contains lone "." for missing English commentary).
      const content = p.replace(/[.,;:!?।\s\-—–]/g, '');
      return content.length >= 10;
    });
}

function parseChapterFile(filePath) {
  const source = readFileSync(filePath, 'utf8');
  const { frontmatter, rest } = parseFrontmatter(source);
  const chapter = Number(frontmatter.chapter_number);
  const declaredVerseCount = Number(frontmatter.verse_count);
  if (!Number.isInteger(chapter) || chapter < 1 || chapter > 18) {
    throw new Error(`${filePath}: invalid chapter_number in frontmatter`);
  }
  const { titleHi, titleEn } = parseChapterHeader(rest, chapter);
  const { summaryHi, summaryEn } = extractChapterSummary(rest);
  const verseBlocks = splitIntoVerseBlocks(rest);

  if (verseBlocks.length !== declaredVerseCount) {
    throw new Error(
      `chapter ${chapter}: frontmatter claims ${declaredVerseCount} verses but found ${verseBlocks.length} '### BG' markers`
    );
  }

  const verses = verseBlocks.map((block) => {
    const sections = extractVerseSections(block);
    for (const required of REQUIRED_SECTIONS) {
      if (!sections[required] || sections[required].length === 0) {
        throw new Error(
          `chapter ${chapter} verse ${block.number}: missing or empty section '${required}'`
        );
      }
    }
    const sanskrit = toSanskritLines(sections['Sanskrit Shloka']);
    const transliteration = toTransliterationLines(sections['Transliteration']);
    if (sanskrit.length < 2) {
      throw new Error(`chapter ${chapter} verse ${block.number}: Sanskrit has < 2 lines`);
    }
    if (transliteration.length === 0) {
      throw new Error(`chapter ${chapter} verse ${block.number}: transliteration empty`);
    }
    const meaningHi = sections['Hindi Meaning'].replace(/\s+/g, ' ').trim();
    const meaningEn = sections['English Meaning'].replace(/\s+/g, ' ').trim();
    const commentaryHi = toParagraphs(sections['Hindi Commentary']);
    const commentaryEn = toParagraphs(sections['English Commentary']);
    if (commentaryHi.length === 0 && commentaryEn.length === 0) {
      throw new Error(
        `chapter ${chapter} verse ${block.number}: both Hindi and English commentary are empty`
      );
    }
    return {
      id: `bg-${chapter}-${block.number}`,
      chapter,
      number: block.number,
      sanskrit,
      transliteration,
      meaningHi,
      meaningEn,
      commentaryHi,
      commentaryEn,
    };
  });

  return {
    chapter,
    titleHi,
    titleEn,
    verseCount: declaredVerseCount,
    summaryHi,
    summaryEn,
    verses,
  };
}

function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const files = readdirSync(SRC_DIR)
    .filter((f) => /^chapter-\d{2}-.+\.md$/.test(f))
    .sort();
  if (files.length !== 18) {
    throw new Error(`expected 18 chapter files in ${SRC_DIR}, found ${files.length}`);
  }
  const manifest = [];
  let totalVerses = 0;
  for (const file of files) {
    const fullPath = join(SRC_DIR, file);
    const parsed = parseChapterFile(fullPath);
    const outFile = join(OUT_DIR, `chapter-${String(parsed.chapter).padStart(2, '0')}.json`);
    writeFileSync(outFile, JSON.stringify(parsed, null, 2) + '\n', 'utf8');
    manifest.push({
      chapter: parsed.chapter,
      titleHi: parsed.titleHi,
      titleEn: parsed.titleEn,
      verseCount: parsed.verseCount,
    });
    totalVerses += parsed.verseCount;
    console.log(
      `  chapter ${String(parsed.chapter).padStart(2, '0')}: ${parsed.verseCount} verses`
    );
  }
  writeFileSync(
    join(OUT_DIR, 'chapters-manifest.json'),
    JSON.stringify(manifest, null, 2) + '\n',
    'utf8'
  );
  console.log(`\nparsed 18 chapters · ${totalVerses} verses total`);
}

main();
