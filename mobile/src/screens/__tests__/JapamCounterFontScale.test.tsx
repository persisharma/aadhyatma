import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { StyleSheet, Text } from 'react-native';
import { FontScaleProvider } from '@/contexts/FontScaleContext';
import { ThemeProvider } from '@/theme/ThemeContext';
import { typography as baseType } from '@/theme/typography';

/**
 * JapamCounter renders the mantra inside a FIXED, non-scrolling tap-to-count
 * surface (`tapArea`: flex:1, overflow:'hidden'). If the mantra text inflated
 * with the global reading-size scale, the longest mantras (gayatri,
 * hare-krishna — 4 lines) overflow and get CLIPPED — and the smallest devices
 * clip first. So this constrained surface must keep its own device-adaptive
 * size, INDEPENDENT of M/L. This guards that contract on every device.
 */

const mockGetItem = jest.fn((_key: string) => Promise.resolve<string | null>(null));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: (key: string) => mockGetItem(key),
  setItem: jest.fn(() => Promise.resolve()),
}));
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  impactAsync: jest.fn(),
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
const { findJapamMantra } = jest.requireActual<typeof import('@/data/japam')>('@/data/japam');

// gayatri = 4-line mantra (one of the two that clip at L)
const FIRST_LINE = findJapamMantra('gayatri-mantra')!.lines[0];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nav: any = { goBack() {}, navigate() {}, replace() {} };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const route: any = { params: { mantraId: 'gayatri-mantra' } };

async function mantraLineSize(persistedScale: string | null): Promise<number | undefined> {
  mockGetItem.mockResolvedValue(persistedScale);
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
  const node = tree!.root.findAllByType(Text).find((n) => n.props.children === FIRST_LINE);
  return node ? StyleSheet.flatten(node.props.style).fontSize : undefined;
}

describe('JapamCounter mantra size is decoupled from reading-size (fixed tap surface)', () => {
  beforeEach(() => mockGetItem.mockReset());

  test('mantra does NOT inflate at Large (would clip the overflow:hidden surface)', async () => {
    const atM = await mantraLineSize(null);
    const atL = await mantraLineSize('L');
    expect(atM).toBeDefined();
    // Same size regardless of scale → can't overflow the fixed surface on any device.
    expect(atL).toBe(atM);
    // And it's the surface's own (unscaled) size, not the inflated reading size.
    expect(atL).toBe(baseType.verse.fontSize);
  });
});
