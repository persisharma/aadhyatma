import assert from 'node:assert/strict';
import { layoutRing, ringSeparator, ringWordFade, ringWords, wordClearanceDeg } from '../japamMantraRingLayout';

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

/** Linear interpolation of keyframes, as Animated.interpolate evaluates them. */
function opacityAt(frames: { inputRange: number[]; outputRange: number[] }, t: number): number {
  const { inputRange: x, outputRange: y } = frames;
  for (let i = 1; i < x.length; i++) {
    if (t <= x[i]) return y[i - 1] + ((y[i] - y[i - 1]) * (t - x[i - 1])) / (x[i] - x[i - 1]);
  }
  return y[y.length - 1];
}

test('a word is invisible whenever the clip edge would cut it, and fully shown mid-arc', () => {
  // Left ring: centred on the stage's left edge, so only 0°→180° is on screen.
  const arc = { fromDeg: 0, toDeg: 180 };
  const radius = 60;
  const width = 26;
  const halfHeight = 12.5;
  const clear = wordClearanceDeg(width, halfHeight, radius);
  for (const direction of [1, -1] as const) {
    for (const angleDeg of [0, 37, 90, 179, 200, 300]) {
      const frames = ringWordFade(angleDeg, clear, direction, arc, 12);
      for (let i = 1; i < frames.inputRange.length; i++) assert.ok(frames.inputRange[i] > frames.inputRange[i - 1]);
      assert.equal(frames.inputRange[0], 0);
      assert.equal(frames.inputRange[frames.inputRange.length - 1], 1);
      for (let step = 0; step <= 720; step++) {
        const t = step / 720;
        const phi = (((angleDeg + direction * 360 * t) % 360) + 360) % 360;
        const rad = (phi * Math.PI) / 180;
        // Nearest point of the word's box to the clip line (x = 0).
        const minX = (radius - halfHeight) * Math.abs(Math.sin(rad)) - (width / 2) * Math.abs(Math.cos(rad));
        const shown = Math.sin(rad) > 0;
        const opacity = opacityAt(frames, t);
        if (!shown || minX < 0) assert.ok(opacity < 1e-9, `cut word must be hidden (φ=${phi.toFixed(1)}, o=${opacity})`);
        if (Math.abs(phi - 90) < 30) assert.ok(Math.abs(opacity - 1) < 1e-9, `mid-arc word must be fully shown (φ=${phi})`);
      }
    }
  }
});

test('the right ring shows its 180°→360° half, and a word too wide for the arc never shows', () => {
  const right = ringWordFade(270, 20, -1, { fromDeg: 180, toDeg: 360 }, 12);
  assert.equal(opacityAt(right, 0), 1);
  assert.equal(opacityAt(right, 0.5), 0); // half a turn later it sits at 90°, off stage
  assert.deepEqual(ringWordFade(90, 95, 1, { fromDeg: 0, toDeg: 180 }, 12), { inputRange: [0, 1], outputRange: [0, 0] });
  assert.equal(wordClearanceDeg(20, 30, 24), 90);
});
