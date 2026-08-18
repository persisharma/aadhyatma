/**
 * Structured upvas/fasting content registry (PRD-09 Phase 4) — the accessor
 * over `upvasContent/entries/`, mirroring `kathaContent.ts`. RN-free by
 * construction (typed bundled data only) so `tsx --test` can import it.
 *
 * The one behavioural rule that matters: `getUpvasInfo` exposes VERIFIED
 * entries only. A `status: 'draft'` entry is indistinguishable from no entry
 * at every call site, so the उपवास विधि section stays absent — never a
 * placeholder — until the entry clears the two-concordant-source review
 * (PRD-09/P4 §8). Flipping `status` is a reviewed content change, not a code
 * change; automation passing never authorizes it.
 */
import type { UpvasInfoEntry } from './types';
import { UPVAS_CONTENT } from './upvasContent/index';

export { UPVAS_CONTENT };

/** The §8 gate predicate — exported so the registry filter is testable non-vacuously. */
export function isUpvasEntryExposed(entry: UpvasInfoEntry): boolean {
  return entry.status === 'verified';
}

const UPVAS_CONTENT_BY_ID: ReadonlyMap<string, UpvasInfoEntry> = new Map(
  UPVAS_CONTENT.map((item) => [item.id, item] as const)
);

/**
 * The entry for an `ObservanceRule.upvasId`, or null — null for unknown ids
 * AND for draft entries, so callers need zero status logic.
 */
export function getUpvasInfo(id: string): UpvasInfoEntry | null {
  const entry = UPVAS_CONTENT_BY_ID.get(id) ?? null;
  return entry && isUpvasEntryExposed(entry) ? entry : null;
}

(function assertUpvasContentInvariants() {
  const seen = new Set<string>();
  for (const item of UPVAS_CONTENT) {
    if (seen.has(item.id)) {
      throw new Error(`upvasContent: duplicate id '${item.id}'`);
    }
    seen.add(item.id);
    const pairs: [string, string, string][] = [
      ['fastTypeNote', item.fastTypeNoteHi, item.fastTypeNoteEn],
      ['window.text', item.window.textHi, item.window.textEn],
      ['strictness', item.strictnessHi, item.strictnessEn],
    ];
    if (item.parana) pairs.push(['parana.text', item.parana.textHi, item.parana.textEn]);
    for (const [field, hi, en] of pairs) {
      if (!hi.trim() || !en.trim()) {
        throw new Error(`upvasContent: ${item.id} has empty ${field}`);
      }
    }
    // whoObserves is optional but must be bilingual when present.
    if (Boolean(item.whoObservesHi?.trim()) !== Boolean(item.whoObservesEn?.trim())) {
      throw new Error(`upvasContent: ${item.id} has a one-sided whoObserves pair`);
    }
    if (item.parana) {
      const bound = item.parana.kind === 'next-day-sunrise-tithi-bound';
      if (bound && (item.parana.boundTithi === undefined || item.parana.boundTithi < 1 || item.parana.boundTithi > 15)) {
        throw new Error(`upvasContent: ${item.id} tithi-bound parana needs boundTithi in 1–15`);
      }
      if (!bound && item.parana.boundTithi !== undefined) {
        throw new Error(`upvasContent: ${item.id} carries boundTithi on a non-tithi-bound parana`);
      }
    }
    if (item.source.referenceUrls.length < 2) {
      throw new Error(`upvasContent: ${item.id} needs ≥2 reference URLs`);
    }
    if (!item.source.verificationNote.trim()) {
      throw new Error(`upvasContent: ${item.id} has no verification note`);
    }
  }
})();
