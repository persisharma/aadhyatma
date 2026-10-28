import { useEffect, useState } from 'react';
import { usePanchangLocation } from '@/contexts/PanchangLocationContext';
import { cachedMoonHorizon, computeMoonHorizon, moonHorizonKey, type MoonHorizon } from './moonHorizon';

/** Only the live night header requests horizon events; day/browsed headers do no work. */
export function useMoonHorizon(nightStart: Date | null): MoonHorizon | null {
  const { location, isLoading } = usePanchangLocation();
  const key = nightStart && !isLoading ? moonHorizonKey(nightStart, location) : null;
  const [value, setValue] = useState<{ key: string; data: MoonHorizon | null } | null>(null);
  const warm = key ? cachedMoonHorizon(key) : null;
  useEffect(() => {
    if (!key || !nightStart || warm) return;
    const handle = setTimeout(() => {
      try {
        setValue({ key, data: computeMoonHorizon(nightStart, location) });
      } catch {
        setValue({ key, data: null });
      }
    }, 0);
    return () => clearTimeout(handle);
    // Coordinates/night start are fully represented in key; never solve on minute ticks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return warm ?? (key && value?.key === key ? value.data : null);
}
