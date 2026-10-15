import { buildListingShare } from '@/utils/listingShare';
import { bodyHeightFor, proseScript, proseType } from '@/utils/shareCardPages';
import { contentByLang } from '@/utils/localize';
import { library } from '@/data/texts';
import { categories } from '@/data/categories';
import { deities } from '@/data/deities';
import { gitaChaptersManifest } from '@/data/gita';
import { getKathaLibrary } from '@/panchang/vratCatalog';
import type { Lang } from '@/data/gita/language';

const languages: Lang[] = ['hi', 'en', 'gu', 'kn'];

describe('listing share cards', () => {
  const cases = [
    ...categories.map((category) => ({
      id: category.id, titleHi: category.nameHi, titleEn: category.nameEn,
      entries: library.filter((entry) => entry.category === category.id && !entry.hidden),
    })),
    ...deities.map((deity) => ({
      id: deity.id, titleHi: deity.nameHi, titleEn: deity.nameEn,
      entries: library.filter((entry) => entry.deities.includes(deity.id) && !entry.hidden),
    })),
  ];

  test.each(cases)('$id preserves every visible entry in a readable series', ({ id, titleHi, titleEn, entries }) => {
    const share = buildListingShare({
      sourceId: id, titleHi, titleEn, background: null,
      items: entries.map((entry) => ({
        titleHi: entry.nameHi, titleEn: entry.nameEn,
        detailHi: entry.sub, detailEn: entry.subEn,
      })),
    });
    for (const lang of languages) {
      const pages = share.scopes[0].prepared![lang].pages;
      const headings = pages.flatMap((page) => page.blocks.filter((block) => block.kind === 'heading').map((block) => block.text));
      expect(headings).toEqual(entries.map((entry) => contentByLang(lang, entry.nameHi, entry.nameEn)));
      const budget = bodyHeightFor() - proseType[proseScript(lang)].body.lineHeight;
      for (const page of pages) expect(page.usedDp).toBeLessThanOrEqual(budget);
    }
  });

  test('chapter index keeps all chapter titles and counts', () => {
    const share = buildListingShare({
      sourceId: 'bhagavad-gita', titleHi: 'भगवद् गीता', titleEn: 'Bhagavad Gita', background: null,
      items: gitaChaptersManifest.map((chapter) => ({
        titleHi: chapter.titleHi, titleEn: chapter.titleEn,
        detailHi: `${chapter.verseCount} श्लोक`, detailEn: `${chapter.verseCount} verses`,
      })),
    });
    const pages = share.scopes[0].prepared!.en.pages;
    expect(pages.flatMap((page) => page.blocks.filter((block) => block.kind === 'heading').map((block) => block.text)))
      .toEqual(gitaChaptersManifest.map((chapter) => chapter.titleEn));
    expect(pages.flatMap((page) => page.blocks.filter((block) => block.kind === 'para').map((block) => block.text)))
      .toEqual(gitaChaptersManifest.map((chapter) => `${chapter.verseCount} verses`));
  });

  test('a long katha listing splits into shareable parts without losing rows', () => {
    const kathas = getKathaLibrary();
    const share = buildListingShare({
      sourceId: 'katha-library', titleHi: 'कथा संग्रह', titleEn: 'Katha Library', background: null,
      items: kathas.map((katha) => ({ titleHi: katha.titleHi, titleEn: katha.titleEn })),
    });
    expect(share.scopes.length).toBeGreaterThan(1);
    for (const lang of languages) {
      const pages = share.scopes.flatMap((scope) => scope.prepared![lang].pages);
      expect(share.scopes.every((scope) => scope.prepared![lang].pages.length <= 10)).toBe(true);
      expect(pages.flatMap((page) => page.blocks.filter((block) => block.kind === 'heading').map((block) => block.text)))
        .toEqual(kathas.map((katha) => contentByLang(lang, katha.titleHi, katha.titleEn)));
    }
  });
});
