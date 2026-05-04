#!/usr/bin/env node
// Parses Sundarkand/sundarkand.md into mobile-ready JSON.
// Run from repo root: node scripts/parse-sundarkand.mjs

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const SRC_FILE = join(REPO_ROOT, 'Sundarkand', 'sundarkand.md');
const OUT_FILE = join(REPO_ROOT, 'mobile', 'src', 'data', 'sundarkand', 'sundarkand.hi-en.json');

const REQUIRED_SECTIONS = [
  'Image Key',
  'Awadhi / Original',
  'Transliteration',
  'Hindi Meaning',
  'English Meaning',
];

function parseFrontmatter(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) throw new Error('sundarkand: missing frontmatter');
  const out = {};
  for (const line of match[1].split('\n')) {
    const m = line.match(/^([a-z_]+):\s*"?(.*?)"?$/);
    if (m) out[m[1]] = m[2];
  }
  return { frontmatter: out, rest: source.slice(match[0].length) };
}

function splitReadings(source) {
  const lines = source.split('\n');
  const readings = [];
  let current = null;
  for (const line of lines) {
    const m = line.match(/^### SK (\d+) \| ([^|]+?) \| (.+)$/);
    if (m) {
      if (current) readings.push(current);
      current = {
        number: Number(m[1]),
        label: m[2].trim(),
        labelEn: m[3].trim(),
        lines: [],
      };
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (current) readings.push(current);
  return readings;
}

function extractSections(reading) {
  const sections = {};
  let currentName = null;
  let currentBody = [];
  const flush = () => {
    if (currentName) sections[currentName] = currentBody.join('\n').trim();
    currentName = null;
    currentBody = [];
  };

  for (const line of reading.lines) {
    const m = line.match(/^\*\*([^*]+)\*\*\s*$/);
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

function toLines(raw) {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function toParagraphText(raw) {
  return raw
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/[ \t]+/g, ' ').trim())
    .filter(Boolean)
    .join('\n\n');
}

function main() {
  const source = readFileSync(SRC_FILE, 'utf8');
  const { frontmatter, rest } = parseFrontmatter(source);
  const expectedCount = Number(frontmatter.section_count);
  if (expectedCount !== 121) {
    throw new Error(`sundarkand: expected section_count 121, got ${frontmatter.section_count}`);
  }

  const readings = splitReadings(rest);
  if (readings.length !== expectedCount) {
    throw new Error(
      `sundarkand: frontmatter declares ${expectedCount} readings but found ${readings.length}`
    );
  }

  const ids = new Set();
  const data = readings.map((reading, index) => {
    if (reading.number !== index + 1) {
      throw new Error(
        `sundarkand: reading at index ${index} has number ${reading.number}, expected ${index + 1}`
      );
    }
    const sections = extractSections(reading);
    for (const required of REQUIRED_SECTIONS) {
      if (!sections[required]) {
        throw new Error(`sundarkand: SK ${reading.number} missing '${required}'`);
      }
    }
    const id = `sk-${String(reading.number).padStart(3, '0')}`;
    if (ids.has(id)) throw new Error(`sundarkand: duplicate id ${id}`);
    ids.add(id);

    const lines = toLines(sections['Awadhi / Original']);
    const transliteration = toLines(sections.Transliteration);
    const meaningHi = toParagraphText(sections['Hindi Meaning']);
    const meaningEn = toParagraphText(sections['English Meaning']);
    if (lines.length === 0 || transliteration.length === 0 || !meaningHi || !meaningEn) {
      throw new Error(`sundarkand: SK ${reading.number} has incomplete reader content`);
    }

    return {
      id,
      number: reading.number,
      label: reading.label,
      labelEn: reading.labelEn,
      imageKey: sections['Image Key'].trim(),
      lines,
      transliteration,
      meaningHi,
      meaningEn,
      commentaryHi: [],
      commentaryEn: [],
    };
  });

  mkdirSync(dirname(OUT_FILE), { recursive: true });
  writeFileSync(
    OUT_FILE,
    JSON.stringify(
      {
        title: 'सुंदरकाण्ड',
        titleEn: 'Sundarkand',
        source: 'Shri Ramcharitmanas, Sundarkand',
        readings: data,
      },
      null,
      2
    ) + '\n',
    'utf8'
  );
  console.log(`parsed Sundarkand · ${data.length} readings`);
}

main();
