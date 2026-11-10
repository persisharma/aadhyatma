import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * The JapaMala counter is an immersive route (Nov 2026: the tab bar's ~60 dp went
 * to the mantra and mala). The two halves must move together: with the bar hidden
 * the screen must own the bottom safe-area inset, or the audio row sits under the
 * home indicator; with the bar shown, owning it too would double the inset.
 * A source scan, like tabTargets.test.ts: the contract is two literals.
 */
const SRC = path.resolve(__dirname, '..', '..');
const read = (rel: string) => fs.readFileSync(path.join(SRC, rel), 'utf8');

test('JapamCounter hides the tab bar and owns the bottom inset', () => {
  const nav = read('navigation/TabNavigator.tsx');
  const routes = nav.match(/const IMMERSIVE_ROUTES = \[([^\]]*)\]/)?.[1] ?? '';
  expect(routes).toContain("'JapamCounter'");

  const screen = read('screens/JapamCounterScreen.tsx');
  const outer = screen.match(/<SafeAreaView style=\{styles\.safe\} edges=\{\[([^\]]*)\]\}/)?.[1] ?? '';
  expect(outer.split(',').map((s) => s.trim().replace(/'/g, ''))).toEqual(
    expect.arrayContaining(['top', 'left', 'right', 'bottom'])
  );
});
