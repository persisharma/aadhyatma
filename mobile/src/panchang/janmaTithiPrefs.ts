/**
 * जन्म तिथि reminder opt-ins (PRD-29 §3.5) — one boolean per roster person id.
 *
 * DELIBERATELY NOT a field on `@vedansh:kundali-profiles:v1`: that schema is
 * PRD-20's to migrate (round 1 §4 cross-cutting note — one migration, three
 * consumers), and the roster parser is a strict allow-list that would drop any
 * field this PRD smuggled in. A sibling key keeps the roster untouched.
 *
 * Default is OFF, opted into per person (PRD-29 §8.1): the shared iOS pending
 * budget is already over-subscribed in the worst case, so nothing here may
 * schedule without an explicit switch flip that survived the OS grant.
 *
 * Same storage rules as `birthProfileStore`: only a successful read is
 * memoized, writes are serialized, and a mutation publishes only after its
 * write lands. Ids whose person has left the roster are ignored by every
 * reader (the scheduler joins against the live roster) and pruned on the next
 * write, so removing a person removes their opt-in without a second delete
 * path to forget.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export const JANMA_TITHI_PREFS_KEY = '@vedansh:janma-tithi:v1';
const PAYLOAD_VERSION = 1;

export type JanmaPrefs = {
  /** Person ids whose birthday reminder is ON. Absence = off. */
  reminders: Readonly<Record<string, true>>;
};

export type JanmaPrefsState = {
  hydrated: boolean;
  prefs: JanmaPrefs;
};

const EMPTY_PREFS: JanmaPrefs = { reminders: {} };
const INITIAL_STATE: JanmaPrefsState = { hydrated: false, prefs: EMPTY_PREFS };

let state: JanmaPrefsState = INITIAL_STATE;
let loadPromise: Promise<JanmaPrefsState> | null = null;
let lastReadFailed = false;
let writeQueue: Promise<unknown> = Promise.resolve();
const listeners = new Set<(next: JanmaPrefsState) => void>();

function publish(next: JanmaPrefsState): void {
  state = next;
  listeners.forEach((listener) => listener(next));
}

export function getJanmaPrefsSnapshot(): JanmaPrefsState {
  return state;
}

export function subscribeJanmaPrefs(listener: (next: JanmaPrefsState) => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function parseJanmaPrefs(raw: string | null): JanmaPrefs {
  if (!raw) return EMPTY_PREFS;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return EMPTY_PREFS;
    const payload = parsed as { version?: unknown; reminders?: unknown };
    if (payload.version !== PAYLOAD_VERSION || !payload.reminders || typeof payload.reminders !== 'object') {
      return EMPTY_PREFS;
    }
    const reminders: Record<string, true> = {};
    for (const [id, value] of Object.entries(payload.reminders as Record<string, unknown>)) {
      if (id && value === true) reminders[id] = true;
    }
    return { reminders };
  } catch {
    return EMPTY_PREFS; // corrupted JSON — an opt-in is re-flippable, never worth a recovery state
  }
}

export function serializeJanmaPrefs(prefs: JanmaPrefs): string {
  return JSON.stringify({ version: PAYLOAD_VERSION, reminders: prefs.reminders });
}

/** Hydrate once per process. Only a successful read is memoized. */
export function loadJanmaPrefs(): Promise<JanmaPrefsState> {
  if (state.hydrated && !lastReadFailed) return Promise.resolve(state);
  if (!loadPromise) {
    loadPromise = AsyncStorage.getItem(JANMA_TITHI_PREFS_KEY)
      .then((raw) => {
        lastReadFailed = false;
        const next: JanmaPrefsState = { hydrated: true, prefs: parseJanmaPrefs(raw) };
        publish(next);
        return next;
      })
      .catch(() => {
        loadPromise = null;
        lastReadFailed = true;
        const next: JanmaPrefsState = { hydrated: true, prefs: EMPTY_PREFS };
        publish(next);
        return next;
      });
  }
  return loadPromise;
}

function mutate(transform: (prefs: JanmaPrefs) => JanmaPrefs): Promise<JanmaPrefs> {
  const run = async (): Promise<JanmaPrefs> => {
    await loadJanmaPrefs();
    const next = transform(state.prefs);
    if (next === state.prefs) return state.prefs;
    await AsyncStorage.setItem(JANMA_TITHI_PREFS_KEY, serializeJanmaPrefs(next));
    lastReadFailed = false;
    publish({ hydrated: true, prefs: next });
    return next;
  };
  const queued = writeQueue.then(run, run);
  writeQueue = queued.catch(() => undefined);
  return queued;
}

/**
 * Flip one person's opt-in. `livePersonIds` is the current roster — every write
 * prunes ids that have left it, so a removed person's preference does not
 * outlive their birth details.
 */
export async function setJanmaReminder(
  personId: string,
  enabled: boolean,
  livePersonIds: readonly string[]
): Promise<void> {
  const live = new Set(livePersonIds);
  await mutate((prefs) => {
    const reminders: Record<string, true> = {};
    for (const id of Object.keys(prefs.reminders)) {
      if (live.has(id) && id !== personId) reminders[id] = true;
    }
    if (enabled && live.has(personId)) reminders[personId] = true;
    const unchanged =
      Object.keys(reminders).length === Object.keys(prefs.reminders).length
      && Object.keys(reminders).every((id) => prefs.reminders[id] === true);
    return unchanged ? prefs : { reminders };
  });
}

export function __resetJanmaPrefsForTests(): void {
  state = INITIAL_STATE;
  loadPromise = null;
  lastReadFailed = false;
  writeQueue = Promise.resolve();
  listeners.clear();
}
