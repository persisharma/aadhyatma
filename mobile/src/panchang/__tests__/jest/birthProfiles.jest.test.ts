/**
 * The birth-profile ROSTER — the model and its storage (multi-person Jyotish).
 *
 * These pin the state machine every personalised surface depends on: who is
 * active, what a one-shot migration from the shipped single-profile key does,
 * what happens to the selection when the active person is removed, and that a
 * corrupt record still reaches the recovery state instead of silently presenting
 * the user as a guest.
 *
 * Lives in `__tests__/jest/` because `npm run test:engine` globs
 * `src/panchang/__tests__/*.test.ts` into `tsx --test`, which cannot run Jest.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  EMPTY_ROSTER,
  MAX_PEOPLE,
  activePerson,
  addPersonToRoster,
  canAddPerson,
  parseStoredRoster,
  removePersonFromRoster,
  serializeRoster,
  setActiveInRoster,
  updatePersonInRoster,
  type BirthProfile,
  type ProfileRoster,
} from '../../birthProfiles';
import {
  BIRTH_PROFILES_STORAGE_KEY,
  LEGACY_BIRTH_PROFILE_STORAGE_KEY,
  addPerson,
  getRosterSnapshot,
  loadRoster,
  removeActivePerson,
  removePerson,
  saveActivePerson,
  selectPerson,
  subscribeRoster,
  updatePerson,
  __resetBirthProfileStoreForTests,
} from '../../birthProfileStore';

const AARAV: BirthProfile = { name: 'Aarav', date: '1992-08-14', time: '05:42', cityId: 'ujjain' };
const MEERA: BirthProfile = { name: 'Meera', date: '1996-02-03', time: '19:10', cityId: 'jaipur' };
const UNNAMED: BirthProfile = { date: '2001-11-09', time: '06:00', cityId: 'varanasi' };

beforeEach(async () => {
  await AsyncStorage.clear();
  __resetBirthProfileStoreForTests();
});

// ---------------------------------------------------------------- pure model

test('the pure roster ops add-and-select, update in place, and cap the household', () => {
  let roster: ProfileRoster = EMPTY_ROSTER;
  expect(activePerson(roster)).toBeNull();

  roster = addPersonToRoster(roster, AARAV, 'p1');
  // Adding SELECTS: details you just entered are the ones you meant to read.
  expect(roster.activeId).toBe('p1');
  expect(activePerson(roster)?.name).toBe('Aarav');

  roster = addPersonToRoster(roster, MEERA, 'p2');
  expect(roster.activeId).toBe('p2');
  expect(roster.people.map((person) => person.id)).toEqual(['p1', 'p2']);

  roster = updatePersonInRoster(roster, 'p1', { ...AARAV, time: '06:00' });
  expect(roster.people[0].time).toBe('06:00');
  // An update must not move the selection.
  expect(roster.activeId).toBe('p2');

  // A blank name is dropped rather than stored as an empty string.
  roster = updatePersonInRoster(roster, 'p1', { ...AARAV, name: '   ' });
  expect(roster.people[0].name).toBeUndefined();

  // The cap holds and is not a silent drop — the roster comes back unchanged.
  let full: ProfileRoster = EMPTY_ROSTER;
  for (let index = 0; index < MAX_PEOPLE; index += 1) {
    full = addPersonToRoster(full, { ...AARAV, name: `P${index}` }, `id-${index}`);
  }
  expect(canAddPerson(full)).toBe(false);
  expect(addPersonToRoster(full, MEERA, 'overflow')).toBe(full);
});

test('removing the active person hands the selection to a survivor; the last one empties the roster', () => {
  let roster = addPersonToRoster(addPersonToRoster(EMPTY_ROSTER, AARAV, 'p1'), MEERA, 'p2');
  expect(roster.activeId).toBe('p2');

  roster = removePersonFromRoster(roster, 'p2');
  // Never left pointing at somebody who no longer exists.
  expect(roster.activeId).toBe('p1');
  expect(activePerson(roster)?.name).toBe('Aarav');

  roster = removePersonFromRoster(roster, 'p1');
  expect(roster).toEqual(EMPTY_ROSTER);
  expect(activePerson(roster)).toBeNull();
});

test('setActiveInRoster ignores an unknown id rather than unselecting everyone', () => {
  const roster = addPersonToRoster(EMPTY_ROSTER, AARAV, 'p1');
  expect(setActiveInRoster(roster, 'ghost')).toBe(roster);
  expect(activePerson(setActiveInRoster(roster, 'ghost'))?.name).toBe('Aarav');
});

test('parseStoredRoster drops individual bad entries, repairs a dangling activeId, and flags real corruption', () => {
  const good = { id: 'p1', ...AARAV };
  const raw = JSON.stringify({
    activeId: 'gone',
    people: [
      good,
      { id: 'p2', date: 'not-a-date', time: '05:00', cityId: 'ujjain' }, // invalid date
      { id: 'p3', date: '1990-01-01', time: '05:00', cityId: 'atlantis' }, // unknown city
      { date: '1990-01-01', time: '05:00', cityId: 'ujjain' }, // no id
      good, // duplicate id
    ],
  });
  const parsed = parseStoredRoster(raw);
  // One household member must not take the others down with them.
  expect(parsed.roster.people.map((person) => person.id)).toEqual(['p1']);
  expect(parsed.droppedInvalid).toBe(true);
  expect(parsed.unreadable).toBe(false);
  // A selection pointing at a person who is no longer there falls back to the first.
  expect(parsed.roster.activeId).toBe('p1');

  expect(parseStoredRoster('{not json').unreadable).toBe(true);
  expect(parseStoredRoster(JSON.stringify({ people: 'nope' })).unreadable).toBe(true);
  // Entries that all failed = corruption; an explicitly empty list is a real state.
  expect(parseStoredRoster(JSON.stringify({ people: [{ id: 'x', date: 'bad' }] })).unreadable).toBe(true);
  expect(parseStoredRoster(JSON.stringify({ activeId: null, people: [] })).unreadable).toBe(false);
  expect(parseStoredRoster(null).roster).toEqual(EMPTY_ROSTER);

  // Round trip.
  expect(parseStoredRoster(serializeRoster(parsed.roster)).roster).toEqual(parsed.roster);
});

// -------------------------------------------------------------------- store

test('a valid single profile migrates ONCE into the roster and the legacy key is removed', async () => {
  await AsyncStorage.setItem(LEGACY_BIRTH_PROFILE_STORAGE_KEY, JSON.stringify(AARAV));

  const state = await loadRoster();
  expect(state.hydrated).toBe(true);
  expect(state.error).toBe(false);
  expect(state.roster.people).toHaveLength(1);
  expect(activePerson(state.roster)?.name).toBe('Aarav');

  // Written under the roster key…
  const rosterRaw = await AsyncStorage.getItem(BIRTH_PROFILES_STORAGE_KEY);
  expect(rosterRaw).toBeTruthy();
  // …and the old copy is gone, so removing that person really removes their
  // birth details instead of leaving a readable duplicate on disk.
  expect(await AsyncStorage.getItem(LEGACY_BIRTH_PROFILE_STORAGE_KEY)).toBeNull();

  // Second process: the roster record is authoritative, no re-migration.
  __resetBirthProfileStoreForTests();
  const again = await loadRoster();
  expect(again.roster.people).toHaveLength(1);
  expect(again.roster.people[0].id).toBe(state.roster.people[0].id);
});

test('an UNREADABLE legacy profile is the recovery state and is never deleted', async () => {
  await AsyncStorage.setItem(LEGACY_BIRTH_PROFILE_STORAGE_KEY, '{"date":"not-a-date"}');

  const state = await loadRoster();
  expect(state.error).toBe(true);
  expect(state.roster).toEqual(EMPTY_ROSTER);
  // We do not destroy what we could not read.
  expect(await AsyncStorage.getItem(LEGACY_BIRTH_PROFILE_STORAGE_KEY)).toBe('{"date":"not-a-date"}');
});

test('the store publishes every mutation to its subscribers and persists what it publishes', async () => {
  const seen: number[] = [];
  const unsubscribe = subscribeRoster((next) => seen.push(next.roster.people.length));
  await loadRoster();

  const aarav = await addPerson(AARAV);
  const meera = await addPerson(MEERA);
  expect(aarav && meera).toBeTruthy();
  expect(getRosterSnapshot().roster.people).toHaveLength(2);
  expect(getRosterSnapshot().roster.activeId).toBe(meera!.id);
  expect(seen).toContain(2);

  await selectPerson(aarav!.id);
  expect(activePerson(getRosterSnapshot().roster)?.name).toBe('Aarav');

  // Everything published is on disk: a fresh process sees the same roster.
  const raw = await AsyncStorage.getItem(BIRTH_PROFILES_STORAGE_KEY);
  __resetBirthProfileStoreForTests();
  const reloaded = await loadRoster();
  expect(parseStoredRoster(raw).roster).toEqual(reloaded.roster);
  expect(activePerson(reloaded.roster)?.name).toBe('Aarav');

  unsubscribe();
});

test('saveActivePerson edits the person on screen instead of adding a duplicate', async () => {
  await addPerson(AARAV);
  const meera = await addPerson(MEERA);

  await saveActivePerson({ ...MEERA, time: '20:00' });
  const roster = getRosterSnapshot().roster;
  expect(roster.people).toHaveLength(2);
  expect(roster.people.find((person) => person.id === meera!.id)?.time).toBe('20:00');

  // With nobody saved yet it creates person one — the shipped single-profile path.
  __resetBirthProfileStoreForTests();
  await AsyncStorage.clear();
  await saveActivePerson(UNNAMED);
  expect(getRosterSnapshot().roster.people).toHaveLength(1);
  expect(activePerson(getRosterSnapshot().roster)?.name).toBeUndefined();
});

test('removeActivePerson falls back to a neighbour, and the last removal returns the guest state', async () => {
  const aarav = await addPerson(AARAV);
  await addPerson(MEERA);

  await removeActivePerson(); // Meera was active
  expect(getRosterSnapshot().roster.people).toHaveLength(1);
  expect(activePerson(getRosterSnapshot().roster)?.id).toBe(aarav!.id);

  await removeActivePerson();
  expect(getRosterSnapshot().roster).toEqual(EMPTY_ROSTER);
  // The guest state is a real stored state, not a missing record.
  expect(await AsyncStorage.getItem(BIRTH_PROFILES_STORAGE_KEY)).toBeTruthy();
});

test('concurrent mutations serialize — no update is lost to a read-modify-write race', async () => {
  await loadRoster();
  const results = await Promise.all([
    addPerson(AARAV),
    addPerson(MEERA),
    addPerson(UNNAMED),
  ]);
  expect(results.every(Boolean)).toBe(true);
  expect(getRosterSnapshot().roster.people).toHaveLength(3);
  // Distinct persisted ids (an id is a key; two people must never share one).
  expect(new Set(results.map((person) => person!.id)).size).toBe(3);

  const onDisk = parseStoredRoster(await AsyncStorage.getItem(BIRTH_PROFILES_STORAGE_KEY));
  expect(onDisk.roster.people).toHaveLength(3);
});

test('a failed write leaves the in-memory roster untouched and propagates', async () => {
  const person = await addPerson(AARAV);
  const before = getRosterSnapshot().roster;
  const setItem = AsyncStorage.setItem as jest.Mock;
  setItem.mockImplementationOnce(() => Promise.reject(new Error('disk full')));

  await expect(updatePerson(person!.id, { ...AARAV, time: '07:00' })).rejects.toThrow('disk full');
  // A save that did not land must not look like it did (RULEBOOK §14.4).
  expect(getRosterSnapshot().roster).toBe(before);

  // The queue survives the failure: the next mutation still works.
  await updatePerson(person!.id, { ...AARAV, time: '07:30' });
  expect(getRosterSnapshot().roster.people[0].time).toBe('07:30');
});

test('a transient read failure is NOT memoized — the next read still gets the roster', async () => {
  await AsyncStorage.setItem(BIRTH_PROFILES_STORAGE_KEY, serializeRoster(
    addPersonToRoster(EMPTY_ROSTER, AARAV, 'p1')
  ));
  const multiGet = AsyncStorage.multiGet as jest.Mock;
  multiGet.mockImplementationOnce(() => Promise.reject(new Error('storage offline')));

  const failed = await loadRoster();
  expect(failed.error).toBe(true);
  expect(failed.roster).toEqual(EMPTY_ROSTER);

  // Same session, deliberately WITHOUT a store reset: one bad read must not pin
  // the user to a guest state for the rest of the process.
  const recovered = await loadRoster();
  expect(recovered.error).toBe(false);
  expect(activePerson(recovered.roster)?.name).toBe('Aarav');
});

test('the roster is read in ONE round trip, together with the legacy key', async () => {
  const multiGet = AsyncStorage.multiGet as jest.Mock;
  multiGet.mockClear();
  await loadRoster();
  expect(multiGet).toHaveBeenCalledTimes(1);
  expect(multiGet.mock.calls[0][0]).toEqual([
    BIRTH_PROFILES_STORAGE_KEY,
    LEGACY_BIRTH_PROFILE_STORAGE_KEY,
  ]);
});

test('removePerson on an unknown id is a no-op that writes nothing', async () => {
  const person = await addPerson(AARAV);
  const setItem = AsyncStorage.setItem as jest.Mock;
  setItem.mockClear();
  await removePerson('ghost');
  expect(setItem).not.toHaveBeenCalled();
  expect(activePerson(getRosterSnapshot().roster)?.id).toBe(person!.id);
});
