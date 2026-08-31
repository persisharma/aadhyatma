import { useEffect, useRef, useState } from 'react';
import { AppState, InteractionManager, type AppStateStatus } from 'react-native';
import { useNotificationPreferences } from '@/contexts/NotificationPreferencesContext';
import { useGitaLanguage } from '@/data/gita/language';
import { personLabel } from '@/components/PersonChips';
import { useJanmaPrefs, useJanmaTithiPeople } from '@/panchang/useJanmaTithi';
import { tithiRuleLabel } from '@/panchang/pitruSmaran';
import { ensureOccurrences, hydrateSmaranSolves, persistSmaranSolves } from '@/panchang/pitruSmaranSolves';
import { startOfLocalDay } from '@/panchang/pitruSmaranDisplay';
import {
  cancelAllJanmaTithiReminders,
  scheduleJanmaTithiReminders,
} from '@/notifications/janmaTithiScheduler';
import type { JanmaTithiReminderInput } from '@/notifications/janmaTithiReminderPure';

/**
 * Headless जन्म तिथि reminder re-arm (PRD-29 §3.5). Only explicitly opted-in
 * people participate — the family defaults OFF, per person. Solves go through
 * the shared persisted layer (`pitruSmaranSolves`), so a re-arm on a warm
 * device touches no astronomy.
 */
export default function JanmaTithiReminderScheduler() {
  const { people, hydrated } = useJanmaTithiPeople();
  const { prefs, hydrated: prefsHydrated } = useJanmaPrefs();
  const { permissionStatus, isLoading: notifPrefsLoading } = useNotificationPreferences();
  const { lang } = useGitaLanguage();
  const [foregroundTick, setForegroundTick] = useState(0);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      const previous = appState.current;
      appState.current = next;
      if (previous !== 'active' && next === 'active') setForegroundTick((tick) => tick + 1);
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!hydrated || !prefsHydrated || notifPrefsLoading) return undefined;
    let cancelled = false;
    const optedIn = people.filter(
      ({ person, rule }) => rule !== null && prefs.reminders[person.id] === true
    );
    if (permissionStatus !== 'granted' || optedIn.length === 0) {
      cancelAllJanmaTithiReminders().catch(() => undefined);
      return () => { cancelled = true; };
    }
    const task = InteractionManager.runAfterInteractions(() => {
      if (cancelled) return;
      const now = new Date();
      const today = startOfLocalDay(now);
      void hydrateSmaranSolves(optedIn.map(({ rule }) => rule!), today).then(() => {
        if (cancelled) return;
        const inputs: JanmaTithiReminderInput[] = optedIn.map(({ person, rule }) => {
          let nextDate: Date | null = null;
          try {
            nextDate = ensureOccurrences(rule!, today, 1)[0] ?? null;
          } catch {
            nextDate = null; // an unsolvable rule schedules nothing, never crashes
          }
          return {
            personId: person.id,
            displayNameHi: personLabel(person),
            displayNameEn: personLabel(person),
            tithiHi: tithiRuleLabel(rule!, 'hi'),
            tithiEn: tithiRuleLabel(rule!, 'en'),
            nextDate,
          };
        });
        void persistSmaranSolves();
        if (!cancelled) scheduleJanmaTithiReminders(inputs, now, lang).catch(() => undefined);
      });
    });
    return () => { cancelled = true; task.cancel(); };
  }, [people, hydrated, prefs, prefsHydrated, notifPrefsLoading, permissionStatus, lang, foregroundTick]);

  return null;
}
