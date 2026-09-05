/**
 * The Home Today card's राशिफल row (design.md §48): the active person's Moon
 * sign + the day's theme, or a guest state pointing at the Rashifal picker.
 *
 * Launch discipline. Home is the screen every cold start lands on, so this hook
 * follows the three panchang-cache rules the strip's other answers follow:
 *   1. read the roster from its in-memory store (`birthProfileStore`) — one
 *      shared snapshot every Jyotish surface already subscribes to;
 *   2. hydrate from disk immediately (I/O the JS thread does not perform);
 *   3. defer the only CPU — a Kundali chart + the Rashifal transits — behind
 *      `InteractionManager`, and reach it through a dynamic `import()` so the
 *      chart engine never joins the static launch graph (`launchGraph.test.ts`).
 * A guest roster costs nothing: no import, no solve.
 */
import { useEffect, useState, useSyncExternalStore } from 'react';
import { InteractionManager } from 'react-native';
import { activePerson } from './birthProfiles';
import { getRosterSnapshot, loadRoster, subscribeRoster } from './birthProfileStore';
import type { HomeRashifal } from './homeRashifal';

export type HomeRashifalState = {
  /** False until the roster read lands — render a quiet placeholder. */
  hydrated: boolean;
  /** Null for a guest (no saved person), while composing, or on a solve error. */
  value: HomeRashifal | null;
};

export function useHomeRashifal(date: Date): HomeRashifalState {
  const roster = useSyncExternalStore(subscribeRoster, getRosterSnapshot);
  const person = activePerson(roster.roster);
  const dateKey = date.toDateString();
  // Re-solve only when the answer can change: another person, edited birth
  // details, a new civil day.
  const solveKey = person
    ? `${person.id}|${person.date}|${person.time}|${person.cityId}|${roster.roster.people.length}|${dateKey}`
    : null;
  const [value, setValue] = useState<HomeRashifal | null>(null);

  useEffect(() => {
    if (!roster.hydrated) void loadRoster();
  }, [roster.hydrated]);

  useEffect(() => {
    if (!solveKey) {
      setValue(null);
      return;
    }
    let cancelled = false;
    let handle: ReturnType<typeof setTimeout> | undefined;
    const interaction = InteractionManager.runAfterInteractions(() => {
      handle = setTimeout(() => {
        if (cancelled) return;
        import('./homeRashifal')
          .then((m) => {
            if (cancelled) return;
            setValue(m.composeHomeRashifal(roster.roster, date));
          })
          .catch(() => {
            if (!cancelled) setValue(null);
          });
      }, 0);
    });
    return () => {
      cancelled = true;
      interaction.cancel();
      if (handle !== undefined) clearTimeout(handle);
    };
    // `solveKey` captures every input that can change the answer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solveKey]);

  return { hydrated: roster.hydrated, value: solveKey ? value : null };
}
