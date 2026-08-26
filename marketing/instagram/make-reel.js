#!/usr/bin/env node
/*
 * make-reel.js — build an Instagram-tuned 9:16 reel (or a 4:5 feed carousel) for Vedansh.
 *
 *   node make-reel.js tithi                  # → vedansh-ig-tithi.mp4  (no screenshots needed)
 *   node make-reel.js gita                   # → vedansh-ig-gita.mp4
 *   node make-reel.js app                    # → vedansh-ig-app.mp4    (needs shots, see --shots)
 *   node make-reel.js gita --carousel        # → carousel/gita-1.png … (1080×1350 feed slides)
 *   node make-reel.js tithi --safe           # burn the IG safe-zone overlay in (preview only)
 *   node make-reel.js gita --audio bg.m4a    # mux an audio bed (see README — usually add audio in-app)
 *   node make-reel.js app --shots ../linkedin/shots/vrat
 *   node make-reel.js gita --check          # lint the manifest, render nothing
 *
 * Every render lints the manifest first against reel-checklist.md (hook, loop seam,
 * copy budgets, pacing, Devanagari-first). Warnings advise; errors block unless --force.
 *
 * Sibling of ../linkedin/make-reel.js. Same brand tokens, same zero-dep
 * HTML → headless-Chrome → ffmpeg pipeline. What differs is everything Instagram
 * cares about; see README.md §3 for the reasoning behind each of these:
 *
 *   - SAFE ZONES. IG Reels paints its own chrome over the frame: a header strip on
 *     top, the caption + audio ticker + progress bar across the bottom, and the
 *     like/comment/send rail down the right. Nothing that must be read goes there.
 *   - HOOK FIRST. Frame 0 is a full-stop headline and there is NO fade-in, so it is
 *     legible at t=0. Retention is decided in the first second.
 *   - CUTS, NOT CROSSFADES. Text reels hard-cut (~1.9s/slide). Crossfades read as
 *     "corporate video" and burn 0.6s of attention per slide.
 *   - LOOPS. No fade-to-black at the end; the closing slide echoes the hook so the
 *     replay is seamless. Replays are watch-time.
 *   - BURNED-IN TEXT. Reels autoplay muted. If the frame doesn't carry the message
 *     on its own, there is no message.
 *   - DEVANAGARI-FIRST. Hindi leads, English supports. See README §2.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const CTX = __dirname;
// Overridable for portability; defaults are the common macOS locations.
const CHROME = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const FFMPEG = process.env.FFMPEG_BIN || 'ffmpeg';

// ── Brand (mirrors ../linkedin/make-reel.js and mobile/src/theme) ──
const C = {
  bgTop: '#1a0e03', bgMid: '#3d1a00', bgBot: '#8A3E0B',
  saffron: '#E08A3C', gold: '#E8C887', cream: '#F3E7C9', creamSoft: '#F8EFD6',
  inkOnCream: '#1A0E03',
};

const SMART_LINK = 'persisharma.github.io/get-vedansh';
const HANDLE = '@vedansh.app';

/*
 * ── Output modes ────────────────────────────────────────────────────────────
 * Width is 1080 in both modes, so type sizes are shared; only the vertical live
 * box changes. `safe` is the region IG's own UI covers — measured generously on a
 * 19.5:9 phone, because it is worse on tall displays, not better.
 */
const MODES = {
  reel: {
    W: 1080, H: 1920,
    safe: { top: 250, right: 250, bottom: 540, left: 90 },
    // The phone mock is allowed to bleed past the bottom safe edge: what IG covers
    // there is the app's tab bar, which carries no message.
    bleed: true,
  },
  carousel: {
    W: 1080, H: 1350,
    safe: { top: 110, right: 90, bottom: 130, left: 90 },
    bleed: false,
  },
};

/*
 * ── Reel manifests ──────────────────────────────────────────────────────────
 * Slide kinds:
 *   hook   — frame 0. One idea, huge, instantly legible. Never more than ~7 words.
 *   text   — a single beat: one line of payload plus an optional support line.
 *   verse  — Devanagari shloka + transliteration + meaning. The save/send magnet.
 *   shot   — an app screenshot, safe-zoned. Use sparingly; see README §4 on the mix.
 *   cta    — closing card. Echoes the hook so the loop is seamless.
 *
 * `dur` is seconds; text beats default to 1.9 and screenshots to 2.6 (a screenshot
 * needs longer because the eye has to find the content inside the frame).
 */
const REELS = {
  // 1) The timeliness reel — the format with the highest reach ceiling, and the one
  //    only we can make, because the Panchang engine is ours. Re-shoot per occasion:
  //    edit the strings, re-run, post the day BEFORE the vrat.
  tithi: {
    out: 'vedansh-ig-tithi.mp4',
    transition: 'cut',
    slides: [
      { hook: true, hi: 'एकादशी कब है?', en: 'When is Ekadashi this month?', dur: 2.0 },
      { text: true, kicker: 'तिथि', hi: 'शुक्ल पक्ष एकादशी', en: 'Check the date for your own city — it shifts by sunrise' },
      { text: true, kicker: 'व्रत विधि', hi: 'व्रत कैसे रखें', en: 'Sankalp at sunrise · fast through the day · paran the next morning' },
      { text: true, kicker: 'पारण', hi: 'पारण का समय चूकें नहीं', en: 'Paran has a window. Miss it and the vrat is considered incomplete.' },
      { text: true, kicker: 'कथा', hi: 'व्रत कथा साथ में', en: 'The katha to read during pooja — Hindi and English' },
      { cta: true, hi: 'एकादशी कब है?', en: 'Vedansh tells you — for your city, offline', handle: HANDLE, dur: 2.4 },
    ],
  },

  // 2) The verse reel — designed to be SENT, not just watched. Full value in-frame,
  //    nothing gated behind a bio link. Real text from bhagavad-gita-complete-hi-en.md.
  gita: {
    out: 'vedansh-ig-gita.mp4',
    transition: 'cut',
    slides: [
      { hook: true, hi: 'फल की चिंता छोड़ो', en: 'The most quoted line in the Gita — and the most misread', dur: 2.2 },
      {
        verse: true, ref: 'भगवद्गीता · २.४७',
        sanskrit: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥',
        translit: 'karmaṇy-evādhikāras te mā phaleṣhu kadāchana',
        dur: 3.4,
      },
      { text: true, kicker: 'अर्थ', hi: 'कर्म तेरा अधिकार है, फल नहीं', en: 'Your right is to the work — never to its results' },
      { text: true, kicker: 'लेकिन', hi: 'इसका अर्थ आलस्य नहीं है', en: '“Nor let your attachment be to inaction.” Detachment is not withdrawal.' },
      { cta: true, hi: 'फल की चिंता छोड़ो', en: 'All 700 shlokas · Hindi & English · offline', handle: HANDLE, dur: 2.4 },
    ],
  },

  // 3) The product reel — the 1-in-5. Reuses the LinkedIn capture flow's screenshots
  //    (`cd ../linkedin && ./capture.sh vrat`), re-composed inside IG's safe zones.
  app: {
    out: 'vedansh-ig-app.mp4',
    transition: 'fade',
    shotsDefault: path.join('..', 'linkedin', 'shots', 'vrat'),
    slides: [
      { hook: true, hi: 'व्रत फिर छूट गया?', en: 'Missed the vrat again because nobody reminded you?', dur: 2.2 },
      { shot: '01-panchang-calendar', kicker: 'पंचांग', hi: 'आपके शहर का पंचांग', en: 'Tithi · nakshatra · sunrise · Brahma Muhurta' },
      { shot: '05-observance-detail', kicker: 'व्रत', hi: 'जो व्रत आप रखते हैं', en: 'Follow them — story and reminders together' },
      { shot: '07-reminder-sheet', kicker: 'याद', hi: 'एक रात पहले याद दिला देगा', en: 'And again on the morning of — fully offline' },
      { cta: true, hi: 'व्रत फिर छूट गया?', en: 'Free · iPhone & Android · works offline', handle: HANDLE, dur: 2.6 },
    ],
  },
};

const FONTS = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Noto+Serif+Devanagari:wght@400;500;600;700&family=Inter:wght@500;600;700&display=swap" rel="stylesheet">`;

function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function nl(s) { return esc(s).replace(/\n/g, '<br>'); }

function dataUri(p) {
  return 'data:image/png;base64,' + fs.readFileSync(p).toString('base64');
}

// Width/height straight out of the PNG's IHDR chunk (8-byte signature, 4-byte length,
// 4-byte 'IHDR', then w and h as big-endian uint32). Used so the phone mock always
// matches the capture device's aspect ratio — otherwise `object-fit:cover` silently
// crops the sides off the screenshot.
function pngSize(p) {
  const b = Buffer.alloc(24);
  const fd = fs.openSync(p, 'r');
  try { fs.readSync(fd, b, 0, 24, 0); } finally { fs.closeSync(fd); }
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}

/*
 * The page shell. `.live` is the only place readable content may sit — it is the
 * frame minus IG's chrome. Every slide function lays out inside it with flexbox so
 * the same manifest renders correctly at both 1920 and 1350 tall.
 */
function pageShell(M, inner, { safeOverlay = false, bleedLayer = '' } = {}) {
  const s = M.safe;
  const overlay = safeOverlay ? `
    <div style="position:absolute; inset:0; pointer-events:none; z-index:99;">
      <div style="position:absolute; top:0; left:0; right:0; height:${s.top}px; background:rgba(255,0,0,0.22);"></div>
      <div style="position:absolute; bottom:0; left:0; right:0; height:${s.bottom}px; background:rgba(255,0,0,0.22);"></div>
      <div style="position:absolute; top:${s.top}px; bottom:${s.bottom}px; right:0; width:${s.right}px; background:rgba(255,0,0,0.22);"></div>
      <div style="position:absolute; top:${s.top}px; bottom:${s.bottom}px; left:0; width:${s.left}px; background:rgba(255,0,0,0.22);"></div>
      <div style="position:absolute; top:${s.top}px; left:${s.left}px; right:${s.right}px; bottom:${s.bottom}px; border:3px dashed rgba(255,255,255,0.8);"></div>
    </div>` : '';
  return `<!doctype html><html><head><meta charset="utf-8">${FONTS}
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html,body { width:${M.W}px; height:${M.H}px; overflow:hidden; }
  body {
    font-family:'Cormorant Garamond', Georgia, serif;
    background:
      radial-gradient(120% 80% at 50% -10%, rgba(224,138,60,0.30), rgba(0,0,0,0) 60%),
      linear-gradient(168deg, ${C.bgTop} 0%, ${C.bgMid} 46%, ${C.bgBot} 100%);
    color:${C.cream};
    -webkit-font-smoothing:antialiased;
    position:relative;
  }
  .dev { font-family:'Noto Serif Devanagari', serif; }
  .ui  { font-family:'Inter', sans-serif; }
  .live {
    position:absolute;
    top:${s.top}px; left:${s.left}px; right:${s.right}px; bottom:${s.bottom}px;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    text-align:center;
  }
  .kicker { font-family:'Inter',sans-serif; font-weight:700; font-size:26px; letter-spacing:5px;
            color:${C.saffron}; text-transform:uppercase; }
  /* Devanagari must not be letter-spaced — it pulls conjuncts and matras apart. */
  .kicker.dev { font-family:'Noto Serif Devanagari', serif; font-size:34px; letter-spacing:0; text-transform:none; }
  .rule { width:110px; height:3px; background:${C.gold}; opacity:0.55; border-radius:2px; }
  .om { font-family:'Noto Serif Devanagari', serif; color:${C.gold}; letter-spacing:4px; opacity:0.9; }
</style></head><body>${bleedLayer}<div class="live">${inner}</div>${overlay}</body></html>`;
}

// Frame 0. No ornament, no warm-up — the headline is the whole frame.
function hookSlide(M, s, opts) {
  const inner = `
    <div class="om" style="font-size:46px; margin-bottom:44px;">ॐ</div>
    <div class="dev" style="font-weight:700; font-size:112px; line-height:1.12; color:${C.creamSoft};">${nl(s.hi)}</div>
    <div class="rule" style="margin:52px 0;"></div>
    <div style="font-weight:500; font-size:46px; line-height:1.28; color:rgba(243,231,201,0.82);">${nl(s.en)}</div>`;
  return pageShell(M, inner, opts);
}

// One beat. The Hindi line is the payload; the English line is the subtitle.
function textSlide(M, s, opts) {
  const inner = `
    ${s.kicker ? `<div class="kicker dev" style="margin-bottom:30px;">${esc(s.kicker)}</div>` : ''}
    <div class="dev" style="font-weight:600; font-size:88px; line-height:1.18; color:${C.creamSoft};">${nl(s.hi)}</div>
    ${s.en ? `<div style="font-weight:500; font-size:42px; line-height:1.32; color:rgba(243,231,201,0.78); margin-top:36px; padding:0 20px;">${nl(s.en)}</div>` : ''}`;
  return pageShell(M, inner, opts);
}

// The shloka card. Sanskrit dominates; transliteration is the accessibility layer
// for viewers who cannot read Devanagari but know the verse by sound.
function verseSlide(M, s, opts) {
  const inner = `
    <div class="kicker dev" style="margin-bottom:34px;">${esc(s.ref || '')}</div>
    <div class="dev" style="font-weight:600; font-size:62px; line-height:1.52; color:${C.creamSoft};">${nl(s.sanskrit)}</div>
    ${s.translit ? `<div style="font-style:italic; font-weight:500; font-size:33px; line-height:1.35; color:rgba(232,200,135,0.82); margin-top:38px;">${nl(s.translit)}</div>` : ''}`;
  return pageShell(M, inner, opts);
}

/*
 * Screenshot slide. The caption sits at the top of the live box and the phone mock
 * hangs below it — in reel mode it deliberately runs off the bottom edge, because
 * the frame's bottom 540px is IG's caption tray anyway.
 */
function shotSlide(M, s, imgUri, shotPx, opts) {
  const capH = 250;              // caption block reserved at the top of the live box
  const mockTop = M.safe.top + capH;
  const mockW = 540;             // 270 → 810 px: clear of the right-hand action rail
  // Height follows the capture device's own aspect so the screenshot is never cropped
  // sideways. In reel mode the mock is allowed to overrun the bottom safe edge; in
  // carousel mode it is clamped to the live box instead.
  const inner11 = mockW - 22;    // minus the 11px bezel padding on each side
  let mockH = Math.round(inner11 * (shotPx.h / shotPx.w)) + 22;
  if (!M.bleed) mockH = Math.min(mockH, M.H - M.safe.bottom - mockTop);
  const bleedLayer = `
    <div style="position:absolute; top:${mockTop}px; height:${mockH}px; left:50%; transform:translateX(-50%);
                width:${mockW}px; border-radius:52px; padding:11px;
                background:linear-gradient(160deg,#2a1707,#0c0702);
                box-shadow:0 40px 90px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(232,200,135,0.18);">
      <img src="${imgUri}" style="width:100%; height:100%; object-fit:cover; object-position:top center; border-radius:42px; display:block;">
    </div>`;
  const inner = `
    <div style="position:absolute; top:0; left:0; right:0;">
      ${s.kicker ? `<div class="kicker dev" style="margin-bottom:20px;">${esc(s.kicker)}</div>` : ''}
      <div class="dev" style="font-weight:700; font-size:64px; line-height:1.18; color:${C.creamSoft};">${nl(s.hi)}</div>
      ${s.en ? `<div style="font-weight:500; font-size:31px; line-height:1.3; color:rgba(243,231,201,0.72); margin-top:16px;">${nl(s.en)}</div>` : ''}
    </div>`;
  return pageShell(M, inner, { ...opts, bleedLayer });
}

// Closing card. Repeats the hook line verbatim so the loop point is invisible.
function ctaSlide(M, s, opts) {
  const inner = `
    <div class="dev" style="font-weight:700; font-size:88px; line-height:1.16; color:${C.creamSoft};">${nl(s.hi)}</div>
    <div style="font-weight:500; font-size:38px; line-height:1.3; color:rgba(243,231,201,0.80); margin-top:30px;">${nl(s.en)}</div>
    <div class="ui" style="margin-top:56px; padding:20px 44px; border:2px solid ${C.saffron}; border-radius:60px;
                           font-weight:700; font-size:36px; color:${C.saffron}; letter-spacing:1px;">${esc(s.handle || HANDLE)}</div>
    <div class="ui" style="font-weight:500; font-size:26px; color:rgba(243,231,201,0.55); margin-top:26px; letter-spacing:1px;">${esc(SMART_LINK)}</div>`;
  return pageShell(M, inner, opts);
}

/*
 * ── Exact-height capture ────────────────────────────────────────────────────
 * `--headless=new` treats --window-size as the WINDOW, not the viewport: the PNG
 * comes back at the requested height but only the top `height - N` rows are painted
 * (N was 87 on Chromium 134). Left alone that trailing band is transparent, and
 * transparent flattens to BLACK in yuv420p — a black bar across the bottom of the
 * reel, right where IG's caption tray sits.
 *
 * Rather than hardcode N, capture with generous slack and crop back to the exact
 * design height. The body is M.H tall, so rows 0…M.H-1 are always the design for
 * any N <= VIEWPORT_PAD.
 */
const VIEWPORT_PAD = 200;

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c;
  }
  return t;
})();
function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function paeth(a, b, c) {
  const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
  return (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
}

// Crop a PNG to its top `targetH` rows, in place. 8-bit only (all Chrome emits).
function cropPngHeight(file, targetH) {
  const src = fs.readFileSync(file);
  const sig = src.subarray(0, 8);
  let pos = 8, ihdr = null, idat = [];
  while (pos < src.length) {
    const len = src.readUInt32BE(pos);
    const type = src.toString('ascii', pos + 4, pos + 8);
    const data = src.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') ihdr = data;
    else if (type === 'IDAT') idat.push(data);
    pos += 12 + len;
  }
  if (!ihdr) throw new Error('not a PNG: ' + file);
  const w = ihdr.readUInt32BE(0), h = ihdr.readUInt32BE(4);
  const depth = ihdr[8], colorType = ihdr[9], interlace = ihdr[12];
  if (h === targetH) return;
  if (depth !== 8 || interlace !== 0) throw new Error(`unsupported PNG (depth ${depth}, interlace ${interlace})`);
  // Only truecolour/greyscale: the re-emit below keeps IHDR/IDAT/IEND and drops
  // ancillary chunks, which would strip PLTE out from under a palette image.
  const bpp = { 0: 1, 2: 3, 4: 2, 6: 4 }[colorType];
  if (!bpp) throw new Error('unsupported PNG color type ' + colorType);

  const raw = require('zlib').inflateSync(Buffer.concat(idat));
  const stride = w * bpp;
  const out = Buffer.alloc(stride * targetH);
  let p = 0;
  for (let y = 0; y < Math.min(h, targetH); y++) {
    const ft = raw[p++];
    const row = out.subarray(y * stride, (y + 1) * stride);
    const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : null;
    for (let i = 0; i < stride; i++) {
      const x = raw[p + i];
      const a = i >= bpp ? row[i - bpp] : 0;
      const b = prev ? prev[i] : 0;
      const c = (prev && i >= bpp) ? prev[i - bpp] : 0;
      let v;
      switch (ft) {
        case 0: v = x; break;
        case 1: v = x + a; break;
        case 2: v = x + b; break;
        case 3: v = x + ((a + b) >> 1); break;
        case 4: v = x + paeth(a, b, c); break;
        default: throw new Error('bad PNG filter ' + ft);
      }
      row[i] = v & 0xFF;
    }
    p += stride;
  }

  // Re-emit with filter type 0 on every row — slightly larger, trivially correct.
  const filtered = Buffer.alloc((stride + 1) * targetH);
  for (let y = 0; y < targetH; y++) {
    filtered[y * (stride + 1)] = 0;
    out.copy(filtered, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const newIhdr = Buffer.from(ihdr);
  newIhdr.writeUInt32BE(targetH, 4);
  fs.writeFileSync(file, Buffer.concat([
    sig,
    chunk('IHDR', newIhdr),
    chunk('IDAT', require('zlib').deflateSync(filtered, { level: 6 })),
    chunk('IEND', Buffer.alloc(0)),
  ]));
}

function renderFrame(M, html, outPng) {
  const tmpHtml = outPng.replace(/\.png$/, '.html');
  fs.writeFileSync(tmpHtml, html);
  execFileSync(CHROME, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--force-device-scale-factor=1', `--window-size=${M.W},${M.H + VIEWPORT_PAD}`,
    '--virtual-time-budget=8000', '--default-background-color=00000000',
    `--screenshot=${outPng}`, 'file://' + tmpHtml,
  ], { stdio: 'pipe', timeout: 90000 });
  if (!fs.existsSync(outPng)) return false;
  cropPngHeight(outPng, M.H);
  return true;
}

function slideHtml(M, s, shotsDir, opts) {
  if (s.hook) return { html: hookSlide(M, s, opts), dur: s.dur || 2.0 };
  if (s.cta) return { html: ctaSlide(M, s, opts), dur: s.dur || 2.4 };
  if (s.verse) return { html: verseSlide(M, s, opts), dur: s.dur || 3.2 };
  if (s.shot) {
    const p = path.join(shotsDir, s.shot + '.png');
    if (!fs.existsSync(p)) return null;
    return { html: shotSlide(M, s, dataUri(p), pngSize(p), opts), dur: s.dur || 2.6 };
  }
  return { html: textSlide(M, s, opts), dur: s.dur || 1.9 };
}

/*
 * -- Manifest lint -----------------------------------------------------------
 * Encodes the machine-checkable rules from reel-checklist.md so they are enforced
 * at render time rather than remembered. Runs automatically before every render.
 *
 * The character budgets are HEURISTICS - they approximate what fits the live box
 * at each slide's type size. They catch copy that is obviously too long; they
 * cannot prove a line fits. `--safe` remains the ground truth for layout.
 *
 * Warnings never block. Errors block unless --force, because each one produces a
 * reel broken in a way you would not notice until it was posted.
 */
const LIMITS = {
  hookHiChars: 30, hookWords: 6,     // 112px in a 740px box
  textHiChars: 42,                   // 88px
  ctaHiChars: 34,                    // 88px
  enChars: 95,                       // the English support line, any slide
  kickerChars: 16,
  verseLineChars: 62,                // 62px, per newline-separated line
  slideMin: 1.4, slideMax: 4.2,      // dwell time per slide
  reelMin: 7, reelMax: 22,           // total runtime
  slideCountMax: 8,
};
const DEVANAGARI = /[\u0900-\u097F]/;

function kindOf(s) {
  if (s.hook) return 'hook';
  if (s.cta) return 'cta';
  if (s.verse) return 'verse';
  if (s.shot) return 'shot';
  return 'text';
}

function lintReel(reel, cfg, shotsDir, M) {
  const errors = [], warnings = [];
  const E = (m) => errors.push(m), W = (m) => warnings.push(m);
  const slides = cfg.slides || [];
  const at = (i, k) => `slide ${i} (${k})`;

  if (!slides.length) { E('manifest has no slides'); return { errors, warnings }; }

  // Checklist section 2 - structure. The hook and the loop seam are the two
  // things that decide whether the reel gets watched twice.
  if (kindOf(slides[0]) !== 'hook') E('slide 0 must be a `hook` - checklist 2.1');
  const last = slides[slides.length - 1];
  if (kindOf(last) !== 'cta') {
    W('last slide is not a `cta` - nothing closes the loop (checklist 2.2)');
  } else if (kindOf(slides[0]) === 'hook' && last.hi !== slides[0].hi) {
    W('cta.hi does not repeat hook.hi verbatim - the loop seam will be visible (checklist 2.2)');
  }
  if (slides.length > LIMITS.slideCountMax) {
    W(`${slides.length} slides; over ${LIMITS.slideCountMax} the reel outruns its hook (checklist 2.3)`);
  }

  // Sections 3 (copy budgets) and 4 (Devanagari-first).
  let total = 0;
  slides.forEach((s, i) => {
    const k = kindOf(s);
    const dur = s.dur || (k === 'hook' ? 2.0 : k === 'cta' ? 2.4 : k === 'verse' ? 3.2 : k === 'shot' ? 2.6 : 1.9);
    total += dur;

    if (dur < LIMITS.slideMin) W(`${at(i, k)}: ${dur}s is below ${LIMITS.slideMin}s - not enough to read (checklist 5.1)`);
    if (dur > LIMITS.slideMax) W(`${at(i, k)}: ${dur}s is over ${LIMITS.slideMax}s - dead air (checklist 5.1)`);

    if (k === 'verse') {
      if (!s.sanskrit) { E(`${at(i, k)}: verse slide has no \`sanskrit\``); return; }
      String(s.sanskrit).split('\n').forEach((line, n) => {
        if (line.length > LIMITS.verseLineChars) {
          W(`${at(i, k)}: sanskrit line ${n + 1} is ${line.length} chars (budget ${LIMITS.verseLineChars}) - it will wrap raggedly (checklist 3.4)`);
        }
      });
      if (!DEVANAGARI.test(s.sanskrit)) W(`${at(i, k)}: \`sanskrit\` has no Devanagari - is it transliterated by mistake?`);
      if (s.ref && !DEVANAGARI.test(s.ref)) W(`${at(i, k)}: \`ref\` is not in Devanagari (checklist 4)`);
      return;
    }

    if (!s.hi && !s.en) { E(`${at(i, k)}: no \`hi\` and no \`en\` - the slide is blank`); return; }
    if (!s.hi) W(`${at(i, k)}: no \`hi\` - Devanagari leads on every slide (checklist 4)`);

    if (s.hi) {
      const budget = k === 'hook' ? LIMITS.hookHiChars : k === 'cta' ? LIMITS.ctaHiChars : LIMITS.textHiChars;
      if (s.hi.length > budget) {
        W(`${at(i, k)}: hi is ${s.hi.length} chars (budget ${budget}) - likely to overflow or shrink illegibly (checklist 3.1)`);
      }
      if (!DEVANAGARI.test(s.hi)) {
        W(`${at(i, k)}: \`hi\` contains no Devanagari - that field is the Hindi headline (checklist 4)`);
      }
      if (k === 'hook') {
        const words = s.hi.trim().split(/\s+/).length;
        if (words > LIMITS.hookWords) {
          W(`${at(i, k)}: hook is ${words} words (budget ${LIMITS.hookWords}) - a hook has to land in one glance (checklist 2.1)`);
        }
      }
    }
    if (s.en && s.en.length > LIMITS.enChars) W(`${at(i, k)}: en is ${s.en.length} chars (budget ${LIMITS.enChars}) - trim it (checklist 3.2)`);
    if (s.en && DEVANAGARI.test(s.en)) W(`${at(i, k)}: \`en\` contains Devanagari - hi/en look swapped (checklist 4)`);
    if (s.kicker && s.kicker.length > LIMITS.kickerChars) W(`${at(i, k)}: kicker is ${s.kicker.length} chars (budget ${LIMITS.kickerChars}) (checklist 3.3)`);
    if (k === 'shot' && !fs.existsSync(path.join(shotsDir, s.shot + '.png'))) {
      E(`${at(i, k)}: screenshot not found - ${path.join(shotsDir, s.shot + '.png')}`);
    }
  });

  // Section 5 - runtime. Only meaningful for reels; a carousel has no duration.
  if (M === MODES.reel) {
    if (total > LIMITS.reelMax) W(`total ${total.toFixed(1)}s is over ${LIMITS.reelMax}s - long reels need a reason (checklist 5.2)`);
    if (total < LIMITS.reelMin) W(`total ${total.toFixed(1)}s is under ${LIMITS.reelMin}s - too short to say anything (checklist 5.2)`);
  }
  return { errors, warnings };
}

function argValue(flag) {
  const i = process.argv.indexOf(flag);
  return i > -1 ? process.argv[i + 1] : null;
}

function main() {
  const reel = process.argv[2];
  const argv = process.argv;
  const carousel = argv.includes('--carousel');
  const slidesOnly = argv.includes('--slides-only');
  const safeOverlay = argv.includes('--safe');
  const checkOnly = argv.includes('--check');
  const force = argv.includes('--force');
  const audio = argValue('--audio');

  if (!REELS[reel]) {
    console.error('usage: node make-reel.js <' + Object.keys(REELS).join('|') + '> [--carousel] [--slides-only] [--safe] [--check] [--force] [--audio <file>] [--shots <dir>]');
    process.exit(1);
  }
  const cfg = REELS[reel];
  const M = carousel ? MODES.carousel : MODES.reel;
  const shotsDir = path.resolve(CTX, argValue('--shots') || cfg.shotsDefault || path.join('shots', reel));
  const outDir = path.join(CTX, carousel ? 'carousel' : 'frames');
  fs.mkdirSync(outDir, { recursive: true });

  // Checklist gate (reel-checklist.md). Runs before anything is rendered.
  const { errors, warnings } = lintReel(reel, cfg, shotsDir, M);
  warnings.forEach(w => console.warn('  ! ' + w));
  errors.forEach(e => console.error('  x ' + e));
  if (errors.length && !force) {
    console.error(`\n${errors.length} blocking issue(s). Fix them, or re-run with --force to render anyway.`);
    process.exit(3);
  }
  if (checkOnly) {
    console.log(`checked ${reel}: ${errors.length} error(s), ${warnings.length} warning(s)`);
    process.exit(errors.length ? 3 : 0);
  }
  if (warnings.length) console.log('');

  if (safeOverlay && !slidesOnly && !carousel) {
    console.warn('  ⚠ --safe burns the overlay into the video. Preview only — do not post this file.');
  }

  const frames = [];
  let idx = 0;
  for (const s of cfg.slides) {
    const built = slideHtml(M, s, shotsDir, { safeOverlay });
    if (!built) { console.warn('  ⚠ missing screenshot, skipping:', s.shot, `(looked in ${shotsDir})`); idx++; continue; }
    const name = carousel ? `${reel}-${idx + 1}.png` : `${reel}-${String(idx).padStart(2, '0')}.png`;
    const out = path.join(outDir, name);
    process.stdout.write(`  rendering ${name} … `);
    const ok = renderFrame(M, built.html, out);
    console.log(ok ? 'ok' : 'FAILED');
    if (ok) frames.push({ file: out, dur: built.dur });
    idx++;
  }
  if (!frames.length) { console.error('no frames rendered'); process.exit(2); }
  console.log(`rendered ${frames.length} frames → ${outDir}`);

  if (carousel) {
    console.log(`✅ carousel slides ready. Post slides 1…${frames.length} in order; slide 1 is the hook.`);
    return;
  }
  if (slidesOnly) return;

  // ── ffmpeg assembly ──────────────────────────────────────────────────────
  // No global fade-in (frame 0 must be legible at t=0) and no fade-out (a fade to
  // black breaks the loop, and replays are the cheapest watch-time on Reels).
  const args = [];
  frames.forEach(f => { args.push('-loop', '1', '-t', String(f.dur), '-i', f.file); });

  const fc = [];
  let total;
  if (cfg.transition === 'fade') {
    const d = 0.45;
    let prev = '[0:v]';
    let cum = frames[0].dur;
    for (let k = 1; k < frames.length; k++) {
      const label = (k === frames.length - 1) ? '[xf]' : `[v${k}]`;
      fc.push(`${prev}[${k}:v]xfade=transition=fade:duration=${d}:offset=${(cum - d).toFixed(3)}${label}`);
      prev = label;
      cum += frames[k].dur - d;
    }
    total = frames.reduce((a, f) => a + f.dur, 0) - (frames.length - 1) * d;
    fc.push(`${prev}format=yuv420p[final]`);
  } else {
    // Hard cuts. Snappier, and every frame gets its full dwell time.
    const ins = frames.map((_, k) => `[${k}:v]`).join('');
    fc.push(`${ins}concat=n=${frames.length}:v=1:a=0,format=yuv420p[final]`);
    total = frames.reduce((a, f) => a + f.dur, 0);
  }

  const outMp4 = path.join(CTX, cfg.out);
  const ffArgs = [...args];
  if (audio) ffArgs.push('-stream_loop', '-1', '-i', path.resolve(CTX, audio));
  ffArgs.push('-filter_complex', fc.join(';'), '-map', '[final]');
  if (audio) ffArgs.push('-map', `${frames.length}:a`, '-c:a', 'aac', '-b:a', '128k', '-shortest');
  ffArgs.push('-r', '30', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-y', outMp4);

  console.log('assembling', cfg.out, `(~${total.toFixed(1)}s, ${frames.length} slides, ${cfg.transition || 'cut'})`);
  execFileSync(FFMPEG, ffArgs, { stdio: 'pipe' });
  console.log('✅ wrote', outMp4);
  if (!audio) {
    console.log('   ↳ silent on purpose. Add audio from Instagram\'s own library in the');
    console.log('     composer before posting — see README.md §5. A silent reel is a scrolled reel.');
  }
  if (total > 22) {
    console.log(`   ↳ ${total.toFixed(1)}s is long for a first-touch reel. Under 20s holds retention better.`);
  }
}
main();
