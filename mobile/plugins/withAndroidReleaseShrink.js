const fs = require('fs');
const path = require('path');
const { withDangerousMod, withGradleProperties } = require('@expo/config-plugins');
const { mergeContents } = require('@expo/config-plugins/build/utils/generateCode');

/**
 * Android release builds: shrink the code (R8) and drop unused resources.
 *
 * The Expo template leaves both off. They are plain Gradle properties the
 * template's `app/build.gradle` already reads, so this plugin sets them rather
 * than adding a dependency for it:
 *
 *   android.enableMinifyInReleaseBuilds          → `minifyEnabled`
 *   android.enableShrinkResourcesInReleaseBuilds → `shrinkResources`
 *
 * WHY IT IS SAFE TO SHRINK RESOURCES. React Native looks bundled images and raw
 * files up by NAME at runtime, which the resource shrinker cannot see. Expo's
 * embed step writes `res/raw/keep.xml` listing every bundled asset
 * (`@expo/cli` → `createKeepFileAsync`), so those are kept explicitly.
 *
 * WHY THE KEEP RULES. Libraries carry their own consumer rules. The code this
 * repo owns does not: the Japam alarm receivers/module and the widget
 * provider/module (both under the app package), and the two local Expo modules.
 * They are small and several are reached by name from the manifest or by
 * reflection from React Native, so they are kept whole.
 *
 * Native: takes effect only in a new store build. To back it out, remove the
 * plugin from app.json.
 */
const TAG = 'vedansh-android-release-shrink';

const SHRINK_PROPERTIES = {
  'android.enableMinifyInReleaseBuilds': 'true',
  'android.enableShrinkResourcesInReleaseBuilds': 'true',
};

/** Local Expo modules (`mobile/modules/*`), which live outside the app package. */
const LOCAL_MODULE_PACKAGES = ['expo.modules.vedanshface', 'expo.modules.vedanshmeta'];

function applyShrinkProperties(properties) {
  const next = properties.filter((item) => !(item.type === 'property' && item.key in SHRINK_PROPERTIES));
  for (const [key, value] of Object.entries(SHRINK_PROPERTIES)) next.push({ type: 'property', key, value });
  return next;
}

function keepRules(appPackage) {
  return [appPackage, ...LOCAL_MODULE_PACKAGES].map((pkg) => `-keep class ${pkg}.** { *; }`).join('\n');
}

function addKeepRules(contents, appPackage) {
  // Already present (prebuild without --clean re-runs mods on the same file).
  if (contents.includes(`@generated begin ${TAG}`)) return contents;
  return mergeContents({
    tag: TAG,
    src: contents,
    newSrc: keepRules(appPackage),
    anchor: /$/,
    offset: contents.split('\n').length,
    comment: '#',
  }).contents;
}

function withAndroidReleaseShrink(config) {
  config = withGradleProperties(config, (cfg) => {
    cfg.modResults = applyShrinkProperties(cfg.modResults);
    return cfg;
  });
  return withDangerousMod(config, [
    'android',
    async (cfg) => {
      const appPackage = cfg.android && cfg.android.package;
      if (!appPackage) throw new Error('withAndroidReleaseShrink: android.package is not set');
      const file = path.join(cfg.modRequest.platformProjectRoot, 'app', 'proguard-rules.pro');
      const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
      fs.writeFileSync(file, addKeepRules(current, appPackage));
      return cfg;
    },
  ]);
}

module.exports = withAndroidReleaseShrink;
module.exports.applyShrinkProperties = applyShrinkProperties;
module.exports.addKeepRules = addKeepRules;
module.exports.keepRules = keepRules;
module.exports.SHRINK_PROPERTIES = SHRINK_PROPERTIES;
module.exports.LOCAL_MODULE_PACKAGES = LOCAL_MODULE_PACKAGES;
