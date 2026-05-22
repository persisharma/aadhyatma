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
 * Compute the array of fire dates for the next `ROLLING_WINDOW_DAYS` days at the
 * given time-of-day. If the requested time today has already passed, the window
 * starts at tomorrow.
 *
 * `now` is parameterised so the function is fully deterministic and testable.
 */
export function computeFireDates(time: TimeOfDay, now: Date): Date[] {
  const out: Date[] = [];
  const todayAt = new Date(now);
  todayAt.setHours(time.hour, time.minute, 0, 0);
  const startOffset = todayAt.getTime() <= now.getTime() ? 1 : 0;

  for (let i = 0; i < ROLLING_WINDOW_DAYS; i += 1) {
    const fire = new Date(now);
    fire.setDate(fire.getDate() + startOffset + i);
    fire.setHours(time.hour, time.minute, 0, 0);
    out.push(fire);
  }
  return out;
}

/**
 * Compute the merged, time-sorted, deduplicated list of fire dates for a set of
 * reminder times across the rolling window. Two times that produce the same
 * exact fire instant collapse to a single entry — this can happen at the
 * window boundary when callers pass duplicate times.
 */
export function computeFireDatesMulti(times: TimeOfDay[], now: Date): Date[] {
  if (times.length === 0) return [];
  const seen = new Set<number>();
  const merged: Date[] = [];
  for (const t of times) {
    for (const d of computeFireDates(t, now)) {
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
