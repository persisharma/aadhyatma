import type { PanchangStackParamList } from './types';

/** Keep the chosen civil day when crossing from Panchang to the Vrat tab. */
export function vratOccasionTarget(date: Date): { screen: 'PanchangHome'; params: NonNullable<PanchangStackParamList['PanchangHome']> } {
  return { screen: 'PanchangHome', params: { initialTab: 'catalog', dateMs: date.getTime() } };
}

/** A dated catalog entry must not be forced back into calendar mode. */
export function panchangDatedEntry(params: PanchangStackParamList['PanchangHome']) {
  if (params?.dateMs == null || !Number.isFinite(params.dateMs)) return null;
  const raw = new Date(params.dateMs);
  if (!Number.isFinite(raw.getTime())) return null;
  return { date: new Date(raw.getFullYear(), raw.getMonth(), raw.getDate()), mode: params.initialTab ?? 'calendar' };
}
