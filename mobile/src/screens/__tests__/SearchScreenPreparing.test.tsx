import React from 'react';
import { TextInput } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(async () => null), setItem: jest.fn(async () => undefined) },
}));
jest.mock('expo-linear-gradient', () => ({ LinearGradient: ({ children }: React.PropsWithChildren) => children }));
jest.mock('react-native-safe-area-context', () => {
  const { View } = jest.requireActual('react-native');
  return { SafeAreaView: View, useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }) };
});
jest.mock('@/ask/useAsk', () => ({
  useAsk: () => ({ ready: false, ask: () => null, looksLikeQuestion: () => false, examples: [] }),
}));
jest.mock('@/contexts/NewContentContext', () => ({
  useNewContent: () => ({ isNew: () => false, hasNewInCategory: () => false, markSeen: () => {} }),
}));
let mockIndex: unknown = null;
jest.mock('../_useSearchIndex', () => ({ useSearchIndex: () => mockIndex }));

const { GitaLanguageProvider } = jest.requireActual<typeof import('@/data/gita/language')>(
  '@/data/gita/language'
);
const SearchScreen = jest.requireActual<typeof import('../SearchScreen')>('../SearchScreen').default;
const { EMPTY_SEARCH_INDEX } = jest.requireActual<typeof import('@/data/searchIndex')>('@/data/searchIndex');

async function searchFor(query: string) {
  const navigation = { navigate: jest.fn(), push: jest.fn(), goBack: jest.fn(), setParams: jest.fn() };
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang="en">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <SearchScreen navigation={navigation as any} route={{ key: 'Search', name: 'Search', params: {} } as any} />
      </GitaLanguageProvider>
    );
  });
  await act(async () => {
    tree.root.findByType(TextInput).props.onChangeText(query);
  });
  return tree;
}

// Every string rendered inside a <Text>, joined — the tree itself has circular props.
const text = (t: TestRenderer.ReactTestRenderer) =>
  t.root
    // Host <Text> nodes: their children are the actual strings.
    .findAll((n) => (n.type as unknown) === 'Text')
    .flatMap((n) => n.children.filter((c): c is string => typeof c === 'string'))
    .join(' | ');

it('while the index is still building, a query shows "preparing" — never "no matches"', async () => {
  mockIndex = null;
  const tree = await searchFor('hanuman');
  expect(tree.root.findAllByProps({ testID: 'search-preparing' }).length).toBeGreaterThan(0);
  expect(text(tree)).not.toContain('No matches found');
});

it('once the index is ready, a query with no hits says "no matches" as before', async () => {
  mockIndex = EMPTY_SEARCH_INDEX;
  const tree = await searchFor('zzzqqq');
  expect(tree.root.findAllByProps({ testID: 'search-preparing' })).toHaveLength(0);
  expect(text(tree)).toContain('No matches found');
});
