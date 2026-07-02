import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text, View as mockView } from 'react-native';
import { GitaLanguageProvider } from '@/data/gita/language';
import type { AudioTrack } from '@/data/audio/tracks';

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

import TrackCard from '@/components/audio/TrackCard';

const withDeity: AudioTrack = {
  id: 'gayatri-mantra',
  titleHi: 'गायत्री मंत्र',
  titleEn: 'Gayatri Mantra',
  thumb: 'गा',
  artistEn: 'Mantra',
  deity: 'savitr',
  kind: 'standalone',
  durationSec: 193,
};

const withoutDeity: AudioTrack = {
  id: 'mystery',
  titleHi: 'रहस्य',
  titleEn: 'Mystery',
  thumb: 'र',
  kind: 'standalone',
  durationSec: 120,
};

function render(node: React.ReactElement): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(<GitaLanguageProvider>{node}</GitaLanguageProvider>);
  });
  return tree;
}

function glyphs(tree: TestRenderer.ReactTestRenderer) {
  return tree.root.findAll((n) => n.props?.viewBox === '0 0 44 44');
}

function textOf(tree: TestRenderer.ReactTestRenderer): string {
  return tree.root
    .findAllByType(Text)
    .map((n) => n.props.children)
    .flat(Number.POSITIVE_INFINITY)
    .join(' ');
}

describe('TrackCard thumb', () => {
  test('renders the deity glyph for a track with a deity', () => {
    const tree = render(<TrackCard track={withDeity} onPress={() => undefined} />);
    expect(glyphs(tree).length).toBeGreaterThan(0);
  });

  test('falls back to the Devanagari thumb letter when the track has no deity', () => {
    const tree = render(<TrackCard track={withoutDeity} onPress={() => undefined} />);
    expect(glyphs(tree)).toHaveLength(0);
    expect(textOf(tree)).toContain('र');
  });
});
