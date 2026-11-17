import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import type { CachedAssetRequest } from '@/utils/assetCache';

const mockResolve = jest.fn();
const mockEvict = jest.fn();
jest.mock('@/utils/assetCache', () => ({
  cachedAssetUri: (req: unknown) => mockResolve(req),
  evictCachedAsset: (req: unknown) => mockEvict(req),
}));

import { useCachedAsset, useCachedAssetState, type CachedAssetState } from '@/utils/useCachedAsset';

const req = (key: string): CachedAssetRequest => ({ key, ext: 'webp', subdir: 's', remoteUrl: `https://cdn/${key}.webp` });
const flush = () => act(async () => { await Promise.resolve(); await Promise.resolve(); });

let state: CachedAssetState;
let plain: string | null = null;
function Probe({ request }: { request: CachedAssetRequest | null }) {
  state = useCachedAssetState(request);
  return null;
}
function SimpleProbe({ request }: { request: CachedAssetRequest | null }) {
  plain = useCachedAsset(request);
  return null;
}
function mount(request: CachedAssetRequest | null) {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<Probe request={request} />); });
  return tree;
}

beforeEach(() => { mockResolve.mockReset(); mockEvict.mockReset(); });

describe('useCachedAsset', () => {
  it('resolves to the local uri', async () => {
    mockResolve.mockResolvedValue('file:///a.webp');
    mount(req('a'));
    expect(state.uri).toBeNull();
    await flush();
    expect(state.uri).toBe('file:///a.webp');
  });

  it('the plain hook still returns just the uri', async () => {
    mockResolve.mockResolvedValue('file:///a.webp');
    act(() => { TestRenderer.create(<SimpleProbe request={req('a')} />); });
    await flush();
    expect(plain).toBe('file:///a.webp');
  });

  it('BEH-17: a changed request never shows the previous image while the new one resolves', async () => {
    let finishB!: (uri: string) => void;
    mockResolve.mockImplementation((r: CachedAssetRequest) =>
      r.key === 'a' ? Promise.resolve('file:///a.webp') : new Promise<string>((resolve) => { finishB = resolve; }));
    const tree = mount(req('a'));
    await flush();
    expect(state.uri).toBe('file:///a.webp');

    act(() => tree.update(<Probe request={req('b')} />));
    // Same render pass that sees the new request: no stale picture.
    expect(state.uri).toBeNull();
    await act(async () => { finishB('file:///b.webp'); });
    expect(state.uri).toBe('file:///b.webp');
  });

  it('UX-04: reports a failed download and retries it', async () => {
    mockResolve.mockRejectedValueOnce(new Error('offline')).mockResolvedValue('file:///a.webp');
    mount(req('a'));
    await flush();
    expect(state.failed).toBe(true);
    expect(state.uri).toBeNull();

    act(() => state.retry());
    expect(state.failed).toBe(false); // back to loading
    await flush();
    expect(state.uri).toBe('file:///a.webp');
    expect(mockResolve).toHaveBeenCalledTimes(2);
  });

  it('an undecodable file is evicted and shown as failed', async () => {
    mockResolve.mockResolvedValue('file:///a.webp');
    mount(req('a'));
    await flush();
    act(() => state.markUndecodable());
    expect(mockEvict).toHaveBeenCalledWith(expect.objectContaining({ key: 'a' }));
    expect(state.failed).toBe(true);
    expect(state.uri).toBeNull();
  });

  it('a null request neither loads nor fails', async () => {
    mount(null);
    await flush();
    expect(state).toMatchObject({ uri: null, failed: false });
    expect(mockResolve).not.toHaveBeenCalled();
  });
});
