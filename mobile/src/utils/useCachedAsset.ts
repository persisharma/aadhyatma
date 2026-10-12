/**
 * React hook over `cachedAssetUri`: resolves a remote asset to a local
 * `file://` uri, downloading it once and then serving the stored file. Returns
 * null while the download is in flight, when `req` is null (no remote / unknown
 * stem), or if the download fails — callers render a placeholder for null and
 * the next mount retries. Keyed on `remoteUrl`, so a changed hash re-resolves.
 */
import { useEffect, useState } from 'react';

import { cachedAssetUri, type CachedAssetRequest } from '@/utils/assetCache';

export function useCachedAsset(req: CachedAssetRequest | null): string | null {
  const [uri, setUri] = useState<string | null>(null);

  useEffect(() => {
    if (!req) {
      setUri(null);
      return;
    }
    let active = true;
    cachedAssetUri(req)
      .then(local => { if (active) setUri(local); })
      .catch(() => { if (active) setUri(null); });
    return () => { active = false; };
  }, [req?.remoteUrl]);

  return uri;
}
