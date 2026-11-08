import fs from 'node:fs/promises';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const rootDir=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require=createRequire(import.meta.url);
const { createCanvas, Image }=require(process.env.BRAND_CANVAS_MODULE || '@napi-rs/canvas');

const fragment=await fs.readFile(path.join(rootDir,'docs/branding/approved-particle-preview.html'),'utf8');
const script=fragment.match(/<script>([\s\S]*?)<\/script>/)[1];
const out=path.resolve(process.argv[2] || path.join(rootDir,'tmp/approved-brand-export'));
await fs.mkdir(out,{recursive:true});
const canvas=createCanvas(720,780);
let replay;
const root={dataset:{},querySelector:selector=>selector==='canvas'?canvas:{addEventListener:(event,fn)=>{replay=fn}}};
const sandbox={document:{getElementById:()=>root,createElement:()=>createCanvas(300,150)},Image,
  window:{matchMedia:()=>({matches:false,addEventListener(){}})},performance:{now:()=>0},
  requestAnimationFrame:()=>1,cancelAnimationFrame(){},Math};
vm.runInNewContext(script,sandbox,{filename:'approved-preview.js'});
for(let i=0;i<200&&!root.vpAnimation?.ready;i++)await new Promise(resolve=>setTimeout(resolve,10));
if(!root.vpAnimation?.ready)throw Error('Original preview image failed to decode');
const brandManifest=JSON.parse(await fs.readFile(path.join(rootDir,'mobile/assets/branding/wordmarks/manifest.json'),'utf8'));
if(Number(root.dataset.particles)!==brandManifest.particles)throw Error('Particle set differs from approved preview');

for(const t of [750,1700,2600,3350]){
  root.vpAnimation.renderAt(t);
  await fs.writeFile(`${out}/source-frame-${t}.png`,canvas.toBuffer('image/png'));
}
const mp4=`${out}/vedansh-approved-preview-exact.mp4`;
const args=['-y','-v','error','-f','rawvideo','-pix_fmt','rgba','-s','720x780','-r','30','-i','pipe:0',
  '-an','-c:v','libx264','-crf','14','-pix_fmt','yuv420p','-movflags','+faststart',mp4];
const encoder=spawn('ffmpeg',args,{stdio:['pipe','inherit','inherit']});
for(let i=0;i<138;i++){
  root.vpAnimation.renderAt(i*1000/30);
  const bytes=Buffer.from(canvas.getContext('2d').getImageData(0,0,720,780).data);
  if(!encoder.stdin.write(bytes))await once(encoder.stdin,'drain');
}
encoder.stdin.end();
const [code]=await once(encoder,'close');if(code!==0)throw Error('MP4 export failed');

const gif=`${out}/vedansh-approved-preview-exact.gif`;
const g=spawn('ffmpeg',['-y','-v','error','-i',mp4,'-filter_complex',
  'fps=18,scale=480:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=256[p];[b][p]paletteuse=dither=sierra2_4a',
  '-loop','0',gif],{stdio:'inherit'});
const [gc]=await once(g,'close');if(gc!==0)throw Error('GIF export failed');

const html=`${out}/vedansh-approved-preview-exact.html`;
const prefix='<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Vedansh particle logo</title><style>body{margin:0;padding:16px 0;background:#fff1d5;color:#84381f}button{font:15px system-ui;background:#fff1d5;color:#84381f;border:1px solid #b88760;border-radius:24px;padding:10px 20px}</style></head><body>\n';
await fs.writeFile(html,prefix+fragment+'\n</body></html>\n');
if(!(await fs.readFile(html,'utf8')).includes(fragment))throw Error('Interactive export source differs');

const manifest={source_sha256:createHash('sha256').update(fragment).digest('hex'),
  source_bytes:Buffer.byteLength(fragment),method:'Executes the original preview JavaScript directly with Canvas2D; no rewritten animation',
  particles:Number(root.dataset.particles),duration_seconds:4.6,frames:138,size:[720,780],files:{}};
for(const file of [mp4,gif,html]){const bytes=await fs.readFile(file);manifest.files[file.split('/').pop()]={bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};}
await fs.writeFile(`${out}/export-verification.json`,JSON.stringify(manifest,null,2));
console.log(JSON.stringify(manifest,null,2));
