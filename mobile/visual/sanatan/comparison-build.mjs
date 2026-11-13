import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url),root=path.dirname(fileURLToPath(import.meta.url)),mobile=path.resolve(root,'../..');
const {build}=require(path.join(mobile,'node_modules/esbuild'));
const src=path.join(mobile,'src'),modules=path.join(root,'node_modules'),dist=path.join(root,'dist');
fs.mkdirSync(path.join(dist,'assets'),{recursive:true});fs.mkdirSync(path.join(dist,'fonts'),{recursive:true});
const platform=path.join(root,'src/platform.tsx');
const services=['@/data/gita/language','@/contexts/FontScaleContext','@react-native-async-storage/async-storage','react-native-safe-area-context','expo-linear-gradient','expo-haptics','@/screens/_useAutoSlide','@/utils/shareVerse','@/utils/useCachedAsset'];
await build({entryPoints:[path.join(root,'src/comparison.tsx')],outfile:path.join(dist,'comparison.cjs'),bundle:true,platform:'node',format:'cjs',jsx:'automatic',resolveExtensions:['.web.tsx','.web.ts','.web.js','.tsx','.ts','.jsx','.js','.json'],banner:{js:'global.location={search:process.argv[2]||"?lang=hi&page=2"};'},define:{__DEV__:'false','process.env':'{}',global:'globalThis'},loader:{'.js':'jsx'},plugins:[{name:'native-platform',setup(b){
 b.onResolve({filter:/.*/},args=>{
  if(services.includes(args.path))return{path:platform};
  if(args.path==='react-native')return{path:path.join(root,'src/comparison-native.tsx')};
  if(args.path==='react-native-svg')return{path:path.join(mobile,'node_modules/react-native-svg/src/ReactNativeSVG.web.ts')};
  if(args.path==='react'||args.path==='react/jsx-runtime')return{path:require.resolve(args.path,{paths:[mobile]})};
  if(args.path.startsWith('react-dom'))return{path:require.resolve(args.path,{paths:[root]})};
  if(args.path==='./CachedArtwork'||args.path==='@/components/CachedArtwork')return{path:platform,namespace:'cached-adapter'};
  if(args.path.startsWith('@/')){const base=path.join(src,args.path.slice(2));for(const suffix of['.tsx','.ts','.js','.json','/index.ts','/index.tsx'])if(fs.existsSync(base+suffix))return{path:base+suffix};}
 });
 b.onLoad({filter:/.*/,namespace:'cached-adapter'},()=>({contents:`import React from 'react'; import {Image,View} from 'react-native'; export default function Artwork({source,style,imageStyle,resizeMode='cover',fallback}) { const uri=source?.kind==='sanatan-lesson-art'?'/assets/sanatan-learning-'+source.stem+'.webp':source?.uri; return uri?<Image source={{uri}} style={[style,imageStyle]} resizeMode={resizeMode}/>:<View style={style}>{fallback}</View>; }`,loader:'tsx',resolveDir:root}));
 b.onLoad({filter:/lessonArtManifest\.json$/},()=>({contents:fs.readFileSync(path.resolve(mobile,'../scripts/.cache/sanatan-learning/manifest.json'),'utf8'),loader:'json'}));
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

for(const stem of ["ganesha-attributes","tulasi-objects"])fs.copyFileSync(path.join(mobile,"assets/sanatan-learning",stem+".webp"),path.join(dist,"assets","sanatan-learning-"+stem+".webp"));
