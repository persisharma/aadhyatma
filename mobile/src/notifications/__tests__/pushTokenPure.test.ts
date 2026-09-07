import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import {
  EAS_PROJECT_ID,
  PUSH_REGISTRY_ENDPOINT,
  PUSH_SYNC_BASE_DELAY_MS,
  PUSH_SYNC_JITTER_MS,
  PUSH_SYNC_MAX_ATTEMPTS,
  PUSH_SYNC_MAX_DELAY_MS,
  buildDeviceRegistration,
  classifyUploadResponse,
  isPushRegistryConfigured,
  isUsableInstallId,
  makeInstallId,
  registrationFingerprint,
  resolvePushEndpoint,
  retryDelayMs,
  runUploadWithRetry,
  shouldRetryUpload,
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

test('the env var wins over the source fallback, and only https counts', () => {
  const env = 'https://from-env.example.com/devices';
  const src = 'https://from-source.example.com/devices';
  assert.equal(resolvePushEndpoint(env, src), env);
  assert.equal(resolvePushEndpoint(undefined, src), src);
  assert.equal(resolvePushEndpoint('  ', src), src);
  // A cleartext or malformed env value falls back rather than being trusted.
  assert.equal(resolvePushEndpoint('http://from-env.example.com', src), src);
  assert.equal(resolvePushEndpoint('not-a-url', null), null);
  assert.equal(resolvePushEndpoint(undefined, null), null);
  assert.equal(resolvePushEndpoint(` ${env} `, null), env);
});

test('status codes map to retry / accept / give-up', () => {
  for (const ok of [200, 201, 202, 204]) {
    assert.equal(classifyUploadResponse(ok), 'accepted', `${ok}`);
  }
  // No status at all: offline, DNS failure, or our own abort on timeout.
  assert.equal(classifyUploadResponse(null), 'retryable');
  for (const again of [408, 425, 429, 500, 502, 503, 504]) {
    assert.equal(classifyUploadResponse(again), 'retryable', `${again}`);
  }
  // A definitive refusal: the same request would be refused identically.
  for (const no of [400, 401, 403, 404, 409, 422]) {
    assert.equal(classifyUploadResponse(no), 'rejected', `${no}`);
  }
});

test('only a retryable outcome retries, and only within the attempt budget', () => {
  assert.equal(shouldRetryUpload('retryable', 1), true);
  assert.equal(shouldRetryUpload('retryable', PUSH_SYNC_MAX_ATTEMPTS - 1), true);
  assert.equal(shouldRetryUpload('retryable', PUSH_SYNC_MAX_ATTEMPTS), false);
  assert.equal(shouldRetryUpload('accepted', 1), false);
  assert.equal(shouldRetryUpload('rejected', 1), false);
});

test('backoff triples, is clamped, and is jittered per device without randomness', () => {
  const id = 'vd-abc-123456';
  const first = retryDelayMs(1, id);
  const second = retryDelayMs(2, id);
  assert.ok(first >= PUSH_SYNC_BASE_DELAY_MS && first < PUSH_SYNC_BASE_DELAY_MS + PUSH_SYNC_JITTER_MS);
  assert.ok(second >= PUSH_SYNC_BASE_DELAY_MS * 3);
  assert.ok(second < PUSH_SYNC_BASE_DELAY_MS * 3 + PUSH_SYNC_JITTER_MS);

  // Deterministic: same device + attempt ⇒ same delay, every run.
  assert.equal(retryDelayMs(1, id), first);
  // Two devices retrying after the same outage do not land in lockstep.
  assert.notEqual(retryDelayMs(1, 'vd-def-654321'), first);

  // Clamped, so a raised attempt budget cannot produce a runaway wait.
  const far = retryDelayMs(12, id);
  assert.ok(far >= PUSH_SYNC_MAX_DELAY_MS);
  assert.ok(far < PUSH_SYNC_MAX_DELAY_MS + PUSH_SYNC_JITTER_MS);
});

/** Collects the waits a run asked for, so the schedule itself is assertable. */
function fakeClock() {
  const waits: number[] = [];
  return {
    waits,
    sleep: async (ms: number) => {
      waits.push(ms);
    },
  };
}

test('a first-attempt success makes no further request and never sleeps', async () => {
  const clock = fakeClock();
  const seen: number[] = [];
  const result = await runUploadWithRetry({
    attempt: async (n) => {
      seen.push(n);
      return 200;
    },
    sleep: clock.sleep,
    installId: 'vd-abc-123456',
  });
  assert.deepEqual(result, { outcome: 'accepted', attempts: 1 });
  assert.deepEqual(seen, [1]);
  assert.deepEqual(clock.waits, []);
});

test('a transient failure is retried and can still succeed', async () => {
  const clock = fakeClock();
  const statuses = [null, 503, 200];
  const result = await runUploadWithRetry({
    attempt: async (n) => statuses[n - 1],
    sleep: clock.sleep,
    installId: 'vd-abc-123456',
  });
  assert.deepEqual(result, { outcome: 'accepted', attempts: 3 });
  // Two waits for two retries, tripling.
  assert.equal(clock.waits.length, 2);
  assert.ok(clock.waits[1] > clock.waits[0] * 2);
});

test('retries are exhausted, not infinite', async () => {
  const clock = fakeClock();
  let calls = 0;
  const result = await runUploadWithRetry({
    attempt: async () => {
      calls += 1;
      return null;
    },
    sleep: clock.sleep,
    installId: 'vd-abc-123456',
  });
  assert.deepEqual(result, { outcome: 'retryable', attempts: PUSH_SYNC_MAX_ATTEMPTS });
  assert.equal(calls, PUSH_SYNC_MAX_ATTEMPTS);
  // No trailing sleep after the final attempt — nothing is waiting on it.
  assert.equal(clock.waits.length, PUSH_SYNC_MAX_ATTEMPTS - 1);
});

test('a 4xx stops immediately — re-sending an identical rejected body is waste', async () => {
  const clock = fakeClock();
  let calls = 0;
  const result = await runUploadWithRetry({
    attempt: async () => {
      calls += 1;
      return 400;
    },
    sleep: clock.sleep,
    installId: 'vd-abc-123456',
  });
  assert.deepEqual(result, { outcome: 'rejected', attempts: 1 });
  assert.equal(calls, 1);
  assert.deepEqual(clock.waits, []);
});
