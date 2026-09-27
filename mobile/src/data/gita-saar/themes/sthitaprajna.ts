/**
 * स्थितप्रज्ञ — the portrait of a settled person (chapter 2, 54–72).
 * Refs resolved against the bundled corpus on 2026-09-27.
 */
import type { GitaSaarTheme } from '../types';

const GITA_CORPUS = 'repo:mobile/src/data/gita/';
const GITA_HOLY = 'https://www.holy-bhagavad-gita.org/chapter/';

export const STHITAPRAJNA_THEME: GitaSaarTheme = {
  id: 'sthitaprajna',
  titleHi: 'स्थितप्रज्ञ',
  titleEn: 'What does a settled person look like?',
  ledeHi:
    'अर्जुन एक व्यावहारिक प्रश्न पूछते हैं: जिसकी बुद्धि स्थिर है, वह कैसे बोलता, बैठता, चलता है? कृष्ण का उत्तर दूसरे अध्याय का सबसे प्रसिद्ध चित्र है।',
  ledeEn:
    "Arjuna asks a practical question: how does a person of steady mind speak, sit, walk? Krishna's answer is the most famous portrait in the second chapter.",
  groups: [
    {
      id: 'prashna',
      titleHi: 'प्रश्न',
      titleEn: 'The question',
      introHi: 'लक्षण पूछे जाते हैं, सिद्धांत नहीं।',
      introEn: 'Arjuna asks for signs, not theory.',
      verses: [
        {
          ref: { chapter: 2, verse: 54 },
          themeHi: 'कैसे बोलता, बैठता, चलता है',
          themeEn: 'How does he speak, sit, walk',
          saarHi: 'अर्जुन पूछते हैं: परमात्मा में स्थित, स्थिर बुद्धि वाले मनुष्य के लक्षण क्या हैं? वह कैसे बोलता है, कैसे बैठता है, कैसे चलता है?',
          saarEn: 'Arjuna asks: what are the signs of a person of steady wisdom, settled in the Self? How do they speak, how do they sit, how do they walk?',
        },
      ],
    },
    {
      id: 'chitra',
      titleHi: 'चित्र',
      titleEn: 'The portrait',
      introHi: 'कृष्ण चार श्लोकों में उत्तर देते हैं।',
      introEn: 'Krishna answers in four verses.',
      verses: [
        {
          ref: { chapter: 2, verse: 55 },
          themeHi: 'अपने में संतुष्ट',
          themeEn: 'Content in the Self',
          saarHi: 'जब कोई मन की सारी कामनाएँ छोड़ देता है और अपने-आप से अपने-आप में संतुष्ट रहता है, तब वह स्थितप्रज्ञ कहलाता है।',
          saarEn: 'When a person lets go of every desire of the mind and is content in the Self by the Self, they are called one of steady wisdom.',
        },
        {
          ref: { chapter: 2, verse: 56 },
          themeHi: 'न उद्विग्न, न लालायित',
          themeEn: 'Neither shaken nor craving',
          saarHi: 'दुःख में जिसका मन उद्विग्न नहीं होता, सुख की जिसे लालसा नहीं, जो राग, भय और क्रोध से छूट गया है — वह स्थिर बुद्धि वाला मुनि है।',
          saarEn: 'One whose mind is not shaken in sorrow, who does not crave pleasure, and who is free of attachment, fear and anger, is a sage of steady mind.',
        },
        {
          ref: { chapter: 2, verse: 57 },
          themeHi: 'न हर्ष, न द्वेष',
          themeEn: 'Neither rejoicing nor hating',
          saarHi: 'जो सब जगह आसक्ति से रहित है, शुभ पाकर हर्षित नहीं होता और अशुभ पाकर द्वेष नहीं करता — उसकी बुद्धि स्थिर है।',
          saarEn: 'One who is without attachment everywhere, who neither rejoices at the good nor hates the bad when it comes, has a steady mind.',
        },
        {
          ref: { chapter: 2, verse: 58 },
          themeHi: 'कछुए की तरह',
          themeEn: 'Like the tortoise',
          saarHi: 'जैसे कछुआ अपने अंग समेट लेता है, वैसे जो इन्द्रियों को विषयों से समेट लेता है — उसकी बुद्धि स्थिर हो जाती है।',
          saarEn: 'As a tortoise draws in its limbs, so the one who draws the senses back from their objects comes to a steady mind.',
        },
      ],
    },
    {
      id: 'indriyan-aur-shanti',
      titleHi: 'इन्द्रियाँ और शांति',
      titleEn: 'Senses and peace',
      introHi: 'संसार से भागना नहीं, उसमें रहते हुए शांत रहना।',
      introEn: 'Not fleeing the world, but staying at peace within it.',
      verses: [
        {
          ref: { chapter: 2, verse: 64 },
          themeHi: 'विषयों में रहकर भी',
          themeEn: 'Among objects, yet at peace',
          saarHi: 'जिसका अंतःकरण वश में है, वह राग-द्वेष से मुक्त इन्द्रियों से विषयों में रहते हुए भी प्रसन्नता को पाता है।',
          saarEn: 'The one whose inner being is under control, moving among objects with senses free of pull and push, finds serenity.',
        },
        {
          ref: { chapter: 2, verse: 66 },
          themeHi: 'शांति बिना सुख नहीं',
          themeEn: 'No happiness without peace',
          saarHi: 'जिसका मन-इन्द्रियाँ वश में नहीं, उसमें निश्चय की बुद्धि नहीं; निश्चय के बिना भावना नहीं, भावना के बिना शांति नहीं — और शांति के बिना सुख कहाँ?',
          saarEn: 'For the unsteady there is no settled understanding; without it no depth of feeling; without that no peace; and without peace, where is happiness?',
        },
      ],
    },
    {
      id: 'samudra',
      titleHi: 'समुद्र',
      titleEn: 'The ocean',
      introHi: 'पूरे चित्र की एक उपमा, और उसका अंत।',
      introEn: 'One image for the whole portrait, and its end.',
      verses: [
        {
          ref: { chapter: 2, verse: 70 },
          themeHi: 'भरता है, उफनता नहीं',
          themeEn: 'Filled, never overflowing',
          saarHi: 'जैसे नदियों का जल समुद्र में मिलता रहता है पर समुद्र अपनी मर्यादा में अचल रहता है, वैसे जिसमें भोग आकर भी विकार नहीं लाते — वही शांति पाता है, कामनाओं वाला नहीं।',
          saarEn: 'As rivers keep flowing into the ocean and the ocean stays unmoved within its bounds, the one into whom things come without stirring them finds peace; the one full of wants does not.',
        },
        {
          ref: { chapter: 2, verse: 71 },
          themeHi: 'न मेरा, न मैं',
          themeEn: 'No mine, no I',
          saarHi: 'जो सब कामनाएँ छोड़कर, स्पृहा, ममता और अहंकार के बिना चलता है — वह शांति पाता है।',
          saarEn: 'The one who moves through life having let go of all wants, without longing, without "mine", without "I", finds peace.',
        },
        {
          ref: { chapter: 2, verse: 72 },
          themeHi: 'ब्राह्मी स्थिति',
          themeEn: 'The state of Brahman',
          saarHi: 'यही ब्राह्मी स्थिति है। इसे पाकर कोई मोहित नहीं होता। अंत समय में भी इसमें स्थित हो जाए, तो ब्रह्म-निर्वाण मिलता है।',
          saarEn: 'This is the state of Brahman. Reaching it, no one is deluded again. Settled in it even at the last moment, one attains the peace of Brahman.',
        },
      ],
    },
  ],
  closingHi: 'समुद्र भरता रहता है, फिर भी नहीं उफनता।',
  closingEn: 'The ocean keeps filling and never overflows.',
  status: 'verified',
  source: {
    referenceUrls: [`${GITA_CORPUS}chapter-02.json`, `${GITA_HOLY}2`],
    verificationNote:
      '2026-09-27: every ref opened in the bundled corpus JSON (all chapter 2); saar lines paraphrase the bundled meanings and add nothing the verse does not say.',
  },
};
