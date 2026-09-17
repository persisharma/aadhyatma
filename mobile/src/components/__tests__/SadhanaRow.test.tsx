/**
 * साधना row (TRD-42 §5.1). The contract worth pinning is the §64 one: three
 * cells, two cells and the empty state must occupy the SAME height, because all
 * three data sources hydrate from AsyncStorage after Home's first painted frame.
 */
import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text, View as mockView } from 'react-native';
import SadhanaRow, { sankalpDayNumber } from '@/components/SadhanaRow';
import { TilePressProvider, useTilePressController } from '@/contexts/TilePressContext';
import type { SadhanaTodayStatus } from '@/data/sadhana/progress';

let mockLang: 'hi' | 'en' = 'hi';
let mockToday = { hasRoutine: false, doneCount: 0, total: 0, entries: [] };
let mockSadhana: unknown[] = [];
let mockActivity: Record<string, unknown> = {};
const mockNavigate = jest.fn();

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
jest.mock('@/data/routine/useRoutineToday', () => ({ useRoutineToday: () => mockToday }));
jest.mock('@/data/sadhana/useSadhanaToday', () => ({ useSadhanaToday: () => mockSadhana }));
jest.mock('@/contexts/UserActivityContext', () => ({
  useUserActivity: () => ({ activity: mockActivity }),
  toDateKey: () => '2026-09-17',
}));

function Harness() {
  const controller = useTilePressController();
  return (
    <TilePressProvider value={controller}>
      <SadhanaRow />
    </TilePressProvider>
  );
}

function render(): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(<Harness />);
  });
  return tree;
}

function textOf(tree: TestRenderer.ReactTestRenderer): string {
  return tree.root
    .findAllByType(Text)
    .map((n) => (Array.isArray(n.props.children) ? n.props.children.join('') : String(n.props.children ?? '')))
    .join(' | ');
}

/** Height of the outermost laid-out box, however its style is expressed. */
function outerHeight(tree: TestRenderer.ReactTestRenderer): number | undefined {
  const boxes = tree.root.findAll((n) => n.type === mockView && n.props?.style !== undefined);
  for (const box of boxes) {
    const raw = box.props.style;
    const resolved = typeof raw === 'function' ? raw({ pressed: false }) : raw;
    const flat = Object.assign({}, ...[].concat(resolved).filter(Boolean)) as Record<string, number>;
    if (flat.minHeight !== undefined) return flat.minHeight;
  }
  return undefined;
}

const activeDay = (mantraBeads: number) => ({ japa: { gayatri: { beads: mantraBeads, rounds: 0 } } });

beforeEach(() => {
  mockLang = 'hi';
  mockToday = { hasRoutine: false, doneCount: 0, total: 0, entries: [] };
  mockSadhana = [];
  mockActivity = {};
  mockNavigate.mockClear();
});

afterEach(() => {
  act(() => undefined);
});

describe('SadhanaRow', () => {
  it('falls back to the routine nudge when there is nothing at all to report', () => {
    // No routine, no sankalp, no japa: don't invent a second empty state, use
    // the banner that already says "अपनी नित्य साधना बनाएँ".
    const tree = render();
    expect(textOf(tree)).toMatch(/अपनी नित्य साधना बनाएँ/);
    act(() => tree.unmount());
  });

  it('shows routine progress and the japa streak once either exists', () => {
    mockToday = { hasRoutine: true, doneCount: 2, total: 4, entries: [] };
    mockActivity = { '2026-09-17': activeDay(108), '2026-09-16': activeDay(54) };
    const tree = render();
    const text = textOf(tree);
    expect(text).toMatch(/2\/4/);
    expect(text).toMatch(/2 दिन/);
    act(() => tree.unmount());
  });

  it('omits the sankalp cell when no vow is running, and shows it when one is', () => {
    mockToday = { hasRoutine: true, doneCount: 0, total: 3, entries: [] };
    const without = render();
    expect(textOf(without)).not.toMatch(/संकल्प/);
    act(() => without.unmount());

    mockSadhana = [
      {
        program: { titleHi: 'हनुमान चालीसा', titleEn: 'Hanuman Chalisa' },
        status: { kind: 'active', dayIndex: 12, totalDays: 41, items: [] },
      },
    ];
    const withVow = render();
    const text = textOf(withVow);
    expect(text).toMatch(/संकल्प/);
    expect(text).toMatch(/दिन 12\/41/);
    act(() => withVow.unmount());
  });

  it('keeps one height across the three-cell and two-cell variants (§64)', () => {
    // Home's first painted frame must be its final frame; routine and sadhana
    // both land after it, so the row may not grow when they do.
    mockToday = { hasRoutine: true, doneCount: 1, total: 2, entries: [] };
    const twoCell = render();
    const twoCellHeight = outerHeight(twoCell);
    act(() => twoCell.unmount());

    mockSadhana = [
      {
        program: { titleHi: 'क', titleEn: 'A' },
        status: { kind: 'active', dayIndex: 3, totalDays: 41, items: [] },
      },
    ];
    const threeCell = render();
    expect(outerHeight(threeCell)).toBe(twoCellHeight);
    expect(twoCellHeight).toBeGreaterThan(0);
    act(() => threeCell.unmount());
  });

  it('each cell opens its own surface', () => {
    mockToday = { hasRoutine: true, doneCount: 1, total: 2, entries: [] };
    mockSadhana = [
      { program: { titleHi: 'क', titleEn: 'A' }, status: { kind: 'active', dayIndex: 1, totalDays: 41, items: [] } },
    ];
    const tree = render();
    const buttons = tree.root.findAll((n) => typeof n.props?.onPress === 'function' && n.props?.accessibilityRole === 'button');
    act(() => {
      buttons.forEach((b) => b.props.onPress());
    });
    expect(mockNavigate).toHaveBeenCalledWith('RoutineToday');
    expect(mockNavigate).toHaveBeenCalledWith('SadhanaPrograms');
    expect(mockNavigate).toHaveBeenCalledWith('JapamCounter');
    act(() => tree.unmount());
  });
});

describe('sankalpDayNumber', () => {
  it('reads the live day while active or already offered', () => {
    expect(sankalpDayNumber({ kind: 'active', dayIndex: 7, totalDays: 41, items: [] } as SadhanaTodayStatus)).toBe(7);
    expect(sankalpDayNumber({ kind: 'done-today', dayIndex: 7, totalDays: 41 } as SadhanaTodayStatus)).toBe(7);
  });

  it('shows the day being waited FOR, not the last one finished', () => {
    // A weekday-gated vow between its days has no dayIndex. Re-showing the
    // finished day would read as "today is day 3" on a day that is not day 3.
    expect(
      sankalpDayNumber({ kind: 'waiting', totalDays: 41, doneCount: 3, reason: 'cadence', items: [] } as unknown as SadhanaTodayStatus)
    ).toBe(4);
  });

  it('a finished vow shows its total', () => {
    expect(sankalpDayNumber({ kind: 'completed', totalDays: 41 } as SadhanaTodayStatus)).toBe(41);
  });
});
