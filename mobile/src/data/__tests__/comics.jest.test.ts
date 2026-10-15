import fs from 'node:fs';
import path from 'node:path';
import { comics, comicById } from '../comics';
import { getComicBook, comicPageIndex, comicPages, comicLanguage } from '../comicBooks';
import manifest from '../comicAssetManifest.json';

const book = getComicBook('balakanda-v1')!;
test('native reader uses the complete reviewed edition with no website URL', () => {
  expect(comicById('balakanda-v1')).not.toHaveProperty('url');
  expect(book.episodes).toHaveLength(29);
  expect(comicPages(book)).toHaveLength(140);
  expect(comics[0].episodeCount).toBe(book.episodes.length);
  expect(getComicBook('nope')).toBeUndefined();
  expect(comicById('nope')).toBeUndefined();
});
test('all reviewed text, frames and speaker identities survive the native migration', () => {
  const reviewed = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../../docs/content-parity/ramayan-comic/balakanda-bilingual-v2/book.json'), 'utf8'));
  expect(book.episodes.map(e => e.id)).toEqual(reviewed.episodes.map((e: any) => e.id));
  for (const [i, page] of comicPages(book).entries()) {
    const original = reviewed.episodes.flatMap((e: any) => e.panels)[i];
    for (const field of ['id', 'hi', 'en', 'frame', 'dimensions', 'speakerAnchor', 'overlaySpeech'] as const) {
      expect(page.panel[field]).toEqual(original[field]);
    }
    const asset = manifest.assets[page.panel.art as keyof typeof manifest.assets];
    expect(page.panel.sha256.startsWith(asset.hash)).toBe(true);
    expect(asset.ext).toBe('png');
  }
  expect(comicPages(book).filter(p => p.panel.hi.dialogue)).toHaveLength(31);
});
test('episode/panel routes retain stable positions and unsupported translations are explicit', () => {
  for (const episode of book.episodes) {
    expect(comicPages(book)[comicPageIndex(book, episode.id)].panel.id).toBe(episode.panels[0].id);
  }
  expect(comicPages(book)[comicPageIndex(book, undefined, 'bk-06-03')].panel.speakerAnchor?.x).toBe(0.51);
  expect(comicPageIndex(book, 'missing')).toBe(0);
  expect(comicPageIndex(book, undefined, 'missing')).toBe(0);
  expect(['hi', 'en', 'gu', 'kn'].map(lang => comicLanguage(lang as any))).toEqual(['hi', 'en', 'en', 'en']);
});
