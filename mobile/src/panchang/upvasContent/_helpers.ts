import type { UpvasInfoEntry } from '../types';

/**
 * Shared draft-stage verification preamble (PRD-09/P4 §8). Every entry authored
 * on 2026-08-18 carries it: the two-concordant-source reading could not be
 * performed because this authoring environment has no content egress — direct
 * fetches to drikpanchang.com and archive.org were refused by the network
 * egress proxy (403 CONNECT, dated 2026-08-18, same blocker PRD-19 Phase 3
 * records for 2026-08-12/14); only search-index snippets were reachable, which
 * do not meet the full-source reading gate. Facts are transcribed from widely
 * published convention and must be re-verified row-by-row against DrikPanchang
 * plus a Gita Press reference (Vrat-Parichay / Kalyan annuals) before `status`
 * flips to 'verified'. Review metadata only — never rendered.
 */
export const DRAFT_EGRESS_NOTE =
  'DRAFT — unverified. Authored 2026-08-18 in a no-content-egress environment ' +
  '(drikpanchang.com and archive.org refused by the egress proxy, 403 CONNECT, 2026-08-18; ' +
  'search-index snippets only). Re-verify every row against DrikPanchang + Gita Press ' +
  'Vrat-Parichay/Kalyan before flipping to verified. ';

/** Identity helper so entry modules get literal-type checking + a uniform shape. */
export function upvasEntry(entry: UpvasInfoEntry): UpvasInfoEntry {
  return entry;
}
