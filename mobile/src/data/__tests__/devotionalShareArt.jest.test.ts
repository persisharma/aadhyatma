import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import manifest from '../../../assets/devotional-share/manifest.json';
import { devotionalArtRequest, devotionalSubjectArt, type DevotionalSubjectArt } from '../devotionalShareArt';
import type { DevotionalArt } from '@/utils/devotionalShareLayout';
import { devotionalFrameSpec } from '../devotionalFrameSpec';
it('retains nineteen complete portrait masters with pinned provenance within the combined budget', () => {
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
    expect([0, f.hero, f.sourceEnd, f.verseEnd, f.meaningTop, f.meaningBottom, f.commentTop, 1296, 1456]).toEqual(art === 'mahakaal'
      ? [0, 550, 650, 785, 855, 1075, 1124, 1296, 1456]
      : [0, 560, 683, 815, 886, 1106, 1164, 1296, 1456]);
    expect(a.sourceSha256).toMatch(/^[0-9a-f]{64}$/);
    expect(prompts.prompts[art].length).toBeGreaterThan(100);
    expect(fs.existsSync(path.join(__dirname, '../../../assets/devotional-share', `hero-${art}.webp`))).toBe(false);
    bytes += b.length;
  }
  expect(bytes + Object.values(manifest.assets).reduce((sum, a) => sum + a.bytes, 0)).toBeLessThan(9 * 1024 * 1024);
});

it('keeps all published hashed reviewed masters as sources and publishes each to R2, not the bundle', () => {
  const r2 = JSON.parse(fs.readFileSync(path.join(__dirname, '../devotionalShareManifest.json'), 'utf8'));
  expect(r2.prefix).toBe('devotional-share');
  expect(Object.keys(manifest.assets)).toHaveLength(10);
  for (const [art, a] of Object.entries({ ...manifest.assets, ...manifest.subjects })) {
    const b = fs.readFileSync(path.join(__dirname, '../../../assets/devotional-share', a.file));
    expect(b.length).toBe(a.bytes);
    const sha = crypto.createHash('sha256').update(b).digest('hex');
    expect(sha).toBe(a.sha256);
    if (art === 'mahakaal' && 'publication' in a && a.publication === 'pending') {
      expect(r2.assets[art]).toBeUndefined();
      continue;
    }
    expect(r2.assets[art]).toEqual({ hash: sha.slice(0, 16), ext: 'webp', width: a.width, height: a.height });
  }
  const loader = fs.readFileSync(path.join(__dirname, '../devotionalShareArt.ts'), 'utf8');
  expect(loader).not.toMatch(/require\(/);
});
it('resolves every art to its hashed R2 object', () => {
  const r2 = JSON.parse(fs.readFileSync(path.join(__dirname, '../devotionalShareManifest.json'), 'utf8'));
  for (const art of Object.keys(r2.assets) as DevotionalArt[]) {
    expect(devotionalArtRequest(art)).toMatchObject({
      key: r2.assets[art].hash, subdir: 'devotional-share',
      remoteUrl: `https://cdn.vedansh.app/devotional-share/${r2.assets[art].hash}.webp`,
    });
  }
});
it('retains nine lossless authoring references and full-resolution, bounded delivery encodings', () => {
  let verified = 0;
  for (const [art, a] of Object.entries(manifest.assets)) {
    if (art === 'prayer') continue;
    expect('textRects' in a).toBe(true);
    if (!('textRects' in a)) continue;
    verified++;
    expect([a.width, a.height]).toEqual([1080, 1456]);
    expect(a.authoringMaster.protectedPixelChanges).toBe(0);
    expect(a.authoringMaster.sha256).toMatch(/^[0-9a-f]{64}$/);
    expect(a.authoringMaster.gitRef).toBe('d98433ad1ea05233e418bfffa720952bae198cfb');
    expect(a.authoringMaster.file).toBe(`mobile/assets/devotional-share/${a.file}`);
    expect(a.deliveryEncoding).toMatchObject({ codec: 'webp', quality: 94, method: 6, sharpYuv: true });
    expect(a.bytes).toBeLessThan(600 * 1024);
    expect(a.bytes).toBeLessThan(a.authoringMaster.bytes * 0.3);
    expect(a.sourceSha256).toMatch(/^[0-9a-f]{64}$/);
    for (const [x, y, w, h] of a.textRects) { expect(x).toBeGreaterThan(50); expect(x + w).toBeLessThan(1030); expect(y).toBeGreaterThan(500); expect(y + h).toBeLessThan(1296); }
  }
  expect(verified).toBe(9);
});
it('ships the licensed and hashed devotional text face', () => {
  const directory = path.join(__dirname, '../../../assets/fonts'), spec = JSON.parse(fs.readFileSync(path.join(directory, 'manifest.json'), 'utf8'));
  expect(crypto.createHash('sha256').update(fs.readFileSync(path.join(directory, spec.file))).digest('hex')).toBe(spec.sha256);
  expect(fs.readFileSync(path.join(directory, spec.license), 'utf8')).toContain('SIL OPEN FONT LICENSE');
});
