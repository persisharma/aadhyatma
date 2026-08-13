import type { Lang } from '@/data/gita/language';
import type { PitruPakshaWindow } from '@/panchang/pitruSmaran';

export const PITRU_PAKSHA_NOTIF_PREFIX = 'pitru-paksha-reminder';

export type PlannedPitruPakshaReminder = {
  identifier: string;
  kind: 'seasonStart' | 'sarvapitriEve';
  year: number;
  fireDate: Date;
};

function eveOf(date: Date): Date {
  const fire = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1, 18, 0, 0, 0);
  return fire;
}

export function planPitruPakshaReminders(
  windows: { year: number; window: PitruPakshaWindow }[],
  now: Date
): PlannedPitruPakshaReminder[] {
  return windows
    .flatMap(({ year, window }) => [
      {
        identifier: `${PITRU_PAKSHA_NOTIF_PREFIX}:${year}:seasonStart`,
        kind: 'seasonStart' as const,
        year,
        fireDate: eveOf(window.purnima),
      },
      {
        identifier: `${PITRU_PAKSHA_NOTIF_PREFIX}:${year}:sarvapitriEve`,
        kind: 'sarvapitriEve' as const,
        year,
        fireDate: eveOf(window.end),
      },
    ])
    .filter((item) => item.fireDate.getTime() > now.getTime())
    .sort((a, b) => a.fireDate.getTime() - b.fireDate.getTime())
    .slice(0, 4);
}

export function formatPitruPakshaReminderContent(
  item: PlannedPitruPakshaReminder,
  lang: Lang
): { title: string; body: string } {
  if (lang === 'en') {
    return item.kind === 'seasonStart'
      ? { title: 'Pitru Paksha', body: 'Pitru Paksha begins tomorrow · Remember your ancestors · Gita paath' }
      : { title: 'Sarvapitri Amavasya', body: 'Tomorrow is the final day of Pitru Paksha · Gita paath' };
  }
  return item.kind === 'seasonStart'
    ? { title: 'पितृ पक्ष', body: 'कल से पितृ पक्ष — अपने पितरों का स्मरण करें · गीता पाठ' }
    : { title: 'सर्वपितृ अमावस्या', body: 'कल सर्वपितृ अमावस्या — पितृ पक्ष का अंतिम दिन · गीता पाठ' };
}
