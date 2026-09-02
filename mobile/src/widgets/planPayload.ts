import appConfig from '../../app.json';
import { getVersePool } from '@/data/versePool';
import { pickVerseForDateKey } from '@/notifications/seed';
import { computePanchangForDate } from '@/panchang/engine';
import { getObservancesForDateKey } from '@/panchang/festivalEngine';
import { computeMuhuratDay } from '@/panchang/muhurat';
import { transliterateDevanagari } from '@/utils/transliterate';
import { buildWidgetPayload, shiftDateKey, twoLineExcerpt, type WidgetPlannerInput } from './planner';
import type { Lang } from '@/data/gita/language';
import { WIDGET_TIME_ZONE, widgetDateKey, type PanchangWidgetDay, type VerseWidgetDay, type WidgetLocalizedText, type WidgetPayloadV1 } from './contract';

const DAYS = 14;

function engineDateForCivilKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  // The Panchang engine intentionally consumes a civil-date carrier through
  // local getters. Construct those exact components; never derive them from a
  // UTC instant whose local date can vary with the process time zone.
  return new Date(year, month - 1, day, 12, 0, 0);
}

function localizedFromHindi(hi: string, en: string): WidgetLocalizedText {
  return { hi, en, gu: transliterateDevanagari(hi, 'gu'), kn: transliterateDevanagari(hi, 'kn') };
}

function representedDate(key: string): WidgetLocalizedText {
  const instant = new Date(`${key}T12:00:00+05:30`);
  const format = (locale: string) => new Intl.DateTimeFormat(locale, { timeZone: WIDGET_TIME_ZONE, day: 'numeric', month: 'short' }).format(instant);
  return { hi: format('hi-IN'), en: format('en-IN'), gu: format('gu-IN'), kn: format('kn-IN') };
}

function clockInIst(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { timeZone: WIDGET_TIME_ZONE, hour: 'numeric', minute: '2-digit', hour12: true }).format(date);
}

function compactRangeInIst(start: Date, end: Date): string {
  const from = clockInIst(start); const to = clockInIst(end);
  const meridiem = (value: string) => value.match(/([AP]M)$/)?.[1];
  return meridiem(from) === meridiem(to) ? `${from.replace(/ [AP]M$/, '')} – ${to}` : `${from} – ${to}`;
}

function localizedTiming(labelHi: string, labelEn: string, value: string): WidgetLocalizedText {
  return localizedFromHindi(`${labelHi} ${value}`, `${labelEn} ${value}`);
}

function sourceLabel(sourceHi: string, sourceEn: string, labelHi?: string, labelEn?: string): WidgetLocalizedText {
  return localizedFromHindi([sourceHi, labelHi].filter(Boolean).join(' · '), [sourceEn, labelEn].filter(Boolean).join(' · '));
}

export async function planWidgetPayload(input: Omit<WidgetPlannerInput, 'panchangDays' | 'verseDays' | 'writerAppVersion'>): Promise<WidgetPayloadV1> {
  const pool = getVersePool();
  const panchangDays: PanchangWidgetDay[] = [];
  const verseDays: VerseWidgetDay[] = [];
  const panchangStartKey = widgetDateKey(input.generatedAt, WIDGET_TIME_ZONE);
  const verseStartKey = widgetDateKey(input.generatedAt, input.deviceTimeZone);

  for (let offset = 0; offset < DAYS; offset += 1) {
    const key = shiftDateKey(panchangStartKey, offset);
    const nextKey = shiftDateKey(panchangStartKey, offset + 1);
    const day = engineDateForCivilKey(key);
    const nextDay = engineDateForCivilKey(nextKey);
    const panchang = computePanchangForDate(day, { calendarSystem: input.calendarSystem, location: input.location, civilTimeZone: WIDGET_TIME_ZONE });
    const nextPanchang = computePanchangForDate(nextDay, { calendarSystem: input.calendarSystem, location: input.location, civilTimeZone: WIDGET_TIME_ZONE });
    const muhurat = computeMuhuratDay(panchang.sunrise, panchang.sunset, nextPanchang.sunrise, day.getDay());
    const observance = getObservancesForDateKey(key, input.calendarSystem, input.location)[0]?.rule;
    panchangDays.push({
      dateKey: key,
      representedDate: representedDate(key),
      tithi: localizedFromHindi(panchang.tithi.nameHi, panchang.tithi.nameEn),
      ...(observance ? { vrat: localizedFromHindi(observance.nameHi, observance.nameEn) } : {}),
      sunrise: localizedTiming('सूर्योदय', 'Sunrise', clockInIst(panchang.sunrise)),
      rahuKaal: localizedTiming('राहु काल', 'Rahu Kaal', compactRangeInIst(muhurat.rahu.start, muhurat.rahu.end)),
      ...(muhurat.abhijit ? { abhijit: localizedTiming('अभिजित', 'Abhijit', compactRangeInIst(muhurat.abhijit.start, muhurat.abhijit.end)) } : {}),
      deepLink: `vedansh://widget/panchang?date=${key}`,
    });

    const verseKey = shiftDateKey(verseStartKey, offset);
    const verse = pickVerseForDateKey(verseKey, pool);
    if (!verse) throw new Error('Daily verse pool is empty');
    const lines: Record<Lang, string[]> = {
      hi: verse.textHi,
      en: verse.textEn,
      gu: verse.textHi.map((line) => transliterateDevanagari(line, 'gu')),
      kn: verse.textHi.map((line) => transliterateDevanagari(line, 'kn')),
    };
    const source = sourceLabel(verse.sourceNameHi, verse.sourceNameEn, verse.labelHi, verse.labelEn);
    const excerpt = Object.fromEntries((['hi', 'en', 'gu', 'kn'] as Lang[]).map((lang) => [lang, twoLineExcerpt(lines[lang])])) as Record<Lang, string>;
    const accessibilityLabel = Object.fromEntries((['hi', 'en', 'gu', 'kn'] as Lang[]).map((lang) => [lang, `${lines[lang].join(' ')}. ${source[lang]}`])) as Record<Lang, string>;
    const query = new URLSearchParams({ sourceId: verse.sourceId, verseIndex: String(verse.verseIndex), ...(verse.chapter == null ? {} : { chapter: String(verse.chapter) }) });
    verseDays.push({ dateKey: verseKey, sourceId: verse.sourceId, ...(verse.chapter == null ? {} : { chapter: verse.chapter }), verseIndex: verse.verseIndex, lines, excerpt, source, accessibilityLabel, deepLink: `vedansh://widget/verse?${query.toString()}` });
    // Avoid monopolising Hermes while preparing the offline window. This is an
    // orchestration yield; the payload transformation itself remains pure.
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  }

  return buildWidgetPayload({ ...input, writerAppVersion: appConfig.expo.version, panchangDays, verseDays });
}
