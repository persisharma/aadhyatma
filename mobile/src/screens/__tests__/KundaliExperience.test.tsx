import assert from 'node:assert/strict';
import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Pressable, Text, View as mockView } from 'react-native';

import { GitaLanguageProvider } from '@/data/gita/language';
import { library } from '@/data/texts';
import { buildEntryStartTarget } from '@/navigation/entryRoutes';
import { computeKundali } from '@/panchang/kundali';
import {
  birthProfileToInput,
  parseStoredBirthProfile,
  validateBirthProfile,
} from '@/panchang/useKundali';

const mockNavigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
};

const mockProfile = {
  name: 'Aarav',
  date: '1992-08-14',
  time: '05:42',
  cityId: 'ujjain',
};

const mockChart = computeKundali({
  date: new Date('1992-08-14T00:12:00.000Z'),
  latitude: 23.1765,
  longitude: 75.7885,
  elevation: 500,
  timezone: 'Asia/Kolkata',
});

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    mockReact.createElement(mockView, props, children),
}));

jest.mock('@/panchang/useKundali', () => ({
  ...jest.requireActual('@/panchang/useKundali'),
  useKundali: () => ({
    profile: mockProfile,
    chart: mockChart,
    hydrated: true,
    saveProfile: jest.fn(),
    clearProfile: jest.fn(),
  }),
}));

const KundaliScreen = jest.requireActual<typeof import('../KundaliScreen')>(
  '../KundaliScreen'
).default;
const RashifalScreen = jest.requireActual<typeof import('../RashifalScreen')>(
  '../RashifalScreen'
).default;

function render(node: React.ReactElement): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang="en">{node}</GitaLanguageProvider>
    );
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

test('Kundali result leads with plain-language insights and exposes all expert tabs', () => {
  const tree = render(
    <KundaliScreen
      navigation={mockNavigation as any}
      route={{ key: 'Kundali-test', name: 'Kundali' } as any}
    />
  );

  let text = textOf(tree);
  assert.ok(text.includes('Understand your chart first'));
  assert.ok(text.includes('not certain predictions'));
  assert.ok(text.includes('Aarav'));

  assert.ok(tree.root.findByProps({ accessibilityLabel: 'Overview tab' }));
  assert.ok(tree.root.findByProps({ accessibilityLabel: 'Chart tab' }));
  assert.ok(tree.root.findByProps({ accessibilityLabel: 'Grahas tab' }));
  assert.ok(tree.root.findByProps({ accessibilityLabel: 'Dasha tab' }));

  act(() => {
    tree.root.findByProps({ accessibilityLabel: 'Grahas tab' }).props.onPress();
  });
  text = textOf(tree);
  assert.ok(text.includes('Graha positions'));
  assert.ok(text.includes('House'));

  act(() => {
    tree.root.findByProps({ accessibilityLabel: 'Dasha tab' }).props.onPress();
  });
  text = textOf(tree);
  assert.ok(text.includes('Vimshottari Dasha'));
  assert.ok(text.includes('not an event guarantee'));
  assert.ok(text.includes('CURRENT PERIOD'));
  assert.ok(
    tree.root.findAll((node) =>
      typeof node.props.accessibilityLabel === 'string'
      && node.props.accessibilityLabel.startsWith('Current Dasha,')
    ).length > 0
  );
});

test('Daily Rashifal uses the saved Moon sign and remains guidance, not certainty', () => {
  const tree = render(
    <RashifalScreen
      navigation={mockNavigation as any}
      route={{ key: 'Rashifal-test', name: 'Rashifal', params: undefined } as any}
    />
  );

  const moon = mockChart.grahas.find((position) => position.graha === 'moon')!;
  const selected = tree.root.findByProps({
    accessibilityLabel: `${['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrischika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'][moon.rashiIndex]} Moon sign`,
  });
  assert.equal(selected.props.accessibilityState.selected, true);

  const text = textOf(tree);
  assert.ok(text.includes('not a certain prediction'));
  assert.ok(text.includes('FAVOUR'));
  assert.ok(text.includes('PAUSE'));
  assert.ok(text.includes('REFLECTION'));
});

test('birth profile parsing is strict and converts India wall time to the correct UTC instant', () => {
  assert.deepEqual(validateBirthProfile(mockProfile), {});
  assert.equal(
    birthProfileToInput(mockProfile).date.toISOString(),
    '1992-08-14T00:12:00.000Z'
  );
  assert.equal(
    parseStoredBirthProfile(JSON.stringify({ ...mockProfile, date: '1992-02-30' })),
    null
  );
  assert.deepEqual(parseStoredBirthProfile(JSON.stringify(mockProfile)), mockProfile);
});

test('every PRD-C practice id resolves through the existing reader dispatcher', () => {
  for (const sourceId of ['navagraha-stotram', 'surya-ashtakam', 'shani-ashtakam']) {
    const entry = library.find((candidate) => candidate.id === sourceId);
    assert.ok(entry, `${sourceId} exists`);
    assert.ok(buildEntryStartTarget(entry), `${sourceId} has a reader route`);
  }
});
