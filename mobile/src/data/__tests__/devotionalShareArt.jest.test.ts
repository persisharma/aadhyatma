import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import manifest from '../../../assets/devotional-share/manifest.json';
import { devotionalSubjectArt } from '../devotionalShareArt';
import { devotionalFrameSpec } from '../devotionalFrameSpec';
import type { DevotionalSubjectArt } from '../devotionalShareArt';
it('ships eighteen complete portrait masters with pinned provenance within the combined budget', () => {
  expect(Object.keys(manifest.subjects).sort()).toEqual(Object.keys(devotionalSubjectArt).sort());
  const prompts = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../../docs/evaluations/daily-bhakti-full-masters/prompts.json'), 'utf8'));
  let bytes = 0;
  for (const [art, a] of Object.entries(manifest.subjects)) {
    const b = fs.readFileSync(path.join(__dirname, '../../../assets/devotional-share', a.file));
    expect(a.file).toBe(`master-${art}.webp`);
    expect(b.length).toBe(a.bytes);
    expect(crypto.createHash('sha256').update(b).digest('hex')).toBe(a.sha256);
    expect([a.width, a.height]).toEqual([1080, 1456]);
    expect(a.bodyPlate).toBe(art);
    expect(devotionalFrameSpec(art as DevotionalSubjectArt)).toEqual(a.frameSpec);
    const f = a.frameSpec;
    expect([0, f.hero, f.sourceEnd, f.verseEnd, f.meaningTop, f.meaningBottom, f.commentTop, 1296, 1456]).toEqual([0, 560, 683, 815, 886, 1106, 1164, 1296, 1456]);
    expect(a.sourceSha256).toMatch(/^[0-9a-f]{64}$/);
    expect(prompts.prompts[art].length).toBeGreaterThan(100);
    expect(fs.existsSync(path.join(__dirname, '../../../assets/devotional-share', `hero-${art}.webp`))).toBe(false);
    bytes += b.length;
  }
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
