// Vedansh "bhajan cut": a fast, beat-cut feature reel. Real app screens shown full-bleed like a screen
// recording (scrolling, tap marks), cut on the tracked beats of the app's own recorded "Govind Bolo" bhajan.
// No synthetic voice. Frames are rendered deterministically in Chromium and piped to ffmpeg.
//
// Usage: python beats.py            (once, or after changing the audio start)
//        node build.mjs [--lang hi|en|all] [--out <dir>] [--preview]
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawn, execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {fileURLToPath, pathToFileURL} from 'node:url';

const require = createRequire(import.meta.url);
const {chromium} = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../../..');
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const preview = process.argv.includes('--preview');
const langs = arg('lang', 'all') === 'all' ? ['hi', 'en'] : [arg('lang')];
const out = path.resolve(arg('out', path.join(root, 'marketing/reels/out/bhajan-cut')));
const board = JSON.parse(fs.readFileSync(path.join(here, 'storyboard.json'), 'utf8'));
const beatFile = JSON.parse(fs.readFileSync(path.join(here, 'beats.json'), 'utf8'));
const {width: W, height: H, fps} = board.format;
fs.mkdirSync(out, {recursive: true});

const sha = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const esc = s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;');
const fileUrl = rel => pathToFileURL(path.join(root, rel)).href;
const run = (bin, args) => execFileSync(bin, args, {stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 26}).toString();

const audioSrc = path.join(root, board.audio.file);
if (beatFile.file !== board.audio.file || beatFile.sha256 !== sha(audioSrc)) throw Error('beats.json is stale: run beats.py');
const B = beatFile.beats;
let b = 0;
const shots = board.shots.map(s => { const r = {...s, start: B[b], end: B[b + s.beats]}; b += s.beats; return r; });
const total = Math.ceil((shots.at(-1).end + 0.25) * fps) / fps;
const beatTimes = B.filter(x => x <= total);

function pageHtml(lang) {
  const cap = k => board.captions[k][lang];
  const shotHtml = shots.map((s, i) => {
    if (s.cta) {
      const c = cap('cta');
      return `<section class="shot cta" data-i="${i}">
        <img class="ctabg" src="${fileUrl('mobile/assets/devotional-share/krishna.webp')}">
        <div class="art"><img src="${fileUrl('mobile/assets/devotional-share/krishna.webp')}"></div>
        <div class="card"><div class="row"><img class="icon" src="${fileUrl('mobile/assets/icon.png')}"><img class="mark" src="${fileUrl(`mobile/assets/branding/wordmarks/${lang === 'hi' ? 'hindi' : 'english'}.png`)}"></div>
        <div class="tag">${esc(c.tagline)}</div><div class="btn">${esc(c.button)}</div><div class="trust">${esc(c.trust)}</div></div></section>`;
    }
    const src = typeof s.screen === 'string' ? s.screen : s.screen[lang];
    if (!fs.existsSync(path.join(root, src))) throw Error(`Missing ${src}`);
    const [main, sub] = cap(s.caption);
    return `<section class="shot" data-i="${i}"><img class="scr" src="${fileUrl(src)}">
      <div class="tap"></div>
      <div class="cap" data-key="${s.caption}"><div class="main">${esc(main)}</div>${sub ? `<div class="sub">${esc(sub)}</div>` : ''}</div></section>`;
  }).join('\n');
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Mukta:wght@600;800&display=block">
<style>
*{box-sizing:border-box;margin:0}html,body{width:${W}px;height:${H}px;overflow:hidden;background:#140803}
body{font-family:'Mukta','Noto Color Emoji',sans-serif}
.shot{position:absolute;inset:0;overflow:hidden;visibility:hidden}
.scr{position:absolute;left:0;top:0;transform-origin:0 0}
.shot::after{content:'';position:absolute;inset:0;pointer-events:none;
  background:radial-gradient(ellipse 85% 70% at 50% 55%,transparent 58%,rgba(46,14,2,.42) 100%),linear-gradient(180deg,rgba(40,12,2,.38) 0,rgba(40,12,2,0) 30%)}
.cap{position:absolute;left:0;right:0;top:300px;display:flex;flex-direction:column;align-items:center;gap:12px;z-index:4;transform-origin:50% 0}
.cap .main{background:#7A1D0C;color:#FFF4DF;font-weight:800;font-size:${lang === 'hi' ? 86 : 80}px;line-height:1.18;padding:${lang === 'hi' ? '14px 34px 6px' : '12px 34px 10px'};border-radius:18px;box-shadow:0 10px 30px rgba(0,0,0,.35);border:3px solid #E7B864;max-width:980px;text-align:center}
.cap .sub{background:#FFF4DF;color:#5A1A08;font-weight:600;font-size:46px;line-height:1.2;padding:${lang === 'hi' ? '10px 26px 4px' : '8px 26px 8px'};border-radius:14px;box-shadow:0 8px 22px rgba(0,0,0,.28);max-width:980px;text-align:center}
.tap{position:absolute;width:110px;height:110px;margin:-55px 0 0 -55px;border-radius:50%;border:5px solid rgba(255,255,255,.95);background:rgba(255,255,255,.28);box-shadow:0 0 0 2px rgba(0,0,0,.15);opacity:0;z-index:3}
.flash{position:absolute;inset:-20%;background:radial-gradient(ellipse at 30% 20%,rgba(255,196,110,.95),rgba(255,140,40,.55) 35%,rgba(255,120,30,0) 70%);mix-blend-mode:screen;opacity:0;z-index:9;pointer-events:none}
.cta .ctabg{position:absolute;left:-10%;top:-10%;width:120%;height:120%;object-fit:cover;object-position:50% 12%;filter:blur(26px) brightness(.55) saturate(1.2)}
.cta .art{position:absolute;left:0;top:250px;width:1080px;height:600px;overflow:hidden;-webkit-mask:linear-gradient(180deg,transparent 0,#000 9%,#000 88%,transparent 100%)}
.cta .art img{width:1080px;display:block;transform-origin:50% 30%}
.cta .card{position:absolute;left:80px;width:920px;top:860px;padding:34px 40px 30px;border-radius:34px;background:#FFF1D5;box-shadow:0 30px 70px rgba(0,0,0,.45);border:3px solid #E7B864;text-align:center}
.cta .row{display:flex;align-items:center;justify-content:center;gap:26px}
.cta .icon{width:118px;height:118px;border-radius:28px;box-shadow:0 8px 20px rgba(92,50,20,.3)}
.cta .mark{height:${lang === 'hi' ? 104 : 92}px}
.cta .tag{margin-top:14px;font-weight:600;font-size:40px;color:#5A3A1E}
.cta .btn{margin:20px auto 0;width:640px;padding:${lang === 'hi' ? '20px 0 12px' : '18px 0'};border-radius:999px;background:linear-gradient(180deg,#C4321A,#8E1B08);color:#FFF4DF;font-weight:800;font-size:48px;box-shadow:0 14px 30px rgba(142,27,8,.4)}
.cta .trust{margin-top:16px;font-weight:600;font-size:30px;color:#6E5230}
</style></head><body>${shotHtml}<div class="flash"></div>
<script>
const SHOTS=${JSON.stringify(shots.map(s => ({start: s.start, end: s.end, zoom: s.zoom || 1, y: s.y || [0, 0], caption: s.caption || null, tap: s.tap || null, flash: !!s.flash, cta: !!s.cta})))};
const BEATS=${JSON.stringify(beatTimes)};
const clamp=x=>Math.max(0,Math.min(1,x)),eo=x=>1-Math.pow(1-clamp(x),3),eio=x=>{x=clamp(x);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2},lerp=(a,b,p)=>a+(b-a)*p;
const back=x=>{x=clamp(x);const c=1.6;return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2)};
const secs=[...document.querySelectorAll('.shot')],flash=document.querySelector('.flash');
window.layout=()=>secs.forEach((sec,i)=>{const img=sec.querySelector('.scr');if(!img)return;const s=SHOTS[i];
  s.w=${W}*s.zoom;s.h=s.w*img.naturalHeight/img.naturalWidth;img.style.width=s.w+'px';img.style.height=s.h+'px';});
window.renderAt=t=>{
  let cur=SHOTS.findIndex(s=>t>=s.start&&t<s.end);if(cur<0)cur=SHOTS.length-1;
  secs.forEach((sec,i)=>{sec.style.visibility=i===cur?'visible':'hidden';});
  const s=SHOTS[cur],sec=secs[cur],u=t-s.start,d=s.end-s.start;
  const punch=1+.055*(1-eo(u/.32));
  if(!s.cta){
    const p=lerp(s.y[0],s.y[1],eio(u/d)),ox=(s.w*punch-${W})/2,oy=Math.max(0,s.h*punch-${H});
    const img=sec.querySelector('.scr');img.style.transform='translate('+(-ox)+'px,'+(-p*oy)+'px) scale('+punch+')';
    const cap=sec.querySelector('.cap'),prev=SHOTS[cur-1],fresh=!prev||prev.caption!==s.caption;
    const cu=fresh?(cur===0?u+.3:u):99; // shot 0 opens with its caption already up, for the thumbnail
    cap.style.opacity=clamp(cu/.12);cap.style.transform='scale('+(.82+.18*back(cu/.3))+')';
    const sub=cap.querySelector('.sub');if(sub){const su=cu-.14;sub.style.opacity=clamp(su/.12);sub.style.transform='translateY('+(1-eo(su/.25))*-14+'px)';}
    const tap=sec.querySelector('.tap');
    if(s.tap){const tu=u-s.tap[2];const x=s.tap[0]*s.w*punch-ox,y=s.tap[1]*s.h*punch-p*oy;tap.style.left=x+'px';tap.style.top=y+'px';
      tap.style.opacity=tu<0?0:clamp(1-(tu-.15)/.45)*.95;tap.style.transform='scale('+(tu<.15?lerp(.6,1,tu/.15):lerp(1,1.35,clamp((tu-.15)/.45)))+')';}
  } else {
    const art=sec.querySelector('.art img');art.style.transform='scale('+(1.04+.05*u/d)+')';
    const card=sec.querySelector('.card');const cp=back((u-.25)/.45);card.style.opacity=clamp((u-.25)/.2);card.style.transform='translateY('+(1-cp)*120+'px)';
    const last=BEATS.filter(b=>b<=t).pop()||0,bu=t-last;const btn=sec.querySelector('.btn');
    btn.style.transform='scale('+(u>1.2?1+.045*(1-eo(bu/.3)):1)+')';
  }
  flash.style.opacity=s.flash?clamp(u<.08?u/.08:1-(u-.08)/.5)*.85:0;
};
</script></body></html>`;
}

const browser = await chromium.launch();
const manifest = {generated: new Date().toISOString(), format: board.format, audio: {...board.audio, start: beatFile.start, sha256: beatFile.sha256}, outputs: [], sources: {}};
try {
  for (const lang of langs) {
    const htmlFile = path.join(out, `page-${lang}.html`);
    fs.writeFileSync(htmlFile, pageHtml(lang));
    const page = await browser.newPage({viewport: {width: W, height: H}, deviceScaleFactor: 1});
    await page.goto(pathToFileURL(htmlFile).href, {waitUntil: 'networkidle'});
    await page.evaluate(async () => {
      await Promise.all([['800 40px Mukta', 'हिंAa'], ['600 40px Mukta', 'हिंAa']].map(([f, s]) => document.fonts.load(f, s)));
      await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode())); window.layout();
    });
    const ok = await page.evaluate(() => [document.fonts.check('800 40px Mukta', 'हिं'), document.fonts.check('600 40px Mukta', 'Aa')]);
    if (ok.includes(false)) throw Error('Mukta failed to load');
    const stills = path.join(out, `stills-${lang}`);
    fs.rmSync(stills, {recursive: true, force: true}); fs.mkdirSync(stills, {recursive: true});
    const stillAt = new Map(shots.map(s => [Math.round((s.start + Math.min(0.9, (s.end - s.start) * 0.6)) * fps), s.id]));
    stillAt.set(0, '00-first-frame');
    const frames = Math.round(total * fps);
    const video = path.join(out, `video-${lang}.mp4`);
    const ff = preview ? null : spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', String(fps), video], {stdio: ['pipe', 'inherit', 'inherit']});
    const done = ff && new Promise((res, rej) => ff.on('close', c => c ? rej(Error(`ffmpeg ${c}`)) : res()));
    for (let f = 0; f < frames; f++) {
      if (preview && !stillAt.has(f)) continue;
      await page.evaluate(t => window.renderAt(t), f / fps);
      const buf = await page.screenshot({type: 'jpeg', quality: 93});
      if (stillAt.has(f)) fs.writeFileSync(path.join(stills, `${String(f).padStart(4, '0')}-${stillAt.get(f)}.jpg`), buf);
      if (ff && !ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (f % 150 === 0) process.stdout.write(`${lang} frame ${f}/${frames}\n`);
    }
    await page.close();
    run('ffmpeg', ['-y', '-loglevel', 'error', '-pattern_type', 'glob', '-i', path.join(stills, '*.jpg'), '-vf', 'scale=216:384,tile=10x2:padding=4:color=white', '-frames:v', '1', path.join(out, `review-${lang}.jpg`)]);
    if (preview) continue;
    ff.stdin.end(); await done;
    const final = path.join(out, `vedansh-bhajan-cut-${lang}-9x16.mp4`);
    const fadeAt = (total - board.audio.fadeOut).toFixed(3);
    run('ffmpeg', ['-y', '-loglevel', 'error', '-i', video, '-ss', String(beatFile.start), '-t', String(total), '-i', audioSrc,
      '-filter_complex', `[1:a]afade=t=in:d=0.02,afade=t=out:st=${fadeAt}:d=${board.audio.fadeOut},loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]`,
      '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ac', '2', '-t', String(total), '-movflags', '+faststart', final]);
    const feed = path.join(out, `vedansh-bhajan-cut-${lang}-4x5.mp4`);
    run('ffmpeg', ['-y', '-loglevel', 'error', '-i', final, '-vf', 'crop=1080:1350:0:285', '-c:v', 'libx264', '-preset', 'slow', '-crf', '17',
      '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-movflags', '+faststart', feed]);
    fs.rmSync(video);
    for (const file of [final, feed]) {
      const p = JSON.parse(run('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', file]));
      const v = p.streams.find(s => s.codec_type === 'video'), a = p.streams.find(s => s.codec_type === 'audio');
      if (!a || a.channels !== 2) throw Error(`${file}: missing stereo audio`);
      manifest.outputs.push({file: path.basename(file), sha256: sha(file), width: v.width, height: v.height, durationSeconds: Number(p.format.duration), audio: `${a.codec_name} ${a.sample_rate}Hz`});
    }
  }
  for (const s of board.shots) for (const f of s.screen ? (typeof s.screen === 'string' ? [s.screen] : Object.values(s.screen)) : []) manifest.sources[f] = sha(path.join(root, f));
  if (!preview) fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(preview ? `stills in ${out}` : manifest.outputs.map(o => `${o.file} ${o.width}x${o.height} ${o.durationSeconds.toFixed(2)}s`).join('\n'));
} finally { await browser.close(); }
