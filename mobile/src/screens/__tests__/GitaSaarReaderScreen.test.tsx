import assert from 'node:assert/strict';
import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import StoryIcon from '@/components/StoryIcon';
import ProseParagraph from '@/components/ProseParagraph';
import GitaSaarThemeIcon, {
  gitaSaarThemeIcons,
} from '@/components/GitaSaarThemeIcon';
import ReadingBanner from '@/components/ReadingBanner';
import CachedArtwork from '@/components/CachedArtwork';
import { FlatList, Text, View as mockView } from 'react-native';

jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium' },
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

const { getGitaSaarChapter, gitaSaarChaptersManifest } =
  jest.requireActual<typeof import('@/data/gita-saar')>('@/data/gita-saar');
const { GitaLanguageProvider } = jest.requireActual<
  typeof import('@/data/gita/language')
>('@/data/gita/language');
const { ShareProvider } =
  jest.requireActual<typeof import('@/utils/shareVerse')>('@/utils/shareVerse');
const GitaSaarReaderScreen = jest.requireActual<
  typeof import('../GitaSaarReaderScreen')
>('../GitaSaarReaderScreen').default;

type ReaderProps = React.ComponentProps<typeof GitaSaarReaderScreen>;

const chapter = getGitaSaarChapter(1);
const firstVerse = chapter.verses[0];
const readerTrees: TestRenderer.ReactTestRenderer[] = [];
afterEach(async () => {
  await act(async () => {
    await Promise.resolve();
  });
  act(() => {
    for (const tree of readerTrees.splice(0)) tree.unmount();
  });
});

function render(initialIndex = 0, lang: 'hi' | 'en' = 'hi') {
  const navigate = jest.fn();
  const navigation = {} as ReaderProps['navigation'];
  navigation.goBack = () => undefined;
  navigation.navigate =
    navigate as unknown as ReaderProps['navigation']['navigate'];
  navigation.replace = (() =>
    undefined) as ReaderProps['navigation']['replace'];
  const route = {
    key: 'GitaSaarReader-test',
    name: 'GitaSaarReader',
    params: { chapter: 1, initialIndex },
  } as ReaderProps['route'];

  let tree: TestRenderer.ReactTestRenderer | undefined;
  act(() => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang={lang}>
        <ShareProvider>
          <GitaSaarReaderScreen navigation={navigation} route={route} />
        </ShareProvider>
      </GitaLanguageProvider>
    );
  });
  const renderedText = tree!.root
    .findAllByType(Text)
    .map((node) => node.props.children)
    .flat(Number.POSITIVE_INFINITY)
    .join(' ');
  readerTrees.push(tree!);
  return { tree: tree!, navigate, renderedText };
}

test('leads with the complete Saar and keeps original scripture optional', () => {
  const { renderedText } = render();
  assert.ok(!renderedText.includes(firstVerse.sanskrit[0]));
  assert.ok(renderedText.includes(firstVerse.meaningHi));
  assert.ok(renderedText.includes(firstVerse.groupTitleHi));
  assert.ok(
    renderedText.includes(
      `श्लोक · ${firstVerse.gitaChapter}.${firstVerse.gitaVerse}`
    )
  );
});

test('source disclosure shows the exact corpus shloka and meaning inline', () => {
  const { tree } = render();
  const source = tree.root.findAll(
    (n) =>
      n.props.testID === 'gita-saar-source-toggle' &&
      typeof n.props.onPress === 'function'
  )[0];
  act(() => source.props.onPress());
  const text = tree.root
    .findAllByType(Text)
    .flatMap((n) => n.props.children)
    .flat(Infinity)
    .join(' ');
  assert.ok(text.includes(firstVerse.sanskrit[0]));
  assert.ok(text.includes(firstVerse.meaningHi));
  assert.ok(
    tree.root.findAll((n) => n.props.testID === 'gita-saar-original').length > 0
  );
  act(() => tree.unmount());
});

test('the reader has no required content tabs and exposes direct previous/next controls', () => {
  const { tree } = render();
  assert.equal(
    tree.root.findAll((n) => n.props.accessibilityRole === 'tab').length,
    0
  );
  assert.ok(
    tree.root.findAll(
      (n) =>
        n.props.accessibilityLabel === 'Next Gita Saar teaching' &&
        typeof n.props.onPress === 'function'
    ).length
  );
  const previous = tree.root.findAll(
    (n) =>
      n.props.accessibilityLabel === 'Previous Gita Saar teaching' &&
      typeof n.props.onPress === 'function'
  )[0];
  assert.equal(previous.props.disabled, true);
  act(() => tree.unmount());
});

test('reader pages receive the measured viewport so long vertical content stays bounded', () => {
  const { tree } = render();
  const viewport = tree.root.findAll(
    (n) =>
      n.props.testID === 'gita-saar-pager' &&
      typeof n.props.onLayout === 'function'
  )[0];
  assert.ok(viewport, 'the pager must measure its available height');
  act(() =>
    viewport.props.onLayout({ nativeEvent: { layout: { height: 460 } } })
  );
  const pages = tree.root.findAll(
    (node) => node.props.sourceId === 'gita-saar' && node.props.verse
  );
  assert.ok(pages.length > 0);
  assert.ok(pages.every((page) => page.props.height === 460));
  act(() => tree.unmount());
});

test('English mode shows the saar in English and the pill in English (no Devanagari leak)', () => {
  const { renderedText } = render(0, 'en');
  assert.ok(renderedText.includes(firstVerse.meaningEn));
  assert.ok(
    renderedText.includes(
      `Shloka · ${firstVerse.gitaChapter}.${firstVerse.gitaVerse}`
    )
  );
  assert.ok(!renderedText.includes('श्लोक ·'));
});

test('the page hands off into the Gita reader on its own shloka', () => {
  const { tree, navigate } = render();
  const handoff = tree.root.findAll(
    (n) =>
      n.props.testID === 'gita-saar-open-in-gita' &&
      typeof n.props.onPress === 'function'
  )[0];
  assert.ok(handoff, 'hand-off pill must render');
  act(() => {
    handoff.props.onPress();
  });
  assert.equal(navigate.mock.calls.length, 1);
  // JSON round-trip: jest's mock-call arrays come from another realm, which
  // node:assert's strict prototype check rejects.
  assert.equal(
    JSON.stringify(navigate.mock.calls[0]),
    JSON.stringify([
      'GitaReader',
      {
        chapter: firstVerse.gitaChapter,
        initialIndex: firstVerse.gitaVerse - 1,
      },
    ])
  );
});

test('the list holds exactly the theme pages (no transition cards while one theme ships)', () => {
  const { tree } = render();
  const list = tree.root.findByType(FlatList);
  const data = list.props.data as { __type?: string }[];
  const transitions = data.filter((d) => d.__type);
  const expectedTransitions =
    gitaSaarChaptersManifest.length > 1 ? 1 : 0; /* next card on chapter 1 */
  assert.equal(transitions.length, expectedTransitions);
  assert.equal(data.length - transitions.length, chapter.verseCount);
});

test('the last page carries the closing line', () => {
  const { renderedText } = render(chapter.verseCount - 1);
  assert.ok(renderedText.includes(chapter.closingHi));
});

test('optional writing saves through one action and a failed save retains the draft', async () => {
  const Page = jest.requireActual<
    typeof import('@/components/GitaSaarVersePage')
  >('@/components/GitaSaarVersePage').default;
  const save = jest.fn(async (_text: string) => {
    throw new Error('storage full');
  });
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang="en">
        <Page
          verse={firstVerse}
          sourceId="gita-saar"
          width={393}
          onSaveLearning={save}
        />
      </GitaLanguageProvider>
    );
  });
  const toggle = tree.root.findAll(
    (n) =>
      n.props.accessibilityLabel === 'Write a Gita Saar reflection' &&
      typeof n.props.onPress === 'function'
  )[0];
  act(() => toggle.props.onPress());
  const input = tree.root.findAll(
    (n) =>
      n.props.testID === 'gita-saar-reflection' &&
      typeof n.props.onChangeText === 'function'
  )[0];
  act(() => input.props.onChangeText('A thought I want to keep'));
  const button = tree.root.findAll(
    (n) =>
      n.props.testID === 'gita-saar-save-learning' &&
      typeof n.props.onPress === 'function'
  )[0];
  await act(async () => {
    button.props.onPress();
  });
  expect(save).toHaveBeenCalledTimes(1);
  expect(save).toHaveBeenCalledWith('A thought I want to keep');
  expect(
    tree.root.findAll(
      (n) =>
        n.props.testID === 'gita-saar-reflection' &&
        typeof n.props.onChangeText === 'function'
    )[0].props.value
  ).toBe('A thought I want to keep');
  const text = tree.root
    .findAllByType(Text)
    .flatMap((n) => n.props.children)
    .flat(Infinity)
    .join(' ');
  expect(text).toContain(
    'Could not save. Your writing is still here; try again.'
  );
  act(() => tree.unmount());
});

const GitaSaarThemesScreen = jest.requireActual<
  typeof import('../GitaSaarThemesScreen')
>('../GitaSaarThemesScreen').default;

test.each(['hi', 'en', 'gu', 'kn'] as const)(
  '%s listing keeps complete titles and uses an icon for every theme',
  (lang) => {
    let tree!: TestRenderer.ReactTestRenderer;
    const navigate = jest.fn();
    act(() => {
      tree = TestRenderer.create(
        <GitaLanguageProvider initialLang={lang}>
          <ShareProvider>
            <GitaSaarThemesScreen
              navigation={{ goBack: jest.fn(), navigate } as never}
              route={{ key: 'themes', name: 'GitaSaarChapters' }}
            />
          </ShareProvider>
        </GitaLanguageProvider>
      );
    });
    const icons = tree.root.findAllByType(GitaSaarThemeIcon);
    assert.deepEqual(
      icons.map((node) => node.props.themeId),
      gitaSaarChaptersManifest.map((theme) => theme.id)
    );
    assert.ok(
      gitaSaarChaptersManifest.every((theme) => gitaSaarThemeIcons[theme.id])
    );
    assert.ok(
      icons.every(
        (node) =>
          node.findByType(StoryIcon).props.name ===
          gitaSaarThemeIcons[node.props.themeId]
      )
    );
    const paragraphs = tree.root.findAllByType(ProseParagraph);
    assert.ok(paragraphs.length > gitaSaarChaptersManifest.length);
    assert.ok(
      paragraphs.every((node) => node.props.numberOfLines === undefined)
    );
    const featured = tree.root.findAll(
      (n) =>
        n.props.testID === 'gita-saar-featured' &&
        typeof n.props.onPress === 'function'
    )[0];
    act(() => featured.props.onPress());
    expect(navigate).toHaveBeenCalledWith('GitaSaarReader', {
      chapter: 5,
      initialIndex: 0,
    });
    const banner = tree.root.findByType(ReadingBanner);
    assert.equal(banner.findByType(CachedArtwork).props.resizeMode, 'contain');
    const buttons = tree.root.findAll(
      (node) =>
        typeof node.props.onPress === 'function' &&
        node.props.accessibilityRole === 'button' &&
        String(node.props.accessibilityLabel).endsWith('Tap to open.')
    );
    act(() => buttons[buttons.length - 1].props.onPress());
    expect(navigate).toHaveBeenCalledWith('GitaSaarReader', {
      chapter: 16,
      initialIndex: 0,
    });
    act(() => tree.unmount());
  }
);
