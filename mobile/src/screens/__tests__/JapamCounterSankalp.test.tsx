import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { AccessibilityInfo, Alert, Animated, Text, TextInput } from 'react-native';
import * as ReactNative from 'react-native';
import JapamInfinity from '@/components/JapamInfinity';
import JapamMala, { JapamMalaTray } from '@/components/JapamMala';
import { distanceToRail } from '@/components/japamControlRail';
import { malaOuterReach } from '@/components/japamMalaGeometry';
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
// Captures the counter's props to the recording player (onIteration, onPlayingChange, stopToken).
const mockAudio: { props: Record<string, any> | null } = { props: null };
jest.mock('@/components/JapamAudioPlayer', () => (props: Record<string, any>) => {
  mockAudio.props = props;
  return null;
});
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
  mockAudio.props = null;
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
// The vow's control in the count bar: the progress row while active, the filled
// target once complete — both carry "Japa sankalp, N of M …" labels.
const strip = (tree: TestRenderer.ReactTestRenderer) =>
  pressable(tree, (p) => String(p.accessibilityLabel ?? '').startsWith('Japa sankalp,'));
const rowTexts = (tree: TestRenderer.ReactTestRenderer) =>
  tree.root.findAll((n) => n.props.testID === 'japa-sankalp-row' && typeof n.props.onPress === 'function')[0]
    .findAllByType(Text).map((n) => [n.props.children].flat().join(''));
const layout = (height: number) => ({ nativeEvent: { layout: { x: 0, y: 0, width: 390, height } } });
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
  test('fresh counter offers the target; taking 1 mala turns the count bar into its progress', async () => {
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
    // One count in the bar while the vow runs: the vow's own, not the all-time tray.
    expect(rowTexts(tree)).toEqual(['0', '/ 1', 'माला पूर्ण · संकल्प', '›']);
    expect(tree.root.findAllByType(JapamMalaTray)).toHaveLength(0);
  });

  test('a finished vow hands the bar back to the all-time tray with a filled target', async () => {
    withStoredSankalp({ unit: 'mala', amount: 1, done: 108, startedAt: 1, updatedAt: 2, completedAt: 2 });
    const tree = await renderJapam();
    expect(tree.root.findAllByType(JapamMalaTray)).toHaveLength(1);
    const target = byTestId(tree, 'japa-sankalp-open');
    expect(target.props.accessibilityLabel).toBe('Japa sankalp, 1 of 1 mala, complete. Take a new sankalp or clear it.');
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

  test('Infinity (अनंत) shows the same opener/strip, its loops fill the vow and completion pauses it', async () => {
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
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
    expect(tree.root.findByType(JapamInfinity).props.running).toBe(true);
    await act(async () => { loop().props.onCycle(); });
    expect(String(strip(tree).props.accessibilityLabel)).toMatch(/2 of 2 japa, complete/);
    expect(texts(tree)).toContain('संकल्प पूर्ण 🙏');
    expect(Haptics.notificationAsync).toHaveBeenCalledTimes(1);
    expect(announce).toHaveBeenCalledWith('Japa sankalp complete. Automatic chanting paused.');
    // Reaching the vow pauses the loop: no more automatic beads past the target.
    expect(tree.root.findByType(JapamInfinity).props.running).toBe(false);
    expect(byTestId(tree, 'japam-counter-infinity').props.accessibilityLabel).toContain('2 of 108 on this mala');
    await act(async () => { loop().props.onCycle(); });
    expect(byTestId(tree, 'japam-counter-infinity').props.accessibilityLabel).toContain('2 of 108 on this mala');
    // Resuming is the user's choice and counts on the mala; the vow stays complete.
    await press(byTestId(tree, 'japam-counter-infinity'));
    await act(async () => { loop().props.onCycle(); });
    expect(byTestId(tree, 'japam-counter-infinity').props.accessibilityLabel).toContain('3 of 108 on this mala');
    expect(String(strip(tree).props.accessibilityLabel)).toMatch(/2 of 2 japa, complete/);
    expect(tree.root.findByType(JapamInfinity).props.running).toBe(true);
    // Releasing the vow brings the opener back in Infinity too.
    await press(strip(tree));
    await press(byLabel(tree, 'Clear completed sankalp'));
    expect(byLabel(tree, 'Take a japa sankalp')).toBeDefined();
  });

  test.each(['mala', 'infinity'] as const)('taking, finishing and clearing a vow never resizes the %s (no jerk)', async (style) => {
    mockGetItem.mockImplementation((key: string) => Promise.resolve(key === '@vedansh/japam-style' ? JSON.stringify(style) : null));
    const tree = await renderJapam();
    const scroll = tree.root.findAll((n) => n.type === ReactNative.ScrollView && typeof n.props.onLayout === 'function')[0];
    await act(async () => { scroll.props.onLayout(layout(530)); });
    if (style === 'mala') {
      const head = tree.root.findAll((n) => typeof n.props.onLayout === 'function' && n.props.style && n.type === ReactNative.View)
        .find((n) => n !== scroll && !n.props.testID)!;
      await act(async () => { head.props.onLayout(layout(63)); });
    }
    const size = () => (style === 'mala' ? tree.root.findByType(JapamMala) : tree.root.findByType(JapamInfinity)).props.size;
    const before = size();
    await press(byLabel(tree, 'Take a japa sankalp'));
    await press(byLabel(tree, '1 mala'));
    await press(byLabel(tree, 'Take this sankalp'));
    expect(size()).toBe(before);
    const scrollViews = tree.root.findAll((n) => n.type === ReactNative.ScrollView && typeof n.props.onLayout === 'function');
    expect(scrollViews).toHaveLength(1);
    // The bar is the same 56 dp row in every state: nothing reports a new height.
    const rowStyle = byTestId(tree, 'japa-sankalp-row').props.style;
    expect(ReactNative.StyleSheet.flatten(typeof rowStyle === 'function' ? rowStyle({ pressed: false }) : rowStyle))
      .toMatchObject({ minHeight: 44 });
    await press(strip(tree));
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    await press(byLabel(tree, 'Set this sankalp aside'));
    await act(async () => { alert.mock.calls[0][2]!.find((b) => b.style === 'destructive')!.onPress!(); });
    expect(size()).toBe(before);
  });

  test('speedometer, play and ↺ stand in one icon column above the Sankalp target; no Play bar remains', async () => {
    const tree = await renderJapam();
    expect(mockAudio.props!.layout).toBe('rail');
    // Exactly one player (the column) — the old full-width audio bar is gone.
    expect(tree.root.findAll((n) => n.props.onIteration && n.props.layout).length).toBe(1);
    const slot = tree.root.findAll((n) => n.props.pointerEvents === 'box-none'
      && ReactNative.StyleSheet.flatten(n.props.style)?.position === 'absolute')[0];
    expect(ReactNative.StyleSheet.flatten(slot.props.style)).toMatchObject({ right: 16, bottom: 8, gap: 8 });
    // ↺ is the column's last (bottom) button; the target sits below it in the count bar.
    const inSlot = slot.findAll((n) => typeof n.props.onPress === 'function' && n.props.accessibilityLabel);
    expect(inSlot.map((n) => n.props.accessibilityLabel)).toEqual(['Reset or clear the count']);
    expect(slot.findAll((n) => n.props.accessibilityLabel === 'Take a japa sankalp')).toHaveLength(0);
    expect(byLabel(tree, 'Take a japa sankalp')).toBeDefined();
  });

  test.each<[string, number, number, number]>([
    ['390 pt phone, short mantra', 390, 530, 63],
    ['375 pt SE, short mantra', 375, 425, 63],
    ['390 pt phone, long mantra', 390, 530, 160],
  ])('on a %s no bead, Sumeru or tassel can sit under the column', async (_name, width, viewport, head) => {
    jest.spyOn(ReactNative.Dimensions, 'get').mockReturnValue({ width, height: 844, scale: 3, fontScale: 1 });
    jest.spyOn(ReactNative, 'useWindowDimensions').mockReturnValue({ width, height: 844, scale: 3, fontScale: 1 });
    const tree = await renderJapam();
    const scroll = tree.root.findAll((n) => n.type === ReactNative.ScrollView && typeof n.props.onLayout === 'function')[0];
    const headNode = tree.root.findAll((n) => typeof n.props.onLayout === 'function' && n.type === ReactNative.View && !n.props.testID)[0];
    await act(async () => { scroll.props.onLayout(layout(viewport)); headNode.props.onLayout(layout(head)); });
    const size = tree.root.findByType(JapamMala).props.size;
    const cy = 16 + head + 4 + size <= viewport ? viewport / 2 + head / 2 + 2 : 12 + head + size / 2;
    expect(distanceToRail(width, viewport, width / 2, cy)).toBeGreaterThanOrEqual(malaOuterReach(size));
    // …and it is the largest such ring: two points more would reach under it.
    const unfitted = Math.min(width - 48, 330, Math.max(230, viewport - head - 20));
    if (size < unfitted && size > 230) {
      const cy2 = 16 + head + 4 + size + 2 <= viewport ? viewport / 2 + head / 2 + 2 : 12 + head + (size + 2) / 2;
      expect(distanceToRail(width, viewport, width / 2, cy2)).toBeLessThan(malaOuterReach(size + 2));
    }
  });

  test.each<[number, number, number, number]>([[390, 530, 340, 39], [375, 425, 292, 23]])(
    'Infinity on a %i pt phone: the frame is sized clear of the column and its text inset', async (width, viewport, frame, inset) => {
      jest.spyOn(ReactNative.Dimensions, 'get').mockReturnValue({ width, height: 844, scale: 3, fontScale: 1 });
      jest.spyOn(ReactNative, 'useWindowDimensions').mockReturnValue({ width, height: 844, scale: 3, fontScale: 1 });
      mockGetItem.mockImplementation((key: string) => Promise.resolve(key === '@vedansh/japam-style' ? '"infinity"' : null));
      const tree = await renderJapam();
      // Hidden until the viewport is known, so it never appears at one size and jumps to another.
      const block = () => tree.root.findByType(JapamInfinity).parent!;
      expect(ReactNative.StyleSheet.flatten(block().props.style).opacity).toBe(0);
      const scroll = tree.root.findAll((n) => n.type === ReactNative.ScrollView && typeof n.props.onLayout === 'function')[0];
      await act(async () => { scroll.props.onLayout(layout(viewport)); });
      expect(ReactNative.StyleSheet.flatten(block().props.style).opacity).toBeUndefined();
      expect(tree.root.findByType(JapamInfinity).props.size).toBe(frame);
      expect(tree.root.findByType(JapamInfinity).props.railClearance).toBe(64);
      const below = tree.root.findAll((n) => n.props.testID === 'japam-infinity-below' && n.props.style)[0];
      expect(ReactNative.StyleSheet.flatten(below.props.style).paddingHorizontal).toBe(inset);
      // The duplicate progress bar under the frame is gone: the ∞ lobes carry the count.
      expect(tree.root.findAll((n) => n.props.style && ReactNative.StyleSheet.flatten(n.props.style)?.height === 3)).toHaveLength(0);
    });

  test('a playing recording is stopped when its repetitions complete the vow', async () => {
    withStoredSankalp({ unit: 'japa', amount: 2, done: 0, startedAt: 1, updatedAt: 1 });
    const tree = await renderJapam();
    const token = mockAudio.props!.stopToken;
    await act(async () => { mockAudio.props!.onPlayingChange(true); });
    await act(async () => { mockAudio.props!.onIteration(1); });
    expect(String(strip(tree).props.accessibilityLabel)).toMatch(/^Japa sankalp, 1 of 2 japa\./);
    expect(mockAudio.props!.stopToken).toBe(token);
    await act(async () => { mockAudio.props!.onIteration(1); });
    expect(String(strip(tree).props.accessibilityLabel)).toMatch(/2 of 2 japa, complete/);
    expect(mockAudio.props!.stopToken).toBe(token + 1);
    // A later completion-free session never bumps it again.
    await act(async () => { mockAudio.props!.onPlayingChange(false); });
    await act(async () => { mockAudio.props!.onPlayingChange(true); });
    await act(async () => { mockAudio.props!.onIteration(1); });
    expect(mockAudio.props!.stopToken).toBe(token + 1);
  });

  test('manual taps completing the vow pause nothing and announce completion only', async () => {
    withStoredSankalp({ unit: 'japa', amount: 1, done: 0, startedAt: 1, updatedAt: 1 });
    const tree = await renderJapam();
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
    const token = mockAudio.props!.stopToken;
    await tap(tree);
    expect(String(strip(tree).props.accessibilityLabel)).toMatch(/1 of 1 japa, complete/);
    expect(announce).toHaveBeenCalledWith('Japa sankalp complete.');
    expect(mockAudio.props!.stopToken).toBe(token);
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
    expect(rowTexts(tree).slice(0, 2)).toEqual(['0', '/ 77']);
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

  test.each<[Lang, string, string, string, string]>([
    ['hi', 'माला पूर्ण · संकल्प', '12 / 21 माला', 'जप संकल्प', 'अब तक 1,336 जप'],
    ['en', 'malas done · Sankalp', '12 / 21 malas', 'Japa Sankalp', '1,336 japa so far'],
    ['gu', 'માળા પૂર્ણ · સંકલ્પ', '12 / 21 માળા', 'જપ સંકલ્પ', 'અત્યાર સુધી 1,336 જપ'],
    ['kn', 'ಮಾಲೆ ಪೂರ್ಣ · ಸಂಕಲ್ಪ', '12 / 21 ಮಾಲೆ', 'ಜಪ ಸಂಕಲ್ಪ', 'ಇದುವರೆಗೆ 1,336 ಜಪ'],
  ])('%s count-bar row and sheet copy', async (lang, rowLabel, headline, title, soFar) => {
    withStoredSankalp({ unit: 'mala', amount: 21, done: 12 * 108 + 40, startedAt: 1, updatedAt: 1 });
    const tree = await renderJapam(lang);
    expect(rowTexts(tree)).toEqual(['12', '/ 21', rowLabel, '›']);
    await press(strip(tree));
    const shown = texts(tree);
    expect(shown).toContain(headline);
    expect(shown).toContain(title);
    expect(shown).toContain(soFar);
  });
});
