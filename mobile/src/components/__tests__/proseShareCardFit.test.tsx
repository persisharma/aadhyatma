import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@/theme/ThemeContext';
import ProseShareCard from '../ProseShareCard';
import { bodyHeightFor, bodyWidthFor, paginateProse, pictureCardMetrics, proseBodyHeight, proseCardMetrics } from '@/utils/shareCardPages';
import { kidsStoryArtRetainedHeight } from '@/utils/kidsStoryArtFrame';
import { getKathaContent } from '@/panchang/kathaContent';
import { kidsStoryShareable } from '@/utils/kidsStoryShare';
import { getKidsStory, kidsStories } from '@/data/kidsStories';
import type { Lang } from '@/data/gita/language';

/**
 * The prose share card (design.md §39.4) carries the §39 lesson forward: fixed sizes,
 * leading derived from size, no platform auto-fit, upright Indic, and a body box that
 * is exactly the paginator's geometry so estimate and render cannot drift.
 */

jest.mock('../BackgroundLayer', () => 'BackgroundLayer');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const MockView = require('react-native').View as typeof View;
jest.mock('../KidsStoryArt', () => ({
  __esModule: true,
  default: ({ label }: { label: string }) => <MockView testID="kids-story-art" accessibilityLabel={label} />,
}));

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

  test('a picture-story scene: 540×960 card, full-width art above the reader caption box, dialogue in its box', async () => {
    // No published story carries dialogue yet; a quote is added to a real scene page so the box renders.
    const story = kidsStories.find((s) => s.pages.some((p) => p.dialogue)) ?? getKidsStory('krishna-janma')!;
    const share = kidsStoryShareable(story);
    const pages = share.scopes.filter((s) => s.id.startsWith('part-')).flatMap((s) => s.prepared!.hi.pages);
    const base = pages.find((p) => p.illustration && p.blocks.some((b) => b.kind === 'quote')) ?? pages[0];
    const page = base.blocks.some((b) => b.kind === 'quote') ? base
      : { ...base, blocks: [...base.blocks, { kind: 'quote' as const, speaker: 'कंस', text: 'यह मेरा राज्य है।', continued: false, continues: false }] };
    expect(page.illustration).toBeDefined();
    let tree: TestRenderer.ReactTestRenderer;
    await act(async () => {
      tree = TestRenderer.create(
        <ThemeProvider>
          <ProseShareCard background={null} header={`1/${story.pages.length} · ${story.title.hi}`} page={page} pageIndex={0} pageCount={10} lang="hi" layout="picture" illustrationUri="file:///cache/art.webp" />
        </ThemeProvider>
      );
    });
    const card = StyleSheet.flatten(tree!.root.findAllByType(View)[0].props.style);
    expect(card.width).toBe(pictureCardMetrics.width);
    expect(card.height).toBe(pictureCardMetrics.height);
    expect([card.width, card.height]).toEqual([540, 960]);

    const body = tree!.root.find((n) => (n.type as unknown) === 'View' && StyleSheet.flatten(n.props.style).height === bodyHeightFor('picture'));
    const [art, caption] = body.children as TestRenderer.ReactTestInstance[];
    const box = art.findByProps({ testID: 'share-scene-art' });
    const boxStyle = StyleSheet.flatten(box.props.style);
    expect(boxStyle.height).toBe(page.illustration!.heightDp);
    expect(boxStyle.marginBottom).toBe(pictureCardMetrics.illustrationGap);
    const frame = StyleSheet.flatten(box.findAllByType(View)[1].props.style);
    const expectedWidth = Math.min(bodyWidthFor('picture'), page.illustration!.heightDp / (1.25 * kidsStoryArtRetainedHeight(page.illustration!.art)));
    expect(frame.width).toBeCloseTo(expectedWidth, 5);
    expect(page.illustration!.heightDp).toBeGreaterThanOrEqual(pictureCardMetrics.illustrationMinHeight);
    expect(tree!.root.findByProps({ testID: 'kids-story-art' }).props.accessibilityLabel).toBe(page.title);

    // The caption box, as the reader draws it: tinted, padded, title first, then narration, then the dialogue box.
    expect(caption.props.testID).toBe('share-caption');
    const captionStyle = StyleSheet.flatten(caption.props.style);
    expect(captionStyle.paddingHorizontal).toBe(pictureCardMetrics.captionPaddingHorizontal);
    expect(captionStyle.paddingVertical).toBe(pictureCardMetrics.captionPaddingVertical);
    expect(captionStyle.backgroundColor).toBeDefined();
    const titleText = caption.findAllByType(Text)[0];
    expect(titleText.props.children).toBe(page.title);
    const quote = tree!.root.findByProps({ testID: 'share-quote' });
    const quoteTexts = quote.findAllByType(Text).map((t) => t.props.children);
    const block = page.blocks.find((b) => b.kind === 'quote')!;
    expect(quoteTexts).toEqual([block.speaker, block.text]);
    expect(StyleSheet.flatten(quote.props.style).padding).toBe(pictureCardMetrics.quotePadding);
    expect(allText(tree!)).toContain(page.blocks[0].text);
  });

  test('the closing picture card prints the app link under its label', async () => {
    const story = getKidsStory('krishna-janma')!;
    const share = kidsStoryShareable(story, story.pages.length - 1);
    const scene = share.scopes[share.scopes.length - 1].prepared!.en.pages;
    const page = scene[scene.length - 1];
    const link = page.blocks[page.blocks.length - 1];
    expect(link.kind).toBe('link');
    let tree: TestRenderer.ReactTestRenderer;
    await act(async () => {
      tree = TestRenderer.create(
        <ThemeProvider>
          <ProseShareCard background={null} header="16/16 · Krishna Janma" page={page} pageIndex={scene.length - 1} pageCount={scene.length} lang="en" layout="picture" illustrationUri="file:///cache/art.webp" />
        </ThemeProvider>
      );
    });
    const row = tree!.root.findByProps({ testID: 'share-app-link' });
    const texts = row.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toEqual([link.text, 'vedansh.app/get']);
    expect(allText(tree!)).toContain('॥ इति ॥');
  });

  test('a prose-layout illustrated page keeps art, then title, then caption, in the paginator box', async () => {
    const story = getKidsStory('krishna-janma')!;
    const scene = kidsStoryShareable(story).scopes[0].prepared!.hi.pages[0];
    const page = { ...scene, illustration: { ...scene.illustration!, heightDp: 240 } };
    let tree: TestRenderer.ReactTestRenderer;
    await act(async () => {
      tree = TestRenderer.create(
        <ThemeProvider>
          <ProseShareCard background={null} header="1/16 · कृष्ण जन्म" page={page} pageIndex={0} pageCount={10} lang="hi" illustrationUri="file:///cache/art.webp" />
        </ThemeProvider>
      );
    });
    const body = tree!.root.find((n) => (n.type as unknown) === 'View' && StyleSheet.flatten(n.props.style).height === proseBodyHeight);
    const [art, caption] = body.children as TestRenderer.ReactTestInstance[];
    expect(StyleSheet.flatten(art.findByProps({ testID: 'share-scene-art' }).props.style).height).toBe(240);
    expect(caption.props.style).toBeUndefined();
    expect(caption.findAllByType(Text)[0].props.children).toBe(page.title);
  });
});
