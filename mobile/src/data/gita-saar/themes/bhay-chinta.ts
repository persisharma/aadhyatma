/**
 * भय और चिंता — what the Gita says when the mind is afraid.
 * Refs resolved against the bundled corpus on 2026-09-27; every saar
 * paraphrases the bundled Hindi/English meaning in plain words.
 */
import type { GitaSaarTheme } from '../types';

const GITA_CORPUS = 'repo:mobile/src/data/gita/';
const GITA_HOLY = 'https://www.holy-bhagavad-gita.org/chapter/';

export const BHAY_CHINTA_THEME: GitaSaarTheme = {
  id: 'bhay-chinta',
  titleHi: 'भय और चिंता',
  titleEn: 'When I am afraid',
  ledeHi:
    'मन डरता है, चिंता नहीं छूटती — गीता क्या कहती है? वह डर को झुठलाती नहीं; पहले बताती है कि वह आता-जाता है, फिर कि मन साधा जा सकता है, और फिर कि भार उठाने वाला कोई है।',
  ledeEn:
    'The mind is afraid and the worry will not leave. The Gita does not deny the fear. It says first that it comes and goes, then that the mind can be trained, and then that someone carries the load.',
  groups: [
    {
      id: 'aata-jaata',
      titleHi: 'यह आता-जाता है',
      titleEn: 'It comes and goes',
      introHi: 'डर जिस चीज़ का है, वह टिकती नहीं। पहला कदम: उसे आने-जाने वाला देखना।',
      introEn: 'What the fear is about does not stay. The first step is to see it as something that comes and goes.',
      verses: [
        {
          ref: { chapter: 2, verse: 14 },
          themeHi: 'अनित्य है',
          themeEn: 'Impermanent',
          saarHi: 'सर्दी-गर्मी, सुख-दुःख इन्द्रियों के स्पर्श से आते हैं। उनका आरम्भ है और अंत है, वे टिकते नहीं। कृष्ण कहते हैं: इन्हें सह लो।',
          saarEn: 'Heat and cold, pleasure and pain come from the senses touching the world. They begin and they end; they do not stay. Krishna says: bear them.',
        },
        {
          ref: { chapter: 2, verse: 56 },
          themeHi: 'जो हिलता नहीं',
          themeEn: 'The one who is not shaken',
          saarHi: 'जिसका मन दुःख में उद्विग्न नहीं होता, सुख की लालसा नहीं करता, और जो राग, भय और क्रोध से छूट गया है, वही स्थिर बुद्धि वाला कहलाता है। डर से मुक्ति उसी चित्र का हिस्सा है।',
          saarEn: 'One whose mind is not shaken by sorrow, does not crave pleasure, and is free of attachment, fear and anger is called steady. Freedom from fear is part of that same portrait.',
        },
      ],
    },
    {
      id: 'man-sadha',
      titleHi: 'मन को साधा जा सकता है',
      titleEn: 'The mind can be trained',
      introHi: 'कृष्ण मानते हैं कि मन चंचल है। फिर दो औज़ार देते हैं।',
      introEn: 'Krishna agrees that the mind is restless. Then he names two tools.',
      verses: [
        {
          ref: { chapter: 6, verse: 35 },
          themeHi: 'अभ्यास और वैराग्य',
          themeEn: 'Practice and dispassion',
          saarHi: 'हाँ, मन चंचल है और उसे रोकना कठिन है — यह कृष्ण स्वीकार करते हैं। पर अभ्यास और वैराग्य से वह वश में आता है। डर का इलाज एक दिन में नहीं, दोहराव से होता है।',
          saarEn: 'Yes, the mind is restless and hard to hold; Krishna grants that. But by practice and by letting go it comes under control. Fear is not cured in a day; it is worn down by repetition.',
        },
      ],
    },
    {
      id: 'bhaar',
      titleHi: 'भार उठाने वाला',
      titleEn: 'Someone carries it',
      introHi: 'चिंता का बड़ा हिस्सा यह है कि सब कुछ मुझे ही सँभालना है। ये श्लोक उस भार को बाँटते हैं।',
      introEn: 'Much of worry is the sense that everything rests on me. These verses share that load.',
      verses: [
        {
          ref: { chapter: 9, verse: 22 },
          themeHi: 'योगक्षेम मैं वहन करता हूँ',
          themeEn: 'I carry what they need',
          saarHi: 'जो अनन्य भाव से मेरा चिंतन करते हुए मेरी उपासना करते हैं, उनका योगक्षेम मैं उठाता हूँ — जो नहीं है वह दिलाता हूँ, जो है उसकी रक्षा करता हूँ।',
          saarEn: 'For those who think of Me alone and stay with Me, I take on their welfare: I bring what they lack and protect what they have.',
        },
        {
          ref: { chapter: 18, verse: 58 },
          themeHi: 'सब विघ्न पार',
          themeEn: 'Across every obstacle',
          saarHi: 'मुझमें चित्त रखकर तू मेरी कृपा से सारे विघ्न पार कर जाएगा। और अहंकार में मेरी बात न सुनी, तो गिरेगा — कृष्ण दोनों ओर साफ़ हैं।',
          saarEn: 'With your mind on Me, by My grace you will cross every obstacle. And if out of ego you will not listen, you will fall; Krishna is clear on both sides.',
        },
      ],
    },
    {
      id: 'dar-ke-paar',
      titleHi: 'डर के पार',
      titleEn: 'Beyond fear',
      introHi: 'जो प्रिय है, वह कैसा दिखता है — और उसके लिए क्या वचन है।',
      introEn: 'What the one dear to Him looks like, and what is promised to them.',
      verses: [
        {
          ref: { chapter: 12, verse: 15 },
          themeHi: 'न डराता, न डरता',
          themeEn: 'Neither disturbs nor is disturbed',
          saarHi: 'जिससे किसी को उद्वेग नहीं होता और जिसे किसी से उद्वेग नहीं होता, जो हर्ष, ईर्ष्या, भय और घबराहट से मुक्त है — वह मुझे प्रिय है।',
          saarEn: 'The one from whom no being feels disturbance, and who is disturbed by no being; free of excitement, envy, fear and anxiety. That person is dear to Me.',
        },
        {
          ref: { chapter: 9, verse: 31 },
          themeHi: 'मेरे भक्त का नाश नहीं',
          themeEn: 'My devotee never perishes',
          saarHi: 'वह जल्दी ही धर्मात्मा हो जाता है और स्थायी शांति पाता है। कृष्ण अर्जुन से कहते हैं: तुम घोषणा कर दो — मेरे भक्त का पतन नहीं होता।',
          saarEn: 'Such a person soon becomes righteous and finds lasting peace. Krishna tells Arjuna: declare it — My devotee never perishes.',
        },
      ],
    },
    {
      id: 'vachan',
      titleHi: 'वचन',
      titleEn: 'The promise',
      introHi: 'गीता का अंतिम शब्द चिंता पर ही है।',
      introEn: "The Gita's last word is about worry itself.",
      verses: [
        {
          ref: { chapter: 18, verse: 66 },
          themeHi: 'चिंता मत कर',
          themeEn: 'Do not grieve',
          saarHi: 'सब सहारे छोड़कर केवल मेरी शरण में आ। मैं तुझे सब पापों से मुक्त कर दूँगा। चिंता मत कर।',
          saarEn: 'Let go of every other support and take refuge in Me alone. I will free you from all wrong. Do not grieve.',
        },
      ],
    },
  ],
  closingHi: 'डर उस चीज़ से है जो बदलती है; जो नहीं बदलता, उसमें टिको।',
  closingEn: 'Fear is of what changes. Rest in what does not.',
  status: 'verified',
  source: {
    referenceUrls: [`${GITA_CORPUS}chapter-02.json`, `${GITA_CORPUS}chapter-09.json`, `${GITA_CORPUS}chapter-18.json`, `${GITA_HOLY}9`, `${GITA_HOLY}18`],
    verificationNote:
      '2026-09-27: every ref opened in the bundled corpus JSON; saar lines paraphrase the bundled meanings and add nothing the verse does not say. Grouping and order are editorial.',
  },
};
