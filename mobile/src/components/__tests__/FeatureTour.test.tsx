import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { InteractionManager, Text } from 'react-native';
import FeatureTour from '@/components/FeatureTour';
import { tourSteps } from '@/data/tour/steps';

// ---- controllable mock state ----
let mockShouldShow = true;
const mockMarkTourCompleted = jest.fn(() => Promise.resolve());

jest.mock('@/contexts/TourContext', () => ({
  useTour: () => ({
    shouldShowFirstLaunchTour: mockShouldShow,
    markTourCompleted: mockMarkTourCompleted,
  }),
}));

// Isolate the component from the cross-screen spotlight registry — no screens
// are mounted here, so every measure resolves null (ring falls back to the tab).
jest.mock('@/components/tour/tourTargets', () => ({
  measureTourTarget: () => Promise.resolve(null),
  revealTourTarget: () => {},
  useTourTarget: () => ({ current: null }),
}));

// Safe-area insets without a provider.
jest.mock('react-native-safe-area-context', () => {
  const RN = require('react-native');
  return {
    SafeAreaView: RN.View,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

// Minimal theme stub — FeatureTour only reads a handful of tokens.
jest.mock('@/theme/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      parchment: '#fff', parchmentSoft: '#fff', divider: '#ccc', ink: '#000', inkSoft: '#333',
      inkMuted: '#666', saffron: '#b8621b', onPrimary: '#fff', dotRest: '#ccc',
    },
    typography: {
      cardLatin: { fontFamily: 'Latin' },
      readerTitle: { fontFamily: 'Deva' },
      subtitle: { fontFamily: 'LatinItalic' },
      meaning: { fontFamily: 'Deva' },
    },
    spacing: { xxl: 24 },
    radii: { md: 14, lg: 18, pill: 999 },
  }),
}));

// Capture dispatched navigation actions.
const mockDispatch = jest.fn();
jest.mock('@/notifications/deepLink', () => ({
  navigationRef: { isReady: () => true, dispatch: (a: unknown) => mockDispatch(a) },
}));
jest.mock('@react-navigation/native', () => ({
  CommonActions: {
    navigate: (options: { name: string; params?: unknown }) => ({ type: 'NAVIGATE', payload: options }),
  },
}));

type PressableNode = { props: { accessibilityLabel?: string; onPress?: () => void } };

function queryA11y(tree: TestRenderer.ReactTestRenderer, label: string): PressableNode | undefined {
  return tree.root
    .findAll((n) => n.props?.accessibilityLabel === label)
    .find((n) => typeof n.props?.onPress === 'function') as unknown as PressableNode | undefined;
}

function press(tree: TestRenderer.ReactTestRenderer, label: string) {
  act(() => {
    queryA11y(tree, label)!.props.onPress!();
  });
}

function allText(tree: TestRenderer.ReactTestRenderer): string {
  return tree.root
    .findAllByType(Text)
    .map((n) => n.props.children)
    .flat(Number.POSITIVE_INFINITY)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

let runAfter: jest.SpyInstance;
let rafSpy: jest.SpyInstance;
let cafSpy: jest.SpyInstance;
beforeEach(() => {
  mockShouldShow = true;
  mockMarkTourCompleted.mockClear();
  mockDispatch.mockClear();
  // Run the deferred navigation callback synchronously.
  runAfter = jest
    .spyOn(InteractionManager, 'runAfterInteractions')
    .mockImplementation(((cb: () => void) => {
      cb?.();
      return { then: () => undefined, done: () => undefined, cancel: () => undefined };
    }) as unknown as typeof InteractionManager.runAfterInteractions);
  // Stub the measure-retry frame loop so no timer escapes the test environment
  // (measure resolves null here → the component would otherwise reschedule).
  rafSpy = jest.spyOn(global, 'requestAnimationFrame').mockImplementation(() => 0 as unknown as number);
  cafSpy = jest.spyOn(global, 'cancelAnimationFrame').mockImplementation(() => {});
});
afterEach(() => {
  runAfter.mockRestore();
  rafSpy.mockRestore();
  cafSpy.mockRestore();
});

function mount(): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(<FeatureTour />);
  });
  return tree;
}

describe('FeatureTour', () => {
  test('navigates to the first step on open and shows 1 / N with Skip', () => {
    const tree = mount();
    expect(mockDispatch).toHaveBeenCalled();
    const first = mockDispatch.mock.calls[0][0];
    expect(first.payload.name).toBe(tourSteps[0].navigateTo.name); // HomeTab
    expect(allText(tree)).toContain(`1 / ${tourSteps.length}`);
    expect(queryA11y(tree, 'Skip tour')).toBeDefined();
  });

  test('Next advances the step and drives navigation to the next surface', () => {
    const tree = mount();
    mockDispatch.mockClear();

    press(tree, 'Next step');

    expect(allText(tree)).toContain(`2 / ${tourSteps.length}`);
    const nav = mockDispatch.mock.calls.at(-1)![0];
    expect(nav.payload.name).toBe(tourSteps[1].navigateTo.name); // DailyBhaktiTab
  });

  test('Back is a no-op on the first step (guarded), Skip completes the tour', () => {
    const tree = mount();
    press(tree, 'Previous step');
    expect(allText(tree)).toContain(`1 / ${tourSteps.length}`);

    press(tree, 'Skip tour');
    expect(mockMarkTourCompleted).toHaveBeenCalledTimes(1);
  });

  test('walking to the last step shows Done and completing persists', () => {
    const tree = mount();
    for (let i = 0; i < tourSteps.length - 1; i += 1) {
      press(tree, 'Next step');
    }
    expect(allText(tree)).toContain(`${tourSteps.length} / ${tourSteps.length}`);

    press(tree, 'Done');
    expect(mockMarkTourCompleted).toHaveBeenCalledTimes(1);
  });

  test('Skip does not bounce back open while the gate is still "should show"', () => {
    // Regression: close() hides optimistically before markTourCompleted() flips
    // the gate. The open effect is edge-guarded (keyed on the gate, not `visible`)
    // so it must not re-open. Here the mocked gate stays true across dismissal.
    const tree = mount();
    expect(queryA11y(tree, 'Skip tour')).toBeDefined();

    press(tree, 'Skip tour');
    expect(mockMarkTourCompleted).toHaveBeenCalledTimes(1);
    // Overlay unmounts and stays gone even though shouldShowFirstLaunchTour is still true.
    expect(queryA11y(tree, 'Skip tour')).toBeUndefined();
  });

  test('renders nothing and drives no navigation when the gate is off', () => {
    mockShouldShow = false;
    const tree = mount();
    expect(mockDispatch).not.toHaveBeenCalled();
    expect(queryA11y(tree, 'Skip tour')).toBeUndefined();
    expect(tree.toJSON()).toBeNull();
  });
});
