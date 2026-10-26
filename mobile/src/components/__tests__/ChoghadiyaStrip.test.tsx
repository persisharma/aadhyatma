/**
 * The choghadiya strip on the Muhurat card (design.md §33): the running segment
 * is stated by default, a tap states any other, and the detail says whether it
 * has passed — always in words next to the colour (§12).
 */
import React from 'react';
import { Text } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import ChoghadiyaStrip from '../ChoghadiyaStrip';
import { ThemeProvider } from '@/theme/ThemeContext';
import { FontScaleProvider } from '@/contexts/FontScaleContext';
import type { ChoghadiyaKey, ChoghadiyaPeriod } from '@/panchang/muhurat';

const { GitaLanguageProvider } = jest.requireActual<typeof import('@/data/gita/language')>(
  '@/data/gita/language'
);

const KEYS: ChoghadiyaKey[] = ['shubh', 'amrit', 'char', 'rog', 'kaal', 'labh', 'udveg', 'shubh'];
const NAMES: Record<ChoghadiyaKey, string> = {
  shubh: 'Shubh', amrit: 'Amrit', char: 'Char', rog: 'Rog', kaal: 'Kaal', labh: 'Labh', udveg: 'Udveg',
};
const periods: ChoghadiyaPeriod[] = KEYS.map((key, i) => ({
  key,
  nameHi: NAMES[key],
  nameEn: NAMES[key],
  quality: key === 'rog' || key === 'kaal' || key === 'udveg' ? 'avoid' : 'auspicious',
  phase: 'night',
  start: new Date(2026, 9, 25, 17, 55 + i * 92),
  end: new Date(2026, 9, 25, 17, 55 + (i + 1) * 92),
}));

const trees: TestRenderer.ReactTestRenderer[] = [];
afterEach(() => {
  act(() => trees.splice(0).forEach((tree) => tree.unmount()));
});

async function render(nowIndex: number | null): Promise<TestRenderer.ReactTestRenderer> {
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <FontScaleProvider>
        <ThemeProvider>
          <GitaLanguageProvider initialLang="en">
            <ChoghadiyaStrip periods={periods} nowIndex={nowIndex} progress={0.55} />
          </GitaLanguageProvider>
        </ThemeProvider>
      </FontScaleProvider>
    );
  });
  trees.push(tree);
  return tree;
}

/** The detail row: the one holding the quality pill's word. */
const detail = (tree: TestRenderer.ReactTestRenderer): string =>
  tree.root
    .findAll((n) => n.props.accessibilityLiveRegion === 'polite')[0]
    ?.findAllByType(Text)
    .flatMap((t) => t.findAll((n) => typeof n.props.children === 'string').map((n) => n.props.children as string))
    .join(' ') ?? '';
// Pressable is a memo'd forwardRef, so find the press targets by their props —
// one per distinct label (each wrapper layer repeats the props).
const segments = (tree: TestRenderer.ReactTestRenderer) => {
  const seen = new Set<string>();
  return tree.root
    .findAll((n) => typeof n.props.onPress === 'function' && typeof n.props.accessibilityLabel === 'string')
    .filter((n) => !seen.has(n.props.accessibilityLabel) && !!seen.add(n.props.accessibilityLabel));
};

test('eight tappable segments under the half\'s heading, the running one labelled with its share', async () => {
  const tree = await render(5);
  expect(segments(tree)).toHaveLength(8);
  expect(segments(tree)[5].props.accessibilityLabel).toContain('now, 55% elapsed');
  expect(segments(tree)[2].props.accessibilityLabel).toContain('passed');
  const all = tree.root.findAllByType(Text).map((t) => t.props.children).flat().join(' ');
  expect(all).toContain('Night choghadiya');
});

test('the running segment is stated by default; a tap states another and says when it is', async () => {
  const tree = await render(5);
  expect(detail(tree)).toContain('Labh');
  expect(detail(tree)).toContain('now');
  expect(detail(tree)).toContain('auspicious');

  await act(async () => segments(tree)[6].props.onPress());
  expect(detail(tree)).toContain('Udveg');
  expect(detail(tree)).toContain('later');
  expect(detail(tree)).toContain('avoid');

  await act(async () => segments(tree)[3].props.onPress());
  expect(detail(tree)).toContain('Rog');
  expect(detail(tree)).toContain('passed');
});

test('a browsed day marks nothing and states nothing until tapped', async () => {
  const tree = await render(null);
  expect(detail(tree)).toBe('');
  await act(async () => segments(tree)[1].props.onPress());
  expect(detail(tree)).toContain('Amrit');
  expect(detail(tree)).not.toContain('now');
});
