#!/usr/bin/env node
/*
 * make-reel.js — build an on-brand 9:16 LinkedIn reel from captured app screenshots.
 *
 *   node make-reel.js vrat            # render slides + assemble vedansh-vrat-reel.mp4
 *   node make-reel.js routine
 *   node make-reel.js vrat --slides-only   # render slide PNGs only (skip ffmpeg)
 *
 * Pipeline: screenshot PNG -> branded HTML slide -> headless-Chrome PNG frame -> ffmpeg xfade.
 * No npm deps. Brand tokens pulled from mobile/src/theme (saffron #B8621B / parchment / ink).
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const CTX = __dirname;
// Overridable for portability; defaults are the common macOS locations.
const CHROME = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const FFMPEG = process.env.FFMPEG_BIN || 'ffmpeg';
const W = 1080, H = 1920;

// ── Brand ──
const C = {
  bgTop: '#1a0e03', bgMid: '#3d1a00', bgBot: '#8A3E0B',
  saffron: '#E08A3C', gold: '#E8C887', cream: '#F3E7C9', creamSoft: '#F8EFD6',
  inkOnCream: '#1A0E03',
};

const SMART_LINK = 'get-vedansh';

// ── Reel manifests: ordered slides. `shot` = screenshot basename in shots/<reel>/. ──
const OUTRO = {
  outro: true,
  brandHi: 'ॐ वेदांश़ ॐ',
  title: 'Vedansh',
  subtitle: 'Bhagavad Gita · Vrat & Panchang · Daily Sadhana',
  cta: 'persisharma.github.io/' + SMART_LINK,
  ctaSmall: 'Free · iPhone & Android · works offline',
  dur: 3.8,
};

const REELS = {
  vrat: {
    out: 'vedansh-vrat-reel.mp4',
    slides: [
      { cover: true, kicker: 'VEDANSH', title: 'Never miss a vrat again', subtitle: 'A calmer way to keep your fasts & festivals', dur: 3.2 },
      { shot: '01-panchang-calendar', kicker: 'PANCHANG', title: 'The day’s panchang, for your city', subtitle: 'Tithi · nakshatra · sunrise, sunset & Brahma Muhurta' },
      { shot: '03-vrat-browse', kicker: 'VRAT & PARV', title: 'Every vrat & festival, in one place', subtitle: 'Browse and search the calendar' },
      { shot: '04-katha-library', kicker: 'KATHA', title: 'A library of vrat kathas', subtitle: 'Karwa Chauth, Satyanarayan, Ahoi & more' },
      { shot: '08-katha-reader', kicker: 'KATHA', title: 'The story, ready for pooja', subtitle: 'Read in Hindi or English' },
      { shot: '05-observance-detail', kicker: 'FOLLOW', title: 'Follow the vrats you keep', subtitle: 'Karwa Chauth — story & reminders, together' },
      { shot: '06-my-vrat', kicker: 'MY VRAT', title: 'Your vrats, by priority', subtitle: 'Next date and a countdown for each' },
      { shot: '07-reminder-sheet', kicker: 'REMINDERS', title: 'A nudge the evening before', subtitle: 'And again on the morning of — fully offline' },
      OUTRO,
    ],
  },
  routine: {
    out: 'vedansh-routine-reel.mp4',
    slides: [
      { cover: true, kicker: 'VEDANSH', title: 'Build your daily sadhana', subtitle: 'A few honest minutes, in a calm order', dur: 3.2 },
      { shot: '01-home-banner', kicker: 'DAILY ROUTINE', title: 'Set your daily practice', subtitle: 'Decide once — follow it every day' },
      { shot: '02-name', kicker: 'CREATE', title: 'Name your routine', subtitle: 'Make it your own' },
      { shot: '03-mode', kicker: 'MODE', title: 'Same daily — or by weekday', subtitle: 'Whatever fits your rhythm' },
      { shot: '04-add-content', kicker: 'WEEKDAY', title: 'The right deity for each day', subtitle: 'Mon → Shiva · Tue → Hanuman … Sun → Surya' },
      { shot: '05-today', kicker: 'TODAY’S PRACTICE', title: 'Exactly what to do today', subtitle: 'Gita, chalisa, aarti, stotram or japam' },
      { shot: '06-today-done', kicker: 'DONE', title: 'Tick it off as you go', subtitle: 'No streak-shaming — just steady practice' },
      { shot: '07-my-routines', kicker: 'YOUR ROUTINES', title: 'Daily or weekday, your way', subtitle: 'Build as many as you like' },
      OUTRO,
    ],
  },
};

const FONTS = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Noto+Serif+Devanagari:wght@500;600&family=Inter:wght@500;600&display=swap" rel="stylesheet">`;

function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

function dataUri(p) {
  const b = fs.readFileSync(p);
  return 'data:image/png;base64,' + b.toString('base64');
}

function pageShell(inner) {
  return `<!doctype html><html><head><meta charset="utf-8">${FONTS}
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html,body { width:${W}px; height:${H}px; overflow:hidden; }
  body {
    font-family:'Cormorant Garamond', Georgia, serif;
    background:
      radial-gradient(120% 80% at 50% -10%, rgba(224,138,60,0.30), rgba(0,0,0,0) 60%),
      linear-gradient(168deg, ${C.bgTop} 0%, ${C.bgMid} 46%, ${C.bgBot} 100%);
    color:${C.cream};
    -webkit-font-smoothing:antialiased;
    position:relative;
  }
  .frameBorder { position:absolute; inset:26px; border:1.5px solid rgba(232,200,135,0.28); border-radius:30px; pointer-events:none; }
  .om { position:absolute; top:54px; left:0; right:0; text-align:center; font-family:'Noto Serif Devanagari', serif;
        color:${C.gold}; font-size:34px; letter-spacing:4px; opacity:0.92; }
  .stage { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; }
</style></head><body>${inner}</body></html>`;
}

// Slide that frames a screenshot in a phone mock with a caption below.
function shotSlide(s, imgUri) {
  const inner = `
  <div class="frameBorder"></div>
  <div class="stage">
    <div class="om">ॐ वेदांश़</div>
    <div style="margin-top:150px; width:560px; height:1170px; border-radius:54px; padding:11px;
                background:linear-gradient(160deg,#2a1707,#0c0702); box-shadow:0 40px 90px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(232,200,135,0.18);">
      <img src="${imgUri}" style="width:100%; height:100%; object-fit:cover; object-position:top center; border-radius:44px; display:block;">
    </div>
    <div style="position:absolute; bottom:96px; left:70px; right:70px; text-align:center;">
      <div style="font-family:'Inter',sans-serif; font-weight:600; font-size:24px; letter-spacing:5px;
                  color:${C.saffron}; text-transform:uppercase; margin-bottom:14px;">${esc(s.kicker || '')}</div>
      <div style="font-weight:600; font-size:62px; line-height:1.06; color:${C.cream};">${esc(s.title || '')}</div>
      ${s.subtitle ? `<div style="font-weight:500; font-size:33px; line-height:1.25; color:rgba(243,231,201,0.74); margin-top:18px;">${esc(s.subtitle)}</div>` : ''}
    </div>
  </div>`;
  return pageShell(inner);
}

function coverSlide(s) {
  const inner = `
  <div class="frameBorder"></div>
  <div class="stage" style="justify-content:center;">
    <div class="om" style="top:auto; position:static; margin-bottom:40px; font-size:46px;">ॐ वेदांश़ ॐ</div>
    <div style="font-family:'Inter',sans-serif; font-weight:600; font-size:26px; letter-spacing:6px;
                color:${C.saffron}; text-transform:uppercase; margin-bottom:26px;">${esc(s.kicker || '')}</div>
    <div style="font-weight:700; font-size:104px; line-height:1.03; color:${C.cream}; text-align:center; padding:0 70px;">${esc(s.title)}</div>
    <div style="font-weight:500; font-size:40px; line-height:1.3; color:rgba(243,231,201,0.78); text-align:center; padding:0 110px; margin-top:34px;">${esc(s.subtitle)}</div>
    <div style="width:120px; height:3px; background:${C.gold}; opacity:0.6; margin-top:54px; border-radius:2px;"></div>
  </div>`;
  return pageShell(inner);
}

function outroSlide(s) {
  const inner = `
  <div class="frameBorder"></div>
  <div class="stage" style="justify-content:center;">
    <div style="font-family:'Noto Serif Devanagari',serif; color:${C.gold}; font-size:58px; letter-spacing:4px; margin-bottom:30px;">${esc(s.brandHi)}</div>
    <div style="font-weight:700; font-size:116px; color:${C.cream}; letter-spacing:1px;">${esc(s.title)}</div>
    <div style="font-weight:500; font-size:36px; color:rgba(243,231,201,0.80); text-align:center; padding:0 90px; margin-top:26px;">${esc(s.subtitle)}</div>
    <div style="margin-top:70px; padding:22px 48px; border:1.5px solid ${C.saffron}; border-radius:60px;
                font-family:'Inter',sans-serif; font-weight:600; font-size:34px; color:${C.saffron}; letter-spacing:1px;">↓  ${esc(s.cta)}</div>
    <div style="font-family:'Inter',sans-serif; font-weight:500; font-size:28px; color:rgba(243,231,201,0.6); margin-top:30px; letter-spacing:1px;">${esc(s.ctaSmall)}</div>
  </div>`;
  return pageShell(inner);
}

function renderFrame(html, outPng) {
  const tmpHtml = outPng.replace(/\.png$/, '.html');
  fs.writeFileSync(tmpHtml, html);
  execFileSync(CHROME, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--force-device-scale-factor=1', `--window-size=${W},${H}`,
    '--virtual-time-budget=6000', '--default-background-color=00000000',
    `--screenshot=${outPng}`, 'file://' + tmpHtml,
  ], { stdio: 'pipe', timeout: 60000 });
  return fs.existsSync(outPng);
}

function main() {
  const reel = process.argv[2];
  const slidesOnly = process.argv.includes('--slides-only');
  if (!REELS[reel]) { console.error('usage: node make-reel.js <vrat|routine> [--slides-only]'); process.exit(1); }
  const cfg = REELS[reel];
  const shotsDir = path.join(CTX, 'shots', reel);
  const framesDir = path.join(CTX, 'frames');
  fs.mkdirSync(framesDir, { recursive: true });

  const frames = [];
  let idx = 0;
  for (const s of cfg.slides) {
    let html, dur = s.dur || 3.4;
    if (s.cover) html = coverSlide(s);
    else if (s.outro) html = outroSlide(s);
    else {
      const p = path.join(shotsDir, s.shot + '.png');
      if (!fs.existsSync(p)) { console.warn('  ⚠ missing screenshot, skipping:', s.shot); continue; }
      html = shotSlide(s, dataUri(p));
    }
    const out = path.join(framesDir, `${reel}-${String(idx).padStart(2, '0')}.png`);
    process.stdout.write(`  rendering ${path.basename(out)} … `);
    const ok = renderFrame(html, out);
    console.log(ok ? 'ok' : 'FAILED');
    if (ok) frames.push({ file: out, dur });
    idx++;
  }
  if (!frames.length) { console.error('no frames rendered'); process.exit(2); }
  console.log(`rendered ${frames.length} frames`);
  if (slidesOnly) return;

  // ── ffmpeg xfade assembly ──
  const d = 0.6; // transition seconds
  const args = [];
  frames.forEach(f => { args.push('-loop', '1', '-t', String(f.dur), '-i', f.file); });
  const fc = [];
  let prev = '[0:v]';
  let cum = frames[0].dur;
  for (let k = 1; k < frames.length; k++) {
    const offset = (cum - d).toFixed(3);
    const label = (k === frames.length - 1) ? '[xf]' : `[v${k}]`;
    fc.push(`${prev}[${k}:v]xfade=transition=fade:duration=${d}:offset=${offset}${label}`);
    prev = label;
    cum += frames[k].dur - d;
  }
  const total = frames.reduce((a, f) => a + f.dur, 0) - (frames.length - 1) * d;
  fc.push(`${prev}fade=t=in:st=0:d=0.4,fade=t=out:st=${(total - 0.5).toFixed(3)}:d=0.5,format=yuv420p[final]`);
  const outMp4 = path.join(CTX, cfg.out);
  const ffArgs = [...args, '-filter_complex', fc.join(';'), '-map', '[final]', '-r', '30', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-y', outMp4];
  console.log('assembling', cfg.out, `(~${total.toFixed(1)}s, ${frames.length} slides)`);
  execFileSync(FFMPEG, ffArgs, { stdio: 'pipe' });
  console.log('✅ wrote', outMp4);
}
main();
