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
  /** When the daily notification should fire (24h local time). */
  time: TimeOfDay;
  /** Inclusive start of quiet hours (24h). */
  quietStart: TimeOfDay;
  /** Exclusive end of quiet hours (24h). E.g. 22:00–06:00 means no notifications between 22:00 and 06:00. */
  quietEnd: TimeOfDay;
};

export type NotificationPayload = {
  type: 'daily-verse';
  dateKey: string;
  sourceId: string;
  verseIndex: number;
  chapter?: number;
};

/**
 * Return the supplied time, clamped forward to the next allowed slot if it falls
 * inside quiet hours. Quiet hours wrap across midnight (e.g. 22:00 → 06:00).
 *
 * The clamping rule is simple and predictable:
 *  - If the time is inside the quiet window, shift it to `quietEnd`.
 *  - Otherwise, return it unchanged.
 *
 * Pure function — used by the scheduler and surfaced in Settings copy.
 */
export function applyQuietHours(
  time: TimeOfDay,
  quietStart: TimeOfDay,
  quietEnd: TimeOfDay
): TimeOfDay {
  const t = time.hour * 60 + time.minute;
  const s = quietStart.hour * 60 + quietStart.minute;
  const e = quietEnd.hour * 60 + quietEnd.minute;
  const inside =
    s === e
      ? false // empty quiet window
      : s < e
        ? t >= s && t < e // non-wrapping window
        : t >= s || t < e; // wraps across midnight
  return inside ? { hour: quietEnd.hour, minute: quietEnd.minute } : time;
}

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
