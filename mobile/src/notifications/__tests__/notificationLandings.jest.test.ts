/**
 * EVERY notification family lands on a real page — the whole table at once.
 *
 * `deepLink.jest.test.tsx` pins each family's target shape. This suite asks the
 * question that one cannot: **is the screen a target names actually registered
 * on the stack it is aimed at?** A target naming a screen its tab does not host
 * type-checks fine, resolves fine, and is only wrong at the moment a user taps
 * a notification — which is exactly when nobody is watching.
 *
 * It also pins the two things the Sept 2026 nav restructure put at risk:
 *  - `AudioTab` and `MoreTab` lost their bar BUTTONS but kept their routes;
 *    three families deep-link into the More stack and must still arrive.
 *  - `PanchangTab` targets now sit over a shared screen with a `section`, so
 *    what mounts UNDERNEATH a pushed detail is a deliberate choice per family.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

// Hoisted above the import below by babel-jest, so deepLink sees the stubs.
// Same reasons as `deepLink.jest.test.tsx`: expo-notifications is a type-only
// reference at runtime, and @react-navigation/native ships ESM the react-native
// Jest preset does not transform.
jest.mock('expo-notifications', () => ({}));
jest.mock('@react-navigation/native', () => ({
  CommonActions: {
    navigate: (options: { name: string }) => ({ type: 'NAVIGATE', payload: options }),
  },
  createNavigationContainerRef: () => ({
    isReady: () => false,
    dispatch: (_action: unknown) => {},
  }),
}));

import { resolveNotificationTarget } from '../deepLink';
import type { StartTarget } from '@/navigation/startTarget';

const navSrc = (file: string) =>
  fs.readFileSync(path.resolve(__dirname, '..', '..', 'navigation', file), 'utf8');

/** Route names a stack registers, read off its `<Stack.Screen name="…">` list. */
function registeredScreens(file: string): Set<string> {
  const source = navSrc(file);
  return new Set([...source.matchAll(/name="([A-Za-z]+)"/g)].map((m) => m[1]));
}

const STACK_FILE_BY_TAB: Record<string, string> = {
  HomeTab: 'HomeStackNavigator.tsx',
  PanchangTab: 'PanchangStackNavigator.tsx',
  MoreTab: 'MoreStackNavigator.tsx',
  AudioTab: 'AudioStackNavigator.tsx',
};

const dateMs = new Date(2026, 7, 17).getTime();

/**
 * One row per notification family the schedulers actually send. `type` values
 * are cross-checked against the schedulers below, so a new family cannot be
 * added without appearing here.
 */
const FAMILIES: {
  family: string;
  payload: Record<string, unknown>;
  tab: keyof typeof STACK_FILE_BY_TAB;
  screen: string;
  /** The section the shared Panchang screen mounts on, where it applies. */
  section?: 'panchang' | 'vrat' | 'jyotish';
  /** Why this is the right page. */
  why: string;
}[] = [
  {
    family: 'daily-verse',
    payload: { type: 'daily-verse', sourceId: 'bhagavad-gita', chapter: 1, verseIndex: 0 },
    tab: 'DailyBhaktiTab' as never,
    screen: '',
    why: 'the tab IS the verse — no nested screen',
  },
  {
    family: 'vrat-reminder',
    payload: { type: 'vrat-reminder', ruleId: 'nirjala-ekadashi' },
    tab: 'PanchangTab',
    screen: 'ObservanceDetail',
    section: 'vrat',
    why: 'the observance it was armed for, over a व्रत root so back lands there',
  },
  {
    family: 'muhurat-reminder',
    payload: { type: 'muhurat-reminder', occasionId: 'vahan', dateMs },
    tab: 'PanchangTab',
    screen: 'MuhuratDayDetail',
    section: 'panchang',
    why: 'the followed day’s windows, over the calendar its door lives on',
  },
  {
    family: 'festive-reminder',
    payload: { type: 'festive-reminder', ruleId: 'diwali' },
    tab: 'HomeTab',
    screen: 'Home',
    why: 'Home recomputes today, so a notice armed months ago cannot strand the user',
  },
  {
    family: 'sadhana-reminder',
    payload: { type: 'sadhana-reminder', programId: 'p1' },
    tab: 'HomeTab',
    screen: 'RoutineToday',
    why: 'all of today’s practice lives there',
  },
  {
    family: 'routine-reminder',
    payload: { type: 'routine-reminder', routineId: 'r1', dateKey: '2026-09-03' },
    tab: 'HomeTab',
    screen: 'RoutineToday',
    why: 'same surface as sadhana — one place for the day’s practice',
  },
  {
    family: 'pitru-smaran-reminder',
    payload: { type: 'pitru-smaran-reminder', entryId: 'e1' },
    tab: 'MoreTab',
    screen: 'PitruSmaranDetail',
    why: 'the private remembrance entry; More stack still reachable without a bar button',
  },
  {
    family: 'janma-tithi-reminder',
    payload: { type: 'janma-tithi-reminder', personId: 'p9' },
    tab: 'MoreTab',
    screen: 'JanmaTithiDetail',
    why: 'that person’s tithi + the day’s practice',
  },
  {
    family: 'pitru-paksha-reminder',
    payload: { type: 'pitru-paksha-reminder', year: 2026 },
    tab: 'MoreTab',
    screen: 'PitruPakshaOverview',
    why: 'the public fortnight overview',
  },
  {
    family: 'japam-alarm',
    payload: { type: 'japam-alarm', alarmId: 'a1', mantraId: 'om-namah-shivaya' },
    tab: 'HomeTab',
    screen: 'JapamCounter',
    why: 'straight into chanting, mantra preselected and loop started',
  },
];

describe('every notification family lands on a registered screen', () => {
  test.each(FAMILIES)('$family → $tab/$screen ($why)', ({ payload, tab, screen, section }) => {
    const target = resolveNotificationTarget(payload) as StartTarget | null;
    expect(target).not.toBeNull();
    expect(target!.tab).toBe(tab);

    if (screen === '') {
      // The tab itself is the destination; there is no nested screen to check.
      expect(target!.screen).toBeUndefined();
    } else {
      expect(target!.screen).toBe(screen);
      // The assertion that matters: the stack this tab hosts really registers
      // that route. A target naming an unregistered screen is a dead tap.
      expect([...registeredScreens(STACK_FILE_BY_TAB[tab])]).toContain(screen);
    }

    expect(target!.section).toBe(section);
  });

  test('the table covers every type the schedulers send', () => {
    // Guards against a new family shipping with no landing pinned here.
    const schedulerDir = path.resolve(__dirname, '..');
    const sent = new Set<string>();
    for (const file of fs.readdirSync(schedulerDir)) {
      if (!file.endsWith('.ts')) continue;
      const source = fs.readFileSync(path.join(schedulerDir, file), 'utf8');
      for (const match of source.matchAll(/type: '([a-z-]+)'/g)) sent.add(match[1]);
    }

    expect([...sent].sort()).toEqual([...FAMILIES.map((f) => f.family)].sort());
  });

  test('every PanchangTab family names its section explicitly', () => {
    // A section is a deliberate per-family choice, never left to whatever the
    // store happens to hold: a pushed detail over an unnamed root means back
    // can land on a section carrying no door back into the thing you came from.
    // So each Panchang family states its own, and no other tab has one.
    const panchang = FAMILIES.filter((f) => f.tab === 'PanchangTab');
    expect(panchang.length).toBeGreaterThan(0);
    for (const f of panchang) expect(f.section).toBeDefined();

    expect(
      FAMILIES.filter((f) => f.tab !== 'PanchangTab' && f.section != null).map((f) => f.family)
    ).toEqual([]);

    // And they do not all collapse to one section — vrat goes to व्रत, muhurat
    // to the calendar.
    expect(new Set(panchang.map((f) => f.section)).size).toBeGreaterThan(1);
  });
});

describe('the buttonless tabs still receive their notifications', () => {
  test('MoreTab kept its route after अन्य left the bar', () => {
    const tabNav = navSrc('TabNavigator.tsx');
    // Three families deep-link here. `tabBarButton: () => null` removes the
    // button, NOT the route — unregistering it would break all three.
    expect(tabNav).toContain('name="MoreTab"');
    expect(tabNav).toContain('name="AudioTab"');
    expect(tabNav).toMatch(/tabBarButton: \(\) => null/);

    const moreFamilies = FAMILIES.filter((f) => f.tab === 'MoreTab');
    expect(moreFamilies.length).toBeGreaterThanOrEqual(3);
  });

  test('a cold start into a buttonless tab seeds its stack root beneath the target', () => {
    // Otherwise back from the deep-linked detail has nothing to pop and the
    // hub stays unreachable for the session (RULEBOOK §6.0).
    const startTarget = navSrc('startTarget.ts');
    expect(startTarget).toContain("MoreTab: 'MoreHome'");
    expect(startTarget).toContain("PanchangTab: 'PanchangHome'");
    expect(startTarget).toContain("HomeTab: 'Home'");
  });
});
