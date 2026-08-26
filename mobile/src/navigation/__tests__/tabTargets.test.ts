import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Cross-tab hand-offs must never make the target the destination stack's
 * INITIAL route.
 *
 * The bottom tab navigator is lazy (see `TabNavigator.tsx`), so a tab that has
 * not been opened yet mounts on its first `navigate`. React Navigation's nested
 * `navigate` defaults to `initial: true`, which makes the named screen that
 * stack's initial route instead of pushing it above the stack's own
 * `initialRouteName`. The consequences are the same every time: the target's
 * back button has nothing to pop, and the stack's real root — the Panchang
 * calendar, or the whole More hub — stays unreachable for the rest of the
 * session.
 *
 * `panchangTabTarget` / `moreTabTarget` exist so no caller has to remember
 * this. The Home DISCOVER widgets spotlight hand-rolled
 * `{ screen: 'WidgetGallery' }` and shipped exactly that bug; this test is the
 * guard that would have caught it.
 *
 * A source scan rather than a mounted navigator: the failure is a *missing*
 * property at a call site, which reads directly off the source and would need
 * one lazily-mounted-tab integration test per call site to catch otherwise.
 */

const SRC = path.resolve(__dirname, '..', '..');

function sourceFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '__tests__' || entry.name === 'node_modules') continue;
      sourceFiles(full, acc);
    } else if (/\.tsx?$/.test(entry.name)) {
      acc.push(full);
    }
  }
  return acc;
}

/**
 * A nested-tab navigate written as an inline object literal — i.e. NOT built by
 * a `*TabTarget` helper. Matches `navigate('SomeTab', { … })` and captures the
 * literal so the assertion can look for `initial: false` inside it. A helper
 * call (`navigate('MoreTab', moreTabTarget('X'))`) does not match, because the
 * second argument is not a `{`.
 */
const INLINE_TAB_NAVIGATE = /navigate\(\s*'(\w+Tab)'\s*,\s*(\{[\s\S]{0,400}?\})\s*\)/g;

/**
 * `HomeTab` is the tab navigator's FIRST `Tab.Screen`, so it is its initial
 * route and is mounted from launch — a nested navigate into it always pushes
 * onto an already-mounted stack, and `initial` is moot. Every other tab mounts
 * lazily on first navigate and is therefore displaceable. The exemption is
 * asserted below rather than assumed, so reordering the tab bar fails here
 * instead of silently arming the bug across six call sites.
 */
const EAGER_TAB = 'HomeTab';

describe('cross-tab navigation targets', () => {
  test('HomeTab is the eagerly-mounted first tab (what exempts it below)', () => {
    const tabNav = fs.readFileSync(path.join(SRC, 'navigation', 'TabNavigator.tsx'), 'utf8');
    const order = [...tabNav.matchAll(/name="(\w+Tab)"/g)].map((m) => m[1]);
    expect(order[0]).toBe(EAGER_TAB);
  });

  test('every inline nested navigate into a LAZY tab sets initial: false', () => {
    const offenders: string[] = [];

    for (const file of sourceFiles(SRC)) {
      const source = fs.readFileSync(file, 'utf8');
      for (const match of source.matchAll(INLINE_TAB_NAVIGATE)) {
        const [, tab, literal] = match;
        if (tab === EAGER_TAB) continue;
        // A bare tab switch (`navigate('DailyBhaktiTab')`) names no screen and
        // cannot displace an initial route — only nested targets can.
        if (!/\bscreen\s*:/.test(literal)) continue;
        if (/\binitial\s*:\s*false\b/.test(literal)) continue;
        const line = source.slice(0, match.index).split('\n').length;
        offenders.push(`${path.relative(SRC, file)}:${line} → ${tab} ${literal.replace(/\s+/g, ' ')}`);
      }
    }

    expect(offenders).toEqual([]);
  });

  test('the helpers themselves pin initial: false', () => {
    const entryRoutes = fs.readFileSync(path.join(SRC, 'navigation', 'entryRoutes.ts'), 'utf8');
    for (const helper of ['panchangTabTarget', 'moreTabTarget']) {
      expect(entryRoutes).toContain(`export function ${helper}<`);
    }
    // Both helpers hard-code initial: false in their return — one shape, twice.
    expect(entryRoutes.match(/initial: false \};/g)).toHaveLength(2);
  });

  test('the Home widgets spotlight routes through moreTabTarget', () => {
    // The regression that motivated this file: a cold tap on the DISCOVER
    // widgets card made WidgetGallery the More stack's initial route, stranding
    // the user with a dead back button and no route to the hub.
    const home = fs.readFileSync(path.join(SRC, 'screens', 'HomeScreen.tsx'), 'utf8');
    expect(home).toContain("rootNav.navigate('MoreTab', moreTabTarget('WidgetGallery'))");
  });
});
