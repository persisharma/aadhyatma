import { getValmikiRamayanChapter, withMeaningFallback } from '../valmiki-ramayan';

// Regression: Aranyakanda 3.2.6 shipped "Hindu Dharma" (RamCharit.in navigation residue) as
// its Hindi meaning and 3.20.23 shipped "Missing" as its English meaning (RULEBOOK §11.6).
const verseById = (chapter: number, id: string) => {
  const verse = getValmikiRamayanChapter(chapter).verses.find((v) => v.id === id);
  if (!verse) throw new Error(`missing ${id}`);
  return verse;
};

test('a blank Hindi meaning falls back to the sourced English meaning, never site text', () => {
  const verse = verseById(3, 'valmiki-3-2-6');
  expect(verse.meaningHi).not.toBe('Hindu Dharma');
  expect(verse.meaningEn).toMatch(/tiger/i);
  expect(verse.meaningHi).toBe(verse.meaningEn);
});

test('a blank English meaning falls back to the sourced Hindi meaning, never a placeholder', () => {
  const verse = verseById(3, 'valmiki-3-20-23');
  expect(verse.meaningEn).not.toBe('Missing');
  expect(verse.meaningHi.trim()).not.toBe('');
  expect(verse.meaningEn).toBe(verse.meaningHi);
});

test('a Sanskrit echo is not shown as the Hindi meaning', () => {
  const verse = verseById(7, 'valmiki-7-12-8');
  expect(verse.meaningHi).not.toBe('वज्रवैडूर्यचित्रं च मायया निर्मितं मया');
  expect(verse.meaningHi).toBe(verse.meaningEn);
});

test('every loaded verse in every kanda resolves to two non-empty meanings', () => {
  for (let chapter = 1; chapter <= 7; chapter++) {
    for (const verse of getValmikiRamayanChapter(chapter).verses) {
      expect(verse.meaningHi.trim()).not.toBe('');
      expect(verse.meaningEn.trim()).not.toBe('');
    }
  }
});

test('verses with both meanings are returned unchanged', () => {
  const verse = verseById(3, 'valmiki-3-1-1');
  expect(withMeaningFallback(verse)).toBe(verse);
});
