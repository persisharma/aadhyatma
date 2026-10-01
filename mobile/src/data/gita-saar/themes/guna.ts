/**
 * गुण — why the mood changes: the three strands of nature (chapter 14).
 * Refs resolved against the bundled corpus on 2026-09-27.
 */
import type { GitaSaarTheme } from '../types';

const GITA_CORPUS = 'repo:mobile/src/data/gita/';
const GITA_HOLY = 'https://www.holy-bhagavad-gita.org/chapter/';

export const GUNA_THEME: GitaSaarTheme = {
  id: 'guna',
  titleHi: 'गुण',
  titleEn: 'Why do I feel this way?',
  ledeHi:
    'कभी हल्का, कभी बेचैन, कभी भारी — मूड क्यों बदलते हैं? गीता के पास इसका एक शब्द है: गुण। तीन धागे, जो बारी-बारी ऊपर आते हैं। उन्हें पहचानना ही पहला उपाय है।',
  ledeEn:
    'Sometimes light, sometimes restless, sometimes heavy. Why does the mood change? The Gita has a word for it: guna. Three strands that take turns rising. Recognising which one is up is the first remedy.',
  groups: [
    {
      id: 'teen-dhage',
      titleHi: 'तीन धागे',
      titleEn: 'Three strands',
      introHi: 'सत्त्व, रज, तम — प्रकृति के तीन गुण, और हर एक कैसे बाँधता है।',
      introEn: 'Sattva, rajas, tamas: the three qualities of nature, and how each one binds.',
      verses: [
        {
          ref: { chapter: 14, verse: 5 },
          themeHi: 'देह में बाँधते हैं',
          themeEn: 'They bind in the body',
          saarHi: 'प्रकृति से जन्मे तीन गुण — सत्त्व, रज और तम — अविनाशी देही को शरीर में बाँध देते हैं।',
          saarEn: 'Three qualities born of nature, sattva, rajas and tamas, bind the undying dweller into the body.',
        },
        {
          ref: { chapter: 14, verse: 6 },
          themeHi: 'सत्त्व: प्रकाश',
          themeEn: 'Sattva: clarity',
          saarHi: 'सत्त्व निर्मल है, इसलिए प्रकाश देने वाला और निर्दोष है। वह भी बाँधता है — सुख और ज्ञान की आसक्ति से।',
          saarEn: 'Sattva is clear, so it illumines and is free of harm. Yet it too binds, through attachment to happiness and to knowing.',
        },
        {
          ref: { chapter: 14, verse: 7 },
          themeHi: 'रज: तृष्णा',
          themeEn: 'Rajas: craving',
          saarHi: 'रज राग-स्वरूप है, तृष्णा और आसक्ति को जन्म देता है। वह देही को कर्मों की आसक्ति से बाँधता है।',
          saarEn: 'Rajas is the nature of passion; it breeds thirst and attachment. It binds the dweller through attachment to activity.',
        },
        {
          ref: { chapter: 14, verse: 8 },
          themeHi: 'तम: मोह',
          themeEn: 'Tamas: dullness',
          saarHi: 'तम अज्ञान से जन्मा है और सब देहधारियों को मोहित करता है। वह प्रमाद, आलस्य और नींद से बाँधता है।',
          saarEn: 'Tamas is born of ignorance and clouds every embodied being. It binds through carelessness, laziness and sleep.',
        },
      ],
    },
    {
      id: 'kaun-kab',
      titleHi: 'कौन कब जीतता है',
      titleEn: 'Which one is up',
      introHi: 'ये तीनों एक साथ नहीं रहते; बारी-बारी एक-दूसरे को दबाते हैं।',
      introEn: 'The three do not stay level; each rises by pressing the other two down.',
      verses: [
        {
          ref: { chapter: 14, verse: 9 },
          themeHi: 'सुख, कर्म, प्रमाद',
          themeEn: 'Happiness, action, heedlessness',
          saarHi: 'सत्त्व सुख में लगाकर जीतता है, रज कर्म में लगाकर, और तम ज्ञान को ढककर प्रमाद में लगाकर।',
          saarEn: 'Sattva wins by binding to happiness, rajas by binding to action, and tamas by covering knowledge and binding to neglect.',
        },
        {
          ref: { chapter: 14, verse: 10 },
          themeHi: 'बारी-बारी',
          themeEn: 'By turns',
          saarHi: 'कभी रज और तम को दबाकर सत्त्व बढ़ता है, कभी सत्त्व और तम को दबाकर रज, कभी सत्त्व और रज को दबाकर तम। मूड इसी उतार-चढ़ाव का नाम है।',
          saarEn: 'Now sattva rises over rajas and tamas, now rajas over sattva and tamas, now tamas over the other two. A mood is the name for this rise and fall.',
        },
      ],
    },
    {
      id: 'pehchan',
      titleHi: 'पहचान',
      titleEn: 'How to tell',
      introHi: 'अभी कौन-सा गुण ऊपर है — इसके तीन लक्षण।',
      introEn: 'Three signs of which strand is up right now.',
      verses: [
        {
          ref: { chapter: 14, verse: 11 },
          themeHi: 'हर द्वार पर प्रकाश',
          themeEn: 'Light at every gate',
          saarHi: 'जब इस शरीर के हर द्वार में — इन्द्रियों और मन में — प्रकाश और विवेक दिखे, तब जानो कि सत्त्व बढ़ा हुआ है।',
          saarEn: 'When light and discernment show at every gate of this body, in the senses and the mind, know that sattva is up.',
        },
        {
          ref: { chapter: 14, verse: 12 },
          themeHi: 'लोभ, हलचल, स्पृहा',
          themeEn: 'Greed, restlessness, longing',
          saarHi: 'लोभ, प्रवृत्ति, नये-नये कामों का आरम्भ, अशांति और स्पृहा — ये रज के बढ़ने पर पैदा होते हैं।',
          saarEn: 'Greed, busyness, the starting of new undertakings, unrest and longing arise when rajas is up.',
        },
        {
          ref: { chapter: 14, verse: 13 },
          themeHi: 'अँधेरा, आलस्य, मोह',
          themeEn: 'Darkness, inertia, delusion',
          saarHi: 'अप्रकाश, अप्रवृत्ति, प्रमाद और मोह — ये तम के बढ़ने पर पैदा होते हैं।',
          saarEn: 'Darkness, inaction, carelessness and delusion arise when tamas is up.',
        },
      ],
    },
    {
      id: 'phal-aur-paar',
      titleHi: 'फल और पार',
      titleEn: 'What each yields, and beyond',
      introHi: 'हर गुण क्या देता है, और तीनों के पार क्या है।',
      introEn: 'What each strand yields, and what lies beyond all three.',
      verses: [
        {
          ref: { chapter: 14, verse: 17 },
          themeHi: 'ज्ञान, लोभ, मोह',
          themeEn: 'Knowledge, greed, delusion',
          saarHi: 'सत्त्व से ज्ञान पैदा होता है, रज से लोभ, और तम से प्रमाद, मोह और अज्ञान।',
          saarEn: 'From sattva comes knowledge, from rajas greed, and from tamas carelessness, delusion and ignorance.',
        },
        {
          ref: { chapter: 14, verse: 20 },
          themeHi: 'तीनों के पार',
          themeEn: 'Beyond the three',
          saarHi: 'जो देही इन तीनों गुणों के पार चला जाता है, वह जन्म, मृत्यु, बुढ़ापे और दुःख से छूटकर अमरता का अनुभव करता है।',
          saarEn: 'The dweller who crosses beyond these three strands is freed from birth, death, old age and sorrow, and tastes what does not die.',
        },
        {
          ref: { chapter: 17, verse: 2 },
          themeHi: 'श्रद्धा भी तीन रंग की',
          themeEn: 'Even faith takes a colour',
          saarHi: 'मनुष्य की स्वभाव से उपजी श्रद्धा भी तीन तरह की होती है — सात्त्विक, राजस और तामस। गुण भीतर तक जाते हैं।',
          saarEn: 'Even a person\'s natural faith is of three kinds: sattvic, rajasic, tamasic. The strands reach all the way in.',
        },
      ],
    },
  ],
  closingHi: 'मूड तुम नहीं हो — वह गुण है जो अभी ऊपर है।',
  closingEn: 'The mood is not you. It is the strand that is up right now.',
  status: 'verified',
  source: {
    referenceUrls: [`${GITA_CORPUS}chapter-14.json`, `${GITA_CORPUS}chapter-17.json`, `${GITA_HOLY}14`],
    verificationNote:
      '2026-09-27: every ref opened in the bundled corpus JSON; saar lines paraphrase the bundled meanings and add nothing the verse does not say.',
  },
};
