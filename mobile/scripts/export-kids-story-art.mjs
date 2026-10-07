// Packaging only: retain the top of generated art, trim empty parchment at the
// foot to 4:5, and export identical offline native/browser WebP files.
// Usage: node scripts/export-kids-story-art.mjs pt04 /absolute/generated.png
import { readFileSync, copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const [key, source] = process.argv.slice(2);
if (!/^(pt|ka|gb|hs)0[1-7]$/.test(key ?? '') || !source) {
  throw new Error('Provide a scene key and generated PNG path.');
}
const bytes = readFileSync(source);
if (bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new Error('Expected PNG master.');
const width = bytes.readUInt32BE(16);
const height = bytes.readUInt32BE(20);
const alreadyPortrait = Math.abs(width / height - 4 / 5) < 0.001;
const cropWidth = alreadyPortrait ? width : Math.min(width, Math.floor(height * 4 / 5));
const cropHeight = alreadyPortrait ? height : Math.min(height, Math.floor(width * 5 / 4));
const fileName = `${key.slice(0, 2)}-${key.slice(2)}.webp`;
const native = fileURLToPath(new URL(`../assets/kids-stories/${fileName}`, import.meta.url));
const browser = fileURLToPath(new URL(`../../docs/assets/kids-stories/${fileName}`, import.meta.url));
execFileSync('cwebp', ['-quiet', '-q', '86', '-crop', String(Math.floor((width - cropWidth) / 2)), '0', String(cropWidth), String(cropHeight), '-resize', '1122', '1402', source, '-o', native]);
copyFileSync(native, browser);
console.log(`${key}: ${width}x${height} → 1122x1402 (${readFileSync(native).length} bytes)`);
