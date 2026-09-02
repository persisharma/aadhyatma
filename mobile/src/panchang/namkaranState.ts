import AsyncStorage from '@react-native-async-storage/async-storage';

import { parseIstMoment, type GunaMilanPersonInput } from './gunaMilan';
import { NAMAKSHAR_CONVENTION_VERSION } from './namkaranConvention';

export const NAMKARAN_SESSION_STORAGE_KEY = '@vedansh:namkaran-session:v1';
export const NAMKARAN_SHORTLIST_STORAGE_KEY = '@vedansh:namkaran-shortlist:v1';

export type NamkaranInput = Pick<GunaMilanPersonInput, 'date' | 'time'>;
export type NamkaranInputErrors = Partial<Record<'date' | 'time', string>>;

type StoredSession = {
  version: 1;
  conventionVersion: number;
  input: NamkaranInput;
};

type StoredShortlist = {
  version: 1;
  conventionVersion: number;
  ids: string[];
};

export function validateNamkaranInput(input: NamkaranInput): NamkaranInputErrors {
  const errors: NamkaranInputErrors = {};
  try {
    parseIstMoment(input.date, '00:00');
  } catch {
    errors.date = 'Use a valid YYYY-MM-DD date';
  }
  if (input.time !== null) {
    try {
      parseIstMoment('2000-01-01', input.time);
    } catch {
      errors.time = 'Use 24-hour HH:mm in IST';
    }
  }
  return errors;
}

export function parseStoredNamkaranSession(raw: string | null): NamkaranInput | null {
  if (!raw) return null;
  try {
    const record = JSON.parse(raw) as Partial<StoredSession>;
    if (record.version !== 1 || record.conventionVersion !== NAMAKSHAR_CONVENTION_VERSION) return null;
    if (!record.input || typeof record.input.date !== 'string') return null;
    if (record.input.time !== null && typeof record.input.time !== 'string') return null;
    return Object.keys(validateNamkaranInput(record.input)).length ? null : record.input;
  } catch {
    return null;
  }
}

let sessionQueue: Promise<void> = Promise.resolve();
let sessionGeneration = 0;

function enqueueSession(operation: () => Promise<void>): Promise<void> {
  const next = sessionQueue.catch(() => undefined).then(operation);
  sessionQueue = next.catch(() => undefined);
  return next;
}

export async function loadRememberedNamkaranSession(): Promise<NamkaranInput | null> {
  // Deliberately do not read the Kundali profile: it normally belongs to the
  // device owner, not the newborn, and autofill could yield a confidently wrong syllable.
  return parseStoredNamkaranSession(await AsyncStorage.getItem(NAMKARAN_SESSION_STORAGE_KEY));
}

export async function saveRememberedNamkaranSession(input: NamkaranInput): Promise<void> {
  const generation = sessionGeneration;
  const record: StoredSession = {
    version: 1,
    conventionVersion: NAMAKSHAR_CONVENTION_VERSION,
    input,
  };
  await enqueueSession(async () => {
    if (generation !== sessionGeneration) return;
    await AsyncStorage.setItem(NAMKARAN_SESSION_STORAGE_KEY, JSON.stringify(record));
  });
}

export async function clearRememberedNamkaranSession(): Promise<void> {
  sessionGeneration += 1;
  await enqueueSession(() => AsyncStorage.removeItem(NAMKARAN_SESSION_STORAGE_KEY));
}

export function parseStoredNamkaranShortlist(raw: string | null): readonly string[] {
  if (!raw) return [];
  try {
    const record = JSON.parse(raw) as Partial<StoredShortlist>;
    if (record.version !== 1 || !Array.isArray(record.ids)) return [];
    return [...new Set(record.ids.filter((id): id is string => typeof id === 'string' && id.length > 0))];
  } catch {
    return [];
  }
}

let shortlistQueue: Promise<void> = Promise.resolve();

export async function loadNamkaranShortlistIds(): Promise<readonly string[]> {
  return parseStoredNamkaranShortlist(await AsyncStorage.getItem(NAMKARAN_SHORTLIST_STORAGE_KEY));
}

export function saveNamkaranShortlistIds(ids: readonly string[]): Promise<void> {
  const record: StoredShortlist = {
    version: 1,
    conventionVersion: NAMAKSHAR_CONVENTION_VERSION,
    ids: [...new Set(ids)],
  };
  shortlistQueue = shortlistQueue.catch(() => undefined).then(() =>
    AsyncStorage.setItem(NAMKARAN_SHORTLIST_STORAGE_KEY, JSON.stringify(record))
  );
  return shortlistQueue;
}
