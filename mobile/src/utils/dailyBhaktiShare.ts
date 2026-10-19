import type { Lang } from '@/data/gita/language';
import type { UniformVerse } from '@/data/versePool';
import { devotionalArtForVerse } from '@/data/devotionalShareArt';
import { contentByLang, meaningByLang, pick, verseLinesByLang } from './localize';
import { paginateDevotional } from './devotionalShareLayout';
import type { ShareableProse, ShareableProseScope } from './shareVerse';

export const devotionalMeaningLabel = { hi: 'अर्थ', en: 'Meaning', gu: 'અર્થ', kn: 'ಅರ್ಥ' };
/** Prepare only the verse being shared; never construct the random pool on startup. */
export function dailyBhaktiShareable(v: UniformVerse): ShareableProse {
  const prepared = {} as NonNullable<ShareableProseScope['prepared']>;
  for (const lang of ['hi', 'en', 'gu', 'kn'] as Lang[]) {
    const label = contentByLang(lang, v.labelHi ?? '', v.labelEn ?? '');
    const header = `${contentByLang(lang, v.sourceNameHi, v.sourceNameEn)} · ${label}`;
    const lines = verseLinesByLang(lang, v.textHi, v.textEn);
    const parts = paginateDevotional({ art: devotionalArtForVerse(v), header, lang,
      verse: lines.join('\n'), meaning: meaningByLang(lang, v.meaningHi, v.meaningEn) });
    prepared[lang] = { label, header: label, firstLine: lines[0] ?? '', pages: parts.map(part => ({
      title: null, usedDp: 0, devotional: part,
      blocks: [
        ...(part.verse.trim() ? [{ kind: 'para' as const, text: part.verse, continued: part.continuation, continues: false }] : []),
        ...(part.meaning.trim() ? [{ kind: 'heading' as const, text: pick(lang, devotionalMeaningLabel), continued: false, continues: false }, { kind: 'para' as const, text: part.meaning, continued: part.continuation, continues: false }] : []),
      ],
    })) };
  }
  return { kind: 'prose', sourceId: v.sourceId, background: null,
    sectionNameHi: v.sourceNameHi, sectionNameEn: v.sourceNameEn,
    sheetTitle: { hi: 'भक्ति कार्ड साझा करें', en: 'Share this devotional card', gu: 'ભક્તિ કાર્ડ શેર કરો', kn: 'ಭಕ್ತಿ ಕಾರ್ಡ್ ಹಂಚಿಕೊಳ್ಳಿ' },
    scopes: [{ id: 'daily-bhakti', labelHi: 'श्लोक और अर्थ', labelEn: 'Verse and meaning', headerHi: v.labelHi ?? '', headerEn: v.labelEn ?? '', blocks: [], prepared }],
  };
}
