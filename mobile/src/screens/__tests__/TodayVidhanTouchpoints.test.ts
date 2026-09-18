/**
 * आज का विधान — where the briefing is reachable from (design.md §71, TRD-42).
 *
 * The briefing shipped with exactly one standing door: a DISCOVER `FeatureCard`
 * on Home. Retiring the carousel took that door with it, and nothing failed —
 * PRD-41's newest surface would have quietly become two taps deep with no test
 * noticing. This suite is that missing test, written the same way
 * `PitruSmaranTouchpoints` is: source-level, so it survives a refactor of how
 * the screen renders.
 *
 * The surviving door is the Search empty state, which is the right place on the
 * merits — जिज्ञासा *is* the search box (§71), and the ⌕ FAB stays on Home. It
 * is one tap further than before, and that is the recorded cost.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

const src = (...p: string[]) => fs.readFileSync(path.resolve(__dirname, '..', '..', ...p), 'utf8');

describe('आज का विधान discovery', () => {
  test('the Search empty state carries the briefing door', () => {
    const search = src('screens', 'SearchScreen.tsx');
    expect(search).toMatch(/onTodayVidhan={\(\) => navigation\.navigate\('TodayVidhan'\)}/);
  });

  test('the ⌕ button that reaches it is still on Home', () => {
    // The door is only two taps deep if the first tap exists. Home keeps the
    // FAB deliberately: pushing the library one screen away (§74) makes search
    // more important, not less.
    const home = src('screens', 'HomeScreen.tsx');
    expect(home).toMatch(/<SearchFloatingButton onPress={\(\) => navigation\.navigate\('Search'\)} \/>/);
  });

  test('the briefing route is still registered on the Home stack', () => {
    // It is pushed, not a tab — losing the registration would turn both doors
    // into a runtime navigation warning rather than a crash.
    const nav = src('navigation', 'HomeStackNavigator.tsx');
    expect(nav).toMatch(/<Stack\.Screen name="TodayVidhan"/);
  });
});
