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
  // The Pitru-Paksha chip hydrates its persisted solve through multiGet.
  multiGet: jest.fn((keys: string[]) => Promise.resolve(keys.map((k) => [k, null]))),
  multiSet: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiRemove: jest.fn(() => Promise.resolve()),
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

// ---- Pitru-Paksha chip: the persisted-solve layer, watched ----
let mockKnownWindow: unknown = null;
const mockHydrateSolves = jest.fn(() => Promise.resolve());
const mockEnsureWindow = jest.fn(() => mockKnownWindow);
const mockPersistSolves = jest.fn(() => Promise.resolve());
const mockObservanceForDate = jest.fn(() => null as unknown);
jest.mock('@/panchang/pitruSmaranSolves', () => ({
  knownPakshaWindow: () => mockKnownWindow,
  hydrateSmaranSolves: (...args: unknown[]) => mockHydrateSolves(...(args as [])),
  ensurePakshaWindow: (...args: unknown[]) => mockEnsureWindow(...(args as [])),
  persistSmaranSolves: (...args: unknown[]) => mockPersistSolves(...(args as [])),
}));
jest.mock('@/panchang/pitruSmaran', () => ({
  pitruPakshaObservanceForDate: (...args: unknown[]) => mockObservanceForDate(...(args as [])),
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

/**
 * `scrollRef.current` is the `ScrollView` component instance, so shadowing its
 * `scrollTo` with a mock is how the drift tests watch every offset the strip
 * actually pushes to the row — the whole cost this feature has to keep bounded.
 */
function renderWatchingScroll(): { tree: TestRenderer.ReactTestRenderer; scrollTo: jest.Mock } {
  const tree = render();
  const scrollTo = jest.fn();
  (tree.root.findAllByType(ScrollView)[0].instance as unknown as { scrollTo: jest.Mock }).scrollTo =
    scrollTo;
  return { tree, scrollTo };
}

/** Report an overflowing chip row: 200pt of frame around 420pt of chips. */
function reportOverflow(tree: TestRenderer.ReactTestRenderer, contentW = 420): void {
  const scroll = tree.root.findAllByType(ScrollView)[0];
  act(() => {
    scroll.props.onLayout({ nativeEvent: { layout: { width: 200 } } });
    scroll.props.onContentSizeChange(contentW, 24);
  });
}

function advance(ms: number): void {
  act(() => {
    jest.advanceTimersByTime(ms);
  });
}

/** The settle window, one full out-and-back drift, and both end pauses. */
const FULL_PASS_MS = 1200 + 2 * ((420 - 200) / 24) * 1000 + 2 * 1800;

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
  mockKnownWindow = null;
  mockHydrateSolves.mockClear();
  mockEnsureWindow.mockReset();
  mockEnsureWindow.mockImplementation(() => mockKnownWindow);
  mockPersistSolves.mockClear();
  mockObservanceForDate.mockReset();
  mockObservanceForDate.mockReturnValue(null);
});

describe('TodayStrip', () => {
  it('renders the eyebrow and a placeholder headline before the solve lands', () => {
    const tree = render();
    const text = textOf(tree);
    expect(text).toContain('आज का पंचांग');
    expect(text).toContain('—');
    expect(tree.root.findByType(ScrollView).props.style).toEqual(
      expect.objectContaining({ height: 24 })
    );
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

  describe('chip-row auto-drift', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      mockObservances = [
        { date: new Date(), rule: { id: 'amavasya-vrat', nameHi: 'अमावस्या व्रत', nameEn: 'Amavasya Vrat' } },
      ];
      mockMuhurat = { muhurat: muhuratDay, panchang: panchangDay };
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('leaves the row alone through the settle window, then drifts to the end and back ONCE', () => {
      const { tree, scrollTo: node } = renderWatchingScroll();
      reportOverflow(tree);

      // The launch window is sacred: nothing touches the row until the chips
      // have held still for AUTO_SCROLL_SETTLE_MS.
      advance(1199);
      expect(node).not.toHaveBeenCalled();

      // Then it crawls forward — at 24px/s, ~24px after a second of ticks.
      advance(1000);
      const firstRun = node.mock.calls.map(([arg]) => arg.x);
      expect(firstRun.length).toBeGreaterThan(0);
      expect(firstRun).toEqual([...firstRun].sort((a, b) => a - b));
      expect(firstRun[firstRun.length - 1]).toBeLessThanOrEqual(30);
      // One bridge call per whole pixel, never one per tick.
      expect(new Set(firstRun).size).toBe(firstRun.length);

      // A full pass reaches the far end (220px of overflow) and returns to 0.
      advance(FULL_PASS_MS);
      const offsets = node.mock.calls.map(([arg]) => arg.x);
      expect(Math.max(...offsets)).toBe(220);
      expect(offsets[offsets.length - 1]).toBe(0);

      // …and then Home goes idle. This is the whole point: an endless loop here
      // held the JS thread at 60Hz behind everything the launch defers.
      node.mockClear();
      advance(60_000);
      expect(node).not.toHaveBeenCalled();
    });

    it('never drifts under reduce-motion', () => {
      mockReduceMotion = true;
      const { tree, scrollTo: node } = renderWatchingScroll();
      reportOverflow(tree);
      advance(FULL_PASS_MS);
      expect(node).not.toHaveBeenCalled();
    });

    it('never drifts a row that fits', () => {
      const { tree, scrollTo: node } = renderWatchingScroll();
      reportOverflow(tree, 205); // 5px of overflow — under the 8px floor
      advance(FULL_PASS_MS);
      expect(node).not.toHaveBeenCalled();
    });

    it('hands control to the user for good on a drag', () => {
      const { tree, scrollTo: node } = renderWatchingScroll();
      const scroll = tree.root.findAllByType(ScrollView)[0];
      reportOverflow(tree);
      advance(2200);
      expect(node).toHaveBeenCalled();

      expect(typeof scroll.props.onScrollBeginDrag).toBe('function');
      act(() => scroll.props.onScrollBeginDrag());
      node.mockClear();
      advance(FULL_PASS_MS);
      expect(node).not.toHaveBeenCalled();
    });

    it('re-arms exactly one fresh pass when the chips themselves change', () => {
      const { tree, scrollTo: node } = renderWatchingScroll();
      reportOverflow(tree);
      advance(1200 + FULL_PASS_MS);
      expect(node).toHaveBeenCalled();
      node.mockClear();

      // A new content width (chips landing, language switch, day rollover)
      // earns another reveal — and serves the settle delay again.
      reportOverflow(tree, 500);
      advance(1199);
      expect(node).not.toHaveBeenCalled();
      advance(FULL_PASS_MS);
      expect(node).toHaveBeenCalled();
    });
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

  it('wires the card for Home first-tap recovery (onPressIn/onPressOut)', () => {
    const tree = render();
    const button = tree.root.findAll(
      (n) => n.props?.accessibilityRole === 'button' && typeof n.props?.onPress === 'function'
    )[0];
    expect(typeof button.props.onPressIn).toBe('function');
    expect(typeof button.props.onPressOut).toBe('function');
  });

  describe('Pitru-Paksha chip', () => {
    /** A fortnight that contains today — dates at LOCAL midnight, as the engine
     *  hands them out, so the inside-the-window comparison behaves like the app's. */
    function todayWindow(): { purnima: Date; start: Date; end: Date } {
      const now = new Date();
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { purnima: midnight, start: midnight, end: midnight };
    }

    const observance = {
      tithi: 15,
      isPurnima: false,
      isSarvapitri: true,
      labelHi: 'पितृ पक्ष — सर्वपितृ अमावस्या',
      labelEn: 'Pitru Paksha — Sarvapitri Amavasya',
    };

    it('never solves the fortnight on the launch path — disk first, astronomy behind an idle UI', async () => {
      const tree = render();
      // Nothing is solved during mount: this was a bare setTimeout(0) around a
      // ~250ms unyielded scan, on the screen every cold launch lands on.
      expect(mockEnsureWindow).not.toHaveBeenCalled();
      // Disk, though, starts at once — it is I/O, not JS work.
      expect(mockHydrateSolves).toHaveBeenCalled();

      // Still cold after the disk read — so the fortnight has to be solved, and
      // that waits for interactions to drain.
      mockObservanceForDate.mockReturnValue(observance);
      await act(async () => {
        await Promise.resolve();
      });
      expect(mockEnsureWindow).not.toHaveBeenCalled();

      // The solve itself is what makes the window known — so `knownPakshaWindow`
      // stays null here, exactly as it is on a cold device.
      mockEnsureWindow.mockReturnValue(todayWindow());
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });
      expect(mockEnsureWindow).toHaveBeenCalled();
      // Persisted, so no later launch pays for this fortnight again.
      expect(mockPersistSolves).toHaveBeenCalled();
      expect(textOf(tree)).toContain('पितृ पक्ष — सर्वपितृ अमावस्या');
    });

    it('paints from a known window on the FIRST render', async () => {
      mockKnownWindow = todayWindow();
      mockObservanceForDate.mockReturnValue(observance);
      const tree = render();
      // Rule 1 of the panchang caches: a warm answer paints on the first render,
      // not an effect and a setState later.
      expect(textOf(tree)).toContain('पितृ पक्ष — सर्वपितृ अमावस्या');
      await act(async () => {
        await Promise.resolve();
      });
      // Nothing goes to disk for an answer already in memory.
      expect(mockHydrateSolves).not.toHaveBeenCalled();
    });

    it('costs no engine call at all on the ~350 days outside the fortnight', async () => {
      const lastYear = new Date(2025, 8, 20);
      mockKnownWindow = { purnima: lastYear, start: lastYear, end: lastYear };
      const tree = render();
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });
      expect(mockHydrateSolves).not.toHaveBeenCalled();
      expect(mockEnsureWindow).not.toHaveBeenCalled();
      expect(textOf(tree)).not.toContain('पितृ पक्ष');
    });
  });

  it('uses English names when the reading language is English', () => {
    mockLang = 'en';
    mockMuhurat = { muhurat: muhuratDay, panchang: panchangDay };
    const text = textOf(render());
    expect(text).toContain("Today's Panchang");
    expect(text).toContain('Saturday · Ekadashi (Shukla)');
  });
});
