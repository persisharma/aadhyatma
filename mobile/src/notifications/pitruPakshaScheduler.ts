import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { armNotificationFamily, cancelNotificationFamily, type FamilySlot } from './familyArm';
import type { Lang } from '@/data/gita/language';
import {
  formatPitruPakshaReminderContent,
  PITRU_PAKSHA_NOTIF_PREFIX,
  planPitruPakshaReminders,
} from './pitruPakshaReminderPure';
import type { PitruPakshaWindow } from '@/panchang/pitruSmaran';

export const PITRU_PAKSHA_CHANNEL_ID = 'festive-reminders';

let channelEnsured = false;

export async function cancelAllPitruPakshaReminders(): Promise<void> {
  await cancelNotificationFamily(PITRU_PAKSHA_NOTIF_PREFIX);
}

export async function schedulePitruPakshaReminders(
  windows: { year: number; window: PitruPakshaWindow }[],
  now = new Date(),
  lang: Lang = 'hi'
): Promise<number> {
  const planned = planPitruPakshaReminders(windows, now);
  // A channel's attributes are pinned at creation, so once per process is enough.
  if (Platform.OS === 'android' && planned.length > 0 && !channelEnsured) {
    await Notifications.setNotificationChannelAsync(PITRU_PAKSHA_CHANNEL_ID, {
      name: 'Festival reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
      lightColor: '#B8621B',
    }).then(() => { channelEnsured = true; }, () => undefined);
  }
  const slots: FamilySlot[] = planned.map((item) => {
    const { title, body } = formatPitruPakshaReminderContent(item, lang);
    return {
      identifier: item.identifier,
      content: { title, body, sound: 'default', data: { type: 'pitru-paksha-reminder', year: item.year, kind: item.kind } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: item.fireDate, ...(Platform.OS === 'android' ? { channelId: PITRU_PAKSHA_CHANNEL_ID } : {}) } as Notifications.NotificationTriggerInput,
    };
  });
  // Per-slot failure is non-fatal (see `armNotificationFamily`).
  return armNotificationFamily(PITRU_PAKSHA_NOTIF_PREFIX, slots);
}
