import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import manifest from '../../../assets/devotional-share/manifest.json';
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
