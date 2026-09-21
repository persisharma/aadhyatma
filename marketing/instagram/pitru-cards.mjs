// pitru-cards.mjs — render the Pitru Paksha carousel (5 × 1080×1350 PNG, 4:5 IG post)
// from the app's own shipped content + theme.
//
// Content: every card is a condensation of a VERIFIED row in mobile/src/data/pitru/lessons.ts
// (PRD-44 / RULEBOOK §28). Each card names its lesson id in `lessonId`; nothing here asserts
// anything the lesson does not, and the stance guard applies — explain, never prescribe.
// Theme: tokens copied from mobile/src/theme/colors.ts (lightColors).
// Background: the app's own faded sketch plates (mobile/assets/backgrounds/*.webp) under the
// parchment overlay stack — design.md §6 + §39 (share card).
//
// Usage: node marketing/instagram/pitru-cards.mjs [outDir]
// Needs headless Chromium (CHROME_BIN, or the usual Linux/macOS locations) and the three
// brand faces; missing faces are fetched into ~/.fonts on first run.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '..', '..');
const PLATES = path.join(REPO_ROOT, 'mobile', 'assets', 'backgrounds');
const OUT_DIR = process.argv[2] ? path.resolve(process.argv[2]) : path.join(HERE, 'pitru');

const W = 1080, H = 1350; // 4:5 — the tallest aspect a feed post shows whole (design.md §39.3)
const SMART_LINK = 'persisharma.github.io/get-vedansh';
const HANDLE = '@vedansh.app';

// ── theme tokens (mobile/src/theme/colors.ts · lightColors) ───────────────────
const C = {
  parchment: '#F3E7C9',
  parchmentHighlight: '#F6ECD0',
  parchmentDeep: '#E9D9B1',
  ink: '#1A0E03',
  inkSoft: '#5A3A1E',
  inkMuted: '#6E5230',
  saffron: '#B8621B',
  saffronDeep: '#8A3E0B',
  gold: '#A67C34',
  divider: 'rgba(138, 62, 11, 0.18)',
  overlayTop: 'rgba(243, 231, 201, 0.85)',
  overlayUpper: 'rgba(243, 231, 201, 0.55)',
  overlayLower: 'rgba(243, 231, 201, 0.75)',
  overlayBottom: 'rgba(233, 217, 177, 0.95)',
};

// ── cards ────────────────────────────────────────────────────────────────────
// `**…**` marks a saffron-deep emphasis run (the app's own accent, never a new colour).
const CARDS = [
  {
    slug: '1-kya-hai',
    lessonId: 'kya-hai',
    plate: 'deity-navagraha-icons.webp',
    // the navagraha plate carries the fortnight's calendar sense; pushed slightly harder than the rest
    plateOpacity: 0.9, platePos: '50% 30%', plateFilter: 'sepia(.45) saturate(.8) contrast(1.1)',
    kicker: 'पितृ पक्ष परिचय',
    titleHi: 'पितृ पक्ष क्या है',
    subHi: 'सोलह दिनों का पखवाड़ा',
    body: [
      'भाद्रपद पूर्णिमा से आश्विन अमावस्या तक का पखवाड़ा **पितृ पक्ष** कहलाता है — इसे **महालय पक्ष** भी कहते हैं।',
      'जिस तिथि को किसी का देहान्त हुआ, इस पक्ष की **उसी तिथि** पर उनका श्राद्ध किया जाता है। यह पक्ष **तिथियों का कैलेण्डर** है, तारीख़ों का नहीं।',
      'जिनकी तिथि परिवार को ज्ञात नहीं, उनके लिए पक्ष का अन्तिम दिन — **सर्वपितृ अमावस्या** — रखा गया है।',
    ],
  },
  {
    slug: '2-shraddha-tarpan',
    lessonId: 'shraddha-aur-tarpan',
    plate: 'category-aarti-diya.webp',
    kicker: 'दो शब्द, दो कर्म',
    titleHi: 'श्राद्ध और तर्पण',
    subHi: 'एक ही बात नहीं हैं',
    body: [
      '**तर्पण** जल का अर्पण है — प्रायः तिल मिले जल का — जो पितरों की तृप्ति के भाव से किया जाता है।',
      'यह श्राद्ध का एक **अंग** है, या विशेष परिस्थितियों में उसका अनुकल्प — पर स्वयं **पूर्ण श्राद्ध नहीं**।',
      'पूर्ण पार्वण श्राद्ध में अग्नौकरण, पिण्डदान और ब्राह्मण-भोजन अभिन्न अंग माने गए हैं; इनका विधान परिवार की शाखा के अनुसार भिन्न होता है।',
    ],
  },
  {
    slug: '3-jal-kyon',
    lessonId: 'jal-kyon',
    plate: 'deity-ganga.webp',
    kicker: 'तर्पण का सबसे पुराना रूप',
    titleHi: 'जल ही क्यों',
    subHi: 'रामायण जो बार-बार दिखाती है',
    body: [
      'रामायण में पितृ-कर्म एक ही रूप में मिलता है: **अञ्जलि भर जल**, **दक्षिण दिशा** की ओर मुख, और यह भाव कि यह जल उन तक पहुँचे।',
      'श्रीराम ने पिता दशरथ के लिए मन्दाकिनी में यही किया, और जटायु के लिए गोदावरी में।',
      'बालकाण्ड में गरुड़ अंशुमान् से कहते हैं — सगर के पुत्रों के लिए लौकिक जल पर्याप्त नहीं; उनके लिए **गंगा** चाहिए। तीन पीढ़ियाँ इसी प्रश्न में बीतीं।',
    ],
  },
  {
    slug: '4-kiske-liye',
    lessonId: 'kiske-liye',
    plate: 'deity-rama-darbar.webp',
    kicker: 'जटायु का प्रसंग',
    titleHi: 'किसके लिए',
    subHi: 'स्मरण रक्त का बन्धन नहीं माँगता',
    body: [
      'अरण्यकाण्ड में श्रीराम **जटायु** का दाह-संस्कार स्वयं करते हैं। जटायु न उनके कुल के थे, न मनुष्य — वे पिता के मित्र एक पक्षी थे।',
      'राम ने लकड़ी इकट्ठी की, चिता सजाई, दर्भ बिछाकर वन के कन्द से पिण्ड बनाया, और गोदावरी जाकर **जलाञ्जलि** दी।',
      'उन्होंने जो वचन कहा, वह किसी **वंश** की बात नहीं करता — वहाँ स्मरण का द्वार सूची से नहीं, **भाव** से खुलता है।',
    ],
  },
  {
    slug: '5-samay',
    lessonId: 'samay',
    plate: 'deity-surya.webp',
    kicker: 'दिन का कौन-सा समय',
    titleHi: 'श्राद्ध का काल',
    subHi: 'यह सूर्योदय का कर्म नहीं है',
    body: [
      'श्राद्ध का समय दिन का **उत्तरार्ध** माना गया है — **कुतप काल** (मध्याह्न के आसपास), रौहिण, और उसके बाद का **अपराह्न**।',
      'इसी कारण किसी तिथि का श्राद्ध उस नागरिक दिन पर पड़ता है जिसके **अपराह्न** में वह तिथि व्याप्त हो — कभी वह सूर्योदय पर छपी तिथि से एक दिन आगे-पीछे दिखता है।',
      'ये खिड़कियाँ स्थान और दिनांक के अनुसार बदलती हैं; निश्चित समय के लिए अपने स्थान का पंचांग या पुरोहित देखें।',
    ],
  },
];

// ── fonts ────────────────────────────────────────────────────────────────────
const FONT_CSS =
  'https://fonts.googleapis.com/css2?family=Noto+Serif+Devanagari:wght@400;500;600;700' +
  '&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Inter:wght@500;600&display=swap';

function ensureFonts() {
  const have = (name) => {
    try {
      return execFileSync('fc-list', [':', 'family'], { encoding: 'utf8' }).includes(name);
    } catch {
      return true; // no fontconfig (macOS) — assume the designer has the faces
    }
  };
  if (have('Noto Serif Devanagari') && have('Cormorant Garamond') && have('Inter')) return;
  const dir = path.join(os.homedir(), '.fonts');
  fs.mkdirSync(dir, { recursive: true });
  console.log('  fetching brand faces into ~/.fonts …');
  const css = execFileSync('curl', ['-sS', '-A', 'Mozilla/5.0', FONT_CSS], { encoding: 'utf8' });
  const urls = [...new Set(css.match(/https:\/\/[^)]+\.(?:ttf|woff2)/g) || [])];
  urls.forEach((u, i) => execFileSync('curl', ['-sS', u, '-o', path.join(dir, `vedansh-gf-${i}.ttf`)]));
  execFileSync('fc-cache', ['-f'], { stdio: 'ignore' });
}

// ── html ─────────────────────────────────────────────────────────────────────
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const emph = (s) =>
  esc(s).replace(/\*\*(.+?)\*\*/g, `<span style="color:${C.saffronDeep};font-weight:600">$1</span>`);

function plateDataUri(file) {
  const p = path.join(PLATES, file);
  if (!fs.existsSync(p)) throw new Error(`missing background plate: ${p}`);
  return `data:image/webp;base64,${fs.readFileSync(p).toString('base64')}`;
}

function cardHtml(card, index, total) {
  // Body type ladder: the longest card sets the size so the five read as one set (design.md §39
  // "size it in JS" — a fixed leading must never ride platform auto-fit).
  const chars = card.body.join(' ').length;
  const bodySize = chars > 430 ? 34 : chars > 360 ? 36 : 38;
  const paras = card.body
    .map((p) => `<p style="margin:0 0 ${Math.round(bodySize * 0.72)}px">${emph(p)}</p>`)
    .join('');

  return `<!doctype html><html lang="hi"><head><meta charset="utf-8"><style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${W}px;height:${H}px;overflow:hidden}
  body{background:${C.parchment};-webkit-font-smoothing:antialiased;position:relative;
       font-family:'Noto Serif Devanagari',serif;color:${C.ink}}
  /* design.md §6 — parchment base · faded sketch · parchment overlay · content */
  .plate{position:absolute;inset:0;background-image:url('${plateDataUri(card.plate)}');
         background-size:cover;background-position:${card.platePos || '50% 22%'};
         opacity:${card.plateOpacity ?? 0.78};filter:${card.plateFilter || 'sepia(.45) saturate(.8) contrast(1.05)'}}
  /* parchment overlay (design.md §2/§6): heaviest where the type sits, lightest where the sketch
     should read — the bottom third stays clean for the footer. */
  .wash{position:absolute;inset:0;background:linear-gradient(180deg,
        ${C.overlayTop} 0%, ${C.overlayLower} 34%, ${C.overlayUpper} 70%, ${C.overlayBottom} 100%)}
  .frame{position:absolute;inset:26px;border:1.5px solid ${C.divider};border-radius:26px;pointer-events:none}
  .stage{position:absolute;inset:0;display:flex;flex-direction:column;padding:78px 86px 104px}
  .kicker{font-family:'Noto Serif Devanagari',serif;font-weight:600;font-size:24px;letter-spacing:5px;
          color:${C.saffronDeep};text-transform:uppercase}
  .count{position:absolute;top:70px;right:82px;font-family:'Inter',sans-serif;font-weight:600;font-size:24px;
         color:${C.saffronDeep};opacity:.62;letter-spacing:1px}
  .title{font-weight:700;font-size:78px;line-height:1.24;color:${C.ink};margin-top:26px}
  .sub{font-weight:600;font-size:38px;line-height:1.4;color:${C.gold};margin-top:12px}
  .rule{width:150px;height:2px;background:${C.gold};opacity:.55;margin:34px 0 38px;border-radius:2px}
  .body{font-weight:400;font-size:${bodySize}px;line-height:1.6;color:${C.inkSoft}}
  .spacer{flex:1;min-height:24px}
  .om{text-align:center;font-size:32px;color:${C.gold};opacity:.6;letter-spacing:8px;margin-bottom:30px}
  .foot{border-top:1px solid ${C.divider};padding-top:26px;display:flex;align-items:flex-end;justify-content:space-between}
  .mark{font-weight:700;font-size:38px;color:${C.ink};letter-spacing:1px}
  .tagline{font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-weight:500;font-size:26px;
           color:${C.saffronDeep};margin-top:4px}
  .meta{font-family:'Inter',sans-serif;font-weight:500;font-size:20px;letter-spacing:1.6px;
        color:${C.inkMuted};text-align:right;line-height:1.7}
</style></head><body>
  <div class="plate"></div><div class="wash"></div>
  <div class="frame"></div>
  <div class="count">${index}/${total}</div>
  <div class="stage">
    <div class="kicker">${esc(card.kicker)}</div>
    <div class="title">${esc(card.titleHi)}</div>
    <div class="sub">${esc(card.subHi)}</div>
    <div class="rule"></div>
    <div class="body">${paras}</div>
    <div class="spacer"></div>
    <div class="om">॥ ॐ ॥</div>
    <div class="foot">
      <div>
        <div class="mark">वेदांश़</div>
        <div class="tagline">Vedansh — Sacred Texts, Daily Reading</div>
      </div>
      <div class="meta">${esc(HANDLE)}<br>${esc(SMART_LINK)}</div>
    </div>
  </div>
</body></html>`;
}

// ── render ───────────────────────────────────────────────────────────────────
function chromeBin() {
  const candidates = [
    process.env.CHROME_BIN,
    '/opt/pw-browsers/chromium/chrome-linux/chrome',
    '/opt/pw-browsers/chromium',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].filter(Boolean);
  for (const c of candidates) {
    try {
      if (fs.statSync(c).isFile()) return c;
      if (fs.statSync(c).isDirectory()) {
        const nested = path.join(c, 'chrome-linux', 'chrome');
        if (fs.existsSync(nested)) return nested;
      }
    } catch {}
  }
  throw new Error('No Chromium found — set CHROME_BIN.');
}

function main() {
  ensureFonts();
  const chrome = chromeBin();
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pitru-cards-'));

  CARDS.forEach((card, i) => {
    const html = cardHtml(card, i + 1, CARDS.length);
    const htmlPath = path.join(tmp, `${card.slug}.html`);
    const outPng = path.join(OUT_DIR, `pitru-${card.slug}.png`);
    fs.writeFileSync(htmlPath, html);
    execFileSync(chrome, [
      '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
      '--force-device-scale-factor=1', `--window-size=${W},${H}`,
      '--virtual-time-budget=8000', `--screenshot=${outPng}`, 'file://' + htmlPath,
    ], { stdio: 'ignore' });
    console.log(`  ✓ ${path.relative(REPO_ROOT, outPng)}  (lesson: ${card.lessonId})`);
  });

  console.log(`\n${CARDS.length} cards → ${path.relative(REPO_ROOT, OUT_DIR)}`);
}

main();
