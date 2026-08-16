/**
 * Identity of the JS build currently running, as one string.
 *
 * Paired with `derivedCacheReset`: when this changes, the derived caches are
 * dropped, so a bug baked into cached data cannot survive the update that fixes
 * it. It only has to CHANGE reliably — it is never parsed, compared for order, or
 * shown to a user.
 *
 * Isolated in its own module because `expo-updates` and `expo-constants` are
 * untranspiled ESM that Jest cannot parse. Only `App.tsx` imports this; the reset
 * machinery itself takes the fingerprint as a plain string so it stays importable
 * by the caches (and by ~90 test suites that reach them).
 */
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';

/** Read one field, tolerating a dev client where these throw or are absent. */
function safe(read: () => string | number | null | undefined): string {
  try {
    const value = read();
    return value == null || value === '' ? '' : String(value);
  } catch {
    return '';
  }
}

/**
 * The four parts, and what each one catches:
 *
 * - `Updates.updateId` — the OTA. A new bundle means a new id; `embedded` when the
 *   app is running the bundle shipped inside the binary, so a rollback from an
 *   OTA back to embedded reads as a change too, which is right.
 * - `Updates.runtimeVersion` — the store version. `app.json` sets
 *   `runtimeVersion.policy: appVersion`, so this moves on every store release.
 * - `expoConfig.version` — the same version as declared by the RUNNING bundle.
 *   Redundant with runtimeVersion only for as long as that policy stays
 *   `appVersion`; keeping it means changing the policy cannot quietly disable this.
 * - the native build number — catches a rebuild of the SAME version (1.4.7
 *   build 52 → 53), which under the appVersion policy shares a runtimeVersion and
 *   would otherwise look identical. iOS carries a string, Android an integer.
 *
 * Redundancy is safe here: extra parts can only make the fingerprint stricter,
 * and a false change costs one launch's worth of re-solves.
 */
export function currentBuildFingerprint(): string {
  const config = (() => {
    try {
      return Constants.expoConfig ?? null;
    } catch {
      return null;
    }
  })();

  return [
    safe(() => Updates.updateId) || 'embedded',
    safe(() => Updates.runtimeVersion) || 'no-runtime',
    safe(() => config?.version) || 'no-version',
    safe(() => config?.ios?.buildNumber ?? config?.android?.versionCode) || 'no-build',
  ].join('|');
}
