import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text, View as mockView } from 'react-native';

// The shipped (empty) bhajan catalog: the Bhajan tab still shows the shelf's
// door as "coming soon", and the shelf shows a plain coming-soon line — no
// process or verification wording (RULEBOOK §11.16). design.md §34.1.

const mockNavigate = jest.fn();
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    mockReact.createElement(mockView, props, children),
}));
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate }),
  useIsFocused: () => true,
}));
jest.mock('@/contexts/AudioPlayerContext', () => ({
  useAudioPlayerContext: () => ({
    currentTrack: null, isPlaying: false, playTrack: jest.fn(), prefetchTrack: jest.fn(), openNowPlaying: jest.fn(),
  }),
}));

const { GitaLanguageProvider } = jest.requireActual<typeof import('@/data/gita/language')>('@/data/gita/language');
const { ShareProvider } = jest.requireActual<typeof import('@/utils/shareVerse')>('@/utils/shareVerse');
const AudioLibraryScreen = jest.requireActual<typeof import('../audio/AudioLibraryScreen')>('../audio/AudioLibraryScreen').default;
const BhajanListScreen = jest.requireActual<typeof import('../BhajanListScreen')>('../BhajanListScreen').default;
const { bhajanShelfEntries } = jest.requireActual<typeof import('@/data/bhajan/shelf')>('@/data/bhajan/shelf');

type ListProps = React.ComponentProps<typeof BhajanListScreen>;
const trees: TestRenderer.ReactTestRenderer[] = [];
function mount(node: React.ReactElement, lang: 'hi' | 'en' = 'hi') {
  let tree: TestRenderer.ReactTestRenderer | undefined;
  act(() => { tree = TestRenderer.create(<GitaLanguageProvider initialLang={lang}><ShareProvider>{node}</ShareProvider></GitaLanguageProvider>); });
  trees.push(tree!);
  return tree!;
}
afterEach(() => { act(() => { for (const t of trees.splice(0)) t.unmount(); }); mockNavigate.mockClear(); });
const text = (tree: TestRenderer.ReactTestRenderer) =>
  tree.root.findAllByType(Text).map((n) => n.props.children).flat(Number.POSITIVE_INFINITY).join(' ');

// Guard: these assertions describe the empty catalog. When the first bhajan
// ships, the populated path is covered by BhajanShelf.test.tsx instead.
const empty = bhajanShelfEntries().length === 0;
(empty ? describe : describe.skip)('bhajan shelf with no bhajans yet', () => {
  it('still shows the door, labelled coming soon, and it opens the shelf', () => {
    const tree = mount(<AudioLibraryScreen />, 'en');
    const door = tree.root.findByProps({ testID: 'bhajan-shelf-door' });
    expect(text(tree)).toContain('Coming soon');
    expect(door.props.accessibilityLabel).toBe('Bhajan Lyrics. Coming soon. Tap to open.');
    act(() => door.props.onPress());
    expect(mockNavigate).toHaveBeenCalledWith('BhajanList');
  });

  it('the shelf shows a plain coming-soon line with no process wording', () => {
    const navigation = { navigate: mockNavigate, goBack: jest.fn() } as unknown as ListProps['navigation'];
    const route = { key: 'BhajanList-empty', name: 'BhajanList', params: undefined } as ListProps['route'];
    for (const [lang, line] of [['hi', 'भजन जल्द आ रहे हैं।'], ['en', 'Bhajans are coming soon.']] as const) {
      const tree = mount(<BhajanListScreen navigation={navigation} route={route} />, lang);
      const node = tree.root.findByProps({ testID: 'bhajan-list-empty' });
      expect(text(tree)).toContain(line);
      expect(JSON.stringify(node.props.children)).not.toMatch(/verif|जाँच|source/i);
    }
  });
});
