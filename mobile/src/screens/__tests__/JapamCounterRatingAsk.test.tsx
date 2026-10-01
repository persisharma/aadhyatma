import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { FontScaleProvider } from '@/contexts/FontScaleContext';
import { ThemeProvider } from '@/theme/ThemeContext';

/**
 * §54 rating moment `mala-complete`: leaving the japam counter after finishing a
 * mala reports the moment (the gate decides whether the sheet opens). A card over
 * the beads mid-japa is deliberately NOT done, so the trigger rides on screen
 * blur, and only when at least one full round was completed this visit.
 */

const mockRequestAsk = jest.fn();
jest.mock('@/contexts/ratingAsk', () => ({ useRatingAsk: () => mockRequestAsk }));

// Real useFocusEffect needs a NavigationContainer; emulate its unmount contract:
// run the callback on mount, run its returned cleanup on unmount (= blur here).
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (cb: () => (() => void) | void) => {
    const R = require('react');
    R.useEffect(() => {
      const cleanup = cb();
      return () => {
        if (typeof cleanup === 'function') cleanup();
      };
    }, []);
  },
}));

// Controllable counter: each increment completes one more round.
let mockRounds = 0;
const mockIncrement = jest.fn(() => {
  mockRounds += 1;
  return { count: 0, rounds: mockRounds };
});
jest.mock('@/contexts/JapamCounterContext', () => ({
  useJapamCounter: () => ({
    getEntry: () => ({ count: 0, rounds: mockRounds }),
    increment: mockIncrement,
    resetBeads: jest.fn(),
    clear: jest.fn(),
  }),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve<string | null>(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(() => Promise.resolve()),
  impactAsync: jest.fn(() => Promise.resolve()),
  NotificationFeedbackType: { Success: 'success' },
  ImpactFeedbackStyle: { Light: 'light' },
}));
jest.mock('expo-linear-gradient', () => {
  const r = require('react');
  const { View } = require('react-native');
  return { LinearGradient: ({ children, ...p }: Record<string, unknown>) => r.createElement(View, p, children) };
});
jest.mock('react-native-view-shot', () => ({ captureRef: jest.fn(() => Promise.resolve('x')) }));
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(false)),
  shareAsync: jest.fn(() => Promise.resolve()),
}));
jest.mock('@/components/JapamAudioPlayer', () => () => null);
jest.mock('@/screens/JapamAlarmsScreen', () => ({ AlarmEditorSheet: () => null }));
jest.mock('@/contexts/JapamAlarmsContext', () => ({
  useJapamAlarms: () => ({ addAlarm: jest.fn(), updateAlarm: jest.fn(), removeAlarm: jest.fn() }),
}));

const { GitaLanguageProvider } = jest.requireActual<typeof import('@/data/gita/language')>(
  '@/data/gita/language'
);
const { ShareProvider } = jest.requireActual<typeof import('@/utils/shareVerse')>('@/utils/shareVerse');
const JapamCounterScreen = jest.requireActual<typeof import('../JapamCounterScreen')>(
  '../JapamCounterScreen'
).default;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nav: any = { goBack() {}, navigate() {}, replace() {} };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const route: any = { params: { mantraId: 'gayatri-mantra' } };

async function render(): Promise<TestRenderer.ReactTestRenderer> {
  let tree: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <FontScaleProvider>
        <ThemeProvider>
          <GitaLanguageProvider initialLang="hi">
            <ShareProvider>
              <JapamCounterScreen navigation={nav} route={route} />
            </ShareProvider>
          </GitaLanguageProvider>
        </ThemeProvider>
      </FontScaleProvider>
    );
  });
  return tree!;
}

function tapBead(tree: TestRenderer.ReactTestRenderer): void {
  const bead = tree.root.findAll(
    (n) =>
      typeof n.props.accessibilityLabel === 'string' &&
      n.props.accessibilityLabel.includes('Tap to count one bead') &&
      typeof n.props.onPress === 'function'
  )[0];
  act(() => bead.props.onPress());
}

describe('JapamCounter reports the mala-complete rating moment on exit', () => {
  beforeEach(() => {
    mockRequestAsk.mockClear();
    mockIncrement.mockClear();
    mockRounds = 0;
  });

  test('completing a round then leaving reports mala-complete', async () => {
    const tree = await render();
    tapBead(tree); // one tap → one completed round (mocked counter)
    act(() => tree.unmount());
    expect(mockRequestAsk).toHaveBeenCalledWith('mala-complete');
  });

  test('leaving without completing a round reports nothing', async () => {
    const tree = await render();
    act(() => tree.unmount());
    expect(mockRequestAsk).not.toHaveBeenCalled();
  });
});
