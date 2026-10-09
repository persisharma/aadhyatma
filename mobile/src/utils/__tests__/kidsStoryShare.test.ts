import { kidsStories } from '@/data/kidsStories';
import { kidsStoryShareable } from '@/utils/shareContent';
import { MAX_SHARE_PAGES, proseBodyHeight } from '@/utils/shareCardPages';
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
      expect(cards.filter(p => !p.illustration).every(p => p.usedDp <= proseBodyHeight)).toBe(true);
      const current = share.scopes[share.scopes.length - 1].prepared![lang];
      expect(current.pages[0].illustration?.art).toBe(story.pages[story.pages.length - 1].art);
      expect(normalize(current.pages.flatMap(p => p.blocks).map(b => b.text).join(' '))).toContain(normalize(story.sourceNote[lang]));
      const caption = buildShareCaption({ sectionNameHi: '', sectionNameEn: '', verseLabelHi: '', verseLabelEn: '', firstLineHi: '', firstLineEn: '', lang,
        resolved: { sectionName: share.sectionName![lang]!, verseLabel: parts[0].header, firstLine: parts[0].firstLine } });
      expect(caption).toContain(story.title[lang]);
    });
  }
}
