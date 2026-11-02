import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = path.resolve(__dirname, '../../../..');
const sha = (bytes: Buffer | string) => createHash('sha256').update(bytes).digest('hex');
const source = fs.readFileSync(path.join(root, 'docs/branding/approved-particle-preview.html'), 'utf8');
const document = JSON.parse(fs.readFileSync(path.join(root, 'mobile/src/branding/approvedParticleDocument.json'), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'mobile/assets/branding/wordmarks/manifest.json'), 'utf8'));

test('native document embeds the accepted animation byte for byte, not a rewritten effect', () => {
  expect(sha(source)).toBe('af052692ac2477860ae6c0e69ed7ce6754ed5dcf1400f10bd7e78665c6ad69d5');
  expect(document.html).toContain(source);
  expect(manifest.particles).toBe(3809); expect(manifest.durationMs).toBe(3350);
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
