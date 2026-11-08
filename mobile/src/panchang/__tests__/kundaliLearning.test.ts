import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { GrahaPosition } from '../kundali';
import { syntheticLearningChart } from './fixtures/learningChart';
import { houseLesson, learningReadings, placementKind, readingParagraph } from '../kundaliLearning';

// Synthetic age offsets measured from the epoch, independent of real people.
const at = new Date(30 * 365.25 * 86400000);
const child = syntheticLearningChart(false, at);
const adult = syntheticLearningChart(true, at);

test('house selection uses the fixed house number, not Virgo’s sign number 6', () => {
  assert.equal(child.lagnaRashiIndex, 5);
  assert.equal(houseLesson(child, 1).rashiIndex, 5);
  const sixth = houseLesson(child, 6);
  assert.equal(sixth.rashiIndex, 10);
  assert.equal(sixth.lord, 'saturn');
  assert.equal(sixth.meaning.shortEn, 'work and competition');
  assert.throws(() => houseLesson(child, 0), RangeError);
  assert.throws(() => houseLesson(child, 13), RangeError);
});

test('empty houses follow their actual classical ruler with a non-empty basis', () => {
  const second = houseLesson(child, 2);
  assert.equal(second.occupants.length, 0);
  assert.equal(second.lord, 'venus');
  assert.equal(second.lordPosition?.house, 5);
  assert.deepEqual(second.basis, [{ kind: 'bhava', house: 2, rashiIndex: 6 }, { kind: 'lord', graha: 'venus', ofHouse: 2, inHouse: 5 }]);
  for (let house = 1; house <= 12; house++) assert.ok(houseLesson(adult, house).basis.length > 0);
});

test('dignity precedes directional friendship and lunar nodes stay ungraded', () => {
  assert.deepEqual(Object.fromEntries(child.grahas.map(position => [position.graha, placementKind(position)])), { sun: 'friend', moon: 'neutral', mars: 'debilitated', mercury: 'neutral', jupiter: 'enemy', venus: 'friend', saturn: 'own', rahu: 'node', ketu: 'node' });
  assert.equal(placementKind({ graha: 'mercury', rashiIndex: 5 } as GrahaPosition), 'exalted');
  for (const graha of ['rahu', 'ketu'] as const) for (let rashiIndex = 0; rashiIndex < 12; rashiIndex++) assert.equal(placementKind({ graha, rashiIndex } as GrahaPosition), 'node');
});

test('personal meaning reuses reviewed nine-graha readings and never reaches minors', () => {
  assert.deepEqual(learningReadings(child, at), []);
  const cards = learningReadings(adult, at);
  assert.equal(cards.length, 9);
  for (const card of cards) {
    assert.ok(card.basis.length > 0);
    const paragraph = readingParagraph(card);
    for (const value of Object.values(paragraph)) assert.ok(value.trim());
  }
  const first = cards.find(card => card.graha === 'saturn')!;
  assert.ok(first.narrative);
  assert.equal(readingParagraph(first).en, first.narrative.leadEn);
});
