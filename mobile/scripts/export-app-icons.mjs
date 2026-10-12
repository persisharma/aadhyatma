// Packaging only: resize the approved master without redrawing its geometry.
// Run from any directory: node mobile/scripts/export-app-icons.mjs
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { generateImageAsync, generateImageBackgroundAsync, compositeImagesAsync } from '@expo/image-utils';

// Use Expo's lockfile-pinned JS encoder on every machine, including machines
// with optional Sharp installed, so exports and opaque RGB output are stable.
process.env.EXPO_IMAGE_UTILS_NO_SHARP = '1';

const root = fileURLToPath(new URL('../', import.meta.url));
const master = `${root}assets/branding/app-icon-master.png`;
const backgroundColor = '#FFF1D5';
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
const files = {};
async function resize(size) {
  return (await generateImageAsync({ projectRoot: root }, {
    src: master, width: size, height: size, resizeMode: 'contain',
    backgroundColor, removeTransparency: true,
  })).source;
}
function save(name, bytes) {
  writeFileSync(`${root}assets/${name}`, bytes);
  files[name] = { sha256: digest(bytes), width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

save('icon.png', await resize(1024));
save('splash-icon.png', await resize(512));
save('favicon.png', await resize(64));
// Android displays the center 72dp of a 108dp adaptive layer. Place the complete
// tile inside that viewport; the essential central symbol remains inside its
// 66dp safe circle even when launchers use different masks or motion effects.
const foreground = await resize(682);
const background = await generateImageBackgroundAsync({
  width: 1024, height: 1024, resizeMode: 'contain', backgroundColor,
});
save('adaptive-icon.png', await compositeImagesAsync({ foreground, background, x: 171, y: 171 }));
writeFileSync(`${root}assets/branding/app-icon-manifest.json`, `${JSON.stringify({
  source: 'app-icon-master.png', sourceSha256: digest(readFileSync(master)),
  approval: 'User approved the enlarged copper relief icon with vermilion bindu after launcher-size comparison.',
  generator: 'built-in image_gen', prompt: 'app-icon-prompt.txt',
  packaging: 'node mobile/scripts/export-app-icons.mjs', backgroundColor,
  adaptive: { canvas: 1024, artwork: 682, offset: 171, viewportDp: 72, layerDp: 108, safeCircleDp: 66 },
  files,
}, null, 2)}\n`);
console.log('Exported launcher, adaptive launcher, splash and favicon assets from the approved master.');
