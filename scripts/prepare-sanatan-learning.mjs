#!/usr/bin/env node
/** Prepare uploads without activating unverified CDN objects. No upload occurs here. */
import {readFileSync,writeFileSync,mkdirSync,copyFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(import.meta.dirname,'..');
const sources=JSON.parse(readFileSync(path.join(root,'docs/content-parity/sanatan-parichay/visual-learning/artwork.json'),'utf8'));
const staging=path.join(root,'scripts/.cache/sanatan-learning');
const candidate={prefix:sources.prefix,assets:{}};let bytes=0;
for(const [stem,a] of Object.entries(sources.assets)){
 const data=readFileSync(path.join(root,a.file));bytes+=data.length;
 assert.equal(createHash('sha256').update(data).digest('hex'),a.sha256,`Changed artwork: ${stem}`);
 assert.ok(data.length<250000,`Image decode/download budget: ${stem}`);
 candidate.assets[stem]={hash:a.hash,ext:a.ext,width:a.width,height:a.height};
}
assert.ok(bytes<500000,'Combined artwork budget exceeded');
if(process.argv.includes('--activate')){
 assert.ok(process.argv.includes('--cdn'),'Activation requires --cdn public byte verification');
}
if(process.argv.includes('--cdn')){
 const base=(process.env.EXPO_PUBLIC_ASSET_BASE_URL||'https://cdn.vedansh.app').replace(/\/+$/,'');
 assert.ok(base.startsWith('https://'));
 for(const [stem,a] of Object.entries(sources.assets)){
  const r=await fetch(`${base}/${sources.prefix}/${a.hash}.${a.ext}`);assert.ok(r.ok,`${stem}: HTTP ${r.status}`);
  const b=Buffer.from(await r.arrayBuffer());assert.equal(createHash('sha256').update(b).digest('hex'),a.sha256,`${stem}: CDN bytes differ`);
 }
 if(process.argv.includes('--activate'))writeFileSync(path.join(root,'mobile/src/data/sanatan-parichay/lessonArtManifest.json'),JSON.stringify(candidate,null,2)+'\n');
}
mkdirSync(staging,{recursive:true});
for(const a of Object.values(sources.assets))copyFileSync(path.join(root,a.file),path.join(staging,`${a.hash}.${a.ext}`));
writeFileSync(path.join(staging,'manifest.json'),JSON.stringify(candidate,null,2)+'\n');
writeFileSync(path.join(staging,'upload-files.json'),JSON.stringify(Object.values(sources.assets).map(a=>({file:path.basename(a.file),key:`${sources.prefix}/${a.hash}.${a.ext}`,sha256:a.sha256})),null,2)+'\n');
console.log(`Prepared ${Object.keys(candidate.assets).length} paintings (${bytes} bytes); ${process.argv.includes('--activate')?'public bytes verified and activated':'runtime manifest unchanged'}.`);
