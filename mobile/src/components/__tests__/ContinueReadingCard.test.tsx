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

function pressCard(tree: TestRenderer.ReactTestRenderer): void {
  const button = tree.root.findAll(
    (n) => n.props?.accessibilityRole === 'button' && typeof n.props?.onPress === 'function'
  )[0];
  act(() => button.props.onPress());
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

  it('shows the latest entry with formatLocation wording and resumes it', () => {
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
    expect(text).toContain('पद 5'); // formatLocation: chalisas use पद, verseIndex 4 → 5

    pressCard(tree);
    expect(mockNavigate).toHaveBeenCalledWith('ChalisaReader', {
      initialIndex: 4,
      chalisaId: 'hanuman-chalisa',
    });
  });

  it('resumes chaptered sources via navigateToProgress — chapters screen pushed under the reader', () => {
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
    pressCard(tree);
    // Same back-stack contract as the resume sheets: chapter index first, then the reader.
    expect(mockNavigate).toHaveBeenNthCalledWith(1, 'GitaChapters');
    expect(mockNavigate).toHaveBeenNthCalledWith(2, 'GitaReader', {
      chapter: 12,
      initialIndex: 3,
    });
  });

  it('falls back to the next-most-recent routable entry when the latest is unroutable', () => {
    mockProgress = {
      progress: {
        'unknown-source': { sourceId: 'unknown-source', verseIndex: 0, updatedAt: 900 },
        'hanuman-chalisa': { sourceId: 'hanuman-chalisa', verseIndex: 2, updatedAt: 100 },
      },
      isLoading: false,
    };
    const tree = render();
    expect(textOf(tree)).toContain('हनुमान चालीसा');
  });

  it('renders nothing when no entry is routable', () => {
    mockProgress = {
      progress: {
        'unknown-source': { sourceId: 'unknown-source', verseIndex: 0, updatedAt: 100 },
      },
      isLoading: false,
    };
    expect(render().toJSON()).toBeNull();
  });
});
