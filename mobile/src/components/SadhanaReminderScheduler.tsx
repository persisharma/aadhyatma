import { useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useSadhana } from '@/contexts/SadhanaContext';
import { useNotificationPreferences } from '@/contexts/NotificationPreferencesContext';
import { getProgram } from '@/data/sadhana/programs';
import { scheduleSadhanaReminders, cancelAllSadhanaReminders } from '@/notifications/sadhanaScheduler';
import type { SadhanaReminderInput } from '@/notifications/sadhanaReminderPure';

/**
 * Headless: keeps sadhana reminders (PRD-11 P3) armed. Re-arms whenever the
 * active reminder set changes, the OS permission changes, or the app returns to
 * the foreground (so the rolling window advances with the calendar). Mirrors the
 * vrat/daily-verse reconcile loops. Renders nothing.
 *
 * Reminders fire at the user's shared Daily-Bhakti reminder time (no separate
 * per-program picker) and deep-link to Today's Practice. Permission is shared
 * with the other schedulers — we only schedule when it is already granted, and
 * never prompt from here.
 */
export default function SadhanaReminderScheduler() {
  const { activeEnrollments, reminderProgramIds, isLoading } = useSadhana();
  const { prefs, permissionStatus } = useNotificationPreferences();
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
    if (isLoading) return undefined;
    let cancelled = false;
    (async () => {
      if (permissionStatus !== 'granted') {
        await cancelAllSadhanaReminders().catch(() => undefined);
        return;
      }
      const time = prefs.times[0] ?? { hour: 7, minute: 0 };
      const inputs: SadhanaReminderInput[] = [];
      let order = 0;
      for (const e of activeEnrollments) {
        if (e.status !== 'active') continue; // don't remind for a completed vow
        if (!reminderProgramIds.includes(e.programId)) continue;
        const program = getProgram(e.programId);
        if (!program) continue;
        inputs.push({
          programId: program.id,
          order: order++,
          titleHi: program.titleHi,
          titleEn: program.titleEn,
          time: { hour: time.hour, minute: time.minute },
        });
      }
      if (cancelled) return;
      await scheduleSadhanaReminders(inputs).catch(() => undefined);
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoading, activeEnrollments, reminderProgramIds, prefs, permissionStatus, foregroundTick]);

  return null;
}
