import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { cancelAllJanmaTithiReminders, scheduleJanmaTithiReminders } from '../janmaTithiScheduler';

jest.mock('expo-notifications', () => ({
  getAllScheduledNotificationsAsync: jest.fn(async () => []),
  scheduleNotificationAsync: jest.fn(async () => 'scheduled'),
  setNotificationChannelAsync: jest.fn(),
  AndroidImportance: { DEFAULT: 3 },
  SchedulableTriggerInputTypes: { DATE: 'date' },
}));

test('an opt-out during Android channel creation wins; a later eligible arm is deduplicated', async () => {
  const os = Platform.OS;
  Platform.OS = 'android';
  try {
    const inputs = [{
      personId: 'saved', displayNameHi: 'सीता', displayNameEn: 'Sita',
      tithiHi: 'नवमी', tithiEn: 'Navami', nextDate: new Date(2027, 2, 5),
    }];
    const now = new Date(2027, 2, 1);
    let finishChannel!: () => void;
    let cancelled = false;
    jest.mocked(Notifications.setNotificationChannelAsync).mockImplementationOnce(
      () => new Promise(resolve => { finishChannel = () => resolve(null); })
    );
    const inFlight = scheduleJanmaTithiReminders(inputs, now, 'en', () => cancelled);
    cancelled = true;
    await cancelAllJanmaTithiReminders();
    finishChannel();
    await expect(inFlight).resolves.toBe(0);
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    await scheduleJanmaTithiReminders(inputs, now, 'en');
    await scheduleJanmaTithiReminders(inputs, now, 'en');
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(expect.objectContaining({
      identifier: 'janma-tithi-reminder:saved:2027-03-05',
      trigger: expect.objectContaining({ date: new Date(2027, 2, 4, 18) }),
    }));
  } finally {
    Platform.OS = os;
  }
});
