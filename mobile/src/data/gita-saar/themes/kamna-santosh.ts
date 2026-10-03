/**
 * कामना और संतोष — desire, and where contentment actually is.
 * Refs resolved against the bundled corpus on 2026-09-27.
 */
import type { GitaSaarTheme } from '../types';

const GITA_CORPUS = 'repo:mobile/src/data/gita/';
const GITA_HOLY = 'https://www.holy-bhagavad-gita.org/chapter/';

export const KAMNA_SANTOSH_THEME: GitaSaarTheme = {
  id: 'kamna-santosh',
  titleHi: 'कामना और संतोष',
  titleEn: 'Desire and contentment',
  ledeHi:
    'चाहत ख़त्म क्यों नहीं होती? गीता कामना को दबाने की बात नहीं करती; वह बताती है कि वह क्या है, कहाँ से खाती है, और जो सुख बाहर ढूँढा जा रहा है वह पहले से कहाँ है।',
  ledeEn:
    'Why does wanting never end? The Gita does not ask you to crush desire. It says what desire is, what it feeds on, and where the happiness being sought outside already is.',
  groups: [
    {
      id: 'shatru',
      titleHi: 'नित्य वैरी',
      titleEn: 'The constant enemy',
      introHi: 'कामना का असली चेहरा।',
      introEn: 'The true face of desire.',
      verses: [
        {
          ref: { chapter: 3, verse: 37 },
          themeHi: 'काम ही क्रोध',
          themeEn: 'Desire, and its twin anger',
          saarHi: 'यह काम है, और यही क्रोध है — रजोगुण से जन्मा, कभी न भरने वाला, महापापी। इसे ही यहाँ शत्रु जानो।',
          saarEn: 'It is desire, and it is anger, born of rajas, never satisfied, deeply harmful. Know this as the enemy here.',
        },
        {
          ref: { chapter: 3, verse: 39 },
          themeHi: 'आग की तरह अतृप्त',
          themeEn: 'Insatiable like fire',
          saarHi: 'आग की तरह कभी तृप्त न होने वाले, विवेकियों के इस नित्य वैरी काम से मनुष्य का विवेक ढका रहता है।',
          saarEn: 'By this constant enemy of the discerning, desire, insatiable as fire, a person\'s understanding stays covered.',
        },
        {
          ref: { chapter: 3, verse: 41 },
          themeHi: 'पहले इन्द्रियाँ',
          themeEn: 'Check it at the senses',
          saarHi: 'इसलिए पहले इन्द्रियों को वश में करो, फिर ज्ञान और विवेक को नष्ट करने वाले इस काम को मारो।',
          saarEn: 'So first bring the senses under control, then strike down this desire that destroys knowledge and discernment.',
        },
      ],
    },
    {
      id: 'bhog-ka-swabhav',
      titleHi: 'भोग का स्वभाव',
      titleEn: 'The nature of pleasure',
      introHi: 'जो सुख बाहर से आता है, उसकी उम्र कितनी है।',
      introEn: 'How long the pleasure that comes from outside lasts.',
      verses: [
        {
          ref: { chapter: 5, verse: 22 },
          themeHi: 'आदि-अंत वाले सुख',
          themeEn: 'Joys with a beginning and an end',
          saarHi: 'इन्द्रियों और विषयों के संयोग से जो भोग मिलते हैं, वे आदि-अंत वाले हैं और दुःख के ही कारण। विवेकी उनमें रमता नहीं।',
          saarEn: 'The pleasures that come from the senses meeting their objects have a beginning and an end, and are sources of sorrow. The wise do not rest in them.',
        },
        {
          ref: { chapter: 5, verse: 21 },
          themeHi: 'भीतर का सुख',
          themeEn: 'The joy within',
          saarHi: 'बाहरी स्पर्शों में आसक्ति-रहित मन जो सुख आत्मा में है उसे पाता है, और ब्रह्म में स्थित होकर अक्षय सुख का अनुभव करता है।',
          saarEn: 'A mind unattached to outer contacts finds the happiness that is in the Self, and resting in Brahman tastes a joy that does not run out.',
        },
      ],
    },
    {
      id: 'chhootna',
      titleHi: 'छूटना',
      titleEn: 'Letting go',
      introHi: 'कामना छोड़ने का अर्थ निष्क्रिय होना नहीं है।',
      introEn: 'Letting go of wanting does not mean going idle.',
      verses: [
        {
          ref: { chapter: 6, verse: 4 },
          themeHi: 'योगारूढ़',
          themeEn: 'Established in yoga',
          saarHi: 'जब कोई न इन्द्रियों के भोगों में आसक्त है, न कर्मों में, और सब संकल्प छोड़ चुका है — तब वह योगारूढ़ कहलाता है।',
          saarEn: 'When a person is attached neither to the objects of the senses nor to their actions, and has let go of every scheme, they are said to be established in yoga.',
        },
        {
          ref: { chapter: 2, verse: 71 },
          themeHi: 'निःस्पृह',
          themeEn: 'Without longing',
          saarHi: 'जो सब कामनाएँ छोड़कर स्पृहा, ममता और अहंकार के बिना चलता है — वही शांति पाता है।',
          saarEn: 'The one who moves through life having let go of all wants, without longing, without "mine", without "I", finds peace.',
        },
        {
          ref: { chapter: 2, verse: 70 },
          themeHi: 'समुद्र',
          themeEn: 'The ocean',
          saarHi: 'जैसे नदियाँ समुद्र में मिलती रहती हैं पर समुद्र अचल रहता है, वैसे जिसमें भोग आकर भी विकार नहीं लाते, वही शांति पाता है — कामनाओं वाला नहीं।',
          saarEn: 'As rivers keep flowing into an unmoving ocean, the one into whom things come without stirring them finds peace; the one full of wants does not.',
        },
      ],
    },
    {
      id: 'dwar',
      titleHi: 'द्वार',
      titleEn: 'The gate',
      introHi: 'कामना अकेली नहीं चलती।',
      introEn: 'Desire does not travel alone.',
      verses: [
        {
          ref: { chapter: 16, verse: 21 },
          themeHi: 'काम, क्रोध, लोभ',
          themeEn: 'Lust, anger, greed',
          saarHi: 'काम, क्रोध और लोभ — ये तीन नरक के द्वार हैं, जो आत्मा का पतन करते हैं। इन्हें छोड़ने की बात गीता सीधे कहती है।',
          saarEn: 'Lust, anger and greed are three gates to ruin; they drag the self down. The Gita says plainly that these three are to be left.',
        },
      ],
    },
  ],
  closingHi: 'जो बाहर ढूँढते हो, वह भीतर पहले से है।',
  closingEn: 'What you seek outside is already within.',
  status: 'verified',
  source: {
    referenceUrls: [`${GITA_CORPUS}chapter-03.json`, `${GITA_CORPUS}chapter-05.json`, `${GITA_CORPUS}chapter-02.json`, `${GITA_HOLY}3`, `${GITA_HOLY}5`],
    verificationNote:
      '2026-09-27: every ref opened in the bundled corpus JSON; saar lines paraphrase the bundled meanings and add nothing the verse does not say.',
  },
};
