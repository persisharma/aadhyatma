import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text, View as mockView } from 'react-native';
import ContinueReadingCard from '@/components/ContinueReadingCard';
import type { ReadingProgress } from '@/contexts/ReadingProgressContext';

// ---- mutable mock state (reset in beforeEach) ----
let mockLang: 'hi' | 'en' = 'hi';
const mockNavigate = jest.fn();
let mockProgress: { progress: Record<string, ReadingProgress>; isLoading: boolean } = {
  progress: {},
  isLoading: false,
};

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    mockReact.createElement(mockView, props, children),
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));
jest.mock('@/data/gita/language', () => ({ useGitaLanguage: () => ({ lang: mockLang }) }));
jest.mock('@/contexts/ReadingProgressContext', () => ({
  useReadingProgress: () => mockProgress,
}));

function render(): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(<ContinueReadingCard />);
  });
  return tree;
}

function textOf(tree: TestRenderer.ReactTestRenderer): string {
  return tree.root
    .findAllByType(Text)
    .map((n) => n.props.children)
    .flat(Number.POSITIVE_INFINITY)
    .join(' ');
}

beforeEach(() => {
  mockLang = 'hi';
  mockNavigate.mockClear();
  mockProgress = { progress: {}, isLoading: false };
});

describe('ContinueReadingCard', () => {
  it('renders nothing when no progress exists', () => {
    const tree = render();
    expect(tree.toJSON()).toBeNull();
  });

  it('renders nothing while progress is loading', () => {
    mockProgress = {
      progress: {
        'hanuman-chalisa': { sourceId: 'hanuman-chalisa', verseIndex: 4, updatedAt: 100 },
      },
      isLoading: true,
    };
    expect(render().toJSON()).toBeNull();
  });

  it('shows the latest entry with its position and resumes via the shared routing table', () => {
    mockProgress = {
      progress: {
        'hanuman-chalisa': { sourceId: 'hanuman-chalisa', verseIndex: 4, updatedAt: 100 },
      },
      isLoading: false,
    };
    const tree = render();
    const text = textOf(tree);
    expect(text).toContain('जारी रखें');
    expect(text).toContain('हनुमान चालीसा');
    expect(text).toContain('श्लोक 5'); // verseIndex 4 → verse #5

    const button = tree.root.findAll(
      (n) => n.props?.accessibilityRole === 'button' && typeof n.props?.onPress === 'function'
    )[0];
    act(() => button.props.onPress());
    expect(mockNavigate).toHaveBeenCalledWith('ChalisaReader', {
      initialIndex: 4,
      chalisaId: 'hanuman-chalisa',
    });
  });

  it('routes chaptered sources through the chapter reader', () => {
    mockProgress = {
      progress: {
        'bhagavad-gita::12': {
          sourceId: 'bhagavad-gita',
          chapter: 12,
          verseIndex: 3,
          updatedAt: 200,
        },
      },
      isLoading: false,
    };
    const tree = render();
    expect(textOf(tree)).toContain('अध्याय 12');
    const button = tree.root.findAll(
      (n) => n.props?.accessibilityRole === 'button' && typeof n.props?.onPress === 'function'
    )[0];
    act(() => button.props.onPress());
    expect(mockNavigate).toHaveBeenCalledWith('GitaReader', { chapter: 12, initialIndex: 3 });
  });

  it('renders nothing for an unroutable source', () => {
    mockProgress = {
      progress: {
        'unknown-source': { sourceId: 'unknown-source', verseIndex: 0, updatedAt: 100 },
      },
      isLoading: false,
    };
    expect(render().toJSON()).toBeNull();
  });
});
