/**
 * कर्म — how the Gita says to work.
 * Refs resolved against the bundled corpus on 2026-09-27.
 */
import type { GitaSaarTheme } from '../types';

const GITA_CORPUS = 'repo:mobile/src/data/gita/';
const GITA_HOLY = 'https://www.holy-bhagavad-gita.org/chapter/';

export const KARMA_THEME: GitaSaarTheme = {
  id: 'karma',
  titleHi: 'कर्म',
  titleEn: 'How should I work?',
  ledeHi:
    'काम में मन नहीं लगता, फल की चिंता रहती है — कैसे करूँ? गीता का सबसे जाना-पहचाना श्लोक यहीं है, पर अकेला नहीं। उसके आगे-पीछे का पूरा सूत्र यहाँ है।',
  ledeEn:
    "The mind is not in the work and the result keeps worrying it. The Gita's best-known verse lives here, but not alone. The whole thread around it is here.",
  groups: [
    {
      id: 'adhikar',
      titleHi: 'अधिकार',
      titleEn: 'Your right',
      introHi: 'कर्म पर अधिकार है, फल पर नहीं — और इसका अर्थ क्या है।',
      introEn: 'The right is to the work, not to its fruit, and what that means.',
      verses: [
        {
          ref: { chapter: 2, verse: 47 },
          themeHi: 'कर्म पर अधिकार, फल पर नहीं',
          themeEn: 'Right to the work, not the fruit',
          saarHi: 'तुम्हारा अधिकार कर्म करने में है, उसके फल में कभी नहीं। न फल को कर्म का कारण बनाओ, न कर्म न करने में तुम्हारी आसक्ति हो।',
          saarEn: 'Your right is to the work itself, never to its results. Do not make the result your reason for acting, and do not lean toward not acting either.',
        },
        {
          ref: { chapter: 2, verse: 48 },
          themeHi: 'समत्व ही योग',
          themeEn: 'Evenness is yoga',
          saarHi: 'आसक्ति छोड़कर, सफलता और असफलता में सम रहकर, योग में स्थित होकर कर्म करो। समत्व ही योग कहलाता है।',
          saarEn: 'Give up attachment, stay even in success and failure, and work established in yoga. That evenness of mind is what yoga means.',
        },
        {
          ref: { chapter: 2, verse: 50 },
          themeHi: 'कर्म में कुशलता',
          themeEn: 'Skill in action',
          saarHi: 'समता से युक्त व्यक्ति यहीं, जीते-जी, पुण्य और पाप दोनों से ऊपर उठ जाता है। इसलिए योग में लगो — योग ही कर्मों में कुशलता है।',
          saarEn: 'The one with an even mind rises above both merit and sin here in this life. So take to yoga: yoga is skill in action.',
        },
      ],
    },
    {
      id: 'karna-zaroori',
      titleHi: 'करना ज़रूरी है',
      titleEn: 'Work is not optional',
      introHi: 'गीता कर्म छोड़ने का रास्ता नहीं देती। वह करने का ढंग बदलती है।',
      introEn: 'The Gita does not offer a way out of work. It changes the way of working.',
      verses: [
        {
          ref: { chapter: 3, verse: 8 },
          themeHi: 'कर्म श्रेष्ठ है',
          themeEn: 'Action is better',
          saarHi: 'अपना नियत कर्तव्य करो; कर्म न करने से कर्म करना श्रेष्ठ है। कर्म के बिना तो शरीर का निर्वाह भी नहीं होगा।',
          saarEn: 'Do your appointed duty; acting is better than not acting. Without work, even the body could not be kept going.',
        },
        {
          ref: { chapter: 3, verse: 19 },
          themeHi: 'अनासक्त होकर',
          themeEn: 'Without attachment',
          saarHi: 'इसलिए आसक्ति के बिना, निरंतर, जो करने योग्य है वह करो। आसक्ति के बिना कर्म करता हुआ मनुष्य परम को पा लेता है।',
          saarEn: 'So do what is to be done, always, without attachment. Working without attachment, a person reaches the highest.',
        },
        {
          ref: { chapter: 3, verse: 20 },
          themeHi: 'जनक का उदाहरण',
          themeEn: 'The example of Janaka',
          saarHi: 'जनक जैसे राजा कर्म से ही सिद्धि को पहुँचे। लोगों के हित को देखकर भी कर्म करना बनता है।',
          saarEn: 'Kings like Janaka reached perfection through action alone. Even for the good of the people around you, working is the right thing.',
        },
        {
          ref: { chapter: 3, verse: 21 },
          themeHi: 'श्रेष्ठ का आचरण',
          themeEn: 'What the great do',
          saarHi: 'श्रेष्ठ व्यक्ति जो करता है, दूसरे वही करते हैं। वह जो मानक रखता है, संसार उसी पर चलता है।',
          saarEn: 'Whatever a respected person does, others do the same. Whatever standard they set, the world follows.',
        },
      ],
    },
    {
      id: 'aasakt-anasakt',
      titleHi: 'आसक्त और अनासक्त',
      titleEn: 'The attached and the free',
      introHi: 'दोनों काम करते हैं। फ़र्क़ करने के ढंग में है।',
      introEn: 'Both work. The difference is in how.',
      verses: [
        {
          ref: { chapter: 3, verse: 25 },
          themeHi: 'लोकहित के लिए',
          themeEn: 'For the good of all',
          saarHi: 'अज्ञानी जिस लगन से आसक्ति में कर्म करते हैं, ज्ञानी उसी लगन से, पर बिना आसक्ति के, संसार के हित के लिए कर्म करे।',
          saarEn: 'With the same energy the unwise pour into work out of attachment, the wise work without attachment, for the welfare of the world.',
        },
      ],
    },
    {
      id: 'apna-karma',
      titleHi: 'अपना कर्म',
      titleEn: 'Your own work',
      introHi: 'गीता के अंतिम अध्याय का उत्तर: अपना काम ही पूजा है।',
      introEn: "The last chapter's answer: your own work is worship.",
      verses: [
        {
          ref: { chapter: 18, verse: 45 },
          themeHi: 'अपने कर्म में सिद्धि',
          themeEn: 'Perfection in one\'s own work',
          saarHi: 'अपने-अपने कर्म में तत्पर मनुष्य सिद्धि पा लेता है। कैसे — यह आगे सुनो, कृष्ण कहते हैं।',
          saarEn: 'Each person devoted to their own work attains perfection. How that happens, Krishna says, hear next.',
        },
        {
          ref: { chapter: 18, verse: 46 },
          themeHi: 'कर्म से पूजा',
          themeEn: 'Worship by work',
          saarHi: 'जिससे सब प्राणी उत्पन्न हुए और जिससे यह सब व्याप्त है, उसकी अपने कर्म से पूजा करके मनुष्य सिद्धि पाता है।',
          saarEn: 'Worshipping, through one\'s own work, the One from whom all beings come and by whom all this is pervaded, a person attains perfection.',
        },
        {
          ref: { chapter: 18, verse: 47 },
          themeHi: 'गुणहीन भी अपना',
          themeEn: 'Your own, though imperfect',
          saarHi: 'दूसरे का धर्म अच्छी तरह निभाने से अपना धर्म श्रेष्ठ है, चाहे उसमें कमी हो। स्वभाव से नियत कर्म करने वाले को पाप नहीं लगता।',
          saarEn: 'One\'s own duty, even lacking, is better than another\'s done well. Doing the work set by one\'s own nature brings no wrong.',
        },
        {
          ref: { chapter: 18, verse: 48 },
          themeHi: 'धुएँ के साथ आग',
          themeEn: 'Smoke with the fire',
          saarHi: 'सहज कर्म दोषयुक्त हो तब भी उसे छोड़ना नहीं बनता। सब कर्म किसी न किसी दोष से ढके हैं, जैसे आग धुएँ से।',
          saarEn: 'The work you are born to is not to be abandoned even if it has faults. Every undertaking carries some fault, as fire carries smoke.',
        },
      ],
    },
  ],
  closingHi: 'काम पूरा करो, फल छोड़ दो — यही योग है।',
  closingEn: 'Do the work fully, release the fruit. That is yoga.',
  status: 'verified',
  source: {
    referenceUrls: [`${GITA_CORPUS}chapter-02.json`, `${GITA_CORPUS}chapter-03.json`, `${GITA_CORPUS}chapter-18.json`, `${GITA_HOLY}2`, `${GITA_HOLY}3`],
    verificationNote:
      '2026-09-27: every ref opened in the bundled corpus JSON; saar lines paraphrase the bundled meanings and add nothing the verse does not say.',
  },
};
