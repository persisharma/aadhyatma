import { buildKaraokeTimeline, karaokeDurationMs } from '../karaokeTiming';

test.each([
  ['  हरे कृष्ण  हरे कृष्ण ॥', 'राम राम हरे हरे'],
  ['  hare kṛṣṇa  hare kṛṣṇa', 'rāma rāma hare hare'],
  ['હરે કૃષ્ણ હરે કૃષ્ણ', 'રામ રામ હરે હરે'],
  ['ಹರೇ ಕೃಷ್ಣ ಹರೇ ಕೃಷ್ಣ', 'ರಾಮ ರಾಮ ಹರೇ ಹರೇ'],
])('preserves complete words, whitespace and stored line boundaries', (...lines) => {
  const timeline = buildKaraokeTimeline(lines);
  expect(timeline.map(line => line.words.map(word => word.text).join(''))).toEqual(lines);
  const words = timeline.flatMap(line => line.words);
  expect(words[0].start).toBe(0);
  expect(words[words.length - 1].end).toBe(1);
  words.forEach((word, i) => {
    expect(word.start).toBeGreaterThanOrEqual(0);
    expect(word.end).toBeGreaterThanOrEqual(word.start);
    expect(word.end).toBeLessThanOrEqual(1);
    if (i) expect(word.start).toBeCloseTo(words[i - 1].end, 10);
  });
});

test('reference syllable weights remain the same across display scripts', () => {
  const options = { referenceLines: ['क्ष राधा'], wordWeight: (word: string) => word.trim() === 'क्ष' ? 1 : 3 };
  for (const display of ['kṣa rādhā', 'ક્ષ રાધા', 'ಕ್ಷ ರಾಧಾ']) {
    const line = buildKaraokeTimeline([display], options)[0];
    expect(line.words.map(w => [w.start, w.end])).toEqual([[0, 0.25], [0.25, 1]]);
  }
});

test('different translated word counts preserve the whole text and reference line span', () => {
  const lines = ['one complete phrase here', 'another line'];
  const timeline = buildKaraokeTimeline(lines, { referenceLines: ['राम', 'शिवाय नमः'] });
  expect(timeline.map(line => line.words.map(word => word.text).join(''))).toEqual(lines);
  expect(timeline[1].words[0].start).toBeCloseTo(timeline[0].words.at(-1)!.end);
  expect(timeline[1].words.at(-1)!.end).toBe(1);
});

test('matching words keep their canonical timing when translation line breaks differ', () => {
  const timeline = buildKaraokeTimeline(['kṣa', 'rādhā'], {
    referenceLines: ['क्ष राधा'], wordWeight: word => word.trim() === 'क्ष' ? 1 : 3,
  });
  expect(timeline[0].words[0].end).toBe(0.25);
  expect(timeline[1].words[0].start).toBe(0.25);
  expect(timeline[1].words[0].end).toBe(1);
});

test('unmatched translation word and line counts still preserve the entire displayed passage', () => {
  const lines = ['one two three', 'four five'];
  const timeline = buildKaraokeTimeline(lines, { referenceLines: ['राम'] });
  expect(timeline.map(line => line.words.map(word => word.text).join(''))).toEqual(lines);
  expect(timeline[0].words[0].start).toBe(0);
  expect(timeline[1].words.at(-1)!.end).toBe(1);
});

test('empty, whitespace, punctuation and invalid custom weights never create NaN or dropped text', () => {
  expect(buildKaraokeTimeline([])).toEqual([]);
  const lines = ['', '   ', '॥ 108'];
  const timeline = buildKaraokeTimeline(lines, { wordWeight: () => NaN });
  expect(timeline.map(line => line.words.map(word => word.text).join(''))).toEqual(lines);
  expect(timeline.flatMap(line => line.words).every(word => Number.isFinite(word.start) && Number.isFinite(word.end))).toBe(true);
});

test('the shared speed model supports caller-selected rates and invalid/empty input safely', () => {
  expect(karaokeDurationMs(4000, 0.5)).toBe(8000);
  expect(karaokeDurationMs(4000, 2)).toBe(2000);
  expect(karaokeDurationMs(4000, NaN)).toBe(4000);
  expect(karaokeDurationMs(NaN)).toBe(0);
  expect(karaokeDurationMs(0)).toBe(0);
});
