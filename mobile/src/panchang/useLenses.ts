import { useCallback, useEffect, useMemo, useState } from 'react';

import { getLensSnapshot, subscribeLenses, type ObservanceLens } from './lenses';

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
 * `vratCatalog` pulls the whole observance catalog in; it decides WHICH lenses
 * this build offers (`getLensesWithContent`). Same lazy treatment, for the same
 * reason — it is only ever needed once a lens surface renders.
 */
function catalog(): typeof import('./vratCatalog') {
  return require('./vratCatalog') as typeof import('./vratCatalog');
}

/**
 * Live view of the user's क्षेत्रीय पंचांग set. Hydrates once, then follows every
 * toggle through the store's listeners, so the day view, the month grid, the
 * upcoming list and the सूची all change in the same frame the sheet is tapped.
 *
 * `lenses` is the DISPLAY set: the stored ids narrowed to calendars that add
 * something in this build (`withContentOnly`). A stored id for an empty calendar
 * (seeded before it emptied, or a build that dropped a rule) stays on disk but is
 * not shown, counted or offered — the sheet cannot list a switch that changes
 * nothing. `availableCount` is likewise the offered count, not the registry's 22.
 *
 * `hydrated` is false only before the first read lands. Callers render the
 * unlensed day meanwhile — which is the correct thing to show while we do not yet
 * know, and is what a user with no lens sees anyway.
 */
export function useLenses(): {
  lenses: Set<ObservanceLens>;
  hydrated: boolean;
  activeCount: number;
  /** Calendars this build offers (adds ≥ 1 observance). 0 ⇒ the filter surfaces hide. */
  availableCount: number;
  /** True when every offered lens is on — the ledger/More rows say `सभी`. */
  allSelected: boolean;
  toggle: (lens: ObservanceLens, enabled: boolean) => void;
  selectAll: () => void;
  clearAll: () => void;
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

  const selectAll = useCallback(() => {
    void store().setAllLenses();
  }, []);

  const clearAll = useCallback(() => {
    void store().clearLenses();
  }, []);

  const availableCount = catalog().getLensesWithContent().length;
  const lenses = useMemo(() => (state ? catalog().withContentOnly(state) : EMPTY), [state]);
  return {
    lenses,
    hydrated: state != null,
    activeCount: lenses.size,
    availableCount,
    allSelected: availableCount > 0 && lenses.size === availableCount,
    toggle,
    selectAll,
    clearAll,
  };
}

const EMPTY: Set<ObservanceLens> = new Set();
