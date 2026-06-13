import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text, View as mockView } from 'react-native';
import RoutineBanner from '@/components/RoutineBanner';

// ---- mutable mock state (reset in beforeEach) ----
let mockLang: 'hi' | 'en' = 'hi';
let mockToday = { hasRoutine: false, doneCount: 0, total: 0 };
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
  mockNavigate.mockClear();
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
  it('shows the पूर्ण line and the lotus achievement badge as a status chip', () => {
    mockToday = { hasRoutine: true, doneCount: 4, total: 4 };
    const tree = render();
    expect(textOf(tree)).toContain('साधना पूर्ण · आज');
    expect(labels(tree)).toContain('आज की साधना पूर्ण');
  });

  it('does not play petals inline — the pushpa-varsha is now an app-level overlay', () => {
    mockToday = { hasRoutine: true, doneCount: 4, total: 4 };
    const tree = render();
    // The banner must not pull in the celebration overlay; petals fire globally.
    expect(textOf(tree)).not.toContain('PETALS');
  });
});
