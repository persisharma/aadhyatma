import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import manifest from '../../../assets/devotional-share/manifest.json';
import { devotionalHeroArt } from '../devotionalShareArt';
it('ships eighteen bounded subject paintings with provenance and no duplicate full masters', () => {
  expect(Object.keys(manifest.heroes).sort()).toEqual(Object.keys(devotionalHeroArt).sort());
  let bytes = 0;
  for (const [art, a] of Object.entries(manifest.heroes)) {
    const b = fs.readFileSync(path.join(__dirname, '../../../assets/devotional-share', a.file));
    expect(a.file).toBe(`hero-${art}.webp`);
    expect(b.length).toBe(a.bytes);
    expect(crypto.createHash('sha256').update(b).digest('hex')).toBe(a.sha256);
    expect([a.width, a.height]).toEqual([960, 480]);
    expect(a.bodyPlate).toBe('ganesha');
    expect(a.sourceSha256).toMatch(/^[0-9a-f]{64}$/);
    if (a.kind === 'reused-approved-painting') {
      const source = fs.readFileSync(path.join(__dirname, '../../../..', a.sourceImage));
      expect(source.equals(b)).toBe(true);
      const approved = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../assets/reader-illustrations/approved.json'), 'utf8'));
      expect(approved.assets[path.basename(a.sourceImage, '.webp')]).toBe(a.sha256);
    } else {
      const prompts = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../../docs/evaluations/daily-bhakti-art-508/prompts.json'), 'utf8'));
      expect(prompts.prompts[art].length).toBeGreaterThan(100);
    }
    bytes += b.length;
  }
  expect(bytes).toBeLessThan(3 * 1024 * 1024);
  expect(bytes + Object.values(manifest.assets).reduce((sum, a) => sum + a.bytes, 0)).toBeLessThan(22 * 1024 * 1024);
});
it('ships ten hashed offline plates under 22MiB', () => {
  expect(Object.keys(manifest.assets)).toHaveLength(10); let total = 0;
  for (const a of Object.values(manifest.assets)) {
    const b = fs.readFileSync(path.join(__dirname, '../../../assets/devotional-share', a.file));
    expect(b.length).toBe(a.bytes); expect(crypto.createHash('sha256').update(b).digest('hex')).toBe(a.sha256); total += b.length;
  }
  expect(total).toBeLessThan(22 * 1024 * 1024);
});
it('retains nine full masters with bounded text-only editing fields', () => {
  let verified = 0;
  for (const [art, a] of Object.entries(manifest.assets)) {
    if (art === 'prayer') continue;
    expect('textRects' in a).toBe(true);
    if (!('textRects' in a)) continue;
    verified++;
    expect([a.width, a.height]).toEqual([1080, 1456]); expect(a.protectedPixelChanges).toBe(0); expect(a.sourceSha256).toMatch(/^[0-9a-f]{64}$/);
    for (const [x, y, w, h] of a.textRects) { expect(x).toBeGreaterThan(50); expect(x + w).toBeLessThan(1030); expect(y).toBeGreaterThan(500); expect(y + h).toBeLessThan(1296); }
  }
  expect(verified).toBe(9);
});
it('ships the licensed and hashed devotional text face', () => {
  const directory = path.join(__dirname, '../../../assets/fonts'), spec = JSON.parse(fs.readFileSync(path.join(directory, 'manifest.json'), 'utf8'));
  expect(crypto.createHash('sha256').update(fs.readFileSync(path.join(directory, spec.file))).digest('hex')).toBe(spec.sha256);
  expect(fs.readFileSync(path.join(directory, spec.license), 'utf8')).toContain('SIL OPEN FONT LICENSE');
});
