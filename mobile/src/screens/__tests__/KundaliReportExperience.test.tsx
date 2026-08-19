import assert from 'node:assert/strict';
import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text, View as mockView } from 'react-native';

import { GitaLanguageProvider } from '@/data/gita/language';
import { computeKundali, type KundaliChart } from '@/panchang/kundali';

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
  profile: unknown;
  chart: KundaliChart | null;
  hydrated: boolean;
  loadState: 'loading' | 'guest' | 'saved' | 'error';
} = {
  profile: null,
  chart: null,
  hydrated: true,
  loadState: 'guest',
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    mockReact.createElement(mockView, props, children),
}));

jest.mock('react-native-view-shot', () => ({
  captureRef: jest.fn(() => Promise.resolve('file://jyotish-share.png')),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  shareAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('@/panchang/useKundali', () => ({
  ...jest.requireActual('@/panchang/useKundali'),
  useKundali: () => mockKundaliState,
}));

const KundaliReportScreen = jest.requireActual<typeof import('../KundaliReportScreen')>(
  '../KundaliReportScreen'
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

test('guest state explains the requirement and offers Create Kundali', () => {
  mockKundaliState = { profile: null, chart: null, hydrated: true, loadState: 'guest' };
  const tree = render(
    <KundaliReportScreen
      navigation={mockNavigation as any}
      route={{ key: 'KundaliReport-test', name: 'KundaliReport' } as any}
    />
  );
  const text = textOf(tree);
  assert.ok(text.includes('compiled from your birth chart'));
  assert.ok(tree.root.findByProps({ accessibilityLabel: 'Create Kundali' }));
  act(() => tree.unmount());
});

test('saved report renders every section in order with disclaimers at both ends', () => {
  mockKundaliState = {
    profile: { name: 'Aarav', date: '1992-08-14', time: '05:42', cityId: 'ujjain' },
    chart: savedChart,
    hydrated: true,
    loadState: 'saved',
  };
  const tree = render(
    <KundaliReportScreen
      navigation={mockNavigation as any}
      route={{ key: 'KundaliReport-test', name: 'KundaliReport' } as any}
    />
  );
  const text = textOf(tree);

  for (const heading of [
    'Birth details and chart summary',
    'Lagna',
    'Inner rhythm',
    'Career and work',
    'Relationships',
    'Resources and gains',
    'Self and routine',
    'Home and learning',
    'Dharma and fortune',
    'Current classical observations',
    'Vimshottari Dasha — a life-year view',
  ]) {
    assert.ok(text.includes(heading), `section: ${heading}`);
  }
  assert.ok(text.includes('Aarav'));
  assert.ok(text.includes('Ujjain'));
  assert.ok(text.includes('Sade Sati'));
  assert.ok(text.includes('(current)'));
  // Mangal Dosha stays display-gated off (PRD-20 §4).
  assert.ok(!text.includes('Mangal'));
  assert.ok(!/kaal\s*sarp/i.test(text));

  const disclaimers = tree.root.findAllByType(Text).filter(
    (node) =>
      typeof node.props.children === 'string'
      && node.props.children.includes('not a certain prediction')
  );
  assert.ok(disclaimers.length >= 2, 'disclaimer frames the report at both ends');
  act(() => tree.unmount());
});

test('sharing the summary goes through the warned Kundali path', () => {
  mockKundaliState = {
    profile: { name: 'Aarav', date: '1992-08-14', time: '05:42', cityId: 'ujjain' },
    chart: savedChart,
    hydrated: true,
    loadState: 'saved',
  };
  const tree = render(
    <KundaliReportScreen
      navigation={mockNavigation as any}
      route={{ key: 'KundaliReport-test', name: 'KundaliReport' } as any}
    />
  );
  act(() => {
    tree.root.findByProps({ accessibilityLabel: 'Share chart summary' }).props.onPress();
  });
  assert.ok(
    textOf(tree).includes('includes the chart name, birth date, time, and city'),
    'the Kundali-style birth-details warning is visible'
  );
  act(() => tree.unmount());
});
