import { widgetDateKey, WIDGET_TIME_ZONE, type PanchangWidgetDay, type WidgetPayloadV1 } from './contract';

export type WidgetAppearance = 'day' | 'night';

// Mirrored by the native readers. Legacy payloads deliberately retain Heritage
// until the app has written solved solar instants; never parse localized clocks.
export function widgetAppearance(payload: WidgetPayloadV1, at: Date): WidgetAppearance {
  const key = widgetDateKey(at, WIDGET_TIME_ZONE);
  const day = payload.panchang.days.find((item) => item.dateKey === key);
  return appearanceForDay(day, at.getTime());
}

export function appearanceForDay(day: PanchangWidgetDay | undefined, nowMs: number): WidgetAppearance {
  if (!day?.sunriseAt || !day.sunsetAt) return 'day';
  const rise = Date.parse(day.sunriseAt); const set = Date.parse(day.sunsetAt);
  if (!Number.isFinite(rise) || !Number.isFinite(set) || rise >= set) return 'day';
  return nowMs >= rise && nowMs < set ? 'day' : 'night';
}

export const WIDGET_APPEARANCE_TOKENS = {
  day: { background: '#F8EFD6', ink: '#511B19', inkMuted: '#4A3420', accent: '#6B2E05', gold: '#7E5A1E', border: '#B79755' },
  night: { background: '#091A32', ink: '#FFF4DC', inkMuted: '#E8D6B4', accent: '#EBC784', gold: '#D9B66E', border: '#8B743F' },
} as const;
