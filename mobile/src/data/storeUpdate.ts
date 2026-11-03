/** Optional store-update campaign; never gates navigation or changes the OTA runtime. */
export const STORE_UPDATE_VERSION = '1.5.4';
export const STORE_UPDATE_KEY = '@vedansh/store-update-1.5.4';
export const STORE_UPDATE_REST_MS = 3 * 24 * 60 * 60 * 1000;

function parts(version: unknown): number[] | null {
  if (typeof version !== 'string' || !/^\d+\.\d+\.\d+$/.test(version)) return null;
  const values = version.split('.').map(Number);
  return values.every(Number.isSafeInteger) ? values : null;
}

export function isOlderStoreVersion(version: unknown): boolean {
  const installed = parts(version), target = parts(STORE_UPDATE_VERSION)!;
  if (!installed) return false;
  for (let i = 0; i < target.length; i++) {
    if (installed[i] !== target[i]) return installed[i] < target[i];
  }
  return false;
}

export function storeUpdateDue(version: unknown, raw: string | null, now = Date.now()): boolean {
  if (!isOlderStoreVersion(version) || !Number.isFinite(now)) return false;
  if (raw === null) return true;
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return false;
    return now - value >= STORE_UPDATE_REST_MS;
  } catch {
    return false;
  }
}
