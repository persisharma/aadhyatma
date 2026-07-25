import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text, View as mockView } from 'react-native';
import { GitaLanguageProvider } from '@/data/gita/language';
import type { AudioTrack } from '@/data/audio/tracks';

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    mockReact.createElement(mockView, props, children),
}));

import TrackCard from '@/components/audio/TrackCard';

// rama → bowArrow → hand-drawn glyph (deityGlyphs/bowArrow, testID deity-glyph-bowArrow)
const withDeity: AudioTrack = {
  id: 'hare-rama',
  titleHi: 'हरे राम',
  titleEn: 'Hare Rama',
  thumb: 'ह',
  artistEn: 'Mahamantra',
  deity: 'rama',
  kind: 'standalone',
  durationSec: 480,
};

const withoutDeity: AudioTrack = {
  id: 'mystery',
  titleHi: 'परीक्षा',
  titleEn: 'Test Track',
  thumb: 'ओ',
  kind: 'standalone',
  durationSec: 120,
};

function render(node: React.ReactElement): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(<GitaLanguageProvider initialLang="hi">{node}</GitaLanguageProvider>);
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

describe('TrackCard thumb', () => {
  test('renders the deity glyph for a track with a deity', () => {
    const tree = render(<TrackCard track={withDeity} onPress={() => undefined} />);
    expect(tree.root.findAllByProps({ testID: 'deity-glyph-bowArrow' }).length).toBeGreaterThan(0);
  });

  test('falls back to the Devanagari thumb letter when the track has no deity', () => {
    const tree = render(<TrackCard track={withoutDeity} onPress={() => undefined} />);
    expect(tree.root.findAllByProps({ testID: 'deity-glyph-bowArrow' })).toHaveLength(0);
    expect(textOf(tree)).toContain('ओ');
  });
});
