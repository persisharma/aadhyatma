import { useCallback, useEffect, useState } from 'react';

import { loadNamkaranShortlistIds, saveNamkaranShortlistIds } from './namkaranState';

export function useNamkaranShortlist() {
  const [ids, setIds] = useState<readonly string[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    void loadNamkaranShortlistIds()
      .then((loaded) => { if (active) setIds(loaded); })
      .catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, []);

  const toggle = useCallback((id: string) => {
    setIds((current) => {
      const next = current.includes(id) ? current.filter((value) => value !== id) : [...current, id];
      void saveNamkaranShortlistIds(next).catch(() => setError(true));
      return next;
    });
  }, []);

  const clearError = useCallback(() => setError(false), []);
  return { ids, toggle, error, clearError };
}
