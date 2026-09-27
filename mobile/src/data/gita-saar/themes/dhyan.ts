/**
 * ध्यान और दिनचर्या — how to meditate, and the yogi's day (food, sleep).
 * Refs resolved against the bundled corpus on 2026-09-27.
 */
import type { GitaSaarTheme } from '../types';

const GITA_CORPUS = 'repo:mobile/src/data/gita/';
const GITA_HOLY = 'https://www.holy-bhagavad-gita.org/chapter/';

export const DHYAN_THEME: GitaSaarTheme = {
  id: 'dhyan',
  titleHi: 'ध्यान और दिनचर्या',
  titleEn: 'How to meditate',
  ledeHi:
    'ध्यान कैसे करें? छठा अध्याय इसे विधि की तरह बताता है — जगह, आसन, मुद्रा, दृष्टि — और फिर वह जो टिके हुए मन को मिलता है। साथ में योगी का दिन: खाना, सोना, काम।',
  ledeEn:
    "How does one meditate? The sixth chapter lays it out like a method: the place, the seat, the posture, the gaze, and then what a settled mind finds. Alongside it, the yogi's day: food, sleep, work.",
  groups: [
    {
      id: 'vidhi',
      titleHi: 'विधि',
      titleEn: 'The method',
      introHi: 'छह श्लोक, छह कदम।',
      introEn: 'Six verses, six steps.',
      verses: [
        {
          ref: { chapter: 6, verse: 10 },
          themeHi: 'अकेले, एकांत में',
          themeEn: 'Alone, in a quiet place',
          saarHi: 'योगी अकेला, एकांत में, शरीर और मन को वश में रखकर, इच्छा और संग्रह से रहित होकर, मन को निरंतर परमात्मा में लगाए।',
          saarEn: 'The yogi, alone and in solitude, with body and mind held, free of wanting and of hoarding, keeps the mind steadily on the Self.',
        },
        {
          ref: { chapter: 6, verse: 11 },
          themeHi: 'आसन',
          themeEn: 'The seat',
          saarHi: 'शुद्ध जगह पर, न बहुत ऊँचा न बहुत नीचा, कुश, मृगछाला और वस्त्र बिछाकर अपना स्थिर आसन बनाए।',
          saarEn: 'In a clean place, neither too high nor too low, a firm seat is made, with grass, a hide and a cloth laid one over the other.',
        },
        {
          ref: { chapter: 6, verse: 12 },
          themeHi: 'एकाग्र मन',
          themeEn: 'One-pointed mind',
          saarHi: 'उस आसन पर बैठकर, मन और इन्द्रियों की क्रियाओं को वश में रखकर, मन को एकाग्र करके, अंतःकरण की शुद्धि के लिए योग का अभ्यास करे।',
          saarEn: 'Seated there, holding the activity of mind and senses, making the mind one-pointed, one practises yoga for the purifying of the inner being.',
        },
        {
          ref: { chapter: 6, verse: 13 },
          themeHi: 'सीधा, अचल',
          themeEn: 'Straight and still',
          saarHi: 'शरीर, सिर और गर्दन को सीधा और अचल रखकर, इधर-उधर न देखकर, अपनी नासिका के अग्रभाग पर दृष्टि रखकर स्थिर बैठे।',
          saarEn: 'Holding body, head and neck straight and still, not looking around, the gaze resting at the tip of the nose, one sits steady.',
        },
        {
          ref: { chapter: 6, verse: 14 },
          themeHi: 'शांत, निर्भय',
          themeEn: 'Calm, fearless',
          saarHi: 'शांत मन, भय-रहित, ब्रह्मचर्य के व्रत में स्थित, मन को संयम में रखकर, मुझमें चित्त लगाकर, मुझे ही परम मानकर बैठे।',
          saarEn: 'With a calm mind, without fear, firm in restraint, holding the mind, with thought fixed on Me and Me as the highest goal, one sits.',
        },
        {
          ref: { chapter: 6, verse: 15 },
          themeHi: 'निर्वाण-शांति',
          themeEn: 'The peace that ends in freedom',
          saarHi: 'इस तरह सदा मन को परमात्मा में लगाता हुआ संयमी योगी उस शांति को पाता है जो मुझमें स्थित है और जिसका अंत निर्वाण है।',
          saarEn: 'Keeping the mind on the Self this way, always, the restrained yogi reaches the peace that rests in Me and ends in freedom.',
        },
      ],
    },
    {
      id: 'deepak',
      titleHi: 'दीपक',
      titleEn: 'The lamp',
      introHi: 'ध्यान की एक ही उपमा, जो सब कह देती है।',
      introEn: 'One image for meditation that says it all.',
      verses: [
        {
          ref: { chapter: 6, verse: 19 },
          themeHi: 'हवा-रहित जगह',
          themeEn: 'A windless place',
          saarHi: 'जैसे हवा-रहित जगह में रखा दीपक हिलता नहीं, वैसा ही वश में किए हुए चित्त वाला, आत्मा में लगा योगी कहा गया है।',
          saarEn: 'As a lamp in a windless place does not flicker, so is the yogi of a held mind, absorbed in the Self.',
        },
      ],
    },
    {
      id: 'kya-milta-hai',
      titleHi: 'क्या मिलता है',
      titleEn: 'What is found',
      introHi: 'टिके हुए मन को जो मिलता है, चार श्लोकों में।',
      introEn: 'What the settled mind finds, in four verses.',
      verses: [
        {
          ref: { chapter: 6, verse: 20 },
          themeHi: 'अपने में संतुष्ट',
          themeEn: 'Content in the Self',
          saarHi: 'जब योग के अभ्यास से रोका हुआ चित्त शांत हो जाता है और अपने-आप से अपने-आप को देखकर अपने में ही संतुष्ट रहता है —',
          saarEn: 'When the mind, held by the practice of yoga, grows quiet, and seeing the Self by the Self one is content in the Self alone —',
        },
        {
          ref: { chapter: 6, verse: 21 },
          themeHi: 'अतीन्द्रिय सुख',
          themeEn: 'Joy beyond the senses',
          saarHi: '— जब वह उस आत्यंतिक सुख का अनुभव करता है जो इन्द्रियों से परे है और केवल बुद्धि से ग्राह्य है, और उसमें स्थित होकर फिर तत्त्व से नहीं हटता —',
          saarEn: '— when one feels that boundless joy beyond the senses, grasped only by the pure intellect, and settled in it no longer moves from the truth —',
        },
        {
          ref: { chapter: 6, verse: 22 },
          themeHi: 'इससे बड़ा लाभ नहीं',
          themeEn: 'No greater gain',
          saarHi: '— जिसे पाकर उससे बड़ा कोई लाभ नहीं लगता, और जिसमें स्थित होकर बड़े से बड़ा दुःख भी हिला नहीं पाता —',
          saarEn: '— having found which no other gain seems greater, and settled in which even heavy sorrow cannot shake one —',
        },
        {
          ref: { chapter: 6, verse: 23 },
          themeHi: 'दुःख के संयोग का वियोग',
          themeEn: 'Parting from the union with pain',
          saarHi: '— उसी को योग जानो: दुःख के संयोग से वियोग। इस योग का अभ्यास निश्चय के साथ, न उकताए हुए मन से किया जाता है।',
          saarEn: '— know that to be yoga: the parting from union with pain. It is practised with resolve, and with a mind that does not lose heart.',
        },
      ],
    },
    {
      id: 'yogi-ka-din',
      titleHi: 'योगी का दिन',
      titleEn: "The yogi's day",
      introHi: 'ध्यान आसन पर शुरू नहीं होता; वह खाने और सोने से शुरू होता है।',
      introEn: 'Meditation does not begin on the seat; it begins with eating and sleeping.',
      verses: [
        {
          ref: { chapter: 6, verse: 16 },
          themeHi: 'न अधिक, न बिलकुल नहीं',
          themeEn: 'Neither too much nor none',
          saarHi: 'योग न अधिक खाने वाले का सधता है, न बिलकुल न खाने वाले का; न अधिक सोने वाले का, न सदा जागने वाले का।',
          saarEn: 'Yoga is not for one who eats too much, nor for one who does not eat; not for one who sleeps too much, nor for one who never sleeps.',
        },
        {
          ref: { chapter: 6, verse: 17 },
          themeHi: 'यथायोग्य',
          themeEn: 'In right measure',
          saarHi: 'जो आहार, विहार, कर्म, नींद और जागने में यथायोग्य संतुलन रखता है, उसका योग दुःखों का नाश करने वाला बनता है।',
          saarEn: 'For the one who keeps right measure in food, rest, effort, sleep and waking, yoga becomes the ender of sorrow.',
        },
        {
          ref: { chapter: 17, verse: 8 },
          themeHi: 'सात्त्विक आहार',
          themeEn: 'Sattvic food',
          saarHi: 'आयु, सत्त्व, बल, आरोग्य, सुख और प्रसन्नता बढ़ाने वाले, रसयुक्त, स्निग्ध, टिकाऊ और हृदय को बल देने वाले भोजन सात्त्विक व्यक्ति को प्रिय हैं।',
          saarEn: 'Foods that add to life, clarity, strength, health, happiness and cheer, that are juicy, nourishing, lasting and heartening, are dear to the sattvic person.',
        },
        {
          ref: { chapter: 17, verse: 9 },
          themeHi: 'राजस आहार',
          themeEn: 'Rajasic food',
          saarHi: 'अति कड़वे, अति खट्टे, अति नमकीन, अति गरम, अति तीखे, रूखे और जलन करने वाले भोजन राजस व्यक्ति को प्रिय हैं — और वे दुःख, शोक और रोग देते हैं।',
          saarEn: 'Foods that are too bitter, too sour, too salty, too hot, too sharp, dry and burning are dear to the rajasic person, and they bring pain, grief and illness.',
        },
        {
          ref: { chapter: 17, verse: 10 },
          themeHi: 'तामस आहार',
          themeEn: 'Tamasic food',
          saarHi: 'बासी, रस-रहित, दुर्गंधित, सड़ा हुआ, जूठा और अपवित्र भोजन तामस व्यक्ति को प्रिय है।',
          saarEn: 'Food that is stale, tasteless, foul-smelling, rotten, left over and impure is what the tamasic person likes.',
        },
      ],
    },
  ],
  closingHi: 'हवा-रहित जगह का दीपक — यही ध्यान की उपमा है।',
  closingEn: 'A lamp in a windless place. That is the image of meditation.',
  status: 'verified',
  source: {
    referenceUrls: [`${GITA_CORPUS}chapter-06.json`, `${GITA_CORPUS}chapter-17.json`, `${GITA_HOLY}6`, `${GITA_HOLY}17`],
    verificationNote:
      '2026-09-27: every ref opened in the bundled corpus JSON; saar lines paraphrase the bundled meanings and add nothing the verse does not say. Food verses are descriptive of the three kinds, never a prescription (RULEBOOK §29.3).',
  },
};
