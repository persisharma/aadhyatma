import fs from 'node:fs';
import path from 'node:path';

/**
 * Every stack loads its screens on demand and enrols them in the background
 * warm-up (`lazyScreen` / `prefetchedRoute`). A screen registered with a plain
 * `import XScreen from '@/screens/XScreen'` breaks that twice over, silently:
 * it goes back on the launch path (every cold start evaluates it), and it is
 * never enrolled, so nothing warms it. One screen is only ~20-40 KB, under the
 * launch-graph budget's headroom, so the budget alone would not notice.
 *
 * The one static screen import each stack may keep is its ROOT — the screen
 * that is the first frame of that stack, where deferring it would just trade a
 * launch cost for a launch spinner.
 *
 * Registering a new screen: `const XScreen = lazyScreen('X', <depth>, () =>
 * import('@/screens/XScreen'));` at module scope, then `component={XScreen}`.
 */
const STACK_ROOTS: Record<string, string> = {
  HomeStackNavigator: 'HomeScreen',
  MoreStackNavigator: 'MoreScreen',
  PanchangStackNavigator: 'PanchangScreen',
};

describe.each(Object.entries(STACK_ROOTS))('%s', (navigator, root) => {
  const src = fs.readFileSync(path.resolve(__dirname, '..', `${navigator}.tsx`), 'utf8');

  it(`imports no screen statically except its root, ${root}`, () => {
    const eager = [...src.matchAll(/^import\s+(\w+)\s+from\s+'@\/screens\/[\w/]+';/gm)]
      .map((m) => m[1])
      .filter((name) => name !== root);
    expect(eager).toEqual([]);
  });

  it('enrols every lazy screen at module scope, never inside the render body', () => {
    const body = src.slice(src.indexOf('export default function'));
    expect(body).not.toMatch(/\blazyScreen\(|\bprefetchedRoute\(/);
  });
});
