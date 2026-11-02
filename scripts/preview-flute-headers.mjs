import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire(path.join(root,'mobile/package.json'));
const {PNG}=require('pngjs');
const {createCanvas,Image,GlobalFonts}=require(process.env.BRAND_CANVAS_MODULE||'@napi-rs/canvas');
GlobalFonts.registerFromPath(path.join(root,'mobile/node_modules/@expo-google-fonts/noto-serif-devanagari/700Bold/NotoSerifDevanagari_700Bold.ttf'),'Om');
GlobalFonts.registerFromPath(path.join(root,'mobile/node_modules/@expo-google-fonts/noto-serif-devanagari/400Regular/NotoSerifDevanagari_400Regular.ttf'),'Hindi');
GlobalFonts.registerFromPath(path.join(root,'mobile/node_modules/@expo-google-fonts/cormorant-garamond/400Regular_Italic/CormorantGaramond_400Regular_Italic.ttf'),'English');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'mobile/assets/branding/wordmarks/manifest.json')));
const canvas=createCanvas(1170,660),ctx=canvas.getContext('2d');ctx.scale(3,3);ctx.fillStyle='#FFF1D5';ctx.fillRect(0,0,390,220);
for(const [kind,offset]of [['en',20],['hi',125]]){
 const m=manifest.names[kind],frame=m.homeFrame,w=Math.min(frame.width,frame.height*m.width/m.height),h=w*m.height/m.width;
 const image=new Image();image.src=PNG.sync.write(PNG.sync.read(fs.readFileSync(path.join(root,m.file))));await image.decode();
 const rowWidth=frame.width+60+44+44, left=(390-rowWidth)/2,cy=offset+21;
 ctx.fillStyle='#AD571F';ctx.globalAlpha=.6;ctx.fillRect(left,cy,22,1);ctx.fillRect(left+rowWidth-22,cy,22,1);ctx.globalAlpha=1;
 const cx1=left+22+11+15,cx2=left+rowWidth-22-11-15;
 for(const cx of [cx1,cx2]){ctx.strokeStyle='#AD571F';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(cx,cy,15,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#AD571F';ctx.font='19px Om';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('ॐ',cx,cy+1.5);}
 ctx.drawImage(image,(390-w)/2,offset+(42-h)/2,w,h);
 ctx.fillStyle='#5A3A1E';ctx.font=kind==='en'?'14px English':'14px Hindi';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(kind==='en'?'Your spiritual companion':'आपका आध्यात्मिक साथी',195,offset+42+5+11);
}
fs.writeFileSync(path.join(root,'docs/reviews/flute/header-scale.png'),canvas.toBuffer('image/png'));
console.log('Source-asset geometry review only; not a native screenshot.');
