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
 * WHY IT IS SAFE TO SHRINK RESOURCES. The shrinker only follows references it
 * can read; a resource looked up by a NAME built at runtime is invisible to it
 * and is emptied or dropped. Three groups are reached that way, and each has an
 * explicit keep:
 *
 *   - Metro's bundled images and raw files (React Native resolves them by
 *     name): Expo's embed step writes `res/raw/keep.xml` listing every one
 *     (`@expo/cli` → `createKeepFileAsync`).
 *   - The Japam alarm sounds. `expo-notifications` copies app.json's `sounds[]`
 *     into `res/raw`, and `JapamAlarmReceiver` (and a notification channel's
 *     custom sound) finds them with `getIdentifier(<mantra id>, "raw", …)`.
 *     Nothing else names them, so without a keep the alarm would ring silent
 *     or fall back to the system tone. This plugin writes
 *     `res/raw/vedansh_release_keep.xml` keeping every raw resource.
 *   - The widget backgrounds: `plugins/home-widgets` ships its own keep file.
 *
 * `AndroidReleaseShrinkPlugin.test.ts` fails when app-owned native code starts
 * looking up a resource type by name that none of these covers.
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

/**
 * Not `keep.xml`: Expo's embed step generates a file of that name at build time
 * and two resources called `raw/keep` would fail the merge.
 */
const RAW_KEEP_FILE = 'vedansh_release_keep.xml';
const RAW_KEEP_XML = `<?xml version="1.0" encoding="utf-8"?>
<!-- Raw resources are looked up by a name built at runtime (the Japam alarm sounds
     through getIdentifier, Metro's raw assets through React Native), which the
     resource shrinker cannot follow. Keep all of them. -->
<resources xmlns:tools="http://schemas.android.com/tools" tools:keep="@raw/*" />
`;

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

function writeRawKeepFile(platformProjectRoot) {
  const directory = path.join(platformProjectRoot, 'app', 'src', 'main', 'res', 'raw');
  fs.mkdirSync(directory, { recursive: true });
  const file = path.join(directory, RAW_KEEP_FILE);
  fs.writeFileSync(file, RAW_KEEP_XML);
  return file;
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
      writeRawKeepFile(cfg.modRequest.platformProjectRoot);
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
module.exports.writeRawKeepFile = writeRawKeepFile;
module.exports.RAW_KEEP_FILE = RAW_KEEP_FILE;
module.exports.RAW_KEEP_XML = RAW_KEEP_XML;
