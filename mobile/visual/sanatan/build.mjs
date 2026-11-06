import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url),root=path.dirname(fileURLToPath(import.meta.url)),mobile=path.resolve(root,'../..');
const {build}=require(path.join(mobile,'node_modules/esbuild'));
const src=path.join(mobile,'src'),modules=path.join(root,'node_modules'),dist=path.join(root,'dist');
fs.mkdirSync(path.join(dist,'assets'),{recursive:true});fs.mkdirSync(path.join(dist,'fonts'),{recursive:true});
const platform=path.join(root,'src/platform.tsx');
const services=['@/data/gita/language','@/contexts/FontScaleContext','@react-native-async-storage/async-storage','react-native-safe-area-context','expo-linear-gradient','expo-haptics','@/screens/_useAutoSlide','@/utils/shareVerse'];
await build({entryPoints:[path.join(root,'src/main.tsx')],outfile:path.join(dist,'app.js'),bundle:true,platform:'browser',format:'iife',jsx:'automatic',resolveExtensions:['.web.tsx','.web.ts','.web.js','.tsx','.ts','.jsx','.js','.json'],define:{__DEV__:'false','process.env':'{}',global:'globalThis'},loader:{'.js':'jsx'},plugins:[{name:'native-platform',setup(b){
 b.onResolve({filter:/.*/},args=>{
  if(services.includes(args.path))return{path:platform};
  if(args.path==='react-native')return{path:path.join(root,'src/native.tsx')};
  if(args.path==='react-native-svg')return{path:path.join(mobile,'node_modules/react-native-svg/src/ReactNativeSVG.web.ts')};
  if(args.path==='react'||args.path==='react/jsx-runtime')return{path:require.resolve(args.path,{paths:[mobile]})};
  if(args.path.startsWith('react-dom'))return{path:require.resolve(args.path,{paths:[root]})};
  if(args.path==='./CachedArtwork'||args.path==='@/components/CachedArtwork')return{path:platform,namespace:'cached-adapter'};
  if(args.path.startsWith('@/')){const base=path.join(src,args.path.slice(2));for(const suffix of['.tsx','.ts','.js','.json','/index.ts','/index.tsx'])if(fs.existsSync(base+suffix))return{path:base+suffix};}
 });
 b.onLoad({filter:/.*/,namespace:'cached-adapter'},()=>({contents:"export {CachedArtwork as default} from '"+platform+"';",loader:'tsx',resolveDir:root}));
 b.onLoad({filter:/\.[tj]sx?$/},args=>{
  if(args.path.includes('node_modules'))return;
  let code=fs.readFileSync(args.path,'utf8');
  code=code.replace(/require\(['"]([^'"]+\.(?:png|webp|jpe?g))['"]\)/g,(_match,asset)=>{
   const full=asset.startsWith('@assets/')?path.join(mobile,'assets',asset.slice(8)):path.resolve(path.dirname(args.path),asset);
   const name=full.slice(full.indexOf('/assets/')+8).replaceAll('/','-');
   if(fs.existsSync(full))fs.copyFileSync(full,path.join(dist,'assets',name));
   return JSON.stringify({uri:'/assets/'+name,width:960,height:640});
  });
  return{contents:code,loader:args.path.endsWith('.tsx')||args.path.endsWith('.jsx')?'tsx':'ts',resolveDir:path.dirname(args.path)};
 });
}}]});
let fonts='';
function walk(directory){for(const entry of fs.readdirSync(directory,{withFileTypes:true})){const full=path.join(directory,entry.name);if(entry.isDirectory())walk(full);else if(entry.name.endsWith('.ttf')){fs.copyFileSync(full,path.join(dist,'fonts',entry.name));fonts+="@font-face{font-family:'"+entry.name.slice(0,-4)+"';src:url('/fonts/"+entry.name+"');font-display:block}\n";}}}
walk(path.join(mobile,'node_modules/@expo-google-fonts'));
fs.writeFileSync(path.join(dist,'fonts.css'),fonts);
fs.writeFileSync(path.join(dist,'index.html'),'<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/><link rel="stylesheet" href="/fonts.css"/><style>html,body,#root{height:100%;margin:0;background:#f3e7c9}*{box-sizing:border-box}#root{width:min(100vw,var(--preview-width,390px));margin:auto}</style></head><body><div id="root"></div><script>document.documentElement.style.setProperty("--preview-width",(Number(new URLSearchParams(location.search).get("width"))||390)+"px")</script><script src="/app.js"></script></body></html>');
console.log('Built actual React Native components for browser layout verification; native device QA remains separate.');
