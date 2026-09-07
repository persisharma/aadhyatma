import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import {
  EAS_PROJECT_ID,
  PUSH_REGISTRY_ENDPOINT,
  buildDeviceRegistration,
  isPushRegistryConfigured,
  isUsableInstallId,
  makeInstallId,
  registrationFingerprint,
  shouldSyncRegistration,
} from '../pushTokenPure';

const SAMPLE = {
  installId: 'vd-abc-123456',
  token: 'ExponentPushToken[aaaaaaaaaaaaaaaaaaaaaa]',
  platform: 'ios',
  appVersion: '1.4.8',
  lang: 'hi',
  timezone: 'Asia/Kolkata',
};

test('the project id mirrors app.json — a drift here mints tokens for the wrong project', () => {
  const appJson = JSON.parse(
    readFileSync(join(__dirname, '..', '..', '..', 'app.json'), 'utf8')
  );
  assert.equal(EAS_PROJECT_ID, appJson.expo.extra.eas.projectId);
});

test('the upload endpoint ships unset, so no build makes a network call by default', () => {
  assert.equal(PUSH_REGISTRY_ENDPOINT, null);
  assert.equal(isPushRegistryConfigured(PUSH_REGISTRY_ENDPOINT), false);
});

test('only a non-empty https endpoint counts as configured', () => {
  assert.equal(isPushRegistryConfigured('https://push.example.com/devices'), true);
  // Cleartext would put a token addressable to one person's phone on the wire.
  assert.equal(isPushRegistryConfigured('http://push.example.com/devices'), false);
  assert.equal(isPushRegistryConfigured('https://'), false);
  assert.equal(isPushRegistryConfigured(''), false);
  assert.equal(isPushRegistryConfigured(null), false);
});

test('registration fields are trimmed, defaulted and bounded', () => {
  const reg = buildDeviceRegistration({
    installId: '  vd-abc-123456  ',
    token: SAMPLE.token,
    platform: 'android',
    appVersion: '   ',
    lang: null,
    timezone: undefined,
  });
  assert.equal(reg.installId, 'vd-abc-123456');
  assert.equal(reg.appVersion, 'unknown');
  assert.equal(reg.lang, 'hi');
  assert.equal(reg.timezone, 'unknown');

  const long = buildDeviceRegistration({ ...SAMPLE, token: 'x'.repeat(500) });
  assert.equal(long.token.length, 120);
});

test('the fingerprint covers every field a server would target on, not just the token', () => {
  const base = buildDeviceRegistration(SAMPLE);
  assert.equal(shouldSyncRegistration(registrationFingerprint(base), base), false);

  for (const changed of [
    { ...SAMPLE, token: 'ExponentPushToken[bbbbbbbbbbbbbbbbbbbbbb]' },
    { ...SAMPLE, lang: 'gu' },
    { ...SAMPLE, timezone: 'America/New_York' },
    { ...SAMPLE, appVersion: '1.4.9' },
    { ...SAMPLE, platform: 'android' },
    { ...SAMPLE, installId: 'vd-def-654321' },
  ]) {
    assert.equal(
      shouldSyncRegistration(registrationFingerprint(base), buildDeviceRegistration(changed)),
      true,
      `expected a re-sync for ${JSON.stringify(changed)}`
    );
  }

  // A first run has nothing stored, so it must always sync.
  assert.equal(shouldSyncRegistration(null, base), true);
});

test('install ids are deterministic per seed, distinct across seeds and mint times', () => {
  const now = Date.UTC(2026, 8, 7);
  assert.equal(makeInstallId(SAMPLE.token, now), makeInstallId(SAMPLE.token, now));
  assert.notEqual(makeInstallId(SAMPLE.token, now), makeInstallId('other-token', now));
  assert.notEqual(makeInstallId(SAMPLE.token, now), makeInstallId(SAMPLE.token, now + 1));
  assert.match(makeInstallId(SAMPLE.token, now), /^vd-[0-9a-z]+-[0-9a-z]+$/);
  assert.equal(isUsableInstallId(makeInstallId(SAMPLE.token, now)), true);
});

test('a blank or truncated stored install id is not reused', () => {
  assert.equal(isUsableInstallId(null), false);
  assert.equal(isUsableInstallId(''), false);
  assert.equal(isUsableInstallId('   '), false);
  assert.equal(isUsableInstallId('vd-1'), false);
});
