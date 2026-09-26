const { getDefaultConfig } = require('expo/metro-config');
const fs = require('node:fs');
const path = require('node:path');
if (!fs.existsSync(path.join(__dirname, 'assets/library/library.db'))) {
  throw new Error('Scripture database missing. Run npm run build:library from mobile/ first.');
}
const config = getDefaultConfig(__dirname);
if (!config.resolver.assetExts.includes('db')) config.resolver.assetExts.push('db');
module.exports = config;
