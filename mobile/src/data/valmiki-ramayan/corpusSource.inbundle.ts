/**
 * Where a kāṇḍa's verses come from — the IN-BUNDLE delivery.
 *
 * Metro answers the corpus module's `./corpusSource` with this file when the
 * app is bundled for a runtime whose store binary does NOT embed the corpus
 * part files (`mobile/corpusDelivery.js`). The kāṇḍa masters are then compiled
 * into the JS bundle and required on first use, exactly as they were before
 * November 2026 — so an OTA from the latest branch needs nothing from an older
 * build that the build does not have.
 *
 * This is the ONE app module allowed to require a kāṇḍa master
 * (`src/data/__tests__/valmikiAssets.test.ts`), and nothing may import it by
 * name: it exists only as Metro's alternative answer. Keep its exports
 * identical to `corpusSource.ts`.
 */
import type { KandaPartsReader } from './corpusSource';

type Master = { verses: unknown[] };

const MASTERS: readonly (() => Master)[] = [
  () => require('./chapter-01.json') as Master,
  () => require('./chapter-02.json') as Master,
  () => require('./chapter-03.json') as Master,
  () => require('./chapter-04.json') as Master,
  () => require('./chapter-05.json') as Master,
  () => require('./chapter-06.json') as Master,
  () => require('./chapter-07.json') as Master,
];

/** Which delivery this bundle was built with. */
export const valmikiCorpusDelivery: 'assets' | 'bundle' = 'bundle';

/**
 * A master arrives whole, but it is still handed on in pieces, so the corpus
 * module checks it with the thread given back between them, as it does parts.
 */
const VERSES_PER_PIECE = 400;

export const readKandaParts: KandaPartsReader = async (chapter, onPart) => {
  const { verses } = MASTERS[chapter - 1]();
  for (let firstVerse = 0; firstVerse < verses.length; firstVerse += VERSES_PER_PIECE) {
    const piece = verses.slice(firstVerse, firstVerse + VERSES_PER_PIECE);
    await onPart(piece, { firstVerse, verseCount: piece.length });
  }
};
