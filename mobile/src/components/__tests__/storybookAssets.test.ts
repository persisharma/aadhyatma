import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

// Check the actual shipped files: stale metadata, missing assets and accidental
// board crops must not pass merely because React Native mocks require() handles.
it('ships all 39 normalized transparent icons with matching provenance hashes', () => {
  const assets = path.resolve(__dirname, '../../../assets/icons/storybook');
  const manifest = JSON.parse(fs.readFileSync(path.join(assets, 'manifest.json'), 'utf8'));
  const registry = fs.readFileSync(path.resolve(__dirname, '../storybookSources.ts'), 'utf8');
  expect(manifest.icons).toHaveLength(39);
  expect(fs.readdirSync(assets).filter((p) => p.endsWith('.png')).sort()).toEqual(manifest.icons.map((i: { file: string }) => i.file).sort());
  for (const icon of manifest.icons) {
    const bytes = fs.readFileSync(path.join(assets, icon.file));
    expect(registry).toContain(`storybook/${icon.file}`);
    expect(bytes.subarray(1, 4).toString()).toBe('PNG');
    expect(bytes.readUInt32BE(16)).toBe(512);
    expect(bytes.readUInt32BE(20)).toBe(512);
    expect(bytes.includes(Buffer.from('tRNS'))).toBe(true);
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(icon.sha256);
    expect(bytes.length).toBe(icon.bytes);
  }
  expect(manifest.icons.reduce((sum: number, i: { bytes: number }) => sum + i.bytes, 0)).toBeLessThan(1500000);
});
