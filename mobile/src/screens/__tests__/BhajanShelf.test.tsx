import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text, View as mockView } from 'react-native';

// Bhajan text shelf (design.md §34.1): Bhajan-tab door → deity-grouped list →
// reader, plus the stale-id exit. The catalog ships empty until texts are
// verified, so these suites run on SYNTHETIC fixtures — placeholder lines, not
// lyrics — injected through the registry modules.

const trees: TestRenderer.ReactTestRenderer[] = [];
function mount(element: React.ReactElement) {
  let tree: TestRenderer.ReactTestRenderer | undefined;
  act(() => {
    tree = TestRenderer.create(element);
  });
  trees.push(tree!);
  return tree!;
}
afterEach(() => {
  act(() => {
    for (const tree of trees.splice(0)) tree.unmount();
  });
  mockNavigate.mockClear();
});

const mockNavigate = jest.fn();

jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium' },
  impactAsync: jest.fn(() => Promise.resolve()),
}));
jest.mock('react-native-view-shot', () => ({ captureRef: jest.fn(() => Promise.resolve(null)) }));
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(false)),
  shareAsync: jest.fn(() => Promise.resolve()),
}));
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    mockReact.createElement(mockView, props, children),
}));
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate }),
}));
jest.mock('@/contexts/AudioPlayerContext', () => ({
  useAudioPlayerContext: () => ({
    currentTrack: null,
    isPlaying: false,
    playTrack: jest.fn(),
    prefetchTrack: jest.fn(),
    openNowPlaying: jest.fn(),
  }),
}));

jest.mock('@/data/bhajan/ids', () => {
  const actual = jest.requireActual('@/data/bhajan/ids');
  const bhajanCatalog = [
    { id: 'test-shiva-bhajan', group: 'shiva' },
    { id: 'test-krishna-bhajan', group: 'krishna' },
    { id: 'test-rajasthani-bhajan', group: 'rajasthani' },
  ];
  return {
    ...actual,
    bhajanCatalog,
    bhajanIds: new Set(bhajanCatalog.map((row) => row.id)),
    bhajanGroupOf: (id: string) => bhajanCatalog.find((row) => row.id === id)?.group,
  };
});

jest.mock('@/data/bhajan', () => {
  const actual = jest.requireActual('@/data/bhajan');
  const verse = (n: number) => ({
    id: `t-${n}`,
    type: n === 1 ? 'refrain' : 'stanza',
    section: 'body',
    number: n,
    labelHi: `पद · ${n}`,
    labelEn: `Stanza · ${n}`,
    lines: [`परीक्षण पंक्ति ${n}`],
    linesEn: [`Test line ${n}`],
    meaningHi: `परीक्षण अर्थ ${n}`,
    meaningEn: `Test meaning ${n}`,
  });
  const payload = (id: string, group: string) => ({
    id,
    titleHi: `परीक्षण भजन ${id}`,
    titleEn: `Test Bhajan ${id}`,
    subtitleHi: '',
    subtitleEn: '',
    group,
    attributionHi: 'परीक्षण कवि',
    attributionEn: 'Test Poet',
    language: 'hi',
    source: { baseText: 'fixture', referenceUrls: ['a', 'b'], retrievedOn: '2026-11-15' },
    counts: { totalVerses: 2 },
    verses: [verse(1), verse(2)],
  });
  const payloads: Record<string, unknown> = {
    'test-shiva-bhajan': payload('test-shiva-bhajan', 'shiva'),
    'test-krishna-bhajan': payload('test-krishna-bhajan', 'krishna'),
    'test-rajasthani-bhajan': payload('test-rajasthani-bhajan', 'rajasthani'),
  };
  return { ...actual, getBhajan: (id: string) => payloads[id] ?? null };
});

jest.mock('@/data/texts', () => {
  const actual = jest.requireActual('@/data/texts');
  const entry = (id: string, deities: string[]) => ({
    id,
    nameHi: `परीक्षण भजन ${id}`,
    nameEn: `Test Bhajan ${id}`,
    sub: '2 पद · अर्थ सहित',
    subEn: '2 verses · with meaning',
    thumb: 'भ',
    status: 'active',
    category: 'bhajan',
    deities,
    verseCount: 2,
  });
  return {
    ...actual,
    library: [
      ...actual.library,
      entry('test-shiva-bhajan', ['shiva']),
      entry('test-krishna-bhajan', ['krishna']),
      entry('test-rajasthani-bhajan', ['krishna']),
    ],
  };
});

const { GitaLanguageProvider } = jest.requireActual<typeof import('@/data/gita/language')>('@/data/gita/language');
const { ShareProvider } = jest.requireActual<typeof import('@/utils/shareVerse')>('@/utils/shareVerse');
const BhajanListScreen = jest.requireActual<typeof import('../BhajanListScreen')>('../BhajanListScreen').default;
const BhajanReaderScreen = jest.requireActual<typeof import('../BhajanReaderScreen')>('../BhajanReaderScreen').default;
const AudioLibraryScreen = jest.requireActual<typeof import('../audio/AudioLibraryScreen')>('../audio/AudioLibraryScreen').default;
const entryRoutes = jest.requireActual<typeof import('@/navigation/entryRoutes')>('@/navigation/entryRoutes');

type ListProps = React.ComponentProps<typeof BhajanListScreen>;
type ReaderProps = React.ComponentProps<typeof BhajanReaderScreen>;

function wrap(node: React.ReactElement, lang: 'hi' | 'en' | 'gu' | 'kn' = 'hi') {
  return (
    <GitaLanguageProvider initialLang={lang}>
      <ShareProvider>{node}</ShareProvider>
    </GitaLanguageProvider>
  );
}

function allText(tree: TestRenderer.ReactTestRenderer): string {
  return tree.root
    .findAllByType(Text)
    .map((node) => node.props.children)
    .flat(Number.POSITIVE_INFINITY)
    .join(' ');
}

function listNav() {
  const navigation = { navigate: mockNavigate, goBack: jest.fn() } as unknown as ListProps['navigation'];
  const route = { key: 'BhajanList-test', name: 'BhajanList', params: undefined } as ListProps['route'];
  return { navigation, route };
}

describe('Bhajan tab door', () => {
  it('shows the shelf door with the verified count and opens the list', () => {
    const tree = mount(wrap(<AudioLibraryScreen />));
    const door = tree.root.findByProps({ testID: 'bhajan-shelf-door' });
    expect(allText(tree)).toContain('3 भजन · अर्थ सहित');
    act(() => door.props.onPress());
    expect(mockNavigate).toHaveBeenCalledWith('BhajanList');
  });

  it('labels the door in the reading language', () => {
    const tree = mount(wrap(<AudioLibraryScreen />, 'en'));
    expect(allText(tree)).toContain('3 bhajans · with meaning');
  });
});

describe('BhajanListScreen', () => {
  it('groups bhajans by deity in deities.ts order, then regions, with counts', () => {
    const { navigation, route } = listNav();
    const tree = mount(wrap(<BhajanListScreen navigation={navigation} route={route} />));
    const headers = tree.root
      .findAll((node) => typeof node.props.testID === 'string' && node.props.testID.startsWith('bhajan-group-') && node.props.accessibilityRole === 'button')
      .map((node) => node.props.testID as string);
    const ordered = [...new Set(headers)]; // composite + host nodes repeat a testID
    // krishna precedes shiva in deities.ts; the Rajasthani region trails both.
    expect(ordered).toEqual(['bhajan-group-krishna', 'bhajan-group-shiva', 'bhajan-group-rajasthani']);
    const text = allText(tree);
    expect(text).toContain('राजस्थानी भजन');
    expect(text).toContain('परीक्षण भजन test-shiva-bhajan');
  });

  it('folds a group closed and open from its header', () => {
    const { navigation, route } = listNav();
    const tree = mount(wrap(<BhajanListScreen navigation={navigation} route={route} />));
    const header = () => tree.root.findByProps({ testID: 'bhajan-group-shiva', accessibilityRole: 'button' });
    expect(header().props.accessibilityState).toEqual({ expanded: true });
    act(() => header().props.onPress());
    expect(header().props.accessibilityState).toEqual({ expanded: false });
    expect(allText(tree)).not.toContain('परीक्षण भजन test-shiva-bhajan');
    expect(allText(tree)).toContain('परीक्षण भजन test-krishna-bhajan');
    act(() => header().props.onPress());
    expect(allText(tree)).toContain('परीक्षण भजन test-shiva-bhajan');
  });

  it('opens a bhajan in the reader by its catalog id', () => {
    const { navigation, route } = listNav();
    const tree = mount(wrap(<BhajanListScreen navigation={navigation} route={route} />));
    const card = tree.root.find(
      (node) => node.props.accessibilityRole === 'button' && typeof node.props.accessibilityLabel === 'string' && node.props.accessibilityLabel.startsWith('Test Bhajan test-krishna-bhajan') && typeof node.props.onPress === 'function'
    );
    act(() => card.props.onPress());
    expect(mockNavigate).toHaveBeenCalledWith('BhajanReader', { bhajanId: 'test-krishna-bhajan', initialIndex: 0 });
  });
});

describe('BhajanReaderScreen', () => {
  function readerNav(bhajanId: string, canGoBack = true) {
    const goBack = jest.fn();
    const navigation = {
      goBack,
      canGoBack: () => canGoBack,
      navigate: mockNavigate,
      replace: jest.fn(),
    } as unknown as ReaderProps['navigation'];
    const route = { key: 'BhajanReader-test', name: 'BhajanReader', params: { bhajanId, initialIndex: 0 } } as ReaderProps['route'];
    return { navigation, route, goBack };
  }

  it('renders the first stanza, its meaning and a plain attribution', () => {
    const { navigation, route } = readerNav('test-shiva-bhajan');
    const tree = mount(wrap(<BhajanReaderScreen navigation={navigation} route={route} />));
    const text = allText(tree);
    expect(text).toContain('परीक्षण पंक्ति 1');
    expect(text).toContain('परीक्षण अर्थ 1');
    expect(text).toContain('परीक्षण कवि');
    const credit = tree.root.findByProps({ testID: 'bhajan-attribution' });
    // RULEBOOK §11.16: a credit, never a link out.
    expect(credit.findAll((n) => n.props.accessibilityRole === 'link')).toHaveLength(0);
  });

  it('leaves at once for an id with no verified payload', () => {
    const { navigation, route, goBack } = readerNav('removed-bhajan');
    const tree = mount(wrap(<BhajanReaderScreen navigation={navigation} route={route} />));
    expect(tree.root.findByProps({ testID: 'bhajan-reader-missing' })).toBeTruthy();
    expect(goBack).toHaveBeenCalledTimes(1);
  });
});

describe('entry routes for bhajans', () => {
  it('opens start, resume, notification and bookmark targets on BhajanReader', () => {
    // The mocked registry (with fixtures), not the shipped one.
    const { library } = jest.requireMock<typeof import('@/data/texts')>('@/data/texts');
    const entry = (library as import('@/data/texts').LibraryEntry[]).find((e) => e.id === 'test-shiva-bhajan')!;
    expect(entryRoutes.buildEntryStartTarget(entry)).toEqual({
      screen: 'BhajanReader',
      params: { bhajanId: 'test-shiva-bhajan', initialIndex: 0 },
    });
    expect(entryRoutes.buildProgressTarget({ sourceId: 'test-shiva-bhajan', verseIndex: 1 })).toEqual({
      screen: 'BhajanReader',
      params: { bhajanId: 'test-shiva-bhajan', initialIndex: 1 },
    });
    expect(
      entryRoutes.buildBookmarkTarget({ id: 'test-shiva-bhajan:1', sourceId: 'test-shiva-bhajan', verseIndex: 1, savedAt: 0, previewHi: '', previewEn: '' })
    ).toEqual({ screen: 'BhajanReader', params: { bhajanId: 'test-shiva-bhajan', initialIndex: 1 } });
    const nav = { navigate: jest.fn() };
    expect(entryRoutes.navigateToProgress(nav as never, { sourceId: 'test-shiva-bhajan', verseIndex: 1, updatedAt: 0 })).toBe(true);
    expect(nav.navigate).toHaveBeenCalledWith('BhajanReader', { bhajanId: 'test-shiva-bhajan', initialIndex: 1 });
  });
});
