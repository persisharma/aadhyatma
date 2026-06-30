import assert from 'node:assert/strict';
import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { ImageBackground, Text } from 'react-native';

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

function makeNav() {
  const push = jest.fn();
  const navigate = jest.fn();
  const navigation = { push, navigate, goBack: jest.fn() } as unknown as Props['navigation'];
  return { navigation, push, navigate };
}

function render(navigation: Props['navigation'], params: object | undefined, lang: 'hi' | 'en' = 'hi') {
  const route = { key: 'TheerthMap', name: 'TheerthMap', params } as Props['route'];
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

const allText = (tree: TestRenderer.ReactTestRenderer) =>
  tree.root.findAllByType(Text).map((n) => n.props.children).flat(Number.POSITIVE_INFINITY).join(' ');

const tappable = (tree: TestRenderer.ReactTestRenderer, label: string) =>
  tree.root.findAll((n) => n.props.accessibilityLabel === label && typeof n.props.onPress === 'function');

// view-mode radios carry no accessibilityLabel (language radios do)
const viewRadios = (tree: TestRenderer.ReactTestRenderer) =>
  tree.root.findAll(
    (n) =>
      n.props.accessibilityRole === 'radio' &&
      typeof n.props.onPress === 'function' &&
      n.props.accessibilityLabel === undefined,
  );

// ─── Listing mode (no params) ─────────────────────────────────────────────────

test('listing shows the title and a By State / By Category toggle', () => {
  const { navigation } = makeNav();
  const tree = render(navigation, {}, 'en');
  assert.match(allText(tree), /Theerth/);
  assert.equal(viewRadios(tree).length, 2);
  assert.match(allText(tree), /By State/);
  assert.match(allText(tree), /By Category/);
});

test('listing has no add-to-routine / filter chips', () => {
  const { navigation } = makeNav();
  const tree = render(navigation, {}, 'en');
  const filterish = tree.root.findAll(
    (n) =>
      typeof n.props.accessibilityLabel === 'string' &&
      (n.props.accessibilityLabel.startsWith('filter-') || /add .* to a routine/i.test(n.props.accessibilityLabel)),
  );
  assert.equal(filterish.length, 0);
});

test('listing By-Category card drills into that group', () => {
  const { navigation, push } = makeNav();
  const tree = render(navigation, {}, 'hi'); // default mode = category
  const card = tappable(tree, 'द्वादश ज्योतिर्लिङ्ग')[0];
  act(() => card.props.onPress());
  const call = push.mock.calls.at(-1) as [string, { group: string }];
  assert.equal(call[0], 'TheerthMap');
  assert.equal(call[1].group, 'jyotirlinga');
});

test('listing By-State card drills into that state', () => {
  const { navigation, push } = makeNav();
  const tree = render(navigation, {}, 'en');
  act(() => viewRadios(tree)[0].props.onPress()); // By State (first option)
  const card = tappable(tree, 'Gujarat')[0];
  act(() => card.props.onPress());
  const call = push.mock.calls.at(-1) as [string, { stateEn: string }];
  assert.equal(call[0], 'TheerthMap');
  assert.equal(call[1].stateEn, 'Gujarat');
});

// ─── Drill-in mode (group / state) ────────────────────────────────────────────

test('group drill-in lists only that category and a row navigates to detail', () => {
  const { navigation, navigate } = makeNav();
  const tree = render(navigation, { group: 'jyotirlinga' }, 'hi');
  assert.match(allText(tree), /द्वादश ज्योतिर्लिङ्ग/); // title
  // Char Dham / Chota Char Dham are NOT shown as section headers here (flat list)
  assert.doesNotMatch(allText(tree), /छोटा चार धाम/);
  const row = tappable(tree, 'सोमनाथ')[0];
  act(() => row.props.onPress());
  const call = navigate.mock.calls.at(-1) as [string, { templeId: string }];
  assert.equal(call[0], 'TheerthDetail');
  assert.equal(call[1].templeId, 'somnath');
});

test('state drill-in lists temples of that state', () => {
  const { navigation, navigate } = makeNav();
  const tree = render(navigation, { stateEn: 'Gujarat' }, 'en');
  const text = allText(tree);
  assert.match(text, /Somnath/);
  assert.match(text, /Dwarkadhish/);
  const row = tappable(tree, 'Nageshwar')[0];
  act(() => row.props.onPress());
  const call = navigate.mock.calls.at(-1) as [string, { templeId: string }];
  assert.equal(call[0], 'TheerthDetail');
  assert.equal(call[1].templeId, 'nageshwar');
});

// ─── Backdrop ─────────────────────────────────────────────────────────────────

test('renders no decorative image backdrop (flat parchment only) in either mode', () => {
  const { navigation } = makeNav();
  const listing = render(navigation, {}, 'en');
  assert.equal(listing.root.findAllByType(ImageBackground).length, 0, 'listing has no image backdrop');
  const drill = render(navigation, { stateEn: 'Gujarat' }, 'en');
  assert.equal(drill.root.findAllByType(ImageBackground).length, 0, 'drill-in has no image backdrop');
});
