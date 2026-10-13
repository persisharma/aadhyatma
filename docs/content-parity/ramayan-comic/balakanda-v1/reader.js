'use strict';
let book, pageIndex = -1, mode = 'shelf', large = false, lang = 'hi';
try { lang = localStorage.getItem('vedansh-balakanda-lang') || 'hi'; } catch {}
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const panelMap = new Map(), episodeMap = new Map();

// Content localizer: prefer the `<field>En` value when reading in English, else fall back to Hindi.
const L = (o, k) => (lang === 'en' && o[k + 'En']) ? o[k + 'En'] : (o[k] || '');

// UI chrome strings per language.
const UI = {
  hi: {
    wordmark: 'ॐ वेदांश', eyebrow: 'सचित्र रामायण', asideTitle: 'बालकाण्ड',
    intro: 'कथा के जन्म से अयोध्या वापसी तक।<br>२९ प्रसंग · १३७ चित्र-पैनल',
    home: 'काण्ड संग्रह', size: 'बड़ा अक्षर Aa', sources: 'स्रोत व रूपान्तरण',
    draft: 'स्थानीय समीक्षा प्रति · हिन्दी व अंग्रेज़ी<br>स्वतंत्र सम्पादकीय और मूल ऐप की जाँच बाकी है।',
    chaptersLabel: 'प्रसंग', back: 'प्रसंग संग्रह', libraryFoot: 'संग्रह', sourcesFoot: 'स्रोत',
    swipe: 'पन्ना बदलने के लिए स्वाइप करें ↔', prev: '← पिछला', next: 'अगला →',
    reviewPreview: 'समीक्षा प्रीव्यू', reviewCopy: 'हिन्दी-अंग्रेज़ी समीक्षा प्रति', page: 'पन्ना',
    shelfTitle: 'ॐ वेदांश', kandaTitle: 'बालकाण्ड', langBtn: 'EN', langLabel: 'भाषा: अंग्रेज़ी में पढ़ें',
    shelfH2: 'सचित्र बालकाण्ड', shelfSub: '२९ प्रसंग · एक सम्पूर्ण कथा',
    shelfSmall: 'वाल्मीकि रामायण पर आधारित कॉमिक रूपान्तरण', read: 'पढ़ें', sarga: 'सर्ग',
    shelfEnding: 'समीक्षा प्रति · संवाद भावानुसार रूपान्तरित हैं।',
    episode: 'प्रसंग', pagePrev: '← पिछला पन्ना', pageNext: 'अगला पन्ना →', pageTurn: 'पन्ना बदलें',
    endingTitle: '॥ बालकाण्ड सम्पूर्ण ॥',
    endingText: 'राम के जन्म से शिक्षा, मिथिला और विवाह तक की यात्रा यहीं पूर्ण होती है।',
    endingSources: 'स्रोत और रूपान्तरण पढ़ें',
    srcBase: 'वाल्मीकि रामायण', fullArt: 'चित्र ↗', fullArtLabel: 'पूरा मूल चित्र देखें',
    sourcesH2: 'स्रोत और रूपान्तरण', returnShelf: 'संग्रह में लौटें',
    sourcesBody: '<p>मूल आधार: वाल्मीकि रामायण, बालकाण्ड के ७७ सर्ग। यह १३७ पैनलों में अध्यायों की कथा का रूपान्तरण है; प्रत्येक श्लोक का अनुवाद नहीं। संवाद मूल प्रसंग के भावानुसार लिखे गए हैं।</p><p>यात्रा में सुनाई पुराकथाएँ और शतानन्द द्वारा सुनाया विश्वामित्र का जीवन स्पष्ट रूप से पूर्वकथा के रूप में रखे गए हैं। प्रस्तावना का राजा राम बाद के समय का है।</p><ul><li><a href="https://www.valmikiramayan.net/utf8/baala/sarga1/balaroman1.htm" target="_blank" rel="noopener">Valmikiramayan.net — संस्कृत और अंग्रेज़ी व्याख्या</a></li><li><a href="https://www.ramcharit.in/valmiki-ramayana-bala-kanda-in-sanskrit-with-hindi-meaning-pdf/" target="_blank" rel="noopener">RamCharit.in — संस्कृत और हिन्दी अर्थ</a></li></ul><p>वयस्क और हिंसक प्रसंगों का चित्रण संयत है। परिणाम और घटनाक्रम बने रहते हैं। इस पाठ में अहल्या की अदृश्य तपस्या, चारों विवाहों के सही जोड़े और दो अलग धनुषों का क्रम सुरक्षित रखा गया है।</p><p>चित्र और भाषा अलग रखे गए हैं। हिन्दी व अंग्रेज़ी पाठ तैयार हैं; गुजराती, कन्नड़, स्वतंत्र सम्पादकीय समीक्षा और वास्तविक ऐप पर Standard/Large समीक्षा बाकी हैं। यह स्थानीय समीक्षा प्रति है।</p>',
  },
  en: {
    wordmark: 'ॐ Vedansh', eyebrow: 'Illustrated Ramayana', asideTitle: 'Bālakāṇḍa',
    intro: 'From the birth of the tale to the return to Ayodhya.<br>29 episodes · 137 art panels',
    home: 'All episodes', size: 'Large text Aa', sources: 'Sources & adaptation',
    draft: 'Local review copy · Hindi &amp; English<br>Independent editorial and in-app review pending.',
    chaptersLabel: 'Episodes', back: 'Episode shelf', libraryFoot: 'Shelf', sourcesFoot: 'Sources',
    swipe: 'Swipe to turn the page ↔', prev: '← Prev', next: 'Next →',
    reviewPreview: 'Review preview', reviewCopy: 'Hindi–English review copy', page: 'Page',
    shelfTitle: 'ॐ Vedansh', kandaTitle: 'Bālakāṇḍa', langBtn: 'हिं', langLabel: 'Language: read in Hindi',
    shelfH2: 'Illustrated Bālakāṇḍa', shelfSub: '29 episodes · one complete tale',
    shelfSmall: 'A comic adaptation based on the Valmiki Ramayana', read: 'read', sarga: 'sarga',
    shelfEnding: 'Review copy · dialogues are adapted in spirit.',
    episode: 'Episode', pagePrev: '← Previous page', pageNext: 'Next page →', pageTurn: 'Change page',
    endingTitle: '॥ Bālakāṇḍa complete ॥',
    endingText: 'The journey from Rama’s birth through his education, Mithila and marriage ends here.',
    endingSources: 'Read sources & adaptation',
    srcBase: 'Valmiki Ramayana', fullArt: 'Art ↗', fullArtLabel: 'View the full source image',
    sourcesH2: 'Sources & adaptation', returnShelf: 'Return to shelf',
    sourcesBody: '<p>Base source: the Valmiki Ramayana, the 77 sargas of the Bālakāṇḍa. This adapts the chapters’ narrative across 137 panels; it is not a translation of every shloka. The dialogues are written in keeping with the spirit of the original episodes.</p><p>The old tales told along the journey, and the life of Vishvamitra as narrated by Shatananda, are clearly kept as back-story. The King Rama of the prologue belongs to a later time.</p><ul><li><a href="https://www.valmikiramayan.net/utf8/baala/sarga1/balaroman1.htm" target="_blank" rel="noopener">Valmikiramayan.net — Sanskrit with English commentary</a></li><li><a href="https://www.ramcharit.in/valmiki-ramayana-bala-kanda-in-sanskrit-with-hindi-meaning-pdf/" target="_blank" rel="noopener">RamCharit.in — Sanskrit with Hindi meaning</a></li></ul><p>Adult and violent episodes are depicted with restraint. The outcomes and sequence of events are preserved. This text keeps Ahalya’s unseen penance, the correct pairing of the four marriages, and the order of the two separate bows intact.</p><p>Art and text are kept separate. The Hindi and English texts are ready; Gujarati, Kannada, independent editorial review, and Standard/Large review in the actual app are pending. This is a local review copy.</p>',
  },
};
const T = k => UI[lang][k];

function crop(e, p, cls = '') {
  const f = p.frame;
  const a = e.dimensions || { width: 2048, height: e.grid.rows * 768 };
  const ratio = (a.width * f.width) / (a.height * f.height);
  return `<div class="crop ${cls}" role="img" aria-label="${esc(L(p, 'narration'))}" style="aspect-ratio:${ratio}"><img draggable="false" loading="lazy" src="${e.asset}" alt="" style="width:${100 / f.width}%;height:${100 / f.height}%;left:${-f.x / f.width * 100}%;top:${-f.y / f.height * 100}%"></div>`;
}
function panel(e, p) {
  const dialogue = L(p, 'dialogue');
  return `<article class="panel" data-panel-id="${p.id}">${crop(e, p)}<div class="caption"><p class="narration">${esc(L(p, 'narration'))}</p>${dialogue ? `<div class="dialogue"><span class="speaker">${esc(L(p, 'speaker'))}</span>${esc(dialogue)}</div>` : ''}<div class="source"><span>${esc(T('srcBase'))} · ${esc(p.source)}</span><a href="${e.asset}" target="_blank" rel="noopener" aria-label="${esc(T('fullArtLabel'))}">${esc(T('fullArt'))}</a></div></div></article>`;
}
function shell() {
  $('counter').textContent = mode === 'reader' ? `${pageIndex + 1} / ${book.pages.length}` : '';
  $('progress').style.width = mode === 'reader' ? `${(pageIndex + 1) * 100 / book.pages.length}%` : '0';
  $('screen-title').textContent = mode === 'shelf' ? T('shelfTitle') : T('kandaTitle');
  $('previous').disabled = mode !== 'reader' || pageIndex === 0;
  $('next').disabled = mode !== 'reader' || pageIndex === book.pages.length - 1;
  $('review-count').textContent = mode === 'reader' ? `${T('page')} ${pageIndex + 1} / ${book.pages.length}` : T('reviewCopy');
  document.querySelectorAll('#chapters button').forEach(b => b.setAttribute('aria-current', String(mode === 'reader' && b.dataset.episode === book.pages[pageIndex].episodeId)));
  $('viewport').scrollTop = 0;
}
function shelf() {
  mode = 'shelf'; pageIndex = -1; location.hash = 'shelf';
  $('content').innerHTML = `<div class="shelf-intro"><div class="ornament">── ◇ ──</div><h2>${esc(T('shelfH2'))}</h2><p>${esc(T('shelfSub'))}</p><small>${esc(T('shelfSmall'))}</small></div><div class="shelf">${book.episodes.map((e, i) => `<button class="book" data-open="${e.id}" aria-label="${esc(L(e, 'title'))} ${esc(T('read'))}">${crop(e, e.panels[0])}<div class="label"><h3>${esc(L(e, 'title'))}</h3><small>${i + 1} · ${esc(T('sarga'))} ${e.sargas}</small></div></button>`).join('')}</div><div class="ending"><p>${esc(T('shelfEnding'))}</p></div>`;
  shell();
}
function read(index) {
  mode = 'reader';
  pageIndex = Math.max(0, Math.min(book.pages.length - 1, index));
  const pg = book.pages[pageIndex], e = episodeMap.get(pg.episodeId);
  location.hash = pg.id;
  $('content').innerHTML = `<div class="episode-heading"><small>${esc(T('episode'))} ${book.episodes.indexOf(e) + 1} / 29</small><h2>${esc(L(e, 'title'))}</h2><div class="ornament">── ◇ ──</div>${pg.panelIds[0] === e.panels[0].id ? `<p class="frame-note">${esc(L(e, 'framing'))}</p>` : ''}</div>${pg.panelIds.map(id => panel(e, panelMap.get(id))).join('')}<nav class="page-turns" aria-label="${esc(T('pageTurn'))}"><button id="page-prev" ${pageIndex === 0 ? 'disabled' : ''}>${esc(T('pagePrev'))}</button><button id="page-next" ${pageIndex === book.pages.length - 1 ? 'disabled' : ''}>${esc(T('pageNext'))}</button></nav>${pageIndex === book.pages.length - 1 ? `<div class="ending"><h2>${esc(T('endingTitle'))}</h2><p>${esc(T('endingText'))}</p><button id="ending-sources">${esc(T('endingSources'))}</button></div>` : ''}`;
  shell();
  try { localStorage.setItem('vedansh-balakanda-draft-page', String(pageIndex)); } catch {}
}
function sources() {
  mode = 'sources'; location.hash = 'sources';
  $('content').innerHTML = `<section class="source-note"><h2>${esc(T('sourcesH2'))}</h2>${T('sourcesBody')}<p><a href="pacing-review.md">${lang === 'en' ? 'Full panel list and pacing review' : 'पूरी पैनल सूची और गति समीक्षा'}</a> · <a href="book.json">${lang === 'en' ? 'Separate text and art data' : 'अलग पाठ व चित्र डेटा'}</a> · <a href="prompts-selected.json">${lang === 'en' ? 'Art-generation instructions' : 'चित्र निर्माण के निर्देश'}</a></p><button id="return-shelf">${esc(T('returnShelf'))}</button></section>`;
  shell();
}
function openEpisode(id) { read(book.pages.findIndex(p => p.episodeId === id)); }

// Rebuild the chapter nav list labels (titles depend on language).
function buildChapters() {
  const nav = $('chapters');
  nav.innerHTML = '';
  book.episodes.forEach((e, i) => {
    const b = document.createElement('button');
    b.textContent = `${String(i + 1).padStart(2, '0')}  ${L(e, 'title')}`;
    b.dataset.episode = e.id;
    b.onclick = () => openEpisode(e.id);
    nav.appendChild(b);
  });
}

// Apply the static chrome (aside + device frame) for the current language.
function applyChrome() {
  document.documentElement.lang = lang;
  $('wordmark').textContent = T('wordmark');
  $('eyebrow').textContent = T('eyebrow');
  $('aside-title').textContent = T('asideTitle');
  $('intro').innerHTML = T('intro');
  $('draft').innerHTML = T('draft');
  $('home').textContent = T('home');
  $('size').textContent = T('size');
  $('sources').textContent = T('sources');
  $('chapters').setAttribute('aria-label', T('chaptersLabel'));
  $('back').setAttribute('aria-label', T('back'));
  $('library-label').textContent = T('libraryFoot');
  $('source-foot-label').textContent = T('sourcesFoot');
  $('swipe').textContent = T('swipe');
  $('previous').textContent = T('prev');
  $('next').textContent = T('next');
  const lb = $('lang');
  lb.textContent = T('langBtn');
  lb.setAttribute('aria-label', T('langLabel'));
  lb.setAttribute('aria-pressed', String(lang === 'en'));
}

function render() {
  if (mode === 'reader') read(pageIndex);
  else if (mode === 'sources') sources();
  else shelf();
}
function setLang(next) {
  lang = next;
  try { localStorage.setItem('vedansh-balakanda-lang', lang); } catch {}
  applyChrome();
  buildChapters();
  render();
}

fetch('book.json').then(r => { if (!r.ok) throw Error('Book data unavailable'); return r.json(); }).then(data => {
  book = data;
  book.episodes.forEach(e => { episodeMap.set(e.id, e); e.panels.forEach(p => panelMap.set(p.id, p)); });
  applyChrome();
  buildChapters();
  const hash = location.hash.slice(1), i = book.pages.findIndex(p => p.id === hash);
  if (i >= 0) read(i); else if (hash === 'sources') sources(); else shelf();
}).catch(e => { $('content').textContent = e.message; });

$('content').addEventListener('click', event => {
  const b = event.target.closest('[data-open]');
  if (b) openEpisode(b.dataset.open);
  if (event.target.id === 'page-prev') read(pageIndex - 1);
  if (event.target.id === 'page-next') read(pageIndex + 1);
  if (event.target.id === 'ending-sources') sources();
  if (event.target.id === 'return-shelf') shelf();
});
['home', 'back', 'library'].forEach(id => $(id).onclick = () => shelf());
['sources', 'source-foot'].forEach(id => $(id).onclick = () => sources());
$('size').onclick = () => { large = !large; document.body.classList.toggle('large', large); $('size').setAttribute('aria-pressed', String(large)); };
$('lang').onclick = () => setLang(lang === 'en' ? 'hi' : 'en');
$('previous').onclick = () => read(pageIndex - 1);
$('next').onclick = () => read(pageIndex + 1);
document.addEventListener('keydown', e => {
  if (mode === 'reader' && e.key === 'ArrowRight') { e.preventDefault(); read(pageIndex + 1); }
  if (mode === 'reader' && e.key === 'ArrowLeft') { e.preventDefault(); read(pageIndex - 1); }
});
let touch = null;
$('viewport').addEventListener('pointerdown', e => { touch = { x: e.clientX, y: e.clientY }; });
$('viewport').addEventListener('pointerup', e => {
  if (!touch) return;
  const dx = e.clientX - touch.x, dy = e.clientY - touch.y;
  if (mode === 'reader' && Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.4) read(pageIndex + (dx < 0 ? 1 : -1));
  touch = null;
});
$('viewport').addEventListener('pointercancel', () => touch = null);
