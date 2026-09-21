import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { runInBackground } from './backgroundWork';
import type { PersonProfile } from './birthProfiles';
import type { SmaranEntry } from './pitruSmaran';
import { hydrateSmaranSolves, ensureOccurrencesAsync, persistSmaranSolves, smaranRuleKey, type SmaranRule } from './pitruSmaranSolves';
import { janmaTithiRuleFromBirthDateSteps } from './janmaTithi';

type Summary = { smaranSoonest: Date | null; janmaSoonest: Date | null };
const EMPTY: Summary = { smaranSoonest: null, janmaSoonest: null };

/** Optional More row subtitles must never hold up the hub or its first press.
 * Read disk before solving; cold work shares Home's cooperative queue. A blur,
 * unmount or roster edit cancels the generation, including in-progress scans.
 */
export function useMoreFamilySummary(entries: readonly SmaranEntry[], people: readonly PersonProfile[]): Summary {
  const [summary, setSummary] = useState<Summary>(EMPTY);

  useFocusEffect(useCallback(() => {
    let cancelled = false;
    const isCancelled = () => cancelled;
    const today = new Date();
    setSummary(EMPTY);
    if (entries.length === 0 && people.length === 0) return undefined;

    void (async () => {
      if (cancelled) return;

      const soonest = async (rules: SmaranRule[]): Promise<Date | null> => {
        const unique = [...new Map(rules.map((rule) => [smaranRuleKey(rule), rule])).values()];
        if (cancelled || unique.length === 0) return null;
        await hydrateSmaranSolves(unique, today);
        let next: Date | null = null;
        for (const rule of unique) {
          if (cancelled) return null;
          const [date] = await ensureOccurrencesAsync(rule, today, 1, isCancelled);
          if (date && (!next || date < next)) next = date;
        }
        return next;
      };

      const smaranSoonest = await soonest(entries.map((entry) => entry.tithiRule));
      if (cancelled) return;
      setSummary({ smaranSoonest, janmaSoonest: null });
      void persistSmaranSolves();

      if (people.length === 0) return;
      const rules: SmaranRule[] = [];
      for (const date of new Set(people.map((person) => person.date))) {
        if (cancelled) return;
        const rule = await runInBackground(janmaTithiRuleFromBirthDateSteps(date), isCancelled);
        if (rule) rules.push(rule);
      }
      const janmaSoonest = await soonest(rules);
      if (cancelled) return;
      setSummary({ smaranSoonest, janmaSoonest });
      void persistSmaranSolves();
    })().catch(() => {
      // Optional subtitles may fail; the hub keeps its counts and navigation.
    });

    return () => { cancelled = true; };
  }, [entries, people]));

  return summary;
}
