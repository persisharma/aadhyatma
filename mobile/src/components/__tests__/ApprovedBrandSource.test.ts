import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = path.resolve(__dirname, '../../../..');
const sha = (bytes: Buffer | string) => createHash('sha256').update(bytes).digest('hex');
const source = fs.readFileSync(path.join(root, 'docs/branding/approved-particle-preview.html'), 'utf8');
const document = JSON.parse(fs.readFileSync(path.join(root, 'mobile/src/branding/approvedParticleDocument.json'), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'mobile/assets/branding/wordmarks/manifest.json'), 'utf8'));

test('native document embeds the accepted animation byte for byte, not a rewritten effect', () => {
  expect(sha(source)).toBe('437c1c12f44d42b61453ffbfd9c17fdf63254a4fd55ecc821c6fae93de443788');
  expect(document.html).toContain(source);
  expect(manifest.particles).toBe(4012); expect(manifest.durationMs).toBe(3350);
  expect(document.html).toContain("send('brand-ready')"); expect(document.html).toContain("send('brand-complete')");
});
test('native hosting hides preview controls and permits no network resources', () => {
  expect(document.html).toContain('.vp-actions{display:none!important}');
  expect(document.html).toContain("default-src 'none'; img-src data:");
  expect(document.html).not.toMatch(/<(?:script|link|img)[^>]+(?:src|href)=["']https?:/i);
});
test('the entire composition and all shipped derivatives match their approved manifest', () => {
  const encoded = source.match(/data:image\/png;base64,([A-Za-z0-9+/=]+)/)![1];
  expect(sha(Buffer.from(encoded, 'base64'))).toBe(manifest.approvedPngSha256);
  for (const [file, entry] of Object.entries(manifest.assets)) {
    const bytes = fs.readFileSync(path.join(root, file));
    expect(sha(bytes)).toBe((entry as { sha256: string }).sha256);
    expect(bytes.length).toBe((entry as { bytes: number }).bytes);
  }
  expect(manifest.lettering.fontBinariesBundled).toBe(false);
});


test('shipped names preserve the master except the documented Hindi dot correction regions', () => {
  const { PNG } = jest.requireActual('pngjs');
  const masterBytes = fs.readFileSync(path.join(root, 'docs/branding/flute/approved-master.png'));
  expect(sha(masterBytes)).toBe('6c49799a3be827159046f82d0bfe0b401b00a677e4b43d5e9bebdf4004d805c6');
  const master = PNG.sync.read(masterBytes);
  for (const kind of ['en', 'hi']) {
    const metrics = manifest.names[kind];
    const shipped = PNG.sync.read(fs.readFileSync(path.join(root, metrics.file)));
    const exact = new PNG({ width: metrics.width, height: metrics.height });
    PNG.bitblt(master, exact, metrics.crop[0], metrics.crop[1], metrics.width, metrics.height, 0, 0);
    for (let y = 0; y < metrics.height; y++) for (let x = 0; x < metrics.width; x++) {
      if (kind === 'hi' && ((x >= 607 && x < 677 && y >= 48 && y < 113) || (x >= 540 && x < 576 && y >= 63 && y < 99) || (x >= 733 && x < 770 && y >= 358 && y < 391))) continue;
      const i = (y * metrics.width + x) * 4;
      if (!shipped.data.subarray(i, i + 4).equals(exact.data.subarray(i, i + 4))) throw Error(`Unexpected pixel edit at ${kind}:${x},${y}`);
    }
    expect(shipped.width).toBe(metrics.width); expect(shipped.height).toBe(metrics.height);
  }
});

test('flute revision changes only composition pixels, preserving the original animation code, icon and subtitles', () => {
  const { PNG } = jest.requireActual('pngjs');
  const previous = fs.readFileSync(path.join(root, 'docs/branding/particle-preview-v1.html'), 'utf8');
  const normalize = (s: string) => s.replace(/data:image\/png;base64,[A-Za-z0-9+/=]+/g, 'COMPOSITION');
  expect(normalize(source)).toBe(normalize(previous));
  const decode = (s: string) => PNG.sync.read(Buffer.from(s.match(/data:image\/png;base64,([A-Za-z0-9+/=]+)/)![1], 'base64'));
  const oldPng = decode(previous), newPng = decode(source);
  for (const [top, bottom] of [[0, 350], [590, 780]]) {
    expect(newPng.data.subarray(top * 720 * 4, bottom * 720 * 4).equals(oldPng.data.subarray(top * 720 * 4, bottom * 720 * 4))).toBe(true);
  }
  let count = 0;
  for (let y = 0; y < 780; y += 3) for (let x = 0; x < 720; x += 3) {
    const i = (y * 720 + x) * 4;
    const [r, g, b, a] = newPng.data.subarray(i, i + 4);
    if (a >= 100 && !(r > 210 && g > 185 && b > 130)) count++;
  }
  expect(count).toBe(manifest.particles);
});

test('Hindi bindu sits over the da aa stroke and nukta is separated from the sh tail', () => {
  const { PNG } = jest.requireActual('pngjs');
  const png = PNG.sync.read(fs.readFileSync(path.join(root, manifest.names.hi.file)));
  const alpha = (x: number, y: number) => png.data[(y * png.width + x) * 4 + 3];
  expect(alpha(558, 81)).toBe(255);
  const upperDotPixels = Array.from({ length: 60 }, (_, i) => 528 + i).filter(x => alpha(x, 81) >= 128);
  const visibleDiameter = upperDotPixels.length * manifest.names.hi.homeFrame.artworkWidth / png.width;
  expect(visibleDiameter).toBeGreaterThanOrEqual(3); // visible at the actual Home header size
  expect(alpha(541, 64)).toBe(0); expect(alpha(575, 64)).toBe(0);
  expect(alpha(558, 100)).toBe(0);
  // The mistaken dot above sh is removed, not duplicated.
  for (let y = 69; y < 93; y++) for (let x = 629; x < 653; x++) expect(alpha(x, y)).toBe(0);
  // The new dot shares the center of the aa stroke (source x=537..579).
  expect(alpha(558, 250)).toBeGreaterThan(200);
  expect(alpha(751, 381)).toBe(255);
  for (let y = 360; y <= 373; y++) expect(alpha(751, y)).toBe(0);
});
