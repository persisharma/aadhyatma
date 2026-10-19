import { getVersePool } from '@/data/versePool';
import { devotionalArtForVerse, devotionalSourceArt } from '@/data/devotionalShareArt';
import { dailyBhaktiShareable } from '../dailyBhaktiShare';
import { devotionalBodyHeight, devotionalCardGeometry, devotionalTextHeight, paginateDevotional } from '../devotionalShareLayout';
import { contentByLang, meaningByLang, verseLinesByLang } from '../localize';
import { buildProseShareText } from '../shareText';
import type { Lang } from '@/data/gita/language';
const langs: Lang[] = ['hi', 'en', 'gu', 'kn'];
it('preserves every Daily Bhakti verse and meaning in all four languages in one complete readable image', () => {
  const pool = getVersePool(); expect(pool.length).toBeGreaterThan(1300);
  for (const v of pool) {
    expect(devotionalSourceArt[v.sourceId]).toBeDefined();
    const prepared = dailyBhaktiShareable(v).scopes[0].prepared!;
    for (const lang of langs) {
      const { pages, header: label } = prepared[lang];
      const header = `${contentByLang(lang, v.sourceNameHi, v.sourceNameEn)} · ${label}`;
      expect(pages.map(p => p.devotional!.verse).join('')).toBe(verseLinesByLang(lang, v.textHi, v.textEn).join('\n'));
      expect(pages.map(p => p.devotional!.meaning).join('')).toBe(meaningByLang(lang, v.meaningHi, v.meaningEn));
      expect(pages).toHaveLength(1);
      for (const { devotional: p } of pages) {
        const body = devotionalBodyHeight(header, p!.verse, p!.meaning, lang);
        expect(devotionalCardGeometry(body).height).toBeGreaterThanOrEqual(p!.heroHeight + body + 67);
        expect(p!.art).toBe(devotionalArtForVerse(v));
      }
    }
  }
});
it('maps deity families and per-verse exceptions conservatively', () => {
  expect(new Set(Object.values(devotionalSourceArt)).size).toBe(10);
  expect(devotionalArtForVerse({ sourceId: 'unknown', verseIndex: 0 })).toBe('prayer');
  expect(devotionalArtForVerse({ sourceId: 'gayatri-mantra', verseIndex: 0 })).toBe('surya');
  expect(devotionalArtForVerse({ sourceId: 'vidyarambha-prarthana', verseIndex: 1 })).toBe('ganesha');
  expect(devotionalArtForVerse({ sourceId: 'ratri-shloka', verseIndex: 2 })).toBe('shiva');
});
it('counts a long compound after a short word', () => {
  expect(devotionalTextHeight('aa ' + 'x'.repeat(50), 'en', 26, 35)).toBe(105);
});
it('keeps oversized content complete without creating a second card', () => {
  const meaning = 'This complete sentence must remain. '.repeat(1000);
  const pages = paginateDevotional({ art: 'prayer', lang: 'en', header: 'Prayer', verse: 'Om', meaning });
  expect(pages).toHaveLength(1);
  expect(pages.map(p => p.meaning).join('')).toBe(meaning);
});
it('rejoins exact text slices and signals missing selected pages', () => {
  const v = getVersePool().find(v => v.sourceId === 'shiva-strotam')!;
  for (const lang of langs) {
    const { pages, header } = dailyBhaktiShareable(v).scopes[0].prepared![lang];
    const text = buildProseShareText({ header, pages, indices: pages.map((_, i) => i), lang });
    expect(text).toContain(verseLinesByLang(lang, v.textHi, v.textEn).join('\n'));
    expect(text).toContain(meaningByLang(lang, v.meaningHi, v.meaningEn));
    if (pages.length > 1 && pages[0].devotional!.meaning) expect(buildProseShareText({ header, pages, indices: [0], lang })).toContain(pages[0].devotional!.meaning + '…');
  }
});

it('keeps the reported Hanuman Ashtak verse and its full meaning together', () => {
  const v = getVersePool().find(v => v.sourceId === 'hanuman-ashtak' && v.verseIndex === 5)!;
  expect(v).toBeDefined();
  for (const lang of langs) {
    const pages = dailyBhaktiShareable(v).scopes[0].prepared![lang].pages;
    expect(pages).toHaveLength(1);
    expect(pages[0].devotional!.meaning).toBe(meaningByLang(lang, v.meaningHi, v.meaningEn));
  }
});
