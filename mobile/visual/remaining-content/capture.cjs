// Production component renders; services/navigation are explicit web adapters.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const http = require('node:http'), fs = require('node:fs'), path = require('node:path');
const root=path.join(__dirname,'dist'), output=path.join(__dirname,'captures');
fs.mkdirSync(output,{recursive:true});
const server=http.createServer((req,res)=>{
 const pathname=new URL(req.url,'http://localhost').pathname;
 const file=path.resolve(root,'.'+(pathname.endsWith('/')?pathname+'index.html':pathname));
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 try{res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}
});
const texts=[['stuti','kanakadhara-stotram'],['stuti','hanuman-bahuk'],['suktam','shri-suktam'],['ashtakam','kalabhairav-ashtakam'],['kavacham','durga-devi-kavacham'],['stuti','durga-argala-stotram'],['stuti','durga-kilak-stotram'],['stuti','durga-saptashati-chapter-1'],['stuti','durga-saptashati-chapter-2'],['stuti','durga-saptashati-chapter-3'],['stuti','durga-saptashati-chapter-4'],['stuti','durga-saptashati-chapter-5'],['stuti','durga-saptashati-chapter-6'],['stuti','durga-saptashati-chapter-7'],['stuti','durga-saptashati-chapter-8'],['stuti','durga-saptashati-chapter-9'],['stuti','durga-saptashati-chapter-10'],['stuti','durga-saptashati-chapter-11'],['stuti','durga-saptashati-chapter-12'],['stuti','durga-saptashati-chapter-13']];
const cases=[];
for(const [kind,id] of texts){
 const verses=JSON.parse(fs.readFileSync(path.join(__dirname,'../../src/data',kind,id+'.json'),'utf8')).verses;
 const longest=verses.reduce((best,v,i)=>JSON.stringify(v).length>JSON.stringify(verses[best]).length?i:best,0);
 for(const page of new Set([0,verses.length-1,longest]))cases.push({kind,id,page});
}
cases.push({kind:'vishnu',page:31},{kind:'vishnu',page:107},...['saptashati','katha','weekday','links'].map(kind=>({kind,page:0})));
(async()=>{
 await new Promise(resolve=>server.listen(8769,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
 const results=[];
 try{
  const scenarios=[];
  for(const lang of ['hi','en','gu','kn'])for(const size of ['M','L'])for(const item of cases)scenarios.push({lang,size,item});
  async function captureScenario({lang,size,item}){
   const width=size==='L'?320:390, name=`${item.id||item.kind}-${lang}-${size}-${width}-${item.page}`;
   const tab=await browser.newPage({viewport:{width,height:844},deviceScaleFactor:1});
   tab.setDefaultTimeout(8000);
   const errors=[];tab.on('pageerror',e=>errors.push(e.message));
   try{
    const params=new URLSearchParams({...item,lang,size,width,cdn:'1'});
    await tab.goto('http://127.0.0.1:8769/?'+params,{waitUntil:'networkidle',timeout:45000});
    await tab.evaluate(()=>document.fonts.ready);await tab.waitForTimeout(500);
    await tab.getByText('PRODUCTION COMPONENTS',{exact:false}).waitFor();
    const text=await tab.locator('body').innerText();
    const metrics=await tab.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,images:Array.from(document.images).map(i=>({src:i.currentSrc,loaded:i.complete&&i.naturalWidth>0})),buttons:Array.from(document.querySelectorAll('[role="button"]')).map(e=>({label:e.getAttribute('aria-label')||e.textContent,rect:JSON.parse(JSON.stringify(e.getBoundingClientRect()))}))}));
    if(text.length<80)errors.push('Empty or missing production component');
    await tab.screenshot({path:path.join(output,name+'.png')});
    if(item.id || item.kind==='saptashati'){
     metrics.scrollBefore = await tab.evaluate(()=>Array.from(document.querySelectorAll('*')).filter(e=>e.scrollHeight>e.clientHeight+20).map(e=>({tag:e.tagName,overflow:getComputedStyle(e).overflowY,height:e.clientHeight,content:e.scrollHeight,top:e.scrollTop,rect:JSON.parse(JSON.stringify(e.getBoundingClientRect()))})));
     await tab.mouse.move(width/2,600); await tab.mouse.wheel(0,20000); await tab.waitForTimeout(700);
     await tab.evaluate(()=>{for(const e of document.querySelectorAll('*'))if(e.scrollHeight>e.clientHeight+20 && ['scroll','auto'].includes(getComputedStyle(e).overflowY))e.scrollTop=e.scrollHeight;});
     await tab.waitForTimeout(700);
     metrics.scrollAfter = await tab.evaluate(()=>Array.from(document.querySelectorAll('*')).filter(e=>e.scrollHeight>e.clientHeight+20).map(e=>({tag:e.tagName,overflow:getComputedStyle(e).overflowY,height:e.clientHeight,content:e.scrollHeight,top:e.scrollTop,rect:JSON.parse(JSON.stringify(e.getBoundingClientRect()))}))); 
     for(const s of metrics.scrollAfter){const r=s.rect;if(r.right>0 && r.left<width && s.height>100 && ['auto','scroll'].includes(s.overflow) && s.top<s.content-s.height-2)errors.push('Visible reader did not reach bottom');}
     await tab.screenshot({path:path.join(output,name+'-bottom.png')});
    }
    fs.writeFileSync(path.join(output,name+'.txt'),text);
    fs.writeFileSync(path.join(output,name+'.json'),JSON.stringify({item,lang,size,width,errors,metrics},null,2));
   }catch(e){errors.push(e.message);await tab.screenshot({path:path.join(output,name+'-ERROR.png')}).catch(()=>{});}
   results.push({name,errors});await tab.close();
   fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(results,null,2));
   console.log(JSON.stringify(results[results.length-1]));
  }
  // Separate pages share only immutable assets. Limit concurrency to four.
  for(let start=0;start<scenarios.length;start+=4){
   const batch=await Promise.allSettled(scenarios.slice(start,start+4).map(captureScenario));
   for(const r of batch)if(r.status==='rejected')throw r.reason;
  }
 }finally{await browser.close();server.close();}
 const failures=results.filter(r=>r.errors.length);console.log(JSON.stringify({captures:results.length,failures},null,2));if(failures.length)process.exitCode=1;
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
