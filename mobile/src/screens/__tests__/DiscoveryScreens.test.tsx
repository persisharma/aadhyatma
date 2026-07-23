import assert from 'node:assert/strict';
import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text, View as mockView } from 'react-native';
import { GitaLanguageProvider } from '@/data/gita/language';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    mockReact.createElement(mockView, props, children),
}));

const BrowseByPurposeScreen = jest.requireActual<typeof import('../BrowseByPurposeScreen')>(
  '../BrowseByPurposeScreen'
).default;
const PurposeListScreen = jest.requireActual<typeof import('../PurposeListScreen')>(
  '../PurposeListScreen'
).default;
const DeityDetailScreen = jest.requireActual<typeof import('../DeityDetailScreen')>(
  '../DeityDetailScreen'
).default;

function textOf(tree: TestRenderer.ReactTestRenderer): string {
  return tree.root
    .findAllByType(Text)
    .map((node) => node.props.children)
    .flat(Number.POSITIVE_INFINITY)
    .join(' ');
}

function renderWithLanguage(node: React.ReactElement, initialLang: 'hi' | 'en' = 'hi'): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang={initialLang}>{node}</GitaLanguageProvider>
    );
  });
  return tree;
}

function render(node: React.ReactElement): TestRenderer.ReactTestRenderer {
  return renderWithLanguage(node, 'hi');
}

const navigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
} as any;

test('Browse by Purpose shows the intent grid', () => {
  const tree = render(
    <BrowseByPurposeScreen
      navigation={navigation}
      route={{ key: 'BrowseByPurpose-test', name: 'BrowseByPurpose' } as any}
    />
  );
  const text = textOf(tree);
  assert.ok(text.includes('उद्देश्य'));
  assert.ok(text.includes('सुरक्षा'));
  assert.ok(!text.includes('Protection'));
  assert.ok(!text.includes('By Purpose'));
});

test('Browse by Purpose shows only primary English launcher labels in English mode', () => {
  const tree = renderWithLanguage(
    <BrowseByPurposeScreen
      navigation={navigation}
      route={{ key: 'BrowseByPurpose-test', name: 'BrowseByPurpose' } as any}
    />,
    'en'
  );
  const protectionLabels = tree.root
    .findAllByType(Text)
    .filter((node) => node.props.children === 'Protection');
  assert.equal(protectionLabels.length, 1);
  const text = textOf(tree);
  assert.ok(!text.includes('सुरक्षा'));
  assert.ok(text.includes('Auspicious'));
  assert.ok(!text.includes('Auspicious Beginnings'));
});

test('Purpose list shows matching texts across deities', () => {
  const tree = render(
    <PurposeListScreen
      navigation={navigation}
      route={{
        key: 'PurposeList-test',
        name: 'PurposeList',
        params: { purposeId: 'protection' },
      } as any}
    />
  );
  const text = textOf(tree);
  assert.ok(text.includes('श्रीरामरक्षास्तोत्रम्'));
  assert.ok(text.includes('श्री दुर्गा कवच'));
});

test('Deity detail shows essay and groups texts by form', () => {
  const tree = render(
    <DeityDetailScreen
      navigation={navigation}
      route={{
        key: 'DeityDetail-test',
        name: 'DeityDetail',
        params: { deityId: 'hanuman' },
      } as any}
    />
  );
  const text = textOf(tree);
  assert.ok(text.includes('हनुमान'));
  assert.ok(text.includes('चालीसा'));
  assert.ok(text.includes('अष्टकम्'));
});
