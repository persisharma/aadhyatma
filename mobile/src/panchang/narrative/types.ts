/**
 * Shared types for the narrative-voice graha readings (design.md §78).
 *
 * One module per graha (`narrative/<graha>.ts`) exports its 12-house × 4-bucket
 * table and its modifier clauses, both typed here. `grahaReadingNarrative.ts`
 * assembles them and exposes `composeNarrative`. Kept a leaf (types + the pure
 * bucket map only) so the per-graha modules never cycle through the assembler.
 */

import type { Dignity, Maitri } from '../kundaliBasis';

/**
 * The engine's dignity (exalted/own/debilitated/neutral) and sign-relation
 * (friend/enemy/neutral) collapse to four authoring buckets. A strong bucket
 * reads as the graha's gift delivered; a weak bucket as the gift earned the
 * hard way. The nodes have no dignity, so they only ever reach `neutral`.
 */
export type DignityBucket = 'strong' | 'friendly' | 'neutral' | 'weak';

export function dignityBucket(dignity: Dignity, relation: Maitri | null): DignityBucket {
  if (dignity === 'exalted' || dignity === 'own') return 'strong';
  if (dignity === 'debilitated') return 'weak';
  if (relation === 'friend') return 'friendly';
  if (relation === 'enemy') return 'weak';
  return 'neutral';
}

export type NarrativeCell = {
  leadHi: string;
  leadEn: string;
  tendHi: string;
  tendEn: string;
};

/** One graha's reading: a cell per house (index 0 = 1st) for each dignity bucket. */
export type GrahaNarrativeTable = readonly Record<DignityBucket, NarrativeCell>[];

/** The lordship clause slots the ruled-house label built by the composer. */
export type LordshipClause = { hi: (houses: string) => string; en: (houses: string) => string };
export type FixedClause = { hi: string; en: string };

/**
 * Chart-specific sentences appended to the core reading. Every field is
 * optional: the Sun is never combust or retrograde; the nodes rule nothing and
 * carry none of these.
 */
export type GrahaModifiers = {
  lordship?: LordshipClause;
  combust?: FixedClause;
  retrograde?: FixedClause;
};

/**
 * A node (Rahu/Ketu) has no dignity, so only `neutral` is ever reached. Author
 * one reading per house and share it across the four buckets to satisfy the
 * table shape without pretending the nodes vary by strength.
 */
export function nodeCell(cell: NarrativeCell): Record<DignityBucket, NarrativeCell> {
  return { strong: cell, friendly: cell, neutral: cell, weak: cell };
}
