/**
 * The Panchang sky header (design.md §33): its tone, its "now" hero, and the
 * pre-dawn "next auspicious" search.
 *
 * Before sunrise the running half is LAST night's, which today's solve does not
 * hold — `nextAuspiciousPeriod(muhurat)` alone skipped the night's remaining
 * shubh period and named the morning's instead. These cases pin the hero copy
 * and the status-bar hand-off on each branch. Every instant is anchored to the
 * real clock, so the cases cannot expire.
 */
import React from 'react';
import { StatusBar, Text } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import PanchangSky from '../PanchangSky';
import { ThemeProvider } from '@/theme/ThemeContext';
import { FontScaleProvider } from '@/contexts/FontScaleContext';
import { formatClock } from '@/panchang/muhuratFormat';
import type { ChoghadiyaKey, ChoghadiyaPeriod } from '@/panchang/muhurat';

jest.mock('expo-linear-gradient', () => {
  const { View } = jest.requireActual('react-native');
  return { LinearGradient: View };
});
// No breathing loop under test — the reduce-motion branch is the still sky.
jest.mock('@/utils/useReducedMotion', () => ({ useReducedMotion: () => true }));

let mockSolve: Record<string, unknown> = {};
jest.mock('@/panchang/useMuhurat', () => ({ useMuhurat: () => mockSolve }));

const { GitaLanguageProvider } = jest.requireActual<typeof import('@/data/gita/language')>(
  '@/data/gita/language'
);

const SPAN = 90 * 60 * 1000;
const NAMES: Record<ChoghadiyaKey, string> = {
  shubh: 'Shubh', amrit: 'Amrit', char: 'Char', rog: 'Rog', kaal: 'Kaal', labh: 'Labh', udveg: 'Udveg',
};

/** Eight contiguous periods whose `nowIndex`-th holds the real clock, 30 min in. */
function runAround(phase: 'day' | 'night', keys: ChoghadiyaKey[], nowIndex: number): ChoghadiyaPeriod[] {
  const start = Date.now() - nowIndex * SPAN - 30 * 60 * 1000;
  return keys.map((key, i) => ({
    key,
    nameHi: NAMES[key],
    nameEn: NAMES[key],
    quality: key === 'rog' || key === 'kaal' || key === 'udveg' ? 'avoid' : 'auspicious',
    phase,
    start: new Date(start + i * SPAN),
    end: new Date(start + (i + 1) * SPAN),
  }));
}

const NIGHT: ChoghadiyaKey[] = ['shubh', 'amrit', 'char', 'rog', 'kaal', 'labh', 'udveg', 'shubh'];
const DAY: ChoghadiyaKey[] = ['amrit', 'kaal', 'shubh', 'rog', 'udveg', 'char', 'labh', 'amrit'];

function solve(nowRun: ChoghadiyaPeriod[] | null, nowIndex: number, isToday = true) {
  // Today's day half, all of it AFTER the clock — what the old fallback alone
  // would have searched before sunrise.
  const later = runAround('day', DAY, -1);
  return {
    isToday,
    nowRun,
    nowChoghadiya: nowRun ? nowRun[nowIndex] : null,
    nowKaal: null,
    panchang: { tithi: { index: 14 } },
    muhurat: {
      sunrise: later[0].start,
      sunset: later[7].end,
      dayChoghadiya: later,
      nightChoghadiya: runAround('night', NIGHT, -9),
      abhijit: { start: new Date(Date.now() + 5 * SPAN), end: new Date(Date.now() + 5 * SPAN + 48 * 60 * 1000) },
    },
  };
}

const trees: TestRenderer.ReactTestRenderer[] = [];
afterEach(() => {
  act(() => trees.splice(0).forEach((tree) => tree.unmount()));
});

async function render(focused = true): Promise<TestRenderer.ReactTestRenderer> {
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <FontScaleProvider>
        <ThemeProvider>
          <GitaLanguageProvider initialLang="en">
            <PanchangSky date={new Date()} calendarSystem="purnimant" topInset={0} focused={focused}>
              {(ink) => <Text testID="tone">{ink.tone}</Text>}
            </PanchangSky>
          </GitaLanguageProvider>
        </ThemeProvider>
      </FontScaleProvider>
    );
  });
  // Lay the sky out so the arc and glyph draw.
  await act(async () => {
    const sky = tree.root.findAll((n) => typeof n.props.onLayout === 'function')[0];
    sky.props.onLayout({ nativeEvent: { layout: { x: 0, y: 0, width: 390, height: 330 } } });
  });
  trees.push(tree);
  return tree;
}

const texts = (tree: TestRenderer.ReactTestRenderer): string =>
  tree.root.findAllByType(Text)
    .flatMap((node) => node.findAll((n) => typeof n.props.children === 'string').map((n) => n.props.children as string))
    .join(' ');
const tone = (tree: TestRenderer.ReactTestRenderer) => tree.root.findByProps({ testID: 'tone' }).props.children;
const lightStatusBar = (tree: TestRenderer.ReactTestRenderer) =>
  tree.root.findAllByType(StatusBar).some((n) => n.props.barStyle === 'light-content');

test('a live night read is a night sky with the running choghadiya and what follows', async () => {
  mockSolve = solve(runAround('night', NIGHT, 5), 5);
  const tree = await render();
  expect(tone(tree)).toBe('night');
  const out = texts(tree);
  expect(out).toContain('Labh');
  expect(out).toContain('left');
  expect(out).toContain(`till ${formatClock((mockSolve.nowChoghadiya as ChoghadiyaPeriod).end)}`);
  expect(out).toContain('then Udveg · avoid');
  expect(lightStatusBar(tree)).toBe(true);
});

test('before sunrise, the next auspicious period is found in last night, not this morning', async () => {
  const night = runAround('night', NIGHT, 6); // Udveg running, Shubh still to come tonight
  mockSolve = solve(night, 6);
  const out = texts(await render());
  expect(out).toContain(`Next auspicious: Shubh from ${formatClock(night[7].start)}`);
  expect(out).not.toContain('Next auspicious: Amrit');
});

test('the status bar is left alone when the screen is not the one showing', async () => {
  mockSolve = solve(runAround('night', NIGHT, 5), 5);
  expect(lightStatusBar(await render(false))).toBe(false);
});

test('a live day read is a day sky', async () => {
  mockSolve = solve(runAround('day', DAY, 2), 2);
  const tree = await render();
  expect(tone(tree)).toBe('day');
  expect(texts(tree)).toContain('Shubh');
  expect(lightStatusBar(tree)).toBe(false);
});

test('a browsed date is a day sky led by Abhijit, with no "now"', async () => {
  mockSolve = solve(null, -1, false);
  const tree = await render();
  expect(tone(tree)).toBe('day');
  const out = texts(tree);
  expect(out).toContain('Abhijit');
  expect(out).toContain('Muhurat');
  expect(out).not.toContain('left');
});
