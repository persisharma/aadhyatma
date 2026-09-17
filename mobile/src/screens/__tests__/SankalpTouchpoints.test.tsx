/**
 * The prebuilt-sankalp catalog must stay reachable outside the create-routine
 * chooser (July 2026 review: with a routine already added, the catalog had no
 * other touchpoint). Pins the three entry points: Today's Practice, My
 * Routines, and the Home साधना row (formerly the DISCOVER spotlight).
 */
import assert from 'node:assert/strict';
import * as fs from 'fs';
import * as path from 'path';
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
jest.mock('@/components/BackgroundLayer', () => {
  const ReactLib = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ children }: React.PropsWithChildren) => ReactLib.createElement(View, null, children),
  };
});
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
}));
jest.mock('@/contexts/RoutineContext', () => ({
  useRoutines: () => ({
    routines: [
      { id: 'r1', nameHi: 'प्रातः साधना', nameEn: 'Daily', mode: 'daily', items: [], createdAt: 0 },
    ],
    markManualDone: jest.fn(),
    unmarkManualDone: jest.fn(),
  }),
}));
jest.mock('@/contexts/UserActivityContext', () => ({
  useUserActivity: () => ({ currentStreak: () => 0 }),
}));
jest.mock('@/data/routine/useRoutineToday', () => ({
  useRoutineToday: () => ({ entries: [], doneCount: 0, total: 0, hasRoutine: true }),
}));
jest.mock('@/data/sadhana/useSadhanaToday', () => ({
  useSadhanaToday: () => [],
}));

const { GitaLanguageProvider } = jest.requireActual<typeof import('@/data/gita/language')>(
  '@/data/gita/language',
);
const RoutineTodayScreen = jest.requireActual<typeof import('../RoutineTodayScreen')>(
  '../RoutineTodayScreen',
).default;
const RoutineListScreen = jest.requireActual<typeof import('../RoutineListScreen')>(
  '../RoutineListScreen',
).default;

function makeNav() {
  const navigate = jest.fn();
  return { navigate, navigation: { navigate, goBack: jest.fn() } };
}

function render(Screen: React.ComponentType<any>, navigation: unknown) {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang="en">
        <Screen navigation={navigation} route={{ key: 'k', name: 'n', params: undefined }} />
      </GitaLanguageProvider>,
    );
  });
  return tree;
}

/** Find the Pressable ancestor of the Text node carrying `label`. */
function pressButton(tree: TestRenderer.ReactTestRenderer, label: string) {
  const textNode = tree.root
    .findAllByType(Text)
    .find((n) => [n.props.children].flat(Number.POSITIVE_INFINITY).join('') === label);
  assert.ok(textNode, `no Text node with label "${label}"`);
  let node: typeof textNode | null = textNode!;
  while (node && typeof node.props.onPress !== 'function') node = node.parent as typeof textNode;
  assert.ok(node, `no pressable ancestor for "${label}"`);
  act(() => node!.props.onPress());
}

describe('sankalp catalog touchpoints', () => {
  it("Today's Practice offers a browse-sankalps button", () => {
    const { navigation, navigate } = makeNav();
    const tree = render(RoutineTodayScreen, navigation);
    pressButton(tree, 'Browse sankalps');
    expect(navigate).toHaveBeenCalledWith('SadhanaPrograms');
  });

  it('My Routines offers a browse-sankalps button below "New routine"', () => {
    const { navigation, navigate } = makeNav();
    const tree = render(RoutineListScreen, navigation);
    pressButton(tree, 'Browse sankalps');
    expect(navigate).toHaveBeenCalledWith('SadhanaPrograms');
  });

  it('the Home साधना row carries a sankalp door', () => {
    // The DISCOVER sankalp card became the middle cell of the साधना row
    // (TRD-42 §5.1). Source-level pin: the row mounts three contexts, so assert
    // the registration rather than the whole tree.
    const row = fs.readFileSync(
      path.resolve(__dirname, '..', '..', 'components', 'SadhanaRow.tsx'),
      'utf8'
    );
    expect(row).toMatch(/'SadhanaPrograms'/);
    expect(row).toMatch(/संकल्प/);
  });
});
