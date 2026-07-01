import assert from 'node:assert/strict';

import { getJapamAlarmSoundName } from '../../../assets/japam-alarm-sounds';
import {
  MAX_JAPAM_ALARMS,
  JAPAM_ALARM_IDENTIFIER_PREFIX,
  isJapamAlarmPayload,
  makeAlarmId,
  nextFireTimestamp,
  notificationIdentifierFor,
  parseStoredAlarms,
  sortAlarms,
  type JapamAlarm,
} from '../japamAlarms';

// Identifier prefix is namespaced so the scheduler can safely cancel only
// its own pending notifications.
{
  assert.ok(JAPAM_ALARM_IDENTIFIER_PREFIX.length > 0);
  const id = notificationIdentifierFor('abc');
  assert.ok(id.startsWith(JAPAM_ALARM_IDENTIFIER_PREFIX + ':'));
}

// MAX_JAPAM_ALARMS leaves room for the daily-verse rolling window.
{
  assert.ok(MAX_JAPAM_ALARMS >= 1);
  assert.ok(MAX_JAPAM_ALARMS <= 16, `MAX_JAPAM_ALARMS=${MAX_JAPAM_ALARMS} eats too many iOS slots`);
}

// isJapamAlarmPayload narrows correctly.
{
  assert.equal(isJapamAlarmPayload(null), false);
  assert.equal(isJapamAlarmPayload({}), false);
  assert.equal(isJapamAlarmPayload({ type: 'daily-verse' }), false);
  assert.equal(
    isJapamAlarmPayload({ type: 'japam-alarm', alarmId: 'a', mantraId: 'b' }),
    true
  );
  assert.equal(
    isJapamAlarmPayload({ type: 'japam-alarm', alarmId: 1, mantraId: 'b' }),
    false
  );
}

// makeAlarmId produces unique ids for distinct timestamps.
{
  const ids = new Set<string>();
  for (let i = 0; i < 50; i += 1) ids.add(makeAlarmId(Date.now() + i));
  assert.ok(ids.size === 50);
}

// parseStoredAlarms is tolerant of garbage and caps at MAX_JAPAM_ALARMS.
{
  assert.deepEqual(parseStoredAlarms(null), []);
  assert.deepEqual(parseStoredAlarms('{}'), []);
  assert.deepEqual(parseStoredAlarms('not json at all'), []);
  const tooMany: JapamAlarm[] = Array.from(
    { length: MAX_JAPAM_ALARMS + 5 },
    (_, i) => ({
      id: `id-${i}`,
      mantraId: 'om-namah-shivaya',
      time: { hour: 6, minute: i % 60 },
      enabled: true,
    })
  );
  const parsed = parseStoredAlarms(JSON.stringify(tooMany));
  assert.equal(parsed.length, MAX_JAPAM_ALARMS);
}

// parseStoredAlarms rejects malformed entries but keeps valid neighbours.
{
  const mixed: unknown[] = [
    { id: 'good', mantraId: 'om-namah-shivaya', time: { hour: 7, minute: 0 }, enabled: true },
    { id: 'bad-time', mantraId: 'm', time: { hour: 25, minute: 0 }, enabled: true },
    { id: 'bad-enabled', mantraId: 'm', time: { hour: 7, minute: 0 }, enabled: 'yes' },
    { id: 'missing-mantra', time: { hour: 7, minute: 0 }, enabled: true },
  ];
  const parsed = parseStoredAlarms(JSON.stringify(mixed));
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0]?.id, 'good');
}

// sortAlarms is deterministic on time, falls back to id for ties.
{
  const a: JapamAlarm = { id: 'z', mantraId: 'm', time: { hour: 6, minute: 0 }, enabled: true };
  const b: JapamAlarm = { id: 'a', mantraId: 'm', time: { hour: 6, minute: 0 }, enabled: true };
  const c: JapamAlarm = { id: 'q', mantraId: 'm', time: { hour: 5, minute: 0 }, enabled: true };
  const sorted = sortAlarms([a, b, c]);
  assert.deepEqual(sorted.map((s) => s.id), ['q', 'a', 'z']);
}

// getJapamAlarmSoundName maps a mantra to its bundled alarm-clip filename
// (WITH extension — what AlarmKit's `.named()` and expo-notifications expect),
// and null when no clip exists so callers fall back to the system alarm tone.
{
  assert.equal(getJapamAlarmSoundName('om-namah-shivaya'), 'om-namah-shivaya.wav');
  // Mantras without a bundled clip (commented-out entries / unknown ids).
  assert.equal(getJapamAlarmSoundName('gayatri-mantra'), null);
  assert.equal(getJapamAlarmSoundName('does-not-exist'), null);
}

// nextFireTimestamp: future-of-today returns today; past-of-today rolls to tomorrow.
{
  const now = new Date('2026-06-15T08:00:00');
  const future = nextFireTimestamp({ hour: 9, minute: 30 }, now);
  assert.equal(new Date(future).toISOString(), new Date('2026-06-15T09:30:00').toISOString());

  const past = nextFireTimestamp({ hour: 6, minute: 0 }, now);
  assert.equal(new Date(past).toISOString(), new Date('2026-06-16T06:00:00').toISOString());

  // Exact-equal time also rolls to tomorrow — a tie means the moment has
  // already passed by the time we schedule.
  const exact = nextFireTimestamp({ hour: 8, minute: 0 }, now);
  assert.equal(new Date(exact).toISOString(), new Date('2026-06-16T08:00:00').toISOString());
}
