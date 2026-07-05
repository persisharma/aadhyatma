import { Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo-modules-core';
import { scheduleNativeAlarmsForDay } from '@/notifications/japamAlarmNative';
import type { JapamAlarm } from '@/notifications/japamAlarms';

// The Japam-alarm sound is resolved in JS (mantraId → bundled clip filename)
// and threaded into the native module's scheduleAlarm call. iOS 26 AlarmKit
// then rings `.named(sound)`; without this the alarm falls back to the system
// tone. This suite pins that passthrough. `.jest.test.ts` opts the file into
// Jest (the plain `*.test.ts` files here run under tsx instead).

// Only requireOptionalNativeModule is used from expo-modules-core here (the
// native-module lookup); mock it so we can inject a fake module.
jest.mock('expo-modules-core', () => ({
  requireOptionalNativeModule: jest.fn(),
}));

// scheduleNativeAlarmsForDay never touches these, but japamAlarmNative imports
// them at module load — stub so the suite doesn't drag in expo-notifications
// and the japam catalogue.
jest.mock('@/notifications/deepLink', () => ({
  navigationRef: { isReady: () => false, dispatch: jest.fn() },
}));
jest.mock('@/data/japam', () => ({ findJapamMantra: jest.fn(() => null) }));
// @react-navigation/native ships ESM the RN jest preset doesn't transform;
// japamAlarmNative imports CommonActions from it (unused by the tested path).
jest.mock('@react-navigation/native', () => ({
  CommonActions: { navigate: jest.fn() },
}));

const mockRequire = requireOptionalNativeModule as jest.Mock;
const scheduleAlarm = jest.fn();
const cancelAll = jest.fn();

// iOS 26 is the AlarmKit path the native module binds on. Platform.OS defaults
// to 'ios' under the RN preset; Platform.Version is a getter-only stub there
// (plain assignment is ignored), so override it to clear the >= 26 gate.
(Platform as unknown as { OS: string }).OS = 'ios';
Object.defineProperty(Platform, 'Version', { configurable: true, get: () => 26 });

beforeEach(() => {
  jest.clearAllMocks();
  scheduleAlarm.mockResolvedValue({ alarmId: 'x', fireAt: 0, exact: true });
  cancelAll.mockResolvedValue(undefined);
  mockRequire.mockReturnValue({ scheduleAlarm, cancelAll });
});

const alarm = (
  id: string,
  mantraId: string,
  extra: Partial<JapamAlarm> = {}
): JapamAlarm => ({
  id,
  mantraId,
  time: { hour: 6, minute: 0 },
  enabled: true,
  ...extra,
});

describe('scheduleNativeAlarmsForDay — mantra sound passthrough', () => {
  test('passes the bundled clip filename for a mantra that has one', async () => {
    await scheduleNativeAlarmsForDay([alarm('a1', 'om-namah-shivaya')]);
    expect(scheduleAlarm).toHaveBeenCalledWith(
      expect.objectContaining({
        mantraId: 'om-namah-shivaya',
        sound: 'om-namah-shivaya.wav',
      })
    );
  });

  test('passes null when the mantra has no bundled clip (falls back to system tone)', async () => {
    await scheduleNativeAlarmsForDay([alarm('a2', 'gayatri-mantra')]);
    expect(scheduleAlarm).toHaveBeenCalledWith(
      expect.objectContaining({ mantraId: 'gayatri-mantra', sound: null })
    );
  });
});

describe('scheduleNativeAlarmsForDay — recurrence passthrough', () => {
  test('daily alarm: repeatDays null, not fixed', async () => {
    await scheduleNativeAlarmsForDay([alarm('a1', 'om-namah-shivaya')]);
    expect(scheduleAlarm).toHaveBeenCalledTimes(1);
    expect(scheduleAlarm).toHaveBeenCalledWith(
      expect.objectContaining({ repeatDays: null, fixed: false })
    );
  });

  test('weekly subset flows through as-is', async () => {
    await scheduleNativeAlarmsForDay([
      alarm('a1', 'om-namah-shivaya', { repeatDays: [1, 3, 5] }),
    ]);
    expect(scheduleAlarm).toHaveBeenCalledWith(
      expect.objectContaining({ repeatDays: [1, 3, 5], fixed: false })
    );
  });

  test('one-time alarm schedules as fixed', async () => {
    await scheduleNativeAlarmsForDay([
      alarm('a1', 'om-namah-shivaya', { repeatDays: [] }),
    ]);
    expect(scheduleAlarm).toHaveBeenCalledWith(
      expect.objectContaining({ repeatDays: [], fixed: true })
    );
  });

  test('pending skip-next on the AlarmKit tier arms discrete fixed one-shots', async () => {
    // Skip set for the next occurrence relative to "now" — always pending.
    const skipKey = (() => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      const mm = `${d.getMonth() + 1}`.padStart(2, '0');
      const dd = `${d.getDate()}`.padStart(2, '0');
      return `${d.getFullYear()}-${mm}-${dd}`;
    })();
    await scheduleNativeAlarmsForDay([
      alarm('a1', 'om-namah-shivaya', { skipNextDate: skipKey }),
    ]);
    // 3 discrete fires, all fixed, ids disambiguated after the first.
    expect(scheduleAlarm).toHaveBeenCalledTimes(3);
    const calls = scheduleAlarm.mock.calls.map((c) => c[0]);
    expect(calls.every((c) => c.fixed === true)).toBe(true);
    expect(calls[0].alarmId).toBe('japam-alarm:a1');
    expect(calls[1].alarmId).toBe('japam-alarm:a1:occ1');
    expect(calls[2].alarmId).toBe('japam-alarm:a1:occ2');
    // Strictly increasing fire times, none on the skipped date.
    expect(calls[0].fireAt).toBeLessThan(calls[1].fireAt);
    expect(calls[1].fireAt).toBeLessThan(calls[2].fireAt);
    for (const c of calls) {
      const d = new Date(c.fireAt);
      const mm = `${d.getMonth() + 1}`.padStart(2, '0');
      const dd = `${d.getDate()}`.padStart(2, '0');
      expect(`${d.getFullYear()}-${mm}-${dd}`).not.toBe(skipKey);
    }
  });

  test('a past skip-next is ignored — plain recurrence is armed', async () => {
    await scheduleNativeAlarmsForDay([
      alarm('a1', 'om-namah-shivaya', { skipNextDate: '2020-01-01' }),
    ]);
    expect(scheduleAlarm).toHaveBeenCalledTimes(1);
    expect(scheduleAlarm).toHaveBeenCalledWith(
      expect.objectContaining({ repeatDays: null, fixed: false })
    );
  });

  test('disabled alarms are not scheduled', async () => {
    await scheduleNativeAlarmsForDay([
      alarm('a1', 'om-namah-shivaya', { enabled: false }),
    ]);
    expect(scheduleAlarm).not.toHaveBeenCalled();
  });
});
