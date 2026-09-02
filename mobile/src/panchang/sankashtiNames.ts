/**
 * Per-lunation Sankashti Chaturthi names (dṛk convention). One rule
 * (`sankashti-chaturthi-vrat`) resolves all ~13 yearly occurrences, but each
 * lunation's vrat has its own published name honouring a specific Ganapati
 * form — the Bhadrapada one is हेरम्ब संकष्टी (Heramba), the Magha one is
 * लम्बोदर (Lambodara, the Sakat Chauth day), an adhik-maas one is always
 * विभुवन (Vibhuvana) — and a Tuesday occurrence is additionally अंगारकी
 * (Angarki), the most sought-after Sankashti. The generic rule name told a
 * user on 31 Aug 2026 nothing about it being the big Heramba day (Aug 2026
 * report), so the day card titles the occurrence, not the rule.
 *
 * Names are keyed by the occurrence day's PURNIMANT lunar month — always
 * purnimant, whatever the user's calendar-system setting, because the table is
 * month-keyed the way the published lists are (the same normalisation
 * chaturmas uses). The sunrise month is safe here: a chaturthi sits days from
 * either month boundary.
 */
import { computeTithiAndMonth } from './engine';
import type { GeoLocation } from './types';

export type SankashtiOccurrenceName = {
  /** e.g. "हेरम्ब संकष्टी चतुर्थी" */
  nameHi: string;
  /** e.g. "Heramba Sankashti Chaturthi" */
  nameEn: string;
  /** Tuesday occurrence — additionally अंगारकी चतुर्थी. */
  isAngarki: boolean;
};

// Index = purnimant lunar month − 1 (1 = Chaitra … 12 = Phalguna).
const GANAPATI_HI = ['भालचन्द्र', 'विकट', 'एकदन्त', 'कृष्णपिंगल', 'गजानन', 'हेरम्ब', 'विघ्नराज', 'वक्रतुण्ड', 'गणाधिप', 'आखुरथ', 'लम्बोदर', 'द्विजप्रिय'];
const GANAPATI_EN = ['Bhalachandra', 'Vikata', 'Ekadanta', 'Krishnapingala', 'Gajanana', 'Heramba', 'Vighnaraja', 'Vakratunda', 'Ganadhipa', 'Akhuratha', 'Lambodara', 'Dwijapriya'];
const ADHIK_HI = 'विभुवन';
const ADHIK_EN = 'Vibhuvana';

/**
 * The published name of the Sankashti occurrence RESOLVED to `date` by the
 * festival engine. Callers pass a resolved occurrence day, never re-match the
 * tithi here. Location may be omitted (Ujjain default): the lunar month at
 * sunrise does not move between Indian cities at this granularity.
 */
export function sankashtiOccurrenceName(date: Date, location?: GeoLocation & { cityId?: string }): SankashtiOccurrenceName {
  const { lunarMonth, isAdhik } = computeTithiAndMonth(date, { calendarSystem: 'purnimant', location });
  const hi = isAdhik ? ADHIK_HI : GANAPATI_HI[lunarMonth - 1];
  const en = isAdhik ? ADHIK_EN : GANAPATI_EN[lunarMonth - 1];
  return {
    nameHi: `${hi} संकष्टी चतुर्थी`,
    nameEn: `${en} Sankashti Chaturthi`,
    isAngarki: date.getDay() === 2,
  };
}
