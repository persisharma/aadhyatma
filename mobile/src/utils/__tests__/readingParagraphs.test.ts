import { readingParagraphs } from '../readingParagraphs';
import { commentaryByLang } from '../localize';
import type { Lang } from '@/data/gita/language';
import fs from 'node:fs';
import path from 'node:path';

test('short paragraphs keep their exact text and empty paragraphs remain representable', () => {
  expect(readingParagraphs('')).toEqual(['']);
  expect(readingParagraphs('A short paragraph.')).toEqual(['A short paragraph.']);
});
test('splits at sentences or whitespace without truncating or cutting a conjunct', () => {
  for (const text of ['कृष्ण कथा। '.repeat(200), 'ಕೃಷ್ಣ ಕಥೆ। '.repeat(200), 'A long sentence '.repeat(200)]) {
    const chunks = readingParagraphs(text);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.join('')).toBe(text);
    expect(chunks.every(chunk => chunk.length<=1200)).toBe(true);
    for(const chunk of chunks.slice(0,-1)) expect(chunk).toMatch(/[।!?\s]$/u);
  }
  const unbroken='कृष्ण'.repeat(300);
  expect(readingParagraphs(unbroken)).toEqual([unbroken]);
});
test('every Gita commentary retains all text in all four reading languages', () => {
  const dir=path.resolve(__dirname,'../../data/gita');
  let checked=0;
  for(const file of fs.readdirSync(dir).filter(file=>/^chapter-\d+\.json$/.test(file))) {
    const chapter=JSON.parse(fs.readFileSync(path.join(dir,file),'utf8'));
    for(const verse of chapter.verses) {
      for(const lang of ['hi','en','gu','kn'] as Lang[]) {
        for(const paragraph of commentaryByLang(lang,verse.commentaryHi,verse.commentaryEn)) {
          const chunks=readingParagraphs(paragraph);
          expect(chunks.join('')).toBe(paragraph);
          expect(chunks.every(chunk=>chunk.length<=1200)).toBe(true);
          checked++;
        }
      }
    }
  }
  expect(checked).toBeGreaterThan(2000);
});
