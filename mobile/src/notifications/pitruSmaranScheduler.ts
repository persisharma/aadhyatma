import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { Lang } from '@/data/gita/language';
import {
  formatPitruSmaranReminderContent,
  PITRU_SMARAN_NOTIF_PREFIX,
  planPitruSmaranReminders,
  type PitruSmaranReminderInput,
} from './pitruSmaranReminderPure';

export const PITRU_SMARAN_CHANNEL_ID = 'pitru-smaran-reminders';

async function ensureChannel(): Promise<string | undefined> {
  if (Platform.OS !== 'android') return undefined;
  await Notifications.setNotificationChannelAsync(PITRU_SMARAN_CHANNEL_ID, {
    name: 'Pitru Smaran reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
    lightColor: '#B08A45',
  });
  return PITRU_SMARAN_CHANNEL_ID;
}

export async function cancelAllPitruSmaranReminders(): Promise<void> {
  const pending = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(pending.filter((n) => n.identifier.startsWith(PITRU_SMARAN_NOTIF_PREFIX)).map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)));
}

export async function schedulePitruSmaranReminders(
  inputs: PitruSmaranReminderInput[],
  now = new Date(),
  lang: Lang = 'hi'
): Promise<number> {
  await cancelAllPitruSmaranReminders();
  const planned = planPitruSmaranReminders(inputs, now);
  const channelId = planned.length > 0 ? await ensureChannel().catch(() => undefined) : undefined;
  let count = 0;
  for (const item of planned) {
    const { title, body } = formatPitruSmaranReminderContent(item, lang);
    try {
      await Notifications.scheduleNotificationAsync({
        identifier: item.identifier,
        content: {
          title,
          body,
          sound: 'default',
          data: { type: 'pitru-smaran-reminder', entryId: item.entryId, kind: item.kind, occurrenceDateKey: item.occurrenceDateKey },
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: item.fireDate, ...(channelId ? { channelId } : {}) } as Notifications.NotificationTriggerInput,
      });
      count += 1;
    } catch { /* one failed slot must not drop the rest */ }
  }
  return count;
}
