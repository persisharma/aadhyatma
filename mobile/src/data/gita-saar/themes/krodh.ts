/**
 * क्रोध — where anger comes from and where the Gita says to stop it.
 * Refs resolved against the bundled corpus on 2026-09-27.
 */
import type { GitaSaarTheme } from '../types';

const GITA_CORPUS = 'repo:mobile/src/data/gita/';
const GITA_HOLY = 'https://www.holy-bhagavad-gita.org/chapter/';

export const KRODH_THEME: GitaSaarTheme = {
  id: 'krodh',
  titleHi: 'क्रोध',
  titleEn: 'When anger rises',
  ledeHi:
    'गुस्सा क्यों आता है और उसे कैसे रोकें? गीता क्रोध को पहली कड़ी नहीं मानती। वह सीढ़ी दिखाती है जिससे वह उतरता है, फिर बताती है कि उसे कहाँ पकड़ा जा सकता है।',
  ledeEn:
    'Why does anger come, and how is it stopped? The Gita does not treat anger as the first link. It shows the ladder it climbs down, then says where it can be caught.',
  groups: [
    {
      id: 'seedhi',
      titleHi: 'क्रोध की सीढ़ी',
      titleEn: 'The ladder down',
      introHi: 'दो श्लोक, एक पूरी कड़ी: सोचने से आसक्ति, आसक्ति से कामना, कामना से क्रोध।',
      introEn: 'Two verses, one whole chain: dwelling leads to attachment, attachment to desire, desire to anger.',
      verses: [
        {
          ref: { chapter: 2, verse: 62 },
          themeHi: 'चिंतन से कामना',
          themeEn: 'From dwelling to desire',
          saarHi: 'विषयों का चिंतन करते-करते उनमें आसक्ति पैदा होती है। आसक्ति से कामना, और कामना से क्रोध।',
          saarEn: 'Dwelling on things breeds attachment to them. From attachment comes desire, and from desire, anger.',
        },
        {
          ref: { chapter: 2, verse: 63 },
          themeHi: 'क्रोध से नाश',
          themeEn: 'From anger to ruin',
          saarHi: 'क्रोध से मोह, मोह से स्मृति का भ्रम, स्मृति के भ्रम से बुद्धि का नाश, और बुद्धि के नाश से व्यक्ति गिर जाता है।',
          saarEn: 'Anger brings confusion, confusion clouds memory, clouded memory destroys judgement, and with judgement gone, a person falls.',
        },
      ],
    },
    {
      id: 'arjun-ka-prashna',
      titleHi: 'अर्जुन का प्रश्न',
      titleEn: "Arjuna's question",
      introHi: 'अर्जुन वही पूछते हैं जो हम पूछते हैं: न चाहते हुए भी गलत क्यों हो जाता है?',
      introEn: 'Arjuna asks what we ask: why do we do wrong even when we do not want to?',
      verses: [
        {
          ref: { chapter: 3, verse: 36 },
          themeHi: 'न चाहते हुए भी',
          themeEn: 'Even against my will',
          saarHi: 'अर्जुन पूछते हैं: मनुष्य न चाहते हुए भी, जैसे किसी के ज़ोर से, पाप क्यों कर बैठता है?',
          saarEn: 'Arjuna asks: what makes a person do wrong even against their will, as if pushed by some force?',
        },
        {
          ref: { chapter: 3, verse: 37 },
          themeHi: 'काम ही क्रोध है',
          themeEn: 'Desire is anger',
          saarHi: 'कृष्ण उत्तर देते हैं: यह काम है, और यही क्रोध है — रजोगुण से जन्मा, बहुत खाने वाला, महापापी। इसे ही शत्रु जानो।',
          saarEn: 'Krishna answers: it is desire, and it is anger, born of rajas, all-devouring, deeply harmful. Know this as the enemy.',
        },
      ],
    },
    {
      id: 'kahan-roken',
      titleHi: 'कहाँ रोकें',
      titleEn: 'Where to stop it',
      introHi: 'क्रोध को अंत में नहीं, आरम्भ में पकड़ा जाता है।',
      introEn: 'Anger is caught at the start, not at the end.',
      verses: [
        {
          ref: { chapter: 3, verse: 41 },
          themeHi: 'पहले इन्द्रियाँ',
          themeEn: 'The senses first',
          saarHi: 'इसलिए पहले इन्द्रियों को वश में करो, फिर इस ज्ञान और विवेक को नष्ट करने वाले काम को मारो।',
          saarEn: 'So first bring the senses under control, then strike down this desire that destroys knowledge and discernment.',
        },
        {
          ref: { chapter: 3, verse: 43 },
          themeHi: 'बुद्धि से ऊपर',
          themeEn: 'Above the intellect',
          saarHi: 'इन्द्रियों से मन ऊपर है, मन से बुद्धि, और बुद्धि से भी ऊपर आत्मा। उसे जानकर, अपने से अपने को वश में करके, इस कठिन शत्रु काम को जीतो।',
          saarEn: 'Above the senses is the mind, above the mind the intellect, and above the intellect the Self. Knowing that, steadying yourself by yourself, conquer this hard enemy, desire.',
        },
      ],
    },
    {
      id: 'jeet',
      titleHi: 'जीत',
      titleEn: 'The victory',
      introHi: 'क्रोध को सह लेने वाले को गीता क्या कहती है।',
      introEn: 'What the Gita calls the one who can hold the surge.',
      verses: [
        {
          ref: { chapter: 5, verse: 23 },
          themeHi: 'वेग को सहना',
          themeEn: 'Holding the surge',
          saarHi: 'जो इसी शरीर में, शरीर छूटने से पहले, काम और क्रोध के वेग को सह लेने में समर्थ है — वही योगी है, वही सुखी है।',
          saarEn: 'The one who, here in this body and before it falls, can withstand the surge of desire and anger is a yogi, and that person is happy.',
        },
      ],
    },
    {
      id: 'teen-dwar',
      titleHi: 'तीन द्वार',
      titleEn: 'The three gates',
      introHi: 'क्रोध अकेला नहीं आता।',
      introEn: 'Anger does not come alone.',
      verses: [
        {
          ref: { chapter: 16, verse: 21 },
          themeHi: 'काम, क्रोध, लोभ',
          themeEn: 'Lust, anger, greed',
          saarHi: 'काम, क्रोध और लोभ — ये तीन नरक के द्वार हैं, जो आत्मा का पतन करते हैं। इन्हें छोड़ने की बात गीता सीधे कहती है।',
          saarEn: 'Lust, anger and greed are three gates to ruin; they drag the self down. The Gita says plainly that these three are to be left.',
        },
        {
          ref: { chapter: 16, verse: 22 },
          themeHi: 'द्वारों से बाहर',
          themeEn: 'Out of the gates',
          saarHi: 'जो इन तीन अँधेरे द्वारों से छूट गया है और अपने कल्याण का आचरण करता है, वह परम गति पाता है।',
          saarEn: 'The one freed from these three dark gates, who then does what is good for themselves, reaches the highest goal.',
        },
      ],
    },
  ],
  closingHi: 'क्रोध पहली कड़ी नहीं है — उससे पहले की कड़ी पकड़ो।',
  closingEn: 'Anger is not the first link. Catch the one before it.',
  status: 'verified',
  source: {
    referenceUrls: [`${GITA_CORPUS}chapter-02.json`, `${GITA_CORPUS}chapter-03.json`, `${GITA_CORPUS}chapter-16.json`, `${GITA_HOLY}3`, `${GITA_HOLY}16`],
    verificationNote:
      '2026-09-27: every ref opened in the bundled corpus JSON; saar lines paraphrase the bundled meanings and add nothing the verse does not say.',
  },
};
