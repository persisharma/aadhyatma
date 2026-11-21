import type { VratFollow, VratReminderPref } from '@/contexts/VratFollowContext';
import type { CalendarSystem } from '@/panchang/types';
import { getNextOccurrence, getRuleById } from '@/panchang/vratCatalog';
import type { VratReminderInput } from './vratReminderPure';

/** Planner inputs for the followed vrats — shared by the vrat scheduler and the festive scheduler's dedupe. */
export function followedVratReminderInputs(
  follows: VratFollow[],
  reminderDefault: VratReminderPref,
  today: Date,
  calendarSystem: CalendarSystem
): VratReminderInput[] {
  const inputs: VratReminderInput[] = [];
  for (const f of follows) {
    const rule = getRuleById(f.ruleId);
    if (!rule) continue;
    const next = getNextOccurrence(rule.id, today, calendarSystem);
    const pref = f.reminder ?? reminderDefault;
    inputs.push({
      ruleId: rule.id,
      order: f.order,
      nameHi: rule.nameHi,
      nameEn: rule.nameEn,
      nextDate: next?.date ?? null,
      pref: {
        advanceDays: pref.advanceDays,
        dayOf: pref.dayOf,
        dayOfTime: pref.dayOfTime ?? reminderDefault.dayOfTime ?? { hour: 7, minute: 0 },
      },
    });
  }
  return inputs;
}
