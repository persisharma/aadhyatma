import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Animated, Text } from 'react-native';
import * as ReactNative from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Lang } from '@/data/gita/language';
import JapamMala, { JapamMalaTray } from '@/components/JapamMala';
import JapamInfinity from '@/components/JapamInfinity';
import JapamAudioPlayer from '@/components/JapamAudioPlayer';
import mandalaMeasurements from '@/components/__tests__/fixtures/japamMandalaWidths.json';
import { compactJapamReadingLines } from '@/components/japamReadingLayout';
import { findJapamMantra } from '@/data/japam';
import { transliterateDevanagari } from '@/utils/transliterate';
import { FontScaleProvider } from '@/contexts/FontScaleContext';
import { ThemeProvider } from '@/theme/ThemeContext';

/**
 * The counter shows a turning mala instead of a bare numeral: a tap turns one
 * bead, a full round drops a mini mala into the tray and shows the Sumeru-turn
 * notice, and the top bar names the screen so the mantra appears only once.
 */

const mockGetItem = jest.fn((_key: string) => Promise.resolve<string | null>(null));
jest.mock('@/utils/useReducedMotion', () => ({ useReducedMotion: () => true }));
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nav: any = { goBack() {}, navigate() {}, replace() {} };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const route: any = { params: { mantraId: 'om-namah-shivaya' } };

let mounted: TestRenderer.ReactTestRenderer | null = null;
beforeEach(() => {
  jest.spyOn(Animated, 'timing').mockImplementation(() => ({ start: jest.fn(), stop: jest.fn(), reset: jest.fn() }));
  mockGetItem.mockReset().mockResolvedValue(null);
  jest.mocked(AsyncStorage.setItem).mockClear();
});
afterEach(() => {
  // Unmount so the Sumeru-notice timer and ring animations stop before teardown.
  act(() => mounted?.unmount());
  mounted = null;
  jest.restoreAllMocks();
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
    await act(async () => { audio.props.onPlayingChange(true); });
    const loop = tree.root.findAll((n) => typeof n.props.onCycle === 'function')[0];
    await act(async () => { loop.props.onCycle(); });
    expect(beadLabel(tree)).toContain('1 of 108'); // audio owns counting; no double count
    await act(async () => { audio.props.onIteration(107); });
    expect(beadLabel(tree)).toContain('0 of 108');
    expect(beadLabel(tree)).toContain('1 malas completed');
    expect(texts(tree)).toContain('माला पूर्ण · 108 जप');
    await act(async () => { tapSurface(tree).props.onPress(); });
    expect(beadLabel(tree)).toContain('0 of 108');
    await act(async () => { audio.props.onIteration(1); });
    expect(beadLabel(tree)).toContain('0 of 108'); // paused Infinity ignores late audio ticks
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

  test('silent Infinity increments per completed loop, rolls over at 108 and stops counting on pause', async () => {
    const tree = await renderJapam();
    await act(async () => { choice(tree, 'infinity').props.onPress(); });
    const cycle = () => tree.root.findAll((n) => typeof n.props.onCycle === 'function')[0].props.onCycle();
    await act(async () => { cycle(); });
    expect(beadLabel(tree)).toContain('0 of 108');
    await act(async () => { tapSurface(tree).props.onPress(); });
    await act(async () => { cycle(); });
    expect(beadLabel(tree)).toContain('1 of 108');
    await act(async () => { for (let i = 0; i < 107; i++) cycle(); });
    expect(beadLabel(tree)).toContain('0 of 108');
    expect(beadLabel(tree)).toContain('1 malas completed');
    await act(async () => { tapSurface(tree).props.onPress(); });
    await act(async () => { cycle(); });
    expect(beadLabel(tree)).toContain('0 of 108');
    expect(beadLabel(tree)).toContain('1 malas completed');
  });

  test('every automatic Infinity count gets the same firm tick for any mantra; taps stay light', async () => {
    // Regression: Light ticks seconds apart (shlokas, long mantras) went unfelt on
    // iPhone while 0.88 s naam loops kept the Taptic Engine warm.
    const haptics = jest.requireMock('expo-haptics') as { impactAsync: jest.Mock };
    const tree = await renderJapam();
    haptics.impactAsync.mockClear();
    await act(async () => { tapSurface(tree).props.onPress(); });
    expect(haptics.impactAsync).toHaveBeenLastCalledWith('light');
    await act(async () => { choice(tree, 'infinity').props.onPress(); });
    await act(async () => { tapSurface(tree).props.onPress(); });
    haptics.impactAsync.mockClear();
    await act(async () => { tree.root.findAll((n) => typeof n.props.onCycle === 'function')[0].props.onCycle(); });
    expect(haptics.impactAsync).toHaveBeenCalledTimes(1);
    expect(haptics.impactAsync).toHaveBeenLastCalledWith('medium');
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
    expect(texts(tree).some(text => /^(आज|આજે|ಇಂದು) \d+|^\d+ (japa|names|shloka) today$/.test(text))).toBe(false);
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
    expect(t.some((x) => /^आज \d+ नाम$/.test(x))).toBe(false);
    await act(async () => {
      tapSurface(tree).props.onPress();
    });
    expect(beadLabel(tree)).toContain('1 of 108');
  });

  // Nov 2026 device report: the enlarged सीता राम cut the ी loop above the
  // shirorekha (35/49 = 1.40× leading). Every script line of every naam entry,
  // at both reading sizes, keeps ≥1.5× — the house floor for Indic glyphs.
  test.each(['radha-naam', 'jai-shri-ram', 'sita-ram-naam'].flatMap(id =>
    (['hi', 'gu', 'kn'] as Lang[]).flatMap(lang => (['M', 'L'] as const).map(size => ({ id, lang, size })))))
  ('$id naam line keeps room for top vowel signs in $lang / $size', async ({ id, lang, size }) => {
    mockGetItem.mockImplementation((key: string) => Promise.resolve(key === '@vedansh/font-scale' ? size : null));
    const tree = await renderJapam(id, lang);
    const line = findJapamMantra(id)!.lines[0];
    const shown = lang === 'gu' || lang === 'kn' ? transliterateDevanagari(line, lang) : line;
    const big = tree.root.findAllByType(Text).filter((n) => [n.props.children].flat().join('') === shown
      && (ReactNative.StyleSheet.flatten(n.props.style)?.fontSize ?? 0) >= 30);
    expect(big).toHaveLength(1);
    for (const node of big) {
      const { fontSize, lineHeight } = ReactNative.StyleSheet.flatten(node.props.style);
      expect(lineHeight / fontSize).toBeGreaterThanOrEqual(1.5);
    }
  });

  test('a stotram shloka is chanted like a mantra (§35.1)', async () => {
    const tree = await renderJapam('sloka.shiva-strotam.4.5');
    const t = texts(tree);
    // The shloka itself, named under its lines so the counter says which one.
    expect(t.some((x) => x.startsWith('सहस्रलोचनप्रभृत्यशेषलेखशेखर'))).toBe(true);
    expect(t).toContain('शिव ताण्डव स्तोत्रम् · श्लोक 5');
    expect(t).toContain('स्पर्श करें · हर श्लोक एक मनका');
    expect(t.some((x) => /^आज \d+ श्लोक$/.test(x))).toBe(false);
    await act(async () => {
      tapSurface(tree).props.onPress();
    });
    expect(beadLabel(tree)).toContain('1 of 108');
  });
  test.each((['mala', 'infinity'] as const).flatMap(style =>
    (['hi', 'en', 'gu', 'kn'] as Lang[]).flatMap(lang =>
      (['M', 'L'] as const).map(size => ({ style, lang, size }))))
  )('shows only current beads and completed malas in $style / $lang / $size', async ({ style, lang, size }) => {
    mockGetItem.mockImplementation((key: string) => Promise.resolve(
      key === '@vedansh/japam-style' ? JSON.stringify(style)
        : key === '@vedansh/font-scale' ? size
        : key === '@vedansh/japam-counter' ? JSON.stringify({ 'om-namah-shivaya': { count: 107, rounds: 2, updatedAt: 1 } })
        : null
    ));
    const tree = await renderJapam('om-namah-shivaya', lang);
    expect(beadLabel(tree)).toContain('107 of 108');
    expect(tree.root.findByType(JapamMalaTray).props.rounds).toBe(2);
    if (style === 'infinity') {
      const phase = tree.root.findByType(JapamInfinity).props.phase;
      expect(phase).toBeDefined();
      expect(tree.root.findAll(node => node.props.progress === phase && node.props.referenceLines).length).toBeGreaterThan(0);
      expect(tree.root.findAll(node => node.props.testID === 'karaoke-text').length).toBeGreaterThan(0);
    } else {
      expect(tree.root.findAll(node => node.props.testID === 'karaoke-text')).toHaveLength(0);
    }

    expect(texts(tree).some(text => /^(आज|આજે|ಇಂದು) \d+|^\d+ (japa|names|shloka) today$/.test(text))).toBe(false);
    expect(tree.root.findAll(node => node.props.accessibilityLabel === 'Reset or clear the count').length).toBeGreaterThan(0);
  });

  test.each(['hi', 'en', 'gu', 'kn'] as Lang[])('Gayatri cadence is based on canonical speech, independent of $lang UI text', async lang => {
    mockGetItem.mockImplementation(key => Promise.resolve(key === '@vedansh/japam-style' ? '"infinity"' : null));
    const tree = await renderJapam('gayatri-mantra', lang);
    expect(tree.root.findByType(JapamInfinity).props.cycleMs).toBe(4500);
  });

  test.each(['gayatri-mantra', 'hare-krishna-mahamantra'].flatMap(id => (['hi', 'en', 'gu', 'kn'] as Lang[]).flatMap(lang => (['M', 'L'] as const).map(size => ({ id, lang, size })))))
  ('compact $id keeps its complete $lang passage at $size below the measured frame', async ({ id, lang, size }) => {
    jest.spyOn(ReactNative.Dimensions, 'get').mockReturnValue({ width: 320, height: 568, scale: 2, fontScale: 1.5 });
    jest.spyOn(ReactNative, 'useWindowDimensions').mockReturnValue({ width: 320, height: 568, scale: 2, fontScale: 1.5 });
    mockGetItem.mockImplementation(key => Promise.resolve(key === '@vedansh/japam-style' ? '"infinity"'
      : key === '@vedansh/font-scale' ? size : null));
    const tree = await renderJapam(id, lang);
    const fixture = mandalaMeasurements.cases.find(row => row.id === id && row.lang === lang)!;
    const widths: Readonly<Record<string, number | undefined>> = fixture.widths;
    const measurers = tree.root.findAllByType(Text).filter(node => typeof node.props.onLayout === 'function');
    await act(async () => {
      measurers.forEach(node => node.props.onLayout({ nativeEvent: { layout: { width: widths[String(node.props.children)], height: 40, x: 0, y: 0 } } }));
    });
    expect(tree.root.findByType(JapamInfinity).props.size).toBe(296);
    expect(tree.root.findByType(JapamInfinity).props.cycleMs).toBe(id === 'gayatri-mantra' ? 4500 : 4950);
    const bands = tree.root.findAll(node => node.props.testID === 'japam-mandala-band');
    expect(bands.length).toBeGreaterThanOrEqual(2);
    for (const band of bands) {
      expect(band.findAll(node => node.props.testID === 'japam-mandala-word').length).toBeGreaterThan(0);
    }
    const reading = tree.root.findAll(node => node.props.progress && node.props.referenceLines)[0];
    expect(reading.props.lines).toEqual(compactJapamReadingLines(fixture.lines));
    expect(reading.props.lines.join(' ')).toBe(fixture.lines.join(' '));
    expect(reading.props.fontSize).toBe(size === 'L' ? 21 : 18);
    expect(reading.props.numberOfLines).toBeUndefined();
    const order = tree.root.findAll(node => ['japam-mandala', 'karaoke-text'].includes(node.props.testID));
    expect(order[0].props.testID).toBe('japam-mandala');
    expect(order[order.length - 1].props.testID).toBe('karaoke-text');
    expect(tree.root.findAll(node => node.props.testID === 'japam-mandala-word').length).toBeGreaterThan(0);
    expect(tree.root.findAll(node => node.props.testID === 'japam-infinity-count')).toHaveLength(0);
    expect(tree.root.findAll(node => node.props.testID === 'japam-infinity-current').length).toBeGreaterThan(0);
    const readerHost = tree.root.findAll(node => node.props.testID === 'japam-infinity-reading')[0];
    expect(readerHost.parent?.props.accessibilityElementsHidden).toBe(false);
    expect(beadLabel(tree)).toContain('0 of 108');
  });

  test('silent tempo and playing-recording cadence reach Infinity without extra or double counts', async () => {
    mockGetItem.mockImplementation(key => Promise.resolve(key === '@vedansh/japam-style' ? '"infinity"' : null));
    const tree = await renderJapam('gayatri-mantra');
    const player = () => tree.root.findByType(JapamAudioPlayer);
    const infinity = () => tree.root.findByType(JapamInfinity);
    await act(async () => { tapSurface(tree).props.onPress(); });
    await act(async () => { player().props.onRateChange(1.5); });
    expect(infinity().props.cycleMs).toBe(3000);
    expect(beadLabel(tree)).toContain('0 of 108');
    await act(async () => {
      player().props.onRecitationDurationChange('om-namah-shivaya', 2000);
      player().props.onPlayingChange(true);
    });
    expect(infinity().props.cycleMs).toBe(3000); // Another mantra's measurement is ignored.
    await act(async () => { player().props.onRecitationDurationChange('gayatri-mantra', 30000); });
    expect(infinity().props.cycleMs).toBe(22500);
    await act(async () => { player().props.onRecitationDurationChange('om-namah-shivaya', 2000); });
    expect(infinity().props.cycleMs).toBe(22500); // A late old-file result cannot erase the current cadence.
    await act(async () => { infinity().props.onCycle(); });
    expect(beadLabel(tree)).toContain('0 of 108');
    await act(async () => { player().props.onIteration(1); });
    expect(beadLabel(tree)).toContain('1 of 108');
    await act(async () => { player().props.onPlayingChange(false); });
    expect(infinity().props.cycleMs).toBe(3000);
    expect(beadLabel(tree)).toContain('1 of 108');
  });

});
