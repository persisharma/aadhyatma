/**
 * Persistence for the birth-profile roster (`birthProfiles.ts`).
 *
 * One in-memory snapshot, one subscriber list, one serialized write queue. Every
 * personalised Jyotish surface — the Kundali screen, the Jyotish landing, Daily
 * Rashifal, the muhurat आपके लिए strip — reads THIS store, so switching person
 * anywhere is immediately true everywhere. Do not add a screen-local "current
 * person": that is the same mistake `panchangDayStore` exists to prevent one
 * layer down.
 *
 * Three rules carried over from the panchang cache work:
 *  - only a SUCCESSFUL read is memoized, so one transient storage failure cannot
 *    pin the whole session to a guest state with no path back;
 *  - the read is ONE `multiGet` (roster + legacy key together), because the
 *    migration answer needs both and two serial round trips is the launch-path
 *    mistake `panchangPrefs` documents;
 *  - a mutation publishes only AFTER its write lands, so a failed save is
 *    visible and recoverable instead of a lie in memory (RULEBOOK §14.4).
 *
 * MIGRATION is one-shot and destructive-by-design: a valid single profile under
 * the PRD-C key becomes person one, the roster record is written, and only then
 * is the legacy key removed. It has to be removed — otherwise "remove this
 * person" would leave a readable copy of their birth details on disk forever. An
 * UNREADABLE legacy record is never deleted (we do not destroy what we could not
 * read) and surfaces as the existing corrupt-profile recovery state.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  EMPTY_ROSTER,
  activePerson,
  addPersonToRoster,
  canAddPerson,
  parseStoredBirthProfile,
  parseStoredRoster,
  removePersonFromRoster,
  rosterFromLegacyProfile,
  serializeRoster,
  setActiveInRoster,
  updatePersonInRoster,
  type BirthProfile,
  type PersonProfile,
  type ProfileRoster,
} from './birthProfiles';

export const BIRTH_PROFILES_STORAGE_KEY = '@vedansh:kundali-profiles:v1';
/** PRD-C's single-profile key. Read once for migration, then removed. */
export const LEGACY_BIRTH_PROFILE_STORAGE_KEY = '@vedansh:kundali-birth-profile:v1';

export type RosterState = {
  /** False until the read lands. Surfaces render their loading state until then. */
  hydrated: boolean;
  roster: ProfileRoster;
  /** The stored record could not be read — show recovery, never a silent guest. */
  error: boolean;
};

const INITIAL_STATE: RosterState = { hydrated: false, roster: EMPTY_ROSTER, error: false };

let state: RosterState = INITIAL_STATE;
let loadPromise: Promise<RosterState> | null = null;
/**
 * A failed READ publishes `hydrated: true` so surfaces show recovery instead of
 * spinning forever — which means `hydrated` alone cannot gate the retry, or one
 * transient storage error would pin the whole session to an empty roster with no
 * path back (the `panchangPrefs` lesson: only a SUCCESSFUL read is memoized).
 */
let lastReadFailed = false;
let writeQueue: Promise<unknown> = Promise.resolve();
let idCounter = 0;
const listeners = new Set<(next: RosterState) => void>();

function publish(next: RosterState): void {
  state = next;
  listeners.forEach((listener) => listener(next));
}

export function getRosterSnapshot(): RosterState {
  return state;
}

export function subscribeRoster(listener: (next: RosterState) => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * A person id is a persisted key, so it only has to be unique on this device —
 * the counter keeps two people added in the same millisecond apart, and the
 * roster is re-checked because the counter resets with the process.
 */
function nextPersonId(roster: ProfileRoster): string {
  let candidate = '';
  do {
    idCounter += 1;
    candidate = `p-${Date.now().toString(36)}-${idCounter.toString(36)}`;
  } while (roster.people.some((person) => person.id === candidate));
  return candidate;
}

async function readFromStorage(): Promise<RosterState> {
  const pairs = await AsyncStorage.multiGet([
    BIRTH_PROFILES_STORAGE_KEY,
    LEGACY_BIRTH_PROFILE_STORAGE_KEY,
  ]);
  const stored = new Map(pairs);
  const rosterRaw = stored.get(BIRTH_PROFILES_STORAGE_KEY) ?? null;
  if (rosterRaw) {
    const parsed = parseStoredRoster(rosterRaw);
    return { hydrated: true, roster: parsed.roster, error: parsed.unreadable };
  }
  const legacyRaw = stored.get(LEGACY_BIRTH_PROFILE_STORAGE_KEY) ?? null;
  if (!legacyRaw) return { hydrated: true, roster: EMPTY_ROSTER, error: false };
  const legacy = parseStoredBirthProfile(legacyRaw);
  // A legacy record we cannot read is the shipped corrupt-profile state. Leave
  // it on disk: the recovery flow re-enters details, which writes the roster.
  if (!legacy) return { hydrated: true, roster: EMPTY_ROSTER, error: true };
  const roster = rosterFromLegacyProfile(legacy, nextPersonId(EMPTY_ROSTER));
  try {
    await AsyncStorage.setItem(BIRTH_PROFILES_STORAGE_KEY, serializeRoster(roster));
    await AsyncStorage.removeItem(LEGACY_BIRTH_PROFILE_STORAGE_KEY);
  } catch {
    // The migrated roster is still correct in memory for this session; the
    // legacy key survives, so the next launch retries the migration.
  }
  return { hydrated: true, roster, error: false };
}

/** Hydrate once per process. Only a successful read is memoized. */
export function loadRoster(): Promise<RosterState> {
  if (state.hydrated && !lastReadFailed) return Promise.resolve(state);
  if (!loadPromise) {
    loadPromise = readFromStorage()
      .then((next) => {
        lastReadFailed = false;
        publish(next);
        return next;
      })
      .catch(() => {
        loadPromise = null;
        lastReadFailed = true;
        const next: RosterState = { hydrated: true, roster: EMPTY_ROSTER, error: true };
        publish(next);
        return next;
      });
  }
  return loadPromise;
}

/**
 * Apply a pure roster operation: hydrate, transform, WRITE, then publish. Writes
 * are serialized so two surfaces mutating at once cannot lose an update, and a
 * rejected write leaves the in-memory roster untouched and propagates so the
 * caller can show its failure copy.
 */
function mutate(transform: (roster: ProfileRoster) => ProfileRoster): Promise<ProfileRoster> {
  const run = async (): Promise<ProfileRoster> => {
    await loadRoster();
    const next = transform(state.roster);
    if (next === state.roster) return state.roster;
    await AsyncStorage.setItem(BIRTH_PROFILES_STORAGE_KEY, serializeRoster(next));
    // Disk now matches memory, so a read that failed earlier is settled.
    lastReadFailed = false;
    publish({ hydrated: true, roster: next, error: false });
    return next;
  };
  const queued = writeQueue.then(run, run);
  // Keep the chain alive whatever this mutation did, without swallowing the
  // rejection the caller is awaiting.
  writeQueue = queued.catch(() => undefined);
  return queued;
}

/** Adds and selects. Returns null when the roster is already at `MAX_PEOPLE`. */
export async function addPerson(profile: BirthProfile): Promise<PersonProfile | null> {
  let added: PersonProfile | null = null;
  await mutate((roster) => {
    if (!canAddPerson(roster)) return roster;
    const id = nextPersonId(roster);
    const next = addPersonToRoster(roster, profile, id);
    added = next.people.find((person) => person.id === id) ?? null;
    return next;
  });
  return added;
}

export async function updatePerson(id: string, profile: BirthProfile): Promise<void> {
  await mutate((roster) => updatePersonInRoster(roster, id, profile));
}

export async function removePerson(id: string): Promise<void> {
  await mutate((roster) => removePersonFromRoster(roster, id));
}

export async function selectPerson(id: string): Promise<void> {
  await mutate((roster) => setActiveInRoster(roster, id));
}

/**
 * Save into the ACTIVE person, or create the first one — the backwards-compatible
 * path for callers that still think in terms of "the saved profile".
 */
export async function saveActivePerson(profile: BirthProfile): Promise<void> {
  // One mutation, not read-then-write: the roster is shared, so resolving "who is
  // active" outside the queue could save into a person another surface removed.
  await mutate((roster) => {
    const current = activePerson(roster);
    if (current) return updatePersonInRoster(roster, current.id, profile);
    if (!canAddPerson(roster)) return roster;
    return addPersonToRoster(roster, profile, nextPersonId(roster));
  });
}

/** Removes the active person (selection falls to a neighbour, or the guest state). */
export async function removeActivePerson(): Promise<void> {
  await mutate((roster) => {
    const current = activePerson(roster);
    return current ? removePersonFromRoster(roster, current.id) : roster;
  });
}

export function __resetBirthProfileStoreForTests(): void {
  state = INITIAL_STATE;
  loadPromise = null;
  lastReadFailed = false;
  writeQueue = Promise.resolve();
  idCounter = 0;
  listeners.clear();
}
