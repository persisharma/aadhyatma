import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { CITIES, getCityById } from './locations';
import { computeKundali, type KundaliChart, type KundaliInput } from './kundali';

export type BirthProfile = {
  name?: string;
  date: string;
  time: string;
  cityId: string;
};

export type BirthProfileErrors = Partial<Record<'date' | 'time' | 'cityId', string>>;

export const KUNDALI_PROFILE_STORAGE_KEY = '@vedansh:kundali-birth-profile:v1';

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
const IST_OFFSET_MINUTES = 330;

export function validateBirthProfile(profile: BirthProfile): BirthProfileErrors {
  const errors: BirthProfileErrors = {};
  const dateMatch = DATE_PATTERN.exec(profile.date);
  if (!dateMatch) {
    errors.date = 'Use YYYY-MM-DD';
  } else {
    const [, yearText, monthText, dayText] = dateMatch;
    const year = Number(yearText);
    const month = Number(monthText);
    const day = Number(dayText);
    const check = new Date(Date.UTC(year, month - 1, day));
    if (
      check.getUTCFullYear() !== year
      || check.getUTCMonth() !== month - 1
      || check.getUTCDate() !== day
    ) {
      errors.date = 'Enter a valid date';
    }
  }
  if (!TIME_PATTERN.test(profile.time)) errors.time = 'Use 24-hour HH:mm';
  if (!getCityById(profile.cityId)) errors.cityId = 'Choose an Indian city';
  return errors;
}

export function birthProfileToInput(profile: BirthProfile): KundaliInput {
  const errors = validateBirthProfile(profile);
  if (Object.keys(errors).length > 0) {
    throw new Error(Object.values(errors)[0]);
  }
  const city = getCityById(profile.cityId)!;
  const [year, month, day] = profile.date.split('-').map(Number);
  const [hour, minute] = profile.time.split(':').map(Number);
  const date = new Date(
    Date.UTC(year, month - 1, day, hour, minute) - IST_OFFSET_MINUTES * 60_000
  );
  return {
    date,
    latitude: city.latitude,
    longitude: city.longitude,
    elevation: city.elevation,
    timezone: 'Asia/Kolkata',
  };
}

export function parseStoredBirthProfile(raw: string | null): BirthProfile | null {
  if (!raw) return null;
  try {
    const candidate = JSON.parse(raw) as Partial<BirthProfile>;
    if (
      typeof candidate.date !== 'string'
      || typeof candidate.time !== 'string'
      || typeof candidate.cityId !== 'string'
      || (candidate.name !== undefined && typeof candidate.name !== 'string')
    ) {
      return null;
    }
    const profile: BirthProfile = {
      date: candidate.date,
      time: candidate.time,
      cityId: candidate.cityId,
      ...(candidate.name?.trim() ? { name: candidate.name.trim() } : {}),
    };
    return Object.keys(validateBirthProfile(profile)).length === 0 ? profile : null;
  } catch {
    return null;
  }
}

export function useKundali(): {
  profile: BirthProfile | null;
  chart: KundaliChart | null;
  hydrated: boolean;
  saveProfile: (next: BirthProfile) => Promise<void>;
  clearProfile: () => Promise<void>;
} {
  const [profile, setProfile] = useState<BirthProfile | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(KUNDALI_PROFILE_STORAGE_KEY)
      .then((raw) => {
        if (active) setProfile(parseStoredBirthProfile(raw));
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setHydrated(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const saveProfile = useCallback(async (next: BirthProfile) => {
    const errors = validateBirthProfile(next);
    if (Object.keys(errors).length > 0) throw new Error(Object.values(errors)[0]);
    const normalized: BirthProfile = {
      date: next.date,
      time: next.time,
      cityId: next.cityId,
      ...(next.name?.trim() ? { name: next.name.trim() } : {}),
    };
    setProfile(normalized);
    await AsyncStorage.setItem(
      KUNDALI_PROFILE_STORAGE_KEY,
      JSON.stringify(normalized)
    ).catch(() => undefined);
  }, []);

  const clearProfile = useCallback(async () => {
    setProfile(null);
    await AsyncStorage.removeItem(KUNDALI_PROFILE_STORAGE_KEY).catch(() => undefined);
  }, []);

  const chart = useMemo(
    () => (profile ? computeKundali(birthProfileToInput(profile)) : null),
    [profile]
  );

  return { profile, chart, hydrated, saveProfile, clearProfile };
}

export const DEFAULT_BIRTH_CITY_ID = CITIES[0].id;
