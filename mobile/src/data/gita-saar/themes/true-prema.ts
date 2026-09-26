/**
 * सच्चा प्रेम — what the Gita calls true prema, traced through sixteen verses.
 *
 * The Gita never uses the word प्रेम; it shows love as a way of seeing (6.32),
 * a settled disposition toward every being (12.13–20), one-pointed devotion
 * that wants nothing (7.17, 10.9–10), love tested in action (3.30, 9.26,
 * 17.20), and what God gives back (9.29, 18.64–66). One thread runs through
 * all of it: no "mine", no expectation. Every `ref` resolves to the bundled
 * corpus (`gitaSaarContent.test.ts` opens the JSON and checks the number);
 * the saar lines paraphrase the bundled Hindi/English meanings in plain words.
 */
import type { GitaSaarTheme } from '../types';

const GITA_CORPUS = 'repo:mobile/src/data/gita/';
const GITA_HOLY = 'https://www.holy-bhagavad-gita.org/chapter/';

export const TRUE_PREMA_THEME: GitaSaarTheme = {
  id: 'true-prema',
  titleHi: 'सच्चा प्रेम',
  titleEn: 'True Prema',
  ledeHi:
    'गीता में "प्रेम" शब्द नहीं आता। वह प्रेम को दिखाती है — देखने का ढंग, जीने का ढंग, करने का ढंग, और अंत में वह जो भगवान लौटाते हैं। इस क्रम में पढ़ें तो हर श्लोक में एक ही सूत्र मिलता है: न "मेरा", न कोई अपेक्षा।',
  ledeEn:
    'The Gita never says the word prema. It shows love instead: as a way of seeing, a way of being, a way of acting, and finally as what God gives back. Read in this order, one thread runs through every verse: no "mine", no expectation.',
  groups: [
    {
      id: 'mool',
      titleHi: 'मूल — एक ही आत्मा सबमें',
      titleEn: 'The root — one Self in all',
      introHi: 'प्रेम भाव बनने से पहले देखने का ढंग है। बाकी हर श्लोक यहीं से उगता है।',
      introEn: 'Before love is a feeling, it is a way of seeing. Every other verse grows from here.',
      verses: [
        {
          ref: { chapter: 6, verse: 32 },
          themeHi: 'सबमें अपने को देखना',
          themeEn: 'Same Self in all',
          saarHi:
            'श्रेष्ठ योगी सबके सुख-दुःख को अपने जैसा महसूस करता है, क्योंकि वह सबमें एक ही आत्मा देखता है। दूसरा कभी "पराया" नहीं होता।',
          saarEn:
            "The highest yogi feels everyone's joy and pain as if it were their own, because they see the same Self in all. Another person is never \"other\".",
        },
      ],
    },
    {
      id: 'priya-bhakta',
      titleHi: 'जो मुझे प्रिय है',
      titleEn: 'How a lover of God lives',
      introHi:
        'कृष्ण का सबसे पूरा चित्र। हर श्लोक एक ही तरह समाप्त होता है — "वह मुझे प्रिय है।" यहाँ प्रेम भावना नहीं, स्थिर अवस्था है, जो सबके साथ व्यवहार में दिखती है।',
      introEn:
        "Krishna's fullest portrait. Every verse ends the same way: \"such a person is dear to Me.\" Love here is not an emotion but a settled state that shows in how you treat everything else.",
      verses: [
        {
          ref: { chapter: 12, verse: 13 },
          themeHi: 'सबका मित्र, अहंकार-रहित',
          themeEn: 'Friend to all, no ego',
          saarHi:
            'किसी से द्वेष नहीं। सबका मित्र और दयालु। "मेरा" और "मैं" छोड़ दो। सुख-दुःख में सम रहो, क्षमा करो। ऐसा व्यक्ति कृष्ण को प्रिय है।',
          saarEn:
            'Hate no one. Be a friend and kind to all. Drop "mine" and "I". Stay steady in good times and bad, and forgive. Such a person is dear to Krishna.',
        },
        {
          ref: { chapter: 12, verse: 14 },
          themeHi: 'संतुष्ट, मन-बुद्धि अर्पित',
          themeEn: 'Content, mind given to Him',
          saarHi:
            'सदा संतुष्ट, संयमी, दृढ़ निश्चय वाला, और जिसका मन-बुद्धि भगवान में अर्पित है — ऐसा भक्त उन्हें प्रिय है।',
          saarEn:
            'Ever content, self-controlled, firm in resolve, with mind and heart given to God: such a devotee is dear to Him.',
        },
        {
          ref: { chapter: 12, verse: 15 },
          themeHi: 'किसी को उद्वेग नहीं',
          themeEn: 'Disturbs no one',
          saarHi:
            'जिससे संसार को उद्वेग नहीं होता और जिसे संसार से उद्वेग नहीं होता। हर्ष, ईर्ष्या, भय और चिंता से मुक्त। ऐसा व्यक्ति उन्हें प्रिय है।',
          saarEn:
            'The world is not troubled by them, and they are not troubled by the world. Free of excitement, envy, fear, and anxiety. Such a person is dear to Him.',
        },
        {
          ref: { chapter: 12, verse: 16 },
          themeHi: 'कुछ नहीं चाहता',
          themeEn: 'Wants nothing',
          saarHi:
            'कोई अपेक्षा नहीं, भीतर-बाहर पवित्र, दक्ष, उदासीन, व्यथा-रहित, और अपने लिए नये आरम्भ छोड़ चुका। ऐसा भक्त उन्हें प्रिय है।',
          saarEn:
            'Expects nothing, is pure inside and out, skilled, impartial, free of pain, and does not chase new schemes for themselves. Such a devotee is dear to Him.',
        },
        {
          ref: { chapter: 12, verse: 17 },
          themeHi: 'राग-द्वेष से परे',
          themeEn: 'Beyond like and dislike',
          saarHi:
            'न अति हर्ष, न द्वेष, न शोक, न कामना। शुभ-अशुभ दोनों फल छोड़ देता है और भक्ति से भरा है। ऐसा व्यक्ति उन्हें प्रिय है।',
          saarEn:
            'Neither over-joyed nor hating, neither grieving nor craving. Lets go of both good and bad outcomes, and is full of devotion. Such a person is dear to Him.',
        },
        {
          ref: { chapter: 12, verse: 18 },
          themeHi: 'शत्रु-मित्र में सम',
          themeEn: 'Same to friend and foe',
          saarHi:
            'शत्रु और मित्र, मान और अपमान, सर्दी-गर्मी, सुख-दुःख — सबमें सम, और आसक्ति से रहित।',
          saarEn:
            'Same to enemy and friend, to honour and insult, heat and cold, pleasure and pain. Unattached.',
        },
        {
          ref: { chapter: 12, verse: 19 },
          themeHi: 'निंदा-स्तुति में समान',
          themeEn: 'Equal to praise and blame',
          saarHi:
            'निंदा और स्तुति को समान समझता है, मौन, जो मिले उसमें संतुष्ट, किसी घर से बँधा नहीं, स्थिर बुद्धि, भक्ति से भरा — ऐसा व्यक्ति उन्हें प्रिय है।',
          saarEn:
            'Equal to praise and blame, quiet, content with whatever comes, not tied to any home, steady in mind, full of devotion. Such a person is dear to Him.',
        },
        {
          ref: { chapter: 12, verse: 20 },
          themeHi: 'अत्यंत प्रिय',
          themeEn: 'Exceedingly dear',
          saarHi:
            'जो श्रद्धा से, भगवान को ही परम लक्ष्य मानकर, इस धर्ममय अमृत को जीते हैं — वे उन्हें अत्यंत प्रिय हैं।',
          saarEn:
            'Those who live this nectar of dharma with faith, holding God as their highest goal, are exceedingly dear to Him.',
        },
      ],
    },
    {
      id: 'gyani-bhakta',
      titleHi: 'सबसे ऊँचा प्रेम — ज्ञानी भक्त',
      titleEn: 'The highest love — the jñānī devotee',
      introHi:
        'भगवान की ओर मुड़ने वालों में कृष्ण एक को अलग करते हैं। इस श्लोक का हिन्दी अर्थ इस भक्त को "प्रेमी भक्त" कहता है।',
      introEn:
        'Of everyone who turns to God, Krishna singles out one kind of lover. The Hindi sense of this verse calls this devotee the "premī bhakt".',
      verses: [
        {
          ref: { chapter: 7, verse: 17 },
          themeHi: 'अनन्य, केवल प्रेम के लिए',
          themeEn: 'One-pointed, for love alone',
          saarHi:
            'लोग दुःख में, लाभ के लिए, या जिज्ञासा से भगवान के पास आते हैं। पर जो केवल भगवान के लिए भगवान से प्रेम करता है, जिसका कोई दूसरा लक्ष्य नहीं — वह श्रेष्ठ है। "मैं उसे अत्यंत प्रिय हूँ, और वह मुझे।"',
          saarEn:
            'People come to God in distress, for gain, or in curiosity. But the one who loves God for God alone, with no second object, is the best. "I am exceedingly dear to them, and they are dear to Me."',
        },
      ],
    },
    {
      id: 'preeti-bhajan',
      titleHi: 'प्रेम में जीना — प्रीतिपूर्वक भजन',
      titleEn: 'Living in love — what lovers of God do',
      introHi: 'गीता में प्रेम के सबसे निकट शब्द "प्रीति" यहीं आता है — १०.१० में।',
      introEn: 'The only place the Gita uses a word close to prema, prīti, is here, in 10.10.',
      verses: [
        {
          ref: { chapter: 10, verse: 9 },
          themeHi: 'उनमें रमना',
          themeEn: 'Delight in Him',
          saarHi:
            'जिनका चित्त और प्राण भगवान में हैं, जो आपस में उनकी चर्चा करते हैं — उसी में वे संतुष्ट रहते हैं और आनंद पाते हैं।',
          saarEn:
            'Their mind and very life-breath rest in Him. They speak of Him to each other, and in that alone they are content and delighted.',
        },
        {
          ref: { chapter: 10, verse: 10 },
          themeHi: 'वे स्वयं मार्ग देते हैं',
          themeEn: 'He gives the way',
          saarHi:
            'जो सदा उनमें लगे हैं और प्रेमपूर्वक उनका भजन करते हैं, उन्हें भगवान स्वयं वह बुद्धि देते हैं जिससे वे उन्हें पा लेते हैं। प्रेमी को रास्ता अकेले नहीं खोजना पड़ता।',
          saarEn:
            'To those who are always with Him and worship Him with love, God Himself gives the understanding by which they reach Him. The lover does not have to find the road alone.',
        },
      ],
    },
    {
      id: 'karma',
      titleHi: 'प्रेम कर्म में — करो, अर्पित करो, दो',
      titleEn: 'Love in action — act, offer, give',
      introHi: 'प्रेम पलायन नहीं है। वह काम करता है, अर्पित करता है, देता है। हर श्लोक प्रेम को व्यवहार में परखता है।',
      introEn: 'Love is not withdrawal. It works, it offers, it gives. Each verse tests love in practice.',
      verses: [
        {
          ref: { chapter: 3, verse: 30 },
          themeHi: 'करो, फिर छोड़ दो',
          themeEn: 'Act, then let go',
          saarHi:
            'अपना कर्तव्य पूरा करो, पर हर कर्म भगवान के हाथ में सौंप दो। न फल की आशा, न "यह मेरा है", न भीतर का संताप। फिर युद्ध करो।',
          saarEn:
            'Do your duty fully, but place every action in God\'s hands. No hoping for reward, no "this is mine", no inner fever. Then fight.',
        },
        {
          ref: { chapter: 9, verse: 26 },
          themeHi: 'भाव बड़ा, भेंट नहीं',
          themeEn: 'Bhāva over size',
          saarHi:
            'एक पत्ता, एक फूल, एक फल, थोड़ा जल। शुद्ध मन से प्रेमपूर्वक दिया जाए तो भगवान उसे स्वीकार करते हैं। वे भेंट नहीं तौलते — उसके भीतर का प्रेम ग्रहण करते हैं।',
          saarEn:
            'A leaf, a flower, a fruit, a little water. Offered with love by a pure heart, God accepts it. He does not weigh the gift. He receives the love inside it.',
        },
        {
          ref: { chapter: 17, verse: 20 },
          themeHi: 'बदले की आशा नहीं',
          themeEn: 'No return expected',
          saarHi:
            'सबसे शुद्ध दान वह है जो कर्तव्य समझकर, सही देश-काल-पात्र में, उसे दिया जाए जो बदले में कुछ नहीं कर सकता। यही प्रेम की व्यावहारिक परीक्षा है।',
          saarEn:
            'The purest gift is given because giving is right, at the right place and time, to the right person, to someone who can do nothing for you in return. This is love proven in practice.',
        },
      ],
    },
    {
      id: 'uttar',
      titleHi: 'प्रेम को क्या मिलता है — भगवान का उत्तर',
      titleEn: 'What love receives — the reply and the promise',
      introHi:
        'गीता में प्रेम का उत्तर मिलता है। भगवान सबके लिए समान हैं, फिर भी जो उनसे प्रेम करते हैं उनमें वे बसते हैं — और अंत में अर्जुन को "प्रिय" कहकर वचन देते हैं।',
      introEn:
        'Love in the Gita is answered. God is equal to all, yet He dwells in those who love Him, and at the very end He calls Arjuna beloved and makes a promise.',
      verses: [
        {
          ref: { chapter: 9, verse: 29 },
          themeHi: 'मुझमें, और मैं उनमें',
          themeEn: 'In Me, and I in them',
          saarHi:
            'मैं सब प्राणियों के लिए समान हूँ। न किसी पर पक्षपात, न किसी से द्वेष। पर जो प्रेम से मुझे भजते हैं, वे मुझमें रहते हैं और मैं उनमें।',
          saarEn:
            'I am the same to all beings. I favour no one and reject no one. But those who worship Me with love live in Me, and I live in them.',
        },
        {
          ref: { chapter: 18, verse: 64 },
          themeHi: '"तू मुझे प्रिय है"',
          themeEn: '"You are dear to Me"',
          saarHi:
            'मेरा सबसे गोपनीय वचन फिर सुन, क्योंकि तू मुझे दृढ़ रूप से प्रिय है। इसलिए मैं तेरे हित की बात कहूँगा।',
          saarEn:
            'Hear My most secret word once more, because you are firmly beloved of Me. So I will tell you what is good for you.',
        },
        {
          ref: { chapter: 18, verse: 65 },
          themeHi: 'वचन',
          themeEn: 'The promise',
          saarHi:
            'मुझमें मन लगा, मेरा भक्त बन, मेरा पूजन कर, मुझे प्रणाम कर। तू मुझे ही पाएगा — यह मेरी सत्य प्रतिज्ञा है, क्योंकि तू मुझे प्रिय है।',
          saarEn:
            'Give Me your mind, be My devotee, worship Me, bow to Me. You will come to Me. I promise you this, for you are dear to Me.',
        },
        {
          ref: { chapter: 18, verse: 66 },
          themeHi: 'शरण लो, चिंता मत करो',
          themeEn: 'Take refuge, do not grieve',
          saarHi:
            'हर दूसरा सहारा छोड़कर केवल मेरी शरण में आ। मैं तुझे सब पापों से मुक्त कर दूँगा। चिंता मत कर। प्रेम यहीं पूरा होता है — पूरा भरोसा, और भगवान की पूरी ज़िम्मेदारी।',
          saarEn:
            'Let go of every other support and take refuge in Me alone. I will free you from all wrong. Do not grieve. This is where love ends: full trust, and God taking full responsibility.',
        },
      ],
    },
  ],
  closingHi:
    'सच्चा प्रेम वह है जिसमें न "मेरा" है, न कोई अपेक्षा। वह सबमें एक आत्मा देखता है, सबका भला चाहता है, कर्तव्य करके छोड़ देता है, जो है वह अर्पित करता है, बिना बदले की आशा के देता है, और पूरा भरोसा रखता है। गीता का उत्तर: ऐसा व्यक्ति मुझे प्रिय है, और मैं उसमें हूँ।',
  closingEn:
    'True prema is love with no "mine" and no expectation. It sees one Self in all, wishes everyone well, does its duty and lets go, offers whatever it has, gives without asking back, and trusts completely. The Gita\'s reply: such a person is dear to Me, and I am in them.',
  status: 'verified',
  source: {
    referenceUrls: [
      `${GITA_CORPUS}chapter-12.json`,
      `${GITA_CORPUS}chapter-06.json`,
      `${GITA_CORPUS}chapter-18.json`,
      `${GITA_HOLY}12`,
      `${GITA_HOLY}7`,
    ],
    verificationNote:
      '2026-09-26: every ref opened in the bundled corpus JSON (chapter · number · Sanskrit lines); the saar lines paraphrase the bundled Hindi/English meanings in plain words and add no claim the verse does not make. Grouping and reading order are editorial.',
  },
};
