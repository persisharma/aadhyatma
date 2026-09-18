/**
 * Home's structure after TRD-42. A source scan, because HomeScreen mounts a
 * fourteen-deep provider tree; these are contracts about what Home *is*, and
 * each line here is a thing that regressed or was argued about.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

const home = fs.readFileSync(path.resolve(__dirname, '..', 'HomeScreen.tsx'), 'utf8');

describe('Home structure', () => {
  test('the 16-tile CATEGORIES grid is gone', () => {
    expect(home).not.toMatch(/CATEGORIES/);
    expect(home).not.toMatch(/categories\.map|tiles\.map/);
  });

  test('the shuffled DISCOVER carousel is gone', () => {
    // Eight cards, reshuffled on every open, four with a permanent NEW badge.
    expect(home).not.toMatch(/DISCOVER/);
    expect(home).not.toMatch(/shuffleBySeed/);
    expect(home).not.toMatch(/spotlights/);
  });

  test('no hardcoded NEW badge survives on Home', () => {
    // कुंडली and मुहूर्त carried `hasNew: true` literals that could never clear.
    expect(home).not.toMatch(/hasNew: true/);
  });

  test('the Today strip and FOR TODAY row are untouched', () => {
    expect(home).toMatch(/<TodayStrip \/>/);
    expect(home).toMatch(/<TodayRecommendationsRow \/>/);
  });

  test('the daily verse is NOT on Home — it stays on the भक्ति tab', () => {
    expect(home).not.toMatch(/versePool|getRandomVerse|आज का श्लोक/);
  });

  test('the search FAB stays', () => {
    expect(home).toMatch(/SearchFloatingButton/);
  });

  test('the three new rows are mounted in order', () => {
    const order = ['<SadhanaRow', 'उपकरण', '<ToolsRow', 'activateTile(openLibrary)', '<NewFeaturesSection'];
    let cursor = -1;
    for (const marker of order) {
      const at = home.indexOf(marker);
      expect(at).toBeGreaterThan(-1);
      expect(at).toBeGreaterThan(cursor);
      cursor = at;
    }
  });

  test('the पाठ door counts come from the registries, at module scope', () => {
    // Not a render-time reduce: this is the screen every cold start lands on.
    expect(home).toMatch(/const LIBRARY_TEXT_COUNT = library\.filter/);
    expect(home).toMatch(/const DEITY_COUNT = deities\.length/);
    expect(home).toMatch(/const PURPOSE_COUNT = purposes\.length/);
  });
});
