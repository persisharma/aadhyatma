/**
 * How the Valmiki Ramayan corpus (27 MB) reaches the JavaScript being bundled.
 *
 *   'assets'  The 73 part files under `assets/valmiki-ramayan/`, read on demand
 *             (`src/data/valmiki-ramayan/corpusSource.ts`). The bundle is 25 MB
 *             smaller. Only right for a runtime whose STORE BINARY embeds those
 *             files: anywhere else the update has to download all 27 MB of them
 *             before it can apply, and reads them through a path no older build
 *             has ever exercised.
 *
 *   'bundle'  The kāṇḍa masters compiled into the JS bundle, exactly as they
 *             were before November 2026 (`corpusSource.inbundle.ts`). Needs
 *             nothing from the binary, so it is correct on every build ever
 *             shipped.
 *
 * The choice follows the APP VERSION being bundled for, because that is the
 * runtime (`app.json` → `runtimeVersion.policy: appVersion`). A store build and
 * every OTA published to it are bundled with the same `expo.version` — the OTA
 * workflow rewrites it to the target runtime before `eas update` — so the two
 * can never disagree: an OTA from the latest branch to an older build keeps the
 * corpus in the bundle, and one to a build that embeds the parts leaves it out.
 *
 * Plain CommonJS with no dependencies: `metro.config.js` and `push.sh` load it.
 */

/**
 * The first app version whose store binary embeds the corpus parts.
 *
 * 1.5.6 builds exist without them, so 1.5.6 and everything older stays on
 * 'bundle'. Raise this (never lower it past a version that has shipped) if the
 * first build to embed the parts turns out to be a later one. A build of this
 * version or newer must pass the device checks in
 * `docs/engineering/android-low-end-performance-native-2026-11.md` §4 before it
 * is released.
 */
const VALMIKI_ASSETS_SINCE_VERSION = '1.5.7';

/** Set to `assets` or `bundle` to force a delivery for one bundling run. */
const OVERRIDE_ENV = 'VALMIKI_CORPUS_DELIVERY';

const DELIVERIES = ['assets', 'bundle'];

/** `"1.5.6"` → `[1, 5, 6]`; anything that is not dotted numbers → null. */
function parseVersion(version) {
  if (typeof version !== 'string' || !/^\d+(\.\d+)*$/.test(version.trim())) return null;
  return version.trim().split('.').map(Number);
}

function isAtLeast(version, minimum) {
  const a = parseVersion(version);
  const b = parseVersion(minimum);
  if (!a || !b) return false;
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    const difference = (a[i] ?? 0) - (b[i] ?? 0);
    if (difference !== 0) return difference > 0;
  }
  return true;
}

/**
 * The delivery for a bundle built for `appVersion`. A version that cannot be
 * read gets 'bundle': it works on every binary, where a wrong 'assets' would
 * not.
 */
function valmikiCorpusDelivery(appVersion, env = process.env) {
  const forced = env[OVERRIDE_ENV];
  if (forced !== undefined && forced !== '') {
    if (!DELIVERIES.includes(forced)) {
      throw new Error(`${OVERRIDE_ENV} must be "assets" or "bundle", not "${forced}"`);
    }
    return forced;
  }
  return isAtLeast(appVersion, VALMIKI_ASSETS_SINCE_VERSION) ? 'assets' : 'bundle';
}

const CORPUS_INDEX = /[\\/]src[\\/]data[\\/]valmiki-ramayan[\\/]index\.ts$/;

/**
 * The module name Metro should resolve in place of `moduleName`. Only one
 * request is ever redirected: the corpus module asking for `./corpusSource`
 * while the delivery is 'bundle'.
 */
function corpusSourceRequest(delivery, originModulePath, moduleName) {
  if (delivery === 'bundle' && moduleName === './corpusSource' && CORPUS_INDEX.test(originModulePath ?? '')) {
    return './corpusSource.inbundle';
  }
  return moduleName;
}

/** One line for a publish log. */
function describeValmikiCorpusDelivery(appVersion, env = process.env) {
  const delivery = valmikiCorpusDelivery(appVersion, env);
  const forced = env[OVERRIDE_ENV] ? `, forced by ${OVERRIDE_ENV}` : '';
  return delivery === 'assets'
    ? `asset files (runtime ${appVersion} embeds them since ${VALMIKI_ASSETS_SINCE_VERSION}${forced})`
    : `in the JS bundle (runtime ${appVersion} predates ${VALMIKI_ASSETS_SINCE_VERSION}${forced})`;
}

module.exports = {
  VALMIKI_ASSETS_SINCE_VERSION,
  OVERRIDE_ENV,
  valmikiCorpusDelivery,
  corpusSourceRequest,
  describeValmikiCorpusDelivery,
};
