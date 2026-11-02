import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import manifest from '../../../assets/icons/kundali/manifest.json';

test('eleven offline paintings have pinned source/shipped hashes, alpha and their own byte budget', () => {
  const { PNG } = require('pngjs');
  expect(manifest.assets.map(asset => asset.id).sort()).toEqual(['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu', 'lagna', 'nakshatra'].sort());
  let bytes = 0;
  for (const asset of manifest.assets) {
    const data = fs.readFileSync(path.join(__dirname, '../../../assets/icons/kundali', asset.file));
    expect(crypto.createHash('sha256').update(data).digest('hex')).toBe(asset.sha256); expect(data.length).toBe(asset.bytes); bytes += data.length;
    const png = PNG.sync.read(data); expect([png.width, png.height]).toEqual([256, 256]);
    expect(Array.from(png.data as Uint8Array).some((alpha, index) => index % 4 === 3 && alpha === 0)).toBe(true);
    expect(asset.masterSha256).toMatch(/^[a-f0-9]{64}$/);
  }
  expect(bytes).toBeLessThan(manifest.budgetBytes);
  expect(new Set(manifest.assets.map(asset => asset.sha256)).size).toBe(11);
});
