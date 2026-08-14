import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { StyleSheet, Text, View as mockView, type TextStyle } from 'react-native';

import { calculateNamkaran } from '@/panchang/namkaran';
import { buildNamkaranShareModel } from '@/panchang/namkaranShare';
import type { Lang } from '@/data/gita/language';
import NamaksharCard from '../NamaksharCard';
import NamkaranShareCard from '../NamkaranShareCard';

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    mockReact.createElement(mockView, props, children),
}));

/**
 * Guards the August 2026 report on the Namkaran answer screen: the hero syllable
 * `के` came out with its e-matra sliced off, and the `॥ नामाक्षर` eyebrow rendered
 * with each cluster prised apart. Both are design.md §3.0 failures —
 *
 *  1. A fixed `lineHeight` under the natural Devanagari line box (58/78 on the
 *     card, 54/70 on the share card) sits the baseline too low and crops
 *     everything above the shirorekha. A fixed leading also cannot follow
 *     `maxFontSizeMultiplier`, so it clips again at the largest type step.
 *  2. Latin tracking + an Inter face on a label that carries Indic text. Inter
 *     has no Indic glyphs (silent OS fallback) and the tracking breaks the
 *     connecting shirorekha, so such labels must route through `pillTextStyle`.
 */

const LANGS: Lang[] = ['hi', 'en', 'gu', 'kn'];

// Punarvasu pada 1 → के, the reported case: an above-shirorekha matra.
const exact = calculateNamkaran({ kind: 'manual', nakshatraIndex: 6, pada: 1 });
if (exact.kind !== 'exact') throw new Error('manual basis must resolve to one exact charana');
const candidate = exact.candidate;

function textNodes(node: React.ReactElement) {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(node);
  });
  return tree.root.findAllByType(Text).map((n) => ({
    text: [n.props.children].flat(Infinity).filter((part) => typeof part === 'string').join(''),
    style: (StyleSheet.flatten(n.props.style) ?? {}) as TextStyle,
  }));
}

function cards(lang: Lang) {
  return [
    <NamaksharCard key="hero" candidate={candidate} lang={lang} />,
    <NamkaranShareCard
      key="share"
      width={334}
      lang={lang}
      model={buildNamkaranShareModel(candidate, [])}
    />,
  ];
}

// Devanagari, Gujarati, and Kannada blocks — the three scripts these surfaces can
// render. The dandas U+0964/U+0965 are deliberately excluded: `॥ NAMAKSHAR` is an
// English label wearing a danda as an ornament, and it keeps the Latin face and
// tracking. Devanagari digits stay in, since they do need the script face.
const INDIC = /[ऀ-ॣ०-ॿ઀-૿ಀ-೿]/;

describe('Namkaran hero and share card typography', () => {
  test.each(LANGS)('no pinned leading can crop its own matras (%s)', (lang) => {
    for (const card of cards(lang)) {
      const pinned = textNodes(card).filter(
        ({ style }) => typeof style.lineHeight === 'number' && typeof style.fontSize === 'number'
      );
      expect(pinned.length).toBeGreaterThan(0);
      // Collected rather than asserted per node, so a failure names the line.
      const tight = pinned
        .filter(({ style }) => style.lineHeight! / style.fontSize! < 1.35)
        .map(({ text, style }) => `${text} (${style.fontSize}/${style.lineHeight})`);
      expect(tight).toEqual([]);
    }
  });

  // The 54–58 pt syllable is the one line that must scale with the user's type
  // setting, so it carries no fixed leading at all — a pinned box cannot grow
  // with `maxFontSizeMultiplier` and would clip at the top step.
  test.each(LANGS)('the hero syllable pins no leading (%s)', (lang) => {
    for (const card of cards(lang)) {
      const heroes = textNodes(card).filter(({ style }) => (style.fontSize ?? 0) >= 40);
      expect(heroes.length).toBe(1);
      expect(heroes[0].style.lineHeight).toBeUndefined();
    }
  });

  test.each(LANGS)('no Indic line carries Latin tracking or an Inter face (%s)', (lang) => {
    for (const card of cards(lang)) {
      const indic = textNodes(card).filter(({ text }) => INDIC.test(text));
      expect(indic.length).toBeGreaterThan(0);
      const tracked = indic.filter(({ style }) => (style.letterSpacing ?? 0) !== 0).map(({ text }) => text);
      const latinFaced = indic.filter(({ style }) => /^Inter/.test(style.fontFamily ?? '')).map(({ text }) => text);
      expect({ tracked, latinFaced }).toEqual({ tracked: [], latinFaced: [] });
    }
  });
});
