const { withAndroidManifest, withInfoPlist } = require('@expo/config-plugins');

/**
 * Lets the share sheet open WhatsApp and Instagram directly (design.md §39.11,
 * `src/utils/directShare.ts`).
 *
 * - iOS: `Linking.canOpenURL` answers only for schemes listed in
 *   `LSApplicationQueriesSchemes`; the Instagram story hand-off probes
 *   `instagram-stories://` before opening it (iOS post keeps the OS sheet).
 * - Android 11+: package visibility hides other apps unless the manifest names them
 *   in `<queries>`; react-native-share's installed check would otherwise always say
 *   "not installed" and the rows would keep the OS share list.
 *
 * Native: takes effect only in a new store build. On an older binary every probe is
 * false and the share sheet keeps the OS share list (the unchanged path).
 */
const IOS_QUERY_SCHEMES = ['instagram-stories'];
const ANDROID_QUERY_PACKAGES = ['com.whatsapp', 'com.whatsapp.w4b', 'com.instagram.android'];

/** Merge the schemes into an Info.plist object without dropping existing entries. */
function addQuerySchemes(infoPlist) {
  const existing = Array.isArray(infoPlist.LSApplicationQueriesSchemes) ? infoPlist.LSApplicationQueriesSchemes : [];
  return { ...infoPlist, LSApplicationQueriesSchemes: [...new Set([...existing, ...IOS_QUERY_SCHEMES])] };
}

/** Add one `<queries>` block naming each package, keeping every existing query. */
function addPackageQueries(androidManifest) {
  const manifest = androidManifest.manifest;
  const queries = Array.isArray(manifest.queries) && manifest.queries.length ? manifest.queries : [{}];
  const named = new Set(
    queries.flatMap((q) => (q.package ?? []).map((p) => p?.$?.['android:name'])).filter(Boolean)
  );
  const missing = ANDROID_QUERY_PACKAGES.filter((name) => !named.has(name));
  const first = { ...queries[0], package: [...(queries[0].package ?? []), ...missing.map((name) => ({ $: { 'android:name': name } }))] };
  return { ...androidManifest, manifest: { ...manifest, queries: [first, ...queries.slice(1)] } };
}

function withShareTargetApps(config) {
  config = withInfoPlist(config, (cfg) => {
    cfg.modResults = addQuerySchemes(cfg.modResults);
    return cfg;
  });
  return withAndroidManifest(config, (cfg) => {
    cfg.modResults = addPackageQueries(cfg.modResults);
    return cfg;
  });
}

module.exports = withShareTargetApps;
module.exports.addQuerySchemes = addQuerySchemes;
module.exports.addPackageQueries = addPackageQueries;
module.exports.IOS_QUERY_SCHEMES = IOS_QUERY_SCHEMES;
module.exports.ANDROID_QUERY_PACKAGES = ANDROID_QUERY_PACKAGES;
