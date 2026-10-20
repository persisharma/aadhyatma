/** Authoring only (requires sharp): node scripts/build-devotional-master.cjs DEITY ORIGINAL.png TEXT_CLEARED.png
 * Uses reviewed hashes and text fields from the manifest. The text-cleared image
 * supplies only paper under editable letters; every other original pixel stays.
 */
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), sharp = require('sharp');
const directory = path.join(__dirname, '../assets/devotional-share');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
async function build() {
  const [art, originalPath, clearedPath] = process.argv.slice(2), file = path.join(directory, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(file)), spec = manifest.assets[art];
  if (!spec?.textRects || !originalPath || !clearedPath) throw Error('Provide deity, approved source and text-cleared source');
  const originalBytes = fs.readFileSync(originalPath), clearedBytes = fs.readFileSync(clearedPath);
  if (hash(originalBytes) !== spec.sourceSha256 || hash(clearedBytes) !== spec.editedSourceSha256) throw Error('Source hash mismatch; review provenance first');
  const { width, height } = spec, original = await sharp(originalBytes).removeAlpha().raw().toBuffer();
  const cleared = await sharp(clearedBytes).resize(width, height, { fit: 'fill' }).removeAlpha().raw().toBuffer(), mask = Buffer.alloc(width * height);
  for (const [x, y, w, h] of spec.textRects) for (let row = y; row < y + h; row++) for (let col = x; col < x + w; col++) {
    const edge = Math.min(col - x + 1, x + w - col, row - y + 1, y + h - row);
    mask[row * width + col] = Math.max(mask[row * width + col], Math.round(255 * Math.min(1, edge / 4)));
  }
  const output = Buffer.from(original);
  for (let pixel = 0; pixel < mask.length; pixel++) for (let c = 0; c < 3; c++) {
    const i = pixel * 3 + c, blend = mask[pixel] / 255;
    output[i] = Math.round(original[i] * (1 - blend) + cleared[i] * blend);
  }
  const encoded = await sharp(output, { raw: { width, height, channels: 3 } }).webp({ lossless: true }).toBuffer();
  const decoded = await sharp(encoded).removeAlpha().raw().toBuffer();
  for (let i = 0; i < decoded.length; i++) if (!mask[Math.floor(i / 3)] && decoded[i] !== original[i]) throw Error('Protected artwork changed');
  fs.writeFileSync(path.join(directory, spec.file), encoded);
  Object.assign(spec, { bytes: encoded.length, sha256: hash(encoded), protectedPixelChanges: 0 });
  fs.writeFileSync(file, JSON.stringify(manifest, null, 2) + '\n'); console.log({ art, bytes: encoded.length, protectedPixelChanges: 0 });
}
build().catch(error => { console.error(error); process.exitCode = 1; });
