import assert from 'node:assert/strict';
import { test } from 'node:test';

import { OBSERVANCE_RULES } from '../festivals';
import { isObservanceLens, LENS_COUNT } from '../lenses';
import { areasPresent, getObservanceAreas, matchesAreaFilter, OBSERVANCE_AREAS } from '../observanceAreas';
import { getRulesForCategory } from '../vratCatalog';

const byId = new Map(OBSERVANCE_RULES.map((rule) => [rule.id, rule] as const));

test('every area tag names a real, default-visible rule and a real area', () => {
  for (const [id, areas] of Object.entries(OBSERVANCE_AREAS)) {
    const rule = byId.get(id);
    assert.ok(rule, `${id}: no such rule`);
    assert.equal(rule!.visibility, 'default', `${id}: tagging a rule nobody sees`);
    assert.ok(areas.length > 0, `${id}: empty tag — omit it instead (pan-India)`);
    assert.ok(areas.length < LENS_COUNT / 2, `${id}: tagged nearly everywhere — that is pan-India`);
    assert.equal(new Set(areas).size, areas.length, `${id}: duplicate area`);
    for (const area of areas) assert.ok(isObservanceLens(area), `${id}: unknown area ${area}`);
  }
});

test('an area tag is display-only: tagged rules stay universal (no lens)', () => {
  // RULEBOOK §23a.5 — hiding is the lens's job. A tagged rule must still be on
  // every user's calendar, so it may never also carry a lens of its own here.
  for (const id of Object.keys(OBSERVANCE_AREAS)) {
    assert.equal(byId.get(id)!.lens, undefined, `${id}: lensed rules take their area from the lens`);
  }
});

test('a lensed rule reads its lens as its area; an untagged rule is pan-India', () => {
  const lensed = OBSERVANCE_RULES.find((rule) => rule.lens?.length);
  assert.ok(lensed);
  assert.deepEqual([...getObservanceAreas(lensed!)], [...lensed!.lens!]);
  const janmashtami = byId.get('janmashtami')!;
  assert.deepEqual([...getObservanceAreas(janmashtami)], []);
  assert.ok(matchesAreaFilter(janmashtami, 'pan-india'));
  assert.ok(!matchesAreaFilter(janmashtami, 'rajasthan'));
  assert.ok(matchesAreaFilter(janmashtami, 'all'));
});

test('the area filter partitions a list: pan-India + tagged = all', () => {
  for (const category of ['festival', 'vrat', 'upavas'] as const) {
    const rules = getRulesForCategory(category);
    const pan = rules.filter((rule) => matchesAreaFilter(rule, 'pan-india'));
    const tagged = rules.filter((rule) => getObservanceAreas(rule).length > 0);
    assert.equal(pan.length + tagged.length, rules.length, `${category}: rows lost between chips`);
    for (const area of areasPresent(rules)) {
      assert.ok(rules.some((rule) => matchesAreaFilter(rule, area)), `${category}: chip ${area} would be empty`);
    }
  }
  const listed = (['festival', 'vrat', 'upavas'] as const).flatMap((category) => getRulesForCategory(category));
  const rajasthan = listed.filter((rule) => matchesAreaFilter(rule, 'rajasthan')).map((rule) => rule.id);
  for (const id of ['gangaur', 'goga-navami', 'teja-dashami']) assert.ok(rajasthan.includes(id), `${id} missing from the Rajasthan chip`);
  // Every tagged rule is reachable from some list — no tag is invisible.
  for (const id of Object.keys(OBSERVANCE_AREAS)) {
    assert.ok(listed.some((rule) => rule.id === id), `${id}: tagged but on no व्रत/पर्व/उपवास list`);
  }
});
