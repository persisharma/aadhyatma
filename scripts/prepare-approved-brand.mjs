import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire(path.join(root,'mobile/package.json'));
const {PNG}=require('pngjs');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const fragment=fs.readFileSync(path.join(root,'docs/branding/approved-particle-preview.html'),'utf8');
const expected='80603c5af3b2095a3092b177de8c8414698869960ec0ef0ecbd52108de3243c9';
if(sha(fragment)!==expected)throw Error('Approved particle source changed; review a new reference first');
const encoded=fragment.match(/data:image\/png;base64,([A-Za-z0-9+/=]+)/)?.[1];
if(!encoded)throw Error('Approved composition missing');
const bytes=Buffer.from(encoded,'base64');
const provenance=JSON.parse(fs.readFileSync(path.join(root,'docs/branding/flute/source.json'),'utf8'));
const masterBytes=fs.readFileSync(path.join(root,provenance.master));
if(sha(masterBytes)!==provenance.masterSha256)throw Error('Approved flute master changed');
const master=PNG.sync.read(masterBytes);
const output=new Map();
output.set('mobile/assets/branding/wordmarks/approved-lockup.png',bytes);
const crop=(lang,name)=>{
  const spec=provenance.names[lang];
  const [left,top]=spec.crop;
  const image=new PNG({width:spec.width,height:spec.height});
  PNG.bitblt(master,image,left,top,image.width,image.height,0,0);
  const file=`mobile/assets/branding/wordmarks/${name}.png`;
  output.set(file,PNG.sync.write(image));
  return {...spec,file};
};
const latin=crop('en','english');
const hindi=crop('hi','hindi');

// These additions affect only native hosting/bridge. The approved fragment,
// including every particle, trajectory, colour and timing expression is intact.
const bridge=`<script>(()=>{const root=document.getElementById('vedansh-calligraphic-particles');let started=false;const send=type=>window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify({type}));const timer=setInterval(()=>{const animation=root.vpAnimation;if(!animation||!animation.ready)return;if(!started){started=true;send('brand-ready');}if(animation.elapsed>=3350){clearInterval(timer);send('brand-complete');}},32);window.addEventListener('pagehide',()=>clearInterval(timer));})()</script>`;
const style=`html,body{margin:0;width:100%;height:100%;background:#fff1d5;overflow:hidden}body{display:flex;align-items:center;justify-content:center}#vedansh-calligraphic-particles{width:100%;max-width:460px}#vedansh-calligraphic-particles .vp-actions{display:none!important}#vedansh-calligraphic-particles .vp-stage{max-width:100%}@media(max-height:540px){#vedansh-calligraphic-particles{width:min(100vw,calc(100vh * 12 / 13))}}`;
const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; script-src 'unsafe-inline'; style-src 'unsafe-inline'"><style>${style}</style></head><body>${fragment}${bridge}</body></html>`;
output.set('mobile/src/branding/approvedParticleDocument.json',JSON.stringify({html})+'\n');
const manifest={approvedSourceSha256:expected,approvedPngSha256:sha(bytes),canvas:{width:720,height:780},particles:4016,durationMs:3350,
  names:{en:latin,hi:hindi},assets:{},lettering:{masterSha256:provenance.masterSha256,style:'approved-flute-peacock',hindiNukta:'baked into approved master',fontBinariesBundled:false,samarkanRegistration:'earlier Samarkan-inspired reference registration not verified; confirm before production use'}};
for(const [file,data]of output)manifest.assets[file]={sha256:sha(data),bytes:Buffer.byteLength(data)};
output.set('mobile/assets/branding/wordmarks/manifest.json',JSON.stringify(manifest,null,2)+'\n');
const check=process.argv.includes('--check');
for(const[file,data]of output){const target=path.join(root,file);if(check){if(!fs.existsSync(target)||!Buffer.from(fs.readFileSync(target)).equals(Buffer.from(data)))throw Error(`Regenerate ${file}`);}else{fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,data);}}
console.log(`${check?'Verified':'Prepared'} approved source, 4016 particles, exact approved flute lettering and ${output.size} native assets`);
