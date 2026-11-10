import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * The JapaMala counter keeps the bottom tab bar (Nov 2026 regression guard).
 *
 * Briefly it joined `IMMERSIVE_ROUTES` to win ~60 dp. On device that hid the bar
 * the instant the route was pushed: its band went blank cream before the counter
 * slid in (and again on Back until the bar returned), and the counter laid out
 * once with the bar's space, then jumped ~50 pt down mid-animation. Vertical room
 * on the counter must come from its own controls, not from hiding navigation.
 *
 * The two halves move together: with the bar visible the screen must NOT also
 * own the bottom safe-area inset, or the inset doubles under the audio row.
 * A source scan, like tabTargets.test.ts: the contract is two literals.
 */
const SRC = path.resolve(__dirname, '..', '..');
const read = (rel: string) => fs.readFileSync(path.join(SRC, rel), 'utf8');

test('JapamCounter keeps the tab bar and leaves the bottom inset to it', () => {
  const nav = read('navigation/TabNavigator.tsx');
  const routes = nav.match(/const IMMERSIVE_ROUTES = \[([^\]]*)\]/)?.[1];
  expect(routes).toBeDefined();
  expect(routes).not.toContain("'JapamCounter'");

  const screen = read('screens/JapamCounterScreen.tsx');
  const outer = screen.match(/<SafeAreaView style=\{styles\.safe\} edges=\{\[([^\]]*)\]\}/)?.[1] ?? '';
  const edges = outer.split(',').map((s) => s.trim().replace(/'/g, ''));
  expect(edges).toEqual(expect.arrayContaining(['top', 'left', 'right']));
  expect(edges).not.toContain('bottom');
});
