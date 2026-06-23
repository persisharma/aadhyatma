// Jest suite (note the `.jest.test.ts` suffix — see jest.config.js). This must
// run under Jest, not tsx: it transitively require()s the background PNGs via
// @/data/backgrounds, which plain `tsx --test` can't parse but Jest's
// react-native preset stubs as asset modules.
//
// Coverage contract: every active, user-reachable surface (category tile, deity
// tile, library source + reader, aarti, japa mantra) must resolve to a
// background image — getSourceBackground returns null when a source id is
// unmapped, so a missing mapping fails the assertion. Guards new content shipping
// without its background art.
import { backgroundImages } from '@assets/backgrounds';
import { aartiIdByIndex } from '@/data/aarti';
import {
  getCategoryBackground,
  getDeityBackground,
  getObservanceBackground,
  getReaderBackground,
  getSourceBackground,
} from '@/data/backgrounds';
import { categories } from '@/data/categories';
import { deities } from '@/data/deities';
import { japamMantras } from '@/data/japam';
import { library } from '@/data/texts';
import { getRuleById } from '@/panchang/vratCatalog';

describe('background coverage', () => {
  test('every active category tile has a background', () => {
    for (const category of categories.filter((item) => item.status === 'active')) {
      expect(getCategoryBackground(category.id)).toBeTruthy();
    }
  });

  test('every deity tile has a background', () => {
    for (const deity of deities) {
      expect(getDeityBackground(deity.id)).toBeTruthy();
    }
  });

  test('every active, non-hidden library source has a source + reader background', () => {
    // Theerth entries open a map + per-temple detail, not a verse reader, so they
    // are exempt from the source/reader background contract (mirrors the
    // exemption in backgrounds.ts assertBackgroundCoverage).
    for (const entry of library.filter(
      (item) => item.status === 'active' && !item.hidden && item.category !== 'theerth',
    )) {
      expect(getSourceBackground(entry.id)).toBeTruthy();
      expect(getReaderBackground(entry.id, { id: 'coverage', stanza: 1 })).toBeTruthy();
    }
  });

  test('every aarti has a source background', () => {
    for (const aartiId of aartiIdByIndex) {
      expect(getSourceBackground(aartiId)).toBeTruthy();
    }
  });

  test('every japa mantra has a source background', () => {
    for (const mantra of japamMantras) {
      expect(getSourceBackground(mantra.id)).toBeTruthy();
    }
  });

  test('Surya & Tulsi sanskar readers use their dedicated deity art', () => {
    expect(getSourceBackground('surya-namaskar')).toBe(backgroundImages.deity_surya_chariot);
    expect(getSourceBackground('tulsi-puja')).toBe(backgroundImages.deity_tulsi_vrindavan);
  });

  test('Vishnu & Gayatri use their own dedicated art, not a borrowed deity image (Rule 10.8)', () => {
    expect(getDeityBackground('vishnu')).toBe(backgroundImages.source_vishnu_narayana);
    expect(getDeityBackground('vishnu')).not.toBe(getDeityBackground('krishna'));
    expect(getDeityBackground('savitr')).toBe(backgroundImages.source_gayatri_savitri_sun);
    expect(getDeityBackground('savitr')).not.toBe(getDeityBackground('shiva'));
  });

  // Rule 10.8 general guard: no deity may borrow another deity's art. This is the
  // enforcement the rule lacked — Vishnu→Krishna and Gayatri→Shiva survived in this
  // map across releases because §10.8 was documented but never tested.
  test('every deity tile resolves to a distinct image (Rule 10.8)', () => {
    const owners = new Map<number, string[]>();
    for (const deity of deities) {
      const image = getDeityBackground(deity.id);
      owners.set(image, [...(owners.get(image) ?? []), deity.id]);
    }
    const shared = [...owners.values()].filter((ids) => ids.length > 1);
    expect(shared).toEqual([]);
  });
});

describe('observance deity backgrounds', () => {
  // End-to-end: the real observance rule resolves to the new deity sketch. Keyed on
  // the rule's English deity label, so this also guards a rename of deityEn silently
  // dropping the art.
  const cases: ReadonlyArray<readonly [ruleId: string, image: number]> = [
    ['diwali', backgroundImages.deity_lakshmi_lotus_coins],
    ['mahalakshmi-vrat', backgroundImages.deity_lakshmi_lotus_coins],
    ['chhath-puja', backgroundImages.deity_surya_chariot],
    ['makar-sankranti', backgroundImages.deity_surya_chariot],
    ['ganga-saptami', backgroundImages.deity_ganga_makara],
    ['ganga-dussehra', backgroundImages.deity_ganga_makara],
    ['tulasi-vivah', backgroundImages.deity_tulsi_vrindavan],
    ['shani-jayanti', backgroundImages.deity_shani_crow],
    ['santoshi-mata-vrat', backgroundImages.deity_santoshi_mata_lotus],
  ];

  test.each(cases)('%s resolves to its deity sketch', (ruleId, image) => {
    const rule = getRuleById(ruleId);
    expect(rule).toBeTruthy();
    expect(getObservanceBackground(rule!)).toBe(image);
  });

  test('observances without dedicated deity art fall back to null', () => {
    expect(getObservanceBackground({ deityEn: 'Lord Shiva' })).toBeNull();
    expect(getObservanceBackground({ deityEn: 'Shri Ganesh' })).toBeNull();
  });
});
