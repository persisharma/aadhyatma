#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const repoRoot = resolve(import.meta.dirname, '..');

function readRequired(path) {
  const fullPath = join(repoRoot, path);
  if (!existsSync(fullPath)) {
    throw new Error(`Missing required file: ${path}`);
  }
  return readFileSync(fullPath, 'utf8');
}

function requireText(source, needle, label) {
  if (!source.includes(needle)) {
    throw new Error(`${label} is missing expected text: ${needle}`);
  }
}

const markdown = readRequired('Sundarkand/sundarkand.md');
const dataJson = readRequired('mobile/src/data/sundarkand/sundarkand.hi-en.json');
const dataIndex = readRequired('mobile/src/data/sundarkand/index.ts');
const texts = readRequired('mobile/src/data/texts.ts');
const home = readRequired('mobile/src/screens/HomeScreen.tsx');
const navigator = readRequired('mobile/src/navigation/RootNavigator.tsx');
const navTypes = readRequired('mobile/src/navigation/types.ts');

readRequired('Sundarkand/README.md');

const sectionCountMatch = markdown.match(/^section_count:\s*(\d+)$/m);
if (!sectionCountMatch) {
  throw new Error('Sundarkand markdown must declare section_count frontmatter');
}

const expectedSectionCount = Number(sectionCountMatch[1]);
if (expectedSectionCount !== 121) {
  throw new Error(`Sundarkand must contain the full 121 readings, got ${expectedSectionCount}`);
}
const sections = markdown.match(/^### SK \d+/gm) ?? [];
if (sections.length !== expectedSectionCount) {
  throw new Error(
    `Sundarkand markdown declares ${expectedSectionCount} sections but has ${sections.length}`
  );
}

for (const requiredSection of [
  '**Awadhi / Original**',
  '**Transliteration**',
  '**Hindi Meaning**',
  '**English Meaning**',
]) {
  requireText(markdown, requiredSection, 'Sundarkand markdown');
}

const data = JSON.parse(dataJson);
if (data.title !== 'सुंदरकाण्ड') {
  throw new Error(`Unexpected Sundarkand title: ${data.title}`);
}
if (!Array.isArray(data.readings) || data.readings.length !== expectedSectionCount) {
  throw new Error(
    `Sundarkand JSON should contain ${expectedSectionCount} readings, got ${
      data.readings?.length ?? 'none'
    }`
  );
}

const seenIds = new Set();
for (const reading of data.readings) {
  if (seenIds.has(reading.id)) throw new Error(`Duplicate Sundarkand reading id: ${reading.id}`);
  seenIds.add(reading.id);
  for (const field of ['id', 'label', 'lines', 'meaningHi', 'meaningEn']) {
    if (!reading[field] || (Array.isArray(reading[field]) && reading[field].length === 0)) {
      throw new Error(`Reading ${reading.id ?? '<unknown>'} has empty field: ${field}`);
    }
  }
}

requireText(dataIndex, 'sundarkandReadings', 'Sundarkand data index');
requireText(texts, "id: 'sundarkand'", 'Library data');

const sundarkandEntry = texts.match(/\{\n\s*id: 'sundarkand',[\s\S]*?\n\s*\}/);
if (!sundarkandEntry) {
  throw new Error('Library data does not contain a Sundarkand entry');
}
requireText(sundarkandEntry[0], "status: 'active'", 'Sundarkand library entry');
if (texts.indexOf("id: 'sundarkand'") > texts.indexOf("id: 'ramcharitmanas'")) {
  throw new Error('Sundarkand should be ordered before coming Ramcharitmanas in the library');
}

requireText(home, "navigation.navigate('SundarkandReader'", 'Home navigation');
requireText(navigator, 'SundarkandReaderScreen', 'Root navigator');
requireText(navTypes, 'SundarkandReader', 'Navigation types');

console.log(`Sundarkand module validated: ${expectedSectionCount} readings linked.`);
