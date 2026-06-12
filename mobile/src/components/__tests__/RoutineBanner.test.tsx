import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text, View as mockView } from 'react-native';
import RoutineBanner from '@/components/RoutineBanner';

// ---- mutable mock state (reset in beforeEach) ----
let mockLang: 'hi' | 'en' = 'hi';
let mockToday = { hasRoutine: false, doneCount: 0, total: 0 };
let mockFocused = true;
let mockCelebratedToday = false;
const mockNavigate = jest.fn();
const mockMarkCelebrated = jest.fn();
const mockHaptic = jest.fn(() => Promise.resolve());

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    mockReact.createElement(mockView, props, children),
}));
jest.mock('expo-haptics', () => ({
  notificationAsync: () => mockHaptic(),
  NotificationFeedbackType: { Success: 'success' },
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
  useIsFocused: () => mockFocused,
}));
jest.mock('@/data/gita/language', () => ({ useGitaLanguage: () => ({ lang: mockLang }) }));
jest.mock('@/data/routine/useRoutineToday', () => ({ useRoutineToday: () => mockToday }));
jest.mock('@/contexts/RoutineContext', () => ({
  useRoutines: () => ({
    celebratedToday: mockCelebratedToday,
    markCelebratedToday: mockMarkCelebrated,
  }),
}));
// Keep the petal animation out of the unit test; render a detectable marker.
// (factory must not close over out-of-scope vars — require lazily.)
jest.mock('@/components/RoutineCelebration', () => ({
  __esModule: true,
  default: () => {
    const R = require('react');
    const RN = require('react-native');
    return R.createElement(RN.Text, null, 'PETALS');
  },
}));

function render(): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(<RoutineBanner />);
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

function labels(tree: TestRenderer.ReactTestRenderer): string[] {
  return tree.root
    .findAll((n) => typeof n.props?.accessibilityLabel === 'string')
    .map((n) => n.props.accessibilityLabel as string);
}

beforeEach(() => {
  mockLang = 'hi';
  mockToday = { hasRoutine: false, doneCount: 0, total: 0 };
  mockFocused = true;
  mockCelebratedToday = false;
  mockNavigate.mockClear();
  mockMarkCelebrated.mockClear();
  mockHaptic.mockClear();
});

describe('RoutineBanner — nudge (no routine)', () => {
  it('shows a single Hindi line, not the old English secondary line', () => {
    const text = textOf(render());
    expect(text).toContain('अपनी नित्य साधना बनाएँ');
    expect(text).not.toContain('Set your daily practice');
  });

  it('honours English language preference for the single line', () => {
    mockLang = 'en';
    const text = textOf(render());
    expect(text).toContain('Set your daily practice');
    expect(text).not.toContain('अपनी नित्य साधना बनाएँ');
  });

  it('opens routine creation on press', () => {
    const tree = render();
    const pressable = tree.root.findAll((n) => typeof n.props?.onPress === 'function')[0];
    act(() => pressable.props.onPress());
    expect(mockNavigate).toHaveBeenCalledWith('HomeTab', { screen: 'RoutineCreate' });
  });
});

describe('RoutineBanner — progress', () => {
  it('shows one line plus X/total, without a second descriptive line', () => {
    mockToday = { hasRoutine: true, doneCount: 2, total: 4 };
    const text = textOf(render());
    expect(text).toContain('नित्य साधना · आज');
    expect(text).toMatch(/2\s*\/\s*4/); // "2/4" (textOf joins Text children with spaces)
    expect(text).not.toContain("Today's practice");
    expect(text).not.toContain('आज का पाठ');
  });
});

describe('RoutineBanner — complete', () => {
  it('shows the पूर्ण line and plays the pushpa-varsha once', () => {
    mockToday = { hasRoutine: true, doneCount: 4, total: 4 };
    const tree = render();
    expect(textOf(tree)).toContain('साधना पूर्ण · आज');
    expect(labels(tree)).toContain('आज की साधना पूर्ण');
    expect(textOf(tree)).toContain('PETALS');
    expect(mockMarkCelebrated).toHaveBeenCalledTimes(1);
    expect(mockHaptic).toHaveBeenCalledTimes(1);
  });

  it('does not replay once already celebrated today', () => {
    mockToday = { hasRoutine: true, doneCount: 4, total: 4 };
    mockCelebratedToday = true;
    const tree = render();
    expect(textOf(tree)).toContain('साधना पूर्ण · आज');
    expect(textOf(tree)).not.toContain('PETALS');
    expect(mockMarkCelebrated).not.toHaveBeenCalled();
  });

  it('does not celebrate while the screen is not focused', () => {
    mockToday = { hasRoutine: true, doneCount: 4, total: 4 };
    mockFocused = false;
    const tree = render();
    expect(textOf(tree)).not.toContain('PETALS');
    expect(mockMarkCelebrated).not.toHaveBeenCalled();
  });
});
