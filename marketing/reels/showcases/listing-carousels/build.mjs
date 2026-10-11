// Instagram creative: feature hook, product walkthrough, distinct CTA.
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
   const dark=index===2;
   const heading=index===0?copy.hook:index===1?copy.how:copy.cta;
   const content=index===0
    ?`<p class="intro">${lines(copy.intro)}</p><img class="screen cover-screen" src="${image}" alt="${esc(copy.name)}"><div class="swipe">${lang==='hi'?'आगे देखें →':'SWIPE TO EXPLORE →'}</div>`
    :index===1
    ?`<img class="screen detail-screen" src="${image}" alt="${esc(copy.name)}"><div class="benefits">${copy.bullets.map((b,i)=>`<div class="benefit"><span class="num">0${i+1}</span><p>${esc(b)}</p></div>`).join('')}</div>`
    :`<p class="closing">${esc(copy.close)}</p><div class="download">${lang==='hi'?'वेदांश डाउनलोड करें':'GET VEDANSH'}</div><div class="site">vedansh.app</div><div class="cta-rule"></div>`;
   const html=`<!doctype html><html lang="${lang}"><meta charset="utf-8"><style>
   @font-face{font-family:Dev;src:url('${dev}')}@font-face{font-family:Inter;src:url('${inter}')}@font-face{font-family:Serif;src:url('${serif}')}
   *{box-sizing:border-box}html,body{margin:0;width:1080px;height:1350px;overflow:hidden}
   body{background:${dark?'radial-gradient(ellipse at 90% 10%,#7c472d,#482719 65%)':'radial-gradient(ellipse at 85% 15%,#fff9e9,#f3e7c9 72%)'};color:${dark?'#f6e9c9':'#442514'};font-family:${lang==='hi'?'Dev':'Inter'}}
   .brand{position:absolute;top:56px;left:72px;display:flex;align-items:center;gap:15px;font:25px Inter;letter-spacing:4px}.brand img{width:44px;height:44px;border-radius:10px}
   .feature{position:absolute;right:72px;top:64px;font-size:23px;color:${dark?'#e0bd8b':'#875332'}}
   .rule{position:absolute;left:72px;right:72px;top:124px;height:1px;background:${dark?'#c4945b66':'#b8894c55'}}
   h1{position:absolute;left:72px;top:${dark?264:168}px;width:936px;margin:0;font-family:${lang==='hi'?'Dev':'Serif'};font-weight:600;font-size:${lang==='hi'?(dark?92:index===1?74:80):(dark?114:index===1?100:108)}px;line-height:${lang==='hi'?1.5:1.04};letter-spacing:${lang==='hi'?'0':'-2px'}}
   .screen{position:absolute;display:block;width:480px;height:853.333px;object-fit:contain;border-radius:14px;box-shadow:0 20px 50px #58341c30;outline:1px solid #b58a5266}
   .cover-screen{left:528px;top:430px}.detail-screen{left:72px;top:430px}
   .intro{position:absolute;left:72px;top:590px;width:382px;margin:0;font-size:${lang==='hi'?40:37}px;line-height:1.65;color:#765037}
   .swipe{position:absolute;left:72px;top:1130px;width:380px;font-size:23px;color:#9b5c2d;letter-spacing:${lang==='hi'?'0':'1px'}}
   .benefits{position:absolute;left:604px;top:480px;width:404px}.benefit{margin:0 0 55px}.num{display:block;font:22px Inter;color:#a66b36;letter-spacing:3px;margin-bottom:13px}.benefit p{margin:0;font-size:${lang==='hi'?38:36}px;line-height:1.5}
   .closing{position:absolute;left:76px;top:690px;width:900px;font-size:44px;line-height:1.65;margin:0;color:#ead3b0}
   .download{position:absolute;left:76px;top:1012px;padding:19px 30px;border:1px solid #d1a36c;border-radius:7px;font-size:27px;letter-spacing:${lang==='hi'?'0':'3px'};color:#f6e9c9}
   .site{position:absolute;left:76px;top:1120px;font:66px Serif;color:#f6e9c9}.cta-rule{position:absolute;left:76px;top:1215px;width:84px;height:3px;background:#d9aa70}
   .footer{position:absolute;left:72px;bottom:22px;font:20px Inter;color:${dark?'#d2ae83':'#9b7752'}}.page{position:absolute;right:72px;bottom:22px;font:20px Inter;letter-spacing:3px;color:${dark?'#d2ae83':'#9b7752'}}
   </style><div class="brand"><img src="${icon}">VEDANSH</div><div class="feature">${esc(copy.name)}</div><div class="rule"></div><h1>${lines(heading)}</h1>${content}<div class="footer">${dark?'':'vedansh.app'}</div><div class="page">0${index+1} / 03</div></html>`;
   await page.setContent(html);await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
   const bounds=await page.locator('h1,.intro,.screen,.benefits,.closing,.download,.site,.swipe,.feature').evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect();return{kind:e.className||e.tagName,text:e.textContent,x:r.x,y:r.y,width:r.width,height:r.height,overflow:e.scrollWidth>e.clientWidth};}));
   const title=bounds.find(b=>b.kind==='H1');
   if(bounds.some(b=>b.overflow||b.x<0||b.x+b.width>1080||b.y+b.height>1310) || title.y+title.height>(dark?650:420))throw Error(feature.id+' '+lang+' '+id+' unsafe bounds '+JSON.stringify(bounds));
   const file=path.join(dir,`${id}.png`);await page.screenshot({path:file});
   manifest.push({feature:feature.id,lang,card:id,file:path.relative(out,file),size:[1080,1350],design:['hook + real app screen','feature walkthrough','typographic CTA'][index],source:index<2?path.relative(root,asset):'mobile/assets/icon.png',sourceSha256:hash(index<2?asset:iconFile),outputSha256:hash(file),appScreenRenderedWhole:index<2,bounds});
  }
  const caption=`${copy.hook.replaceAll('\n',' ')}\n\n${copy.intro.replaceAll('\n',' ')}\n\n${copy.bullets.map(b=>'• '+b).join('\n')}\n\n${copy.close}\n${lang==='hi'?'वेदांश डाउनलोड करें':'Get Vedansh'}: vedansh.app\n\n${copy.engagement}\n\n${feature.hashtags.map(t=>'#'+t).join(' ')}`;
  fs.writeFileSync(path.join(dir,'caption.txt'),caption+'\n');
  console.log(feature.id+' '+lang+' complete');
 }
}finally{await browser.close();}
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
const tiles=config.features.map(f=>`<section><h2>${esc(f.en.name)}</h2>${['hi','en'].map(lang=>`<h3>${lang==='hi'?'हिन्दी':'English'}</h3><div class="slides">${cardNames.map(id=>`<a href="${f.id}/${lang}/${id}.png" target="_blank"><img loading="lazy" src="${f.id}/${lang}/${id}.png" alt="${esc(f[lang].name)} ${id}"></a>`).join('')}</div><p><a href="${f.id}/${lang}/caption.txt">Instagram caption</a> · <a href="${f.id}-${lang}.zip">Download carousel</a></p>`).join('')}</section>`).join('');
fs.writeFileSync(path.join(out,'gallery.html'),`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Vedansh Instagram feature carousels</title><style>body{margin:0;padding:32px;background:#f3e7c9;color:#542c16;font:17px system-ui}h1{font-size:30px}section{margin:40px 0;padding-top:20px;border-top:1px solid #d5b88a}.slides{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory}.slides a{flex:0 0 min(30vw,360px);scroll-snap-align:start}.slides img{width:100%;display:block}a{color:#85421e}@media(max-width:650px){body{padding:16px}.slides a{flex-basis:82vw}}</style><h1>Vedansh · Instagram carousels</h1><p>10 features · Hindi and English · 3 distinct slides each · 1080×1350 PNG</p><p>Hook → feature → call to action. Real app screens from the listing kit, with new Instagram copy and layouts. Nothing has been posted.</p><p><a href="vedansh-feature-carousels.zip">Download all carousels</a></p>${tiles}`);
