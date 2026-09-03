import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Vidhi state persistence (PRD-19 §5.1/§5.2), one AsyncStorage document at
 * `@vedansh/vidhi-checklist`:
 *
 * - samagri checklist state, keyed per vidhi per festival date — a fresh
 *   festival date starts a fresh checklist (last year's list must not come
 *   back pre-ticked);
 * - conduct resume state (last step index), keyed per vidhi per civil day —
 *   same-day re-entry offers "जहाँ थे वहीं से", tomorrow starts clean.
 *
 * Storage failures degrade to empty state — the checklist and resume are
 * conveniences, never gates.
 */

export const VIDHI_STATE_KEY = '@vedansh/vidhi-checklist';

export type VidhiPersistedState = {
  [vidhiId: string]: {
    samagri?: { dateKey: string; checked: string[] };
    conduct?: { dateKey: string; stepIndex: number };
  };
};

/** Local civil-day key, e.g. '2026-08-25'. */
export function vidhiDateKey(date: Date): string {
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

function parseState(raw: string | null): VidhiPersistedState {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as VidhiPersistedState;
    }
  } catch {
    // Corrupt document — start clean rather than crash the screen.
  }
  return {};
}

export async function loadVidhiState(): Promise<VidhiPersistedState> {
  try {
    return parseState(await AsyncStorage.getItem(VIDHI_STATE_KEY));
  } catch {
    return {};
  }
}

async function mutate(
  vidhiId: string,
  apply: (entry: VidhiPersistedState[string]) => VidhiPersistedState[string]
): Promise<void> {
  try {
    const state = parseState(await AsyncStorage.getItem(VIDHI_STATE_KEY));
    state[vidhiId] = apply(state[vidhiId] ?? {});
    await AsyncStorage.setItem(VIDHI_STATE_KEY, JSON.stringify(state));
  } catch {
    // Persistence is best-effort (see module doc).
  }
}

/** Checked samagri item ids for this vidhi ON this date; [] for any other date. */
export function samagriCheckedFor(
  state: VidhiPersistedState,
  vidhiId: string,
  dateKey: string
): string[] {
  const samagri = state[vidhiId]?.samagri;
  return samagri && samagri.dateKey === dateKey ? samagri.checked : [];
}

export async function saveSamagriChecked(
  vidhiId: string,
  dateKey: string,
  checked: string[]
): Promise<void> {
  await mutate(vidhiId, (entry) => ({ ...entry, samagri: { dateKey, checked } }));
}

/** Saved conduct step for this vidhi ON this civil day; null otherwise. */
export function conductStepFor(
  state: VidhiPersistedState,
  vidhiId: string,
  dateKey: string
): number | null {
  const conduct = state[vidhiId]?.conduct;
  return conduct && conduct.dateKey === dateKey ? conduct.stepIndex : null;
}

export async function saveConductStep(
  vidhiId: string,
  dateKey: string,
  stepIndex: number
): Promise<void> {
  await mutate(vidhiId, (entry) => ({ ...entry, conduct: { dateKey, stepIndex } }));
}

export async function clearConductStep(vidhiId: string): Promise<void> {
  await mutate(vidhiId, (entry) => ({ ...entry, conduct: undefined }));
}
