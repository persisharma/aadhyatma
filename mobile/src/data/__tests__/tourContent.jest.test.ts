import { APP_TOUR_VERSION, getWhatsNewForVersion, whatsNew } from '@/data/tour/whatsNew';
import { tourSteps } from '@/data/tour/steps';
import appJson from '../../../app.json';

// Tab names the tour is allowed to navigate to (mirrors TabParamList).
const VALID_TABS = new Set(['HomeTab', 'DailyBhaktiTab', 'PanchangTab', 'AudioTab', 'MoreTab']);

describe('getWhatsNewForVersion', () => {
  test('returns the entry for a known non-empty version', () => {
    const entry = getWhatsNewForVersion(APP_TOUR_VERSION);
    expect(entry).not.toBeNull();
    expect(entry?.version).toBe(APP_TOUR_VERSION);
    expect(entry?.items.length).toBeGreaterThan(0);
  });

  test('returns null for an unknown version', () => {
    expect(getWhatsNewForVersion('0.0.0-does-not-exist')).toBeNull();
  });

  test('APP_TOUR_VERSION has a defined what\'s-new entry', () => {
    // Guard against bumping the version without adding release notes.
    expect(whatsNew[APP_TOUR_VERSION]).toBeDefined();
  });

  test('APP_TOUR_VERSION is kept in sync with app.json expo.version', () => {
    // If these drift, What's New keys off a version with no entry and silently
    // never fires. Bump both together (RULEBOOK §6.1).
    expect(APP_TOUR_VERSION).toBe(appJson.expo.version);
  });

  test('every what\'s-new item carries all bilingual fields', () => {
    Object.values(whatsNew).forEach((entry) => {
      entry.items.forEach((item) => {
        expect(item.titleHi.length).toBeGreaterThan(0);
        expect(item.titleEn.length).toBeGreaterThan(0);
        expect(item.bodyHi.length).toBeGreaterThan(0);
        expect(item.bodyEn.length).toBeGreaterThan(0);
      });
    });
  });
});

describe('tourSteps content contract', () => {
  test('every step targets a real tab', () => {
    tourSteps.forEach((s) => {
      expect(VALID_TABS.has(s.navigateTo.name)).toBe(true);
    });
  });

  test('every step is fully bilingual (hi + en title and body)', () => {
    tourSteps.forEach((s) => {
      expect(s.titleHi.length).toBeGreaterThan(0);
      expect(s.titleEn.length).toBeGreaterThan(0);
      expect(s.bodyHi.length).toBeGreaterThan(0);
      expect(s.bodyEn.length).toBeGreaterThan(0);
    });
  });

  test('step ids are unique', () => {
    const ids = tourSteps.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('anchor and pointer values are within the allowed set', () => {
    tourSteps.forEach((s) => {
      expect(['top', 'center', 'bottom']).toContain(s.anchor);
      expect(['up', 'down', 'none']).toContain(s.pointer);
    });
  });
});
