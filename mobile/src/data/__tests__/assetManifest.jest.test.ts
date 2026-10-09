/**
 * The remote-asset manifest resolver — the pure join from a manifest stem to a
 * concrete CDN download request. The claims that matter: the URL is built
 * exactly as the uploader + R2 custom domain expect (`<base>/<prefix>/<hash>.<ext>`),
 * and every "no remote" path (unset base, unknown stem) degrades to null rather
 * than a broken URL, so the caller can show its bundled placeholder.
 */
import { assetBaseUrl, PRODUCTION_ASSET_BASE_URL, remoteAssetRequest, type RemoteAssetManifest } from '@/data/assetManifest';

const manifest: RemoteAssetManifest = {
  prefix: 'kids-stories',
  assets: { 'kj-01': { hash: 'deadbeef12345678', ext: 'webp' } },
};

describe('remoteAssetRequest', () => {
  it('builds the download request matching the CDN key layout', () => {
    const req = remoteAssetRequest(manifest, 'kj-01', 'https://cdn.vedansh.app');
    expect(req).toEqual({
      key: 'deadbeef12345678',
      ext: 'webp',
      subdir: 'kids-stories',
      remoteUrl: 'https://cdn.vedansh.app/kids-stories/deadbeef12345678.webp',
    });
  });

  it('returns null for an unknown stem', () => {
    expect(remoteAssetRequest(manifest, 'kj-99', 'https://cdn.vedansh.app')).toBeNull();
  });

  it('returns null when no base URL is configured', () => {
    expect(remoteAssetRequest(manifest, 'kj-01', null)).toBeNull();
  });
});

describe('assetBaseUrl', () => {
  const ORIGINAL = process.env.EXPO_PUBLIC_ASSET_BASE_URL;
  afterEach(() => {
    if (ORIGINAL === undefined) delete process.env.EXPO_PUBLIC_ASSET_BASE_URL;
    else process.env.EXPO_PUBLIC_ASSET_BASE_URL = ORIGINAL;
  });

  it('trims a trailing slash on an override', () => {
    process.env.EXPO_PUBLIC_ASSET_BASE_URL = 'https://cdn.example.test/';
    expect(assetBaseUrl()).toBe('https://cdn.example.test');
  });

  it('defaults to the production CDN when unset (so OTA bundles still resolve)', () => {
    delete process.env.EXPO_PUBLIC_ASSET_BASE_URL;
    expect(assetBaseUrl()).toBe(PRODUCTION_ASSET_BASE_URL);
  });

  it('falls back to the production CDN for a non-https value', () => {
    process.env.EXPO_PUBLIC_ASSET_BASE_URL = 'http://insecure.example';
    expect(assetBaseUrl()).toBe(PRODUCTION_ASSET_BASE_URL);
  });
});
