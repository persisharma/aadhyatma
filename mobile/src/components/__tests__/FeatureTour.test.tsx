import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { InteractionManager, Modal, Text } from 'react-native';
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

// Minimal theme stub — FeatureTour only reads a handful of tokens.
jest.mock('@/theme/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      parchment: '#fff', parchmentSoft: '#fff', parchmentHighlight: '#fff',
      parchmentGradientEnd: '#fff', divider: '#ccc', ink: '#000', inkSoft: '#333',
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

type Pressable = { props: { accessibilityLabel?: string; onPress?: () => void } };

function findByA11y(tree: TestRenderer.ReactTestRenderer, label: string): Pressable {
  return tree.root
    .findAll((n) => n.props?.accessibilityLabel === label)
    .find((n) => typeof n.props?.onPress === 'function') as unknown as Pressable;
}

function press(tree: TestRenderer.ReactTestRenderer, label: string) {
  act(() => {
    findByA11y(tree, label).props.onPress!();
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
});
afterEach(() => runAfter.mockRestore());

function mount(): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(<FeatureTour />);
  });
  return tree;
}

describe('FeatureTour navigation', () => {
  test('navigates to the first step on open and shows 1 / N', () => {
    const tree = mount();
    expect(mockDispatch).toHaveBeenCalled();
    const first = mockDispatch.mock.calls[0][0];
    expect(first.payload.name).toBe(tourSteps[0].navigateTo.name); // HomeTab
    expect(allText(tree)).toContain(`1 / ${tourSteps.length}`);
  });

  test('Next advances the step and drives navigation to the next surface', () => {
    const tree = mount();
    mockDispatch.mockClear();

    press(tree, 'Next step');

    expect(allText(tree)).toContain(`2 / ${tourSteps.length}`);
    const nav = mockDispatch.mock.calls.at(-1)![0];
    expect(nav.payload.name).toBe(tourSteps[1].navigateTo.name); // PanchangTab
  });

  test('Back is a no-op on the first step (guarded), Skip completes the tour', () => {
    const tree = mount();
    // Back exists but is disabled on step 0; pressing does not move past 1/N.
    press(tree, 'Previous step');
    expect(allText(tree)).toContain(`1 / ${tourSteps.length}`);

    press(tree, 'Skip tour');
    expect(mockMarkTourCompleted).toHaveBeenCalledTimes(1);
  });

  test('walking to the last step shows Done and completing persists', () => {
    const tree = mount();
    // Advance to the final step.
    for (let i = 0; i < tourSteps.length - 1; i += 1) {
      press(tree, 'Next step');
    }
    expect(allText(tree)).toContain(`${tourSteps.length} / ${tourSteps.length}`);

    // On the last step the primary action is "Done".
    press(tree, 'Done');
    expect(mockMarkTourCompleted).toHaveBeenCalledTimes(1);
  });

  test('stays hidden and drives no navigation when the gate is off', () => {
    mockShouldShow = false;
    const tree = mount();
    // No navigation dispatched when the tour should not show.
    expect(mockDispatch).not.toHaveBeenCalled();
    // The overlay Modal is present but not visible.
    expect(tree.root.findByType(Modal).props.visible).toBe(false);
  });
});
