import assert from 'node:assert/strict';
import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { ImageBackground, Text } from 'react-native';
import { backgroundImages } from '@assets/backgrounds';
import { getDeityBackground, getTheerthBackground } from '@/data/backgrounds';

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
  assert.doesNotMatch(text, /RULEBOOK §11\.3/, 'placeholder should not render');
});

test('renders sourced statewise temple detail content in English', () => {
  const text = render('srinathji', 'en');
  assert.match(text, /Srinathji/);
  assert.match(text, /Nathdwara/);
  assert.match(text, /Govardhan|Pushtimarg/);
  assert.match(text, /Sources/);
  assert.doesNotMatch(text, /RULEBOOK §11\.3/);
});

test('renders Salasar Balaji extended sections after the origin story (Hindi)', () => {
  const text = render('salasar-balaji', 'hi');
  assert.match(text, /सालासर बालाजी/, 'temple name');
  assert.match(text, /हनुमान/, 'deity badge');
  assert.match(text, /मंदिर स्थापना कथा/, 'sthapana section label');
  assert.match(text, /मोहनदास/, 'sthapana katha body');
  assert.match(text, /सवामणी/, 'traditions section');
  assert.match(text, /मेले और उत्सव/, 'melas section label');
  assert.match(text, /अंजनी माता/, 'journey section body');
  assert.ok(text.indexOf('उद्भव कथा') < text.indexOf('मंदिर स्थापना कथा'), 'sections follow the origin story');
  assert.ok(text.indexOf('अंजनी माता') < text.indexOf('स्रोत'), 'sources footer stays last');
});

test('renders Salasar Balaji extended sections in English', () => {
  const text = render('salasar-balaji', 'en');
  assert.match(text, /Sthapana Katha/);
  assert.match(text, /1754 CE/);
  assert.match(text, /Savamani/);
  assert.match(text, /Chaitra Purnima/);
  assert.match(text, /Anjani Mata/);
  assert.match(text, /Sources/);
});

test('temples without extended sections render only the two core sections', () => {
  const text = render('somnath', 'en');
  assert.doesNotMatch(text, /Sthapana Katha/);
  assert.equal((text.match(/Significance/g) ?? []).length, 1);
  assert.equal((text.match(/Origin Story/g) ?? []).length, 1);
});

test('shows a not-found message for an unknown temple id', () => {
  const text = render('does-not-exist', 'en');
  assert.match(text, /not found/i);
});

test('renders Khatu Shyam as a Krishna lokdevta with sourced prose', () => {
  const text = render('khatu-shyam', 'en');
  assert.match(text, /Khatu Shyam/, 'temple name');
  assert.match(text, /KRISHNA/, 'deity badge maps the lokdevta to Krishna');
  assert.match(text, /Barbarika|Krishna|Shyam/, 'Khatu Shyam origin story');
  assert.match(text, /Sources/, 'sourced prose footer');
  assert.doesNotMatch(text, /RULEBOOK/, 'placeholder should not render');
});

test('Khatu Shyam uses its dedicated Theerth background plate', () => {
  const route = { key: 'd', name: 'TheerthDetail', params: { templeId: 'khatu-shyam' } } as Props['route'];
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang="en">
        <TheerthDetailScreen navigation={navigation} route={route} />
      </GitaLanguageProvider>,
    );
  });
  const layers = tree.root.findAllByType(ImageBackground);
  assert.equal(layers.length, 1, 'detail screen renders one background layer');
  assert.equal(
    layers[0].props.source,
    getTheerthBackground('khatu-shyam', 'krishna'),
    'Khatu Shyam routes through the Theerth background override',
  );
  assert.equal(
    getTheerthBackground('khatu-shyam', 'krishna'),
    backgroundImages.theerth_khatu_shyam,
    'Khatu Shyam resolves to its dedicated Theerth background',
  );
});

test('renders the temple deity background (Somnath → Shiva)', () => {
  const route = { key: 'd', name: 'TheerthDetail', params: { templeId: 'somnath' } } as Props['route'];
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang="en">
        <TheerthDetailScreen navigation={navigation} route={route} />
      </GitaLanguageProvider>,
    );
  });
  const layers = tree.root.findAllByType(ImageBackground);
  assert.equal(layers.length, 1, 'detail screen renders one deity background layer');
  assert.equal(
    layers[0].props.source,
    getDeityBackground('shiva'),
    'Somnath (Shiva temple) uses the Shiva deity background',
  );
});
