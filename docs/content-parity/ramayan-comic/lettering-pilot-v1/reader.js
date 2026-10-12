'use strict';

let currentLanguage = 'en';
let episode;
let english;
const elements = id => document.getElementById(id);
const copy = {
  en: { kanda: 'Bālakāṇḍa', back: 'Collection', count: '3 scenes', larger: 'Larger text Aa', normal: 'Normal text Aa', next: 'Next episode: A Father’s Difficult Decision', source: 'Based on Valmiki Ramayana · Bāla 1.18' },
  hi: { kanda: 'बालकाण्ड', back: 'संग्रह', count: '३ दृश्य', larger: 'बड़ा अक्षर Aa', normal: 'सामान्य अक्षर Aa', next: 'अगला प्रसंग: पिता का कठिन निर्णय', source: 'वाल्मीकि रामायण पर आधारित · बालकाण्ड १.१८' }
};

function positionBalloons() {
  for (const balloon of document.querySelectorAll('.speech')) {
    const article = balloon.closest('.panel');
    const artwork = article.querySelector('.art');
    const narration = article.querySelector('.narration');
    const top = Math.max(artwork.clientHeight * 0.33, narration.offsetTop + narration.offsetHeight + 12);
    balloon.style.top = `${top}px`;
    const tailHeight = Math.max(16, artwork.clientHeight * 0.68 - top - balloon.offsetHeight);
    balloon.style.setProperty('--tail-height', `${tailHeight}px`);
    balloon.style.setProperty('--tail-left', `${artwork.clientWidth * 0.785 - balloon.offsetLeft - 11}px`);
  }
}

function updateText() {
  if (!episode || !english) return;
  const selected = currentLanguage === 'hi' ? episode : english;
  const labels = copy[currentLanguage];
  document.documentElement.lang = currentLanguage;
  document.title = `${selected.title} · Comic preview`;
  elements('title').textContent = selected.title;
  elements('framing').textContent = selected.framing;
  for (const name of ['kanda', 'back', 'count', 'next', 'source']) elements(name).textContent = labels[name];
  elements('size').textContent = document.body.classList.contains('large') ? labels.normal : labels.larger;
  for (const language of ['hi', 'en']) elements(language).setAttribute('aria-pressed', String(language === currentLanguage));
  for (const panel of episode.panels) {
    const translated = currentLanguage === 'hi' ? panel : english.panels[panel.id];
    const article = elements(panel.id);
    article.querySelector('.narration').textContent = translated.narration;
    if (translated.dialogue) {
      article.querySelector('.speaker').textContent = `${translated.speaker}: `;
      article.querySelector('.spoken').textContent = translated.dialogue;
    }
  }
  requestAnimationFrame(positionBalloons);
}

for (const language of ['hi', 'en']) {
  elements(language).addEventListener('click', () => {
    currentLanguage = language;
    updateText();
  });
}

elements('size').addEventListener('click', () => {
  const large = document.body.classList.toggle('large');
  elements('size').setAttribute('aria-pressed', String(large));
  updateText();
});

Promise.all(['../balakanda-v1/book.json', 'episode-en.json'].map(async path => {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Unable to load ${path}`);
  return response.json();
})).then(([book, translation]) => {
  episode = book.episodes.find(entry => entry.id === 'bk-05');
  english = translation;
  if (!episode || episode.panels.some(panel => !english.panels[panel.id])) throw new Error('Incomplete episode');
  const panels = elements('panels');
  panels.replaceChildren();
  for (const panel of episode.panels) {
    const article = document.createElement('article');
    article.id = panel.id;
    article.className = 'panel';
    article.dataset.panelId = panel.id;
    const artwork = document.createElement('img');
    artwork.className = 'art';
    artwork.src = `${panel.id}-clean-${panel.id === 'bk-05-03' ? 'v2' : 'v1'}.png`;
    artwork.alt = '';
    artwork.width = 1024;
    artwork.height = 1536;
    artwork.addEventListener('load', positionBalloons);
    const narration = document.createElement('p');
    narration.className = 'narration';
    article.append(artwork, narration);
    if (panel.dialogue) {
      const balloon = document.createElement('p');
      balloon.className = 'speech';
      const speaker = document.createElement('span');
      speaker.className = 'speaker sr-only';
      const spoken = document.createElement('span');
      spoken.className = 'spoken';
      balloon.append(speaker, spoken);
      article.append(balloon);
    }
    panels.append(article);
  }
  panels.setAttribute('aria-busy', 'false');
  updateText();
  new ResizeObserver(positionBalloons).observe(panels);
  const target = location.hash.slice(1);
  if (episode.panels.some(panel => panel.id === target)) elements(target).scrollIntoView();
}).catch(error => {
  elements('panels').setAttribute('aria-busy', 'false');
  elements('panels').textContent = 'The episode could not load. Please reload to try again.';
  console.error(error);
});
