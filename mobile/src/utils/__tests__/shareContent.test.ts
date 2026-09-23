import {
  askAnswerShareable,
  daanKathaShareable,
  daanPrincipleShareable,
  observanceShareable,
  theerthShareable,
  vidhiMantraShareable,
  vratKathaShareable,
} from '@/utils/shareContent';
import { KATHA_CONTENT, getKathaContent } from '@/panchang/kathaContent';
import { getKathaLibrary } from '@/panchang/vratCatalog';
import { getDaanKathas, getDaanPrinciples } from '@/data/daan';
import { temples } from '@/data/theerth/temples';
import { MAX_SHARE_PAGES, paginateProse } from '@/utils/shareCardPages';
import type { ShareableProse } from '@/utils/shareVerse';
import type { Lang } from '@/data/gita/language';

/**
 * Builders from each surface's data to share content (PRD-45, design.md §39.4). Pins the
 * mappings and that every bundled katha / temple / daan katha paginates in its default
 * scope within one carousel.
 */

function defaultPages(p: ShareableProse, lang: Lang) {
  const scope = p.scopes[0];
  const t = (hi: string, en: string) => (lang === 'en' ? en || hi : hi);
  return paginateProse({
    title: scope.titleHi ? t(scope.titleHi, scope.titleEn ?? '') : null,
    blocks: scope.blocks.map((b) => ({ kind: b.kind, text: t(b.hi, b.en) })),
    lang,
  });
}

describe('vratKathaShareable', () => {
  const katha = getKathaContent('chhath-puja-katha')!;

  test('opens on the current section, offers the whole katha second', () => {
    const p = vratKathaShareable(katha, 1);
    expect(p.kind).toBe('prose');
    expect(p.scopes.map((s) => s.id)).toEqual([`section-${katha.sections[1].id}`, 'whole']);
    expect(p.scopes[0].titleHi).toBe(katha.sections[1].titleHi);
    expect(p.scopes[0].headerEn).toBe(`${katha.titleEn} · Part 2/${katha.sections.length}`);
    expect(p.tagNameEn).toBe(katha.titleEn);
  });

  test('the whole-katha scope carries every section title as a heading', () => {
    const whole = vratKathaShareable(katha, 0).scopes[1];
    const headings = whole.blocks.filter((b) => b.kind === 'heading').map((b) => b.hi);
    expect(headings).toEqual(katha.sections.map((s) => s.titleHi));
  });

  test('clamps an out-of-range section index', () => {
    expect(vratKathaShareable(katha, 99).scopes[0].titleHi).toBe(
      katha.sections[katha.sections.length - 1].titleHi
    );
  });

  test('the katha share-katha-smoke.yaml opens (first in the library) is a series in English', () => {
    // The Maestro flow asserts the pages strip on this katha's first section.
    expect(defaultPages(vratKathaShareable(getKathaLibrary()[0], 0), 'en').pages.length).toBeGreaterThan(1);
  });

  test('every katha section fits one carousel by default', () => {
    for (const k of KATHA_CONTENT) {
      for (let i = 0; i < k.sections.length; i++) {
        expect(defaultPages(vratKathaShareable(k, i), 'hi').pages.length).toBeLessThanOrEqual(MAX_SHARE_PAGES);
      }
    }
  });
});

describe('theerthShareable', () => {
  test('every temple has a default scope that fits one carousel, on its own plate', () => {
    for (const temple of temples) {
      const p = theerthShareable(temple);
      expect(p.background).toBeTruthy();
      expect(p.scopes[0].blocks.filter((b) => b.kind === 'heading').map((b) => b.en)).toEqual([
        'Significance',
        'Origin Story',
      ]);
      for (const lang of ['hi', 'en'] as Lang[]) {
        expect(defaultPages(p, lang).pages.length).toBeLessThanOrEqual(MAX_SHARE_PAGES);
      }
      expect(p.scopes.length).toBe(temple.sections?.length ? 2 : 1);
    }
  });
});

describe('daanKathaShareable', () => {
  test('story, then the शिक्षा heading, teaching and source line', () => {
    for (const k of getDaanKathas()) {
      const blocks = daanKathaShareable(k).scopes[0].blocks;
      const tail = blocks.slice(-3);
      expect(tail[0]).toEqual({ kind: 'heading', hi: 'शिक्षा', en: 'The teaching' });
      expect(tail[1].hi).toBe(k.teachingHi);
      expect(tail[2].hi).toContain(k.canonHi);
    }
  });
});

describe('verse-shaped builders', () => {
  test('a Daan principle maps onto the verse card', () => {
    for (const entry of getDaanPrinciples()) {
      const v = daanPrincipleShareable(entry);
      expect(v.linesHi.length).toBeGreaterThan(0);
      expect(v.linesEn.length).toBeGreaterThan(0);
      expect(v.verseLabelHi).toBe(entry.citeHi);
      expect(v.meaningHi).toBe(entry.meaningHi);
      if (entry.verseLines) expect(v.linesHi).toEqual([...entry.verseLines]);
    }
  });

  test('a Vidhi mantra splits into its lines, with the instruction as meaning', () => {
    const v = vidhiMantraShareable(
      { id: 'satyanarayan-puja', titleHi: 'सत्यनारायण पूजा', titleEn: 'Satyanarayan Puja' },
      {
        titleHi: 'आसन',
        titleEn: 'Asana',
        instructionHi: 'आसन अर्पित करें।',
        instructionEn: 'Offer a seat.',
        mantra: { devanagari: 'ॐ श्रीसत्यनारायणाय नमः।\nआसनं समर्पयामि॥', iast: 'oṁ śrīsatyanārāyaṇāya namaḥ\nāsanaṁ samarpayāmi' },
      }
    );
    expect(v.linesHi).toEqual(['ॐ श्रीसत्यनारायणाय नमः।', 'आसनं समर्पयामि॥']);
    expect(v.linesEn).toHaveLength(2);
    expect(v.verseLabelEn).toBe('Mantra · Asana');
    expect(v.meaningEn).toBe('Offer a seat.');
  });
});

describe('observanceShareable', () => {
  const rule = { id: 'chhath-puja', nameHi: 'छठ पूजा', nameEn: 'Chhath Puja', deityHi: 'सूर्य', deityEn: 'Surya' };

  test('only present content becomes blocks', () => {
    const bare = observanceShareable({ rule, date: null });
    expect(bare.scopes[0].blocks.map((b) => b.kind)).toEqual(['para']);
    const full = observanceShareable({
      rule,
      date: { hi: '8 नवम्बर', en: '8 November' },
      katha: getKathaContent('chhath-puja-katha'),
      upvas: { fastTypeNoteHi: 'जल भी वर्जित', fastTypeNoteEn: 'Even water', window: { textHi: 'सूर्योदय से', textEn: 'From sunrise' } },
      bhog: { offerings: [{ textHi: 'ठेकुआ', textEn: 'Thekua' }] },
    });
    const heads = full.scopes[0].blocks.filter((b) => b.kind === 'heading').map((b) => b.en);
    expect(heads).toEqual(['The fast', 'Offerings', 'Chhath Puja Katha']);
    expect(full.scopes[0].headerEn).toBe('8 November');
  });
});

describe('askAnswerShareable', () => {
  test('headline is the title; lines become label — value paragraphs', () => {
    const p = askAnswerShareable({
      intentId: 'rahukaal.today',
      tag: { hi: 'मुहूर्त', en: 'Muhurat' },
      headline: { hi: 'राहु काल 10:30–12:00', en: 'Rahu kaal 10:30–12:00' },
      lines: [{ label: { hi: 'स्थान', en: 'Place' }, value: { hi: 'दिल्ली', en: 'Delhi' } }],
    });
    expect(p.scopes[0].titleEn).toBe('Rahu kaal 10:30–12:00');
    expect(p.scopes[0].blocks).toEqual([{ kind: 'para', hi: 'स्थान — दिल्ली', en: 'Place — Delhi' }]);
  });
});
