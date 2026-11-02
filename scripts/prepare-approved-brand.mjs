import { wrapApprovedParticles } from './brand-particle-host.mjs';
import { correctHindiDots } from './brand-wordmark-corrections.mjs';
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
const expected='437c1c12f44d42b61453ffbfd9c17fdf63254a4fd55ecc821c6fae93de443788';
if(sha(fragment)!==expected)throw Error('Approved particle source changed; review a new reference first');
const encoded=fragment.match(/data:image\/png;base64,([A-Za-z0-9+/=]+)/)?.[1];
if(!encoded)throw Error('Approved composition missing');
const bytes=Buffer.from(encoded,'base64');
const provenance=JSON.parse(fs.readFileSync(path.join(root,'docs/branding/flute/source.json'),'utf8'));
const masterBytes=fs.readFileSync(path.join(root,provenance.master));
if(sha(masterBytes)!==provenance.masterSha256)throw Error('Approved flute master changed');
const originalMaster=PNG.sync.read(masterBytes);
const master=correctHindiDots(originalMaster,PNG,provenance.names.hi.crop);
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
const html=wrapApprovedParticles(fragment);
output.set('mobile/src/branding/approvedParticleDocument.json',JSON.stringify({html})+'\n');
const manifest={approvedSourceSha256:expected,approvedPngSha256:sha(bytes),canvas:{width:720,height:780},particles:4012,durationMs:3350,
  names:{en:latin,hi:hindi},assets:{},lettering:{masterSha256:provenance.masterSha256,style:'approved-flute-peacock',hindiNukta:'round separated dot below sh',hindiDotCorrections:provenance.hindiDotCorrections,fontBinariesBundled:false,samarkanRegistration:'earlier Samarkan-inspired reference registration not verified; confirm before production use'}};
for(const [file,data]of output)manifest.assets[file]={sha256:sha(data),bytes:Buffer.byteLength(data)};
output.set('mobile/assets/branding/wordmarks/manifest.json',JSON.stringify(manifest,null,2)+'\n');
const check=process.argv.includes('--check');
for(const[file,data]of output){const target=path.join(root,file);if(check){if(!fs.existsSync(target)||!Buffer.from(fs.readFileSync(target)).equals(Buffer.from(data)))throw Error(`Regenerate ${file}`);}else{fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,data);}}
console.log(`${check?'Verified':'Prepared'} approved source, 4012 particles, exact approved flute lettering and ${output.size} native assets`);
