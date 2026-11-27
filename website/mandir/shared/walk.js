// The shared walk (pradakshina) used by V1 and V2: every space after the gate, gate to sanctum.
//
// Contract
//   mountWalk(mainEl, { lang })   renders <section id="space-<id>" data-space="<id>"> for each space after
//                                 'gate' into mainEl, wires every act, returns { setAlcove(id) }.
//   listens  'vedansh:lang'   {lang}  re-labels text and re-renders live data in the new language.
//   listens  'vedansh:alcove' {id}    switches the Granth mandap to krishna | hanuman | saraswati.
//   sets     --light (0→1) on <body> by scroll position (walk.css warms the background from it).
//   Once idle it loads extras.js, which fills the placeholders (app screens, graha seats, card maker, FAQ);
//   [data-catalog] buttons open its catalog sheet on that stop.
import content from './content.js';
import { t, ta, esc, pick, getLang, setLang, classicHref, storeButtons, requestGet, reducedMotion, chime, asset, ARROW, DIYA, TRUST, loadExtras, openCatalog } from './chrome.js';

const S = Object.fromEntries(content.spaces.map((s) => [s.id, s]));
const OFF = content.offerings;
const art = (n) => asset(`./art/${n}.webp`);
const img = (n) => asset(`./img/${n}`);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const pad2 = (n) => String(n).padStart(2, '0');

const UI = {
  inside: ['Inside the app', 'ऐप में'],
  todayK: ['Today, for your city', 'आज, आपके शहर के लिए'],
  city: ['City', 'शहर'],
  sunrise: ['Sunrise', 'सूर्योदय'],
  sunset: ['Sunset', 'सूर्यास्त'],
  cgNow: ['Choghadiya now', 'अभी चौघड़िया'],
  rahu: ['Rahu Kaal', 'राहु काल'],
  afterSunset: ['After sunset', 'सूर्यास्त के बाद'],
  cgDay: ['Day choghadiya, sunrise to sunset', 'दिन का चौघड़िया, सूर्योदय से सूर्यास्त'],
  todayNote: ['Day choghadiya in IST, approximate to a minute or two. Tithi, nakshatra, yoga, karana and the full Panchang are in the app.', 'दिन का चौघड़िया IST में, एक-दो मिनट के अंतर तक। तिथि, नक्षत्र, योग, करण और पूरा पंचांग ऐप में।'],
  nextSank: ['Next Sankashti Chaturthi', 'अगली संकष्टी चतुर्थी'],
  ctaGanesha: ['Open today’s Panchang in the app', 'आज का पंचांग ऐप में खोलें'],
  cord: ['Pull the gold cord for darshan', 'दर्शन के लिए सुनहरी डोरी खींचें'],
  cordHint: ['Pull the cord', 'डोरी खींचें'],
  alcoves: ['The three alcoves of the Granth mandap', 'ग्रन्थ मण्डप के तीन आले'],
  prevAlcove: ['Previous alcove', 'पिछला आला'],
  nextAlcove: ['Next alcove', 'अगला आला'],
  krishnaPrompt: ['Choose one. Krishna answers with a shloka from the Gita.', 'एक चुनें। श्रीकृष्ण गीता के एक श्लोक से उत्तर देते हैं।'],
  feelingsLabel: ['What weighs on you', 'मन में क्या है'],
  ctaKrishna: ['Read the whole Gita in the app', 'पूरी गीता ऐप में पढ़ें'],
  hanumanCite: ['Hanuman Chalisa · the opening doha', 'हनुमान चालीसा · आरम्भ का दोहा'],
  replay: ['Recite again', 'फिर से पढ़ें'],
  ctaHanuman: ['Read the full Chalisa in the app', 'पूरी चालीसा ऐप में पढ़ें'],
  shelfLabel: ['The shelf of granths', 'ग्रन्थों की अलमारी'],
  shelfHint: ['Swipe the shelf, tap a granth to read about it', 'अलमारी सरकाएँ, किसी ग्रन्थ को छूकर पढ़ें'],
  ctaSaraswati: ['Open the library in the app', 'ग्रन्थालय ऐप में खोलें'],
  chooseMantra: ['Choose a mantra', 'मन्त्र चुनें'],
  tapChant: ['Tap. Chant. Repeat.', 'दबाएँ। जपें। दोहराएँ।'],
  pause: ['A little pause, complete', 'कुछ पल का विराम पूरा'],
  of11: ['of 11 preview chants', '/ ११ जप की झलक'],
  countOne: ['Count one chant', 'एक जप गिनें'],
  continueJapa: ['Continue japa in the app', 'ऐप में जप जारी रखें'],
  malaPreview: ['A short preview of your daily practice. The app keeps the full 108.', 'आपकी नित्य साधना की एक छोटी झलक। पूरे 108 ऐप में।'],
  malaDone: ['11 moments of devotion. Take the next one with you.', 'भक्ति के ११ पल। अगला पल ऐप के साथ।'],
  resetMala: ['Reset the mala', 'माला फिर शुरू करें'],
  next: ['Next', 'अगला'],
  lightDiya: ['Light the diya', 'दीया जलाएँ'],
  diyaLit: ['The diya is lit.', 'दीया जल गया।'],
  calNote: ['Dates from the Vedansh calendar (purnimant), for India.', 'वेदांश पंचांग (पूर्णिमांत) से, भारत के लिए।'],
  ctaVrat: ['See each vrat’s vidhi in the app', 'हर व्रत की विधि ऐप में देखें'],
  comicK: ['Ramayana comic · Bālakāṇḍa', 'रामायण कॉमिक · बालकाण्ड'],
  comicT: ['Bālakāṇḍa, panel by panel.', 'बालकाण्ड, एक-एक चित्र में।'],
  comicLabel: ['Ramayana comic pages', 'रामायण कॉमिक के पृष्ठ'],
  prevPage: ['Previous page', 'पिछला पृष्ठ'],
  nextPage: ['Next page', 'अगला पृष्ठ'],
  storiesK: ['Illustrated stories · tap one to turn it', 'चित्र कथाएँ · पलटने के लिए छुएँ'],
  readInApp: ['Read in the app', 'ऐप में पढ़ें'],
  turnBack: ['Turn back', 'वापस पलटें'],
  ctaBal: ['Read the stories in the app', 'कथाएँ ऐप में पढ़ें'],
  grahaPrompt: ['Tap a lamp to meet its graha.', 'किसी दीप को छूकर उसका ग्रह जानें।'],
  grahasLabel: ['The nine grahas', 'नौ ग्रह'],
  ctaNava: ['Make your kundali in the app', 'अपनी कुण्डली ऐप में बनाएँ'],
  templesK: ['Four of the theerths · tap one for its story', 'चार तीर्थ · कथा के लिए छुएँ'],
  ctaYatra: ['Read every temple’s katha in the app', 'हर तीर्थ की कथा ऐप में पढ़ें'],
  scan: ['Scan to install on your phone', 'फ़ोन पर इंस्टॉल करने के लिए स्कैन करें'],
  qrAlt: ['QR code that opens the Vedansh download page', 'वेदांश डाउनलोड पेज खोलने वाला QR कोड'],
  privacy: ['Privacy', 'गोपनीयता'],
  terms: ['Terms', 'नियम'],
  support: ['Support', 'सहायता'],
  classic: ['Classic website', 'पुरानी वेबसाइट'],
  youtube: ['Watch on YouTube', 'YouTube पर देखें'],
  social: ['Vedansh on social media', 'सोशल मीडिया पर वेदांश'],
};

const ALT = {
  ganesha: ['Shri Ganesha seated on a lotus throne in a lamp-lit shrine', 'दीपों से प्रकाशित मन्दिर में कमल-आसन पर विराजमान श्री गणेश'],
  krishna: ['Shri Krishna teaching the Gita beside the chariot at Kurukshetra', 'कुरुक्षेत्र में रथ के पास गीता का उपदेश देते श्रीकृष्ण'],
  hanuman: ['Shri Hanuman kneeling in devotion with folded hands', 'हाथ जोड़कर भक्ति में बैठे श्री हनुमान'],
  saraswati: ['Maa Saraswati on a white lotus, playing the veena', 'श्वेत कमल पर वीणा बजाती माँ सरस्वती'],
  'bal-gopal': ['Bal Gopal with a pot of butter in a lamp-lit courtyard', 'दीपों से सजे आँगन में माखन की मटकी के साथ बाल गोपाल'],
  vrat: ['A vrat puja set with kalash, thali and diyas on a temple doorstep', 'मन्दिर की देहरी पर कलश, थाली और दीपों के साथ व्रत पूजा'],
  garbhagriha: ['A lamp-lit corridor leading to the glowing sanctum', 'दीपों से सजा गलियारा, जो प्रकाशित गर्भगृह तक जाता है'],
};

// Real story covers and first sentences of each temple's significance, as on the live site (Showcase.jsx).
const STORIES = [
  ['krishna-janma', 'The Birth of Krishna', 'कृष्ण की जन्म-कथा'],
  ['hanuman-sun', 'Hanuman and the Sun', 'हनुमान और सूर्य'],
  ['ganesha-birth', 'The Birth of Ganesha', 'गणेश की जन्म-कथा'],
  ['durga-mahishasura', 'Durga and Mahishasura', 'दुर्गा और महिषासुर'],
  ['kaliya-nag', 'Krishna and Kaliya Nag', 'कृष्ण और कालिया नाग'],
];
const TEMPLES = [
  ['khatu-shyam', 'Khatu Shyam Ji', 'खाटू श्याम जी', 'Rajasthan', 'राजस्थान',
    'At Khatu in Sikar district, Khatu Shyam Ji is Rajasthan’s busiest lokdevta shrine, where Shyam Baba is revered as Krishna himself in the Kali Yuga and called “haare ka sahara”, refuge of the defeated.',
    'सीकर ज़िले के खाटू में स्थित खाटू श्याम जी राजस्थान का सबसे व्यस्त लोकदेव तीर्थ है, जहाँ श्याम बाबा को कलियुग में कृष्ण का ही स्वरूप और “हारे का सहारा” माना जाता है।'],
  ['salasar-balaji', 'Salasar Balaji', 'सालासर बालाजी', 'Rajasthan', 'राजस्थान',
    'Salasar Dham in Churu district is revered as a siddha-peeth of Hanuman devotion.',
    'चूरू ज़िले का सालासर धाम हनुमान-भक्ति का सिद्धपीठ माना जाता है।'],
  ['karni-mata', 'Karni Mata, Deshnoke', 'करणी माता, देशनोक', 'Rajasthan', 'राजस्थान',
    'Karni Mata Temple at Deshnoke near Bikaner is the seat of the kuldevi of the royal houses of Bikaner and Jodhpur, and is known across the world for the thousands of sacred rats, the kabas, that live freely in its precinct.',
    'बीकानेर के पास देशनोक का करणी माता मंदिर बीकानेर और जोधपुर के राजघरानों की कुलदेवी का धाम है और काबा कहलाने वाले हज़ारों पवित्र चूहों की अनोखी परम्परा के लिए विश्वभर में जाना जाता है।'],
  ['khandoba-jejuri', 'Khandoba, Jejuri', 'खंडोबा, जेजुरी', 'Maharashtra', 'महाराष्ट्र',
    'Set on a hill above the Karha river in Purandar taluka of Pune district, the Khandoba temple of Jejuri is the foremost lokdevta shrine of Maharashtra.',
    'पुणे ज़िले के पुरंदर तालुका में कऱ्हा नदी के ऊपर पहाड़ी पर बसा जेजुरी का खंडोबा मंदिर महाराष्ट्र का सबसे बड़ा लोकदेव तीर्थ है।'],
];
// Grid order is the traditional 3x3 mandap with Surya at the centre; `order` is the lighting order.
const GRAHA_STYLE = {
  Surya: '#c2381d', Chandra: '#efe9dc', Mangal: '#d8561f', Budh: '#2f6b4f', Guru: '#e2b13c',
  Shukra: '#d6dbe0', Shani: '#262c48', Rahu: '#67636a', Ketu: '#5d4a66',
};

// Each list's strongest offerings; "+N more" opens the catalog on the rest.
const TOP = {
  ganesha: ['panchang', 'muhurat'], hanuman: ['chalisa', 'sundarkand'], saraswati: ['aarti', 'stotram'], japa: ['japa', 'routine'],
  vrat: ['vrat', 'vidhi'], navagraha: ['kundali', 'guna-milan'], yatra: ['theerth', 'audio', 'pitru'],
};
const GRAHA_GRID = ['Budh', 'Shukra', 'Chandra', 'Guru', 'Surya', 'Mangal', 'Ketu', 'Shani', 'Rahu'];
const BOOK_CLOTH = ['#8e1d14', '#3b2350', '#2f5f49', '#1f2a52', '#7a4a12', '#5b1a2c', '#9c5b35'];

/* ---------- Today maths, ported from website/app/src/Showcase.jsx ---------- */
const D2R = Math.PI / 180;
const norm = (x) => ((x % 360) + 360) % 360;
function sunTimes(y, m, d, lat, lon) {
  const n = Math.round(Date.UTC(y, m, d, 12) / 864e5 + 2440587.5 - 2451545);
  const js = n - lon / 360, M = norm(357.5291 + 0.98560028 * js), Mr = M * D2R;
  const C = 1.9148 * Math.sin(Mr) + 0.02 * Math.sin(2 * Mr) + 0.0003 * Math.sin(3 * Mr);
  const lam = norm(M + C + 282.9372) * D2R;
  const jt = 2451545 + js + 0.0053 * Math.sin(Mr) - 0.0069 * Math.sin(2 * lam);
  const dec = Math.asin(Math.sin(lam) * Math.sin(23.4397 * D2R));
  const w = Math.acos((Math.sin(-0.833 * D2R) - Math.sin(lat * D2R) * Math.sin(dec)) / (Math.cos(lat * D2R) * Math.cos(dec))) / D2R;
  return { rise: (jt - w / 360 - 2440587.5) * 864e5, set: (jt + w / 360 - 2440587.5) * 864e5 };
}
const IST = 5.5 * 36e5;
const ist = (ms) => { const d = new Date(ms + IST); return { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate(), wd: d.getUTCDay() }; };
const hm = (ms) => { const d = new Date(ms + IST); const h = d.getUTCHours(); return `${h % 12 || 12}:${pad2(d.getUTCMinutes())} ${h < 12 ? 'AM' : 'PM'}`; };
const CYCLE = ['udveg', 'char', 'labh', 'amrit', 'kaal', 'shubh', 'rog'];
const DAY_START = ['udveg', 'amrit', 'rog', 'labh', 'shubh', 'char', 'kaal'];
const RAHU_PART = [8, 2, 7, 5, 6, 4, 3];
const CG = { udveg: ['Udveg', 'उद्वेग', 'avoid'], char: ['Char', 'चर', 'neutral'], labh: ['Labh', 'लाभ', 'good'], amrit: ['Amrit', 'अमृत', 'good'], kaal: ['Kaal', 'काल', 'avoid'], shubh: ['Shubh', 'शुभ', 'good'], rog: ['Rog', 'रोग', 'avoid'] };
const CITIES = [['Ujjain', 'उज्जैन', 23.1765, 75.7885], ['Delhi', 'दिल्ली', 28.6139, 77.209], ['Mumbai', 'मुंबई', 19.076, 72.8777], ['Varanasi', 'वाराणसी', 25.3176, 82.9739], ['Bengaluru', 'बेंगलुरु', 12.9716, 77.5946], ['Kolkata', 'कोलकाता', 22.5726, 88.3639], ['Ahmedabad', 'अहमदाबाद', 23.0225, 72.5714]];

function dayPlan(now, city) {
  const [, , lat, lon] = CITIES[city];
  const p = ist(now), s = sunTimes(p.y, p.m, p.d, lat, lon), len = (s.set - s.rise) / 8;
  const start = CYCLE.indexOf(DAY_START[p.wd]);
  const parts = Array.from({ length: 8 }, (_, i) => ({ key: CYCLE[(start + i) % 7], at: s.rise + i * len, rahu: RAHU_PART[p.wd] === i + 1 }));
  return { s, len, parts, cur: now >= s.rise && now < s.set ? Math.floor((now - s.rise) / len) : -1 };
}

/* ---------- real observance dates (IST, day granularity) ---------- */
const istToday = () => Math.floor((Date.now() + IST) / 864e5);
const dayNum = (iso) => { const [y, m, d] = iso.split('-').map(Number); return Date.UTC(y, m - 1, d) / 864e5; };
const relDays = (n) => (n === 0 ? ['Today', 'आज'] : n === 1 ? ['Tomorrow', 'कल'] : [`in ${n} days`, `${n} दिन में`]);
const fmtDate = (iso, opts = { weekday: 'short', day: 'numeric', month: 'short' }) =>
  new Intl.DateTimeFormat(getLang() === 'hi' ? 'hi-IN' : 'en-IN', { ...opts, timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`));
const upcoming = () => { const d0 = istToday(); return content.observances.filter((o) => dayNum(o.date) >= d0); };

/* ---------- markup helpers ---------- */
const STEP = '<div class="vw-step" aria-hidden="true"><span></span></div>';

function head(s, n, extra = '') {
  return `<header class="vw-head vw-a-head" data-reveal>
    <p class="kicker"><span class="vw-num">${pad2(n)}</span>${t(s.kicker)}</p>
    <h2 class="vw-title display" id="h-${s.id}">${t(s.title)}</h2>
    <p class="vw-place"><span lang="en">${esc(s.en)}</span><span class="vw-dot" aria-hidden="true"></span><span lang="hi" class="deva">${esc(s.hi)}</span></p>
    ${t(s.line, 'p', 'class="vw-line"')}${extra}
  </header>`;
}

// A stop's "Inside the app" list, with `shot` its app screen beside it.
function offers(stop, ids, { level = 3, shot = '' } = {}) {
  const shown = TOP[stop] || ids;
  const rest = ids.length - shown.length;
  return `<div class="vw-offers${shot ? ' vw-offers--shot' : ''}" data-reveal>
    ${t(UI.inside, 'p', 'class="kicker vw-offers-k"')}
    ${shot ? phone(shot) : ''}
    <ul class="vw-offer-list">${shown.map((id) => {
      const o = OFF[id];
      return `<li class="vw-offer" data-offering="${id}">${t([o.en, o.hi], `h${level}`, 'class="vw-offer-t"')}${t([o.description, o.descriptionHi], 'p', 'class="vw-offer-d"')}</li>`;
    }).join('')}</ul>
    ${rest > 0 ? `<button type="button" class="vw-link vw-more" data-catalog="${stop}" data-track="catalog-more-${stop}" aria-haspopup="dialog">${t([`+${rest} more`, `+${rest} और`])}${t([`: all ${ids.length} in the catalog`, `: सूची में सभी ${ids.length}`], 'span', 'class="sr-only"')}</button>` : ''}
  </div>`;
}
const phone = (shrine) => `<figure class="vw-phone" data-shot="${shrine}"></figure>`;

const cta = (label, from) => `<button type="button" class="vw-cta" data-get="${from}">${t(label)}${ARROW}</button>`;
const deity = (pair) => `<p class="vw-deity"><span lang="en">${esc(pair[0])}</span><span class="vw-dot" aria-hidden="true"></span><span lang="hi" class="deva">${esc(pair[1])}</span></p>`;
const niche = (name, { cls = '', parallax = 0.05, inner = '' } = {}) =>
  `<div class="vw-niche ${cls}"><img src="${art(name)}" ${ta(['alt', ALT[name]])} loading="lazy" decoding="async" data-parallax="${parallax}">${inner}</div>`;
const banner = (name) => `<div class="vw-banner" aria-hidden="true"><img src="${art(name)}" alt="" loading="lazy" decoding="async" data-parallax="0.14"></div>`;
const arrowBtn = (dir, label, attrs = '') => `<button type="button" class="vw-arrow vw-arrow--${dir}" ${ta(['aria-label', label])} ${attrs}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="${dir === 'prev' ? 'M10 3 5 8l5 5' : 'M6 3l5 5-5 5'}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`;

/* ---------- spaces ---------- */
function ganeshaHTML() {
  const s = S.ganesha;
  return `<section id="space-ganesha" data-space="ganesha" class="vw-space vw-ganesha" aria-labelledby="h-ganesha">
  <div class="vw-wrap vw-grid">
    ${head(s, 1)}
    <div class="vw-a-art vw-shrine" data-reveal>
      <div class="vw-curtained" data-curtain>
        ${niche('ganesha', { inner: '<div class="vw-curtain vw-curtain--l" aria-hidden="true"></div><div class="vw-curtain vw-curtain--r" aria-hidden="true"></div><div class="vw-petals" aria-hidden="true"></div>' })}
        <button type="button" class="vw-cord" ${ta(['aria-label', UI.cord])}><span class="vw-cord-line"></span><span class="vw-tassel"></span>${t(UI.cordHint, 'span', 'class="vw-cord-hint" aria-hidden="true"')}</button>
      </div>
      ${deity(s.deity)}
      <p class="vw-blessing" aria-live="polite"></p>
    </div>
    <div class="vw-a-body">
      <div class="vw-today" data-today data-reveal>
        <div class="vw-today-top">
          ${t(UI.todayK, 'p', 'class="kicker"')}
          <label class="vw-city">${t(UI.city)}<select data-city>${CITIES.map(([en, hi], i) => t([en, hi], 'option', `value="${i}"`)).join('')}</select></label>
        </div>
        <dl class="vw-today-stats" aria-live="polite">
          <div>${t(UI.sunrise, 'dt')}<dd data-k="rise">—</dd></div>
          <div>${t(UI.sunset, 'dt')}<dd data-k="set">—</dd></div>
          <div>${t(UI.cgNow, 'dt')}<dd data-k="now">—</dd></div>
          <div>${t(UI.rahu, 'dt')}<dd data-k="rahu">—</dd></div>
        </dl>
        <ol class="vw-cg" data-cg ${ta(['aria-label', UI.cgDay])}></ol>
        ${t(UI.todayNote, 'p', 'class="vw-note"')}
      </div>
      <p class="vw-next" data-next-sank data-reveal></p>
      ${offers('ganesha', s.offerings, { shot: 'ganesha' })}
      ${cta(UI.ctaGanesha, 'ganesha')}
    </div>
  </div></section>`;
}

function granthHTML() {
  const s = S.granth;
  const [kr, ha, sa] = s.alcoves;
  const ch = content.preview.chalisa;
  const shell = (a, i, body) => `<article class="vw-alcove" id="alcove-${a.id}" data-alcove="${a.id}" role="group" aria-roledescription="slide" ${ta(['aria-label', [`${i + 1} of 3: ${a.deity[0]}`, `३ में से ${i + 1}: ${a.deity[1]}`]])}>
      <div class="vw-alcove-in">
        <figure class="vw-alcove-art">${niche(a.art, { parallax: 0 })}<figcaption>${deity(a.deity)}</figcaption></figure>
        <div class="vw-alcove-body">${t(a.act, 'h3', 'class="vw-act display"')}${body}</div>
      </div>
    </article>`;
  const krishna = shell(kr, 0, `
      <div class="vw-feelings" role="group" ${ta(['aria-label', UI.feelingsLabel])}>
        ${kr.feelings.map((f) => `<button type="button" class="vw-option" aria-pressed="false" data-verse="${f.verse}"><span class="vw-option-dot" aria-hidden="true"></span>${t([f.en, f.hi])}</button>`).join('')}
      </div>
      <figure class="vw-verse" data-verse-out aria-live="polite">${t(UI.krishnaPrompt, 'p', 'class="vw-verse-ph"')}</figure>
      <p class="vw-obs-line" data-gj></p>
      ${offers('krishna', kr.offerings, { level: 4, shot: 'granth' })}${cta(UI.ctaKrishna, 'krishna')}`);
  const hanuman = shell(ha, 1, `
      <blockquote class="vw-doha" lang="hi" data-doha>${ch.lines.map((l) => `<p class="vw-doha-line"><span>${esc(l)}</span></p>`).join('')}</blockquote>
      ${t([ch.meaningEn, ch.meaningHi], 'p', 'class="vw-meaning"')}
      <p class="vw-cite">${t(UI.hanumanCite)}<button type="button" class="vw-link" data-replay>${t(UI.replay)}</button></p>
      ${offers('hanuman', ha.offerings, { level: 4 })}${cta(UI.ctaHanuman, 'hanuman')}`);
  const saraswati = shell(sa, 2, `
      <div class="vw-shelf-wrap">
        <ul class="vw-shelf" data-shelf ${ta(['aria-label', UI.shelfLabel])}>
          ${sa.offerings.map((id, i) => `<li><button type="button" class="vw-book" style="--cloth:${BOOK_CLOTH[i % BOOK_CLOTH.length]}" aria-pressed="${i === 0}" data-book="${id}">
            <span class="vw-book-medal" aria-hidden="true"></span><span class="vw-book-t" lang="en">${esc(OFF[id].en)}</span><span class="vw-book-hi deva" lang="hi">${esc(OFF[id].hi)}</span></button></li>`).join('')}
        </ul>
        <div class="vw-ledge" aria-hidden="true"></div>
      </div>
      ${t(UI.shelfHint, 'p', 'class="vw-hint"')}
      <div class="vw-stand" data-stand aria-live="polite"></div>
      ${offers('saraswati', sa.offerings, { level: 4 })}${cta(UI.ctaSaraswati, 'saraswati')}`);
  return `<section id="space-granth" data-space="granth" class="vw-space vw-granth" aria-labelledby="h-granth">
    <div class="vw-wrap">${head(s, 2)}</div>
    <div class="vw-wrap vw-alcove-nav" data-reveal>
      <div class="vw-tabs" role="group" ${ta(['aria-label', UI.alcoves])}>
        ${s.alcoves.map((a, i) => `<button type="button" class="vw-tab" data-go="${i}" aria-controls="alcove-${a.id}" aria-current="${i === 0}"><span class="vw-tab-art"><img src="${art(a.art)}" alt="" loading="lazy" decoding="async"></span><span class="vw-tab-txt"><span lang="en">${esc(a.deity[0])}</span><span lang="hi" class="deva">${esc(a.deity[1])}</span></span></button>`).join('')}
      </div>
      <div class="vw-arrows">${arrowBtn('prev', UI.prevAlcove, 'data-prev')}${arrowBtn('next', UI.nextAlcove, 'data-next')}</div>
    </div>
    <div class="vw-alcoves" data-alcoves role="region" aria-roledescription="carousel" ${ta(['aria-label', UI.alcoves])}>
      ${krishna}${hanuman}${saraswati}
    </div>
  </section>`;
}

function japaHTML() {
  const s = S.japa;
  const R = 186, N = 108;
  const beads = Array.from({ length: N }, (_, i) => {
    const a = (i / N) * 2 * Math.PI - Math.PI / 2;
    return `<circle class="vw-bead" data-b="${i}" cx="${(220 + R * Math.cos(a)).toFixed(2)}" cy="${(220 + R * Math.sin(a)).toFixed(2)}" r="5.1"/>`;
  }).join('');
  return `<section id="space-japa" data-space="japa" class="vw-space vw-japa" aria-labelledby="h-japa">
  ${banner('japa')}
  <div class="vw-wrap vw-grid vw-grid--text-first vw-grid--japa">
    ${head(s, 3)}
    <div class="vw-a-body">
      <div class="vw-mantras" role="radiogroup" ${ta(['aria-label', UI.chooseMantra])} data-reveal>
        ${content.preview.mantras.map((m, i) => `<button type="button" role="radio" class="vw-option vw-mantra" aria-checked="${i === 0}" data-m="${i}"><span class="vw-option-dot" aria-hidden="true"></span><span lang="en">${esc(m.nameEn)}</span><span class="deva vw-mantra-hi" lang="hi">${esc(m.nameHi)}</span></button>`).join('')}
      </div>
      <div class="vw-mantra-text" data-mtext></div>
    </div>
    <div class="vw-a-art vw-mala-col" data-reveal>
      <div class="vw-mala">
        <svg class="vw-mala-svg" viewBox="0 0 440 440" aria-hidden="true">
          <defs>
            <radialGradient id="vw-bead-g" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#b97a45"/><stop offset=".55" stop-color="#6e3b1c"/><stop offset="1" stop-color="#3c1e0d"/></radialGradient>
            <radialGradient id="vw-bead-on" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#fff1c4"/><stop offset=".5" stop-color="#ffcc6b"/><stop offset="1" stop-color="#c77b1c"/></radialGradient>
            <radialGradient id="vw-mala-halo"><stop offset="0" stop-color="rgba(255,190,90,.22)"/><stop offset="1" stop-color="rgba(255,190,90,0)"/></radialGradient>
          </defs>
          <circle cx="220" cy="220" r="214" fill="url(#vw-mala-halo)"/>
          <g class="vw-beads" data-beads>
            <circle class="vw-thread" cx="220" cy="220" r="${R}"/>
            ${beads}
            <g class="vw-sumeru"><path d="M220 412 v18 M214 414 l-4 20 M226 414 l4 20 M220 414 v22" /><circle cx="220" cy="${220 + R + 12}" r="9"/></g>
          </g>
          <path class="vw-finger" d="M220 27 l-9 -15 h18 z"/>
        </svg>
        <button type="button" class="vw-mala-btn" data-count>
          <span class="vw-mala-k" data-mk>${esc(pick(UI.tapChant))}</span>
          <strong data-n>00</strong>
          <span class="vw-mala-of" data-mof>${esc(pick(UI.of11))}</span>
          <span class="vw-mala-name deva" lang="hi" data-mname></span>
        </button>
      </div>
      <div class="vw-mala-foot">
        <p role="status" data-mstatus></p>
        <button type="button" class="vw-icon-btn" data-reset ${ta(['aria-label', UI.resetMala])}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10a6 6 0 1 0 2-4.5M4 3v3h3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      </div>
      <div class="vw-mala-continue" data-mcontinue hidden>${cta(UI.continueJapa, 'japa')}</div>
    </div>
  </div>
  <div class="vw-wrap">${offers('japa', s.offerings, { shot: 'japa' })}</div>
  </section>`;
}

function vratHTML() {
  const s = S.vrat;
  return `<section id="space-vrat" data-space="vrat" class="vw-space vw-vrat" aria-labelledby="h-vrat">
  <div class="vw-wrap vw-grid">
    ${head(s, 4)}
    <div class="vw-a-art vw-vrat-stage" data-reveal>
      <div class="vw-frame">${`<img src="${art('vrat')}" ${ta(['alt', ALT.vrat])} loading="lazy" decoding="async" data-parallax="0.06">`}</div>
      <button type="button" class="vw-big-diya" aria-pressed="false" data-diya ${ta(['aria-label', UI.lightDiya])}>
        <svg viewBox="0 0 140 120" aria-hidden="true">
          <defs>
            <radialGradient id="vw-halo" cx="50%" cy="42%" r="50%"><stop offset="0" stop-color="rgba(255,214,120,.75)"/><stop offset=".45" stop-color="rgba(255,170,70,.25)"/><stop offset="1" stop-color="rgba(255,150,50,0)"/></radialGradient>
            <linearGradient id="vw-clay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c8743a"/><stop offset=".6" stop-color="#8e4320"/><stop offset="1" stop-color="#4f220f"/></linearGradient>
            <linearGradient id="vw-flame" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff8a1f"/><stop offset=".55" stop-color="#ffcc6b"/><stop offset="1" stop-color="#fff6d8"/></linearGradient>
          </defs>
          <circle class="vw-halo" cx="70" cy="48" r="58" fill="url(#vw-halo)"/>
          <path class="vw-flame" d="M70 18c7 10 11 18 0 33-11-15-7-23 0-33z" fill="url(#vw-flame)"/>
          <path class="vw-wick" d="M70 52v8" stroke="#2b1a10" stroke-width="2.4" stroke-linecap="round"/>
          <path d="M18 62h104c-4 22-24 36-52 36S22 84 18 62z" fill="url(#vw-clay)"/>
          <path d="M14 62h112" stroke="#e39a5c" stroke-width="3" stroke-linecap="round"/>
          <ellipse cx="70" cy="104" rx="30" ry="4" fill="rgba(0,0,0,.35)"/>
        </svg>
        <span class="vw-diya-label">${t(UI.lightDiya)}</span>
      </button>
      <p class="vw-diya-cap" aria-live="polite" data-diya-cap></p>
    </div>
    <div class="vw-a-body">
      <ol class="vw-obs" data-obs data-reveal></ol>
      ${t(UI.calNote, 'p', 'class="vw-note"')}
      ${offers('vrat', s.offerings, { shot: 'vrat' })}
      ${cta(UI.ctaVrat, 'vrat')}
    </div>
  </div></section>`;
}

function balHTML() {
  const s = S['bal-gopal'];
  const kids = OFF['kids-stories'];
  return `<section id="space-bal-gopal" data-space="bal-gopal" class="vw-space vw-bal" aria-labelledby="h-bal-gopal">
  <div class="vw-wrap vw-grid">
    ${head(s, 5)}
    <div class="vw-a-art vw-shrine" data-reveal>${niche('bal-gopal')}${deity(s.deity)}</div>
    <div class="vw-a-body">
      <div class="vw-comic" data-reveal>
        ${t(UI.comicK, 'p', 'class="kicker"')}
        ${t(UI.comicT, 'h3', 'class="vw-sub display"')}
        <div class="vw-comic-track" data-comic role="region" aria-roledescription="carousel" tabindex="0" ${ta(['aria-label', UI.comicLabel])}>
          ${[1, 2, 3].map((n) => `<figure class="vw-comic-page" role="group" aria-roledescription="slide"><img src="${img(`comic-${n}.webp`)}" ${ta(['alt', [`Ramayana comic, Bālakāṇḍa, page ${n} of 3`, `रामायण कॉमिक, बालकाण्ड, पृष्ठ ${n} / 3`]])} loading="lazy" decoding="async"></figure>`).join('')}
        </div>
        <div class="vw-pager">${arrowBtn('prev', UI.prevPage, 'data-prev')}<span class="vw-pager-n" data-page aria-live="polite">1 / 3</span>${arrowBtn('next', UI.nextPage, 'data-next')}</div>
      </div>
    </div>
  </div>
  <div class="vw-wrap vw-stories-wrap" data-reveal>
    ${t(UI.storiesK, 'p', 'class="kicker"')}
    <ul class="vw-stories">${STORIES.map(([id, en, hi]) => `
      <li class="vw-story" data-story>
        <div class="vw-story-in">
          <button type="button" class="vw-story-front" aria-expanded="false" aria-controls="story-${id}">
            <img src="${img(`${id}.webp`)}" alt="" loading="lazy" decoding="async" width="416" height="520">
            <span class="vw-story-t">${t([en, hi])}</span>
          </button>
          <div class="vw-story-back" id="story-${id}" inert>
            <p class="vw-story-bt display" lang="en">${esc(en)}</p>
            <p class="vw-story-bh deva" lang="hi">${esc(hi)}</p>
            ${t([kids.description, kids.descriptionHi], 'p', 'class="vw-story-d"')}
            <button type="button" class="vw-cta vw-cta--sm" data-get="story-${id}">${t(UI.readInApp)}${ARROW}</button>
            <button type="button" class="vw-link" data-flipback>${t(UI.turnBack)}</button>
          </div>
        </div>
      </li>`).join('')}
    </ul>
  </div>
  <div class="vw-wrap">${offers('bal-gopal', s.offerings, { shot: 'bal-gopal' })}${cta(UI.ctaBal, 'bal-gopal')}</div>
  </section>`;
}

function navaHTML() {
  const s = S.navagraha;
  const byEn = Object.fromEntries(s.grahas.map((g, i) => [g[0], { pair: g, order: i }]));
  return `<section id="space-navagraha" data-space="navagraha" class="vw-space vw-nava" aria-labelledby="h-navagraha">
  ${banner('navagraha')}
  <div class="vw-wrap vw-grid vw-grid--text-first">
    ${head(s, 6)}
    <div class="vw-a-body">
      <p class="vw-graha-cap" data-gcap aria-live="polite">${t(UI.grahaPrompt)}</p>
      ${offers('navagraha', s.offerings, { shot: 'navagraha' })}
      ${cta(UI.ctaNava, 'navagraha')}
    </div>
    <div class="vw-a-art vw-grahas" data-grahas role="group" ${ta(['aria-label', UI.grahasLabel])}>
      ${GRAHA_GRID.map((en) => { const g = byEn[en]; return `<button type="button" class="vw-graha" style="--cloth:${GRAHA_STYLE[en]};--seat:${en === 'Ketu' ? 'url(#vw-ketu-g)' : GRAHA_STYLE[en]}" data-order="${g.order}" aria-pressed="false" aria-label="${esc(g.pair[0])} · ${esc(g.pair[1])}">
        <span class="vw-graha-niche" aria-hidden="true"><span class="vw-graha-cloth" data-seat="${en}"></span><span class="vw-graha-diya">${DIYA}</span></span>
        <span class="vw-graha-name" aria-hidden="true"><span lang="en">${esc(g.pair[0])}</span><span lang="hi" class="deva">${esc(g.pair[1])}</span></span>
      </button>`; }).join('')}
    </div>
  </div></section>`;
}

function yatraHTML() {
  const s = S.yatra;
  return `<section id="space-yatra" data-space="yatra" class="vw-space vw-yatra" aria-labelledby="h-yatra">
  ${banner('theerth')}
  <div class="vw-wrap">${head(s, 7)}</div>
  <div class="vw-wrap" data-reveal>
    ${t(UI.templesK, 'p', 'class="kicker"')}
    <ul class="vw-temples">${TEMPLES.map(([id, en, hi, stEn, stHi, dEn, dHi]) => `
      <li class="vw-temple">
        <button type="button" class="vw-temple-btn" aria-expanded="false" aria-controls="temple-${id}">
          <span class="vw-temple-img"><img src="${img(`theerth-${id}.webp`)}" alt="" loading="lazy" decoding="async" width="560" height="560"></span>
          <span class="vw-temple-name">${t([en, hi])}</span>
          <span class="vw-temple-state">${t([stEn, stHi])}</span>
        </button>
        ${t([dEn, dHi], 'p', `class="vw-temple-story" id="temple-${id}"`)}
      </li>`).join('')}
    </ul>
  </div>
  <div class="vw-wrap vw-share-slot" data-extras="share" hidden></div>
  <div class="vw-wrap">${offers('yatra', s.offerings, { shot: 'yatra' })}${cta(UI.ctaYatra, 'yatra')}</div>
  </section>`;
}

// Filled by extras.js once the page is idle.
const faqHTML = () => '<section id="space-faq" class="vw-space vw-faq" aria-labelledby="h-faq" data-extras="faq" hidden></section>';

function sanctumHTML() {
  const s = S.garbhagriha;
  return `<section id="space-garbhagriha" data-space="garbhagriha" class="vw-space vw-sanctum" aria-labelledby="h-garbhagriha">
  <div class="vw-sanctum-light" aria-hidden="true"></div>
  <div class="vw-wrap vw-sanctum-in">
    <div class="vw-shrine" data-reveal>${niche('garbhagriha', { cls: 'vw-niche--sanctum', parallax: 0.04 })}</div>
    <div class="vw-sanctum-copy" data-reveal>
      ${head(s, 8)}
      <div class="vw-install">
        <img class="vw-app-icon" src="${img('icon.webp')}" alt="" width="72" height="72" loading="lazy">
        ${storeButtons({ from: 'sanctum', size: 'lg' })}
      </div>
      ${t(TRUST, 'p', 'class="vc-trust vw-trust"')}
      <figure class="vw-qr"><img src="${img('get-qr.svg')}" width="120" height="120" loading="lazy" ${ta(['alt', UI.qrAlt])}>${t(UI.scan, 'figcaption')}</figure>
      <p class="vw-visits" data-visits hidden></p>
    </div>
  </div>
  <footer class="vw-foot">
    <span>© ${new Date().getFullYear()} Vedansh</span>
    <a href="https://vedansh.app/privacy/">${t(UI.privacy)}</a>
    <a href="https://vedansh.app/terms/">${t(UI.terms)}</a>
    <a href="https://vedansh.app/support/">${t(UI.support)}</a>
    <a href="${classicHref()}" data-classic data-track="switch-classic">${t(UI.classic)}</a>
    <nav class="vw-social" aria-label="${esc(UI.social[0])} · ${esc(UI.social[1])}">
      <a data-track="social-instagram" href="https://www.instagram.com/vedansh.app/" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".6"/></svg>Instagram</a>
      <a data-track="social-facebook" href="https://www.facebook.com/profile.php?id=61594970420675" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M15 8.5h-1.5a2 2 0 0 0-2 2V20.5M9 13h5.5"/></svg>Facebook</a>
      <a data-track="social-youtube" href="https://www.youtube.com/shorts/mrDun5TXJEU" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="5.5" width="19" height="13" rx="3.5"/><path d="M10.2 9.4v5.2l4.4-2.6z"/></svg>${t(UI.youtube)}</a>
    </nav>
  </footer>
  </section>`;
}

/* ---------- wiring ---------- */
function wireGanesha(root) {
  const sec = root.querySelector('#space-ganesha');
  const box = sec.querySelector('[data-curtain]');
  const cord = sec.querySelector('.vw-cord');
  const bless = sec.querySelector('.vw-blessing');
  const petals = sec.querySelector('.vw-petals');
  const open = () => box.classList.add('is-open');
  if (reducedMotion()) open();
  else {
    // phones: open as it rises into view
    const small = matchMedia('(max-width: 899px)').matches;
    let timer = 0;
    new IntersectionObserver(([e]) => {
      clearTimeout(timer);
      if (e.isIntersecting) timer = setTimeout(open, small ? 120 : 450);
    }, { threshold: small ? 0.2 : 0.55 }).observe(box);
  }
  const shower = () => {
    if (reducedMotion()) return;
    // A quiet handful of petals on the deity, not a shower.
    petals.innerHTML = [[14, 0.2, 5.8, 30, 18], [32, 1.1, 6.6, 150, -14], [50, 0.6, 6.2, 260, 22], [66, 1.6, 7, 90, -18], [82, 0.9, 6.4, 330, 12], [42, 2.2, 7.2, 200, 16]]
      .map(([x, w, d, r, s]) => `<i style="--x:${x}%;--w:${w}s;--d:${d}s;--r:${r}deg;--s:${s}px"></i>`).join('');
    setTimeout(() => { petals.innerHTML = ''; }, 9800);
  };
  const pull = () => {
    cord.classList.remove('is-pulled'); void cord.offsetWidth; cord.classList.add('is-pulled');
    if (!box.classList.contains('is-open')) { open(); return; }
    chime({ base: 523, gain: 0.07, decay: 2.6 });
    bless.innerHTML = '<span lang="hi" class="deva">॥ श्री गणेशाय नमः ॥</span><span lang="en">Shri Ganeshaya Namah</span>';
    bless.classList.remove('is-on'); void bless.offsetWidth; bless.classList.add('is-on');
    shower();
  };
  let y0 = null, pulled = false;
  cord.addEventListener('pointerdown', (e) => { y0 = e.clientY; pulled = false; cord.setPointerCapture(e.pointerId); });
  cord.addEventListener('pointermove', (e) => {
    if (y0 === null) return;
    const d = clamp(e.clientY - y0, 0, 60);
    cord.style.setProperty('--pull', `${d}px`);
    if (d >= 38 && !pulled) { pulled = true; pull(); }
  });
  const end = () => { y0 = null; cord.style.removeProperty('--pull'); };
  cord.addEventListener('pointerup', end);
  cord.addEventListener('pointercancel', end);
  cord.addEventListener('click', () => { if (pulled) { pulled = false; return; } pull(); });

  /* Today card */
  const sel = sec.querySelector('[data-city]');
  const out = (k) => sec.querySelector(`[data-k="${k}"]`);
  const strip = sec.querySelector('[data-cg]');
  const nextEl = sec.querySelector('[data-next-sank]');
  const renderToday = () => {
    const now = Date.now();
    const day = dayPlan(now, +sel.value);
    const L = getLang();
    const name = (k) => pick([CG[k][0], CG[k][1]], L);
    const rahu = day.parts.find((x) => x.rahu);
    out('rise').textContent = hm(day.s.rise);
    out('set').textContent = hm(day.s.set);
    out('now').textContent = day.cur >= 0 ? name(day.parts[day.cur].key) : pick(UI.afterSunset);
    out('rahu').textContent = `${hm(rahu.at)} – ${hm(rahu.at + day.len)}`;
    strip.innerHTML = day.parts.map((x, i) => `<li class="vw-cg-${CG[x.key][2]}${day.cur === i ? ' is-now' : ''}${x.rahu ? ' is-rahu' : ''}"${day.cur === i ? ' aria-current="time"' : ''}>
      <b>${esc(name(x.key))}</b><span>${hm(x.at)}</span>${x.rahu ? `<em>${esc(pick(['Rahu', 'राहु'], L))}</em>` : ''}</li>`).join('');
    const sank = upcoming().find((o) => o.id.startsWith('sankashti'));
    nextEl.innerHTML = sank
      ? `<span class="vw-next-k">${esc(pick(UI.nextSank))}</span><span class="vw-next-d">${esc(fmtDate(sank.date))}</span><span class="vw-rel">${esc(pick(relDays(dayNum(sank.date) - istToday())))}</span>`
      : '';
  };
  sel.addEventListener('change', renderToday);
  renderToday();
  setInterval(renderToday, 60000);
  return renderToday;
}

function snapTrack(track, items, { onChange, prev, next }) {
  let idx = -1;
  let pending = false; // a button asked for an item; ignore scroll-derived updates while it glides there
  let settle = 0;
  const set = (i) => { if (i !== idx) { idx = i; onChange(i); } };
  const leftFor = (it) => it.offsetLeft - (track.clientWidth - it.offsetWidth) / 2;
  const go = (i, smooth = true) => {
    i = clamp(i, 0, items.length - 1);
    pending = true;
    clearTimeout(settle);
    settle = setTimeout(() => { pending = false; }, 900);
    track.scrollTo({ left: leftFor(items[i]), behavior: smooth && !reducedMotion() ? 'smooth' : 'auto' });
    set(i);
  };
  let raf = 0;
  track.addEventListener('scroll', () => {
    if (raf || pending) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const max = track.scrollWidth - track.clientWidth;
      if (track.scrollLeft <= 2) return set(0);
      if (track.scrollLeft >= max - 2) return set(items.length - 1);
      const mid = track.scrollLeft + track.clientWidth / 2;
      let best = 0, bestD = Infinity;
      items.forEach((it, i) => { const d = Math.abs(it.offsetLeft + it.offsetWidth / 2 - mid); if (d < bestD) { bestD = d; best = i; } });
      set(best);
    });
  }, { passive: true });
  if (prev) prev.addEventListener('click', () => go(idx - 1));
  if (next) next.addEventListener('click', () => go(idx + 1));
  set(0);
  return { go, get index() { return idx; } };
}

function wireGranth(root) {
  const sec = root.querySelector('#space-granth');
  const track = sec.querySelector('[data-alcoves]');
  const alcoves = [...track.querySelectorAll('.vw-alcove')];
  const tabs = [...sec.querySelectorAll('.vw-tab')];
  const prev = sec.querySelector('.vw-alcove-nav [data-prev]');
  const next = sec.querySelector('.vw-alcove-nav [data-next]');
  const ctl = snapTrack(track, alcoves, {
    prev, next,
    onChange: (i) => {
      alcoves.forEach((a, j) => a.classList.toggle('is-active', i === j));
      tabs.forEach((b, j) => b.setAttribute('aria-current', String(i === j)));
      prev.disabled = i === 0;
      next.disabled = i === alcoves.length - 1;
    },
  });
  tabs.forEach((b) => b.addEventListener('click', () => ctl.go(+b.dataset.go)));
  track.addEventListener('keydown', (e) => {
    if (e.target.closest('.vw-shelf')) return;
    if (e.key === 'ArrowRight') { ctl.go(ctl.index + 1); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { ctl.go(ctl.index - 1); e.preventDefault(); }
  });
  const setAlcove = (id) => { const i = alcoves.findIndex((a) => a.dataset.alcove === id); if (i >= 0) ctl.go(i, false); };
  window.addEventListener('vedansh:alcove', (e) => setAlcove(e.detail && e.detail.id));
  addEventListener('resize', () => ctl.go(ctl.index, false));

  /* Krishna: feeling → shloka */
  const kr = alcoves[0];
  const vOut = kr.querySelector('[data-verse-out]');
  const feels = [...kr.querySelectorAll('[data-verse]')];
  let verseId = null;
  const renderVerse = () => {
    if (!verseId) return;
    const v = content.preview.gita.find((g) => g.id === verseId);
    const L = getLang();
    vOut.innerHTML = `<blockquote class="vw-sloka" lang="sa">${v.sanskrit.map((l) => `<p>${esc(l)}</p>`).join('')}</blockquote>
      <p class="vw-translit" lang="sa-Latn">${v.transliteration.map(esc).join('<br>')}</p>
      <p class="vw-meaning" lang="${L}">${esc(L === 'hi' ? v.meaningHi : v.meaningEn)}</p>
      <figcaption lang="${L}">${esc(pick([`Bhagavad Gita ${v.chapter}.${v.number}`, `भगवद्गीता ${v.chapter}.${v.number}`]))}</figcaption>`;
    vOut.classList.remove('is-in'); void vOut.offsetWidth; vOut.classList.add('is-in');
  };
  feels.forEach((b) => b.addEventListener('click', () => {
    verseId = b.dataset.verse;
    feels.forEach((f) => f.setAttribute('aria-pressed', String(f === b)));
    renderVerse();
  }));
  const gj = kr.querySelector('[data-gj]');
  const renderGJ = () => {
    const o = upcoming().find((x) => x.shrine === 'krishna');
    gj.innerHTML = o ? `<span class="vw-next-k">${esc(pick([o.en, o.hi]))}</span><span class="vw-next-d">${esc(fmtDate(o.date))}</span><span class="vw-rel">${esc(pick(relDays(dayNum(o.date) - istToday())))}</span>` : '';
  };
  renderGJ();

  /* Hanuman: the doha lights line by line */
  const doha = alcoves[1].querySelector('[data-doha]');
  const lines = [...doha.querySelectorAll('.vw-doha-line')];
  let lit = false;
  const light = () => {
    lines.forEach((l) => l.classList.remove('is-lit'));
    lines.forEach((l, i) => setTimeout(() => l.classList.add('is-lit'), reducedMotion() ? 0 : 250 + i * 1300));
  };
  if (reducedMotion()) { lines.forEach((l) => l.classList.add('is-lit')); lit = true; }
  else new IntersectionObserver(([e]) => { if (e.isIntersecting && !lit) { lit = true; light(); } }, { threshold: 0.7 }).observe(doha);
  alcoves[1].querySelector('[data-replay]').addEventListener('click', light);

  /* Saraswati: a tilting shelf */
  const shelf = alcoves[2].querySelector('[data-shelf]');
  const books = [...shelf.querySelectorAll('.vw-book')];
  const stand = alcoves[2].querySelector('[data-stand]');
  let bookId = books[0].dataset.book;
  const renderStand = () => {
    const o = OFF[bookId];
    stand.innerHTML = `<p class="vw-stand-t display" lang="${getLang()}">${esc(pick([o.en, o.hi]))}</p><p class="vw-stand-d" lang="${getLang()}">${esc(pick([o.description, o.descriptionHi]))}</p>`;
    stand.classList.remove('is-in'); void stand.offsetWidth; stand.classList.add('is-in');
  };
  const tilt = () => {
    const c = shelf.getBoundingClientRect();
    const mid = c.left + c.width / 2;
    books.forEach((b) => {
      const r = b.parentElement.getBoundingClientRect();
      const off = clamp((r.left + r.width / 2 - mid) / (c.width / 2), -1.4, 1.4);
      b.style.transform = reducedMotion() ? '' : `rotateY(${(-off * 38).toFixed(1)}deg) translateZ(${(-Math.abs(off) * 40).toFixed(0)}px)`;
      b.style.opacity = (1 - Math.min(Math.abs(off), 1) * 0.35).toFixed(2);
    });
  };
  let traf = 0;
  shelf.addEventListener('scroll', () => { if (!traf) traf = requestAnimationFrame(() => { traf = 0; tilt(); }); }, { passive: true });
  books.forEach((b, i) => {
    b.addEventListener('click', () => {
      bookId = b.dataset.book;
      books.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      const li = b.parentElement;
      shelf.scrollTo({ left: li.offsetLeft - (shelf.clientWidth - li.offsetWidth) / 2, behavior: reducedMotion() ? 'auto' : 'smooth' });
      renderStand();
    });
    b.addEventListener('keydown', (e) => {
      const j = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : -1;
      if (j >= 0 && j < books.length) { books[j].focus(); books[j].click(); e.preventDefault(); }
    });
  });
  new ResizeObserver(tilt).observe(shelf);
  renderStand();
  return () => { renderVerse(); renderGJ(); renderStand(); };
}

function wireJapa(root) {
  const sec = root.querySelector('#space-japa');
  const btn = sec.querySelector('[data-count]');
  const g = sec.querySelector('[data-beads]');
  const beads = [...sec.querySelectorAll('.vw-bead')];
  const n = sec.querySelector('[data-n]');
  const mk = sec.querySelector('[data-mk]');
  const mof = sec.querySelector('[data-mof]');
  const mname = sec.querySelector('[data-mname]');
  const status = sec.querySelector('[data-mstatus]');
  const text = sec.querySelector('[data-mtext]');
  const cont = sec.querySelector('[data-mcontinue]');
  const radios = [...sec.querySelectorAll('[data-m]')];
  const MAX = 11, STEP_DEG = 360 / 108;
  let count = 0, m = 0;
  const render = () => {
    const done = count >= MAX;
    const mantra = content.preview.mantras[m];
    beads.forEach((b, i) => { b.classList.toggle('is-on', i < count); b.classList.toggle('is-next', i === count && !done); });
    g.style.transform = `rotate(${(-count * STEP_DEG).toFixed(3)}deg)`;
    n.textContent = pad2(count);
    mk.textContent = pick(done ? UI.pause : UI.tapChant);
    mk.lang = getLang();
    mof.textContent = pick(UI.of11);
    mof.lang = getLang();
    mname.textContent = mantra.nameHi;
    btn.setAttribute('aria-label', done ? pick(UI.continueJapa) : `${pick(UI.countOne)}, ${count} / ${MAX}`);
    btn.classList.toggle('is-done', done);
    status.textContent = pick(done ? UI.malaDone : UI.malaPreview);
    status.lang = getLang();
    cont.hidden = !done;
    text.innerHTML = `<div class="deva" lang="hi">${mantra.lines.map((l) => `<p>${esc(l)}</p>`).join('')}</div>${getLang() === 'en' ? `<div class="vw-mantra-en" lang="en">${mantra.linesEn.map((l) => `<p>${esc(l)}</p>`).join('')}</div>` : ''}`;
    radios.forEach((r, i) => r.setAttribute('aria-checked', String(i === m)));
  };
  btn.addEventListener('click', () => {
    if (count >= MAX) { requestGet('japa'); return; }
    count += 1;
    btn.classList.remove('is-tick'); void btn.offsetWidth; btn.classList.add('is-tick');
    if (navigator.vibrate && matchMedia('(pointer: coarse)').matches) navigator.vibrate(8);
    render();
  });
  radios.forEach((r, i) => {
    r.addEventListener('click', () => { m = i; count = 0; render(); });
    r.addEventListener('keydown', (e) => {
      const j = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? (i + 1) % radios.length : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? (i + radios.length - 1) % radios.length : -1;
      if (j >= 0) { radios[j].focus(); radios[j].click(); e.preventDefault(); }
    });
  });
  sec.querySelector('[data-reset]').addEventListener('click', () => { count = 0; render(); });
  render();
  return render;
}

function wireVrat(root) {
  const sec = root.querySelector('#space-vrat');
  const list = sec.querySelector('[data-obs]');
  const diya = sec.querySelector('[data-diya]');
  const cap = sec.querySelector('[data-diya-cap]');
  const render = () => {
    const d0 = istToday();
    const byDate = [];
    upcoming().forEach((o) => {
      const last = byDate[byDate.length - 1];
      if (last && last.date === o.date) last.items.push(o); else byDate.push({ date: o.date, items: [o] });
    });
    list.innerHTML = byDate.slice(0, 6).map((g, i) => {
      const rel = pick(relDays(dayNum(g.date) - d0));
      return `<li class="vw-obs-item${i === 0 ? ' is-next' : ''}">
        <time datetime="${g.date}"><b>${esc(fmtDate(g.date, { day: 'numeric' }))}</b><span>${esc(fmtDate(g.date, { month: 'short' }))} · ${esc(fmtDate(g.date, { weekday: 'short' }))}</span></time>
        <span class="vw-obs-names">${g.items.map((o) => `<span class="vw-obs-n"><span lang="${getLang()}">${esc(pick([o.en, o.hi]))}</span></span>`).join('')}</span>
        <span class="vw-rel">${i === 0 ? `<em>${esc(pick(UI.next))}</em>` : ''}${esc(rel)}</span>
      </li>`;
    }).join('');
    if (diya.getAttribute('aria-pressed') === 'true') cap.textContent = pick(UI.diyaLit);
  };
  diya.addEventListener('click', () => {
    const on = diya.getAttribute('aria-pressed') !== 'true';
    diya.setAttribute('aria-pressed', String(on));
    sec.classList.toggle('is-lit', on);
    cap.textContent = on ? pick(UI.diyaLit) : '';
  });
  render();
  return render;
}

function wireBal(root) {
  const sec = root.querySelector('#space-bal-gopal');
  const track = sec.querySelector('[data-comic]');
  const pages = [...track.querySelectorAll('.vw-comic-page')];
  const label = sec.querySelector('[data-page]');
  const prev = sec.querySelector('.vw-pager [data-prev]');
  const next = sec.querySelector('.vw-pager [data-next]');
  const ctl = snapTrack(track, pages, {
    prev, next,
    onChange: (i) => {
      label.textContent = `${i + 1} / ${pages.length}`;
      pages.forEach((p, j) => p.classList.toggle('is-active', i === j));
      prev.disabled = i === 0;
      next.disabled = i === pages.length - 1;
    },
  });
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { ctl.go(ctl.index + 1); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { ctl.go(ctl.index - 1); e.preventDefault(); }
  });
  sec.querySelectorAll('[data-story]').forEach((card) => {
    const front = card.querySelector('.vw-story-front');
    const back = card.querySelector('.vw-story-back');
    const flip = (on) => {
      card.classList.toggle('is-flipped', on);
      front.setAttribute('aria-expanded', String(on));
      back.inert = !on;
      front.inert = on;
      (on ? back.querySelector('[data-get]') : front).focus({ preventScroll: true });
    };
    front.addEventListener('click', () => flip(true));
    back.querySelector('[data-flipback]').addEventListener('click', () => flip(false));
  });
  return null;
}

function wireNava(root) {
  const sec = root.querySelector('#space-navagraha');
  const grid = sec.querySelector('[data-grahas]');
  const tiles = [...grid.querySelectorAll('.vw-graha')].sort((a, b) => a.dataset.order - b.dataset.order);
  const cap = sec.querySelector('[data-gcap]');
  const grahas = S.navagraha.grahas;
  let litCount = 0, chosen = -1;
  const lightTo = (k) => {
    if (k <= litCount) return;
    litCount = k;
    tiles.forEach((tile, i) => tile.classList.toggle('is-lit', i < litCount));
  };
  const renderCap = () => {
    if (chosen < 0) return;
    const [en, hi] = grahas[chosen];
    cap.innerHTML = `<span class="vw-graha-big" lang="en">${esc(en)}</span><span class="vw-graha-big deva" lang="hi">${esc(hi)}</span>`;
    cap.style.setProperty('--cloth', GRAHA_STYLE[en]);
  };
  tiles.forEach((tile, i) => tile.addEventListener('click', () => {
    chosen = i;
    lightTo(Math.max(litCount, i + 1));
    tile.classList.add('is-lit');
    tiles.forEach((x) => x.setAttribute('aria-pressed', String(x === tile)));
    renderCap();
  }));
  const onScroll = () => {
    const r = grid.getBoundingClientRect();
    const p = clamp((innerHeight * 0.9 - r.top) / (r.height + innerHeight * 0.35), 0, 1);
    lightTo(Math.ceil(p * 9));
  };
  if (reducedMotion()) lightTo(9);
  return { relabel: () => {}, onScroll };
}

function wireYatra(root) {
  root.querySelectorAll('.vw-temple-btn').forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-expanded') !== 'true';
    b.setAttribute('aria-expanded', String(on));
    b.parentElement.classList.toggle('is-open', on);
  }));
  return null;
}

function wireSanctum(root) {
  const el = root.querySelector('[data-visits]');
  let total = null;
  const render = () => {
    if (total === null) return;
    const n = new Intl.NumberFormat(getLang() === 'hi' ? 'hi-IN' : 'en-IN').format(total);
    el.textContent = pick([`${n} visits to vedansh.app so far`, `vedansh.app पर अब तक ${n} विज़िट`]);
    el.lang = getLang();
    el.hidden = false;
  };
  // The public counter only exists on the deployed site; a local preview has no /api, so skip it there
  // (a 404 would only add console noise) unless ?hits=1 asks to exercise the failure path.
  const local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) || location.protocol === 'file:';
  if (!local || new URLSearchParams(location.search).has('hits')) {
    fetch('/api/hits?all=1', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`hits ${r.status}`))))
      .then((d) => { if (Number.isFinite(d.total) && d.total > 0) { total = d.total; render(); } })
      .catch(() => { el.hidden = true; });
  }
  return render;
}

/* ---------- reveal, parallax and the story of light ---------- */
function wireMotion(root, scrollHooks) {
  const reveals = [...root.querySelectorAll('[data-reveal]')];
  if (reducedMotion()) reveals.forEach((el) => el.classList.add('is-in'));
  else {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  }
  const para = [...root.querySelectorAll('[data-parallax]')].filter((el) => +el.dataset.parallax > 0);
  const visible = new Set();
  const pio = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target))), { rootMargin: '20% 0px' });
  para.forEach((el) => pio.observe(el));
  const body = document.body;
  let raf = 0, lastLight = -1;
  const frame = () => {
    raf = 0;
    const vh = innerHeight;
    const max = Math.max(1, document.documentElement.scrollHeight - vh);
    const light = clamp(scrollY / max, 0, 1);
    if (Math.abs(light - lastLight) > 0.001) { lastLight = light; body.style.setProperty('--light', light.toFixed(4)); }
    if (!reducedMotion()) {
      visible.forEach((el) => {
        const r = el.parentElement.getBoundingClientRect();
        const slack = r.height * 0.07; // scale(1.14) leaves 7% of overflow on each side; never show an edge
        const off = clamp((r.top + r.height / 2 - vh / 2) * -+el.dataset.parallax, -slack, slack);
        el.style.transform = `translate3d(0, ${off.toFixed(1)}px, 0) scale(1.14)`;
      });
    }
    scrollHooks.forEach((f) => f());
  };
  const queue = () => { if (!raf) raf = requestAnimationFrame(frame); };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  frame();
}

/* ---------- mount ---------- */
export function mountWalk(mainEl, { lang = 'en' } = {}) {
  setLang(lang);
  mainEl.classList.add('vw');
  mainEl.innerHTML = STEP + [ganeshaHTML(), granthHTML(), japaHTML(), vratHTML(), balHTML(), navaHTML(), yatraHTML(), faqHTML(), sanctumHTML()].join(STEP);
  const relabel = [];
  const scrollHooks = [];
  relabel.push(wireGanesha(mainEl));
  const granth = wireGranth(mainEl);
  relabel.push(granth);
  relabel.push(wireJapa(mainEl), wireVrat(mainEl));
  wireBal(mainEl);
  const nava = wireNava(mainEl);
  scrollHooks.push(nava.onScroll);
  wireYatra(mainEl);
  relabel.push(wireSanctum(mainEl));
  wireMotion(mainEl, scrollHooks);
  mainEl.addEventListener('click', (e) => {
    const b = e.target.closest('[data-get]');
    if (b) requestGet(b.dataset.get);
    const more = e.target.closest('[data-catalog]');
    if (more) openCatalog({ stop: more.dataset.catalog, from: more });
  });
  const fill = () => loadExtras().then((m) => m.mountExtras(mainEl))
    .catch((err) => console.error('[vedansh] extras.js did not load:', err));
  const idle = () => (window.requestIdleCallback || ((f) => setTimeout(f, 300)))(fill, { timeout: 2500 });
  if (document.readyState === 'complete') idle(); else addEventListener('load', idle, { once: true });
  window.addEventListener('vedansh:lang', () => relabel.forEach((f) => f && f()));
  return {
    setAlcove: (id) => window.dispatchEvent(new CustomEvent('vedansh:alcove', { detail: { id } })),
  };
}
