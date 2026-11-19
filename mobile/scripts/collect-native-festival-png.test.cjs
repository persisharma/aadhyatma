const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { PNG } = require('pngjs');
function fixture(fn) {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'festival-native-png-'));
  fs.mkdirSync(path.join(root,'tmp','ReactNative'),{recursive:true});
  try { fn(root); } finally { fs.rmSync(root,{recursive:true,force:true}); }
}
function image(root,{height=1350,blank=false,alpha=255,folder='ReactNative',old=false}={}) {
  const png=new PNG({width:1080,height});
  for(let i=0;i<png.data.length;i+=4){png.data[i]=blank?255:244;png.data[i+1]=blank?255:231;png.data[i+2]=blank?255:201;png.data[i+3]=alpha;}
  const dir=path.join(root,'tmp',folder);fs.mkdirSync(dir,{recursive:true});
  const p=path.join(dir,'capture.png');fs.writeFileSync(p,PNG.sync.write(png));
  if(old)fs.utimesSync(p,1,1);
  return p;
}
function run(root,focused=false) {return spawnSync(process.execPath,[path.join(__dirname,'collect-native-festival-png.cjs'),root,String(Date.now()-2000),path.join(root,'out.png'),String(focused)],{encoding:'utf8'});}
test('collects the native export and records exact dimensions/hash',()=>fixture(root=>{const original=image(root);const r=run(root);assert.equal(r.status,0,r.stderr);const m=JSON.parse(r.stdout);assert.equal(m.width,1080);assert.equal(m.height,1350);assert.match(m.sha256,/^[a-f0-9]{64}$/);assert.deepEqual(fs.readFileSync(path.join(root,'out.png')),fs.readFileSync(original));}));
test('rejects an old capture left by another case',()=>fixture(root=>{image(root,{old:true});assert.notEqual(run(root).status,0);}));
test('rejects a downloaded asset outside the ReactNative capture directory',()=>fixture(root=>{image(root,{folder:'download'});assert.notEqual(run(root).status,0);}));
test('rejects blank output',()=>fixture(root=>{image(root,{blank:true});assert.notEqual(run(root).status,0);}));
test('rejects transparent output',()=>fixture(root=>{image(root,{alpha:0});assert.notEqual(run(root).status,0);}));
test('full Panchang rejects a changed height; focused export permits growth',()=>fixture(root=>{image(root,{height:1600});assert.notEqual(run(root).status,0);const r=run(root,true);assert.equal(r.status,0,r.stderr);assert.equal(JSON.parse(r.stdout).height,1600);}));
