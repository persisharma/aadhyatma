// Actual DaanEntryScreen + ledger provider; browser adapters are in src/platform.tsx.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.join(__dirname,'dist'),out=path.join(__dirname,'captures');fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}try{res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}});
(async()=>{
 await new Promise(r=>server.listen(8772,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox']});
 const results=[];
 try{for(const lang of ['hi','en','gu','kn'])for(const size of ['M','L']){
  const width=size==='L'?320:390,page=await browser.newPage({viewport:{width,height:844}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:8772/?lang=${lang}&size=${size}&width=${width}`,{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  const amount=page.getByTestId('daan-entry-amount'),save=page.getByTestId('daan-entry-save');
  await amount.fill('500abc');await save.click();
  await page.getByTestId('daan-amount-error').waitFor();
  if(await amount.inputValue()!=='500abc')errors.push('Invalid draft lost');
  await page.screenshot({path:path.join(out,`${lang}-${size}-invalid.png`)});
  await amount.fill(({hi:'₹१,०००.५०',gu:'₹૧,૦૦૦.૫૦',kn:'₹೧,೦೦೦.೫೦',en:'₹1,000.50'})[lang]);
  await page.getByTestId('daan-amount-preview').waitFor();
  await save.scrollIntoViewIfNeeded();
  await page.screenshot({path:path.join(out,`${lang}-${size}-valid.png`)});
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))errors.push('Horizontal overflow');
  await save.click();
  const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('@vedansh/daan-ledger:v1')));
  if(stored.entries[0].amountInr!==1000.5)errors.push('Wrong stored amount');
  results.push({lang,size,width,errors});await page.close();
 }}finally{await browser.close();server.close();}
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results));if(results.some(r=>r.errors.length))process.exitCode=1;
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
