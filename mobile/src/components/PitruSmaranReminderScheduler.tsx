import { useEffect, useRef, useState } from 'react';
import { AppState, InteractionManager, type AppStateStatus } from 'react-native';
import { usePitruSmaran } from '@/contexts/PitruSmaranContext';
import { useNotificationPreferences } from '@/contexts/NotificationPreferencesContext';
import { useGitaLanguage } from '@/data/gita/language';
import { entryDisplayName, startOfLocalDay } from '@/panchang/pitruSmaranDisplay';
import { tithiRuleLabel } from '@/panchang/pitruSmaran';
import { ensureOccurrencesAsync, hydrateSmaranSolves, persistSmaranSolves } from '@/panchang/pitruSmaranSolves';
import type { PitruSmaranReminderInput } from '@/notifications/pitruSmaranReminderPure';
import {
  cancelAllPitruSmaranReminders,
  schedulePitruSmaranReminders,
} from '@/notifications/pitruSmaranScheduler';

/** Headless private reminder re-arm. Only explicitly opted-in entries participate. */
export default function PitruSmaranReminderScheduler() {
  const { entries, isLoading: entriesLoading } = usePitruSmaran();
  const { permissionStatus, isLoading: prefsLoading } = useNotificationPreferences();
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
    if (entriesLoading || prefsLoading) return undefined;
    let cancelled = false;
    const optedIn = entries.filter((entry) => entry.reminderEnabled === true);
    if (permissionStatus !== 'granted' || optedIn.length === 0) {
      cancelAllPitruSmaranReminders().catch(() => undefined);
      return () => { cancelled = true; };
    }
    const task = InteractionManager.runAfterInteractions(() => {
      if (cancelled) return;
      const now = new Date();
      const today = startOfLocalDay(now);
      void (async () => {
        await hydrateSmaranSolves(optedIn.map(entry => entry.tithiRule), today);
        const inputs: PitruSmaranReminderInput[] = [];
        for (const entry of optedIn) {
          if (cancelled) return;
          const nextDate = (await ensureOccurrencesAsync(entry.tithiRule, today, 1, () => cancelled))[0] ?? null;
          inputs.push({
            entryId: entry.id,
            displayNameHi: entryDisplayName(entry, 'hi'),
            displayNameEn: entryDisplayName(entry, 'en'),
            tithiHi: tithiRuleLabel(entry.tithiRule, 'hi'),
            tithiEn: tithiRuleLabel(entry.tithiRule, 'en'),
            nextDate,
          });
        }
        if (cancelled) return;
        await persistSmaranSolves();
        if (!cancelled) await schedulePitruSmaranReminders(inputs, now, lang);
      })().catch(() => undefined);
    });
    return () => { cancelled = true; task.cancel(); };
  }, [entries, entriesLoading, prefsLoading, permissionStatus, lang, foregroundTick]);

  return null;
}
