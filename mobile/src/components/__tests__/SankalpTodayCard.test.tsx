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

/**
 * The units drop down only after the card header is tapped (accordion). Find
 * the header — the one Pressable carrying an `expanded` accessibility state —
 * and toggle it open so the item rows render.
 */
function expand(tree: TestRenderer.ReactTestRenderer): void {
  const header = tree.root.findAll(
    (n) => typeof n.props.accessibilityState?.expanded === 'boolean'
  )[0];
  expect(header).toBeDefined();
  act(() => header!.props.onPress());
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

    // Header is always visible; the unit rows are collapsed until tapped.
    expect(textOf(tree)).toContain('Navratri');
    expect(textOf(tree)).not.toContain('Durga Chalisa');

    expand(tree);
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

    // The eyebrow counts days *offered*, not the day-in-progress: a fresh active
    // day has 0 committed, so it reads "0 / 9" (not "Day 1 / 9"). This is what
    // ticks to 1/9 on completion — the "still 0/N after finishing" fix. The
    // eyebrow lives in the always-visible header.
    expect(textOf(tree)).toContain('Sankalp · 0 / 9');
    expect(textOf(tree)).not.toContain('Day 1');

    // The unit row (and its offering circle) only appear once the card is opened.
    expand(tree);
    const text = textOf(tree);
    expect(text).toContain('Durga Chalisa');
    // The circle's label names its item so it never collides with the routine
    // rows' generic "Mark offered" circles (a11y + Maestro disambiguation).
    const markButton = tree.root.findAll(
      (n) => n.props.accessibilityLabel === 'Mark offered — Durga Chalisa'
    )[0];

    expect(markButton).toBeDefined();
    act(() => markButton!.props.onPress());
    expect(mockCommitDay).toHaveBeenCalledWith(program.id, 1, 'marked');
  });

  it('tap-toggles the units dropdown open and closed', () => {
    const program = getProgram('navratri-durga-9')!;
    const item = program.days![0].items[0];
    const card: SadhanaTodayCard = {
      enrollment: { programId: program.id, startedOn: '2026-07-03', status: 'active', completedDays: {} },
      program,
      status: { kind: 'active', dayIndex: 1, totalDays: 9, items: [item] },
      items: [
        { item, key: `${program.id}:1:${item.id}`, display: resolveRoutineItem(item), done: false },
      ],
      allItemsDoneToday: false,
      autoVia: 'read-to-end',
    };

    const tree = render(card);
    const header = () =>
      tree.root.findAll((n) => typeof n.props.accessibilityState?.expanded === 'boolean')[0];

    // Collapsed by default: header present, units hidden.
    expect(header()!.props.accessibilityState.expanded).toBe(false);
    expect(textOf(tree)).not.toContain('Durga Chalisa');

    // Tap once → open.
    act(() => header()!.props.onPress());
    expect(header()!.props.accessibilityState.expanded).toBe(true);
    expect(textOf(tree)).toContain('Durga Chalisa');

    // Tap again → collapse.
    act(() => header()!.props.onPress());
    expect(header()!.props.accessibilityState.expanded).toBe(false);
    expect(textOf(tree)).not.toContain('Durga Chalisa');
  });

  it('renders a multi-day progress bar reflecting days offered, hidden once complete', () => {
    const program = getProgram('hanuman-41')!;
    const item = program.day!.items[0];
    const bar = (tree: TestRenderer.ReactTestRenderer) =>
      tree.root.findAll((n) => n.props.accessibilityRole === 'progressbar')[0];

    // Ten of 41 days offered → the bar is present and reports 10/41.
    const active: SadhanaTodayCard = {
      enrollment: {
        programId: program.id,
        startedOn: '2026-07-01',
        status: 'active',
        completedDays: Object.fromEntries(
          Array.from({ length: 10 }, (_, i) => [i + 1, { at: '2026-07-01', via: 'read-to-end' }])
        ),
      },
      program,
      status: { kind: 'active', dayIndex: 11, totalDays: 41, items: [item] },
      items: [
        { item, key: `${program.id}:11:${item.id}`, display: resolveRoutineItem(item), done: false },
      ],
      allItemsDoneToday: false,
      autoVia: 'read-to-end',
    };
    const activeBar = bar(render(active));
    expect(activeBar).toBeDefined();
    expect(activeBar!.props.accessibilityValue).toEqual({ min: 0, max: 41, now: 10 });

    // On पूर्णाहुति the terminal seal replaces the bar — no progressbar node.
    const completed: SadhanaTodayCard = {
      enrollment: {
        programId: program.id,
        startedOn: '2026-07-01',
        status: 'completed',
        completedDays: {},
        completedOn: '2026-08-10',
      },
      program,
      status: { kind: 'completed', totalDays: 41, completedOn: '2026-08-10' },
      items: [],
      allItemsDoneToday: false,
      autoVia: 'read-to-end',
    };
    expect(bar(render(completed))).toBeUndefined();
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
