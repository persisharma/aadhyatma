import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@/theme/ThemeContext';
import ProseShareCard from '../ProseShareCard';
import { paginateProse, proseBodyHeight, proseCardMetrics } from '@/utils/shareCardPages';
import { getKathaContent } from '@/panchang/kathaContent';
import type { Lang } from '@/data/gita/language';

/**
 * The prose share card (design.md §39.4) carries the §39 lesson forward: fixed sizes,
 * leading derived from size, no platform auto-fit, upright Indic, and a body box that
 * is exactly the paginator's geometry so estimate and render cannot drift.
 */

jest.mock('../BackgroundLayer', () => 'BackgroundLayer');

const katha = getKathaContent('chhath-puja-katha')!;

async function render(lang: Lang, pageIndex = 0) {
  const section = katha.sections[0];
  const res = paginateProse({
    title: lang === 'en' ? section.titleEn : section.titleHi,
    blocks: (lang === 'en' ? section.bodyEn : section.bodyHi).map((text) => ({ kind: 'para' as const, text })),
    lang,
  });
  let tree: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <ThemeProvider>
        <ProseShareCard
          background={null}
          header="व्रत कथा · छठ पूजा कथा"
          page={res.pages[pageIndex]}
          pageIndex={pageIndex}
          pageCount={res.pages.length}
          lang={lang}
        />
      </ThemeProvider>
    );
  });
  return { tree: tree!, pages: res.pages };
}

const texts = (tree: TestRenderer.ReactTestRenderer) => tree.root.findAllByType(Text);
const allText = (tree: TestRenderer.ReactTestRenderer) =>
  texts(tree)
    .map((t) => [t.props.children].flat().join(''))
    .join(' | ');

describe('ProseShareCard', () => {
  test('renders at the 540×675 export geometry', async () => {
    const { tree } = await render('hi');
    const card = tree.root.findAllByType(View)[0];
    const style = StyleSheet.flatten(card.props.style);
    expect(style.width).toBe(proseCardMetrics.width);
    expect(style.height).toBe(proseCardMetrics.height);
  });

  test('the body box is exactly the paginator geometry', async () => {
    const { tree } = await render('hi');
    const boxes = tree.root
      .findAllByType(View)
      .filter((v) => StyleSheet.flatten(v.props.style)?.height === proseBodyHeight);
    expect(boxes.length).toBe(1);
  });

  test('no auto-fit, nothing under 12 pt of reading text, leading 1.4–1.7×', async () => {
    for (const lang of ['hi', 'en', 'gu', 'kn'] as Lang[]) {
      const { tree } = await render(lang);
      for (const t of texts(tree)) {
        expect(t.props.adjustsFontSizeToFit).toBeUndefined();
        expect(t.props.minimumFontScale).toBeUndefined();
        const s = StyleSheet.flatten(t.props.style);
        if (s.lineHeight) {
          expect(s.fontSize).toBeGreaterThanOrEqual(12);
          const ratio = s.lineHeight / s.fontSize;
          expect(ratio).toBeGreaterThanOrEqual(1.4);
          expect(ratio).toBeLessThanOrEqual(1.7);
        }
        // Upright Indic: a synthesised italic blurs the matras (§39). The footer's English
        // tagline is Latin in every language and keeps its true Cormorant italic.
        const str = [t.props.children].flat().join('');
        if (/[\u0900-\u0DFF]/.test(str)) expect(s.fontStyle).not.toBe('italic');
      }
    }
  });

  test('a series shows the page index and a continuation cue; the last page ends ॥ इति ॥', async () => {
    const first = await render('hi', 0);
    expect(first.pages.length).toBeGreaterThan(1);
    const all = allText(first.tree);
    expect(all).toContain(`1 / ${first.pages.length}`);
    expect(all).toContain('आगे पढ़ें →');
    const last = await render('hi', first.pages.length - 1);
    expect(allText(last.tree)).toContain('॥ इति ॥');
  });

  test('a continued paragraph opens with an ellipsis', async () => {
    const { pages } = await render('hi', 0);
    const idx = pages.findIndex((p) => p.blocks[0]?.continued);
    if (idx < 0) return; // this section happened to break between paragraphs
    const { tree } = await render('hi', idx);
    const body = texts(tree).map((t) => t.props.children);
    expect(body.some((c) => typeof c === 'string' && c.startsWith('…'))).toBe(true);
  });

  test('page 1 carries the title; later pages do not', async () => {
    const one = await render('en', 0);
    const all1 = texts(one.tree).map((t) => t.props.children);
    expect(all1).toContain(katha.sections[0].titleEn);
    const two = await render('en', 1);
    expect(texts(two.tree).map((t) => t.props.children)).not.toContain(katha.sections[0].titleEn);
  });
});
