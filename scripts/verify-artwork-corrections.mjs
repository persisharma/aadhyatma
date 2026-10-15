#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { imageSize } = createRequire(path.join(root, 'mobile/package.json'))('image-size');
const folder = path.join(root, 'mobile/assets/artwork-corrections');
const approval = JSON.parse(readFileSync(path.join(folder, 'approved.json'), 'utf8'));
const files = readdirSync(folder).filter(name => name.endsWith('.webp')).sort();
if (files.length !== 5 || files.join() !== Object.keys(approval.assets).sort().join()) throw new Error('Expected the five reviewed refinements');
let bytes = 0;
for (const name of files) {
  const body = readFileSync(path.join(folder, name));
  const expected = approval.assets[name];
  const dimensions = imageSize(body);
  if (createHash('sha256').update(body).digest('hex') !== expected.sha256
    || body.length !== expected.bytes || dimensions.width !== expected.width || dimensions.height !== expected.height) {
    throw new Error('Stale review or invalid image: ' + name);
  }
  if (dimensions.width !== dimensions.height * (name.endsWith('-banner.webp') ? 2 : 1)) throw new Error('Unexpected composition: ' + name);
  bytes += body.length;
}
if (bytes !== approval.total_bytes || bytes >= 1280 * 1024) throw new Error('Bundled refinement budget exceeded');
console.log('Verified five reviewed refinements: ' + bytes + ' bytes');
