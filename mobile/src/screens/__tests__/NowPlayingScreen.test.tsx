import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { ScrollView, Text } from 'react-native';
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
  useAudioPosition: () => 0,
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

function render(lang: 'hi' | 'en' | 'gu' | 'kn' = 'en'): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang={lang}>
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

  test('keeps long titles and every transport control in a scrollable body, with minimize outside it', () => {
    const currentTrack = { ...gayatri, titleEn: 'Gayatri Mantra — complete recitation and extended chanting' };
    mockUse.mockReturnValue(state({ currentTrack }));
    const tree = render();
    const scroll = tree.root.findByType(ScrollView);
    expect(scroll.props.testID).toBe('now-playing-scroll');
    expect(scroll.findAllByType(Text).find(node => node.props.children === currentTrack.titleEn)!.props.numberOfLines).toBeUndefined();
    expect(scroll.findAll(node => typeof node.props.onPress === 'function').some(node => node.props.accessibilityLabel === 'Toggle loop')).toBe(true);
    expect(scroll.findAll(node => typeof node.props.onPress === 'function').some(node => node.props.accessibilityLabel === 'Minimize player')).toBe(false);
    act(() => tree.unmount());
  });

  test('playback, skip, repeat, seek and minimize callbacks survive the scroll wrapper', () => {
    const value = state({ durationSec: 200 });
    mockUse.mockReturnValue(value);
    const tree = render();
    const button = (label: string) => tree.root.findAll(node => typeof node.props.onPress === 'function').find(node => node.props.accessibilityLabel === label)!;
    for (const label of ['Play', 'Previous track', 'Next track', 'Toggle loop', 'Minimize player']) act(() => button(label).props.onPress());
    act(() => button('Rewind 15 seconds').props.onPress());
    act(() => button('Forward 15 seconds').props.onPress());
    expect(value.togglePlay).toHaveBeenCalledTimes(1);
    expect(value.skipToPrevious).toHaveBeenCalledTimes(1);
    expect(value.skipToNext).toHaveBeenCalledTimes(1);
    expect(value.toggleLoop).toHaveBeenCalledTimes(1);
    expect(value.closeNowPlaying).toHaveBeenCalledTimes(1);
    expect(value.skipBy.mock.calls).toEqual([[-15], [15]]);
    act(() => button('Seek').props.onLayout({ nativeEvent: { layout: { width: 240 } } }));
    act(() => button('Seek').props.onPress({ nativeEvent: { locationX: 60 } }));
    expect(value.seekTo).toHaveBeenCalledWith(50);
    act(() => tree.unmount());
  });

  test('UX-05: control labels follow the reading language; play/pause stays English for e2e', () => {
    mockUse.mockReturnValue(state());
    for (const lang of ['hi', 'gu', 'kn'] as const) {
      const l = labels(render(lang));
      for (const english of ['Previous track', 'Next track', 'Rewind 15 seconds', 'Forward 15 seconds', 'Toggle loop', 'Minimize player', 'Seek']) {
        expect(l).not.toContain(english);
      }
      expect(l).toContain('Play');
    }
    expect(labels(render('hi'))).toContain('पिछला ट्रैक');
  });

  test('UX-01: a stalled load shows the message and a Retry that reloads the track', () => {
    const retryPlayback = jest.fn();
    mockUse.mockReturnValue(state({ playbackNotice: 'loadFailed', retryPlayback }));
    const tree = render('en');
    expect(textOf(tree)).toContain('Couldn’t load this track');
    act(() => tree.root.findByProps({ testID: 'now-playing-retry' }).props.onPress());
    expect(retryPlayback).toHaveBeenCalledTimes(1);
  });

  test('UX-09: no-audio track says so, with no retry', () => {
    mockUse.mockReturnValue(state({ playbackNotice: 'noAudio' }));
    const tree = render('en');
    expect(textOf(tree)).toContain('isn’t available yet');
    expect(tree.root.findAllByProps({ testID: 'now-playing-retry' })).toHaveLength(0);
  });
});
