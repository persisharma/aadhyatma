import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { garudPuranChaptersManifest, garudPuranTotal, getGarudPuranChapter } from '../garud-puran';
import { garudPuranImages } from '@assets/garud-puran';

test('the twelve reviewed readings contain bilingual prose with traceable sources and artwork', () => {
  expect(garudPuranChaptersManifest).toHaveLength(12);
  expect(garudPuranTotal).toBe(28);
  const ids = new Set<string>();
  for (const row of garudPuranChaptersManifest) {
    const reading = getGarudPuranChapter(row.chapter);
    expect(reading.contentKind).toBe('editorial-summary');
    expect(reading.status).toBe('verified');
    expect(reading.verseCount).toBe(row.verseCount);
    expect(new Set(reading.source.independentSourceFamilies).size).toBe(2);
    expect(reading.source.referenceUrls[0]).toContain('sanskritdocuments.org');
    expect(reading.source.referenceUrls[1]).toContain('bharatkosha.org');
    expect(reading.source.sanskritReferences.length).toBeGreaterThan(0);
    for (const [index, page] of reading.verses.entries()) {
      expect(ids.has(page.id)).toBe(false);
      ids.add(page.id);
      expect(page.chapter).toBe(row.chapter);
      expect(page.number).toBe(index + 1);
      expect(page.meaningHi).toBe(page.bodyHi.join('\n\n'));
      expect(page.meaningEn).toBe(page.bodyEn.join('\n\n'));
      expect(page.meaningHi).toMatch(/[\u0900-\u097f]/);
      expect(page.meaningEn).toMatch(/[a-z]/);
      expect(garudPuranImages[page.artId]).toBeDefined();
      expect(page).not.toHaveProperty('sanskrit');
    }
  }
});

test('invalid or unpublished chapter numbers cannot load and repeat reads reuse the chapter', () => {
  for (const chapter of [0, -1, 13, 1.5, NaN]) expect(() => getGarudPuranChapter(chapter)).toThrow();
  expect(getGarudPuranChapter(5)).toBe(getGarudPuranChapter(5));
});

test('the stories preserve edition-specific locations and the actual ritual in the source', () => {
  expect(getGarudPuranChapter(8).verses[0].meaningEn).toContain('Pushkar');
  expect(getGarudPuranChapter(7).verses[1].meaningEn).toContain('Mathura');
  expect(getGarudPuranChapter(7).verses[0].meaningEn).toContain('vrishotsarga');
  expect(getGarudPuranChapter(5).verses[1].meaningEn).toContain('Sudeva');
});

test('bundled artwork exactly matches the approved Style 3 review set', () => {
  const root = path.resolve(__dirname, '../../../..');
  const reviewed = JSON.parse(fs.readFileSync(path.join(root, 'docs/content/garud-puran/design-review/style3-final/manifest.json'), 'utf8'));
  const bundled = JSON.parse(fs.readFileSync(path.join(root, 'docs/content/garud-puran/artwork/manifest.json'), 'utf8'));
  expect(bundled.approval.status).toBe('approved');
  expect(bundled.assets).toHaveLength(9);
  for (const asset of bundled.assets) {
    const bytes = fs.readFileSync(path.join(root, asset.path));
    const reference = reviewed.assets.find((item: { id: string }) => item.id === asset.id);
    expect(reference.sha256).toBe(asset.sha256);
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(asset.sha256);
    expect(bytes.length).toBe(asset.bytes);
    expect(asset.dimensions).toEqual([960, 480]);
  }
});
