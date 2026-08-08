import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  computeHastRekha,
  validatePalmProfile,
  type HastRekhaReading,
  type PalmProfile,
} from './hastRekha';

export type HastRekhaLoadState = 'loading' | 'guest' | 'saved' | 'error';

export const HAST_REKHA_PROFILE_STORAGE_KEY = '@vedansh:hast-rekha-profile:v1';

export function parseStoredPalmProfile(raw: string | null): PalmProfile | null {
  if (!raw) return null;
  try {
    const candidate = JSON.parse(raw) as Partial<PalmProfile>;
    if (
      typeof candidate.heart !== 'string'
      || typeof candidate.head !== 'string'
      || typeof candidate.life !== 'string'
      || typeof candidate.fate !== 'string'
    ) {
      return null;
    }
    const profile = candidate as PalmProfile;
    return validatePalmProfile(profile).length === 0 ? profile : null;
  } catch {
    return null;
  }
}

export function useHastRekha(): {
  profile: PalmProfile | null;
  reading: HastRekhaReading | null;
  hydrated: boolean;
  loadState: HastRekhaLoadState;
  saveProfile: (next: PalmProfile) => Promise<void>;
  clearProfile: () => Promise<void>;
} {
  const [profile, setProfile] = useState<PalmProfile | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const raw = await AsyncStorage.getItem(HAST_REKHA_PROFILE_STORAGE_KEY);
        if (!active) return;
        if (!raw) {
          setProfile(null);
          setLoadError(false);
          return;
        }
        const parsed = parseStoredPalmProfile(raw);
        setProfile(parsed);
        setLoadError(parsed === null);
      } catch {
        if (active) {
          setProfile(null);
          setLoadError(true);
        }
      } finally {
        if (active) setHydrated(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const saveProfile = useCallback(async (next: PalmProfile) => {
    const invalid = validatePalmProfile(next);
    if (invalid.length > 0) {
      throw new Error(`Invalid palm profile fields: ${invalid.join(', ')}`);
    }
    await AsyncStorage.setItem(
      HAST_REKHA_PROFILE_STORAGE_KEY,
      JSON.stringify(next)
    );
    setProfile(next);
    setLoadError(false);
    setHydrated(true);
  }, []);

  const clearProfile = useCallback(async () => {
    await AsyncStorage.removeItem(HAST_REKHA_PROFILE_STORAGE_KEY);
    setProfile(null);
    setLoadError(false);
    setHydrated(true);
  }, []);

  const reading = useMemo(
    () => (profile ? computeHastRekha(profile) : null),
    [profile]
  );

  const loadState: HastRekhaLoadState = !hydrated
    ? 'loading'
    : loadError
      ? 'error'
      : profile
        ? 'saved'
        : 'guest';

  return { profile, reading, hydrated, loadState, saveProfile, clearProfile };
}
