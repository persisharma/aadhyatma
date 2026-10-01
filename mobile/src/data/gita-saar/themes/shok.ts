/**
 * शोक — Krishna's first teaching, given to a man in grief (chapter 2).
 * Refs resolved against the bundled corpus on 2026-09-27.
 */
import type { GitaSaarTheme } from '../types';

const GITA_CORPUS = 'repo:mobile/src/data/gita/';
const GITA_HOLY = 'https://www.holy-bhagavad-gita.org/chapter/';

export const SHOK_THEME: GitaSaarTheme = {
  id: 'shok',
  titleHi: 'शोक',
  titleEn: 'When someone is gone',
  ledeHi:
    'किसी के जाने का दुःख कैसे सहें? गीता का पहला उपदेश एक शोक में डूबे व्यक्ति को दिया गया था। कृष्ण दुःख को छोटा नहीं करते; वे बताते हैं कि जो गया, वह क्या था — और जो था, वह कहाँ है।',
  ledeEn:
    "How does one bear the loss of someone? The Gita's first teaching was given to a man drowning in grief. Krishna does not belittle the sorrow. He says what it was that left, and where what was still is.",
  groups: [
    {
      id: 'pehla-vakya',
      titleHi: 'कृष्ण का पहला वाक्य',
      titleEn: "Krishna's first words",
      introHi: 'पूरी गीता में भगवान का पहला वाक्य शोक पर है।',
      introEn: "The first thing Krishna says in the whole Gita is about grief.",
      verses: [
        {
          ref: { chapter: 2, verse: 11 },
          themeHi: 'शोक के योग्य नहीं',
          themeEn: 'Not worth grieving',
          saarHi: 'तुम उनके लिए शोक कर रहे हो जिनके लिए शोक नहीं बनता, और साथ में ज्ञान की बातें भी कह रहे हो। ज्ञानी न जीवित के लिए शोक करते हैं, न मृत के लिए।',
          saarEn: 'You grieve for those who are not worth grief, and speak words of wisdom while doing so. The wise grieve neither for the living nor for the dead.',
        },
        {
          ref: { chapter: 2, verse: 12 },
          themeHi: 'कभी नहीं था, ऐसा नहीं',
          themeEn: 'Never was there a time',
          saarHi: 'ऐसा कोई समय नहीं था जब मैं नहीं था, तुम नहीं थे, ये राजा नहीं थे। और आगे भी ऐसा नहीं होगा कि हम न रहें।',
          saarEn: 'There was never a time when I was not, or you, or these kings. Nor will there be a time when we cease to be.',
        },
        {
          ref: { chapter: 2, verse: 13 },
          themeHi: 'देह बदलती है',
          themeEn: 'The body changes',
          saarHi: 'जैसे इसी शरीर में बचपन, जवानी और बुढ़ापा आते हैं, वैसे ही देही को दूसरा शरीर मिलता है। धीर व्यक्ति इसमें मोहित नहीं होता।',
          saarEn: 'Just as childhood, youth and old age come to this one body, the dweller passes into another body. The steady person is not confused by this.',
        },
      ],
    },
    {
      id: 'jo-nahi-marta',
      titleHi: 'जो नहीं मरता',
      titleEn: 'What does not die',
      introHi: 'शोक जिसके लिए है, उसका असली स्वरूप क्या है।',
      introEn: 'What the one we grieve for really is.',
      verses: [
        {
          ref: { chapter: 2, verse: 20 },
          themeHi: 'अजन्मा, नित्य',
          themeEn: 'Unborn, undying',
          saarHi: 'यह न जन्मता है, न मरता है। यह अजन्मा, नित्य, शाश्वत और पुरातन है। शरीर के मारे जाने पर भी यह नहीं मारा जाता।',
          saarEn: 'It is not born and it does not die. It is unborn, eternal, everlasting and ancient. When the body is killed, it is not killed.',
        },
        {
          ref: { chapter: 2, verse: 22 },
          themeHi: 'पुराने वस्त्र',
          themeEn: 'Worn-out clothes',
          saarHi: 'जैसे मनुष्य पुराने कपड़े उतारकर नये पहन लेता है, वैसे ही देही पुराने शरीर छोड़कर नये में चला जाता है।',
          saarEn: 'As a person takes off worn-out clothes and puts on new ones, the dweller leaves worn-out bodies and enters new ones.',
        },
        {
          ref: { chapter: 2, verse: 25 },
          themeHi: 'अचिन्त्य, निर्विकार',
          themeEn: 'Unthinkable, unchanging',
          saarHi: 'यह दिखता नहीं, सोच में समाता नहीं, बदलता नहीं। इसे ऐसा जानकर शोक की जगह नहीं रहती।',
          saarEn: 'It cannot be seen, cannot be grasped by thought, does not change. Knowing it to be so, there is no place left for grief.',
        },
      ],
    },
    {
      id: 'nishchit',
      titleHi: 'निश्चित है',
      titleEn: 'It is certain',
      introHi: 'जो टाला नहीं जा सकता, उसके लिए शोक का अर्थ क्या है।',
      introEn: 'What grief means for something that cannot be turned away.',
      verses: [
        {
          ref: { chapter: 2, verse: 27 },
          themeHi: 'जन्मे की मृत्यु',
          themeEn: 'Death for the born',
          saarHi: 'जो जन्मा है उसकी मृत्यु निश्चित है, और जो मरा है उसका जन्म निश्चित है। जो टल नहीं सकता, उसके लिए शोक नहीं बनता।',
          saarEn: 'For the born, death is certain; for the dead, birth is certain. What cannot be avoided is not a cause for grief.',
        },
        {
          ref: { chapter: 2, verse: 28 },
          themeHi: 'बीच का दिखना',
          themeEn: 'Only the middle is seen',
          saarHi: 'सब प्राणी जन्म से पहले अप्रकट थे, बीच में प्रकट दिखते हैं, और अंत में फिर अप्रकट हो जाते हैं। इसमें शोक की बात क्या है?',
          saarEn: 'All beings are unseen before birth, seen in the middle, and unseen again after. What is there in this to grieve?',
        },
      ],
    },
    {
      id: 'isliye',
      titleHi: 'इसलिए',
      titleEn: 'Therefore',
      introHi: 'पूरे तर्क का निष्कर्ष एक पंक्ति में।',
      introEn: 'The whole argument, closed in one line.',
      verses: [
        {
          ref: { chapter: 2, verse: 30 },
          themeHi: 'अवध्य',
          themeEn: 'Cannot be slain',
          saarHi: 'हर शरीर में रहने वाला यह देही सदा अवध्य है — इसे मारा नहीं जा सकता। इसलिए किसी भी प्राणी के लिए शोक नहीं बनता।',
          saarEn: 'The dweller in every body can never be slain. Therefore there is no being for whom grief is owed.',
        },
      ],
    },
  ],
  closingHi: 'जो गया वह वस्त्र था; जो था, वह अब भी है।',
  closingEn: 'What left was the garment. What was, still is.',
  status: 'verified',
  source: {
    referenceUrls: [`${GITA_CORPUS}chapter-02.json`, `${GITA_HOLY}2`],
    verificationNote:
      '2026-09-27: every ref opened in the bundled corpus JSON (all chapter 2); saar lines paraphrase the bundled meanings and add nothing the verse does not say.',
  },
};
