/**
 * Smoke + contract coverage for the Puja Vidhi surfaces (PRD-19, RULEBOOK
 * §4.10 / §18): catalog card, detail modes (samagri checklist + step list),
 * conduct pager (mantra box, hand-off card, quiet completion), and the
 * source-privacy boundary — `source`/`sourceUrl` are review-only data and must
 * never reach a rendered screen.
 *
 * Every renderer is unmounted in afterEach inside act(): the conduct screen
 * mounts a FlatList, and a VirtualizedList cell-batch timer that outlives its
 * suite fails the run with exit 1 under a green summary (see wiki overview
 * gotchas).
 */
import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Share, View as mockView } from 'react-native';

import { GitaLanguageProvider } from '@/data/gita/language';
import { VIDHI_ENTRIES } from '@/data/vidhi';
import { satyanarayanPuja } from '@/data/vidhi/satyanarayan-puja';

const mockNavigation = { goBack: jest.fn(), navigate: jest.fn() };

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
  // Run focus effects like plain effects — good enough for hydration.
  useFocusEffect: (cb: () => void | (() => void)) => mockReact.useEffect(cb, [cb]),
}));

jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: { Light: 'Light' },
  impactAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    mockReact.createElement(mockView, props, children),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    mockReact.createElement(mockView, props, children),
}));

/* eslint-disable @typescript-eslint/no-require-imports */
const VidhiCatalogScreen = require('@/screens/VidhiCatalogScreen').default;
const VidhiDetailScreen = require('@/screens/VidhiDetailScreen').default;
const VidhiConductScreen = require('@/screens/VidhiConductScreen').default;
/* eslint-enable @typescript-eslint/no-require-imports */

const nav = mockNavigation as never;
const renderers: TestRenderer.ReactTestRenderer[] = [];

function render(el: React.ReactElement): TestRenderer.ReactTestRenderer {
  let renderer!: TestRenderer.ReactTestRenderer;
  act(() => {
    renderer = TestRenderer.create(<GitaLanguageProvider>{el}</GitaLanguageProvider>);
  });
  renderers.push(renderer);
  return renderer;
}

/** Flush the async AsyncStorage hydration effects. */
async function settle() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
}

const texts = (renderer: TestRenderer.ReactTestRenderer): string =>
  JSON.stringify(renderer.toJSON());

afterEach(() => {
  // Unmount inside act() so VirtualizedList's scheduled timers are torn down
  // with the tree (exit-1-under-green-summary gotcha).
  while (renderers.length > 0) {
    const renderer = renderers.pop()!;
    act(() => renderer.unmount());
  }
  mockNavigation.navigate.mockClear();
  mockNavigation.goBack.mockClear();
});

test('VidhiCatalogScreen lists all six v1 cards without publishing provenance and opens detail', () => {
  const r = render(<VidhiCatalogScreen navigation={nav} route={{ key: 'k', name: 'VidhiCatalog' } as never} />);
  const body = texts(r);
  expect(body).toContain('श्री सत्यनारायण पूजा');
  expect(body).toContain('Shri Satyanarayan Puja');
  expect(body).toContain('16 चरण');
  expect(body).toContain('लगभग 60 मिनट');
  expect(body).toContain('दीपावली लक्ष्मी-गणेश पूजन');
  expect(body).toContain('गणेश चतुर्थी स्थापना');
  expect(body).toContain('नवरात्रि घटस्थापना');
  expect(body).toContain('करवा चौथ पूजन');
  expect(body).toContain('महाशिवरात्रि पूजन');
  for (const vidhi of VIDHI_ENTRIES) {
    r.root.findByProps({ testID: `vidhi-card-${vidhi.id}` });
  }
  expect(body).not.toContain('~60 min');
  expect(body).not.toContain('स्रोत-प्रमाणित');
  expect(body).not.toContain('source-verified');
  act(() => {
    r.root.findByProps({ testID: 'vidhi-card-satyanarayan-puja' }).props.onPress();
  });
  expect(mockNavigation.navigate).toHaveBeenCalledWith('VidhiDetail', {
    vidhiId: 'satyanarayan-puja',
  });
});

test('VidhiDetailScreen: routine-style samagri checklist, private provenance, share, and steps mode', async () => {
  const shareSpy = jest.spyOn(Share, 'share').mockResolvedValue({ action: Share.dismissedAction });
  const r = render(
    <VidhiDetailScreen
      navigation={nav}
      route={{ key: 'k', name: 'VidhiDetail', params: { vidhiId: 'satyanarayan-puja' } } as never}
    />
  );
  await settle();

  // Only duration is public. The source/tradition stays review-only data.
  expect(texts(r)).not.toContain(satyanarayanPuja.conventionLineHi);
  expect(texts(r)).not.toContain(satyanarayanPuja.conventionLineEn);
  expect(texts(r)).toContain('60');

  // तैयारी mode: the Today's Practice summary/accordion opens with its ledger
  // visible, and completion updates both the row and summary.
  const summary = r.root.findByProps({ testID: 'vidhi-samagri-summary' });
  expect(summary.props.accessibilityState.expanded).toBe(true);
  expect(texts(r)).toContain(`0 / ${satyanarayanPuja.samagri.length}`);
  r.root.findByProps({ testID: 'vidhi-samagri-ledger' });
  expect(texts(r)).toContain('पंचामृत (दूध, दही, घी, शहद, शक्कर)');
  const firstItem = satyanarayanPuja.samagri[0];
  const row = r.root.findByProps({ testID: `vidhi-samagri-${firstItem.itemEn}` });
  expect(row.props.accessibilityState.checked).toBe(false);
  expect(row.props.accessibilityLabel).toBe(firstItem.itemHi);
  expect(texts(r)).not.toContain('Checklist state');
  act(() => row.props.onPress());
  expect(
    r.root.findByProps({ testID: `vidhi-samagri-${firstItem.itemEn}` }).props.accessibilityState.checked
  ).toBe(true);
  expect(texts(r)).toContain(`1 / ${satyanarayanPuja.samagri.length}`);

  act(() => summary.props.onPress());
  expect(r.root.findByProps({ testID: 'vidhi-samagri-summary' }).props.accessibilityState.expanded).toBe(false);
  expect(r.root.findAllByProps({ testID: 'vidhi-samagri-ledger' })).toHaveLength(0);
  act(() => r.root.findByProps({ testID: 'vidhi-samagri-summary' }).props.onPress());

  // Plain-text share — the family shopping message (PRD-19 §5.1).
  act(() => {
    r.root.findByProps({ testID: 'vidhi-share-list' }).props.onPress();
  });
  expect(shareSpy).toHaveBeenCalledTimes(1);
  const message = shareSpy.mock.calls[0][0].message as string;
  expect(message).toContain('श्री सत्यनारायण पूजा');
  expect(message).toContain(firstItem.itemHi);
  expect(message).not.toContain('http'); // nothing but the list

  // पूजा mode: phase-grouped steps, and "पूजा प्रारम्भ" enters conduct at step 0.
  act(() => {
    r.root.findByProps({ testID: 'vidhi-mode-steps' }).props.onPress();
  });
  const body = texts(r);
  expect(body).toContain('आरम्भ');
  expect(body).toContain('मुख्य पूजा');
  expect(body).toContain('समापन');
  expect(body).toContain('ध्यान');
  act(() => {
    r.root.findByProps({ testID: 'vidhi-begin' }).props.onPress();
  });
  expect(mockNavigation.navigate).toHaveBeenCalledWith(
    'VidhiConduct',
    expect.objectContaining({ vidhiId: 'satyanarayan-puja', initialStep: 0 })
  );

  // Tapping a specific step enters conduct at that index.
  act(() => {
    r.root.findByProps({ testID: 'vidhi-step-dhyana' }).props.onPress();
  });
  expect(mockNavigation.navigate).toHaveBeenCalledWith(
    'VidhiConduct',
    expect.objectContaining({ initialStep: 3 })
  );
  shareSpy.mockRestore();
});

test('VidhiConductScreen: mantra step renders Devanagari + IAST in the reading card', async () => {
  const dhyanaIndex = satyanarayanPuja.steps.findIndex((step) => step.id === 'dhyana');
  const r = render(
    <VidhiConductScreen
      navigation={nav}
      route={{
        key: 'k',
        name: 'VidhiConduct',
        params: { vidhiId: 'satyanarayan-puja', initialStep: dhyanaIndex },
      } as never}
    />
  );
  await settle();
  const body = texts(r);
  expect(body).toContain('ध्यायेत् सत्यं गुणातीतं गुणत्रयसमन्वितम्।');
  expect(body).toContain('dhyāyet satyaṁ guṇātītaṁ');
  // The card uses the same shared ornament as the current readers.
  expect(body).toContain('॥');
  // Counter is step-scoped: 4 / 16.
  expect(body).toContain(`${dhyanaIndex + 1} / ${satyanarayanPuja.steps.length}`);
  // Conduct reuses the reading-card shell and reader swipe contract. There is
  // no duplicate previous/next button bar or swipe-instruction copy.
  r.root.findByProps({ testID: 'vidhi-reading-card-dhyana' });
  const pager = r.root.findByProps({ testID: 'vidhi-conduct-pager' });
  expect(pager.props.horizontal).toBe(true);
  expect(pager.props.pagingEnabled).toBe(true);
  r.root.findByProps({ testID: 'vidhi-pager-dots' });
  expect(r.root.findAllByProps({ testID: 'vidhi-prev' })).toHaveLength(0);
  expect(r.root.findAllByProps({ testID: 'vidhi-next' })).toHaveLength(0);
  expect(body).not.toContain('Swipe');
  expect(body).not.toContain('swipe');
});

test('VidhiConductScreen: ref step hands off to the shipped katha reader and back', async () => {
  const kathaIndex = satyanarayanPuja.steps.findIndex((step) => step.id === 'katha');
  const r = render(
    <VidhiConductScreen
      navigation={nav}
      route={{
        key: 'k',
        name: 'VidhiConduct',
        params: { vidhiId: 'satyanarayan-puja', initialStep: kathaIndex },
      } as never}
    />
  );
  await settle();
  expect(texts(r)).toContain('कथा पढ़कर यहीं लौटें');
  expect(texts(r)).not.toContain('shipped text');
  act(() => {
    r.root.findByProps({ testID: 'vidhi-handoff-katha' }).props.onPress();
  });
  expect(mockNavigation.navigate).toHaveBeenCalledWith('HomeTab', {
    screen: 'VratKathaReader',
    params: { kathaId: 'satyanarayana-vrat-katha' },
  });
});

test('VidhiConductScreen: completion page is a quiet static ॐ seal without repeated actions', async () => {
  const r = render(
    <VidhiConductScreen
      navigation={nav}
      route={{
        key: 'k',
        name: 'VidhiConduct',
        params: { vidhiId: 'satyanarayan-puja', initialStep: satyanarayanPuja.steps.length },
      } as never}
    />
  );
  await settle();
  const body = texts(r);
  expect(body).toContain('पूजा सम्पन्न');
  expect(body).toContain('ॐ');
  // Quiet by design: no celebration component in the tree (the routine
  // celebration mechanism is deliberately not wired here).
  expect(body).not.toContain('pushpa-varsha');
  expect(body).not.toContain(satyanarayanPuja.conventionLineHi);
  expect(body).not.toContain(satyanarayanPuja.conventionLineEn);
  expect(r.root.findAllByProps({ testID: 'vidhi-pager-dots' })).toHaveLength(0);
  expect(r.root.findAllByProps({ testID: 'vidhi-completion-katha' })).toHaveLength(0);
  expect(body).not.toContain('व्रत कथा पढ़ें');
});

test('source/sourceUrl fields never render on any vidhi screen (review-only data)', async () => {
  const screens: React.ReactElement[] = [
    <VidhiCatalogScreen key="c" navigation={nav} route={{ key: 'k', name: 'VidhiCatalog' } as never} />,
  ];
  // Every detail and conduct page across the complete registry — none may
  // leak citation or convention metadata.
  for (const vidhi of VIDHI_ENTRIES) {
    screens.push(
      <VidhiDetailScreen
        key={`d-${vidhi.id}`}
        navigation={nav}
        route={{ key: 'k', name: 'VidhiDetail', params: { vidhiId: vidhi.id } } as never}
      />
    );
    for (let i = 0; i <= vidhi.steps.length; i += 1) {
      screens.push(
        <VidhiConductScreen
          key={`${vidhi.id}-${i}`}
          navigation={nav}
          route={{
            key: 'k',
            name: 'VidhiConduct',
            params: { vidhiId: vidhi.id, initialStep: i },
          } as never}
        />
      );
    }
  }

  const forbidden = [
    'http://',
    'https://',
    'drikpanchang',
    'archive.org',
    'canonicalEdition',
    'referenceUrls',
    'retrievedOn',
    ...VIDHI_ENTRIES.flatMap((vidhi) => [
      vidhi.source.canonicalEditionStatus,
      vidhi.conventionLineHi,
      vidhi.conventionLineEn,
      ...vidhi.source.referenceUrls,
      ...vidhi.steps.flatMap((step) => (step.mantra ? [step.mantra.sourceUrl] : [])),
    ]),
  ];

  for (const el of screens) {
    const r = render(el);
    await settle();
    // Detail: check both modes.
    const bodies = [texts(r)];
    const modeSteps = r.root.findAllByProps({ testID: 'vidhi-mode-steps' });
    if (modeSteps.length > 0) {
      act(() => modeSteps[0].props.onPress());
      bodies.push(texts(r));
    }
    for (const body of bodies) {
      for (const needle of forbidden) {
        expect(body).not.toContain(needle);
      }
    }
  }
}, 30_000);
