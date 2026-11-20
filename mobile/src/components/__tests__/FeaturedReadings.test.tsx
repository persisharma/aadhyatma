import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Pressable as mockPressable } from 'react-native';
import FeaturedReadings from '@/components/home/FeaturedReadings';

jest.mock('@/components/CategoryCard', () => ({
  __esModule: true,
  default: (props: { testID: string; onPress: () => void }) =>
    mockReact.createElement(mockPressable, { testID: props.testID, onPress: props.onPress }),
}));
jest.mock('@/contexts/NewContentContext', () => ({
  useNewContent: () => ({ isNew: () => false, hasNewInCategory: () => false, markSeen: jest.fn() }),
}));
jest.mock('@/contexts/TilePressContext', () => ({
  useTilePress: () => ({
    beginTilePress: jest.fn(),
    finishTilePress: jest.fn(),
    activateTile: (action: () => void) => action(),
  }),
}));
jest.mock('@/data/gita/language', () => ({ useGitaLanguage: () => ({ lang: 'hi' }) }));
jest.mock('@/theme/ThemeContext', () => ({
  useTheme: () => ({ colors: { inkSoft: '#000' }, radii: { lg: 12 } }),
}));

function pressTile(id: string) {
  const navigate = jest.fn();
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(
      <FeaturedReadings navigation={{ navigate } as never} width={360} largeText={false} />,
    );
  });
  act(() => {
    tree.root.findByProps({ testID: `home-featured-${id}` }).props.onPress();
  });
  return navigate;
}

describe('FeaturedReadings', () => {
  it('opens the Bhagavad Gita chapters listing, not the chapter 1 reader', () => {
    expect(pressTile('bhagavad-gita')).toHaveBeenCalledWith('GitaChapters');
  });

  it('opens Gita Saar on its themes listing', () => {
    expect(pressTile('gita-saar')).toHaveBeenCalledWith('GitaSaarChapters');
  });
});
