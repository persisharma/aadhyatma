/**
 * The React face of the birth-profile roster.
 *
 * `useKundali()` keeps its original single-profile shape — `profile` is the
 * ACTIVE person and `saveProfile`/`clearProfile` still act on them — so every
 * existing caller (Guna Milan autofill, the Jyotish landing, Rashifal) is
 * unchanged. Multi-person surfaces additionally read `people`/`activeId` and call
 * `selectPerson`/`addPerson`/`updatePerson`/`removePerson`.
 *
 * The pure model lives in `birthProfiles.ts` and persistence in
 * `birthProfileStore.ts`; this file adds React and the active person's chart and
 * nothing else. Chart computation is deliberately ACTIVE-ONLY — a roster of eight
 * would otherwise run eight full Kundali solves to draw a row of chips that shows
 * names and birth dates.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';

import { computeKundali, type KundaliChart } from './kundali';
import {
  activePerson as resolveActivePerson,
  birthProfileToInput,
  canAddPerson as rosterCanAddPerson,
  validateBirthProfile,
  type BirthProfile,
  type PersonProfile,
  type ProfileRoster,
} from './birthProfiles';
import {
  LEGACY_BIRTH_PROFILE_STORAGE_KEY,
  addPerson as storeAddPerson,
  getRosterSnapshot,
  loadRoster,
  removeActivePerson,
  removePerson as storeRemovePerson,
  saveActivePerson,
  selectPerson as storeSelectPerson,
  subscribeRoster,
  updatePerson as storeUpdatePerson,
  type RosterState,
} from './birthProfileStore';

export {
  MAX_PEOPLE,
  birthProfileToInput,
  parseStoredBirthProfile,
  validateBirthProfile,
  type BirthProfile,
  type BirthProfileErrors,
  type PersonProfile,
  type ProfileRoster,
} from './birthProfiles';
export { BIRTH_PROFILES_STORAGE_KEY } from './birthProfileStore';

/**
 * PRD-C's single-profile key. Kept exported because it is still a real key on
 * older devices until the one-shot migration runs, and because
 * `derivedCacheReset` enumerates it as a NON-cache key that must never be swept.
 */
export const KUNDALI_PROFILE_STORAGE_KEY = LEGACY_BIRTH_PROFILE_STORAGE_KEY;

export type KundaliLoadState = 'loading' | 'guest' | 'saved' | 'error';

/**
 * Subscribe to the roster. Shared by `useKundali` and `useMuhuratBala` so both
 * see a person switch on the same render, without a focus round trip.
 */
export function useBirthProfileRoster(): RosterState {
  const [state, setState] = useState<RosterState>(() => getRosterSnapshot());

  useEffect(() => {
    const unsubscribe = subscribeRoster(setState);
    void loadRoster().then(setState);
    return unsubscribe;
  }, []);

  return state;
}

export function useKundali(): {
  /** The active person's birth details — the shipped single-profile field. */
  profile: BirthProfile | null;
  chart: KundaliChart | null;
  hydrated: boolean;
  loadState: KundaliLoadState;
  people: readonly PersonProfile[];
  activeId: string | null;
  activePerson: PersonProfile | null;
  canAddPerson: boolean;
  saveProfile: (next: BirthProfile) => Promise<void>;
  clearProfile: () => Promise<void>;
  reloadProfile: () => Promise<void>;
  selectPerson: (id: string) => Promise<void>;
  addPerson: (next: BirthProfile) => Promise<PersonProfile | null>;
  updatePerson: (id: string, next: BirthProfile) => Promise<void>;
  removePerson: (id: string) => Promise<void>;
} {
  const { hydrated, roster, error } = useBirthProfileRoster();
  const person = useMemo(() => resolveActivePerson(roster), [roster]);

  const saveProfile = useCallback(async (next: BirthProfile) => {
    const errors = validateBirthProfile(next);
    if (Object.keys(errors).length > 0) throw new Error(Object.values(errors)[0]);
    await saveActivePerson(next);
  }, []);

  const addPerson = useCallback(async (next: BirthProfile) => {
    const errors = validateBirthProfile(next);
    if (Object.keys(errors).length > 0) throw new Error(Object.values(errors)[0]);
    return storeAddPerson(next);
  }, []);

  const updatePerson = useCallback(async (id: string, next: BirthProfile) => {
    const errors = validateBirthProfile(next);
    if (Object.keys(errors).length > 0) throw new Error(Object.values(errors)[0]);
    await storeUpdatePerson(id, next);
  }, []);

  const clearProfile = useCallback(async () => {
    await removeActivePerson();
  }, []);

  const removePerson = useCallback(async (id: string) => {
    await storeRemovePerson(id);
  }, []);

  const selectPerson = useCallback(async (id: string) => {
    await storeSelectPerson(id);
  }, []);

  // The store publishes to every subscriber on write, so there is nothing to
  // re-read; kept because screens still call it on focus (PanchangScreen).
  const reloadProfile = useCallback(async () => {
    await loadRoster();
  }, []);

  const chart = useMemo(
    () => (person ? computeKundali(birthProfileToInput(person)) : null),
    [person]
  );

  const loadState: KundaliLoadState = !hydrated
    ? 'loading'
    : error
      ? 'error'
      : person
        ? 'saved'
        : 'guest';

  return {
    profile: person,
    chart,
    hydrated,
    loadState,
    people: roster.people,
    activeId: person?.id ?? null,
    activePerson: person,
    canAddPerson: rosterCanAddPerson(roster),
    saveProfile,
    clearProfile,
    reloadProfile,
    selectPerson,
    addPerson,
    updatePerson,
    removePerson,
  };
}
