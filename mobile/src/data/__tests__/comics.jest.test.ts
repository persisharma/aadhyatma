import { comics, comicById } from '../comics';

test('balakanda comic points at the https CDN reader', () => {
  const bk = comicById('balakanda-v1');
  expect(bk).toBeDefined();
  expect(bk!.url).toBe('https://cdn.vedansh.app/comics/balakanda-v1/index.html');
  expect(bk!.url.startsWith('https://')).toBe(true);
});

test('every comic has a url and a title in all four languages', () => {
  expect(comics.length).toBeGreaterThan(0);
  for (const comic of comics) {
    expect(comic.url.startsWith('https://')).toBe(true);
    for (const lang of ['hi', 'en', 'gu', 'kn'] as const) {
      expect(typeof comic.title[lang]).toBe('string');
      expect(comic.title[lang].length).toBeGreaterThan(0);
    }
  }
});

test('comicById returns undefined for an unknown id', () => {
  expect(comicById('nope')).toBeUndefined();
});
