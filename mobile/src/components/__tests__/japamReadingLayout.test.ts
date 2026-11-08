import { compactJapamReadingLines } from '../japamReadingLayout';
import fixture from './fixtures/japamMandalaWidths.json';
import { buildKaraokeTimeline } from '../karaokeTiming';

test.each(fixture.cases.map(row => [row.id, row.lang, row.lines] as const))(
  '%s / %s retains all recitation text and karaoke boundaries', (_id, _lang, lines) => {
    const paired = compactJapamReadingLines(lines);
    expect(paired.join(' ')).toBe(lines.join(' '));
    const before = buildKaraokeTimeline(lines).flatMap(line => line.words);
    const after = buildKaraokeTimeline(paired).flatMap(line => line.words);
    expect(after.map(word => word.text.trim())).toEqual(before.map(word => word.text.trim()));
    after.forEach((word, index) => {
      expect(word.start).toBeCloseTo(before[index].start, 10);
      expect(word.end).toBeCloseTo(before[index].end, 10);
    });
  });

test('Gayatri pairs four complete padas into two rows without altering canonical lines', () => {
  const row = fixture.cases.find(item => item.id === 'gayatri-mantra' && item.lang === 'hi')!;
  expect(compactJapamReadingLines(row.lines)).toEqual([
    'ॐ भूर्भुवः स्वः तत् सवितुर्वरेण्यं', 'भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्',
  ]);
  expect(row.lines).toHaveLength(4);
  expect(compactJapamReadingLines([])).toEqual([]);
});
