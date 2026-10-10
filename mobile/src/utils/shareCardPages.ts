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
  /** Gap between an illustrated scene and the title/caption beneath it. */
  illustrationGap: 12,
  /**
   * Smallest illustration a scene card may carry. The art takes whatever the title and
   * caption leave of the body; a caption that would push it lower continues on a plain
   * prose card instead of shrinking the scene further.
   */
  illustrationMinHeight: 160,
  /** Lines held back per page against estimate error. */
  slackLines: 1,
} as const;

/**
 * Which card a page is laid out for.
 *
 * - `prose` — the 540×675 (4:5) card above.
 * - `picture` — the 540×960 (9:16) picture-story card (design.md §76): the complete
 *   illustration at the body's full width, then the reader's caption box (title, narration,
 *   dialogue in its tinted box). Captured at 1080×1920 whatever the target, so a
 *   WhatsApp album of scenes looks like the reader pages do.
 */
export type ShareCardLayout = 'prose' | 'picture';

/** Geometry of the picture-story card, in dp. Same chrome as the prose card, taller body. */
export const pictureCardMetrics = {
  ...proseCardMetrics,
  height: 960,
  /** Full-width 4:5 art is 472–564 dp tall after the reviewed frame; below this a scene narrows. */
  illustrationMinHeight: 400,
  /** The closing card's cover is a recap over the takeaway, source and app link: it may go smaller. */
  coverMinHeight: 260,
  /** The reader's caption box (`parchmentSoft`, radius 12) around title + narration. */
  captionPaddingHorizontal: 16,
  captionPaddingVertical: 12,
  /** The dialogue box (`goldTint`, radius 10) inside the caption. */
  quotePadding: 12,
  /** The app-link block on the last card. */
  linkPadding: 10,
  linkLineHeight: 24,
} as const;

export function cardMetricsFor(layout: ShareCardLayout = 'prose'): typeof proseCardMetrics | typeof pictureCardMetrics {
  return layout === 'picture' ? pictureCardMetrics : proseCardMetrics;
}

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

/** The body box of a card: the card height minus its chrome. */
export function bodyHeightFor(layout: ShareCardLayout = 'prose'): number {
  const m = cardMetricsFor(layout);
  return m.height - m.paddingTop - m.paddingBottom - m.headerBlock - m.pageRowBlock - m.footerBlock;
}

/** Width the body's content spans (the picture caption box insets its text further). */
export function bodyWidthFor(layout: ShareCardLayout = 'prose'): number {
  const m = cardMetricsFor(layout);
  return m.width - 2 * m.paddingHorizontal;
}

/** Width a line of text wraps at: the body, less the picture layout's caption-box padding. */
export function textWidthFor(layout: ShareCardLayout = 'prose'): number {
  return bodyWidthFor(layout) - (layout === 'picture' ? 2 * pictureCardMetrics.captionPaddingHorizontal : 0);
}

/**
 * Prose comes as headings and paragraphs; a picture story adds a `quote` (one line of
 * dialogue with its speaker, drawn in the reader's tinted box) and a `link` (the app
 * link on the last card: a label line over the URL, never split across pages).
 */
export type ProseBlockInput = {
  kind: 'heading' | 'para' | 'quote' | 'link';
  text: string;
  /** `quote` only: who speaks; drawn on its own line above the words. */
  speaker?: string;
  /** `link` only: the URL under the label. */
  url?: string;
};

export type ProsePageBlock = {
  kind: 'heading' | 'para' | 'quote' | 'link';
  text: string;
  /** `quote`: the speaker, on the first part of a quote only. */
  speaker?: string;
  /** `link`: the URL under the label. */
  url?: string;
  /** This paragraph began on the previous page (the card draws a leading `…`). */
  continued: boolean;
  /** This paragraph carries on onto the next page. */
  continues: boolean;
};

export type ProsePage = {
  /**
   * An illustrated scene above this page's title and caption. `heightDp` is the box the
   * art fills: the body left after `usedDp` and `illustrationGap`, never below the
   * layout's `illustrationMinHeight` (the paginator reserved that much on the first page)
   * and, on the picture card, never taller than the art at the body's full width.
   */
  illustration?: { art: string; label: string; heightDp: number };
  /** Only page 1 carries the title. */
  title: string | null;
  blocks: ProsePageBlock[];
  /** Estimated body height this page uses, in dp (the caption box's padding included). */
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

type Item = { kind: ProseBlockInput['kind']; blockIndex: number; sentences: string[]; speaker?: string; url?: string };
type Page = { title: string | null; items: Item[] };

export function paginateProse(params: {
  title?: string | null;
  blocks: readonly ProseBlockInput[];
  lang: Lang;
  maxPages?: number;
  /** Body height the first page gives up (an illustration and its gap); later pages keep the full budget. */
  firstPageReservedDp?: number;
  /** The card these pages are laid out for; defaults to the prose card. */
  layout?: ShareCardLayout;
}): ProsePagination {
  const layout = params.layout ?? 'prose';
  const m = proseCardMetrics;
  const pm = pictureCardMetrics;
  const faces = proseType[proseScript(params.lang)];
  const adv = ADVANCE[params.lang];
  const textWidth = textWidthFor(layout);
  const bodyCpl = charsPerLine(textWidth, faces.body.fontSize, adv);
  const titleCpl = charsPerLine(textWidth, faces.title.fontSize, adv * BOLD_FACTOR);
  const headingCpl = charsPerLine(textWidth, faces.heading.fontSize, adv * BOLD_FACTOR);
  const quoteCpl = charsPerLine(textWidth - 2 * pm.quotePadding, faces.body.fontSize, adv);
  const budget = bodyHeightFor(layout) - m.slackLines * faces.body.lineHeight;
  const maxPages = params.maxPages ?? MAX_SHARE_PAGES;
  const reserved = Math.max(0, params.firstPageReservedDp ?? 0);
  /** The picture card draws every page's text inside the reader's padded caption box. */
  const boxPadding = layout === 'picture' ? 2 * pm.captionPaddingVertical : 0;

  const itemHeight = (item: Item, first: boolean): number => {
    const text = item.sentences.join(' ');
    if (item.kind === 'heading') {
      return (
        (first ? 0 : m.headingMarginTop) +
        wrapLineCount(text, headingCpl) * faces.heading.lineHeight +
        m.headingMarginBottom
      );
    }
    if (item.kind === 'link') {
      return (first ? 0 : m.paraGap) + 2 * pm.linkPadding +
        wrapLineCount(text, headingCpl) * faces.heading.lineHeight + pm.linkLineHeight;
    }
    if (!text) return 0;
    if (item.kind === 'quote') {
      return (first ? 0 : m.paraGap) + 2 * pm.quotePadding +
        (item.speaker ? faces.heading.lineHeight : 0) +
        wrapLineCount(text, quoteCpl) * faces.body.lineHeight;
    }
    return (first ? 0 : m.paraGap) + wrapLineCount(text, bodyCpl) * faces.body.lineHeight;
  };
  const pageHeight = (page: Page): number => {
    let h = boxPadding + (page.title
      ? wrapLineCount(page.title, titleCpl) * faces.title.lineHeight + m.titleMarginBottom
      : 0);
    page.items.forEach((it, i) => {
      h += itemHeight(it, i === 0);
    });
    return h;
  };
  // Body text only: a page holding just a carried-over heading is not yet a page.
  const hasContent = (page: Page) =>
    page.items.some((it) => (it.kind === 'para' || it.kind === 'quote' || it.kind === 'link') && it.sentences.length > 0);

  const title = params.title?.trim() ? params.title.trim() : null;
  const pages: Page[] = [];
  let page: Page = { title, items: [] };
  /** The page being filled: the first one shares its body with the reserved block. */
  const pageBudget = () => (pages.length === 0 ? budget - reserved : budget);

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

  /** Block `bi` already has words on a page: a quote's speaker is drawn on its first part only. */
  const begun = (bi: number) =>
    [...pages, page].some((pg) => pg.items.some((it) => it.blockIndex === bi && it.sentences.length > 0));
  /** Place one sentence of block `bi`, splitting at words only if it cannot fit an empty page. */
  const placeSentence = (bi: number, sentence: string, kind: 'para' | 'quote', speaker?: string) => {
    let remaining = sentence;
    while (remaining) {
      let last = page.items[page.items.length - 1];
      if (!last || last.kind !== kind || last.blockIndex !== bi) {
        last = { kind, blockIndex: bi, sentences: [], ...(kind === 'quote' && speaker && !begun(bi) ? { speaker } : {}) };
        page.items.push(last);
      }
      last.sentences.push(remaining);
      if (pageHeight(page) <= pageBudget()) return;
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
        const fits = pageHeight(page) <= pageBudget();
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
      if (need > pageBudget() && hasContent({ ...page, items: page.items.slice(0, -1) })) {
        page.items.pop();
        closePage();
        page.items.push(item);
      }
      return;
    }
    if (block.kind === 'link') {
      // Never split: a label over its URL moves to the next page whole.
      const item: Item = { kind: 'link', blockIndex: bi, sentences: [text], url: block.url };
      page.items.push(item);
      if (pageHeight(page) > pageBudget() && hasContent({ ...page, items: page.items.slice(0, -1) })) {
        page.items.pop();
        closePage();
        page.items.push(item);
      }
      return;
    }
    for (const s of splitSentences(text)) placeSentence(bi, s, block.kind, block.speaker);
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
      const flows = it.kind === 'para' || it.kind === 'quote';
      return {
        kind: it.kind,
        text: it.sentences.join(' '),
        ...(it.speaker ? { speaker: it.speaker } : {}),
        ...(it.url ? { url: it.url } : {}),
        continued:
          flows && ii === 0 && prevTail?.kind === it.kind && prevTail.blockIndex === it.blockIndex,
        continues:
          flows &&
          ii === p.items.length - 1 &&
          nextHead?.kind === it.kind &&
          nextHead.blockIndex === it.blockIndex,
      };
    }),
  }));

  return { pages: out, truncated: out.length > maxPages, budgetDp: budget };
}
