import type { Lang } from '@/data/gita/language';
import type { CalendarSystem } from '@/panchang/types';

export const WIDGET_SCHEMA_VERSION = 1 as const;
export const WIDGET_TIME_ZONE = 'Asia/Kolkata' as const;
export const WIDGET_PAYLOAD_KEY = 'vedansh_widget_payload_v1';

export type WidgetLocalizedText = Record<Lang, string>;

export type VerseWidgetDay = {
  dateKey: string;
  sourceId: string;
  chapter?: number;
  verseIndex: number;
  lines: Record<Lang, string[]>;
  excerpt: Record<Lang, string>;
  source: Record<Lang, string>;
  accessibilityLabel: Record<Lang, string>;
  deepLink: string;
};

export type PanchangWidgetDay = {
  dateKey: string;
  representedDate: WidgetLocalizedText;
  tithi: WidgetLocalizedText;
  vrat?: WidgetLocalizedText;
  sunrise: WidgetLocalizedText;
  rahuKaal: WidgetLocalizedText;
  abhijit?: WidgetLocalizedText;
  deepLink: string;
};

export type WidgetPayloadV1 = {
  schemaVersion: typeof WIDGET_SCHEMA_VERSION;
  generatedAt: string;
  writerAppVersion: string;
  locale: Lang;
  panchang: {
    timeZone: typeof WIDGET_TIME_ZONE;
    cityId: string;
    cityLabel: WidgetLocalizedText;
    calendarSystem: CalendarSystem;
    validThrough: string;
    days: PanchangWidgetDay[];
  };
  verses: {
    /** Device IANA zone: the devotional verse rolls over with the user. */
    timeZone: string;
    validThrough: string;
    days: VerseWidgetDay[];
  };
  japam: {
    dateKey: string;
    /** Device IANA zone, matching UserActivity's device-local date keys. */
    timeZone: string;
    totalBeads: number;
    totalRounds: number;
    japaStreak: number;
    lastUsedMantraId?: string;
    deepLink: string;
  };
};

export type WidgetPayloadState =
  | { kind: 'ready'; payload: WidgetPayloadV1 }
  | { kind: 'missing' | 'corrupt' | 'incompatible' | 'expired' };

const LANGS: Lang[] = ['hi', 'en', 'gu', 'kn'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isLocalized(value: unknown): value is WidgetLocalizedText {
  return isRecord(value) && LANGS.every((lang) => typeof value[lang] === 'string');
}

function isIso(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) && Number.isFinite(Date.parse(value));
}

function isDateKey(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function exactWidgetLink(raw: unknown, path: string, expectedQuery: Record<string, string>): boolean {
  if (typeof raw !== 'string') return false;
  try {
    const url = new URL(raw);
    if (url.protocol !== 'vedansh:' || url.hostname !== 'widget' || url.pathname !== path || url.hash) return false;
    const entries = Array.from(url.searchParams.entries());
    return entries.length === Object.keys(expectedQuery).length &&
      entries.every(([key, value]) => expectedQuery[key] === value) &&
      new Set(entries.map(([key]) => key)).size === entries.length;
  } catch { return false; }
}

export function isValidIanaTimeZone(value: unknown): value is string {
  if (typeof value !== 'string' || !value.includes('/')) return value === 'UTC';
  try { new Intl.DateTimeFormat('en', { timeZone: value }).format(0); return true; } catch { return false; }
}

export function widgetDateKey(date: Date, timeZone: string): string {
  if (!isValidIanaTimeZone(timeZone)) throw new Error(`Invalid widget IANA time zone: ${timeZone}`);
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

function isVerseDay(value: unknown): value is VerseWidgetDay {
  if (!isRecord(value) || !isDateKey(value.dateKey) || typeof value.sourceId !== 'string' || value.sourceId.length === 0) return false;
  if (!Number.isInteger(value.verseIndex) || (value.verseIndex as number) < 0 ||
      (value.chapter !== undefined && (!Number.isInteger(value.chapter) || (value.chapter as number) < 1)) || !isRecord(value.lines)) return false;
  const lines = value.lines;
  if (!LANGS.every((lang) => Array.isArray(lines[lang]) && (lines[lang] as unknown[]).length > 0 && (lines[lang] as unknown[]).every((line) => typeof line === 'string' && line.length > 0))) return false;
  const expectedQuery = { sourceId: value.sourceId, verseIndex: String(value.verseIndex), ...(value.chapter === undefined ? {} : { chapter: String(value.chapter) }) };
  return isLocalized(value.excerpt) && isLocalized(value.source) && isLocalized(value.accessibilityLabel) &&
    exactWidgetLink(value.deepLink, '/verse', expectedQuery);
}

function isPanchangDay(value: unknown): value is PanchangWidgetDay {
  return isRecord(value) && isDateKey(value.dateKey) && isLocalized(value.representedDate) &&
    isLocalized(value.tithi) && (value.vrat === undefined || isLocalized(value.vrat)) &&
    isLocalized(value.sunrise) && isLocalized(value.rahuKaal) &&
    (value.abhijit === undefined || isLocalized(value.abhijit)) && typeof value.deepLink === 'string' &&
    value.deepLink === `vedansh://widget/panchang?date=${value.dateKey}`;
}

function hasUniqueDateKeys(days: { dateKey: string }[]): boolean {
  return new Set(days.map(({ dateKey }) => dateKey)).size === days.length;
}

export function decodeWidgetPayload(value: unknown, nowMs = Date.now()): WidgetPayloadState {
  if (value == null) return { kind: 'missing' };
  let decoded: unknown = value;
  if (typeof value === 'string') {
    try { decoded = JSON.parse(value); } catch { return { kind: 'corrupt' }; }
  }
  if (!isRecord(decoded)) return { kind: 'corrupt' };
  if (decoded.schemaVersion !== WIDGET_SCHEMA_VERSION) return { kind: 'incompatible' };
  if (!isIso(decoded.generatedAt) || typeof decoded.writerAppVersion !== 'string' || decoded.writerAppVersion.length === 0 || !LANGS.includes(decoded.locale as Lang)) return { kind: 'corrupt' };
  const p = decoded.panchang;
  const v = decoded.verses;
  const j = decoded.japam;
  if (!isRecord(p) || p.timeZone !== WIDGET_TIME_ZONE || typeof p.cityId !== 'string' || !isLocalized(p.cityLabel) ||
      (p.calendarSystem !== 'purnimant' && p.calendarSystem !== 'amanta') || !isIso(p.validThrough) ||
      !Array.isArray(p.days) || p.days.length === 0 || !p.days.every(isPanchangDay) || !hasUniqueDateKeys(p.days as PanchangWidgetDay[])) return { kind: 'corrupt' };
  if (!isRecord(v) || !isValidIanaTimeZone(v.timeZone) || !isIso(v.validThrough) ||
      !Array.isArray(v.days) || v.days.length === 0 || !v.days.every(isVerseDay) || !hasUniqueDateKeys(v.days as VerseWidgetDay[])) return { kind: 'corrupt' };
  if (!isRecord(j) || !isValidIanaTimeZone(j.timeZone) || !isDateKey(j.dateKey) ||
      ![j.totalBeads, j.totalRounds, j.japaStreak].every((n) => typeof n === 'number' && Number.isInteger(n) && n >= 0) ||
      (j.lastUsedMantraId !== undefined && (typeof j.lastUsedMantraId !== 'string' || j.lastUsedMantraId.length === 0)) ||
      !exactWidgetLink(j.deepLink, '/japam', j.lastUsedMantraId === undefined ? {} : { mantraId: j.lastUsedMantraId as string })) return { kind: 'corrupt' };
  // `generatedAt` is provenance, not the freshness boundary: a payload is
  // intentionally useful for its complete 14-day window while the app remains
  // unopened. Each dated slice expires at its own validThrough horizon.
  if (Date.parse(p.validThrough) < nowMs || Date.parse(v.validThrough) < nowMs) return { kind: 'expired' };
  return { kind: 'ready', payload: decoded as WidgetPayloadV1 };
}

export function stableWidgetPayloadKey(payload: WidgetPayloadV1): string {
  // Fingerprint the first represented day's CONTENT (not just its dateKey) for
  // both panchang and verse, so an OTA Panchang-engine or verse-corpus fix — same
  // city/date/calendar/version — still busts the dedup cache and rewrites the
  // payload, instead of silently serving stale computed values until the next
  // store release or calendar rollover.
  return [payload.schemaVersion, payload.writerAppVersion, payload.locale, payload.panchang.cityId, payload.panchang.calendarSystem,
    JSON.stringify(payload.panchang.days[0] ?? null), payload.verses.timeZone, JSON.stringify(payload.verses.days[0] ?? null),
    payload.japam.timeZone, payload.japam.dateKey, payload.japam.totalBeads,
    payload.japam.totalRounds, payload.japam.japaStreak, payload.japam.lastUsedMantraId ?? ''].join('|');
}
