/**
 * The birth-profile ROSTER — "whose chart am I looking at" (multi-person Jyotish).
 *
 * WHY THIS EXISTS. PRD-C shipped exactly one birth profile per device, so a
 * household sharing a phone could hold only one person's Kundali, Rashifal and
 * personalised muhurat strip at a time; adding a second person meant overwriting
 * the first. This module turns that single record into a roster of people plus
 * ONE active selection, which every personalised surface reads. It is the single
 * source of truth for that question: no screen may keep its own "current person".
 *
 * PURE — no AsyncStorage, no React, no wall clock, no id generation. Every
 * operation takes a roster and returns a new one (ids are supplied by the
 * caller), so the whole state machine is testable without a storage mock. The
 * persistence half lives in `birthProfileStore.ts` — the same split as
 * `panchangDayStore` (RN-free) ⇄ `panchangDayCache` (AsyncStorage).
 *
 * A `PersonProfile.id` is a PERSISTED KEY, never a display string: it is written
 * to `@vedansh:kundali-profiles:v1` and is what `activeId` points at. Never
 * rewrite ids for cosmetic reasons — that silently unselects the user's person.
 */
import { getCityById } from './locations';
import type { KundaliInput } from './kundali';

/** One person's birth details. Unchanged from the single-profile record. */
export type BirthProfile = {
  name?: string;
  date: string;
  time: string;
  cityId: string;
};

/** A saved person: birth details plus the persisted identity the roster points at. */
export type PersonProfile = BirthProfile & { id: string };

export type ProfileRoster = {
  /** The person every personalised surface follows. Null only when `people` is empty. */
  activeId: string | null;
  people: readonly PersonProfile[];
};

export type BirthProfileErrors = Partial<Record<'date' | 'time' | 'cityId', string>>;

/**
 * A household ceiling, not a technical one: the roster is read on the Jyotish
 * landing and every chip is a control, so beyond this the switcher stops being a
 * switcher. `addPersonToRoster` returns the roster unchanged at the cap and the
 * UI says so rather than silently dropping the save.
 */
export const MAX_PEOPLE = 8;

export const EMPTY_ROSTER: ProfileRoster = { activeId: null, people: [] };

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

/** Trim the optional name away entirely rather than storing an empty string. */
export function normalizeBirthProfile(profile: BirthProfile): BirthProfile {
  return {
    date: profile.date,
    time: profile.time,
    cityId: profile.cityId,
    ...(profile.name?.trim() ? { name: profile.name.trim() } : {}),
  };
}

/**
 * Parse the LEGACY single-profile record (`@vedansh:kundali-birth-profile:v1`).
 * Still exported because it is the migration input and because a corrupt legacy
 * record must stay distinguishable from an absent one.
 */
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
    const profile = normalizeBirthProfile({
      date: candidate.date,
      time: candidate.time,
      cityId: candidate.cityId,
      ...(candidate.name !== undefined ? { name: candidate.name } : {}),
    });
    return Object.keys(validateBirthProfile(profile)).length === 0 ? profile : null;
  } catch {
    return null;
  }
}

export type ParsedRoster = {
  roster: ProfileRoster;
  /** True when the record itself was unreadable — the caller shows the error state. */
  unreadable: boolean;
  /** True when at least one entry was dropped as invalid but others survived. */
  droppedInvalid: boolean;
};

/**
 * Rebuild the roster from disk. Invalid PEOPLE are dropped individually (a
 * renamed city id or a half-written entry must not take the whole household with
 * it), but a record that will not parse at all — or that parses to nothing usable
 * while claiming entries — reports `unreadable`, so a corrupt store still shows
 * the recovery state instead of pretending the user is a guest (RULEBOOK §14.4:
 * failed persistence stays visible and recoverable).
 */
export function parseStoredRoster(raw: string | null): ParsedRoster {
  if (!raw) return { roster: EMPTY_ROSTER, unreadable: false, droppedInvalid: false };
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { roster: EMPTY_ROSTER, unreadable: true, droppedInvalid: false };
  }
  const record = parsed as { activeId?: unknown; people?: unknown } | null;
  if (!record || typeof record !== 'object' || !Array.isArray(record.people)) {
    return { roster: EMPTY_ROSTER, unreadable: true, droppedInvalid: false };
  }
  const seen = new Set<string>();
  const people: PersonProfile[] = [];
  let dropped = 0;
  for (const entry of record.people) {
    const candidate = entry as Partial<PersonProfile> | null;
    if (!candidate || typeof candidate !== 'object' || typeof candidate.id !== 'string' || !candidate.id) {
      dropped += 1;
      continue;
    }
    if (seen.has(candidate.id)) {
      dropped += 1;
      continue;
    }
    const profile = parseStoredBirthProfile(
      JSON.stringify({
        date: candidate.date,
        time: candidate.time,
        cityId: candidate.cityId,
        ...(candidate.name !== undefined ? { name: candidate.name } : {}),
      })
    );
    if (!profile) {
      dropped += 1;
      continue;
    }
    seen.add(candidate.id);
    people.push({ id: candidate.id, ...profile });
  }
  if (people.length === 0) {
    return {
      roster: EMPTY_ROSTER,
      // An empty roster on disk is a real state (the user removed everyone);
      // an entry list that produced nothing usable is corruption.
      unreadable: record.people.length > 0,
      droppedInvalid: false,
    };
  }
  const activeId =
    typeof record.activeId === 'string' && people.some((person) => person.id === record.activeId)
      ? record.activeId
      : people[0].id;
  return { roster: { activeId, people }, unreadable: false, droppedInvalid: dropped > 0 };
}

export function serializeRoster(roster: ProfileRoster): string {
  return JSON.stringify({ activeId: roster.activeId, people: roster.people });
}

/** The person every personalised surface follows, or null while the roster is empty. */
export function activePerson(roster: ProfileRoster): PersonProfile | null {
  if (!roster.activeId) return roster.people[0] ?? null;
  return roster.people.find((person) => person.id === roster.activeId) ?? roster.people[0] ?? null;
}

export function canAddPerson(roster: ProfileRoster): boolean {
  return roster.people.length < MAX_PEOPLE;
}

/** Adds and SELECTS — a person you just entered details for is the one you meant to read. */
export function addPersonToRoster(
  roster: ProfileRoster,
  profile: BirthProfile,
  id: string
): ProfileRoster {
  if (!canAddPerson(roster) || roster.people.some((person) => person.id === id)) return roster;
  const person: PersonProfile = { id, ...normalizeBirthProfile(profile) };
  return { activeId: id, people: [...roster.people, person] };
}

export function updatePersonInRoster(
  roster: ProfileRoster,
  id: string,
  profile: BirthProfile
): ProfileRoster {
  if (!roster.people.some((person) => person.id === id)) return roster;
  return {
    activeId: roster.activeId,
    people: roster.people.map((person) =>
      person.id === id ? { id, ...normalizeBirthProfile(profile) } : person
    ),
  };
}

/**
 * Removing the active person hands the selection to a REMAINING neighbour rather
 * than leaving the app pointed at a person who no longer exists — the last one
 * removed correctly leaves an empty roster and the guest state.
 */
export function removePersonFromRoster(roster: ProfileRoster, id: string): ProfileRoster {
  const people = roster.people.filter((person) => person.id !== id);
  if (people.length === roster.people.length) return roster;
  if (people.length === 0) return EMPTY_ROSTER;
  const activeId = roster.activeId === id ? people[0].id : roster.activeId;
  return { activeId, people };
}

export function setActiveInRoster(roster: ProfileRoster, id: string): ProfileRoster {
  if (!roster.people.some((person) => person.id === id) || roster.activeId === id) return roster;
  return { activeId: id, people: roster.people };
}

/** The one-shot legacy shape: the single saved profile becomes person one, selected. */
export function rosterFromLegacyProfile(profile: BirthProfile, id: string): ProfileRoster {
  return { activeId: id, people: [{ id, ...normalizeBirthProfile(profile) }] };
}
