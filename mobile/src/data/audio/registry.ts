import type { SectionAudio } from './types';
import { hanumanChalisaAudio } from '../hanuman-chalisa/audio';

/**
 * Maps a section `sourceId` to its bundled recitation. Adding audio for a new
 * section (v1.5.1 rollout: remaining chalisas + aartis) is a one-line entry
 * here plus the section's `audio.ts` and `.m4a` — no player code changes.
 */
const REGISTRY: Record<string, SectionAudio> = {
  'hanuman-chalisa': hanumanChalisaAudio,
};

/** All registered manifests, for invariant tests. */
export const allSectionAudio: readonly (readonly [string, SectionAudio])[] =
  Object.entries(REGISTRY);

/**
 * The bundled recitation for a section, or `null` when none is registered or
 * the asset has not been bundled yet. Callers must treat `null` as "no audio".
 */
export function getSectionAudio(sourceId: string): SectionAudio | null {
  const entry = REGISTRY[sourceId];
  return entry && entry.asset != null ? entry : null;
}
