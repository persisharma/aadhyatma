#!/usr/bin/env node
/** Re-encode only the nine lossless authoring masters, never an already lossy delivery.
 * Requires cwebp 1.6.0. The pinned Git revision preserves the approved lossless
 * originals without duplicating 18 MB in the current checkout or app bundle.
 * Run prepare-devotional-share.mjs afterwards; publishing remains a separate step.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const folder = 'mobile/assets/devotional-share';
const ref = 'd98433ad1ea05233e418bfffa720952bae198cfb';
const sha = b => createHash('sha256').update(b).digest('hex');
const original = JSON.parse(execFileSync('git', ['show', `${ref}:${folder}/manifest.json`], { cwd: root }));
const file = path.join(root, folder, 'manifest.json');
const manifest = JSON.parse(readFileSync(file));
const encoderVersion = execFileSync('cwebp', ['-version'], { encoding: 'utf8' }).trim();
assert.equal(encoderVersion, '1.6.0\nlibsharpyuv: 0.4.2', 'Use the reviewed encoder version or re-review outputs');
const temp = mkdtempSync(path.join(tmpdir(), 'devotional-encode-'));
try {
  for (const [art, source] of Object.entries(original.assets)) {
    if (art === 'prayer') continue;
    const input = execFileSync('git', ['show', `${ref}:${folder}/${source.file}`], { cwd: root, maxBuffer: 4 * 1024 * 1024 });
    assert.equal(sha(input), source.sha256, `${art}: original hash`);
    const inputFile = path.join(temp, source.file);
    writeFileSync(inputFile, input);
    const outputFile = path.join(root, folder, source.file);
    const args = ['-q', '94', '-m', '6', '-sharp_yuv', '-print_ssim', inputFile, '-o', outputFile];
    const result = spawnSync('cwebp', args, { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    const output = readFileSync(outputFile);
    assert.ok(output.length < 600 * 1024, `${art}: delivery budget`);
    const a = manifest.assets[art];
    delete a.protectedPixelChanges;
    Object.assign(a, {
      bytes: output.length, sha256: sha(output),
      authoringMaster: { gitRef: ref, file: `${folder}/${source.file}`, sha256: source.sha256, bytes: source.bytes, protectedPixelChanges: 0 },
      deliveryEncoding: { codec: 'webp', encoder: `cwebp ${encoderVersion}`, quality: 94, method: 6, sharpYuv: true },
      provenance: 'Approved lossless composite retained at authoringMaster.gitRef. Only recorded text fields were edited in that composite, with zero protected-pixel changes. Delivery is perceptually compressed at the original resolution; decoded delivery pixels are not identical to the authoring master.',
    });
    console.log(JSON.stringify({ art, beforeBytes: source.bytes, afterBytes: output.length, encoderReport: result.stderr }));
  }
  writeFileSync(file, JSON.stringify(manifest, null, 2) + '\n');
} finally { rmSync(temp, { recursive: true, force: true }); }
