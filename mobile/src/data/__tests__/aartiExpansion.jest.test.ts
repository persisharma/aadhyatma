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
  ['satyanarayan-aarti', 9, 'भणत मनसुख सम्पत्ति मनवांछित पावै'],
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

test('B1 retains the dated complete edition and every legacy aarti position', () => {
 const data = getAarti(22);
 expect(data.verses.map(v => v.id)).toEqual(Array.from({length:9}, (_,i)=>`satyanarayan-aarti-${String(i+1).padStart(2,'0')}`));
 expect(data.verses[2].lines[0]).toContain('द्विजकूं');
 expect(data.verses[3].lines[1]).toContain('चन्द्रचूड़');
 expect(data.verses[4].lines[0]).toContain('वैश्य');
 expect(data.verses[6].lines[0]).toContain('ग्वाल');
 expect(data.verses[7].lines[0]).toContain('सवायो');
 expect(require('node:crypto').createHash('sha256').update(data.verses.map(v=>v.lines.join('\n')).join('\n')).digest('hex')).toBe('dd4ec358a1623c5db622d348c60f97565386e1eafa12632a89da6a22e52beb1f');
 expect(getSourceBackground('satyanarayan-aarti')).toBe(getSourceBackground('om-jai-jagdish'));
 const oldIds = ['om-jai-jagdish','hanuman-aarti','jai-ganesh-deva','om-jai-shiv-omkara','jai-ambe-gauri','aarti-kunj-bihari','saraswati-aarti','gayatri-aarti','khatu-shyam-aarti','om-jai-lakshmi-mata','jay-adhya-shakti','shani-aarti','dattatreya-aarti','om-jai-gange-mata','ambe-tu-hai-jagdambe-kali','kubera-aarti','santoshi-mata-aarti','ahoi-mata-aarti','vaishno-devi-aarti','ekadashi-mata-aarti','tulsi-aarti','shakambhari-aarti'];
 oldIds.forEach((id,index)=>expect(canonicalSourceId(`aarti-${index}`)).toBe(id));
});
