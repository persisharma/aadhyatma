import { APP_TOUR_VERSION, getWhatsNewForVersion, whatsNew } from '@/data/tour/whatsNew';
import { tourSteps, TAB_ORDER } from '@/data/tour/steps';
import appJson from '../../../app.json';

// Tab names the tour is allowed to navigate to (mirrors TabParamList).
const VALID_TABS = new Set(['HomeTab', 'DailyBhaktiTab', 'PanchangTab', 'AudioTab', 'MoreTab']);

// Spotlight target ids a step may ring (mirrors TourTargetId). A step without a
// targetId rings its destination tab instead (design.md §47).
const VALID_TARGET_IDS = new Set([
  'routineCard',
  'categoriesGrid',
  'japaTile',
  'japamInside',
  'theerthTile',
  'theerthInside',
  'dailyVerse',
  'shareButton',
  'muhuratCard',
  'panchangSegment',
  'vratList',
  'vratFollow',
  'myVrat',
  'bhajanInside',
  'reminderToggle',
  'reminderTimes',
  'japamAdd',
  'languageRow',
  'readingSizeRow',
]);

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

  test('anchor and pointer values are within the allowed set (fallback placement)', () => {
    tourSteps.forEach((s) => {
      expect(['top', 'center', 'bottom']).toContain(s.anchor);
      expect(['up', 'down', 'none']).toContain(s.pointer);
    });
  });

  test('every step targetId (when present) is a known spotlight target', () => {
    tourSteps.forEach((s) => {
      if (s.targetId !== undefined) expect(VALID_TARGET_IDS.has(s.targetId)).toBe(true);
    });
  });

  test('the walkthrough ends on the Language and Reading Size rows', () => {
    // The post-tour setup sheet (§47) asks the user to pick exactly these two,
    // so the last two steps must be the ones that show where they live.
    const tail = tourSteps.slice(-2).map((s) => s.id);
    expect(tail).toEqual(['language-row', 'reading-size-row']);
    expect(tourSteps.at(-2)?.targetId).toBe('languageRow');
    expect(tourSteps.at(-1)?.targetId).toBe('readingSizeRow');
  });

  test('TAB_ORDER covers every valid tab with a unique index and resolves each step', () => {
    // Ring-the-tab fallback needs a defined index for every step's destination.
    expect(new Set(Object.keys(TAB_ORDER))).toEqual(VALID_TABS);
    const indices = Object.values(TAB_ORDER);
    expect(new Set(indices).size).toBe(indices.length);
    tourSteps.forEach((s) => {
      expect(TAB_ORDER[s.navigateTo.name]).toBeGreaterThanOrEqual(0);
    });
  });
});
