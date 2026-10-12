import { kidsStories } from '@/data/kidsStories';
import { kidsStoryShareable } from '@/utils/shareContent';
import { SMART_LINK, buildShareCaption } from '@/data/shareLinks';
import { kidsStoryArtRetainedHeight } from '@/utils/kidsStoryArtFrame';
import { MAX_SHARE_PAGES, bodyHeightFor, bodyWidthFor, paginateProse, pictureCardMetrics, proseType } from '@/utils/shareCardPages';

/**
 * The kids-story share (design.md §76): one 9:16 picture card per scene — the complete
 * art at the body's full width when the caption allows, the reader's caption box below —
 * then a closing card with the cover, takeaway, source note and the app link. Nothing
 * authored is dropped and every card fits its body.
 */

const normalize = (s: string) => s.replace(/\s+/g, ' ').trim();
const fullWidthHeight = (art: string) => bodyWidthFor('picture') * 1.25 * kidsStoryArtRetainedHeight(art);

for (const story of kidsStories) {
  for (const lang of ['hi', 'en', 'gu', 'kn'] as const) {
    test(`${story.id}/${lang}: every scene, full narration, dialogue, takeaway and provenance survives ordered parts`, () => {
      const share = kidsStoryShareable(story, story.pages.length - 1);
      expect(share.layout).toBe('picture');
      const parts = share.scopes.filter(s => s.id.startsWith('part-')).map(s => s.prepared![lang]);
      expect(parts.every(p => p.pages.length > 0 && p.pages.length <= MAX_SHARE_PAGES)).toBe(true);
      const cards = parts.flatMap(p => p.pages);
      expect(cards.flatMap(p => p.illustration ? [p.illustration.art] : [])).toEqual([...story.pages.map(p => p.art), story.coverArt]);
      const narration = cards.flatMap(p => p.blocks).flatMap(b => b.kind === 'link' ? [] : [b.speaker ? `${b.speaker}: ${b.text}` : b.text]).join(' ');
      const expected = [...story.pages.flatMap(p => [p.text[lang], ...(p.dialogue ? [`${p.dialogue.speaker[lang]}: ${p.dialogue.text[lang]}`] : [])]), story.takeaway[lang], story.sourceNote[lang]].join(' ');
      expect(normalize(narration)).toBe(normalize(expected));
      // Dialogue keeps its speaker as a quote block, drawn in the reader's tinted box.
      expect(cards.flatMap(p => p.blocks).filter(b => b.kind === 'quote' && b.speaker).length).toBe(story.pages.filter(p => p.dialogue).length);

      // One card per scene: art above the title and caption, inside one body with a line of slack.
      const budget = bodyHeightFor('picture') - proseType[lang === 'en' ? 'latin' : 'indic'].body.lineHeight;
      expect(cards.every(p => p.usedDp <= budget)).toBe(true);
      const scenes = cards.filter(p => p.illustration);
      expect(scenes).toHaveLength(story.pages.length + 1);
      expect(scenes.every(p => p.title && p.blocks.length > 0)).toBe(true);
      expect(scenes.every(p => p.illustration!.heightDp + pictureCardMetrics.illustrationGap + p.usedDp <= budget)).toBe(true);
      expect(scenes.every(p => p.illustration!.heightDp <= fullWidthHeight(p.illustration!.art) + 0.001)).toBe(true);
      expect(scenes.slice(0, -1).every(p => p.illustration!.heightDp >= pictureCardMetrics.illustrationMinHeight)).toBe(true);
      // No published caption spills: every card in the series carries its own scene or the cover.
      expect(cards.filter(p => !p.illustration)).toHaveLength(0);
      // Art fills the body the caption leaves: either the full width or everything left over.
      expect(scenes.every(p => {
        const h = p.illustration!.heightDp;
        return Math.abs(h - fullWidthHeight(p.illustration!.art)) < 0.001 || Math.abs(h - (budget - pictureCardMetrics.illustrationGap - p.usedDp)) < 0.001;
      })).toBe(true);

      // The closing card: cover, takeaway, source note, then the app link (printed; the message carries it too).
      const last = cards[cards.length - 1];
      expect(last.illustration?.art).toBe(story.coverArt);
      expect(last.illustration!.heightDp).toBeGreaterThanOrEqual(pictureCardMetrics.coverMinHeight);
      expect(last.blocks[last.blocks.length - 1]).toMatchObject({ kind: 'link', url: SMART_LINK });
      expect(normalize(last.blocks.map(b => b.text).join(' '))).toContain(normalize(story.sourceNote[lang]));

      const current = share.scopes[share.scopes.length - 1].prepared![lang];
      expect(current.pages[0].illustration?.art).toBe(story.pages[story.pages.length - 1].art);
      expect(current.pages[current.pages.length - 1].blocks.some(b => b.kind === 'link')).toBe(true);
      const caption = buildShareCaption({ sectionNameHi: '', sectionNameEn: '', verseLabelHi: '', verseLabelEn: '', firstLineHi: '', firstLineEn: '', lang,
        resolved: { sectionName: share.sectionName![lang]!, verseLabel: parts[0].header, firstLine: parts[0].firstLine } });
      expect(caption).toContain(story.title[lang]);
      expect(caption).toContain(SMART_LINK);
    });
  }
}

test('a caption longer than the picture card continues on a plain card rather than shrinking the scene', () => {
  const reserved = pictureCardMetrics.illustrationMinHeight + pictureCardMetrics.illustrationGap;
  const long = paginateProse({ title: 'A long scene', lang: 'en', layout: 'picture', firstPageReservedDp: reserved, blocks: [{ kind: 'para', text: Array.from({ length: 16 }, (_, i) => `Sentence number ${i + 1} of a caption that runs well past one picture card.`).join(' ') }] });
  expect(long.pages.length).toBeGreaterThan(1);
  expect(long.pages[0].usedDp).toBeLessThanOrEqual(long.budgetDp - reserved);
  expect(long.pages[1].usedDp).toBeGreaterThan(0);
});
