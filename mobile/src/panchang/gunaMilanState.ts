import AsyncStorage from '@react-native-async-storage/async-storage';

import { parseIstMoment, type GunaMilanPersonInput } from './gunaMilan';

export const GUNA_MILAN_DRAFT_STORAGE_KEY = '@vedansh:guna-milan-draft:v1';
export const GUNA_MILAN_METRICS_STORAGE_KEY = '@vedansh:guna-milan-metrics:v1';

let draftMutationQueue: Promise<void> = Promise.resolve();
let draftPersistenceGeneration = 0;

function enqueueDraftMutation(operation: () => Promise<void>): Promise<void> {
  const next = draftMutationQueue.catch(() => undefined).then(operation);
  // A failed storage write must not poison later privacy operations.
  draftMutationQueue = next.catch(() => undefined);
  return next;
}

export type GunaMilanDraft = {
  groom: GunaMilanPersonInput;
  bride: GunaMilanPersonInput;
};

export type GunaMilanStoredDraft = {
  version: 1;
  remember: true;
  draft: GunaMilanDraft;
};

export type PersonInputErrors = Partial<Record<'date' | 'time', string>>;

export function validateGunaMilanPerson(input: GunaMilanPersonInput): PersonInputErrors {
  const errors: PersonInputErrors = {};
  // Validate the date against a known-good time so an empty or malformed time
  // ('' is the form's initial state) can never masquerade as a date error.
  try {
    parseIstMoment(input.date, '00:00');
  } catch {
    errors.date = 'Use a valid YYYY-MM-DD date';
  }
  // Validate the time only when provided, against a known-good date so an
  // invalid date can never masquerade as a time error.
  if (input.time !== null) {
    try {
      parseIstMoment('2000-01-01', input.time);
    } catch {
      errors.time = 'Use 24-hour HH:mm in IST';
    }
  }
  return errors;
}

function parsePerson(candidate: unknown): GunaMilanPersonInput | null {
  if (!candidate || typeof candidate !== 'object') return null;
  const value = candidate as Partial<GunaMilanPersonInput>;
  if (typeof value.date !== 'string') return null;
  if (value.time !== null && typeof value.time !== 'string') return null;
  if (value.name !== undefined && typeof value.name !== 'string') return null;
  const person: GunaMilanPersonInput = {
    date: value.date,
    time: value.time,
    ...(value.name?.trim() ? { name: value.name.trim() } : {}),
  };
  return Object.keys(validateGunaMilanPerson(person)).length === 0 ? person : null;
}

export function parseStoredGunaMilanDraft(raw: string | null): GunaMilanDraft | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<GunaMilanStoredDraft>;
    if (value.version !== 1 || value.remember !== true || !value.draft) return null;
    const groom = parsePerson(value.draft.groom);
    const bride = parsePerson(value.draft.bride);
    return groom && bride ? { groom, bride } : null;
  } catch {
    return null;
  }
}

export async function loadRememberedGunaMilanDraft(): Promise<GunaMilanDraft | null> {
  return parseStoredGunaMilanDraft(await AsyncStorage.getItem(GUNA_MILAN_DRAFT_STORAGE_KEY));
}

export async function saveRememberedGunaMilanDraft(draft: GunaMilanDraft): Promise<void> {
  const record: GunaMilanStoredDraft = { version: 1, remember: true, draft };
  const generation = draftPersistenceGeneration;
  await enqueueDraftMutation(async () => {
    if (generation !== draftPersistenceGeneration) return;
    await AsyncStorage.setItem(GUNA_MILAN_DRAFT_STORAGE_KEY, JSON.stringify(record));
  });
}

export async function clearRememberedGunaMilanDraft(): Promise<void> {
  // Invalidate queued saves immediately, then serialize removal after any write
  // already inside AsyncStorage. Explicit opt-out therefore always wins.
  draftPersistenceGeneration += 1;
  await enqueueDraftMutation(() => AsyncStorage.removeItem(GUNA_MILAN_DRAFT_STORAGE_KEY));
}

export type GunaMilanMetric = 'started' | 'completed' | 'previewGenerated' | 'shareSheetOpened';

let metricWriteQueue: Promise<void> = Promise.resolve();

export async function incrementGunaMilanMetric(metric: GunaMilanMetric): Promise<void> {
  metricWriteQueue = metricWriteQueue.then(async () => {
    try {
      const raw = await AsyncStorage.getItem(GUNA_MILAN_METRICS_STORAGE_KEY);
      const current = raw ? JSON.parse(raw) as Record<string, unknown> : {};
      const next = typeof current[metric] === 'number' ? current[metric] as number + 1 : 1;
      await AsyncStorage.setItem(
        GUNA_MILAN_METRICS_STORAGE_KEY,
        JSON.stringify({ ...current, [metric]: next })
      );
    } catch {
      // Diagnostics are optional and local-only; feature behavior must not depend on them.
    }
  });
  return metricWriteQueue;
}
