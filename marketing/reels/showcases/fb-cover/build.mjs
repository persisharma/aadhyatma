// Vedansh Facebook Page cover: the feature-reel screens in a phone fan, with a bilingual (Hindi-led) feature grid.
// Canvas 1640x924 (16:9, shown whole on phones). Desktop shows the centre 1640x624 band (820x312 at 2x),
// so all text sits inside y 150–774, and the bottom-left corner (profile photo) stays clear.
// Usage: node build.mjs [--out <dir>]   -> cover PNG/JPG + desktop/mobile previews + a safe-zone check image.
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath, pathToFileURL} from 'node:url';

const require = createRequire(import.meta.url);
const {chromium} = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../../..');
const i = process.argv.indexOf('--out');
const out = path.resolve(i > -1 ? process.argv[i + 1] : path.join(root, 'marketing/reels/out/fb-cover'));
fs.mkdirSync(out, {recursive: true});
const url = rel => { if (!fs.existsSync(path.join(root, rel))) throw Error(`Missing ${rel}`); return pathToFileURL(path.join(root, rel)).href; };
const W = 1640, H = 924, BAND = [150, 774];

const phones = [ // [screen, centerX, top, width, rotate, z]
  ['docs/evaluations/celestial-chakra-2026-10-06/native/panchang.png', 935, 250, 232, -9, 1],
  ['marketing/reels/showcases/latest-1.5.0/screens/hi/03-kundali.png', 1528, 250, 232, 9, 1],
  ['docs/content-parity/kids-story-pacing/screenshots/kids-hanuman-sun-hi-large-hs07.png', 1080, 176, 262, -4, 2],
  ['marketing/reels/showcases/latest-1.5.0/screens/hi/07-japam.png', 1384, 176, 262, 4, 2],
  ['docs/evaluations/daily-bhakti-compression/native/daily-compressed-krishna.jpg', 1232, 120, 300, 0, 3],
];
const features = [
  ['nav-panchang', 'पंचांग', 'Panchang'], ['vrat', 'व्रत-त्योहार', 'Vrat & festivals'], ['aarti', 'पूजा विधि', 'Puja vidhi'], ['granth', 'गीता · चालीसा', 'Gita & Chalisa'],
  ['krishna', 'भजन · मंत्र', 'Bhajans'], ['japam', 'जप माला', 'Jap Mala'], ['kundali', 'कुंडली · राशिफल', 'Kundali'], ['hanuman', 'बाल कथाएँ', 'Kids stories'],
];

const html = `<!doctype html><html lang="hi"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Inter:wght@500;600&family=Noto+Serif+Devanagari:wght@600;700&display=block">
<style>
*{box-sizing:border-box;margin:0}html,body{width:${W}px;height:${H}px;overflow:hidden}
body{background:radial-gradient(90% 120% at 78% 45%,#FFF8E6 0%,#FFF1D5 42%,#EEDDB5 100%);color:#1A0E03;font-family:'Noto Serif Devanagari','Inter'}
.yantra{position:absolute;left:880px;top:-150px;width:1240px;height:1240px;opacity:.08;mix-blend-mode:multiply;border-radius:50%;-webkit-mask:radial-gradient(circle,#000 36%,transparent 66%)}
.glow{position:absolute;left:930px;top:120px;width:620px;height:620px;border-radius:50%;background:radial-gradient(circle,#FFD99Acc,#FFD99A00 70%)}
.phone{position:absolute;padding:9px;border-radius:40px;background:linear-gradient(150deg,#4a2e18,#1a0e05 60%);box-shadow:0 26px 50px rgba(92,50,20,.32),0 6px 14px rgba(92,50,20,.2),inset 0 0 0 1.5px rgba(214,170,96,.6);transform-origin:50% 0}
.phone .scr{width:100%;height:100%;border-radius:32px;overflow:hidden;background:#F6ECD0}
.phone img{width:100%;height:100%;object-fit:cover;object-position:top;display:block}
.left{position:absolute;left:92px;top:160px;width:740px}
.marks{display:flex;align-items:center;gap:26px}
.marks .en{height:86px}.marks .hi{height:72px}.marks .sep{width:2px;height:62px;background:linear-gradient(#A67C3400,#A67C34,#A67C3400)}
h1{margin-top:18px;font:700 54px/1.32 'Noto Serif Devanagari';color:#1A0E03}
.en-line{margin-top:2px;font:600 36px/1.2 'Cormorant Garamond';color:#5A3A1E}
.en-line b{color:#B8621B;font-weight:700}
.grid{margin-top:26px;display:grid;grid-template-columns:repeat(4,174px);gap:12px}
.chip{height:116px;border-radius:20px;background:#FFF9EC;border:1.5px solid #E0BF84;box-shadow:0 8px 18px rgba(120,70,20,.10);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
.chip img{width:50px;height:50px}
.chip .h{font:700 22px/1.35 'Noto Serif Devanagari';color:#8A3E0B}
.chip .e{font:500 14px/1.1 Inter;color:#6E5230;letter-spacing:.2px}
</style></head><body>
<img class="yantra" src="${url('mobile/assets/icon.png')}"><div class="glow"></div>
${phones.map(([s, cx, top, w, r, z]) => `<div class="phone" style="left:${cx - w / 2}px;top:${top}px;width:${w}px;height:${Math.round((w - 18) * 2622 / 1206 + 18)}px;transform:rotate(${r}deg);z-index:${z}"><div class="scr"><img src="${url(s)}"></div></div>`).join('')}
<div class="left">
  <div class="marks"><img class="en" src="${url('mobile/assets/branding/wordmarks/english.png')}"><span class="sep"></span><img class="hi" src="${url('mobile/assets/branding/wordmarks/hindi.png')}"></div>
  <h1>हर दिन की भक्ति, एक ही ऐप में</h1>
  <div class="en-line">Your spiritual companion · <b>No login. No in-app ads.</b></div>
  <div class="grid">${features.map(([icon, h, e]) => `<div class="chip"><img src="${url(`mobile/assets/icons/storybook/${icon}.png`)}"><div class="h">${h}</div><div class="e">${e}</div></div>`).join('')}</div>
</div>
</body></html>`;

const htmlFile = path.join(out, 'cover.html');
fs.writeFileSync(htmlFile, html);
const browser = await chromium.launch();
try {
  const page = await browser.newPage({viewport: {width: W, height: H}, deviceScaleFactor: 1});
  await page.goto(pathToFileURL(htmlFile).href, {waitUntil: 'networkidle'});
  await page.evaluate(async () => {
    await Promise.all([['700 40px "Noto Serif Devanagari"', 'हिं'], ['600 40px "Cormorant Garamond"', 'Aa'], ['700 40px "Cormorant Garamond"', 'Aa'], ['500 40px Inter', 'Aa']].map(([f, s]) => document.fonts.load(f, s)));
    await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode()));
    // Wider-than-phone captures (9:16 Android) fit by width, top-anchored, so no app UI is cropped at the sides.
    for (const img of document.querySelectorAll('.phone img')) if (img.naturalWidth / img.naturalHeight > 0.48) Object.assign(img.style, {objectFit: 'contain'});
  });
  const ok = await page.evaluate(() => [document.fonts.check('700 40px "Noto Serif Devanagari"', 'हिं'), document.fonts.check('600 40px "Cormorant Garamond"', 'Aa')]);
  if (ok.includes(false)) throw Error('Web fonts failed to load');
  // Text must sit in the desktop band and clear of the bottom-left profile-photo corner.
  const boxes = await page.evaluate(() => [...document.querySelectorAll('.left *')].filter(e => e.children.length === 0).map(e => { const r = e.getBoundingClientRect(); return [e.className || e.tagName, r.left, r.top, r.right, r.bottom]; }));
  const bad = boxes.filter(([, , t, , b]) => t < 150 || b > 774);
  if (bad.length) throw Error(`Text outside desktop band: ${JSON.stringify(bad)}`);
  const png = path.join(out, 'vedansh-fb-cover-1640x924.png');
  await page.screenshot({path: png});
  await page.screenshot({path: path.join(out, 'vedansh-fb-cover-1640x924.jpg'), type: 'jpeg', quality: 92});
  await page.screenshot({path: path.join(out, 'preview-desktop-1640x624.png'), clip: {x: 0, y: BAND[0], width: W, height: BAND[1] - BAND[0]}});
  // Safe-zone overlay for review only.
  await page.evaluate(([a, b]) => {
    const d = document.createElement('div');
    d.style.cssText = `position:absolute;left:0;right:0;top:${a}px;height:${b - a}px;outline:4px dashed #d00;z-index:99`;
    const p = document.createElement('div');
    p.style.cssText = `position:absolute;left:40px;top:${b - 90}px;width:180px;height:180px;border-radius:50%;background:rgba(200,0,0,.25);z-index:99`;
    document.body.append(d, p);
  }, BAND);
  await page.screenshot({path: path.join(out, 'review-safe-zones.png')});
  console.log(`${png}\nText boxes checked: ${boxes.length}, max bottom ${Math.max(...boxes.map(b => b[4])).toFixed(0)}px`);
} finally { await browser.close(); }
