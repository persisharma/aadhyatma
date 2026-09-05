import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { ScrollView, Text, View as mockView } from 'react-native';
import TodayStrip from '@/components/TodayStrip';

// ---- mutable mock state (reset in beforeEach) ----
let mockLang: 'hi' | 'en' = 'hi';
let mockReduceMotion = false;
const mockNavigate = jest.fn();
let mockObservances: unknown[] = [];
let mockUpcoming: unknown[] = [];
let mockMuhurat: { muhurat: unknown; panchang: unknown; nowChoghadiya?: unknown } = {
  muhurat: null,
  panchang: null,
  nowChoghadiya: null,
};
const mockUseMuhurat = jest.fn(() => ({ isToday: true, nowKaal: null, nowChoghadiya: null, ...mockMuhurat }));
let mockRashifal: { hydrated: boolean; value: unknown } = { hydrated: true, value: null };

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
jest.mock('@/contexts/PanchangLocationContext', () => ({
  usePanchangLocation: () => ({
    location: {
      cityId: 'ujjain',
      labelHi: 'उज्जैन',
      labelEn: 'Ujjain',
      latitude: 23.18,
      longitude: 75.78,
      elevation: 0,
      source: 'default',
    },
    isLoading: false,
  }),
}));
jest.mock('@/panchang/usePanchang', () => ({
  usePanchangCalendarSystem: () => ['purnimant', jest.fn()],
  useObservancesForDate: () => mockObservances,
  useUpcomingObservances: () => mockUpcoming,
}));
jest.mock('@/panchang/useMuhurat', () => ({
  useMuhurat: (...args: unknown[]) => mockUseMuhurat(...(args as [])),
}));
jest.mock('@/panchang/useHomeRashifal', () => ({
  useHomeRashifal: () => mockRashifal,
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

const NOW = Date.now();
const todayMidnight = new Date(new Date().toDateString());
const MIN = 60_000;

/** A solved day: Saturday, Shukla Ekadashi in Ashadha, the tithi ending later today. */
const tithiEnd = new Date(NOW + 3 * 60 * MIN);
const panchangDay = {
  date: todayMidnight,
  vara: { nameHi: 'शनिवार', nameEn: 'Saturday', index: 6 },
  tithi: { index: 10, nameHi: 'एकादशी', nameEn: 'Ekadashi', paksha: 'shukla', endTime: tithiEnd },
  kshayaTithi: null,
  lunarMonth: { nameHi: 'आषाढ़', nameEn: 'Ashadha', index: 3, isAdhik: false },
  vikramSamvat: 2083,
};

const nowChoghadiya = {
  key: 'udveg',
  nameHi: 'उद्वेग',
  nameEn: 'Udveg',
  quality: 'avoid',
  phase: 'day',
  start: new Date(NOW - 30 * MIN),
  end: new Date(NOW + 30 * MIN),
};
const nextChar = {
  key: 'char',
  nameHi: 'चर',
  nameEn: 'Char',
  quality: 'auspicious',
  phase: 'day',
  start: new Date(NOW + 30 * MIN),
  end: new Date(NOW + 120 * MIN),
};

const muhuratDay = {
  dayChoghadiya: [nowChoghadiya, nextChar],
  nightChoghadiya: [],
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

const solved = { muhurat: muhuratDay, panchang: panchangDay, nowChoghadiya };

/** Ganesh Chaturthi, nine days out — carries a published vidhi (the तैयारी door). */
const ganeshChaturthi = {
  date: new Date(todayMidnight.getFullYear(), todayMidnight.getMonth(), todayMidnight.getDate() + 9),
  rule: {
    id: 'ganesh-chaturthi',
    nameHi: 'गणेश चतुर्थी',
    nameEn: 'Ganesh Chaturthi',
    deityHi: 'श्री गणेश',
    deityEn: 'Shri Ganesh',
    vidhiId: 'ganesh-chaturthi-sthapana',
  },
};
/** A monthly vrat with no vidhi — its door is the Observance Detail. */
const yoginiEkadashi = {
  date: todayMidnight,
  rule: { id: 'yogini-ekadashi', nameHi: 'योगिनी एकादशी', nameEn: 'Yogini Ekadashi', deityHi: 'श्री विष्णु', deityEn: 'Shri Vishnu' },
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

function buttons(tree: TestRenderer.ReactTestRenderer) {
  return tree.root.findAll(
    (n) => n.props?.accessibilityRole === 'button' && typeof n.props?.onPress === 'function'
  );
}

function buttonLabelled(tree: TestRenderer.ReactTestRenderer, prefix: string) {
  const match = buttons(tree).find((n) => String(n.props.accessibilityLabel).startsWith(prefix));
  if (!match) throw new Error(`No button labelled "${prefix}…"`);
  return match;
}

beforeEach(() => {
  mockLang = 'hi';
  mockReduceMotion = false;
  mockNavigate.mockClear();
  mockUseMuhurat.mockClear();
  mockObservances = [];
  mockUpcoming = [];
  mockMuhurat = { muhurat: null, panchang: null, nowChoghadiya: null };
  mockRashifal = { hydrated: true, value: null };
  mockKnownWindow = null;
  mockHydrateSolves.mockClear();
  mockEnsureWindow.mockReset();
  mockEnsureWindow.mockImplementation(() => mockKnownWindow);
  mockPersistSolves.mockClear();
  mockObservanceForDate.mockReset();
  mockObservanceForDate.mockReturnValue(null);
});

describe('TodayStrip', () => {
  it('renders the date/city eyebrow and a placeholder headline before the solve lands', () => {
    const tree = render();
    const text = textOf(tree);
    expect(text).toContain('आज ·');
    expect(text).toContain('उज्जैन');
    expect(text).toContain('—');
    // The chip row reserves its height while the day is unresolved.
    expect(tree.root.findByType(ScrollView).props.style).toEqual(
      expect.objectContaining({ height: 26 })
    );
    // Every row is present from the first frame, so nothing below moves later.
    expect(text).toContain('व्रत-पर्व');
    expect(text).toContain('राशिफल');
    expect(text).toContain('विधान');
  });

  it('renders vara + paksha tithi, then masa · samvat · the live tithi handover', () => {
    mockMuhurat = solved;
    const text = textOf(render());
    expect(text).toContain('शनिवार · शुक्ल एकादशी');
    expect(text).toContain('आषाढ़ · विक्रम संवत् २०८३ ·');
    // The tithi ends three hours from now, so the line reads "एकादशी तक <clock>,
    // फिर द्वादशी" — the successor named, never left implied.
    expect(text).toContain('एकादशी तक');
    expect(text).toContain('फिर द्वादशी');
  });

  it('shows the live choghadiya with its quality tag and the next auspicious period', () => {
    mockMuhurat = solved;
    const text = textOf(render());
    expect(text).toContain('अभी');
    expect(text).toContain('उद्वेग');
    expect(text).toContain('त्याज्य');
    expect(text).toContain('अगला शुभ');
    expect(text).toContain('चर');
  });

  it('renders the Rahu Kaal and Abhijit chips with compact time ranges', () => {
    mockMuhurat = solved;
    const text = textOf(render());
    expect(text).toContain('अभिजीत');
    expect(text).toContain('राहु काल');
    // Cross-noon window keeps both meridiems; same-meridiem window compacts
    // to a single trailing AM/PM (formatRangeCompact).
    expect(text).toContain('11:17 AM – 12:05 PM');
    expect(text).toContain('9:00 – 10:39 AM');
  });

  it('lays the chips on one horizontal-scroll row (no wrap on narrow devices)', () => {
    mockMuhurat = solved;
    const tree = render();
    const scrolls = tree.root.findAllByType(ScrollView);
    expect(scrolls.length).toBe(1);
    expect(scrolls[0].props.horizontal).toBe(true);
    expect(scrolls[0].props.showsHorizontalScrollIndicator).toBe(false);
  });

  describe('व्रत-पर्व row', () => {
    it("names today's observance and opens its Observance Detail when no vidhi is published", () => {
      mockObservances = [yoginiEkadashi];
      mockMuhurat = solved;
      const tree = render();
      const text = textOf(tree);
      expect(text).toContain('आज');
      expect(text).toContain('योगिनी एकादशी');
      expect(text).toContain('विवरण');
      act(() => buttonLabelled(tree, 'Vrat and Parv.').props.onPress());
      expect(mockNavigate).toHaveBeenCalledWith('PanchangTab', {
        screen: 'ObservanceDetail',
        params: { ruleId: 'yogini-ekadashi' },
        initial: false,
      });
    });

    it('names the next observance with its distance, and the तैयारी door opens its vidhi', () => {
      mockUpcoming = [ganeshChaturthi];
      mockMuhurat = solved;
      const tree = render();
      const text = textOf(tree);
      expect(text).toContain('आज कोई नहीं · आगे');
      expect(text).toContain('गणेश चतुर्थी');
      expect(text).toContain('9 दिन में');
      expect(text).toContain('तैयारी');
      act(() => buttonLabelled(tree, 'Vrat and Parv.').props.onPress());
      expect(mockNavigate).toHaveBeenCalledWith('VidhiDetail', {
        vidhiId: 'ganesh-chaturthi-sthapana',
        dateMs: ganeshChaturthi.date.getTime(),
      });
    });

    it('opens the vrat catalog when nothing is coming up', () => {
      mockMuhurat = solved;
      const tree = render();
      expect(textOf(tree)).toContain('आज कोई व्रत-पर्व नहीं');
      act(() => buttonLabelled(tree, 'Vrat and Parv.').props.onPress());
      expect(mockNavigate).toHaveBeenCalledWith('PanchangTab', {
        screen: 'ObservanceList',
        params: { category: 'vrat' },
        initial: false,
      });
    });
  });

  describe('राशिफल row', () => {
    it('offers the sign picker to a guest', () => {
      const tree = render();
      const text = textOf(tree);
      expect(text).toContain('आज का राशिफल');
      expect(text).toContain('अपनी राशि चुनें');
      act(() => buttonLabelled(tree, 'Rashifal.').props.onPress());
      expect(mockNavigate).toHaveBeenCalledWith('PanchangTab', {
        screen: 'Rashifal',
        params: undefined,
        initial: false,
      });
    });

    it("names the active person's Moon sign and the day's theme", () => {
      mockMuhurat = solved;
      mockRashifal = {
        hydrated: true,
        value: {
          rashiIndex: 0,
          rashiHi: 'मेष',
          rashiEn: 'Mesha',
          rashiWestern: 'Aries',
          themeHi: 'दिनचर्या और सेवा का दिन',
          themeEn: 'a day for routine and service',
          personName: null,
        },
      };
      const text = textOf(render());
      expect(text).toContain('मेष · दिनचर्या और सेवा का दिन');
      expect(text).toContain('चन्द्र राशि से · शनिवार');
    });
  });

  it('seeds the ask field with a question about the observance in view', () => {
    mockUpcoming = [ganeshChaturthi];
    mockMuhurat = solved;
    const tree = render();
    expect(textOf(tree)).toContain('गणेश चतुर्थी कब है?');
    act(() => buttonLabelled(tree, 'Ask Vedansh.').props.onPress());
    expect(mockNavigate).toHaveBeenCalledWith('Search', { initialQuery: 'गणेश चतुर्थी कब है?' });
  });

  it("opens आज का विधान from the header door", () => {
    const tree = render();
    act(() => buttonLabelled(tree, "Today's Vidhan.").props.onPress());
    expect(mockNavigate).toHaveBeenCalledWith('TodayVidhan');
  });

  describe('chip-row auto-drift', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      mockMuhurat = solved;
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

  it('requests the LIVE muhurat read — the choghadiya row moves with the clock', () => {
    render();
    expect(mockUseMuhurat).toHaveBeenCalledWith(expect.any(Date), 'purnimant');
  });

  it('navigates to the Panchang tab from the header', () => {
    mockMuhurat = solved;
    const tree = render();
    const header = buttons(tree)[0];
    // The Maestro contract (home-today-smoke.yaml): the header's label opens
    // with "Today's Panchang." and closes with "Tap to open."
    expect(header.props.accessibilityLabel).toMatch(/^Today's Panchang\. .*Tap to open\.$/);
    act(() => header.props.onPress());
    expect(mockNavigate).toHaveBeenCalledWith('PanchangTab');
  });

  it('wires the card for Home first-tap recovery (onPressIn/onPressOut)', () => {
    const tree = render();
    for (const button of buttons(tree)) {
      expect(typeof button.props.onPressIn).toBe('function');
      expect(typeof button.props.onPressOut).toBe('function');
    }
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
    mockMuhurat = solved;
    mockUpcoming = [ganeshChaturthi];
    const text = textOf(render());
    expect(text).toContain('Today ·');
    expect(text).toContain('Ujjain');
    expect(text).toContain('Saturday · Ekadashi (Shukla)');
    expect(text).toContain('Vikram Samvat 2083');
    expect(text).toContain('Now');
    expect(text).toContain('Udveg');
    expect(text).toContain('None today · next');
    expect(text).toContain('Ganesh Chaturthi');
    expect(text).toContain('in 9 days');
    expect(text).toContain('When is Ganesh Chaturthi?');
  });
});
