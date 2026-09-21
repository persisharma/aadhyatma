import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getObservanceCatalog, OBSERVANCE_RULES } from '../festivals';
import {
  getObservancesForDate,
  getObservancesForMonth,
  getUpcomingObservances,
  searchObservances,
} from '../festivalEngine';
import {
  ALL_LENSES,
  LENS_COUNT,
  LENS_IDS,
  isObservanceLens,
  lensesForLocation,
  parseStoredLenses,
  ruleVisibleForLenses,
  serializeLenses,
  type ObservanceLens,
} from '../lenses';
import {
  CITY_LENS,
  LENS_GROUP_ORDER,
  LENS_REGISTRY,
  lensesForStoredLabel,
  STATE_LENS,
} from '../lensRegistry';
import { getLensAdditions, getRulesForLens } from '../vratCatalog';

const NONE: ReadonlySet<ObservanceLens> = new Set();
const JAIN: ReadonlySet<ObservanceLens> = new Set<ObservanceLens>(['jain']);

// ── the registry ───────────────────────────────────────────────────────────

test('the launch-safe id list and the display registry cannot drift apart', () => {
  // `LENS_IDS` is restated in `lenses.ts` so the launch path never evaluates the
  // registry (see `lensRegistry.ts`). That duplication is the price of keeping
  // ~15 KB off every cold start, and this is what keeps it honest.
  assert.deepEqual([...LENS_IDS].sort(), LENS_REGISTRY.map((l) => l.id).sort());
  assert.equal(LENS_COUNT, LENS_REGISTRY.length);
  assert.deepEqual([...ALL_LENSES].sort(), [...LENS_IDS].sort());
});

test('registry is 22 lenses — 20 regional + 2 traditions — with unique ids', () => {
  assert.equal(LENS_COUNT, 22);
  const ids = LENS_REGISTRY.map((l) => l.id);
  assert.equal(new Set(ids).size, ids.length);
  const traditions = LENS_REGISTRY.filter((l) => l.group === 'tradition').map((l) => l.id);
  assert.deepEqual(traditions.sort(), ['jain', 'sindhi']);
  assert.equal(LENS_REGISTRY.length - traditions.length, 20);
});

test('every lens has both scripts and an example in both, and sits in a rendered group', () => {
  for (const lens of LENS_REGISTRY) {
    assert.ok(lens.nameHi.length > 0, `${lens.id} nameHi`);
    assert.ok(lens.nameEn.length > 0, `${lens.id} nameEn`);
    assert.ok(lens.exampleHi.length > 0, `${lens.id} exampleHi`);
    assert.ok(lens.exampleEn.length > 0, `${lens.id} exampleEn`);
    assert.ok(LENS_GROUP_ORDER.includes(lens.group), `${lens.id} group is rendered`);
  }
});

// ── the three deliberate holes ─────────────────────────────────────────────

test('Ujjain, Delhi and Chandigarh seed nothing — a default is not a signal', () => {
  for (const cityId of ['ujjain', 'delhi', 'chandigarh']) {
    assert.deepEqual(lensesForLocation({ cityId }), [], cityId);
  }
});

test('a tradition lens is NEVER reachable from any seeding path', () => {
  // The privacy invariant of the whole feature: `jain` and `sindhi` are not
  // places, and inferring either from a city or a postcode is exactly the
  // profiling PRD-42 refuses. They are only ever a deliberate tap.
  const seeded = new Set<ObservanceLens>();
  for (const lenses of Object.values(CITY_LENS)) lenses.forEach((l) => seeded.add(l));
  for (const lenses of Object.values(STATE_LENS)) lenses.forEach((l) => seeded.add(l));
  assert.ok(!seeded.has('jain'), 'jain must never auto-seed');
  assert.ok(!seeded.has('sindhi'), 'sindhi must never auto-seed');
});

test('every seeded lens id is a real lens', () => {
  for (const [key, lenses] of Object.entries({ ...CITY_LENS, ...STATE_LENS })) {
    for (const lens of lenses) {
      assert.ok(isObservanceLens(lens), `${key} → ${lens}`);
    }
  }
});

test('a city seeds its calendar; Bengaluru seeds both of its', () => {
  assert.deepEqual(lensesForLocation({ cityId: 'jaipur' }), ['rajasthan']);
  assert.deepEqual(lensesForLocation({ cityId: 'patna' }), ['bihar-mithila']);
  assert.deepEqual(lensesForLocation({ cityId: 'bengaluru' }), ['karnataka', 'telugu']);
});

test('a Rajasthan tehsil seeds rajasthan; an unknown id seeds nothing', () => {
  assert.deepEqual(lensesForLocation({ cityId: 'sikar-tehsil', isTehsil: true }), ['rajasthan']);
  assert.deepEqual(lensesForLocation({ cityId: 'no-such-city' }), []);
});

test('a pincode location seeds from the state in its own stored label', () => {
  assert.deepEqual(lensesForStoredLabel('416001 · Kolhapur, Maharashtra'), ['maharashtra']);
  assert.deepEqual(lensesForStoredLabel('700001 · Kolkata, West Bengal'), ['bengal']);
  // An unrecognised tail seeds nothing — a wrong lens is worse than no lens.
  assert.deepEqual(lensesForStoredLabel('999999 · Somewhere, Atlantis'), []);
  assert.deepEqual(lensesForStoredLabel('110001 · New Delhi, Delhi'), []);
  assert.deepEqual(
    lensesForLocation({ cityId: 'pin-416001', labelEn: '416001 · Kolhapur, Maharashtra' }),
    ['maharashtra']
  );
});

// ── serialisation ──────────────────────────────────────────────────────────

test('serialisation is sorted and canonical, so equal sets write equal bytes', () => {
  assert.equal(serializeLenses(['telugu', 'jain']), 'jain,telugu');
  assert.equal(serializeLenses(['jain', 'telugu']), 'jain,telugu');
  assert.equal(serializeLenses(['jain', 'jain']), 'jain');
  assert.equal(serializeLenses([]), '');
});

test('parsing drops unknown ids but keeps the rest, and survives corrupt input', () => {
  assert.deepEqual([...parseStoredLenses('jain,telugu')].sort(), ['jain', 'telugu']);
  assert.deepEqual([...parseStoredLenses('jain,not-a-lens,telugu')].sort(), ['jain', 'telugu']);
  assert.deepEqual([...parseStoredLenses('')], []);
  assert.deepEqual([...parseStoredLenses(null)], []);
  assert.deepEqual([...parseStoredLenses(undefined)], []);
  assert.deepEqual([...parseStoredLenses('{"lenses":["jain"]}')], []);
});

test('a round trip through serialise → parse is the identity', () => {
  const original: ObservanceLens[] = ['bengal', 'jain', 'rajasthan'];
  assert.deepEqual([...parseStoredLenses(serializeLenses(original))].sort(), original.sort());
});

// ── the "only ever adds" contract ──────────────────────────────────────────

test('a rule with no lens is universal — visible to everyone, always', () => {
  assert.equal(ruleVisibleForLenses(undefined, NONE), true);
  assert.equal(ruleVisibleForLenses([], NONE), true);
  assert.equal(ruleVisibleForLenses(undefined, JAIN), true);
});

test('a lensed rule needs ONE matching lens — a shared observance is one rule', () => {
  assert.equal(ruleVisibleForLenses(['jain'], NONE), false);
  assert.equal(ruleVisibleForLenses(['jain'], JAIN), true);
  assert.equal(ruleVisibleForLenses(['odisha', 'bengal'], new Set<ObservanceLens>(['bengal'])), true);
  assert.equal(ruleVisibleForLenses(['odisha', 'bengal'], new Set<ObservanceLens>(['telugu'])), false);
});

// ── the catalog gate ───────────────────────────────────────────────────────

test('the catalog hides a lensed rule until its calendar is on', () => {
  const off = getObservanceCatalog().map((r) => r.id);
  const on = getObservanceCatalog({ lenses: JAIN }).map((r) => r.id);
  assert.ok(!off.includes('rohini-vrat'), 'rohini-vrat is not in the unlensed catalog');
  assert.ok(on.includes('rohini-vrat'), 'rohini-vrat appears once जैन is on');
  // A lens only ever ADDS: every id visible with no lens is still visible with one.
  for (const id of off) assert.ok(on.includes(id), `${id} survived turning a lens on`);
  assert.ok(on.length > off.length);
});

test('`includeHidden` does not bypass the lens gate', () => {
  const advancedNoLens = getObservanceCatalog({ includeHidden: true }).map((r) => r.id);
  assert.ok(!advancedNoLens.includes('rohini-vrat'));
  assert.ok(!advancedNoLens.includes('karthigai-vrat'));
});

test('search is lens-blind — a name typed by hand always resolves', () => {
  const byName = searchObservances('rohini').map((r) => r.id);
  assert.ok(byName.includes('rohini-vrat'), 'रोहिणी व्रत is findable with no lens on');
  const karthigai = searchObservances('karthigai').map((r) => r.id);
  assert.ok(karthigai.includes('karthigai-vrat'));
});

// ── "what did this calendar add?" — the sheet's third line + आपके पंचांग से ──

test('getRulesForLens names exactly the default-visible rules a lens adds', () => {
  assert.deepEqual(getRulesForLens('jain').map((r) => r.id), ['rohini-vrat']);
  assert.deepEqual(getRulesForLens('tamil').map((r) => r.id), ['karthigai-vrat']);
  // A lens with no content in this build answers honestly with nothing — the
  // surfaces render "no dates of its own yet" from an empty list, never a crash.
  assert.deepEqual(getRulesForLens('sindhi'), []);
});

test('getRulesForLens agrees with the catalog gate, lens by lens', () => {
  // The two answers to "what does turning X on give me" must be the same set:
  // what the lens lists, and what the catalog grows by when only X is on.
  const off = new Set(getObservanceCatalog().map((r) => r.id));
  for (const lens of LENS_IDS) {
    const grown = getObservanceCatalog({ lenses: new Set<ObservanceLens>([lens]) })
      .map((r) => r.id)
      .filter((id) => !off.has(id))
      .sort();
    assert.deepEqual(getRulesForLens(lens).map((r) => r.id).sort(), grown, lens);
  }
});

test('getRulesForLens never lists a hidden/advanced rule or a universal one', () => {
  for (const lens of LENS_IDS) {
    for (const rule of getRulesForLens(lens)) {
      assert.equal(rule.visibility, 'default', `${lens} → ${rule.id}`);
      assert.ok(rule.lens?.includes(lens), `${lens} → ${rule.id} carries the lens`);
    }
  }
});

test('getLensAdditions groups the ACTIVE set in registry order, keeping empty calendars', () => {
  assert.deepEqual(getLensAdditions(NONE), []);
  const groups = getLensAdditions(new Set<ObservanceLens>(['sindhi', 'jain', 'tamil']));
  assert.deepEqual(groups.map((g) => g.lens), ['tamil', 'jain', 'sindhi']);
  assert.deepEqual(groups.map((g) => g.rules.map((r) => r.id)), [['karthigai-vrat'], ['rohini-vrat'], []]);
});

test('with every lens on, the additions are exactly the lensed default rules, each once per lens', () => {
  const groups = getLensAdditions(ALL_LENSES);
  assert.equal(groups.length, LENS_COUNT);
  const listed = new Set(groups.flatMap((g) => g.rules.map((r) => r.id)));
  const expected = new Set(
    OBSERVANCE_RULES.filter((r) => r.visibility === 'default' && r.lens && r.lens.length > 0).map((r) => r.id)
  );
  assert.deepEqual([...listed].sort(), [...expected].sort());
});

test('select-all is an ordinary stored set equal to every id — it round-trips like any other', () => {
  const all = new Set<ObservanceLens>(LENS_IDS);
  assert.equal(all.size, LENS_COUNT);
  assert.deepEqual([...parseStoredLenses(serializeLenses(all))].sort(), [...LENS_IDS].sort());
});

// ── the retired `regional` visibility ──────────────────────────────────────

test("`visibility: 'regional'` is retired — no rule may carry it again", () => {
  const offenders = OBSERVANCE_RULES.filter((rule) => rule.visibility === 'regional').map((r) => r.id);
  assert.deepEqual(offenders, [], `use a \`lens\` instead of visibility 'regional': ${offenders.join(', ')}`);
});

test('the two former `regional` rules are now default + a lens', () => {
  const byId = new Map(OBSERVANCE_RULES.map((r) => [r.id, r] as const));
  const rohini = byId.get('rohini-vrat');
  const karthigai = byId.get('karthigai-vrat');
  assert.ok(rohini && karthigai);
  assert.equal(rohini!.visibility, 'default');
  assert.deepEqual(rohini!.lens, ['jain']);
  assert.equal(karthigai!.visibility, 'default');
  assert.deepEqual(karthigai!.lens, ['tamil']);
});

test('every `lens` value on every rule is a real lens', () => {
  for (const rule of OBSERVANCE_RULES) {
    if (!rule.lens) continue;
    assert.ok(rule.lens.length > 0, `${rule.id} carries an empty lens array — omit the field instead`);
    for (const lens of rule.lens) assert.ok(isObservanceLens(lens), `${rule.id} → ${lens}`);
  }
});

// ── the empty set is today's app, byte for byte ────────────────────────────

test('omitting the lens argument equals passing the empty set, on every query', () => {
  const date = new Date(2026, 8, 15);
  assert.deepEqual(
    getObservancesForDate(date, 'purnimant').map((o) => o.rule.id),
    getObservancesForDate(date, 'purnimant', undefined, NONE).map((o) => o.rule.id)
  );
  assert.deepEqual(
    getObservancesForMonth(2026, 8, 'purnimant').map((o) => o.rule.id),
    getObservancesForMonth(2026, 8, 'purnimant', undefined, NONE).map((o) => o.rule.id)
  );
  assert.deepEqual(
    getUpcomingObservances(date, 10, 'purnimant').map((o) => o.rule.id),
    getUpcomingObservances(date, 10, 'purnimant', undefined, undefined, NONE).map((o) => o.rule.id)
  );
});

test('turning every lens on never REMOVES a day from any query', () => {
  // The contract in its strongest form, over a whole year of real resolution.
  for (let month = 0; month < 12; month += 1) {
    const off = getObservancesForMonth(2026, month, 'purnimant').map((o) => `${o.rule.id}@${o.date.toDateString()}`);
    const on = getObservancesForMonth(2026, month, 'purnimant', undefined, ALL_LENSES)
      .map((o) => `${o.rule.id}@${o.date.toDateString()}`);
    for (const entry of off) {
      assert.ok(on.includes(entry), `${entry} disappeared when every lens was turned on`);
    }
  }
});

test('the upcoming list lenses BEFORE it slices, so the count is of visible days', () => {
  const date = new Date(2026, 0, 1);
  const count = 8;
  const unlensed = getUpcomingObservances(date, count, 'purnimant', 400);
  const lensed = getUpcomingObservances(date, count, 'purnimant', 400, undefined, ALL_LENSES);
  assert.equal(unlensed.length, count);
  assert.equal(lensed.length, count);
});
