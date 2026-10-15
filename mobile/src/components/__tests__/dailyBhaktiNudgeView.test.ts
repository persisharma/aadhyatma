import {
  EMPTY_NUDGE_RECORD,
  NUDGE_SNOOZE_DAYS,
  formatReminderTimes,
  nudgeCopy,
  parseNudgeRecord,
  reminderOnLine,
  selectNudge,
  type NudgeInputs,
} from '../dailyBhaktiNudgeView';

const NOW = Date.UTC(2026, 9, 15, 6, 0, 0);
const DAY = 24 * 60 * 60 * 1000;

function inputs(over: Partial<NudgeInputs> = {}): NudgeInputs {
  return {
    ready: true,
    dailyVerseEnabled: false,
    permissionStatus: 'granted',
    canAskAgain: true,
    widgetHost: true,
    record: EMPTY_NUDGE_RECORD,
    now: NOW,
    ...over,
  };
}

describe('selectNudge', () => {
  test('shows nothing until prefs and the strip record have hydrated', () => {
    expect(selectNudge(inputs({ ready: false }))).toBeNull();
  });

  test('asks for the reminder first when it is off', () => {
    expect(selectNudge(inputs())).toBe('reminder');
  });

  test('a granted permission with the reminder switched off still counts as not set up', () => {
    expect(selectNudge(inputs({ dailyVerseEnabled: false, permissionStatus: 'granted' }))).toBe('reminder');
  });

  test('a soft Android refusal can still be asked again from the strip', () => {
    expect(selectNudge(inputs({ permissionStatus: 'denied', canAskAgain: true }))).toBe('reminder');
  });

  test('a hard denial routes to Settings instead of an ask that cannot appear', () => {
    expect(selectNudge(inputs({ permissionStatus: 'denied', canAskAgain: false }))).toBe('reminderBlocked');
  });

  test('never stacks on the launch-time OS prompt of the default-on reminder', () => {
    expect(selectNudge(inputs({ dailyVerseEnabled: true, permissionStatus: 'undetermined' }))).toBeNull();
  });

  test('a reminder that is off with the permission unanswered gets the strip', () => {
    expect(selectNudge(inputs({ dailyVerseEnabled: false, permissionStatus: 'undetermined' }))).toBe('reminder');
  });

  test('offers the widget once the reminder is on', () => {
    expect(selectNudge(inputs({ dailyVerseEnabled: true, permissionStatus: 'granted' }))).toBe('widget');
  });

  test('a resting reminder ask hands the slot to the widget', () => {
    const record = { ...EMPTY_NUDGE_RECORD, reminderDismissedAt: NOW - DAY };
    expect(selectNudge(inputs({ record }))).toBe('widget');
  });

  test('the reminder ask returns once its snooze has elapsed', () => {
    const record = { ...EMPTY_NUDGE_RECORD, reminderDismissedAt: NOW - NUDGE_SNOOZE_DAYS * DAY };
    expect(selectNudge(inputs({ record }))).toBe('reminder');
  });

  test('no widget offer from a binary without the widget extension', () => {
    expect(selectNudge(inputs({ dailyVerseEnabled: true, widgetHost: false }))).toBeNull();
  });

  test('a widget "not now" is final — placement is invisible, so no re-offer', () => {
    const record = { ...EMPTY_NUDGE_RECORD, widgetDismissedAt: NOW - 400 * DAY };
    expect(selectNudge(inputs({ dailyVerseEnabled: true, record }))).toBeNull();
  });

  test('an add flow ends the widget ask for good', () => {
    const record = { ...EMPTY_NUDGE_RECORD, widgetAddedAt: NOW - 400 * DAY };
    expect(selectNudge(inputs({ dailyVerseEnabled: true, record }))).toBeNull();
  });
});

describe('parseNudgeRecord', () => {
  test('missing, corrupt or foreign values read as an empty record', () => {
    expect(parseNudgeRecord(null)).toEqual(EMPTY_NUDGE_RECORD);
    expect(parseNudgeRecord('{not json')).toEqual(EMPTY_NUDGE_RECORD);
    expect(parseNudgeRecord('null')).toEqual(EMPTY_NUDGE_RECORD);
    expect(parseNudgeRecord(JSON.stringify({ reminderDismissedAt: 'x', widgetDismissedAt: -1, widgetAddedAt: NaN }))).toEqual(
      EMPTY_NUDGE_RECORD
    );
  });

  test('round-trips the stored stamps', () => {
    const stored = { reminderDismissedAt: NOW - DAY, widgetDismissedAt: null, widgetAddedAt: NOW };
    expect(parseNudgeRecord(JSON.stringify(stored))).toEqual(stored);
  });
});

describe('copy', () => {
  test('reminder times render in the TimeStepper form', () => {
    expect(formatReminderTimes([{ hour: 7, minute: 0 }])).toBe('07:00');
    expect(formatReminderTimes([{ hour: 6, minute: 5 }, { hour: 19, minute: 30 }])).toBe('06:05 · 19:30');
  });

  test('every kind has copy in all four reading languages', () => {
    for (const kind of ['reminder', 'reminderBlocked', 'widget'] as const) {
      for (const lang of ['hi', 'en', 'gu', 'kn'] as const) {
        const copy = nudgeCopy(kind, lang, [{ hour: 7, minute: 0 }]);
        expect(copy.title.length).toBeGreaterThan(0);
        expect(copy.subtitle.length).toBeGreaterThan(0);
        expect(copy.action.length).toBeGreaterThan(0);
      }
    }
  });

  test('the reminder subtitle and the confirmation carry the chosen time', () => {
    expect(nudgeCopy('reminder', 'en', [{ hour: 6, minute: 30 }]).subtitle).toBe('Daily at 06:30');
    expect(nudgeCopy('reminder', 'hi', [{ hour: 6, minute: 30 }]).subtitle).toContain('06:30');
    expect(reminderOnLine('en', [{ hour: 6, minute: 30 }])).toBe('Reminder on · 06:30');
  });
});
