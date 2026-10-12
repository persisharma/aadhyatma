'use strict';

const comicCopy = {
  en: {
    title: 'The Four Princes',
    framing: 'Time passes, from infancy to adolescence.',
    narration: [
      'Kaushalya bore Rama; Kaikeyi, Bharata; Sumitra, Lakshmana and Shatrughna. The palace celebrated.',
      'The brothers grew up studying and training in arms. Rama–Lakshmana and Bharata–Shatrughna were especially close.',
      'The princes were now adolescents. Vishwamitra came to court. Dasharatha welcomed him respectfully and asked:'
    ],
    speaker: 'Dasharatha',
    dialogue: 'Revered sage, how may I serve you?',
    larger: 'Larger text Aa',
    normal: 'Normal text Aa'
  },
  hi: {
    title: 'चार राजकुमार',
    framing: 'शैशव से किशोरावस्था तक समय बीतता है।',
    narration: [
      'कौसल्या से राम, कैकेयी से भरत और सुमित्रा से लक्ष्मण-शत्रुघ्न जन्मे। महल में उत्सव हुआ।',
      'चारों भाई शिक्षा और शस्त्रविद्या सीखते बड़े हुए। राम-लक्ष्मण और भरत-शत्रुघ्न में गहरा स्नेह था।',
      'राजकुमार अब किशोर थे। विश्वामित्र दरबार आए। दशरथ ने आदर से उनका स्वागत किया और पूछा—'
    ],
    speaker: 'दशरथ',
    dialogue: 'मुनिवर, मैं आपकी क्या सेवा करूँ?',
    larger: 'बड़ा अक्षर Aa',
    normal: 'सामान्य अक्षर Aa'
  }
};

let language = 'en';
const getElement = id => document.getElementById(id);

function renderCopy() {
  const selected = comicCopy[language];
  document.documentElement.lang = language;
  getElement('title').textContent = selected.title;
  getElement('framing').textContent = selected.framing;
  getElement('size').textContent = document.body.classList.contains('large') ? selected.normal : selected.larger;
  for (const choice of ['hi', 'en']) getElement(choice).setAttribute('aria-pressed', String(choice === language));
  for (const [index, narration] of selected.narration.entries()) {
    getElement(`bk-05-0${index + 1}`).querySelector('.narration').textContent = narration;
  }
  document.querySelector('.speaker').textContent = `${selected.speaker}: `;
  document.querySelector('.spoken').textContent = selected.dialogue;
}

const panels = getElement('panels');
panels.replaceChildren();
for (const [index] of comicCopy.en.narration.entries()) {
  const panelId = `bk-05-0${index + 1}`;
  const article = document.createElement('article');
  article.id = panelId;
  article.className = 'panel';
  article.setAttribute('aria-label', `Scene ${index + 1}`);
  const artwork = document.createElement('img');
  artwork.className = 'art';
  artwork.src = `${panelId}-compact-v1.png`;
  artwork.alt = '';
  artwork.width = 1448;
  artwork.height = 1086;
  const narration = document.createElement('p');
  narration.className = 'narration';
  article.append(artwork, narration);
  if (index === 2) {
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
for (const choice of ['hi', 'en']) {
  getElement(choice).addEventListener('click', () => {
    language = choice;
    renderCopy();
  });
}
getElement('size').addEventListener('click', () => {
  const large = document.body.classList.toggle('large');
  getElement('size').setAttribute('aria-pressed', String(large));
  renderCopy();
});
renderCopy();
