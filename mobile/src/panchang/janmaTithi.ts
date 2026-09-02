// जन्म तिथि (PRD-29 Part A) — pure derivations for the tithis of the LIVING.
//
// Deliberately ZERO new engine work: a person's janma tithi is
// `deriveTithiRuleFromDate` over the birth date already saved in the Kundali
// roster (#294), and every date answer comes from the same solve path Pitru
// Smaran ships (`solveNextOccurrence` via the persisted `pitruSmaranSolves`
// layer — tithi-keyed, person-free, so a janma tithi and a shraddha tithi on
// the same rule genuinely share one record).
//
// Convention (stated on the detail screen, pinned in the PRD): the janma tithi
// is the SUNRISE tithi of the birth civil date (udaya-vyapini, Ujjain /
// purnimant) — identical to how PRD-17 derives a rule from a civil death date
// and how festivals.ts authors every rule. The birth time does not refine the
// tithi in v1; it is used only for the janma nakshatra line.
//
// RN-free and React-free (tested via `tsx --test`). Hooks live in
// `useJanmaTithi.ts`; the reminder opt-in store lives in `janmaTithiPrefs.ts`.

import { getSiderealPlanetLongitude, NAKSHATRA_SPAN } from './kundali';
import { NAKSHATRA_NAMES_EN, NAKSHATRA_NAMES_HI } from './names';
import { deriveTithiRuleFromDate, type TithiRule } from './pitruSmaran';
import type { BirthProfile } from './birthProfiles';

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
const IST_OFFSET_MINUTES = 330;

/**
 * The janma tithi rule for a roster person's stored birth date (`YYYY-MM-DD`,
 * an IST civil date by the roster's contract). Null when the string does not
 * parse or the engine cannot place the day — a bad record must never take a
 * screen down.
 */
export function janmaTithiRuleFromBirthDate(birthDate: string): TithiRule | null {
  const match = DATE_PATTERN.exec(birthDate);
  if (!match) return null;
  const [, year, month, day] = match;
  const civil = new Date(Number(year), Number(month) - 1, Number(day));
  if (
    civil.getFullYear() !== Number(year)
    || civil.getMonth() !== Number(month) - 1
    || civil.getDate() !== Number(day)
  ) {
    return null;
  }
  try {
    return deriveTithiRuleFromDate(civil);
  } catch {
    return null;
  }
}

/**
 * 0-based nakshatra index (0 = अश्विनी … 26 = रेवती) of the Moon at the stored
 * IST birth date + time — the janma nakshatra line on the detail screen. Uses
 * the same Lahiri Moon-longitude primitive Kundali/Guna Milan/Namkaran share;
 * place is irrelevant because the Moon's longitude at an instant is geocentric.
 */
export function janmaNakshatraIndex(profile: Pick<BirthProfile, 'date' | 'time'>): number | null {
  const dateMatch = DATE_PATTERN.exec(profile.date);
  const timeMatch = TIME_PATTERN.exec(profile.time);
  if (!dateMatch || !timeMatch) return null;
  const [, year, month, day] = dateMatch;
  const [, hour, minute] = timeMatch;
  const instant = new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute))
    - IST_OFFSET_MINUTES * 60_000
  );
  if (Number.isNaN(instant.getTime())) return null;
  try {
    const longitude = getSiderealPlanetLongitude('moon', instant);
    const index = Math.floor(((longitude % 360) + 360) % 360 / NAKSHATRA_SPAN);
    return Math.min(index, 26);
  } catch {
    return null;
  }
}

export function nakshatraName(index: number, lang: 'hi' | 'en'): string {
  const names = lang === 'hi' ? NAKSHATRA_NAMES_HI : NAKSHATRA_NAMES_EN;
  return names[index] ?? '';
}
