import assert from 'node:assert/strict';
import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text, View as mockView } from 'react-native';

import { GitaLanguageProvider } from '@/data/gita/language';
import type { PalmProfile } from '@/panchang/hastRekha';

const mockNavigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
};

const mockSaveProfile = jest.fn((_next: PalmProfile) => Promise.resolve());
const mockClearProfile = jest.fn(() => Promise.resolve());

let mockHookState: {
  profile: PalmProfile | null;
  reading: null;
  hydrated: boolean;
  loadState: 'loading' | 'guest' | 'saved' | 'error';
} = { profile: null, reading: null, hydrated: true, loadState: 'guest' };

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    mockReact.createElement(mockView, props, children),
}));

jest.mock('@/panchang/useHastRekha', () => ({
  ...jest.requireActual('@/panchang/useHastRekha'),
  useHastRekha: () => ({
    ...mockHookState,
    saveProfile: mockSaveProfile,
    clearProfile: mockClearProfile,
  }),
}));

const HastRekhaScreen = jest.requireActual<typeof import('../HastRekhaScreen')>(
  '../HastRekhaScreen'
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

function tap(tree: TestRenderer.ReactTestRenderer, testID: string): void {
  act(() => {
    tree.root.findByProps({ testID }).props.onPress();
  });
}

function renderScreen(): TestRenderer.ReactTestRenderer {
  return render(
    <HastRekhaScreen
      navigation={mockNavigation as any}
      route={{ key: 'HastRekha-test', name: 'HastRekha' } as any}
    />
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockHookState = { profile: null, reading: null, hydrated: true, loadState: 'guest' };
});

test('guest landing shows the disclaimer, all four line pickers, and no reading yet', () => {
  const tree = renderScreen();
  const text = textOf(tree);

  assert.ok(text.includes('Palm Reading'));
  assert.ok(text.includes('not a certain prediction'));
  assert.ok(text.includes('Observe your palm'));
  assert.ok(text.includes('Heart line'));
  assert.ok(text.includes('Head line'));
  assert.ok(text.includes('Life line'));
  assert.ok(text.includes('Fate line'));
  assert.ok(text.includes('Choose a form for all four lines'));
  assert.ok(!text.includes('Your reading'));
  assert.ok(text.includes('0/4'));

  // Twelve option radios, none selected. Filter to host elements so the
  // composite Pressable and its host view are not double-counted.
  const radios = tree.root.findAll(
    (node) =>
      typeof node.type === 'string' && node.props.accessibilityRole === 'radio'
  );
  assert.equal(radios.length, 12);
  assert.ok(radios.every((radio) => radio.props.accessibilityState.selected === false));
});

test('choosing all four lines reveals the reading, persists it, and suggests the practice', () => {
  const tree = renderScreen();

  tap(tree, 'hastrekha-heart-curved');
  tap(tree, 'hastrekha-head-sloping');
  tap(tree, 'hastrekha-life-faint');
  assert.ok(!textOf(tree).includes('Your reading'));
  assert.equal(mockSaveProfile.mock.calls.length, 0);
  assert.ok(textOf(tree).includes('3/4'));

  tap(tree, 'hastrekha-fate-absent');

  const text = textOf(tree);
  assert.ok(text.includes('Your reading'));
  assert.ok(text.includes('Four lines, four cues'));
  assert.ok(text.includes('Saved on this device'));
  // Life-line guardrail copy is user-visible, not just an engine field.
  assert.ok(text.includes('never length of life'));
  assert.ok(text.includes('Reflect'));
  assert.ok(text.includes('entirely your own'));
  assert.deepEqual(mockSaveProfile.mock.calls[0][0], {
    heart: 'curved',
    head: 'sloping',
    life: 'faint',
    fate: 'absent',
  });

  // The selected options are marked; siblings stay unselected.
  assert.equal(
    tree.root.findByProps({ testID: 'hastrekha-heart-curved' }).props
      .accessibilityState.selected,
    true
  );
  assert.equal(
    tree.root.findByProps({ testID: 'hastrekha-heart-straight' }).props
      .accessibilityState.selected,
    false
  );

  // Practice routes through the shared entry dispatcher to the Home tab.
  act(() => {
    tree.root
      .findByProps({ accessibilityLabel: 'Open Navagraha Stotram practice' })
      .props.onPress();
  });
  assert.equal(mockNavigation.navigate.mock.calls[0][0], 'HomeTab');
});

test('a saved profile hydrates the pickers and shows the reading immediately', () => {
  mockHookState = {
    profile: { heart: 'straight', head: 'long', life: 'broad', fate: 'defined' },
    reading: null,
    hydrated: true,
    loadState: 'saved',
  };
  const tree = renderScreen();

  const text = textOf(tree);
  assert.ok(text.includes('Your reading'));
  assert.ok(text.includes('settled sense of direction'));
  assert.equal(
    tree.root.findByProps({ testID: 'hastrekha-heart-straight' }).props
      .accessibilityState.selected,
    true
  );

  // Start over clears storage and returns to the picker-only state.
  act(() => {
    tree.root.findByProps({ accessibilityLabel: 'Start over' }).props.onPress();
  });
  assert.equal(mockClearProfile.mock.calls.length, 1);
  assert.ok(!textOf(tree).includes('Your reading'));
});

test('a corrupt stored profile surfaces recovery copy without blocking new choices', () => {
  mockHookState = { profile: null, reading: null, hydrated: true, loadState: 'error' };
  const tree = renderScreen();

  const text = textOf(tree);
  assert.ok(text.includes('couldn’t be loaded'));
  assert.ok(text.includes('Nothing was deleted'));
  assert.ok(text.includes('Heart line'));
});

test('English mode leaks no Devanagari into the visible copy', () => {
  const tree = renderScreen();
  tap(tree, 'hastrekha-heart-chained');
  tap(tree, 'hastrekha-head-short');
  tap(tree, 'hastrekha-life-close');
  tap(tree, 'hastrekha-fate-faint');

  // ॐ (the practice card's symbol) is sanctioned symbolic content (RULEBOOK §3);
  // every other Devanagari codepoint in English mode is a language leak.
  assert.doesNotMatch(textOf(tree).replace(/ॐ/g, ''), /[ऀ-ॿ]/);
});
