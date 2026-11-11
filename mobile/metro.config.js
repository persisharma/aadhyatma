// https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// The Valmiki Ramayan corpus ships as bundled ASSET files (`assets/valmiki-ramayan/*.txt`,
// written by `scripts/build-valmiki-assets.mjs`), not as JS: 27 MB that would otherwise be
// compiled into the Hermes bundle and re-downloaded by every OTA update. Metro decides
// "asset or source" by extension alone, so the extension has to be registered here.
config.resolver.assetExts.push('txt');

module.exports = config;
