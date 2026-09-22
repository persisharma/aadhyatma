import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';

/**
 * PRD-44 पितृ पक्ष परिचय — the education screen renders every VERIFIED section
 * in reading order and nothing for drafts; scripture rows hand off into the
 * bundled readers (Gita locally on the More stack, Valmiki across to Home);
 * katha rows open the katha reader; the three closing doors point at the
 * shipped fortnight surfaces. The katha reader renders a verified katha with
 * its teaching + reader hand-off and shows only the header for a draft id.
 */

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

const { GitaLanguageProvider } = jest.requireActual<typeof import('@/data/gita/language')>('@/data/gita/language');
const PitruPakshaShikshaScreen = jest.requireActual<typeof import('../PitruPakshaShikshaScreen')>(
  '../PitruPakshaShikshaScreen'
).default;
const PitruKathaScreen = jest.requireActual<typeof import('../PitruKathaScreen')>('../PitruKathaScreen').default;

function makeNav(): { navigate: jest.Mock; goBack: jest.Mock } {
  return { navigate: jest.fn(), goBack: jest.fn() };
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
  test('renders verified lessons, tithis, verses, kathas, prashna and glossary — drafts absent', async () => {
    const nav = makeNav();
    const tree = await render(
      <PitruPakshaShikshaScreen navigation={nav as never} route={{ key: 's', name: 'PitruPakshaShiksha' } as never} />
    );
    const text = allText(tree);

    // Verified concept lesson + tithi rows + glossary are present.
    expect(byTestId(tree, 'pitru-lesson-kya-hai')).toBeDefined();
    expect(byTestId(tree, 'pitru-tithi-tithi-purnima')).toBeDefined();
    expect(byTestId(tree, 'pitru-tithi-tithi-amavasya')).toBeDefined();
    expect(byTestId(tree, 'pitru-shabd-shabd-tarpan')).toBeDefined();
    expect(text).toContain('पितृ पक्ष क्या है');
    expect(text).toContain('सर्वपितृ अमावस्या');

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

  test('a multi-paragraph lesson opens on its first paragraph and unfolds in place', async () => {
    const nav = makeNav();
    const tree = await render(
      <PitruPakshaShikshaScreen navigation={nav as never} route={{ key: 's', name: 'PitruPakshaShiksha' } as never} />
    );
    const kyaHai = PITRU_LESSON_ENTRIES.find((l) => l.id === 'kya-hai')!;
    expect(kyaHai.bodyHi.length).toBeGreaterThan(1);
    expect(allText(tree)).not.toContain(kyaHai.bodyHi[kyaHai.bodyHi.length - 1]);
    pressByLabel(tree, 'Expand lesson kya-hai');
    expect(allText(tree)).toContain(kyaHai.bodyHi[kyaHai.bodyHi.length - 1]);
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

  test('पक्ष की तिथियाँ names all sixteen days — verified ones taught, the rest named only', async () => {
    const nav = makeNav();
    const tree = await render(
      <PitruPakshaShikshaScreen navigation={nav as never} route={{ key: 's', name: 'PitruPakshaShiksha' } as never} />
    );
    const text = allText(tree);

    // purnima + 1–14 + amavasya, whatever the registry can currently teach.
    const days = ['purnima', ...Array.from({ length: 14 }, (_, i) => String(i + 1)), 'amavasya'];
    const rendered = days.filter(
      (day) =>
        byTestId(tree, `pitru-tithi-day-${day}`) !== undefined ||
        byTestId(tree, `pitru-tithi-tithi-${day}`) !== undefined
    );
    expect(rendered).toHaveLength(16);

    // A day with no verified lesson carries the ENGINE's name for it and no body.
    expect(text).toContain('षष्ठी श्राद्ध');
    expect(text).toContain('चतुर्दशी श्राद्ध');
    // ...while the two verified days keep their teaching.
    expect(text).toContain('पक्ष का पहला दिन');
    expect(text).toContain('जिनकी तिथि ज्ञात नहीं');
  });

  test('the section rail lists only sections the scroll actually holds', async () => {
    const nav = makeNav();
    const tree = await render(
      <PitruPakshaShikshaScreen navigation={nav as never} route={{ key: 's', name: 'PitruPakshaShiksha' } as never} />
    );
    expect(byTestId(tree, 'pitru-shiksha-rail')).toBeDefined();
    for (const key of ['parichay', 'tithi', 'vachan', 'katha', 'prashna', 'shabd']) {
      expect(byTestId(tree, `pitru-shiksha-rail-${key}`)).toBeDefined();
    }
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
