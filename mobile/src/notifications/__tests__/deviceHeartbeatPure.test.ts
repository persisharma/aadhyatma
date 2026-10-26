import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import {
  countEnabledAlarms,
  dayKeyFromDate,
  heartbeatFingerprint,
  HEARTBEAT_ENDPOINT,
  JAPAM_ALARMS_KEY,
  resolveHeartbeatApiKey,
  resolveHeartbeatEndpoint,
  shouldSendHeartbeat,
  toHeartbeatPermission,
  type HeartbeatBody,
} from '../deviceHeartbeatPure';

const body = (over: Partial<HeartbeatBody> = {}): HeartbeatBody => ({
  installId: 'vd-abc',
  platform: 'ios',
  appVersion: '1.5.2',
  notifPermission: 'granted',
  notifCanAskAgain: true,
  alarmEnabled: false,
  alarmCount: 0,
  dayKey: '2026-10-25',
  ...over,
});

test('toHeartbeatPermission passes known states through and folds the rest', () => {
  assert.equal(toHeartbeatPermission('granted'), 'granted');
  assert.equal(toHeartbeatPermission('denied'), 'denied');
  assert.equal(toHeartbeatPermission('undetermined'), 'undetermined');
  assert.equal(toHeartbeatPermission('weird'), 'undetermined');
  assert.equal(toHeartbeatPermission(null), 'undetermined');
  assert.equal(toHeartbeatPermission(undefined), 'undetermined');
});

test('dayKeyFromDate formats the local calendar day zero-padded', () => {
  assert.equal(dayKeyFromDate(new Date(2026, 0, 5, 23, 59)), '2026-01-05');
  assert.equal(dayKeyFromDate(new Date(2026, 10, 25, 0, 0)), '2026-11-25');
});

test('countEnabledAlarms counts only enabled rows', () => {
  const raw = JSON.stringify([
    { id: '1', enabled: true },
    { id: '2', enabled: false },
    { id: '3', enabled: true },
  ]);
  assert.equal(countEnabledAlarms(raw), 2);
});

test('countEnabledAlarms returns 0 for empty, null, non-array or malformed storage', () => {
  assert.equal(countEnabledAlarms(null), 0);
  assert.equal(countEnabledAlarms(undefined), 0);
  assert.equal(countEnabledAlarms(''), 0);
  assert.equal(countEnabledAlarms('[]'), 0);
  assert.equal(countEnabledAlarms('{"not":"an array"}'), 0);
  assert.equal(countEnabledAlarms('not json at all'), 0);
  assert.equal(countEnabledAlarms(JSON.stringify([null, 3, 'x', { enabled: 'yes' }])), 0);
});

test('heartbeatFingerprint is stable for identical state and changes with any field', () => {
  const base = heartbeatFingerprint(body());
  assert.equal(heartbeatFingerprint(body()), base);
  assert.notEqual(heartbeatFingerprint(body({ dayKey: '2026-10-26' })), base);
  assert.notEqual(heartbeatFingerprint(body({ notifPermission: 'denied' })), base);
  assert.notEqual(heartbeatFingerprint(body({ notifCanAskAgain: false })), base);
  assert.notEqual(heartbeatFingerprint(body({ alarmEnabled: true, alarmCount: 1 })), base);
  assert.notEqual(heartbeatFingerprint(body({ appVersion: '1.5.3' })), base);
  assert.notEqual(heartbeatFingerprint(body({ platform: 'android' })), base);
});

test('heartbeatFingerprint ignores the install id', () => {
  assert.equal(heartbeatFingerprint(body({ installId: 'vd-xyz' })), heartbeatFingerprint(body()));
});

test('shouldSendHeartbeat sends only when the fingerprint moved', () => {
  const fp = heartbeatFingerprint(body());
  assert.equal(shouldSendHeartbeat(null, fp), true);
  assert.equal(shouldSendHeartbeat('stale', fp), true);
  assert.equal(shouldSendHeartbeat(fp, fp), false);
});

test('resolveHeartbeatEndpoint prefers the env override, else the baked-in endpoint', () => {
  assert.equal(resolveHeartbeatEndpoint(undefined), HEARTBEAT_ENDPOINT);
  assert.equal(resolveHeartbeatEndpoint(''), HEARTBEAT_ENDPOINT);
  assert.equal(resolveHeartbeatEndpoint('https://staging.example.com/hb'), 'https://staging.example.com/hb');
});

test('resolveHeartbeatApiKey treats a blank key as unconfigured', () => {
  assert.equal(resolveHeartbeatApiKey(undefined), null);
  assert.equal(resolveHeartbeatApiKey(''), null);
  assert.equal(resolveHeartbeatApiKey('secret'), 'secret');
});

test('JAPAM_ALARMS_KEY mirrors STORAGE_KEY in JapamAlarmsContext (drift guard)', () => {
  assert.equal(JAPAM_ALARMS_KEY, '@vedansh/japam-alarms');
  const ctx = readFileSync(join(__dirname, '..', '..', 'contexts', 'JapamAlarmsContext.tsx'), 'utf8');
  assert.ok(
    ctx.includes(`'@vedansh/japam-alarms'`),
    'JapamAlarmsContext no longer uses the pinned storage key — update JAPAM_ALARMS_KEY'
  );
});
