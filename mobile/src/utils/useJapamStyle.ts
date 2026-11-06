import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type JapamStyle = 'mala' | 'infinity' | 'kirtan';
export const JAPAM_STYLE_KEY = '@vedansh/japam-style';

/** A presentation preference only: counts always belong to JapamCounterContext. */
export function useJapamStyle() {
  const [style, setStyle] = useState<JapamStyle>('mala');
  const [ready, setReady] = useState(false);
  const writes = useRef(Promise.resolve());
  useEffect(() => {
    let live = true;
    AsyncStorage.getItem(JAPAM_STYLE_KEY)
      .then((raw) => {
        if (!live || !raw) return;
        try {
          const value: unknown = JSON.parse(raw);
          if (value === 'mala' || value === 'infinity' || value === 'kirtan') setStyle(value);
        } catch { /* Invalid preferences fall back to the existing mala. */ }
      })
      .catch(() => undefined)
      .finally(() => { if (live) setReady(true); });
    return () => { live = false; };
  }, []);
  const selectStyle = useCallback((value: JapamStyle) => {
    if (!ready) return;
    setStyle(value);
    // Serialize rapid switches so an older write cannot overwrite the last choice.
    writes.current = writes.current
      .then(() => AsyncStorage.setItem(JAPAM_STYLE_KEY, JSON.stringify(value)))
      .catch(() => undefined);
  }, [ready]);
  return { style, ready, selectStyle };
}
