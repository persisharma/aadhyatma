import type { Lang } from '@/data/gita/language';

export const PITRU_SMARAN_NOTIF_PREFIX = 'pitru-smaran-reminder';
export const PITRU_SMARAN_REMINDER_CAP = 8;

export type PitruSmaranReminderInput = {
  entryId: string;
  displayNameHi: string;
  displayNameEn: string;
  tithiHi: string;
  tithiEn: string;
  nextDate: Date | null;
};

export type PlannedPitruSmaranReminder = PitruSmaranReminderInput & {
  identifier: string;
  kind: 'advance' | 'dayOf';
  fireDate: Date;
  occurrenceDateKey: string;
};

function localDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function dateKey(date: Date): string {
  return [date.getFullYear(), `${date.getMonth() + 1}`.padStart(2, '0'), `${date.getDate()}`.padStart(2, '0')].join('-');
}

export function planPitruSmaranReminders(
  inputs: PitruSmaranReminderInput[],
  now: Date,
  cap = PITRU_SMARAN_REMINDER_CAP
): PlannedPitruSmaranReminder[] {
  const windowEnd = localDay(now);
  windowEnd.setDate(windowEnd.getDate() + 430);
  windowEnd.setHours(23, 59, 59, 999);
  const planned: PlannedPitruSmaranReminder[] = [];

  for (const input of inputs) {
    if (!input.nextDate) continue;
    const occurrence = localDay(input.nextDate);
    const occurrenceDateKey = dateKey(occurrence);
    const slots: { kind: 'advance' | 'dayOf'; fireDate: Date }[] = [];
    const advance = localDay(occurrence);
    advance.setDate(advance.getDate() - 1);
    advance.setHours(18, 0, 0, 0);
    slots.push({ kind: 'advance', fireDate: advance });
    const dayOf = localDay(occurrence);
    dayOf.setHours(7, 0, 0, 0);
    slots.push({ kind: 'dayOf', fireDate: dayOf });
    for (const slot of slots) {
      if (slot.fireDate.getTime() <= now.getTime() || slot.fireDate.getTime() > windowEnd.getTime()) continue;
      planned.push({
        ...input,
        ...slot,
        occurrenceDateKey,
        identifier: `${PITRU_SMARAN_NOTIF_PREFIX}:${input.entryId}:${slot.kind}:${occurrenceDateKey}`,
      });
    }
  }
  return planned.sort((a, b) => a.fireDate.getTime() - b.fireDate.getTime()).slice(0, cap);
}

export function formatPitruSmaranReminderContent(
  item: PlannedPitruSmaranReminder,
  lang: Lang
): { title: string; body: string } {
  if (lang === 'en') {
    return {
      title: 'Pitru Smaran',
      body: item.kind === 'advance'
        ? `Tomorrow is ${item.displayNameEn}’s remembrance · Shraddha tithi: ${item.tithiEn}`
        : `Today is ${item.displayNameEn}’s remembrance · Shraddha tithi: ${item.tithiEn}`,
    };
  }
  return {
    title: 'पितृ स्मरण',
    body: `${item.kind === 'advance' ? 'कल' : 'आज'} ${item.displayNameHi} की पुण्यतिथि है · श्राद्ध तिथि: ${item.tithiHi}`,
  };
}
