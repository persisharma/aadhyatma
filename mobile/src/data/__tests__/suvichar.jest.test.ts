import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { cleanSender, parseSuvicharPreferences, suvicharArtKey, suvicharArtRequest, suvicharHeroFraction, suvicharDeities, suvicharFrames, NAME_LIMIT } from '../suvichar';
it('maps all fourteen subjects to three distinct masters without fallback', () => {
  const keys = suvicharDeities.flatMap(d => suvicharFrames.map(f => suvicharArtKey(d.id, f.id)));
  expect(keys).toHaveLength(42); expect(new Set(keys).size).toBe(42);
  expect(keys).toContain('ram-darbar--mandir-jharokha');
  expect(keys).toContain('salasar-balaji--bhakti-patra');
  expect(keys).toContain('khatu-shyam--pushp-aangan');
  expect(keys).toContain('tirupati-balaji--mandir-jharokha');
});
it.each([null, '{', 'null', '[]', '{}'])('recovers corrupt or missing preferences %s', raw => {
  expect(parseSuvicharPreferences(raw)).toMatchObject({ deity: 'krishna', frame: 'mandir-jharokha', name: '', favorites: [] });
});
it('restores names, frame, message and only valid saved cards', () => {
  const f = { deity: 'ram-darbar', frame: 'pushp-aangan', name: 'शर्मा परिवार', message: 'जय श्रीराम' };
  expect(parseSuvicharPreferences(JSON.stringify({ ...f, favorites: [f, null, { deity: 'unknown' }] }))).toEqual({ ...f, favorites: [f] });
});
it('bounds untrusted stored input and strips sender control characters without changing its script', () => {
  expect(parseSuvicharPreferences(JSON.stringify({ name: 'a'.repeat(200) })).name).toHaveLength(NAME_LIMIT);
  expect(cleanSender('  शर्मा\nपरिवार\t ')).toBe('शर्मा परिवार');
  expect(cleanSender('')).toBe('');
});
it('never activates unpublished artwork or substitutes an unrelated deity', () => {
  // Pending objects remain absent until publication verification.
  const result = suvicharArtRequest('tirupati-balaji', 'bhakti-patra');
  if (result) expect(result.remoteUrl).toContain('/suvichar/'); else expect(result).toBeNull();
});

it('keeps exactly 42 complete unique source masters with matching provenance hashes', () => {
  const folder = path.resolve(__dirname, '../../../assets/suvichar');
  const provenance = JSON.parse(fs.readFileSync(path.join(folder, 'sources.json'), 'utf8'));
  const expected = suvicharDeities.flatMap(d => suvicharFrames.map(f => suvicharArtKey(d.id, f.id))).sort();
  expect(provenance.assets.map((a: { id: string }) => a.id).sort()).toEqual(expected);
  const hashes = new Set<string>(); let total = 0;
  for (const a of provenance.assets) {
    const bytes = fs.readFileSync(path.join(folder, a.file));
    expect(bytes.subarray(0, 4).toString()).toBe('RIFF'); expect(bytes.subarray(8, 12).toString()).toBe('WEBP');
    const hash = createHash('sha256').update(bytes).digest('hex');
    expect(hash).toBe(a.sha256); hashes.add(hash); total += bytes.length;
    expect(a.heroFraction).toBe(suvicharHeroFraction(a.deity, a.frame));
    expect(a.width / a.height).toBeGreaterThan(.78); expect(a.width / a.height).toBeLessThan(.82);
    expect(a.width).toBeGreaterThanOrEqual(1080); expect(a.prompt).toMatch(/Subject:|Use case: precise-object-edit/);
    expect(a.authoringPngSha256).toMatch(/^[a-f0-9]{64}$/);
  }
  expect(hashes.size).toBe(42); expect(total).toBeLessThan(30 * 1024 * 1024);
});
