import {
  MAX_SHARE_PAGES,
  paginateProse,
  proseBodyHeight,
  splitSentences,
  wrapLineCount,
  type ProseBlockInput,
} from '@/utils/shareCardPages';
import { KATHA_CONTENT } from '@/panchang/kathaContent';
import { transliterateDevanagari } from '@/utils/transliterate';
import type { Lang } from '@/data/gita/language';

/**
 * Pins the prose paginator behind multi-page share cards (PRD-45, design.md §39.4):
 * the budget math, sentence packing, continuation flags, the heading and widow rules,
 * determinism, and that every bundled katha section fits a carousel.
 */

const words = (s: string) => s.split(/\s+/).filter(Boolean);

function allWords(blocks: readonly ProseBlockInput[]): string[] {
  return blocks.flatMap((b) => words(b.text));
}

function pagedWords(res: ReturnType<typeof paginateProse>): string[] {
  return res.pages.flatMap((p) => p.blocks.flatMap((b) => words(b.text)));
}

const para = (text: string): ProseBlockInput => ({ kind: 'para', text });

describe('splitSentences', () => {
  test('breaks at dandas and Latin terminators, keeping them attached', () => {
    expect(splitSentences('राम वन गए। सीता साथ थीं॥ फिर क्या हुआ?')).toEqual([
      'राम वन गए।',
      'सीता साथ थीं॥',
      'फिर क्या हुआ?',
    ]);
    expect(splitSentences('One. Two! Three')).toEqual(['One.', 'Two!', 'Three']);
  });

  test('keeps a closing quote with the sentence it closes', () => {
    expect(splitSentences('He asked, ‘Which vow?’ The sage smiled.')).toEqual([
      'He asked, ‘Which vow?’',
      'The sage smiled.',
    ]);
  });

  test('does not split inside a token like 2.47', () => {
    expect(splitSentences('Verse 2.47 says this. Next.')).toEqual(['Verse 2.47 says this.', 'Next.']);
  });
});

describe('wrapLineCount', () => {
  test('greedy word wrap', () => {
    expect(wrapLineCount('aaa bbb ccc', 7)).toBe(2);
    expect(wrapLineCount('aaa bbb', 7)).toBe(1);
    expect(wrapLineCount('', 7)).toBe(1);
  });
  test('an over-long word takes the lines it needs', () => {
    expect(wrapLineCount('a'.repeat(15), 7)).toBe(3);
  });
});

describe('paginateProse', () => {
  const long = Array.from({ length: 40 }, (_, i) => `यह वाक्य संख्या ${i + 1} है और इसमें कुछ शब्द हैं।`).join(' ');

  test('short prose is one page and carries the title', () => {
    const res = paginateProse({ title: 'शीर्षक', blocks: [para('एक छोटा वाक्य।')], lang: 'hi' });
    expect(res.pages).toHaveLength(1);
    expect(res.pages[0].title).toBe('शीर्षक');
    expect(res.truncated).toBe(false);
  });

  test('every page stays inside the budget and no word is lost or duplicated', () => {
    const blocks = [para(long), para(long), para(long)];
    for (const lang of ['hi', 'en', 'gu', 'kn'] as Lang[]) {
      const res = paginateProse({ title: 'Title', blocks, lang });
      expect(res.pages.length).toBeGreaterThan(1);
      for (const p of res.pages) expect(p.usedDp).toBeLessThanOrEqual(res.budgetDp);
      expect(pagedWords(res)).toEqual(allWords(blocks));
    }
  });

  test('the budget holds a line of slack below the body box', () => {
    const res = paginateProse({ blocks: [para(long)], lang: 'hi' });
    expect(res.budgetDp).toBeLessThan(proseBodyHeight);
  });

  test('only page 1 has the title', () => {
    const res = paginateProse({ title: 'T', blocks: [para(long), para(long)], lang: 'hi' });
    expect(res.pages[0].title).toBe('T');
    expect(res.pages.slice(1).every((p) => p.title === null)).toBe(true);
  });

  test('a paragraph split across pages is flagged on both sides', () => {
    const res = paginateProse({ blocks: [para(long + ' ' + long)], lang: 'hi' });
    expect(res.pages.length).toBeGreaterThan(1);
    const first = res.pages[0].blocks[res.pages[0].blocks.length - 1];
    const next = res.pages[1].blocks[0];
    expect(first.continues).toBe(true);
    expect(next.continued).toBe(true);
    expect(res.pages[0].blocks[0].continued).toBe(false);
  });

  test('a heading never ends a page', () => {
    const blocks: ProseBlockInput[] = [];
    for (let i = 0; i < 6; i++) {
      blocks.push({ kind: 'heading', text: `॥ खंड ${i + 1} ॥` });
      blocks.push(para(long.slice(0, 700 + i * 37)));
    }
    const res = paginateProse({ blocks, lang: 'hi', maxPages: 99 });
    for (const p of res.pages) {
      expect(p.blocks[p.blocks.length - 1].kind).toBe('para');
    }
    expect(pagedWords(res)).toEqual(allWords(blocks));
  });

  test('a single sentence longer than a page is split at words, not dropped', () => {
    const monster = Array.from({ length: 400 }, (_, i) => `शब्द${i}`).join(' ') + '।';
    const res = paginateProse({ blocks: [para(monster)], lang: 'hi' });
    expect(res.pages.length).toBeGreaterThan(1);
    for (const p of res.pages) expect(p.usedDp).toBeLessThanOrEqual(res.budgetDp);
    expect(pagedWords(res)).toEqual(words(monster));
  });

  test('the last page is never a widow of one or two lines when it can borrow', () => {
    const res = paginateProse({ blocks: [para(long)], lang: 'en' });
    const last = res.pages[res.pages.length - 1];
    if (res.pages.length > 1) expect(last.usedDp).toBeGreaterThanOrEqual(3 * 28);
  });

  test('deterministic: same text, same pages', () => {
    const a = paginateProse({ title: 'T', blocks: [para(long)], lang: 'hi' });
    const b = paginateProse({ title: 'T', blocks: [para(long)], lang: 'hi' });
    expect(a).toEqual(b);
  });

  test('flags truncation past MAX_SHARE_PAGES', () => {
    const blocks = Array.from({ length: 30 }, () => para(long));
    const res = paginateProse({ blocks, lang: 'hi' });
    expect(res.pages.length).toBeGreaterThan(MAX_SHARE_PAGES);
    expect(res.truncated).toBe(true);
  });
});

describe('bundled kathas', () => {
  const langs: Lang[] = ['hi', 'en', 'gu', 'kn'];
  const blocksFor = (lang: Lang, paras: readonly string[]) =>
    paras.map((p) => para(lang === 'gu' || lang === 'kn' ? transliterateDevanagari(p, lang) : p));

  test('every katha section fits one carousel in every language', () => {
    const over: string[] = [];
    for (const katha of KATHA_CONTENT) {
      for (const section of katha.sections) {
        for (const lang of langs) {
          const paras = lang === 'en' ? section.bodyEn : section.bodyHi;
          const title = lang === 'en' ? section.titleEn : section.titleHi;
          const res = paginateProse({ title, blocks: blocksFor(lang, paras), lang });
          if (res.truncated) over.push(`${katha.id}/${section.id}/${lang}: ${res.pages.length}`);
          for (const p of res.pages) expect(p.usedDp).toBeLessThanOrEqual(res.budgetDp);
        }
      }
    }
    expect(over).toEqual([]);
  });
});
