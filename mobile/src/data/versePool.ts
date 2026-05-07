import { library } from './texts';
import type { ContentCategory } from './texts';
import { getGitaChapter, gitaChaptersManifest } from './gita';
import { sundarkandVerses } from './sundarkand';
import { getShivaStrotamChapter, shivaStrotamChaptersManifest } from './shiva-strotam';

export type UniformVerse = {
  sourceId: string;
  sourceNameHi: string;
  sourceNameEn: string;
  chapter?: number;
  verseIndex: number;
  textHi: string[];
  textEn: string[];
  meaningHi: string;
  meaningEn: string;
  labelHi?: string;
  labelEn?: string;
};

const SOURCE_CATEGORIES: ContentCategory[] = ['granth', 'stotram'];

function buildPool(): UniformVerse[] {
  const pool: UniformVerse[] = [];

  const activeItems = library.filter(
    (e) => e.status === 'active' && SOURCE_CATEGORIES.includes(e.category)
  );

  for (const item of activeItems) {
    if (item.id === 'bhagavad-gita') {
      for (const ch of gitaChaptersManifest) {
        const chapter = getGitaChapter(ch.chapter);
        chapter.verses.forEach((v, idx) => {
          pool.push({
            sourceId: item.id,
            sourceNameHi: item.nameHi,
            sourceNameEn: item.nameEn,
            chapter: ch.chapter,
            verseIndex: idx,
            textHi: v.sanskrit,
            textEn: v.transliteration,
            meaningHi: v.meaningHi,
            meaningEn: v.meaningEn,
            labelHi: `श्लोक ${ch.chapter}.${v.number}`,
            labelEn: `Shloka ${ch.chapter}.${v.number}`,
          });
        });
      }
    } else if (item.id === 'sundarkand') {
      sundarkandVerses.forEach((v, idx) => {
        pool.push({
          sourceId: item.id,
          sourceNameHi: item.nameHi,
          sourceNameEn: item.nameEn,
          verseIndex: idx,
          textHi: v.lines,
          textEn: v.linesEn,
          meaningHi: v.meaningHi,
          meaningEn: v.meaningEn,
          labelHi: v.labelHi,
          labelEn: v.labelEn,
        });
      });
    } else if (item.id === 'shiva-strotam') {
      for (const ch of shivaStrotamChaptersManifest) {
        const chapter = getShivaStrotamChapter(ch.chapter);
        chapter.verses.forEach((v, idx) => {
          pool.push({
            sourceId: item.id,
            sourceNameHi: item.nameHi,
            sourceNameEn: item.nameEn,
            chapter: ch.chapter,
            verseIndex: idx,
            textHi: v.sanskrit,
            textEn: v.linesEn,
            meaningHi: v.meaningHi,
            meaningEn: v.meaningEn,
            labelHi: `श्लोक ${ch.chapter}.${v.number}`,
            labelEn: `Shloka ${ch.chapter}.${v.number}`,
          });
        });
      }
    }
  }

  return pool;
}

let cachedPool: UniformVerse[] | null = null;

export function getVersePool(): UniformVerse[] {
  if (!cachedPool) {
    cachedPool = buildPool();
  }
  return cachedPool;
}

export function getRandomVerse(): UniformVerse {
  const pool = getVersePool();
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}
