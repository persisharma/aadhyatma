import assert from 'node:assert/strict';

import { getJapamAlarmSoundName } from '../../../assets/japam-alarm-sounds';
import {
  MAX_JAPAM_ALARMS,
  JAPAM_ALARM_IDENTIFIER_PREFIX,
  describeUntilFire,
  formatTimeLabel,
  isJapamAlarmPayload,
  isOnceAlarm,
  isSnoozeIdentifier,
  localDateKey,
  makeAlarmId,
  nextAlarmFireTimestamp,
  nextAlarmFireTimestamps,
  nextFireTimestamp,
  normalizeRepeatDays,
  notificationIdentifierFor,
  parseStoredAlarms,
  prefers12HourClock,
  repeatSummary,
  repeatsDaily,
  snoozeIdentifierFor,
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
  assert.equal(getJapamAlarmSoundName('hare-krishna-mahamantra'), 'hare-krishna-mahamantra.wav');
  assert.equal(getJapamAlarmSoundName('gayatri-mantra'), 'gayatri-mantra.wav');
  // Mantras without a bundled clip (commented-out entries / unknown ids).
  assert.equal(getJapamAlarmSoundName('om-namo-bhagavate-vasudevaya'), null);
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

// ---- repeat days / skip-next / once -----------------------------------------
// 2026-06-15 is a Monday (getDay() = 1).

// parseStoredAlarms accepts the new optional fields and rejects malformed ones.
{
  const base = { id: 'a', mantraId: 'm', time: { hour: 6, minute: 0 }, enabled: true };
  const good: unknown[] = [
    { ...base, id: 'weekly', repeatDays: [1, 3, 5] },
    { ...base, id: 'once', repeatDays: [] },
    { ...base, id: 'skip', skipNextDate: '2026-06-16' },
  ];
  assert.equal(parseStoredAlarms(JSON.stringify(good)).length, 3);

  const bad: unknown[] = [
    { ...base, id: 'day-oob', repeatDays: [7] },
    { ...base, id: 'day-dup', repeatDays: [1, 1] },
    { ...base, id: 'day-str', repeatDays: ['mon'] },
    { ...base, id: 'skip-shape', skipNextDate: 'tomorrow' },
  ];
  assert.equal(parseStoredAlarms(JSON.stringify(bad)).length, 0);
}

// Classification helpers.
{
  assert.equal(isOnceAlarm({ repeatDays: [] }), true);
  assert.equal(isOnceAlarm({ repeatDays: [1] }), false);
  assert.equal(isOnceAlarm({}), false);
  assert.equal(repeatsDaily({}), true);
  assert.equal(repeatsDaily({ repeatDays: [0, 1, 2, 3, 4, 5, 6] }), true);
  assert.equal(repeatsDaily({ repeatDays: [1] }), false);
  assert.deepEqual(normalizeRepeatDays([5, 1, 5, 3, 9, -1]), [1, 3, 5]);
}

// localDateKey is zero-padded local time.
{
  assert.equal(localDateKey(new Date('2026-06-05T00:30:00')), '2026-06-05');
}

// nextAlarmFireTimestamp: no repeat fields behaves exactly like the daily base.
{
  const now = new Date('2026-06-15T08:00:00');
  assert.equal(
    nextAlarmFireTimestamp({ time: { hour: 9, minute: 30 } }, now),
    nextFireTimestamp({ hour: 9, minute: 30 }, now)
  );
}

// Weekly subset rolls to the next selected day.
{
  const monday8 = new Date('2026-06-15T08:00:00');
  // Wed+Fri alarm at 06:00 asked on Monday 08:00 → Wednesday 06:00.
  const wedFri = nextAlarmFireTimestamp(
    { time: { hour: 6, minute: 0 }, repeatDays: [3, 5] },
    monday8
  );
  assert.equal(
    new Date(wedFri).toISOString(),
    new Date('2026-06-17T06:00:00').toISOString()
  );
  // Monday-only alarm at 06:00 (already past) → next Monday.
  const mon = nextAlarmFireTimestamp(
    { time: { hour: 6, minute: 0 }, repeatDays: [1] },
    monday8
  );
  assert.equal(
    new Date(mon).toISOString(),
    new Date('2026-06-22T06:00:00').toISOString()
  );
  // Monday-only alarm at 09:00 (still ahead today) → today.
  const monToday = nextAlarmFireTimestamp(
    { time: { hour: 9, minute: 0 }, repeatDays: [1] },
    monday8
  );
  assert.equal(
    new Date(monToday).toISOString(),
    new Date('2026-06-15T09:00:00').toISOString()
  );
}

// skipNextDate skips exactly one occurrence.
{
  const monday8 = new Date('2026-06-15T08:00:00');
  // Daily 09:00 with today skipped → tomorrow 09:00.
  const skippedToday = nextAlarmFireTimestamp(
    { time: { hour: 9, minute: 0 }, skipNextDate: '2026-06-15' },
    monday8
  );
  assert.equal(
    new Date(skippedToday).toISOString(),
    new Date('2026-06-16T09:00:00').toISOString()
  );
  // Weekly Monday alarm with next Monday skipped → the Monday after.
  const weeklySkipped = nextAlarmFireTimestamp(
    { time: { hour: 6, minute: 0 }, repeatDays: [1], skipNextDate: '2026-06-22' },
    monday8
  );
  assert.equal(
    new Date(weeklySkipped).toISOString(),
    new Date('2026-06-29T06:00:00').toISOString()
  );
  // A skip date that isn't an occurrence changes nothing.
  const irrelevantSkip = nextAlarmFireTimestamp(
    { time: { hour: 9, minute: 0 }, skipNextDate: '2026-07-01' },
    monday8
  );
  assert.equal(
    new Date(irrelevantSkip).toISOString(),
    new Date('2026-06-15T09:00:00').toISOString()
  );
  // One-time alarms ignore skipNextDate.
  const onceWithSkip = nextAlarmFireTimestamp(
    { time: { hour: 9, minute: 0 }, repeatDays: [], skipNextDate: '2026-06-15' },
    monday8
  );
  assert.equal(
    new Date(onceWithSkip).toISOString(),
    new Date('2026-06-15T09:00:00').toISOString()
  );
}

// nextAlarmFireTimestamps: strictly increasing; a once alarm yields one fire.
{
  const monday8 = new Date('2026-06-15T08:00:00');
  const daily = nextAlarmFireTimestamps({ time: { hour: 9, minute: 0 } }, 3, monday8);
  assert.equal(daily.length, 3);
  assert.ok(daily[0] < daily[1] && daily[1] < daily[2]);
  assert.equal(
    new Date(daily[2]).toISOString(),
    new Date('2026-06-17T09:00:00').toISOString()
  );
  // Skip applies only to the first computed occurrence, not repeatedly.
  const skipped = nextAlarmFireTimestamps(
    { time: { hour: 9, minute: 0 }, skipNextDate: '2026-06-15' },
    2,
    monday8
  );
  assert.equal(
    new Date(skipped[0]).toISOString(),
    new Date('2026-06-16T09:00:00').toISOString()
  );
  assert.equal(
    new Date(skipped[1]).toISOString(),
    new Date('2026-06-17T09:00:00').toISOString()
  );
  const once = nextAlarmFireTimestamps(
    { time: { hour: 9, minute: 0 }, repeatDays: [] },
    5,
    monday8
  );
  assert.equal(once.length, 1);
}

// repeatSummary: canonical shapes in both languages.
{
  assert.equal(repeatSummary(undefined, false), 'Daily');
  assert.equal(repeatSummary([0, 1, 2, 3, 4, 5, 6], false), 'Daily');
  assert.equal(repeatSummary([], false), 'Once');
  assert.equal(repeatSummary([1, 2, 3, 4, 5], false), 'Weekdays');
  assert.equal(repeatSummary([0, 6], false), 'Weekends');
  assert.equal(repeatSummary([0, 3], false), 'Sun, Wed');
  assert.equal(repeatSummary(undefined, true), 'प्रतिदिन');
  assert.equal(repeatSummary([], true), 'एक बार');
  assert.equal(repeatSummary([1, 2, 3, 4, 5], true), 'सोम–शुक्र');
  assert.equal(repeatSummary([0, 3], true), 'रवि, बुध');
}

// describeUntilFire: minute / hour / day granularity + sub-minute floor.
{
  const now = new Date('2026-06-15T08:00:00').getTime();
  const at = (iso: string) => new Date(iso).getTime();
  assert.equal(describeUntilFire(at('2026-06-15T08:25:00'), now, false), 'in 25 min');
  assert.equal(
    describeUntilFire(at('2026-06-15T15:25:00'), now, false),
    'in 7 hr 25 min'
  );
  // Days out: minutes are dropped as noise.
  assert.equal(
    describeUntilFire(at('2026-06-17T11:25:00'), now, false),
    'in 2 d 3 hr'
  );
  // Sub-minute gaps round up (never "in 0 min"); at-or-past floors to <1 min.
  assert.equal(describeUntilFire(now + 10_000, now, false), 'in 1 min');
  assert.equal(describeUntilFire(now - 5_000, now, false), 'in <1 min');
  assert.equal(
    describeUntilFire(at('2026-06-15T15:25:00'), now, true),
    '7 घं 25 मि में'
  );
}

// formatTimeLabel: 24 h zero-padded; 12 h with AM/PM and 12-o'clock handling.
{
  assert.equal(formatTimeLabel({ hour: 6, minute: 5 }, false), '06:05');
  assert.equal(formatTimeLabel({ hour: 6, minute: 5 }, true), '6:05 AM');
  assert.equal(formatTimeLabel({ hour: 0, minute: 0 }, true), '12:00 AM');
  assert.equal(formatTimeLabel({ hour: 12, minute: 30 }, true), '12:30 PM');
  assert.equal(formatTimeLabel({ hour: 21, minute: 30 }, false), '21:30');
  assert.equal(formatTimeLabel({ hour: 21, minute: 30 }, true), '9:30 PM');
}

// prefers12HourClock follows the locale's hour-cycle convention.
{
  assert.equal(prefers12HourClock('en-US'), true);
  assert.equal(prefers12HourClock('fr-FR'), false);
}

// Snooze identifiers are namespaced under the japam prefix but recognisable,
// so reconcile can cancel regular slots without swallowing an active snooze.
{
  const id = snoozeIdentifierFor('abc');
  assert.ok(id.startsWith(JAPAM_ALARM_IDENTIFIER_PREFIX));
  assert.equal(isSnoozeIdentifier(id), true);
  assert.equal(isSnoozeIdentifier(notificationIdentifierFor('abc')), false);
}
