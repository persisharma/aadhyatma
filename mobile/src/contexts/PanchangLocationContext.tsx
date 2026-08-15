import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { InteractionManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { DEFAULT_LOCATION, getCityById, nearestCity, toPanchangLocation } from '@/panchang/locations';
import { hydrateObservanceCache, warmObservanceCache } from '@/panchang/observanceCache';
import { UJJAIN_CITY_ID } from '@/panchang/engine';
import {
  getCalendarSystemSnapshot,
  LOCATION_STORAGE_KEY,
  loadPanchangPrefsOnce,
  peekPanchangPrefs,
} from '@/panchang/panchangPrefs';
import type { CalendarSystem, PanchangLocation } from '@/panchang/types';

// Location the whole panchang computes for. Any future location-sensitive feature
// (e.g. Brahma-Muhurta reminders) must read this context, not its own geolocation.
//
// The stored city is read through `panchangPrefs`, which pairs it with the
// calendar system in ONE `multiGet` kicked off at process start. Two consequences
// worth knowing: this provider issues no storage read of its own (it awaits the
// shared one), and when that read has already landed by the time React renders —
// the normal case, because it races the splash gate rather than following it —
// the provider starts on the user's real city with `isLoading` already false.
// That is what lets Home's Today strip compose from cache on its FIRST render
// instead of after two more round trips.

export type GpsStatus = 'idle' | 'locating' | 'denied' | 'error';

type PanchangLocationContextValue = {
  location: PanchangLocation;
  isLoading: boolean;
  gpsStatus: GpsStatus;
  selectCity: (cityId: string) => void;
  requestDeviceLocation: () => Promise<'granted' | 'denied' | 'error'>;
};

const PanchangLocationContext = createContext<PanchangLocationContextValue>({
  location: DEFAULT_LOCATION,
  isLoading: true,
  gpsStatus: 'idle',
  selectCity: () => undefined,
  requestDeviceLocation: async () => 'error',
});

/**
 * The system to warm a city's observance year against. Awaits the shared read so
 * a launch-time call cannot warm against the placeholder, then takes the store's
 * CURRENT value rather than the stored one — a user who switched to amanta and
 * then changed city must get amanta dates, and `setCalendarSystemGlobal` updates
 * the store before its own write reaches disk.
 */
async function activeCalendarSystem(): Promise<CalendarSystem> {
  await loadPanchangPrefsOnce();
  return getCalendarSystemSnapshot();
}

function warmInBackground(location: PanchangLocation) {
  if (location.cityId === UJJAIN_CITY_ID) return;
  // Defer off the interaction path so the picker can dismiss and the new location's
  // sunrise/tithi can repaint first — the (now frame-budgeted, but still heavy)
  // observance scan must never compete with the city-switch transition.
  InteractionManager.runAfterInteractions(() => {
    activeCalendarSystem()
      .then((system) => warmObservanceCache(location, system))
      .catch(() => undefined);
  });
}

async function getDevicePosition(): Promise<{ latitude: number; longitude: number } | null> {
  const lastKnown = await Location.getLastKnownPositionAsync().catch(() => null);
  if (lastKnown) return lastKnown.coords;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const current = await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low }),
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), 10000);
      }),
    ]);
    return current ? current.coords : null;
  } catch {
    return null;
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

export function PanchangLocationProvider({ children }: { children: React.ReactNode }) {
  // Lazy initializers, so a launch read that already landed costs zero renders
  // on the Ujjain placeholder — and, with it, zero cold panchang chains spent on
  // a scope the user is about to be moved off.
  const [location, setLocation] = useState<PanchangLocation>(
    () => peekPanchangPrefs()?.location ?? DEFAULT_LOCATION
  );
  const [isLoading, setIsLoading] = useState(() => peekPanchangPrefs() == null);
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('idle');
  const loadedRef = useRef(false);

  // Adopt the persisted location, then verify/warm its observance cache off the
  // startup path (covers both fresh installs and the December year rollover).
  // The read itself is the shared one — awaiting it here rather than issuing a
  // second `getItem` keeps the launch to a single panchang-preferences round trip.
  useEffect(() => {
    let cancelled = false;
    let warmTimer: ReturnType<typeof setTimeout> | undefined;
    loadPanchangPrefsOnce()
      .then(({ location: stored }) => {
        if (cancelled) return;
        loadedRef.current = true;
        // `DEFAULT_LOCATION` is already the initial value, so only a real choice
        // needs applying — and only a real choice needs its observance year warmed.
        if (stored.cityId === UJJAIN_CITY_ID) return;
        setLocation(stored);
        InteractionManager.runAfterInteractions(() => {
          if (cancelled) return;
          warmTimer = setTimeout(() => {
            if (cancelled) return;
            const currentYear = new Date().getFullYear();
            activeCalendarSystem()
              .then((system) =>
                hydrateObservanceCache(stored.cityId, [system], [currentYear, currentYear + 1])
                  .then(() => warmObservanceCache(stored, system))
              )
              .catch(() => undefined);
          }, 3000);
        });
      })
      .catch(() => {
        loadedRef.current = true;
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => {
      cancelled = true;
      if (warmTimer !== undefined) clearTimeout(warmTimer);
    };
  }, []);

  const applyLocation = useCallback((next: PanchangLocation) => {
    setLocation(next);
    AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
    warmInBackground(next);
  }, []);

  const selectCity = useCallback(
    (cityId: string) => {
      const city = getCityById(cityId);
      if (!city) return;
      setGpsStatus('idle');
      applyLocation(toPanchangLocation(city, city.id === UJJAIN_CITY_ID ? 'default' : 'city'));
    },
    [applyLocation]
  );

  const requestDeviceLocation = useCallback(async (): Promise<'granted' | 'denied' | 'error'> => {
    setGpsStatus('locating');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setGpsStatus('denied');
        return 'denied';
      }
      const coords = await getDevicePosition();
      if (!coords) {
        setGpsStatus('error');
        return 'error';
      }
      const city = nearestCity(coords.latitude, coords.longitude);
      applyLocation(toPanchangLocation(city, 'gps'));
      setGpsStatus('idle');
      return 'granted';
    } catch {
      setGpsStatus('error');
      return 'error';
    }
  }, [applyLocation]);

  return (
    <PanchangLocationContext.Provider value={{ location, isLoading, gpsStatus, selectCity, requestDeviceLocation }}>
      {children}
    </PanchangLocationContext.Provider>
  );
}

export function usePanchangLocation(): PanchangLocationContextValue {
  return useContext(PanchangLocationContext);
}
