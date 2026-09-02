import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { Lang } from '@/data/gita/language';
import {
  formatJanmaTithiReminderContent,
  JANMA_TITHI_NOTIF_PREFIX,
  planJanmaTithiReminders,
  type JanmaTithiReminderInput,
} from './janmaTithiReminderPure';

export const JANMA_TITHI_CHANNEL_ID = 'janma-tithi-reminders';

async function ensureChannel(): Promise<string | undefined> {
  if (Platform.OS !== 'android') return undefined;
  await Notifications.setNotificationChannelAsync(JANMA_TITHI_CHANNEL_ID, {
    name: 'Janma tithi reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
    lightColor: '#B08A45',
  });
  return JANMA_TITHI_CHANNEL_ID;
}

export async function cancelAllJanmaTithiReminders(): Promise<void> {
  const pending = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    pending
      .filter((n) => n.identifier.startsWith(JANMA_TITHI_NOTIF_PREFIX))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
  );
}

export async function scheduleJanmaTithiReminders(
  inputs: JanmaTithiReminderInput[],
  now = new Date(),
  lang: Lang = 'hi'
): Promise<number> {
  await cancelAllJanmaTithiReminders();
  const planned = planJanmaTithiReminders(inputs, now);
  const channelId = planned.length > 0 ? await ensureChannel().catch(() => undefined) : undefined;
  let count = 0;
  for (const item of planned) {
    const { title, body } = formatJanmaTithiReminderContent(item, lang);
    try {
      await Notifications.scheduleNotificationAsync({
        identifier: item.identifier,
        content: {
          title,
          body,
          sound: 'default',
          // Only the local person id and the occurrence key — never a name.
          data: { type: 'janma-tithi-reminder', personId: item.personId, occurrenceDateKey: item.occurrenceDateKey },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: item.fireDate,
          ...(channelId ? { channelId } : {}),
        } as Notifications.NotificationTriggerInput,
      });
      count += 1;
    } catch { /* one failed slot must not drop the rest */ }
  }
  return count;
}
