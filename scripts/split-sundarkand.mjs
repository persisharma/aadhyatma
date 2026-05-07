#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'mobile', 'src', 'data', 'sundarkand');

const raw = JSON.parse(readFileSync(join(dataDir, 'sundarkand.json'), 'utf8'));
const verses = raw.verses;

const chapterDefs = [
  { chapter: 1, titleHi: 'मंगलाचरण', titleEn: 'Invocation', stanzas: [0] },
  { chapter: 2, titleHi: 'सागर लंघन', titleEn: 'Ocean Crossing', stanzas: [1, 2] },
  { chapter: 3, titleHi: 'लंका प्रवेश', titleEn: 'Entering Lanka', stanzas: [3, 4, 5] },
  { chapter: 4, titleHi: 'विभीषण भेंट', titleEn: 'Meeting Vibhishan', stanzas: [6, 7, 8] },
  { chapter: 5, titleHi: 'रावण की धमकी', titleEn: 'Ravan Threatens Sita', stanzas: [9, 10] },
  { chapter: 6, titleHi: 'त्रिजटा-सीता-हनुमान भेंट', titleEn: 'Trijata, Sita & Hanuman Meet', stanzas: [11, 12] },
  { chapter: 7, titleHi: 'सीता-हनुमान संवाद', titleEn: 'Sita-Hanuman Dialogue', stanzas: [13, 14] },
  { chapter: 8, titleHi: 'अशोक वाटिका ध्वंस', titleEn: 'Ashok Vatika Destruction', stanzas: [15, 16, 17, 18, 19, 20] },
  { chapter: 9, titleHi: 'लंका दहन', titleEn: 'Burning of Lanka', stanzas: [21, 22, 23] },
  { chapter: 10, titleHi: 'लंका से प्रस्थान', titleEn: 'Departure from Lanka', stanzas: [24, 25, 26] },
  { chapter: 11, titleHi: 'वापसी एवं राम-हनुमान संवाद', titleEn: 'Return & Ram-Hanuman Dialogue', stanzas: [27, 28, 29, 30, 31, 32] },
  { chapter: 12, titleHi: 'सागर तट यात्रा', titleEn: 'March to the Seashore', stanzas: Array.from({ length: 10 }, (_, i) => 33 + i) },
  { chapter: 13, titleHi: 'विभीषण शरणागति', titleEn: 'Vibhishan Joins Ram', stanzas: [43, 44, 45, 46, 47, 48] },
  { chapter: 14, titleHi: 'सेतु निर्माण एवं पार', titleEn: 'Bridge & Crossing', stanzas: [49, 50, 51, 52, 53, 54] },
  { chapter: 15, titleHi: 'शुक दूत', titleEn: "Shuk's Espionage", stanzas: [55, 56, 57] },
  { chapter: 16, titleHi: 'राम कोप एवं समापन', titleEn: "Ram's Wrath & Conclusion", stanzas: [58, 59, 60, 61, 62] },
];

const manifest = [];
let totalAssigned = 0;

for (const def of chapterDefs) {
  const stanzaSet = new Set(def.stanzas);
  const chapterVerses = verses
    .filter((v) => stanzaSet.has(v.stanza))
    .map((v) => ({ ...v, chapter: def.chapter }));

  const chapterData = {
    chapter: def.chapter,
    titleHi: def.titleHi,
    titleEn: def.titleEn,
    verseCount: chapterVerses.length,
    verses: chapterVerses,
  };

  const num = String(def.chapter).padStart(2, '0');
  writeFileSync(join(dataDir, `chapter-${num}.json`), JSON.stringify(chapterData, null, 2) + '\n');

  manifest.push({
    chapter: def.chapter,
    titleHi: def.titleHi,
    titleEn: def.titleEn,
    verseCount: chapterVerses.length,
  });

  totalAssigned += chapterVerses.length;
  console.log(`  ch ${num}: ${def.titleEn} — ${chapterVerses.length} verses (stanzas ${def.stanzas[0]}–${def.stanzas[def.stanzas.length - 1]})`);
}

writeFileSync(join(dataDir, 'chapters-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

console.log(`\nTotal: ${totalAssigned} / ${verses.length} verses assigned`);
if (totalAssigned !== verses.length) {
  console.error(`ERROR: ${verses.length - totalAssigned} verses unassigned!`);
  process.exit(1);
}
console.log('Done. chapters-manifest.json + 16 chapter files written.');
