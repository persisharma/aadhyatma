import test from 'node:test';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:http';
import { normalizeBatch, summarize, VERSION } from '../analytics/core.mjs';
import { analyticsPlugin } from '../analytics/local.mjs';
import { onRequestPost } from '../../functions/api/events.js';
import { onRequestGet } from '../../functions/api/stats.js';
const now=Date.now(), visit=randomUUID();
const event=(name,extra={})=>({id:randomUUID(),visit,name,version:VERSION,ts:now,page:'/',language:'en',device:'desktop',target:'install',section:'hero',source:'hero',...extra});
test('collector accepts only declared fields and never stores raw search or identifiers',()=>{
  const [e]=normalizeBatch([event('click',{email:'private@example.com',query:'private search',url:'https://site/?private=true',target:'email@example.com',section:'hero',ts:1})],now);
  assert.equal(e.target,''); assert.equal(e.ts,now); assert.equal(e.email,undefined); assert.equal(e.query,undefined);assert.equal(e.url,undefined);
  assert.throws(()=>normalizeBatch([event('unknown')]));assert.throws(()=>normalizeBatch([event('click',{visit:'raw user id'})]));
  assert.throws(()=>normalizeBatch(Array.from({length:51},()=>event('click'))));
});
test('placement rate uses exposed visits, repeat taps and quick taps cannot inflate it',()=>{
  const quick=randomUUID();
  const rows=[event('page_view'),event('button_view'),event('button_view'),event('click'),event('click'),event('click',{visit:quick}),event('install_prompt'),event('store_click',{platform:'ios'}),event('click',{visit:randomUUID(),device:'mobile',language:'hi',section:'mala',target:'count-chant'})];
  const s=summarize(rows,{days:7},now);
  const hero=s.placements.find(r=>r.section==='hero');
  assert.equal(hero.views,1);assert.equal(hero.clicks,3);assert.equal(hero.visitors,2);assert.equal(hero.ctr,1);
  assert.equal(s.metrics.storeClicks,1);assert.equal(s.sources[0].source,'hero');assert.match(s.paths[0].path,/hero:install → store:ios/);
  const mobile=summarize(rows,{device:'mobile',language:'hi'},now);assert.equal(mobile.metrics.clicks,1);assert.equal(mobile.placements[0].section,'mala');
  assert.equal(summarize([event('click',{ts:now-31*86400000})],{days:30},now).metrics.clicks,0);
});
test('local HTTP collector persists and deduplicates, rejects other origins, stats survive a collector restart',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'vedansh-analytics-')),file=join(dir,'data.json');
  const middleware=[];analyticsPlugin({file}).configureServer({middlewares:{use:fn=>middleware.push(fn)}});
  const server=createServer((req,res)=>middleware[0](req,res,()=>{res.writeHead(404);res.end();}));
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin=`http://127.0.0.1:${server.address().port}`;
  try {
    const data=[event('page_view'),event('click')];
    const post=originValue=>fetch(origin+'/api/events',{method:'POST',headers:{Origin:originValue,'Content-Type':'application/json'},body:JSON.stringify(data)});
    assert.equal((await post('https://other.example')).status,403);
    assert.equal((await post(origin)).status,202);assert.equal((await post(origin)).status,202);
    assert.equal(JSON.parse(await readFile(file,'utf8')).length,2);
    const report=await (await fetch(origin+'/api/stats?days=7')).json();assert.equal(report.metrics.clicks,1);assert.equal(report.mode,'local');
    const next=[];analyticsPlugin({file}).configureServer({middlewares:{use:fn=>next.push(fn)}});middleware[0]=next[0];
    assert.equal((await (await fetch(origin+'/api/stats')).json()).metrics.clicks,1);
    assert.equal((await fetch(origin+'/api/events',{method:'POST',headers:{Origin:origin},body:'x'.repeat(66000)})).status,413);
  } finally {await new Promise(resolve=>server.close(resolve));await rm(dir,{recursive:true,force:true});}
});
test('deployed collector fails closed without storage or owner access, rejects cross-origin writes',async()=>{
  assert.equal((await onRequestGet({request:new Request('https://site/api/stats'),env:{}})).status,503);
  assert.equal((await onRequestGet({request:new Request('https://site/api/stats'),env:{ANALYTICS_ADMIN_TOKEN:'a'.repeat(32)}})).status,401);
  assert.equal((await onRequestPost({request:new Request('https://site/api/events',{method:'POST',headers:{Origin:'https://other'},body:'[]'}),env:{DB:{}}})).status,403);
  let statements=[];
  const DB={prepare(sql){return {bind(...args){return {sql,args};}};},async batch(rows){statements=rows;}};
  const response=await onRequestPost({request:new Request('https://site/api/events',{method:'POST',headers:{Origin:'https://site'},body:JSON.stringify([event('click')])}),env:{DB}});
  assert.equal(response.status,202);assert.match(statements[0].sql,/INSERT OR IGNORE/);assert.match(statements.at(-1).sql,/DELETE/);
});

test('journeys retain browser action order even when persisted batches have equal timestamps or arrive out of order',()=>{
  const rows=[event('store_click',{sequence:4,platform:'android'}),event('click',{sequence:3,target:'store-link',section:'install-dialog'}),event('click',{sequence:1,target:'preview-gita'}),event('click',{sequence:2,target:'continue-reading',section:'preview-gita'})];
  assert.match(summarize(rows,{},now).paths[0].path,/hero:preview-gita → preview-gita:continue-reading → install-dialog:store-link → store:android/);
});

test('browser measurement tolerates unavailable storage and UUID APIs, and respects Do Not Track',async()=>{
  const source=(await readFile(new URL('../src/analytics.js',import.meta.url),'utf8')).replace(/import .*?;\n/,'const VERSION="compact-v3";\n').replaceAll('export function','function')+'\nthis.testTrack=track; this.pending=()=>queue;';
  const context={ window:{dispatchEvent(){}}, navigator:{doNotTrack:'0'}, location:{pathname:'/'},document:{documentElement:{lang:'en'}}, innerWidth:390, sessionStorage:{getItem(){throw new Error('Storage disabled');},setItem(){throw new Error('Storage disabled');}}, CustomEvent:class{},setTimeout(){return 1;},clearTimeout(){} };
  vm.runInNewContext(source,context);
  assert.doesNotThrow(()=>context.testTrack('click',{target:'install',section:'hero'}));
  assert.equal(context.pending().length,1);assert.match(context.pending()[0].id,/^[a-f0-9]{32}$/);
  context.navigator.doNotTrack='1';context.testTrack('click');assert.equal(context.pending().length,1);
  context.navigator.doNotTrack='0';context.navigator.globalPrivacyControl=true;context.testTrack('click');assert.equal(context.pending().length,1);
});
test('campaigns attribute visits and download clicks to the landing utm_source',()=>{
  const ig=randomUUID(), direct=randomUUID();
  const mk=(v,name,extra={})=>({...event(name,extra),visit:v});
  const batch=normalizeBatch([mk(ig,'page_view',{campaign:'instagram'}),mk(ig,'store_click',{campaign:'instagram',platform:'android'}),mk(direct,'page_view'),mk(direct,'click',{campaign:'Not A Slug!'})],now);
  assert.deepEqual(batch.map(e=>e.campaign),['instagram','instagram','direct','direct']);
  const {campaigns}=summarize(batch,{days:7},now);
  const byName=Object.fromEntries(campaigns.map(c=>[c.campaign,c]));
  assert.equal(byName.instagram.visits,1); assert.equal(byName.instagram.storeClicks,1);
  assert.equal(byName.direct.visits,1); assert.equal(byName.direct.storeClicks,0);
});
