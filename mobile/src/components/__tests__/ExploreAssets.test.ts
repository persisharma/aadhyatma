import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import manifest from '../../../assets/explore/manifest.json';
import { EXPLORE_SECTIONS } from '@/data/discovery/sections';
it('ships sixteen distinct approved paintings within 1.5MB with pinned shipped hashes', () => {
    expect(manifest.assets.map(a => a.id)).toEqual(EXPLORE_SECTIONS.map(s => s.id));
    expect(new Set(manifest.assets.map(a => a.sha256)).size).toBe(16);
    expect(manifest.assets.reduce((n, a) => n + a.bytes, 0)).toBeLessThan(1500000);
    for (const a of manifest.assets) {
        const b = fs.readFileSync(path.resolve(__dirname, '../../../assets/explore', a.file));
        expect(crypto.createHash('sha256').update(b).digest('hex')).toBe(a.sha256);
        expect(b.subarray(0, 2).toString('hex')).toBe('ffd8');
        expect(a.width).toBe(768);
        expect(a.height).toBe(512);
    }
});
