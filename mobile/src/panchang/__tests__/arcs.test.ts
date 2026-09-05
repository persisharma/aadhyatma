/**
 * पर्व-अर्क (PRD-28) — the arc relation, the sthapana → visarjan solver, the
 * occurrence builder, today's position, the preparation window and the
 * reminder inputs. Pure: every `today` is a parameter.
 *
 * Run: TZ=Asia/Kolkata npx tsx --test src/panchang/__tests__/arcs.test.ts
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';

import {
  ARC_BY_ID,
  ARC_DEFINITIONS,
  ARC_DURATION_CHOICES,
  arcDateKey,
  arcDayFor,
  buildArcOccurrence,
  dayDiff,
  getArcForRule,
  isArcDurationDays,
  prepareActive,
  resolveArcOccurrence,
  resolveArcOccurrenceForRule,
  solveVisarjanDate,
  visarjanReminderInputs,
  visarjanSlot,
  VISARJAN_REMINDER_ORDER_BASE,
} from '../arcs';
import { OBSERVANCE_RULES } from '../festivals';
import { getRuleById } from '../vratCatalog';
import { ALL_VIDHI_ENTRIES } from '../../data/vidhi';

const RULE_BY_ID = new Map(OBSERVANCE_RULES.map((r) => [r.id, r] as const));
const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);
const GANESH = ARC_BY_ID.get('ganesh-utsav')!;
const NAVRATRI = ARC_BY_ID.get('sharad-navratri')!;
const DIWALI = ARC_BY_ID.get('deepavali')!;

// ─── The relation is additive and internally consistent ─────────────────────

test('every arc field on a rule is present-together, names a real arc, and every arc rule id resolves', () => {
  for (const rule of OBSERVANCE_RULES) {
    const has = [rule.arcId, rule.arcRole, rule.arcOrdinal].map((v) => v != null);
    assert.ok(has.every(Boolean) || has.every((v) => !v), `${rule.id}: arc fields must be all-or-none`);
    if (rule.arcId) {
      const arc = ARC_BY_ID.get(rule.arcId);
      assert.ok(arc, `${rule.id}: unknown arcId '${rule.arcId}'`);
      assert.ok(arc!.ruleIds.includes(rule.id), `${rule.id}: arc '${arc!.id}' does not list it`);
      assert.ok(['sthapana', 'day', 'visarjan'].includes(rule.arcRole!), `${rule.id}: arcRole`);
      assert.ok(Number.isInteger(rule.arcOrdinal) && rule.arcOrdinal! >= 1, `${rule.id}: arcOrdinal`);
    }
  }
  for (const arc of ARC_DEFINITIONS) {
    assert.ok(arc.ruleIds.length >= 2, `${arc.id}: an arc needs at least two rules`);
    const ordinals = new Set<number>();
    for (const id of arc.ruleIds) {
      const rule = RULE_BY_ID.get(id);
      assert.ok(rule, `${arc.id}: rule '${id}' does not exist`);
      assert.equal(rule!.arcId, arc.id, `${id}: arcId must point back at '${arc.id}'`);
      assert.ok(!ordinals.has(rule!.arcOrdinal!), `${arc.id}: duplicate ordinal ${rule!.arcOrdinal}`);
      ordinals.add(rule!.arcOrdinal!);
    }
    const first = RULE_BY_ID.get(arc.ruleIds[0])!;
    assert.equal(first.arcOrdinal, 1, `${arc.id}: the anchor is ordinal 1`);
    if (arc.durationChoices) {
      assert.equal(first.arcRole, 'sthapana', `${arc.id}: a chooser arc opens with sthapana`);
      assert.ok(arc.ruleIds.some((id) => RULE_BY_ID.get(id)!.arcRole === 'visarjan'), `${arc.id}: chooser arc names its customary visarjan rule`);
    }
    // Ordinals rise with position in the roster.
    const ords = arc.ruleIds.map((id) => RULE_BY_ID.get(id)!.arcOrdinal!);
    assert.deepEqual(ords, [...ords].sort((a, b) => a - b), `${arc.id}: roster order = ordinal order`);
    if (arc.visarjanVidhiId) {
      assert.ok(ALL_VIDHI_ENTRIES.some((v) => v.id === arc.visarjanVidhiId), `${arc.id}: visarjanVidhiId must be an authored vidhi`);
    }
    if (arc.prepare) {
      assert.ok(ALL_VIDHI_ENTRIES.some((v) => v.id === arc.prepare!.vidhiId), `${arc.id}: prepare.vidhiId must be an authored vidhi`);
      assert.ok(arc.prepare.fromDaysBeforeEnd >= arc.prepare.toDaysBeforeEnd);
    }
  }
});

test('the three shipped arcs are exactly the PRD-28 roster; the rules carry the PRD roles', () => {
  assert.deepEqual(ARC_DEFINITIONS.map((a) => a.id), ['ganesh-utsav', 'sharad-navratri', 'deepavali']);
  assert.deepEqual(GANESH.ruleIds, ['ganesh-chaturthi', 'anant-chaturdashi']);
  assert.deepEqual(NAVRATRI.ruleIds, ['navratri-start', 'dussehra']);
  assert.deepEqual(DIWALI.ruleIds, ['dhanteras', 'diwali', 'govardhan-puja', 'bhai-dooj']);
  assert.equal(RULE_BY_ID.get('ganesh-chaturthi')!.arcRole, 'sthapana');
  assert.equal(RULE_BY_ID.get('anant-chaturdashi')!.arcRole, 'visarjan');
  assert.equal(RULE_BY_ID.get('navratri-start')!.arcRole, 'sthapana');
  assert.equal(RULE_BY_ID.get('dussehra')!.arcRole, 'visarjan');
  for (const id of DIWALI.ruleIds) assert.equal(RULE_BY_ID.get(id)!.arcRole, 'day', `${id}: Diwali days are all 'day'`);
  assert.equal(getArcForRule(getRuleById('holi')), null, 'a rule outside every arc has no arc');
  assert.equal(getArcForRule(getRuleById('diwali'))?.id, 'deepavali');
});

test('additive: the eight arc rules keep their tithi/month/paksha/dayRule (no rule rewritten, no date changed)', () => {
  const pin: Record<string, [number, 'shukla' | 'krishna', number, string | undefined]> = {
    'ganesh-chaturthi': [6, 'shukla', 4, 'madhyahna'],
    'anant-chaturdashi': [6, 'shukla', 14, undefined],
    'navratri-start': [7, 'shukla', 1, undefined],
    dussehra: [7, 'shukla', 10, undefined],
    dhanteras: [8, 'krishna', 13, undefined],
    diwali: [8, 'krishna', 15, undefined],
    'govardhan-puja': [8, 'shukla', 1, undefined],
    'bhai-dooj': [8, 'shukla', 2, undefined],
  };
  for (const [id, [month, paksha, tithi, dayRule]] of Object.entries(pin)) {
    const rule = RULE_BY_ID.get(id)!;
    assert.deepEqual([rule.lunarMonth, rule.paksha, rule.tithi, rule.dayRule], [month, paksha, tithi, dayRule], id);
  }
});

test('the offered duration set is 1½/3/5/7/10 and nothing is a default', () => {
  assert.deepEqual([...ARC_DURATION_CHOICES], [1.5, 3, 5, 7, 10]);
  assert.deepEqual(GANESH.durationChoices, ARC_DURATION_CHOICES);
  assert.equal(NAVRATRI.durationChoices, undefined, 'Navratri is calendar-fixed');
  assert.equal(DIWALI.durationChoices, undefined, 'Diwali is calendar-fixed');
  assert.ok(isArcDurationDays(1.5) && isArcDurationDays(10));
  assert.ok(!isArcDurationDays(2) && !isArcDurationDays('5') && !isArcDurationDays(11));
  // No definition carries a default duration field of any kind.
  for (const arc of ARC_DEFINITIONS) assert.ok(!('defaultDuration' in arc), `${arc.id}: no default`);
});

// ─── The solver ─────────────────────────────────────────────────────────────

test('sthapana → visarjan: 1½/3/5/7 count civil days from the family’s day 1; 10 binds Anant Chaturdashi', () => {
  const sthapana = d(2026, 9, 14); // Ganesh Chaturthi 2026 (madhyahna rule, pinned in observanceDates)
  assert.equal(arcDateKey(solveVisarjanDate(GANESH, sthapana, 1.5)), '2026-09-15');
  assert.equal(arcDateKey(solveVisarjanDate(GANESH, sthapana, 3)), '2026-09-16');
  assert.equal(arcDateKey(solveVisarjanDate(GANESH, sthapana, 5)), '2026-09-18');
  assert.equal(arcDateKey(solveVisarjanDate(GANESH, sthapana, 7)), '2026-09-20');
  const anant = solveVisarjanDate(GANESH, sthapana, 10);
  assert.equal(arcDateKey(anant), '2026-09-25', 'the ten-day choice lands on Anant Chaturdashi 2026');
  assert.ok(dayDiff(sthapana, anant) >= 8 && dayDiff(sthapana, anant) <= 11, 'tithi count, not a fixed offset');
});

test('a 10-day choice falls back to day 10 by count when the visarjan rule is out of reach', () => {
  const orphan = { ...GANESH, ruleIds: ['ganesh-chaturthi'] };
  assert.equal(arcDateKey(solveVisarjanDate(orphan, d(2026, 9, 14), 10)), '2026-09-23');
});

// ─── Occurrences ────────────────────────────────────────────────────────────

test('Ganesh unchosen: an OPEN occurrence — sthapana only, no visarjan, no presumed end', () => {
  const occ = buildArcOccurrence(GANESH, d(2026, 9, 14), null);
  assert.equal(occ.open, true);
  assert.equal(occ.totalDays, 1);
  assert.equal(occ.durationDays, null);
  assert.equal(visarjanSlot(occ), null);
  assert.equal(occ.slots[0].role, 'sthapana');
  assert.equal(occ.slots[0].ruleId, 'ganesh-chaturthi');
});

test('Ganesh 5 days: five slots, the family’s visarjan on day 5, Anant Chaturdashi NOT bound', () => {
  const occ = buildArcOccurrence(GANESH, d(2026, 9, 14), 5);
  assert.equal(occ.open, false);
  assert.equal(occ.totalDays, 5);
  assert.equal(occ.slots.length, 5);
  assert.equal(occ.slots.map((s) => s.ordinal).join(','), '1,2,3,4,5');
  const v = visarjanSlot(occ)!;
  assert.equal(v.ordinal, 5);
  assert.equal(arcDateKey(v.date), '2026-09-18');
  assert.equal(v.ruleId, undefined, 'a solved visarjan is not a rule');
  assert.equal(v.labelEn, 'Visarjan');
  assert.ok(!occ.slots.some((s) => s.ruleId === 'anant-chaturdashi'));
});

test('Ganesh 10 days: the visarjan slot IS the Anant Chaturdashi rule and the span is honest (12 civil days in 2026)', () => {
  const occ = buildArcOccurrence(GANESH, d(2026, 9, 14), 10);
  const v = visarjanSlot(occ)!;
  assert.equal(v.ruleId, 'anant-chaturdashi');
  assert.equal(v.role, 'visarjan');
  assert.equal(arcDateKey(v.date), '2026-09-25');
  assert.equal(occ.totalDays, 12);
  assert.equal(occ.slots.length, 12);
  assert.equal(occ.slots.filter((s) => s.ruleId).length, 2, 'only the two rule-bound days carry ruleIds');
});

test('Diwali 2026: five named days, day 2 carries the Naraka Chaturdashi gap label, rule-bound days are tappable ids', () => {
  const occ = resolveArcOccurrence(DIWALI, d(2026, 9, 3))!;
  assert.ok(occ);
  assert.equal(occ.open, false);
  assert.equal(occ.totalDays, 5);
  assert.deepEqual(
    occ.slots.map((s) => s.ruleId ?? s.labelEn),
    ['dhanteras', 'Naraka Chaturdashi', 'diwali', 'govardhan-puja', 'bhai-dooj']
  );
  assert.equal(arcDateKey(occ.startDate), '2026-11-07');
  assert.equal(arcDateKey(occ.endDate), '2026-11-11');
  assert.ok(occ.slots.every((s) => s.role === 'day'));
});

test('Navratri 2026: ghatasthapana → Vijayadashami; ordinals come from dates, not the customary 10', () => {
  const occ = resolveArcOccurrence(NAVRATRI, d(2026, 9, 3))!;
  assert.equal(arcDateKey(occ.startDate), '2026-10-11');
  assert.equal(occ.slots[0].role, 'sthapana');
  const v = visarjanSlot(occ)!;
  assert.equal(v.ruleId, 'dussehra');
  assert.equal(arcDateKey(v.date), '2026-10-21');
  assert.equal(occ.totalDays, 11, 'a vriddhi year is 11 civil days — the strip must not pretend 10');
  assert.equal(occ.totalDays, dayDiff(occ.startDate, occ.endDate) + 1);
});

test('resolveArcOccurrence picks the occurrence containing today, else the next one; choices are occurrence-scoped', () => {
  // Mid-arc, 5-day choice for THIS year's sthapana.
  const during = resolveArcOccurrence(GANESH, d(2026, 9, 17), 'purnimant', (key) => (key === '2026-09-14' ? 5 : null))!;
  assert.equal(arcDateKey(during.startDate), '2026-09-14');
  assert.equal(during.durationDays, 5);
  // The day after that visarjan the arc has moved on to next year (and next year has no choice).
  const after = resolveArcOccurrence(GANESH, d(2026, 9, 19), 'purnimant', (key) => (key === '2026-09-14' ? 5 : null))!;
  assert.ok(after.startDate.getFullYear() === 2027, `moved to ${arcDateKey(after.startDate)}`);
  assert.equal(after.open, true, 'last year’s choice never binds this year');
  // Unchosen: the open occurrence stays current for maxSpanDays, then moves on.
  const openMid = resolveArcOccurrence(GANESH, d(2026, 9, 24))!;
  assert.equal(arcDateKey(openMid.startDate), '2026-09-14');
  const openGone = resolveArcOccurrence(GANESH, d(2026, 9, 26))!;
  assert.equal(openGone.startDate.getFullYear(), 2027);
  // Before: the upcoming one.
  const before = resolveArcOccurrence(DIWALI, d(2026, 1, 1))!;
  assert.equal(arcDateKey(before.startDate), '2026-11-07');
  // A non-arc rule resolves to nothing.
  assert.equal(resolveArcOccurrenceForRule(getRuleById('holi'), d(2026, 9, 3)), null);
  assert.equal(resolveArcOccurrenceForRule(getRuleById('bhai-dooj'), d(2026, 9, 3))?.arc.id, 'deepavali');
});

// ─── Today's position ───────────────────────────────────────────────────────

test('arcDayFor: before / during (ordinal, remaining) / after; open arcs count honestly with unknown remaining', () => {
  const occ = buildArcOccurrence(DIWALI, d(2026, 11, 7), null);
  assert.deepEqual(arcDayFor(occ, d(2026, 11, 5)), { phase: 'before', daysUntilStart: 2 });
  const day2 = arcDayFor(occ, d(2026, 11, 8));
  assert.equal(day2.phase, 'during');
  if (day2.phase === 'during') {
    assert.equal(day2.ordinal, 2);
    assert.equal(day2.daysRemaining, 3);
    assert.equal(day2.slot.labelEn, 'Naraka Chaturdashi');
  }
  const last = arcDayFor(occ, d(2026, 11, 11));
  if (last.phase === 'during') assert.equal(last.daysRemaining, 0);
  assert.deepEqual(arcDayFor(occ, d(2026, 11, 12)), { phase: 'after' });

  const open = buildArcOccurrence(GANESH, d(2026, 9, 14), null);
  const d4 = arcDayFor(open, d(2026, 9, 17));
  assert.equal(d4.phase, 'during');
  if (d4.phase === 'during') {
    assert.equal(d4.ordinal, 4);
    assert.equal(d4.daysRemaining, null, 'the app does not know when the family will conclude');
  }
  assert.deepEqual(arcDayFor(open, d(2026, 9, 26)), { phase: 'after' });
});

test('Navratri preparation window: Kanya Pujan bhog/grocery hand-off surfaces from three days before the end to the eve, not on Dashami', () => {
  const occ = resolveArcOccurrence(NAVRATRI, d(2026, 10, 12))!; // start 11 Oct, end 21 Oct
  assert.equal(prepareActive(occ, d(2026, 10, 17)), false, 'Saptami morning is too early');
  assert.equal(prepareActive(occ, d(2026, 10, 18)), true, '3 days before Dashami');
  assert.equal(prepareActive(occ, d(2026, 10, 19)), true, 'Ashtami');
  assert.equal(prepareActive(occ, d(2026, 10, 20)), true, 'Navami — the eve');
  assert.equal(prepareActive(occ, d(2026, 10, 21)), false, 'Dashami itself');
  assert.equal(NAVRATRI.prepare!.vidhiId, 'navratri-ghatasthapana', 'reuses the shipped vidhi’s तैयारी tab (PRD-23 bhog + grocery)');
  assert.equal(prepareActive(buildArcOccurrence(GANESH, d(2026, 9, 14), null), d(2026, 9, 15)), false, 'no prepare on an open arc');
  assert.equal(prepareActive(resolveArcOccurrence(DIWALI, d(2026, 11, 8))!, d(2026, 11, 8)), false, 'Diwali defines no prepare');
});

// ─── Reminder inputs ────────────────────────────────────────────────────────

test('visarjanReminderInputs: no choice ⇒ nothing; a current-year choice ⇒ one input on the SOLVED date riding the vrat family', () => {
  assert.deepEqual(visarjanReminderInputs({}, d(2026, 9, 10)), []);
  const inputs = visarjanReminderInputs({ 'ganesh-utsav': { dateKey: '2026-09-14', durationDays: 5 } }, d(2026, 9, 10));
  assert.equal(inputs.length, 1);
  const [it] = inputs;
  assert.equal(it.ruleId, 'ganesh-chaturthi', 'payload lands on the sthapana rule’s detail (where the strip lives)');
  assert.equal(arcDateKey(it.nextDate!), '2026-09-18');
  assert.equal(it.titleHi, 'विसर्जन स्मरण');
  assert.equal(it.nameHi, 'गणेश उत्सव विसर्जन');
  assert.equal(it.nameEn, 'Ganesh Utsav Visarjan');
  assert.deepEqual(it.pref, { advanceDays: 1, dayOf: true, dayOfTime: { hour: 7, minute: 0 } });
  assert.ok(it.order >= VISARJAN_REMINDER_ORDER_BASE, 'follows keep priority under the family cap');
});

test('visarjanReminderInputs: a stale (other-year) choice, an unknown duration, or a calendar-fixed arc yields nothing', () => {
  assert.deepEqual(visarjanReminderInputs({ 'ganesh-utsav': { dateKey: '2025-08-27', durationDays: 5 } }, d(2026, 9, 10)), []);
  assert.deepEqual(
    visarjanReminderInputs({ 'ganesh-utsav': { dateKey: '2026-09-14', durationDays: 4 as never } }, d(2026, 9, 10)),
    []
  );
  assert.deepEqual(visarjanReminderInputs({ 'sharad-navratri': { dateKey: '2026-10-11', durationDays: 10 } }, d(2026, 9, 10)), []);
});

// ─── Purity + direction guards ──────────────────────────────────────────────

test('arcs.ts is pure (no clock, storage, React) and festivals.ts does not import arcs.ts (relation stays additive data)', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'arcs.ts'), 'utf8');
  assert.ok(!/Date\.now\(\)|new Date\(\)\s*[;)]/.test(src), 'no wall-clock reads');
  assert.ok(!/AsyncStorage|from 'react|expo-/.test(src), 'no storage, React or expo');
  const festivals = fs.readFileSync(path.join(__dirname, '..', 'festivals.ts'), 'utf8');
  assert.ok(!/from '\.\/arcs'/.test(festivals), 'festivals.ts must not import arcs.ts');
});
