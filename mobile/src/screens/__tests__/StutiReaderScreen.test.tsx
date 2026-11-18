import assert from 'node:assert/strict';
import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text, View as mockView } from 'react-native';
import { contentByLang, verseLinesByLang } from '@/utils/localize';

// Release mounted readers and their scheduled React work between tests.
const trees: TestRenderer.ReactTestRenderer[] = [];
function createReader(element: React.ReactElement) {
  const tree = TestRenderer.create(element);
  trees.push(tree);
  return tree;
}
afterEach(() => {
  act(() => { for (const tree of trees.splice(0)) tree.unmount(); });
});

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
const { getStuti } = jest.requireActual<typeof import('@/data/stuti')>('@/data/stuti');
const StutiReaderScreen = jest.requireActual<typeof import('../StutiReaderScreen')>(
  '../StutiReaderScreen'
).default;

type ReaderProps = React.ComponentProps<typeof StutiReaderScreen>;

const stuti = getStuti('krishna-stuti');
const firstVerse = stuti.verses[0];

const navigation = {} as ReaderProps['navigation'];
navigation.goBack = () => undefined;
navigation.navigate = (() => undefined) as ReaderProps['navigation']['navigate'];

const route = {
  key: 'StutiReader-test',
  name: 'StutiReader',
  params: { stutiId: 'krishna-stuti', initialIndex: 0 },
} as ReaderProps['route'];

test('renders the first Krishna Stuti verse without throwing', () => {
  let tree: TestRenderer.ReactTestRenderer | undefined;

  act(() => {
    tree = createReader(
      <GitaLanguageProvider initialLang="hi">
        <ShareProvider>
          <StutiReaderScreen navigation={navigation} route={route} />
        </ShareProvider>
      </GitaLanguageProvider>
    );
  });

  const renderedText = tree!
    .root.findAllByType(Text)
    .map((node) => node.props.children)
    .flat(Number.POSITIVE_INFINITY)
    .join(' ');

  assert.ok(renderedText.includes(stuti.titleHi));
  assert.ok(renderedText.includes(firstVerse.lines[0]));
});

test.each(['hi', 'en', 'gu', 'kn'] as const)('opens the Parshuram reader with the real language/share providers in %s', lang => {
  const parshuram = getStuti('parshuram-stotram');
  let tree: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = createReader(<GitaLanguageProvider initialLang={lang}><ShareProvider>
      <StutiReaderScreen navigation={navigation} route={{ ...route, params: { stutiId: 'parshuram-stotram', initialIndex: 0 } }} />
    </ShareProvider></GitaLanguageProvider>);
  });
  const text = tree!.root.findAllByType(Text).map(node => node.props.children).flat(Infinity).join(' ');
  const { contentByLang } = jest.requireActual<typeof import('@/utils/localize')>('@/utils/localize');
  expect(text).toContain(contentByLang(lang, parshuram.titleHi, parshuram.titleEn));
  expect(text).toContain(contentByLang(lang, parshuram.verses[0].meaningHi, parshuram.verses[0].meaningEn));
});
describe.each(['kabir-bhakti-dohe', 'rahim-bhakti-dohe'])('%s in the shared reader', stutiId => {
  test.each(['hi', 'en', 'gu', 'kn'] as const)('renders the correct poet and couplet in %s', lang => {
    const payload = getStuti(stutiId);
    let tree: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = createReader(
        <GitaLanguageProvider initialLang={lang}>
          <ShareProvider>
            <StutiReaderScreen navigation={navigation} route={{ ...route, params: { stutiId, initialIndex: 0 } }} />
          </ShareProvider>
        </GitaLanguageProvider>
      );
    });
    const text = tree!.root.findAllByType(Text).map(node => node.props.children).flat(Infinity).join(' ');
    assert.ok(text.includes(contentByLang(lang, payload.titleHi, payload.titleEn)));
    for (const line of verseLinesByLang(lang, payload.verses[0].lines, payload.verses[0].linesEn)) {
      assert.ok(text.includes(line), `missing complete ${stutiId} line in ${lang}`);
    }
  });
});


// New complete text: first and final units must survive language selection.
describe.each(['kanakadhara-stotram', 'hanuman-bahuk', 'durga-argala-stotram', 'durga-kilak-stotram', 'durga-saptashati-chapter-1', 'durga-saptashati-chapter-2', 'durga-saptashati-chapter-3', 'durga-saptashati-chapter-4', 'durga-saptashati-chapter-5', 'durga-saptashati-chapter-6', 'durga-saptashati-chapter-7', 'durga-saptashati-chapter-8', 'durga-saptashati-chapter-9', 'durga-saptashati-chapter-10', 'durga-saptashati-chapter-11', 'durga-saptashati-chapter-12', 'durga-saptashati-chapter-13'])('%s', stutiId => {
describe.each([0, -1])('new content unit %s', index => {
  test.each(['hi', 'en', 'gu', 'kn'] as const)('renders complete content in %s', lang => {
    const payload = getStuti(stutiId);
    const position = index < 0 ? payload.verses.length - 1 : index;
    let tree: TestRenderer.ReactTestRenderer;
    act(() => { tree = createReader(<GitaLanguageProvider initialLang={lang}><ShareProvider>
      <StutiReaderScreen navigation={navigation} route={{ ...route, params: { stutiId, initialIndex: position } }} />
    </ShareProvider></GitaLanguageProvider>); });
    const text = tree!.root.findAllByType(Text).map(node => node.props.children).flat(Infinity).join(' ');
    const { contentByLang, verseLinesByLang } = jest.requireActual<typeof import('@/utils/localize')>('@/utils/localize');
    expect(text).toContain(contentByLang(lang, payload.titleHi, payload.titleEn));
    expect(text).toContain(contentByLang(lang, payload.verses[position].meaningHi, payload.verses[position].meaningEn));
    for (const line of verseLinesByLang(lang, payload.verses[position].lines, payload.verses[position].linesEn)) expect(text).toContain(line);
  });
});

});
