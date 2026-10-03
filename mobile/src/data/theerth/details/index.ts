import type { TempleDetail } from '../temples';

import { details as charDham } from './charDham';
import { details as jyotirlingaA } from './jyotirlingaA';
import { details as jyotirlingaB } from './jyotirlingaB';
import { details as jyotirlingaC } from './jyotirlingaC';
import { details as northShaktiA } from './northShaktiA';
import { details as northShaktiB } from './northShaktiB';
import { details as northeast } from './northeast';
import { details as regional } from './regional';
import { details as shaktiPeethA } from './shaktiPeethA';
import { details as shaktiPeethB } from './shaktiPeethB';
import { details as shaktiPeethC } from './shaktiPeethC';
import { details as shaktiPeethD } from './shaktiPeethD';
import { details as southIconsA } from './southIconsA';
import { details as southIconsB } from './southIconsB';
import { details as vaishnavaNorth } from './vaishnavaNorth';

/**
 * Extended per-temple readings (RULEBOOK §12.6) authored after the September
 * 2026 rollout decision, kept out of `temples.ts` so each enrichment session
 * owns one small module and concurrent waves never edit the same file.
 *
 * `temples.ts` spreads these over the inline `templeDetails` map, so a chunk
 * entry replaces the legacy two-line detail for that id wholesale.
 */
export const extendedDetails: Record<string, TempleDetail> = {
  ...jyotirlingaA,
  ...jyotirlingaB,
  ...jyotirlingaC,
  ...charDham,
  ...northShaktiA,
  ...northShaktiB,
  ...southIconsA,
  ...southIconsB,
  ...vaishnavaNorth,
  ...shaktiPeethA,
  ...shaktiPeethB,
  ...shaktiPeethC,
  ...shaktiPeethD,
  ...northeast,
  ...regional,
};
