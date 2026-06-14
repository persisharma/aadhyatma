import assert from 'node:assert/strict';
import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';

jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: { Light: 'Light' },
  impactAsync: jest.fn(() => Promise.resolve()),
}));

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

jest.mock('react-native-svg', () => {
  const ReactLib = require('react');
  const { View } = require('react-native');
  const mk = () => (props: Record<string, unknown>) =>
    ReactLib.createElement(View, props, props.children as React.ReactNode);
  const Svg = mk();
  return { __esModule: true, default: Svg, Svg, Path: mk(), G: mk() };
});

const { GitaLanguageProvider } = jest.requireActual<typeof import('@/data/gita/language')>(
  '@/data/gita/language',
);
const TheerthMapScreen = jest.requireActual<typeof import('../TheerthMapScreen')>(
  '../TheerthMapScreen',
).default;

type Props = React.ComponentProps<typeof TheerthMapScreen>;

function makeNavigation() {
  const navigate = jest.fn();
  const navigation = { navigate, goBack: jest.fn() } as unknown as Props['navigation'];
  return { navigation, navigate };
}
const route = { key: 'TheerthMap', name: 'TheerthMap', params: {} } as Props['route'];

function render(navigation: Props['navigation'], lang: 'hi' | 'en' = 'hi') {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang={lang}>
        <TheerthMapScreen navigation={navigation} route={route} />
      </GitaLanguageProvider>,
    );
  });
  return tree;
}

function allText(tree: TestRenderer.ReactTestRenderer): string {
  return tree.root
    .findAllByType(Text)
    .map((n) => n.props.children)
    .flat(Number.POSITIVE_INFINITY)
    .join(' ');
}

// View-mode toggle radios (By State / By Category) carry no accessibilityLabel;
// the language toggle radios (Hindi/English) do — exclude those.
function viewRadios(tree: TestRenderer.ReactTestRenderer) {
  return tree.root.findAll(
    (n) =>
      n.props.accessibilityRole === 'radio' &&
      typeof n.props.onPress === 'function' &&
      n.props.accessibilityLabel === undefined,
  );
}

function tappableByLabel(tree: TestRenderer.ReactTestRenderer, label: string) {
  return tree.root.findAll(
    (n) => n.props.accessibilityLabel === label && typeof n.props.onPress === 'function',
  );
}

test('renders the Theerth map screen with the Devanagari title', () => {
  const { navigation } = makeNavigation();
  const tree = render(navigation, 'hi');
  assert.match(allText(tree), /तीर्थ/);
});

test('exposes exactly two view-mode toggles (By State / By Category)', () => {
  const { navigation } = makeNavigation();
  const tree = render(navigation, 'en');
  assert.equal(viewRadios(tree).length, 2, 'expected a 2-option toggle');
  const text = allText(tree);
  assert.match(text, /By State/);
  assert.match(text, /By Category/);
});

test('no internal filter chips are rendered', () => {
  const { navigation } = makeNavigation();
  const tree = render(navigation, 'en');
  const chips = tree.root.findAll(
    (n) =>
      typeof n.props.accessibilityLabel === 'string' &&
      n.props.accessibilityLabel.startsWith('filter-'),
  );
  assert.equal(chips.length, 0, 'filter chips should be gone');
});

test('tapping a map pin navigates to TheerthDetail with the temple id', () => {
  const { navigation, navigate } = makeNavigation();
  const tree = render(navigation, 'hi');
  // Map is always visible; the pin carries the temple name as its a11y label.
  const target = tappableByLabel(tree, 'सोमनाथ')[0];
  act(() => {
    target.props.onPress();
  });
  const call = navigate.mock.calls.at(-1) as [string, { templeId: string }];
  assert.equal(call[0], 'TheerthDetail');
  assert.equal(call[1].templeId, 'somnath');
});

test('By-State view (default) focuses a state when its header is tapped', () => {
  const { navigation } = makeNavigation();
  const tree = render(navigation, 'hi');
  const header = tree.root.findAll(
    (n) =>
      n.props.accessibilityRole === 'button' &&
      typeof n.props.accessibilityLabel === 'string' &&
      n.props.accessibilityLabel.includes('Gujarat') &&
      typeof n.props.onPress === 'function',
  )[0];
  act(() => {
    header.props.onPress();
  });
  assert.match(allText(tree), /◆/);
});

test('By-State list rows navigate to TheerthDetail', () => {
  const { navigation, navigate } = makeNavigation();
  const tree = render(navigation, 'hi');
  const target = tappableByLabel(tree, 'श्रीनाथजी')[0];
  act(() => {
    target.props.onPress();
  });
  const call = navigate.mock.calls.at(-1) as [string, { templeId: string }];
  assert.equal(call[0], 'TheerthDetail');
  assert.equal(call[1].templeId, 'srinathji');
});

test('By-Category view lists category sections and rows navigate', () => {
  const { navigation, navigate } = makeNavigation();
  const tree = render(navigation, 'en');
  act(() => {
    viewRadios(tree)[1].props.onPress(); // By Category
  });
  assert.match(allText(tree), /Other Famous Temples/);
  const row = tappableByLabel(tree, 'Tirupati Balaji')[0];
  act(() => {
    row.props.onPress();
  });
  const call = navigate.mock.calls.at(-1) as [string, { templeId: string }];
  assert.equal(call[0], 'TheerthDetail');
  assert.equal(call[1].templeId, 'tirupati-balaji');
});
