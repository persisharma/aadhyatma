import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { FontScaleProvider } from '@/contexts/FontScaleContext';
import { ThemeProvider } from '@/theme/ThemeContext';
import { typography as baseType } from '@/theme/typography';

/**
 * JapamCounter's mantra is reading text, so it scales with the global M/L size
 * on EVERY device (no per-device hardcoding that would make M/L a no-op on small
 * screens). To keep the long 4-line mantras (gayatri, hare-krishna) from clipping
 * at the larger size, the tap surface is a ScrollView — it scrolls instead of
 * clipping. These tests guard both halves: the mantra scales, and it's scrollable.
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

async function renderJapam(persistedScale: string | null): Promise<TestRenderer.ReactTestRenderer> {
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
  return tree!;
}

function mantraLineSize(tree: TestRenderer.ReactTestRenderer): number | undefined {
  const node = tree.root.findAllByType(Text).find((n) => n.props.children === FIRST_LINE);
  return node ? StyleSheet.flatten(node.props.style).fontSize : undefined;
}

describe('JapamCounter scales the mantra with reading-size, on a scrollable surface', () => {
  beforeEach(() => mockGetItem.mockReset());

  test('mantra scales with M/L so the control takes effect on every device', async () => {
    const atM = mantraLineSize(await renderJapam(null));
    const atL = mantraLineSize(await renderJapam('L'));
    expect(atM).toBe(baseType.verse.fontSize); // 23 at M
    expect(atL).toBe(Math.round(baseType.verse.fontSize * 1.15)); // 26 at L
    expect(atL!).toBeGreaterThan(atM!);
  });

  test('the tap surface is a ScrollView, so a larger mantra scrolls instead of clipping', async () => {
    const tree = await renderJapam('L');
    expect(tree.root.findAllByType(ScrollView).length).toBeGreaterThan(0);
  });
});
