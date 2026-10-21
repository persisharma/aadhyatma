import { backgroundAsset, backgroundRequest } from '../backgroundAsset';
import { artworkRequest } from '../artworkAsset';
import { readerIllustrationAsset, readerIllustrationRequest, resolveReaderIllustration } from '../readerIllustrationAsset';
import aliases from '../readerIllustrationAliases.json';
import backgrounds from '../backgroundAssetManifest.json';

jest.mock('../readerIllustrationManifest.json', () => ({
  prefix: 'reader-illustrations',
  assets: { 'source-vishnu-narayana': { hash: 'approved-fixture-hash', ext: 'webp', width: 960, height: 480 } },
}));

test('reader replacements use their own R2 category without replacing background requests', () => {
  const legacy = backgroundAsset('backgrounds--source-vishnu-narayana-option2');
  const replacement = resolveReaderIllustration(legacy);
  expect(replacement).toEqual(readerIllustrationAsset('source-vishnu-narayana'));
  expect(artworkRequest(replacement)).toMatchObject({
    key: 'approved-fixture-hash', subdir: 'reader-illustrations',
    remoteUrl: expect.stringContaining('/reader-illustrations/approved-fixture-hash.webp'),
  });
  expect(backgroundRequest(legacy)).toMatchObject({ subdir: 'reading-backgrounds' });
  expect(artworkRequest(legacy)).toEqual(backgroundRequest(legacy));
});

test('unpublished artwork cannot trigger speculative requests or replace existing art', () => {
  const existing = backgroundAsset('backgrounds--deity-krishna-bansuri');
  expect(resolveReaderIllustration(existing)).toBe(existing);
  expect(readerIllustrationRequest(readerIllustrationAsset('not-published'))).toBeNull();
  expect(resolveReaderIllustration(15)).toBe(15);
  expect(artworkRequest(null)).toBeNull();
});

test('the deferred vidhi category still resolves through the shared artwork loader', () => {
  expect(artworkRequest({ kind: 'vidhi-artwork', stem: 'ganesha-upachara' })).toMatchObject({
    subdir: 'vidhi-steps',
    remoteUrl: expect.stringMatching(/\/vidhi-steps\/[a-f0-9]{16}\.webp$/),
  });
});

test('the separate category preserves all semantic slots and aliases both Vishnu paintings', () => {
  expect(Object.keys(aliases)).toHaveLength(44);
  expect(new Set(Object.values(aliases)).size).toBe(43);
  for (const stem of Object.keys(aliases)) expect(backgrounds.assets).toHaveProperty(stem);
  expect(aliases['backgrounds--source-vishnu-narayana-option2']).toBe(aliases['backgrounds--source-vishnu-narayana']);
});
