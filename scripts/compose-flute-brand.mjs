import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(root, 'mobile/package.json'));
const { PNG } = require('pngjs');
const { createCanvas, Image } = require(process.env.BRAND_CANVAS_MODULE || '@napi-rs/canvas');
const sha = data => createHash('sha256').update(data).digest('hex');
const sourceDir = path.join(root, 'docs/branding/flute');
const masterBytes = fs.readFileSync(path.join(sourceDir, 'approved-master.png'));
if (sha(masterBytes) !== '6c49799a3be827159046f82d0bfe0b401b00a677e4b43d5e9bebdf4004d805c6') throw Error('Owner-approved master changed');
const master = PNG.sync.read(masterBytes);
const template = fs.readFileSync(path.join(root, 'docs/branding/particle-preview-v1.html'), 'utf8');
if (sha(template) !== 'af052692ac2477860ae6c0e69ed7ce6754ed5dcf1400f10bd7e78665c6ad69d5') throw Error('Original renderer changed');
const names = {};
for (const [lang, top, bottom] of [['en', 0, 450], ['hi', 450, master.height]]) {
  let x0=master.width, y0=bottom, x1=0, y1=top;
  for(let y=top;y<bottom;y++)for(let x=0;x<master.width;x++){
    if(master.data[(y*master.width+x)*4+3]<8)continue;
    x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x+1);y1=Math.max(y1,y+1);
  }
  const crop=[Math.max(0,x0-2),Math.max(top,y0-2),Math.min(master.width,x1+2),Math.min(bottom,y1+2)];
  names[lang]={crop,width:crop[2]-crop[0],height:crop[3]-crop[1],homeFrame:{width:lang==='en'?28*442/126:28*166/75,height:28}};
}
const original = Buffer.from(template.match(/data:image\/png;base64,([A-Za-z0-9+/=]+)/)[1], 'base64');
const canvas=createCanvas(720,780), ctx=canvas.getContext('2d');
const originalImage=new Image();originalImage.src=original;await originalImage.decode();
const masterImage=new Image();masterImage.src=PNG.sync.write(master);await masterImage.decode();
ctx.drawImage(originalImage,0,0);
ctx.clearRect(0,350,720,240);
for(const [lang, x, y, w, h] of [['en',139,363,442,126],['hi',277,502,166,75]]){
  const n=names[lang],scale=Math.min(w/n.width,h/n.height),dw=n.width*scale,dh=n.height*scale;
  ctx.drawImage(masterImage,n.crop[0],n.crop[1],n.width,n.height,x+(w-dw)/2,y+(h-dh)/2,dw,dh);
  n.launchFrame={x:x+(w-dw)/2,y:y+(h-dh)/2,width:dw,height:dh};
}
// Restore untouched icon/subtitle pixels byte-for-byte, avoiding canvas
// premultiplied-alpha rounding outside the replaced name region.
const png=PNG.sync.read(original);
const namesPng=PNG.sync.read(canvas.toBuffer('image/png'));
PNG.bitblt(namesPng,png,0,350,720,240,0,350);
const composition=PNG.sync.write(png);
let particles=0;
for(let y=0;y<780;y+=3)for(let x=0;x<720;x+=3){const i=(y*720+x)*4;const [r,g,b,a]=png.data.subarray(i,i+4);if(a>=100&&!(r>210&&g>185&&b>130))particles++;}
const normalize=s=>s.replace(/data:image\/png;base64,[A-Za-z0-9+/=]+/g,'APPROVED_COMPOSITION');
const fragment=template.replace(/data:image\/png;base64,[A-Za-z0-9+/=]+/,'data:image/png;base64,'+composition.toString('base64'));
if(normalize(fragment)!==normalize(template))throw Error('Renderer changed while updating composition');
fs.writeFileSync(path.join(root,'docs/branding/approved-particle-preview.html'),fragment);
const provenance={approvedOn:'2026-11-02',master:'docs/branding/flute/approved-master.png',masterSha256:sha(masterBytes),originalRendererSha256:sha(template),approvedSourceSha256:sha(fragment),approvedPngSha256:sha(composition),particles,durationMs:3350,names,notes:'Owner approved this exact transparent master in chat. Crops preserve original pixels/colours/nukta; no font substitution. Only the composition data changes in the original particle renderer.'};
fs.writeFileSync(path.join(sourceDir,'source.json'),JSON.stringify(provenance,null,2)+'\n');
console.log(JSON.stringify(provenance,null,2));
