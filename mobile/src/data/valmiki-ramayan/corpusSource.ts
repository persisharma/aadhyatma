/**
 * Where a kāṇḍa's verses come from — the ASSET delivery.
 *
 * The corpus module (`index.ts`) asks this module for a kāṇḍa and does the
 * validating, the meaning fallback and the caching itself, so those are the
 * same whichever delivery the app was bundled with.
 *
 * There are two answers to `./corpusSource`, chosen when the app is BUNDLED
 * (`mobile/corpusDelivery.js`, applied in `mobile/metro.config.js`), never at
 * runtime:
 *
 *   - this file, for a runtime whose store binary embeds the part files;
 *   - `corpusSource.inbundle.ts`, for every older runtime — the kāṇḍa masters
 *     compiled into the JS bundle, as they were before November 2026.
 *
 * Nothing may import `corpusSource.inbundle` by name. TypeScript and Jest
 * resolve `./corpusSource` to this file.
 */
import { valmikiParts } from './parts';
import { readValmikiPart } from './partReader';

export type KandaPart = {
  /** How many verses of the kāṇḍa come before this piece. */
  firstVerse: number;
  verseCount: number;
};

/**
 * Hand the verses of kāṇḍa `chapter` to `onPart`, in reading order, a piece at
 * a time. `verses` is whatever the source held — the caller checks it.
 */
export type KandaPartsReader = (
  chapter: number,
  onPart: (verses: unknown, part: KandaPart) => Promise<void>
) => Promise<void>;

/** Which delivery this bundle was built with. */
export const valmikiCorpusDelivery: 'assets' | 'bundle' = 'assets';

/** How many part files are read from disk at once. They are handed on one at a time. */
const READ_CONCURRENCY = 4;

export const readKandaParts: KandaPartsReader = async (chapter, onPart) => {
  const parts = valmikiParts[chapter - 1];
  for (let at = 0; at < parts.length; at += READ_CONCURRENCY) {
    const batch = parts.slice(at, at + READ_CONCURRENCY);
    const texts = await Promise.all(batch.map((part) => readValmikiPart(part.source)));
    for (let i = 0; i < texts.length; i += 1) {
      await onPart(JSON.parse(texts[i]), batch[i]);
    }
  }
};
