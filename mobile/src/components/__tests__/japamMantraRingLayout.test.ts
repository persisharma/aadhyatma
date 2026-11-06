import assert from 'node:assert/strict';
import { layoutRing, ringSeparator, ringWords } from '../japamMantraRingLayout';

const SEP = '॥';

const width = (w: Record<string, number>) => (token: string) => w[token];

test('ring words drop dandas and verse numbers but keep every word whole', () => {
  assert.deepEqual(ringWords('ॐ भूर्भुवः स्वः । तत्सवितुर्वरेण्यं ॥१॥'), ['ॐ', 'भूर्भुवः', 'स्वः', 'तत्सवितुर्वरेण्यं']);
  assert.deepEqual(ringWords('जय श्री राम ॥ २ ॥'), ['जय', 'श्री', 'राम']);
});

test('a short mantra repeats in whole turns with a separator, spread evenly with no seam', () => {
  const placed = layoutRing(['सीता', 'राम'], SEP, width({ 'सीता': 30, 'राम': 24, [SEP]: 8 }), 60, 6);
  assert.ok(placed.length >= 6);
  assert.equal(placed[placed.length - 1].text, SEP);
  for (let i = 0; i < placed.length; i += 3) {
    assert.deepEqual(placed.slice(i, i + 3).map((t) => t.text), ['सीता', 'राम', SEP]);
  }
  const circumference = 2 * Math.PI * 60;
  const gaps = placed.map((t, i) => {
    const next = placed[(i + 1) % placed.length];
    const span = ((next.angleDeg - t.angleDeg + 360) % 360) / 360 * circumference;
    return span - t.width / 2 - next.width / 2;
  });
  for (const g of gaps) assert.ok(Math.abs(g - gaps[0]) < 1e-6, 'equal gaps all round, including the wrap');
  assert.ok(gaps[0] >= 6);
});

test('a mantra longer than one turn keeps its leading words in order, then the separator', () => {
  const words = ['ॐ', 'भूर्भुवः', 'स्वः', 'तत्सवितुर्वरेण्यं', 'भर्गो', 'देवस्य', 'धीमहि'];
  const w = { 'ॐ': 14, 'भूर्भुवः': 50, 'स्वः': 26, 'तत्सवितुर्वरेण्यं': 90, 'भर्गो': 34, 'देवस्य': 40, 'धीमहि': 36, [SEP]: 8 };
  const placed = layoutRing(words, SEP, width(w), 30, 6);
  const texts = placed.map((t) => t.text);
  assert.equal(texts[texts.length - 1], SEP);
  assert.deepEqual(texts.slice(0, -1), words.slice(0, texts.length - 1));
  const used = placed.reduce((sum, t) => sum + t.width + 6, 0);
  assert.ok(used <= 2 * Math.PI * 30);
});

test('nothing is laid out until every width is measured, or when the ring is too small', () => {
  assert.deepEqual(layoutRing(['राम'], SEP, width({ 'राम': 20 }), 50, 6), []);
  assert.deepEqual(layoutRing(['राम'], SEP, width({ 'राम': 400, [SEP]: 8 }), 20, 6), []);
  assert.deepEqual(layoutRing([], SEP, width({}), 50, 6), []);
});

test('the separator is a glyph the ring\'s own font carries: double danda for Indic, bullet for romanized', () => {
  assert.equal(ringSeparator('जय श्री राम'), '॥');
  assert.equal(ringSeparator('જય શ્રી રામ'), '॥');
  assert.equal(ringSeparator('ಜಯ ಶ್ರೀ ರಾಮ'), '॥');
  assert.equal(ringSeparator('Jaya Shri Rama'), '•');
});
