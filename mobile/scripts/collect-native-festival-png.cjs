// Read only the installed simulator app's newly captured view-shot PNG.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const { PNG } = require('pngjs');
const [container, after, destination, focused] = process.argv.slice(2);
if (!container || !after || !destination) throw new Error('container, start epoch ms and destination required');
const files = execFileSync('rg', ['--files', '--hidden', '--no-ignore', path.join(container, 'tmp')], { encoding: 'utf8' }).trim().split('\n');
const captures = files.filter(p => /\.png$/i.test(p) && p.split(path.sep).includes('ReactNative') && fs.statSync(p).mtimeMs >= Number(after));
const decoded = captures.map(p => ({ p, png: PNG.sync.read(fs.readFileSync(p)), time: fs.statSync(p).mtimeMs }));
const match = decoded.filter(({ png }) => png.width === 1080 && (focused === 'true' ? png.height >= 1350 : png.height === 1350)).sort((a, b) => b.time - a.time)[0];
if (!match) throw new Error(`No fresh native 1080×${focused === 'true' ? '>=1350' : '1350'} PNG; capture must not fall back to text`);
const pixels = match.png.data;
let opaque = 0, coloured = 0;
for (let i = 0; i < pixels.length; i += 4) {
  if (pixels[i + 3] > 240) opaque++;
  if (Math.max(pixels[i], pixels[i+1], pixels[i+2]) - Math.min(pixels[i], pixels[i+1], pixels[i+2]) > 20) coloured++;
}
const total = match.png.width * match.png.height;
if (opaque / total < .95 || coloured / total < .05) throw new Error('Native capture is transparent or blank');
fs.copyFileSync(match.p, destination);
console.log(JSON.stringify({ file: path.basename(destination), width: match.png.width, height: match.png.height, bytes: fs.statSync(destination).size, sha256: crypto.createHash('sha256').update(fs.readFileSync(destination)).digest('hex'), opaqueFraction: opaque/total, colouredFraction: coloured/total }));
