import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text, View as mockView } from 'react-native';
import TodayStrip from '@/components/TodayStrip';

// ---- mutable mock state (reset in beforeEach) ----
let mockLang: 'hi' | 'en' = 'hi';
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
}));
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

function render(): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(<TodayStrip />);
  });
  return tree;
}

function textOf(tree: TestRenderer.ReactTestRenderer): string {
  return tree.root
    .findAllByType(Text)
    .map((n) => n.props.children)
    .flat(Number.POSITIVE_INFINITY)
    .join(' ');
}

beforeEach(() => {
  mockLang = 'hi';
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

  it('renders observance and muhurat chips with time ranges', () => {
    mockObservances = [
      { date: new Date(), rule: { id: 'yogini-ekadashi', nameHi: 'योगिनी एकादशी', nameEn: 'Yogini Ekadashi' } },
    ];
    mockMuhurat = { muhurat: muhuratDay, panchang: panchangDay };
    const text = textOf(render());
    expect(text).toContain('योगिनी एकादशी');
    expect(text).toContain('अभिजीत');
    expect(text).toContain('राहु काल');
    expect(text).toMatch(/11:17/);
    expect(text).toMatch(/9:00/);
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
