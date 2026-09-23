import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';

/**
 * PRD-44 पितृ पक्ष परिचय — the hub renders every VERIFIED section and nothing
 * for drafts, each in the shape its use asks for (Sept 2026): the introduction
 * as one card that opens the paged reader, questions as an accordion, verses as
 * the §73 carousel, kathas as a tile shelf, the glossary behind a door.
 * Scripture rows hand off into the bundled readers (Gita locally on the More
 * stack, Valmiki across to Home); the three closing doors point at the shipped
 * fortnight surfaces. The परिचय reader is the Vrat Katha shell over the verified
 * lessons, opens on a deep-linked lesson, and hands off to the fortnight from its
 * closing card. The katha reader renders a verified katha with its teaching +
 * reader hand-off and shows only the header for a draft id.
 */

jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium' },
  impactAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-linear-gradient', () => {
  const r = require('react');
  const { View: RNView } = require('react-native');
  return { LinearGradient: ({ children, ...p }: Record<string, unknown>) => r.createElement(RNView, p, children) };
});

const mockRootNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockRootNavigate, goBack: jest.fn() }),
}));

import { ThemeProvider } from '@/theme/ThemeContext';
import { FontScaleProvider } from '@/contexts/FontScaleContext';
import { PITRU_LESSON_ENTRIES } from '@/data/pitru/lessons';
import { PITRU_KATHA_ENTRIES } from '@/data/pitru/kathas';
import { PITRU_PRASHNA_ENTRIES } from '@/data/pitru/prashna';
import { FlatList } from 'react-native';

const { GitaLanguageProvider } = jest.requireActual<typeof import('@/data/gita/language')>('@/data/gita/language');
const PitruPakshaShikshaScreen = jest.requireActual<typeof import('../PitruPakshaShikshaScreen')>(
  '../PitruPakshaShikshaScreen'
).default;
const PitruKathaScreen = jest.requireActual<typeof import('../PitruKathaScreen')>('../PitruKathaScreen').default;
const PitruParichayReaderScreen = jest.requireActual<typeof import('../PitruParichayReaderScreen')>(
  '../PitruParichayReaderScreen'
).default;

const VERIFIED_PARICHAY = PITRU_LESSON_ENTRIES.filter((l) => l.kind === 'parichay' && l.status === 'verified');

/** The reader's `n / m` counter as one string (its JSX children are split). */
function counter(tree: TestRenderer.ReactTestRenderer): string {
  const node = tree.root.findAll((n) => n.props.testID === 'pitru-parichay-counter' && n.type === Text)[0];
  return ([] as unknown[]).concat(node.props.children).join('');
}

function makeNav(): { navigate: jest.Mock; goBack: jest.Mock; popTo: jest.Mock } {
  return { navigate: jest.fn(), goBack: jest.fn(), popTo: jest.fn() };
}

function wrap(children: React.ReactNode, lang: 'hi' | 'en' = 'hi') {
  return (
    <FontScaleProvider>
      <ThemeProvider>
        <GitaLanguageProvider initialLang={lang}>{children}</GitaLanguageProvider>
      </ThemeProvider>
    </FontScaleProvider>
  );
}

const trees: TestRenderer.ReactTestRenderer[] = [];
afterEach(() => {
  act(() => {
    trees.splice(0).forEach((t) => t.unmount());
  });
  jest.clearAllMocks();
});

async function render(node: React.ReactElement, lang: 'hi' | 'en' = 'hi'): Promise<TestRenderer.ReactTestRenderer> {
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(wrap(node, lang));
  });
  trees.push(tree);
  return tree;
}

function allText(tree: TestRenderer.ReactTestRenderer): string {
  return tree.root
    .findAllByType(Text)
    .map((n) => n.props.children)
    .flat(Number.POSITIVE_INFINITY)
    .join(' ');
}

function byTestId(tree: TestRenderer.ReactTestRenderer, id: string) {
  return tree.root.findAll((n) => n.props.testID === id)[0];
}

function pressByLabel(tree: TestRenderer.ReactTestRenderer, label: string) {
  const node = tree.root.findAll((n) => n.props.accessibilityLabel === label && typeof n.props.onPress === 'function')[0];
  expect(node).toBeDefined();
  act(() => node.props.onPress());
}

describe('PitruPakshaShikshaScreen', () => {
  test('renders verified lessons, verses, kathas, prashna and glossary — drafts absent', async () => {
    const nav = makeNav();
    const tree = await render(
      <PitruPakshaShikshaScreen navigation={nav as never} route={{ key: 's', name: 'PitruPakshaShiksha' } as never} />
    );
    // The glossary is looked up, so it sits behind a door; open it so its rows
    // are part of the draft-absence sweep below.
    expect(byTestId(tree, 'pitru-shabd-shabd-tarpan')).toBeUndefined();
    pressByLabel(tree, 'Glossary');
    const text = allText(tree);

    // Verified concept lesson (the intro card) + glossary are present.
    expect(byTestId(tree, 'pitru-lesson-kya-hai')).toBeDefined();
    expect(byTestId(tree, 'pitru-shabd-shabd-tarpan')).toBeDefined();
    expect(text).toContain('पितृ पक्ष क्या है');

    // The fortnight itself is NOT rendered here — it is the dated overview's,
    // and rendering it twice is what made the two screens feel unrelated.
    expect(byTestId(tree, 'pitru-tithi-tithi-purnima')).toBeUndefined();
    expect(text).not.toContain('पक्ष का पहला दिन');

    // Verified verse rows and the Valmiki katha.
    expect(byTestId(tree, 'pitru-principle-gita-1-42')).toBeDefined();
    expect(byTestId(tree, 'pitru-principle-valmiki-2-102-27')).toBeDefined();
    expect(byTestId(tree, 'pitru-katha-rama-jalanjali')).toBeDefined();
    expect(byTestId(tree, 'pitru-prashna-tithi-agyat')).toBeDefined();

    // Every draft row — of every kind — is absent. Non-vacuous: the registry
    // does hold drafts (pinned by pitruShikshaContent.test.ts).
    const draftLessonIds = PITRU_LESSON_ENTRIES.filter((l) => l.status === 'draft').map((l) => l.id);
    expect(draftLessonIds.length).toBeGreaterThan(0);
    for (const id of draftLessonIds) {
      expect(tree.root.findAll((n) => typeof n.props.testID === 'string' && n.props.testID.endsWith(`-${id}`))).toHaveLength(0);
    }
    const draftKatha = PITRU_KATHA_ENTRIES.find((k) => k.status === 'draft')!;
    expect(byTestId(tree, `pitru-katha-${draftKatha.id}`)).toBeUndefined();
    expect(byTestId(tree, 'pitru-principle-manu-3-70')).toBeUndefined();
    expect(text).not.toContain('कर्ण');
  });

  test('the introduction is one card that opens the reader — no lesson is unlocked in place', async () => {
    const nav = makeNav();
    const tree = await render(
      <PitruPakshaShikshaScreen navigation={nav as never} route={{ key: 's', name: 'PitruPakshaShiksha' } as never} />
    );
    const kyaHai = VERIFIED_PARICHAY[0];
    expect(kyaHai.bodyHi.length).toBeGreaterThan(1);
    // Its opening paragraph only…
    expect(allText(tree)).toContain(kyaHai.bodyHi[0]);
    expect(allText(tree)).not.toContain(kyaHai.bodyHi[kyaHai.bodyHi.length - 1]);
    // …and no other lesson is on the hub at all, and nothing to unlock.
    for (const lesson of VERIFIED_PARICHAY.slice(1)) {
      expect(byTestId(tree, `pitru-lesson-${lesson.id}`)).toBeUndefined();
    }
    expect(tree.root.findAll((n) => typeof n.props.accessibilityLabel === 'string' && n.props.accessibilityLabel.startsWith('Expand lesson'))).toHaveLength(0);
    expect(allText(tree)).toContain(`${VERIFIED_PARICHAY.length} पाठ`);

    pressByLabel(tree, 'Read the introduction');
    expect(nav.navigate).toHaveBeenCalledWith('PitruParichayReader');
  });

  test('Gita refs push the local GitaReader; the Valmiki ref crosses to the Home stack reader', async () => {
    const nav = makeNav();
    const tree = await render(
      <PitruPakshaShikshaScreen navigation={nav as never} route={{ key: 's', name: 'PitruPakshaShiksha' } as never} />
    );
    pressByLabel(tree, 'Open gita reader for gita-1-42');
    expect(nav.navigate).toHaveBeenCalledWith('GitaReader', { chapter: 1, initialIndex: 41 });

    pressByLabel(tree, 'Open valmiki reader for valmiki-2-102-27');
    expect(mockRootNavigate).toHaveBeenCalledWith('HomeTab', {
      screen: 'ValmikiRamayanReader',
      params: { chapter: 2, initialIndex: 3715 },
    });
  });

  test('katha row and the three closing doors navigate to the shipped surfaces', async () => {
    const nav = makeNav();
    const tree = await render(
      <PitruPakshaShikshaScreen navigation={nav as never} route={{ key: 's', name: 'PitruPakshaShiksha' } as never} />
    );
    pressByLabel(tree, 'Open katha rama-jalanjali');
    expect(nav.navigate).toHaveBeenCalledWith('PitruKatha', { kathaId: 'rama-jalanjali' });

    pressByLabel(tree, 'Open Pitru Paksha overview');
    expect(nav.navigate).toHaveBeenCalledWith('PitruPakshaOverview');

    pressByLabel(tree, 'Open Tila-Tarpana remembrance guide');
    expect(nav.navigate).toHaveBeenCalledWith('VidhiDetail', { vidhiId: 'shraddha-tarpan-vidhi' });

    pressByLabel(tree, 'Open Pitru Smaran list');
    expect(nav.navigate).toHaveBeenCalledWith('PitruSmaranList');
  });

  // ── Sept 2026 UX review ────────────────────────────────────────────────

  test('the fortnight lives on the dated overview, reached by the अब door', async () => {
    const nav = makeNav();
    const tree = await render(
      <PitruPakshaShikshaScreen navigation={nav as never} route={{ key: 's', name: 'PitruPakshaShiksha' } as never} />
    );
    // No parallel tithi list of any shape.
    const days = ['purnima', ...Array.from({ length: 14 }, (_, i) => String(i + 1)), 'amavasya'];
    for (const day of days) {
      expect(byTestId(tree, `pitru-tithi-day-${day}`)).toBeUndefined();
      expect(byTestId(tree, `pitru-tithi-tithi-${day}`)).toBeUndefined();
    }
    expect(allText(tree)).toContain('पक्ष की सोलह तिथियाँ');
    act(() => byTestId(tree, 'pitru-shiksha-overview-door').props.onPress());
    expect(nav.navigate).toHaveBeenCalledWith('PitruPakshaOverview');
  });

  test('questions are an accordion — one answer open at a time, none at first', async () => {
    const nav = makeNav();
    const tree = await render(
      <PitruPakshaShikshaScreen navigation={nav as never} route={{ key: 's', name: 'PitruPakshaShiksha' } as never} />
    );
    const [q1, q2] = PITRU_PRASHNA_ENTRIES.filter((q) => q.status === 'verified');
    expect(byTestId(tree, `pitru-prashna-answer-${q1.id}`)).toBeUndefined();
    expect(allText(tree)).toContain(q1.questionHi);

    pressByLabel(tree, `Question ${q1.id}`);
    expect(byTestId(tree, `pitru-prashna-answer-${q1.id}`)).toBeDefined();
    expect(byTestId(tree, `pitru-prashna-${q1.id}`).props.accessibilityState).toEqual({ expanded: true });

    // Opening another closes the first.
    pressByLabel(tree, `Question ${q2.id}`);
    expect(byTestId(tree, `pitru-prashna-answer-${q1.id}`)).toBeUndefined();
    expect(byTestId(tree, `pitru-prashna-answer-${q2.id}`)).toBeDefined();
  });

  test('verses are a carousel whose meaning folds out; stories are a tile shelf; no section rail', async () => {
    const nav = makeNav();
    const tree = await render(
      <PitruPakshaShikshaScreen navigation={nav as never} route={{ key: 's', name: 'PitruPakshaShiksha' } as never} />
    );
    expect(byTestId(tree, 'pitru-principle-carousel').props.horizontal).toBe(true);
    expect(byTestId(tree, 'pitru-katha-shelf').props.horizontal).toBe(true);
    expect(byTestId(tree, 'pitru-shiksha-rail')).toBeUndefined();

    const meaning = () =>
      tree.root.findAll((n) => n.props.testID === 'pitru-principle-gita-1-42')[0]
        .findAllByType(Text)
        .find((t) => t.props.numberOfLines !== undefined || t.props.style?.fontSize === 13);
    expect(meaning()!.props.numberOfLines).toBe(2);
    act(() => byTestId(tree, 'pitru-principle-meaning-gita-1-42').props.onPress());
    expect(meaning()!.props.numberOfLines).toBeUndefined();
  });

  test('the screen does not narrate its own section order (design.md §1 copy rule)', async () => {
    const nav = makeNav();
    const tree = await render(
      <PitruPakshaShikshaScreen navigation={nav as never} route={{ key: 's', name: 'PitruPakshaShiksha' } as never} />
    );
    expect(allText(tree)).not.toContain('फिर स्मरण, फिर विधि');
  });

  test('English reading language renders the English copy and IAST verse lines', async () => {
    const nav = makeNav();
    const tree = await render(
      <PitruPakshaShikshaScreen navigation={nav as never} route={{ key: 's', name: 'PitruPakshaShiksha' } as never} />,
      'en'
    );
    const text = allText(tree);
    expect(text).toContain('What Pitru Paksha is');
    expect(text).toContain('patanti pitaro hy eṣāṁ lupta-piṇḍodaka-kriyāḥ');
    expect(text).toContain('Read in the Gita ›');
  });
});

describe('PitruParichayReaderScreen', () => {
  const route = (params?: { lessonId?: string }) =>
    ({ key: 'r', name: 'PitruParichayReader', params }) as never;

  test('pages the verified lessons on the Vrat Katha shell, then a hand-off card', async () => {
    const nav = makeNav();
    const tree = await render(<PitruParichayReaderScreen navigation={nav as never} route={route()} />);
    const list = tree.root.findByType(FlatList);
    const ids = (list.props.data as { id: string }[]).map((d) => d.id);
    // Every verified lesson, in registry order, then the fortnight card.
    expect(ids).toEqual([...VERIFIED_PARICHAY.map((l) => l.id), '__fortnight']);
    expect(list.props.horizontal).toBe(true);
    expect(list.props.pagingEnabled).toBe(true);
    expect(list.props.initialScrollIndex).toBe(0);
    // No draft lesson becomes a page.
    for (const draft of PITRU_LESSON_ENTRIES.filter((l) => l.kind === 'parichay' && l.status === 'draft')) {
      expect(ids).not.toContain(draft.id);
    }
    const text = allText(tree);
    expect(counter(tree)).toBe(`1 / ${VERIFIED_PARICHAY.length}`);
    expect(text).toContain(`परिचय · 1/${VERIFIED_PARICHAY.length}`);
    // The whole first lesson is on its page — every paragraph, nothing to unlock.
    for (const paragraph of VERIFIED_PARICHAY[0].bodyHi) expect(text).toContain(paragraph);
    // Shell parts: language toggle and reading-progress bar.
    expect(tree.root.findAll((n) => n.props.accessibilityLabel === 'Reading language').length).toBeGreaterThan(0);
    expect(byTestId(tree, 'reading-progress-fill')).toBeDefined();
  });

  test('a lessonId opens the reader on that lesson', async () => {
    const nav = makeNav();
    const tree = await render(<PitruParichayReaderScreen navigation={nav as never} route={route({ lessonId: 'kis-din-kiska' })} />);
    const at = VERIFIED_PARICHAY.findIndex((l) => l.id === 'kis-din-kiska');
    expect(at).toBeGreaterThan(0);
    expect(tree.root.findByType(FlatList).props.initialScrollIndex).toBe(at);
    expect(counter(tree)).toBe(`${at + 1} / ${VERIFIED_PARICHAY.length}`);
  });

  test('an unknown or draft lessonId falls back to the first page', async () => {
    const nav = makeNav();
    const tree = await render(<PitruParichayReaderScreen navigation={nav as never} route={route({ lessonId: 'panchabali' })} />);
    expect(tree.root.findByType(FlatList).props.initialScrollIndex).toBe(0);
  });

  test('settling on the closing card hands off to the fortnight — once, via popTo', async () => {
    jest.useFakeTimers();
    try {
      const nav = makeNav();
      const tree = await render(<PitruParichayReaderScreen navigation={nav as never} route={route()} />);
      const list = tree.root.findByType(FlatList);
      const pageWidth = list.props.getItemLayout(null, 1).offset;
      const scrollTo = (page: number) =>
        act(() => list.props.onScroll({ nativeEvent: { contentOffset: { x: pageWidth * page } } }));

      // A lesson page does nothing.
      scrollTo(VERIFIED_PARICHAY.length - 1);
      act(() => jest.advanceTimersByTime(1000));
      expect(nav.popTo).not.toHaveBeenCalled();

      // The closing card: the counter holds at the last lesson, and after the
      // house 400 ms the reader returns to (or replaces itself with) the fortnight.
      scrollTo(VERIFIED_PARICHAY.length);
      expect(counter(tree)).toBe(`${VERIFIED_PARICHAY.length} / ${VERIFIED_PARICHAY.length}`);
      act(() => jest.advanceTimersByTime(399));
      expect(nav.popTo).not.toHaveBeenCalled();
      act(() => jest.advanceTimersByTime(1));
      expect(nav.popTo).toHaveBeenCalledWith('PitruPakshaOverview');

      // Further scroll events on the card do not fire a second hand-off.
      scrollTo(VERIFIED_PARICHAY.length);
      act(() => jest.advanceTimersByTime(1000));
      expect(nav.popTo).toHaveBeenCalledTimes(1);
    } finally {
      jest.useRealTimers();
    }
  });

  test('backing out inside the 400 ms cancels the hand-off', async () => {
    jest.useFakeTimers();
    try {
      const nav = makeNav();
      const tree = await render(<PitruParichayReaderScreen navigation={nav as never} route={route()} />);
      const list = tree.root.findByType(FlatList);
      const pageWidth = list.props.getItemLayout(null, 1).offset;
      act(() => list.props.onScroll({ nativeEvent: { contentOffset: { x: pageWidth * VERIFIED_PARICHAY.length } } }));
      act(() => jest.advanceTimersByTime(200));
      act(() => tree.unmount());
      trees.splice(trees.indexOf(tree), 1);
      act(() => jest.advanceTimersByTime(1000));
      expect(nav.popTo).not.toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });

  test('English renders the lessons’ English text', async () => {
    const nav = makeNav();
    const tree = await render(<PitruParichayReaderScreen navigation={nav as never} route={route()} />, 'en');
    const text = allText(tree);
    expect(text).toContain(VERIFIED_PARICHAY[0].titleEn);
    expect(text).toContain(`Introduction · 1/${VERIFIED_PARICHAY.length}`);
  });
});

describe('PitruKathaScreen', () => {
  test('renders a verified katha with its teaching and the Ramayana hand-off', async () => {
    const nav = makeNav();
    const tree = await render(
      <PitruKathaScreen
        navigation={nav as never}
        route={{ key: 'k', name: 'PitruKatha', params: { kathaId: 'rama-jalanjali' } } as never}
      />
    );
    const text = allText(tree);
    expect(text).toContain('मन्दाकिनी');
    expect(byTestId(tree, 'pitru-katha-teaching')).toBeDefined();
    expect(text).toContain('स्रोत: वाल्मीकि रामायण');
    pressByLabel(tree, 'Open valmiki reader for rama-jalanjali');
    expect(mockRootNavigate).toHaveBeenCalledWith('HomeTab', {
      screen: 'ValmikiRamayanReader',
      params: { chapter: 2, initialIndex: 3708 },
    });
  });

  test('a draft katha id renders only the header — no body, no teaching, no hand-off', async () => {
    const nav = makeNav();
    const tree = await render(
      <PitruKathaScreen
        navigation={nav as never}
        route={{ key: 'k', name: 'PitruKatha', params: { kathaId: 'karna-mahalaya' } } as never}
      />
    );
    expect(byTestId(tree, 'pitru-katha-teaching')).toBeUndefined();
    expect(byTestId(tree, 'pitru-katha-ref')).toBeUndefined();
    expect(allText(tree)).not.toContain('कर्ण');
  });
});
