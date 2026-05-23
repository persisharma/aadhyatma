/**
 * Pure, side-effect-free helpers for the daily-notification scheduler (PRD-01).
 *
 * Everything here is deterministic and dependency-free at runtime — no
 * `expo-notifications`, no `AsyncStorage`, no global state. This lets the
 * helpers be unit-tested via `tsx` without bootstrapping React Native.
 */

import type { UniformVerse } from '@/data/versePool';

/** Identifier prefix for all PRD-01 notifications. Lets us cancel just ours. */
export const NOTIF_IDENTIFIER_PREFIX = 'daily-verse';

/** Identifier prefix for OTA "new content" notifications. */
export const OTA_NOTIF_IDENTIFIER_PREFIX = 'ota-release';

/** Default copy when a release ships notify=true without explicit text. */
export const OTA_DEFAULT_TITLE = 'नया अध्याय जुड़ गया';
export const OTA_DEFAULT_BODY = 'Open Vedansh to see what\'s new.';

/** Days scheduled ahead. Must stay well under iOS's 64-notification cap. */
export const ROLLING_WINDOW_DAYS = 30;

/** Hard cap mirroring iOS's pending-notification limit. */
export const IOS_PENDING_CAP = 64;

export type TimeOfDay = { hour: number; minute: number };

export type DailyReminderConfig = {
  enabled: boolean;
  /**
   * One or more times-of-day at which the daily notification should fire
   * (24h local time). Each entry produces its own series in the rolling window.
   */
  times: TimeOfDay[];
};

/** Hard cap on how many reminder times the user can configure per day. */
export const MAX_REMINDER_TIMES = 4;

export type NotificationPayload = {
  type: 'daily-verse';
  dateKey: string;
  sourceId: string;
  verseIndex: number;
  chapter?: number;
};

/**
 * Compute the array of fire dates for the next `days` days at the given
 * time-of-day. If the requested time today has already passed, the window
 * starts at tomorrow.
 *
 * `now` is parameterised so the function is fully deterministic and testable.
 */
export function computeFireDates(
  time: TimeOfDay,
  now: Date,
  days: number = ROLLING_WINDOW_DAYS
): Date[] {
  const out: Date[] = [];
  const todayAt = new Date(now);
  todayAt.setHours(time.hour, time.minute, 0, 0);
  const startOffset = todayAt.getTime() <= now.getTime() ? 1 : 0;

  for (let i = 0; i < days; i += 1) {
    const fire = new Date(now);
    fire.setDate(fire.getDate() + startOffset + i);
    fire.setHours(time.hour, time.minute, 0, 0);
    out.push(fire);
  }
  return out;
}

/**
 * Compute the merged, time-sorted, deduplicated list of fire dates for a set of
 * reminder times. The window per time is reduced so the total stays within
 * IOS_PENDING_CAP — this ensures all configured times get fair, equal coverage
 * instead of nearest-wins truncation.
 */
export function computeFireDatesMulti(times: TimeOfDay[], now: Date): Date[] {
  if (times.length === 0) return [];
  const daysPerTime = Math.min(
    ROLLING_WINDOW_DAYS,
    Math.floor(IOS_PENDING_CAP / times.length)
  );
  const seen = new Set<number>();
  const merged: Date[] = [];
  for (const t of times) {
    for (const d of computeFireDates(t, now, daysPerTime)) {
      const ms = d.getTime();
      if (seen.has(ms)) continue;
      seen.add(ms);
      merged.push(d);
    }
  }
  merged.sort((a, b) => a.getTime() - b.getTime());
  return merged;
}

/**
 * Format the notification body for a verse — Devanagari first line + source label.
 * Hindi-led per `design.md`; the section name in the body stays in English so
 * the OS truncation doesn't strip the script that carries the verse.
 */
export function formatNotificationContent(verse: UniformVerse): {
  title: string;
  body: string;
} {
  const firstLine = verse.textHi[0] ?? verse.textEn[0] ?? '';
  const label = verse.labelEn ?? verse.labelHi ?? `verse ${verse.verseIndex + 1}`;
  const body = `${firstLine}\n${verse.sourceNameEn} · ${label}`;
  return { title: 'दैनिक भक्ति', body };
}

/** Shape of `src/data/otaRelease.json` — bundled per OTA push. */
export type OtaReleaseMetadata = {
  version: number;
  notify: boolean;
  title: string;
  body: string;
};

/**
 * Decide whether to fire the OTA "new content" notification and with what
 * copy. Pure: no `expo-notifications`, no AsyncStorage — caller wires those.
 *
 * Returns `null` when we should stay silent (already notified, embedded
 * launch, dev build, metadata says no). Returns `{ title, body }` otherwise.
 */
export function planOtaReleaseNotification(input: {
  metadata: OtaReleaseMetadata | null;
  /** `Updates.updateId` — null/empty when running an embedded bundle or dev. */
  currentUpdateId: string | null | undefined;
  /** Last `updateId` we already fired a notification for. */
  lastNotifiedUpdateId: string | null | undefined;
  /** `Updates.isEmbeddedLaunch` — true when the JS bundle came from the binary. */
  isEmbeddedLaunch: boolean;
}): { title: string; body: string } | null {
  const { metadata, currentUpdateId, lastNotifiedUpdateId, isEmbeddedLaunch } = input;
  if (!metadata || !metadata.notify) return null;
  if (!currentUpdateId) return null;
  // Embedded launches mean the user just installed/updated the app from the
  // store — don't double-notify them about content that shipped in the binary.
  if (isEmbeddedLaunch) return null;
  if (lastNotifiedUpdateId === currentUpdateId) return null;

  const title = metadata.title.trim() || OTA_DEFAULT_TITLE;
  const body = metadata.body.trim() || OTA_DEFAULT_BODY;
  return { title, body };
}
