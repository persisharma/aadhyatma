// https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');
const { valmikiCorpusDelivery, corpusSourceRequest } = require('./corpusDelivery');

const config = getDefaultConfig(__dirname);

// The Valmiki Ramayan corpus can ship as bundled ASSET files (`assets/valmiki-ramayan/*.txt`,
// written by `scripts/build-valmiki-assets.mjs`) instead of as JS: 27 MB that would otherwise be
// compiled into the Hermes bundle and re-downloaded by every OTA update. Metro decides
// "asset or source" by extension alone, so the extension has to be registered here.
config.resolver.assetExts.push('txt');

// Whether THIS bundle reads those files or carries the corpus itself follows the app version it
// is built for (`corpusDelivery.js`): a runtime whose store binary does not embed the parts keeps
// the corpus in the bundle, so an OTA from the latest branch never breaks an older build. The
// corpus module asks for `./corpusSource`; for such a runtime that one request is answered by
// `corpusSource.inbundle.ts`, and the part files never enter the graph.
const delivery = valmikiCorpusDelivery(require('./app.json').expo.version);
const resolveBefore = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const request = corpusSourceRequest(delivery, context.originModulePath, moduleName);
  return (resolveBefore ?? context.resolveRequest)(context, request, platform);
};

module.exports = config;
module.exports.valmikiCorpusDelivery = delivery;
