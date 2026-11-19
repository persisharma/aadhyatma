import { deityCatalog, deities, getDeityMeta } from '../deities';
import { library } from '../texts';
import { getStuti } from '../stuti';
import { flatPoolSegments } from '../versePoolFlat';
import { parshuramPublished } from '../parshuramAvailability';
import { getSourceBackground, getDeityBackground } from '../backgrounds';
import { devotionalArtForVerse } from '../devotionalShareArt';
import { contentByLang } from '@/utils/localize';
import { suvicharThoughtsFor, findSuvicharThought, suvicharSourceLabel } from '../suvicharContent';
import { suvicharDeities, suvicharFrames } from '../suvichar';
import { buildEntryStartTarget } from '@/navigation/entryRoutes';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

test('ships the actual normalized parashu icon and preserves its generated master', () => {
  const folder = path.resolve(__dirname, '../../../assets/icons/storybook');
  const manifest = JSON.parse(fs.readFileSync(path.join(folder, 'manifest.json'), 'utf8'));
  const icon = manifest.icons.find((i: { name: string }) => i.name === 'parashu');
  expect(icon).toBeDefined();
  const bytes = fs.readFileSync(path.join(folder, icon.file));
  expect(bytes.readUInt32BE(16)).toBe(512);
  expect(bytes.readUInt32BE(20)).toBe(512);
  expect(bytes.includes(Buffer.from('tRNS'))).toBe(true);
  expect(createHash('sha256').update(bytes).digest('hex')).toBe(icon.sha256);
  const master = fs.readFileSync(path.join(folder, icon.provenanceFile));
  expect(createHash('sha256').update(master).digest('hex')).toBe(icon.masterSha256);
  const [left, top, right, bottom] = icon.visibleBounds;
  expect(Math.max(right - left, bottom - top)).toBeLessThanOrEqual(434);
  expect(Math.abs((left + right) / 2 - 256)).toBeLessThanOrEqual(2);
  expect(Math.abs((top + bottom) / 2 - 256)).toBeLessThanOrEqual(2);
});

test('keeps the Parshuram identity separate from Ram and Vishnu', () => {
  expect(getDeityMeta('parshuram')).toMatchObject({ nameHi: 'भगवान परशुराम', nameEn: 'Bhagwan Parshuram', iconKey: 'parashu' });
  expect(deityCatalog.filter(d => d.id === 'parshuram')).toHaveLength(1);
  const entry = library.find(e => e.id === 'parshuram-stotram')!;
  expect(entry.deities).toEqual(['parshuram']);
  expect(entry.verseCount).toBe(7);
  expect(getSourceBackground(entry.id)).toBe(getDeityBackground('parshuram'));
  expect(devotionalArtForVerse({ sourceId: entry.id, verseIndex: 0 })).toBe('parshuram');
});

test('preserves the complete traditional stotra, closing verse, provenance and all four scripts', () => {
  const payload = require('../stuti/parshuram-stotram.json');
  const stuti = getStuti('parshuram-stotram');
  expect(stuti.verses).toHaveLength(7);
  expect(payload.source.referenceUrls).toHaveLength(2);
  expect(payload.source.notes).toContain('चिरजीवनम्');
  expect(stuti.verses[0].lines[0]).toBe('कराभ्यां परशुं चापं दधानं रेणुकात्मजम् ।');
  expect(stuti.verses[6].lines[1]).toBe('य एतानि जपेद्रामनामानि स कृती भवेत् ॥ ७॥');
  for (const [i, v] of stuti.verses.entries()) {
    expect(v.id).toBe(`parshuram-stotram-${i + 1}`);
    expect(v.number).toBe(i + 1);
    expect(v.linesEn).toHaveLength(v.lines.length);
    for (const lang of ['hi', 'en', 'gu', 'kn'] as const) {
      expect(contentByLang(lang, v.meaningHi, v.meaningEn).length).toBeGreaterThan(25);
    }
  }
});

test('resolves the real reader route and every daily verse without eagerly activating it', () => {
  const entry = library.find(e => e.id === 'parshuram-stotram')!;
  expect(buildEntryStartTarget({ ...entry, hidden: false, status: 'active' })).toMatchObject({ screen: 'StutiReader', params: { stutiId: entry.id, initialIndex: 0 } });
  const [segment] = flatPoolSegments({ isActive: id => id === entry.id, nameHi: () => entry.nameHi, nameEn: () => entry.nameEn });
  expect(segment.length).toBe(7);
  for (let i = 0; i < 7; i++) {
    const v = segment.getAt(i)!;
    expect(v.sourceId).toBe(entry.id);
    expect(v.textHi).toEqual(getStuti(entry.id).verses[i].lines);
    expect(segment.find(i)).toEqual(v);
  }
});

test('gates every public entry point on verified artwork publication', () => {
  expect(deities.some(d => d.id === 'parshuram')).toBe(parshuramPublished);
  expect(suvicharDeities.some(d => d.id === 'parshuram')).toBe(parshuramPublished);
  const entry = library.find(e => e.id === 'parshuram-stotram')!;
  expect(entry.status).toBe(parshuramPublished ? 'active' : 'coming');
  expect(entry.hidden).toBe(!parshuramPublished);
  expect(suvicharFrames).toHaveLength(3);
});

test('offers eight original Parshuram reflections with correct attribution and no cross-deity leakage', () => {
  const all = suvicharThoughtsFor('parshuram');
  const specific = all.filter(t => /^VD-00(?:8[5-9]|9[0-2])$/.test(t.id));
  expect(specific).toHaveLength(8);
  for (const thought of specific) {
    expect(thought.sourceId).toBe('vedansh-original');
    expect(suvicharSourceLabel(thought, 'en')).toBe('Vedansh · Original reflection');
    for (const lang of ['hi', 'en', 'gu', 'kn'] as const) {
      const message = contentByLang(lang, thought.hi, thought.en);
      expect(findSuvicharThought('parshuram', message, thought.id)?.id).toBe(thought.id);
      expect(findSuvicharThought('rama', message, thought.id)).toBeUndefined();
      expect(findSuvicharThought('vishnu', message, thought.id)).toBeUndefined();
    }
  }
});
