import type { TempleDetail } from '../temples';

/**
 * Extended §12.6 readings — Northern Vaishnava shrines.
 *
 * One chunk file per enrichment session (RULEBOOK §12.6, "one temple at a
 * time"): each file is owned by exactly one authoring pass so parallel waves
 * never collide in the same module. Entries here REPLACE the legacy two-line
 * detail carried inline in `temples.ts` — supply the whole `TempleDetail`
 * (expanded significance + origin story, `sources` ≥ 2, and the five fixed
 * sections in order: sthapana, svarup, parampara, mela, yatra).
 *
 * Temples still to author in this chunk: banke-bihari srinathji vishnupad-gaya lakshmi-narayan
 */
export const details: Record<string, TempleDetail> = {};
