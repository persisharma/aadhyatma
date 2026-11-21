/**
 * React hook over `cachedAssetUri`: resolves a remote asset to a local
 * `file://` uri, downloading it once and then serving the stored file. Returns
 * null while the download is in flight, when `req` is null (no remote / unknown
 * stem), or if the download fails — callers render a placeholder for null and
 * the next mount retries. Keyed on `remoteUrl`, so a changed hash re-resolves.
 */
import { useCallback, useEffect, useState } from 'react';

import { cachedAssetUri, evictCachedAsset, type CachedAssetRequest } from '@/utils/assetCache';

type Resolved = { url: string | null; uri: string | null; failed: boolean };

export type CachedAssetState = {
  uri: string | null;
  /** The download (or verification) failed; `retry` tries again. */
  failed: boolean;
  retry: () => void;
  /** The file was fetched but could not be decoded: drop it and show the failed state. */
  markUndecodable: () => void;
};

/**
 * Same resolution as `useCachedAsset`, plus a failed state and a retry. State is
 * keyed by the request's `remoteUrl`, so a request that changes never shows the
 * previous request's image: it reads as loading until the new one resolves.
 */
export function useCachedAssetState(req: CachedAssetRequest | null): CachedAssetState {
  const url = req?.remoteUrl ?? null;
  const [resolved, setResolved] = useState<Resolved>({ url, uri: null, failed: false });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!req) return undefined;
    let active = true;
    cachedAssetUri(req)
      .then(local => { if (active) setResolved({ url, uri: local, failed: false }); })
      .catch(() => { if (active) setResolved({ url, uri: null, failed: true }); });
    return () => { active = false; };
  }, [url, attempt]);

  const retry = useCallback(() => {
    setResolved({ url, uri: null, failed: false });
    setAttempt(value => value + 1);
  }, [url]);
  const markUndecodable = useCallback(() => {
    if (req) evictCachedAsset(req);
    setResolved({ url, uri: null, failed: true });
  }, [url]);

  const current = resolved.url === url ? resolved : null;
  return { uri: current?.uri ?? null, failed: current?.failed ?? false, retry, markUndecodable };
}

export function useCachedAsset(req: CachedAssetRequest | null): string | null {
  return useCachedAssetState(req).uri;
}
