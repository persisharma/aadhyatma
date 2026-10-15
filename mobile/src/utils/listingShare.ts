import type { BackgroundImage } from '@/data/backgroundAsset';
import type { Lang } from '@/data/gita/language';
import { contentByLang, type LocalizedStrings } from '@/utils/localize';
import {
  bodyHeightFor,
  MAX_SHARE_PAGES,
  proseCardMetrics,
  proseScript,
  proseType,
  textWidthFor,
  wrapLineCount,
  type ProsePage,
  type ProsePageBlock,
} from '@/utils/shareCardPages';
import { charsPerLine } from '@/utils/shareCardType';
import type { ShareableProse } from '@/utils/shareVerse';

export type ListingShareItem = {
  titleHi: string;
  titleEn: string;
  detailHi?: string;
  detailEn?: string;
};

const LANGUAGES: readonly Lang[] = ['hi', 'en', 'gu', 'kn'];
// Three complete rows leave room for long Indic titles and two-line details at
// the prose card's fixed reading size. A row is never broken across cards.
const ITEMS_PER_CARD = 3;
const ADVANCE: Record<Lang, number> = { hi: 0.41, en: 0.44, gu: 0.43, kn: 0.56 };

const LABELS: LocalizedStrings = {
  hi: 'सूची', en: 'Contents', gu: 'સૂચિ', kn: 'ಪಟ್ಟಿ',
};
const SHEET_TITLES: LocalizedStrings = {
  hi: 'सूची साझा करें', en: 'Share this list', gu: 'સૂચિ શેર કરો', kn: 'ಪಟ್ಟಿ ಹಂಚಿಕೊಳ್ಳಿ',
};

function pageFor(items: readonly ListingShareItem[], lang: Lang, title: string): ProsePage {
  const blocks: ProsePageBlock[] = [];
  for (const item of items) {
    blocks.push({
      kind: 'heading',
      text: contentByLang(lang, item.titleHi, item.titleEn),
      continued: false,
      continues: false,
    });
    const detail = item.detailHi || item.detailEn
      ? contentByLang(lang, item.detailHi || item.detailEn || '', item.detailEn || item.detailHi || '')
      : lang === 'en' ? item.titleHi : item.titleEn;
    if (detail) blocks.push({ kind: 'para', text: detail, continued: false, continues: false });
  }
  const faces = proseType[proseScript(lang)];
  const width = textWidthFor();
  const bodyCpl = charsPerLine(width, faces.body.fontSize, ADVANCE[lang]);
  const boldAdvance = ADVANCE[lang] * 1.06;
  const headingCpl = charsPerLine(width, faces.heading.fontSize, boldAdvance);
  const titleCpl = charsPerLine(width, faces.title.fontSize, boldAdvance);
  let usedDp = wrapLineCount(title, titleCpl) * faces.title.lineHeight + proseCardMetrics.titleMarginBottom;
  blocks.forEach((block, index) => {
    if (block.kind === 'heading') {
      usedDp += (index ? proseCardMetrics.headingMarginTop : 0)
        + wrapLineCount(block.text, headingCpl) * faces.heading.lineHeight
        + proseCardMetrics.headingMarginBottom;
    } else {
      usedDp += proseCardMetrics.paraGap + wrapLineCount(block.text, bodyCpl) * faces.body.lineHeight;
    }
  });
  return { title, blocks, usedDp };
}

/** Share the actual visible listing as readable cards through the existing post,
 * Story/Reel and carousel picker. No content is summarised or silently omitted. */
export function buildListingShare(input: {
  sourceId: string;
  titleHi: string;
  titleEn: string;
  items: readonly ListingShareItem[];
  background: BackgroundImage | null;
}): ShareableProse {
  const { sourceId, titleHi, titleEn, items, background } = input;
  const pagesFor = (segment: readonly ListingShareItem[], lang: Lang): ProsePage[] => {
    const title = contentByLang(lang, titleHi, titleEn);
    const pages: ProsePage[] = [];
    const budget = bodyHeightFor() - proseType[proseScript(lang)].body.lineHeight;
    let start = 0;
    while (start < segment.length) {
      let end = Math.min(segment.length, start + ITEMS_PER_CARD);
      let page = pageFor(segment.slice(start, end), lang, title);
      while (page.usedDp > budget && end > start + 1) {
        end--;
        page = pageFor(segment.slice(start, end), lang, title);
      }
      pages.push(page);
      start = end;
    }
    return pages;
  };
  // A sheet exports at most ten cards at once. Split longer indexes into
  // selectable parts; every part remains independently shareable as a carousel.
  const parts: (typeof items)[] = [];
  for (let start = 0; start < items.length;) {
    let end = Math.min(items.length, start + ITEMS_PER_CARD * MAX_SHARE_PAGES);
    while (end > start + 1 && LANGUAGES.some((lang) => pagesFor(items.slice(start, end), lang).length > MAX_SHARE_PAGES)) end--;
    parts.push(items.slice(start, end));
    start = end;
  }
  const scopes: ShareableProse['scopes'] = parts.map((segment, index) => {
    const number = index + 1;
    const partHi = parts.length > 1 ? `भाग ${number}/${parts.length}` : '';
    const partEn = parts.length > 1 ? `Part ${number}/${parts.length}` : '';
    const prepared = {} as NonNullable<ShareableProse['scopes'][number]['prepared']>;
    for (const lang of LANGUAGES) {
      const title = contentByLang(lang, titleHi, titleEn);
      const part = partHi ? contentByLang(lang, partHi, partEn) : '';
      prepared[lang] = {
        label: part || LABELS[lang],
        header: part ? `${title} · ${part}` : title,
        firstLine: contentByLang(lang, segment[0].titleHi, segment[0].titleEn),
        pages: pagesFor(segment, lang),
      };
    }
    return {
      id: `listing-${number}`,
      labelHi: partHi || 'पूरी सूची', labelEn: partEn || 'Full list',
      headerHi: titleHi, headerEn: titleEn,
      blocks: [], prepared,
    };
  });
  return {
    kind: 'prose',
    sourceId,
    background,
    sectionNameHi: 'सूची',
    sectionNameEn: 'Contents',
    sectionName: LABELS,
    tagNameHi: titleHi,
    tagNameEn: titleEn,
    sheetTitle: SHEET_TITLES,
    scopes,
  };
}
