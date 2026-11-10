import type { Lang } from '@/data/gita/language';
import type { UniformVerse } from '@/data/versePool';
import { devotionalArtForVerse } from '@/data/devotionalShareArt';
import { contentByLang, meaningByLang, pick, verseLinesByLang } from './localize';
import { devotionalCharanRows, paginateDevotional } from './devotionalShareLayout';
import type { ShareableProse, ShareableProseScope, ShareableVerse } from './shareVerse';

export const devotionalMeaningLabel = { hi: 'अर्थ', en: 'Meaning', gu: 'અર્થ', kn: 'ಅರ್ಥ' };
/** Prepare only the verse being shared; never construct the random pool on startup. */
export function dailyBhaktiVerse(v: UniformVerse): ShareableVerse {
  return { sourceId: v.sourceId, verseIndex: v.verseIndex, stanza: v.chapter,
    sectionNameHi: v.sourceNameHi, sectionNameEn: v.sourceNameEn,
    verseLabelHi: v.labelHi ?? '', verseLabelEn: v.labelEn ?? '',
    linesHi: v.textHi, linesEn: v.textEn, meaningHi: v.meaningHi, meaningEn: v.meaningEn };
}

export function dailyBhaktiShareable(v: UniformVerse): ShareableProse {
  return devotionalVerseShareable(dailyBhaktiVerse(v));
}

/** Render the exact reader payload, including Saar and authored native meanings. */
export function devotionalVerseShareable(v: ShareableVerse): ShareableProse {
  const prepared = {} as NonNullable<ShareableProseScope['prepared']>;
  for (const lang of ['hi', 'en', 'gu', 'kn'] as Lang[]) {
    const label = contentByLang(lang, v.verseLabelHi ?? '', v.verseLabelEn ?? '');
    const header = `${contentByLang(lang, v.sectionNameHi, v.sectionNameEn)} · ${label}`;
    const lines = verseLinesByLang(lang, v.linesHi, v.linesEn), rows = devotionalCharanRows(lang, v.linesHi, lines);
    const parts = paginateDevotional({ art: devotionalArtForVerse(v), header, lang,
      verse: lines.join('\n'), verseRows: rows.length > lines.length ? rows : undefined, meaning: [contentByLang(lang, v.meaningTitleHi ?? '', v.meaningTitleEn ?? ''),
        meaningByLang(lang, v.meaningHi ?? '', v.meaningEn ?? '', { gu: v.meaningGu, kn: v.meaningKn })].filter(Boolean).join('\n') });
    prepared[lang] = { label, header: label, firstLine: lines[0] ?? '', pages: parts.map(part => ({
      title: null, usedDp: 0, devotional: part,
      blocks: [
        ...(part.verse.trim() ? [{ kind: 'para' as const, text: part.verse, continued: part.continuation, continues: false }] : []),
        ...(part.meaning.trim() ? [{ kind: 'heading' as const, text: pick(lang, devotionalMeaningLabel), continued: false, continues: false }, { kind: 'para' as const, text: part.meaning, continued: part.continuation, continues: false }] : []),
      ],
    })) };
  }
  return { kind: 'prose', sourceId: v.sourceId, background: null,
    sectionNameHi: v.sectionNameHi, sectionNameEn: v.sectionNameEn,
    sheetTitle: { hi: 'भक्ति कार्ड साझा करें', en: 'Share this devotional card', gu: 'ભક્તિ કાર્ડ શેર કરો', kn: 'ಭಕ್ತಿ ಕಾರ್ಡ್ ಹಂಚಿಕೊಳ್ಳಿ' },
    scopes: [{ id: 'daily-bhakti', labelHi: 'श्लोक और अर्थ', labelEn: 'Verse and meaning', headerHi: v.verseLabelHi ?? '', headerEn: v.verseLabelEn ?? '', blocks: [], prepared }],
  };
}
