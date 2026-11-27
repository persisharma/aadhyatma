// V4 · V1's story into V2's delight. Outside: the painted gate, its 3D doors and swinging bell (V1). The walk-in
// goes through the doorway down the lamp-lit corridor into the sanctum's gold glow; the glow then condenses into
// the sanctum light of V2's WebGL shrine scene, which rises out of it as an ordinary full-screen section.
// three.js is fetched at idle after first paint and the scene is built when the doors open. Wherever V2 would fall
// back (no WebGL, Save-Data, low memory, slow link, reduced motion, ?still), V1's CSS-3D circle takes the scene's place.
import content from '../shared/content.js';
import { mountChrome, bindText, pick, getLang, classicHref, storeButtons, chime, reducedMotion, TRUST } from '../shared/chrome.js';
import { mountWalk } from '../shared/walk.js';

const $ = (sel, root = document) => root.querySelector(sel);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (x) => x * x * (3 - 2 * x);
const lerp = (a, b, t) => a + (b - a) * t;
const params = new URLSearchParams(location.search);
const LANG0 = params.get('lang') === 'hi' ? 'hi' : 'en';
const SPACE = Object.fromEntries(content.spaces.map((s) => [s.id, s]));
const ALCOVE = Object.fromEntries(SPACE.granth.alcoves.map((a) => [a.id, a]));
const SHARED_ART = new URL('../shared/art/', import.meta.url).href;
const PANEL_ART = new URL('./img/panel-', import.meta.url).href;

/* =================================================================== 1 · the gate (V1) */
// The doorway, toran and bell are placed in the painting's pixels in v4.css; index.html fits the painting.
// [x across the toran 0..1, delay s, fall s, start angle, sideways drift px]
const PETALS = [[0.08, 0.5, 6.4, 20, 26], [0.22, 1.4, 7.2, 140, -18], [0.37, 0.9, 6.8, 300, 34], [0.55, 2.1, 7.6, 80, -30], [0.68, 0.2, 6.2, 210, 22], [0.83, 1.7, 7, 320, -24], [0.94, 2.6, 7.8, 170, 16]];

const [promiseEn, subEn] = SPACE.gate.line[0].split(': ');
const [promiseHi, subHi] = SPACE.gate.line[1].split(': ');
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const HERO = {
  kicker: SPACE.gate.title,
  promise: [`${promiseEn}.`, `${promiseHi}।`],
  sub: [cap(subEn), subHi],
  hint: ['Ring the bell, or scroll to enter', 'घंटी बजाएँ, या नीचे चलकर भीतर आएँ'],
  walkIn: ['Walk in', 'भीतर चलें'],
  bell: ['Ring the temple bell and open the doors', 'मन्दिर की घंटी बजाएँ और द्वार खोलें'],
  skip: ['Skip to the temple', 'सीधे मन्दिर में'],
  trust: TRUST,
  classic: ['Prefer the classic website?', 'पुरानी वेबसाइट पसंद है?'],
};

mountChrome($('#chrome'), { lang: LANG0 });
document.querySelectorAll('a[data-classic]').forEach((a) => { a.href = classicHref(); });

/* Visit counter, as the classic pages count (script.js): one POST per browser session, a read after that.
   Only the live address counts; the prototype server has no /api/hits, and a failed fetch changes nothing. */
if (location.pathname === '/mandir/') {
  let counted = false;
  try { counted = sessionStorage.getItem('vedansh-hit') === '1'; } catch { /* private mode */ }
  const src = (params.get('utm_source') || '').toLowerCase();
  fetch(`/api/hits?p=%2Fmandir%2F${!counted && src ? `&src=${encodeURIComponent(src)}` : ''}`, { method: counted ? 'GET' : 'POST', cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => { if (d && typeof d.total === 'number') try { sessionStorage.setItem('vedansh-hit', '1'); } catch { /* ignore */ } })
    .catch(() => {});
}
const isStatic = () => document.documentElement.classList.contains('v4-static');
const track = $('.v4-track');
const stage = $('.v4-stage');
const worlds = [...document.querySelectorAll('.v4-world')];   // the painting, and the doors drawn above the words
const doorsWorld = $('.v4-world--doors');
const copy = $('.v4-copy');
const glowEl = $('.v4-glow');
const scrim = $('.v4-scrim');
const bell = $('.v4-bell');
const hintBtn = $('.v4-hint-btn');
document.querySelectorAll('[data-i18n]').forEach((el) => bindText(el, HERO[el.dataset.i18n]));
bindText($('.v4-skip'), HERO.skip);
$('[data-stores]').innerHTML = storeButtons({ from: 'hero' });

const parts = { toran: $('.v4-toran') };
let geo = null;
function layoutGate() {
  const g = window.v4PlaceGate(); // defined inline in index.html so the gate is fitted before first paint
  // `door`: the scale at which the doorway covers the screen; the corridor walk goes on to `deep`.
  const door = Math.max(g.W / g.dw, g.H / g.dh) * 1.12;
  geo = { W: g.W, H: g.H, dcx: g.dcx, dcy: g.dcy, door, deep: door * 2.6, tx: g.W / 2 - g.dcx, ty: g.H / 2 - g.dcy };
  worlds.forEach((w) => { w.style.transformOrigin = `${g.dcx}px ${g.dcy}px`; });
}

let opened = false;
function loadLazy(root = document) {
  root.querySelectorAll('img[data-src]').forEach((img) => {
    if (img.src) return;
    img.addEventListener('load', () => img.classList.add('is-loaded'), { once: true });
    img.src = img.dataset.src;
  });
}
// After the load event, when the browser is idle: below-the-fold work never competes with the first screen.
function whenIdle(fn) {
  const go = () => requestAnimationFrame(() => setTimeout(() => (window.requestIdleCallback || ((f) => setTimeout(f, 1)))(fn, { timeout: 1500 }), 0));
  if (document.readyState === 'complete') go(); else addEventListener('load', go, { once: true });
}
function openDoors({ defer = false } = {}) {
  if (opened) return;
  opened = true;
  doorsWorld.classList.add('is-open');
  bindText($('[data-i18n="hint"]'), HERO.walkIn);
  const load = () => { loadLazy(stage); startScene(); };
  if (defer) whenIdle(load); else load();
  if (!reducedMotion()) {
    // A quiet handful of marigold petals loosens from the toran as the doors move.
    const box = $('.v4-petals');
    const t = parts.toran.getBoundingClientRect();
    const st = stage.getBoundingClientRect();
    box.innerHTML = PETALS.map(([fx, delay, dur, rot, drift]) => `<i style="left:${(t.left - st.left + fx * t.width).toFixed(0)}px;top:${(t.top - st.top + t.height * 0.45).toFixed(0)}px;--d:${dur}s;--w:${delay}s;--r:${rot}deg;--x:${drift}px"></i>`).join('');
    setTimeout(() => { box.innerHTML = ''; }, 9500);
  }
}
function ringBell() {
  bell.classList.remove('is-idle', 'is-ringing');
  void bell.offsetWidth;
  bell.classList.add('is-ringing');
  chime({ base: 330, gain: 0.12, decay: 3.8 });
  setTimeout(openDoors, reducedMotion() ? 0 : 280);
}
let pulled = false, y0 = null;
bell.addEventListener('pointerdown', (e) => { y0 = e.clientY; pulled = false; bell.setPointerCapture(e.pointerId); });
bell.addEventListener('pointermove', (e) => {
  if (y0 === null) return;
  const d = clamp(e.clientY - y0, 0, 40);
  bell.style.setProperty('--pull', `${d}px`);
  if (d >= 26 && !pulled) { pulled = true; ringBell(); }
});
const release = () => { y0 = null; bell.style.removeProperty('--pull'); };
bell.addEventListener('pointerup', release);
bell.addEventListener('pointercancel', release);
bell.addEventListener('click', () => { if (pulled) { pulled = false; return; } ringBell(); });
hintBtn.addEventListener('click', () => { if (!opened) ringBell(); else walkIn(); });
function walkIn() {
  scrollTo({ top: sceneEl.getBoundingClientRect().top + scrollY, behavior: isStatic() ? 'auto' : 'smooth' });
}

/* ---- the walk-in. Pinned (the last 50svh of the 150svh track): up to the doorway (A), down the corridor (B) while
   the fixed gold glow rises to fully opaque. Then, over one screen, the gate scrolls away and the scene rises beneath
   the glow; the glow condenses onto the scene's live sanctum point (C) and lifts (D) as the scene settles. ---- */
let cover = 1;          // how hidden the scene is (1 = fully, 0 = clear)
let revealedOnce = false;
function frameGate() {
  if (!geo) return;
  if (isStatic()) { worlds.forEach((w) => { w.style.transform = ''; }); cover = 0; glowEl.style.visibility = 'hidden'; sceneVisibility(); return; }
  const vh = stage.clientHeight;
  const pinned = track.offsetHeight - vh;
  const y = -track.getBoundingClientRect().top;
  const p = pinned > 0 ? clamp(y / pinned, 0, 1) : 0;   // the pinned walk-in
  const r = clamp((y - pinned) / vh, 0, 1);            // the scene rising: its top goes from one screen down to 0
  if (!opened && p > 0.004) openDoors();
  const a = clamp((p - 0.02) / 0.48, 0, 1);              // A: up the steps to the doorway
  const b = clamp((p - 0.5) / 0.5, 0, 1);               // B: down the corridor toward the sanctum
  const k = a < 1 ? 1 + (geo.door - 1) * Math.pow(a, 2.1) : geo.door * Math.pow(geo.deep / geo.door, smooth(b));
  const e = smooth(a);
  // At rest (top, or once the gate has gone) the worlds carry no transform at all, so they stay plain paint.
  const walking = p > 0.001 && p < 0.999;
  const tf = walking ? `translate(${(geo.tx * e).toFixed(1)}px, ${(geo.ty * e).toFixed(1)}px) scale(${k.toFixed(4)})` : '';
  worlds.forEach((w) => { w.style.transform = tf; });
  stage.classList.toggle('is-walking', walking);
  const co = 1 - clamp(p / 0.12, 0, 1);
  copy.style.opacity = co.toFixed(3);
  copy.style.transform = `translateY(${(-p * 200).toFixed(1)}px)`;
  copy.style.visibility = co <= 0.001 ? 'hidden' : '';
  scrim.style.opacity = co.toFixed(3);
  stage.style.setProperty('--unmask', (1 - co).toFixed(3));
  // The gate itself goes quietly once the glow covers it, so nothing of it is drawn while it scrolls away.
  const so = 1 - smooth(clamp((p - 0.9) / 0.1, 0, 1));
  stage.style.opacity = so.toFixed(3);
  stage.style.visibility = so <= 0.001 ? 'hidden' : '';
  const g = smooth(clamp((p - 0.45) / 0.5, 0, 1));    // rises over the corridor, fully opaque by the end of the pin
  const c = smooth(clamp((r - 0.08) / 0.6, 0, 1));     // C: condenses onto the sanctum as the scene rises
  const f = smooth(clamp((r - 0.68) / 0.32, 0, 1));    // D: lifts as the scene settles
  const op = g * (1 - f);
  glowEl.style.opacity = op.toFixed(3);
  glowEl.style.visibility = op <= 0.001 ? 'hidden' : 'visible'; // the stylesheet hides it by default
  if (op > 0.001) {
    const target = c > 0 ? sanctumTarget() : { x: geo.W / 2, y: geo.H / 2 };
    glowEl.style.setProperty('--gx', `${lerp(geo.W / 2, target.x, c).toFixed(1)}px`);
    glowEl.style.setProperty('--gy', `${lerp(geo.H / 2, target.y, c).toFixed(1)}px`);
    glowEl.style.setProperty('--gr', `${lerp(Math.hypot(geo.W, geo.H) * 0.9, Math.min(geo.W, geo.H) * 0.34, c).toFixed(1)}px`);
    glowEl.style.setProperty('--ga', (1 - 0.5 * c).toFixed(3));
  }
  cover = r <= 0 ? 1 : c < 0.001 ? op : op * (1 - 0.5 * c);
  if (f > 0 && !revealedOnce) { revealedOnce = true; onReveal(); }
  sceneVisibility();
}
// Where the scene's sanctum light is on screen right now (the scene is still rising into place beneath the gate).
function sanctumTarget() {
  const hr = sceneEl.getBoundingClientRect();
  if (scene && mode === '3d' && scene.stats.frames > 0) {
    const pt = scene.sanctumPoint();
    if (Number.isFinite(pt.x) && Number.isFinite(pt.y)) return { x: hr.left + pt.x, y: hr.top + pt.y };
  }
  const sr = stageBox.getBoundingClientRect();
  return { x: sr.left + sr.width / 2, y: sr.top + sr.height * 0.12 };
}

/* =================================================================== 2 · inside: the shrine scene (V2) */
const sceneEl = $('#shrines');
const stageBox = $('.scene__stage', sceneEl);
const q = (sel) => sceneEl.querySelector(sel);
const DEFS = [
  { id: 'ganesha', space: 'ganesha', short: ['Ganesha', 'गणेश'] },
  { id: 'krishna', space: 'granth', alcove: 'krishna', short: ['Krishna', 'कृष्ण'] },
  { id: 'hanuman', space: 'granth', alcove: 'hanuman', short: ['Hanuman', 'हनुमान'] },
  { id: 'saraswati', space: 'granth', alcove: 'saraswati', short: ['Saraswati', 'सरस्वती'] },
  { id: 'bal-gopal', space: 'bal-gopal', short: ['Bal Gopal', 'बाल गोपाल'] },
  { id: 'navagraha', space: 'navagraha', short: ['Navagraha', 'नवग्रह'], name: ['Navagraha', 'नवग्रह'] },
  // focus: horizontal centre of the crop for 3:2 paintings shown in a 2:3 arch (theerth's shikhara sits left of centre)
  { id: 'theerth', space: 'yatra', short: ['Theerth', 'तीर्थ'], name: ['Theerth yatra', 'तीर्थ यात्रा'], focus: 0.4 },
];
const SHRINES = DEFS.map((d) => {
  const sp = SPACE[d.space];
  const al = d.alcove ? ALCOVE[d.alcove] : null;
  return {
    ...d,
    art: al ? al.art : d.id === 'theerth' ? 'theerth' : sp.art,
    name: d.name || (al ? al.deity : sp.deity),
    act: al ? al.act : sp.act,
    offerings: (al ? al.offerings : sp.offerings).map((id) => content.offerings[id]).filter(Boolean),
    spaceName: [sp.en, sp.hi],
  };
});
const N = SHRINES.length;
const wrap = (i) => ((i % N) + N) % N;
const pad = (i) => String(i + 1).padStart(2, '0');
const UI = {
  shrine: ['Shrine', 'दर्शन'],
  inApp: ['In the app', 'ऐप में'],
  inside: ['Inside', 'भीतर'],
  next: ['Next shrine', 'अगला दर्शन'],
  prev: ['Previous shrine', 'पिछला दर्शन'],
  rail: ['Choose a shrine', 'दर्शन चुनें'],
  enter: ['Enter the shrine', 'मण्डप में चलें'],
  live: (s, i) => [`Shrine ${i + 1} of ${N}: ${s.name[0]}, ${s.spaceName[0]}`, `दर्शन ${i + 1} / ${N}: ${s.name[1]}, ${s.spaceName[1]}`],
  more: (n) => [`+${n} more`, `+${n} और`],
};
const els = {
  kicker: q('[data-k="s-kicker"]'), name: q('[data-k="s-name"]'), alt: q('[data-k="s-alt"]'),
  offerLabel: q('[data-k="s-offer-label"]'), offers: q('[data-k="s-offers"]'),
  actLabel: q('[data-k="s-act-label"]'), act: q('[data-k="s-act"]'),
  enter: q('[data-k="enter-link"]'), live: q('[data-k="live"]'),
  rail: q('.rail'), list: q('.rail__list'), marker: q('.rail__marker'),
  prev: q('.rail__arrow[data-dir="-1"]'), next: q('.rail__arrow[data-dir="1"]'),
  peek: q('.peek'), peekName: q('[data-k="peek-name"]'), peekImg: q('.peek__img'),
  canvas: q('.scene__canvas'), wheel: q('.ring__wheel'),
};
bindText(q('[data-k="enter"]'), UI.enter);
bindText(q('[data-k="peek-kicker"]'), UI.next);
bindText(q('[data-k="hint"]'), matchMedia('(pointer: coarse)').matches
  ? ['Swipe to turn the shrines', 'दर्शन बदलने के लिए स्वाइप करें']
  : ['Drag to turn the shrines', 'दर्शन बदलने के लिए खींचें']);
els.list.innerHTML = SHRINES.map((s, i) => `
  <li><button type="button" class="rail__item" data-i="${i}" aria-pressed="false">
    <span class="rail__num" aria-hidden="true">${pad(i)}</span><span class="rail__name"></span>
  </button></li>`).join('');
const railItems = [...els.list.querySelectorAll('.rail__item')];

// object-fit: cover crop centred on the shrine's focus (same crop as the 3D panel).
function cropPos(s, aspect) {
  const f = Math.min(1, (2 / 3) / aspect);
  const c = s.focus ?? 0.5;
  return f < 1 ? `${Math.round(((c - f / 2) / (1 - f)) * 100)}% 50%` : '50% 50%';
}

let index = 0;
let mode = 'pending';   // 'pending' (CSS circle until 3D is ready) | '3d' | 'still' (CSS circle for good)
let scene = null;

function offersText(s, lang) {
  const titles = s.offerings.map((o) => (lang === 'hi' ? o.hi : o.en));
  const shown = titles.length > 4 ? [...titles.slice(0, 3), pick(UI.more(titles.length - 3), lang)] : titles;
  return shown.join('  ·  ');
}
function fillShrine(i) {
  const s = SHRINES[i];
  const lang = getLang();
  const hi = lang === 'hi';
  els.kicker.textContent = `${pick(UI.shrine)} ${pad(i)} / ${pad(N - 1)} · ${pick(s.spaceName)}`;
  els.kicker.lang = lang;
  els.name.textContent = hi ? s.name[1] : s.name[0];
  els.name.lang = hi ? 'hi' : 'en';
  els.alt.textContent = hi ? s.name[0] : s.name[1];
  els.alt.lang = hi ? 'en' : 'hi';
  els.offerLabel.textContent = pick(UI.inApp);
  els.offerLabel.lang = lang;
  els.offers.textContent = offersText(s, lang);
  els.offers.lang = lang;
  els.actLabel.textContent = pick(UI.inside);
  els.actLabel.lang = lang;
  els.act.textContent = pick(s.act);
  els.act.lang = lang;
  els.enter.href = `#space-${s.space}`;
  const nx = SHRINES[wrap(i + 1)];
  els.peekName.textContent = pick(nx.name);
  els.peekName.lang = lang;
  els.peekImg.src = new URL(`./img/thumb-${nx.art}.webp`, import.meta.url).href;
  els.peekImg.style.objectPosition = cropPos(nx, 3 / 2);
}
let swapToken = 0;
function renderShrine(animate) {
  const lines = [els.kicker, els.name, els.alt, els.offers.parentElement, els.act.parentElement];
  if (!animate || reducedMotion()) {
    lines.forEach((el) => el.getAnimations().forEach((a) => a.cancel()));
    fillShrine(index);
    return;
  }
  const token = ++swapToken;
  const i = index;
  Promise.all(lines.map((el) => {
    el.getAnimations().forEach((a) => a.cancel());
    return el.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-10px)' }],
      { duration: 220, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' }).finished.catch(() => {});
  })).then(() => {
    if (token !== swapToken) return;
    fillShrine(i);
    lines.forEach((el, k) => el.animate([{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }],
      { duration: 760, delay: 90 + k * 70, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'both' }));
  });
}
function placeMarker() {
  const b = railItems[index];
  if (b) els.marker.style.transform = `translateX(${b.offsetLeft - els.list.scrollLeft + b.offsetWidth / 2 - 12}px)`;
}
function renderRail() {
  railItems.forEach((b, i) => {
    const on = i === index;
    b.setAttribute('aria-pressed', String(on));
    if (on) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    const n = b.querySelector('.rail__name');
    n.textContent = pick(SHRINES[i].short);
    n.lang = getLang();
  });
  placeMarker();
  const strip = els.list;
  if (strip.scrollWidth > strip.clientWidth + 2) {
    const b = railItems[index];
    strip.scrollTo({ left: b.offsetLeft - (strip.clientWidth - b.offsetWidth) / 2, behavior: reducedMotion() ? 'auto' : 'smooth' });
  }
}
function relabelScene() {
  els.rail.setAttribute('aria-label', pick(UI.rail));
  els.prev.setAttribute('aria-label', pick(UI.prev));
  els.next.setAttribute('aria-label', pick(UI.next));
  els.peek.setAttribute('aria-label', `${pick(UI.next)}: ${pick(SHRINES[wrap(index + 1)].name)}`);
  sceneEl.setAttribute('aria-roledescription', pick(['shrine scene', 'दर्शन दृश्य']));
}
let changeTimer = 0;
function markTurn() {
  sceneEl.classList.add('has-turned', 'is-changing');
  clearTimeout(changeTimer);
  changeTimer = setTimeout(() => sceneEl.classList.remove('is-changing'), 1400);
}
function driver() { return mode === '3d' && scene ? scene : ring; }
function select(i, { from = 'ui', announce = true } = {}) {
  i = wrap(i);
  if (i === index) return;
  index = i;
  markTurn();
  renderShrine(true);
  renderRail();
  relabelScene();
  if (from !== 'driver') { ring.goTo(i); scene?.goTo(i); }
  else if (driver() === scene) ring.goTo(i, { instant: true }); else scene?.goTo(i);
  if (announce) els.live.textContent = pick(UI.live(SHRINES[i], i));
}
const step = (d) => select(index + d);

/* ---- V1's CSS-3D circle as a driver with the same moves as the 3D scene ---- */
const ring = (() => {
  const STEP = 360 / N;
  let pos = 0, R = 300, pw = 200, startPos = 0;
  const pans = SHRINES.map((s, i) => {
    const el = document.createElement('figure');
    el.className = 'ring__pan';
    el.innerHTML = '<img alt="" draggable="false">';
    el.dataset.i = i;
    els.wheel.appendChild(el);
    return el;
  });
  let base = PANEL_ART;
  function setArt(b) {
    base = b;
    pans.forEach((el, i) => {
      const img = el.querySelector('img');
      img.dataset.src = `${base}${SHRINES[i].art}.webp`;
      img.removeAttribute('src');
      img.classList.remove('is-loaded');
      img.addEventListener('load', () => { img.style.objectPosition = cropPos(SHRINES[i], img.naturalWidth / img.naturalHeight); }, { once: true });
    });
  }
  function layout() {
    const ph = Math.round(stageBox.clientHeight / 1.06);
    pw = Math.round(ph * 2 / 3);
    R = Math.round((pw / 2) / Math.tan(Math.PI / N) * 1.12);
    stageBox.style.setProperty('--pw', `${pw}px`);
    stageBox.style.setProperty('--ph', `${ph}px`);
    pans.forEach((p, i) => { p.style.transform = `rotateY(${i * STEP}deg) translateZ(${R}px)`; });
    paint(true);
  }
  function paint(instant = false) {
    els.wheel.classList.toggle('is-instant', instant);
    els.wheel.style.transform = `translateZ(${-R}px) rotateY(${(-pos * STEP).toFixed(2)}deg)`;
    const front = wrap(Math.round(pos));
    pans.forEach((p, i) => {
      let rel = ((i - pos) % N + N) % N;
      if (rel > N / 2) rel -= N;
      const a = Math.abs(rel);
      p.classList.toggle('is-front', i === front);
      p.style.opacity = a < 0.5 ? 1 : a <= 1.5 ? 0.58 : a <= 2.5 ? 0.12 : 0;
    });
  }
  function goTo(i, { instant = false } = {}) {
    let d = wrap(i - wrap(Math.round(pos)));
    if (d > N / 2) d -= N;
    pos = Math.round(pos) + d;
    paint(instant);
  }
  return {
    setArt, layout, goTo,
    load: () => loadLazy(els.wheel),
    dragStart() { startPos = pos; els.wheel.classList.add('is-dragging'); },
    dragMove(dx) { pos = startPos - dx / Math.max(160, stageBox.clientWidth * 0.95); paint(true); },
    dragEnd(v) {
      els.wheel.classList.remove('is-dragging');
      let to = Math.round(pos);
      const start = Math.round(startPos);
      if (to === start && Math.abs(v) > 0.35) to = start - Math.sign(v);
      pos = to;
      paint();
      return wrap(to);
    },
    nudge() {
      const keep = pos;
      pos = keep + 0.3; paint();
      setTimeout(() => { pos = keep; paint(); }, 1100);
    },
    get index() { return wrap(Math.round(pos)); },
  };
})();

/* ---- controls (V2): arrows, rail, next-shrine card, keys, trackpad, drag/swipe ---- */
els.prev.addEventListener('click', () => step(-1));
els.next.addEventListener('click', () => step(1));
els.peek.addEventListener('click', () => step(1));
railItems.forEach((b) => b.addEventListener('click', () => select(+b.dataset.i)));
els.enter.addEventListener('click', (e) => {
  const s = SHRINES[index];
  if (s.alcove) window.dispatchEvent(new CustomEvent('vedansh:alcove', { detail: { id: s.alcove } }));
  const target = document.getElementById(`space-${s.space}`);
  if (!target) return;
  e.preventDefault();
  target.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
  history.replaceState(history.state, '', `#space-${s.space}`);
});
let sceneRatio = 0;
const typing = (el) => el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
window.addEventListener('keydown', (e) => {
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
  if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || typing(document.activeElement)) return;
  if (sceneRatio < 0.35 || cover > 0.5 || document.querySelector('dialog[open]')) return;
  e.preventDefault();
  step(e.key === 'ArrowRight' ? 1 : -1);
});
let wheelAcc = 0, wheelQuiet = 0, wheelLocked = false;
sceneEl.addEventListener('wheel', (e) => {
  if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) * 1.2) return;
  e.preventDefault();
  const now = performance.now();
  if (wheelLocked) {
    if (now < wheelQuiet) { wheelQuiet = now + 220; return; }
    wheelLocked = false; wheelAcc = 0;
  }
  wheelAcc += e.deltaX;
  if (Math.abs(wheelAcc) > 36) { step(Math.sign(wheelAcc)); wheelLocked = true; wheelQuiet = now + 220; }
}, { passive: false });
let drag = null;
sceneEl.addEventListener('pointerdown', (e) => {
  if (e.button !== 0 || e.target.closest('a, button, input, select, textarea, dialog')) return;
  if (e.pointerType === 'mouse' && e.target.closest('.scene__shrine')) return; // keep the words selectable
  drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, live: false, samples: [[e.clientX, e.timeStamp]] };
});
sceneEl.addEventListener('pointermove', (e) => {
  if (scene && e.pointerType === 'mouse') {
    const r = sceneEl.getBoundingClientRect();
    scene.setPointer((e.clientX - r.left) / r.width * 2 - 1, (e.clientY - r.top) / r.height * 2 - 1);
  }
  if (!drag || e.pointerId !== drag.id) return;
  const dx = e.clientX - drag.x0;
  const dy = e.clientY - drag.y0;
  if (!drag.live) {
    if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      drag.live = true;
      sceneEl.setPointerCapture(e.pointerId);
      sceneEl.classList.add('is-dragging', 'has-turned');
      driver().dragStart();
    } else if (Math.abs(dy) > 12) { drag = null; return; } else return;
  }
  drag.samples.push([e.clientX, e.timeStamp]);
  if (drag.samples.length > 6) drag.samples.shift();
  driver().dragMove(dx);
});
function endDrag(e) {
  if (!drag || e.pointerId !== drag.id) return;
  const d = drag;
  drag = null;
  if (!d.live) return;
  sceneEl.classList.remove('is-dragging');
  const [x1, t1] = d.samples[0];
  const [x2, t2] = d.samples[d.samples.length - 1];
  const v = t2 > t1 ? (x2 - x1) / (t2 - t1) : 0;
  select(driver().dragEnd(e.type === 'pointercancel' ? 0 : v), { from: 'driver' });
}
sceneEl.addEventListener('pointerup', endDrag);
sceneEl.addEventListener('pointercancel', endDrag);
sceneEl.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') scene?.setPointer(0, 0); });
els.list.addEventListener('scroll', placeMarker, { passive: true });

/* ---- 3D, or the CSS circle ---- */
function stillReason() {
  if (params.has('still')) return 'flag';
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return 'reduced-motion';
  const c = navigator.connection;
  if (c && c.saveData) return 'save-data';
  if (c && /(^|-)(2g|3g)$/.test(c.effectiveType || '')) return 'slow-link';
  if (typeof navigator.deviceMemory === 'number' && navigator.deviceMemory < 4) return 'low-memory';
  if (!window.WebGLRenderingContext) return 'no-webgl';
  return null;
}
const quality = matchMedia('(max-width: 899px), (pointer: coarse)').matches ? 'mobile' : 'desktop';
let sceneModule = null;
function goStill(reason) {
  mode = 'still';
  sceneEl.dataset.mode = 'still';
  sceneEl.dataset.still = reason;
  if (scene) { scene.dispose(); scene = null; }
  sceneEl.dataset.scene = '';
  ring.setArt(PANEL_ART);
  ring.goTo(index, { instant: true });
  if (opened) ring.load(); // otherwise the paintings load with the doors (or at idle in the static layout)
}
// three.js is fetched once the gate has painted and the browser is idle, so it never delays the first screen.
function preload3D() {
  if (mode !== 'pending' || sceneModule) return;
  sceneModule = import('./scene.js').then((m) => m.preload().then(() => m));
  sceneModule.catch((err) => { console.warn('[v4] 3D scene unavailable, showing the CSS circle:', err.message); goStill('no-webgl'); });
}
let starting = false;
async function startScene() {
  if (mode === 'still') { ring.load(); return; }
  if (starting || scene) return;
  starting = true;
  ring.load(); // the stand-in, from the same files the 3D panels use (so the browser fetches them once)
  try {
    preload3D();
    if (!sceneModule) return;
    const m = await sceneModule;
    if (mode === 'still') return;
    scene = await m.createScene({
      canvas: els.canvas, heroEl: sceneEl, stageEl: stageBox, shrines: SHRINES,
      artBase: quality === 'mobile' ? PANEL_ART : SHARED_ART, quality,
      initialIndex: index,
      onIndexChange: (k) => select(k, { from: 'driver' }),
      onReady: () => {
        if (mode === 'still') return;
        mode = '3d';
        sceneEl.dataset.mode = '3d';
        sceneEl.dataset.scene = 'ready';
        setTimeout(() => { if (sceneEl.dataset.scene === 'ready') sceneEl.dataset.scene = 'settled'; }, 1800);
        if (revealedOnce) scene?.relight(); // revealed before it was ready: light the lamps now
        // Draw a few frames even while the gate still covers it, so the canvas is never blank when it shows.
        scene?.setActive(true);
        setTimeout(sceneVisibility, 150);
      },
    });
    if (mode === 'still') { scene.dispose(); scene = null; return; }
    scene.goTo(index);
    window.__v4.scene = scene;
    sceneVisibility();
  } catch (err) {
    console.warn('[v4] 3D scene unavailable, showing the CSS circle:', err.message);
    goStill('no-webgl');
  }
}
// The scene runs only when it can be seen: on screen, the gate no longer covering it, and the tab visible.
function sceneVisibility() {
  scene?.setActive(sceneRatio > 0 && cover < 0.999 && !document.hidden);
  // the gate's pointer input only while it is the thing on screen
  stage.style.pointerEvents = cover < 0.5 || stage.style.visibility === 'hidden' ? 'none' : '';
}
function onReveal() {
  // The gold glow condenses into the sanctum light: the 3D halo flares (or the CSS sanctum light does).
  sceneEl.classList.add('is-flare');
  setTimeout(() => sceneEl.classList.remove('is-flare'), 2700);
  if (scene && mode === '3d') scene.relight();
  setTimeout(() => {
    if (sceneEl.classList.contains('has-turned') || reducedMotion()) return;
    driver().nudge();
    sceneEl.classList.add('is-nudging');
    setTimeout(() => sceneEl.classList.remove('is-nudging'), 2200);
  }, 2600);
}
new IntersectionObserver(([entry]) => {
  sceneRatio = entry.intersectionRatio;
  if (isStatic() && entry.isIntersecting && !revealedOnce) { revealedOnce = true; onReveal(); }
  sceneVisibility();
}, { threshold: [0, 0.2, 0.35, 0.6, 1] }).observe(sceneEl);
document.addEventListener('visibilitychange', sceneVisibility);

/* =================================================================== 3 · the walk, then measure */
function relabelGate() {
  const alt = $('.v4-kicker-alt');
  const hi = getLang() === 'hi';
  alt.textContent = hi ? SPACE.gate.title[0] : SPACE.gate.title[1];
  alt.lang = hi ? 'en' : 'hi';
  alt.classList.toggle('deva', !hi);
  bell.setAttribute('aria-label', pick(HERO.bell));
}
window.addEventListener('vedansh:lang', () => { relabelGate(); fillShrine(index); renderRail(); relabelScene(); layoutAll(); });
mountWalk($('#walk'), { lang: LANG0 });

function layoutAll() { layoutGate(); ring.layout(); placeMarker(); frameGate(); }
let raf = 0;
addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; frameGate(); }); }, { passive: true });
addEventListener('resize', layoutAll);
if (document.fonts) document.fonts.ready.then(layoutAll);

window.__v4 = { get mode() { return mode; }, get index() { return index; }, get cover() { return cover; }, scene: null, shrines: SHRINES.map((s) => s.id) };
relabelGate();
fillShrine(index);
renderRail();
relabelScene();
const reason = stillReason();
if (reason) goStill(reason);
else ring.setArt(quality === 'mobile' ? PANEL_ART : SHARED_ART);
layoutAll();
if (isStatic()) openDoors({ defer: true });
if (!reason) whenIdle(preload3D);
addEventListener('pagehide', () => { if (scene) { scene.dispose(); scene = null; sceneEl.dataset.scene = ''; } });
addEventListener('pageshow', (e) => { if (e.persisted && mode !== 'still' && opened && !scene) { starting = false; startScene(); } });
