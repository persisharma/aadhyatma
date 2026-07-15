import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { ScrollView, Text, View as mockView } from 'react-native';
import TodayStrip from '@/components/TodayStrip';

// ---- mutable mock state (reset in beforeEach) ----
let mockLang: 'hi' | 'en' = 'hi';
let mockReduceMotion = false;
const mockNavigate = jest.fn();
let mockObservances: unknown[] = [];
let mockMuhurat: { muhurat: unknown; panchang: unknown } = { muhurat: null, panchang: null };
const mockUseMuhurat = jest.fn(() => mockMuhurat);

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    mockReact.createElement(mockView, props, children),
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
  useIsFocused: () => true,
}));
jest.mock('@/utils/useReducedMotion', () => ({ useReducedMotion: () => mockReduceMotion }));
jest.mock('@/data/gita/language', () => ({ useGitaLanguage: () => ({ lang: mockLang }) }));
jest.mock('@/panchang/usePanchang', () => ({
  usePanchangCalendarSystem: () => ['purnimant', jest.fn()],
  useObservancesForDate: () => mockObservances,
}));
jest.mock('@/panchang/useMuhurat', () => ({
  useMuhurat: (...args: unknown[]) => mockUseMuhurat(...(args as [])),
}));

const panchangDay = {
  vara: { nameHi: 'शनिवार', nameEn: 'Saturday', index: 6 },
  tithi: { nameHi: 'एकादशी', nameEn: 'Ekadashi', paksha: 'shukla', endTime: null },
};

const muhuratDay = {
  abhijit: {
    start: new Date(2026, 6, 11, 11, 17),
    end: new Date(2026, 6, 11, 12, 5),
  },
  rahu: {
    key: 'rahu',
    nameHi: 'राहु काल',
    nameEn: 'Rahu Kaal',
    start: new Date(2026, 6, 11, 9, 0),
    end: new Date(2026, 6, 11, 10, 39),
  },
};

const mountedTrees: TestRenderer.ReactTestRenderer[] = [];

function render(): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(<TodayStrip />);
  });
  mountedTrees.push(tree);
  return tree;
}

afterEach(() => {
  // useTodayKey schedules a real timer to the next midnight — unmount so its
  // effect cleanup clears it, or the jest process never exits.
  mountedTrees.splice(0).forEach((tree) => act(() => tree.unmount()));
});

function textOf(tree: TestRenderer.ReactTestRenderer): string {
  return tree.root
    .findAllByType(Text)
    .map((n) => n.props.children)
    .flat(Number.POSITIVE_INFINITY)
    .join(' ');
}

beforeEach(() => {
  mockLang = 'hi';
  mockReduceMotion = false;
  mockNavigate.mockClear();
  mockUseMuhurat.mockClear();
  mockObservances = [];
  mockMuhurat = { muhurat: null, panchang: null };
});

describe('TodayStrip', () => {
  it('renders the eyebrow and a placeholder headline before the solve lands', () => {
    const text = textOf(render());
    expect(text).toContain('आज का पंचांग');
    expect(text).toContain('—');
  });

  it('renders vara + paksha tithi once panchang resolves', () => {
    mockMuhurat = { muhurat: muhuratDay, panchang: panchangDay };
    const text = textOf(render());
    expect(text).toContain('शनिवार · शुक्ल एकादशी');
  });

  it('renders observance and muhurat chips with compact time ranges', () => {
    mockObservances = [
      { date: new Date(), rule: { id: 'yogini-ekadashi', nameHi: 'योगिनी एकादशी', nameEn: 'Yogini Ekadashi' } },
    ];
    mockMuhurat = { muhurat: muhuratDay, panchang: panchangDay };
    const text = textOf(render());
    expect(text).toContain('योगिनी एकादशी');
    expect(text).toContain('अभिजीत');
    expect(text).toContain('राहु काल');
    // Cross-noon window keeps both meridiems; same-meridiem window compacts
    // to a single trailing AM/PM (formatRangeCompact).
    expect(text).toContain('11:17 AM – 12:05 PM');
    expect(text).toContain('9:00 – 10:39 AM');
  });

  it('lays the chips on one horizontal-scroll row (no wrap on narrow devices)', () => {
    mockObservances = [
      { date: new Date(), rule: { id: 'amavasya-vrat', nameHi: 'अमावस्या व्रत', nameEn: 'Amavasya Vrat' } },
      { date: new Date(), rule: { id: 'somvati', nameHi: 'सोमवती अमावस्या', nameEn: 'Somvati Amavasya' } },
    ];
    mockMuhurat = { muhurat: muhuratDay, panchang: panchangDay };
    const tree = render();
    // Both observances still render — overflow scrolls instead of wrapping.
    const text = textOf(tree);
    expect(text).toContain('अमावस्या व्रत');
    expect(text).toContain('सोमवती अमावस्या');
    const scrolls = tree.root.findAllByType(ScrollView);
    expect(scrolls.length).toBe(1);
    expect(scrolls[0].props.horizontal).toBe(true);
    expect(scrolls[0].props.showsHorizontalScrollIndicator).toBe(false);
  });

  it('auto-drifts an overflowing chip row and stops for good on a user drag', () => {
    mockObservances = [
      { date: new Date(), rule: { id: 'amavasya-vrat', nameHi: 'अमावस्या व्रत', nameEn: 'Amavasya Vrat' } },
    ];
    mockMuhurat = { muhurat: muhuratDay, panchang: panchangDay };
    const tree = render();
    const scroll = tree.root.findAllByType(ScrollView)[0];

    // Measurement callbacks are wired; reporting an overflowing content width
    // kicks the drift off (async behind the reduce-motion check — the wiring
    // not throwing is the contract this pins).
    act(() => {
      scroll.props.onLayout({ nativeEvent: { layout: { width: 200 } } });
      scroll.props.onContentSizeChange(420, 24);
    });

    // A drag hands control to the user permanently.
    expect(typeof scroll.props.onScrollBeginDrag).toBe('function');
    act(() => scroll.props.onScrollBeginDrag());
  });

  it('requests the static (live: false) muhurat read — no per-minute tick', () => {
    render();
    expect(mockUseMuhurat).toHaveBeenCalledWith(
      expect.any(Date),
      'purnimant',
      expect.objectContaining({ live: false })
    );
  });

  it('navigates to the Panchang tab on press', () => {
    mockMuhurat = { muhurat: muhuratDay, panchang: panchangDay };
    const tree = render();
    const button = tree.root.findAll(
      (n) => n.props?.accessibilityRole === 'button' && typeof n.props?.onPress === 'function'
    )[0];
    act(() => button.props.onPress());
    expect(mockNavigate).toHaveBeenCalledWith('PanchangTab');
  });

  it('uses English names when the reading language is English', () => {
    mockLang = 'en';
    mockMuhurat = { muhurat: muhuratDay, panchang: panchangDay };
    const text = textOf(render());
    expect(text).toContain("Today's Panchang");
    expect(text).toContain('Saturday · Ekadashi (Shukla)');
  });
});
