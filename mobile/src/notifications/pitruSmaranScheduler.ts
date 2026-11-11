import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { armNotificationFamily, cancelNotificationFamily, type FamilySlot } from './familyArm';
import type { Lang } from '@/data/gita/language';
import {
  formatPitruSmaranReminderContent,
  PITRU_SMARAN_NOTIF_PREFIX,
  planPitruSmaranReminders,
  type PitruSmaranReminderInput,
} from './pitruSmaranReminderPure';

export const PITRU_SMARAN_CHANNEL_ID = 'pitru-smaran-reminders';

let channelEnsured = false;

async function ensureChannel(): Promise<string | undefined> {
  if (Platform.OS !== 'android') return undefined;
  // A channel's attributes are pinned at creation, so once per process is enough.
  if (channelEnsured) return PITRU_SMARAN_CHANNEL_ID;
  await Notifications.setNotificationChannelAsync(PITRU_SMARAN_CHANNEL_ID, {
    name: 'Pitru Smaran reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
    lightColor: '#B08A45',
  });
  channelEnsured = true;
  return PITRU_SMARAN_CHANNEL_ID;
}

export async function cancelAllPitruSmaranReminders(): Promise<void> {
  await cancelNotificationFamily(PITRU_SMARAN_NOTIF_PREFIX);
}

export async function schedulePitruSmaranReminders(
  inputs: PitruSmaranReminderInput[],
  now = new Date(),
  lang: Lang = 'hi'
): Promise<number> {
  const planned = planPitruSmaranReminders(inputs, now);
  const channelId = planned.length > 0 ? await ensureChannel().catch(() => undefined) : undefined;
  const slots: FamilySlot[] = planned.map((item) => {
    const { title, body } = formatPitruSmaranReminderContent(item, lang);
    return {
      identifier: item.identifier,
      content: {
        title,
        body,
        sound: 'default',
        data: { type: 'pitru-smaran-reminder', entryId: item.entryId, kind: item.kind, occurrenceDateKey: item.occurrenceDateKey },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: item.fireDate, ...(channelId ? { channelId } : {}) } as Notifications.NotificationTriggerInput,
    };
  });
  // One failed slot must not drop the rest (see `armNotificationFamily`).
  return armNotificationFamily(PITRU_SMARAN_NOTIF_PREFIX, slots);
}
