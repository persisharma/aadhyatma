import { useEffect, useState } from 'react';
import { InteractionManager } from 'react-native';
import { usePitruSmaran } from '@/contexts/PitruSmaranContext';
import { entryMatchesDate, type SmaranEntry } from './pitruSmaran';

/**
 * The saved पितृ स्मरण entries whose observance falls on `date` — drives the muted
 * "॥ स्मरण" chip on the Panchang day panel (PRD-17 §3.5). Matching needs a couple
 * of memoised tithi solves, so it runs off the render path (the same
 * interaction-aware deferral as `useObservancesForDate`); empty until resolved,
 * and always empty when no entries exist — zero cost for the common case.
 */
export function usePitruSmaranForDate(date: Date): SmaranEntry[] {
  const { entries } = usePitruSmaran();
  const dateMs = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const [matches, setMatches] = useState<SmaranEntry[]>([]);

  useEffect(() => {
    if (entries.length === 0) {
      setMatches([]);
      return undefined;
    }
    let cancelled = false;
    setMatches([]);
    let handle: ReturnType<typeof setTimeout> | undefined;
    const interaction = InteractionManager.runAfterInteractions(() => {
      handle = setTimeout(() => {
        const day = new Date(dateMs);
        const result = entries.filter((entry) => {
          try {
            return entryMatchesDate(entry, day);
          } catch {
            return false; // a failed solve must never break the day panel
          }
        });
        if (!cancelled) setMatches(result);
      }, 0);
    });
    return () => {
      cancelled = true;
      interaction.cancel();
      if (handle !== undefined) clearTimeout(handle);
    };
  }, [entries, dateMs]);

  return matches;
}
