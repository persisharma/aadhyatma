import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, copyFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('../../', import.meta.url));
function run(platform, channel = 'production', { version = '1.5.6', extraEnv = {} } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'ota-platform-'));
  try {
    mkdirSync(join(dir, 'mobile'));
    mkdirSync(join(dir, 'bin'));
    copyFileSync(join(root, 'push.sh'), join(dir, 'push.sh'));
    // push.sh reads the runtime it is publishing to and how the Valmiki corpus travels to it.
    copyFileSync(join(root, 'mobile/corpusDelivery.js'), join(dir, 'mobile/corpusDelivery.js'));
    writeFileSync(join(dir, 'mobile/app.json'), JSON.stringify({ expo: { version } }));
    writeFileSync(join(dir, 'mobile/eas.json'), JSON.stringify({ build: {
      production: { channel: 'production', env: { META_TRACKING_ENABLED: 'true' } },
      preview: { channel: 'preview' },
    } }));
    const capture = join(dir, 'args.json');
    writeFileSync(join(dir, 'bin/npx'), '#!/usr/bin/env node\nrequire("fs").writeFileSync(process.env.CAPTURE, JSON.stringify({args:process.argv.slice(2),tracking:process.env.META_TRACKING_ENABLED}));\n', { mode: 0o755 });
    writeFileSync(join(dir, 'bin/git'), '#!/bin/sh\nexit 0\n', { mode: 0o755 });
    const env = { ...process.env, PATH: `${join(dir, 'bin')}:${process.env.PATH}`, CAPTURE: capture, CHANNEL: channel };
    delete env.META_TRACKING_ENABLED;
    delete env.VALMIKI_CORPUS_DELIVERY;
    Object.assign(env, extraEnv);
    delete env.PLATFORM;
    if (platform !== undefined) env.PLATFORM = platform;
    const message = 'iOS release "quoted"; $(no-execution)';
    const result = spawnSync('bash', [join(dir, 'push.sh'), message], { env, encoding: 'utf8' });
    let published;
    try { published = JSON.parse(readFileSync(capture, 'utf8')); } catch {}
    return { result, published, message };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

for (const platform of ['ios', 'android', 'all', undefined]) {
  test(`publishes exactly requested platform ${platform ?? '(legacy all)'}`, () => {
    const { result, published, message } = run(platform);
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(published.args, ['eas-cli', 'update', '--channel', 'production', '--platform', platform ?? 'all', '--message', message, '--non-interactive']);
    assert.equal(published.tracking, 'true');
  });
}

test('preview channel and its tracking settings survive iOS targeting', () => {
  const { result, published } = run('ios', 'preview');
  assert.equal(result.status, 0, result.stderr);
  assert.equal(published.args[published.args.indexOf('--channel') + 1], 'preview');
  assert.equal(published.tracking, '');
});

for (const platform of ['', 'IOS', 'web', 'ios --platform android']) {
  test(`rejects invalid platform ${JSON.stringify(platform)} before publishing`, () => {
    const { result, published } = run(platform);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /PLATFORM must be/);
    assert.equal(published, undefined);
  });
}

// An OTA from the latest branch must not ask an older store build for the
// Valmiki part files it does not embed (mobile/corpusDelivery.js).
test('an older runtime is published with the Valmiki corpus in the JS bundle', () => {
  for (const version of ['1.5.0', '1.5.6']) {
    const { result, published } = run('all', 'production', { version });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, new RegExp(`Valmiki corpus: in the JS bundle \\(runtime ${version.replaceAll('.', '\\.')} predates`));
    assert.ok(published);
  }
});

test('a runtime whose store build embeds the parts is published with asset files', () => {
  const { result, published } = run('all', 'production', { version: '1.5.7' });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Valmiki corpus: asset files \(runtime 1\.5\.7 embeds/);
  assert.ok(published);
});

test('a mistyped delivery override stops before anything is published', () => {
  const { result, published } = run('all', 'production', { extraEnv: { VALMIKI_CORPUS_DELIVERY: 'asset' } });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /VALMIKI_CORPUS_DELIVERY must be "assets" or "bundle"/);
  assert.equal(published, undefined);
});

