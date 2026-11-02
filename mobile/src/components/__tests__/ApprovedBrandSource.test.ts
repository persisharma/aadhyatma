import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = path.resolve(__dirname, '../../../..');
const sha = (bytes: Buffer | string) => createHash('sha256').update(bytes).digest('hex');
const source = fs.readFileSync(path.join(root, 'docs/branding/approved-particle-preview.html'), 'utf8');
const document = JSON.parse(fs.readFileSync(path.join(root, 'mobile/src/branding/approvedParticleDocument.json'), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'mobile/assets/branding/wordmarks/manifest.json'), 'utf8'));

test('native document embeds the accepted animation byte for byte, not a rewritten effect', () => {
  expect(sha(source)).toBe('80603c5af3b2095a3092b177de8c8414698869960ec0ef0ecbd52108de3243c9');
  expect(document.html).toContain(source);
  expect(manifest.particles).toBe(4016); expect(manifest.durationMs).toBe(3350);
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


test('both shipped names preserve every pixel of the exact owner-approved flute master', () => {
  const { PNG } = jest.requireActual('pngjs');
  const masterBytes = fs.readFileSync(path.join(root, 'docs/branding/flute/approved-master.png'));
  expect(sha(masterBytes)).toBe('6c49799a3be827159046f82d0bfe0b401b00a677e4b43d5e9bebdf4004d805c6');
  const master = PNG.sync.read(masterBytes);
  for (const kind of ['en', 'hi']) {
    const metrics = manifest.names[kind];
    const shipped = PNG.sync.read(fs.readFileSync(path.join(root, metrics.file)));
    const exact = new PNG({ width: metrics.width, height: metrics.height });
    PNG.bitblt(master, exact, metrics.crop[0], metrics.crop[1], metrics.width, metrics.height, 0, 0);
    expect(shipped.data.equals(exact.data)).toBe(true);
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
