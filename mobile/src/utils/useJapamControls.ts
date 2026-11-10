import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** Whether the counter's control column is open (`"open"`) or folded (`"folded"`). */
export const JAPAM_CONTROLS_KEY = '@vedansh/japam-controls';

/**
 * The JapaMala control column's remembered state (design.md §35). Folded by
 * default; the reader's last choice wins on the next visit. Like useJapamStyle:
 * a JSON string, hydrated before it can be written, writes serialized, and a
 * corrupt or unreadable value falls back to folded. `ready` is false until the
 * stored value is known, so the column never shows one state and flips.
 */
export function useJapamControls() {
  const [open, setOpenState] = useState(false);
  const [ready, setReady] = useState(false);
  const writes = useRef(Promise.resolve());
  useEffect(() => {
    let live = true;
    AsyncStorage.getItem(JAPAM_CONTROLS_KEY)
      .then((raw) => {
        if (!live || !raw) return;
        try {
          const value: unknown = JSON.parse(raw);
          if (value === 'open') setOpenState(true);
        } catch { /* Invalid preference: stay folded. */ }
      })
      .catch(() => undefined)
      .finally(() => { if (live) setReady(true); });
    return () => { live = false; };
  }, []);
  const setOpen = useCallback((next: boolean) => {
    if (!ready) return;
    setOpenState(next);
    writes.current = writes.current
      .then(() => AsyncStorage.setItem(JAPAM_CONTROLS_KEY, JSON.stringify(next ? 'open' : 'folded')))
      .catch(() => undefined);
  }, [ready]);
  return { open, ready, setOpen };
}
