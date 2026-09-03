import { useEffect, useState } from 'react';

import { getArcChoicesSnapshot, loadArcChoices, subscribeArcChoices, type ArcChoiceState } from './arcChoiceStore';

/**
 * Live view of the family's arc choices (PRD-28). Hydrates once, then follows
 * every save/clear through the store's listeners so the Observance Detail
 * strip and the headless reminder scheduler always agree.
 */
export function useArcChoices(): { choices: ArcChoiceState; hydrated: boolean } {
  const [state, setState] = useState<ArcChoiceState | null>(() => getArcChoicesSnapshot());

  useEffect(() => {
    let cancelled = false;
    const unsubscribe = subscribeArcChoices(() => {
      if (!cancelled) setState(getArcChoicesSnapshot());
    });
    if (getArcChoicesSnapshot() == null) {
      loadArcChoices().then((loaded) => {
        if (!cancelled) setState(loaded);
      });
    }
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return { choices: state ?? {}, hydrated: state != null };
}
