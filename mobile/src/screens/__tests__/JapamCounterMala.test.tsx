import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import { FontScaleProvider } from '@/contexts/FontScaleContext';
import { ThemeProvider } from '@/theme/ThemeContext';

/**
 * The counter shows a turning mala instead of a bare numeral: a tap turns one
 * bead, a full round drops a mini mala into the tray and shows the Sumeru-turn
 * notice, and the top bar names the screen so the mantra appears only once.
 */

const mockGetItem = jest.fn((_key: string) => Promise.resolve<string | null>(null));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: (key: string) => mockGetItem(key),
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
const { JapamCounterProvider } = jest.requireActual<typeof import('@/contexts/JapamCounterContext')>(
  '@/contexts/JapamCounterContext'
);
const JapamCounterScreen = jest.requireActual<typeof import('../JapamCounterScreen')>(
  '../JapamCounterScreen'
).default;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nav: any = { goBack() {}, navigate() {}, replace() {} };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const route: any = { params: { mantraId: 'om-namah-shivaya' } };

let mounted: TestRenderer.ReactTestRenderer | null = null;
afterEach(() => {
  // Unmount so the Sumeru-notice timer and ring animations stop before teardown.
  act(() => mounted?.unmount());
  mounted = null;
});

async function renderJapam(): Promise<TestRenderer.ReactTestRenderer> {
  let tree: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <FontScaleProvider>
        <ThemeProvider>
          <GitaLanguageProvider initialLang="hi">
            <ShareProvider>
              <JapamCounterProvider>
                <JapamCounterScreen navigation={nav} route={route} />
              </JapamCounterProvider>
            </ShareProvider>
          </GitaLanguageProvider>
        </ThemeProvider>
      </FontScaleProvider>
    );
  });
  mounted = tree!;
  return tree!;
}

const texts = (tree: TestRenderer.ReactTestRenderer) =>
  tree.root.findAllByType(Text).map((n) => [n.props.children].flat().join(''));

function tapSurface(tree: TestRenderer.ReactTestRenderer) {
  return tree.root.findAll(
    (n) =>
      typeof n.props.onPress === 'function' &&
      String(n.props.accessibilityLabel ?? '').includes('Tap to count one bead')
  )[0];
}

describe('JapamCounter turning mala (design.md §35)', () => {
  test('top bar names the screen, so the mantra is not shown twice', async () => {
    const tree = await renderJapam();
    const t = texts(tree);
    expect(t).toContain('जप');
    expect(t.filter((s) => s === 'ॐ नमः शिवाय').length).toBeLessThanOrEqual(1);
  });

  test('a tap turns one bead and a full mala lands in the tray', async () => {
    const tree = await renderJapam();
    expect(texts(tree)).toContain('0 / 108');
    expect(texts(tree)).toContain('पहली माला आरम्भ');
    await act(async () => {
      tapSurface(tree).props.onPress();
    });
    expect(texts(tree)).toContain('1 / 108');
    await act(async () => {
      for (let i = 0; i < 107; i++) tapSurface(tree).props.onPress();
    });
    const t = texts(tree);
    expect(t).toContain('0 / 108');
    expect(t).toContain('1'); // tray count
    expect(t).toContain('सुमेरु · माला पलटें');
    expect(t).not.toContain('पहली माला आरम्भ');
  });
});
