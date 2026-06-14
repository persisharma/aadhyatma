import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text, View as mockView } from 'react-native';
import { NewContentProvider } from '@/contexts/NewContentContext';
import { GitaLanguageProvider } from '@/data/gita/language';
import LibraryCard from '@/components/LibraryCard';
import { library, type LibraryEntry } from '@/data/texts';

// Stateful in-memory AsyncStorage mock (jest.mock is hoisted above the imports).
let mockStore: Record<string, string> = {};
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((k: string) => Promise.resolve(mockStore[k] ?? null)),
  setItem: jest.fn((k: string, v: string) => {
    mockStore[k] = v;
    return Promise.resolve();
  }),
  getAllKeys: jest.fn(() => Promise.resolve(Object.keys(mockStore))),
  removeItem: jest.fn((k: string) => {
    delete mockStore[k];
    return Promise.resolve();
  }),
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    mockReact.createElement(mockView, props, children),
}));

const krishna = library.find((e) => e.id === 'krishna-stotram') as LibraryEntry;
const hanuman = library.find((e) => e.id === 'hanuman-chalisa') as LibraryEntry;

function textOf(tree: TestRenderer.ReactTestRenderer): string {
  return tree.root
    .findAllByType(Text)
    .map((n) => n.props.children)
    .flat(Number.POSITIVE_INFINITY)
    .join(' ');
}

async function renderWithProvider(entry: LibraryEntry): Promise<TestRenderer.ReactTestRenderer> {
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <GitaLanguageProvider>
        <NewContentProvider>
          <LibraryCard entry={entry} onPress={() => undefined} />
        </NewContentProvider>
      </GitaLanguageProvider>
    );
  });
  await act(async () => {
    for (let i = 0; i < 5; i++) await Promise.resolve();
  });
  return tree;
}

beforeEach(() => {
  mockStore = {};
  jest.clearAllMocks();
});

describe('LibraryCard NEW badge (integration with NewContentProvider)', () => {
  test('upgrader: a debut-tagged active card renders the NEW badge', async () => {
    mockStore['@vedansh/reading-progress'] = JSON.stringify({});
    const tree = await renderWithProvider(krishna);
    expect(textOf(tree)).toMatch(/NEW/);
  });

  test('upgrader: a non-tagged active card does NOT render the NEW badge', async () => {
    mockStore['@vedansh/reading-progress'] = JSON.stringify({});
    const tree = await renderWithProvider(hanuman);
    expect(textOf(tree)).not.toMatch(/NEW/);
  });

  test('fresh install: no NEW badge on any card', async () => {
    const tree = await renderWithProvider(krishna);
    expect(textOf(tree)).not.toMatch(/NEW/);
  });

  test('upgrader: NEW card exposes " New." in its accessibility label', async () => {
    mockStore['@vedansh/reading-progress'] = JSON.stringify({});
    const tree = await renderWithProvider(krishna);
    const labelled = tree.root.findAll(
      (n) =>
        typeof n.props?.accessibilityLabel === 'string' &&
        n.props.accessibilityLabel.includes('Krishna Stotram')
    );
    expect(labelled.length).toBeGreaterThan(0);
    expect(labelled[0].props.accessibilityLabel).toMatch(/New\./);
  });
});
