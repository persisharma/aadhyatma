import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text, View as mockView } from 'react-native';
import SankalpTodayCard from '@/components/SankalpTodayCard';
import { getProgram } from '@/data/sadhana/programs';
import { resolveRoutineItem } from '@/data/routine/units';
import type { SadhanaTodayCard } from '@/data/sadhana/useSadhanaToday';

const mockCommitDay = jest.fn();
const mockMarkCelebrated = jest.fn();
const mockWasCelebrated = jest.fn(() => false);
const mockNavigation = {};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    mockReact.createElement(mockView, props, children),
}));
jest.mock('@/data/gita/language', () => ({
  useGitaLanguage: () => ({ lang: 'en' }),
}));
jest.mock('@/contexts/SadhanaContext', () => ({
  useSadhana: () => ({
    commitDay: mockCommitDay,
    markCelebrated: mockMarkCelebrated,
    wasCelebrated: mockWasCelebrated,
  }),
}));

function textOf(tree: TestRenderer.ReactTestRenderer): string {
  return tree.root
    .findAllByType(Text)
    .map((n) => n.props.children)
    .flat(Number.POSITIVE_INFINITY)
    .join(' ');
}

function render(card: SadhanaTodayCard): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(<SankalpTodayCard card={card} />);
  });
  return tree;
}

beforeEach(() => {
  mockCommitDay.mockClear();
  mockMarkCelebrated.mockClear();
  mockWasCelebrated.mockClear();
});

describe('SankalpTodayCard', () => {
  it('shows preselected content for an upcoming calendar sankalp without active-day completion', () => {
    const program = getProgram('navratri-durga-9')!;
    const item = program.days![0].items[0];
    const card: SadhanaTodayCard = {
      enrollment: { programId: program.id, startedOn: '2026-07-03', status: 'active', completedDays: {} },
      program,
      status: {
        kind: 'waiting',
        totalDays: 9,
        doneCount: 0,
        reason: 'window-upcoming',
        whenKey: '2026-10-11',
        items: [item],
      },
      items: [
        {
          item,
          key: `${program.id}:waiting-${item.id}:${item.id}`,
          display: resolveRoutineItem(item),
          done: false,
        },
      ],
      allItemsDoneToday: false,
      autoVia: 'read-to-end',
    };

    const tree = render(card);
    const text = textOf(tree);

    expect(text).toContain('Navratri');
    expect(text).toContain('Durga Chalisa');
    expect(text).toContain('Whole text');
    expect(text).toContain('Tap to read');
    expect(text).not.toContain("Mark today's practice done");
    // A waiting preview is read-only — no check circle at all (a dead circle
    // reads as a broken control).
    const circles = tree.root.findAll(
      (n) => typeof n.props.accessibilityLabel === 'string' && n.props.accessibilityLabel.startsWith('Mark offered')
    );
    expect(circles).toHaveLength(0);
    expect(mockCommitDay).not.toHaveBeenCalled();
    expect(text).toContain('Preview');
  });

  it('allows an active sankalp day to be manually marked offered', () => {
    const program = getProgram('navratri-durga-9')!;
    const item = program.days![0].items[0];
    const card: SadhanaTodayCard = {
      enrollment: { programId: program.id, startedOn: '2026-07-03', status: 'active', completedDays: {} },
      program,
      status: {
        kind: 'active',
        dayIndex: 1,
        totalDays: 9,
        items: [item],
      },
      items: [
        {
          item,
          key: `${program.id}:1:${item.id}`,
          display: resolveRoutineItem(item),
          done: false,
        },
      ],
      allItemsDoneToday: false,
      autoVia: 'read-to-end',
    };

    const tree = render(card);
    const text = textOf(tree);

    expect(text).toContain('Durga Chalisa');
    // The eyebrow counts days *offered*, not the day-in-progress: a fresh active
    // day has 0 committed, so it reads "0 / 9" (not "Day 1 / 9"). This is what
    // ticks to 1/9 on completion — the "still 0/N after finishing" fix.
    expect(text).toContain('Sankalp · 0 / 9');
    expect(text).not.toContain('Day 1');
    // The circle's label names its item so it never collides with the routine
    // rows' generic "Mark offered" circles (a11y + Maestro disambiguation).
    const markButton = tree.root.findAll(
      (n) => n.props.accessibilityLabel === 'Mark offered — Durga Chalisa'
    )[0];

    expect(markButton).toBeDefined();
    act(() => markButton!.props.onPress());
    expect(mockCommitDay).toHaveBeenCalledWith(program.id, 1, 'marked');
  });

  it('eyebrow reflects completed days across active and done-today states', () => {
    const program = getProgram('hanuman-41')!;
    const item = program.day!.items[0];
    const mkItem = (done: boolean) => ({
      item,
      key: `${program.id}:x:${item.id}`,
      display: resolveRoutineItem(item),
      done,
    });

    // Two days already offered, working on day 3 → counter shows the 2 done.
    const active: SadhanaTodayCard = {
      enrollment: {
        programId: program.id,
        startedOn: '2026-07-01',
        status: 'active',
        completedDays: { 1: { at: '2026-07-01', via: 'read-to-end' }, 2: { at: '2026-07-02', via: 'read-to-end' } },
      },
      program,
      status: { kind: 'active', dayIndex: 3, totalDays: 41, items: [item] },
      items: [mkItem(false)],
      allItemsDoneToday: false,
      autoVia: 'read-to-end',
    };
    expect(textOf(render(active))).toContain('Sankalp · 2 / 41');

    // Once today's day commits, done-today shows the incremented count.
    const doneToday: SadhanaTodayCard = {
      ...active,
      enrollment: {
        ...active.enrollment,
        completedDays: { ...active.enrollment.completedDays, 3: { at: '2026-07-03', via: 'read-to-end' } },
      },
      status: { kind: 'done-today', dayIndex: 3, totalDays: 41 },
      items: [],
    };
    expect(textOf(render(doneToday))).toContain('Sankalp · 3 / 41');
  });
});
