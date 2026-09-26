#!/usr/bin/env node
/*
 * make-carousel.mjs — render a light "parchment" 4:5 Instagram carousel (1080×1350)
 * for Vedansh via headless Chrome. Companion to make-reel.js, which renders the dark
 * reel/carousel kit. This one is the editorial format: kicker + title + subtitle +
 * 2–3 short paragraphs with saffron highlights, a faded deity line-drawing behind,
 * and the brand footer (वेदांश़ · smart link · handle) on every slide.
 *
 *   node make-carousel.mjs pitru-mandakini-2026            # → carousel/pitru-mandakini-2026-hi-1.png … and -en-1.png …
 *   node make-carousel.mjs pitru-falgu-2026 --lang hi      # one language only (hi | en)
 *   node make-carousel.mjs pitru-falgu-2026 --out ./posts/pitru-falgu-2026
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
 *   text    — kicker, title, subtitle, rule, optional `rows` (label · value list, for
 *             dates/tithis), paragraphs. `**…**` marks a saffron bold.
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
  // ── Story A: Mandakini / Chitrakoot — the bank the Ramayana itself names ──
  'pitru-mandakini-2026': {
    slides: [
      {
        kind: 'hook',
        bg: 'deity-rama-darbar.webp',
        kicker: { hi: 'पितृ पक्ष · 26 सितम्बर – 10 अक्टूबर 2026', en: 'Pitru Paksha · 26 Sep – 10 Oct 2026' },
        title: { hi: 'श्रीराम ने पिता को\nक्या दिया था?', en: 'What did Rama\noffer his father?' },
        subtitle: { hi: 'सोना नहीं। अन्न नहीं। अञ्जलि भर जल।', en: 'Not gold. Not grain. A cupped handful of water.' },
        body: [
          { hi: 'रामायण का वह तट जहाँ यह हुआ — और जहाँ इसी पखवाड़े **लाखों लोग वही कर रहे हैं**। चित्रकूट, मन्दाकिनी।',
            en: 'The riverbank where the Ramayana places it — and where **lakhs are doing exactly that** this fortnight. Chitrakoot, on the Mandakini.' },
        ],
        swipe: { hi: 'स्वाइप करें →', en: 'Swipe →' },
      },
      {
        kind: 'text',
        bg: 'deity-ganga.webp',
        kicker: { hi: 'अयोध्याकाण्ड · चित्रकूट', en: 'Ayodhya Kanda · Chitrakoot' },
        title: { hi: 'मन्दाकिनी का तट', en: 'The banks of\nthe Mandakini' },
        subtitle: { hi: 'जो रामायण स्वयं कहती है', en: 'What the Ramayana itself says' },
        body: [
          { hi: 'भरत चित्रकूट आए और दशरथ के देहान्त का समाचार दिया। श्रीराम मन्दाकिनी के तट पर उतरे, **अञ्जलि में जल भरा**, **दक्षिण दिशा** की ओर मुख किया — "पिता, यह जल आप तक पहुँचे।"',
            en: 'Bharata reached Chitrakoot with news of Dasharatha’s death. Rama went down to the Mandakini, **filled his cupped hands with water**, **faced south** — “Father, may this reach you.”' },
          { hi: 'वन में राजसी सामग्री नहीं थी। उन्होंने **इंगुदी के गूदे** का पिण्ड दर्भ पर रखा और कहा — **जो हम खाते हैं, वही आपको अर्पित है।**',
            en: 'There was nothing royal in the forest. He set a pinda of **ingudi pulp** on darbha grass and said — **“What we eat, that we offer you.”**' },
          { hi: 'तर्पण का सबसे पुराना रूप: जल, दिशा, भाव। सामग्री नहीं।',
            en: 'The oldest form of tarpana: water, direction, bhava. Not the materials.' },
        ],
        canon: { hi: 'वाल्मीकि रामायण · अयोध्याकाण्ड १०३', en: 'Valmiki Ramayana · Ayodhya Kanda 103' },
      },
      {
        kind: 'text',
        bg: 'source-gayatri-savitri-sun.webp',
        kicker: { hi: 'अभी · रामघाट, चित्रकूट, उत्तर प्रदेश', en: 'Right now · Ramghat, Chitrakoot, UP' },
        title: { hi: 'रामघाट, आज', en: 'Ramghat, today' },
        subtitle: { hi: 'पितृ पक्ष 2026 · मन्दाकिनी तट', en: 'Pitru Paksha 2026 · on the Mandakini' },
        rows: [
          { k: { hi: 'आज', en: 'Today' }, v: { hi: 'शनिवार 26 सितम्बर · भाद्रपद पूर्णिमा · पूर्णिमा श्राद्ध — पक्ष का पहला दिन', en: 'Sat 26 Sep · Bhadrapada Purnima · Purnima Shraddha — first day of the paksha' } },
          { k: { hi: 'पक्ष', en: 'Fortnight' }, v: { hi: '26 सितम्बर – 10 अक्टूबर · हर तिथि पर रामघाट में तर्पण', en: '26 Sep – 10 Oct · tarpana at Ramghat on every tithi' } },
          { k: { hi: 'मेला', en: 'Mela' }, v: { hi: 'शनिवार 10 अक्टूबर · आश्विन कृष्ण अमावस्या · सर्वपितृ अमावस्या — लाखों का स्नान और पिण्डदान', en: 'Sat 10 Oct · Ashwin Krishna Amavasya · Sarva Pitru Amavasya — lakhs bathe and offer pind-daan' } },
        ],
        body: [
          { hi: 'जिस तट पर राम ने पिता को जल दिया, वहाँ आज भी लोग वही करते हैं। वही जल, वही दक्षिण दिशा, वही नदी।',
            en: 'On the bank where Rama offered his father water, people still do the same. The same water, the same south, the same river.' },
        ],
        canon: { hi: 'तिथियाँ सूर्योदय के अनुसार · अपने शहर का पंचांग देखें', en: 'Tithis follow local sunrise · check your city’s Panchang' },
      },
      {
        kind: 'cta',
        bg: 'deity-rama-darbar.webp',
        kicker: { hi: 'पितृ पक्ष · 26 सितम्बर – 10 अक्टूबर 2026', en: 'Pitru Paksha · 26 Sep – 10 Oct 2026' },
        title: { hi: 'पितृ पक्ष, वेदांश़ में', en: 'Pitru Paksha in Vedansh' },
        subtitle: { hi: 'यही कथा, मूल श्लोकों तक', en: 'This very katha, down to the verses' },
        items: [
          { glyph: 'क', h: { hi: 'कथा', en: 'Katha' }, d: { hi: 'चित्रकूट में श्रीराम का पितृ-कर्म — अयोध्याकाण्ड के श्लोकों तक', en: 'Rama’s rite at Chitrakoot — down to the Ayodhya Kanda verses' } },
          { glyph: 'पि', h: { hi: 'पितृ पक्ष परिचय', en: 'Pitru Paksha primer' }, d: { hi: 'जल ही क्यों · किसके लिए · किस दिन किसका श्राद्ध', en: 'Why water · for whom · whose shraddha on which day' } },
          { glyph: 'ति', h: { hi: 'तिथि', en: 'Tithi' }, d: { hi: 'आपके शहर का पंचांग — श्राद्ध का दिन तिथि से', en: 'Your city’s Panchang — the shraddha day from the tithi' } },
          { glyph: 'या', h: { hi: 'याद', en: 'Reminder' }, d: { hi: 'पितृ स्मरण reminder — तिथि से एक रात पहले', en: 'Pitru Smaran reminder — the night before the tithi' } },
        ],
        note: { hi: 'मुफ़्त · बिना इंटरनेट के भी चलता है', en: 'Free · Works offline' },
        button: { hi: 'अभी डाउनलोड करें', en: 'Download Now' },
      },
    ],
  },

  // ── Story B: Falgu / Gaya — the belief, and the mela that is on right now ──
  'pitru-falgu-2026': {
    slides: [
      {
        kind: 'hook',
        bg: 'source-vishnu-narayana.webp',
        kicker: { hi: 'पितृ पक्ष · 26 सितम्बर – 10 अक्टूबर 2026', en: 'Pitru Paksha · 26 Sep – 10 Oct 2026' },
        title: { hi: 'सीता ने पिण्ड\nकिससे बनाया था?', en: 'What did Sita make\nthe pinda from?' },
        subtitle: { hi: 'बालू से। फल्गु की बालू से।', en: 'Sand. The sand of the Falgu.' },
        body: [
          { hi: 'गया की कथा — और वह मेला जो **आज वहाँ चल रहा है**।',
            en: 'A story from Gaya — and the mela that is **on there right now**.' },
        ],
        swipe: { hi: 'स्वाइप करें →', en: 'Swipe →' },
      },
      {
        kind: 'text',
        dense: true,
        bg: 'source-vishnu-narayana.webp',
        kicker: { hi: 'गया की कथा · बिहार', en: 'The Gaya story · Bihar' },
        title: { hi: 'फल्गु की बालू', en: 'The sand of\nthe Falgu' },
        subtitle: { hi: 'सीता का पिण्डदान', en: 'Sita’s pind-daan' },
        body: [
          { hi: 'श्रीराम, सीता और लक्ष्मण दशरथ के पिण्डदान के लिए गया आए। राम और लक्ष्मण सामग्री लाने गए, और **श्राद्ध का समय** निकलने लगा।',
            en: 'Rama, Sita and Lakshmana came to Gaya for Dasharatha’s pind-daan. The brothers went to fetch the materials, and the **hour for shraddha** began to slip away.' },
          { hi: 'सीता ने **फल्गु की बालू** का पिण्ड बनाया। साक्षी बनाए — **फल्गु, गौ, केतकी और अक्षयवट**। दशरथ ने स्वयं हाथ बढ़ाकर उसे स्वीकार किया।',
            en: 'Sita made the pinda from **Falgu sand**, with **the Falgu, a cow, the ketaki and the Akshayavat** as witnesses. Dasharatha himself reached out and accepted it.' },
          { hi: 'राम लौटे तो केवल अक्षयवट ने सच कहा। तभी से, कहते हैं, **फल्गु ऊपर सूखी बहती है** और **अक्षयवट अक्षय** है।',
            en: 'When Rama returned, only the Akshayavat told the truth. Since then, they say, the **Falgu runs dry** on top and the **Akshayavat never withers**.' },
          { hi: 'सीख सीधी है: **जो पास है, वही अर्पित।** भाव ही पहुँचता है।',
            en: 'The lesson is simple: **what is at hand, that is offered.**' },
        ],
        canon: { hi: 'गया की परम्परा · गया-माहात्म्य', en: 'Gaya tradition · Gaya Mahatmya' },
      },
      {
        kind: 'text',
        bg: 'deity-ganga.webp',
        kicker: { hi: 'अभी · विष्णुपद, फल्गु तट, गया', en: 'Right now · Vishnupad, on the Falgu, Gaya' },
        title: { hi: 'गया, आज', en: 'Gaya, today' },
        subtitle: { hi: 'पितृपक्ष मेला 2026 · विष्णुपद · फल्गु', en: 'Pitru Paksha Mela 2026 · Vishnupad · Falgu' },
        rows: [
          { k: { hi: 'आरम्भ', en: 'Opens' }, v: { hi: 'शनिवार 26 सितम्बर · भाद्रपद पूर्णिमा · पूर्णिमा श्राद्ध', en: 'Sat 26 Sep · Bhadrapada Purnima · Purnima Shraddha' } },
          { k: { hi: 'मेला', en: 'Mela' }, v: { hi: '26 सितम्बर – 10 अक्टूबर · हर तिथि का श्राद्ध फल्गु तट पर · देश भर से पिण्डदान के लिए', en: '26 Sep – 10 Oct · each tithi’s shraddha on the Falgu · pilgrims from all over India for pind-daan' } },
          { k: { hi: 'समापन', en: 'Closes' }, v: { hi: 'शनिवार 10 अक्टूबर · आश्विन कृष्ण अमावस्या · सर्वपितृ अमावस्या', en: 'Sat 10 Oct · Ashwin Krishna Amavasya · Sarva Pitru Amavasya' } },
        ],
        body: [
          { hi: 'यहाँ भी वही तीन चीज़ें: **जल**, **दक्षिण दिशा**, और **भाव**।',
            en: 'Here too, the same three things: **water**, **the south**, and **bhava**.' },
        ],
        canon: { hi: 'तिथियाँ सूर्योदय के अनुसार · अपने शहर का पंचांग देखें', en: 'Tithis follow local sunrise · check your city’s Panchang' },
      },
      {
        kind: 'cta',
        bg: 'deity-rama-darbar.webp',
        kicker: { hi: 'पितृ पक्ष · 26 सितम्बर – 10 अक्टूबर 2026', en: 'Pitru Paksha · 26 Sep – 10 Oct 2026' },
        title: { hi: 'पितृ पक्ष, वेदांश़ में', en: 'Pitru Paksha in Vedansh' },
        subtitle: { hi: 'कथा यहाँ — समझ और विधि ऐप में', en: 'The story is here — the vidhi is in the app' },
        items: [
          { glyph: 'पि', h: { hi: 'पितृ पक्ष परिचय', en: 'Pitru Paksha primer' }, d: { hi: 'जल ही क्यों · किसके लिए · किस दिन किसका श्राद्ध', en: 'Why water · for whom · whose shraddha on which day' } },
          { glyph: 'वि', h: { hi: 'विधि', en: 'Vidhi' }, d: { hi: 'घर पर तिल-तर्पण — और जब पूरा विधान सम्भव न हो, अनुकल्प', en: 'Tila-tarpana at home — and the anukalpa when the full rite is not possible' } },
          { glyph: 'ति', h: { hi: 'तिथि', en: 'Tithi' }, d: { hi: 'आपके शहर का पंचांग — श्राद्ध का दिन तिथि से', en: 'Your city’s Panchang — the shraddha day from the tithi' } },
          { glyph: 'या', h: { hi: 'याद', en: 'Reminder' }, d: { hi: 'पितृ स्मरण reminder — तिथि से एक रात पहले', en: 'Pitru Smaran reminder — the night before the tithi' } },
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
function shell({ bgUri, bgPos = '62% 18%', bgOpacity = 0.22, inner, pageNo, total, fontsCss, om = true, lang = 'hi', dense = false }) {
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
  .rows { margin:-6px 0 26px; }
  .row { display:flex; gap:22px; align-items:flex-start; padding:16px 0; border-bottom:1px solid ${C.border}; }
  .row:first-child { border-top:1px solid ${C.border}; }
  .rowK { flex:0 0 150px; font-size:30px; font-weight:700; color:${C.saffron}; line-height:1.4; }
  .rowV { font-size:31px; line-height:1.45; color:${C.inkSoft}; }
  body.en .rowK, body.en .rowV { font-family:'Cormorant Garamond', Georgia, serif; }
  body.en .rowK { font-size:32px; }
  body.en .rowV { font-size:32px; line-height:1.3; font-weight:500; }
  /* dense: a long story card — smaller body, tighter beats */
  body.dense .title { font-size:88px; }
  body.dense .para { font-size:36px; line-height:1.5; }
  body.dense .beat { margin-bottom:26px; }
  body.en.dense .para { font-size:35px; line-height:1.32; }
  body.en.dense .beat { margin-bottom:22px; }
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
</style></head><body class="${lang}${dense ? ' dense' : ''}">
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

function rowsBlock(rows, lang) {
  if (!rows) return '';
  return `<div class="rows">${rows.map(r => `
    <div class="row"><div class="rowK">${esc(T(r.k, lang))}</div><div class="rowV">${rich(T(r.v, lang))}</div></div>`).join('')}</div>`;
}

function textHtml(s, lang) {
  return `
    ${headBlock(s, lang)}
    ${rowsBlock(s.rows, lang)}
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
                           pageNo: i + 1, total, fontsCss, om: s.kind !== 'cta', lang, dense: !!s.dense });
      const out = path.join(outDir, `${name}-${lang}-${i + 1}.png`);
      renderPng(page, out);
      console.log('✓', path.relative(process.cwd(), out));
    });
  }
  console.log(`✅ ${total} slides × ${langs.join('+')}. Slide 1 is the hook; post each language as its own carousel. Caption: posts/${name}.md`);
}

main();
