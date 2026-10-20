import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import manifest from '../../../assets/devotional-share/footers/manifest.json';
import ornaments from '../../../assets/devotional-share/ornaments/manifest.json';
import { devotionalFooterAsset, devotionalOrnamentAsset } from '../devotionalFrameArt';
import type { DevotionalArt } from '@/utils/devotionalShareLayout';

it('ships all nine approved offline footer slices within a 1MiB budget', () => {
  expect(Object.keys(manifest.assets)).toHaveLength(9);
  let total = 0;
  for (const [art, asset] of Object.entries(manifest.assets)) {
    expect(devotionalFooterAsset(art as DevotionalArt)).toBeDefined();
    const bytes = fs.readFileSync(path.join(__dirname, '../../../assets/devotional-share/footers', asset.file));
    expect(bytes.length).toBe(asset.bytes);
    expect(crypto.createHash('sha256').update(bytes).digest('hex')).toBe(asset.sha256);
    expect([asset.width, asset.height]).toEqual([1080, 280]);
    expect(asset.sourceSha256).toMatch(/^[0-9a-f]{64}$/);
    total += bytes.length;
  }
  expect(total).toBeLessThan(1024 * 1024);
  expect(devotionalFooterAsset('prayer')).toBe(devotionalFooterAsset('ganesha'));
});

it('verifies all nine exact ornament atlases and their crop bounds', () => {
  let total = 0;
  for (const [art, asset] of Object.entries(ornaments.assets)) {
    expect(devotionalOrnamentAsset(art as DevotionalArt)).toBeDefined();
    const bytes = fs.readFileSync(path.join(__dirname, '../../../assets/devotional-share/ornaments', asset.file));
    expect(crypto.createHash('sha256').update(bytes).digest('hex')).toBe(asset.sha256);
    for (const crop of Object.values(asset.crops)) {
      expect(crop.left + crop.width).toBeLessThanOrEqual(1080);
      expect(crop.top + crop.height).toBeLessThanOrEqual(1456);
    }
    total += bytes.length;
  }
  expect(Object.keys(ornaments.assets)).toHaveLength(9);
  expect(total).toBeLessThan(1024 * 1024);
});
