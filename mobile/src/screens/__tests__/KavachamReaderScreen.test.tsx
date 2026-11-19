import assert from 'node:assert/strict';
import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text, View as mockView } from 'react-native';

const trees: TestRenderer.ReactTestRenderer[] = [];
function createReader(element: React.ReactElement) {
  const tree = TestRenderer.create(element); trees.push(tree); return tree;
}
afterEach(() => { act(() => { for (const tree of trees.splice(0)) tree.unmount(); }); });

jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: { Light: 'Light' },
  impactAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native-view-shot', () => ({
  captureRef: jest.fn(() => Promise.resolve(null)),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(false)),
  shareAsync: jest.fn(() => Promise.resolve()),
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

jest.mock('@/contexts/AudioPlayerContext', () => ({
  useAudioPlayerContext: () => ({ playTrack: jest.fn(), openNowPlaying: jest.fn() }),
}));

const { GitaLanguageProvider } = jest.requireActual<typeof import('@/data/gita/language')>(
  '@/data/gita/language'
);
const { ShareProvider } = jest.requireActual<typeof import('@/utils/shareVerse')>(
  '@/utils/shareVerse'
);
const { getKavacham } = jest.requireActual<typeof import('@/data/kavacham')>('@/data/kavacham');
const KavachamReaderScreen = jest.requireActual<typeof import('../KavachamReaderScreen')>(
  '../KavachamReaderScreen'
).default;

type ReaderProps = React.ComponentProps<typeof KavachamReaderScreen>;

const kavacham = getKavacham('rama-raksha-stotra');
const firstVerse = kavacham.verses[0];

const navigation = {} as ReaderProps['navigation'];
navigation.goBack = () => undefined;
navigation.navigate = (() => undefined) as ReaderProps['navigation']['navigate'];

const route = {
  key: 'KavachamReader-test',
  name: 'KavachamReader',
  params: { kavachamId: 'rama-raksha-stotra', initialIndex: 0 },
} as ReaderProps['route'];

test('renders the first Rama Raksha Stotra verse without throwing', () => {
  let tree: TestRenderer.ReactTestRenderer | undefined;

  act(() => {
    tree = createReader(
      <GitaLanguageProvider initialLang="hi">
        <ShareProvider>
          <KavachamReaderScreen navigation={navigation} route={route} />
        </ShareProvider>
      </GitaLanguageProvider>
    );
  });

  const renderedText = tree!
    .root.findAllByType(Text)
    .map((node) => node.props.children)
    .flat(Number.POSITIVE_INFINITY)
    .join(' ');

  assert.ok(renderedText.includes(kavacham.titleHi));
  assert.ok(renderedText.includes(firstVerse.lines[0]));
});

// New complete text: first and final units must survive language selection.
describe.each([0, -1])('new content unit %s', index => {
  test.each(['hi', 'en', 'gu', 'kn'] as const)('renders complete content in %s', lang => {
    const payload = getKavacham('durga-devi-kavacham');
    const position = index < 0 ? payload.verses.length - 1 : index;
    let tree: TestRenderer.ReactTestRenderer;
    act(() => { tree = createReader(<GitaLanguageProvider initialLang={lang}><ShareProvider>
      <KavachamReaderScreen navigation={navigation} route={{ ...route, params: { kavachamId: 'durga-devi-kavacham', initialIndex: position } }} />
    </ShareProvider></GitaLanguageProvider>); });
    const text = tree!.root.findAllByType(Text).map(node => node.props.children).flat(Infinity).join(' ');
    const { contentByLang, verseLinesByLang } = jest.requireActual<typeof import('@/utils/localize')>('@/utils/localize');
    expect(text).toContain(contentByLang(lang, payload.titleHi, payload.titleEn));
    expect(text).toContain(contentByLang(lang, payload.verses[position].meaningHi, payload.verses[position].meaningEn));
    for (const line of verseLinesByLang(lang, payload.verses[position].lines, payload.verses[position].linesEn)) expect(text).toContain(line);
  });
});
