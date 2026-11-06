import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Lang } from '@/data/gita/language';
import JapamMala from '@/components/JapamMala';
import JapamInfinity from '@/components/JapamInfinity';
import { FontScaleProvider } from '@/contexts/FontScaleContext';
import { ThemeProvider } from '@/theme/ThemeContext';

/**
 * The counter shows a turning mala instead of a bare numeral: a tap turns one
 * bead, a full round drops a mini mala into the tray and shows the Sumeru-turn
 * notice, and the top bar names the screen so the mantra appears only once.
 */

const mockGetItem = jest.fn((_key: string) => Promise.resolve<string | null>(null));
// The screen uses useFocusEffect (§54 mala-complete exit trigger); mock the ESM
// package so requireActual of the screen parses.
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
beforeEach(() => {
  mockGetItem.mockReset().mockResolvedValue(null);
  jest.mocked(AsyncStorage.setItem).mockClear();
});
afterEach(() => {
  // Unmount so the Sumeru-notice timer and ring animations stop before teardown.
  act(() => mounted?.unmount());
  mounted = null;
});

async function renderJapam(mantraId = 'om-namah-shivaya', lang: Lang = 'hi'): Promise<TestRenderer.ReactTestRenderer> {
  let tree: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <FontScaleProvider>
        <ThemeProvider>
          <GitaLanguageProvider initialLang={lang}>
            <ShareProvider>
              <JapamCounterProvider>
                <JapamCounterScreen navigation={nav} route={{ ...route, params: { mantraId } }} />
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

function byLabel(tree: TestRenderer.ReactTestRenderer, label: string) {
  return tree.root.findAll(
    (n) => typeof n.props.onPress === 'function' && n.props.accessibilityLabel === label
  )[0];
}

const beadLabel = (tree: TestRenderer.ReactTestRenderer) =>
  String(tapSurface(tree).props.accessibilityLabel);

function tapSurface(tree: TestRenderer.ReactTestRenderer) {
  return tree.root.findAll(
    (n) =>
      typeof n.props.onPress === 'function' &&
      /^japam-counter-(mala|infinity)$/.test(String(n.props.testID ?? ''))
  )[0];
}

describe('JapamCounter turning mala (design.md §35)', () => {
  const choice = (tree: TestRenderer.ReactTestRenderer, style: string) => tree.root.findAll(
    (n) => n.props.testID === `japam-style-${style}` && typeof n.props.onPress === 'function'
  )[0];

  test('switching styles retains taps, audio counts, rollover and reset in the real provider', async () => {
    const tree = await renderJapam();
    await act(async () => { tapSurface(tree).props.onPress(); });
    await act(async () => { choice(tree, 'infinity').props.onPress(); });
    expect(tree.root.findAll((n) => n.props.testID === 'japam-infinity').length).toBeGreaterThan(0);
    expect(tree.root.findAllByType(JapamMala)).toHaveLength(0);
    expect(tree.root.findAllByType(JapamInfinity)).toHaveLength(1);
    expect(choice(tree, 'infinity').props.accessibilityState.selected).toBe(true);
    expect(beadLabel(tree)).toContain('1 of 108');
    expect(texts(tree)).toContain('शुरू करने के लिए स्पर्श करें');
    await act(async () => { tapSurface(tree).props.onPress(); });
    expect(texts(tree)).toContain('रोकने के लिए स्पर्श करें');
    expect(beadLabel(tree)).toContain('1 of 108');
    const audio = tree.root.findAll((n) => typeof n.props.onIteration === 'function')[0];
    await act(async () => { audio.props.onIteration(107); });
    expect(beadLabel(tree)).toContain('0 of 108');
    expect(beadLabel(tree)).toContain('1 malas completed');
    expect(texts(tree)).toContain('माला पूर्ण · 108 जप');
    await act(async () => { tapSurface(tree).props.onPress(); });
    expect(beadLabel(tree)).toContain('0 of 108');
    await act(async () => { choice(tree, 'mala').props.onPress(); });
    expect(tree.root.findAllByType(JapamMala)).toHaveLength(1);
    expect(tree.root.findAllByType(JapamInfinity)).toHaveLength(0);
    await act(async () => { tapSurface(tree).props.onPress(); });
    expect(beadLabel(tree)).toContain('1 of 108');
    expect(beadLabel(tree)).toContain('1 malas completed');
    await act(async () => { byLabel(tree, 'Reset or clear the count').props.onPress(); });
    await act(async () => { byLabel(tree, 'Reset bead count').props.onPress(); });
    expect(beadLabel(tree)).toContain('0 of 108');
    expect(beadLabel(tree)).toContain('1 malas completed');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('@vedansh/japam-style', '"infinity"');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('@vedansh/japam-style', '"mala"');
  });

  test.each((['hi', 'en', 'gu', 'kn'] as Lang[]).flatMap(lang => (['M', 'L'] as const).map(size => ({ lang, size }))))('restores infinity in $lang at $size without changing saved progress', async ({ lang, size }) => {
    mockGetItem.mockImplementation((key: string) => Promise.resolve(
      key === '@vedansh/japam-style' ? '"infinity"'
        : key === '@vedansh/font-scale' ? size
        : key === '@vedansh/japam-counter' ? JSON.stringify({ 'om-namah-shivaya': { count: 107, rounds: 2, updatedAt: 1 } })
        : null
    ));
    const tree = await renderJapam('om-namah-shivaya', lang);
    expect(choice(tree, 'infinity').props.accessibilityState.selected).toBe(true);
    expect(choice(tree, 'infinity').props.accessibilityState.checked).toBe(true);
    expect(beadLabel(tree)).toContain('107 of 108');
    expect(beadLabel(tree)).toContain('2 malas completed');
    expect(texts(tree)).toContain({ hi: 'शुरू करने के लिए स्पर्श करें', en: 'Tap to start', gu: 'શરૂ કરવા માટે સ્પર્શ કરો', kn: 'ಪ್ರಾರಂಭಿಸಲು ಸ್ಪರ್ಶಿಸಿ' }[lang]);
    await act(async () => { tapSurface(tree).props.onPress(); });
    expect(texts(tree)).toContain({ hi: 'रोकने के लिए स्पर्श करें', en: 'Tap to pause', gu: 'રોકવા માટે સ્પર્શ કરો', kn: 'ನಿಲ್ಲಿಸಲು ಸ್ಪರ್ಶಿಸಿ' }[lang]);
    expect(beadLabel(tree)).toContain('107 of 108');
    expect(AsyncStorage.setItem).not.toHaveBeenCalledWith('@vedansh/japam-style', expect.anything());
  });

  test('top bar names the screen, so the mantra is not shown twice', async () => {
    const tree = await renderJapam();
    const t = texts(tree);
    expect(t).toContain('जपमाला');
    expect(t.filter((s) => s === 'ॐ नमः शिवाय').length).toBeLessThanOrEqual(1);
  });

  test('a tap turns one bead and a full mala lands in the tray', async () => {
    const tree = await renderJapam();
    expect(beadLabel(tree)).toContain('0 of 108');
    expect(texts(tree)).toContain('पहली माला आरम्भ');
    await act(async () => {
      tapSurface(tree).props.onPress();
    });
    expect(beadLabel(tree)).toContain('1 of 108');
    expect(texts(tree)).toContain('/ 108');
    await act(async () => {
      for (let i = 0; i < 107; i++) tapSurface(tree).props.onPress();
    });
    const t = texts(tree);
    expect(beadLabel(tree)).toContain('0 of 108');
    expect(t).toContain('1'); // tray count
    expect(t).toContain('सुमेरु · माला पलटें');
    expect(t).not.toContain('पहली माला आरम्भ');
  });

  test('the two reset buttons live behind one ↺ icon', async () => {
    const tree = await renderJapam();
    const resetIcon = () => byLabel(tree, 'Reset or clear the count');
    // Nothing to reset yet: the icon is disabled and no reset copy is on screen.
    expect(resetIcon().props.disabled).toBe(true);
    expect(texts(tree)).not.toContain('बीज पुनः ०');
    await act(async () => {
      for (let i = 0; i < 5; i++) tapSurface(tree).props.onPress();
    });
    expect(resetIcon().props.disabled).toBe(false);
    await act(async () => {
      resetIcon().props.onPress();
    });
    expect(texts(tree)).toContain('बीज पुनः ०');
    expect(texts(tree)).toContain('सब साफ़');
    await act(async () => {
      byLabel(tree, 'Reset bead count').props.onPress();
    });
    expect(beadLabel(tree)).toContain('0 of 108');
  });

  test('Radha naam japa counts one bead per name', async () => {
    const tree = await renderJapam('radha-naam');
    const t = texts(tree);
    expect(t).toContain('राधा');
    expect(t).toContain('राधा नाम जप');
    expect(t).toContain('स्पर्श करें · हर नाम एक मनका');
    expect(t.some((x) => /^आज \d+ नाम$/.test(x))).toBe(true);
    await act(async () => {
      tapSurface(tree).props.onPress();
    });
    expect(beadLabel(tree)).toContain('1 of 108');
  });

  test('a stotram shloka is chanted like a mantra (§35.1)', async () => {
    const tree = await renderJapam('sloka.shiva-strotam.4.5');
    const t = texts(tree);
    // The shloka itself, named under its lines so the counter says which one.
    expect(t.some((x) => x.startsWith('सहस्रलोचनप्रभृत्यशेषलेखशेखर'))).toBe(true);
    expect(t).toContain('शिव ताण्डव स्तोत्रम् · श्लोक 5');
    expect(t).toContain('स्पर्श करें · हर श्लोक एक मनका');
    expect(t.some((x) => /^आज \d+ श्लोक$/.test(x))).toBe(true);
    await act(async () => {
      tapSurface(tree).props.onPress();
    });
    expect(beadLabel(tree)).toContain('1 of 108');
  });
});
