import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import { GitaLanguageProvider } from '@/data/gita/language';
import type { AudioTrack } from '@/data/audio/tracks';

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
import NowPlayingScreen from '../audio/NowPlayingScreen';

const mockUse = useAudioPlayerContext as jest.Mock;

const gayatri: AudioTrack = {
  id: 'gayatri-mantra',
  titleHi: 'गायत्री मंत्र',
  titleEn: 'Gayatri Mantra',
  thumb: 'गा',
  artistEn: 'Mantra',
  deity: 'savitr',
  kind: 'standalone',
  durationSec: 193,
};

function state(overrides: Record<string, unknown> = {}) {
  return {
    currentTrack: gayatri,
    nowPlayingOpen: true,
    isPlaying: false,
    positionSec: 0,
    durationSec: gayatri.durationSec ?? 0,
    isLooping: false,
    togglePlay: jest.fn(),
    seekTo: jest.fn(),
    skipBy: jest.fn(),
    skipToNext: jest.fn(),
    skipToPrevious: jest.fn(),
    toggleLoop: jest.fn(),
    closeNowPlaying: jest.fn(),
    ...overrides,
  };
}

function render(): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(
      <GitaLanguageProvider>
        <NowPlayingScreen />
      </GitaLanguageProvider>
    );
  });
  return tree;
}

function labels(tree: TestRenderer.ReactTestRenderer): string[] {
  return tree.root
    .findAll((n) => typeof n.props?.accessibilityLabel === 'string')
    .map((n) => n.props.accessibilityLabel as string);
}

function textOf(tree: TestRenderer.ReactTestRenderer): string {
  return tree.root
    .findAllByType(Text)
    .map((n) => n.props.children)
    .flat(Number.POSITIVE_INFINITY)
    .join(' ');
}

describe('NowPlayingScreen', () => {
  test('shows the −15/+15 skip buttons alongside prev/next on a short mantra', () => {
    mockUse.mockReturnValue(state({ durationSec: 193 }));
    const l = labels(render());
    expect(l).toContain('Previous track');
    expect(l).toContain('Next track');
    expect(l).toContain('Rewind 15 seconds');
    expect(l).toContain('Forward 15 seconds');
  });

  test('shows the −15/+15 skip buttons on a long recitation too', () => {
    mockUse.mockReturnValue(state({ durationSec: 1920 }));
    const l = labels(render());
    expect(l).toContain('Rewind 15 seconds');
    expect(l).toContain('Forward 15 seconds');
  });

  test('keeps the loop toggle but drops tempo and download controls', () => {
    mockUse.mockReturnValue(state());
    const l = labels(render());
    expect(l).toContain('Toggle loop');
    expect(l).not.toContain('Slower');
    expect(l).not.toContain('Faster');
    expect(l.some((x) => /offline|Save/i.test(x))).toBe(false);
  });

  test('subtitle reads "<label> · <deity>"', () => {
    mockUse.mockReturnValue(state());
    expect(textOf(render())).toContain('Mantra · Maa Gayatri');
  });
});
