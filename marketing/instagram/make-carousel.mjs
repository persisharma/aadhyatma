#!/usr/bin/env node
/*
 * make-carousel.mjs — render a light "parchment" 4:5 Instagram carousel (1080×1350)
 * for Vedansh via headless Chrome. Companion to make-reel.js, which renders the dark
 * reel/carousel kit. This one is the editorial format: kicker + title + subtitle +
 * 2–3 short paragraphs with saffron highlights, a faded deity line-drawing behind,
 * and the brand footer (वेदांश़ · smart link · handle) on every slide.
 *
 *   node make-carousel.mjs pitru-paksha-2026                 # → carousel/pitru-paksha-2026-hi-1.png … and -en-1.png …
 *   node make-carousel.mjs pitru-paksha-2026 --lang hi        # one language only (hi | en)
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
 * Every string in a manifest is a { hi, en } pair; the builder renders one carousel per
 * language (Hindi cards set in Noto Serif Devanagari, English cards in Cormorant Garamond)
 * so each card carries a single language. Highlight syntax: **bold saffron**.
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
        kicker: { hi: 'पितृ पक्ष · 26 सितम्बर – 10 अक्टूबर 2026', en: 'Pitru Paksha · 26 Sep – 10 Oct 2026' },
        title: { hi: 'श्रीराम ने पिता को\nक्या दिया था?', en: 'What did Rama\noffer his father?' },
        subtitle: { hi: 'सोना नहीं। अन्न नहीं। अञ्जलि भर जल।', en: 'Not gold. Not grain. A cupped handful of water.' },
        body: [
          { hi: 'आज से पितृ पक्ष आरम्भ। रामायण के दो प्रसंग बताते हैं कि पितरों तक **क्या** पहुँचता है — और दो नदी-तट जहाँ इसी पखवाड़े **लाखों लोग वही कर रहे हैं**: एक जो रामायण में है, एक जिसे माना जाता है।',
            en: 'Pitru Paksha begins today. Two episodes from the Ramayana show **what actually reaches** the ancestors — and two riverbanks where **lakhs are doing exactly that** this fortnight: one the Ramayana names, one that is believed.' },
        ],
        swipe: { hi: 'स्वाइप करें →', en: 'Swipe →' },
      },
      {
        kind: 'text',
        bg: 'deity-ganga.webp',
        kicker: { hi: 'तर्पण का सबसे पुराना रूप', en: 'The oldest form of tarpana' },
        title: { hi: 'जल ही क्यों', en: 'Why water' },
        subtitle: { hi: 'रामायण जो बार-बार दिखाती है', en: 'What the Ramayana shows again and again' },
        body: [
          { hi: 'रामायण में पितृ-कर्म एक ही रूप में मिलता है: **अञ्जलि भर जल**, **दक्षिण दिशा** की ओर मुख, और यह भाव कि यह जल उन तक पहुँचे।',
            en: 'In the Ramayana the rite for the ancestors has one form: **a handful of water**, **facing south**, with the wish that it reach them.' },
          { hi: 'श्रीराम ने पिता दशरथ के लिए **मन्दाकिनी** में यही किया, और जटायु के लिए **गोदावरी** में।',
            en: 'Rama did this for his father Dasharatha at the **Mandakini**, and for Jatayu at the **Godavari**.' },
          { hi: 'बालकाण्ड में गरुड़ अंशुमान् से कहते हैं — सगर के पुत्रों के लिए लौकिक जल पर्याप्त नहीं; उनके लिए **गंगा** चाहिए। तीन पीढ़ियाँ इसी प्रश्न में बीतीं।',
            en: 'In the Bala Kanda, Garuda tells Anshuman: ordinary water will not do for Sagara’s sons — they need the **Ganga**. Three generations passed on that one question.' },
        ],
        canon: { hi: 'वाल्मीकि रामायण · अयोध्याकाण्ड १०३ · अरण्यकाण्ड ६८ · बालकाण्ड ४१', en: 'Valmiki Ramayana · Ayodhya Kanda 103 · Aranya Kanda 68 · Bala Kanda 41' },
      },
      {
        kind: 'text',
        bg: 'deity-rama-darbar.webp',
        kicker: { hi: 'जटायु का प्रसंग', en: 'The Jatayu episode' },
        title: { hi: 'किसके लिए, और किससे', en: 'For whom, and with what' },
        subtitle: { hi: 'सामग्री नहीं, भाव देखा जाता है', en: 'It is the feeling that counts, not the materials' },
        body: [
          { hi: 'अरण्यकाण्ड में श्रीराम **जटायु** का दाह-संस्कार स्वयं करते हैं। जटायु न उनके कुल के थे, न मनुष्य — वे पिता के मित्र एक पक्षी थे।',
            en: 'In the Aranya Kanda, Rama himself performs **Jatayu’s** last rites. Jatayu was not of his clan, not even human — a bird, his father’s friend.' },
          { hi: 'वन में राम के पास राजसी पदार्थ नहीं थे। उन्होंने वहीं मिले **इंगुदी के गूदे** से पिता के लिए पिण्ड बनाया और कहा — **जो हम खाते हैं, वही आपको अर्पित है।**',
            en: 'In the forest there was nothing royal. Rama made the pinda for his father from **ingudi pulp** found right there, and said — **“What we eat, that we offer you.”**' },
          { hi: 'स्मरण का द्वार किसी सूची से नहीं, **भाव** से खुलता है।',
            en: 'Remembrance opens not with a checklist, but with **bhava**.' },
        ],
        canon: { hi: 'वाल्मीकि रामायण · अरण्यकाण्ड ६७–६८ · अयोध्याकाण्ड १०३', en: 'Valmiki Ramayana · Aranya Kanda 67–68 · Ayodhya Kanda 103' },
      },
      {
        kind: 'text',
        bg: 'source-gayatri-savitri-sun.webp',
        kicker: { hi: 'जहाँ रामायण ने यह दिखाया · चित्रकूट, उत्तर प्रदेश', en: 'Where the Ramayana placed it · Chitrakoot, UP' },
        title: { hi: 'मन्दाकिनी का तट', en: 'The banks of\nthe Mandakini' },
        subtitle: { hi: 'रामघाट · सर्वपितृ अमावस्या मेला · 10 अक्टूबर 2026', en: 'Ramghat · Sarva Pitru Amavasya mela · 10 Oct 2026' },
        body: [
          { hi: 'अयोध्याकाण्ड में श्रीराम ने पिता दशरथ के लिए **मन्दाकिनी** के इसी तट पर अञ्जलि भर जल दिया और इंगुदी का पिण्ड रखा। यह **रामायण का प्रसंग** है — मान्यता नहीं।',
            en: 'In the Ayodhya Kanda, Rama offered his father Dasharatha a handful of water and the ingudi pinda on this very bank of the **Mandakini**. This is the **Ramayana’s own account** — not a belief.' },
          { hi: 'आज भी पूरे पितृ पक्ष में लोग **रामघाट** पर तर्पण करते हैं। पक्ष के अन्तिम दिन — **सर्वपितृ अमावस्या, 10 अक्टूबर** — यहाँ मेला लगता है और लाखों लोग स्नान और पिण्डदान करते हैं।',
            en: 'Through Pitru Paksha people still do tarpana at **Ramghat**. On the last day — **Sarva Pitru Amavasya, 10 October** — a mela forms here, and lakhs bathe and offer pind-daan.' },
          { hi: 'वही जल, वही दक्षिण दिशा, वही नदी।',
            en: 'The same water, the same south, the same river.' },
        ],
        canon: { hi: 'वाल्मीकि रामायण · अयोध्याकाण्ड १०३ · चित्रकूट', en: 'Valmiki Ramayana · Ayodhya Kanda 103 · Chitrakoot' },
      },
      {
        kind: 'text',
        bg: 'source-vishnu-narayana.webp',
        kicker: { hi: 'जिसे माना जाता है · गया, बिहार', en: 'What is believed · Gaya, Bihar' },
        title: { hi: 'फल्गु का तट', en: 'The banks of\nthe Falgu' },
        subtitle: { hi: 'विष्णुपद · पितृपक्ष मेला · 26 सितम्बर – 10 अक्टूबर 2026', en: 'Vishnupad · Pitru Paksha Mela · 26 Sep – 10 Oct' },
        body: [
          { hi: 'इन पन्द्रह दिनों में **गया** में पितृपक्ष मेला चल रहा है। **फल्गु** के तट पर, **विष्णुपद** मन्दिर के आस-पास, देश भर से लोग पिण्डदान के लिए आ रहे हैं।',
            en: 'The Pitru Paksha Mela is on in **Gaya** these fifteen days. On the **Falgu**’s banks, around **Vishnupad**, people are arriving from all over India for pind-daan.' },
          { hi: 'गया की मान्यता है कि श्रीराम, सीता और लक्ष्मण भी दशरथ के लिए यहाँ आए थे — और **सीता ने फल्गु की बालू से पिण्ड** बनाया। यह रामायण में नहीं, गया की स्मृति में है।',
            en: 'Gaya’s belief is that Rama, Sita and Lakshmana too came here for Dasharatha — and that **Sita made the pinda from the sand of the Falgu**. This lives in Gaya’s memory, not in the Ramayana.' },
          { hi: 'यहाँ भी वही तीन चीज़ें: **जल**, **दक्षिण दिशा**, और **भाव**।',
            en: 'Here too: **water**, **the south**, and **bhava**.' },
        ],
        canon: { hi: 'गया की लोक-मान्यता · गया-माहात्म्य', en: 'Gaya tradition · Gaya Mahatmya' },
      },
      {
        kind: 'cta',
        bg: 'deity-rama-darbar.webp',
        kicker: { hi: 'पितृ पक्ष · 26 सितम्बर – 10 अक्टूबर 2026', en: 'Pitru Paksha · 26 Sep – 10 Oct 2026' },
        title: { hi: 'पितृ पक्ष, वेदांश़ में', en: 'Pitru Paksha in Vedansh' },
        subtitle: { hi: 'समझिए, फिर करिए', en: 'Understand first, then offer' },
        items: [
          { glyph: 'पि', h: { hi: 'पितृ पक्ष परिचय', en: 'Pitru Paksha primer' }, d: { hi: 'जल ही क्यों · किसके लिए · किस दिन किसका श्राद्ध', en: 'Why water · for whom · whose shraddha on which day' } },
          { glyph: 'ति', h: { hi: 'तिथि', en: 'Tithi' }, d: { hi: 'आपके शहर का पंचांग — श्राद्ध का दिन तिथि से', en: 'Your city’s Panchang — the shraddha day from the tithi' } },
          { glyph: 'या', h: { hi: 'याद', en: 'Reminder' }, d: { hi: 'पितृ स्मरण reminder — तिथि से एक रात पहले', en: 'Pitru Smaran reminder — the night before the tithi' } },
          { glyph: 'क', h: { hi: 'कथा', en: 'Katha' }, d: { hi: 'रामायण के प्रसंग — मूल पाठ तक, हिंदी और अंग्रेज़ी', en: 'Ramayana episodes — down to the original text' } },
        ],
        note: { hi: 'मुफ़्त · बिना इंटरनेट के भी चलता है', en: 'Free · Works offline' },
        button: { hi: 'अभी डाउनलोड करें', en: 'Download Now' },
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
function shell({ bgUri, bgPos = '62% 18%', bgOpacity = 0.22, inner, pageNo, total, fontsCss, om = true, lang = 'hi' }) {
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
  .para { font-size:40px; line-height:1.55; font-weight:400; color:${C.inkSoft}; }
  .beat { margin-bottom:34px; }
  /* English cards: Cormorant throughout, slightly tighter leading (Latin needs less than Devanagari). */
  body.en .kicker, body.en .title, body.en .subtitle, body.en .para, body.en .canon, body.en .swipe,
  body.en .ctaH, body.en .ctaD, body.en .note, body.en .button { font-family:'Cormorant Garamond', Georgia, serif; }
  body.en .kicker { font-size:28px; font-weight:600; letter-spacing:0.5px; }
  body.en .title { font-size:92px; line-height:1.04; font-weight:700; }
  body.en .subtitle { font-size:42px; font-style:italic; font-weight:500; line-height:1.25; }
  body.en .para { font-size:38px; line-height:1.36; font-weight:500; }
  body.en .beat { margin-bottom:26px; }
  body.en .canon { font-size:26px; font-weight:500; }
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
</style></head><body class="${lang}">
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
const T = (v, lang) => (v && typeof v === 'object') ? (v[lang] ?? v.hi ?? '') : (v ?? '');

function beats(body, lang) {
  return body.map(p => `<div class="beat"><div class="para">${rich(T(p, lang))}</div></div>`).join('');
}
function headBlock(s, lang, titleSize) {
  return `
    <div class="title"${titleSize ? ` style="font-size:${titleSize}px;"` : ''}>${rich(T(s.title, lang))}</div>
    <div class="subtitle">${rich(T(s.subtitle, lang))}</div>
    <div class="rule"></div>`;
}

function hookHtml(s, lang) {
  return `
    ${headBlock(s, lang, lang === 'en' ? 98 : 104)}
    ${beats(s.body, lang)}
    <div style="margin-top:auto; display:flex; justify-content:flex-end;">
      <div class="swipe" style="display:inline-block; padding:16px 34px; border:1.5px solid ${C.saffron}; border-radius:40px;
                  font-size:${lang === 'en' ? 34 : 30}px; font-weight:600; color:${C.saffron};">${esc(T(s.swipe, lang))}</div>
    </div>`;
}

function textHtml(s, lang) {
  return `
    ${headBlock(s, lang)}
    ${beats(s.body, lang)}
    ${s.canon ? `<div class="canon">${esc(T(s.canon, lang))}</div>` : ''}`;
}

function ctaHtml(s, lang) {
  const en = lang === 'en';
  const items = s.items.map(it => `
    <div style="display:flex; gap:26px; align-items:flex-start; padding:${en ? 15 : 22}px 26px; margin-bottom:${en ? 12 : 16}px;
                background:rgba(255,250,236,0.62); border:1px solid ${C.border}; border-radius:18px;">
      <div style="flex:0 0 auto; min-width:64px; height:64px; padding:0 14px; border-radius:14px; display:flex; align-items:center; justify-content:center;
                  background:linear-gradient(160deg,#E8B26A,#C9853E); color:#3d1a00; font-weight:700; font-size:30px;">${esc(it.glyph)}</div>
      <div>
        <div class="ctaH" style="font-size:${en ? 34 : 34}px; font-weight:700; color:${C.saffron}; line-height:1.2;">${esc(T(it.h, lang))}</div>
        <div class="ctaD" style="font-size:${en ? 28 : 28}px; color:${C.inkSoft}; line-height:1.35; margin-top:4px;">${esc(T(it.d, lang))}</div>
      </div>
    </div>`).join('');
  return `
    <div class="title" style="font-size:${en ? 80 : 84}px;">${rich(T(s.title, lang))}</div>
    <div class="subtitle" style="margin-top:12px;">${rich(T(s.subtitle, lang))}</div>
    <div class="rule" style="margin:26px 0 22px;"></div>
    ${items}
    <div style="margin-top:auto; text-align:center;">
      <div class="note" style="font-size:${en ? 30 : 28}px; color:${C.inkMuted}; margin-bottom:20px;">${esc(T(s.note, lang))}</div>
      <div class="button" style="display:inline-block; padding:20px 60px; border-radius:22px; background:linear-gradient(180deg,#A8501B,#7A3208);
                  color:#F8EFD6; font-size:${en ? 40 : 38}px; font-weight:700; box-shadow:0 10px 30px rgba(122,50,8,0.28);">${esc(T(s.button, lang))}</div>
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
    console.error('usage: node make-carousel.mjs <' + Object.keys(CAROUSELS).join('|') + '> [--lang hi|en] [--out <dir>] [--fonts <css>]');
    process.exit(1);
  }
  const outDir = path.resolve(arg('--out') || path.join(HERE, 'carousel'));
  const fontsCss = arg('--fonts');
  fs.mkdirSync(outDir, { recursive: true });
  const langs = arg('--lang') ? [arg('--lang')] : ['hi', 'en'];
  const total = set.slides.length;
  for (const lang of langs) {
    set.slides.forEach((s, i) => {
      const bgUri = dataUri(path.join(BG_DIR, s.bg));
      let html;
      if (s.kind === 'hook') html = hookHtml(s, lang);
      else if (s.kind === 'cta') html = ctaHtml(s, lang);
      else html = textHtml(s, lang);
      const page = shell({ bgUri, bgPos: s.bgPos, bgOpacity: s.bgOpacity, inner: { kicker: esc(T(s.kicker, lang)), html },
                           pageNo: i + 1, total, fontsCss, om: s.kind !== 'cta', lang });
      const out = path.join(outDir, `${name}-${lang}-${i + 1}.png`);
      renderPng(page, out);
      console.log('✓', path.relative(process.cwd(), out));
    });
  }
  console.log(`✅ ${total} slides × ${langs.join('+')}. Slide 1 is the hook; post each language as its own carousel. Caption: posts/${name}.md`);
}

main();
