/**
 * Guards for the Instagram hashtag block (design.md §39, `data/shareHashtags.ts`).
 *
 * The point of the feature is that the tags follow the verse, so these pin the
 * three things that would silently break that: the tags actually change with the
 * title/chapter/deity, the ordering stays specific → broad (the reach strategy),
 * and nothing Instagram would reject or truncate escapes the builder.
 */

import {
  MAX_HASHTAGS,
  STORY_MAX_HASHTAGS,
  buildVerseHashtags,
  chapterFromVerseLabel,
  formatHashtags,
  latinTag,
  nativeScriptTag,
} from '@/data/shareHashtags';
import { buildInstagramCaption } from '@/data/shareLinks';

const gita = {
  sourceId: 'bhagavad-gita',
  sectionNameHi: 'भगवद् गीता',
  sectionNameEn: 'Bhagavad Gītā',
  verseLabelEn: 'Verse 2.47',
} as const;

const chalisa = {
  sourceId: 'hanuman-chalisa',
  sectionNameHi: 'हनुमान चालीसा',
  sectionNameEn: 'Hanuman Chalisa',
  verseLabelEn: 'Verse 12',
} as const;

describe('slug helpers', () => {
  test('latinTag folds IAST diacritics and joins words in PascalCase', () => {
    expect(latinTag('Bhagavad Gītā')).toBe('BhagavadGita');
    expect(latinTag('Śiva Stotram')).toBe('SivaStotram');
    expect(latinTag('Rāma Rakṣā Stotra')).toBe('RamaRaksaStotra');
  });

  test('nativeScriptTag keeps matras and drops spaces + dandas', () => {
    expect(nativeScriptTag('हनुमान चालीसा')).toBe('हनुमानचालीसा');
    expect(nativeScriptTag('श्री राम ॥')).toBe('श्रीराम');
  });

  test('chapterFromVerseLabel reads the chapter out of a dotted label only', () => {
    expect(chapterFromVerseLabel('Verse 2.47')).toBe(2);
    expect(chapterFromVerseLabel('Verse 18.66')).toBe(18);
    expect(chapterFromVerseLabel('Verse 12')).toBeNull();
    expect(chapterFromVerseLabel('Doha 3')).toBeNull();
  });
});

describe('buildVerseHashtags', () => {
  test('leads with the verse-specific tags, ends with the broad + brand ones', () => {
    const tags = buildVerseHashtags({ ...gita, lang: 'en' });
    expect(tags[0]).toBe('GitaChapter2');
    expect(tags).toContain('BhagavadGita');
    // Broad/brand tags exist but sit behind every derived tag.
    expect(tags.indexOf('Bhakti')).toBeGreaterThan(tags.indexOf('BhagavadGita'));
    expect(tags.indexOf('Vedansh')).toBeGreaterThan(tags.indexOf('Bhakti'));
  });

  test('the chapter tag tracks the verse being shared', () => {
    const two = buildVerseHashtags({ ...gita, lang: 'en' });
    const twelve = buildVerseHashtags({ ...gita, verseLabelEn: 'Verse 12.6', lang: 'en' });
    expect(two).toContain('GitaChapter2');
    expect(twelve).toContain('GitaChapter12');
    expect(twelve).not.toContain('GitaChapter2');
  });

  test('deity + category tags come from the registry entry, not the title', () => {
    const tags = buildVerseHashtags({ ...chalisa, lang: 'en' });
    expect(tags).toContain('JaiHanuman'); // deities: ['hanuman', 'rama']
    expect(tags).toContain('JaiShriRam');
    expect(tags).toContain('Chalisa'); // category: 'chalisa'
    expect(buildVerseHashtags({ ...gita, lang: 'en' })).toContain('Krishna');
  });

  test('a section narrower than the text keeps its own tag', () => {
    const tags = buildVerseHashtags({
      sourceId: 'shiva-strotam',
      sectionNameHi: 'शिव तांडव स्तोत्र',
      sectionNameEn: 'Shiva Tandava Stotram',
      verseLabelEn: 'Verse 3',
      lang: 'en',
    });
    expect(tags[0]).toBe('ShivaTandavaStotram');
    expect(tags).toContain('ShivaStotram');
  });

  test('the reading language selects a native-script title tag', () => {
    expect(buildVerseHashtags({ ...chalisa, lang: 'hi' })).toContain('हनुमानचालीसा');
    expect(buildVerseHashtags({ ...chalisa, lang: 'en' })).not.toContain('हनुमानचालीसा');
    // gu/kn re-script the Devanagari title, like every other content string.
    const gu = buildVerseHashtags({ ...chalisa, lang: 'gu' });
    expect(gu.some((t) => /[઀-૿]/.test(t))).toBe(true);
    const kn = buildVerseHashtags({ ...chalisa, lang: 'kn' });
    expect(kn.some((t) => /[ಀ-೿]/.test(t))).toBe(true);
  });

  test('output is deduped, capped, and free of anything Instagram rejects', () => {
    for (const lang of ['hi', 'en', 'gu', 'kn'] as const) {
      const tags = buildVerseHashtags({ ...gita, lang });
      expect(tags.length).toBeLessThanOrEqual(MAX_HASHTAGS);
      expect(tags.length).toBeGreaterThanOrEqual(10);
      const lowered = tags.map((t) => t.toLowerCase());
      expect(new Set(lowered).size).toBe(tags.length);
      for (const tag of tags) {
        expect(tag).not.toMatch(/[\s#.,;:!?'"()/\\—–।॥·@]/);
        expect(tag.length).toBeLessThanOrEqual(40);
        expect(/\p{L}/u.test(tag)).toBe(true);
      }
    }
  });

  test('the story cap trims the broad tail, keeping the specific tags', () => {
    const post = buildVerseHashtags({ ...gita, lang: 'en' });
    const story = buildVerseHashtags({ ...gita, lang: 'en', limit: STORY_MAX_HASHTAGS });
    expect(story.length).toBe(STORY_MAX_HASHTAGS);
    // Prefix, so the preview shown in the picker stays truthful for both formats.
    expect(story).toEqual(post.slice(0, STORY_MAX_HASHTAGS));
    expect(story).toContain('GitaChapter2');
    expect(story).toContain('BhagavadGita');
  });

  test('the cap can never exceed the Instagram maximum', () => {
    expect(buildVerseHashtags({ ...gita, lang: 'en', limit: 500 }).length).toBeLessThanOrEqual(
      MAX_HASHTAGS
    );
    expect(buildVerseHashtags({ ...gita, lang: 'en', limit: 0 })).toEqual([]);
  });

  describe('timely tags', () => {
    const hanumanJayanti = {
      nameHi: 'हनुमान जयंती',
      nameEn: 'Hanuman Jayanti',
      deityEn: 'Hanuman',
    };
    const navratri = { nameHi: 'नवरात्रि', nameEn: 'Navratri', deityEn: 'Durga' };

    test("the day's festival leads the block when it is the text's own deity", () => {
      const tags = buildVerseHashtags({
        ...chalisa,
        lang: 'en',
        timely: { occasions: [hanumanJayanti], year: 2026 },
      });
      expect(tags[0]).toBe('HanumanJayanti');
      expect(tags[1]).toBe('HanumanJayanti2026');
    });

    test('an unrelated festival is dropped, not bolted on', () => {
      const tags = buildVerseHashtags({
        ...chalisa,
        lang: 'en',
        timely: { occasions: [navratri], year: 2026 },
      });
      expect(tags).not.toContain('Navratri');
      expect(tags).not.toContain('Navratri2026');
      // …and the same festival on a Durga text does attach.
      const durga = buildVerseHashtags({
        sourceId: 'durga-chalisa',
        sectionNameHi: 'दुर्गा चालीसा',
        sectionNameEn: 'Durga Chalisa',
        verseLabelEn: 'Verse 4',
        lang: 'en',
        timely: { occasions: [navratri], year: 2026 },
      });
      expect(durga).toContain('Navratri');
    });

    test('hi adds the festival in Devanagari; en does not', () => {
      const hi = buildVerseHashtags({
        ...chalisa,
        lang: 'hi',
        timely: { occasions: [hanumanJayanti], year: 2026 },
      });
      expect(hi).toContain('हनुमानजयंती');
      const en = buildVerseHashtags({
        ...chalisa,
        lang: 'en',
        timely: { occasions: [hanumanJayanti], year: 2026 },
      });
      expect(en).not.toContain('हनुमानजयंती');
    });

    test('the vaar tag needs the day AND the deity to match the text', () => {
      // Tuesday (2) is Hanuman's vaar.
      const tuesday = buildVerseHashtags({
        ...chalisa,
        lang: 'en',
        timely: { weekday: 2, weekdayDeity: 'hanuman' },
      });
      expect(tuesday).toContain('Mangalwar');
      // Same text on Wednesday (Ganesha's vaar) gets nothing.
      const wednesday = buildVerseHashtags({
        ...chalisa,
        lang: 'en',
        timely: { weekday: 3, weekdayDeity: 'ganesha' },
      });
      expect(wednesday).not.toContain('Budhwar');
    });

    test('no timely context leaves the block exactly as it was', () => {
      expect(buildVerseHashtags({ ...chalisa, lang: 'en', timely: {} })).toEqual(
        buildVerseHashtags({ ...chalisa, lang: 'en' })
      );
    });

    test('at most two occasions contribute, and the cap still holds', () => {
      const many = Array.from({ length: 6 }, (_, i) => ({
        nameHi: `हनुमान पर्व ${i}`,
        nameEn: `Hanuman Parv ${i}`,
        deityEn: 'Hanuman',
      }));
      const tags = buildVerseHashtags({
        ...chalisa,
        lang: 'en',
        timely: { occasions: many, year: 2026 },
      });
      expect(tags.filter((t) => t.startsWith('HanumanParv')).length).toBe(4); // 2 × (tag + year)
      expect(tags.length).toBeLessThanOrEqual(MAX_HASHTAGS);
    });
  });

  test('is deterministic — a re-share reuses the same indexed tags', () => {
    expect(buildVerseHashtags({ ...gita, lang: 'hi' })).toEqual(
      buildVerseHashtags({ ...gita, lang: 'hi' })
    );
  });

  test('an unknown sourceId still produces a usable block', () => {
    const tags = buildVerseHashtags({
      sourceId: 'not-in-the-registry',
      sectionNameHi: 'कोई पाठ',
      sectionNameEn: 'Some Text',
      verseLabelEn: 'Verse 1',
      lang: 'en',
    });
    expect(tags).toContain('SomeText');
    expect(tags).toContain('Bhakti');
    expect(tags).toContain('Vedansh');
  });
});

describe('buildInstagramCaption', () => {
  const params = {
    sourceId: 'bhagavad-gita',
    sectionNameHi: 'भगवद् गीता',
    sectionNameEn: 'Bhagavad Gītā',
    verseLabelHi: 'श्लोक 2.47',
    verseLabelEn: 'Verse 2.47',
    firstLineHi: 'कर्मण्येवाधिकारस्ते',
    firstLineEn: 'karmaṇy-evādhikāras te',
  } as const;

  test('keeps the verse caption, adds the handle and the hashtag block', () => {
    const caption = buildInstagramCaption({ ...params, lang: 'en' });
    const lines = caption.split('\n');
    expect(lines[0]).toContain('Bhagavad Gītā · Verse 2.47');
    expect(caption).toContain('@vedansh.app');
    // Hashtags are the last line, behind a blank line so the collapsed preview
    // shows the verse rather than the tags.
    expect(lines[lines.length - 2]).toBe('');
    expect(lines[lines.length - 1]).toBe(
      formatHashtags(buildVerseHashtags({ ...params, lang: 'en' }))
    );
  });

  test('a story caption carries the trimmed block, a post the full one', () => {
    const post = buildInstagramCaption({ ...params, lang: 'en' });
    const story = buildInstagramCaption({ ...params, lang: 'en', format: 'story' });
    const count = (c: string) => (c.match(/#/g) ?? []).length;
    expect(count(story)).toBe(STORY_MAX_HASHTAGS);
    expect(count(post)).toBeGreaterThan(STORY_MAX_HASHTAGS);
    expect(story).toContain('#GitaChapter2');
  });

  test('the tag block changes when the verse changes', () => {
    const a = buildInstagramCaption({ ...params, lang: 'en' });
    const b = buildInstagramCaption({
      ...params,
      verseLabelHi: 'श्लोक 18.66',
      verseLabelEn: 'Verse 18.66',
      lang: 'en',
    });
    expect(a).toContain('#GitaChapter2');
    expect(b).toContain('#GitaChapter18');
  });
});
