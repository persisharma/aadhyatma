/**
 * संशय — the Gita as an answer to a man who cannot decide.
 * Refs resolved against the bundled corpus on 2026-09-27.
 */
import type { GitaSaarTheme } from '../types';

const GITA_CORPUS = 'repo:mobile/src/data/gita/';
const GITA_HOLY = 'https://www.holy-bhagavad-gita.org/chapter/';

export const SANSHAY_THEME: GitaSaarTheme = {
  id: 'sanshay',
  titleHi: 'संशय',
  titleEn: 'When I cannot decide',
  ledeHi:
    'क्या करूँ, क्या न करूँ — निर्णय कैसे लूँ? पूरी गीता एक ऐसे व्यक्ति को कही गई है जो निर्णय नहीं ले पा रहा था। वह उसके लिए निर्णय नहीं करती; संशय काटती है और चुनाव उसे लौटा देती है।',
  ledeEn:
    'What to do, what not to do; how to decide? The whole Gita is spoken to a man who could not decide. It does not decide for him. It cuts the doubt and hands the choice back.',
  groups: [
    {
      id: 'arjun-jaisa',
      titleHi: 'अर्जुन जैसा',
      titleEn: 'Like Arjuna',
      introHi: 'गीता एक असमंजस से शुरू होती है।',
      introEn: 'The Gita begins in indecision.',
      verses: [
        {
          ref: { chapter: 2, verse: 7 },
          themeHi: 'मैं आपका शिष्य हूँ',
          themeEn: 'I am your disciple',
          saarHi: 'अर्जुन कहते हैं: कायरता ने मेरा स्वभाव दबा दिया है, धर्म के बारे में मेरा मन उलझा है। जो निश्चित कल्याण करे वह कहिए। मैं आपका शिष्य हूँ, आपकी शरण हूँ।',
          saarEn: 'Arjuna says: weakness has overtaken me and my mind is confused about what is right. Tell me plainly what is good for me. I am your disciple; I have come to you.',
        },
      ],
    },
    {
      id: 'apna-dharma',
      titleHi: 'अपना धर्म',
      titleEn: 'Your own path',
      introHi: 'चुनाव में पहली कसौटी: क्या यह मेरा है?',
      introEn: 'The first test in a choice: is this mine?',
      verses: [
        {
          ref: { chapter: 3, verse: 35 },
          themeHi: 'गुणहीन भी अपना श्रेष्ठ',
          themeEn: 'Your own, though lacking',
          saarHi: 'दूसरे का धर्म अच्छी तरह निभाने से अपना धर्म श्रेष्ठ है, चाहे उसमें कमी हो। अपने धर्म में मरना भी कल्याण है; दूसरे का धर्म भय देता है।',
          saarEn: 'One\'s own duty, even lacking, is better than another\'s done well. Even to fall in one\'s own duty is good; another\'s path brings fear.',
        },
      ],
    },
    {
      id: 'sanshay-ka-mulya',
      titleHi: 'संशय का मूल्य',
      titleEn: 'What doubt costs',
      introHi: 'न निर्णय लेना भी एक निर्णय है, और उसकी कीमत है।',
      introEn: 'Not deciding is also a decision, and it has a price.',
      verses: [
        {
          ref: { chapter: 4, verse: 40 },
          themeHi: 'संशयी को सुख नहीं',
          themeEn: 'No happiness for the doubter',
          saarHi: 'विवेकहीन, श्रद्धाहीन और संशय में डूबा व्यक्ति गिर जाता है। संशयी के लिए न यह लोक है, न परलोक, न सुख।',
          saarEn: 'The one without discernment, without faith, sunk in doubt, falls. For the doubter there is neither this world, nor the next, nor happiness.',
        },
        {
          ref: { chapter: 4, verse: 41 },
          themeHi: 'ज्ञान संशय काटता है',
          themeEn: 'Knowledge cuts doubt',
          saarHi: 'जिसने योग से कर्मों का बंधन छोड़ दिया और ज्ञान से संशय काट दिया, जो अपने स्वरूप में स्थित है — उसे कर्म नहीं बाँधते।',
          saarEn: 'The one who has released the hold of actions through yoga, cut doubt with knowledge, and stands in their own Self, is not bound by action.',
        },
        {
          ref: { chapter: 4, verse: 42 },
          themeHi: 'ज्ञान की तलवार',
          themeEn: 'The sword of knowledge',
          saarHi: 'इसलिए हृदय में बैठे इस अज्ञान से जन्मे संशय को ज्ञान की तलवार से काटो, योग में स्थित हो, और खड़े हो जाओ।',
          saarEn: 'So cut this doubt, born of ignorance and lodged in the heart, with the sword of knowledge; stand in yoga; and rise.',
        },
      ],
    },
    {
      id: 'man-hi-badha',
      titleHi: 'मन ही बाधा है',
      titleEn: 'The mind is the obstacle',
      introHi: 'निर्णय न ले पाने की जड़ अक्सर विषय नहीं, मन होता है।',
      introEn: 'The root of not being able to decide is often not the question but the mind.',
      verses: [
        {
          ref: { chapter: 6, verse: 33 },
          themeHi: 'टिकता नहीं दिखता',
          themeEn: 'I do not see it holding',
          saarHi: 'अर्जुन कहते हैं: आपने समता का जो योग बताया, मन की चंचलता के कारण मुझे वह टिकता नहीं दिखता।',
          saarEn: 'Arjuna says: this yoga of evenness you have taught, I cannot see it lasting, because the mind will not stay still.',
        },
        {
          ref: { chapter: 6, verse: 34 },
          themeHi: 'हवा को रोकना',
          themeEn: 'Holding the wind',
          saarHi: 'मन चंचल है, मथ देने वाला, ज़िद्दी और बलवान। उसे रोकना हवा को रोकने जितना कठिन है।',
          saarEn: 'The mind is restless, churning, obstinate and strong. Holding it is as hard as holding the wind.',
        },
      ],
    },
    {
      id: 'antim-shabd',
      titleHi: 'अंतिम शब्द',
      titleEn: 'The last word',
      introHi: 'सब कह देने के बाद कृष्ण चुनाव लौटा देते हैं। और अर्जुन का उत्तर।',
      introEn: 'After saying everything, Krishna hands the choice back. And Arjuna answers.',
      verses: [
        {
          ref: { chapter: 18, verse: 63 },
          themeHi: 'जैसा चाहो, वैसा करो',
          themeEn: 'Do as you wish',
          saarHi: 'गुह्य से भी गुह्य यह ज्ञान मैंने तुझे कह दिया। अब इस पर पूरी तरह विचार करके जैसा चाहता है, वैसा कर।',
          saarEn: 'This knowledge, more secret than any secret, I have told you. Now reflect on it fully, and then do as you wish.',
        },
        {
          ref: { chapter: 18, verse: 73 },
          themeHi: 'संदेह गया',
          themeEn: 'The doubt is gone',
          saarHi: 'अर्जुन कहते हैं: आपकी कृपा से मेरा मोह नष्ट हो गया, स्मृति लौट आई। मैं संदेह-रहित खड़ा हूँ। अब मैं आपका कहा करूँगा।',
          saarEn: 'Arjuna says: by your grace my confusion is gone and my memory has returned. I stand free of doubt. I will do as you say.',
        },
      ],
    },
  ],
  closingHi: 'गीता निर्णय नहीं देती; वह संशय काटती है और चुनाव तुम्हें लौटा देती है।',
  closingEn: 'The Gita does not decide for you. It cuts the doubt and hands the choice back.',
  status: 'verified',
  source: {
    referenceUrls: [`${GITA_CORPUS}chapter-02.json`, `${GITA_CORPUS}chapter-04.json`, `${GITA_CORPUS}chapter-18.json`, `${GITA_HOLY}4`, `${GITA_HOLY}18`],
    verificationNote:
      '2026-09-27: every ref opened in the bundled corpus JSON; saar lines paraphrase the bundled meanings and add nothing the verse does not say.',
  },
};
