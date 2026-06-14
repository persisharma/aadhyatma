import assert from 'node:assert/strict';
import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    mockReact.createElement(require('react-native').View, props, children),
}));

jest.mock('react-native-safe-area-context', () => {
  const ReactLib = require('react');
  const { View } = require('react-native');
  return {
    SafeAreaView: ({ children, ...p }: React.PropsWithChildren<Record<string, unknown>>) =>
      ReactLib.createElement(View, p, children),
    SafeAreaProvider: ({ children }: React.PropsWithChildren) => children,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

const { GitaLanguageProvider } = jest.requireActual<typeof import('@/data/gita/language')>(
  '@/data/gita/language',
);
const TheerthDetailScreen = jest.requireActual<typeof import('../TheerthDetailScreen')>(
  '../TheerthDetailScreen',
).default;

type Props = React.ComponentProps<typeof TheerthDetailScreen>;

const navigation = { goBack: jest.fn(), navigate: jest.fn() } as unknown as Props['navigation'];

function render(templeId: string, lang: 'hi' | 'en') {
  const route = { key: 'd', name: 'TheerthDetail', params: { templeId } } as Props['route'];
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang={lang}>
        <TheerthDetailScreen navigation={navigation} route={route} />
      </GitaLanguageProvider>,
    );
  });
  return tree
    .root.findAllByType(Text)
    .map((n) => n.props.children)
    .flat(Number.POSITIVE_INFINITY)
    .join(' ');
}

test('renders sourced temple detail content in Hindi', () => {
  const text = render('somnath', 'hi');
  assert.match(text, /सोमनाथ/, 'temple name');
  assert.match(text, /शिव/, 'deity badge');
  assert.match(text, /सोमराज|चन्द्र/, 'Somnath story');
  assert.match(text, /स्रोत/, 'source label');
  assert.doesNotMatch(text, /RULEBOOK §10\.3/, 'placeholder should not render');
});

test('renders sourced statewise temple detail content in English', () => {
  const text = render('srinathji', 'en');
  assert.match(text, /Srinathji/);
  assert.match(text, /Nathdwara/);
  assert.match(text, /Govardhan|Pushtimarg/);
  assert.match(text, /Sources/);
  assert.doesNotMatch(text, /RULEBOOK §10\.3/);
});

test('shows a not-found message for an unknown temple id', () => {
  const text = render('does-not-exist', 'en');
  assert.match(text, /not found/i);
});
