// cards.mjs — render the branded intro + CTA cards to 1080×1920 PNGs via headless Chrome.
// Brand tokens (palette, fonts, frame, ॐ wordmark) are lifted from marketing/linkedin/make-reel.js
// so reels match the existing kit exactly.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const CHROME = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const W = 1080, H = 1920;
const SMART_LINK = 'persisharma.github.io/get-vedansh';

const C = {
  bgTop: '#1a0e03', bgMid: '#3d1a00', bgBot: '#8A3E0B',
  saffron: '#E08A3C', gold: '#E8C887', cream: '#F3E7C9',
};

const FONTS = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Noto+Serif+Devanagari:wght@500;600&family=Inter:wght@500;600&display=swap" rel="stylesheet">`;

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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
    -webkit-font-smoothing:antialiased; position:relative;
  }
  .frameBorder { position:absolute; inset:26px; border:1.5px solid rgba(232,200,135,0.28); border-radius:30px; pointer-events:none; }
  .stage { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; }
</style></head><body>${inner}</body></html>`;
}

function introHtml({ kicker, hook, brandHi = 'ॐ वेदांश़ ॐ' }) {
  const inner = `
  <div class="frameBorder"></div>
  <div class="stage">
    <div style="font-family:'Noto Serif Devanagari',serif; color:${C.gold}; font-size:46px; letter-spacing:4px; margin-bottom:40px;">${esc(brandHi)}</div>
    <div style="font-family:'Inter',sans-serif; font-weight:600; font-size:26px; letter-spacing:6px;
                color:${C.saffron}; text-transform:uppercase; margin-bottom:30px;">${esc(kicker)}</div>
    <div style="font-weight:600; font-size:78px; line-height:1.12; color:${C.cream}; text-align:center; padding:0 90px;">${esc(hook)}</div>
    <div style="width:120px; height:3px; background:${C.gold}; opacity:0.6; margin-top:54px; border-radius:2px;"></div>
  </div>`;
  return pageShell(inner);
}

function ctaHtml({ cta, brandHi = 'ॐ वेदांश़ ॐ' }) {
  const inner = `
  <div class="frameBorder"></div>
  <div class="stage">
    <div style="font-family:'Noto Serif Devanagari',serif; color:${C.gold}; font-size:58px; letter-spacing:4px; margin-bottom:30px;">${esc(brandHi)}</div>
    <div style="font-weight:700; font-size:96px; color:${C.cream}; letter-spacing:1px;">Vedansh</div>
    <div style="font-weight:500; font-size:40px; line-height:1.28; color:rgba(243,231,201,0.82); text-align:center; padding:0 110px; margin-top:26px;">${esc(cta)}</div>
    <div style="margin-top:64px; padding:22px 48px; border:1.5px solid ${C.saffron}; border-radius:60px;
                font-family:'Inter',sans-serif; font-weight:600; font-size:34px; color:${C.saffron}; letter-spacing:1px;">↓  ${esc(SMART_LINK)}</div>
    <div style="font-family:'Inter',sans-serif; font-weight:500; font-size:28px; color:rgba(243,231,201,0.6); margin-top:30px; letter-spacing:1px;">Free · iPhone &amp; Android</div>
  </div>`;
  return pageShell(inner);
}

function renderFrame(html, outPng) {
  const tmpHtml = outPng.replace(/\.png$/, '.html');
  fs.writeFileSync(tmpHtml, html);
  execFileSync(
    CHROME,
    [
      '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
      '--force-device-scale-factor=1', `--window-size=${W},${H}`,
      '--virtual-time-budget=6000', `--screenshot=${outPng}`, 'file://' + tmpHtml,
    ],
    { stdio: 'pipe', timeout: 60000 },
  );
  if (!fs.existsSync(outPng)) throw new Error(`card render failed: ${outPng}`);
  return outPng;
}

/** Render intro + CTA PNGs for a reel/lang. Returns { intro, cta } absolute paths. */
export function renderCards(reel, lang, outDir, kicker) {
  fs.mkdirSync(outDir, { recursive: true });
  const intro = renderFrame(introHtml({ kicker: kicker || 'VEDANSH', hook: reel.hook[lang] }),
    path.join(outDir, `${reel.slug}-${lang}-intro.png`));
  const cta = renderFrame(ctaHtml({ cta: reel.cta[lang] }),
    path.join(outDir, `${reel.slug}-${lang}-cta.png`));
  return { intro, cta };
}
