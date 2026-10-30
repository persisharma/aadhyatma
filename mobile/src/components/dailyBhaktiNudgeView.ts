/**
 * Pure view-model for the Daily Bhakti setup strip (design.md §23). The strip asks
 * for ONE thing at a time: the daily-verse reminder first, then the home-screen
 * widget pair (verse + Panchang). Keeping the gate and the copy out of the component makes every
 * branch unit-testable without a provider tree.
 */

import type { Lang } from '@/data/gita/language';
import type { PermissionStatus } from '@/notifications/permissionState';
import type { TimeOfDay } from '@/notifications/pure';
import type { WidgetContent } from '@/widgets/catalog';
import { pick } from '@/utils/localize';

/**
 * `widget` offers the verse + Panchang pair in one add flow; `panchangWidget` is the
 * Panchang alone, for anyone whose verse add flow already ran (an Android chain the
 * launcher interrupted, or a user from before the pair existed).
 */
export type NudgeKind = 'reminder' | 'reminderBlocked' | 'widget' | 'panchangWidget';

/** Strip bookkeeping, epoch ms; `null` = never happened. */
export type NudgeRecord = {
  reminderDismissedAt: number | null;
  /**
   * Final, unlike the reminder's snooze: the app cannot see a placed widget, so a
   * re-offer would keep nagging people who already have one. The gallery stays in More.
   */
  widgetDismissedAt: number | null;
  /** Set once the user went through the verse add flow — the OS never says whether a widget was placed. */
  widgetAddedAt: number | null;
  /** The same for the Panchang widget. */
  panchangAddedAt: number | null;
};

export const NUDGE_STORAGE_KEY = '@vedansh/daily-bhakti-nudge';

/** A "not now" on the reminder ask rests it this long — the opt-in sheet's cadence (design.md §38). */
export const NUDGE_SNOOZE_DAYS = 15;
const NUDGE_SNOOZE_MS = NUDGE_SNOOZE_DAYS * 24 * 60 * 60 * 1000;

export const EMPTY_NUDGE_RECORD: NudgeRecord = {
  reminderDismissedAt: null,
  widgetDismissedAt: null,
  widgetAddedAt: null,
  panchangAddedAt: null,
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
      panchangAddedAt: stamp(parsed.panchangAddedAt),
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
 * The widgets are offered once the reminder is set up or its ask is resting, so a
 * "not now" on one never blocks the other. The pair comes first; a completed verse
 * add flow leaves the Panchang ask; one "not now" ends both.
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
  if (!input.widgetHost || input.record.widgetDismissedAt != null) return null;
  if (input.record.widgetAddedAt == null) return 'widget';
  if (input.record.panchangAddedAt == null) return 'panchangWidget';
  return null;
}

export type NudgeWidget = Extract<WidgetContent, 'verse' | 'panchang'>;

export function isWidgetNudge(kind: NudgeKind): kind is 'widget' | 'panchangWidget' {
  return kind === 'widget' || kind === 'panchangWidget';
}

/**
 * The widgets an ask adds, in add order — the Home Screen layout the strip promises:
 * the verse at Wide above the Panchang at Small.
 */
export function nudgeWidgets(kind: NudgeKind): NudgeWidget[] {
  if (kind === 'widget') return ['verse', 'panchang'];
  if (kind === 'panchangWidget') return ['panchang'];
  return [];
}

/** The record stamp a completed add flow for `content` sets. */
export function widgetAddedPatch(content: NudgeWidget, at: number): Partial<NudgeRecord> {
  return content === 'verse' ? { widgetAddedAt: at } : { panchangAddedAt: at };
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
    case 'panchangWidget':
      return {
        title: pick(lang, {
          hi: 'होम-स्क्रीन पर पंचांग',
          en: 'Panchang on your Home Screen',
          gu: 'હોમ સ્ક્રીન પર પંચાંગ',
          kn: 'ಹೋಮ್ ಸ್ಕ್ರೀನ್‌ನಲ್ಲಿ ಪಂಚಾಂಗ',
        }),
        subtitle: pick(lang, {
          hi: 'आज की तिथि और सूर्योदय, एक नज़र में',
          en: 'Today’s tithi and sunrise at a glance',
          gu: 'આજની તિથિ અને સૂર્યોદય, એક નજરમાં',
          kn: 'ಇಂದಿನ ತಿಥಿ ಮತ್ತು ಸೂರ್ಯೋದಯ, ಒಂದೇ ನೋಟದಲ್ಲಿ',
        }),
        action: pick(lang, { hi: 'जोड़ें', en: 'Add', gu: 'ઉમેરો', kn: 'ಸೇರಿಸಿ' }),
      };
    case 'widget':
    default:
      return {
        title: pick(lang, {
          hi: 'श्लोक और पंचांग विजेट',
          en: 'Verse & Panchang widgets',
          gu: 'શ્લોક અને પંચાંગ વિજેટ',
          kn: 'ಶ್ಲೋಕ ಮತ್ತು ಪಂಚಾಂಗ ವಿಜೆಟ್',
        }),
        subtitle: pick(lang, {
          hi: 'ऐप खोले बिना आज का श्लोक और तिथि',
          en: 'Today’s verse and tithi without opening the app',
          gu: 'એપ ખોલ્યા વિના આજનો શ્લોક અને તિથિ',
          kn: 'ಆಪ್ ತೆರೆಯದೆ ಇಂದಿನ ಶ್ಲೋಕ ಮತ್ತು ತಿಥಿ',
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
