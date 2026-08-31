import assert from 'node:assert/strict';
import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { InteractionManager, Text, View as mockView } from 'react-native';

import { GitaLanguageProvider } from '@/data/gita/language';
import { computeKundali, type KundaliChart } from '@/panchang/kundali';
import { computeSadeSati } from '@/panchang/gochar';

const mockNavigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
};

const savedChart = computeKundali({
  date: new Date('1992-08-14T00:12:00.000Z'),
  latitude: 23.1765,
  longitude: 75.7885,
  elevation: 500,
  timezone: 'Asia/Kolkata',
});

let mockKundaliState: {
  profile: { id?: string; name?: string; date?: string; time?: string; cityId?: string } | null;
  chart: KundaliChart | null;
  hydrated: boolean;
  loadState: 'loading' | 'guest' | 'saved' | 'error';
  people: { id: string; name?: string }[];
} = {
  profile: null,
  chart: null,
  hydrated: true,
  loadState: 'guest',
  people: [],
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    mockReact.createElement(mockView, props, children),
}));

jest.mock('@/panchang/useKundali', () => ({
  ...jest.requireActual('@/panchang/useKundali'),
  useKundali: () => mockKundaliState,
}));

const GocharScreen = jest.requireActual<typeof import('../GocharScreen')>(
  '../GocharScreen'
).default;

beforeEach(() => {
  // Run deferred work immediately — the real scheduler keeps timers alive
  // past the test run and stalls the deferred ingress solves.
  jest
    .spyOn(InteractionManager, 'runAfterInteractions')
    .mockImplementation((task) => {
      if (typeof task === 'function') task();
      return { then: jest.fn(), done: jest.fn(), cancel: jest.fn() } as any;
    });
});

afterEach(() => {
  jest.restoreAllMocks();
});

async function render(node: React.ReactElement): Promise<TestRenderer.ReactTestRenderer> {
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang="en">{node}</GitaLanguageProvider>
    );
  });
  // Effects flush as the first act closes; a second act lets the screen's
  // deferred setTimeout(0) solve fire and land its state inside act.
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  return tree;
}

function textOf(tree: TestRenderer.ReactTestRenderer): string {
  return tree.root
    .findAllByType(Text)
    .map((node) => node.props.children)
    .flat(Number.POSITIVE_INFINITY)
    .join(' ');
}

test('guest state explains the chart requirement and offers Create Kundali', async () => {
  mockKundaliState = { profile: null, chart: null, hydrated: true, loadState: 'guest', people: [] };
  const tree = await render(
    <GocharScreen
      navigation={mockNavigation as any}
      route={{ key: 'Gochar-test', name: 'Gochar' } as any}
    />
  );
  const text = textOf(tree);
  assert.ok(text.includes('not a certain prediction'));
  assert.ok(text.includes('Transits are read against your birth chart'));
  const create = tree.root.findByProps({ accessibilityLabel: 'Create Kundali' });
  act(() => create.props.onPress());
  assert.ok(mockNavigation.navigate.mock.calls.some(([route]) => route === 'Kundali'));
  await act(async () => tree.unmount());
});

test('saved state renders the nine-graha table, themes, Sade Sati, and ingress list', async () => {
  mockKundaliState = {
    profile: { id: 'p1', name: 'Aarav', date: '1992-08-14', time: '05:42', cityId: 'ujjain' },
    chart: savedChart,
    hydrated: true,
    loadState: 'saved',
    people: [{ id: 'p1', name: 'Aarav' }],
  };
  const tree = await render(
    <GocharScreen
      navigation={mockNavigation as any}
      route={{ key: 'Gochar-test', name: 'Gochar' } as any}
    />
  );
  const text = textOf(tree);

  assert.ok(text.includes('Today’s transits'));
  for (const graha of ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu']) {
    assert.ok(text.includes(graha), `${graha} row renders`);
  }
  // Full accessibility summary carries every graha (text-equivalence rule).
  const summary = tree.root.findAll(
    (node) =>
      typeof node.props.accessibilityLabel === 'string'
      && node.props.accessibilityLabel.includes('graha transits against your chart')
  );
  assert.ok(summary.length >= 1, 'transit table exposes one full text summary');
  assert.ok(summary[0].props.accessibilityLabel.includes('retrograde'));

  assert.ok(text.includes('Active house themes'));

  // Weekly strip: seven day rows, each labeled with its full basis line.
  assert.ok(text.includes('Week at a glance'));
  assert.ok(text.includes('not a rating or verdict'));
  const weeklyRows = tree.root.findAll(
    (node) =>
      node.props.accessible === true
      && typeof node.props.accessibilityLabel === 'string'
      && / tara — /.test(node.props.accessibilityLabel)
  );
  assert.ok(weeklyRows.length >= 7, 'seven weekly rows carry their basis lines');

  assert.ok(text.includes('Sade Sati'));
  const expected = computeSadeSati(savedChart, new Date(), { boundaryScanDays: 0 });
  assert.ok(text.includes(expected.headlineEn.replace('Sade Sati · ', '')) || text.includes(expected.headlineEn));

  assert.ok(text.includes('Upcoming sign changes'));
  // Deferred solve flushed → at least one fast-mover ingress row.
  assert.ok(
    tree.root.findAll(
      (node) =>
        typeof node.props.accessibilityLabel === 'string'
        && / enters .* on /.test(node.props.accessibilityLabel)
    ).length > 0,
    'ingress rows render after the deferred solve'
  );
  await act(async () => tree.unmount());
});

test('the header names whose chart once the roster holds more than one person', async () => {
  const single = {
    profile: { id: 'p1', name: 'Aarav', date: '1992-08-14', time: '05:42', cityId: 'ujjain' },
    chart: savedChart,
    hydrated: true,
    loadState: 'saved' as const,
    people: [{ id: 'p1', name: 'Aarav' }],
  };
  mockKundaliState = single;
  let tree = await render(
    <GocharScreen
      navigation={mockNavigation as any}
      route={{ key: 'Gochar-test', name: 'Gochar' } as any}
    />
  );
  assert.ok(textOf(tree).includes('Today’s grahas in your chart'), 'one person → "your"');
  await act(async () => tree.unmount());

  // With two people saved, "your" would be a guess (§51a).
  mockKundaliState = {
    ...single,
    people: [{ id: 'p1', name: 'Aarav' }, { id: 'p2', name: 'Meera' }],
  };
  tree = await render(
    <GocharScreen
      navigation={mockNavigation as any}
      route={{ key: 'Gochar-test', name: 'Gochar' } as any}
    />
  );
  const text = textOf(tree);
  assert.ok(text.includes('Today’s grahas in Aarav’s chart'), 'names the active person');
  assert.ok(!text.includes('Today’s grahas in your chart'));
  await act(async () => tree.unmount());
});

test('practice link appears only while a Sade Sati phase is active', async () => {
  mockKundaliState = {
    profile: { id: 'p1', name: 'Aarav', date: '1992-08-14', time: '05:42', cityId: 'ujjain' },
    chart: savedChart,
    hydrated: true,
    loadState: 'saved',
    people: [{ id: 'p1', name: 'Aarav' }],
  };
  const tree = await render(
    <GocharScreen
      navigation={mockNavigation as any}
      route={{ key: 'Gochar-test', name: 'Gochar' } as any}
    />
  );
  const active = computeSadeSati(savedChart, new Date(), { boundaryScanDays: 0 }).phase !== 'none';
  const links = tree.root.findAll(
    (node) => node.props.accessibilityLabel === 'Open Shani Ashtakam practice'
  );
  assert.equal(links.length > 0, active);
  await act(async () => tree.unmount());
});
