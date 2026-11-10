import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Alert, Animated, Text, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { Lang } from '@/data/gita/language';
import { FontScaleProvider } from '@/contexts/FontScaleContext';
import { ThemeProvider } from '@/theme/ThemeContext';

/**
 * Japa sankalp on the counter (design.md §35.2): take a vow of N malas or N japa,
 * watch it advance with every counted bead, complete it with a notice + haptic,
 * keep it through Reset, change it, or set it aside — through the real provider.
 */

const mockGetItem = jest.fn((_key: string) => Promise.resolve<string | null>(null));
jest.mock('@/utils/useReducedMotion', () => ({ useReducedMotion: () => true }));
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (effect: () => void | (() => void)) => require('react').useEffect(effect, [effect]),
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: (key: string) => mockGetItem(key),
  setItem: jest.fn(() => Promise.resolve()),
}));
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(() => Promise.resolve()),
  impactAsync: jest.fn(() => Promise.resolve()),
  NotificationFeedbackType: { Success: 'success' },
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
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

const nav: any = { goBack() {}, navigate() {}, replace() {} };
const MANTRA = 'om-namah-shivaya';

let mounted: TestRenderer.ReactTestRenderer | null = null;
beforeEach(() => {
  jest.spyOn(Animated, 'timing').mockImplementation(() => ({ start: jest.fn(), stop: jest.fn(), reset: jest.fn() }));
  mockGetItem.mockReset().mockResolvedValue(null);
  jest.mocked(Haptics.notificationAsync).mockClear();
});
afterEach(() => {
  act(() => mounted?.unmount());
  mounted = null;
  jest.restoreAllMocks();
});

function withStoredSankalp(sankalp: Record<string, unknown>) {
  mockGetItem.mockImplementation((key: string) =>
    Promise.resolve(key === '@vedansh/japam-sankalp' ? JSON.stringify({ [MANTRA]: sankalp }) : null)
  );
}

async function renderJapam(lang: Lang = 'hi'): Promise<TestRenderer.ReactTestRenderer> {
  let tree: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <FontScaleProvider>
        <ThemeProvider>
          <GitaLanguageProvider initialLang={lang}>
            <ShareProvider>
              <JapamCounterProvider>
                <JapamCounterScreen navigation={nav} route={{ key: 'k', name: 'JapamCounter', params: { mantraId: MANTRA } } as any} />
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

const pressable = (tree: TestRenderer.ReactTestRenderer, match: (p: Record<string, unknown>) => boolean) =>
  tree.root.findAll((n) => typeof n.props.onPress === 'function' && match(n.props))[0];
const byTestId = (tree: TestRenderer.ReactTestRenderer, id: string) => pressable(tree, (p) => p.testID === id);
const byLabel = (tree: TestRenderer.ReactTestRenderer, label: string) =>
  pressable(tree, (p) => p.accessibilityLabel === label);
const strip = (tree: TestRenderer.ReactTestRenderer) => byTestId(tree, 'japa-sankalp-strip');
const amountInput = (tree: TestRenderer.ReactTestRenderer) =>
  tree.root.findAll((n) => n.type === TextInput && n.props.testID === 'japa-sankalp-amount')[0];
const tap = async (tree: TestRenderer.ReactTestRenderer, times = 1) => {
  for (let i = 0; i < times; i++) {
    await act(async () => {
      byTestId(tree, 'japam-counter-mala').props.onPress();
    });
  }
};
const press = async (node: TestRenderer.ReactTestInstance) => {
  await act(async () => {
    node.props.onPress();
  });
};

describe('Japa sankalp on the counter (§35.2)', () => {
  test('fresh counter offers the opener and no strip; taking 1 mala shows progress', async () => {
    const tree = await renderJapam();
    expect(strip(tree)).toBeUndefined();
    await press(byLabel(tree, 'Take a japa sankalp'));
    // Defaults to 11 malas with its japa equivalent.
    expect(amountInput(tree).props.value).toBe('11');
    expect(texts(tree)).toContain('= 1,188 जप');
    await press(byTestId(tree, 'japa-sankalp-preset-1'));
    await press(byLabel(tree, 'Take this sankalp'));
    expect(String(strip(tree).props.accessibilityLabel)).toMatch(/^Japa sankalp, 0 of 1 mala\./);
    expect(byLabel(tree, 'Take a japa sankalp')).toBeUndefined();
    expect(texts(tree)).toContain('0 / 1 माला');
  });

  test('beads advance the vow; reaching it shows the notice and a Success haptic once', async () => {
    const tree = await renderJapam();
    await press(byLabel(tree, 'Take a japa sankalp'));
    await act(async () => {
      byTestId(tree, 'japa-sankalp-unit-japa').props.onPress();
    });
    expect(amountInput(tree).props.value).toBe('1188');
    await act(async () => {
      amountInput(tree).props.onChangeText('3');
    });
    await press(byLabel(tree, 'Take this sankalp'));
    await tap(tree, 2);
    expect(String(strip(tree).props.accessibilityLabel)).toMatch(/^Japa sankalp, 2 of 3 japa\./);
    expect(Haptics.notificationAsync).not.toHaveBeenCalled();
    await tap(tree);
    expect(String(strip(tree).props.accessibilityLabel)).toMatch(/^Japa sankalp, 3 of 3 japa, complete\./);
    expect(texts(tree)).toContain('संकल्प पूर्ण 🙏');
    expect(Haptics.notificationAsync).toHaveBeenCalledTimes(1);
    await tap(tree);
    expect(String(strip(tree).props.accessibilityLabel)).toMatch(/3 of 3 japa, complete/);
    expect(Haptics.notificationAsync).toHaveBeenCalledTimes(1);
  });

  test('Infinity (अनंत) shows the same opener/strip and its loops fill the vow', async () => {
    withStoredSankalp({ unit: 'japa', amount: 2, done: 0, startedAt: 1, updatedAt: 1 });
    const tree = await renderJapam();
    await press(byTestId(tree, 'japam-style-infinity'));
    expect(String(strip(tree).props.accessibilityLabel)).toMatch(/^Japa sankalp, 0 of 2 japa\./);
    const loop = () => tree.root.findAll((n) => typeof n.props.onCycle === 'function')[0];
    // A paused Infinity session never counts.
    await act(async () => { loop().props.onCycle(); });
    expect(String(strip(tree).props.accessibilityLabel)).toMatch(/^Japa sankalp, 0 of 2 japa\./);
    await press(byTestId(tree, 'japam-counter-infinity')); // start looping
    await act(async () => { loop().props.onCycle(); });
    expect(String(strip(tree).props.accessibilityLabel)).toMatch(/^Japa sankalp, 1 of 2 japa\./);
    await act(async () => { loop().props.onCycle(); });
    expect(String(strip(tree).props.accessibilityLabel)).toMatch(/2 of 2 japa, complete/);
    expect(texts(tree)).toContain('संकल्प पूर्ण 🙏');
    expect(Haptics.notificationAsync).toHaveBeenCalledTimes(1);
    // Releasing the vow brings the opener back in Infinity too.
    await press(strip(tree));
    await press(byLabel(tree, 'Clear completed sankalp'));
    expect(byLabel(tree, 'Take a japa sankalp')).toBeDefined();
  });

  test('a vow restored complete on open does not replay the completion', async () => {
    withStoredSankalp({ unit: 'mala', amount: 1, done: 108, startedAt: 1, updatedAt: 2, completedAt: 2 });
    const tree = await renderJapam();
    expect(String(strip(tree).props.accessibilityLabel)).toMatch(/1 of 1 mala, complete/);
    expect(Haptics.notificationAsync).not.toHaveBeenCalled();
    // The completed vow offers a fresh one and clearing, with no confirmation.
    await press(strip(tree));
    expect(byLabel(tree, 'Take a new sankalp')).toBeDefined();
    const alert = jest.spyOn(Alert, 'alert');
    await press(byLabel(tree, 'Clear completed sankalp'));
    expect(alert).not.toHaveBeenCalled();
    expect(strip(tree)).toBeUndefined();
  });

  test('invalid targets disable the action and explain the range', async () => {
    const tree = await renderJapam('en');
    await press(byLabel(tree, 'Take a japa sankalp'));
    await act(async () => {
      amountInput(tree).props.onChangeText('0');
    });
    const confirm = byTestId(tree, 'japa-sankalp-confirm');
    expect(confirm.props.disabled).toBe(true);
    expect(texts(tree)).toContain('Enter a number from 1 to 10,000');
    await act(async () => {
      amountInput(tree).props.onChangeText('21');
    });
    expect(byTestId(tree, 'japa-sankalp-confirm').props.disabled).toBe(false);
    expect(texts(tree)).toContain('= 2,268 japa');
  });

  test('progress behind an open sheet never overwrites the target being typed', async () => {
    withStoredSankalp({ unit: 'mala', amount: 11, done: 0, startedAt: 1, updatedAt: 1 });
    const tree = await renderJapam();
    await press(strip(tree));
    await act(async () => {
      amountInput(tree).props.onChangeText('77');
    });
    await tap(tree, 2);
    expect(amountInput(tree).props.value).toBe('77');
    await press(byLabel(tree, 'Update sankalp target'));
    expect(String(strip(tree).props.accessibilityLabel)).toMatch(/^Japa sankalp, 0 of 77 malas\./);
    expect(texts(tree)).toContain('0 / 77 माला');
  });

  test('Reset keeps the vow and says so; setting aside asks first', async () => {
    withStoredSankalp({ unit: 'japa', amount: 500, done: 40, startedAt: 1, updatedAt: 1 });
    const tree = await renderJapam();
    await tap(tree, 3);
    await press(byLabel(tree, 'Reset or clear the count'));
    expect(texts(tree)).toContain('संकल्प की प्रगति सुरक्षित रहेगी।');
    await press(byLabel(tree, 'Clear bead count and rounds'));
    expect(String(strip(tree).props.accessibilityLabel)).toMatch(/^Japa sankalp, 43 of 500 japa\./);

    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    await press(strip(tree));
    await press(byLabel(tree, 'Set this sankalp aside'));
    expect(alert).toHaveBeenCalledTimes(1);
    expect(strip(tree)).toBeDefined();
    const buttons = alert.mock.calls[0][2]!;
    await act(async () => {
      buttons.find((b) => b.style === 'destructive')!.onPress!();
    });
    expect(strip(tree)).toBeUndefined();
    expect(byLabel(tree, 'Take a japa sankalp')).toBeDefined();
  });

  test.each<[Lang, string, string, string]>([
    ['hi', '12 / 21 माला', 'जप संकल्प', 'अब तक 1,336 जप'],
    ['en', '12 / 21 malas', 'Japa Sankalp', '1,336 japa so far'],
    ['gu', '12 / 21 માળા', 'જપ સંકલ્પ', 'અત્યાર સુધી 1,336 જપ'],
    ['kn', '12 / 21 ಮಾಲೆ', 'ಜಪ ಸಂಕಲ್ಪ', 'ಇದುವರೆಗೆ 1,336 ಜಪ'],
  ])('%s strip and sheet copy', async (lang, headline, title, soFar) => {
    withStoredSankalp({ unit: 'mala', amount: 21, done: 12 * 108 + 40, startedAt: 1, updatedAt: 1 });
    const tree = await renderJapam(lang);
    expect(texts(tree)).toContain(headline);
    await press(strip(tree));
    const shown = texts(tree);
    expect(shown).toContain(title);
    expect(shown).toContain(soFar);
  });
});
