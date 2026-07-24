import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text, View as mockView } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GitaLanguageProvider } from '@/data/gita/language';
import type { AudioTrack } from '@/data/audio/tracks';

const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    mockReact.createElement(mockView, props, children),
}));

jest.mock('react-native-svg', () => {
  const ReactLib = require('react');
  const { View } = require('react-native');
  const mk = () => (props: Record<string, unknown>) =>
    ReactLib.createElement(View, props, props.children as React.ReactNode);
  const Svg = mk();
  return { __esModule: true, default: Svg, Svg, Path: mk(), Circle: mk(), Ellipse: mk(), Line: mk(), G: mk() };
});

jest.mock('@/contexts/AudioPlayerContext', () => ({
  SKIP_SECONDS: 15,
  useAudioPlayerContext: jest.fn(),
}));

import { useAudioPlayerContext } from '@/contexts/AudioPlayerContext';
import MiniPlayer from '@/components/audio/MiniPlayer';

const mockUse = useAudioPlayerContext as jest.Mock;

const track: AudioTrack = {
  id: 'hare-rama',
  titleHi: 'हरे राम',
  titleEn: 'Hare Rama',
  thumb: 'ह',
  artistEn: 'Mahamantra',
  deity: 'rama',
  kind: 'standalone',
  durationSec: 480,
};

function baseState(overrides: Record<string, unknown> = {}) {
  return {
    currentTrack: track,
    isPlaying: false,
    positionSec: 0,
    durationSec: 480,
    togglePlay: jest.fn(),
    stop: jest.fn(),
    openNowPlaying: jest.fn(),
    ...overrides,
  };
}

function render(): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(
      <SafeAreaProvider initialMetrics={initialMetrics}>
        <GitaLanguageProvider>
          <MiniPlayer />
        </GitaLanguageProvider>
      </SafeAreaProvider>
    );
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

describe('MiniPlayer', () => {
  test('renders nothing when no track is loaded', () => {
    mockUse.mockReturnValue(baseState({ currentTrack: null }));
    const tree = render();
    expect(textOf(tree)).toBe('');
  });

  test('shows a deity glyph thumbnail plus the title when a track is loaded', () => {
    mockUse.mockReturnValue(baseState());
    const tree = render();
    // rama → bowArrow → hand-drawn glyph
    expect(tree.root.findAllByProps({ testID: 'deity-glyph-bowArrow' }).length).toBeGreaterThan(0);
    expect(textOf(tree)).toContain('हरे राम');
  });
});
