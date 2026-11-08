// Actual production components, with only native asset/cache/host adapters.
// BHAKTI_PREVIEW_DEPS=/path/to/preview/node_modules node docs/evaluations/daily-bhakti-flute-branding/preview.mjs
import { mkdir, writeFile, copyFile, readdir, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
const root = fileURLToPath(new URL('../../../', import.meta.url));
const deps = process.env.BHAKTI_PREVIEW_DEPS;
if (!deps) throw new Error('Set BHAKTI_PREVIEW_DEPS to preview node_modules (esbuild/react-dom/react-native-web/playwright).');
const require = createRequire(join(deps, 'package.json'));
const { build } = require('esbuild');
const output = join(root, 'tmp/bhakti-flute-preview');
await mkdir(output, { recursive: true });
const delivery = JSON.parse(await readFile(join(root, 'mobile/src/data/devotionalShareManifest.json'), 'utf8'));
const source = JSON.parse(await readFile(join(root, 'mobile/assets/devotional-share/manifest.json'), 'utf8'));
for (const [id, asset] of Object.entries(delivery.assets)) {
  const name = source.assets[id]?.file ?? source.subjects[id]?.file;
  if (!name) throw new Error(`Missing source for ${id}`);
  await copyFile(join(root, 'mobile/assets/devotional-share', name), join(output, `${asset.hash}.${asset.ext}`));
}
let fontCSS = '';
async function fonts(dir) {
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, item.name);
    if (item.isDirectory()) await fonts(path);
    else if (item.name.endsWith('.ttf')) {
      await copyFile(path, join(output, item.name));
      fontCSS += `@font-face{font-family:"${item.name.slice(0, -4)}";src:url("/${item.name}")}\n`;
    }
  }
}
await fonts(join(root, 'mobile/node_modules/@expo-google-fonts'));
await copyFile(join(root, 'mobile/assets/fonts/VedanshDevotionalText.ttf'), join(output, 'VedanshDevotionalText.ttf'));
fontCSS += '@font-face{font-family:VedanshDevotionalText;src:url("/VedanshDevotionalText.ttf")}';
await build({
  stdin: { contents: `import React,{useState} from 'react';import{createRoot}from'react-dom/client';
    import{View}from'react-native';
    import Card from './mobile/src/components/DevotionalShareCard';
    import{DevotionalHero,DevotionalFooter,DevotionalVerseBody}from './mobile/src/components/DevotionalFrame';
    import{devotionalVerseShareable}from './mobile/src/utils/dailyBhaktiShare';
    import{contentByLang}from './mobile/src/utils/localize';
    import{typography}from './mobile/src/theme/typography';
    import{scaleTypography,fontScaleFactor}from './mobile/src/theme/fontScale';
    import{verseToken,meaningToken}from './mobile/src/utils/langType';
    import{devotionalReaderVerseLeading}from './mobile/src/theme/devotionalFrame';
    import corpus from './mobile/src/data/hanuman-chalisa/hanuman-chalisa.json';
    const q=new URLSearchParams(location.search),lang=q.get('lang')||'hi',art=q.get('art')||'hanuman',width=Number(q.get('width')||540),reader=q.get('reader')==='1';
    const v=corpus.verses.find(v=>v.type==='chaupai'&&v.number===2);
    const share=devotionalVerseShareable({sourceId:'hanuman-chalisa',sectionNameHi:corpus.titleHi,sectionNameEn:corpus.titleEn,verseLabelHi:v.labelHi,verseLabelEn:v.labelEn,linesHi:v.lines,linesEn:v.linesEn,meaningHi:v.meaningHi,meaningEn:v.meaningEn,meaningGu:v.meaningGu,meaningKn:v.meaningKn});
    const page={...share.scopes[0].prepared[lang].pages[0].devotional,art};
    const header=contentByLang(lang,corpus.titleHi+' · '+v.labelHi,corpus.titleEn+' · '+v.labelEn);
    const type=scaleTypography(typography,fontScaleFactor(q.get('size')||'M')),verseType=verseToken(lang,type);
    function App(){const[ready,setReady]=useState(false);return <div id="capture" data-ready={ready} style={{width:reader?width:540}}>{reader?<View style={{width,backgroundColor:'#FAE7BE'}}><DevotionalHero art={art} lang={lang} width={width}/><DevotionalVerseBody header={header} verse={page.verse} meaning={page.meaning} lang={lang} art={art} width={width} verseStyle={{...verseType,lineHeight:lang==='hi'?devotionalReaderVerseLeading(verseType.fontSize):verseType.lineHeight}} meaningStyle={meaningToken(lang,type)}/><DevotionalFooter art={art} width={width}/></View>:<Card header={header} page={page} lang={lang} pageIndex={0} pageCount={1} onReady={setReady}/>}</div>};createRoot(document.getElementById('app')).render(<App/>);`,
    resolveDir: root, loader: 'tsx' },
  outfile: join(output, 'app.js'), bundle: true, platform: 'browser', jsx: 'automatic',
  resolveExtensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.tsx', '.ts', '.jsx', '.js', '.json'],
  nodePaths: [join(root, 'mobile/node_modules'), deps], tsconfig: join(root, 'mobile/tsconfig.json'),
  alias: { 'react-native': join(deps, 'react-native-web'), react: join(root, 'mobile/node_modules/react'), 'react-dom': join(deps, 'react-dom'),
    'react-native-svg': join(root, 'mobile/node_modules/react-native-svg/src/ReactNativeSVG.web.ts') },
  define: { 'process.env.NODE_ENV': '"development"', 'process.env.EXPO_PUBLIC_ASSET_BASE_URL': '"https://cdn.vedansh.app"', __DEV__: 'true' },
  loader: { '.png': 'dataurl' },
  plugins: [{ name: 'preview-adapters', setup(b) {
    b.onResolve({ filter: /backgroundAssetCache$/ }, () => ({ path: 'cache', namespace: 'preview' }));
    b.onResolve({ filter: /ThemeContext$/ }, () => ({ path: 'theme', namespace: 'preview' }));
    b.onLoad({ filter: /.*/, namespace: 'preview' }, ({ path }) => ({ contents: path === 'cache'
      ? 'export function subscribeBackgroundAsset(r,cb){cb("/"+r.key+"."+r.ext);return()=>{}};export async function evictBackgroundAsset(){}'
      : 'export function useTheme(){return{colors:{inkSoft:"#674021"}}}', loader: 'js' }));
  } }],
});
await writeFile(join(output, 'index.html'), `<!doctype html><html><head><meta charset="UTF-8"><style>${fontCSS}html,body{padding:0;margin:0;background:#f3e7c9}#capture{display:block}</style></head><body><div id="app"></div><script src="app.js"></script></body></html>`);
console.log(output);
