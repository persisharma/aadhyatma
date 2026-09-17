import assert from 'node:assert/strict';
import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text, View as mockView } from 'react-native';

import { GitaLanguageProvider } from '@/data/gita/language';
import { computeKundali, type KundaliChart } from '@/panchang/kundali';

const mockNavigation = { goBack: jest.fn(), navigate: jest.fn() };
const mockRootNavigate = jest.fn();

const adultChart = computeKundali({
  date: new Date('1992-08-14T00:12:00.000Z'),
  latitude: 23.1765,
  longitude: 75.7885,
  elevation: 500,
  timezone: 'Asia/Kolkata',
});
const childChart = computeKundali({
  date: new Date('2013-08-10T05:00:00.000Z'),
  latitude: 26.9124,
  longitude: 75.7873,
  timezone: 'Asia/Kolkata',
});

let mockKundaliState: {
  profile: unknown;
  chart: KundaliChart | null;
  hydrated: boolean;
  loadState: 'loading' | 'guest' | 'saved' | 'error';
} = { profile: null, chart: null, hydrated: true, loadState: 'guest' };

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockRootNavigate }),
}));
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    mockReact.createElement(mockView, props, children),
}));
jest.mock('@/panchang/useKundali', () => ({
  ...jest.requireActual('@/panchang/useKundali'),
  useKundali: () => mockKundaliState,
}));

const PrashnaScreen = jest.requireActual<typeof import('../PrashnaScreen')>('../PrashnaScreen').default;

function render(params?: { purposeId?: string }) {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang="en">
        <PrashnaScreen
          navigation={mockNavigation as any}
          route={{ key: 'Prashna-test', name: 'Prashna', params } as any}
        />
      </GitaLanguageProvider>
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

const byTestId = (tree: TestRenderer.ReactTestRenderer, id: string) =>
  tree.root.findAll((node) => node.props.testID === id && typeof node.type !== 'string');

test('guest state explains the requirement and offers Create Kundali', () => {
  mockKundaliState = { profile: null, chart: null, hydrated: true, loadState: 'guest' };
  const tree = render();
  assert.ok(textOf(tree).includes('answers from your birth chart'));
  act(() => {
    tree.root.findByProps({ accessibilityLabel: 'Create Kundali' }).props.onPress();
  });
  assert.ok(mockRootNavigate.mock.calls.some((call) => call[0] === 'Kundali'));
  act(() => tree.unmount());
});

test('an adult chart opens all nine purposes and renders the six answer blocks with basis chains', () => {
  mockKundaliState = {
    profile: { name: 'Aarav', date: '1992-08-14', time: '05:42', cityId: 'ujjain' },
    chart: adultChart,
    hydrated: true,
    loadState: 'saved',
  };
  const tree = render();
  const text = textOf(tree);
  assert.ok(text.includes('Aarav'));
  for (const id of ['vidya', 'vyapar', 'naukri', 'dhan', 'vivah', 'santan', 'swasthya', 'yatra', 'man']) {
    const tile = byTestId(tree, `purpose-${id}`)[0];
    assert.ok(tile, `purpose tile ${id}`);
    assert.equal(tile.props.accessibilityState.disabled, false, `${id} open for an adult`);
  }
  assert.ok(!text.includes('From age 18'));
  // Six blocks.
  for (const label of ['The short answer', 'Basis · why this reading', 'What supports, what resists', 'Windows · supportive periods', 'Direction · what to do', 'Practice']) {
    assert.ok(text.includes(label), `block: ${label}`);
  }
  assert.ok(byTestId(tree, 'prashna-saar').length > 0);
  assert.ok(byTestId(tree, 'prashna-strength').length > 0);
  assert.ok(byTestId(tree, 'prashna-chain-0').length > 0, 'at least one आधार chain');
  assert.ok(text.includes('· now'), 'a running window is marked');
  assert.match(text, /\d{1,2} [A-Z][a-z]{2} \d{4} → \d{1,2} [A-Z][a-z]{2} \d{4}/, 'dated window');
  assert.ok(tree.root.findByProps({ accessibilityLabel: 'Open Navagraha Stotram practice' }));
  assert.match(text, /As of \d{1,2} [A-Z][a-z]{2} \d{4}\. A view from traditional Jyotish/);
  assert.doesNotMatch(text, /\b(?:\d*[02-9])?[123]th bhava/);
  act(() => tree.unmount());
});

test('switching to business recomposes the answer and offers the Muhurat hand-off', () => {
  mockKundaliState = {
    profile: { name: 'Aarav', date: '1992-08-14', time: '05:42', cityId: 'ujjain' },
    chart: adultChart,
    hydrated: true,
    loadState: 'saved',
  };
  const tree = render();
  const before = textOf(tree);
  assert.equal(tree.root.findAll((node) => node.props.accessibilityLabel === 'Open Muhurat finder').length, 0);
  act(() => {
    byTestId(tree, 'purpose-vyapar')[0].props.onPress();
  });
  const after = textOf(tree);
  assert.notEqual(before, after, 'answer recomposed');
  const muhurat = tree.root.findAll((node) => node.props.accessibilityLabel === 'Open Muhurat finder' && typeof node.props.onPress === 'function');
  assert.ok(muhurat.length > 0, 'business offers the Muhurat finder');
  act(() => muhurat[0].props.onPress());
  assert.ok(mockRootNavigate.mock.calls.some((call) => call[0] === 'MuhuratFinder'));
  act(() => tree.unmount());
});

test("a 13-year-old's chart dims the five adult purposes with their reason and shows no reading for them", () => {
  mockKundaliState = {
    profile: { name: 'Aaradhya', date: '2013-08-10', time: '10:30', cityId: 'jaipur' },
    chart: childChart,
    hydrated: true,
    loadState: 'saved',
  };
  const tree = render({ purposeId: 'vyapar' });
  const text = textOf(tree);
  for (const id of ['vyapar', 'naukri', 'dhan']) {
    assert.equal(byTestId(tree, `purpose-${id}`)[0].props.accessibilityState.disabled, true, `${id} closed`);
  }
  for (const id of ['vivah', 'santan']) {
    assert.equal(byTestId(tree, `purpose-${id}`)[0].props.accessibilityState.disabled, true, `${id} closed`);
  }
  for (const id of ['vidya', 'swasthya', 'yatra', 'man']) {
    assert.equal(byTestId(tree, `purpose-${id}`)[0].props.accessibilityState.disabled, false, `${id} open`);
  }
  assert.ok(text.includes('From age 18') && text.includes('From age 21'));
  // A closed purpose preselected by deep link shows the gate, never a reading.
  assert.ok(text.includes('read only from age 18'));
  assert.equal(byTestId(tree, 'prashna-saar').length, 0, 'no सार for a closed purpose');
  assert.equal(byTestId(tree, 'prashna-strength').length, 0);
  // Moving to an open purpose renders the parent-facing register.
  act(() => {
    byTestId(tree, 'purpose-vidya')[0].props.onPress();
  });
  const study = textOf(tree);
  assert.ok(byTestId(tree, 'prashna-saar').length > 0);
  assert.ok(study.includes('For a parent:'));
  act(() => tree.unmount());
});
