// Vedansh feature-tour ad: real native app captures composed into an animated 9:16 video.
// Frames are rendered deterministically in headless Chromium (renderAt(t) per frame), piped to ffmpeg,
// then muxed with an original synthesised tanpura bed (music.py). Nothing is uploaded or posted.
//
// Usage: python narrate.py --models <dir>   (voice-over clips + vo.json into the out dir; see narrate.py)
//        node build.mjs [--lang en|hi|all] [--out <dir>] [--preview] [--no-vo]
//   --preview renders review stills only (no video), for fast layout iteration.
//   --no-vo   music-only cut (scene lengths from storyboard.json).
// With voice-over, each scene stretches to fit its narration, and music ducks under the voice.
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
const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const preview = process.argv.includes('--preview');
const langs = (arg('lang', 'all') === 'all' ? ['en', 'hi'] : [arg('lang')]);
const out = path.resolve(arg('out', path.join(root, 'marketing/reels/out/feature-tour')));
const board = JSON.parse(fs.readFileSync(path.join(here, 'storyboard.json'), 'utf8'));
const {width: W, height: H, fps} = board.format;
const T = board.transition;
fs.mkdirSync(out, {recursive: true});

const sha = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const esc = s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const br = s => esc(s).replaceAll('\n', '<br>');
const fileUrl = rel => pathToFileURL(path.join(root, rel)).href;
const screensFor = (scene, lang) => Array.isArray(scene.screens) ? scene.screens : scene.screens[lang];

const noVo = process.argv.includes('--no-vo');
const stripSpans = s => s.replace(/\{([^|}]+)\|[^}]+\}/g, '$1');
function voFor(lang) {
  if (noVo) return null;
  const file = path.join(out, 'vo.json');
  if (!fs.existsSync(file)) throw Error(`No ${file}: run narrate.py first, or pass --no-vo`);
  const rows = JSON.parse(fs.readFileSync(file, 'utf8')).lines.filter(r => r.lang === lang);
  return board.scenes.map(s => {
    const r = rows.find(x => x.scene === s.id);
    if (!r || r.text !== stripSpans(s[lang].vo)) throw Error(`Missing or stale ${lang} voice-over for ${s.id}: rerun narrate.py`);
    return r;
  });
}
function timeline(lang) {
  const vo = voFor(lang);
  let at = 0;
  const timed = board.scenes.map((s, i) => {
    const lead = i === 0 ? 0.15 : 0.3, last = i === board.scenes.length - 1;
    const need = vo ? lead + vo[i].seconds + (last ? 1.4 : 0.4) : 0;
    const duration = Math.ceil(Math.max(s.duration, need) * fps) / fps;
    const r = {...s, duration, start: at, voStart: at + lead, vo: vo?.[i]};
    at += duration;
    return r;
  });
  return {timed, total: at};
}
const srtTime = t => new Date(Math.round(t * 1000)).toISOString().slice(11, 23).replace('.', ',');

function sceneHtml(scene, lang, i) {
  const c = scene[lang];
  const shots = screensFor(scene, lang);
  for (const s of shots) if (!fs.existsSync(path.join(root, s))) throw Error(`Missing screen ${s}`);
  const phones = shots.map((s, k) => `<div class="phone p${k}"><div class="scr ${scene.fit === 'top' ? 'fit-top' : ''}"><img src="${fileUrl(s)}"></div></div>`).join('');
  const callout = scene.callout ? `<div class="callout" style="top:${scene.callout.y}px" data-crop="${scene.callout.crop.join(',')}"><img src="${fileUrl(shots[scene.callout.from || 0])}"></div>` : '';
  if (scene.layout === 'cta') {
    const mark = lang === 'hi' ? 'hindi.png' : 'english.png';
    return `<section class="scene cta" data-i="${i}">
      <img class="icon a" data-d="0.05" src="${fileUrl('mobile/assets/icon.png')}">
      <img class="mark a" data-d="0.3" src="${fileUrl(`mobile/assets/branding/wordmarks/${mark}`)}">
      <div class="title a" data-d="0.55">${br(c.title)}</div>
      <div class="scripts a" data-d="0.8">${esc(c.scripts)}</div>
      <div class="trust a" data-d="1.0">${esc(c.trust)}</div>
      <div class="button a pulse" data-d="1.2">${esc(c.button)}</div>
      <div class="stores a" data-d="1.4">${esc(c.stores)}</div>
    </section>`;
  }
  const chips = c.chips ? `<div class="chips">${c.chips.map((x, k) => `<span class="chip a" data-d="${(0.3 + k * 0.11).toFixed(2)}">${esc(x)}</span>`).join('')}</div>` : '';
  return `<section class="scene ${scene.layout}" data-i="${i}">
    <div class="head"><div class="kicker a" data-d="0.04"><i></i>${esc(c.kicker)}<i></i></div>
    <div class="title a" data-d="0.12">${br(c.title)}</div>${c.sub ? `<div class="sub a" data-d="0.26">${esc(c.sub)}</div>` : ''}${chips}</div>
    ${phones}${callout}</section>`;
}

function pageHtml(lang, timed) {
  const dev = lang === 'hi';
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Inter:wght@500;600&family=Noto+Serif+Devanagari:wght@500;600;700&family=Noto+Sans+Gujarati:wght@500&family=Noto+Sans+Kannada:wght@500&display=block">
<style>
:root{--ink:#1A0E03;--soft:#5A3A1E;--saffron:#B8621B;--deep:#8A3E0B;--gold:#A67C34}
*{box-sizing:border-box;margin:0}
html,body{width:${W}px;height:${H}px;overflow:hidden}
body{background:radial-gradient(120% 75% at 50% 28%,#FFF8E6 0%,#FFF1D5 46%,#EEDDB5 100%);font-family:${dev ? "'Noto Serif Devanagari','Inter'" : "'Inter','Noto Serif Devanagari'"};color:var(--ink)}
.yantra{position:absolute;left:-210px;top:330px;width:1500px;height:1500px;opacity:.075;mix-blend-mode:multiply;border-radius:50%;-webkit-mask:radial-gradient(circle,#000 38%,transparent 68%)}
.glow{position:absolute;left:140px;top:560px;width:800px;height:800px;border-radius:50%;background:radial-gradient(circle,#FFE2A8aa,#FFE2A800 70%)}
.scene{position:absolute;inset:0;opacity:0;will-change:transform,opacity}
.head{position:absolute;left:60px;right:60px;top:330px;text-align:center;z-index:5}
.kicker{display:flex;align-items:center;justify-content:center;gap:22px;color:var(--saffron);font:600 ${dev ? '32px/1.4 \'Noto Serif Devanagari\'' : '26px/1.2 Inter'};letter-spacing:${dev ? '1px' : '8px'}}
.kicker i{display:block;width:70px;height:2px;background:linear-gradient(90deg,transparent,var(--gold))}
.kicker i:last-child{transform:scaleX(-1)}
.title{margin-top:${dev ? 14 : 18}px;font:${dev ? "700 66px/1.36 'Noto Serif Devanagari'" : "700 80px/1.04 'Cormorant Garamond'"};color:var(--ink)}
.sub{margin-top:${dev ? 10 : 20}px;font:${dev ? "500 34px/1.45 'Noto Serif Devanagari'" : "500 32px/1.35 Inter"};color:var(--soft)}
.phone{position:absolute;left:190px;top:0;width:700px;height:1484px;padding:16px;border-radius:86px;background:linear-gradient(150deg,#4a2e18,#1a0e05 60%);box-shadow:0 46px 90px rgba(92,50,20,.34),0 10px 26px rgba(92,50,20,.22),inset 0 0 0 2px rgba(214,170,96,.55);transform-origin:50% 0}
.scr{width:100%;height:100%;border-radius:70px;overflow:hidden;background:#F6ECD0}
.scr img{width:100%;height:100%;object-fit:cover;object-position:top;display:block}
.scr.fit-top{padding-top:46px}.scr.fit-top img{object-fit:contain}
.callout{position:absolute;left:80px;width:920px;border-radius:28px;overflow:hidden;background:#FFF8E8;box-shadow:0 34px 70px rgba(70,35,10,.36),0 0 0 3px #E2C48A;z-index:8;transform-origin:50% 50%}
.callout img{position:absolute;display:block}
.chips{display:flex;flex-wrap:wrap;justify-content:center;gap:16px 14px;margin:34px auto 0;width:900px}
.chip{padding:14px 28px;border-radius:999px;background:#FFF9EC;border:2px solid #E0BF84;color:var(--deep);font:600 ${dev ? "32px/1.3 'Noto Serif Devanagari'" : "30px/1.2 Inter"};box-shadow:0 8px 18px rgba(120,70,20,.12)}
.cta{text-align:center}
.cta .icon{position:absolute;left:420px;top:330px;width:240px;height:240px;border-radius:56px;box-shadow:0 26px 60px rgba(92,50,20,.32),0 0 0 3px #E2C48A}
.cta .mark{position:absolute;left:${dev ? 290 : 215}px;top:620px;width:${dev ? 500 : 650}px}
.cta .title{position:absolute;left:0;right:0;top:${dev ? 830 : 822}px;margin:0;font:${dev ? "600 52px/1.3 'Noto Serif Devanagari'" : "600 58px/1.1 'Cormorant Garamond'"};color:var(--soft)}
.cta .scripts{position:absolute;left:0;right:0;top:922px;font:500 34px/1.4 'Inter','Noto Serif Devanagari','Noto Sans Gujarati','Noto Sans Kannada';color:var(--deep);letter-spacing:1px}
.cta .trust{position:absolute;left:0;right:0;top:984px;font:${dev ? "500 32px/1.4 'Noto Serif Devanagari'" : "500 30px/1.4 Inter"};color:var(--soft)}
.cta .button{position:absolute;left:190px;width:700px;top:1062px;padding:30px 0;border-radius:999px;background:linear-gradient(180deg,#C5702A,#9A4712);color:#FFF6E4;font:${dev ? "700 44px/1.3 'Noto Serif Devanagari'" : "600 44px/1.2 Inter"};box-shadow:0 22px 44px rgba(138,62,11,.35)}
.cta .stores{position:absolute;left:0;right:0;top:${dev ? 1206 : 1196}px;font:500 28px/1.3 Inter;color:var(--soft);letter-spacing:3px}
</style></head><body>
<img class="yantra" src="${fileUrl('mobile/assets/icon.png')}"><div class="glow"></div>
${timed.map((s, i) => sceneHtml(s, lang, i)).join('\n')}
<script>
const SCENES=${JSON.stringify(timed.map(s => ({start: s.start, duration: s.duration, layout: s.layout, n: Array.isArray(s.screens) ? s.screens.length : s.screens.en.length})))};
const T=${T};
const clamp=x=>Math.max(0,Math.min(1,x));
const eo=x=>1-Math.pow(1-clamp(x),3);
const eio=x=>{x=clamp(x);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2};
const back=x=>{x=clamp(x);const c=1.5;return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2)};
const lerp=(a,b,p)=>a+(b-a)*p;
// [centerX, top, scale, rotateDeg] per layout and phone index (final resting pose).
const POSE={single:[[540,650,1,0]],pair:[[372,720,.84,-6],[708,664,.88,5]],fan:[[262,800,.72,-10],[540,700,.86,0],[818,800,.72,10]],chips:[[540,860,.84,0]]};
const ORDER={fan:[0,2,1]};
const sections=[...document.querySelectorAll('.scene')];
for(const c of document.querySelectorAll('.callout')){
  const [x,y,w,h]=c.dataset.crop.split(',').map(Number);const img=c.querySelector('img');
  const iw=920/w, ih=iw*img.naturalHeight/img.naturalWidth;
  Object.assign(img.style,{width:iw+'px',height:ih+'px',left:-x*iw+'px',top:-y*ih+'px'});
  c.style.height=h*ih+'px';
}
sections.forEach((sec,i)=>{const L=SCENES[i].layout;(ORDER[L]||[...Array(SCENES[i].n).keys()]).forEach((k,z)=>{const p=sec.querySelector('.p'+k);if(p)p.style.zIndex=z+1;});});
window.renderAt=t=>{
  const yan=document.querySelector('.yantra');yan.style.transform='rotate('+(t*2.2)+'deg)';
  sections.forEach((sec,i)=>{
    const S=SCENES[i];const u=t-S.start;const e=i===0?u+.45:u-.12; // e: element clock (hook opens mid-motion; later scenes settle after the push)
    const last=i===SCENES.length-1;
    if(u<0||(!last&&u>S.duration+T)){sec.style.opacity=0;sec.style.visibility='hidden';return;}
    sec.style.visibility='visible';
    const enter=i===0?1:eio(u/T), exit=last?0:eio((u-S.duration)/T);
    const inO=i===0?1:clamp(u/(T*.5)), outO=last?0:clamp((u-S.duration)/(T*.5));
    sec.style.opacity=Math.min(inO,1-outO);
    const shift=(1-enter)*420-exit*420;
    sec.style.transform='translateX('+shift+'px)';
    for(const el of sec.querySelectorAll('.a')){
      const d=+el.dataset.d, p=eo((e-d)/.55);
      let tf='translateY('+((1-p)*36)+'px)';
      if(el.classList.contains('chip')||el.classList.contains('icon')){const b=back((e-d)/.5);tf+=' scale('+(.6+.4*b)+')';}
      if(el.classList.contains('pulse')&&e>2)tf+=' scale('+(1+.035*Math.sin((e-2)*5))+')';
      el.style.opacity=clamp(p*1.4);el.style.transform=tf;
    }
    const poses=POSE[S.layout]||[];
    sec.querySelectorAll('.phone').forEach((ph,k)=>{
      const [cx,top,s,r]=poses[k];const d=(ORDER[S.layout]||[...Array(S.n).keys()]).indexOf(k)*.11;
      const p=eo((e-d)/.8), drift=Math.max(0,e)/S.duration;
      let x=cx, rot=r;
      if(S.layout==='fan'){x=lerp(540,cx,eo((e-.15)/.9));rot=lerp(0,r,eo((e-.15)/.9));}
      const y=top+(1-p)*(S.layout==='fan'?180:300)-drift*22+exit*40;
      ph.style.opacity=S.layout==='fan'?1:clamp(p*1.7);
      ph.style.transform='translate('+(x-540)+'px,'+y+'px) rotate('+rot+'deg) scale('+(s*(1+.028*drift))+')';
    });
    const co=sec.querySelector('.callout');
    if(co){const p=back((e-.95)/.5);co.style.opacity=clamp((e-.95)/.25);co.style.transform='scale('+(.72+.28*p)+') translateY('+(-Math.max(0,e)/S.duration*14)+'px)';}
  });
};
</script></body></html>`;
}

function run(bin, args, opts = {}) {
  return execFileSync(bin, args, {stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 26, ...opts}).toString();
}

const browser = await chromium.launch();
const manifest = {generated: new Date().toISOString(), format: board.format, voiceOver: noVo ? null : board.voice, outputs: [], sources: {}};
try {
  for (const lang of langs) {
    const {timed, total} = timeline(lang);
    const music = path.join(out, `music-${lang}.wav`);
    if (!preview) run('python3', [path.join(here, 'music.py'), music, String(total), String(timed.at(-1).start)]);
    const htmlFile = path.join(out, `page-${lang}.html`);
    fs.writeFileSync(htmlFile, pageHtml(lang, timed));
    const page = await browser.newPage({viewport: {width: W, height: H}, deviceScaleFactor: 1});
    await page.goto(pathToFileURL(htmlFile).href, {waitUntil: 'networkidle'});
    await page.evaluate(async () => {
      const faces = [['700 40px "Cormorant Garamond"', 'Aa'], ['600 40px "Inter"', 'Aa'], ['500 40px "Inter"', 'Aa'], ['700 40px "Noto Serif Devanagari"', 'हिं'],
        ['600 40px "Noto Serif Devanagari"', 'हिं'], ['500 40px "Noto Serif Devanagari"', 'हिं'], ['500 40px "Noto Sans Gujarati"', 'ગુ'], ['500 40px "Noto Sans Kannada"', 'ಕ']];
      await Promise.all(faces.map(([f, s]) => document.fonts.load(f, s)));
      await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode()));
      // Wider-than-phone captures (e.g. 9:16 Android) fit by width, anchored top, so no app UI is cropped at the sides.
      for (const img of document.querySelectorAll('.scr img')) if (img.naturalWidth / img.naturalHeight > 0.48) Object.assign(img.style, {objectFit: 'contain', objectPosition: 'top'});
    });
    const fontsOk = await page.evaluate(() => [['700', 'Cormorant Garamond', 'Aa'], ['600', 'Noto Serif Devanagari', 'हिं'], ['500', 'Inter', 'Aa'], ['500', 'Noto Sans Gujarati', 'ગુ'], ['500', 'Noto Sans Kannada', 'ಕ']]
      .map(([w, f, s]) => document.fonts.check(`${w} 40px "${f}"`, s)));
    if (fontsOk.includes(false)) throw Error(`Web fonts failed to load: ${fontsOk}`);
    await page.evaluate(() => {
      // Re-measure callouts now that every image has decoded.
      for (const c of document.querySelectorAll('.callout')) {
        const [x, y, w, h] = c.dataset.crop.split(',').map(Number); const img = c.querySelector('img');
        const iw = 920 / w, ih = iw * img.naturalHeight / img.naturalWidth;
        Object.assign(img.style, {width: iw + 'px', height: ih + 'px', left: -x * iw + 'px', top: -y * ih + 'px'});
        c.style.height = h * ih + 'px';
      }
    });
    const stills = path.join(out, `stills-${lang}`);
    fs.mkdirSync(stills, {recursive: true});
    const stillAt = new Map(timed.map(s => [Math.round((s.start + Math.min(s.duration - 0.2, 1.9)) * fps), s.id]));
    stillAt.set(0, '00-first-frame');
    const frames = Math.round(total * fps);
    const video = path.join(out, `video-${lang}.mp4`);
    const ff = preview ? null : spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', String(fps), video], {stdio: ['pipe', 'inherit', 'inherit']});
    const ffDone = ff && new Promise((res, rej) => ff.on('close', c => c ? rej(Error(`ffmpeg exit ${c}`)) : res()));
    for (let f = 0; f < frames; f++) {
      if (preview && !stillAt.has(f)) continue;
      await page.evaluate(t => window.renderAt(t), f / fps);
      const buf = await page.screenshot({type: 'jpeg', quality: 93});
      if (stillAt.has(f)) fs.writeFileSync(path.join(stills, `${String(f).padStart(4, '0')}-${stillAt.get(f)}.jpg`), buf);
      if (ff && !ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (f % 150 === 0) process.stdout.write(`${lang} frame ${f}/${frames}\n`);
    }
    await page.close();
    run('ffmpeg', ['-y', '-loglevel', 'error', '-pattern_type', 'glob', '-i', path.join(stills, '*.jpg'), '-vf', 'scale=270:480,tile=8x2:padding=6:color=white', '-frames:v', '1', path.join(out, `review-${lang}.jpg`)]);
    if (preview) continue;
    ff.stdin.end();
    await ffDone;
    const tag = noVo ? `${lang}-music` : lang;
    const final = path.join(out, `vedansh-feature-tour-${tag}-9x16.mp4`);
    const inputs = ['-i', video, '-i', music];
    let graph = '[1:a]loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000[a]';
    if (!noVo) {
      // Each clip is delayed to its scene; the tanpura is side-chain ducked under the voice, then the mix is normalised.
      const voices = timed.map((s, i) => { inputs.push('-i', path.join(out, s.vo.file));
        return `[${i + 2}:a]aresample=48000,aformat=channel_layouts=stereo,adelay=${Math.round(s.voStart * 1000)}:all=1,apad[v${i}]`; });
      graph = `${voices.join(';')};${timed.map((_, i) => `[v${i}]`).join('')}amix=inputs=${timed.length}:normalize=0:duration=longest,volume=1.6,asplit[vo][key];` +
        `[1:a]volume=0.55[bed];[bed][key]sidechaincompress=threshold=0.02:ratio=6:attack=15:release=450[duck];` +
        `[duck][vo]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000[a]`;
      fs.writeFileSync(path.join(out, `vedansh-feature-tour-${lang}.srt`), timed.map((s, i) =>
        `${i + 1}\n${srtTime(s.voStart)} --> ${srtTime(s.voStart + s.vo.seconds)}\n${s.vo.text}\n`).join('\n'));
    }
    run('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', graph, '-map', '0:v', '-map', '[a]', '-c:v', 'copy',
      '-c:a', 'aac', '-b:a', '192k', '-t', String(total), '-movflags', '+faststart', final]);
    const feed = path.join(out, `vedansh-feature-tour-${tag}-4x5.mp4`);
    run('ffmpeg', ['-y', '-loglevel', 'error', '-i', final, '-vf', 'crop=1080:1350:0:285', '-c:v', 'libx264', '-preset', 'slow', '-crf', '17',
      '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-movflags', '+faststart', feed]);
    fs.rmSync(video);
    for (const file of [final, feed]) {
      const probe = JSON.parse(run('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', file]));
      const v = probe.streams.find(s => s.codec_type === 'video'), a = probe.streams.find(s => s.codec_type === 'audio');
      if (!a) throw Error(`${file} has no audio stream`);
      manifest.outputs.push({file: path.relative(out, file), sha256: sha(file), bytes: fs.statSync(file).size, width: v.width, height: v.height,
        fps: v.r_frame_rate, videoCodec: v.codec_name, audioCodec: a.codec_name, durationSeconds: Number(probe.format.duration)});
    }
  }
  for (const s of board.scenes) for (const f of [...new Set(Object.values(s.screens).flat().concat(Array.isArray(s.screens) ? s.screens : []))]) manifest.sources[f] = sha(path.join(root, f));
  if (!preview) fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(preview ? `Preview stills in ${out}` : manifest.outputs.map(o => `${o.file} ${o.width}x${o.height} ${o.durationSeconds.toFixed(2)}s`).join('\n'));
} finally {
  await browser.close();
}
