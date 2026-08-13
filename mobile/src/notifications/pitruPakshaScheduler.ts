import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { Lang } from '@/data/gita/language';
import {
  formatPitruPakshaReminderContent,
  PITRU_PAKSHA_NOTIF_PREFIX,
  planPitruPakshaReminders,
} from './pitruPakshaReminderPure';
import type { PitruPakshaWindow } from '@/panchang/pitruSmaran';

export const PITRU_PAKSHA_CHANNEL_ID = 'festive-reminders';

export async function cancelAllPitruPakshaReminders(): Promise<void> {
  const pending = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(pending.filter((n) => n.identifier.startsWith(PITRU_PAKSHA_NOTIF_PREFIX)).map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)));
}

export async function schedulePitruPakshaReminders(
  windows: { year: number; window: PitruPakshaWindow }[],
  now = new Date(),
  lang: Lang = 'hi'
): Promise<number> {
  await cancelAllPitruPakshaReminders();
  const planned = planPitruPakshaReminders(windows, now);
  if (Platform.OS === 'android' && planned.length > 0) {
    await Notifications.setNotificationChannelAsync(PITRU_PAKSHA_CHANNEL_ID, {
      name: 'Festival reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
      lightColor: '#B8621B',
    }).catch(() => undefined);
  }
  let count = 0;
  for (const item of planned) {
    const { title, body } = formatPitruPakshaReminderContent(item, lang);
    try {
      await Notifications.scheduleNotificationAsync({
        identifier: item.identifier,
        content: { title, body, sound: 'default', data: { type: 'pitru-paksha-reminder', year: item.year, kind: item.kind } },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: item.fireDate, ...(Platform.OS === 'android' ? { channelId: PITRU_PAKSHA_CHANNEL_ID } : {}) } as Notifications.NotificationTriggerInput,
      });
      count += 1;
    } catch { /* per-slot failure is non-fatal */ }
  }
  return count;
}
