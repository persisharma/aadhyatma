/**
 * Per-family Android notification channels (BEH-15).
 *
 * Daily verse, vrat, sadhana, routine and muhurat reminders used to share one
 * channel, so they could not be silenced separately in system settings. Each now
 * has its own, created on first use (a family with nothing to say adds no row to
 * the user's settings) with its name and description in the reading language.
 * Festive, return, Pitru and Janma already own channels and are not touched here.
 *
 * WHICH channel they shared: none of the five ever passed a `channelId`, so they
 * were posted on expo-notifications' own fallback channel
 * (`expo_notifications_fallback_notification_channel`, IMPORTANCE_HIGH, vibrate,
 * badge — `BaseNotificationBuilder.kt`). The `default` channel created at boot
 * was never used. The new channels therefore copy the FALLBACK's behaviour, not
 * `default`'s: a reminder that arrived as a heads-up banner still does.
 *
 * Migration rules:
 *   - Re-arming moves pending notifications: `armNotificationFamily` schedules
 *     every slot on the first arm of each process, and scheduling a pending
 *     identifier replaces it, so every queued notice lands on its new channel.
 *   - The old shared channel (`default`, created at boot) is deleted only after
 *     all five families have re-armed or cleared in this process and none had to
 *     fall back, then recorded so the boot code stops recreating it.
 *   - A channel's importance and sound are pinned at creation; its name and
 *     description can be updated in place, which is how a language change lands.
 *
 * Android only: every function is a no-op elsewhere.
 */

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Lang } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';

export type ChannelFamily = 'dailyVerse' | 'vrat' | 'sadhana' | 'routine' | 'muhurat';

export const FAMILY_CHANNEL_IDS: Readonly<Record<ChannelFamily, string>> = {
  dailyVerse: 'daily-verse-reminders',
  vrat: 'vrat-reminders',
  sadhana: 'sadhana-reminders',
  routine: 'routine-reminders',
  muhurat: 'muhurat-reminders',
};

/** The shared channel created at boot, retired once nothing is left on it. */
export const LEGACY_SHARED_CHANNEL_ID = 'default';
export const LEGACY_CHANNEL_RETIRED_KEY = '@vedansh/notif-legacy-channel-retired';

const COPY: Readonly<Record<ChannelFamily, { nameHi: string; nameEn: string; descHi: string; descEn: string }>> = {
  dailyVerse: {
    nameHi: 'दैनिक भक्ति स्मरण',
    nameEn: 'Daily verse reminders',
    descHi: 'हर दिन का एक श्लोक',
    descEn: 'One verse each day',
  },
  vrat: {
    nameHi: 'व्रत स्मरण',
    nameEn: 'Vrat reminders',
    descHi: 'आपके चुने हुए व्रतों की सूचना',
    descEn: 'Notices for the vrats you follow',
  },
  sadhana: {
    nameHi: 'संकल्प स्मरण',
    nameEn: 'Sankalp reminders',
    descHi: 'आपके संकल्प की दैनिक याद',
    descEn: 'A daily nudge for your sankalp',
  },
  routine: {
    nameHi: 'नित्य साधना स्मरण',
    nameEn: 'Daily practice reminders',
    descHi: 'आपकी नित्य साधना की याद',
    descEn: 'A nudge for your daily routine',
  },
  muhurat: {
    nameHi: 'मुहूर्त स्मरण',
    nameEn: 'Muhurat reminders',
    descHi: 'आपके चुने हुए मुहूर्त की सूचना',
    descEn: 'Notices for the muhurats you follow',
  },
};

const FAMILIES = Object.keys(FAMILY_CHANNEL_IDS) as ChannelFamily[];

const ensuredLang = new Map<ChannelFamily, Lang>();
const settledFamilies = new Set<ChannelFamily>();
let usedFallback = false;
let retireStarted = false;

/**
 * Create (or rename, on a language change) the family's channel and return its
 * id. Returns `undefined` off Android, or when creation fails — the notification
 * then goes to expo's fallback channel rather than being dropped.
 */
export async function ensureFamilyChannel(
  family: ChannelFamily,
  lang: Lang
): Promise<string | undefined> {
  if (Platform.OS !== 'android') return undefined;
  const id = FAMILY_CHANNEL_IDS[family];
  if (ensuredLang.get(family) === lang) return id;
  const c = COPY[family];
  try {
    await Notifications.setNotificationChannelAsync(id, {
      name: contentByLang(lang, c.nameHi, c.nameEn),
      description: contentByLang(lang, c.descHi, c.descEn),
      // Pinned at creation, so it must match what these reminders had until now
      // (see the header): HIGH, vibrating, badged. The reader can lower it per
      // family in system settings — which is the point of separate channels.
      importance: Notifications.AndroidImportance.HIGH,
      enableVibrate: true,
      showBadge: true,
      sound: 'default',
      lightColor: '#B8621B',
    });
    ensuredLang.set(family, lang);
    return id;
  } catch {
    usedFallback = true;
    return undefined;
  }
}

async function retireLegacyChannel(): Promise<void> {
  try {
    await Notifications.deleteNotificationChannelAsync(LEGACY_SHARED_CHANNEL_ID);
    await AsyncStorage.setItem(LEGACY_CHANNEL_RETIRED_KEY, '1');
  } catch {
    // Leaving the unused legacy channel in place is harmless; retried next launch.
    retireStarted = false;
  }
}

/** Record that `family` holds nothing on the legacy channel in this process. */
export function markFamilySettled(family: ChannelFamily): void {
  if (Platform.OS !== 'android') return;
  settledFamilies.add(family);
  if (retireStarted || usedFallback) return;
  if (!FAMILIES.every((f) => settledFamilies.has(f))) return;
  retireStarted = true;
  void retireLegacyChannel();
}

/** Await `work` (an arm or cancel of `family`), then mark the family settled. */
export async function settleAfter<T>(family: ChannelFamily, work: Promise<T>): Promise<T> {
  const result = await work;
  markFamilySettled(family);
  return result;
}

/** Whether the legacy channel has already been retired (boot skips recreating it). */
export async function isLegacyChannelRetired(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(LEGACY_CHANNEL_RETIRED_KEY)) === '1';
  } catch {
    return false;
  }
}

/** Clear module state between tests (each models a fresh process). */
export function resetNotificationChannelsForTests(): void {
  ensuredLang.clear();
  settledFamilies.clear();
  usedFallback = false;
  retireStarted = false;
}
