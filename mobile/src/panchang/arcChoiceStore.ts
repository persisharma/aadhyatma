import AsyncStorage from '@react-native-async-storage/async-storage';

import { isArcDurationDays, type ArcChoiceRecord, type ArcChoices, type ArcDurationDays } from './arcs';

/**
 * The family's visarjan-duration choice (PRD-28 §Phase A), one AsyncStorage
 * document at `@vedansh/parv-arc`, keyed per arc per sthapana date — the
 * SAME occurrence-scoped shape `data/vidhi/checklistStore.ts` uses for the
 * samagri checklist and PRD-23's grocery ledger: a fresh festival year starts
 * with no choice (last year's ten days must not bind this year's arc).
 *
 * Storage failures degrade to "no choice", which is exactly today's behaviour
 * (independent days) — the choice is a convenience, never a gate. The module
 * keeps an in-memory snapshot + listeners (the `observanceStore` pattern) so
 * the headless vrat-reminder scheduler can re-arm when a choice changes.
 */

export const ARC_CHOICE_KEY = '@vedansh/parv-arc';

export type ArcChoiceState = { [arcId: string]: ArcChoiceRecord };

const listeners = new Set<() => void>();
let snapshot: ArcChoiceState | null = null;

function publish(next: ArcChoiceState): void {
  snapshot = next;
  listeners.forEach((listener) => listener());
}

export function parseArcChoices(raw: string | null): ArcChoiceState {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const out: ArcChoiceState = {};
    for (const [arcId, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (!value || typeof value !== 'object') continue;
      const { dateKey, durationDays } = value as { dateKey?: unknown; durationDays?: unknown };
      if (typeof dateKey !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) continue;
      if (!isArcDurationDays(durationDays)) continue;
      out[arcId] = { dateKey, durationDays };
    }
    return out;
  } catch {
    // Corrupt document — start clean rather than crash the screen.
    return {};
  }
}

/** The last loaded/saved state, or null before the first hydrate. */
export function getArcChoicesSnapshot(): ArcChoiceState | null {
  return snapshot;
}

export function subscribeArcChoices(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function loadArcChoices(): Promise<ArcChoiceState> {
  try {
    const state = parseArcChoices(await AsyncStorage.getItem(ARC_CHOICE_KEY));
    publish(state);
    return state;
  } catch {
    publish({});
    return {};
  }
}

async function mutate(apply: (state: ArcChoiceState) => ArcChoiceState): Promise<void> {
  try {
    const state = apply(parseArcChoices(await AsyncStorage.getItem(ARC_CHOICE_KEY)));
    await AsyncStorage.setItem(ARC_CHOICE_KEY, JSON.stringify(state));
    publish(state);
  } catch {
    // Persistence is best-effort (see module doc).
  }
}

/** The chosen duration for this arc ON this sthapana date; null for any other date or no choice. */
export function arcChoiceFor(state: ArcChoices | null, arcId: string, dateKey: string): ArcDurationDays | null {
  const record = state?.[arcId];
  return record && record.dateKey === dateKey ? record.durationDays : null;
}

export async function saveArcChoice(arcId: string, dateKey: string, durationDays: ArcDurationDays): Promise<void> {
  await mutate((state) => ({ ...state, [arcId]: { dateKey, durationDays } }));
}

/** "Decide later" — removes the choice; the arc degrades to independent days. */
export async function clearArcChoice(arcId: string): Promise<void> {
  await mutate((state) => {
    const next = { ...state };
    delete next[arcId];
    return next;
  });
}
