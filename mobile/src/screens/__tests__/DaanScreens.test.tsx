/**
 * PRD-26 surface contracts:
 *  1. DaanPunyaScreen (the educate home) renders the mahatva-first sections —
 *     and carries ZERO give affordances: no directory door, no external link,
 *     no give button. The only doors are journey/katha/ledger (§2.7).
 *  2. DaanJourneyScreen gates its terminal actions structurally: record and
 *     the दान-द्वार button do not exist in the tree until the last step, and
 *     the directory door exists nowhere else in the app.
 */
import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { View as mockView } from 'react-native';

import { GitaLanguageProvider } from '@/data/gita/language';

const mockNavigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
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

const has = (tree: TestRenderer.ReactTestRenderer, testID: string) =>
  tree.root.findAllByProps({ testID }).length > 0;
const press = async (tree: TestRenderer.ReactTestRenderer, testID: string) => {
  const node = tree.root.findAllByProps({ testID })[0];
  await act(async () => node.props.onPress());
};

async function renderScreen(element: React.ReactElement) {
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(<GitaLanguageProvider>{element}</GitaLanguageProvider>);
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

  test('§2.7 surface contract: zero give affordances on the home', async () => {
    const navigation = { ...mockNavigation } as never;
    const tree = await renderScreen(<DaanPunyaScreen navigation={navigation} route={{ key: 'k', name: 'DaanPunya' } as never} />);
    // No directory door, no give/hand-off controls of any kind.
    expect(has(tree, 'daan-journey-directory')).toBe(false);
    expect(has(tree, 'daan-org-give')).toBe(false);
    expect(has(tree, 'daan-org-open')).toBe(false);
    // And no press on this screen navigates to the directory.
    const pressables = tree.root.findAll((node) => typeof node.props.onPress === 'function');
    for (const node of pressables) {
      expect(node.props.testID).not.toBe('daan-journey-directory');
    }
    await act(async () => tree.unmount());
  });
});

describe('DaanJourneyScreen — terminal actions are structural', () => {
  async function renderJourney() {
    const navigation = { ...mockNavigation } as never;
    return renderScreen(
      <DaanJourneyScreen
        navigation={navigation}
        route={{ key: 'k', name: 'DaanJourney', params: { occasionId: 'makar-sankranti' } } as never}
      />
    );
  }

  test('record and daan-dwaar do not exist before the last step', async () => {
    const tree = await renderJourney();
    expect(has(tree, 'daan-journey-record')).toBe(false);
    expect(has(tree, 'daan-journey-directory')).toBe(false);
    await act(async () => tree.unmount());
  });

  test('advancing to the last step reveals record first, then the external door', async () => {
    const tree = await renderJourney();
    // makar-sankranti has a katha (karna), so the journey runs 5 steps.
    for (let i = 0; i < 4; i += 1) {
      expect(has(tree, 'daan-journey-next')).toBe(true);
      await press(tree, 'daan-journey-next');
    }
    expect(has(tree, 'daan-journey-next')).toBe(false);
    expect(has(tree, 'daan-journey-record')).toBe(true);
    expect(has(tree, 'daan-journey-directory')).toBe(true);
    await press(tree, 'daan-journey-record');
    expect(mockNavigation.navigate).toHaveBeenCalledWith('DaanEntry', { occasionId: 'makar-sankranti' });
    await press(tree, 'daan-journey-directory');
    expect(mockNavigation.navigate).toHaveBeenCalledWith('DaanDirectory');
    await act(async () => tree.unmount());
  });
});
