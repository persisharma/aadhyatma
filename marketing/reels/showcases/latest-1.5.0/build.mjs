// Render real, locale-matched app screens with synthetic narration.
// See README.md for dependencies and voice generation. No app/network mutations.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const require = createRequire(import.meta.url);
const {chromium} = require('playwright');
const run = promisify(execFile);
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../../..');
const out = path.resolve(process.argv[2] || path.join(root, 'marketing/reels/out/latest-1.5.0'));
const cfg = JSON.parse(fs.readFileSync(path.join(here, 'storyboard.json')));
fs.mkdirSync(out, {recursive:true});
const command = async (bin,args) => {
  try { return await run(bin,args,{maxBuffer:1<<25}); }
  catch(e) { throw Error((e.stderr || e.message).slice(-5000)); }
};
const probe = async file => JSON.parse((await command('ffprobe',['-v','error','-show_streams','-show_format','-of','json',file])).stdout);
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const data = (file,type) => `data:${type};base64,${fs.readFileSync(file).toString('base64')}`;
const esc = text => text.replaceAll('&','&amp;').replaceAll('<','&lt;');
const fonts = {
  Dev: data(path.join(root,'mobile/node_modules/@expo-google-fonts/noto-serif-devanagari/600SemiBold/NotoSerifDevanagari_600SemiBold.ttf'),'font/ttf'),
  Inter: data(path.join(root,'mobile/node_modules/@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf'),'font/ttf'),
};
const icon = data(path.join(root,'mobile/assets/icon.png'),'image/png');
const stamp = sec => new Date(Math.round(sec*1000)).toISOString().slice(11,23).replace('.',',');
const browser = await chromium.launch({headless:true});
const page = await browser.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1});
const manifests = [];
try {
  for (const lang of ['hi','en']) {
    const durations = await Promise.all(cfg.scenes.map(async (_,i) => Number((await probe(path.join(out,`voice-${lang}-${i}.mp3`))).format.duration)));
    const rawTotal = durations.reduce((a,b)=>a+b,0)+cfg.scenes.length*.45;
    const speed = Math.max(1,rawTotal/39);
    if(speed>1.18) throw Error('Narration too long; shorten the script instead of rushing it');
    let at=0;
    const scenes=[];
    for (const [i,scene] of cfg.scenes.entries()) {
      const text=scene[lang];
      const source=path.join(here,'screens',lang,scene.screen);
      const duration=Math.ceil((durations[i]/speed+.45)*30)/30;
      const html=`<!doctype html><html lang="${lang}"><meta charset="utf-8"><style>
      @font-face{font-family:Dev;src:url('${fonts.Dev}')}@font-face{font-family:Inter;src:url('${fonts.Inter}')}
      *{box-sizing:border-box}html,body{margin:0;width:1080px;height:1920px;overflow:hidden}
      body{background:radial-gradient(ellipse at 50% 40%,#fff5dc,#f3e7c9 75%);color:#542c16;font-family:${lang==='hi'?'Dev':'Inter'}}
      .brand{position:absolute;top:104px;left:80px;display:flex;align-items:center;gap:18px;font-family:Inter;font-size:28px;letter-spacing:4px;color:#8b461d}
      .brand img{width:50px;height:50px;border-radius:12px}h1{position:absolute;left:72px;top:170px;width:936px;margin:0;font-size:${lang==='hi'?50:49}px;line-height:1.7;text-align:center;font-weight:500}
      .sub{position:absolute;left:80px;top:285px;width:920px;text-align:center;font-size:29px;line-height:1.7;color:#85532c}
      .screen{position:absolute;left:172px;top:350px;width:736px;height:1308.444px;box-shadow:0 14px 45px #613b232c}
      .screen img{display:block;width:100%;height:100%;object-fit:contain}
      .footer{position:absolute;top:1702px;width:1080px;text-align:center;font-family:Inter;font-size:28px;color:#8b461d;letter-spacing:2px}
      .progress{position:absolute;top:164px;left:80px;width:920px;display:flex;gap:10px}.progress span{height:3px;flex:1;background:#c59b6240}.progress .active{background:#a75d2b}
      </style><div class="brand"><img src="${icon}">VEDANSH</div><div class="progress">${cfg.scenes.map((_,j)=>`<span class="${i===j?'active':''}"></span>`).join('')}</div><h1>${esc(text.title)}</h1><div class="sub">${esc(text.subtitle)}</div><div class="screen"><img src="${data(source,'image/png')}"></div><div class="footer">vedansh.app</div></html>`;
      await page.setContent(html);
      await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(x=>x.decode()));});
      const bounds=await page.locator('h1,.sub,.screen,.footer').evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect();return {text:e.textContent,x:r.x,y:r.y,width:r.width,height:r.height,overflow:e.scrollWidth>e.clientWidth};}));
      if(bounds.some(b=>b.overflow || b.x<0 || b.x+b.width>1080 || b.y+b.height>1780) || bounds[0].y+bounds[0].height>268 || bounds[1].y+bounds[1].height>340)throw Error('Unsafe frame layout '+JSON.stringify(bounds));
      const frame=path.join(out,`frame-${lang}-${i}.png`);
      await page.screenshot({path:frame});
      scenes.push({id:scene.id,start:at,duration,voiceDuration:durations[i]/speed,source:path.relative(root,source),sourceSha256:hash(source),frame,text,bounds});
      at+=duration;
    }
    if(at<30 || at>40)throw Error('Video duration outside approved 30–40s: '+at);
    const list=path.join(out,`frames-${lang}.txt`);
    // Paths passed as process arguments; ffconcat additionally escapes single quotes.
    const quote=s=>s.replaceAll("'", "'\\''");
    fs.writeFileSync(list,scenes.map(s=>`file '${quote(s.frame)}'\nduration ${s.duration}`).join('\n')+`\nfile '${quote(scenes.at(-1).frame)}'\n`);
    const audio=cfg.scenes.map((_,i)=>['-i',path.join(out,`voice-${lang}-${i}.mp3`)]).flat();
    const filter=scenes.map((s,i)=>`[${i+1}:a]atempo=${speed},aformat=sample_rates=48000:channel_layouts=stereo,asetpts=PTS-STARTPTS,loudnorm=I=-16:TP=-1.5:LRA=7,aresample=48000,asetpts=N/SR/TB,adelay=${Math.round((s.start+.1)*1000)}:all=1[a${i}]`).join(';')+`;${scenes.map((_,i)=>`[a${i}]`).join('')}amix=inputs=${scenes.length}:normalize=0,aresample=48000,asetpts=N/SR/TB,apad[a]`;
    const file=path.join(out,`vedansh-latest-${lang}.mp4`);
    await command('ffmpeg',['-y','-hide_banner','-loglevel','error','-f','concat','-safe','0','-i',list,...audio,'-filter_complex',filter,'-map','0:v','-map','[a]','-vf','fps=30,format=yuv420p','-t',String(at),'-c:v','libx264','-preset','fast','-crf','18','-threads','3','-c:a','aac','-b:a','192k','-ar','48000','-movflags','+faststart',file]);
    fs.writeFileSync(path.join(out,`voiceover-${lang}.srt`),scenes.map((s,i)=>`${i+1}\n${stamp(s.start+.1)} --> ${stamp(s.start+.1+s.voiceDuration)}\n${s.text.narration}\n`).join('\n'));
    const select=scenes.map(s=>`eq(n,${Math.round((s.start+s.duration/2)*30)})`).join('+');
    await command('ffmpeg',['-y','-hide_banner','-loglevel','error','-i',file,'-vf',`select='${select}',scale=270:480,tile=5x1:padding=8:margin=8:color=0xf3e7c9`,'-frames:v','1',path.join(out,`review-${lang}.jpg`)]);
    const volume=await command('ffmpeg',['-hide_banner','-i',file,'-af','volumedetect','-vn','-sn','-dn','-f','null','-']);
    fs.writeFileSync(path.join(out,`volume-${lang}.log`),volume.stderr);
    const media=await probe(file);
    if(!media.streams.some(s=>s.codec_type==='audio') || !/mean_volume: -[12]\d\./.test(volume.stderr))throw Error('Missing or unexpectedly quiet narration');
    manifests.push({lang,file:path.relative(root,file),duration:at,speed,voiceType:cfg.voiceType,outputSha256:hash(file),media,scenes});
    console.log(lang+' complete: '+at.toFixed(2)+' seconds');
  }
} finally {await browser.close();}
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifests,null,2)+'\n');
