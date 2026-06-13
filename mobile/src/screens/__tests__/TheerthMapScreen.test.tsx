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

test('renders the Theerth map screen with the Devanagari title', () => {
  const { navigation } = makeNavigation();
  const tree = render(navigation, 'hi');
  assert.match(allText(tree), /तीर्थ/);
});

test('tapping a pin navigates to TheerthDetail with the temple id', () => {
  const { navigation, navigate } = makeNavigation();
  const tree = render(navigation, 'hi');
  const pin = tree.root.find(
    (n) => n.props.accessibilityLabel === 'सोमनाथ' && typeof n.props.onPress === 'function',
  );
  act(() => {
    pin.props.onPress();
  });
  assert.equal(navigate.mock.calls.length, 1);
  const [screen, params] = navigate.mock.calls[0] as [string, { templeId: string }];
  assert.equal(screen, 'TheerthDetail');
  assert.equal(params.templeId, 'somnath');
});

test('By-State view focuses a state when its header is tapped', () => {
  const { navigation } = makeNavigation();
  const tree = render(navigation, 'hi');

  // Switch to the "By State" view (second of map/state/yatra radios).
  // The view-mode toggle radios (map/state/yatra) carry no accessibilityLabel;
  // the language toggle radios (Hindi/English) do — exclude those.
  const radios = tree.root.findAll(
    (n) =>
      n.props.accessibilityRole === 'radio' &&
      typeof n.props.onPress === 'function' &&
      n.props.accessibilityLabel === undefined,
  );
  assert.ok(radios.length >= 2, 'expected the view-mode toggle');
  act(() => {
    radios[1].props.onPress();
  });

  // Tap the Gujarat state header.
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

  // The focused header shows the ◆ marker.
  assert.match(allText(tree), /◆/);
});

test('By-State view list rows navigate to TheerthDetail', () => {
  const { navigation, navigate } = makeNavigation();
  const tree = render(navigation, 'hi');
  // The view-mode toggle radios (map/state/yatra) carry no accessibilityLabel;
  // the language toggle radios (Hindi/English) do — exclude those.
  const radios = tree.root.findAll(
    (n) =>
      n.props.accessibilityRole === 'radio' &&
      typeof n.props.onPress === 'function' &&
      n.props.accessibilityLabel === undefined,
  );
  act(() => {
    radios[1].props.onPress();
  });
  // Tap a temple by its accessibility label (matches both the list row and the
  // compact-map pin — both route to the same detail screen).
  const target = tree.root.findAll(
    (n) => n.props.accessibilityLabel === 'श्रीनाथजी' && typeof n.props.onPress === 'function',
  )[0];
  act(() => {
    target.props.onPress();
  });
  const lastCall = navigate.mock.calls.at(-1) as [string, { templeId: string }];
  assert.equal(lastCall[0], 'TheerthDetail');
  assert.equal(lastCall[1].templeId, 'srinathji');
});

test('filter chips narrow the pins shown on the map (English)', () => {
  const { navigation } = makeNavigation();
  const tree = render(navigation, 'en');
  assert.match(allText(tree), /By Yatra/); // English view-toggle labels render

  const present = (label: string) =>
    tree.root.findAll(
      (n) => n.props.accessibilityLabel === label && typeof n.props.onPress === 'function',
    ).length;

  assert.ok(present('Somnath') >= 1, 'Somnath pin shown under All');

  const charDham = tree.root.findAll(
    (n) => n.props.accessibilityLabel === 'filter-char-dham' && typeof n.props.onPress === 'function',
  )[0];
  act(() => {
    charDham.props.onPress();
  });

  // Somnath is a Jyotirlinga only → filtered out; Badrinath is Char Dham → stays.
  assert.equal(present('Somnath'), 0, 'Somnath filtered out of Char Dham');
  assert.ok(present('Badrinath') >= 1, 'Badrinath remains under Char Dham');
});

test('By-Yatra view lists yatra sections and rows navigate', () => {
  const { navigation, navigate } = makeNavigation();
  const tree = render(navigation, 'en');
  const radios = tree.root.findAll(
    (n) =>
      n.props.accessibilityRole === 'radio' &&
      typeof n.props.onPress === 'function' &&
      n.props.accessibilityLabel === undefined,
  );
  act(() => {
    radios[2].props.onPress(); // By Yatra
  });
  assert.match(allText(tree), /Other Famous Temples/);

  const row = tree.root.findAll(
    (n) => n.props.accessibilityLabel === 'Tirupati Balaji' && typeof n.props.onPress === 'function',
  )[0];
  act(() => {
    row.props.onPress();
  });
  const last = navigate.mock.calls.at(-1) as [string, { templeId: string }];
  assert.equal(last[0], 'TheerthDetail');
  assert.equal(last[1].templeId, 'tirupati-balaji');
});
