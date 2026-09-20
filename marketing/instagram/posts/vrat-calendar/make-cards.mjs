// make-cards.mjs — render the "शेष सितंबर" Instagram carousel to 1080×1350 PNGs.
//
//   node make-cards.mjs            # → out/01-cover.png … out/05-cta.png
//   CHROME_BIN=/path/to/chrome node make-cards.mjs
//
// Brand tokens (palette, fonts, frame, ॐ वेदांश़ ॐ wordmark, smart link) are the ones
// marketing/reels/cards.mjs already uses, so a carousel matches the reels kit. The
// three fonts are the app's own, loaded from mobile/node_modules/@expo-google-fonts
// and INLINED as base64 — the render must not depend on network access.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { DAYS, SERIES, SLIDES } from './days.mjs';
import { glyphSvg } from './glyphs.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '..', '..', '..', '..');
const FONT_DIR = path.join(REPO_ROOT, 'mobile', 'node_modules', '@expo-google-fonts');
const OUT_DIR = path.join(HERE, 'out');
const ART_DIR = path.join(HERE, 'art');

const CHROME = process.env.CHROME_BIN || '/opt/pw-browsers/chromium';
const W = 1080, H = 1350;
const SMART_LINK = 'persisharma.github.io/get-vedansh';

const C = {
  bgTop: '#1a0e03', bgMid: '#3d1a00', bgBot: '#8A3E0B',
  saffron: '#E08A3C', gold: '#E8C887', cream: '#F3E7C9',
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const ordinal = (n) => (n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th');

function fontFace(family, weight, file) {
  const b64 = fs.readFileSync(path.join(FONT_DIR, file)).toString('base64');
  return `@font-face{font-family:'${family}';font-weight:${weight};font-style:normal;font-display:block;`
    + `src:url(data:font/ttf;base64,${b64}) format('truetype');}`;
}

const FONTS = [
  fontFace('Cormorant', 600, 'cormorant-garamond/600SemiBold/CormorantGaramond_600SemiBold.ttf'),
  fontFace('Cormorant', 700, 'cormorant-garamond/700Bold/CormorantGaramond_700Bold.ttf'),
  fontFace('Devanagari', 500, 'noto-serif-devanagari/500Medium/NotoSerifDevanagari_500Medium.ttf'),
  fontFace('Devanagari', 600, 'noto-serif-devanagari/600SemiBold/NotoSerifDevanagari_600SemiBold.ttf'),
  fontFace('Inter', 500, 'inter/500Medium/Inter_500Medium.ttf'),
  fontFace('Inter', 600, 'inter/600SemiBold/Inter_600SemiBold.ttf'),
].join('\n');

/** The faint mandala watermark each row carries, echoing the app's rosette. */
function mandala(size = 300) {
  const petals = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * 360;
    return `<ellipse cx="50" cy="26" rx="8" ry="20" transform="rotate(${a} 50 50)"
      fill="none" stroke="currentColor" stroke-width="1.6"/>`;
  }).join('');
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    ${petals}<circle cx="50" cy="50" r="12" fill="none" stroke="currentColor" stroke-width="1.6"/>
    <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>`;
}

function medallion(dayEntry) {
  const artFile = dayEntry.art && fs.existsSync(path.join(ART_DIR, dayEntry.art))
    ? path.join(ART_DIR, dayEntry.art)
    : null;
  const inner = artFile
    ? `<img src="file://${artFile}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
    : `<div class="art">${glyphSvg(dayEntry.glyph)}</div>`;
  return `<div class="medallion">${inner}</div>`;
}

function row(dayEntry) {
  return `
  <div class="row">
    <div class="rowMandala">${mandala(260)}</div>
    ${medallion(dayEntry)}
    <div class="rowText">
      <div class="weekday">${esc(dayEntry.weekdayEn)} · ${esc(dayEntry.weekdayHi)}</div>
      <div class="bigDate">${dayEntry.day}<sup>${ordinal(dayEntry.day)}</sup> <span class="month">September</span></div>
      <div class="nameHi">${esc(dayEntry.nameHi)}</div>
      <div class="nameEn">${esc(dayEntry.nameEn)} · ${esc(dayEntry.tithiHi)}</div>
    </div>
  </div>`;
}

function shell(inner, { counter, footLink = true }) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  ${FONTS}
  *{margin:0;padding:0;box-sizing:border-box;}
  html,body{width:${W}px;height:${H}px;overflow:hidden;background:${C.bgTop};}
  /* The gradient lives on .page, not on body: a body background propagates to the root
     canvas, which headless Chrome sizes to the VIEWPORT, so the last ~95px of a
     window-size capture came out white. A fixed-size element paints the full frame. */
  .page{
    position:relative; width:${W}px; height:${H}px; overflow:hidden;
    font-family:'Cormorant',Georgia,serif; color:${C.cream};
    background:
      radial-gradient(120% 70% at 50% -10%, rgba(224,138,60,0.32), rgba(0,0,0,0) 62%),
      linear-gradient(168deg, ${C.bgTop} 0%, ${C.bgMid} 46%, ${C.bgBot} 100%);
    -webkit-font-smoothing:antialiased;
  }
  .frameBorder{position:absolute;inset:26px;border:1.5px solid rgba(232,200,135,0.28);border-radius:30px;pointer-events:none;}
  .stage{position:absolute;inset:26px;padding:44px 52px 40px;display:flex;flex-direction:column;}
  .head{display:flex;align-items:flex-start;justify-content:space-between;}
  .brand{font-family:'Devanagari',serif;font-weight:600;color:${C.gold};font-size:34px;letter-spacing:3px;}
  .kicker{font-family:'Inter',sans-serif;font-weight:600;font-size:18px;letter-spacing:5px;
          text-transform:uppercase;color:${C.saffron};margin-top:10px;}
  .counter{font-family:'Inter',sans-serif;font-weight:600;font-size:26px;color:${C.cream};
           background:rgba(255,255,255,0.08);border:1.5px solid rgba(232,200,135,0.35);
           border-radius:44px;padding:12px 26px;}
  .rows{flex:1;display:flex;flex-direction:column;justify-content:center;gap:28px;}
  .row{position:relative;display:flex;align-items:center;gap:34px;padding:30px 34px;overflow:hidden;
       background:linear-gradient(180deg, rgba(255,255,255,0.085), rgba(255,255,255,0.03));
       border:1.5px solid rgba(232,200,135,0.20);border-radius:30px;}
  .rowMandala{position:absolute;right:-56px;top:-34px;color:rgba(232,200,135,0.10);line-height:0;}
  .medallion{flex:0 0 210px;width:210px;height:210px;border-radius:50%;overflow:hidden;
             background:radial-gradient(circle at 34% 28%, #FFF7E7 0%, #F6D79B 52%, #E9B45F 100%);
             border:3px solid rgba(232,200,135,0.75);
             box-shadow:0 10px 26px rgba(0,0,0,0.34); display:flex;align-items:center;justify-content:center;}
  .art{width:150px;height:150px;}
  .art svg{width:100%;height:100%;display:block;}
  .rowText{position:relative;min-width:0;}
  .weekday{font-family:'Inter',sans-serif;font-weight:500;font-size:22px;letter-spacing:1.5px;
           color:rgba(243,231,201,0.66);}
  .bigDate{font-weight:700;font-size:64px;line-height:1.08;color:${C.cream};margin-top:2px;}
  .bigDate sup{font-size:0.46em;vertical-align:super;}
  .bigDate .month{font-weight:600;}
  .nameHi{font-family:'Devanagari',serif;font-weight:600;font-size:40px;line-height:1.34;
          color:${C.gold};margin-top:12px;}
  .nameEn{font-family:'Inter',sans-serif;font-weight:500;font-size:20px;line-height:1.45;
          color:rgba(243,231,201,0.62);margin-top:9px;}
  .foot{display:flex;align-items:center;justify-content:space-between;padding-top:26px;
        border-top:1px solid rgba(232,200,135,0.18);}
  .footLink{font-family:'Inter',sans-serif;font-weight:600;font-size:21px;color:${C.saffron};letter-spacing:0.6px;}
  .footNote{font-family:'Inter',sans-serif;font-weight:500;font-size:19px;color:rgba(243,231,201,0.55);}
  .centre{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;}
  </style></head><body><div class="page">
  <div class="frameBorder"></div>
  <div class="stage">
    <div class="head">
      <div>
        <div class="brand">ॐ वेदांश़ ॐ</div>
        <div class="kicker">व्रत · पर्व · तिथि</div>
      </div>
      <div class="counter">${esc(counter)}</div>
    </div>
    ${inner}
    <div class="foot">
      <div class="footLink">${footLink ? '↓ ' + esc(SMART_LINK) : ''}</div>
      <div class="footNote">Vedansh · पंचांग in your pocket</div>
    </div>
  </div></div></body></html>`;
}

function coverHtml(counter) {
  const inner = `
  <div class="centre">
    <div style="color:rgba(232,200,135,0.16);margin-bottom:-232px;line-height:0;">${mandala(420)}</div>
    <div style="font-family:'Devanagari',serif;font-weight:600;font-size:96px;line-height:1.2;color:${C.cream};
                position:relative;">${esc(SERIES.titleHi)}</div>
    <div style="font-family:'Devanagari',serif;font-weight:500;font-size:46px;color:${C.gold};margin-top:16px;position:relative;">
      व्रत और तिथियाँ</div>
    <div style="width:140px;height:3px;background:${C.gold};opacity:0.55;margin:40px 0;border-radius:2px;position:relative;"></div>
    <div style="font-family:'Inter',sans-serif;font-weight:600;font-size:34px;letter-spacing:2px;color:${C.saffron};position:relative;">
      ${esc(SERIES.rangeEn)}</div>
    <div style="font-family:'Inter',sans-serif;font-weight:500;font-size:24px;line-height:1.6;
                color:rgba(243,231,201,0.68);margin-top:26px;max-width:720px;position:relative;">
      ${DAYS.length} observances · Ekadashi, Anant Chaturdashi, the Purnima and the opening of Pitru Paksha —
      swipe for every date, tithi and the deity it belongs to.</div>
  </div>`;
  return shell(inner, { counter });
}

function slideHtml(days, counter) {
  return shell(`<div class="rows">${days.map(row).join('')}</div>`, { counter });
}

function ctaHtml(counter) {
  const inner = `
  <div class="centre">
    <div style="color:rgba(232,200,135,0.14);margin-bottom:-210px;line-height:0;">${mandala(380)}</div>
    <div style="font-family:'Devanagari',serif;font-weight:600;font-size:52px;color:${C.gold};position:relative;">
      हर तिथि, समय पर</div>
    <div style="font-weight:700;font-size:104px;line-height:1.1;color:${C.cream};margin-top:18px;position:relative;">Vedansh</div>
    <div style="font-family:'Inter',sans-serif;font-weight:500;font-size:27px;line-height:1.62;
                color:rgba(243,231,201,0.76);margin-top:26px;max-width:740px;position:relative;">
      Panchang, vrat reminders, kathas, puja vidhi and the daily muhurat — offline, ad-free,
      in Hindi and English.</div>
    <div style="margin-top:52px;padding:22px 46px;border:1.5px solid ${C.saffron};border-radius:60px;
                font-family:'Inter',sans-serif;font-weight:600;font-size:30px;color:${C.saffron};
                letter-spacing:0.8px;position:relative;">↓ ${esc(SMART_LINK)}</div>
    <div style="font-family:'Inter',sans-serif;font-weight:500;font-size:24px;
                color:rgba(243,231,201,0.6);margin-top:26px;letter-spacing:1px;position:relative;">
      Free · iPhone &amp; Android</div>
  </div>`;
  return shell(inner, { counter, footLink: false });  // the CTA already carries the link in its pill
}

/**
 * Headless Chrome's viewport is SHORTER than `--window-size` by a fixed chrome inset
 * (87px on this Linux build). `--screenshot` then sizes the PNG to the content but
 * paints only the viewport, so the last ~90px of a 1350-tall card came out blank.
 * Measure the inset once with a probe page and grow the window by exactly that much.
 */
function viewportInset() {
  const probe = path.join(OUT_DIR, '.probe.html');
  fs.writeFileSync(probe, '<!doctype html><html><body><i id="o"></i>'
    + '<script>document.getElementById("o").textContent="H:"+window.innerHeight;</script></body></html>');
  const dom = execFileSync(CHROME, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--force-device-scale-factor=1',
    `--window-size=${W},${H}`, '--virtual-time-budget=3000', '--dump-dom', 'file://' + probe,
  ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  fs.unlinkSync(probe);
  const inner = Number(/H:(\d+)/.exec(dom)?.[1]);
  if (!inner) throw new Error('could not measure the headless viewport height');
  return H - inner;
}

let WINDOW_H = H;

function render(html, outPng) {
  const tmpHtml = outPng.replace(/\.png$/, '.html');
  fs.writeFileSync(tmpHtml, html);
  execFileSync(CHROME, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--force-device-scale-factor=1', `--window-size=${W},${WINDOW_H}`,
    '--virtual-time-budget=8000', `--screenshot=${outPng}`, 'file://' + tmpHtml,
  ], { stdio: 'pipe' });
  fs.unlinkSync(tmpHtml);
  console.log('  ' + path.relative(HERE, outPng));
}

function main() {
  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  WINDOW_H = H + viewportInset();
  const total = SLIDES.length + 2;
  const pages = [
    ['01-cover.png', coverHtml(`1/${total}`)],
    ...SLIDES.map((days, i) => [`0${i + 2}-days.png`, slideHtml(days, `${i + 2}/${total}`)]),
    [`0${total}-cta.png`, ctaHtml(`${total}/${total}`)],
  ];

  console.log(`Rendering ${pages.length} cards at ${W}×${H} …`);
  for (const [name, html] of pages) render(html, path.join(OUT_DIR, name));
  console.log('Done → ' + path.relative(REPO_ROOT, OUT_DIR));
}

main();
