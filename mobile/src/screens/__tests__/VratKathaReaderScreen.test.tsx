import assert from 'node:assert/strict';
import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text, View as mockView } from 'react-native';

jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: { Light: 'Light' },
  impactAsync: jest.fn(() => Promise.resolve()),
}));

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

const { GitaLanguageProvider } = jest.requireActual<typeof import('@/data/gita/language')>(
  '@/data/gita/language'
);
const { getKathaContent } = jest.requireActual<typeof import('@/panchang/kathaContent')>(
  '@/panchang/kathaContent'
);
const VratKathaReaderScreen = jest.requireActual<typeof import('../VratKathaReaderScreen')>(
  '../VratKathaReaderScreen'
).default;

type Props = React.ComponentProps<typeof VratKathaReaderScreen>;

const navigation = {} as Props['navigation'];
navigation.goBack = () => undefined;
navigation.navigate = (() => undefined) as Props['navigation']['navigate'];

function renderKatha(kathaId: string, lang: 'hi' | 'en') {
  const route = { key: 't', name: 'VratKathaReader', params: { kathaId } } as Props['route'];
  let tree: TestRenderer.ReactTestRenderer | undefined;
  act(() => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang={lang}>
        <VratKathaReaderScreen navigation={navigation} route={route} />
      </GitaLanguageProvider>
    );
  });
  return tree!
    .root.findAllByType(Text)
    .map((n) => n.props.children)
    .flat(Number.POSITIVE_INFINITY)
    .join(' ');
}

test('renders a vrat katha story (Hindi) from its kathaId', () => {
  const katha = getKathaContent('nirjala-ekadashi-katha');
  assert.ok(katha, 'fixture katha must exist');
  const text = renderKatha('nirjala-ekadashi-katha', 'hi');
  assert.match(text, /निर्जला एकादशी/, 'shows the katha title');
  assert.ok(text.includes(katha!.sections[0].bodyHi[0]), 'renders the first story paragraph');
});

test('renders English narrative when language is English', () => {
  const katha = getKathaContent('satyanarayana-vrat-katha');
  assert.ok(katha, 'fixture katha must exist');
  const text = renderKatha('satyanarayana-vrat-katha', 'en');
  assert.ok(text.includes(katha!.sections[0].bodyEn[0]), 'renders the first English paragraph');
});

test('shows a graceful message for an unknown kathaId', () => {
  const text = renderKatha('does-not-exist-katha', 'en');
  assert.match(text, /not available/i);
});
