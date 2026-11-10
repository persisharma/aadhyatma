/**
 * Namkaran release gate (RULEBOOK §18.1 / §18.5).
 *
 * The namakshar convention (`NAMAKSHAR_SOURCE.verified`) and the name corpus
 * (`NAMKARAN_CORPUS.releaseEligible`) are both still unverified, and "any release
 * exposing the feature is blocked". Until both clear, every Namkaran door renders
 * only in development builds (`__DEV__`, which Maestro's Metro-served runs use), so
 * a production/TestFlight/OTA bundle never shows the feature.
 *
 * This module deliberately imports nothing: the doors live on the Panchang home,
 * and the corpus module must stay behind the lazy Namkaran screens (RULEBOOK §18.6).
 * `namkaranCorpus.test.ts` fails if this literal disagrees with the two source flags,
 * so flipping them without flipping this (or the reverse) cannot pass.
 */
export const NAMKARAN_RELEASED = false as boolean;

const isDevBuild = (): boolean => typeof __DEV__ !== 'undefined' && __DEV__;

/** Whether the Panchang/Jyotish surfaces may show a door into Namkaran. */
export function namkaranDoorVisible(isDev: boolean = isDevBuild()): boolean {
  return isDev || NAMKARAN_RELEASED;
}
