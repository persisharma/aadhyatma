/**
 * The glance card's kicker tithi line and its handover successor.
 *
 * `तक 8:51 AM` alone says when the day's udaya label stops being true and never
 * what is true for the rest of the day — which is what made a Chaturthi vrat
 * look like it belonged to the next date the almanac heads चतुर्थी (Aug 2026
 * report). These cases pin the rendered copy on the real reported day and on
 * each branch where the handover must stay silent.
 */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import MuhuratGlanceCard from '../MuhuratGlanceCard';
import { ThemeProvider } from '@/theme/ThemeContext';
import { FontScaleProvider } from '@/contexts/FontScaleContext';
import type { PanchangData } from '@/panchang/types';

// expo-linear-gradient is untranspiled ESM Jest cannot parse (the same trap as
// expo-location and expo-speech, which jest.setup.js handles globally). No other
// Jest suite renders a gradient component, so it is mocked here rather than
// globally: a plain View keeps the card's children in the rendered tree.
jest.mock('expo-linear-gradient', () => {
  const { View } = jest.requireActual('react-native');
  return { LinearGradient: View };
});

let mockPanchang: PanchangData | null = null;
let mockIsToday = false;

jest.mock('@/panchang/useMuhurat', () => ({
  useMuhurat: () => ({
    isToday: mockIsToday,
    nowChoghadiya: null,
    // Only `abhijit` and `rahu` are read off the solve; a truthy object is what
    // takes the card past its skeleton branch.
    muhurat: {
      abhijit: { start: new Date(2026, 7, 31, 11, 55), end: new Date(2026, 7, 31, 12, 44) },
      rahu: { start: new Date(2026, 7, 31, 7, 41), end: new Date(2026, 7, 31, 9, 14) },
    },
    panchang: mockPanchang,
  }),
}));

const { GitaLanguageProvider } = jest.requireActual<typeof import('@/data/gita/language')>(
  '@/data/gita/language'
);

const trees: TestRenderer.ReactTestRenderer[] = [];

afterEach(() => {
  act(() => trees.splice(0).forEach((tree) => tree.unmount()));
  mockPanchang = null;
  mockIsToday = false;
});

// Minimal stand-in: the kicker reads date + tithi + kshayaTithi only.
function day(
  index: number,
  nameEn: string,
  endTime: Date | null,
  kshaya?: { index: number; nameEn: string; endTime: Date | null }
): PanchangData {
  const el = (i: number, name: string, end: Date | null) => ({
    index: i,
    paksha: (i < 15 ? 'shukla' : 'krishna') as 'shukla' | 'krishna',
    nameHi: name,
    nameEn: name,
    endTime: end,
  });
  return {
    date: new Date(2026, 7, 31),
    tithi: el(index, nameEn, endTime),
    kshayaTithi: kshaya ? el(kshaya.index, kshaya.nameEn, kshaya.endTime) : null,
  } as PanchangData;
}

// Async act: FontScaleProvider settles its loading state in an effect, and a
// sync render leaves that update unwrapped (the act warning every provider-backed
// suite here works around the same way).
async function render(): Promise<TestRenderer.ReactTestRenderer> {
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <FontScaleProvider>
        <ThemeProvider>
          <GitaLanguageProvider initialLang="en">
            <MuhuratGlanceCard date={new Date(2026, 7, 31)} calendarSystem="purnimant" onViewAll={() => {}} />
          </GitaLanguageProvider>
        </ThemeProvider>
      </FontScaleProvider>
    );
  });
  trees.push(tree);
  return tree;
}

const texts = (tree: TestRenderer.ReactTestRenderer): string =>
  tree.root.findAllByType('Text' as never)
    .flatMap((node) => node.children.filter((c): c is string => typeof c === 'string'))
    .join(' ');

test('a browsed day names the tithi that holds the rest of it', async () => {
  // 31 Aug 2026, Bengaluru: Tritiya till 8:51 AM, then Chaturthi — the night
  // that carries Sankashti Chaturthi.
  mockPanchang = day(17, 'Tritiya', new Date(2026, 7, 31, 8, 51));
  const out = texts(await render());
  expect(out).toContain('Tritiya');
  expect(out).toContain('till');
  expect(out).toContain('then Chaturthi — rest of day');
});

test('no handover when the tithi runs past midnight', async () => {
  // The तक line already carries tomorrow's date; the successor's day is not this one.
  mockPanchang = day(17, 'Tritiya', new Date(2026, 8, 1, 2, 4));
  expect(texts(await render())).not.toContain('then');
});

test('no handover on a kshaya day — both tithis are already stated below', async () => {
  mockPanchang = day(9, 'Dashami', new Date(2026, 7, 31, 8, 16), {
    index: 10,
    nameEn: 'Ekadashi',
    endTime: new Date(2026, 8, 1, 5, 22),
  });
  expect(texts(await render())).not.toContain('then');
});

test('a today surface drops the handover once "now" has moved onto the successor', async () => {
  // The live kicker names the successor itself there — repeating it as a
  // handover would read "Chaturthi, then Chaturthi". Anchored an hour behind the
  // real clock rather than to a literal date, so the case cannot expire: the
  // card reads `Date.now()` and the handover must be gone whenever it is run.
  mockIsToday = true;
  const anHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  mockPanchang = { ...day(17, 'Tritiya', anHourAgo), date: anHourAgo } as PanchangData;
  const out = texts(await render());
  expect(out).toContain('Chaturthi');
  expect(out).not.toContain('then Chaturthi');
});

test('the handover still renders on a today surface before the tithi ends', async () => {
  // The other half of the pair: while "now" is still inside the sunrise tithi,
  // the kicker names it AND what takes over — the line the report asked for.
  mockIsToday = true;
  const inAnHour = new Date(Date.now() + 60 * 60 * 1000);
  mockPanchang = { ...day(17, 'Tritiya', inAnHour), date: inAnHour } as PanchangData;
  expect(texts(await render())).toContain('then Chaturthi — rest of day');
});
