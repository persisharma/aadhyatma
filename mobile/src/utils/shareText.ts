/**
 * "Send as text" (design.md §39.8): the same reading the card shows, as one plain
 * message — for a family group on low data, a reader who wants to paste it into a
 * note, or a recipient whose phone renders images poorly.
 *
 * Pure: the provider only hands the result to the OS text share sheet.
 */

import type { Lang } from '@/data/gita/language';
import { shareLinkLines } from '@/data/shareLinks';
import { contentByLang, meaningByLang, verseLinesByLang } from '@/utils/localize';
import type { ProsePage, ProsePageBlock } from '@/utils/shareCardPages';
import type { ShareableVerse } from '@/utils/shareVerse';

/** Header → verse lines → (theme title) meaning → app link, all in the card's language. */
export function buildVerseShareText(v: ShareableVerse, lang: Lang): string {
  const header = `${contentByLang(lang, v.sectionNameHi, v.sectionNameEn)} · ${contentByLang(lang, v.verseLabelHi, v.verseLabelEn)}`;
  const lines = verseLinesByLang(lang, v.linesHi, v.linesEn).filter((l) => l.trim());
  const meaning = meaningByLang(lang, v.meaningHi ?? '', v.meaningEn ?? '', { gu: v.meaningGu, kn: v.meaningKn }).trim();
  const title = meaningByLang(lang, v.meaningTitleHi ?? '', v.meaningTitleEn ?? '').trim();
  const out = [header, '', ...lines];
  if (meaning) out.push('', ...(title ? [title] : []), meaning);
  out.push('', ...shareLinkLines(lang));
  return out.join('\n');
}

function blockText(b: ProsePageBlock): string {
  return b.kind === 'quote' && b.speaker ? `${b.speaker}: ${b.text}` : b.text;
}

/**
 * The selected pages of a prose series as one message. A paragraph the paginator split
 * across two selected pages is rejoined; one cut off by an unselected page keeps the
 * card's `…` so the gap reads as a gap. The card-only `link` block is dropped: the
 * message's own last line carries the tappable link.
 */
export function buildProseShareText(p: {
  header: string;
  pages: readonly ProsePage[];
  indices: readonly number[];
  lang: Lang;
}): string {
  const paras: string[] = [];
  const picked = new Set(p.indices);
  const order = [...picked].filter((i) => p.pages[i]).sort((a, b) => a - b);
  for (const i of order) {
    const page = p.pages[i];
    if (page.title) paras.push(page.title);
    for (const block of page.blocks) {
      if (block.kind === 'link') continue;
      // A continuation never repeats its speaker, so `blockText` is just its words.
      let text = blockText(block);
      const joinsPrevious = block.continued && picked.has(i - 1) && paras.length > 0;
      if (block.continued && !joinsPrevious) text = `…${text}`;
      if (block.continues && !picked.has(i + 1)) text = `${text}…`;
      if (joinsPrevious) paras[paras.length - 1] += ` ${text}`;
      else paras.push(text);
    }
  }
  return [p.header, '', paras.join('\n\n'), '', ...shareLinkLines(p.lang)].join('\n');
}
