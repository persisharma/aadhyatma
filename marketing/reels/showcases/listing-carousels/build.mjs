// One three-card carousel per feature and locale, using existing listing art.
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
const source=path.resolve(process.env.VEDANSH_LISTING_ASSETS || path.join(root,config.source));
const b64=(file,type)=>`data:${type};base64,${fs.readFileSync(file).toString('base64')}`;
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;');
const dev=b64(path.join(root,'mobile/node_modules/@expo-google-fonts/noto-serif-devanagari/600SemiBold/NotoSerifDevanagari_600SemiBold.ttf'),'font/ttf');
const inter=b64(path.join(root,'mobile/node_modules/@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf'),'font/ttf');
fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1080,height:1350},deviceScaleFactor:1});
const manifest=[];
try {
 for(const feature of config.features)for(const lang of ['hi','en']){
  const dir=path.join(out,feature.id,lang);fs.mkdirSync(dir,{recursive:true});
  const asset=path.join(source,lang,feature.asset);const copy=feature[lang];
  const image=b64(asset,'image/png');
  const cards=[
   {id:'01-listing',title:'',body:'',full:true},
   {id:'02-use-case',title:copy.headline,body:copy.body},
   {id:'03-explore',title:copy.cta,body:copy.ctaBody},
  ];
  for(const [index,card] of cards.entries()){
   const html=`<!doctype html><html lang="${lang}"><meta charset="utf-8"><style>
   @font-face{font-family:Dev;src:url('${dev}')}@font-face{font-family:Inter;src:url('${inter}')}
   *{box-sizing:border-box}html,body{margin:0;width:1080px;height:1350px;overflow:hidden;background:#f3e7c9;color:#542c16;font-family:${lang==='hi'?'Dev':'Inter'}}
   .feature{position:absolute;top:27px;left:60px;width:960px;text-align:center;font-size:23px;color:#895023}
   h1{position:absolute;top:78px;left:60px;width:960px;margin:0;text-align:center;font-size:46px;line-height:1.7;font-weight:500}
   .asset{position:absolute;left:${card.full?45:228}px;top:${card.full?15:192}px;width:${card.full?990:624}px;height:${card.full?1320:832}px;object-fit:contain}
   .body{position:absolute;left:70px;top:1070px;width:940px;text-align:center;font-size:34px;line-height:1.65}
   .footer{position:absolute;top:1280px;width:1080px;text-align:center;font-family:Inter;font-size:23px;letter-spacing:1px;color:#895023}
   </style>${card.full?'':`<div class="feature">${esc(copy.name)} · VEDANSH</div><h1>${esc(card.title)}</h1>`}<img class="asset" src="${image}" alt="${esc(copy.name)} listing visual">${card.full?'':`<div class="body">${esc(card.body)}</div><div class="footer">vedansh.app &nbsp;·&nbsp; ${index+1} / 3</div>`}</html>`;
   await page.setContent(html);await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
   const bounds=await page.locator('h1,.body,.asset,.footer').evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect();return{text:e.textContent,x:r.x,y:r.y,width:r.width,height:r.height,overflow:e.scrollWidth>e.clientWidth};}));
   if(bounds.some(b=>b.overflow || b.x<0 || b.x+b.width>1080 || b.y+b.height>1350) || (!card.full && (bounds[0].y+bounds[0].height>180 || bounds[2].y+bounds[2].height>1260)))throw Error('Unsafe text bounds '+JSON.stringify(bounds));
   const file=path.join(dir,`${card.id}.png`);await page.screenshot({path:file});
   manifest.push({feature:feature.id,lang,card:card.id,file:path.relative(out,file),size:[1080,1350],source:path.relative(root,asset),sourceSha256:hash(asset),outputSha256:hash(file),sourceRenderedWhole:true,bounds});
  }
  const caption=`${copy.headline}\n\n${copy.body}\n\n${copy.cta}\nhttps://vedansh.app\n\n#Vedansh`;
  fs.writeFileSync(path.join(dir,'caption.txt'),caption+'\n');
  console.log(feature.id+' '+lang+' complete');
 }
}finally{await browser.close();}
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
const tiles=config.features.map(f=>`<section><h2>${esc(f.en.name)}</h2>${['hi','en'].map(lang=>`<h3>${lang==='hi'?'हिन्दी':'English'}</h3><div class="slides">${['01-listing','02-use-case','03-explore'].map(id=>`<a href="${f.id}/${lang}/${id}.png" target="_blank"><img loading="lazy" src="${f.id}/${lang}/${id}.png" alt="${esc(f[lang].name)} ${id}"></a>`).join('')}</div><p><a href="${f.id}/${lang}/caption.txt">Caption</a> · <a href="${f.id}-${lang}.zip">Download carousel</a></p>`).join('')}</section>`).join('');
fs.writeFileSync(path.join(out,'gallery.html'),`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Vedansh feature carousels</title><style>body{margin:0;padding:32px;background:#f3e7c9;color:#542c16;font:17px system-ui}h1{font-size:30px}section{margin:40px 0;padding-top:20px;border-top:1px solid #d5b88a}.slides{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory}.slides a{flex:0 0 min(30vw,320px);scroll-snap-align:start}.slides img{width:100%;display:block}a{color:#85421e}@media(max-width:650px){body{padding:16px}.slides a{flex-basis:82vw}}</style><h1>Vedansh · Feature carousels</h1><p>10 features · Hindi and English · 3 slides each · 1080×1350 PNG</p><p>Each carousel reuses the complete finished listing visual. Slides: listing, use case, explore. Nothing has been posted.</p><p><a href="vedansh-feature-carousels.zip">Download all carousels</a></p>${tiles}`);
