/**
 * THE SYNC RULE — the core contract of the bottom-nav restructure.
 *
 * पंचांग, व्रत and ज्योतिष are three buttons over ONE screen. The active section
 * is the single source of truth and the bottom-nav highlight mirrors it. A bar
 * reading पंचांग while vrat content is on screen is the nav reporting the wrong
 * location, which is the specific failure this whole mechanism prevents — so it
 * is pinned here, at both levels:
 *
 *  1. the store: what each of the four entry points does, and what gets logged;
 *  2. `AppTabBar`: that the highlight is derived from the SECTION rather than
 *     from which button was pressed.
 */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { GitaLanguageProvider } from '@/data/gita/language';

const initialMetrics = {
  frame: { x: 0, y: 0, width: 360, height: 780 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

// react-native-svg is native; the moon and star icons are SVG paths.
jest.mock('react-native-svg', () => {
  const ReactLib = require('react');
  const { View } = require('react-native');
  const mk = () => (props: Record<string, unknown>) =>
    ReactLib.createElement(View, props, props.children as React.ReactNode);
  const Svg = mk();
  return { __esModule: true, default: Svg, Svg, Path: mk(), Circle: mk(), Ellipse: mk(), Line: mk(), G: mk() };
});

// @react-navigation ships untranspiled ESM that Jest cannot parse. The bar uses
// exactly one function from it.
jest.mock('@react-navigation/native', () => ({
  getFocusedRouteNameFromRoute: () => undefined,
}));

import AppTabBar from '../AppTabBar';
import {
  __resetPanchangSectionStoreForTests,
  getPanchangSectionSnapshot,
  requestPanchangScrollToTop,
  setPanchangSection,
  subscribePanchangSection,
} from '../panchangSectionStore';
import { applyStartTargetSection } from '../startTarget';
import {
  __resetAnalyticsStoreForTests,
  getEventsSnapshot,
  logSharedScreenView,
} from '@/analytics/analyticsStore';
import { countByEntryPoint } from '@/analytics/events';

beforeEach(() => {
  __resetPanchangSectionStoreForTests();
  __resetAnalyticsStoreForTests();
});

describe('the section store', () => {
  it('starts on पंचांग — a cold start never restores a section', () => {
    // Module state resets with the process, which IS the "reset on cold start"
    // requirement. If this ever becomes persisted, that requirement is broken.
    expect(getPanchangSectionSnapshot().section).toBe('panchang');
  });

  it('notifies subscribers so the bar and the screen move together', () => {
    const seen: string[] = [];
    const unsubscribe = subscribePanchangSection((s) => seen.push(s.section));

    setPanchangSection('vrat', 'segment_swipe');
    setPanchangSection('jyotish', 'tab');
    unsubscribe();
    setPanchangSection('panchang', 'tab');

    expect(seen).toEqual(['vrat', 'jyotish']);
    // The store itself still moved; only this listener stopped hearing about it.
    expect(getPanchangSectionSnapshot().section).toBe('panchang');
  });

  it('logs exactly one view per entry, attributed to the right source', () => {
    setPanchangSection('vrat', 'tab');
    setPanchangSection('jyotish', 'segment_swipe');
    setPanchangSection('panchang', 'notification');
    setPanchangSection('vrat', 'deeplink');

    expect(getEventsSnapshot().map((e) => [e.section, e.entry_point])).toEqual([
      ['vrat', 'tab'],
      ['jyotish', 'segment_swipe'],
      ['panchang', 'notification'],
      ['vrat', 'deeplink'],
    ]);
  });

  it('treats re-tapping the active TAB as scroll-to-top, not a new view', () => {
    setPanchangSection('vrat', 'tab');
    const afterFirst = getPanchangSectionSnapshot().scrollToTopNonce;
    expect(getEventsSnapshot()).toHaveLength(1);

    setPanchangSection('vrat', 'tab');

    // The nonce moved (the screen scrolls to top)…
    expect(getPanchangSectionSnapshot().scrollToTopNonce).toBe(afterFirst + 1);
    // …but no second view was logged. Counting taps that navigated nowhere as
    // `tab` views would inflate exactly the number §5 compares against swipes.
    expect(getEventsSnapshot()).toHaveLength(1);
    expect(getPanchangSectionSnapshot().section).toBe('vrat');
  });

  it('still logs a re-selection that came from the SEGMENT, not a tab', () => {
    // Only a tab re-tap is a no-op. A segment tap is always a deliberate view.
    setPanchangSection('vrat', 'segment_swipe');
    setPanchangSection('vrat', 'segment_swipe');
    expect(getEventsSnapshot()).toHaveLength(2);
  });

  it('bumps scroll-to-top without touching the section', () => {
    setPanchangSection('jyotish', 'tab');
    const before = getPanchangSectionSnapshot();
    requestPanchangScrollToTop();
    const after = getPanchangSectionSnapshot();

    expect(after.section).toBe('jyotish');
    expect(after.scrollToTopNonce).toBe(before.scrollToTopNonce + 1);
    expect(getEventsSnapshot()).toHaveLength(1);
  });
});

describe('deep-link and notification entry', () => {
  it('a vrat reminder lands on व्रत, attributed to the notification', () => {
    // The reminder still opens the observance itself; `section` is the layer
    // underneath, so backing out lands on व्रत.
    applyStartTargetSection(
      { tab: 'PanchangTab', screen: 'ObservanceDetail', params: { ruleId: 'x' }, section: 'vrat' },
      'notification'
    );

    expect(getPanchangSectionSnapshot().section).toBe('vrat');
    expect(getEventsSnapshot()).toEqual([
      expect.objectContaining({ section: 'vrat', entry_point: 'notification' }),
    ]);
  });

  it('leaves the section alone for a target that does not name one', () => {
    applyStartTargetSection({ tab: 'HomeTab', screen: 'Home' }, 'notification');
    expect(getPanchangSectionSnapshot().section).toBe('panchang');
    expect(getEventsSnapshot()).toHaveLength(0);
  });

  it('keeps notification and deeplink distinguishable in the log', () => {
    // The whole point of separating them: a month from now, "did the व्रत TAB
    // earn its slot" must not be answerable only as "something opened व्रत".
    const target = { tab: 'PanchangTab' as const, section: 'vrat' as const };
    applyStartTargetSection(target, 'notification');
    __resetPanchangSectionStoreForTests();
    applyStartTargetSection(target, 'deeplink');
    logSharedScreenView('vrat', 'tab');

    expect(countByEntryPoint(getEventsSnapshot(), 'vrat')).toEqual({
      tab: 1,
      segment_swipe: 0,
      notification: 1,
      deeplink: 1,
    });
  });
});

// ── AppTabBar ──────────────────────────────────────────────────────────────

type Press = { name: string; params?: unknown };

/**
 * Every rendered tree is unmounted in `afterEach`. The highlight runs an
 * `Animated.timing`, and an animation frame that outlives its suite fires after
 * teardown — which in this repo turns into "Cannot log after tests are done"
 * at best and a hard `_bezier is not a function` process crash at worst (see
 * the VirtualizedList note in wiki/overview.md; same class of bug).
 */
const mounted: TestRenderer.ReactTestRenderer[] = [];

afterEach(() => {
  act(() => {
    while (mounted.length > 0) mounted.pop()?.unmount();
  });
});

function renderBar(focusedTab: string) {
  const presses: Press[] = [];
  const navigation = {
    navigate: (name: string, params?: unknown) => presses.push({ name, params }),
  };
  const state = { index: 0, routes: [{ key: `${focusedTab}-1`, name: focusedTab }] };

  let tree: TestRenderer.ReactTestRenderer | undefined;
  act(() => {
    tree = TestRenderer.create(
      <SafeAreaProvider initialMetrics={initialMetrics}>
        <GitaLanguageProvider>
          <AppTabBar state={state as any} navigation={navigation as any} descriptors={{} as any} insets={initialMetrics.insets} />
        </GitaLanguageProvider>
      </SafeAreaProvider>
    );
  });
  if (!tree) throw new Error('tab bar did not render');
  mounted.push(tree);
  return { root: tree.root, presses };
}

/**
 * The tab buttons, one entry each. `findAllByProps` matches the composite
 * `Pressable` AND the host `View` it renders, so a raw query returns every
 * button twice — dedupe by testID, keeping bar order.
 */
function tabNodes(root: TestRenderer.ReactTestInstance): TestRenderer.ReactTestInstance[] {
  const byID = new Map<string, TestRenderer.ReactTestInstance>();
  for (const node of root.findAllByProps({ accessibilityRole: 'tab' })) {
    const id = node.props.testID as string | undefined;
    if (id && !byID.has(id)) byID.set(id, node);
  }
  return [...byID.values()];
}

function button(root: TestRenderer.ReactTestInstance, testID: string) {
  const found = tabNodes(root).find((node) => node.props.testID === testID);
  if (!found) throw new Error(`no tab button ${testID}`);
  return found;
}

function selectedTestID(root: TestRenderer.ReactTestInstance): string | undefined {
  return tabNodes(root).find((node) => node.props.accessibilityState?.selected)?.props.testID;
}

describe('AppTabBar', () => {
  it('shows exactly five buttons: होम · भक्ति · पंचांग · व्रत · ज्योतिष', () => {
    const { root } = renderBar('HomeTab');
    const ids = tabNodes(root).map((n) => n.props.testID);

    expect(ids).toEqual(['tab-home', 'tab-bhakti', 'tab-panchang', 'tab-vrat', 'tab-jyotish']);
    // भजन and अन्य are gone FROM THE BAR (भजन is a segment inside भक्ति, अन्य is
    // the header icon). Their routes still exist; their buttons must not.
    expect(ids).not.toContain('tab-bhajan');
    expect(ids).not.toContain('tab-more');
  });

  it('highlights the tab whose route is focused, outside PanchangTab', () => {
    expect(selectedTestID(renderBar('HomeTab').root)).toBe('tab-home');
    expect(selectedTestID(renderBar('DailyBhaktiTab').root)).toBe('tab-bhakti');
  });

  it('MIRRORS the section on PanchangTab — the sync rule', () => {
    // This is the assertion the whole restructure turns on: with PanchangTab
    // focused, the highlight follows the SECTION, so a segment tap inside the
    // screen moves it. If this ever reads the pressed button instead, the bar
    // reports पंचांग over vrat content.
    setPanchangSection('vrat', 'segment_swipe');
    expect(selectedTestID(renderBar('PanchangTab').root)).toBe('tab-vrat');

    setPanchangSection('jyotish', 'segment_swipe');
    expect(selectedTestID(renderBar('PanchangTab').root)).toBe('tab-jyotish');

    setPanchangSection('panchang', 'segment_swipe');
    expect(selectedTestID(renderBar('PanchangTab').root)).toBe('tab-panchang');
  });

  it('moves the highlight live when the section changes under a mounted bar', () => {
    const { root } = renderBar('PanchangTab');
    expect(selectedTestID(root)).toBe('tab-panchang');

    act(() => {
      setPanchangSection('vrat', 'segment_swipe');
    });

    expect(selectedTestID(root)).toBe('tab-vrat');
  });

  it('routes all three section tabs to the ONE shared screen', () => {
    // Three entry points, one route and one mounted screen — not three copies
    // of PanchangScreen with three selected dates.
    for (const [testID, section] of [
      ['tab-panchang', 'panchang'],
      ['tab-vrat', 'vrat'],
      ['tab-jyotish', 'jyotish'],
    ] as const) {
      __resetPanchangSectionStoreForTests();
      const { root, presses } = renderBar('HomeTab');
      act(() => {
        button(root, testID).props.onPress();
      });

      expect(presses).toEqual([
        {
          name: 'PanchangTab',
          params: { screen: 'PanchangHome', params: { section }, initial: false },
        },
      ]);
      expect(getPanchangSectionSnapshot().section).toBe(section);
    }
  });

  it('attributes a bar press as entry_point "tab"', () => {
    const { root } = renderBar('HomeTab');
    act(() => {
      button(root, 'tab-vrat').props.onPress();
    });

    expect(getEventsSnapshot()).toEqual([
      expect.objectContaining({ section: 'vrat', entry_point: 'tab' }),
    ]);
  });

  it('navigates plain tabs without touching the section', () => {
    setPanchangSection('jyotish', 'segment_swipe');
    const { root, presses } = renderBar('PanchangTab');
    act(() => {
      button(root, 'tab-home').props.onPress();
    });

    expect(presses).toEqual([{ name: 'HomeTab', params: undefined }]);
    // Leaving the tab must not reset the section — coming back should return to
    // ज्योतिष, not silently to पंचांग.
    expect(getPanchangSectionSnapshot().section).toBe('jyotish');
  });

  it('gives every Devanagari label room for its matras', () => {
    // भक्ति and ज्योतिष carry matras above AND below the baseline; at the default
    // line-height for 10 pt they clip top and bottom (handover §4).
    const { root } = renderBar('HomeTab');
    const labels = tabNodes(root)
      .map((tab) => tab.findAllByProps({ numberOfLines: 1 })[0])
      .filter(Boolean);

    expect(labels.length).toBeGreaterThan(0);
    for (const label of labels) {
      const style = Object.assign({}, ...[label.props.style].flat(Infinity).filter(Boolean));
      expect(style.lineHeight).toBeGreaterThanOrEqual(14);
      expect(label.props.numberOfLines).toBe(1);
    }
  });
});
