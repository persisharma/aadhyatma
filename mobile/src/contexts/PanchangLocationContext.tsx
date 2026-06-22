import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { InteractionManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { DEFAULT_LOCATION, getCityById, nearestCity, toPanchangLocation } from '@/panchang/locations';
import { hydrateObservanceCache, warmObservanceCache } from '@/panchang/observanceCache';
import { UJJAIN_CITY_ID } from '@/panchang/engine';
import type { CalendarSystem, PanchangLocation } from '@/panchang/types';

// Location the whole panchang computes for. Any future location-sensitive feature
// (e.g. Brahma-Muhurta reminders) must read this context, not its own geolocation.

const LOCATION_STORAGE_KEY = '@vedansh:panchang-location';
// Read directly (not via usePanchangCalendarSystem) so this provider has no
// ordering dependency on where the calendar-system state lives.
const CALENDAR_SYSTEM_STORAGE_KEY = '@vedansh:panchang-calendar-system';

export type GpsStatus = 'idle' | 'locating' | 'denied' | 'error';

type PanchangLocationContextValue = {
  location: PanchangLocation;
  gpsStatus: GpsStatus;
  selectCity: (cityId: string) => void;
  requestDeviceLocation: () => Promise<'granted' | 'denied' | 'error'>;
};

const PanchangLocationContext = createContext<PanchangLocationContextValue>({
  location: DEFAULT_LOCATION,
  gpsStatus: 'idle',
  selectCity: () => undefined,
  requestDeviceLocation: async () => 'error',
});

function parseStoredLocation(raw: string | null): PanchangLocation | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    const city = typeof parsed?.cityId === 'string' ? getCityById(parsed.cityId) : undefined;
    if (!city) return null;
    const source = parsed.source === 'gps' || parsed.source === 'city' ? parsed.source : 'default';
    // Rebuild from the bundled city so coordinates/labels always match the
    // current app version, not whatever was persisted by an older one.
    return toPanchangLocation(city, source);
  } catch {
    return null;
  }
}

async function activeCalendarSystem(): Promise<CalendarSystem> {
  try {
    const stored = await AsyncStorage.getItem(CALENDAR_SYSTEM_STORAGE_KEY);
    return stored === 'amanta' ? 'amanta' : 'purnimant';
  } catch {
    return 'purnimant';
  }
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
  const [location, setLocation] = useState<PanchangLocation>(DEFAULT_LOCATION);
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('idle');
  const loadedRef = useRef(false);

  // Load the persisted location, then verify/warm its observance cache off the
  // startup path (covers both fresh installs and the December year rollover).
  useEffect(() => {
    let cancelled = false;
    let warmTimer: ReturnType<typeof setTimeout> | undefined;
    AsyncStorage.getItem(LOCATION_STORAGE_KEY)
      .then((raw) => {
        if (cancelled) return;
        const stored = parseStoredLocation(raw);
        loadedRef.current = true;
        if (!stored || stored.cityId === UJJAIN_CITY_ID) return;
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
      });
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
    <PanchangLocationContext.Provider value={{ location, gpsStatus, selectCity, requestDeviceLocation }}>
      {children}
    </PanchangLocationContext.Provider>
  );
}

export function usePanchangLocation(): PanchangLocationContextValue {
  return useContext(PanchangLocationContext);
}
