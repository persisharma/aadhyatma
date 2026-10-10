import { kidsStories } from '@/data/kidsStories';
import { kidsStoryShareable } from '@/utils/shareContent';
import { MAX_SHARE_PAGES, paginateProse, proseBodyHeight, proseCardMetrics, proseType } from '@/utils/shareCardPages';
import { buildShareCaption } from '@/data/shareLinks';

const normalize = (s: string) => s.replace(/\s+/g, ' ').trim();
for (const story of kidsStories) {
  for (const lang of ['hi', 'en', 'gu', 'kn'] as const) {
    test(`${story.id}/${lang}: every scene, full narration, dialogue, takeaway and provenance survives ordered parts`, () => {
      const share = kidsStoryShareable(story, story.pages.length - 1);
      const parts = share.scopes.filter(s => s.id.startsWith('part-')).map(s => s.prepared![lang]);
      expect(parts.every(p => p.pages.length > 0 && p.pages.length <= MAX_SHARE_PAGES)).toBe(true);
      const cards = parts.flatMap(p => p.pages);
      expect(cards.flatMap(p => p.illustration ? [p.illustration.art] : [])).toEqual(story.pages.map(p => p.art));
      const narration = cards.flatMap(p => p.blocks).map(b => b.text).join(' ');
      const expected = [...story.pages.flatMap(p => [p.text[lang], ...(p.dialogue ? [`${p.dialogue.speaker[lang]}: ${p.dialogue.text[lang]}`] : [])]), story.takeaway[lang], story.sourceNote[lang]].join(' ');
      expect(normalize(narration)).toBe(normalize(expected));
      // One card per scene: the art sits above the title and caption, inside one body with a line of slack.
      const budget = proseBodyHeight - proseType[lang === 'en' ? 'latin' : 'indic'].body.lineHeight;
      expect(cards.every(p => p.usedDp <= budget)).toBe(true);
      const scenes = cards.filter(p => p.illustration);
      expect(scenes.every(p => p.title && p.blocks.length > 0)).toBe(true);
      expect(scenes.every(p => p.illustration!.heightDp >= proseCardMetrics.illustrationMinHeight)).toBe(true);
      expect(scenes.every(p => p.illustration!.heightDp + proseCardMetrics.illustrationGap + p.usedDp <= budget)).toBe(true);
      expect(cards.filter(p => p.title).length).toBe(story.pages.length + 1);
      const current = share.scopes[share.scopes.length - 1].prepared![lang];
      expect(current.pages[0].illustration?.art).toBe(story.pages[story.pages.length - 1].art);
      expect(normalize(current.pages.flatMap(p => p.blocks).map(b => b.text).join(' '))).toContain(normalize(story.sourceNote[lang]));
      const caption = buildShareCaption({ sectionNameHi: '', sectionNameEn: '', verseLabelHi: '', verseLabelEn: '', firstLineHi: '', firstLineEn: '', lang,
        resolved: { sectionName: share.sectionName![lang]!, verseLabel: parts[0].header, firstLine: parts[0].firstLine } });
      expect(caption).toContain(story.title[lang]);
    });
  }
}

test('every published caption shares its scene card in every language; a longer one would continue on a plain card', () => {
  for (const story of kidsStories) {
    const share = kidsStoryShareable(story);
    for (const lang of ['hi', 'en', 'gu', 'kn'] as const) {
      const cards = share.scopes.filter(s => s.id.startsWith('part-')).flatMap(s => s.prepared![lang].pages);
      expect(cards.filter(p => !p.illustration && p.title === null)).toHaveLength(0);
    }
  }
  const reserved = proseCardMetrics.illustrationMinHeight + proseCardMetrics.illustrationGap;
  const long = paginateProse({ title: 'A long scene', lang: 'en', firstPageReservedDp: reserved, blocks: [{ kind: 'para', text: Array.from({ length: 12 }, (_, i) => `Sentence number ${i + 1} of a caption that runs well past one picture card.`).join(' ') }] });
  expect(long.pages.length).toBeGreaterThan(1);
  expect(long.pages[0].usedDp).toBeLessThanOrEqual(long.budgetDp - reserved);
});
