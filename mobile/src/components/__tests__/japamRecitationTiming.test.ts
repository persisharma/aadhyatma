import { japamMantras } from '@/data/japam';
import { estimateRecitationMs, infinityRecitationMs, japaAudioPlaybackRate, recitationUnits } from '../japamRecitationTiming';

test.each([
  ['radha-naam', 880], ['jai-shri-ram', 880], ['om-namah-shivaya', 1000],
  ['gayatri-mantra', 4000], ['hare-krishna-mahamantra', 4400], ['mahamrityunjaya-mantra', 4600],
] as const)('%s retains its baseline estimate of %ims before proportional pacing', (id, expected) => {
  const mantra = japamMantras.find(m => m.id === id)!;
  expect(estimateRecitationMs(mantra.lines)).toBe(expected);
});

test('every canonical mantra has a finite interval and up to three spoken words take at most one second', () => {
  for (const mantra of japamMantras) {
    const ms = estimateRecitationMs(mantra.lines);
    expect(Number.isFinite(ms)).toBe(true);
    expect(ms).toBeGreaterThanOrEqual(880);
    const words = mantra.lines.join(' ').split(/\s+/).filter(word => /[ॐ\u0904-\u0939\u0958-\u095F]/u.test(word));
    if (words.length <= 3) expect(ms).toBeLessThanOrEqual(1000);
  }
});

test('conjuncts, vowel marks and verse numbers are not counted as separate spoken syllables', () => {
  expect(recitationUnits(['कृष्ण'])).toBe(2);
  expect(recitationUnits(['राधा'])).toBe(2.5);
  expect(estimateRecitationMs(['कृष्ण ॥ १०८'])).toBe(estimateRecitationMs(['कृष्ण']));
  expect(estimateRecitationMs(['ॐ नमः', 'शिवाय'])).toBe(estimateRecitationMs(['ॐ नमः शिवाय']));
  expect(estimateRecitationMs(['क़ृ'])).toBe(estimateRecitationMs(['क़ृ']));
});

test('the Gayatri-derived 12.5% increase scales with the whole utterance and tempo', () => {
  const lines = japamMantras.find(m => m.id === 'gayatri-mantra')!.lines;
  expect(infinityRecitationMs(lines, 0.5)).toBe(9000);
  expect(infinityRecitationMs(lines, 1)).toBe(4500);
  expect(infinityRecitationMs(lines, 1.5)).toBe(3000);
  expect(infinityRecitationMs(['राधा'], 1.5)).toBe(660);
  expect(infinityRecitationMs(lines, NaN)).toBe(4500);
});

test('playing recording cadence overrides the silent estimate and uses the same tempo', () => {
  expect(infinityRecitationMs(['ॐ नमः शिवाय'], 1, 5600)).toBe(6300);
  expect(infinityRecitationMs(['ॐ नमः शिवाय'], 1.4, 5600)).toBe(4500);
  expect(infinityRecitationMs(['ॐ नमः शिवाय'], 1, NaN)).toBe(1125);
});

test('every mantra uses the same relative increase at all selectable tempos', () => {
  for (const mantra of japamMantras) for (let step = 5; step <= 15; step++) {
    const rate = step / 10;
    expect(infinityRecitationMs(mantra.lines, rate)).toBe(Math.round(estimateRecitationMs(mantra.lines) * 1.125 / rate));
  }
});

test('recorded playback, the bead clock and the visual cycle share one padded period', () => {
  for (const naturalMs of [880, 1000, 4000, 4400, 33500]) for (let step = 5; step <= 15; step++) {
    const rate = step / 10;
    const expected = Math.round(naturalMs * 1.125 / rate);
    const nativeRate = japaAudioPlaybackRate(naturalMs, rate);
    expect(nativeRate).toBeGreaterThanOrEqual(.1);
    expect(nativeRate).toBeLessThanOrEqual(1.5);
    expect(Math.round(naturalMs / nativeRate)).toBe(expected);
    expect(infinityRecitationMs(['राधा'], rate, naturalMs)).toBe(expected);
  }
});

test('loading or invalid metadata remains finite and malformed tiny clips respect native bounds', () => {
  for (const ms of [0, -1, NaN, Infinity]) expect(japaAudioPlaybackRate(ms, 1.4)).toBe(1.4);
  expect(japaAudioPlaybackRate(.01, 1.5)).toBe(.1);
  expect(japaAudioPlaybackRate(4000, NaN)).toBeCloseTo(4000 / 4500);
});

test('long shlokas are timed from their full text rather than clamped to a short mantra', () => {
  expect(estimateRecitationMs(Array(20).fill('ॐ नमः शिवाय'))).toBeGreaterThan(
    estimateRecitationMs(Array(10).fill('ॐ नमः शिवाय')));
});


test.each([
  ['radha-naam', 990, 110], ['jai-shri-ram', 990, 110], ['om-namah-shivaya', 1125, 125],
  ['gayatri-mantra', 4500, 500], ['hare-krishna-mahamantra', 4950, 550],
] as const)('%s gets %ims total with a relative %ims increase at 1×', (id, total, extra) => {
  const mantra = japamMantras.find(m => m.id === id)!;
  expect(infinityRecitationMs(mantra.lines)).toBe(total);
  expect(infinityRecitationMs(mantra.lines) - estimateRecitationMs(mantra.lines)).toBe(extra);
});
