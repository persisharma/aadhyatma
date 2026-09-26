/**
 * गीता सार registry contract (RULEBOOK §29).
 *
 * - Every ref resolves to the bundled Gita verse whose printed number it names
 *   (opens the corpus JSON directly, like pitruShikshaContent.test.ts).
 * - The eager manifest mirrors the theme registry row for row.
 * - Bilingual parity, no duplicate refs inside a theme, well-formed Devanagari
 *   in every authored line, and the §29.4 source threshold on verified themes.
 * - The loader assembles pages in reading order with the corpus text attached.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { findDevanagariDefects, describeDevanagariDefect } from '@/data/devanagariWellFormed';
import { GITA_SAAR_THEMES } from '../themes';
import {
  getGitaSaarChapter,
  getGitaSaarThemes,
  gitaSaarChaptersManifest,
  gitaSaarTotal,
  resolveGitaSaarRef,
} from '../index';
import type { GitaSaarRef, GitaSaarTheme } from '../types';

const DATA = join(__dirname, '..', '..');

function corpusVerse(ref: GitaSaarRef): { number: number; chapter: number; sanskrit: string[] } {
  const file = join(DATA, 'gita', `chapter-${String(ref.chapter).padStart(2, '0')}.json`);
  const json = JSON.parse(readFileSync(file, 'utf8')) as {
    verses: { number: number; chapter: number; sanskrit: string[] }[];
  };
  return json.verses[ref.verse - 1];
}

function allVerses(theme: GitaSaarTheme) {
  return theme.groups.flatMap((g) => g.verses);
}

function expectWellFormed(text: string, where: string) {
  const defects = findDevanagariDefects(text);
  expect(
    defects.length === 0
      ? ''
      : `${where}: ${defects.map(describeDevanagariDefect).join('; ')}`
  ).toBe('');
}

describe('registry shape', () => {
  test('at least one theme ships, ids are unique, every theme has ≥1 group and ≥1 verse', () => {
    expect(GITA_SAAR_THEMES.length).toBeGreaterThanOrEqual(1);
    const ids = new Set(GITA_SAAR_THEMES.map((t) => t.id));
    expect(ids.size).toBe(GITA_SAAR_THEMES.length);
    for (const theme of GITA_SAAR_THEMES) {
      expect(theme.groups.length).toBeGreaterThanOrEqual(1);
      const groupIds = new Set(theme.groups.map((g) => g.id));
      expect(groupIds.size).toBe(theme.groups.length);
      for (const group of theme.groups) {
        expect(group.verses.length).toBeGreaterThanOrEqual(1);
      }
    }
  });

  test('bilingual parity on every rendered field', () => {
    for (const theme of GITA_SAAR_THEMES) {
      for (const key of ['titleHi', 'titleEn', 'ledeHi', 'ledeEn', 'closingHi', 'closingEn'] as const) {
        expect(theme[key].trim()).not.toBe('');
      }
      for (const group of theme.groups) {
        for (const key of ['titleHi', 'titleEn', 'introHi', 'introEn'] as const) {
          expect(group[key].trim()).not.toBe('');
        }
        for (const v of group.verses) {
          for (const key of ['themeHi', 'themeEn', 'saarHi', 'saarEn'] as const) {
            expect(v[key].trim()).not.toBe('');
          }
        }
      }
    }
  });

  test('no theme quotes the same shloka twice', () => {
    for (const theme of GITA_SAAR_THEMES) {
      const keys = allVerses(theme).map((v) => `${v.ref.chapter}.${v.ref.verse}`);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });

  test('every authored Devanagari line is well-formed', () => {
    for (const theme of GITA_SAAR_THEMES) {
      expectWellFormed(theme.titleHi, `${theme.id}.titleHi`);
      expectWellFormed(theme.ledeHi, `${theme.id}.ledeHi`);
      expectWellFormed(theme.closingHi, `${theme.id}.closingHi`);
      for (const group of theme.groups) {
        expectWellFormed(group.titleHi, `${theme.id}/${group.id}.titleHi`);
        expectWellFormed(group.introHi, `${theme.id}/${group.id}.introHi`);
        for (const v of group.verses) {
          const where = `${theme.id}/${group.id} ${v.ref.chapter}.${v.ref.verse}`;
          expectWellFormed(v.themeHi, `${where}.themeHi`);
          expectWellFormed(v.saarHi, `${where}.saarHi`);
        }
      }
    }
  });

  test('a verified theme meets the source threshold: ≥2 refs, ≥1 https, no duplicates, dated note', () => {
    for (const theme of GITA_SAAR_THEMES.filter((t) => t.status === 'verified')) {
      const urls = theme.source.referenceUrls;
      expect(urls.length).toBeGreaterThanOrEqual(2);
      expect(new Set(urls).size).toBe(urls.length);
      expect(urls.some((u) => u.startsWith('https://'))).toBe(true);
      expect(urls.every((u) => u.startsWith('https://') || u.startsWith('repo:'))).toBe(true);
      expect(theme.source.verificationNote).toMatch(/^\d{4}-\d{2}-\d{2}/);
    }
    for (const theme of GITA_SAAR_THEMES.filter((t) => t.status === 'draft')) {
      expect(theme.source.verificationNote).toMatch(/^DRAFT — NOT VERIFIED/);
    }
  });
});

describe('scripture is pointed at, never re-typed', () => {
  test('every ref resolves to the bundled verse whose printed number it names', () => {
    for (const theme of GITA_SAAR_THEMES) {
      for (const v of allVerses(theme)) {
        const verse = corpusVerse(v.ref);
        expect(verse).toBeDefined();
        expect(verse.number).toBe(v.ref.verse);
        expect(verse.chapter).toBe(v.ref.chapter);
        expect(verse.sanskrit.length).toBeGreaterThan(0);
        expect(resolveGitaSaarRef(v.ref).number).toBe(v.ref.verse);
      }
    }
  });

  test('a ref outside the corpus throws instead of rendering the wrong shloka', () => {
    expect(() => resolveGitaSaarRef({ chapter: 12, verse: 99 })).toThrow(/does not resolve/);
    expect(() => resolveGitaSaarRef({ chapter: 19, verse: 1 })).toThrow();
  });

  test('theme files carry no Sanskrit of their own — only refs and saar', () => {
    // The corpus Sanskrit lines end in a danda pair; a saar line never should.
    for (const theme of GITA_SAAR_THEMES) {
      for (const v of allVerses(theme)) {
        expect(v.saarHi).not.toMatch(/॥|।।/);
        expect(v.themeHi).not.toMatch(/॥|।।/);
      }
    }
  });
});

describe('manifest mirrors the registry', () => {
  test('one manifest row per theme, in order, with matching id, titles and verse count', () => {
    expect(gitaSaarChaptersManifest.length).toBe(GITA_SAAR_THEMES.length);
    GITA_SAAR_THEMES.forEach((theme, i) => {
      const row = gitaSaarChaptersManifest[i];
      expect(row.chapter).toBe(i + 1);
      expect(row.id).toBe(theme.id);
      expect(row.titleHi).toBe(theme.titleHi);
      expect(row.titleEn).toBe(theme.titleEn);
      expect(row.verseCount).toBe(allVerses(theme).length);
    });
    expect(gitaSaarTotal).toBe(gitaSaarChaptersManifest.reduce((n, r) => n + r.verseCount, 0));
  });

  test('verified-only accessor hides drafts', () => {
    const verified = getGitaSaarThemes();
    expect(verified.every((t) => t.status === 'verified')).toBe(true);
    expect(verified.length).toBe(GITA_SAAR_THEMES.filter((t) => t.status === 'verified').length);
  });
});

describe('loader', () => {
  test('chapter 1 pages are in reading order and carry the corpus text', () => {
    const chapter = getGitaSaarChapter(1);
    const theme = GITA_SAAR_THEMES[0];
    expect(chapter.id).toBe(theme.id);
    expect(chapter.verses.length).toBe(chapter.verseCount);
    const expected = allVerses(theme);
    chapter.verses.forEach((page, i) => {
      expect(page.number).toBe(i + 1);
      expect(page.gitaChapter).toBe(expected[i].ref.chapter);
      expect(page.gitaVerse).toBe(expected[i].ref.verse);
      expect(page.sanskrit).toEqual(corpusVerse(expected[i].ref).sanskrit);
      expect(page.transliteration.length).toBeGreaterThan(0);
      expect(page.meaningHi).toBe(expected[i].saarHi);
      expect(page.meaningEn).toBe(expected[i].saarEn);
      expect(page.id).toBe(`saar-${theme.id}-${page.gitaChapter}-${page.gitaVerse}`);
    });
    // Group starts are exactly the first verse of each group.
    const starts = chapter.verses.filter((v) => v.isGroupStart).length;
    expect(starts).toBe(theme.groups.length);
    expect(chapter.verses[0].isGroupStart).toBe(true);
  });

  test('an out-of-range chapter throws (the reader redirects to the index)', () => {
    expect(() => getGitaSaarChapter(gitaSaarChaptersManifest.length + 1)).toThrow(/out of range/);
    expect(() => getGitaSaarChapter(0)).toThrow();
  });

  test('true-prema is the first theme and traces the nineteen verses of the answer, in order', () => {
    const chapter = getGitaSaarChapter(1);
    expect(chapter.id).toBe('true-prema');
    const refs = chapter.verses.map((v) => `${v.gitaChapter}.${v.gitaVerse}`);
    expect(refs).toEqual([
      '6.32',
      '12.13', '12.14', '12.15', '12.16', '12.17', '12.18', '12.19', '12.20',
      '7.17',
      '10.9', '10.10',
      '3.30', '9.26', '17.20',
      '9.29', '18.64', '18.65', '18.66',
    ]);
  });
});
