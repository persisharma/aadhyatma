import { useCallback, useEffect, useState } from 'react';

import { getLensSnapshot, LENS_COUNT, subscribeLenses, type ObservanceLens } from './lenses';

/**
 * `lensStore` imports AsyncStorage, and this hook is used by screens that ARE on
 * the launch graph (More). Requiring it lazily — inside the effect and inside the
 * toggle, both of which run after mount — keeps the storage half off every cold
 * start while the hook's API stays ordinary. Same thunk pattern as `pincodes.ts`.
 */
function store(): typeof import('./lensStore') {
  return require('./lensStore') as typeof import('./lensStore');
}

/**
 * Live view of the user's क्षेत्रीय पंचांग set. Hydrates once, then follows every
 * toggle through the store's listeners, so the day view, the month grid, the
 * upcoming list and the सूची all change in the same frame the sheet is tapped.
 *
 * `hydrated` is false only before the first read lands. Callers render the
 * unlensed day meanwhile — which is the correct thing to show while we do not yet
 * know, and is what a user with no lens sees anyway.
 */
export function useLenses(): {
  lenses: Set<ObservanceLens>;
  hydrated: boolean;
  activeCount: number;
  availableCount: number;
  toggle: (lens: ObservanceLens, enabled: boolean) => void;
} {
  const [state, setState] = useState<Set<ObservanceLens> | null>(() => getLensSnapshot());

  useEffect(() => {
    let cancelled = false;
    const unsubscribe = subscribeLenses(() => {
      if (!cancelled) setState(getLensSnapshot());
    });
    if (getLensSnapshot() == null) {
      store().loadLenses().then((loaded) => {
        if (!cancelled) setState(loaded);
      });
    }
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const toggle = useCallback((lens: ObservanceLens, enabled: boolean) => {
    void store().setLensEnabled(lens, enabled);
  }, []);

  const lenses = state ?? EMPTY;
  return {
    lenses,
    hydrated: state != null,
    activeCount: lenses.size,
    availableCount: LENS_COUNT,
    toggle,
  };
}

const EMPTY: Set<ObservanceLens> = new Set();
