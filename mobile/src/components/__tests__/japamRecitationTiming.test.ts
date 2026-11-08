import { japamMantras } from '@/data/japam';
import { estimateRecitationMs, infinityRecitationMs, japaAudioPlaybackRate, recitationUnits } from '../japamRecitationTiming';

test.each([
  ['radha-naam', 880], ['jai-shri-ram', 880], ['om-namah-shivaya', 1000],
  ['gayatri-mantra', 4000], ['hare-krishna-mahamantra', 4400], ['mahamrityunjaya-mantra', 4600],
] as const)('%s retains its baseline estimate of %ims before the extra half-second', (id, expected) => {
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

test('tempo scales a whole utterance before adding a fixed half-second, including short names', () => {
  const lines = japamMantras.find(m => m.id === 'gayatri-mantra')!.lines;
  expect(infinityRecitationMs(lines, 0.5)).toBe(8500);
  expect(infinityRecitationMs(lines, 1)).toBe(4500);
  expect(infinityRecitationMs(lines, 1.5)).toBe(3167);
  expect(infinityRecitationMs(['राधा'], 1.5)).toBe(1087);
  expect(infinityRecitationMs(lines, NaN)).toBe(4500);
});

test('playing recording cadence overrides the silent estimate and uses the same tempo', () => {
  expect(infinityRecitationMs(['ॐ नमः शिवाय'], 1, 5600)).toBe(6100);
  expect(infinityRecitationMs(['ॐ नमः शिवाय'], 1.4, 5600)).toBe(4500);
  expect(infinityRecitationMs(['ॐ नमः शिवाय'], 1, NaN)).toBe(1500);
});

test('every mantra takes exactly 500ms extra at every selectable tempo', () => {
  for (const mantra of japamMantras) for (let step = 5; step <= 15; step++) {
    const rate = step / 10;
    expect(infinityRecitationMs(mantra.lines, rate)).toBe(Math.round(estimateRecitationMs(mantra.lines) / rate) + 500);
  }
});

test('recorded playback, the bead clock and the visual cycle share one padded period', () => {
  for (const naturalMs of [880, 1000, 4000, 4400, 33500]) for (let step = 5; step <= 15; step++) {
    const rate = step / 10;
    const expected = Math.round(naturalMs / rate) + 500;
    const nativeRate = japaAudioPlaybackRate(naturalMs, rate);
    expect(nativeRate).toBeGreaterThanOrEqual(.1);
    expect(nativeRate).toBeLessThanOrEqual(1.5);
    expect(Math.round(naturalMs / nativeRate)).toBe(expected);
    expect(infinityRecitationMs(['राधा'], rate, naturalMs)).toBe(expected);
  }
});

test('loading or invalid metadata remains finite and malformed tiny clips respect native bounds', () => {
  for (const ms of [0, -1, NaN, Infinity]) expect(japaAudioPlaybackRate(ms, 1.4)).toBe(1.4);
  expect(japaAudioPlaybackRate(1, 1.5)).toBe(.1);
  expect(japaAudioPlaybackRate(4000, NaN)).toBeCloseTo(4000 / 4500);
});

test('long shlokas are timed from their full text rather than clamped to a short mantra', () => {
  expect(estimateRecitationMs(Array(20).fill('ॐ नमः शिवाय'))).toBeGreaterThan(
    estimateRecitationMs(Array(10).fill('ॐ नमः शिवाय')));
});
