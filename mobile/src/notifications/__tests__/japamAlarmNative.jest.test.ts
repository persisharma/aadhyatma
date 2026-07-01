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

const alarm = (id: string, mantraId: string): JapamAlarm => ({
  id,
  mantraId,
  time: { hour: 6, minute: 0 },
  enabled: true,
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
