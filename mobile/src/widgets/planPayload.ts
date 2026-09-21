import appConfig from '../../app.json';
import { getVerseAtPoolIndex, getVersePoolSize } from '@/data/versePool';
import { verseIndexForDateKey } from '@/notifications/seed';
import { computePanchangForDateSteps, sunriseForDate } from '@/panchang/engine';
import { runInBackground } from '@/panchang/backgroundWork';
import { getObservancesForDateKey } from '@/panchang/festivalEngine';
import { computeMuhuratDay } from '@/panchang/muhurat';
import { tithiChain } from '@/panchang/prevailingTithi';
import { transliterateDevanagari } from '@/utils/transliterate';
import { buildWidgetPayload, shiftDateKey, twoLineExcerpt, type WidgetPlannerInput } from './planner';
import type { Lang } from '@/data/gita/language';
import type { PanchangData } from '@/panchang/types';
import { WIDGET_TIME_ZONE, widgetDateKey, type PanchangWidgetDay, type PanchangWidgetTithi, type VerseWidgetDay, type WidgetLocalizedText, type WidgetPayloadV1 } from './contract';

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

/**
 * "तक 3:24 PM" — the तक line the Home glance draws next to its kicker tithi,
 * precomputed per language because native draws no dates.
 *
 * The short date is appended exactly when the end lands on a LATER IST civil
 * day than the entry it belongs to (the app's `formatEndInstant` rule): a
 * bare "तक 5:22 AM" on a tithi that runs past midnight reads as this morning.
 * The day/month faces come from `Intl` per locale, the same way
 * `representedDate` builds the eyebrow, so the two dates in one card agree.
 */
function tillLabel(end: Date, dateKey: string): WidgetLocalizedText {
  const time = clockInIst(end);
  const sameDay = widgetDateKey(end, WIDGET_TIME_ZONE) === dateKey;
  const value = (locale: string) => sameDay
    ? time
    : `${time}, ${new Intl.DateTimeFormat(locale, { timeZone: WIDGET_TIME_ZONE, day: 'numeric', month: 'short' }).format(end)}`;
  return {
    hi: `तक ${value('hi-IN')}`,
    en: `till ${value('en-IN')}`,
    gu: `${transliterateDevanagari('तक', 'gu')} ${value('gu-IN')}`,
    kn: `${transliterateDevanagari('तक', 'kn')} ${value('kn-IN')}`,
  };
}

/**
 * The day's tithi chain as payload links. Truncated at the first link whose end
 * does not advance: the decoders require strictly increasing ends (a link that
 * did not advance would stall every native reader's forward scan), and a whole
 * day's Panchang failing closed over a degenerate solve is a worse trade than
 * dropping the tail nobody can order.
 */
function tithiSegments(panchang: PanchangData, dateKey: string): PanchangWidgetTithi[] {
  const segments: PanchangWidgetTithi[] = [];
  let previous = Number.NEGATIVE_INFINITY;
  for (const link of tithiChain(panchang)) {
    const name = localizedFromHindi(link.nameHi, link.nameEn);
    if (!link.endTime) { segments.push({ name }); break; }
    const ends = link.endTime.getTime();
    if (!(ends > previous)) break;
    previous = ends;
    segments.push({ name, endsAt: link.endTime.toISOString(), till: tillLabel(link.endTime, dateKey) });
  }
  return segments;
}

function sourceLabel(sourceHi: string, sourceEn: string, labelHi?: string, labelEn?: string): WidgetLocalizedText {
  return localizedFromHindi([sourceHi, labelHi].filter(Boolean).join(' · '), [sourceEn, labelEn].filter(Boolean).join(' · '));
}

export type WidgetPlanInput = Omit<WidgetPlannerInput, 'panchangDays' | 'verseDays' | 'writerAppVersion'>;

export async function planWidgetPayload(input: WidgetPlanInput, isCancelled: () => boolean = () => false): Promise<WidgetPayloadV1> {
  const poolSize = getVersePoolSize();
  const panchangDays: PanchangWidgetDay[] = [];
  const verseDays: VerseWidgetDay[] = [];
  const panchangStartKey = widgetDateKey(input.generatedAt, WIDGET_TIME_ZONE);
  const verseStartKey = widgetDateKey(input.generatedAt, input.deviceTimeZone);

  for (let offset = 0; offset < DAYS; offset += 1) {
    if (isCancelled()) throw new Error('Widget plan cancelled');
    const key = shiftDateKey(panchangStartKey, offset);
    const nextKey = shiftDateKey(panchangStartKey, offset + 1);
    const day = engineDateForCivilKey(key);
    const nextDay = engineDateForCivilKey(nextKey);
    const options = { calendarSystem: input.calendarSystem, location: input.location, civilTimeZone: WIDGET_TIME_ZONE };
    const panchang = await runInBackground(computePanchangForDateSteps(day, options), isCancelled);
    if (!panchang || isCancelled()) throw new Error('Widget plan cancelled');
    // The day solve already warmed tomorrow's sunrise for kshaya detection.
    // Computing tomorrow's entire Panchang here used to double the CPU work.
    const nextSunrise = sunriseForDate(nextDay, options);
    const muhurat = computeMuhuratDay(panchang.sunrise, panchang.sunset, nextSunrise, day.getDay());
    const observance = getObservancesForDateKey(key, input.calendarSystem, input.location)[0]?.rule;
    panchangDays.push({
      dateKey: key,
      representedDate: representedDate(key),
      tithi: localizedFromHindi(panchang.tithi.nameHi, panchang.tithi.nameEn),
      tithiSegments: tithiSegments(panchang, key),
      ...(observance ? { vrat: localizedFromHindi(observance.nameHi, observance.nameEn) } : {}),
      sunrise: localizedTiming('सूर्योदय', 'Sunrise', clockInIst(panchang.sunrise)),
      rahuKaal: localizedTiming('राहु काल', 'Rahu Kaal', compactRangeInIst(muhurat.rahu.start, muhurat.rahu.end)),
      ...(muhurat.abhijit ? { abhijit: localizedTiming('अभिजित', 'Abhijit', compactRangeInIst(muhurat.abhijit.start, muhurat.abhijit.end)) } : {}),
      deepLink: `vedansh://widget/panchang?date=${key}`,
    });

    const verseKey = shiftDateKey(verseStartKey, offset);
    const verse = getVerseAtPoolIndex(verseIndexForDateKey(verseKey, poolSize));
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
