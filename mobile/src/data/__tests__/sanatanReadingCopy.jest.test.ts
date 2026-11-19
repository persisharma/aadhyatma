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

it('teaches the four aims and a complete drawing sequence without inventing mandatory stroke rules', () => {
  const topic = getSanatanTopics().find(item => item.id === 'symbols')!;
  for (const term of ['धर्म', 'अर्थ', 'काम', 'मोक्ष']) expect(topic.pages[1][0]).toContain(term);
  for (const term of ['Dharma:', 'Artha:', 'Kama:', 'Moksha:']) expect(topic.pages[1][1]).toContain(term);
  expect(topic.pages[2][0]).toContain('ऊपर का सिरा दाईं ओर, दायाँ नीचे, नीचे वाला बाईं ओर और बायाँ ऊपर');
  expect(topic.pages[2][1]).toContain('top to the right, right downwards, bottom to the left, and left upwards');
  expect(topic.pages[2][1]).toContain('not the only scripturally required stroke order');
  expect(topic.pages[2][1]).toContain('A form without dots is not automatically incorrect');
  expect(topic.pages[2][1]).toContain('Do not label all reverse-facing religious forms inauspicious');
  expect(topic.refs).toEqual(expect.arrayContaining(['HAF-SWASTIKA', 'HA-SWASTIKA', 'AWGP-SWASTIKA']));
});

it('opens the thirty-three lesson with koti as "kinds, not crore" and a recorded dictionary source', () => {
  const topic = getSanatanTopics().find(item => item.id === 'thirty')!;
  const [hindi, english] = topic.pages[0].map(text => text.split(/\n\s*\n/)[0]);
  // Owner's direction, 19 Nov 2026: the meaning of koti leads; it must not wait for the last page.
  expect(hindi).toContain('‘कोटि’ का अर्थ ‘प्रकार’ या ‘श्रेणी’ है, ‘करोड़’ नहीं।');
  expect(english).toContain('koti means “kind” or “class”, not “crore”.');
  expect(getSanatanPageTitles(topic)[0]).toEqual(['कोटि यानी प्रकार, करोड़ नहीं', 'Koti means kinds, not crore']);
  // Apte lists both senses (6: crore, 9: class); the count itself is the Upanishad's.
  expect(topic.refs).toEqual(['BU-MADH', 'BU-MULLER', 'KOTI-APTE']);
  expect(content.sources['KOTI-APTE'].location).toContain('senses 6 and 9');
  // The honest limit stays in the lesson: the passage itself does not use the word.
  expect(topic.pages[2][1]).toContain('does not use the word koti');
});
