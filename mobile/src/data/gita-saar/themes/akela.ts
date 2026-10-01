/**
 * क्या मैं अकेला हूँ — the Gita on God's presence in every heart.
 * Refs resolved against the bundled corpus on 2026-09-27.
 */
import type { GitaSaarTheme } from '../types';

const GITA_CORPUS = 'repo:mobile/src/data/gita/';
const GITA_HOLY = 'https://www.holy-bhagavad-gita.org/chapter/';

export const AKELA_THEME: GitaSaarTheme = {
  id: 'akela',
  titleHi: 'क्या मैं अकेला हूँ',
  titleEn: 'Am I alone?',
  ledeHi:
    'कभी लगता है कोई साथ नहीं। गीता इस पर सीधा बोलती है — कृष्ण बार-बार कहते हैं कि वे कहाँ बैठे हैं। उत्तर हर बार एक ही जगह आता है: हृदय में।',
  ledeEn:
    'Sometimes it feels as if no one is there. The Gita speaks to this directly. Krishna says again and again where He sits, and the answer lands in the same place every time: in the heart.',
  groups: [
    {
      id: 'sab-jagah',
      titleHi: 'सब जगह',
      titleEn: 'Everywhere',
      introHi: 'जो सबमें देखता है, वह कभी अकेला नहीं पड़ता।',
      introEn: 'The one who sees Him in all is never left alone.',
      verses: [
        {
          ref: { chapter: 6, verse: 30 },
          themeHi: 'न मैं उससे ओझल, न वह मुझसे',
          themeEn: 'Never lost to each other',
          saarHi: 'जो सबमें मुझे देखता है और सबको मुझमें देखता है, उसके लिए मैं कभी अदृश्य नहीं होता, और वह मेरे लिए अदृश्य नहीं होता।',
          saarEn: 'The one who sees Me everywhere and sees everything in Me is never lost to Me, nor am I ever lost to them.',
        },
        {
          ref: { chapter: 6, verse: 31 },
          themeHi: 'जैसे भी रहे, मुझमें',
          themeEn: 'However they live, in Me',
          saarHi: 'जो एकत्व में स्थित होकर, सब प्राणियों में बसे मुझे भजता है, वह योगी चाहे जैसे रहे, मुझमें ही रहता है।',
          saarEn: 'The yogi who, settled in oneness, worships Me dwelling in all beings, lives in Me whatever their way of living.',
        },
      ],
    },
    {
      id: 'hriday-mein',
      titleHi: 'हृदय में',
      titleEn: 'In the heart',
      introHi: 'तीन अध्याय, एक ही पता।',
      introEn: 'Three chapters, one address.',
      verses: [
        {
          ref: { chapter: 10, verse: 20 },
          themeHi: 'सब प्राणियों की आत्मा',
          themeEn: 'The Self in every being',
          saarHi: 'मैं सब प्राणियों के हृदय में बैठा आत्मा हूँ। मैं ही सब प्राणियों का आदि, मध्य और अंत हूँ।',
          saarEn: 'I am the Self seated in the heart of every being. I am the beginning, the middle and the end of all beings.',
        },
        {
          ref: { chapter: 15, verse: 15 },
          themeHi: 'स्मृति और ज्ञान मुझसे',
          themeEn: 'Memory and knowledge from Me',
          saarHi: 'मैं सबके हृदय में स्थित हूँ। मुझसे ही स्मृति, ज्ञान और संशय का नाश होता है। सब वेदों से जानने योग्य भी मैं ही हूँ।',
          saarEn: 'I am seated in the heart of all. From Me come memory, knowledge and the clearing of doubt. I am what all the Vedas seek to know.',
        },
        {
          ref: { chapter: 18, verse: 61 },
          themeHi: 'ईश्वर हृदय में रहता है',
          themeEn: 'The Lord dwells within',
          saarHi: 'ईश्वर सब प्राणियों के हृदय में रहता है, और अपनी माया से शरीर-रूपी यंत्र पर चढ़े सब प्राणियों को घुमाता रहता है।',
          saarEn: 'The Lord dwells in the heart of every being, and by His power turns all beings, seated as they are on the machine of the body.',
        },
      ],
    },
    {
      id: 'jo-tej-hai',
      titleHi: 'जो तेज है',
      titleEn: 'Every glory',
      introHi: 'जहाँ भी कुछ सुंदर या बलवान दिखे।',
      introEn: 'Wherever anything beautiful or strong is seen.',
      verses: [
        {
          ref: { chapter: 10, verse: 41 },
          themeHi: 'मेरे तेज का अंश',
          themeEn: 'A spark of My splendour',
          saarHi: 'जो भी प्राणी या वस्तु ऐश्वर्य, शोभा या बल से युक्त है, उसे मेरे ही तेज के अंश से उत्पन्न समझो।',
          saarEn: 'Whatever being or thing carries glory, beauty or strength, know it to be born of a spark of My splendour.',
        },
      ],
    },
    {
      id: 'mujhme-main-unme',
      titleHi: 'मुझमें, और मैं उनमें',
      titleEn: 'In Me, and I in them',
      introHi: 'साथ का वचन।',
      introEn: 'The promise of company.',
      verses: [
        {
          ref: { chapter: 9, verse: 29 },
          themeHi: 'सबमें समान, फिर भी',
          themeEn: 'Equal to all, and yet',
          saarHi: 'मैं सब प्राणियों में समान हूँ, न कोई मुझे अप्रिय, न प्रिय। पर जो प्रेम से मुझे भजते हैं, वे मुझमें हैं और मैं उनमें।',
          saarEn: 'I am the same to all beings; none is hateful or dear to Me. But those who worship Me with love are in Me, and I am in them.',
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
  ],
  closingHi: 'जिसे ढूँढ रहे हो, वह हृदय में बैठा है।',
  closingEn: 'The one you look for is seated in the heart.',
  status: 'verified',
  source: {
    referenceUrls: [`${GITA_CORPUS}chapter-06.json`, `${GITA_CORPUS}chapter-10.json`, `${GITA_CORPUS}chapter-15.json`, `${GITA_HOLY}10`, `${GITA_HOLY}15`],
    verificationNote:
      '2026-09-27: every ref opened in the bundled corpus JSON; saar lines paraphrase the bundled meanings and add nothing the verse does not say.',
  },
};
