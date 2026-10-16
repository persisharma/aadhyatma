import { aartiIndexById, getAarti } from '@/data/aarti';
import { library } from '@/data/texts';
import { buildEntryStartTarget } from '@/navigation/entryRoutes';
import { canonicalSourceId } from '@/data/sourceIdMigration';
import { getSourceBackground } from '@/data/backgrounds';

// Counts and closing anchors come from the complete editions in the source ledger.
const editions = [
  ['om-jai-gange-mata', 5, 'सेवक वही सहज में'],
  ['ambe-tu-hai-jagdambe-kali', 5, 'भक्तों के कारज तू ही सारती'],
  ['shani-aarti', 5, 'विश्वनाथ धरत ध्यान'],
  ['kubera-aarti', 8, 'कहत प्रेमपाल स्वामी'],
  ['santoshi-mata-aarti', 12, 'ऋद्धि-सिद्धि, सुख-सम्पत्ति'],
  ['ahoi-mata-aarti', 8, 'उर उमंग अति उपजे'],
  ['vaishno-devi-aarti', 8, 'कहते सेवक ध्यानू'],
  ['ekadashi-mata-aarti', 15, 'जन गुरदिता स्वर्ग का वासा'],
  ['tulsi-aarti', 6, 'प्रेम अजब है श्री हरि का'],
  ['shakambhari-aarti', 5, 'बसे बैकुण्ठ शाकम्भर दर्शन पावे'],
] as const;

test.each(editions)('%s is discoverable and routes to its complete edition', (id, count, closing) => {
  const entry = library.find((item) => item.id === id)!;
  expect(entry).toMatchObject({ status: 'active', category: 'aarti', verseCount: count });
  const index = aartiIndexById[id];
  expect(buildEntryStartTarget(entry)).toEqual({ screen: 'AartiReader', params: { aartiIndex: index } });
  expect(canonicalSourceId(`aarti-${index}`)).toBe(id);
  expect(getSourceBackground(id)).toBeTruthy();
  const aarti = getAarti(index);
  expect(aarti.verses).toHaveLength(count);
  expect(aarti.verses.at(-1)!.lines.join(' ')).toContain(closing);
  expect(new Set(aarti.source.referenceUrls!.map((url) => new URL(url).hostname)).size).toBeGreaterThanOrEqual(2);
  for (const verse of aarti.verses) {
    expect(verse.linesEn).toHaveLength(verse.lines.length);
    expect(verse.linesEn.join(' ')).not.toMatch(/[\u0900-\u097f]/);
    expect(verse.meaningHi.trim()).not.toBe('');
    expect(verse.meaningEn.trim()).not.toBe('');
  }
});

// Production positions are pinned independently of this branch's registry.
test('preserves main aarti positions and appends each new composition once', () => {
  const preserved = [
    ['jay-adhya-shakti', 10, 'जय आद्या शक्ति'],
    ['shani-aarti', 11, 'जय जय श्री शनिदेव'],
    ['dattatreya-aarti', 12, 'त्रिगुणात्मक त्रैमूर्ति'],
  ] as const;
  for (const [id, index, opening] of preserved) {
    expect(aartiIndexById[id]).toBe(index);
    expect(canonicalSourceId(`aarti-${index}`)).toBe(id);
    expect(getAarti(index).verses[0].lines.join(' ')).toContain(opening);
    expect(library.filter((entry) => entry.id === id)).toHaveLength(1);
  }
  expect(aartiIndexById['om-jai-gange-mata']).toBe(13);
  expect(new Set(Object.values(aartiIndexById)).size).toBe(Object.keys(aartiIndexById).length);
});
