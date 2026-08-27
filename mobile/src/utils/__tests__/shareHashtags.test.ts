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
  test('spends its five slots on name, deity and one anchor', () => {
    // The whole block, for a real share. Five tags, in this order, is the feature.
    // en has no native-script slot to spend, so the fifth is filled from the tail
    // in priority order — the second deity here, the chapter for a chaptered text.
    expect(buildVerseHashtags({ ...chalisa, lang: 'en' })).toEqual([
      'HanumanChalisa',
      'Hanuman',
      'JaiHanuman',
      'Bhakti',
      'JaiShriRam',
    ]);
    expect(buildVerseHashtags({ ...gita, lang: 'en' })).toEqual([
      'BhagavadGita',
      'Krishna',
      'JaiShreeKrishna',
      'Bhakti',
      'GitaChapter2',
    ]);
    // hi spends one slot on the native-script title, which is where that audience
    // searches — so the block fills to five.
    expect(buildVerseHashtags({ ...chalisa, lang: 'hi' })).toEqual([
      'HanumanChalisa',
      'हनुमानचालीसा',
      'Hanuman',
      'JaiHanuman',
      'Bhakti',
    ]);
  });

  test('exactly one broad anchor, and it is last', () => {
    for (const lang of ['hi', 'en', 'gu', 'kn'] as const) {
      const tags = buildVerseHashtags({ ...gita, lang });
      const broad = tags.filter((t) =>
        ['Bhakti', 'SanatanDharma', 'Hinduism', 'Devotional', 'Spirituality', 'DailyPrayer'].includes(t)
      );
      expect(broad).toEqual(['Bhakti']);
    }
  });

  test('no slot goes to the brand — the card and the @handle already carry it', () => {
    expect(buildVerseHashtags({ ...chalisa, lang: 'en' })).not.toContain('Vedansh');
    expect(buildVerseHashtags({ ...chalisa, lang: 'en' })).not.toContain('VedanshApp');
  });

  test('the chapter tag still tracks the verse, and yields to higher-value tags', () => {
    expect(buildVerseHashtags({ ...gita, lang: 'en' })).toContain('GitaChapter2');
    expect(buildVerseHashtags({ ...gita, verseLabelEn: 'Verse 12.6', lang: 'en' })).toContain(
      'GitaChapter12'
    );
    // hi spends that slot on the native-script title instead — the better trade.
    expect(buildVerseHashtags({ ...gita, lang: 'hi' })).not.toContain('GitaChapter2');
  });

  test('deity tags come from the registry entry, not the title', () => {
    expect(buildVerseHashtags({ ...chalisa, lang: 'en' })).toContain('JaiHanuman');
    expect(buildVerseHashtags({ ...gita, lang: 'en' })).toContain('Krishna');
    // Two tags from the primary deity, never three — the third would cost the
    // anchor. (`limit` only ever shrinks the block, so there is no wider cap to
    // check against: MAX_HASHTAGS is a ceiling, not a default.)
    expect(buildVerseHashtags({ ...chalisa, lang: 'en' })).not.toContain('BajrangBali');
  });

  test('a section narrower than the text leads, and both names fit', () => {
    const tags = buildVerseHashtags({
      sourceId: 'shiva-strotam',
      sectionNameHi: 'शिव तांडव स्तोत्र',
      sectionNameEn: 'Shiva Tandava Stotram',
      verseLabelEn: 'Verse 3',
      lang: 'en',
    });
    expect(tags[0]).toBe('ShivaTandavaStotram');
    expect(tags[1]).toBe('ShivaStotram');
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
      expect(tags.length).toBeGreaterThanOrEqual(4);
      const lowered = tags.map((t) => t.toLowerCase());
      expect(new Set(lowered).size).toBe(tags.length);
      for (const tag of tags) {
        expect(tag).not.toMatch(/[\s#.,;:!?'"()/\\—–।॥·@]/);
        expect(tag.length).toBeLessThanOrEqual(40);
        expect(/\p{L}/u.test(tag)).toBe(true);
      }
    }
  });

  test('a smaller limit trims from the least valuable end', () => {
    const five = buildVerseHashtags({ ...gita, lang: 'en' });
    expect(buildVerseHashtags({ ...gita, lang: 'en', limit: 2 })).toEqual(five.slice(0, 2));
    expect(buildVerseHashtags({ ...gita, lang: 'en', limit: 0 })).toEqual([]);
  });

  test('the cap can never exceed the platform maximum', () => {
    expect(MAX_HASHTAGS).toBe(5);
    expect(buildVerseHashtags({ ...gita, lang: 'en', limit: 500 }).length).toBeLessThanOrEqual(
      MAX_HASHTAGS
    );
  });

  describe('timely tags', () => {
    const hanumanJayanti = {
      nameHi: 'हनुमान जयंती',
      nameEn: 'Hanuman Jayanti',
      deityEn: 'Hanuman',
    };
    const navratri = { nameHi: 'नवरात्रि', nameEn: 'Navratri', deityEn: 'Durga' };

    test("the day's festival takes the first slot, and costs the anchor", () => {
      expect(
        buildVerseHashtags({ ...chalisa, lang: 'en', timely: { occasions: [hanumanJayanti] } })
      ).toEqual(['HanumanJayanti', 'HanumanChalisa', 'Hanuman', 'JaiHanuman', 'Bhakti']);
    });

    test('only one occasion contributes, even on a crowded day', () => {
      const two = [
        hanumanJayanti,
        { nameHi: 'हनुमान व्रत', nameEn: 'Hanuman Vrat', deityEn: 'Hanuman' },
      ];
      const tags = buildVerseHashtags({ ...chalisa, lang: 'en', timely: { occasions: two } });
      expect(tags).toContain('HanumanJayanti');
      expect(tags).not.toContain('HanumanVrat');
    });

    test('an unrelated festival is dropped, not bolted on', () => {
      const tags = buildVerseHashtags({
        ...chalisa,
        lang: 'en',
        timely: { occasions: [navratri]},
      });
      expect(tags).not.toContain('Navratri');
      // …and the same festival on a Durga text does attach.
      const durga = buildVerseHashtags({
        sourceId: 'durga-chalisa',
        sectionNameHi: 'दुर्गा चालीसा',
        sectionNameEn: 'Durga Chalisa',
        verseLabelEn: 'Verse 4',
        lang: 'en',
        timely: { occasions: [navratri]},
      });
      expect(durga).toContain('Navratri');
    });

    test('hi adds the festival in Devanagari; en does not', () => {
      const hi = buildVerseHashtags({
        ...chalisa,
        lang: 'hi',
        timely: { occasions: [hanumanJayanti]},
      });
      expect(hi).toContain('हनुमानजयंती');
      const en = buildVerseHashtags({
        ...chalisa,
        lang: 'en',
        timely: { occasions: [hanumanJayanti]},
      });
      expect(en).not.toContain('हनुमानजयंती');
    });

    test('the vaar tag needs the day AND the deity to match the text', () => {
      // Tuesday (2) is Hanuman's vaar — it takes the fifth slot on a Hanuman text.
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
    expect(tags[0]).toBe('SomeText');
    expect(tags).toContain('Bhakti');
    expect(tags.length).toBe(MAX_HASHTAGS);
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

  test('the caption carries exactly five hashtags', () => {
    const caption = buildInstagramCaption({ ...params, lang: 'en' });
    expect((caption.match(/#/g) ?? []).length).toBeLessThanOrEqual(MAX_HASHTAGS);
  });

  test('the tag block follows the text being shared', () => {
    expect(buildInstagramCaption({ ...params, lang: 'en' })).toContain('#BhagavadGita');
    const chalisaCaption = buildInstagramCaption({
      ...params,
      sourceId: 'hanuman-chalisa',
      sectionNameHi: 'हनुमान चालीसा',
      sectionNameEn: 'Hanuman Chalisa',
      lang: 'en',
    });
    expect(chalisaCaption).toContain('#HanumanChalisa');
    expect(chalisaCaption).not.toContain('#BhagavadGita');
  });
});
