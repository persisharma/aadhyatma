import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resolveObservancesForYearLive } from '../festivalEngine';
import type { CalendarSystem } from '../types';
import published from './fixtures/occasion-published-2026-2029.json';

const delhi={cityId:'delhi',latitude:28.6139,longitude:77.209,elevation:216};
const iso=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const memo=new Map<string,ReturnType<typeof resolveObservancesForYearLive>>();
function dates(id:string,year:number,system:CalendarSystem='purnimant'){
 const key=`${year}:${system}`;
 if(!memo.has(key))memo.set(key,resolveObservancesForYearLive(year,system,delhi));
 return memo.get(key)!.filter(o=>o.rule.id===id).map(o=>iso(o.date));
}

// Published source facts are separate from pre-change regression controls and
// independently computed astronomy. See docs/reviews/occasion-date-corrections.md.
for(const system of ['purnimant','amanta'] as const){
 for(const fixture of published.cases) test(`published ${fixture.id} ${fixture.year}, ${system}`,()=>{
  const actual=dates(fixture.id,fixture.year,system);
  if(fixture.complete)assert.deepEqual(actual,fixture.dates);
  else for(const expected of fixture.dates)assert.ok(actual.includes(expected),`${expected}: ${actual.join(', ')}`);
 });
 test(`Ganga Dussehra uses Adhik Jyeshtha once, ${system}`,()=>{
  assert.deepEqual(dates('ganga-dussehra',2026,system),['2026-05-25']);
 });
 test(`Rishi Panchami uses midday Panchami rather than next sunrise, ${system}`,()=>{
  assert.deepEqual(dates('rishi-panchami',2026,system),['2026-09-15']);
 });
 test(`Purnima Vrat does not use a merely evening onset, ${system}`,()=>{
  const result=dates('purnima-vrat',2026,system);
  for(const day of ['2026-01-03','2026-03-03','2026-07-29'])assert.ok(result.includes(day),day);
  for(const day of ['2026-01-02','2026-03-02','2026-07-28'])assert.ok(!result.includes(day),day);
 });
 test(`monthly Krishna Janmashtami follows the worshipped night, ${system}`,()=>{
  const result=dates('masik-krishna-janmashtami',2026,system);
  for(const day of ['2026-01-10','2026-11-01','2026-12-01'])assert.ok(result.includes(day),day);
  for(const day of ['2026-01-11','2026-11-02'])assert.ok(!result.includes(day),day);
 });
}
