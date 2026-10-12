'use strict';

const labels = {
  hi: { collection: 'संग्रह', title: 'बालकाण्ड', subtitle: 'वाल्मीकि रामायण · सचित्र कथा', episode: 'प्रसंग', panels: 'पैनल', sargas: 'सर्ग', large: 'बड़े अक्षर Aa', normal: 'सामान्य अक्षर Aa', previous: '← पिछला प्रसंग', next: 'अगला प्रसंग →', choose: 'प्रसंग चुनें', compare: 'हिन्दी और English साथ देखें', read: 'कथा पढ़ें', source: 'स्रोत व समीक्षा', original: 'मूल चित्र', note: 'स्थानीय समीक्षा प्रति · २९ प्रसंग · हिन्दी और English। संवाद कथा का रूपांतरण हैं, श्लोकों का शब्दशः अनुवाद नहीं। स्वतंत्र संपादकीय तथा वास्तविक मोबाइल उपकरण की जाँच शेष है। प्रकाशित पुस्तक नहीं बदली गई है.', sourceIntro: 'आधार: वाल्मीकि रामायण, बालकाण्ड, सर्ग १–७७। सभी सर्गों के कथा-प्रसंग शामिल हैं; यह प्रत्येक श्लोक का पूर्ण अनुवाद नहीं है।', sourceLinks: 'मूल पाठ और अनुवाद', pending: 'गुजराती, कन्नड़ और चारों भाषाओं की अंतिम संपादकीय स्वीकृति इस द्विभाषी समीक्षा में शामिल नहीं हैं।', error: 'कथा नहीं खुल सकी। स्थानीय सर्वर चालू करें और फिर प्रयास करें।' },
  en: { collection: 'Collection', title: 'Bālakāṇḍa', subtitle: 'Valmiki Ramayana · An illustrated retelling', episode: 'EPISODE', panels: 'panels', sargas: 'Sargas', large: 'Larger text Aa', normal: 'Normal text Aa', previous: '← Previous episode', next: 'Next episode →', choose: 'Choose an episode', compare: 'Compare Hindi and English', read: 'Read the story', source: 'Sources & review', original: 'Full artwork', note: 'Local review edition · 29 episodes · Hindi and English. Dialogue is adapted storytelling, not verbatim scripture. Independent editorial and physical-device review remain pending. The published book is unchanged.', sourceIntro: 'Based on Valmiki Ramayana, Bālakāṇḍa, sargas 1–77. Story arcs from every sarga are represented; this is not a complete verse-by-verse translation.', sourceLinks: 'Source text and translations', pending: 'Gujarati, Kannada and final four-language editorial approval are outside this bilingual review.', error: 'The story could not load. Start the local server and try again.' }
};
const parameters = new URLSearchParams(location.search);
let language = parameters.get('lang') === 'en' ? 'en' : 'hi';
const comparison = parameters.get('compare') === '1';
let book;
const content = document.getElementById('content');
const element = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
};
const link = (text, href, className) => {
  const node = element('a', className, text);
  node.href = href;
  return node;
};
const number = (value, locale = language) => new Intl.NumberFormat(locale === 'hi' ? 'hi-u-nu-deva' : 'en').format(value);
const route = () => location.hash.slice(1).replace(/-page-\d+$/, '') || 'shelf';
const episodeNumber = episode => Number(episode.id.slice(3));

function artwork(panel, locale, decorative = false) {
  const frame = panel.frame;
  const crop = element('div', 'crop');
  crop.style.aspectRatio = (panel.dimensions.width * frame.width) / (panel.dimensions.height * frame.height);
  const image = element('img');
  image.src = panel.asset;
  image.alt = decorative ? '' : [panel[locale].narration, panel[locale].speaker, panel[locale].dialogue].filter(Boolean).join(' ');
  image.style.cssText = `width:${100 / frame.width}%;height:${100 / frame.height}%;left:${-frame.x / frame.width * 100}%;top:${-frame.y / frame.height * 100}%`;
  image.addEventListener('load', fitBalloons);
  crop.append(image);
  return crop;
}

function balloon(copy) {
  const speech = element('p', 'speech');
  const shape = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  shape.classList.add('bubble-shape');
  shape.setAttribute('aria-hidden', 'true');
  shape.setAttribute('focusable', 'false');
  shape.append(document.createElementNS('http://www.w3.org/2000/svg', 'path'));
  speech.append(shape, element('span', 'speaker', copy.speaker), element('span', 'spoken', copy.dialogue));
  return speech;
}

function drawBalloon(speech, flowing) {
  const { width, height } = speech.getBoundingClientRect();
  const radiusX = flowing ? 28 : width * 0.42;
  const radiusY = flowing ? Math.min(28, height / 2) : height * 0.42;
  const bottom = flowing ? `H ${width * 0.22 + 26} L ${width * 0.22} ${height + 23} L ${width * 0.22} ${height} H ${radiusX}` : `H ${radiusX}`;
  const left = flowing ? `V ${radiusY}` : `L -22 ${height * 0.9} L 0 ${radiusY}`;
  const shape = speech.querySelector('svg');
  shape.setAttribute('viewBox', `0 0 ${width} ${height}`);
  shape.querySelector('path').setAttribute('d', `M ${radiusX} 0 H ${width - radiusX} Q ${width} 0 ${width} ${radiusY} V ${height - radiusY} Q ${width} ${height} ${width - radiusX} ${height} ${bottom} Q 0 ${height} 0 ${height - radiusY} ${left} Q 0 0 ${radiusX} 0 Z`);
}

function fitBalloons() {
  for (const speech of content.querySelectorAll('.speech')) {
    const panel = speech.closest('.panel');
    if (panel.classList.contains('overlay')) {
      panel.classList.remove('flow-speech');
      if (speech.offsetHeight > panel.querySelector('.crop').clientHeight * 0.46) panel.classList.add('flow-speech');
    }
    drawBalloon(speech, !panel.classList.contains('overlay') || panel.classList.contains('flow-speech'));
  }
}

function episodeView(episode, locale, navigation = true) {
  const copy = labels[locale];
  const section = element('section', 'episode');
  section.lang = locale;
  section.dataset.episode = episode.id;
  const heading = element('header', 'episode-heading');
  if (comparison) heading.append(element('div', 'compare-label', locale === 'hi' ? 'हिन्दी' : 'English'));
  heading.append(element('div', 'eyebrow', `${copy.episode} ${number(episodeNumber(episode), locale)} · ${copy.sargas} ${String(episode.sargas).replace(/\d+/g, value => number(Number(value), locale))}`), element('h1', '', episode[locale].title), element('p', 'framing', episode[locale].framing));
  if (navigation && !comparison) {
    const select = element('select');
    select.setAttribute('aria-label', copy.choose);
    for (const choice of book.episodes) {
      const option = element('option', '', `${number(episodeNumber(choice), locale)} · ${choice[locale].title}`);
      option.value = choice.id;
      option.selected = choice.id === episode.id;
      select.append(option);
    }
    select.addEventListener('change', () => { location.hash = select.value; });
    heading.append(select);
  }
  section.append(heading);
  for (const [index, panel] of episode.panels.entries()) {
    const article = element('article', `panel${panel.overlaySpeech ? ' overlay' : ''}`);
    article.id = `${locale}-${panel.id}`;
    article.dataset.panel = panel.id;
    article.setAttribute('aria-label', `${copy.panels} ${number(index + 1, locale)} / ${number(episode.panels.length, locale)}`);
    if (panel[locale].narration) article.append(element('p', 'narration', panel[locale].narration));
    if (panel[locale].dialogue) article.append(balloon(panel[locale]));
    article.append(artwork(panel, locale));
    section.append(article, link(`${copy.sargas} ${panel.source} · ${copy.original}`, panel.asset, 'panel-source'));
  }
  if (navigation) {
    const index = book.episodes.indexOf(episode);
    const nav = element('nav', 'navigation');
    if (index > 0) nav.append(link(copy.previous, `#${book.episodes[index - 1].id}`));
    if (index < book.episodes.length - 1) nav.append(link(copy.next, `#${book.episodes[index + 1].id}`));
    else nav.append(link(copy.collection, '#shelf'));
    section.append(nav);
    section.append(link(comparison ? copy.read : copy.compare, `?lang=${locale}${comparison ? '' : '&compare=1'}${document.body.classList.contains('large') ? '&size=large' : ''}#${episode.id}`, 'review-link'));
  }
  return section;
}

function renderShelf() {
  const copy = labels[language];
  const intro = element('section', 'intro');
  intro.append(element('div', 'eyebrow', copy.subtitle), element('h1', '', copy.title), element('p', 'note', copy.note));
  content.append(intro);
  const shelf = element('div', 'shelf');
  for (const episode of book.episodes) {
    const cover = link('', `#${episode.id}`, 'cover');
    cover.append(artwork(episode.panels[0], language, true));
    const details = element('div', 'cover-copy');
    details.append(element('div', 'eyebrow', `${copy.episode} ${number(episodeNumber(episode))}`), element('h2', '', episode[language].title), element('p', '', `${number(episode.panels.length)} ${copy.panels}`));
    cover.append(details);
    shelf.append(cover);
  }
  content.append(shelf);
}

function renderSources() {
  const copy = labels[language];
  const section = element('section', 'source-list');
  section.append(element('h1', '', copy.source), element('p', '', copy.sourceIntro), element('p', '', copy.note), element('p', '', copy.pending), element('h2', '', copy.sourceLinks));
  const list = element('ul');
  for (const [title, href] of [['ValmikiRamayan.net · Bālakāṇḍa', 'https://www.valmikiramayan.net/utf8/baala/baala_contents.htm'], ['Sanskrit Documents · Bālakāṇḍa mirror', 'https://sanskritdocuments.org/sites/valmikiramayan/baala/baala_contents.htm'], ['Pacing, language and visual review', 'REVIEW.md'], ['Panel sources and bilingual text', 'book.json'], ['Asset hashes and painted frames', 'asset-manifest.json']]) {
    const item = element('li');
    item.append(link(title, href));
    list.append(item);
  }
  section.append(list);
  content.append(section);
}

function readingPosition() {
  const anchor = [...content.querySelectorAll('.panel')].find(panel => panel.getBoundingClientRect().bottom > 0);
  return { id: anchor?.dataset.panel, top: anchor?.getBoundingClientRect().top, scrolled: scrollY > 0 };
}

function render(preserve = false, position = readingPosition()) {
  const reading = preserve && position.id && position.top < innerHeight && position.scrolled;
  const copy = labels[language];
  document.documentElement.lang = language;
  document.body.classList.toggle('compare', comparison);
  document.getElementById('collection').textContent = copy.collection;
  document.getElementById('size').textContent = document.body.classList.contains('large') ? copy.normal : copy.large;
  document.getElementById('size').setAttribute('aria-pressed', String(document.body.classList.contains('large')));
  for (const choice of ['hi', 'en']) document.getElementById(choice).setAttribute('aria-pressed', String(choice === language));
  content.replaceChildren();
  const selected = book.episodes.find(episode => episode.id === route());
  document.title = `${selected ? selected[language].title : copy.title} · ${copy.subtitle}`;
  if (route() === 'sources') renderSources();
  else if (route() === 'all') for (const episode of book.episodes) content.append(episodeView(episode, language, false));
  else if (selected && comparison) {
    const pair = element('div', 'comparison');
    pair.append(episodeView(selected, 'hi'), episodeView(selected, 'en'));
    content.append(pair);
  } else if (selected) content.append(episodeView(selected, language));
  else renderShelf();
  const footer = document.getElementById('footer');
  footer.replaceChildren(element('p', '', copy.note), link(copy.source, '#sources'));
  content.setAttribute('aria-busy', 'false');
  requestAnimationFrame(() => {
    fitBalloons();
    if (reading) {
      const replacement = content.querySelector(`[data-panel="${position.id}"]`);
      if (replacement) scrollBy(0, replacement.getBoundingClientRect().top - position.top);
    }
  });
}

document.body.classList.toggle('large', parameters.get('size') === 'large');
document.querySelector('.skip').addEventListener('click', event => {
  event.preventDefault();
  content.focus();
  content.scrollIntoView();
});
for (const choice of ['hi', 'en']) document.getElementById(choice).addEventListener('click', () => {
  language = choice;
  const address = new URL(location.href);
  address.searchParams.set('lang', language);
  history.replaceState(null, '', address);
  if (book) render(true);
});
document.getElementById('size').addEventListener('click', () => {
  const position = readingPosition();
  const large = document.body.classList.toggle('large');
  const address = new URL(location.href);
  if (large) address.searchParams.set('size', 'large'); else address.searchParams.delete('size');
  history.replaceState(null, '', address);
  if (book) render(true, position);
});
window.addEventListener('hashchange', () => {
  if (book) render();
  scrollTo(0, 0);
  content.focus({ preventScroll: true });
});
window.addEventListener('resize', fitBalloons);
document.fonts.ready.then(fitBalloons);
fetch('book.json').then(response => {
  if (!response.ok) throw new Error(`Book: ${response.status}`);
  return response.json();
}).then(data => { book = data; render(); }).catch(error => {
  content.replaceChildren(element('p', '', labels[language].error));
  content.setAttribute('aria-busy', 'false');
  console.error(error);
});
