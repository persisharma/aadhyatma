/**
 * Pure, side-effect-free planner for festive reminders.
 *
 * Festive reminders are the default-ON counterpart to the opt-in vrat reminders
 * (`vratReminderPure.ts`): the user follows nothing, and on each famous festival
 * in the curated catalog (`festiveReminders.ts`) one morning notification carries
 * that festival's own greeting plus an invitation to read a named bundled text.
 *
 * Deterministic and dependency-free — no `expo-notifications`, no astronomy, no
 * `Date.now()` — so it can be unit-tested via `tsx` without bootstrapping React
 * Native. `now` is always parameterised.
 */

import type { Lang } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import type { FestiveReminderEntry } from './festiveReminders';

/** Identifier prefix for all festive reminders. Lets us cancel just ours. */
export const FESTIVE_NOTIF_PREFIX = 'festive-reminder';

/**
 * Dedicated slice of iOS's 64 pending-notification budget. Kept deliberately
 * small: the daily-verse window is by far the biggest tenant (up to
 * `IOS_PENDING_CAP` on its own), and festivals are sparse enough that a handful
 * of slots already covers months. See design.md §38 for the budget arithmetic.
 */
export const FESTIVE_REMINDER_CAP = 8;

/**
 * How far ahead festival dates are armed. Much longer than the daily-verse
 * 30-day window on purpose: festivals are ~monthly, and a user who does not open
 * the app for six weeks should still get Diwali. Costs nothing — a 120-day window
 * typically holds only three or four festivals.
 */
export const FESTIVE_WINDOW_DAYS = 120;

/**
 * Local fire time on the festival day. Half an hour after the daily-verse
 * default (07:00) so the two never land in the same instant and read as a
 * duplicate; still early enough to reach the reader before the day's puja.
 */
export const FESTIVE_HOUR = 7;
export const FESTIVE_MINUTE = 30;

export type FestiveReminderInput = {
  /** `ObservanceRule.id`. */
  ruleId: string;
  /** Localized observance names, taken from the rule (not the catalog). */
  nameHi: string;
  nameEn: string;
  /** Upcoming local dates for this rule; anything outside the window is dropped. */
  occurrences: Date[];
  /** Curated copy + content target for this festival. */
  entry: FestiveReminderEntry;
};

export type PlannedFestiveNotification = {
  identifier: string;
  ruleId: string;
  /** `LibraryEntry.id` the tap should open. */
  sourceId: string;
  fireDate: Date;
  occurrenceDateKey: string;
  nameHi: string;
  nameEn: string;
  greetingHi: string;
  greetingEn: string;
  inviteHi: string;
  inviteEn: string;
};

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

type Candidate = PlannedFestiveNotification & { order: number };

/**
 * Plan the festive notifications to schedule. Returns the planned set (≤ cap)
 * plus the count the cap truncated.
 *
 * Capping is **soonest-first**, unlike the vrat planner's followed-first rule: no
 * one asked for these, so a festival three days out must never lose its slot to a
 * more famous one four months out. Catalog (fame) order is only the tie-break for
 * two festivals landing on the same instant.
 */
export function planFestiveReminders(
  inputs: FestiveReminderInput[],
  now: Date,
  windowDays: number = FESTIVE_WINDOW_DAYS,
  cap: number = FESTIVE_REMINDER_CAP
): { planned: PlannedFestiveNotification[]; truncated: number } {
  const windowEnd = startOfLocalDay(now);
  windowEnd.setDate(windowEnd.getDate() + windowDays);
  windowEnd.setHours(23, 59, 59, 999);

  const candidates: Candidate[] = [];
  const seen = new Set<string>();

  for (let order = 0; order < inputs.length; order += 1) {
    const it = inputs[order];
    for (const occurrence of it.occurrences) {
      const fire = startOfLocalDay(occurrence);
      fire.setHours(FESTIVE_HOUR, FESTIVE_MINUTE, 0, 0);
      // Strictly future only: a festival whose morning has already passed today
      // must not be scheduled into the past (expo would fire it immediately).
      if (fire.getTime() <= now.getTime()) continue;
      if (fire.getTime() > windowEnd.getTime()) continue;

      const occurrenceDateKey = toDateKey(fire);
      const identifier = `${FESTIVE_NOTIF_PREFIX}:${it.ruleId}:${occurrenceDateKey}`;
      // A rule can be handed the same date twice (two resolved years overlapping,
      // a re-resolve mid-scan); one notification per rule-occurrence.
      if (seen.has(identifier)) continue;
      seen.add(identifier);

      candidates.push({
        identifier,
        ruleId: it.ruleId,
        sourceId: it.entry.sourceId,
        fireDate: fire,
        occurrenceDateKey,
        nameHi: it.nameHi,
        nameEn: it.nameEn,
        greetingHi: it.entry.greetingHi,
        greetingEn: it.entry.greetingEn,
        inviteHi: it.entry.inviteHi,
        inviteEn: it.entry.inviteEn,
        order,
      });
    }
  }

  candidates.sort((a, b) =>
    a.fireDate.getTime() !== b.fireDate.getTime()
      ? a.fireDate.getTime() - b.fireDate.getTime()
      : a.order - b.order
  );

  const kept = candidates.slice(0, cap);
  const truncated = candidates.length - kept.length;
  const planned = kept.map(({ order, ...rest }) => rest);
  return { planned, truncated };
}

/**
 * Notification copy for one planned festive reminder, in the reader's language.
 *
 * The **title is the festival's own name** — never a generic category label, and
 * never concatenated with anything, so no budget can slice a Devanagari conjunct
 * (the trap `dayAnga.ts`'s `TITLE_MAX_CHARS` exists to dodge). The **body carries
 * the customised message**: the festival's greeting, then the invitation naming
 * the text a tap will open. gu/kn re-script the Devanagari, en uses the authored
 * English — the same policy the readers use for content-bearing strings.
 */
export function formatFestiveReminderContent(
  p: PlannedFestiveNotification,
  lang: Lang = 'hi'
): { title: string; body: string } {
  const title = contentByLang(lang, p.nameHi, p.nameEn);
  const greeting = contentByLang(lang, p.greetingHi, p.greetingEn);
  const invite = contentByLang(lang, p.inviteHi, p.inviteEn);
  return { title, body: `${greeting} · ${invite}` };
}
