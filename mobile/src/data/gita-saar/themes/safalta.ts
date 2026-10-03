/**
 * सफलता-असफलता — what the Gita says about winning and losing.
 * Refs resolved against the bundled corpus on 2026-09-27.
 */
import type { GitaSaarTheme } from '../types';

const GITA_CORPUS = 'repo:mobile/src/data/gita/';
const GITA_HOLY = 'https://www.holy-bhagavad-gita.org/chapter/';

export const SAFALTA_THEME: GitaSaarTheme = {
  id: 'safalta',
  titleHi: 'सफलता-असफलता',
  titleEn: 'Success and failure',
  ledeHi:
    'जीत का नशा, हार का बोझ — दोनों से कैसे बचें? गीता सफलता को बुरा नहीं कहती। वह जीत-हार को परिणाम मानती है, और तुम्हें प्रयास।',
  ledeEn:
    'The high of winning, the weight of losing: how does one escape both? The Gita does not call success bad. It treats win and loss as outcomes, and you as the effort.',
  groups: [
    {
      id: 'sam',
      titleHi: 'समान करके',
      titleEn: 'Made equal',
      introHi: 'लड़ाई से पहले का पहला निर्देश।',
      introEn: 'The first instruction before the battle.',
      verses: [
        {
          ref: { chapter: 2, verse: 38 },
          themeHi: 'जय-पराजय समान',
          themeEn: 'Victory and defeat alike',
          saarHi: 'सुख-दुःख, लाभ-हानि, जय-पराजय को समान करके फिर काम में लगो। इस तरह करने से पाप नहीं लगता।',
          saarEn: 'Make pleasure and pain, gain and loss, victory and defeat equal, and then take up the work. Done this way, it brings no wrong.',
        },
      ],
    },
    {
      id: 'adhikar',
      titleHi: 'अधिकार और समत्व',
      titleEn: 'The right, and evenness',
      introHi: 'फल पर पकड़ छोड़ने के तीन श्लोक।',
      introEn: 'Three verses on loosening the grip on the result.',
      verses: [
        {
          ref: { chapter: 2, verse: 47 },
          themeHi: 'फल पर अधिकार नहीं',
          themeEn: 'No right to the fruit',
          saarHi: 'तुम्हारा अधिकार कर्म में है, फल में कभी नहीं। न फल को कारण बनाओ, न कर्म न करने में आसक्ति रखो।',
          saarEn: 'Your right is to the work, never to its results. Do not make the result your reason, and do not lean toward not acting either.',
        },
        {
          ref: { chapter: 2, verse: 48 },
          themeHi: 'सिद्धि-असिद्धि में सम',
          themeEn: 'Even in success and failure',
          saarHi: 'आसक्ति छोड़कर, सफलता-असफलता में सम रहकर, योग में स्थित होकर कर्म करो। समत्व ही योग है।',
          saarEn: 'Give up attachment, stay even in success and failure, and work established in yoga. Evenness is yoga.',
        },
        {
          ref: { chapter: 2, verse: 50 },
          themeHi: 'कुशलता',
          themeEn: 'Skill',
          saarHi: 'समता वाला व्यक्ति यहीं पुण्य-पाप दोनों से ऊपर उठ जाता है। इसलिए योग में लगो — योग ही कर्मों में कुशलता है।',
          saarEn: 'The one with an even mind rises above both merit and sin here. So take to yoga: yoga is skill in action.',
        },
      ],
    },
    {
      id: 'jo-mile',
      titleHi: 'जो मिले',
      titleEn: 'With what comes',
      introHi: 'परिणाम से न बँधने वाले का चित्र।',
      introEn: 'The picture of one not bound by outcomes.',
      verses: [
        {
          ref: { chapter: 4, verse: 22 },
          themeHi: 'अपने-आप जो मिले',
          themeEn: 'Content with what comes',
          saarHi: 'जो बिना माँगे मिले उसमें संतुष्ट, द्वंद्वों से ऊपर, ईर्ष्या-रहित, सिद्धि-असिद्धि में सम — वह कर्म करते हुए भी बँधता नहीं।',
          saarEn: 'Content with what comes unasked, above the pairs of opposites, free of envy, even in success and failure: such a person acts and is not bound.',
        },
        {
          ref: { chapter: 5, verse: 10 },
          themeHi: 'कमल का पत्ता',
          themeEn: 'The lotus leaf',
          saarHi: 'जो कर्म भगवान को अर्पित करके, आसक्ति छोड़कर करता है, वह पाप से वैसे ही अछूता रहता है जैसे कमल का पत्ता जल से।',
          saarEn: 'The one who works offering the action to God and letting go of attachment is untouched by wrong, as a lotus leaf is untouched by water.',
        },
      ],
    },
    {
      id: 'karta',
      titleHi: 'कर्ता',
      titleEn: 'The doer',
      introHi: 'अंतिम अध्याय में सात्त्विक कर्ता की परिभाषा, और एक चेतावनी।',
      introEn: 'The last chapter\'s definition of the sattvic doer, and one warning.',
      verses: [
        {
          ref: { chapter: 18, verse: 26 },
          themeHi: 'सात्त्विक कर्ता',
          themeEn: 'The sattvic doer',
          saarHi: 'जो कर्ता आसक्ति-रहित है, "मैं" नहीं कहता, धैर्य और उत्साह से भरा है, और सिद्धि-असिद्धि में विकार-रहित है — वह सात्त्विक कहलाता है।',
          saarEn: 'A doer free of attachment, without "I did it", full of steadiness and enthusiasm, unmoved by success or failure, is called sattvic.',
        },
        {
          ref: { chapter: 18, verse: 59 },
          themeHi: 'अहंकार का निश्चय झूठा',
          themeEn: 'Ego\'s resolve does not hold',
          saarHi: 'अहंकार के सहारे तू सोचता है कि मैं नहीं लड़ूँगा — यह निश्चय झूठा है। तेरा स्वभाव तुझे लगा ही देगा।',
          saarEn: 'Leaning on ego you think "I will not fight"; that resolve is hollow. Your own nature will set you to it.',
        },
      ],
    },
  ],
  closingHi: 'जीत-हार परिणाम हैं; तुम प्रयास हो।',
  closingEn: 'Win and loss are outcomes. You are the effort.',
  status: 'verified',
  source: {
    referenceUrls: [`${GITA_CORPUS}chapter-02.json`, `${GITA_CORPUS}chapter-04.json`, `${GITA_CORPUS}chapter-18.json`, `${GITA_HOLY}2`, `${GITA_HOLY}18`],
    verificationNote:
      '2026-09-27: every ref opened in the bundled corpus JSON; saar lines paraphrase the bundled meanings and add nothing the verse does not say.',
  },
};
