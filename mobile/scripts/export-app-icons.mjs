// Packaging only: resize the approved master without redrawing its geometry.
// Run from any directory: node mobile/scripts/export-app-icons.mjs
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { generateImageAsync, generateImageBackgroundAsync, compositeImagesAsync } from '@expo/image-utils';
import { PNG } from 'pngjs';

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

// The launcher icon is a full parchment tile (good at home-screen size). The
// splash, however, sits on a flat #FFF1D5 field, where the master's honey-cream
// corners and paper grain show up as a hard square "cropped tile" seam. Feather
// the emblem onto the same cream with a superellipse mask so the splash reads as
// a mandala radiating on the field, not a floating icon chip. Keeps the full
// square frame crisp (inside r0) while flooding the image-corners to cream.
function featherSplash(bytes) {
  const img = PNG.sync.read(bytes);
  const { width: w, height: h, data } = img;
  const cxp = (w - 1) / 2, cyp = (h - 1) / 2, half = w / 2;
  const r0 = 0.90, r1 = 1.02, n = 4; // superellipse: preserve frame, drop honey
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const nx = Math.abs(x - cxp) / half, ny = Math.abs(y - cyp) / half;
      const d = Math.pow(Math.pow(nx, n) + Math.pow(ny, n), 1 / n);
      let a;
      if (d <= r0) a = 1;
      else if (d >= r1) a = 0;
      else a = 1 - (d - r0) / (r1 - r0);
      if (a === 1) continue;
      const o = (y * w + x) * 4;
      data[o] = Math.round(data[o] * a + 255 * (1 - a));
      data[o + 1] = Math.round(data[o + 1] * a + 241 * (1 - a));
      data[o + 2] = Math.round(data[o + 2] * a + 213 * (1 - a));
      data[o + 3] = 255;
    }
  }
  return PNG.sync.write(img);
}

save('icon.png', await resize(1024));
save('splash-icon.png', featherSplash(await resize(512)));
save('favicon.png', await resize(64));
// In-app brand mark (Suvichar card badge): 20 dp at up to 3x export density.
save('branding/brand-mark.png', await resize(96));
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
console.log('Exported launcher, adaptive launcher, splash, favicon and brand-mark assets from the approved master.');
