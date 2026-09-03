#!/usr/bin/env node
// make-content.mjs — CONTENT-first reels (the audit's pivot): the devotional content IS the video.
// No app screens, no Maestro, no sim. Each scene is a full-frame branded card (big Hindi type, optional
// dimmed deity visual) rendered by headless Chrome, narrated by edge-TTS, and sequenced by ffmpeg.
// Opens on a bold hook in frame 0, ends on a SEND-CTA (not a download card). App = watermark only.
//
//   node make-content.mjs gita-2-47 --lang hi
//   node make-content.mjs gita-2-47 --lang hi --music music/bansuri.mp3
//
// A content reel def (content/<slug>.content.mjs) reuses the narrate shape {hook, beats[], cta}:
//   { slug, bg?, hook:{hi,en}, beats:[{ narration:{hi}, text:{hi}, sub?:{hi}, bg? }], cta:{hi}, send?:{hi} }
//     hook     — the first-1.5s scroll-stopper (spoken + shown big)
//     beats[]  — content scenes: narration = spoken line, text = the big on-screen content, sub = a
//                smaller line under it (e.g. meaning), bg = deity visual key for this scene
//     cta      — the spoken send-line; send = on-screen send text (defaults to cta)

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { narrateReel, probeMs } from './narrate.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..');
const CHROME = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const FFMPEG = process.env.FFMPEG_BIN || 'ffmpeg';
const W = 1080, H = 1920, FPS = 30;
// Tight pacing for ≤17s reels (skip-rate is driven by length + dead air). Keep holds minimal so the
// reel rides the VO line-to-line with almost no silence.
const LEAD_MS = 90;    // VO starts a breath after the scene appears
const PAD_MS = 260;    // hold after each line's VO
const SEND_HOLD_MS = 650; // extra hold on the send-CTA scene

// Deity/visual backgrounds already in the app (dimmed behind the text). Add keys as assets land.
const BG = {
  krishna: 'mobile/assets/backgrounds/deity-krishna-bansuri.webp',
  ganesha: 'mobile/assets/backgrounds/deity-ganesha-modak.webp',
  durga: 'mobile/assets/backgrounds/deity-durga-lion.webp',
  saraswati: 'mobile/assets/backgrounds/deity-saraswati-veena.webp',
  rama: 'mobile/assets/backgrounds/deity-rama-darbar.webp',
  vishnu: 'mobile/assets/backgrounds/source-vishnu-narayana.webp',
  gita: 'mobile/assets/gita/krishna_arjuna_vishvarupa.webp',
  hanuman: 'mobile/assets/chalisa/Hanuman_sea.webp',
  shiva: 'images/shiva.jpeg',
};
function bgUrl(key) {
  if (!key) return null;
  const p = path.join(REPO, BG[key] || key);
  return fs.existsSync(p) ? 'file://' + p : null;
}

const C = { bgTop: '#1a0e03', bgMid: '#3d1a00', bgBot: '#8A3E0B', saffron: '#E08A3C', gold: '#E8C887', cream: '#F3E7C9' };
const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Noto+Serif+Devanagari:wght@500;600;700&family=Inter:wght@600;700&display=swap" rel="stylesheet">`;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const nl = (s) => esc(s).replace(/\n/g, '<br>'); // honour explicit line breaks in scene text

function shell(inner, bg) {
  const bgCss = bg
    ? `radial-gradient(120% 60% at 50% 52%, rgba(6,3,1,0.34), rgba(6,3,1,0) 62%), linear-gradient(180deg, rgba(8,5,2,0.66), rgba(8,5,2,0.82)), url('${bg}') center/cover no-repeat`
    : `radial-gradient(120% 80% at 50% -10%, rgba(224,138,60,0.28), rgba(0,0,0,0) 60%), linear-gradient(168deg, ${C.bgTop} 0%, ${C.bgMid} 46%, ${C.bgBot} 100%)`;
  return `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{width:${W}px;height:${H}px;overflow:hidden}
    body{font-family:'Noto Serif Devanagari',serif;background:${bgCss};color:${C.cream};-webkit-font-smoothing:antialiased;position:relative}
    .frame{position:absolute;inset:26px;border:1.5px solid rgba(232,200,135,0.22);border-radius:30px;pointer-events:none}
    .stage{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 96px;text-align:center;text-shadow:0 2px 22px rgba(0,0,0,0.55)}
    .mark{position:absolute;left:0;right:0;bottom:64px;text-align:center;font-family:'Noto Serif Devanagari',serif;font-size:30px;letter-spacing:3px;color:rgba(232,200,135,0.72)}
  </style></head><body>${inner}<div class="frame"></div><div class="mark">ॐ वेदांश़</div></body></html>`;
}

function hookScene(hook) {
  return shell(`<div class="stage">
    <div style="font-family:'Inter',sans-serif;font-weight:600;font-size:26px;letter-spacing:5px;color:${C.saffron};text-transform:uppercase;margin-bottom:34px">रुकिए</div>
    <div style="font-weight:700;font-size:82px;line-height:1.16;color:${C.cream}">${nl(hook)}</div>
    <div style="width:120px;height:3px;background:${C.gold};opacity:.6;margin-top:52px;border-radius:2px"></div>
  </div>`);
}
function contentScene({ text, sub }, bg) {
  return shell(`<div class="stage">
    <div style="font-weight:600;font-size:${text.length > 60 ? 58 : 70}px;line-height:1.32;color:${C.cream}">${nl(text)}</div>
    ${sub ? `<div style="font-family:'Inter',sans-serif;font-weight:600;font-size:42px;line-height:1.4;color:${C.gold};margin-top:40px">${nl(sub)}</div>` : ''}
  </div>`, bg);
}
function sendScene(send) {
  return shell(`<div class="stage">
    <div style="font-size:80px;margin-bottom:20px">🙏</div>
    <div style="font-weight:700;font-size:72px;line-height:1.22;color:${C.cream}">${nl(send)}</div>
    <div style="font-family:'Inter',sans-serif;font-weight:600;font-size:34px;color:${C.saffron};margin-top:56px;padding:20px 44px;border:1.5px solid ${C.saffron};border-radius:60px">वेदांश़ · लिंक बायो में</div>
  </div>`);
}

function renderPng(html, outPng) {
  const tmp = outPng.replace(/\.png$/, '.html');
  fs.writeFileSync(tmp, html);
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--force-device-scale-factor=1', `--window-size=${W},${H}`, '--virtual-time-budget=8000',
    '--allow-file-access-from-files', `--screenshot=${outPng}`, 'file://' + tmp], { stdio: 'pipe', timeout: 60000 });
  if (!fs.existsSync(outPng)) throw new Error('scene render failed: ' + outPng);
  return outPng;
}

const run = (args) => execFileSync(FFMPEG, ['-y', '-hide_banner', '-loglevel', 'error', ...args], { stdio: 'inherit' });
const ms = (x) => (x / 1000).toFixed(3);

/** Sequence scene stills (each held for its VO + pad) + VO track + optional music → mp4. */
function assemble(scenes, outFile, workDir, music) {
  fs.mkdirSync(workDir, { recursive: true });
  const segs = [];
  let cum = 0;
  const delays = [];
  scenes.forEach((s, i) => {
    const hold = (i === scenes.length - 1 ? SEND_HOLD_MS : PAD_MS);
    const dur = s.voMs + hold;
    const seg = path.join(workDir, `seg${i}.mp4`);
    // No fade-IN on scene 0 — a fade from black makes frame 0 black, which Instagram grabs as the
    // cover thumbnail (the "black cover" bug) and buries the hook. The hook must be bright at frame 0.
    const fadeOut = i === scenes.length - 1 ? `,fade=t=out:st=${ms(dur - 400)}:d=0.4` : '';
    if (s.zoom) {
      // Subtle centered Ken Burns push-in (1.00→1.05) so the deity visual reads as motion, not a
      // static card. Oversampled 1.5× internally so the zoom stays jitter-free and text stays crisp.
      const frames = Math.max(2, Math.round((dur / 1000) * FPS));
      run(['-loop', '1', '-framerate', String(FPS), '-t', ms(dur), '-i', s.png, '-vf',
        `scale=${Math.round(W * 1.5)}:${Math.round(H * 1.5)},` +
        `zoompan=z='min(1+0.05*on/${frames},1.05)':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':fps=${FPS}:s=${W}x${H},` +
        `setsar=1${fadeOut}`,
        '-c:v', 'libx264', '-pix_fmt', 'yuv420p', seg]);
    } else {
      run(['-loop', '1', '-t', ms(dur), '-i', s.png, '-vf',
        `scale=${W}:${H},fps=${FPS},setsar=1${fadeOut}`,
        '-c:v', 'libx264', '-pix_fmt', 'yuv420p', seg]);
    }
    segs.push(seg);
    delays.push(cum + LEAD_MS);
    cum += dur;
  });
  const total = cum;

  const listFile = path.join(workDir, 'list.txt');
  fs.writeFileSync(listFile, segs.map((f) => `file '${f}'`).join('\n') + '\n');
  const videoOnly = path.join(workDir, 'video.mp4');
  run(['-f', 'concat', '-safe', '0', '-i', listFile, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', videoOnly]);

  // VO: delay each line to its scene start, mix, normalize.
  const aIn = [];
  scenes.forEach((s) => aIn.push('-i', s.vo));
  if (music) aIn.push('-i', music);
  const afc = [];
  const labels = [];
  scenes.forEach((_, k) => {
    afc.push(`[${k}:a]aresample=44100,aformat=sample_fmts=fltp:channel_layouts=stereo,adelay=${Math.round(delays[k])}:all=1[a${k}]`);
    labels.push(`[a${k}]`);
  });
  afc.push(`${labels.join('')}amix=inputs=${labels.length}:normalize=0:dropout_transition=0[vo]`);
  afc.push(`[vo]apad,atrim=0:${ms(total)},loudnorm=I=-16:TP=-1.5:LRA=11[vof]`);
  let aout = '[vof]';
  if (music) {
    const mi = scenes.length;
    afc.push(`[${mi}:a]aresample=44100,aformat=sample_fmts=fltp:channel_layouts=stereo,aloop=loop=-1:size=2000000000,atrim=0:${ms(total)},volume=0.10[mus]`);
    afc.push(`[vof][mus]amix=inputs=2:normalize=0[mix]`);
    aout = '[mix]';
  }
  const audio = path.join(workDir, 'audio.m4a');
  run([...aIn, '-filter_complex', afc.join(';'), '-map', aout, '-c:a', 'aac', '-b:a', '192k', audio]);

  run(['-i', videoOnly, '-i', audio, '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'medium',
    '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', outFile]);
  return { total };
}

async function main() {
  const slug = process.argv[2];
  const lang = (process.argv.includes('--lang') ? process.argv[process.argv.indexOf('--lang') + 1] : 'hi');
  const music = process.argv.includes('--music') ? process.argv[process.argv.indexOf('--music') + 1] : undefined;
  if (!slug) { console.error('usage: node make-content.mjs <slug> [--lang hi] [--music <file>]'); process.exit(1); }

  const defPath = path.join(HERE, 'content', `${slug}.content.mjs`);
  if (!fs.existsSync(defPath)) { console.error('no content def: ' + defPath); process.exit(1); }
  const reel = (await import(defPath)).default;
  console.log(`\n▶ content reel: ${reel.slug}  lang: ${lang}`);

  const workDir = path.join(HERE, 'out', `content-${reel.slug}-${lang}.work`);
  const voiceDir = path.join(HERE, 'voice');
  fs.mkdirSync(workDir, { recursive: true });
  const outFile = path.join(HERE, 'out', `vedansh-content-${reel.slug}-${lang}.mp4`);

  console.log('① narrate (edge)');
  const nar = await narrateReel(reel, lang, { outDir: voiceDir }); // {files:{hook,cta,beats[]},durations}
  const sendText = (reel.send && reel.send[lang]) || reel.cta[lang];

  console.log('② render scenes');
  const scenes = [];
  scenes.push({ png: renderPng(hookScene(reel.hook[lang]), path.join(workDir, 'hook.png')), vo: nar.files.hook, voMs: nar.durations.hook });
  reel.beats.forEach((b, i) => {
    const bg = bgUrl(b.bg || reel.bg);
    const png = renderPng(contentScene({ text: b.text[lang], sub: b.sub && b.sub[lang] }, bg), path.join(workDir, `beat${i}.png`));
    scenes.push({ png, vo: nar.files.beats[i], voMs: nar.durations.beats[i], zoom: !!bg });
  });
  scenes.push({ png: renderPng(sendScene(sendText), path.join(workDir, 'send.png')), vo: nar.files.cta, voMs: nar.durations.cta });

  console.log('③ assemble');
  const { total } = assemble(scenes, outFile, workDir, music);
  console.log(`\n✅ ${outFile}  (${(total / 1000).toFixed(1)}s)`);
}

main().catch((e) => { console.error('\n✖ ' + (e.stack || e.message)); process.exit(1); });
