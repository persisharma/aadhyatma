/**
 * अबूझ मुहूर्त — days auspicious in their entirety, needing no panchang
 * shuddhi (PRD-16 Phase 1, "Special auspicious days").
 *
 * Festival-anchored abujh days are a RE-PROJECTION of rules that already ship
 * in festivals.ts, resolved through the festival engine — never re-implement
 * tithi matching here (the engine owns kshaya fallback and vriddhi dedupe;
 * a naive re-match duplicated Akshaya Navami across 18/19 Nov 2026).
 * The one computed addition is Guru/Ravi Pushya yoga (Pushya nakshatra on a
 * Thursday/Sunday), a pure per-day check the caller runs on panchang data it
 * already holds.
 */
import type { PanchangData } from './types';

/** ObservanceRule ids (festivals.ts) whose day is traditionally abujh. */
export const ABUJH_RULE_IDS: readonly string[] = [
  'akshaya-tritiya',
  'vasant-panchami',
  'dussehra',
  'dhanteras',
  'akshaya-navami',
  'dev-uthani-ekadashi',
];

const PUSHYA = 7;

export type PushyaYoga = { kind: 'guru-pushya' | 'ravi-pushya'; nameHi: string; nameEn: string };

/** Pushya nakshatra at sunrise on a Thursday/Sunday → Guru/Ravi Pushya yoga. */
export function pushyaYogaFor(p: PanchangData, weekday: number): PushyaYoga | null {
  if (p.nakshatra.index !== PUSHYA) return null;
  if (weekday === 4) return { kind: 'guru-pushya', nameHi: 'गुरु पुष्य योग', nameEn: 'Guru Pushya Yoga' };
  if (weekday === 0) return { kind: 'ravi-pushya', nameHi: 'रवि पुष्य योग', nameEn: 'Ravi Pushya Yoga' };
  return null;
}
