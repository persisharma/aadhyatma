#!/usr/bin/env node
/*
 * make-carousel.mjs — render a light "parchment" 4:5 Instagram carousel (1080×1350)
 * for Vedansh via headless Chrome. Companion to make-reel.js, which renders the dark
 * reel/carousel kit. This one is the editorial format: kicker + title + subtitle +
 * 2–3 short paragraphs with saffron highlights, a faded deity line-drawing behind,
 * and the brand footer (वेदांश़ · smart link · handle) on every slide.
 *
 *   node make-carousel.mjs pitru-paksha-2026                 # → carousel/pitru-paksha-2026-1.png …
 *   node make-carousel.mjs pitru-paksha-2026 --out ./posts/pitru-paksha-2026
 *   node make-carousel.mjs pitru-paksha-2026 --fonts ./fonts/fonts.css   # offline fonts (see below)
 *
 * Fonts: by default the page links Google Fonts at render time (needs network in
 * Chrome). If Chrome cannot reach the network (proxy / CA), download the CSS + woff2
 * once with curl and pass the local CSS via --fonts; relative url(...) entries are
 * resolved against that file's directory.
 *
 * Backgrounds are the app's own faded deity sketches in mobile/assets/backgrounds —
 * the same art the reader shows, so the feed and the app look like one thing.
 *
 * Slide kinds:
 *   hook    — slide 1. Kicker, one big question, one-line answer, a "swipe" cue.
 *   text    — kicker, title, subtitle, rule, paragraphs. `**…**` marks a saffron bold.
 *   cta     — closing card: what the app does for this occasion + download button.
 *
 * Highlight syntax inside paragraphs: **bold saffron**. Nothing else is parsed.
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..');
const BG_DIR = path.join(REPO, 'mobile', 'assets', 'backgrounds');

const CHROME =
  process.env.CHROME_BIN ||
  (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium'
    : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');

const W = 1080, H = 1350;
const SMART_LINK = 'persisharma.github.io/get-vedansh';
const HANDLE = '@vedansh.app';

// ── Brand (light theme — mirrors mobile/src/theme parchment tokens) ──
const C = {
  paper: '#F5EBD2', paperDeep: '#EEDFBE', paperEdge: '#E7D5B0',
  ink: '#1A0E03', inkSoft: '#3B2A14', inkMuted: '#6B5638',
  saffron: '#8A3E0B', saffronBright: '#B8621B', gold: '#C9A15E',
  rule: 'rgba(138,62,11,0.45)', border: 'rgba(138,62,11,0.22)',
};

/*
 * ── Manifests ───────────────────────────────────────────────────────────────
 * One entry per carousel. Copy the shape for a new occasion. Dates for the
 * Pitru Paksha entry match mobile/src/panchang/__tests__/pitruSmaran.test.ts
 * (Purnima Shraddha Sat 26 Sep 2026 · Sarva Pitru Amavasya Sat 10 Oct 2026).
 */
const CAROUSELS = {
  'pitru-paksha-2026': {
    slides: [
      {
        kind: 'hook',
        bg: 'deity-rama-darbar.webp',
        kicker: 'पितृ पक्ष · 26 सितम्बर – 10 अक्टूबर 2026',
        title: 'श्रीराम ने पिता को\nक्या दिया था?',
        subtitle: 'सोना नहीं। अन्न नहीं। अञ्जलि भर जल।',
        body: [
          'आज से पितृ पक्ष आरम्भ। रामायण के दो प्रसंग बताते हैं कि पितरों तक **क्या** पहुँचता है — और बिहार की वह जगह जहाँ इसी पखवाड़े **लाखों लोग वही कर रहे हैं**।',
        ],
        swipe: 'स्वाइप करें →',
      },
      {
        kind: 'text',
        bg: 'deity-ganga.webp',
        kicker: 'तर्पण का सबसे पुराना रूप',
        title: 'जल ही क्यों',
        subtitle: 'रामायण जो बार-बार दिखाती है',
        body: [
          'रामायण में पितृ-कर्म एक ही रूप में मिलता है: **अञ्जलि भर जल**, **दक्षिण दिशा** की ओर मुख, और यह भाव कि यह जल उन तक पहुँचे।',
          'श्रीराम ने पिता दशरथ के लिए **मन्दाकिनी** में यही किया, और जटायु के लिए **गोदावरी** में।',
          'बालकाण्ड में गरुड़ अंशुमान् से कहते हैं — सगर के पुत्रों के लिए लौकिक जल पर्याप्त नहीं; उनके लिए **गंगा** चाहिए। तीन पीढ़ियाँ इसी प्रश्न में बीतीं।',
        ],
        canon: 'वाल्मीकि रामायण · अयोध्याकाण्ड १०३ · अरण्यकाण्ड ६८ · बालकाण्ड ४१',
      },
      {
        kind: 'text',
        bg: 'deity-rama-darbar.webp',
        kicker: 'जटायु का प्रसंग',
        title: 'किसके लिए, और किससे',
        subtitle: 'सामग्री नहीं, भाव देखा जाता है',
        body: [
          'अरण्यकाण्ड में श्रीराम **जटायु** का दाह-संस्कार स्वयं करते हैं। जटायु न उनके कुल के थे, न मनुष्य — वे पिता के मित्र एक पक्षी थे।',
          'वन में राम के पास राजसी पदार्थ नहीं थे। उन्होंने वहीं मिले **इंगुदी के गूदे** से पिता के लिए पिण्ड बनाया और कहा — **जो हम खाते हैं, वही आपको अर्पित है।**',
          'स्मरण का द्वार किसी सूची से नहीं, **भाव** से खुलता है।',
        ],
        canon: 'वाल्मीकि रामायण · अरण्यकाण्ड ६७–६८ · अयोध्याकाण्ड १०३',
      },
      {
        kind: 'text',
        bg: 'source-vishnu-narayana.webp',
        kicker: 'जहाँ आज यही हो रहा है · गया, बिहार',
        title: 'फल्गु का तट',
        subtitle: 'विष्णुपद · पितृपक्ष मेला · 26 सितम्बर – 10 अक्टूबर',
        body: [
          'इन पन्द्रह दिनों में **गया** में पितृपक्ष मेला लगता है। **फल्गु** के तट पर, **विष्णुपद** मन्दिर के आस-पास, देश भर से लोग पिण्डदान के लिए आते हैं।',
          'गया-माहात्म्य और लोक-परम्परा कहती है कि श्रीराम, सीता और लक्ष्मण भी दशरथ के लिए यहीं आए थे — और **सीता ने फल्गु की बालू से पिण्ड** बनाया। (यह प्रसंग वाल्मीकि रामायण में नहीं है; यह गया की अपनी स्मृति है।)',
          'यहाँ भी वही तीन चीज़ें: **जल**, **दक्षिण दिशा**, और **भाव**।',
        ],
        canon: 'लोक-परम्परा · गया-माहात्म्य (वायु पुराण)',
      },
      {
        kind: 'cta',
        bg: 'deity-rama-darbar.webp',
        kicker: 'पितृ पक्ष · 26 सितम्बर – 10 अक्टूबर 2026',
        title: 'पितृ पक्ष, वेदांश़ में',
        subtitle: 'समझिए, फिर करिए',
        items: [
          ['पितृ पक्ष परिचय', 'जल ही क्यों · किसके लिए · किस दिन किसका श्राद्ध', 'पि'],
          ['तिथि', 'आपके शहर का पंचांग — श्राद्ध का दिन तिथि से', 'ति'],
          ['याद', 'पितृ स्मरण reminder — तिथि से एक रात पहले', 'या'],
          ['कथा', 'रामायण के प्रसंग — मूल पाठ तक, हिंदी और अंग्रेज़ी', 'क'],
        ],
        note: 'मुफ़्त · बिना इंटरनेट के भी चलता है · Free · Works offline',
        button: 'अभी डाउनलोड करें · Download Now',
      },
    ],
  },
};

// ── helpers ──────────────────────────────────────────────────────────────────
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function rich(s) {
  // **bold** → saffron bold; \n → <br>
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, `<b style="color:${C.saffron}; font-weight:700;">$1</b>`)
    .replace(/\n/g, '<br>')
    // Noto Serif Devanagari's danda carries a wide left bearing; pull it back onto the word.
    .replace(/ ?।/g, '<span style="margin-left:-0.16em;">।</span>');
}
function dataUri(p) {
  const ext = path.extname(p).slice(1).toLowerCase();
  const mime = ext === 'webp' ? 'image/webp' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';
  return `data:${mime};base64,` + fs.readFileSync(p).toString('base64');
}

function fontsBlock(fontsCss) {
  if (!fontsCss) {
    return `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Noto+Serif+Devanagari:wght@400;500;600;700&family=Inter:wght@500;600&display=swap" rel="stylesheet">`;
  }
  // Inline the local CSS, rewriting relative url(...) to absolute file:// paths.
  const dir = path.dirname(path.resolve(fontsCss));
  const css = fs.readFileSync(fontsCss, 'utf8').replace(/url\((['"]?)(?!data:|https?:|file:)([^'")]+)\1\)/g,
    (_m, q, rel) => `url("file://${path.resolve(dir, rel)}")`);
  return `<style>${css}</style>`;
}

// ── page shell ───────────────────────────────────────────────────────────────
function shell({ bgUri, bgPos = '62% 18%', bgOpacity = 0.22, inner, pageNo, total, fontsCss, om = true }) {
  return `<!doctype html><html><head><meta charset="utf-8">${fontsBlock(fontsCss)}
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html,body { width:${W}px; height:${H}px; overflow:hidden; }
  body {
    font-family:'Noto Serif Devanagari', serif;
    background: radial-gradient(120% 90% at 50% 0%, ${C.paper} 0%, ${C.paperDeep} 70%, ${C.paperEdge} 100%);
    color:${C.ink}; -webkit-font-smoothing:antialiased; position:relative;
  }
  .bg { position:absolute; inset:0; overflow:hidden; }
  .bg img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:${bgPos};
            opacity:${bgOpacity}; filter:sepia(0.55) saturate(0.7) contrast(0.92); }
  .bg::after { content:''; position:absolute; inset:0;
    background: linear-gradient(180deg, rgba(245,235,210,0.15) 0%, rgba(245,235,210,0) 30%, rgba(245,235,210,0.05) 70%, rgba(245,235,210,0.85) 100%); }
  .frame { position:absolute; inset:28px; border:1.5px solid ${C.border}; border-radius:28px; pointer-events:none; }
  .lat { font-family:'Cormorant Garamond', Georgia, serif; }
  .ui  { font-family:'Inter', sans-serif; }

  .head { position:absolute; top:78px; left:90px; right:90px; display:flex; justify-content:space-between; align-items:baseline; }
  .kicker { font-size:26px; font-weight:500; color:${C.saffron}; letter-spacing:0; }
  .pageno { font-family:'Inter',sans-serif; font-weight:600; font-size:26px; color:${C.inkMuted}; letter-spacing:1px; }

  .content { position:absolute; top:128px; left:90px; right:90px; bottom:330px; display:flex; flex-direction:column; }
  .title { font-size:96px; line-height:1.14; font-weight:700; color:${C.ink}; margin-top:6px; }
  .subtitle { font-size:40px; line-height:1.3; font-weight:500; color:${C.saffronBright}; margin-top:18px; }
  .rule { width:150px; height:2px; background:${C.rule}; margin:40px 0 36px; }
  .para { font-size:40px; line-height:1.55; font-weight:400; color:${C.inkSoft}; margin-bottom:34px; }
  .canon { margin-top:auto; font-size:24px; color:${C.inkMuted}; font-weight:400; }

  .om { position:absolute; left:0; right:0; top:1042px; text-align:center; font-size:30px; color:${C.gold}; letter-spacing:6px; }
  .footRule { position:absolute; left:90px; right:90px; top:1110px; height:1px; background:${C.border}; }
  .foot { position:absolute; left:90px; right:90px; top:1140px; display:flex; justify-content:space-between; align-items:flex-start; }
  .brandHi { font-size:44px; font-weight:600; color:${C.ink}; line-height:1; }
  .brandEn { font-family:'Cormorant Garamond',serif; font-style:italic; font-size:30px; color:${C.saffron}; margin-top:22px; }
  .dl { text-align:right; }
  .dl .l1 { font-size:26px; font-weight:600; color:${C.ink}; }
  .dl .l1 .lat { font-weight:700; font-size:28px; }
  .dl .l2 { font-family:'Inter',sans-serif; font-weight:600; font-size:26px; color:${C.inkMuted}; letter-spacing:1px; margin-top:16px; }
  .dl .l3 { font-family:'Inter',sans-serif; font-weight:500; font-size:26px; color:${C.inkMuted}; letter-spacing:1px; margin-top:14px; }
</style></head><body>
<div class="bg"><img src="${bgUri}"></div>
<div class="frame"></div>
<div class="head"><div class="kicker">${inner.kicker}</div><div class="pageno">${pageNo}/${total}</div></div>
<div class="content">${inner.html}</div>
${om ? '<div class="om">॥ ॐ ॥</div>' : ''}
<div class="footRule"></div>
<div class="foot">
  <div><div class="brandHi">वेदांश़</div><div class="brandEn">Vedansh: Gita, Astrology, Vrat</div></div>
  <div class="dl">
    <div class="l1"><span class="lat">iOS</span> और <span class="lat">Android</span> पर डाउनलोड करें</div>
    <div class="l2">${SMART_LINK}</div>
    <div class="l3">${HANDLE}</div>
  </div>
</div>
</body></html>`;
}

// ── slide kinds ──────────────────────────────────────────────────────────────
function hookHtml(s) {
  return `
    <div class="title" style="font-size:104px;">${rich(s.title)}</div>
    <div class="subtitle" style="font-size:44px; margin-top:26px;">${rich(s.subtitle)}</div>
    <div class="rule"></div>
    ${s.body.map(p => `<div class="para">${rich(p)}</div>`).join('')}
    <div style="margin-top:auto; display:flex; justify-content:flex-end;">
      <div class="ui" style="display:inline-block; padding:16px 34px; border:1.5px solid ${C.saffron}; border-radius:40px;
                  font-family:'Noto Serif Devanagari',serif; font-size:30px; font-weight:600; color:${C.saffron};">${esc(s.swipe)}</div>
    </div>`;
}

function textHtml(s) {
  return `
    <div class="title">${rich(s.title)}</div>
    <div class="subtitle">${rich(s.subtitle)}</div>
    <div class="rule"></div>
    ${s.body.map(p => `<div class="para">${rich(p)}</div>`).join('')}
    ${s.canon ? `<div class="canon">${esc(s.canon)}</div>` : ''}`;
}

function ctaHtml(s) {
  const items = s.items.map(([h, d, g]) => `
    <div style="display:flex; gap:26px; align-items:flex-start; padding:22px 26px; margin-bottom:16px;
                background:rgba(255,250,236,0.62); border:1px solid ${C.border}; border-radius:18px;">
      <div style="flex:0 0 auto; min-width:64px; height:64px; padding:0 14px; border-radius:14px; display:flex; align-items:center; justify-content:center;
                  background:linear-gradient(160deg,#E8B26A,#C9853E); color:#3d1a00; font-weight:700; font-size:30px;">${esc(g || h.slice(0, 2))}</div>
      <div>
        <div style="font-size:34px; font-weight:700; color:${C.saffron}; line-height:1.2;">${esc(h)}</div>
        <div style="font-size:28px; color:${C.inkSoft}; line-height:1.4; margin-top:6px;">${esc(d)}</div>
      </div>
    </div>`).join('');
  return `
    <div class="title" style="font-size:84px;">${rich(s.title)}</div>
    <div class="subtitle" style="margin-top:12px;">${rich(s.subtitle)}</div>
    <div class="rule" style="margin:26px 0 22px;"></div>
    ${items}
    <div style="margin-top:auto; text-align:center;">
      <div class="lat" style="font-size:28px; color:${C.inkMuted}; margin-bottom:22px; font-family:'Noto Serif Devanagari',serif;">${esc(s.note)}</div>
      <div style="display:inline-block; padding:22px 60px; border-radius:22px; background:linear-gradient(180deg,#A8501B,#7A3208);
                  color:#F8EFD6; font-size:38px; font-weight:700; box-shadow:0 10px 30px rgba(122,50,8,0.28);">${esc(s.button)}</div>
    </div>`;
}

// ── render ───────────────────────────────────────────────────────────────────
function renderPng(html, outPng) {
  const tmpHtml = outPng.replace(/\.png$/, '.html');
  fs.writeFileSync(tmpHtml, html);
  const SLACK = 200; // headless=new paints a short band at the bottom; capture tall, crop back.
  execFileSync(CHROME, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars', '--allow-file-access-from-files',
    '--force-device-scale-factor=1', `--window-size=${W},${H + SLACK}`,
    '--virtual-time-budget=8000', `--screenshot=${outPng}`, 'file://' + tmpHtml,
  ], { stdio: ['ignore', 'ignore', 'pipe'] });
  fs.unlinkSync(tmpHtml);
  cropPngHeight(outPng, H);
}

// Crop a PNG to `height` rows without external tools: decode IDAT with zlib, drop rows, re-encode.
import zlib from 'node:zlib';
function cropPngHeight(file, height) {
  const buf = fs.readFileSync(file);
  let pos = 8; const chunks = []; let ihdr;
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos); const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    chunks.push({ type, data }); if (type === 'IHDR') ihdr = data; pos += 12 + len;
  }
  const w = ihdr.readUInt32BE(0), h = ihdr.readUInt32BE(4);
  if (h <= height) return;
  const depth = ihdr[8], ctype = ihdr[9];
  const chans = { 0: 1, 2: 3, 4: 2, 6: 4 }[ctype];
  const bpp = Math.ceil(depth * chans / 8);
  const stride = 1 + Math.ceil(w * depth * chans / 8);
  const raw = zlib.inflateSync(Buffer.concat(chunks.filter(c => c.type === 'IDAT').map(c => c.data)));
  // Unfilter fully so we can cut rows safely, then re-filter with filter type 0.
  const out = Buffer.alloc(stride * height);
  let prev = Buffer.alloc(stride - 1);
  for (let y = 0; y < height; y++) {
    const f = raw[y * stride]; const row = Buffer.from(raw.subarray(y * stride + 1, (y + 1) * stride));
    for (let i = 0; i < row.length; i++) {
      const a = i >= bpp ? row[i - bpp] : 0, b = prev[i], c = i >= bpp ? prev[i - bpp] : 0;
      let v = row[i];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c); }
      row[i] = v & 255;
    }
    out[y * stride] = 0; row.copy(out, y * stride + 1); prev = row;
  }
  const crc = (b) => { let c = ~0; for (const x of b) { c ^= x; for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xEDB88320 & -(c & 1)); } return (~c) >>> 0; };
  const chunk = (type, data) => { const l = Buffer.alloc(4); l.writeUInt32BE(data.length); const t = Buffer.from(type, 'ascii'); const cc = Buffer.alloc(4); cc.writeUInt32BE(crc(Buffer.concat([t, data]))); return Buffer.concat([l, t, data, cc]); };
  const ihdr2 = Buffer.from(ihdr); ihdr2.writeUInt32BE(height, 4);
  fs.writeFileSync(file, Buffer.concat([
    buf.subarray(0, 8), chunk('IHDR', ihdr2), chunk('IDAT', zlib.deflateSync(out, { level: 9 })), chunk('IEND', Buffer.alloc(0)),
  ]));
}

function main() {
  const argv = process.argv.slice(2);
  const name = argv.find(a => !a.startsWith('--'));
  const arg = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
  const set = CAROUSELS[name];
  if (!set) {
    console.error('usage: node make-carousel.mjs <' + Object.keys(CAROUSELS).join('|') + '> [--out <dir>] [--fonts <css>]');
    process.exit(1);
  }
  const outDir = path.resolve(arg('--out') || path.join(HERE, 'carousel'));
  const fontsCss = arg('--fonts');
  fs.mkdirSync(outDir, { recursive: true });
  const total = set.slides.length;
  set.slides.forEach((s, i) => {
    const bgUri = dataUri(path.join(BG_DIR, s.bg));
    let html;
    if (s.kind === 'hook') html = hookHtml(s);
    else if (s.kind === 'cta') html = ctaHtml(s);
    else html = textHtml(s);
    const page = shell({ bgUri, bgPos: s.bgPos, bgOpacity: s.bgOpacity, inner: { kicker: esc(s.kicker), html }, pageNo: i + 1, total, fontsCss, om: s.kind !== 'cta' });
    const out = path.join(outDir, `${name}-${i + 1}.png`);
    renderPng(page, out);
    console.log('✓', path.relative(process.cwd(), out));
  });
  console.log(`✅ ${total} slides. Slide 1 is the hook; post in order. Caption: posts/${name}.md`);
}

main();
