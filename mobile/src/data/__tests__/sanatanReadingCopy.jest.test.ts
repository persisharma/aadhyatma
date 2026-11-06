import content from '../sanatan-parichay/content.json';
import {getSanatanPageTitles, getSanatanTopics} from '../sanatan-parichay';

// These are known leaked authoring instructions, not a word-count quality score.
// Editorial/factual acceptance is a separate gate (RULEBOOK §11.18).
const editorialScaffolding = /(?:\b(?:todo|tbd|lorem ipsum|placeholder)\b|explain the plant|needs its own specific source|illustration is an artistic presentation created|use (?:a|the) (?:banner|icon)|add (?:an? )?(?:image|source link)|मूल पाठ यहाँ जोड़ें|यहाँ चित्र जोड़ें|स्रोत जोड़ना है)/i;

describe('Sanatan reader copy acceptance boundary', () => {
  it('catches the prototype instructions which previously reached the reader', () => {
    for (const leaked of [
      'Explain the plant through leaves, beads and marriage.',
      'A mapping to a graha needs its own specific source.',
      'This illustration is an artistic presentation created for the prototype.',
      'मूल पाठ यहाँ जोड़ें',
    ]) expect(leaked).toMatch(editorialScaffolding);
  });

  it.each(content.topics.map(topic => [topic.id, topic] as const))(
    '%s has subject-specific, source-linked reading pages without authoring notes',
    (_id, topic) => {
      expect(topic.reviewStatus).toBe('source-checked-candidate');
      expect(topic.pageTitles).toHaveLength(topic.pages.length);
      expect(new Set(topic.pageTitles.map(title => title[1])).size).toBe(topic.pages.length);
      for (const title of topic.pageTitles) {
        expect(title.every(part => part.trim().length > 0)).toBe(true);
        expect(title[1]).not.toMatch(/^(Introduction|Explore visually|Context & variations)$/);
      }
      for (const page of topic.pages) for (const text of page) {
        expect(text).not.toMatch(editorialScaffolding);
        expect(text).not.toMatch(/https?:\/\//i);
        const paragraphs = text.split(/\n\s*\n/);
        expect(paragraphs.length).toBeGreaterThan(1);
        expect(paragraphs.every(paragraph => /[।.!?][”"')\]]?$/.test(paragraph.trim()))).toBe(true);
      }
      for (const ref of topic.refs) expect(content.sources).toHaveProperty(ref);
    },
  );

  it('exposes subject headings to the actual reader without changing stable page IDs', () => {
    expect(getSanatanTopics().map(topic => topic.id)).toEqual([
      'basics', 'deity', 'thirty', 'dikpal', 'graha', 'symbols', 'forms',
      'plants', 'elements', 'time', 'texts', 'temples', 'rishis',
    ]);
    for (const topic of getSanatanTopics()) expect(getSanatanPageTitles(topic)).toEqual(topic.pageTitles);
    expect(content.source.approvalScope).toContain('requires separate acceptance');
  });
});
