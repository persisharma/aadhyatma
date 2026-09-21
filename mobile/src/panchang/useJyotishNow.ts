import { useCallback, useState } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getCurrentDasha, indiaDayAnchor, type KundaliChart } from './kundali';

/** Refresh on focus, foreground, India midnight and the exact next dasha edge. */
export function useJyotishNow(chart: KundaliChart | null) {
  const [now, setNow] = useState(() => new Date());
  useFocusEffect(useCallback(() => {
    let timer: ReturnType<typeof setTimeout>;
    const refresh = () => {
      clearTimeout(timer);
      const at = new Date();
      setNow(at);
      const current = chart ? getCurrentDasha(chart, at) : null;
      const midnight = indiaDayAnchor(at).getTime() + 18 * 3_600_000;
      const boundary = (current?.antar ?? current?.maha)?.end.getTime() ?? Infinity;
      timer = setTimeout(refresh, Math.max(1, Math.min(midnight, boundary) - at.getTime() + 1));
    };
    refresh();
    const subscription = AppState.addEventListener('change', state => { if (state === 'active') refresh(); });
    return () => { clearTimeout(timer); subscription.remove(); };
  }, [chart]));
  return now;
}
