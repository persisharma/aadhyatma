// Persistent chrome for every temple-visit variant: the slim top bar (mark, EN/हि switch, "Get the app"),
// the lamp index (one diya per walk space) and the "Get the app" sheet. Also owns the tiny bilingual
// text binder and the bell chime that walk.js and the variant heroes share.
//
// Contract
//   mountChrome(rootEl, { lang })   renders bar + lamp index + sheet into rootEl, returns { openGet }.
//   window event 'vedansh:lang'  {lang}  switch language (anyone may dispatch; everything re-labels).
//   window event 'vedansh:get'   {from}  open the Get-the-app sheet (cancelable; chrome calls preventDefault).
//   openCatalog({ stop, focus, from })  the catalog sheet (extras.js, loaded on first use).
//   A [data-space] not in content.spaces is a stop between lamps, named by data-space-name="en|hi".
import content from './content.js';

/* ---------- bilingual text binder ---------- */
const pairs = [];
let LANG = 'en';

export const getLang = () => LANG;
/** The classic website (vedansh.app/ or /hi/) in the visitor's current language. Links carry data-classic. */
export const classicHref = () => (LANG === 'hi' ? '/hi/' : '/');
export const pick = (p, lang = LANG) => (Array.isArray(p) ? (lang === 'hi' && p[1] ? p[1] : p[0]) : (p ?? ''));
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const langOf = (p) => (LANG === 'hi' && Array.isArray(p) && p[1] ? 'hi' : 'en');

/** Register an [en, hi] pair; returns its index (for data-t / data-ta). */
export function register(pair) { return pairs.push(pair) - 1; }

/** A leaf element whose text follows the language switch. */
export function t(pair, tag = 'span', attrs = '') {
  const i = register(pair);
  return `<${tag} data-t="${i}" lang="${langOf(pair)}"${attrs ? ' ' + attrs : ''}>${esc(pick(pair))}</${tag}>`;
}

/** Attributes that follow the language switch: ta(['aria-label', pair], ['alt', pair]). */
export function ta(...entries) {
  const spec = entries.map(([name, pair]) => `${name}:${register(pair)}`).join(';');
  return `data-ta="${spec}" ` + entries.map(([name, pair]) => `${name}="${esc(pick(pair))}"`).join(' ');
}

/** Bind an existing element's text (used for static HTML in variant heroes). */
export function bindText(el, pair) {
  el.dataset.t = register(pair);
  el.textContent = pick(pair);
  el.lang = langOf(pair);
}

function apply(root = document) {
  root.querySelectorAll('[data-t]').forEach((el) => {
    const p = pairs[+el.dataset.t];
    el.textContent = pick(p);
    el.lang = langOf(p);
  });
  root.querySelectorAll('[data-ta]').forEach((el) => {
    el.dataset.ta.split(';').forEach((s) => {
      const [name, i] = s.split(':');
      el.setAttribute(name, pick(pairs[+i]));
    });
  });
}

/** Idempotent: set the language, <html lang>, and re-label every bound node. */
export function setLang(lang) {
  const next = lang === 'hi' ? 'hi' : 'en';
  const root = document.documentElement;
  if (next === LANG && root.lang === next) return false;
  LANG = next;
  root.lang = next;
  root.dataset.lang = next;
  apply(document);
  return true;
}

export const requestLang = (lang) => window.dispatchEvent(new CustomEvent('vedansh:lang', { detail: { lang } }));
// Registered at import time, so it runs before any listener a page adds later.
window.addEventListener('vedansh:lang', (e) => setLang(e.detail && e.detail.lang));
// After setLang above, so classic-site links read the new language.
window.addEventListener('vedansh:lang', () => document.querySelectorAll('a[data-classic]').forEach((a) => { a.href = classicHref(); }));

/** A store link through the site's /get/ download link: the tap counts on /stats/ under source "mandir",
    Google Play gets the tags as its install referrer, and `store` keeps the store the visitor chose. */
export const getHref = (store, from = '') => `/get/?utm_source=mandir&utm_medium=${encodeURIComponent(from || 'site')}&store=${store}`;

/** Ask the chrome to open the Get-the-app sheet; falls back to the store when no chrome is mounted. */
export function requestGet(from = '') {
  const ev = new CustomEvent('vedansh:get', { detail: { from }, cancelable: true });
  if (window.dispatchEvent(ev)) {
    const ios = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent) && 'ontouchend' in document;
    window.open(getHref(ios ? 'ios' : 'android', from), '_blank', 'noopener');
  }
}

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** The live site's reassurance (App.jsx). */
export const TRUST = ['Free · No ads · No account needed', 'निःशुल्क · विज्ञापन रहित · खाता आवश्यक नहीं'];

/* ---------- extras.js: catalog sheet, FAQ, card maker; never on the first screen ---------- */
let extras = null;
export const loadExtras = () => (extras = extras || import('./extras.js'));
export function openCatalog(opts = {}) {
  return loadExtras().then((m) => m.openCatalog(opts))
    .catch((err) => { extras = null; console.error('[vedansh] the catalog could not load:', err); });
}

/* ---------- bell chime (Web Audio, only ever on a user gesture) ---------- */
let audio;
export function chime({ base = 392, gain = 0.11, decay = 3.4 } = {}) {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return; // no Web Audio: the bell still swings, silently
  audio = audio || new Ctx();
  if (audio.state === 'suspended') audio.resume();
  const now = audio.currentTime;
  const out = audio.createGain();
  out.gain.value = gain;
  out.connect(audio.destination);
  // Inharmonic partials of a cast-brass temple bell.
  [[0.5, 0.55, 1.3], [1, 1, 1], [1.19, 0.55, 0.8], [1.56, 0.42, 0.62], [2, 0.32, 0.5], [2.51, 0.22, 0.42], [2.66, 0.18, 0.36], [3.01, 0.12, 0.3]]
    .forEach(([ratio, amp, d]) => {
      const o = audio.createOscillator();
      const g = audio.createGain();
      o.type = 'sine';
      o.frequency.value = base * ratio;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(amp, now + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, now + decay * d);
      o.connect(g).connect(out);
      o.start(now);
      o.stop(now + decay * d + 0.05);
    });
}

/* ---------- store buttons + icons ---------- */
const PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true" class="vc-store-ico"><path fill="#34A853" d="M1.34.92a1.49 1.49 0 0 0-.11.57v21.02c0 .22.04.42.12.6l11.15-11.09z"/><path fill="#FBBC04" d="m22.02 13.3-3.92 2.22-3.52-3.5 3.55-3.52 3.89 2.2a1.49 1.49 0 0 1 0 2.6z"/><path fill="#4285F4" d="M13.54 10.99 16.8 7.75 3.45.2a1.47 1.47 0 0 0-.95-.18z"/><path fill="#EA4335" d="m13.54 13.06-11 10.93c.3.04.61-.02.91-.18l13.32-7.54z"/></svg>';
const APPLE = '<svg viewBox="0 0 24 24" aria-hidden="true" class="vc-store-ico"><path fill="currentColor" d="M12.15 6.9c-.95 0-2.42-1.08-3.96-1.04-2.04.03-3.91 1.18-4.96 3.01-2.12 3.68-.55 9.1 1.52 12.09 1.01 1.45 2.2 3.09 3.79 3.04 1.52-.07 2.09-.99 3.94-.99 1.83 0 2.35.99 3.96.95 1.64-.03 2.68-1.48 3.68-2.95 1.15-1.69 1.63-3.32 1.66-3.41-.04-.02-3.18-1.22-3.22-4.86-.03-3.04 2.48-4.49 2.6-4.56-1.43-2.09-3.63-2.32-4.39-2.38-2-.15-3.68 1.09-4.62 1.09zm3.38-3.07c.84-1.01 1.4-2.43 1.25-3.83-1.21.05-2.66.8-3.53 1.82-.78.9-1.46 2.34-1.27 3.71 1.34.1 2.71-.69 3.55-1.7"/></svg>';
export const ARROW = '<svg viewBox="0 0 16 16" aria-hidden="true" class="vc-arrow"><path d="M4 12 12 4M6 4h6v6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const SEARCH = '<svg viewBox="0 0 20 20" aria-hidden="true" class="vc-search-ico" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="8.6" cy="8.6" r="5.6"/><path d="m12.8 12.8 4.4 4.4"/></svg>';
export const DIYA = '<svg viewBox="0 0 32 32" aria-hidden="true" class="vc-diya"><ellipse class="vc-diya-glow" cx="16" cy="12" rx="9" ry="10"/><path class="vc-diya-flame" d="M16 3.5c2.6 3.6 3.6 6.2 0 10.4-3.6-4.2-2.6-6.8 0-10.4z"/><path class="vc-diya-bowl" d="M4 16.5h24c-1.1 5.6-5.6 8.6-12 8.6S5.1 22.1 4 16.5z"/><path class="vc-diya-lip" d="M3 16.5h26"/></svg>';

const UI = {
  getApp: ['Get the app', 'ऐप पाएँ'],
  search: ['Search the app’s 42 offerings', 'ऐप की 42 सुविधाएँ खोजें'],
  searchShort: ['Search', 'खोजें'],
  langLabel: ['Language', 'भाषा'],
  sheetTitle: ['Take the temple home', 'मन्दिर को घर ले जाएँ'],
  sheetLine: ['Free on Android and iPhone, in Hindi and English.', 'Android और iPhone पर निःशुल्क, हिन्दी और अंग्रेज़ी में।'],
  scan: ['Scan with your phone camera to install', 'इंस्टॉल करने के लिए फ़ोन के कैमरे से स्कैन करें'],
  close: ['Close', 'बंद करें'],
  lamps: ['Your walk through the temple', 'मन्दिर में आपकी यात्रा'],
  top: ['Vedansh, back to the gate', 'वेदांश, द्वार पर वापस'],
  playTop: ['Get it on', 'इसे पाएँ'],
  appleTop: ['Download on the', 'डाउनलोड करें'],
  lit: ['visited', 'देख लिया'],
  here: ['you are here', 'आप यहाँ हैं'],
  qrAlt: ['QR code that opens the Vedansh download page', 'वेदांश डाउनलोड पेज खोलने वाला QR कोड'],
};

export function storeButtons({ from = '', size = '' } = {}) {
  return `<div class="vc-stores${size ? ' vc-stores--' + size : ''}" data-from="${esc(from)}">
    <a class="vc-store" href="${esc(getHref('android', from))}" target="_blank" rel="noopener" data-store="android">${PLAY}<span class="vc-store-txt">${t(UI.playTop, 'small')}<b>Google Play</b></span></a>
    <a class="vc-store" href="${esc(getHref('ios', from))}" target="_blank" rel="noopener" data-store="ios">${APPLE}<span class="vc-store-txt">${t(UI.appleTop, 'small')}<b>App Store</b></span></a>
  </div>`;
}

export const asset = (path) => new URL(path, import.meta.url).href;

/* ---------- mount ---------- */
export function mountChrome(rootEl, { lang = 'en' } = {}) {
  setLang(lang);
  const spaces = content.spaces;
  rootEl.classList.add('vc');
  rootEl.innerHTML = `
    <header class="vc-bar">
      <a class="vc-mark" href="#space-gate" ${ta(['aria-label', UI.top])}>
        <img src="${asset('./img/icon.webp')}" alt="" width="30" height="30">
        <span class="vc-name">Vedansh</span><span class="vc-name-hi" lang="hi">वेदांश</span>
      </a>
      <div class="vc-actions">
        <button type="button" class="vc-search" aria-haspopup="dialog" data-track="catalog-open" ${ta(['aria-label', UI.search])}>${SEARCH}${t(UI.searchShort, 'span', 'class="vc-search-t" aria-hidden="true"')}</button>
        <div class="vc-lang" role="group" ${ta(['aria-label', UI.langLabel])}>
          <button type="button" data-lang="en" lang="en" aria-label="English">EN</button>
          <button type="button" data-lang="hi" lang="hi" aria-label="हिन्दी">हि</button>
        </div>
        <button type="button" class="vc-get" aria-haspopup="dialog">${t(UI.getApp)}</button>
      </div>
    </header>
    <nav class="vc-lamps" ${ta(['aria-label', UI.lamps])}>
      <p class="vc-here" aria-hidden="true"><span class="vc-here-n"></span><span class="vc-here-t"></span></p>
      <ol>${spaces.map((s, i) => `
        <li><a class="vc-lamp" href="#space-${s.id}" data-for="${s.id}" style="--i:${i}">
          ${DIYA}<span class="vc-lamp-label">${t([s.en, s.hi])}</span><span class="sr-only vc-lamp-state"></span>
        </a></li>`).join('')}
      </ol>
    </nav>
    <dialog class="vc-sheet" ${ta(['aria-label', UI.sheetTitle])}>
      <div class="vc-sheet-in">
        <button type="button" class="vc-close" ${ta(['aria-label', UI.close])}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3l10 10M13 3 3 13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button>
        <img class="vc-sheet-icon" src="${asset('./img/icon.webp')}" alt="" width="64" height="64">
        ${t(UI.sheetTitle, 'h2', 'class="vc-sheet-title display"')}
        ${t(UI.sheetLine, 'p', 'class="vc-sheet-line"')}
        ${storeButtons({ from: 'sheet', size: 'stack' })}
        <figure class="vc-qr">
          <img src="${asset('./img/get-qr.svg')}" width="132" height="132" loading="lazy" ${ta(['alt', UI.qrAlt])}>
          ${t(UI.scan, 'figcaption')}
        </figure>
      </div>
    </dialog>`;

  /* language switch */
  const langBtns = [...rootEl.querySelectorAll('.vc-lang button')];
  const paintLang = () => langBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === LANG)));
  langBtns.forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.lang === LANG) return;
    requestLang(b.dataset.lang);
    const url = new URL(location.href);
    url.searchParams.set('lang', b.dataset.lang);
    history.replaceState(history.state, '', url);
  }));
  window.addEventListener('vedansh:lang', paintLang);
  paintLang();

  /* search: the catalog sheet */
  const searchBtn = rootEl.querySelector('.vc-search');
  searchBtn.addEventListener('click', () => openCatalog({ focus: 'search', from: searchBtn }));
  searchBtn.addEventListener('pointerenter', loadExtras, { once: true });

  /* get-the-app sheet */
  const sheet = rootEl.querySelector('.vc-sheet');
  const getBtn = rootEl.querySelector('.vc-get');
  const openGet = () => { if (!sheet.open) sheet.showModal(); };
  getBtn.addEventListener('click', openGet);
  rootEl.querySelector('.vc-close').addEventListener('click', () => sheet.close());
  sheet.addEventListener('click', (e) => { if (e.target === sheet) sheet.close(); });
  window.addEventListener('vedansh:get', (e) => { e.preventDefault(); openGet(); });

  /* lamp index: current + visited, by scroll position */
  const lamps = new Map([...rootEl.querySelectorAll('.vc-lamp')].map((a) => [a.dataset.for, a]));
  const nav = rootEl.querySelector('.vc-lamps');
  const bar = rootEl.querySelector('.vc-bar');
  const visited = new Set();
  const hereN = rootEl.querySelector('.vc-here-n');
  const hereT = rootEl.querySelector('.vc-here-t');
  const order = spaces.map((s) => s.id);
  let current = null;
  let frame = 0;
  const update = () => {
    frame = 0;
    const line = innerHeight * 0.42;
    let cur = null, curEl = null;
    document.querySelectorAll('[data-space]').forEach((el) => {
      if (el.getBoundingClientRect().top <= line) { cur = el.dataset.space; curEl = el; }
    });
    cur = cur || 'gate';
    if (cur !== current) {
      current = cur;
      visited.add(cur);
      const sp = spaces.find((s) => s.id === cur);
      lamps.forEach((a, id) => {
        const on = id === cur;
        a.classList.toggle('is-lit', visited.has(id));
        a.classList.toggle('is-here', on);
        if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
        a.querySelector('.vc-lamp-state').textContent = on ? `, ${pick(UI.here)}` : visited.has(id) ? `, ${pick(UI.lit)}` : '';
      });
      hereN.textContent = sp ? String(order.indexOf(cur) + 1).padStart(2, '0') : '';
      hereT.textContent = pick(sp ? [sp.en, sp.hi] : (curEl?.dataset.spaceName || '').split('|'));
      hereT.lang = LANG;
      nav.classList.remove('is-telling');
      void nav.offsetWidth;
      nav.classList.add('is-telling');
    }
    const past = scrollY > innerHeight * 0.6;
    nav.classList.toggle('is-shown', past);
    bar.classList.toggle('is-solid', scrollY > 24);
  };
  const queue = () => { if (!frame) frame = requestAnimationFrame(update); };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  window.addEventListener('vedansh:lang', () => { current = null; queue(); });
  update();

  lamps.forEach((a, id) => a.addEventListener('click', (e) => {
    const target = document.getElementById(`space-${id}`);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(history.state, '', `#space-${id}`);
  }));
  rootEl.querySelector('.vc-mark').addEventListener('click', (e) => {
    e.preventDefault();
    scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' });
  });

  return { openGet };
}
