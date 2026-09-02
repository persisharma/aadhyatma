// जन्म तिथि reminders (PRD-29 §3.5) — the personal-family planner for the
// tithis of the LIVING. Pure: no clock, no expo-notifications, no astronomy —
// `now` is a parameter and `nextDate` arrives solved (tested via `tsx --test`).
//
// One notice per person per occurrence — the evening before at 18:00 (the
// prototype's `एक दिन पहले`, and the shared advance hour every evening notice
// in the app uses). No day-of slot: the Home Today chip owns the day itself,
// and a single slot keeps this family's worst case at 8 pending against the
// shared iOS budget ([[notifications]] gotcha). Cap ranks soonest-first, the
// dated-one-shot rule (`muhuratReminderPure` precedent): nobody ranked their
// family, so the nearest birthday wins a scarce slot.
import type { Lang } from '@/data/gita/language';

export const JANMA_TITHI_NOTIF_PREFIX = 'janma-tithi-reminder';
/** The roster itself caps at MAX_PEOPLE = 8, so this is one slot per person. */
export const JANMA_TITHI_REMINDER_CAP = 8;
export const JANMA_TITHI_EVE_HOUR = 18;

export type JanmaTithiReminderInput = {
  personId: string;
  /** The roster label — name or birth date, never an invented placeholder. */
  displayNameHi: string;
  displayNameEn: string;
  tithiHi: string;
  tithiEn: string;
  nextDate: Date | null;
};

export type PlannedJanmaTithiReminder = JanmaTithiReminderInput & {
  identifier: string;
  fireDate: Date;
  occurrenceDateKey: string;
};

function localDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function dateKey(date: Date): string {
  return [
    date.getFullYear(),
    `${date.getMonth() + 1}`.padStart(2, '0'),
    `${date.getDate()}`.padStart(2, '0'),
  ].join('-');
}

export function planJanmaTithiReminders(
  inputs: JanmaTithiReminderInput[],
  now: Date,
  cap = JANMA_TITHI_REMINDER_CAP
): PlannedJanmaTithiReminder[] {
  const windowEnd = localDay(now);
  windowEnd.setDate(windowEnd.getDate() + 430);
  windowEnd.setHours(23, 59, 59, 999);
  const planned: PlannedJanmaTithiReminder[] = [];

  for (const input of inputs) {
    if (!input.nextDate) continue;
    const occurrence = localDay(input.nextDate);
    const occurrenceDateKey = dateKey(occurrence);
    const eve = localDay(occurrence);
    eve.setDate(eve.getDate() - 1);
    eve.setHours(JANMA_TITHI_EVE_HOUR, 0, 0, 0);
    if (eve.getTime() <= now.getTime() || eve.getTime() > windowEnd.getTime()) continue;
    planned.push({
      ...input,
      fireDate: eve,
      occurrenceDateKey,
      identifier: `${JANMA_TITHI_NOTIF_PREFIX}:${input.personId}:${occurrenceDateKey}`,
    });
  }
  return planned.sort((a, b) => a.fireDate.getTime() - b.fireDate.getTime()).slice(0, cap);
}

/** Devotional register, never social — no greeting, no exclamation (PRD-29 §6). */
export function formatJanmaTithiReminderContent(
  item: PlannedJanmaTithiReminder,
  lang: Lang
): { title: string; body: string } {
  if (lang === 'en') {
    return {
      title: 'Janma Tithi',
      body: `Tomorrow is ${item.displayNameEn}’s janma tithi · ${item.tithiEn}`,
    };
  }
  return {
    title: 'जन्म तिथि',
    body: `कल ${item.displayNameHi} की जन्म तिथि है · ${item.tithiHi}`,
  };
}
