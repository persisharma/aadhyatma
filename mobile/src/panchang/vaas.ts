// चन्द्र वास and अग्नि वास — two traditional day readings shown on the Panchang
// tab. Pure, and derived only from the day's already-solved panchang: no engine
// entry point is reachable from here, because the card renders on the Panchang
// tab's scroll path (the same rule as `observanceDayNote.ts`).
//
// चन्द्र वास — the direction the Moon "resides" in, read from its rashi by
// element: fire signs (मेष, सिंह, धनु) पूर्व · earth (वृषभ, कन्या, मकर) दक्षिण ·
// air (मिथुन, तुला, कुम्भ) पश्चिम · water (कर्क, वृश्चिक, मीन) उत्तर. Consulted for
// travel: a Moon ahead of or to the right of the direction of travel is
// favourable, behind or to the left is not.
//
// अग्नि वास — where Agni resides today, read before a havan:
//   सैका तिथिर्वारयुता कृताप्ता शेषे गुणेऽभ्रे भुवि वह्निवासः।
//   सौख्याय होमे शशियुग्मशेषे प्राणार्थनाशौ दिवि भूतले च॥
// (tithi counted from शुक्ल प्रतिपदा = 1 … अमावस्या = 30) + 1 + (vara counted
// from रविवार = 1), divided by 4: remainder 3 or 0 ⇒ पृथ्वी (havan favourable);
// 1 ⇒ आकाश; 2 ⇒ पाताल (havan not advised).
//
// Sources (Sept 2026 check): the अग्नि वास count — tithi from शुक्ल प्रतिपदा,
// vara from रविवार, +1, ÷4, remainder 0/3 पृथ्वी · 1 आकाश · 2 पाताल — agrees
// across karmkandvidhi.in, hindimedia.in, sanskritmantr.in, vedicvidha and
// guleriajantri; चन्द्र वास matches the यात्रा verse “मेष सिंह धनु पूरब चन्दा …”
// (vastutapeshwar.com, jyotishshiksha); दिशा शूल the “सोम शनिचर पूरब न चालू”
// couplet. Moon-sign change times match published Delhi dailies to ~2 min
// (vaas.test.ts). No dated third-party अग्नि वास row was reachable to diff.
//
// Both readings change within the day — चन्द्र वास when the Moon changes rashi,
// अग्नि वास when the tithi ends — so each carries the sunrise reading, the
// instant it ends (null when it holds to the next sunrise), and what follows.
import { DISHA_LABELS, DISHA_SHOOL_BY_VARA, type DishaDirection } from './eventMuhurat';
import { RASHI_NAMES_EN, RASHI_NAMES_HI } from './names';
import type { PanchangData, PanchangElement } from './types';

export type Direction = 'east' | 'south' | 'west' | 'north';
export type AgniVaasPlace = 'prithvi' | 'akash' | 'patal';

type Label = { hi: string; en: string };

export const DIRECTION_LABELS: Record<Direction, Label> = {
  east: { hi: 'पूर्व', en: 'East' },
  south: { hi: 'दक्षिण', en: 'South' },
  west: { hi: 'पश्चिम', en: 'West' },
  north: { hi: 'उत्तर', en: 'North' },
};

export const AGNI_VAAS_LABELS: Record<AgniVaasPlace, Label & { favourableForHavan: boolean }> = {
  prithvi: { hi: 'पृथ्वी', en: 'Prithvi', favourableForHavan: true },
  akash: { hi: 'आकाश', en: 'Akash', favourableForHavan: false },
  patal: { hi: 'पाताल', en: 'Patal', favourableForHavan: false },
};

const DIRECTION_BY_ELEMENT: readonly Direction[] = ['east', 'south', 'west', 'north'];

/** Moon rashi index (Mesha = 0) → the direction चन्द्र वास names. */
export function chandraVaasDirection(moonRashiIndex: number): Direction {
  return DIRECTION_BY_ELEMENT[((moonRashiIndex % 12) + 12) % 12 % 4];
}

/**
 * Tithi index (0-based: 0 = शुक्ल प्रतिपदा … 29 = अमावस्या) and vara index
 * (0 = रविवार) → where Agni resides.
 */
export function agniVaasPlace(tithiIndex: number, varaIndex: number): AgniVaasPlace {
  const remainder = ((tithiIndex + 1) + 1 + (varaIndex + 1)) % 4;
  if (remainder === 1) return 'akash';
  if (remainder === 2) return 'patal';
  return 'prithvi';
}

export type VaasReading<T> = {
  /** The reading at sunrise. */
  value: T;
  /** When the sunrise reading ends; null when it holds to the next sunrise. */
  until: Date | null;
  /** The reading after `until`; null when `until` is null. */
  next: T | null;
};

export type DayVaas = {
  chandra: VaasReading<Direction>;
  agni: VaasReading<AgniVaasPlace>;
  /** दिशा शूल — keyed by vara, so it holds sunrise to sunrise. */
  dishaShool: DishaDirection;
};

/** The day's चन्द्र वास and अग्नि वास from its solved panchang. */
export function dayVaas(p: Pick<PanchangData, 'moonRashi' | 'tithi' | 'vara'>): DayVaas {
  const chandraUntil = p.moonRashi.endTime;
  const agniValue = agniVaasPlace(p.tithi.index, p.vara.index);
  // The vara holds sunrise to sunrise, so only the tithi moves अग्नि वास within
  // the day. A kshaya tithi would move it twice; the card names the first change.
  const agniNext = p.tithi.endTime ? agniVaasPlace((p.tithi.index + 1) % 30, p.vara.index) : null;
  return {
    chandra: {
      value: chandraVaasDirection(p.moonRashi.index),
      until: chandraUntil,
      next: chandraUntil ? chandraVaasDirection(p.moonRashi.index + 1) : null,
    },
    agni: {
      value: agniValue,
      until: agniNext !== null && agniNext !== agniValue ? p.tithi.endTime : null,
      next: agniNext !== null && agniNext !== agniValue ? agniNext : null,
    },
    // Same table the Muhurat Finder grades travel by, so the two never disagree.
    dishaShool: DISHA_SHOOL_BY_VARA[p.vara.index],
  };
}

/**
 * The four readings shaped for the day panel's यात्रा and हवन cards
 * (`DayVaasCards`): value, the instant it ends, and what follows. अग्नि वास
 * carries its havan verdict separately — it is the only question it answers.
 */
type VaasTile = {
  element: PanchangElement;
  successor: { nameHi: string; nameEn: string } | null;
  /** The havan verdict for the value (अग्नि वास only). */
  note?: Label;
  /** The havan verdict for the successor (अग्नि वास only; null without one). */
  nextNote?: Label | null;
};

/** हवन शुभ / वर्जित for a place Agni resides in. */
export function havanVerdict(place: AgniVaasPlace): Label {
  return AGNI_VAAS_LABELS[place].favourableForHavan
    ? { hi: 'हवन शुभ', en: 'havan favoured' }
    : { hi: 'हवन वर्जित', en: 'avoid havan' };
}

const labelEl = (l: Label, endTime: Date | null): PanchangElement => ({ index: 0, nameHi: l.hi, nameEn: l.en, endTime });
const successorOf = (l: Label | null) => (l ? { nameHi: l.hi, nameEn: l.en } : null);

export function vaasTiles(
  v: DayVaas,
  moonRashi: PanchangElement,
): { chandrama: VaasTile; chandra: VaasTile; agni: VaasTile; dishaShool: VaasTile } {
  const agni = AGNI_VAAS_LABELS[v.agni.value];
  const nextRashi = (moonRashi.index + 1) % 12;
  return {
    chandrama: {
      element: moonRashi,
      successor: moonRashi.endTime ? { nameHi: RASHI_NAMES_HI[nextRashi], nameEn: RASHI_NAMES_EN[nextRashi] } : null,
    },
    chandra: {
      element: labelEl(DIRECTION_LABELS[v.chandra.value], v.chandra.until),
      successor: successorOf(v.chandra.next ? DIRECTION_LABELS[v.chandra.next] : null),
    },
    agni: {
      element: labelEl(agni, v.agni.until),
      successor: successorOf(v.agni.next ? AGNI_VAAS_LABELS[v.agni.next] : null),
      note: havanVerdict(v.agni.value),
      nextNote: v.agni.next ? havanVerdict(v.agni.next) : null,
    },
    dishaShool: {
      element: labelEl(DISHA_LABELS[v.dishaShool], null),
      successor: null,
    },
  };
}
