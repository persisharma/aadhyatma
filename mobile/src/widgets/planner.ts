import { WIDGET_SCHEMA_VERSION, WIDGET_TIME_ZONE, isValidIanaTimeZone, widgetDateKey, type PanchangWidgetDay, type VerseWidgetDay, type WidgetLocalizedText, type WidgetPayloadV1 } from './contract';
import type { Lang } from '@/data/gita/language';
import type { CalendarSystem, PanchangLocation } from '@/panchang/types';
import type { DailyEntry } from '@/contexts/UserActivityContext';
import { transliterateDevanagari } from '@/utils/transliterate';

export type WidgetPlannerInput = {
  generatedAt: Date;
  writerAppVersion: string;
  locale: Lang;
  location: PanchangLocation;
  calendarSystem: CalendarSystem;
  deviceTimeZone: string;
  panchangDays: PanchangWidgetDay[];
  verseDays: VerseWidgetDay[];
  activity: Record<string, DailyEntry>;
  lastUsedMantraId?: string;
};

function localizedCity(location: PanchangLocation): WidgetLocalizedText {
  return { hi: location.labelHi, en: location.labelEn, gu: transliterateDevanagari(location.labelHi, 'gu'), kn: transliterateDevanagari(location.labelHi, 'kn') };
}

export function japaDayIsActive(day?: DailyEntry): boolean {
  return !!day && Object.values(day.japa).some(({ beads, rounds }) => beads > 0 || rounds > 0);
}

export function computeJapaStreak(activity: Record<string, DailyEntry>, dateKey: string): number {
  let cursor = dateKey;
  if (!japaDayIsActive(activity[cursor])) cursor = shiftDateKey(cursor, -1);
  let streak = 0;
  while (true) {
    if (!japaDayIsActive(activity[cursor])) break;
    streak += 1;
    cursor = shiftDateKey(cursor, -1);
  }
  return streak;
}

export function shiftDateKey(key: string, days: number): string {
  const [year, month, day] = key.split('-').map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, '0')}-${String(shifted.getUTCDate()).padStart(2, '0')}`;
}

/** Convert an IANA-zone civil time to an instant without using process TZ. */
function zonedInstant(key: string, timeZone: string, hour: number, minute: number, second: number): Date {
  const [year, month, day] = key.split('-').map(Number);
  const desired = Date.UTC(year, month - 1, day, hour, minute, second);
  let guess = desired;
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  for (let index = 0; index < 4; index += 1) {
    const parts = Object.fromEntries(formatter.formatToParts(new Date(guess)).map((part) => [part.type, part.value]));
    const represented = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute), Number(parts.second));
    const correction = desired - represented;
    guess += correction;
    if (correction === 0) break;
  }
  return new Date(guess);
}

export function validThroughForDateKey(key: string, timeZone: string): string {
  if (!isValidIanaTimeZone(timeZone)) throw new Error(`Invalid widget IANA time zone: ${timeZone}`);
  return zonedInstant(key, timeZone, 23, 59, 59).toISOString();
}

export function buildWidgetPayload(input: WidgetPlannerInput): WidgetPayloadV1 {
  if (input.panchangDays.length === 0 || input.verseDays.length === 0) throw new Error('Widget payload requires dated Panchang and verse entries');
  if (!isValidIanaTimeZone(input.deviceTimeZone)) throw new Error('Widget payload requires a valid device IANA time zone');
  const dateKey = widgetDateKey(input.generatedAt, input.deviceTimeZone);
  const today = input.activity[dateKey];
  const totals = Object.entries(today?.japa ?? {}).reduce(
    (out, [mantraId, value]) => {
      out.totalBeads += value.beads;
      out.totalRounds += value.rounds;
      if (!out.lastUsedMantraId || value.beads + value.rounds * 108 > out.max) {
        out.lastUsedMantraId = mantraId;
        out.max = value.beads + value.rounds * 108;
      }
      return out;
    }, { totalBeads: 0, totalRounds: 0, max: -1, lastUsedMantraId: undefined as string | undefined }
  );
  const lastPanchang = input.panchangDays[input.panchangDays.length - 1].dateKey;
  const lastVerse = input.verseDays[input.verseDays.length - 1].dateKey;
  const mantra = input.lastUsedMantraId ?? totals.lastUsedMantraId;
  return {
    schemaVersion: WIDGET_SCHEMA_VERSION,
    generatedAt: input.generatedAt.toISOString(),
    writerAppVersion: input.writerAppVersion,
    locale: input.locale,
    panchang: { timeZone: WIDGET_TIME_ZONE, cityId: input.location.cityId, cityLabel: localizedCity(input.location), calendarSystem: input.calendarSystem, validThrough: validThroughForDateKey(lastPanchang, WIDGET_TIME_ZONE), days: input.panchangDays },
    verses: { timeZone: input.deviceTimeZone, validThrough: validThroughForDateKey(lastVerse, input.deviceTimeZone), days: input.verseDays },
    japam: {
      dateKey, timeZone: input.deviceTimeZone, totalBeads: totals.totalBeads,
      totalRounds: totals.totalRounds, japaStreak: computeJapaStreak(input.activity, dateKey),
      ...(mantra ? { lastUsedMantraId: mantra } : {}),
      deepLink: mantra ? `vedansh://widget/japam?mantraId=${encodeURIComponent(mantra)}` : 'vedansh://widget/japam',
    },
  };
}

// Viramas/halants (Devanagari, Gujarati, Kannada) and the ZW(N)J joiners form
// conjuncts with the following consonant. If a truncation boundary leaves one of
// these dangling, the incomplete cluster renders as the dotted-circle placeholder
// (◌ U+25CC) once the ellipsis follows — the exact class RULEBOOK §11.14 gates.
const DANGLING_CLUSTER_TAIL = /[्્್‌‍]+$/u;

/**
 * The verse as one flowing paragraph, padas separated by ` · `.
 *
 * This — not `twoLineExcerpt` — is what the wide widget cell renders (the Swift
 * `flowedVerse` and the Kotlin `padas.joinToString(" · ")` mirror it, the same
 * way the section eyebrows are mirrored; the large cell gives each pada its own
 * line instead) and what the gallery facsimile shows. The excerpt below is a
 * *small-cell* string; feeding it to a cell with three lines of room cut a
 * two-line shloka one pada early with the third line still empty.
 */
export function flowedVerse(lines: readonly string[]): string {
  return lines.map((line) => line.trim()).filter(Boolean).join(' · ');
}

/**
 * The small square's body: the verse trimmed to what ~4 lines at 13 pt hold.
 * Only the small cell (and a narrow Android cell) uses it — every larger cell
 * reads the full `lines`, so raising or lowering this cap never truncates a
 * verse that the wide or large card had room for.
 */
export function twoLineExcerpt(lines: readonly string[], maxCharacters = 88): string {
  const compact = flowedVerse(lines);
  if (compact.length <= maxCharacters) return compact;
  const cut = compact.slice(0, Math.max(1, maxCharacters - 1));
  const boundary = cut.lastIndexOf(' ');
  const sliced = cut.slice(0, boundary > maxCharacters / 2 ? boundary : cut.length);
  return `${sliced.replace(DANGLING_CLUSTER_TAIL, '').trimEnd()}…`;
}
