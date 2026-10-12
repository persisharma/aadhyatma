'use strict';

const content = {
  en: {
    title: 'The Four Princes', framing: 'From infancy to adolescence.',
    collection: 'Collection', kanda: 'Bālakāṇḍa', count: '4 panels', eyebrow: 'EPISODE 05',
    narration: [
      'Kaushalya bore Rama; Kaikeyi, Bharata; Sumitra, Lakshmana and Shatrughna. The palace celebrated.',
      'The brothers grew up studying and training in arms. Rama–Lakshmana and Bharata–Shatrughna were especially close.',
      'The princes were now adolescents. Vishwamitra came to court. Dasharatha welcomed him respectfully.'
    ],
    art: [
      'Dasharatha with the three queens and four infants. Kaushalya holds blue-skinned Rama; Kaikeyi holds Bharata; Sumitra holds Lakshmana and Shatrughna.',
      'The four young brothers listen to Vashishtha, with manuscripts and bows beside them.',
      'Elder Vishwamitra faces Dasharatha at court, with adolescent Rama and Lakshmana beside the sage.',
      'A close-up of Dasharatha, smiling respectfully with his open hand extended toward the sage.'
    ],
    speaker: 'Dasharatha', dialogue: 'Revered sage, how may I serve you?',
    larger: 'Larger text Aa', normal: 'Normal text Aa',
    next: 'Next: A Father’s Difficult Decision →', source: 'Based on Valmiki Ramayana · Bāla 1.18',
    reviewLabel: 'About this preview', reviewNote: 'One-episode layout preview. Editorial and native-device approval remain pending; the published book is unchanged.', previous: 'Previous text-fit diagnostic'
  },
  hi: {
    title: 'चार राजकुमार', framing: 'शैशव से किशोरावस्था तक समय बीतता है।',
    collection: 'संग्रह', kanda: 'बालकाण्ड', count: '४ पैनल', eyebrow: 'प्रसंग ०५',
    narration: [
      'कौसल्या से राम, कैकेयी से भरत और सुमित्रा से लक्ष्मण-शत्रुघ्न जन्मे। महल में उत्सव हुआ।',
      'चारों भाई शिक्षा और शस्त्रविद्या सीखते बड़े हुए। राम-लक्ष्मण और भरत-शत्रुघ्न में गहरा स्नेह था।',
      'राजकुमार अब किशोर थे। विश्वामित्र दरबार आए। दशरथ ने आदर से उनका स्वागत किया।'
    ],
    art: [
      'दशरथ के साथ तीनों रानियाँ और चार शिशु। कौसल्या की गोद में नीले वर्ण वाले राम, कैकेयी की गोद में भरत और सुमित्रा की गोद में लक्ष्मण तथा शत्रुघ्न हैं।',
      'चारों बालक वसिष्ठ से शिक्षा ले रहे हैं। पास में ग्रंथ और धनुष रखे हैं।',
      'दरबार में वृद्ध विश्वामित्र दशरथ के सामने हैं। किशोर राम और लक्ष्मण मुनि के पास खड़े हैं।',
      'दशरथ का निकट दृश्य। वे आदर से मुस्कुराते हुए मुनि की ओर खुली हथेली बढ़ाते हैं।'
    ],
    speaker: 'दशरथ', dialogue: 'मुनिवर, मैं आपकी क्या सेवा करूँ?',
    larger: 'बड़ा अक्षर Aa', normal: 'सामान्य अक्षर Aa',
    next: 'अगला प्रसंग: पिता का कठिन निर्णय →', source: 'वाल्मीकि रामायण पर आधारित · बालकाण्ड १.१८',
    reviewLabel: 'इस पूर्वावलोकन के बारे में', reviewNote: 'एक प्रसंग के विन्यास का पूर्वावलोकन। संपादकीय और मोबाइल उपकरण की जाँच अभी शेष है। प्रकाशित पुस्तक नहीं बदली गई है।', previous: 'पिछला अक्षर-विन्यास परीक्षण'
  }
};
const panelData = [
  { id: 'bk-05-01', image: 'bk-05-01-compact-v1.png' },
  { id: 'bk-05-02', image: 'bk-05-02-compact-v1.png' },
  { id: 'bk-05-03', image: 'bk-05-03-compact-v1.png' },
  { id: 'bk-05-03a', image: 'bk-05-03a-welcome-v1.png' }
];
let language = 'en';
const getElement = id => document.getElementById(id);

function drawBalloon(speech, flowing) {
  const { width, height } = speech.getBoundingClientRect();
  const radiusX = flowing ? 28 : width * 0.42;
  const radiusY = flowing ? 28 : height * 0.42;
  const bottomEdge = flowing
    ? `H ${width * 0.22 + 26} L ${width * 0.22} ${height + 23} L ${width * 0.22} ${height} H ${radiusX}`
    : `H ${radiusX}`;
  const leftEdge = flowing
    ? `V ${radiusY}`
    : `L -22 ${height * 0.9} L 0 ${radiusY}`;
  const outline = `M ${radiusX} 0 H ${width - radiusX} Q ${width} 0 ${width} ${radiusY} V ${height - radiusY} Q ${width} ${height} ${width - radiusX} ${height} ${bottomEdge} Q 0 ${height} 0 ${height - radiusY} ${leftEdge} Q 0 0 ${radiusX} 0 Z`;
  const shape = speech.querySelector('.bubble-shape');
  shape.setAttribute('viewBox', `0 0 ${width} ${height}`);
  shape.querySelector('path').setAttribute('d', outline);
}

function fitSpeech() {
  const panel = getElement('bk-05-03a');
  const speech = panel.querySelector('.speech');
  const artwork = panel.querySelector('.art');
  panel.classList.remove('flow-speech');
  if (speech.offsetHeight > artwork.clientHeight * 0.46) panel.classList.add('flow-speech');
  drawBalloon(speech, panel.classList.contains('flow-speech'));
}

function renderText() {
  const selected = content[language];
  document.documentElement.lang = language;
  document.title = `${selected.title} · Comic preview`;
  for (const name of ['title', 'framing', 'collection', 'kanda', 'count', 'eyebrow', 'next', 'source', 'reviewLabel', 'reviewNote', 'previous']) getElement(name).textContent = selected[name];
  getElement('size').textContent = document.body.classList.contains('large') ? selected.normal : selected.larger;
  for (const choice of ['hi', 'en']) getElement(choice).setAttribute('aria-pressed', String(choice === language));
  for (const [index, data] of panelData.entries()) {
    const panel = getElement(data.id);
    panel.setAttribute('aria-label', language === 'en' ? `Panel ${index + 1} of 4` : `पैनल ${index + 1}, कुल ४`);
    panel.querySelector('.art').alt = selected.art[index];
    if (index < 3) panel.querySelector('.narration').textContent = selected.narration[index];
  }
  document.querySelector('.speaker').textContent = `${selected.speaker}: `;
  document.querySelector('.spoken').textContent = selected.dialogue;
  requestAnimationFrame(fitSpeech);
}

function preserveReadingPosition(action) {
  const anchor = panelData.map(data => getElement(data.id)).find(panel => panel.getBoundingClientRect().bottom > 0);
  const previousTop = anchor?.getBoundingClientRect().top;
  const reading = anchor && previousTop < innerHeight && scrollY > 0;
  action();
  requestAnimationFrame(() => {
    fitSpeech();
    if (reading) window.scrollBy(0, anchor.getBoundingClientRect().top - previousTop);
  });
}

const panels = getElement('panels');
panels.replaceChildren();
for (const [index, data] of panelData.entries()) {
  const panel = document.createElement('article');
  panel.id = data.id;
  panel.className = index === 3 ? 'panel dialogue-panel' : 'panel';
  if (index < 3) {
    const narration = document.createElement('p');
    narration.className = 'narration';
    panel.append(narration);
  } else {
    const speech = document.createElement('p');
    speech.className = 'speech';
    const shape = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    shape.classList.add('bubble-shape');
    shape.setAttribute('aria-hidden', 'true');
    shape.setAttribute('focusable', 'false');
    shape.append(document.createElementNS('http://www.w3.org/2000/svg', 'path'));
    const speaker = document.createElement('span');
    speaker.className = 'speaker sr-only';
    const spoken = document.createElement('span');
    spoken.className = 'spoken';
    speech.append(shape, speaker, spoken);
    panel.append(speech);
  }
  const artwork = document.createElement('img');
  artwork.className = 'art';
  artwork.width = 1448;
  artwork.height = 1086;
  artwork.src = data.image;
  artwork.addEventListener('load', fitSpeech);
  panel.append(artwork);
  panels.append(panel);
}
panels.setAttribute('aria-busy', 'false');
for (const choice of ['hi', 'en']) {
  getElement(choice).addEventListener('click', () => preserveReadingPosition(() => {
    language = choice;
    renderText();
  }));
}
getElement('size').addEventListener('click', () => preserveReadingPosition(() => {
  const large = document.body.classList.toggle('large');
  getElement('size').setAttribute('aria-pressed', String(large));
  renderText();
}));
window.addEventListener('resize', fitSpeech);
document.fonts.ready.then(fitSpeech);
renderText();
