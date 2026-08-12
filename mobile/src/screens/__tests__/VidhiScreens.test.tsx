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

test('VidhiCatalogScreen lists the Satyanarayan card and opens its detail', () => {
  const r = render(<VidhiCatalogScreen navigation={nav} route={{ key: 'k', name: 'VidhiCatalog' } as never} />);
  const body = texts(r);
  expect(body).toContain('श्री सत्यनारायण पूजा');
  expect(body).toContain('Shri Satyanarayan Puja');
  expect(body).toContain('16 चरण');
  act(() => {
    r.root.findByProps({ testID: 'vidhi-card-satyanarayan-puja' }).props.onPress();
  });
  expect(mockNavigation.navigate).toHaveBeenCalledWith('VidhiDetail', {
    vidhiId: 'satyanarayan-puja',
  });
});

test('VidhiDetailScreen: convention line, samagri checklist, share, and the steps mode', async () => {
  const shareSpy = jest.spyOn(Share, 'share').mockResolvedValue({ action: Share.dismissedAction });
  const r = render(
    <VidhiDetailScreen
      navigation={nav}
      route={{ key: 'k', name: 'VidhiDetail', params: { vidhiId: 'satyanarayan-puja' } } as never}
    />
  );
  await settle();

  // Convention line declares the tradition + duration (never anonymous).
  expect(texts(r)).toContain('दृक्पंचांग पद्धति अनुसार');
  expect(texts(r)).toContain('60 min');

  // तैयारी mode: every samagri item renders with a §31 check circle.
  expect(texts(r)).toContain('पंचामृत (दूध, दही, घी, शहद, शक्कर)');
  const firstItem = satyanarayanPuja.samagri[0];
  const row = r.root.findByProps({ testID: `vidhi-samagri-${firstItem.itemEn}` });
  expect(row.props.accessibilityState.checked).toBe(false);
  act(() => row.props.onPress());
  expect(
    r.root.findByProps({ testID: `vidhi-samagri-${firstItem.itemEn}` }).props.accessibilityState.checked
  ).toBe(true);

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

test('VidhiConductScreen: mantra step renders Devanagari + IAST in the mantra box', async () => {
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
  expect(body).toContain('॥ ॐ ॥');
  // Counter is step-scoped: 4 / 16.
  expect(body).toContain(`${dhyanaIndex + 1} / ${satyanarayanPuja.steps.length}`);
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
  act(() => {
    r.root.findByProps({ testID: 'vidhi-handoff-katha' }).props.onPress();
  });
  expect(mockNavigation.navigate).toHaveBeenCalledWith('HomeTab', {
    screen: 'VratKathaReader',
    params: { kathaId: 'satyanarayana-vrat-katha' },
  });
});

test('VidhiConductScreen: completion page is a quiet static ॐ seal with a katha link', async () => {
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
  r.root.findByProps({ testID: 'vidhi-completion-katha' });
});

test('source/sourceUrl fields never render on any vidhi screen (review-only data)', async () => {
  const screens: React.ReactElement[] = [
    <VidhiCatalogScreen key="c" navigation={nav} route={{ key: 'k', name: 'VidhiCatalog' } as never} />,
    <VidhiDetailScreen
      key="d"
      navigation={nav}
      route={{ key: 'k', name: 'VidhiDetail', params: { vidhiId: 'satyanarayan-puja' } } as never}
    />,
  ];
  // Every conduct page, mantra steps included — none may leak a citation.
  for (let i = 0; i <= satyanarayanPuja.steps.length; i += 1) {
    screens.push(
      <VidhiConductScreen
        key={`s${i}`}
        navigation={nav}
        route={{
          key: 'k',
          name: 'VidhiConduct',
          params: { vidhiId: 'satyanarayan-puja', initialStep: i },
        } as never}
      />
    );
  }

  const forbidden = [
    'http://',
    'https://',
    'drikpanchang',
    'archive.org',
    'canonicalEdition',
    'referenceUrls',
    'retrievedOn',
    satyanarayanPuja.source.canonicalEditionStatus,
    ...satyanarayanPuja.source.referenceUrls,
    ...satyanarayanPuja.steps.flatMap((step) => (step.mantra ? [step.mantra.sourceUrl] : [])),
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
});
