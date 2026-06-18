import assert from 'node:assert/strict';
import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text, View as mockView } from 'react-native';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-linear-gradient', () => {
  return {
    LinearGradient: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) =>
      mockReact.createElement(mockView, props, children),
  };
});

jest.mock('react-native-safe-area-context', () => {
  const actual = mockReact;
  return {
    SafeAreaView: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
      actual.createElement(mockView, props, children),
    SafeAreaProvider: ({ children }: React.PropsWithChildren) => children,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

// react-test-renderer does not mount Modal contents into the tree; treat Modal
// as a transparent wrapper so we can assert on its children.
jest.mock('react-native/Libraries/Modal/Modal', () => {
  const actual = mockReact;
  const RealView = mockView;
  return {
    __esModule: true,
    default: ({
      visible,
      children,
    }: {
      visible?: boolean;
      children?: React.ReactNode;
    }) => (visible === false ? null : actual.createElement(RealView, null, children)),
  };
});

const { ThemeProvider } = jest.requireActual<typeof import('@/theme/ThemeContext')>(
  '@/theme/ThemeContext'
);
const { GitaLanguageProvider } = jest.requireActual<typeof import('@/data/gita/language')>(
  '@/data/gita/language'
);
const { FeatureTourProvider } = jest.requireActual<
  typeof import('@/contexts/FeatureTourContext')
>('@/contexts/FeatureTourContext');
const FeatureTourModal = jest.requireActual<typeof import('../../components/FeatureTourModal')>(
  '../../components/FeatureTourModal'
).default;

async function renderTour(lang: 'hi' | 'en') {
  let tree: TestRenderer.ReactTestRenderer | undefined;
  await act(async () => {
    tree = TestRenderer.create(
      <ThemeProvider>
        <GitaLanguageProvider initialLang={lang}>
          <FeatureTourProvider>
            <FeatureTourModal />
          </FeatureTourProvider>
        </GitaLanguageProvider>
      </ThemeProvider>
    );
  });
  // Let the AsyncStorage effects inside FeatureTourProvider resolve so the
  // modal flips to visible before assertions run.
  await act(async () => {
    await Promise.resolve();
  });
  return tree!;
}

function collectText(tree: TestRenderer.ReactTestRenderer): string {
  return tree.root
    .findAllByType(Text)
    .map((node) => node.props.children)
    .flat(Number.POSITIVE_INFINITY)
    .filter((x) => typeof x === 'string')
    .join(' ');
}

test('renders Hindi welcome slide content', async () => {
  const tree = await renderTour('hi');
  const text = collectText(tree);
  assert.match(text, /वेदांश में आपका स्वागत है/);
  assert.match(text, /Welcome to Vedansh/);
  assert.match(text, /छोड़ें/);
  assert.match(text, /आगे/);
});

test('renders English body when language is English', async () => {
  const tree = await renderTour('en');
  const text = collectText(tree);
  assert.match(text, /Gita, chalisas, stotrams/);
  assert.match(text, /Panchang/);
  assert.match(text, /Skip/);
  assert.match(text, /Next/);
});
