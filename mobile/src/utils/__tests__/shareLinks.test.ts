/**
 * Guards for the share-caption links (design.md §37 / §39, `data/shareLinks.ts`).
 *
 * The verse-share caption and the "Share the App" invite both carry the download
 * smart link AND the public Instagram profile URL. The Instagram *post* caption
 * deliberately does not repeat that URL — it already names the @handle, and a
 * non-clickable instagram.com link inside an IG post is noise. These pin all three.
 */

import {
  INSTAGRAM_URL,
  SMART_LINK,
  buildAppShareMessage,
  buildInstagramCaption,
  buildShareCaption,
} from '@/data/shareLinks';

const verse = {
  sectionNameHi: 'भगवद् गीता',
  sectionNameEn: 'Bhagavad Gītā',
  verseLabelHi: 'श्लोक 2.47',
  verseLabelEn: 'Verse 2.47',
  firstLineHi: 'कर्मण्येवाधिकारस्ते',
  firstLineEn: 'karmaṇy-evādhikāras te',
} as const;

describe('buildShareCaption', () => {
  test('carries both the download link and the Instagram profile URL', () => {
    const caption = buildShareCaption({ ...verse, lang: 'en' });
    expect(caption).toContain(SMART_LINK);
    expect(caption).toContain('Follow on Instagram:');
    expect(caption).toContain(INSTAGRAM_URL);
  });

  test('the Instagram line follows the download CTA', () => {
    const lines = buildShareCaption({ ...verse, lang: 'en' }).split('\n');
    const downloadIdx = lines.findIndex((l) => l.includes(SMART_LINK));
    const igIdx = lines.findIndex((l) => l.includes(INSTAGRAM_URL));
    expect(downloadIdx).toBeGreaterThanOrEqual(0);
    expect(igIdx).toBe(downloadIdx + 1);
  });

  test('localizes the Instagram label (gu keeps the full URL)', () => {
    const caption = buildShareCaption({ ...verse, lang: 'gu' });
    expect(caption).toContain('Instagram પર ફૉલો કરો:');
    expect(caption).toContain(INSTAGRAM_URL);
  });

  test('omits the Instagram profile line when withInstagram is false', () => {
    const caption = buildShareCaption({ ...verse, lang: 'en' }, { withInstagram: false });
    expect(caption).toContain(SMART_LINK);
    expect(caption).not.toContain(INSTAGRAM_URL);
  });
});

describe('buildInstagramCaption', () => {
  test('keeps the @handle but not the profile URL (it would be non-clickable noise)', () => {
    const caption = buildInstagramCaption({
      ...verse,
      sourceId: 'bhagavad-gita',
      lang: 'en',
    });
    expect(caption).toContain('@vedansh.app');
    expect(caption).not.toContain(INSTAGRAM_URL);
  });
});

describe('buildAppShareMessage', () => {
  test('carries both the download link and the Instagram profile URL', () => {
    const message = buildAppShareMessage('en');
    expect(message).toContain(SMART_LINK);
    expect(message).toContain('Follow on Instagram:');
    expect(message).toContain(INSTAGRAM_URL);
  });
});
