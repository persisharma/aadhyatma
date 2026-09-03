import { CommonActions } from '@react-navigation/native';
import { findJapamMantra } from '@/data/japam';
import { navigationRef } from '@/notifications/deepLink';
import type { StartTarget } from '@/navigation/startTarget';

export type WidgetDeepLinkTarget =
  | { kind: 'verse'; sourceId: string; verseIndex: number; chapter?: number }
  | { kind: 'panchang'; dateMs: number }
  | { kind: 'japam'; mantraId?: string };

export function parseWidgetDeepLink(raw: string): WidgetDeepLinkTarget | null {
  try {
    const url = new URL(raw);
    if (url.protocol !== 'vedansh:' || url.hostname !== 'widget') return null;
    if (url.pathname === '/verse') {
      const sourceId = url.searchParams.get('sourceId');
      const verseIndex = Number(url.searchParams.get('verseIndex'));
      const chapterRaw = url.searchParams.get('chapter');
      const chapter = chapterRaw == null ? undefined : Number(chapterRaw);
      if (!sourceId || !Number.isInteger(verseIndex) || verseIndex < 0 || (chapter !== undefined && (!Number.isInteger(chapter) || chapter < 1))) return null;
      return { kind: 'verse', sourceId, verseIndex, ...(chapter === undefined ? {} : { chapter }) };
    }
    if (url.pathname === '/panchang') {
      const date = url.searchParams.get('date');
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
      // Carry the represented IST civil date as an instant that `startOfLocalDay`
      // (device-local Y/M/D, PanchangScreen) recovers to the SAME calendar date
      // in every timezone. Building it from the local Date constructor at local
      // noon guarantees that round-trip; an IST-anchored instant (06:30 UTC)
      // resolves to the previous day west of ~UTC-6:30 and showed the wrong date.
      const [y, m, d] = date.split('-').map(Number);
      const dateMs = new Date(y, m - 1, d, 12, 0, 0).getTime();
      return Number.isFinite(dateMs) ? { kind: 'panchang', dateMs } : null;
    }
    if (url.pathname === '/japam') {
      const mantraId = url.searchParams.get('mantraId') ?? undefined;
      return mantraId && findJapamMantra(mantraId) ? { kind: 'japam', mantraId } : { kind: 'japam' };
    }
  } catch {}
  return null;
}

/**
 * The tab + params a parsed widget link names — the same `StartTarget` shape the
 * notification taps resolve to (`navigation/startTarget.ts`). A cold widget URL
 * becomes `TabNavigator`'s initial route through this; a warm one is dispatched
 * as the same object below, so cold and warm links cannot drift.
 */
export function widgetStartTarget(target: WidgetDeepLinkTarget): StartTarget {
  if (target.kind === 'verse') {
    return {
      name: 'DailyBhaktiTab',
      params: { sourceId: target.sourceId, verseIndex: target.verseIndex, ...(target.chapter == null ? {} : { chapter: target.chapter }) },
    };
  }
  if (target.kind === 'panchang') {
    return { name: 'PanchangTab', params: { screen: 'PanchangHome', params: { dateMs: target.dateMs }, initial: false } };
  }
  // `initial: false` so the counter/library is pushed over Home in the Home
  // stack rather than becoming its initial route (back must still reach Home).
  if (target.mantraId) {
    return { name: 'HomeTab', params: { screen: 'JapamCounter', params: { mantraId: target.mantraId }, initial: false } };
  }
  return { name: 'HomeTab', params: { screen: 'CategoryList', params: { categoryId: 'japam' }, initial: false } };
}

export function handleWidgetDeepLink(raw: string): boolean {
  const target = parseWidgetDeepLink(raw);
  if (!target || !navigationRef.isReady()) return false;
  navigationRef.dispatch(CommonActions.navigate(widgetStartTarget(target)));
  return true;
}

/** Cold starts can deliver the URL before NavigationContainer is ready. */
export function retryWidgetDeepLink(raw: string, maxAttempts = 50, delayMs = 100): () => void {
  let cancelled = false;
  let attempts = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const attempt = () => {
    if (cancelled || handleWidgetDeepLink(raw)) return;
    attempts += 1;
    if (attempts >= maxAttempts) return;
    timer = setTimeout(attempt, delayMs);
  };
  attempt();
  return () => { cancelled = true; if (timer) clearTimeout(timer); };
}
