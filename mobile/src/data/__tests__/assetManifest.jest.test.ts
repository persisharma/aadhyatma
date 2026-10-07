/**
 * The remote-asset manifest resolver — the pure join from a manifest stem to a
 * concrete CDN download request. The claims that matter: the URL is built
 * exactly as the uploader + R2 custom domain expect (`<base>/<prefix>/<hash>.<ext>`),
 * and every "no remote" path (unset base, unknown stem) degrades to null rather
 * than a broken URL, so the caller can show its bundled placeholder.
 */
import { assetBaseUrl, remoteAssetRequest, type RemoteAssetManifest } from '@/data/assetManifest';

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

  it('trims a trailing slash', () => {
    process.env.EXPO_PUBLIC_ASSET_BASE_URL = 'https://cdn.vedansh.app/';
    expect(assetBaseUrl()).toBe('https://cdn.vedansh.app');
  });

  it('is null when unset', () => {
    delete process.env.EXPO_PUBLIC_ASSET_BASE_URL;
    expect(assetBaseUrl()).toBeNull();
  });

  it('rejects a non-https value', () => {
    process.env.EXPO_PUBLIC_ASSET_BASE_URL = 'http://insecure.example';
    expect(assetBaseUrl()).toBeNull();
  });
});
