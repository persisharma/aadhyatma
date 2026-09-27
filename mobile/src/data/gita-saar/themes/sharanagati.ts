/**
 * श्रद्धा और शरणागति — faith and surrender.
 * Refs resolved against the bundled corpus on 2026-09-27.
 */
import type { GitaSaarTheme } from '../types';

const GITA_CORPUS = 'repo:mobile/src/data/gita/';
const GITA_HOLY = 'https://www.holy-bhagavad-gita.org/chapter/';

export const SHARANAGATI_THEME: GitaSaarTheme = {
  id: 'sharanagati',
  titleHi: 'श्रद्धा और शरणागति',
  titleEn: 'Faith and surrender',
  ledeHi:
    'भरोसा कैसे करें? शरण लेने का क्या अर्थ है? गीता में श्रद्धा कोई भावुकता नहीं — वह पाने का रास्ता है; और शरणागति हार नहीं — वह भार उतारना है।',
  ledeEn:
    'How does one trust? What does taking refuge mean? In the Gita faith is not sentiment; it is the way things are received. And surrender is not defeat; it is setting the load down.',
  groups: [
    {
      id: 'shraddha-pati',
      titleHi: 'श्रद्धा पाती है',
      titleEn: 'Faith receives',
      introHi: 'श्रद्धा क्या देती है, और मनुष्य क्या है।',
      introEn: 'What faith yields, and what a person is made of.',
      verses: [
        {
          ref: { chapter: 4, verse: 39 },
          themeHi: 'श्रद्धावान को ज्ञान',
          themeEn: 'The faithful attain knowledge',
          saarHi: 'जो श्रद्धावान है, साधन में लगा है और इन्द्रियों को वश में रखता है, वह ज्ञान पाता है। और ज्ञान पाकर तुरंत परम शांति।',
          saarEn: 'The one who has faith, stays with the practice and holds the senses, attains knowledge. And with knowledge, at once, the highest peace.',
        },
        {
          ref: { chapter: 17, verse: 3 },
          themeHi: 'मनुष्य श्रद्धामय है',
          themeEn: 'A person is their faith',
          saarHi: 'हर मनुष्य की श्रद्धा उसके स्वभाव के अनुसार होती है। मनुष्य श्रद्धामय है — जैसी उसकी श्रद्धा, वैसा वह।',
          saarEn: 'Each person\'s faith follows their nature. A person is made of faith: as their faith is, so are they.',
        },
      ],
    },
    {
      id: 'maya-ke-paar',
      titleHi: 'माया के पार',
      titleEn: 'Past the veil',
      introHi: 'जो अपने बल से पार नहीं होता, शरण से होता है।',
      introEn: 'What cannot be crossed by one\'s own strength is crossed by refuge.',
      verses: [
        {
          ref: { chapter: 7, verse: 14 },
          themeHi: 'दुरत्यय माया',
          themeEn: 'Hard to cross',
          saarHi: 'मेरी यह गुणमयी दैवी माया पार करना कठिन है। जो केवल मेरी शरण लेते हैं, वे इसे पार कर जाते हैं।',
          saarEn: 'This divine veil of Mine, woven of the three strands, is hard to cross. Those who take refuge in Me alone cross it.',
        },
      ],
    },
    {
      id: 'koi-bahar-nahi',
      titleHi: 'कोई बाहर नहीं',
      titleEn: 'No one is outside',
      introHi: 'शरण का द्वार किसी के लिए बंद नहीं।',
      introEn: 'The door of refuge is closed to no one.',
      verses: [
        {
          ref: { chapter: 9, verse: 30 },
          themeHi: 'दुराचारी भी साधु',
          themeEn: 'Even the worst is counted good',
          saarHi: 'यदि दुराचारी से दुराचारी भी अनन्य भाव से मुझे भजता है, तो उसे साधु ही मानना चाहिए, क्योंकि उसने निश्चय ठीक कर लिया है।',
          saarEn: 'If even the worst of wrongdoers worships Me with no other object, that person is to be counted good, for they have resolved rightly.',
        },
        {
          ref: { chapter: 9, verse: 31 },
          themeHi: 'शीघ्र धर्मात्मा',
          themeEn: 'Soon righteous',
          saarHi: 'वह जल्दी ही धर्मात्मा हो जाता है और स्थायी शांति पाता है। अर्जुन, तुम घोषणा कर दो — मेरे भक्त का नाश नहीं होता।',
          saarEn: 'Such a person soon becomes righteous and finds lasting peace. Arjuna, declare it: My devotee never perishes.',
        },
        {
          ref: { chapter: 9, verse: 22 },
          themeHi: 'योगक्षेम',
          themeEn: 'What they lack, I bring',
          saarHi: 'जो अनन्य भाव से मेरा चिंतन करते हुए मेरी उपासना करते हैं, उनका योगक्षेम मैं वहन करता हूँ।',
          saarEn: 'For those who think of Me alone and stay with Me, I carry their welfare: I bring what they lack and keep what they have.',
        },
      ],
    },
    {
      id: 'uddhar',
      titleHi: 'उद्धार',
      titleEn: 'The rescue',
      introHi: 'शरण लेने वाले के लिए कृष्ण स्वयं क्या बनते हैं।',
      introEn: 'What Krishna Himself becomes for the one who takes refuge.',
      verses: [
        {
          ref: { chapter: 12, verse: 6 },
          themeHi: 'सब कर्म अर्पित',
          themeEn: 'All action offered',
          saarHi: 'जो सब कर्म मुझे अर्पित करके, मुझे ही परम मानकर, अनन्य योग से मेरा ध्यान करते हुए मेरी उपासना करते हैं —',
          saarEn: 'Those who offer all their actions to Me, hold Me as the highest, and worship Me with a mind fixed on Me alone —',
        },
        {
          ref: { chapter: 12, verse: 7 },
          themeHi: 'मृत्यु-सागर से उद्धार',
          themeEn: 'Out of the ocean of death',
          saarHi: '— उन मुझमें चित्त लगाए भक्तों का, मृत्युरूप संसार-सागर से, मैं शीघ्र उद्धार करने वाला बन जाता हूँ।',
          saarEn: '— for those whose minds rest in Me, I soon become the one who lifts them out of the ocean of death and change.',
        },
      ],
    },
    {
      id: 'sharan',
      titleHi: 'शरण',
      titleEn: 'Refuge',
      introHi: 'शरणागति के तीन वाक्य — नौवें अध्याय से अंतिम तक।',
      introEn: 'Three sentences of surrender, from the ninth chapter to the last.',
      verses: [
        {
          ref: { chapter: 9, verse: 34 },
          themeHi: 'मुझमें मन लगा',
          themeEn: 'Fix your mind on Me',
          saarHi: 'मुझमें मन लगा, मेरा भक्त बन, मेरा पूजन कर, मुझे प्रणाम कर। इस तरह अपने को मुझसे जोड़कर, मुझे परम मानकर, तू मुझे ही पाएगा।',
          saarEn: 'Fix your mind on Me, be My devotee, worship Me, bow to Me. Joining yourself to Me this way, with Me as the highest, you will come to Me.',
        },
        {
          ref: { chapter: 18, verse: 62 },
          themeHi: 'सर्वभाव से शरण',
          themeEn: 'With your whole being',
          saarHi: 'सर्वभाव से उस ईश्वर की शरण में जाओ। उसकी कृपा से तुम परम शांति और शाश्वत धाम पाओगे।',
          saarEn: 'Take refuge in Him with your whole being. By His grace you will find the highest peace and the eternal abode.',
        },
        {
          ref: { chapter: 18, verse: 66 },
          themeHi: 'केवल मेरी शरण',
          themeEn: 'In Me alone',
          saarHi: 'सब सहारे छोड़कर केवल मेरी शरण में आ। मैं तुझे सब पापों से मुक्त कर दूँगा। चिंता मत कर।',
          saarEn: 'Let go of every other support and take refuge in Me alone. I will free you from all wrong. Do not grieve.',
        },
      ],
    },
  ],
  closingHi: 'शरणागति हार नहीं है — वह भार उतारना है।',
  closingEn: 'Surrender is not defeat. It is setting the load down.',
  status: 'verified',
  source: {
    referenceUrls: [`${GITA_CORPUS}chapter-09.json`, `${GITA_CORPUS}chapter-12.json`, `${GITA_CORPUS}chapter-18.json`, `${GITA_HOLY}9`, `${GITA_HOLY}12`],
    verificationNote:
      '2026-09-27: every ref opened in the bundled corpus JSON; saar lines paraphrase the bundled meanings and add nothing the verse does not say.',
  },
};
