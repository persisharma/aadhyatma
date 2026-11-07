import test from 'node:test';
import assert from 'node:assert/strict';
import { matchesRuleOnDate } from '../festivalEngine';
import { OBSERVANCE_RULES } from '../festivals';
import { PRECOMPUTED_OBSERVANCES } from '../precomputedObservances';
import { dayAt } from '../panchangDayStore';
import { UJJAIN_CITY_ID } from '../engine';
const location = { cityId: UJJAIN_CITY_ID, latitude: 23.1765, longitude: 75.7885, elevation: 494 };
for (const calendar of ['purnimant', 'amanta'] as const) {
  test(`${calendar}: bounded solar and relative matching preserves 2024–2031 reviewed dates`, () => {
    let checked = 0;
    for (let year = 2024; year <= 2031; year++) {
      const entries = PRECOMPUTED_OBSERVANCES[`${calendar}:${year}`];
      assert.ok(entries);
      for (const [id, key] of entries) {
        const rule = OBSERVANCE_RULES.find(r => r.id === id)!;
        if (rule.ruleType !== 'relative-to-lunar' && rule.ruleType !== 'solar-sankranti' && rule.type !== 'solar') continue;
        const [y,m,d] = key.split('-').map(Number), date = new Date(y,m-1,d);
        for (const offset of [-1,0,1]) assert.equal(matchesRuleOnDate(rule, dayAt(date, offset), calendar, location), offset === 0, `${id} ${key} offset ${offset}`);
        checked++;
      }
    }
    assert.ok(checked >= 100, 'cover all solar rules and relative rules for eight years');
  });
}
