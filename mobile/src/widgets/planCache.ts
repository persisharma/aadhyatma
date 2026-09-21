import AsyncStorage from '@react-native-async-storage/async-storage';
import appConfig from '../../app.json';
import { currentBuildFingerprint } from '@/utils/buildFingerprint';
import { awaitDerivedCacheReset } from '@/utils/derivedCacheReset';
import { getObservancesForDateKey } from '@/panchang/festivalEngine';
import { PANCHANG_DAY_CACHE_VERSION } from '@/panchang/panchangDaySerde';
import { buildWidgetPayload, shiftDateKey } from './planner';
import { decodeWidgetPayload, widgetDateKey, WIDGET_TIME_ZONE, type WidgetPayloadV1 } from './contract';
import type { WidgetPlanInput } from './planPayload';

export const WIDGET_PLAN_CACHE_KEY = '@vedansh:widget-plan:v1';
const DAYS = 14;

/** Loaded dynamically by the coordinator. Cache only the dated, public window;
 * current language, city labels and private Japam totals are composed on every
 * call. IST widget days must never enter the device-local Panchang day store.
 */
export async function cachedWidgetPlan(
  input: WidgetPlanInput,
  compute: (input: WidgetPlanInput, isCancelled: () => boolean) => Promise<WidgetPayloadV1>,
  isCancelled: () => boolean = () => false
): Promise<WidgetPayloadV1> {
  const check = () => { if (isCancelled()) throw new Error('Widget plan cancelled'); };
  check();
  const pStart = widgetDateKey(input.generatedAt, WIDGET_TIME_ZONE);
  const vStart = widgetDateKey(input.generatedAt, input.deviceTimeZone);
  // A city scan can replace the Ujjain fallback during the same day/build.
  // Include the actual displayed observance, so that upgrade cannot be cached
  // away. These are table/store reads for the shipped precomputed years.
  const observances = Array.from({ length: DAYS }, (_, offset) => {
    const rule = getObservancesForDateKey(shiftDateKey(pStart, offset), input.calendarSystem, input.location)[0]?.rule;
    return rule ? [rule.id, rule.nameHi, rule.nameEn] : null;
  });
  const { cityId, latitude, longitude, elevation } = input.location;
  const key = JSON.stringify([
    currentBuildFingerprint(), PANCHANG_DAY_CACHE_VERSION, pStart, vStart,
    cityId, latitude, longitude, elevation, input.calendarSystem, input.deviceTimeZone, observances,
  ]);
  await awaitDerivedCacheReset();
  check();
  let window: WidgetPayloadV1 | undefined;
  try {
    const raw = await AsyncStorage.getItem(WIDGET_PLAN_CACHE_KEY);
    const record = raw ? JSON.parse(raw) : null;
    if (record?.key === key) {
      const decoded = decodeWidgetPayload(record.payload, input.generatedAt.getTime());
      if (decoded.kind === 'ready' &&
          decoded.payload.panchang.days.length === DAYS && decoded.payload.verses.days.length === DAYS &&
          decoded.payload.panchang.days.every((day, i) => day.dateKey === shiftDateKey(pStart, i)) &&
          decoded.payload.verses.days.every((day, i) => day.dateKey === shiftDateKey(vStart, i))) {
        window = decoded.payload;
      }
    }
  } catch { /* A missing/corrupt/unreadable cache is a cold plan, never a failed widget. */ }
  check();
  if (!window) {
    // No personal practice history goes into this derived calendar cache.
    window = await compute({ ...input, activity: {}, lastUsedMantraId: undefined }, isCancelled);
    check();
    await AsyncStorage.setItem(WIDGET_PLAN_CACHE_KEY, JSON.stringify({ key, payload: window })).catch(() => undefined);
  }
  check();
  return buildWidgetPayload({
    ...input, writerAppVersion: appConfig.expo.version,
    panchangDays: window.panchang.days, verseDays: window.verses.days,
  });
}
