import fs from 'node:fs';import path from 'node:path';import {spawn,execFileSync}from'node:child_process';import{createRequire}from'node:module';import assert from'node:assert/strict';
const require=createRequire(import.meta.url),root=path.dirname(new URL(import.meta.url).pathname),mobile=path.resolve(root,'../..');
const modules=process.env.LAYOUT_BROWSER_MODULES||path.resolve(root,'../kundali/node_modules');
const{chromium}=require(process.env.LAYOUT_PLAYWRIGHT_MODULE||path.join(modules,'playwright'));
const baseline=process.env.LAYOUT_BASE_REF;
const port=process.env.LAYOUT_PORT||4178;const baseURL=`http://127.0.0.1:${port}`;
const output=path.resolve(mobile,'visual-output/layout',baseline?'before':'after');fs.mkdirSync(output,{recursive:true});
const source=baseline?execFileSync('git',['show',baseline+':mobile/src/screens/KundaliScreen.tsx'],{cwd:mobile,encoding:'utf8'}):fs.readFileSync(path.join(mobile,'src/screens/KundaliScreen.tsx'),'utf8');
const cityImports=`import React,{useState,useEffect,useMemo}from'react';import{Modal,Keyboard,View,Text,Pressable,FlatList,StyleSheet}from'react-native';import{SafeAreaView}from'react-native-safe-area-context';import TextField from'@/components/TextField';import{useTheme}from'@/theme/ThemeContext';import{fontFamilies}from'@/theme/typography';import{contentByLang}from'@/utils/localize';import{scriptBodyFont,scriptTitleFont}from'@/utils/langType';import type{Lang}from'@/data/gita/language';type City={id:string;nameHi:string;nameEn:string;districtEn?:string};const CITIES:City[]=[{id:'delhi',nameHi:'दिल्ली',nameEn:'Delhi'},{id:'varanasi',nameHi:'वाराणसी',nameEn:'Varanasi'},{id:'bengaluru',nameHi:'बेंगलुरु',nameEn:'Bengaluru'},{id:'didwana',nameHi:'डीडवाना',nameEn:'Didwana'}];const cityMatchesQuery=(c:City,q:string)=>(c.nameEn+c.nameHi).toLowerCase().includes(q.toLowerCase());`;
fs.writeFileSync(path.join(root,'city.generated.tsx'),cityImports+source.slice(source.indexOf('function CityPicker({'))+'\nexport default CityPicker;\n');
// Supply browser Indic fallback faces for Latin families, as native OS font
// fallback would. Keep every production layout and primary face unchanged.
let fallback=fs.readFileSync(path.join(root,'fallbacks.css'),'utf8');fallback=fallback.replaceAll("url('/node_modules/",`url('/@fs/${mobile}/node_modules/`);fs.writeFileSync(path.join(root,'fallbacks.generated.css'),fallback);
const server=spawn(process.execPath,[path.join(modules,'vite/bin/vite.js'),'--config',path.join(root,'vite.config.mjs')],{cwd:root,stdio:['ignore','ignore','pipe'],env:process.env});server.stderr.on('data',b=>process.stderr.write(b));
let browser;const results=[];
try{
 for(let i=0;i<80;i++){try{if((await fetch(baseURL)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage'],headless:true});
 for(const viewport of [{width:320,height:568},{width:360,height:800},{width:390,height:844}])for(const lang of ['hi','en','gu','kn'])for(const size of ['M','L'])for(const magnification of baseline?[1]:[1,1.6])for(const view of ['header','city','audio']){
  const page=await browser.newPage({viewport,deviceScaleFactor:2});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const id=`${view}-${lang}-${size}-${viewport.width}-${magnification}`;
  try{
   await page.goto(`${baseURL}/?view=${view}&lang=${lang}&size=${size}`);
   await page.waitForFunction(()=>document.documentElement.dataset.ready==='true');assert.equal(await page.evaluate(()=>window.__layoutHarness),'screen-clipping-fix','wrong preview server');await page.evaluate(()=>document.fonts.ready);
   if(view==='city')await page.waitForTimeout(300);
   if(magnification!==1)await page.evaluate(factor=>{const fonts=[...document.querySelectorAll('[dir="auto"],input,textarea')].map(e=>({e,size:parseFloat(getComputedStyle(e).fontSize),leading:parseFloat(getComputedStyle(e).lineHeight)}));for(const{e,size,leading}of fonts){e.style.fontSize=size*factor+'px';if(leading)e.style.lineHeight=leading*factor+'px';}},magnification);
   await page.waitForTimeout(60);assert.equal(errors.length,0,errors.join('; '));
   const measure=await page.evaluate(view=>{
    const box=e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height,scrollWidth:e.scrollWidth,clientWidth:e.clientWidth};};
    if(view==='header'){const title=[...document.querySelectorAll('[dir="auto"]')].find(e=>e.textContent===window.__fullTitle);return{title:box(title),truncated:title.scrollWidth>title.clientWidth+1,textOverflow:getComputedStyle(title).textOverflow};}
    if(view==='city'){const input=document.querySelector('[data-testid="kundali-city-search"]');let parent=input.parentElement;while(parent&&getComputedStyle(parent).overflow!=='hidden')parent=parent.parentElement;return{input:box(input),parent:box(parent),rightOverflow:Math.max(0,box(input).right-box(parent).right)};}
    const loop=document.querySelector('[aria-label="Toggle loop"]');return{loop:box(loop),below:box(loop).bottom>innerHeight+1};
   },view);
   if(!baseline){
    if(view==='header')assert.equal(measure.truncated,false,'full header title must wrap without clipping');
    if(view==='city')assert.ok(measure.rightOverflow<=1,'input must fit inside the clipped sheet');
    if(view==='audio'){
     await page.getByRole('button',{name:'Toggle loop',exact:true}).scrollIntoViewIfNeeded();
     const loop=await page.getByRole('button',{name:'Toggle loop',exact:true}).boundingBox();assert.ok(loop&&loop.y>=0&&loop.y+loop.height<=viewport.height+1,'repeat must be reachable by scrolling');
     await page.getByRole('button',{name:'Toggle loop',exact:true}).click();
     assert.ok(await page.evaluate(()=>window.__layoutCalls.some(c=>c.name==='toggleLoop')));
     const close=await page.getByRole('button',{name:'Minimize player',exact:true}).boundingBox();assert.ok(close&&close.y>=0&&close.y+close.height<=viewport.height+1,'minimize must stay visible while body scrolls');
     measure.loopAfterScroll=loop;
    }
   }
   await page.screenshot({path:path.join(output,id+'.png'),fullPage:false});
   if(!baseline&&view==='city'){
    await page.getByTestId('kundali-city-search').fill('Didwana');
    await page.getByRole('radio',{name:'Select Didwana birth city',exact:true}).click();
    assert.equal(await page.evaluate(()=>window.__selectedCity),'didwana');await page.getByText('City picker closed',{exact:true}).waitFor();
   }
   results.push({id,view,lang,size,magnification,...viewport,status:'PASS',measure,errors});
  }catch(error){await page.screenshot({path:path.join(output,id+'-failure.png')}).catch(()=>{});results.push({id,view,lang,size,magnification,...viewport,status:'FAIL',error:String(error)});}
  await page.close();if(results.length%24===0)console.log(`${baseline?'Before':'After'}: ${results.length} cases`);
 }
 fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({baseline:baseline||null,scope:'Production-component browser rendering with documented native adapters; browser text magnification is not OS accessibility verification',results},null,2));
 const failures=results.filter(r=>r.status==='FAIL');console.log(JSON.stringify({cases:results.length,failures:failures.length,examples:failures.slice(0,4)},null,2));assert.equal(failures.length,0);
}finally{await browser?.close();server.kill();}
