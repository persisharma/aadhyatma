// Lazy extras for the shared temple walk (V1, V2, V4), never part of the first screen: chrome.js loads this module
// when the search button is first used, walk.js once the page is idle after load. Ported from the live site
// (website/app/src/App.jsx: catalog, search, FAQ; Showcase.jsx: ShareMaker); the data comes from content.js and the
// generated content-more.js, both built from the live site's own files by build-content.mjs.
//
// Contract
//   mountExtras(walkRoot)        fills the walk's placeholders: the app screens (figure.vw-phone[data-shot]), the
//                                navagraha seats ([data-seat]), "share" (the verse-card maker in Yatra & parivar) and
//                                "faq" (Before you begin). Idempotent.
//   openCatalog({ stop, focus, from })  opens the catalog sheet: search, category chips and all 42 offerings. `stop`
//                                (a shrine or alcove id: 'ganesha', 'saraswati', 'yatra', ...) filters it to that stop's
//                                offerings; focus 'search' puts the cursor in the search box, otherwise the sheet's title
//                                has focus; focus returns to `from` (default: the focused element) when it closes.
import content from './content.js';
import more from './content-more.js';
import { t, ta, esc, pick, getLang, reducedMotion, asset, ARROW } from './chrome.js';

/* ---------- styles first: nothing here is shown unstyled ---------- */
const cssReady = new Promise((resolve, reject) => {
  const link = Object.assign(document.createElement('link'), { rel: 'stylesheet', href: asset('./extras.css') });
  link.onload = resolve;
  link.onerror = () => reject(new Error('extras.css did not load'));
  document.head.appendChild(link);
});

const UI = {
  kicker: ['One app. Many ways to connect.', 'एक ऐप। भक्ति के अनेक मार्ग।'],
  title: ['Explore the app', 'ऐप की सुविधाएँ जानें'],
  close: ['Close', 'बंद करें'],
  search: ['Search app offerings', 'ऐप की सुविधाएँ खोजें'],
  placeholder: ['Find a text, mantra, or practice…', 'पाठ, मन्त्र या साधना खोजें…'],
  clear: ['Clear search', 'खोज मिटाएँ'],
  filter: ['Filter offerings', 'सुविधाएँ चुनें'],
  showAll: ['Show all', 'सभी देखें'],
  goto: ['See it in the temple', 'मन्दिर में देखें'],
  app: ['Get it in the app', 'ऐप में पाएँ'],
  emptyT: ['A different word might help', 'कोई दूसरा शब्द आज़माएँ'],
  emptyD: ['Try “Gita”, “japa”, “puja”, “Kundali” or browse all offerings.', '“गीता”, “जप”, “पूजा”, “कुंडली” खोजें या सभी सुविधाएँ देखें।'],
  emptyB: ['Explore all offerings', 'सभी सुविधाएँ देखें'],
  faqK: ['A few things you might wonder', 'कुछ सामान्य प्रश्न'],
  faqT: ['Before you begin', 'शुरू करने से पहले'],
  shareK: ['Share', 'भेजिए'],
  shareT: ['Send a verse to someone you love.', 'किसी अपने को एक श्लोक भेजिए।'],
  shareD: ['Any verse becomes a card for WhatsApp or Instagram. Try one here; the app also makes cards for muhurats and kundali matches.', 'कोई भी श्लोक WhatsApp या Instagram के लिए कार्ड बन जाता है। यहाँ आज़माकर देखिए; ऐप में मुहूर्त और कुंडली मिलान के कार्ड भी बनते हैं।'],
  verse: ['Verse', 'श्लोक'],
  format: ['Format', 'आकार'],
  post: ['4:5 post', '4:5 पोस्ट'],
  story: ['9:16 story', '9:16 स्टोरी'],
  make: ['Make your own card in the app', 'अपना कार्ड ऐप में बनाएँ'],
};
const count = (n) => [`${n} ${n === 1 ? 'offering' : 'offerings'}`, `${n} ${n === 1 ? 'सुविधा' : 'सुविधाएँ'}`];
const appLink = (id) => `https://vedansh.app/get/?utm_source=mandir&utm_medium=catalog&utm_content=${encodeURIComponent(id)}`;
const X = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
const LENS = '<svg viewBox="0 0 20 20" aria-hidden="true" class="vx-lens"><circle cx="8.6" cy="8.6" r="5.6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="m12.8 12.8 4.4 4.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
const DOWN = '<svg viewBox="0 0 16 16" aria-hidden="true" class="vx-down"><path d="M8 3v9.5M4 9l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/* ---------- the catalog: every offering, and where the temple features it ---------- */
const OFFERINGS = Object.values(content.offerings);
const GROUPS = content.groups.slice(1);              // [id, en, hi, icon]; the first row is 'all'
const STOPS = {};                                    // stop id -> { space, alcove, name, ids }
content.spaces.forEach((sp) => {
  if (sp.offerings && sp.offerings.length) STOPS[sp.id] = { space: sp.id, name: [sp.en, sp.hi], ids: sp.offerings };
  (sp.alcoves || []).forEach((a) => {
    STOPS[a.id] = { space: sp.id, alcove: a.id, name: [`${a.deity[0]}, ${sp.en}`, `${a.deity[1]}, ${sp.hi}`], ids: a.offerings };
  });
});
const HOME = {};                                     // offering id -> stop id
Object.entries(STOPS).forEach(([stop, s]) => s.ids.forEach((id) => { HOME[id] = stop; }));
const placeOf = (id) => { const s = STOPS[HOME[id]]; const sp = content.spaces.find((x) => x.id === s.space); return [sp.en, sp.hi]; };

const state = { group: 'all', query: '', stop: null };
let openedStop = null;
let sheet = null;
let els = null;
let opener = null;
let returnFocus = true;

function buildSheet() {
  sheet = document.createElement('dialog');
  sheet.className = 'vx-cat';
  sheet.setAttribute('aria-labelledby', 'vx-cat-title');
  sheet.innerHTML = `<div class="vx-cat-in">
    <header class="vx-cat-head">
      <div class="vx-cat-top">
        <div>${t(UI.kicker, 'p', 'class="kicker vx-cat-k"')}${t(UI.title, 'h2', 'class="display vx-cat-title" id="vx-cat-title" tabindex="-1"')}</div>
        <button type="button" class="vx-close" data-track="catalog-close" ${ta(['aria-label', UI.close])}>${X}</button>
      </div>
      <form class="vx-search" role="search">
        ${LENS}
        <input type="search" name="q" autocomplete="off" enterkeyhint="search" spellcheck="false" data-track="catalog-search" ${ta(['aria-label', UI.search], ['placeholder', UI.placeholder])}>
        <button type="button" class="vx-clear" data-track="catalog-clear-search" hidden ${ta(['aria-label', UI.clear])}>${X}</button>
      </form>
      <div class="vx-chips vx-cat-chips" role="group" ${ta(['aria-label', UI.filter])}></div>
    </header>
    <div class="vx-cat-body">
      <div class="vx-statusbar"><p class="vx-status" role="status"></p><button type="button" class="vw-link vx-showall" data-track="catalog-show-all" hidden>${t(UI.showAll)}</button></div>
      <div class="vx-results"></div>
    </div>
  </div>`;
  document.body.appendChild(sheet);
  els = {
    title: sheet.querySelector('.vx-cat-title'), input: sheet.querySelector('input'), clear: sheet.querySelector('.vx-clear'),
    chips: sheet.querySelector('.vx-cat-chips'), status: sheet.querySelector('.vx-status'), showAll: sheet.querySelector('.vx-showall'),
    results: sheet.querySelector('.vx-results'), body: sheet.querySelector('.vx-cat-body'),
  };
  sheet.querySelector('.vx-close').addEventListener('click', () => sheet.close());
  // Escape always closes (a search box would otherwise spend the first Escape clearing itself).
  sheet.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); sheet.close(); } });
  sheet.querySelector('form').addEventListener('submit', (e) => e.preventDefault());
  els.input.addEventListener('input', () => { state.query = els.input.value; state.group = 'all'; state.stop = null; render(); });
  els.clear.addEventListener('click', () => { els.input.value = ''; state.query = ''; render(); els.input.focus(); });
  const showAll = () => { els.input.value = ''; Object.assign(state, { query: '', group: 'all', stop: null }); render(); };
  els.showAll.addEventListener('click', showAll);
  sheet.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-group], [data-stop]');
    if (chip) {
      els.input.value = '';
      Object.assign(state, { query: '', group: chip.dataset.group || 'all', stop: chip.dataset.stop || null });
      render();
      return;
    }
    const go = e.target.closest('[data-goto]');
    if (go) { goto(go.dataset.goto); return; }
    if (e.target.closest('[data-empty-all]')) showAll();
  });
  sheet.addEventListener('close', () => {
    document.documentElement.classList.remove('vx-lock');
    if (returnFocus && opener && opener.isConnected) opener.focus({ preventScroll: true });
  });
  window.addEventListener('vedansh:lang', () => { if (sheet.open) render(); });
}

function matches(o) {
  if (state.stop) { if (!STOPS[state.stop].ids.includes(o.id)) return false; }
  else if (state.group !== 'all' && o.group !== state.group) return false;
  const q = state.query.trim().toLocaleLowerCase();
  return !q || `${o.en} ${o.hi} ${o.description} ${o.descriptionHi}`.toLocaleLowerCase().includes(q);
}

function render() {
  const L = getLang();
  const p = (pair) => esc(pick(pair, L));
  const lang = `lang="${L}"`;
  const total = (g) => OFFERINGS.filter((o) => o.group === g).length;
  const chip = (attrs, on, label, n, track) =>
    `<button type="button" class="vx-chip" ${attrs} aria-pressed="${on}" data-track="${track}"><span ${lang}>${label}</span><span class="vx-n">${n}</span></button>`;
  els.chips.innerHTML =
    (openedStop ? chip(`data-stop="${openedStop}"`, state.stop === openedStop, p(STOPS[openedStop].name), STOPS[openedStop].ids.length, `catalog-filter-shrine-${openedStop}`) : '')
    + chip('data-group="all"', !state.stop && state.group === 'all', p(content.groups[0].slice(1, 3)), OFFERINGS.length, 'catalog-filter-all')
    + GROUPS.map(([id, en, hi]) => chip(`data-group="${id}"`, !state.stop && state.group === id, p([en, hi]), total(id), `catalog-filter-${id}`)).join('');

  const hits = OFFERINGS.filter(matches);
  const q = state.query.trim();
  const scope = q ? `“${q}”` : state.stop ? pick(STOPS[state.stop].name, L) : state.group !== 'all' ? pick(GROUPS.find((g) => g[0] === state.group).slice(1, 3), L) : '';
  els.status.textContent = pick(count(hits.length), L) + (scope ? ` · ${scope}` : '');
  els.status.lang = L;
  els.showAll.hidden = !scope;
  els.clear.hidden = !q;

  els.results.innerHTML = hits.length ? GROUPS.map(([gid, en, hi]) => {
    const items = hits.filter((o) => o.group === gid);
    if (!items.length) return '';
    return `<section class="vx-group" aria-labelledby="vx-g-${gid}">
      <h3 class="vx-group-t" id="vx-g-${gid}"><span ${lang}>${p([en, hi])}</span><span class="vx-n">${items.length}</span></h3>
      <ul class="vx-items">${items.map((o) => `<li class="vx-item">
        <h4 class="vx-item-t" id="vx-o-${o.id}" ${lang}>${p([o.en, o.hi])}</h4>
        <p class="vx-where" ${lang}>${p(placeOf(o.id))}</p>
        <p class="vx-item-d" ${lang}>${p([o.description, o.descriptionHi])}</p>
        <div class="vx-acts">
          <button type="button" class="vx-goto" data-goto="${o.id}" data-track="catalog-goto-${o.id}" aria-describedby="vx-o-${o.id}"><span ${lang}>${p(UI.goto)}</span>${DOWN}</button>
          <a class="vx-app" href="${appLink(o.id)}" target="_blank" rel="noopener noreferrer" data-track="catalog-app-${o.id}" aria-describedby="vx-o-${o.id}"><span ${lang}>${p(UI.app)}</span>${ARROW}</a>
        </div>
      </li>`).join('')}</ul>
    </section>`;
  }).join('') : `<div class="vx-empty">
      <p class="vx-empty-t display" ${lang}>${p(UI.emptyT)}</p>
      <p ${lang}>${p(UI.emptyD)}</p>
      <button type="button" class="vx-chip" data-empty-all data-track="catalog-empty-all"><span ${lang}>${p(UI.emptyB)}</span></button>
    </div>`;
}

/** Close the sheet and walk to the shrine that features this offering (its alcove, in the Granth mandap). */
function goto(id) {
  const stop = STOPS[HOME[id]];
  const sec = stop && document.getElementById(`space-${stop.space}`);
  returnFocus = !sec;
  sheet.close();
  if (!sec) return;
  if (stop.alcove) window.dispatchEvent(new CustomEvent('vedansh:alcove', { detail: { id: stop.alcove } }));
  history.replaceState(history.state, '', `#space-${stop.space}`);
  // Land on the offering itself when the shrine shows it (the alcove switch renders first);
  // an offering kept behind "+N more" falls back to the shrine's heading.
  setTimeout(() => {
    const item = [...sec.querySelectorAll(`[data-offering="${id}"]`)].find((el) => el.offsetParent !== null);
    const behavior = reducedMotion() ? 'auto' : 'smooth';
    if (item) {
      item.scrollIntoView({ behavior, block: 'center' });
      item.classList.add('is-found');
      setTimeout(() => item.classList.remove('is-found'), 2600);
      const t = item.querySelector('h3, h4, h2') || item;
      t.tabIndex = -1; t.focus({ preventScroll: true });
      return;
    }
    sec.scrollIntoView({ behavior, block: 'start' });
    const h = sec.querySelector('h2');
    if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); }
  }, stop.alcove ? 80 : 0);
}

export async function openCatalog({ stop = null, focus, from } = {}) {
  await cssReady;
  if (!sheet) buildSheet();
  if (sheet.open) return;
  openedStop = stop && STOPS[stop] ? stop : null;
  Object.assign(state, { group: 'all', query: '', stop: openedStop });
  els.input.value = '';
  render();
  opener = from || document.activeElement;
  returnFocus = true;
  sheet.showModal();
  document.documentElement.classList.add('vx-lock');
  els.body.scrollTop = 0;
  ((focus || (openedStop ? 'title' : 'search')) === 'search' ? els.input : els.title).focus();
}

// One real app screen per shrine, in the slim phone frame next to its "Inside the app" list (walk.js's empty
// figure.vw-phone[data-shot]). Each loads only as it comes near: native lazy-loading reaches ~2,000px ahead, which
// is still the first load on pages whose walk starts one screen down (V2).
const SHOTS = {
  ganesha: ['panchang', ['The Panchang screen in the Vedansh app: today’s date, the running choghadiya, Rahu Kaal and Abhijit timings, Find a Muhurat, tithi and nakshatra', 'वेदांश ऐप की पंचांग स्क्रीन: आज की तिथि, चल रहा चौघड़िया, राहु काल और अभिजित का समय, मुहूर्त खोजें, तिथि और नक्षत्र']],
  granth: ['reader', ['The Bhagavad Gita reader in the Vedansh app: a shloka from chapter 2 in transliteration, with its English meaning', 'वेदांश ऐप में भगवद्गीता पाठक: अध्याय 2 का एक श्लोक लिप्यंतरण में, अंग्रेज़ी अर्थ के साथ']],
  japa: ['sadhana', ['The japa mala in the Vedansh app: the Gayatri mantra above a 108-bead counter at 21', 'वेदांश ऐप में जप माला: गायत्री मन्त्र के नीचे 108 मनकों की गिनती, 21 पर']],
  vrat: ['vrat', ['The Vrat & Parv screen in the Vedansh app: today’s vrat with its katha, My Vrat, Pitru Smaran and the upcoming days', 'वेदांश ऐप की व्रत और पर्व स्क्रीन: आज का व्रत और उसकी कथा, मेरे व्रत, पितृ स्मरण और आने वाले दिन']],
  'bal-gopal': ['kids', ['Illustrated Krishna stories for ages 6 and up in the Vedansh app: The Birth of Krishna, Krishna and Putana, Krishna and Kaliya Nag', 'वेदांश ऐप में 6 वर्ष से ऊपर के बच्चों के लिए कृष्ण की चित्र कथाएँ: कृष्ण जन्म, कृष्ण और पूतना, कृष्ण और कालिया नाग']],
  navagraha: ['jyotish', ['Guna Milan in the Vedansh app: a match of 33 out of 36, marked Excellent, with every koota scored', 'वेदांश ऐप में गुण मिलान: 36 में से 33 गुण, उत्तम, हर कूट के अंकों के साथ']],
  yatra: ['theerth', ['The Dvadasha Jyotirlinga yatra in the Vedansh app: a map of India with each temple pinned, above the list of temples', 'वेदांश ऐप में द्वादश ज्योतिर्लिंग यात्रा: भारत का मानचित्र, हर मन्दिर चिह्नित, नीचे मन्दिरों की सूची']],
};
// The app screens follow the page language: Hindi screenshots on a Hindi page (as on the live site).
const shotSrc = (img) => (document.documentElement.lang === 'hi' ? img.dataset.srcHi : img.dataset.src);
function fillShots(root) {
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.src = shotSrc(e.target);
    io.unobserve(e.target);
  }), { rootMargin: '500px 0px' });
  window.addEventListener('vedansh:lang', () => setTimeout(() => root.querySelectorAll('.vw-phone-frame img[src]').forEach((img) => { img.src = shotSrc(img); }), 0));
  root.querySelectorAll('.vw-phone[data-shot]').forEach((fig) => {
    const id = fig.dataset.shot;
    const [file, alt] = SHOTS[id];
    fig.innerHTML = `<button type="button" class="vw-phone-btn" data-get="app-shot-${id}" data-track="app-shot-${id}" aria-haspopup="dialog">
      <span class="vw-phone-frame"><img data-src="${asset(`./img/app/app-${file}.webp`)}" data-src-hi="${asset(`./img/app/hi/app-${file}.webp`)}" ${ta(['alt', alt])} width="900" height="1956" loading="lazy" decoding="async"></span></button>`;
    io.observe(fig.querySelector('img'));
  });
}

// Each graha's seat in the navagraha mandala, drawn in its colour (--seat, set by walk.js) on its cloth
// (span.vw-graha-cloth[data-seat]); viewBox 0 0 48 32, .l = a line.
const GRAHA_SEAT = {
  Surya: '<circle cx="24" cy="17" r="12"/>',                                              // circle
  Chandra: '<rect x="13" y="6" width="22" height="22" rx="1"/>',                          // square
  Mangal: '<path d="M24 4 38 29H10z"/>',                                                  // triangle
  Budh: '<path d="M24 3l10 11h-6v15h-8V14h-6z"/>',                                        // arrow
  Guru: '<rect x="7" y="10" width="34" height="15" rx="1"/>',                             // rectangle
  Shukra: '<path d="M24 4 36.4 13 31.6 27.5H16.4L11.6 13z"/>',                            // pentagon
  Shani: '<path d="M31 3Q3 16 31 29Q15 16 31 3z"/><path class="l" d="M31 3v26"/>',          // bow
  Rahu: '<path d="M10 29 6 11q18-9 36 0l-4 18z"/><path class="l" d="M10 16q14-5 28 0M11 21q13-4 26 0M12 26h24"/>', // winnowing basket
  Ketu: '<path class="l" d="M14 3v27"/><path d="M15.5 4.5 39 10.5l-23.5 7z"/>',            // flag
};
const KETU_FILL = '<defs><linearGradient id="vw-ketu-g" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#c2381d"/><stop offset=".38" stop-color="#e2b13c"/><stop offset=".7" stop-color="#2f6b4f"/><stop offset="1" stop-color="#3b5bb0"/></linearGradient></defs>';
const seatSVG = (en) => `<svg class="vw-graha-seat" viewBox="0 0 48 32" aria-hidden="true">${en === 'Ketu' ? KETU_FILL : ''}${GRAHA_SEAT[en]}</svg>`;
const fillSeats = (root) => root.querySelectorAll('[data-seat]').forEach((el) => { el.innerHTML = seatSVG(el.dataset.seat); });

/* ---------- Before you begin (the live site's FAQ) ---------- */
const faqHTML = () => `<div class="vw-wrap">
  <header class="vw-head vx-faq-head">
    ${t(UI.faqK, 'p', 'class="kicker"')}
    ${t(UI.faqT, 'h2', 'class="vw-title display" id="h-faq"')}
  </header>
  <div class="vx-faq-list">${more.faqs.map((f, i) => `
    <details class="vx-faq">
      <summary data-track="faq-${i + 1}">${t([f.q, f.qHi], 'span', 'class="vx-faq-q"')}<span class="vx-faq-ico" aria-hidden="true"></span></summary>
      ${t([f.a, f.aHi], 'p', 'class="vx-faq-a"')}
    </details>`).join('')}
  </div>
</div>`;

/* ---------- the verse-card maker (the live site's ShareMaker) ---------- */
const VERSES = more.shareVerses;
// The card's source line in Hindi (the catalog carries it in English only).
const SRC_HI = { 'gita-2-47': 'श्रीमद्भगवद्गीता २.४७', ramcharitmanas: 'रामचरितमानस · बालकाण्ड', 'hanuman-chalisa': 'हनुमान चालीसा · दोहा' };
const shareHTML = () => `<div class="vx-share">
  <div class="vx-share-copy">
    ${t(UI.shareK, 'p', 'class="kicker"')}
    ${t(UI.shareT, 'h3', 'class="vw-sub display" id="h-share"')}
    ${t(UI.shareD, 'p', 'class="vx-share-d"')}
    <div class="vx-chips vx-chips--wrap" role="group" ${ta(['aria-label', UI.verse])}>
      ${VERSES.map((v, i) => `<button type="button" class="vx-chip" aria-pressed="${i === 0}" data-verse="${i}" data-track="share-verse-${v.id}">${t([v.en, v.hi])}</button>`).join('')}
    </div>
    <div class="vx-chips vx-chips--wrap" role="group" ${ta(['aria-label', UI.format])}>
      <button type="button" class="vx-chip" aria-pressed="true" data-format="post" data-track="share-format-post">${t(UI.post)}</button>
      <button type="button" class="vx-chip" aria-pressed="false" data-format="story" data-track="share-format-story">${t(UI.story)}</button>
    </div>
    <button type="button" class="vw-cta" data-get="share" data-track="install-share" aria-haspopup="dialog">${t(UI.make)}${ARROW}</button>
  </div>
  <div class="vx-share-stage">
    <figure class="vx-card" data-card>
      <img class="vx-card-bg" alt="" width="720" height="720" loading="lazy" decoding="async">
      <div class="vx-card-in" aria-live="polite">
        <p class="vx-card-verse" lang="sa"></p>
        <p class="vx-card-meaning" lang="en"></p>
        <figcaption class="vx-card-src" lang="en"></figcaption>
      </div>
      <span class="vx-card-brand" aria-hidden="true"><img src="${asset('./img/icon.webp')}" alt="" width="20" height="20" loading="lazy">Vedansh</span>
    </figure>
  </div>
</div>`;

function wireShare(el) {
  let v = 0;
  let story = false;
  const card = el.querySelector('[data-card]');
  const bg = card.querySelector('.vx-card-bg');
  const verse = card.querySelector('.vx-card-verse');
  const meaning = card.querySelector('.vx-card-meaning');
  const src = card.querySelector('.vx-card-src');
  const render = () => {
    const x = VERSES[v];
    bg.src = asset(`./img/share/${x.bg}.webp`);
    verse.innerHTML = x.text.split('\n').map(esc).join('<br>');
    meaning.textContent = x.meaning;
    meaning.hidden = getLang() === 'hi'; // as on the live site: the Hindi page shows the verse alone
    src.textContent = getLang() === 'hi' ? SRC_HI[x.id] || x.src : x.src;
    src.lang = getLang() === 'hi' && SRC_HI[x.id] ? 'hi' : 'en';
    card.classList.toggle('is-story', story);
    el.querySelectorAll('[data-verse]').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.verse === v)));
    el.querySelectorAll('[data-format]').forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.format === 'story') === story)));
  };
  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-verse], [data-format]');
    if (!b) return;
    if (b.dataset.verse) v = +b.dataset.verse; else story = b.dataset.format === 'story';
    render();
  });
  window.addEventListener('vedansh:lang', render);
  render();
}

let mounted = false;
export async function mountExtras(root) {
  if (mounted) return;
  mounted = true;
  await cssReady;
  fillShots(root);
  fillSeats(root);
  const share = root.querySelector('[data-extras="share"]');
  if (share) { share.innerHTML = shareHTML(); wireShare(share); share.hidden = false; }
  const faq = root.querySelector('[data-extras="faq"]');
  if (faq) {
    faq.innerHTML = faqHTML();
    faq.dataset.space = 'faq'; // a named stop for the lamp strip (chrome.js), between the last lamp and the sanctum
    faq.dataset.spaceName = `${UI.faqT[0]}|${UI.faqT[1]}`;
    faq.hidden = false;
  }
}
