import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { StyleSheet, Text, View as mockView, type TextStyle } from 'react-native';

import { computeKundali, computeRashifal } from '@/panchang/kundali';
import { getCityById } from '@/panchang/locations';
import JyotishShareCard, { kundaliChartSize } from '../JyotishShareCard';
import type { Lang } from '@/data/gita/language';

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    mockReact.createElement(mockView, props, children),
}));

/**
 * Guard for the August 2026 report that the Kundali share card's bottom method
 * line was trimmed. Two independent causes, one per describe block:
 *
 *  1. `lineHeight === fontSize` on the 10 pt micro lines. Devanagari matras clip
 *     below ~1.4× leading (design.md §3.0), so the top of the line is sliced off —
 *     the header read "जन्म कुंडला" for कुंडली and the footer lost its shirorekha.
 *  2. A chart sized as a fraction of card *width* inside a card whose height is
 *     pinned at 4:5. The surrounding chrome is fixed-size type, so on any card
 *     narrower than ~334 dp the stack overran the box and the footer was pushed
 *     out through the card's `overflow: 'hidden'`.
 */

const city = getCityById('bengaluru')!;

const chart = computeKundali({
  date: new Date('2024-12-10T19:20:00.000Z'), // 11 Dec 2024, 12:50 AM IST
  latitude: city.latitude,
  longitude: city.longitude,
  elevation: city.elevation,
  timezone: 'Asia/Kolkata',
});

const profile = { name: 'Devanshi', date: '2024-12-11', time: '00:50', cityId: city.id };

const LANGS: Lang[] = ['hi', 'en', 'gu', 'kn'];

function pinnedLeadings(node: React.ReactElement) {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(node);
  });
  return tree.root
    .findAllByType(Text)
    .map((n) => StyleSheet.flatten(n.props.style) as TextStyle)
    .filter((style) => typeof style?.lineHeight === 'number' && typeof style?.fontSize === 'number');
}

describe('Jyotish share card leading', () => {
  // Every pinned leading, not just the footer's: the same 10/10 pair shipped three
  // times in this file, so pin the ratio for the whole card rather than one line.
  test.each(LANGS)('no line clips its own matras (%s)', (lang) => {
    const cards = [
      <JyotishShareCard
        key="kundali"
        kind="kundali"
        width={334}
        lang={lang}
        chart={chart}
        profile={profile}
        city={city}
      />,
      <JyotishShareCard
        key="rashifal"
        kind="rashifal"
        width={334}
        lang={lang}
        guidance={computeRashifal(new Date('2026-08-05T04:00:00.000Z'), 5)}
        rashiIndex={5}
        practiceHi="सूर्य नमस्कार"
        practiceEn="Surya Namaskar"
        date={new Date('2026-08-05T04:00:00.000Z')}
      />,
    ];

    for (const card of cards) {
      const leadings = pinnedLeadings(card);
      expect(leadings.length).toBeGreaterThan(0);
      for (const style of leadings) {
        expect(style.lineHeight! / style.fontSize!).toBeGreaterThanOrEqual(1.35);
      }
    }
  });
});

describe('Kundali share card chart budget', () => {
  // cardWidth is `min(334, screenWidth - 48)`: 334 on a 393 dp phone, 312 on a
  // 360 dp Android, 272 on a 320 dp screen.
  const CHROME = 196;
  const widths = [272, 288, 300, 312, 327, 334];

  test.each(widths)('chart leaves the method footer its height at width %d', (width) => {
    const contentHeight = width * 1.25 - width * 0.051 * 2;
    expect(kundaliChartSize(width)).toBeLessThanOrEqual(contentHeight - CHROME);
  });

  test('never grows past the original chart size on a wide card', () => {
    expect(kundaliChartSize(334)).toBeLessThanOrEqual(Math.min(208, 334 * 0.61));
    expect(kundaliChartSize(600)).toBeLessThanOrEqual(208);
  });

  test('stays a legible diagram, not a thumbnail', () => {
    for (const width of widths) {
      expect(kundaliChartSize(width)).toBeGreaterThan(width * 0.4);
    }
  });

  test('is what the rendered chart actually uses', () => {
    let tree!: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(
        <JyotishShareCard
          kind="kundali"
          width={312}
          lang="hi"
          chart={chart}
          profile={profile}
          city={city}
        />
      );
    });
    const diagram = tree.root.findByProps({ testID: 'north-indian-chart' });
    const style = StyleSheet.flatten(diagram.props.style) as { width?: number };
    expect(style.width).toBe(kundaliChartSize(312));
  });
});
