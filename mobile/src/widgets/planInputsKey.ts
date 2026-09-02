import { WIDGET_SCHEMA_VERSION, WIDGET_TIME_ZONE, widgetDateKey } from './contract';
import type { WidgetPlannerInput } from './planner';

/**
 * Everything `planWidgetPayload` reads, folded into one short string.
 *
 * WHY. The planner is deterministic, but it is not cheap: 14 IST days × two zoned
 * `computePanchangForDate` solves plus four-language transliteration of fourteen
 * verses — a few hundred ms on a desktop JIT, seconds of JS thread on Hermes. The
 * coordinator used to run it on EVERY cold launch and only then compare the
 * finished payload against the last one written; the comparison saved the native
 * write, never the CPU. Fingerprinting the INPUTS lets the coordinator skip the
 * plan itself when nothing that feeds it has moved since the last successful write —
 * which is every launch after the first one of the day.
 *
 * What is in it, and why each part is enough:
 *   - the schema version and the BUILD fingerprint (`buildFingerprint.ts`: OTA id +
 *     store version + build number). `stableWidgetPayloadKey` fingerprints payload
 *     CONTENT so an OTA engine fix rewrites the widget; the inputs key cannot see
 *     content, so it carries the build identity instead — a new bundle always
 *     re-plans once;
 *   - the locale, location (city id, coordinates and the label the payload prints),
 *     calendar system and device time zone — the payload's scope;
 *   - the two civil dates the 14-day windows start on (IST for panchang, device
 *     zone for verses) — a midnight in either zone re-plans;
 *   - the Japam inputs: the whole activity ledger (streak is a walk over past days)
 *     and the last-used mantra. The ledger is hashed, not stored.
 *
 * `generatedAt` is deliberately NOT part of it — it is provenance stamped on the
 * payload, and folding an instant in would make every launch a miss.
 *
 * RN-free so the widget suite can pin it under `tsx --test`.
 */
export type WidgetPlanInputs = Omit<WidgetPlannerInput, 'panchangDays' | 'verseDays' | 'writerAppVersion'> & {
  buildFingerprint: string;
};

/** djb2 over the string — a compact, stable digest; never parsed back. */
function digest(value: string): string {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) hash = ((hash << 5) + hash + value.charCodeAt(i)) >>> 0;
  return hash.toString(36);
}

export function widgetPlanInputsKey(input: WidgetPlanInputs): string {
  const { location } = input;
  return [
    `s${WIDGET_SCHEMA_VERSION}`,
    input.buildFingerprint,
    input.locale,
    location.cityId ?? '',
    location.latitude,
    location.longitude,
    location.labelHi,
    location.labelEn,
    input.calendarSystem,
    input.deviceTimeZone,
    widgetDateKey(input.generatedAt, WIDGET_TIME_ZONE),
    widgetDateKey(input.generatedAt, input.deviceTimeZone),
    digest(JSON.stringify(input.activity)),
    input.lastUsedMantraId ?? '',
  ].join('|');
}
