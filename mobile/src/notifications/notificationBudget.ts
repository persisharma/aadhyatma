/**
 * The shared iOS pending-notification budget.
 *
 * iOS keeps at most 64 pending local notifications per app and silently drops
 * the overflow, so the families' caps must add up. Each family's own cap was
 * sized alone and the sum was ~160 in the worst case; the families that arm last
 * (festive, Pitru) lost. This table is the single place the 64 is divided, and
 * `notificationBudget.test.ts` fails if it ever sums past `IOS_PENDING_BUDGET`
 * or a family stops reading its slice from here.
 *
 * Applies to iOS only. Android has no such limit, so `familyCap` hands every
 * other platform each planner's own (larger) default and its behaviour is
 * unchanged. Pure and dependency-free: the OS is a parameter.
 */

import { IOS_PENDING_CAP } from './pure';
import { VRAT_REMINDER_CAP } from './vratReminderPure';
import { SADHANA_REMINDER_CAP } from './sadhanaReminderPure';
import { ROUTINE_REMINDER_CAP } from './routineReminderPure';
import { MUHURAT_REMINDER_CAP } from './muhuratReminderPure';
import { FESTIVE_REMINDER_CAP } from './festiveReminderPure';
import { RETURN_REMINDER_CAP } from './returnReminderPure';
import { PITRU_SMARAN_REMINDER_CAP } from './pitruSmaranReminderPure';
import { JANMA_TITHI_REMINDER_CAP } from './janmaTithiReminderPure';
import { PITRU_PAKSHA_REMINDER_CAP } from './pitruPakshaReminderPure';

/** iOS's hard limit on pending local notifications. */
export const IOS_PENDING_BUDGET = 64;

export type BudgetFamily =
  | 'dailyVerse'
  | 'vrat'
  | 'sadhana'
  | 'routine'
  | 'muhurat'
  | 'festive'
  | 'return'
  | 'pitruSmaran'
  | 'janmaTithi'
  | 'pitruPaksha';

/**
 * Slots per family on iOS. Daily verse is the always-on tenant and takes the
 * largest share (20 = a 20-day window for one time, 5 days each for four); vrat
 * follows are an explicit opt-in so they rank next; the rest are sized for a
 * realistic handful of items. The sum is exactly the iOS limit.
 */
export const IOS_FAMILY_BUDGET: Readonly<Record<BudgetFamily, number>> = {
  dailyVerse: 20,
  vrat: 12,
  sadhana: 6,
  routine: 6,
  muhurat: 4,
  festive: 4,
  return: 5,
  pitruSmaran: 3,
  janmaTithi: 2,
  pitruPaksha: 2,
};

/** Rolling windows shrunk together with the caps (sadhana/routine were 9/7 days). */
export const IOS_REMINDER_WINDOW_DAYS = { sadhana: 3, routine: 3 } as const;

/** Each family's cap before this budget existed — what every non-iOS platform keeps. */
const LEGACY_CAP: Readonly<Record<BudgetFamily, number>> = {
  dailyVerse: IOS_PENDING_CAP,
  vrat: VRAT_REMINDER_CAP,
  sadhana: SADHANA_REMINDER_CAP,
  routine: ROUTINE_REMINDER_CAP,
  muhurat: MUHURAT_REMINDER_CAP,
  festive: FESTIVE_REMINDER_CAP,
  return: RETURN_REMINDER_CAP,
  pitruSmaran: PITRU_SMARAN_REMINDER_CAP,
  janmaTithi: JANMA_TITHI_REMINDER_CAP,
  pitruPaksha: PITRU_PAKSHA_REMINDER_CAP,
};

/** The pending-notification cap `family` may use on `os` (`Platform.OS`). */
export function familyCap(os: string, family: BudgetFamily): number {
  return os === 'ios' ? IOS_FAMILY_BUDGET[family] : LEGACY_CAP[family];
}

/** Window days for the two families whose window shrinks on iOS; `legacy` elsewhere. */
export function familyWindowDays(
  os: string,
  family: keyof typeof IOS_REMINDER_WINDOW_DAYS,
  legacy: number
): number {
  return os === 'ios' ? IOS_REMINDER_WINDOW_DAYS[family] : legacy;
}
