import { verseLinesForDisplay } from '../versePresentation';
import { verseLinesByLang } from '../localize';
import { getGitaChapter } from '@/data/gita';
import type { Lang } from '@/data/gita/language';

const raw = getGitaChapter(2).verses.find(v => v.number === 47)!;
const clean = ['कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।', 'मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि।।'];

test('BG 2.47 keeps every word and original line, with its reference only in the label', () => {
  const before = [...raw.sanskrit];
  expect(verseLinesForDisplay(raw.sanskrit, 'श्लोक 2.47')).toEqual(clean);
  expect(raw.sanskrit).toEqual(before);
  expect(raw.sanskrit.join('\n')).toContain('2.47');
});

test.each(['hi', 'en', 'gu', 'kn'] as Lang[])('%s preserves localized rows and removes a repeated reference', lang => {
  const shown = verseLinesByLang(lang, raw.sanskrit, raw.transliteration, 'श्लोक 2.47');
  expect(shown).toHaveLength(raw.sanskrit.length);
  expect(shown.join('\n')).not.toMatch(/2\.47/);
  if (lang !== 'en') expect(shown).toEqual(verseLinesByLang(lang, clean, raw.transliteration));
});

test.each([
  ['अन्त॥२.४७॥', 'श्लोक 2.47', 'अन्त॥'],
  ['અંત॥૨.૪૭॥', 'શ્લોક ૨.૪૭', 'અંત॥'],
  ['ಅಂತ॥೨.೪೭॥', 'ಶ್ಲೋಕ 2.47', 'ಅಂತ॥'],
  ['end||2.47||', 'Shloka 2.47', 'end||'],
])('normalizes matching terminal numeral scripts: %s', (text, label, expected) => {
  expect(verseLinesForDisplay([text], label)).toEqual([expected]);
});

test.each([
  [['अन्त॥2.48॥'], 'श्लोक 2.47'],
  [['ॐ नमः शिवाय॥'], 'श्लोक 2.47'],
  [['108 repetitions', 'अन्त॥'], 'श्लोक 108'],
  [['अन्त॥2.47॥'], undefined],
  [['अन्त॥2.47॥'], 'दोहा 2–47'],
  [[], 'श्लोक 2.47'],
])('leaves nonmatching/unlabelled scripture intact', (lines, label) => {
  expect(verseLinesForDisplay(lines as string[], label as string | undefined)).toBe(lines);
});
