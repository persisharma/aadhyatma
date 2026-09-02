import { useEffect, useRef, useState } from 'react';
import { AppState, InteractionManager, type AppStateStatus } from 'react-native';
import {
  useMuhuratFollows,
  dateFromFollowKey,
  DEFAULT_MUHURAT_REMINDER,
} from '@/contexts/MuhuratFollowContext';
import { useNotificationPreferences } from '@/contexts/NotificationPreferencesContext';
import { usePanchangLocation } from '@/contexts/PanchangLocationContext';
import { usePanchangCalendarSystem } from '@/panchang/usePanchang';
import { getEventRule } from '@/panchang/eventMuhurat';
import { verdictForDate } from '@/panchang/muhuratFinderScan';
import { hydratePanchangDays } from '@/panchang/panchangDayCache';
import { dateKeyFor } from '@/panchang/panchangDayStore';
import { scheduleMuhuratReminders, cancelAllMuhuratReminders } from '@/notifications/muhuratScheduler';
import type { MuhuratReminderInput } from '@/notifications/muhuratReminderPure';

/**
 * Headless: keeps muhurat reminders (PRD-16 §6.7) armed. Renders nothing.
 *
 * The trigger set is wider than the vrat scheduler's, and that is the point.
 * Every muhurat window is sunrise-derived, so it re-arms on **location** and
 * **calendar-system** change as well as on follows/permission/foreground —
 * the same two inputs that scope `panchangDayStore`. A follow stores only
 * (occasion, civil date); the window is re-derived here on every pass, so a
 * user who changes city gets correct times rather than a stale stored one.
 *
 * Permission is shared with the other families — we only schedule when it is
 * already granted, and never prompt from here.
 */
export default function MuhuratReminderScheduler() {
  const { follows, isLoading, pruneExpired } = useMuhuratFollows();
  const { permissionStatus } = useNotificationPreferences();
  const { location } = usePanchangLocation();
  const [calendarSystem] = usePanchangCalendarSystem();
  const [foregroundTick, setForegroundTick] = useState(0);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      const prev = appStateRef.current;
      appStateRef.current = next;
      if (prev !== 'active' && next === 'active') setForegroundTick((t) => t + 1);
    });
    return () => sub.remove();
  }, []);

  // Day rollover: a returning user's past follows are dropped before we plan,
  // so the store can never accumulate dead one-shots across sessions.
  useEffect(() => {
    if (!isLoading) pruneExpired();
  }, [isLoading, foregroundTick, pruneExpired]);

  useEffect(() => {
    if (isLoading) return undefined;
    let cancelled = false;
    // Behind InteractionManager: re-arming solves up to `cap` days of panchang
    // on a cold start, and that must never compete with Home's first frame.
    const task = InteractionManager.runAfterInteractions(async () => {
      if (permissionStatus !== 'granted') {
        await cancelAllMuhuratReminders().catch(() => undefined);
        return;
      }
      const now = new Date();
      const todayKey = dateKeyFor(now);
      const upcoming = follows.filter((f) => f.dateKey >= todayKey);
      if (upcoming.length === 0) {
        await cancelAllMuhuratReminders().catch(() => undefined);
        return;
      }

      // Disk → memory first: a followed day is usually one the finder's sweep
      // already solved, so this is a hydrate rather than fresh astronomy. Each
      // day needs its own key plus the next day's (nextSunrise).
      const keys = new Set<string>();
      for (const f of upcoming) {
        const d = dateFromFollowKey(f.dateKey);
        keys.add(dateKeyFor(d));
        keys.add(dateKeyFor(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)));
      }
      await hydratePanchangDays(location, calendarSystem, [...keys]).catch(() => undefined);
      if (cancelled) return;

      const opts = { calendarSystem, location };
      const inputs: MuhuratReminderInput[] = [];
      for (const f of upcoming) {
        let rule;
        try {
          rule = getEventRule(f.occasionId);
        } catch {
          continue; // occasion retired from EVENT_RULES — drop it silently
        }
        const date = dateFromFollowKey(f.dateKey);
        // verdictForDate returns null rather than throwing, so one bad solve
        // cannot take down the whole re-arm.
        const solved = verdictForDate(rule, date, opts);
        const pref = f.reminder ?? DEFAULT_MUHURAT_REMINDER;
        const best = solved?.verdict.windows[0] ?? null;
        inputs.push({
          occasionId: rule.id,
          dateKey: f.dateKey,
          date,
          nameHi: rule.nameHi,
          nameEn: rule.nameEn,
          windowStart: best?.start ?? null,
          windowEnd: best?.end ?? null,
          windowNameHi: best?.nameHi ?? null,
          windowNameEn: best?.nameEn ?? null,
          // An unsolvable day is treated as excluded: no window, no notice.
          tier: solved?.verdict.tier ?? 'excluded',
          pref: {
            advanceDays: pref.advanceDays,
            dayOf: pref.dayOf,
            dayOfTime: pref.dayOfTime ?? DEFAULT_MUHURAT_REMINDER.dayOfTime ?? { hour: 7, minute: 0 },
            dayOfAtWindow: pref.dayOfAtWindow ?? false,
          },
        });
      }
      if (cancelled) return;
      await scheduleMuhuratReminders(inputs, now).catch(() => undefined);
    });
    return () => {
      cancelled = true;
      task.cancel();
    };
  }, [isLoading, follows, permissionStatus, location, calendarSystem, foregroundTick]);

  return null;
}
