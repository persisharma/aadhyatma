/**
 * React subscription to the shared screen's active section.
 *
 * The state itself lives in `navigation/panchangSectionStore` — that module
 * carries the sync rule and the reasoning for why it is a module store rather
 * than a context (one of the four writers, the notification-tap handler, is
 * not a component). This file is only the hook, following the same
 * store ⇄ hook split as `birthProfileStore` ⇄ `useBirthProfileRoster`.
 *
 * The file keeps its `…Context` name because every consumer imports
 * `usePanchangSection` from here; there is no provider to mount.
 */
import { useEffect, useState } from 'react';

import {
  getPanchangSectionSnapshot,
  requestPanchangScrollToTop,
  setPanchangSection,
  subscribePanchangSection,
  type PanchangSectionState,
} from '@/navigation/panchangSectionStore';

export { DEFAULT_PANCHANG_SECTION } from '@/navigation/panchangSectionStore';

type PanchangSectionValue = PanchangSectionState & {
  setSection: typeof setPanchangSection;
  requestScrollToTop: typeof requestPanchangScrollToTop;
};

export function usePanchangSection(): PanchangSectionValue {
  const [state, setState] = useState<PanchangSectionState>(() => getPanchangSectionSnapshot());

  useEffect(() => {
    // Re-read on subscribe: a tab press can write the section in the same tick
    // that mounts the screen reading it, and the initial `useState` would then
    // be one value stale.
    setState(getPanchangSectionSnapshot());
    return subscribePanchangSection(setState);
  }, []);

  return {
    ...state,
    setSection: setPanchangSection,
    requestScrollToTop: requestPanchangScrollToTop,
  };
}
