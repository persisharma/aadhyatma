import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import manifest from '../../../assets/devotional-share/manifest.json';
it('ships ten offline plates with verified hashes under 2MiB', () => {
  expect(Object.keys(manifest.assets)).toHaveLength(10); let total = 0;
  for (const a of Object.values(manifest.assets)) {
    const b = fs.readFileSync(path.join(__dirname, '../../../assets/devotional-share', a.file));
    expect(b.length).toBe(a.bytes); expect(crypto.createHash('sha256').update(b).digest('hex')).toBe(a.sha256);
    expect(a.width / a.height).toBe(1.5); total += b.length;
  }
  expect(total).toBeLessThan(2 * 1024 * 1024);
});
