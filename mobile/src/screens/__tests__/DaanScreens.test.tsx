/**
 * PRD-26 surface contracts (§2.7 RELAXED in the v3 redesign — educate is the
 * DEFAULT, not a hard gate):
 *  1. DaanPunyaScreen (the educate home) renders the mahatva-first sections and
 *     now carries two STANDING doors — a दान करें door (→ the journey) and a
 *     quiet दान-द्वार link (→ the directory) — plus the ungated खाता door. It
 *     still never transacts: no in-app give/pay control (daan-org-give/open).
 *  2. DaanJourneyScreen is a single skippable scroll: its terminal actions are
 *     always present (no step gating), and a skip jumps to the द्वार.
 *  3. दान-द्वार opens as a cause grid, then drills into one cause; the hand-off
 *     to an org's own site lives only on the detail, behind the interstitial.
 */
import React, * as mockReact from 'react';
import { ShareProvider } from '@/utils/shareVerse';
import TestRenderer, { act } from 'react-test-renderer';
import { View as mockView } from 'react-native';

import { GitaLanguageProvider } from '@/data/gita/language';

const mockNavigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
  replace: jest.fn(),
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    mockReact.createElement(mockView, props, children),
}));

// The home resolves today's occasion through the panchang engine; pin a
// deterministic "Makar Sankranti today" so the आज card renders in CI.
jest.mock('@/panchang/usePanchang', () => ({
  usePanchangCalendarSystem: () => ['purnimant', jest.fn()],
  useObservancesForDate: () => [
    { date: new Date(2026, 0, 14), rule: { id: 'makar-sankranti' } },
  ],
}));

import DaanPunyaScreen from '../DaanPunyaScreen';
import DaanJourneyScreen from '../DaanJourneyScreen';
import DaanDirectoryScreen from '../DaanDirectoryScreen';
import DaanDirectoryDetailScreen from '../DaanDirectoryDetailScreen';
import DaanKathaScreen from '../DaanKathaScreen';
import { getDaanKathas, getDaanOrg, getDaanOrgs, getDaanVaarEntry } from '@/data/daan';

const has = (tree: TestRenderer.ReactTestRenderer, testID: string) =>
  tree.root.findAllByProps({ testID }).length > 0;
const press = async (tree: TestRenderer.ReactTestRenderer, testID: string) => {
  const node = tree.root.findAllByProps({ testID })[0];
  await act(async () => node.props.onPress());
};

async function renderScreen(element: React.ReactElement) {
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(<GitaLanguageProvider><ShareProvider>{element}</ShareProvider></GitaLanguageProvider>);
  });
  return tree;
}

afterEach(() => {
  jest.clearAllMocks();
});

describe('DaanPunyaScreen — the educate-first home', () => {
  test('renders mahatva sections and the quiet ledger door', async () => {
    const navigation = { ...mockNavigation } as never;
    const tree = await renderScreen(<DaanPunyaScreen navigation={navigation} route={{ key: 'k', name: 'DaanPunya' } as never} />);
    for (const id of [
      'daan-today-card', 'daan-vaar-line', 'daan-principle-dana-sukta',
      'daan-principle-shraddhaya-deyam', 'daan-principle-sattvik-daan',
      'daan-katha-karna', 'daan-ledger-door',
    ]) {
      expect(has(tree, id)).toBe(true);
    }
    await act(async () => tree.unmount());
  });

  test('draft principles stay invisible (dasa-dana never renders)', async () => {
    const navigation = { ...mockNavigation } as never;
    const tree = await renderScreen(<DaanPunyaScreen navigation={navigation} route={{ key: 'k', name: 'DaanPunya' } as never} />);
    expect(has(tree, 'daan-principle-dasa-dana')).toBe(false);
    await act(async () => tree.unmount());
  });

  test('§2.7 relaxed: two standing doors, but the app still never transacts', async () => {
    const navigation = { ...mockNavigation } as never;
    const tree = await renderScreen(<DaanPunyaScreen navigation={navigation} route={{ key: 'k', name: 'DaanPunya' } as never} />);
    // The donate door opens the day's journey (occasion resolved by the mock);
    // the quiet दान-द्वार link opens the directory directly.
    expect(has(tree, 'daan-home-donate')).toBe(true);
    expect(has(tree, 'daan-home-dwaar')).toBe(true);
    await press(tree, 'daan-home-donate');
    expect(mockNavigation.navigate).toHaveBeenCalledWith('DaanJourney', { occasionId: 'makar-sankranti' });
    await press(tree, 'daan-home-dwaar');
    expect(mockNavigation.navigate).toHaveBeenCalledWith('DaanDirectory', {});
    // The ledger door stays, ungated. And there is still NO in-app give/pay
    // control anywhere on this screen — the hand-off lives on the detail only.
    expect(has(tree, 'daan-ledger-door')).toBe(true);
    await press(tree, 'daan-ledger-door');
    expect(mockNavigation.navigate).toHaveBeenCalledWith('DaanLedger');
    expect(has(tree, 'daan-org-give')).toBe(false);
    expect(has(tree, 'daan-org-open')).toBe(false);
    await act(async () => tree.unmount());
  });

  test('both standing doors live in the sticky action bar; the verse spine is a carousel', async () => {
    const navigation = { ...mockNavigation } as never;
    const tree = await renderScreen(<DaanPunyaScreen navigation={navigation} route={{ key: 'k', name: 'DaanPunya' } as never} />);
    const bar = tree.root.findAllByProps({ testID: 'daan-home-actions' })[0];
    expect(bar.findAllByProps({ testID: 'daan-home-dwaar' }).length).toBeGreaterThan(0);
    expect(bar.findAllByProps({ testID: 'daan-home-donate' }).length).toBeGreaterThan(0);
    // Every verified principle rides the carousel; the meaning unfolds in place.
    const carousel = tree.root.findAllByProps({ testID: 'daan-principle-carousel' })[0];
    expect(carousel.findAllByProps({ testID: 'daan-principle-dana-sukta' }).length).toBeGreaterThan(0);
    expect(has(tree, 'daan-principle-meaning-dana-sukta')).toBe(true);
    // The kathas are a horizontal shelf.
    const shelf = tree.root.findAllByProps({ testID: 'daan-katha-shelf' })[0];
    expect(shelf.findAllByProps({ testID: 'daan-katha-karna' }).length).toBeGreaterThan(0);
    await act(async () => tree.unmount());
  });
});

describe('DaanKathaScreen — the story never dead-ends', () => {
  const renderKatha = (kathaId: string) =>
    renderScreen(
      <DaanKathaScreen
        navigation={{ ...mockNavigation } as never}
        route={{ key: 'k', name: 'DaanKatha', params: { kathaId } } as never}
      />
    );

  test('teaching, next-story row and the two quiet doors render after the story', async () => {
    const kathas = getDaanKathas();
    const tree = await renderKatha(kathas[0].id);
    expect(has(tree, 'daan-katha-teaching')).toBe(true);
    expect(has(tree, 'daan-katha-next')).toBe(true);
    expect(has(tree, 'daan-katha-donate')).toBe(true);
    expect(has(tree, 'daan-katha-record')).toBe(true);
    // Still no in-app give/pay control (§2.7).
    expect(has(tree, 'daan-org-give')).toBe(false);
    expect(has(tree, 'daan-org-open')).toBe(false);
    await act(async () => tree.unmount());
  });

  test('next → the following katha in registry order (wrapping); donate → daily journey; record → DaanEntry{}', async () => {
    const kathas = getDaanKathas();
    const last = kathas[kathas.length - 1];
    const tree = await renderKatha(last.id);
    await press(tree, 'daan-katha-next');
    expect(mockNavigation.replace).toHaveBeenCalledWith('DaanKatha', { kathaId: kathas[0].id });
    await press(tree, 'daan-katha-donate');
    expect(mockNavigation.navigate).toHaveBeenCalledWith('DaanJourney', {});
    await press(tree, 'daan-katha-record');
    expect(mockNavigation.navigate).toHaveBeenCalledWith('DaanEntry', {});
    await act(async () => tree.unmount());
  });
});

describe('DaanJourneyScreen — single-scroll, terminal actions always present (§2.7 relaxed)', () => {
  async function renderJourney() {
    const navigation = { ...mockNavigation } as never;
    return renderScreen(
      <DaanJourneyScreen
        navigation={navigation}
        route={{ key: 'k', name: 'DaanJourney', params: { occasionId: 'makar-sankranti' } } as never}
      />
    );
  }

  test('occasion mode: terminal actions and skip are present without stepping', async () => {
    const tree = await renderJourney();
    // Educate is the default, not a gate: everything is in the tree at once.
    expect(has(tree, 'daan-journey-skip')).toBe(true);
    expect(has(tree, 'daan-journey-record')).toBe(true);
    expect(has(tree, 'daan-journey-directory')).toBe(true);
    expect(has(tree, 'daan-journey-causes')).toBe(true);
    // The stepper is gone.
    expect(has(tree, 'daan-journey-next')).toBe(false);
    expect(has(tree, 'daan-journey-prev')).toBe(false);
    await act(async () => tree.unmount());
  });

  test('occasion mode navigates identically: record → DaanEntry, directory → DaanDirectory{causes}', async () => {
    const tree = await renderJourney();
    await press(tree, 'daan-journey-record');
    expect(mockNavigation.navigate).toHaveBeenCalledWith('DaanEntry', { occasionId: 'makar-sankranti' });
    await press(tree, 'daan-journey-directory');
    // The door carries the day's प्रयोजन so the द्वार opens pre-filtered (§5.1).
    expect(mockNavigation.navigate).toHaveBeenCalledWith('DaanDirectory', {
      causes: ['anna', 'vastra', 'gau'],
    });
    await act(async () => tree.unmount());
  });

  test('daily mode (no occasionId): builds from today, record → DaanEntry{}, directory → DaanDirectory{}', async () => {
    const navigation = { ...mockNavigation } as never;
    const tree = await renderScreen(
      <DaanJourneyScreen navigation={navigation} route={{ key: 'k', name: 'DaanJourney', params: undefined } as never} />
    );
    expect(has(tree, 'daan-journey-screen')).toBe(true);
    expect(has(tree, 'daan-journey-skip')).toBe(true);
    expect(has(tree, 'daan-journey-record')).toBe(true);
    expect(has(tree, 'daan-journey-directory')).toBe(true);
    // The doors carry {} — the outlined द्वार door is always the full listing.
    await press(tree, 'daan-journey-record');
    expect(mockNavigation.navigate).toHaveBeenCalledWith('DaanEntry', {});
    await press(tree, 'daan-journey-directory');
    expect(mockNavigation.navigate).toHaveBeenCalledWith('DaanDirectory', {});
    await act(async () => tree.unmount());
  });

  test("daily mode: the recommended chip row names today's vaar causes and each chip lands on ONE filtered cause", async () => {
    const navigation = { ...mockNavigation } as never;
    const tree = await renderScreen(
      <DaanJourneyScreen navigation={navigation} route={{ key: 'k', name: 'DaanJourney', params: undefined } as never} />
    );
    const vaar = getDaanVaarEntry(new Date().getDay());
    const orgs = getDaanOrgs();
    const live = (vaar.causes ?? []).filter((c) => orgs.some((org) => org.causes.includes(c)));
    expect(live.length).toBeGreaterThan(0);
    expect(has(tree, 'daan-journey-causes')).toBe(true);
    for (const cause of live) {
      mockNavigation.navigate.mockClear();
      await press(tree, `daan-journey-recommended-${cause}`);
      // A single cause → the द्वार skips the grid and opens that shelf (§5.1).
      expect(mockNavigation.navigate).toHaveBeenCalledWith('DaanDirectory', { causes: [cause] });
    }
    await act(async () => tree.unmount());
  });

  test('Wednesday recommends गौ-सेवा: gau-gras → the gau shelf directly', async () => {
    const wednesday = getDaanVaarEntry(3);
    expect(wednesday.causes).toEqual(['gau']);
    const spy = jest.spyOn(Date.prototype, 'getDay').mockReturnValue(3);
    try {
      const navigation = { ...mockNavigation } as never;
      const tree = await renderScreen(
        <DaanJourneyScreen navigation={navigation} route={{ key: 'k', name: 'DaanJourney', params: undefined } as never} />
      );
      expect(has(tree, 'daan-journey-recommended-gau')).toBe(true);
      expect(has(tree, 'daan-journey-recommended-anna')).toBe(false);
      mockNavigation.navigate.mockClear();
      await press(tree, 'daan-journey-recommended-gau');
      expect(mockNavigation.navigate).toHaveBeenCalledWith('DaanDirectory', { causes: ['gau'] });
      await act(async () => tree.unmount());
    } finally {
      spy.mockRestore();
    }
  });

  test('occasion mode: one recommended chip per live occasion cause, the door itself keeps all of them', async () => {
    const tree = await renderJourney();
    for (const cause of ['anna', 'vastra', 'gau']) {
      expect(has(tree, `daan-journey-recommended-${cause}`)).toBe(true);
    }
    mockNavigation.navigate.mockClear();
    await press(tree, 'daan-journey-recommended-gau');
    expect(mockNavigation.navigate).toHaveBeenCalledWith('DaanDirectory', { causes: ['gau'] });
    await act(async () => tree.unmount());
  });
});


describe('दान-द्वार — the cause (प्रयोजन) axis, PRD-26 §5.1', () => {
  const renderDirectory = (params?: { causes?: string[] }) =>
    renderScreen(
      <DaanDirectoryScreen
        navigation={{ ...mockNavigation } as never}
        route={{ key: 'k', name: 'DaanDirectory', params } as never}
      />
    );

  test('default: every live cause is a grid tile (no counts, no give)', async () => {
    const tree = await renderDirectory();
    expect(has(tree, 'daan-directory-grid')).toBe(true);
    for (const id of ['anna', 'gau', 'bal', 'vriddha', 'vidya', 'arogya', 'vastra', 'jeev', 'aapada']) {
      expect(has(tree, `daan-cause-tile-${id}`)).toBe(true);
    }
    // The grid names causes, not places — no mahatva/org rows until one is opened.
    expect(has(tree, 'daan-directory-filtered')).toBe(false);
    expect(has(tree, 'daan-org-akshaya-patra')).toBe(false);
    // No give affordance anywhere — the hand-off lives on the detail (§2.7).
    expect(has(tree, 'daan-org-give')).toBe(false);
    expect(has(tree, 'daan-org-open')).toBe(false);
    await act(async () => tree.unmount());
  });

  test('opening a cause tile drills into its mahatva + places', async () => {
    const tree = await renderDirectory();
    await press(tree, 'daan-cause-tile-anna');
    expect(has(tree, 'daan-directory-filtered')).toBe(true);
    // §27.14: the द्वार explains the प्रयोजन before it lists places.
    expect(has(tree, 'daan-cause-mahatva-anna')).toBe(true);
    expect(has(tree, 'daan-org-akshaya-patra')).toBe(true);
    await act(async () => tree.unmount());
  });

  test("an occasion's causes pre-filter the door and are named", async () => {
    const tree = await renderDirectory({ causes: ['gau'] });
    expect(has(tree, 'daan-directory-occasion-line')).toBe(true);
    expect(has(tree, 'daan-directory-filtered')).toBe(true);
    // A filtered द्वार keeps the teaching — it never becomes a bare list.
    expect(has(tree, 'daan-cause-mahatva-gau')).toBe(true);
    // Filtered to गौ-सेवा: TTD's Gosamrakshana row is in, Goonj (vastra) is out.
    expect(has(tree, 'daan-org-ttd-annaprasadam')).toBe(true);
    expect(has(tree, 'daan-org-goonj')).toBe(false);
    await act(async () => tree.unmount());
  });

  test('tapping the active chip clears the filter back to the grid', async () => {
    const tree = await renderDirectory({ causes: ['vriddha'] });
    // A single-cause arrival opens filtered directly.
    expect(has(tree, 'daan-directory-filtered')).toBe(true);
    expect(has(tree, 'daan-org-helpage-india')).toBe(true);
    await press(tree, 'daan-cause-vriddha');
    // Cleared → back to the cause grid (tiles), no org rows shown.
    expect(has(tree, 'daan-directory-filtered')).toBe(false);
    expect(has(tree, 'daan-directory-grid')).toBe(true);
    expect(has(tree, 'daan-cause-tile-vastra')).toBe(true);
    expect(has(tree, 'daan-org-helpage-india')).toBe(false);
    await act(async () => tree.unmount());
  });

  test('an unknown cause in the params is ignored, never an empty shelf', async () => {
    const tree = await renderDirectory({ causes: ['not-a-cause'] });
    expect(has(tree, 'daan-directory-occasion-line')).toBe(false);
    // Falls back to the plain grid.
    expect(has(tree, 'daan-directory-grid')).toBe(true);
    expect(has(tree, 'daan-cause-tile-anna')).toBe(true);
    await act(async () => tree.unmount());
  });

  test("the journey's terminal door carries the day's causes", async () => {
    const tree = await renderScreen(
      <DaanJourneyScreen
        navigation={{ ...mockNavigation } as never}
        route={{ key: 'k', name: 'DaanJourney', params: { occasionId: 'makar-sankranti' } } as never}
      />
    );
    expect(has(tree, 'daan-journey-causes')).toBe(true);
    await press(tree, 'daan-journey-directory');
    expect(mockNavigation.navigate).toHaveBeenCalledWith('DaanDirectory', {
      causes: ['anna', 'vastra', 'gau'],
    });
    await act(async () => tree.unmount());
  });
});

describe('the purpose bridge stays an educate door (§2.7)', () => {
  // Source-shape pin, the vidhiBackNavigation.test.ts precedent: the bridge on
  // the text-intent screen must open the educate home, never the द्वार.
  const src = require('node:fs').readFileSync(
    require('node:path').join(__dirname, '..', 'PurposeListScreen.tsx'),
    'utf8'
  ) as string;

  test('PurposeList opens DaanPunya and never DaanDirectory', () => {
    expect(src).toContain("navigation.navigate('DaanPunya')");
    expect(src).not.toContain('DaanDirectory');
    expect(src).toContain('causeForPurpose');
  });
});

describe('पात्र-परिचय — a place, not a profile (RULEBOOK §27.14)', () => {
  const renderDetail = (orgId: string) =>
    renderScreen(
      <DaanDirectoryDetailScreen
        navigation={{ ...mockNavigation } as never}
        route={{ key: 'k', name: 'DaanDirectoryDetail', params: { orgId } } as never}
      />
    );

  // Everything the screen renders, props included — a deliberately wide net so
  // paperwork copy cannot slip back in through a label or an accessibility hint.
  const textOf = (tree: TestRenderer.ReactTestRenderer) => JSON.stringify(tree.toJSON());

  test('the detail carries one line and no paperwork or verification badge', async () => {
    const tree = await renderDetail('akshaya-patra');
    expect(has(tree, 'daan-org-about')).toBe(true);
    // The card that used to render registration/80G and the "verified against
    // two sources" line is gone — verification is editorial, not a badge.
    expect(has(tree, 'daan-org-verification')).toBe(false);
    const text = textOf(tree);
    // Guard the guard: the collector really is reading this screen's copy.
    expect(text).toContain('अक्षय पात्र फाउंडेशन');
    expect(text).not.toContain('80G');
    expect(text).not.toMatch(/सत्यापित/);
    await act(async () => tree.unmount());
  });

  test('the only hand-off is the official website, behind the interstitial', async () => {
    const { Linking } = require('react-native');
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined as never);
    const tree = await renderDetail('akshaya-patra');
    // Nothing opens until the user passes the honest interstitial.
    expect(has(tree, 'daan-org-open')).toBe(false);
    await press(tree, 'daan-org-give');
    expect(has(tree, 'daan-org-interstitial')).toBe(true);
    await press(tree, 'daan-org-open');
    expect(openURL).toHaveBeenCalledWith(getDaanOrg('akshaya-patra')!.officialUrl);
    // And the return offer to record is gentle, after the fact — never before.
    expect(has(tree, 'daan-org-return-offer')).toBe(true);
    openURL.mockRestore();
    await act(async () => tree.unmount());
  });
});
