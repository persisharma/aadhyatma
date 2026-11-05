import { dohaIds, getDoha } from '../doha';
import { getStuti, stutiIds } from '../stuti';
import { findDevanagariDefects } from '../devanagariWellFormed';
import { contentByLang, meaningByLang, verseLinesByLang } from '../../utils/localize';
import kabir from '../doha/kabir-bhakti-dohe.json';
import rahim from '../doha/rahim-bhakti-dohe.json';
import { flatPoolSegments } from '../versePoolFlat';
import { devotionalSourceArt } from '../devotionalShareArt';
import { dailyBhaktiShareable } from '../../utils/dailyBhaktiShare';

test.each([kabir, rahim])('$id preserves complete sourced couplets with honest selection metadata', payload => {
  expect(payload.source.notes).toMatch(/selection.*not.*complete/i);
  expect(payload.verses).toHaveLength(4);
  expect(new Set(payload.verses.map(v => v.id)).size).toBe(4);
  for (const verse of payload.verses) {
    expect(verse.lines).toHaveLength(2);
    expect(verse.linesEn).toHaveLength(2);
    expect(verse.meaningHi.trim()).not.toBe('');
    expect(verse.meaningEn.trim()).not.toBe('');
    expect(verse.source.baseText.length).toBeGreaterThan(30);
    expect(new Set(verse.source.referenceUrls.map(url => new URL(url).hostname)).size).toBeGreaterThanOrEqual(2);
    expect(verse.source.retrievedOn).toBe('2026-11-05');
    for (const line of [...verse.lines, verse.meaningHi, verse.labelHi]) {
      expect(findDevanagariDefects(line)).toEqual([]);
    }
    for (const line of verse.linesEn) {
      expect(line).not.toMatch(/[\u0900-\u097f।॥|]|~[nNm]|RRi?|[a-z][A-Z]/);
    }
  }
});

test.each(dohaIds)('%s uses the shared reader registry without changing its identity', id => {
  expect(stutiIds).toContain(id);
  expect(getStuti(id)).toBe(getDoha(id));
  expect(getStuti(id).id).toBe(id);
});

test('poet attributions do not cross over and existing stuti fallback is preserved', () => {
  expect(getStuti('kabir-bhakti-dohe').titleEn).toContain('Kabir');
  expect(getStuti('rahim-bhakti-dohe').titleEn).toContain('Rahim');
  expect(rahim.verses.find(v => v.id === 'rahim-doha-ahankar')?.lines[0]).toContain('रहिमन');
  expect(getStuti(undefined).id).toBe('krishna-stuti');
  expect(getStuti('missing').id).toBe('krishna-stuti');
});

test.each(dohaIds)('%s resolves the last saved/daily verse through the real pool', id => {
  const payload = getDoha(id);
  const segments = flatPoolSegments({
    isActive: sourceId => sourceId === id,
    nameHi: () => payload.titleHi,
    nameEn: () => payload.titleEn,
  });
  expect(segments).toHaveLength(1);
  expect(segments[0].length).toBe(payload.verses.length);
  expect(segments[0].lastPositions).toEqual([{ chapter: 1, verseIndex: 3 }]);
  expect(segments[0].find(3, undefined)).toMatchObject({
    sourceId: id, verseIndex: 3, textHi: payload.verses[3].lines,
    meaningEn: payload.verses[3].meaningEn, sourceNameEn: payload.titleEn,
  });
  expect(segments[0].getAt(4)).toBeNull();
});

test.each(['hi', 'en', 'gu', 'kn'] as const)('%s exposes every complete verse, title and meaning', lang => {
  for (const payload of [kabir, rahim]) {
    expect(contentByLang(lang, payload.titleHi, payload.titleEn)).not.toBe('');
    for (const verse of payload.verses) {
      const lines = verseLinesByLang(lang, verse.lines, verse.linesEn);
      const meaning = meaningByLang(lang, verse.meaningHi, verse.meaningEn);
      expect(lines).toHaveLength(2);
      expect(lines.every(line => line.trim().length > 0)).toBe(true);
      expect(meaning.trim()).not.toBe('');
      if (lang === 'en') expect([...lines, meaning].join(' ')).not.toMatch(/[\u0900-\u097f]/);
      if (lang === 'gu') expect(lines.join(' ')).toMatch(/[\u0a80-\u0aff]/);
      if (lang === 'kn') expect(lines.join(' ')).toMatch(/[\u0c80-\u0cff]/);
    }
  }
});

test.each(dohaIds)('%s retains the full poet title, verse and meaning in every prepared share language', id => {
  const payload = getDoha(id);
  expect(devotionalSourceArt[id]).toBe('prayer');
  const segment = flatPoolSegments({
    isActive: sourceId => sourceId === id,
    nameHi: () => payload.titleHi,
    nameEn: () => payload.titleEn,
  })[0];
  payload.verses.forEach((verse, index) => {
    const pooled = segment.getAt(index);
    if (!pooled) throw new Error(`missing pooled doha ${verse.id}`);
    const shared = dailyBhaktiShareable(pooled);
    expect(shared.sectionNameHi).toBe(payload.titleHi);
    expect(shared.sectionNameEn).toBe(payload.titleEn);
    for (const lang of ['hi', 'en', 'gu', 'kn'] as const) {
      const pages = shared.scopes[0].prepared![lang].pages;
      expect(pages).toHaveLength(1);
      expect(pages[0].devotional!.art).toBe('prayer');
      expect(pages[0].devotional!.verse).toBe(verseLinesByLang(lang, verse.lines, verse.linesEn).join('\n'));
      expect(pages[0].devotional!.meaning).toBe(meaningByLang(lang, verse.meaningHi, verse.meaningEn));
    }
  });
});
