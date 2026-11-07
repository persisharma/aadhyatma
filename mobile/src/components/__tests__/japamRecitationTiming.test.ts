import { japamMantras } from '@/data/japam';
import { estimateRecitationMs, infinityRecitationMs, recitationUnits } from '../japamRecitationTiming';

test.each([
  ['radha-naam', 880], ['jai-shri-ram', 880], ['om-namah-shivaya', 1000],
  ['gayatri-mantra', 4000], ['hare-krishna-mahamantra', 4400], ['mahamrityunjaya-mantra', 4600],
] as const)('%s uses the approved fast preset of %ims', (id, expected) => {
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

test('tempo scales a whole utterance, including short names', () => {
  const lines = japamMantras.find(m => m.id === 'gayatri-mantra')!.lines;
  expect(infinityRecitationMs(lines, 0.5)).toBe(8000);
  expect(infinityRecitationMs(lines, 1)).toBe(4000);
  expect(infinityRecitationMs(lines, 1.5)).toBe(2667);
  expect(infinityRecitationMs(['राधा'], 1.5)).toBe(587);
  expect(infinityRecitationMs(lines, NaN)).toBe(4000);
});

test('playing recording cadence overrides the silent estimate and uses the same tempo', () => {
  expect(infinityRecitationMs(['ॐ नमः शिवाय'], 1, 5600)).toBe(5600);
  expect(infinityRecitationMs(['ॐ नमः शिवाय'], 1.4, 5600)).toBe(4000);
  expect(infinityRecitationMs(['ॐ नमः शिवाय'], 1, NaN)).toBe(1000);
});

test('long shlokas are timed from their full text rather than clamped to a short mantra', () => {
  expect(estimateRecitationMs(Array(20).fill('ॐ नमः शिवाय'))).toBeGreaterThan(
    estimateRecitationMs(Array(10).fill('ॐ नमः शिवाय')));
});
