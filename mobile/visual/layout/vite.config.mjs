import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const root=path.dirname(new URL(import.meta.url).pathname);
const mobile=path.resolve(root,'../..');
const modules=process.env.LAYOUT_BROWSER_MODULES||path.resolve(root,'../kundali/node_modules');
const src=path.join(mobile,'src');
export default {root,esbuild:{jsx:'automatic'},define:{__DEV__:'false',global:'globalThis'},resolve:{alias:[
{find:/^react-native$/,replacement:path.join(modules,'react-native-web/dist/index.js')},
{find:/^react-native-safe-area-context$/,replacement:path.join(root,'insets.jsx')},
{find:'@/data/gita/language',replacement:path.join(root,'state.jsx')},
{find:'@/contexts/FontScaleContext',replacement:path.join(root,'state.jsx')},
{find:'@/contexts/AudioPlayerContext',replacement:path.join(root,'state.jsx')},
{find:'@/components/AppIcon',replacement:path.join(root,'icons.jsx')},
{find:'@/components/DeityIcon',replacement:path.join(root,'deity.jsx')},
{find:'@/data/deities',replacement:path.join(root,'state.jsx')},
{find:'@',replacement:src},
{find:/^react$/,replacement:path.join(mobile,'node_modules/react')},
{find:'react-dom',replacement:path.join(modules,'react-dom')},
]},server:{host:'127.0.0.1',port:Number(process.env.LAYOUT_PORT||4178),strictPort:true,fs:{allow:[mobile,modules]}},plugins:[{
name:'native-adapters',enforce:'pre',transform(code,id){
 const relative=path.relative(mobile,id);
 if(process.env.LAYOUT_BASE_REF&&['src/components/ReaderHeader.tsx','src/screens/audio/NowPlayingScreen.tsx'].includes(relative))
   code=execFileSync('git',['show',process.env.LAYOUT_BASE_REF+':mobile/'+relative],{cwd:mobile,encoding:'utf8'});
 if(id.endsWith('/ReaderHeader.tsx'))code=code.replace("from './AppIcon'",`from '${root}/icons.jsx'`);
 return code;
}}, {name:'font-css',configureServer(server){
 server.middlewares.use('/fonts.css',(_req,res)=>{let css='';function walk(p){for(const e of fs.readdirSync(p,{withFileTypes:true})){const f=path.join(p,e.name);if(e.isDirectory())walk(f);else if(e.name.endsWith('.ttf'))css+=`@font-face{font-family:'${path.basename(f,'.ttf')}';src:url('/@fs/${f}');font-display:block}\n`;}}walk(path.join(mobile,'node_modules/@expo-google-fonts'));res.setHeader('Content-Type','text/css');res.end(css);});
}}]};
