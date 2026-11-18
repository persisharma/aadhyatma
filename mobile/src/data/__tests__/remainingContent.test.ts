import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getKavacham } from '../kavacham';
import { getStuti } from '../stuti';
import { getSuktam } from '../suktam';
import { getAshtakam } from '../ashtakam';
import { getVishnuSahasranamaChapter } from '../vishnu-sahasranama';
import { deityDayEntries, weekdayReadingDeities } from '../deityDayLinks';
import { library } from '../texts';
import { getSearchIndex, runSearch } from '../searchIndex';
import { getKathaLibrary } from '../../panchang/vratCatalog';
import { readingLinks } from '../readingLinks';

test('complete new texts have contiguous stable units and complete bilingual fields', () => {
  for (const [payload, count] of [
    [getStuti('kanakadhara-stotram'),22], [getStuti('hanuman-bahuk'),44],
    [getSuktam('shri-suktam'),16], [getAshtakam('kalabhairav-ashtakam'),9],
    [getStuti('durga-saptashati-chapter-1'),104], [getKavacham('durga-devi-kavacham'),56],
    [getStuti('durga-argala-stotram'),27], [getStuti('durga-kilak-stotram'),14],
  ] as const) {
    assert.equal(payload.verses.length,count,payload.id);
    assert.equal(new Set(payload.verses.map(v => v.id)).size,count);
    payload.verses.forEach((verse,i) => {
      assert.equal(verse.number,i+1);
      assert.equal(verse.lines.length,verse.linesEn.length);
      assert.ok(verse.meaningHi.trim().length>10 && verse.meaningEn.trim().length>10);
      assert.ok(!/[\u0900-\u097f]/.test(verse.linesEn.join(' ')));
    });
  }
});

test('Vishnu core reaches the final thousand-name verse and labels protection separately', () => {
  const chapter = getVishnuSahasranamaChapter(3);
  assert.equal(chapter.verseCount,109); // introduction +107 core +protection
  assert.ok(chapter.verses[107].sanskrit.join(' ').includes('रथाङ्गपाणि'));
  assert.ok(chapter.verses[108].sanskrit.join(' ').includes('वनमाली'));
  assert.equal(chapter.verses[30].number,30);
  assert.equal(getVishnuSahasranamaChapter(2).verseCount,9);
});

test('weekday links offer only available matching readings', () => {
  for (let day=0;day<7;day++) {
    const entries=deityDayEntries(day);
    assert.ok(entries.length>0);
    assert.equal(new Set(entries.map(e=>e.category)).size,entries.length);
    for(const entry of entries) {
      assert.equal(entry.status,'active'); assert.ok(!entry.hidden);
      assert.ok(entry.deities.includes(weekdayReadingDeities[day]));
      assert.ok(library.includes(entry));
    }
  }
  assert.deepEqual(deityDayEntries(-1),[]);
});

test('canonical links do not duplicate verses and every katha gets a searchable door', () => {
  const index=getSearchIndex();
  for(const link of readingLinks) {
    assert.ok(index.sections.some(s=>s.sourceId===link.id));
    assert.ok(!index.verses.some(v=>v.sourceId===link.id));
  }
  for(const katha of getKathaLibrary()) assert.ok(index.sections.some(s=>s.sourceId===`katha:${katha.id}`));
  const sample=getKathaLibrary()[0];
  assert.ok(runSearch(sample.titleEn,index).sections.some(hit=>hit.entry.sourceId===`katha:${sample.id}`));
});

test('previous Durga selection remains loadable but is absent from discovery', () => {
 const previous=getKavacham('durga-kavach');
 assert.equal(previous.verses.length,18);
 assert.equal(previous.verses[13].id,'durga-kavach-14');
 assert.ok(previous.verses[13].lines.join(' ').includes('शूलेन पाहि'));
 assert.ok(library.find(e=>e.id==='durga-kavach')?.hidden);
 const index=getSearchIndex();
 assert.ok(!index.sections.some(s=>s.sourceId==='durga-kavach'));
 assert.ok(!index.verses.some(s=>s.sourceId==='durga-kavach'));
});

test('all thirteen Saptashati chapters have 700 numbered units and complete discovery', () => {
  const counts = [104,69,44,42,129,24,27,63,41,32,55,41,29];
  const index = getSearchIndex();
  let total = 0;
  for (const [chapter, count] of counts.entries()) {
    const id = `durga-saptashati-chapter-${chapter+1}`;
    const payload = getStuti(id);
    assert.equal(payload.id,id);
    assert.equal(payload.verses.length,count);
    assert.equal(library.find(entry=>entry.id===id)?.verseCount,count);
    assert.ok(index.sections.some(entry=>entry.sourceId===id),id);
    assert.equal(index.verses.filter(entry=>entry.sourceId===id).length,count,id);
    payload.verses.forEach((verse,i)=>{
      assert.equal(verse.id,`${id}-${i+1}`);
      assert.equal(verse.number,i+1);
      assert.ok(verse.lines.length>0);
      assert.equal(verse.lines.length,verse.linesEn.length);
      assert.ok(verse.meaningHi.trim().length>5 && verse.meaningEn.trim().length>10);
      assert.ok(!/[\u0900-\u097f]/.test(verse.linesEn.join(' ')));
      assert.ok(!/TODO|placeholder/i.test(verse.meaningEn));
    });
    total += count;
  }
  assert.equal(total,700);
  // The threefold salutation is three traditional units, not three copies of a stanza.
  const fifth=getStuti('durga-saptashati-chapter-5');
  assert.ok(fifth.verses[13].lines.join(' ').includes('विष्णुमायेति'));
  assert.deepEqual(fifth.verses[14].lines,['नमस्तस्यै॥']);
  assert.deepEqual(fifth.verses[15].lines,['नमस्तस्यै नमो नमः॥']);
  assert.ok(getStuti('durga-saptashati-chapter-13').verses[28].lines.join(' ').includes('सावर्णिर्भविता मनुः'));
});
