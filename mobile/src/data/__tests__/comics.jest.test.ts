import fs from 'node:fs';
import path from 'node:path';
import { comics, comicById } from '../comics';
import { getComicBook, comicPageIndex, comicPages, comicLanguage } from '../comicBooks';
import manifest from '../comicAssetManifest.json';
import source from '../comicBooks/balakanda.json';
const book = getComicBook('balakanda-v1')!;
const panels = book.episodes.flatMap(e => e.panels);
test('complete four-language illustrated edition covers the sourced arc without duplicate shots', () => {
  expect(source.baseText).toMatch(/Valmiki Ramayana, Bala Kanda/);
  expect(source.scope).toMatch(/retelling/);
  expect(source.sourceCoverage).toEqual(Array.from({ length: 77 }, (_, i) => i + 1));
  expect(comicById('balakanda-v1')).not.toHaveProperty('url');
  expect(book.episodes).toHaveLength(comics[0].episodeCount);
  expect(comicPages(book)).toHaveLength(62);
  expect(panels).toHaveLength(199);
  expect(new Set(panels.map(p => p.id)).size).toBe(199);
  expect(new Set(panels.map(p => p.sourcePanel)).size).toBe(140);
  expect(new Set(panels.map(p => p.sha256)).size).toBe(62);
  expect(panels.filter(p => p.hi.dialogue)).toHaveLength(70);
  expect(book.pages.filter(p => p.rows.length === 1)).toHaveLength(8);
  expect(book.pages.filter(p => p.rows.length === 2)).toHaveLength(19);
  expect(book.pages.filter(p => p.rows.length === 3)).toHaveLength(35);
});
test('native data preserves the exact approved text, measured frames and per-language copy', () => {
  const approved = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../../docs/content-parity/ramayan-comic/balakanda-illustrated-v3/book.json'), 'utf8'));
  expect(book).toEqual(approved);
  for (const panel of panels) {
    for (const lang of ['hi','en','gu','kn'] as const) {
      expect((panel[lang].narration + (panel[lang].dialogue ?? '') + (panel[lang].note ?? '')).length > 0).toBe(panel.mode !== 'silent');
    }
    const asset = manifest.assets[panel.art as keyof typeof manifest.assets];
    expect(panel.sha256.startsWith(asset.hash)).toBe(true);
    expect(panel.frame.x + panel.frame.width).toBeLessThanOrEqual(1.00001);
    expect(panel.frame.y + panel.frame.height).toBeLessThanOrEqual(1.00001);
  }
});
test('every original scene and chapter routes to its containing grouped page', () => {
  const pages = comicPages(book);
  for (const episode of book.episodes) {
    expect(pages[comicPageIndex(book, episode.id)].rows.flat().some(p => p.id === episode.panels[0].id)).toBe(true);
    for (const panel of episode.panels) expect(pages[comicPageIndex(book, undefined, panel.id)].rows.flat().some(p => p.id === panel.id)).toBe(true);
  }
  expect(comicPageIndex(book,'missing')).toBe(0);
  expect(getComicBook('missing')).toBeUndefined();
  expect(['hi','en','gu','kn'].map(l => comicLanguage(l as any))).toEqual(['hi','en','gu','kn']);
});
