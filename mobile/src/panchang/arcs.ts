/**
 * पर्व-अर्क — festival arcs, स्थापना → विसर्जन (PRD-28).
 *
 * The biggest festivals are not days. Ganesh is installed on Chaturthi and the
 * FAMILY decides its visarjan — 1½, 3, 5, 7 or 10 days — so the concluding
 * date depends on that choice and cannot be a static calendar entry. Navratri
 * runs ghatasthapana → Vijayadashami; Diwali is five named days in a row.
 *
 * This module is the pure half of the feature:
 *   - `ARC_DEFINITIONS` — an arc relation over observance rules that ALREADY
 *     exist (`festivals.ts` carries `arcId` / `arcRole` / `arcOrdinal`);
 *     no rule is rewritten and no date changes.
 *   - `resolveArcOccurrence` — builds one occurrence of an arc from the
 *     shipped festival engine: every civil day from the anchor to the last
 *     slot, with the rule-bound days, gap-day labels and (for chooser arcs)
 *     the family's own visarjan.
 *   - `solveVisarjanDate` — the sthapana → visarjan solver.
 *   - `arcDayFor` — where a civil day sits inside an occurrence.
 *   - `visarjanReminderInputs` — feeds the chosen visarjan into the shipped
 *     vrat-reminder family (no new notification plumbing).
 *
 * Stance guard: the duration is the family's decision. This module offers the
 * set, defaults to NOTHING, and never says which duration is correct. A user
 * who never chooses gets today's behaviour — independent days — and is never
 * nagged: with no choice there is no visarjan slot and no reminder.
 *
 * Purity: no wall-clock reads, no storage, no React. `today` is a parameter
 * everywhere so the tsx suite is deterministic. The choice itself is loaded by
 * `arcChoiceStore.ts` and passed in.
 */

import { resolveObservancesForYear } from './festivalEngine';
import { OBSERVANCE_RULES } from './festivals';
import type { ArcRole, CalendarSystem, ObservanceRule, ResolvedObservance } from './types';
import type { VratReminderInput } from '../notifications/vratReminderPure';

/** The durations the app OFFERS. It recommends none of them. */
export type ArcDurationDays = 1.5 | 3 | 5 | 7 | 10;
export const ARC_DURATION_CHOICES: readonly ArcDurationDays[] = [1.5, 3, 5, 7, 10];

export function isArcDurationDays(value: unknown): value is ArcDurationDays {
  return typeof value === 'number' && (ARC_DURATION_CHOICES as readonly number[]).includes(value);
}

/** Label for the days strictly between two rule-bound days (Diwali's day 2). */
export type ArcGapLabel = { afterRuleId: string; labelHi: string; labelEn: string };

/**
 * A preparation hand-off surfaced a little BEFORE a day inside the arc, when
 * the shopping actually happens (Navratri → Kanya Pujan bhog/grocery list).
 * The window is counted back from the arc's end so tithi kshaya/vriddhi
 * cannot push it onto the wrong day. Both bounds inclusive; `to` may be 0.
 */
export type ArcPrepare = {
  fromDaysBeforeEnd: number;
  toDaysBeforeEnd: number;
  labelHi: string;
  labelEn: string;
  noteHi: string;
  noteEn: string;
  /** Vidhi whose तैयारी tab already carries the bhog list + grocery checklist. */
  vidhiId: string;
};

export type ArcDefinition = {
  id: string;
  nameHi: string;
  nameEn: string;
  /** Rule ids in arc order. The FIRST is the anchor whose occurrence dates the arc. */
  ruleIds: readonly string[];
  /** Customary total length in days — copy only; live length comes from dates. */
  customaryDays: number;
  /** Widest civil-day span an occurrence may take (containing-arc detection). */
  maxSpanDays: number;
  /**
   * Present ⇒ the family chooses the length at sthapana and the visarjan is
   * SOLVED from that choice. Absent ⇒ the arc is calendar-fixed.
   */
  durationChoices?: readonly ArcDurationDays[];
  /**
   * Visarjan vidhi id (data/vidhi). Resolved through the verified-only
   * registry at render time — a draft is indistinguishable from no entry.
   */
  visarjanVidhiId?: string;
  gapLabels?: readonly ArcGapLabel[];
  prepare?: ArcPrepare;
};

export const ARC_DEFINITIONS: readonly ArcDefinition[] = [
  {
    id: 'ganesh-utsav',
    nameHi: 'गणेश उत्सव',
    nameEn: 'Ganesh Utsav',
    ruleIds: ['ganesh-chaturthi', 'anant-chaturdashi'],
    customaryDays: 10,
    maxSpanDays: 12,
    durationChoices: ARC_DURATION_CHOICES,
    visarjanVidhiId: 'ganesh-visarjan-uttar-puja',
  },
  {
    id: 'sharad-navratri',
    nameHi: 'शारदीय नवरात्रि',
    nameEn: 'Sharad Navratri',
    ruleIds: ['navratri-start', 'dussehra'],
    customaryDays: 10,
    maxSpanDays: 12,
    visarjanVidhiId: 'durga-visarjan',
    prepare: {
      fromDaysBeforeEnd: 3,
      toDaysBeforeEnd: 1,
      labelHi: 'कन्या पूजन की तैयारी',
      labelEn: 'Prepare for Kanya Pujan',
      noteHi: 'अष्टमी या नवमी — परिवार की परम्परा अनुसार। भोग सूची और रसोई की खरीदारी तैयार है।',
      noteEn: 'On Ashtami or Navami, as your family keeps it. The bhog list and kitchen shopping are ready.',
      vidhiId: 'navratri-ghatasthapana',
    },
  },
  {
    id: 'deepavali',
    nameHi: 'दीपावली',
    nameEn: 'Deepavali',
    ruleIds: ['dhanteras', 'diwali', 'govardhan-puja', 'bhai-dooj'],
    customaryDays: 5,
    maxSpanDays: 7,
    gapLabels: [{ afterRuleId: 'dhanteras', labelHi: 'नरक चतुर्दशी', labelEn: 'Naraka Chaturdashi' }],
  },
];

export const ARC_BY_ID: ReadonlyMap<string, ArcDefinition> = new Map(
  ARC_DEFINITIONS.map((arc) => [arc.id, arc] as const)
);

const RULE_BY_ID = new Map(OBSERVANCE_RULES.map((rule) => [rule.id, rule] as const));

export function getArcForRule(rule: ObservanceRule | null | undefined): ArcDefinition | null {
  if (!rule?.arcId) return null;
  return ARC_BY_ID.get(rule.arcId) ?? null;
}

// ─── Date helpers (civil-day arithmetic; occurrence dates are local midnight) ──

export function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

/** Whole civil days from `a` to `b` (b − a); negative when b is earlier. */
export function dayDiff(a: Date, b: Date): number {
  return Math.round((startOfLocalDay(b).getTime() - startOfLocalDay(a).getTime()) / 86400000);
}

export function arcDateKey(date: Date): string {
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

function occurrencesOf(ruleId: string, aroundYear: number, calendarSystem: CalendarSystem): ResolvedObservance[] {
  const all = [
    ...resolveObservancesForYear(aroundYear - 1, calendarSystem),
    ...resolveObservancesForYear(aroundYear, calendarSystem),
    ...resolveObservancesForYear(aroundYear + 1, calendarSystem),
  ];
  return all
    .filter((item) => item.rule.id === ruleId)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

/** First occurrence of `ruleId` on/after `from` and within `withinDays` of it, else null. */
function firstOccurrenceWithin(
  ruleId: string,
  from: Date,
  withinDays: number,
  calendarSystem: CalendarSystem
): Date | null {
  const hit = occurrencesOf(ruleId, from.getFullYear(), calendarSystem).find((o) => {
    const diff = dayDiff(from, o.date);
    return diff >= 0 && diff <= withinDays;
  });
  return hit ? startOfLocalDay(hit.date) : null;
}

// ─── The solver ─────────────────────────────────────────────────────────────

/**
 * The family's visarjan date from THEIR sthapana and THEIR duration.
 *
 * - 1½ days → the day after sthapana (day 2); 3 → day 3; 5 → day 5; 7 → day 7.
 * - 10 → the arc's visarjan rule (Anant Chaturdashi) when it resolves 8–11
 *   days out — the tithi count, not a fixed offset, names that day — else
 *   day 10 by count.
 */
export function solveVisarjanDate(
  arc: ArcDefinition,
  sthapanaDate: Date,
  durationDays: ArcDurationDays,
  calendarSystem: CalendarSystem = 'purnimant'
): Date {
  const start = startOfLocalDay(sthapanaDate);
  if (durationDays === 10) {
    const visarjanRuleId = arc.ruleIds.find((id) => RULE_BY_ID.get(id)?.arcRole === 'visarjan');
    if (visarjanRuleId) {
      const byRule = firstOccurrenceWithin(visarjanRuleId, addDays(start, 7), 4, calendarSystem);
      if (byRule) return byRule;
    }
  }
  return addDays(start, Math.ceil(durationDays) - 1);
}

// ─── Occurrences ────────────────────────────────────────────────────────────

export type ArcSlot = {
  /** 1-based civil-day index within the occurrence. */
  ordinal: number;
  date: Date;
  role: ArcRole;
  /** Present when this day IS an observance rule. */
  ruleId?: string;
  labelHi?: string;
  labelEn?: string;
};

export type ArcOccurrence = {
  arc: ArcDefinition;
  startDate: Date;
  /** Last slot's date. Equals startDate while a chooser arc is still open. */
  endDate: Date;
  totalDays: number;
  /** Every civil day start..end, ordinal 1..totalDays. */
  slots: ArcSlot[];
  /** The family's chosen duration (chooser arcs only); null when unchosen or calendar-fixed. */
  durationDays: ArcDurationDays | null;
  /**
   * True for a chooser arc with NO choice yet: the end is unknown, so the arc
   * degrades to independent days — the strip shows sthapana and the chooser,
   * never a presumed visarjan.
   */
  open: boolean;
};

function labelFor(rule: ObservanceRule): { labelHi: string; labelEn: string } {
  return { labelHi: rule.nameHi, labelEn: rule.nameEn };
}

/**
 * Build the occurrence of `arc` anchored on `anchorDate` (an occurrence of its
 * first rule). `durationDays` applies to chooser arcs only and is ignored for
 * calendar-fixed ones.
 */
export function buildArcOccurrence(
  arc: ArcDefinition,
  anchorDate: Date,
  durationDays: ArcDurationDays | null,
  calendarSystem: CalendarSystem = 'purnimant'
): ArcOccurrence {
  const start = startOfLocalDay(anchorDate);
  const anchorRule = RULE_BY_ID.get(arc.ruleIds[0]);
  const bound: ArcSlot[] = [
    {
      ordinal: 1,
      date: start,
      role: anchorRule?.arcRole ?? 'day',
      ruleId: arc.ruleIds[0],
      ...(anchorRule ? labelFor(anchorRule) : {}),
    },
  ];

  const chooser = Boolean(arc.durationChoices);
  const chosen = chooser ? durationDays : null;
  if (chooser && chosen == null) {
    return { arc, startDate: start, endDate: start, totalDays: 1, slots: bound, durationDays: null, open: true };
  }

  for (const ruleId of arc.ruleIds.slice(1)) {
    const rule = RULE_BY_ID.get(ruleId);
    if (!rule) continue;
    // A chooser arc's visarjan rule binds only when the family chose the
    // full customary length; otherwise THEIR visarjan is solved below.
    if (chooser && rule.arcRole === 'visarjan' && chosen !== 10) continue;
    const date = firstOccurrenceWithin(ruleId, start, arc.maxSpanDays - 1, calendarSystem);
    if (!date) continue;
    bound.push({ ordinal: dayDiff(start, date) + 1, date, role: rule.arcRole ?? 'day', ruleId, ...labelFor(rule) });
  }

  if (chooser && chosen != null) {
    const visarjan = solveVisarjanDate(arc, start, chosen, calendarSystem);
    const ordinal = dayDiff(start, visarjan) + 1;
    const existing = bound.find((s) => s.ordinal === ordinal);
    if (existing) {
      existing.role = 'visarjan';
    } else {
      bound.push({ ordinal, date: visarjan, role: 'visarjan', labelHi: 'विसर्जन', labelEn: 'Visarjan' });
    }
  }

  bound.sort((a, b) => a.ordinal - b.ordinal);
  const totalDays = bound[bound.length - 1].ordinal;
  const byOrdinal = new Map(bound.map((s) => [s.ordinal, s] as const));

  const slots: ArcSlot[] = [];
  let gap: ArcGapLabel | undefined;
  for (let ordinal = 1; ordinal <= totalDays; ordinal += 1) {
    const hit = byOrdinal.get(ordinal);
    if (hit) {
      slots.push(hit);
      gap = hit.ruleId ? arc.gapLabels?.find((g) => g.afterRuleId === hit.ruleId) : undefined;
      continue;
    }
    slots.push({
      ordinal,
      date: addDays(start, ordinal - 1),
      role: 'day',
      ...(gap ? { labelHi: gap.labelHi, labelEn: gap.labelEn } : {}),
    });
  }

  return { arc, startDate: start, endDate: slots[slots.length - 1].date, totalDays, slots, durationDays: chosen, open: false };
}

/**
 * The occurrence of `arc` that contains `today`, else the next one (or null
 * when the engine has no anchor date in reach).
 *
 * `choiceFor(anchorDateKey)` supplies the family's duration for THAT
 * occurrence — the choice is occurrence-scoped, so last year's ten days never
 * bind this year's arc.
 */
export function resolveArcOccurrence(
  arc: ArcDefinition,
  today: Date,
  calendarSystem: CalendarSystem = 'purnimant',
  choiceFor: (anchorDateKey: string) => ArcDurationDays | null = () => null
): ArcOccurrence | null {
  const now = startOfLocalDay(today);
  const anchors = occurrencesOf(arc.ruleIds[0], now.getFullYear(), calendarSystem).map((o) => startOfLocalDay(o.date));
  if (anchors.length === 0) return null;

  const build = (anchor: Date) => buildArcOccurrence(arc, anchor, choiceFor(arcDateKey(anchor)), calendarSystem);

  const past = anchors.filter((d) => d.getTime() <= now.getTime());
  const latestPast = past[past.length - 1];
  if (latestPast) {
    const occ = build(latestPast);
    const sinceStart = dayDiff(occ.startDate, now);
    const contains = occ.open ? sinceStart < arc.maxSpanDays : now.getTime() <= occ.endDate.getTime();
    if (contains) return occ;
  }
  const upcoming = anchors.find((d) => d.getTime() > now.getTime());
  return upcoming ? build(upcoming) : null;
}

/** Convenience: the arc occurrence relevant to an observance rule's detail page. */
export function resolveArcOccurrenceForRule(
  rule: ObservanceRule | null | undefined,
  today: Date,
  calendarSystem: CalendarSystem = 'purnimant',
  choiceFor?: (anchorDateKey: string) => ArcDurationDays | null
): ArcOccurrence | null {
  const arc = getArcForRule(rule);
  return arc ? resolveArcOccurrence(arc, today, calendarSystem, choiceFor) : null;
}

// ─── Where today sits ───────────────────────────────────────────────────────

export type ArcDay =
  | { phase: 'before'; daysUntilStart: number }
  | { phase: 'during'; ordinal: number; slot: ArcSlot; daysRemaining: number | null }
  | { phase: 'after' };

/**
 * Today's position in the occurrence. For an OPEN chooser arc the ordinal is
 * the honest count of days since sthapana and `daysRemaining` is null — the
 * app does not know when the family will conclude.
 */
export function arcDayFor(occ: ArcOccurrence, today: Date): ArcDay {
  const now = startOfLocalDay(today);
  const sinceStart = dayDiff(occ.startDate, now);
  if (sinceStart < 0) return { phase: 'before', daysUntilStart: -sinceStart };
  if (occ.open) {
    if (sinceStart >= occ.arc.maxSpanDays) return { phase: 'after' };
    const ordinal = sinceStart + 1;
    const slot = occ.slots[0] && ordinal === 1 ? occ.slots[0] : { ordinal, date: now, role: 'day' as ArcRole };
    return { phase: 'during', ordinal, slot, daysRemaining: null };
  }
  if (now.getTime() > occ.endDate.getTime()) return { phase: 'after' };
  const ordinal = sinceStart + 1;
  return { phase: 'during', ordinal, slot: occ.slots[ordinal - 1], daysRemaining: occ.totalDays - ordinal };
}

/** The visarjan slot of a resolved (non-open) occurrence, if the arc has one. */
export function visarjanSlot(occ: ArcOccurrence): ArcSlot | null {
  if (occ.open) return null;
  return occ.slots.find((s) => s.role === 'visarjan') ?? null;
}

/** True when today falls inside the arc's preparation hand-off window. */
export function prepareActive(occ: ArcOccurrence, today: Date): boolean {
  const prep = occ.arc.prepare;
  if (!prep || occ.open) return false;
  const beforeEnd = dayDiff(startOfLocalDay(today), occ.endDate);
  return beforeEnd <= prep.fromDaysBeforeEnd && beforeEnd >= prep.toDaysBeforeEnd;
}

// ─── Reminder inputs (rides the shipped vrat-reminder family) ───────────────

export type ArcChoiceRecord = { dateKey: string; durationDays: ArcDurationDays };
export type ArcChoices = { readonly [arcId: string]: ArcChoiceRecord | undefined };

export const VISARJAN_REMINDER_ORDER_BASE = 1000;

/**
 * One vrat-reminder input per chosen visarjan whose occurrence is current or
 * upcoming: the evening-before advance notice and the 07:00 day-of notice the
 * family already knows from vrat reminders. No choice ⇒ no input ⇒ silence.
 * The payload's ruleId is the ARC ANCHOR (the sthapana rule), so a tap lands
 * on the detail page that carries the arc strip.
 */
export function visarjanReminderInputs(
  choices: ArcChoices,
  today: Date,
  calendarSystem: CalendarSystem = 'purnimant'
): VratReminderInput[] {
  const inputs: VratReminderInput[] = [];
  ARC_DEFINITIONS.forEach((arc, index) => {
    if (!arc.durationChoices) return;
    const choice = choices[arc.id];
    if (!choice || !isArcDurationDays(choice.durationDays)) return;
    const occ = resolveArcOccurrence(arc, today, calendarSystem, (key) =>
      key === choice.dateKey ? choice.durationDays : null
    );
    if (!occ || occ.open) return;
    const visarjan = visarjanSlot(occ);
    if (!visarjan) return;
    inputs.push({
      ruleId: arc.ruleIds[0],
      order: VISARJAN_REMINDER_ORDER_BASE + index,
      nameHi: `${arc.nameHi} विसर्जन`,
      nameEn: `${arc.nameEn} Visarjan`,
      titleHi: 'विसर्जन स्मरण',
      nextDate: visarjan.date,
      pref: { advanceDays: 1, dayOf: true, dayOfTime: { hour: 7, minute: 0 } },
    });
  });
  return inputs;
}
