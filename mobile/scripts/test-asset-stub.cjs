// Test-only preload: lets node/tsx `require()` native asset files that only
// Metro can normally resolve (images, audio, fonts). Stubs each to its
// basename so modules like assets/backgrounds/index.ts load headlessly and
// their data-coverage tests can run in CI. Not bundled into the app.
const path = require('node:path');

const ASSET_EXTENSIONS = [
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg',
  '.mp3', '.wav', '.m4a',
  '.ttf', '.otf',
];

for (const ext of ASSET_EXTENSIONS) {
  require.extensions[ext] = (module, filename) => {
    module.exports = path.basename(filename);
  };
}
