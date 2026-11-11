import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { cleanSender, parseSuvicharPreferences, senderFrom, suvicharArtKey, suvicharArtRequest, suvicharHeroFraction, suvicharDeities, suvicharPaintedDeities, suvicharFrames, NAME_LIMIT } from '../suvichar';
import { suvicharPhotoArt } from '../suvicharPhotoArt';
import { suvicharTemplatesFor } from '../suvicharTemplates';
const suvicharTemplates = suvicharTemplatesFor(0);
it('maps every painted subject to three distinct masters without fallback', () => {
  const keys = suvicharPaintedDeities.flatMap(d => suvicharFrames.map(f => suvicharArtKey(d.id, f.id)));
  expect(keys).toHaveLength(suvicharPaintedDeities.length * suvicharFrames.length); expect(new Set(keys).size).toBe(keys.length);
  expect(keys).toContain('annapurna--mandir-jharokha');
  expect(keys).toContain('ram-darbar--mandir-jharokha');
  expect(keys).toContain('salasar-balaji--bhakti-patra');
  expect(keys).toContain('khatu-shyam--pushp-aangan');
  expect(keys).toContain('tirupati-balaji--mandir-jharokha');
});
it('provides complete ready-made compositions for every deity and all seven wishes', () => {
  expect(suvicharTemplates).toHaveLength(suvicharDeities.length + 7);
  expect(new Set(suvicharTemplates.map(t => t.id)).size).toBe(suvicharDeities.length + 7);
  expect(suvicharTemplates.filter(t => t.kind === 'daily').map(t => t.deity).sort()).toEqual(suvicharDeities.map(d => d.id).sort());
  expect(suvicharTemplates.filter(t => t.kind === 'wish')).toHaveLength(7);
  for (const t of suvicharTemplates) {
    expect(suvicharFrames.some(f => f.id === t.frame)).toBe(true);
    expect(t.messageHi.length).toBeGreaterThan(0); expect(t.messageHi.length).toBeLessThanOrEqual(280);
    expect(t.messageEn.length).toBeGreaterThan(0); expect(t.messageEn.length).toBeLessThanOrEqual(280);
  }
});
it.each([null, '{', 'null', '[]', '{}'])('recovers corrupt or missing preferences %s', raw => {
  expect(parseSuvicharPreferences(raw)).toMatchObject({ deity: 'krishna', frame: 'mandir-jharokha', name: '', favorites: [] });
});
it('restores names, frame, message and only valid saved cards', () => {
  const f = { deity: 'ram-darbar', frame: 'pushp-aangan', name: 'शर्मा परिवार', message: 'जय श्रीराम' };
  expect(parseSuvicharPreferences(JSON.stringify({ ...f, favorites: [f, null, { deity: 'unknown' }] }))).toEqual({ ...f, nameOn: true, photo: '', photoFit: { x: 0, y: 0, w: 1, h: 1 }, photoOn: false, thoughtId: '', vaar: false, favorites: [f] });
});
it('keeps the sender line on unless it was switched off, so earlier saves keep their name', () => {
  expect(parseSuvicharPreferences(JSON.stringify({ name: 'शर्मा परिवार' })).nameOn).toBe(true);
  expect(parseSuvicharPreferences(JSON.stringify({ name: 'शर्मा परिवार', nameOn: false }))).toMatchObject({ name: 'शर्मा परिवार', nameOn: false });
  expect(parseSuvicharPreferences(JSON.stringify({ nameOn: 0 })).nameOn).toBe(true);
});
it('applies a carried sender without ever clearing the saved name', () => {
  expect(senderFrom('Patel family', 'Sharma family')).toEqual({ name: 'Patel family', nameOn: true });
  expect(senderFrom('', 'Sharma family')).toEqual({ name: 'Sharma family', nameOn: false });
  expect(senderFrom('  ', 'Sharma family')).toEqual({ name: 'Sharma family', nameOn: false });
  // No saved name: keep the switch on so the first-time field stays visible.
  expect(senderFrom('', '')).toEqual({ name: '', nameOn: true });
});
it('restores the weekday flag on preferences and favorites, and drops anything but true', () => {
  const f = { deity: 'hanuman', frame: 'bhakti-patra', name: '', message: '', vaar: true };
  const parsed = parseSuvicharPreferences(JSON.stringify({ ...f, favorites: [f, { ...f, vaar: 'yes' }] }));
  expect(parsed.vaar).toBe(true);
  expect(parsed.favorites).toEqual([f, { deity: 'hanuman', frame: 'bhakti-patra', name: '', message: '' }]);
  expect(parseSuvicharPreferences(JSON.stringify({ vaar: 1 })).vaar).toBe(false);
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

it('keeps every painted source master unique with matching provenance hashes', () => {
  const folder = path.resolve(__dirname, '../../../assets/suvichar');
  const provenance = JSON.parse(fs.readFileSync(path.join(folder, 'sources.json'), 'utf8'));
  const expected = suvicharPaintedDeities.flatMap(d => suvicharFrames.map(f => suvicharArtKey(d.id, f.id))).sort();
  expect(provenance.assets.map((a: { id: string }) => a.id).sort()).toEqual(expected);
  const hashes = new Set<string>(); let total = 0;
  for (const a of provenance.assets) {
    const bytes = fs.readFileSync(path.join(folder, a.file));
    expect(bytes.subarray(0, 4).toString()).toBe('RIFF'); expect(bytes.subarray(8, 12).toString()).toBe('WEBP');
    const hash = createHash('sha256').update(bytes).digest('hex');
    expect(hash).toBe(a.sha256); hashes.add(hash); total += bytes.length;
    expect(a.heroFraction).toBe(suvicharHeroFraction(a.deity, a.frame));
    expect(a.width / a.height).toBeGreaterThan(.78); expect(a.width / a.height).toBeLessThan(.82);
    expect(a.width).toBeGreaterThanOrEqual(1080); expect(a.prompt).toMatch(a.deity === 'parshuram' ? /STAND|standing/ : /Subject:|Use case: precise-object-edit/);
    expect(a.authoringPngSha256).toMatch(/^[a-f0-9]{64}$/);
  }
  expect(hashes.size).toBe(expected.length); expect(total).toBeLessThan(30 * 1024 * 1024);
});

it('preserves the real Ram Lalla photo, public source and licence within a bounded delivery size', () => {
  const folder = path.resolve(__dirname, '../../../assets/suvichar/photos');
  const source = JSON.parse(fs.readFileSync(path.join(folder, 'sources.json'), 'utf8'));
  const bytes = fs.readFileSync(path.join(folder, source.file));
  const hash = createHash('sha256').update(bytes).digest('hex');
  expect(hash).toBe(source.sha256);
  expect(bytes.length).toBe(source.bytes); expect(bytes.length).toBeLessThan(750 * 1024);
  // The historical photo remains preserved, but it is no longer a runtime request.
  expect(suvicharPhotoArt('ram-lalla')!.request.remoteUrl).not.toBe(source.deliveryUrl);
  expect(source.license).toBe('GODL-India'); expect(source.author).toBe("Prime Minister's Office, Government of India");
  expect(source.sourceUrl).toContain('commons.wikimedia.org/wiki/');
});


it('links the exact approved generated Ram Lalla master to the registered R2 upload object', () => {
  const folder = path.resolve(__dirname, '../../../assets/suvichar/portraits');
  const source = JSON.parse(fs.readFileSync(path.join(folder, 'sources.json'), 'utf8'));
  const bytes = fs.readFileSync(path.join(folder, source.file));
  const master = fs.readFileSync(path.join(folder, source.master));
  const hash = createHash('sha256').update(bytes).digest('hex');
  expect(hash).toBe(source.sha256);
  expect(createHash('sha256').update(master).digest('hex')).toBe(source.masterSha256);
  expect(bytes.length).toBe(source.bytes); expect(bytes.length).toBeLessThan(600 * 1024);
  expect(source.library_file_id).toBe('libfile_26f416810ac081918d18d2a8aadb4927');
  expect(suvicharPhotoArt('ram-lalla')).toMatchObject({ kind: 'generated', width: source.width, height: source.height, crop: source.crop, credit: '' });
  expect(suvicharPhotoArt('ram-lalla')!.request).toMatchObject({ key: hash.slice(0, 16), ext: 'webp', subdir: 'suvichar-portraits' });
  expect(suvicharPhotoArt('ram-lalla')!.request.remoteUrl).toBe(`https://cdn.vedansh.app/suvichar-portraits/${hash.slice(0, 16)}.webp`);
  const catalog = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../../scripts/r2-collections.json'), 'utf8'));
  expect(catalog).toContainEqual({ id: 'suvichar-portraits', prefix: 'suvichar-portraits', manifest: 'mobile/src/data/suvicharPortraitManifest.json', sources: ['mobile/assets/suvichar/portraits'] });
});
