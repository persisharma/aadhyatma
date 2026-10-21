import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import manifest from '../../../assets/devotional-share/manifest.json';
import { devotionalArtRequest } from '../devotionalShareArt';
import type { DevotionalArt } from '@/utils/devotionalShareLayout';
it('keeps ten hashed reviewed masters as sources and publishes each to R2, not the bundle', () => {
  const r2 = JSON.parse(fs.readFileSync(path.join(__dirname, '../devotionalShareManifest.json'), 'utf8'));
  expect(r2.prefix).toBe('devotional-share');
  expect(Object.keys(manifest.assets)).toHaveLength(10);
  for (const [art, a] of Object.entries(manifest.assets)) {
    const b = fs.readFileSync(path.join(__dirname, '../../../assets/devotional-share', a.file));
    expect(b.length).toBe(a.bytes);
    const sha = crypto.createHash('sha256').update(b).digest('hex');
    expect(sha).toBe(a.sha256);
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
