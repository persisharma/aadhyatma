import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getSundarkandChapter, sundarkandChaptersManifest } from '../sundarkand';
import { getShivaStrotamChapter, shivaStrotamChaptersManifest } from '../shiva-strotam';
import { getDurgaStotramChapter, durgaStotramChaptersManifest } from '../durga-stotram';
import { getSaraswatiStotramChapter, saraswatiStotramChaptersManifest } from '../saraswati-stotram';
import { getGaneshStotramChapter, ganeshStotramChaptersManifest } from '../ganesh-stotram';
import { getVishnuSahasranamaChapter, vishnuSahasranamaChaptersManifest } from '../vishnu-sahasranama';
import { getHanumanAshtakChapter, hanumanAshtakChaptersManifest } from '../hanuman-ashtak';
import { getKrishnaStotramChapter, krishnaStotramChaptersManifest } from '../krishna-stotram';
import { getBajrangBaanChapter, bajrangBaanChaptersManifest } from '../bajrang-baan';
import { getRamStutiChapter, ramStutiChaptersManifest } from '../ram-stuti';
import { getRamcharitmanasChapter, ramcharitmanasChaptersManifest } from '../ramcharitmanas';

/**
 * These eleven corpora used to validate themselves in an IIFE at the bottom of
 * their `index.ts`, which ran the moment anything imported the module. That was
 * two costs in one: it forced every chapter payload to be eagerly imported (so
 * reading a manifest title dragged the whole corpus onto the launch path), and
 * it walked every verse before the first frame.
 *
 * The payloads are behind `require()` thunks now — see any of the index files —
 * so the walk has to live somewhere that may freely load everything. That is
 * here. The assertions below are the same ones the IIFEs made, generalised:
 * chapter numbering, declared-vs-actual verse counts, manifest/payload
 * agreement, unique verse ids, non-empty text and meanings.
 *
 * `verseCounts.test.ts` is the companion: it pins the totals `texts.ts` renders
 * without loading any of this.
 */
type Verse = {
  id: string;
  chapter?: number;
  lines?: readonly string[];
  sanskrit?: readonly string[];
  meaningHi: string;
  meaningEn: string;
};
type Chapter = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
  verses: readonly Verse[];
};
type Summary = { chapter: number; titleHi: string; titleEn: string; verseCount: number };

const CORPORA: readonly {
  id: string;
  manifest: readonly Summary[];
  get: (chapter: number) => Chapter;
}[] = [
  { id: 'sundarkand', manifest: sundarkandChaptersManifest, get: getSundarkandChapter },
  { id: 'shiva-strotam', manifest: shivaStrotamChaptersManifest, get: getShivaStrotamChapter },
  { id: 'durga-stotram', manifest: durgaStotramChaptersManifest, get: getDurgaStotramChapter },
  { id: 'saraswati-stotram', manifest: saraswatiStotramChaptersManifest, get: getSaraswatiStotramChapter },
  { id: 'ganesh-stotram', manifest: ganeshStotramChaptersManifest, get: getGaneshStotramChapter },
  { id: 'vishnu-sahasranama', manifest: vishnuSahasranamaChaptersManifest, get: getVishnuSahasranamaChapter },
  { id: 'hanuman-ashtak', manifest: hanumanAshtakChaptersManifest, get: getHanumanAshtakChapter },
  { id: 'krishna-stotram', manifest: krishnaStotramChaptersManifest, get: getKrishnaStotramChapter },
  { id: 'bajrang-baan', manifest: bajrangBaanChaptersManifest, get: getBajrangBaanChapter },
  { id: 'ram-stuti', manifest: ramStutiChaptersManifest, get: getRamStutiChapter },
  { id: 'ramcharitmanas', manifest: ramcharitmanasChaptersManifest, get: getRamcharitmanasChapter },
];

for (const { id, manifest, get } of CORPORA) {
  test(`${id}: every chapter agrees with its manifest entry`, () => {
    assert.ok(manifest.length > 0, `${id}: manifest is empty`);
    const seenIds = new Set<string>();

    manifest.forEach((entry, i) => {
      const c = get(i + 1);
      assert.equal(c.chapter, i + 1, `${id}: chapter at index ${i} is numbered ${c.chapter}`);
      assert.equal(
        c.verses.length,
        c.verseCount,
        `${id}: chapter ${c.chapter} declares ${c.verseCount} verses but carries ${c.verses.length}`
      );
      assert.deepEqual(
        { chapter: entry.chapter, titleHi: entry.titleHi, titleEn: entry.titleEn, verseCount: entry.verseCount },
        { chapter: c.chapter, titleHi: c.titleHi, titleEn: c.titleEn, verseCount: c.verseCount },
        `${id}: manifest entry ${i + 1} drifts from the chapter payload — the manifest is what the ` +
          'launch path reads, so a drift here is a wrong verse count on a library row'
      );
      assert.ok(c.titleHi.trim() && c.titleEn.trim(), `${id}: chapter ${c.chapter} has an empty title`);

      for (const v of c.verses) {
        assert.ok(!seenIds.has(v.id), `${id}: duplicate verse id '${v.id}'`);
        seenIds.add(v.id);
        if (v.chapter !== undefined) {
          assert.equal(v.chapter, c.chapter, `${id}: verse ${v.id} claims chapter ${v.chapter}`);
        }
        const text = v.lines ?? v.sanskrit ?? [];
        assert.ok(text.length > 0, `${id}: verse '${v.id}' has no text lines`);
        assert.ok(
          v.meaningHi.trim() || v.meaningEn.trim(),
          `${id}: verse '${v.id}' has an empty meaning in both languages`
        );
      }
    });
  });

  test(`${id}: the chapter getter rejects out-of-range chapters`, () => {
    assert.throws(() => get(0), new RegExp(id));
    assert.throws(() => get(manifest.length + 1), new RegExp(id));
  });
}
