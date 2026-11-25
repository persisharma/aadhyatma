const { withAndroidManifest } = require('expo/config-plugins');

const FEATURE_NAME = 'android.hardware.screen.portrait';

/**
 * Mark the implied portrait hardware feature as optional.
 *
 * `expo.orientation: "portrait"` locks the activity to portrait, which makes
 * Google Play infer a *required* `android.hardware.screen.portrait` feature and
 * hide the app from devices that cannot report a portrait sensor — ChromeOS,
 * Android desktop and Android XR. Those users show up in Play Console as
 * "can't install your app because of unsupported hardware features".
 *
 * Declaring the feature explicitly with `android:required="false"` overrides the
 * implied requirement: the lock still applies at runtime, but availability is no
 * longer gated on the hardware feature.
 *
 * Native: takes effect only in a new store build.
 */
module.exports = function withAndroidPortraitOptional(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    manifest['uses-feature'] = manifest['uses-feature'] || [];

    const existing = manifest['uses-feature'].find(
      (f) => f.$ && f.$['android:name'] === FEATURE_NAME
    );
    if (existing) {
      existing.$['android:required'] = 'false';
    } else {
      manifest['uses-feature'].push({
        $: {
          'android:name': FEATURE_NAME,
          'android:required': 'false',
        },
      });
    }
    return config;
  });
};
