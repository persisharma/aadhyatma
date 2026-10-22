import { getRuleById } from '@/panchang/vratCatalog';
import type { VidhiEntry } from './types';

/**
 * Add-to-routine is offered for RECURRING vidhis only (PRD-19 Phase 2B): a
 * monthly observance (Satyanarayan on every purnima) belongs in a routine; an
 * annual festival puja does not. Shared by the catalog row's ＋ and the detail
 * screen's header button so the two never disagree.
 */
export function isRecurringVidhi(vidhi: Pick<VidhiEntry, 'festivalIds'>): boolean {
  return vidhi.festivalIds.some((festivalId) => getRuleById(festivalId)?.recurrence === 'monthly');
}
