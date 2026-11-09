// Component-only visual review, never a substitute for native capture/device acceptance.
// npm install --prefix /tmp/ram-lalla-preview react-native-web@0.21.0 react-dom@19.1.0
// RAM_LALLA_PREVIEW_DEPS=/tmp/ram-lalla-preview/node_modules node docs/evaluations/ram-lalla/preview.mjs
import { mkdir, writeFile, copyFile, readdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { resolve, join } from 'node:path';
const root = fileURLToPath(new URL('../../../', import.meta.url));
const require = createRequire(join(root, 'mobile/package.json'));
const { build } = require('esbuild');
const deps = process.env.RAM_LALLA_PREVIEW_DEPS;
if (!deps) throw new Error('Set RAM_LALLA_PREVIEW_DEPS to the temporary preview node_modules');
const output = resolve(root, 'tmp/ram-lalla-preview');
await mkdir(output, { recursive: true });
const manifest = JSON.parse(await (await import('node:fs/promises')).readFile(join(root, 'mobile/src/data/suvicharManifest.json'), 'utf8'));
for (const frame of ['mandir-jharokha', 'pushp-aangan', 'bhakti-patra']) {
  await copyFile(join(root, `mobile/assets/suvichar/rama--${frame}.webp`), join(output, `${manifest.assets[`rama--${frame}`].hash}.webp`));
}
await copyFile(join(root, 'mobile/assets/suvichar/photos/ram-lalla-ayodhya.jpg'), join(output, 'f02f160854115012.jpg'));
const fontDirs = ['noto-serif-devanagari', 'noto-serif-gujarati', 'noto-serif-kannada', 'cormorant-garamond'];
let fontCSS = '';
for (const folder of fontDirs) {
  const base = join(root, `mobile/node_modules/@expo-google-fonts/${folder}`);
  for (const dir of await readdir(base, { withFileTypes: true })) {
    if (!dir.isDirectory() || !/^\d/.test(dir.name)) continue;
    for (const name of await readdir(join(base, dir.name))) if (name.endsWith('.ttf')) {
      await copyFile(join(base, dir.name, name), join(output, name));
      fontCSS += `@font-face{font-family:"${name.slice(0, -4)}";src:url("${name}")}\n`;
    }
  }
}
await build({
  stdin: { contents: `import React,{useState} from 'react';import{createRoot}from'react-dom/client';
    import SuvicharCard from './mobile/src/components/SuvicharCard';
    import{contentByLang}from './mobile/src/utils/localize';
    const q=new URLSearchParams(location.search),lang=q.get('lang')||'hi',frame=q.get('frame')||'mandir-jharokha',width=Number(q.get('width')||540);
    function App(){const[ready,setReady]=useState(false);return <div id="capture" data-ready={ready} style={{width}}><SuvicharCard deity="ram-lalla" frame={frame} lang={lang} width={width} name={contentByLang(lang,'शर्मा परिवार','Sharma family')} message={contentByLang(lang,'राम का नाम लीजिए और अपने हिस्से का प्रयास कीजिए। अगला कदम वहीं से मिलेगा।',"Take Ram's name and do your part. That is where you can find your next step.")} attribution={contentByLang(lang,'वेदांश · मौलिक विचार','Vedansh · Original reflection')} onReady={setReady}/></div>};createRoot(document.getElementById('app')).render(<App/>);`,
    resolveDir: root, loader: 'tsx' },
  outfile: join(output, 'app.js'), bundle: true, platform: 'browser', jsx: 'automatic',
  nodePaths: [join(root, 'mobile/node_modules'), deps], tsconfig: join(root, 'mobile/tsconfig.json'),
  alias: { 'react-native': join(deps, 'react-native-web'), react: join(root, 'mobile/node_modules/react'), 'react-dom': join(deps, 'react-dom') },
  define: { 'process.env.NODE_ENV': '"development"', 'process.env.EXPO_PUBLIC_ASSET_BASE_URL': '"https://cdn.vedansh.app"', __DEV__: 'true' },
  loader: { '.png': 'dataurl' },
  plugins: [{ name: 'preview-adapters', setup(b) {
    b.onResolve({ filter: /backgroundAssetCache$/ }, () => ({ path: 'cache', namespace: 'preview' }));
    b.onResolve({ filter: /FontScaleContext$/ }, () => ({ path: 'fontscale', namespace: 'preview' }));
    b.onLoad({ filter: /.*/, namespace: 'preview' }, ({ path }) => ({ contents: path === 'cache'
      ? 'export function subscribeBackgroundAsset(r, cb){cb("/"+r.key+"."+r.ext);return()=>{}};export async function evictBackgroundAsset(){}'
      : 'export function useFontScale(){return {factor:1}}', loader: 'js' }));
  } }],
});
await writeFile(join(output, 'index.html'), `<!doctype html><html><head><meta charset="UTF-8"><style>${fontCSS}html,body{padding:0;margin:0;background:#f3e7c9}#capture{display:block}</style></head><body><div id="app"></div><script src="app.js"></script></body></html>`);
console.log(output);
