import { useEffect, useRef, useState } from 'react';
import { AppState, InteractionManager, type AppStateStatus } from 'react-native';
import { useNotificationPreferences } from '@/contexts/NotificationPreferencesContext';
import { useGitaLanguage } from '@/data/gita/language';
import { usePanchangCalendarSystem } from '@/panchang/usePanchang';
import { getNextOccurrences, getRuleById } from '@/panchang/vratCatalog';
import {
  scheduleFestiveReminders,
  cancelAllFestiveReminders,
} from '@/notifications/festiveScheduler';
import { FESTIVE_REMINDERS } from '@/notifications/festiveReminders';
import type { FestiveReminderInput } from '@/notifications/festiveReminderPure';
import {
  ensurePakshaWindow,
  hydrateSmaranSolves,
  persistSmaranSolves,
} from '@/panchang/pitruSmaranSolves';
import {
  cancelAllPitruPakshaReminders,
  schedulePitruPakshaReminders,
} from '@/notifications/pitruPakshaScheduler';

/** Occurrences resolved per rule. Annual festivals need one; the second covers an
 *  adhik-month year that can place the same rule twice inside the window. */
const OCCURRENCES_PER_RULE = 2;

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Headless: keeps the default-on festive reminders armed. Re-arms when the pref or
 * OS permission changes, when the reading language changes (copy is baked at
 * schedule time, up to four months ahead), when the calendar system changes (it
 * moves a krishna-paksha festival's date), and on every app foreground so the
 * rolling window advances with the calendar. Mirrors `<VratReminderScheduler>`.
 * Renders nothing.
 *
 * Permission is shared with the daily-verse scheduler — we only schedule when it
 * is already granted, and never prompt from here.
 *
 * Festival dates are resolved WITHOUT a location, exactly as vrat reminders are:
 * `resolveObservancesForYear`'s locationless path is the bundled precomputed table,
 * which is cheap and available offline, and a festival's civil date shifts by at
 * most a day across Indian cities. Reading it still runs behind
 * `InteractionManager` so a cold start's first frames are never charged for it.
 *
 * The two Pitru Paksha windows (this year, next) go through the persisted
 * `pitruSmaranSolves` layer, never the raw engine. A window is a Bhadrapada-Purnima
 * scan plus an amavasya walk — ~75 ms on a desktop JIT, several hundred on Hermes,
 * unyielded — and this scheduler runs on EVERY launch. The engine's own memo is
 * per-process, so calling `pitruPakshaWindow` here re-solved NEXT year's window on
 * every cold start (the Today strip primes only the current year's), inside the
 * deferred batch that also holds Home's taps. Hydrate from disk first (I/O), solve
 * only what disk lacks, persist what was solved: once per install, not per launch.
 */
export default function FestiveReminderScheduler() {
  const { prefs, permissionStatus, isLoading } = useNotificationPreferences();
  const { lang } = useGitaLanguage();
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

  useEffect(() => {
    if (isLoading) return undefined;

    let cancelled = false;

    if (!prefs.festiveRemindersEnabled || permissionStatus !== 'granted') {
      cancelAllFestiveReminders().catch(() => undefined);
      cancelAllPitruPakshaReminders().catch(() => undefined);
      return () => {
        cancelled = true;
      };
    }

    const task = InteractionManager.runAfterInteractions(async () => {
      if (cancelled) return;
      const now = new Date();
      const today = startOfLocalDay(now);

      const inputs: FestiveReminderInput[] = [];
      for (const entry of FESTIVE_REMINDERS) {
        // A catalog id that has left `festivals.ts` is skipped rather than
        // crashing the whole re-arm; the integrity test is what keeps this
        // branch unreachable in a shipped build.
        const rule = getRuleById(entry.ruleId);
        if (!rule) continue;
        const occurrences = getNextOccurrences(
          entry.ruleId,
          today,
          OCCURRENCES_PER_RULE,
          calendarSystem
        ).map((o) => o.date);
        if (occurrences.length === 0) continue;
        inputs.push({
          ruleId: rule.id,
          nameHi: rule.nameHi,
          nameEn: rule.nameEn,
          occurrences,
          entry,
        });
      }

      if (cancelled) return;
      scheduleFestiveReminders(inputs, now, lang).catch(() => undefined);

      // Disk before astronomy: the window years this reads are exactly the two
      // `hydrateSmaranSolves` fetches for any caller. Free when already in memory.
      await hydrateSmaranSolves([], today);
      if (cancelled) return;
      const windows = [today.getFullYear(), today.getFullYear() + 1]
        .map((year) => ({ year, window: ensurePakshaWindow(year) }))
        .filter((item): item is { year: number; window: NonNullable<typeof item.window> } => item.window !== null);
      void persistSmaranSolves();
      schedulePitruPakshaReminders(windows, now, lang).catch(() => undefined);
    });

    return () => {
      cancelled = true;
      task.cancel();
    };
  }, [
    isLoading,
    prefs.festiveRemindersEnabled,
    permissionStatus,
    lang,
    calendarSystem,
    foregroundTick,
  ]);

  return null;
}
