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
import { aartiIdByIndex } from '@/data/aarti';
import {
  getCategoryBackground,
  getDeityBackground,
  getReaderBackground,
  getSourceBackground,
} from '@/data/backgrounds';
import { categories } from '@/data/categories';
import { deities } from '@/data/deities';
import { japamMantras } from '@/data/japam';
import { library } from '@/data/texts';

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
});
