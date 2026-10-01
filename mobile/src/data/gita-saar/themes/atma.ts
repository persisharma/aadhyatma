/**
 * मृत्यु और आत्मा — what am I? The self that outlives the body.
 * Refs resolved against the bundled corpus on 2026-09-27.
 */
import type { GitaSaarTheme } from '../types';

const GITA_CORPUS = 'repo:mobile/src/data/gita/';
const GITA_HOLY = 'https://www.holy-bhagavad-gita.org/chapter/';

export const ATMA_THEME: GitaSaarTheme = {
  id: 'atma',
  titleHi: 'मृत्यु और आत्मा',
  titleEn: 'What am I?',
  ledeHi:
    'शरीर के भीतर वह क्या है जो "मैं" कहता है? गीता का पहला और सबसे दोहराया गया उत्तर यहीं है: जो न काटा जा सकता है, न जलाया, न भिगोया, न सुखाया।',
  ledeEn:
    'What is it inside the body that says "I"? The Gita\'s first and most repeated answer is here: that which cannot be cut, burned, wetted or dried.',
  groups: [
    {
      id: 'avinashi',
      titleHi: 'अविनाशी',
      titleEn: 'Indestructible',
      introHi: 'शरीर का अंत है; जो शरीर में है, उसका नहीं।',
      introEn: 'The body ends; what is in the body does not.',
      verses: [
        {
          ref: { chapter: 2, verse: 17 },
          themeHi: 'जिससे सब व्याप्त है',
          themeEn: 'By which all is pervaded',
          saarHi: 'अविनाशी उसे जानो जिससे यह सारा संसार व्याप्त है। इस अविनाशी का नाश कोई नहीं कर सकता।',
          saarEn: 'Know that to be indestructible by which all this is pervaded. No one can destroy that which does not perish.',
        },
        {
          ref: { chapter: 2, verse: 18 },
          themeHi: 'देह का अंत है',
          themeEn: 'Bodies have an end',
          saarHi: 'अविनाशी, अप्रमेय और नित्य देही के ये शरीर अंत वाले कहे गए हैं। इसलिए, अर्जुन, अपना काम करो।',
          saarEn: 'These bodies of the indestructible, immeasurable, eternal dweller are said to have an end. So, Arjuna, do your work.',
        },
        {
          ref: { chapter: 2, verse: 19 },
          themeHi: 'न मारता, न मरता',
          themeEn: 'Neither slays nor is slain',
          saarHi: 'जो इसे मारने वाला मानता है और जो इसे मरा मानता है, दोनों नहीं जानते। यह न मारता है, न मारा जाता है।',
          saarEn: 'The one who thinks it slays and the one who thinks it is slain, neither knows. It does not slay, nor is it slain.',
        },
      ],
    },
    {
      id: 'swaroop',
      titleHi: 'स्वरूप',
      titleEn: 'Its nature',
      introHi: 'चार श्लोक जो हर किसी ने कभी न कभी सुने हैं।',
      introEn: 'Four verses almost everyone has heard at some point.',
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
          saarHi: 'जैसे मनुष्य पुराने कपड़े उतारकर नये पहनता है, वैसे देही पुराने शरीर छोड़कर नये में चला जाता है।',
          saarEn: 'As a person takes off worn-out clothes and puts on new ones, the dweller leaves worn-out bodies and enters new ones.',
        },
        {
          ref: { chapter: 2, verse: 23 },
          themeHi: 'शस्त्र, अग्नि, जल, वायु',
          themeEn: 'Weapon, fire, water, wind',
          saarHi: 'शस्त्र इसे काट नहीं सकते, आग जला नहीं सकती, जल भिगो नहीं सकता, हवा सुखा नहीं सकती।',
          saarEn: 'Weapons cannot cut it, fire cannot burn it, water cannot wet it, wind cannot dry it.',
        },
        {
          ref: { chapter: 2, verse: 24 },
          themeHi: 'सर्वव्यापी, अचल',
          themeEn: 'All-pervading, unmoving',
          saarHi: 'यह अछेद्य, अदाह्य, अक्लेद्य और अशोष्य है। यह नित्य, सबमें व्याप्त, अचल, स्थिर और सनातन है।',
          saarEn: 'It cannot be cut, burned, wetted or dried. It is eternal, present in all, unmoving, steady and ancient.',
        },
        {
          ref: { chapter: 2, verse: 25 },
          themeHi: 'अव्यक्त, अचिन्त्य',
          themeEn: 'Unseen, unthinkable',
          saarHi: 'यह दिखता नहीं, सोच में समाता नहीं, बदलता नहीं। इसे ऐसा जानकर शोक की जगह नहीं रहती।',
          saarEn: 'It cannot be seen, cannot be grasped by thought, does not change. Knowing it to be so, there is no place left for grief.',
        },
      ],
    },
    {
      id: 'antkaal',
      titleHi: 'अंत काल',
      titleEn: 'At the end',
      introHi: 'अंत समय का स्मरण क्या तय करता है।',
      introEn: 'What the last remembrance decides.',
      verses: [
        {
          ref: { chapter: 8, verse: 5 },
          themeHi: 'अंत में मेरा स्मरण',
          themeEn: 'Remembering Me at the end',
          saarHi: 'जो अंत समय में मेरा स्मरण करते हुए शरीर छोड़ता है, वह मेरे स्वरूप को पाता है — इसमें संदेह नहीं।',
          saarEn: 'Whoever leaves the body at the end remembering Me alone comes to My being; of this there is no doubt.',
        },
        {
          ref: { chapter: 8, verse: 6 },
          themeHi: 'जैसा भाव, वैसी गति',
          themeEn: 'As the thought, so the going',
          saarHi: 'मनुष्य अंत में जिस भाव का स्मरण करते हुए शरीर छोड़ता है, उसी भाव से भावित होकर उसी को पाता है।',
          saarEn: 'Whatever a person is thinking of when they leave the body at the end, that is what they reach, shaped by that constant thought.',
        },
      ],
    },
    {
      id: 'ansh',
      titleHi: 'अंश',
      titleEn: 'A fragment',
      introHi: 'उत्तर का अंतिम शब्द।',
      introEn: 'The last word of the answer.',
      verses: [
        {
          ref: { chapter: 15, verse: 7 },
          themeHi: 'मेरा ही सनातन अंश',
          themeEn: 'An eternal portion of Me',
          saarHi: 'इस संसार में जीव बना हुआ आत्मा मेरा ही सनातन अंश है। वह प्रकृति में स्थित मन और पाँच इन्द्रियों को अपना मान लेता है।',
          saarEn: 'The living self in this world is an eternal portion of Me. It draws to itself the mind and the five senses that rest in nature, and takes them as its own.',
        },
      ],
    },
  ],
  closingHi: 'शरीर वस्त्र है; तुम पहनने वाले हो।',
  closingEn: 'The body is the garment. You are the one who wears it.',
  status: 'verified',
  source: {
    referenceUrls: [`${GITA_CORPUS}chapter-02.json`, `${GITA_CORPUS}chapter-08.json`, `${GITA_CORPUS}chapter-15.json`, `${GITA_HOLY}2`, `${GITA_HOLY}8`],
    verificationNote:
      '2026-09-27: every ref opened in the bundled corpus JSON; saar lines paraphrase the bundled meanings and add nothing the verse does not say.',
  },
};
