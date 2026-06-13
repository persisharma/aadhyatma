import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import RoutineCelebrationOverlay from '@/components/RoutineCelebrationOverlay';

// ---- mutable mock state (reset in beforeEach) ----
let mockLang: 'hi' | 'en' = 'hi';
type Today = { hasRoutine: boolean; doneCount: number; total: number; entries: { key: string }[] };
let mockToday: Today = { hasRoutine: false, doneCount: 0, total: 0, entries: [] };
let mockCelebratedSig: string | null = null;
let mockIsLoading = false;
const mockMarkCelebrated = jest.fn();
const mockHaptic = jest.fn(() => Promise.resolve());

jest.mock('expo-haptics', () => ({
  notificationAsync: () => mockHaptic(),
  NotificationFeedbackType: { Success: 'success' },
}));
jest.mock('@/data/gita/language', () => ({ useGitaLanguage: () => ({ lang: mockLang }) }));
jest.mock('@/data/routine/useRoutineToday', () => ({ useRoutineToday: () => mockToday }));
jest.mock('@/contexts/RoutineContext', () => ({
  useRoutines: () => ({
    celebratedSignatureToday: mockCelebratedSig,
    markCelebrated: mockMarkCelebrated,
    isLoading: mockIsLoading,
  }),
}));
// Keep the petal animation out of the unit test; render a detectable marker that
// echoes the caption (so language wiring is observable) and exposes `onDone` via
// onPress (so the self-dismiss path can be driven deterministically).
jest.mock('@/components/RoutineCelebration', () => ({
  __esModule: true,
  default: ({ caption, onDone }: { caption: string; onDone?: () => void }) => {
    const R = require('react');
    const RN = require('react-native');
    return R.createElement(RN.Text, { onPress: onDone }, `PETALS:${caption}`);
  },
}));

function render(): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(<RoutineCelebrationOverlay />);
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

const complete = (entries: { key: string }[]): Today => ({
  hasRoutine: true,
  doneCount: entries.length,
  total: entries.length,
  entries,
});

beforeEach(() => {
  mockLang = 'hi';
  mockToday = { hasRoutine: false, doneCount: 0, total: 0, entries: [] };
  mockCelebratedSig = null;
  mockIsLoading = false;
  mockMarkCelebrated.mockClear();
  mockHaptic.mockClear();
});

describe('RoutineCelebrationOverlay', () => {
  it('plays the pushpa-varsha when the whole routine first completes', () => {
    mockToday = complete([{ key: 'r1:a' }, { key: 'r1:b' }]);
    const tree = render();
    expect(textOf(tree)).toContain('PETALS');
    expect(mockMarkCelebrated).toHaveBeenCalledWith('r1:a|r1:b');
    expect(mockMarkCelebrated).toHaveBeenCalledTimes(1);
    expect(mockHaptic).toHaveBeenCalledTimes(1);
  });

  it('shows the Hindi caption by default', () => {
    mockToday = complete([{ key: 'r1:a' }]);
    expect(textOf(render())).toContain('साधना पूर्ण · आज');
  });

  it('shows the English caption when reading language is English', () => {
    mockLang = 'en';
    mockToday = complete([{ key: 'r1:a' }]);
    expect(textOf(render())).toContain('Complete for today');
  });

  it('does not replay when this completed set was already celebrated today', () => {
    mockToday = complete([{ key: 'r1:a' }, { key: 'r1:b' }]);
    mockCelebratedSig = 'r1:a|r1:b';
    const tree = render();
    expect(textOf(tree)).not.toContain('PETALS');
    expect(mockMarkCelebrated).not.toHaveBeenCalled();
  });

  it('does not replay on relaunch while the persisted gate is still loading', () => {
    // Relaunch of an already-complete day: completion is live from the first
    // render, but celebratedSignatureToday is a transient null until hydration
    // finishes. Firing here is the every-launch pushpa-varsha bug.
    mockToday = complete([{ key: 'r1:a' }, { key: 'r1:b' }]);
    mockCelebratedSig = null;
    mockIsLoading = true;
    const tree = render();
    expect(textOf(tree)).not.toContain('PETALS');
    expect(mockMarkCelebrated).not.toHaveBeenCalled();
  });

  it('stays silent while the routine is only partially done', () => {
    mockToday = { hasRoutine: true, doneCount: 1, total: 2, entries: [{ key: 'r1:a' }, { key: 'r1:b' }] };
    const tree = render();
    expect(textOf(tree)).not.toContain('PETALS');
    expect(mockMarkCelebrated).not.toHaveBeenCalled();
  });

  it('dismisses the shower once the animation finishes (onDone)', () => {
    mockToday = complete([{ key: 'r1:a' }]);
    const tree = render();
    const petals = tree.root.find(
      (n) => typeof n.props?.onPress === 'function' && String(n.props?.children).includes('PETALS')
    );
    act(() => petals.props.onPress());
    expect(textOf(tree)).not.toContain('PETALS');
  });
});
