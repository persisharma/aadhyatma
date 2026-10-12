// Instagram marketing journey: editorial choice, real action screen, light result detail.
// All UI pixels come from locale-matched captures in the listing kit.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('playwright');
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../../../..');
const out=path.resolve(process.argv[2] || path.join(root,'marketing/reels/out/listing-carousels'));
const config=JSON.parse(fs.readFileSync(path.join(here,'content.json')));
const source=path.resolve(process.env.VEDANSH_CAPTURE_ROOT || path.join(root,config.source));
const b64=(file,type)=>`data:${type};base64,${fs.readFileSync(file).toString('base64')}`;
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const lines=s=>esc(s).replaceAll('\n','<br>');
const font=(family,weight,file)=>b64(path.join(root,`mobile/node_modules/@expo-google-fonts/${family}/${weight}/${file}`),'font/ttf');
const dev=font('noto-serif-devanagari','600SemiBold','NotoSerifDevanagari_600SemiBold.ttf');
const inter=font('inter','500Medium','Inter_500Medium.ttf');
const serif=font('cormorant-garamond','600SemiBold','CormorantGaramond_600SemiBold.ttf');
const iconFile=path.join(root,'mobile/assets/icon.png');
const icon=b64(iconFile,'image/png');
const cardNames=['01-hook','02-feature','03-cta'];
fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1080,height:1350},deviceScaleFactor:1});
const manifest=[];
try {
 for(const feature of config.features)for(const lang of ['hi','en']){
  const dir=path.join(out,feature.id,lang);fs.mkdirSync(dir,{recursive:true});
  for(const old of ['01-listing.png','02-use-case.png','03-explore.png']){
   const file=path.join(dir,old);if(fs.existsSync(file))fs.unlinkSync(file);
  }
  const asset=path.join(source,`android-phone-${lang}`,feature.screen);
  const copy=feature[lang];const image=b64(asset,'image/png');
  for(const [index,id] of cardNames.entries()){
   const step=copy.journey[index];
   const pair=feature.id==='guna-milan';
   const birth=feature.id==='kundali';
   const stage2Asset=pair?path.join(source,`android-phone-${lang}`,'03-kundali.png'):asset;
   const renderImage=b64(index===1?stage2Asset:asset,'image/png');
   const labels=lang==='hi'?['चुनें','शुरू करें','जानें']:['CHOOSE','BEGIN','EXPLORE'];
   const names=pair?(lang==='hi'?['पहला नाम','दूसरा नाम']:['FIRST NAME','SECOND NAME']):birth?(lang==='hi'?['आपका नाम','जन्म विवरण']:['YOUR NAME','BIRTH DETAILS']):copy.bullets.slice(0,2);
   const content=index===0?`<div class="choices">${names.map((n,i)=>`<div class="choice"><div class="choice-num">0${i+1}</div><p>${esc(n)}</p>${pair||birth?`<small>${lang==='hi'?'तारीख · समय · स्थान':'DATE · TIME · PLACE'}</small>`:''}</div>`).join('')}</div><div class="connector">↓</div><div class="next">${esc(copy.journey[1].title.replaceAll('\n',' '))} →</div><p class="swipe">${lang==='hi'?'आगे देखें →':'SWIPE FOR THE NEXT STEP →'}</p>`:index===1?`<img class="screen" src="${renderImage}"><div class="side"><span class="large-step">02</span><p>${esc(pair?(lang==='hi'?'जन्म विवरण से कुंडली। कुंडली से मिलान।':'Birth details to charts. Charts to matching.'):copy.bullets[1])}</p><div class="arrow">→</div><small>${lang==='hi'?'अगला: विवरण देखें':'NEXT: EXPLORE THE DETAILS'}</small></div>`:`<div class="result-window"><img src="${renderImage}"></div><div class="result-note">${esc(copy.bullets[2])}</div><div class="cta">${lang==='hi'?'वेदांश में शुरू करें →':'START WITH VEDANSH →'}<span>vedansh.app</span></div>`;
   const zoomWidth=feature.id==='guna-milan'?600:650;
   const offset=({'kundali':-330,'guna-milan':-175,'kids-stories':-220,'gita':-310,'japam':-300,'sankalp':-215,'panchang':-270,'vrat':-240,'bhajans':-235,'daily-practice':-240})[feature.id];
   const html=`<!doctype html><html lang="${lang}"><meta charset="utf-8"><style>
   @font-face{font-family:Dev;src:url('${dev}')}@font-face{font-family:Inter;src:url('${inter}')}@font-face{font-family:Serif;src:url('${serif}')}
   *{box-sizing:border-box}html,body{margin:0;width:1080px;height:1350px;overflow:hidden}
   body{background:${['#fff9ed','#f7ecd6','#fff8e9'][index]};color:#442514;font-family:${lang==='hi'?'Dev':'Inter'}}
   body:after{content:'';position:absolute;right:-160px;top:400px;width:650px;height:650px;border:1px solid #bb85502b;border-radius:50%;z-index:-1}
   .brand{position:absolute;top:48px;left:64px;display:flex;align-items:center;gap:15px;font:23px Inter;letter-spacing:4px}.brand img{width:44px;height:44px;border-radius:10px}
   .feature{position:absolute;right:64px;top:59px;font-size:23px;color:#875332}
   .progress{position:absolute;top:125px;left:64px;right:64px;display:flex;gap:12px}.progress span{height:5px;flex:1;border-radius:10px;background:#e9d8bd}.progress .active{background:#a65b29}
   .eyebrow{position:absolute;top:164px;left:68px;font-size:23px;color:#9a592e;letter-spacing:2px}
   h1{position:absolute;left:64px;top:220px;width:952px;margin:0;font-family:${lang==='hi'?'Dev':'Serif'};font-weight:600;font-size:${lang==='hi'?68:94}px;line-height:${lang==='hi'?1.5:1.08};letter-spacing:${lang==='hi'?'0':'-1px'}}
   .intro{position:absolute;left:68px;top:460px;width:930px;margin:0;font-size:31px;line-height:1.65;color:#765037}
   .choices{position:absolute;left:64px;right:64px;top:650px;display:flex;gap:24px}.choice{background:#f2e3c9;border:1px solid #d9b98f;border-radius:28px;width:50%;height:258px;padding:32px}.choice-num{font:25px Inter;color:#a05b2e}.choice p{font-size:${lang==='hi'?36:34}px;line-height:1.5;margin:17px 0 16px}.choice small{font-size:20px;color:#8c623e;letter-spacing:1px}
   .connector{position:absolute;top:940px;left:505px;font:60px Serif;color:#aa632e}.next{position:absolute;top:1035px;left:64px;right:64px;text-align:center;padding:24px 30px;background:#ecd5b1;border-radius:20px;font-size:30px;line-height:1.5}
   .swipe{position:absolute;left:64px;top:1195px;font-size:22px;letter-spacing:1px;color:#965728}
   .screen{position:absolute;left:64px;top:575px;width:392px;height:697px;border-radius:20px;outline:1px solid #c49b7066;box-shadow:0 18px 40px #623b1d22}.side{position:absolute;left:520px;top:630px;right:64px}.large-step{font:100px Serif;color:#b77947}.side p{font-size:38px;line-height:1.6}.arrow{font:85px Serif;color:#a65b29}.side small{display:block;font-size:22px;line-height:1.6;color:#925c34}
   .result-window{position:absolute;left:64px;right:64px;top:575px;height:540px;overflow:hidden;border:1px solid #d2af86;border-radius:24px;box-shadow:0 16px 30px #623b1d17;background:#f3e7c9}.result-window img{position:absolute;width:${zoomWidth}px;height:auto;top:${offset}px;left:${(952-zoomWidth)/2}px}.result-note{position:absolute;top:1130px;left:68px;right:68px;font-size:26px;color:#865330;line-height:1.5}.cta{position:absolute;top:1192px;left:64px;right:64px;padding-top:23px;border-top:1px solid #d4b38b;font-size:24px;color:#8b481d}.cta span{float:right;font:36px Serif}
   .footer{position:absolute;left:64px;bottom:20px;font:18px Inter;color:#94704c}.page{position:absolute;right:64px;bottom:20px;font:18px Inter;color:#94704c}
   </style><div class="brand"><img src="${icon}">VEDANSH</div><div class="feature">${esc(copy.name)}</div><div class="progress">${[0,1,2].map(i=>`<span class="${i<=index?'active':''}"></span>`).join('')}</div><div class="eyebrow">0${index+1} / ${labels[index]}</div><h1>${lines(step.title)}</h1><p class="intro">${esc(step.body)}</p>${content}<div class="footer">vedansh.app</div><div class="page">0${index+1} / 03</div></html>`;
   await page.setContent(html);await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
   const bounds=await page.locator('h1,.intro,.choices,.choice,.next,.screen,.side,.result-window,.result-note,.cta,.feature').evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect();return{kind:e.className||e.tagName,text:e.textContent,x:r.x,y:r.y,width:r.width,height:r.height,overflow:e.scrollWidth>e.clientWidth};}));
   const title=bounds.find(b=>b.kind==='H1');
   if(bounds.some(b=>(b.overflow&&b.kind!=='result-window')||b.x<0||b.x+b.width>1080||b.y+b.height>1310)||title.y+title.height>455)throw Error(feature.id+' '+lang+' '+id+' unsafe bounds '+JSON.stringify(bounds));
   const file=path.join(dir,`${id}.png`);await page.screenshot({path:file});
   manifest.push({feature:feature.id,lang,card:id,file:path.relative(out,file),size:[1080,1350],design:['editorial choice diagram','real app action screen','real result detail + light CTA'][index],source:index>0?path.relative(root,index===1?stage2Asset:asset):'editorial diagram; not app UI',sourceSha256:index>0?hash(index===1?stage2Asset:asset):null,outputSha256:hash(file),bounds});
  }
  const caption=`${copy.journey.map((s,i)=>`${i+1}. ${s.title.replaceAll('\n',' ')}\n${s.body}`).join('\n\n')}\n\n${copy.close}\n${lang==='hi'?'वेदांश डाउनलोड करें':'Get Vedansh'}: vedansh.app\n\n${copy.engagement}\n\n${feature.hashtags.map(t=>'#'+t).join(' ')}`;
  fs.writeFileSync(path.join(dir,'caption.txt'),caption+'\n');
  console.log(feature.id+' '+lang+' complete');
 }
}finally{await browser.close();}
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
const tiles=config.features.map(f=>`<section><h2>${esc(f.en.name)}</h2>${['hi','en'].map(lang=>`<h3>${lang==='hi'?'हिन्दी':'English'}</h3><div class="slides">${cardNames.map(id=>`<a href="${f.id}/${lang}/${id}.png" target="_blank"><img loading="lazy" src="${f.id}/${lang}/${id}.png" alt="${esc(f[lang].name)} ${id}"></a>`).join('')}</div><p><a href="${f.id}/${lang}/caption.txt">Instagram caption</a> · <a href="${f.id}-${lang}.zip">Download carousel</a></p>`).join('')}</section>`).join('');
fs.writeFileSync(path.join(out,'gallery.html'),`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Vedansh Instagram feature carousels</title><style>body{margin:0;padding:32px;background:#f3e7c9;color:#542c16;font:17px system-ui}h1{font-size:30px}section{margin:40px 0;padding-top:20px;border-top:1px solid #d5b88a}.slides{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory}.slides a{flex:0 0 min(30vw,360px);scroll-snap-align:start}.slides img{width:100%;display:block}a{color:#85421e}@media(max-width:650px){body{padding:16px}.slides a{flex-basis:82vw}}</style><h1>Vedansh · Instagram carousels</h1><p>10 features · Hindi and English · 3 distinct slides each · 1080×1350 PNG</p><p>Choose → begin → explore the result. All cards use a light cream palette. Real app screens from the listing kit, with new Instagram copy and layouts. Nothing has been posted.</p><p><a href="vedansh-feature-carousels.zip">Download all carousels</a></p>${tiles}`);
