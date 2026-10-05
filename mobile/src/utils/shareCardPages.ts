/**
 * Deterministic pagination of long prose into share cards (PRD-45, design.md §39.4).
 *
 * A katha section, a Theerth reading or a deity essay does not fit one 540×675 card.
 * Rather than shrink it (design.md §39 records why platform auto-fit is banned on the
 * share card), the prose is cut into a series of cards at a fixed, readable size.
 *
 * Same method as the verse card's `fitMeaningType`: the card's geometry is known, so
 * the line budget is arithmetic, not a layout pass. Text is packed a sentence at a time
 * (breaking at । ॥ . ? !), a paragraph that runs past a page continues on the next one
 * (the card draws a leading `…`), a section heading never sits alone at a page foot,
 * and a last page shorter than three lines borrows sentences from the page before.
 *
 * The chars-per-line estimate is fitted to the real fonts with a margin (see `ADVANCE`),
 * and one line of every page is held back as slack: over-estimating costs a slightly
 * shorter page, under-estimating would clip text. If a device shows a clipped page,
 * widen the advance — never reach for `adjustsFontSizeToFit`.
 *
 * Pure: no React, no native deps.
 */

import type { Lang } from '@/data/gita/language';
import { charsPerLine } from '@/utils/shareCardType';

/** Instagram takes 20 slides; nobody reads 20 parchment pages. Past this a scope is refused. */
export const MAX_SHARE_PAGES = 10;

/** Geometry of the prose card, in dp. `ProseShareCard`'s StyleSheet reads these. */
export const proseCardMetrics = {
  width: 540,
  height: 675,
  paddingTop: 28,
  paddingBottom: 22,
  paddingHorizontal: 28,
  /** Header label on its line box + its 18 dp margin (same as the verse card). */
  headerBlock: 40,
  /** Page index (dots · n/m) and continuation cue, + margin. */
  pageRowBlock: 26,
  /** Divider rule + wordmark + tagline + store line, with margins (same as the verse card). */
  footerBlock: 100,
  paraGap: 10,
  titleMarginBottom: 10,
  headingMarginTop: 6,
  headingMarginBottom: 4,
  /** Lines held back per page against estimate error. */
  slackLines: 1,
} as const;

type Face = { fontSize: number; lineHeight: number };

/** Body / title / heading faces by script family. */
export const proseType: Record<'indic' | 'latin', { body: Face; title: Face; heading: Face }> = {
  indic: {
    body: { fontSize: 18, lineHeight: 29 },
    title: { fontSize: 21, lineHeight: 32 },
    heading: { fontSize: 17, lineHeight: 28 },
  },
  latin: {
    body: { fontSize: 19, lineHeight: 28 },
    title: { fontSize: 22, lineHeight: 31 },
    heading: { fontSize: 18, lineHeight: 26 },
  },
};

/**
 * Mean glyph advance per reading language (fraction of the font size), for word-wrap
 * estimation at the body sizes above.
 *
 * Fitted, not guessed (September 2026): 500 bundled katha paragraphs per language were
 * laid out in Chromium at 484 dp with the app's own TTFs (Noto Serif Devanagari /
 * Gujarati / Kannada 500, Cormorant Garamond 500), and the smallest advance at which
 * this estimator never under-counted a single paragraph's lines was found — hi 0.390,
 * gu 0.410, kn 0.540, en 0.420. Each value below is that minimum + 0.02, which
 * over-counts by ~11 % overall: pages end a little early rather than ever clipping.
 * (The meaning ladder's `AVG_ADVANCE` — 0.52 / 0.46 — over-counts prose by ~38 %.)
 */
const ADVANCE: Record<Lang, number> = {
  hi: 0.41,
  gu: 0.43,
  kn: 0.56,
  en: 0.44,
};
/** Title and heading are set in the semibold cut, which runs wider. */
const BOLD_FACTOR = 1.06;
const WIDOW_MIN_LINES = 3;

export function proseScript(lang: Lang): 'indic' | 'latin' {
  return lang === 'en' ? 'latin' : 'indic';
}

export const proseBodyWidth = proseCardMetrics.width - 2 * proseCardMetrics.paddingHorizontal;

export const proseBodyHeight =
  proseCardMetrics.height -
  proseCardMetrics.paddingTop -
  proseCardMetrics.paddingBottom -
  proseCardMetrics.headerBlock -
  proseCardMetrics.pageRowBlock -
  proseCardMetrics.footerBlock;

export type ProseBlockInput = { kind: 'heading' | 'para'; text: string };

export type ProsePageBlock = {
  kind: 'heading' | 'para';
  text: string;
  /** This paragraph began on the previous page (the card draws a leading `…`). */
  continued: boolean;
  /** This paragraph carries on onto the next page. */
  continues: boolean;
};

export type ProsePage = {
  /** Only page 1 carries the title. */
  title: string | null;
  blocks: ProsePageBlock[];
  /** Estimated body height this page uses, in dp. */
  usedDp: number;
};

export type ProsePagination = {
  pages: ProsePage[];
  /** More pages than `maxPages` — the caller must offer a narrower scope instead. */
  truncated: boolean;
  /** Usable body height per page after slack, in dp. */
  budgetDp: number;
};

/** Split prose into sentences, keeping the terminator and any closing quote with it. */
export function splitSentences(text: string): string[] {
  const out: string[] = [];
  let buf = '';
  const chars = Array.from(text);
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    buf += ch;
    if ('।॥.?!'.includes(ch)) {
      // Absorb repeated terminators and closing quotes/brackets: `?’`, `।।`, `.”`.
      while (i + 1 < chars.length && '।॥.?!’”"\')'.includes(chars[i + 1])) {
        buf += chars[++i];
      }
      const next = chars[i + 1];
      if (next === undefined || /\s/.test(next)) {
        if (buf.trim()) out.push(buf.trim());
        buf = '';
      }
    }
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}

/** Greedy word-wrap line count at `perLine` characters. */
export function wrapLineCount(text: string, perLine: number): number {
  let lines = 1;
  let cur = 0;
  for (const word of text.split(/\s+/)) {
    if (!word) continue;
    const len = Array.from(word).length;
    if (cur === 0) {
      cur = len;
      // A word longer than the line wraps onto as many lines as it needs.
      while (cur > perLine) {
        lines++;
        cur -= perLine;
      }
    } else if (cur + 1 + len > perLine) {
      lines++;
      cur = len;
    } else {
      cur += 1 + len;
    }
  }
  return lines;
}

type Item = { kind: 'heading' | 'para'; blockIndex: number; sentences: string[] };
type Page = { title: string | null; items: Item[] };

export function paginateProse(params: {
  title?: string | null;
  blocks: readonly ProseBlockInput[];
  lang: Lang;
  maxPages?: number;
}): ProsePagination {
  const m = proseCardMetrics;
  const faces = proseType[proseScript(params.lang)];
  const adv = ADVANCE[params.lang];
  const bodyCpl = charsPerLine(proseBodyWidth, faces.body.fontSize, adv);
  const titleCpl = charsPerLine(proseBodyWidth, faces.title.fontSize, adv * BOLD_FACTOR);
  const headingCpl = charsPerLine(proseBodyWidth, faces.heading.fontSize, adv * BOLD_FACTOR);
  const budget = proseBodyHeight - m.slackLines * faces.body.lineHeight;
  const maxPages = params.maxPages ?? MAX_SHARE_PAGES;

  const itemHeight = (item: Item, first: boolean): number => {
    const text = item.sentences.join(' ');
    if (item.kind === 'heading') {
      return (
        (first ? 0 : m.headingMarginTop) +
        wrapLineCount(text, headingCpl) * faces.heading.lineHeight +
        m.headingMarginBottom
      );
    }
    if (!text) return 0;
    return (first ? 0 : m.paraGap) + wrapLineCount(text, bodyCpl) * faces.body.lineHeight;
  };
  const pageHeight = (page: Page): number => {
    let h = page.title
      ? wrapLineCount(page.title, titleCpl) * faces.title.lineHeight + m.titleMarginBottom
      : 0;
    page.items.forEach((it, i) => {
      h += itemHeight(it, i === 0);
    });
    return h;
  };
  // Body text only: a page holding just a carried-over heading is not yet a page.
  const hasContent = (page: Page) =>
    page.items.some((it) => it.kind === 'para' && it.sentences.length > 0);

  const title = params.title?.trim() ? params.title.trim() : null;
  const pages: Page[] = [];
  let page: Page = { title, items: [] };

  const closePage = () => {
    // A heading never ends a page: carry it over with its body.
    const carried: Item[] = [];
    while (page.items.length && page.items[page.items.length - 1].kind === 'heading') {
      carried.unshift(page.items.pop()!);
    }
    page.items = page.items.filter((it) => it.sentences.length > 0);
    if (hasContent(page) || page.title) pages.push(page);
    page = { title: null, items: carried };
  };

  /** Place one sentence of block `bi`, splitting at words only if it cannot fit an empty page. */
  const placeSentence = (bi: number, sentence: string) => {
    let remaining = sentence;
    while (remaining) {
      let last = page.items[page.items.length - 1];
      if (!last || last.kind !== 'para' || last.blockIndex !== bi) {
        last = { kind: 'para', blockIndex: bi, sentences: [] };
        page.items.push(last);
      }
      last.sentences.push(remaining);
      if (pageHeight(page) <= budget) return;
      last.sentences.pop();

      const pageHadText = hasContent(page);
      if (pageHadText) {
        closePage();
        continue;
      }
      // Empty page and still too long: fill the page word by word, carry the rest.
      const words = remaining.split(/\s+/).filter(Boolean);
      let taken = 0;
      for (let n = 1; n <= words.length; n++) {
        last.sentences.push(words.slice(0, n).join(' '));
        const fits = pageHeight(page) <= budget;
        last.sentences.pop();
        if (!fits) break;
        taken = n;
      }
      taken = Math.max(1, taken);
      last.sentences.push(words.slice(0, taken).join(' '));
      remaining = words.slice(taken).join(' ');
      if (remaining) closePage();
    }
  };

  params.blocks.forEach((block, bi) => {
    const text = block.text.trim();
    if (!text) return;
    if (block.kind === 'heading') {
      const item: Item = { kind: 'heading', blockIndex: bi, sentences: [text] };
      page.items.push(item);
      // Keep with next: the heading plus two body lines must fit, else start a page.
      const need = pageHeight(page) + m.paraGap + 2 * faces.body.lineHeight;
      if (need > budget && hasContent({ ...page, items: page.items.slice(0, -1) })) {
        page.items.pop();
        closePage();
        page.items.push(item);
      }
      return;
    }
    for (const s of splitSentences(text)) placeSentence(bi, s);
  });
  closePage();

  // Widow rule: a last page under three lines borrows whole sentences from the one before.
  if (pages.length > 1) {
    const lastPage = pages[pages.length - 1];
    const prev = pages[pages.length - 2];
    const minDp = WIDOW_MIN_LINES * faces.body.lineHeight;
    for (let guard = 0; guard < 4 && pageHeight(lastPage) < minDp; guard++) {
      const tail = prev.items[prev.items.length - 1];
      // Never empty the page before: it keeps at least one sentence.
      if (!tail || tail.kind !== 'para' || (prev.items.length === 1 && tail.sentences.length <= 1)) break;
      const sentence = tail.sentences[tail.sentences.length - 1];
      const head = lastPage.items[0];
      const trial: Page = {
        title: lastPage.title,
        items:
          head && head.kind === 'para' && head.blockIndex === tail.blockIndex
            ? [{ ...head, sentences: [sentence, ...head.sentences] }, ...lastPage.items.slice(1)]
            : [{ kind: 'para', blockIndex: tail.blockIndex, sentences: [sentence] }, ...lastPage.items],
      };
      if (pageHeight(trial) > budget) break;
      tail.sentences.pop();
      if (!tail.sentences.length) prev.items.pop();
      lastPage.items = trial.items;
    }
  }

  const out: ProsePage[] = pages.map((p, pi) => ({
    title: p.title,
    usedDp: pageHeight(p),
    blocks: p.items.map((it, ii) => {
      const prevPage = pages[pi - 1];
      const nextPage = pages[pi + 1];
      const prevTail = prevPage?.items[prevPage.items.length - 1];
      const nextHead = nextPage?.items[0];
      return {
        kind: it.kind,
        text: it.sentences.join(' '),
        continued:
          it.kind === 'para' && ii === 0 && prevTail?.kind === 'para' && prevTail.blockIndex === it.blockIndex,
        continues:
          it.kind === 'para' &&
          ii === p.items.length - 1 &&
          nextHead?.kind === 'para' &&
          nextHead.blockIndex === it.blockIndex,
      };
    }),
  }));

  return { pages: out, truncated: out.length > maxPages, budgetDp: budget };
}
