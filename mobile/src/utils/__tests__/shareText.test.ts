import { buildProseShareText, buildVerseShareText } from '@/utils/shareText';
import { SMART_LINK } from '@/data/shareLinks';
import type { ProsePage } from '@/utils/shareCardPages';
import type { ShareableVerse } from '@/utils/shareVerse';

/** "Send as text" (design.md §39.7): the reading as one plain message, in the card's language. */

const VERSE: ShareableVerse = {
  sourceId: 'bhagavad-gita',
  sectionNameHi: 'भगवद्गीता',
  sectionNameEn: 'Bhagavad Gita',
  verseLabelHi: 'अध्याय 2 · श्लोक 47',
  verseLabelEn: 'Chapter 2 · Verse 47',
  linesHi: ['कर्मण्येवाधिकारस्ते मा फलेषु कदाचन ।', 'मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि ॥'],
  linesEn: ['karmaṇy-evādhikāras te mā phaleṣhu kadāchana', 'mā karma-phala-hetur bhūr mā te saṅgo ’stvakarmaṇi'],
  meaningHi: 'कर्म करने में ही तुम्हारा अधिकार है, फल में कभी नहीं।',
  meaningEn: 'You have a right to your actions, never to their fruits.',
  meaningGu: 'તમારો અધિકાર કર્મમાં જ છે, ફળમાં ક્યારેય નહીં.',
};

const page = (p: Partial<ProsePage>): ProsePage => ({ title: null, blocks: [], usedDp: 0, ...p });
const para = (text: string, continued = false, continues = false) => ({ kind: 'para' as const, text, continued, continues });

describe('buildVerseShareText', () => {
  test('carries header, every line, the meaning and the app link — in that order', () => {
    const text = buildVerseShareText(VERSE, 'hi');
    expect(text.split('\n')).toEqual([
      'भगवद्गीता · अध्याय 2 · श्लोक 47',
      '',
      ...VERSE.linesHi,
      '',
      VERSE.meaningHi,
      '',
      `Vedansh ऐप पर पढ़ें: ${SMART_LINK}`,
      expect.stringContaining('instagram.com'),
    ]);
  });

  test('English uses the romanized lines and English meaning', () => {
    const text = buildVerseShareText(VERSE, 'en');
    expect(text).toContain('Bhagavad Gita · Chapter 2 · Verse 47');
    expect(text).toContain(VERSE.linesEn[1]);
    expect(text).toContain(VERSE.meaningEn);
    expect(text).not.toContain('कर्मण्येवाधिकारस्ते');
  });

  test('Gujarati prefers the authored meaning and re-scripts the lines', () => {
    const text = buildVerseShareText(VERSE, 'gu');
    expect(text).toContain(VERSE.meaningGu);
    // Dandas (U+0964/5) are shared across Indic scripts; anything else Devanagari is a miss.
    expect(text).not.toMatch(/[ऀ-ॣ०-ॿ]/);
  });

  test('a theme title precedes the meaning; no meaning, no empty block', () => {
    const titled = buildVerseShareText({ ...VERSE, meaningTitleEn: 'Selfless action' }, 'en').split('\n');
    expect(titled[titled.indexOf(VERSE.meaningEn!) - 1]).toBe('Selfless action');
    const bare = buildVerseShareText({ ...VERSE, meaningHi: undefined, meaningEn: undefined }, 'en');
    expect(bare).not.toContain('\n\n\n');
  });
});

describe('buildProseShareText', () => {
  const pages = [
    page({ title: 'The Story', blocks: [para('First paragraph.'), para('Split begins', false, true)] }),
    page({ blocks: [para('and ends here.', true, false), { kind: 'quote', speaker: 'Rama', text: 'Go well.', continued: false, continues: false }] }),
    page({ blocks: [para('Closing words.'), { kind: 'link', text: 'Read on Vedansh', url: 'vedansh.app/get', continued: false, continues: false }] }),
  ];

  test('rejoins a paragraph split across two selected pages and keeps the speaker', () => {
    const text = buildProseShareText({ header: 'Katha · Part 1', pages, indices: [0, 1, 2], lang: 'en' });
    expect(text.startsWith('Katha · Part 1\n\nThe Story\n\nFirst paragraph.\n\nSplit begins and ends here.\n\nRama: Go well.\n\nClosing words.\n\n')).toBe(true);
    expect(text).toContain(`Read on Vedansh: ${SMART_LINK}`);
  });

  test('marks the gap when a page is left out, and drops the card-only link block', () => {
    const text = buildProseShareText({ header: 'H', pages, indices: [2, 0], lang: 'en' });
    expect(text).toContain('Split begins…');
    expect(text).not.toContain('and ends here');
    expect(text.indexOf('First paragraph.')).toBeLessThan(text.indexOf('Closing words.'));
    expect(text.match(/vedansh\.app\/get/g)).toHaveLength(1);
  });

  test('a continuation without its first half opens with an ellipsis', () => {
    const text = buildProseShareText({ header: 'H', pages, indices: [1], lang: 'en' });
    expect(text).toContain('…and ends here.');
  });
});
