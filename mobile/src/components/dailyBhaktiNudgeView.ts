/**
 * Pure view-model for the Daily Bhakti setup strip (design.md §23). The strip asks
 * for ONE thing at a time: the daily-verse reminder first, then the home-screen
 * verse widget. Keeping the gate and the copy out of the component makes every
 * branch unit-testable without a provider tree.
 */

import type { Lang } from '@/data/gita/language';
import type { PermissionStatus } from '@/notifications/permissionState';
import type { TimeOfDay } from '@/notifications/pure';
import { pick } from '@/utils/localize';

export type NudgeKind = 'reminder' | 'reminderBlocked' | 'widget';

/** Strip bookkeeping, epoch ms; `null` = never happened. */
export type NudgeRecord = {
  reminderDismissedAt: number | null;
  /**
   * Final, unlike the reminder's snooze: the app cannot see a placed widget, so a
   * re-offer would keep nagging people who already have one. The gallery stays in More.
   */
  widgetDismissedAt: number | null;
  /** Set once the user went through an add flow — the OS never says whether a widget was placed. */
  widgetAddedAt: number | null;
};

export const NUDGE_STORAGE_KEY = '@vedansh/daily-bhakti-nudge';

/** A "not now" on the reminder ask rests it this long — the opt-in sheet's cadence (design.md §38). */
export const NUDGE_SNOOZE_DAYS = 15;
const NUDGE_SNOOZE_MS = NUDGE_SNOOZE_DAYS * 24 * 60 * 60 * 1000;

export const EMPTY_NUDGE_RECORD: NudgeRecord = {
  reminderDismissedAt: null,
  widgetDismissedAt: null,
  widgetAddedAt: null,
};

function stamp(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;
}

export function parseNudgeRecord(raw: string | null): NudgeRecord {
  if (!raw) return EMPTY_NUDGE_RECORD;
  try {
    const parsed = JSON.parse(raw) as Partial<Record<keyof NudgeRecord, unknown>> | null;
    if (!parsed || typeof parsed !== 'object') return EMPTY_NUDGE_RECORD;
    return {
      reminderDismissedAt: stamp(parsed.reminderDismissedAt),
      widgetDismissedAt: stamp(parsed.widgetDismissedAt),
      widgetAddedAt: stamp(parsed.widgetAddedAt),
    };
  } catch {
    return EMPTY_NUDGE_RECORD;
  }
}

function snoozed(at: number | null, now: number): boolean {
  return at != null && now - at < NUDGE_SNOOZE_MS;
}

export type NudgeInputs = {
  /** Notification prefs AND the strip record have hydrated. */
  ready: boolean;
  dailyVerseEnabled: boolean;
  permissionStatus: PermissionStatus;
  canAskAgain: boolean;
  /** The binary carries the widget extension (`hasWidgetHost`). */
  widgetHost: boolean;
  record: NudgeRecord;
  now: number;
};

/**
 * Which ask the strip shows, or `null` for none. The reminder counts as set up
 * only when it is on AND the OS grant exists — the same pair the scheduler needs.
 * The widget is offered once the reminder is set up or its ask is resting, so a
 * "not now" on one never blocks the other; the widget ask ends at its first
 * "not now" or completed add flow.
 */
export function selectNudge(input: NudgeInputs): NudgeKind | null {
  if (!input.ready) return null;
  const reminderOn = input.dailyVerseEnabled && input.permissionStatus === 'granted';
  if (!reminderOn) {
    // The default-on reminder with an unanswered permission means the provider is
    // putting the OS prompt up this launch — never stack a second ask on it.
    if (input.dailyVerseEnabled && input.permissionStatus === 'undetermined') return null;
    if (!snoozed(input.record.reminderDismissedAt, input.now)) {
      return input.permissionStatus === 'denied' && !input.canAskAgain ? 'reminderBlocked' : 'reminder';
    }
  }
  if (input.widgetHost && input.record.widgetAddedAt == null && input.record.widgetDismissedAt == null) {
    return 'widget';
  }
  return null;
}

/** `HH:MM`, the same 24-hour form TimeStepper shows. */
export function formatReminderTimes(times: TimeOfDay[]): string {
  return times
    .map((t) => `${`${t.hour}`.padStart(2, '0')}:${`${t.minute}`.padStart(2, '0')}`)
    .join(' · ');
}

export type NudgeCopy = { title: string; subtitle: string; action: string };

export function nudgeCopy(kind: NudgeKind, lang: Lang, times: TimeOfDay[]): NudgeCopy {
  const at = formatReminderTimes(times);
  switch (kind) {
    case 'reminder':
      return {
        title: pick(lang, {
          hi: 'रोज़ सुबह श्लोक पाएँ',
          en: 'A verse every morning',
          gu: 'દરરોજ સવારે શ્લોક મેળવો',
          kn: 'ಪ್ರತಿ ಬೆಳಗ್ಗೆ ಒಂದು ಶ್ಲೋಕ',
        }),
        subtitle: pick(lang, {
          hi: `हर दिन ${at} बजे`,
          en: `Daily at ${at}`,
          gu: `દરરોજ ${at} વાગ્યે`,
          kn: `ಪ್ರತಿದಿನ ${at} ಕ್ಕೆ`,
        }),
        action: pick(lang, { hi: 'चालू करें', en: 'Turn on', gu: 'ચાલુ કરો', kn: 'ಆನ್ ಮಾಡಿ' }),
      };
    case 'reminderBlocked':
      return {
        title: pick(lang, {
          hi: 'सूचनाएँ बंद हैं',
          en: 'Notifications are off',
          gu: 'સૂચનાઓ બંધ છે',
          kn: 'ಅಧಿಸೂಚನೆಗಳು ಆಫ್ ಆಗಿವೆ',
        }),
        subtitle: pick(lang, {
          hi: 'फ़ोन की सेटिंग में चालू करें',
          en: 'Turn them on in phone Settings',
          gu: 'ફોનના સેટિંગ્સમાં ચાલુ કરો',
          kn: 'ಫೋನ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳಲ್ಲಿ ಆನ್ ಮಾಡಿ',
        }),
        action: pick(lang, { hi: 'सेटिंग खोलें', en: 'Settings', gu: 'સેટિંગ્સ', kn: 'ಸೆಟ್ಟಿಂಗ್ಸ್' }),
      };
    case 'widget':
    default:
      return {
        title: pick(lang, {
          hi: 'होम-स्क्रीन पर श्लोक',
          en: 'Verse on your Home Screen',
          gu: 'હોમ સ્ક્રીન પર શ્લોક',
          kn: 'ಹೋಮ್ ಸ್ಕ್ರೀನ್‌ನಲ್ಲಿ ಶ್ಲೋಕ',
        }),
        subtitle: pick(lang, {
          hi: 'ऐप खोले बिना आज का श्लोक',
          en: 'Today’s verse without opening the app',
          gu: 'એપ ખોલ્યા વિના આજનો શ્લોક',
          kn: 'ಆಪ್ ತೆರೆಯದೆ ಇಂದಿನ ಶ್ಲೋಕ',
        }),
        action: pick(lang, { hi: 'जोड़ें', en: 'Add', gu: 'ઉમેરો', kn: 'ಸೇರಿಸಿ' }),
      };
  }
}

/** The confirmation the widget strip carries right after the reminder is switched on here. */
export function reminderOnLine(lang: Lang, times: TimeOfDay[]): string {
  const at = formatReminderTimes(times);
  return pick(lang, {
    hi: `स्मरण चालू · ${at}`,
    en: `Reminder on · ${at}`,
    gu: `સ્મરણ ચાલુ · ${at}`,
    kn: `ಸ್ಮರಣೆ ಆನ್ · ${at}`,
  });
}
