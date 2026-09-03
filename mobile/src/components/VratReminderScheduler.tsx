import { useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useVratFollows } from '@/contexts/VratFollowContext';
import { useNotificationPreferences } from '@/contexts/NotificationPreferencesContext';
import { usePanchangCalendarSystem } from '@/panchang/usePanchang';
import { getNextOccurrence, getRuleById } from '@/panchang/vratCatalog';
import { scheduleVratReminders, cancelAllVratReminders } from '@/notifications/vratScheduler';
import type { VratReminderInput } from '@/notifications/vratReminderPure';
import { visarjanReminderInputs } from '@/panchang/arcs';
import { useArcChoices } from '@/panchang/useArcChoices';

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Headless: keeps vrat reminders (PRD-09 P3) armed. Re-arms whenever follows or
 * their reminder prefs change, the OS permission changes, or the app returns to
 * the foreground (so "next occurrence" and the rolling window advance with the
 * calendar). Mirrors the daily-verse reconcile loop. Renders nothing.
 *
 * Permission is shared with the daily-verse scheduler — we only schedule when it
 * is already granted, and never prompt from here.
 *
 * PRD-28: a family's chosen visarjan (`arcChoiceStore`) rides this same
 * family as extra inputs — the solved date gets the evening-before and 07:00
 * day-of notices vrat followers already know. No choice ⇒ no input.
 */
export default function VratReminderScheduler() {
  const { follows, reminderDefault, isLoading } = useVratFollows();
  const { permissionStatus } = useNotificationPreferences();
  const [calendarSystem] = usePanchangCalendarSystem();
  const { choices: arcChoices, hydrated: arcHydrated } = useArcChoices();
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

  useEffect(() => {
    if (isLoading || !arcHydrated) return undefined;
    let cancelled = false;
    (async () => {
      if (permissionStatus !== 'granted') {
        await cancelAllVratReminders().catch(() => undefined);
        return;
      }
      const now = new Date();
      const today = startOfLocalDay(now);
      const inputs: VratReminderInput[] = [];
      for (const f of follows) {
        const rule = getRuleById(f.ruleId);
        if (!rule) continue;
        const next = getNextOccurrence(rule.id, today, calendarSystem);
        const pref = f.reminder ?? reminderDefault;
        inputs.push({
          ruleId: rule.id,
          order: f.order,
          nameHi: rule.nameHi,
          nameEn: rule.nameEn,
          nextDate: next?.date ?? null,
          pref: {
            advanceDays: pref.advanceDays,
            dayOf: pref.dayOf,
            dayOfTime: pref.dayOfTime ?? reminderDefault.dayOfTime ?? { hour: 7, minute: 0 },
          },
        });
      }
      inputs.push(...visarjanReminderInputs(arcChoices, today, calendarSystem));
      if (cancelled) return;
      await scheduleVratReminders(inputs, now).catch(() => undefined);
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoading, follows, reminderDefault, permissionStatus, calendarSystem, foregroundTick, arcChoices, arcHydrated]);

  return null;
}
