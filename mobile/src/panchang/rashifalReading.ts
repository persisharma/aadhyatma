import {
  computeRashiTransits, GRAHA_NAMES_EN, GRAHA_NAMES_HI, HOUSE_THEME_EN,
  HOUSE_THEME_HI, houseForRashi, indiaDateKey, indiaDayAnchor, getCurrentDasha,
  type Graha, type KundaliChart,
} from './kundali';

export type ReadingText = { hi: string; en: string };
export type LifeAreaId = 'relationships' | 'work' | 'money' | 'wellbeing' | 'family' | 'practice';
export type ReadingTone = 'supportive' | 'mixed' | 'reflective';
type AreaCopy = { body: ReadingText; step: ReadingText };
type AreaDefinition = {
  id: LifeAreaId;
  title: ReadingText;
  houses: readonly number[];
  grahas: readonly Graha[];
  copies: Record<ReadingTone, AreaCopy>;
};

// Editorial grouping of the existing whole-sign house themes. These groups
// organise reflection; they are not a new classical strength/scoring system.
const AREAS: readonly AreaDefinition[] = [
  {
    id: 'relationships', title: { hi: 'प्रेम और रिश्ते', en: 'Love and relationships' },
    houses: [5, 7], grahas: ['venus'],
    copies: {
      supportive: {
        body: { hi: 'रिश्तों में सहयोग और सहज संवाद को स्थान दें। साथी के साथ छोटी बातों में ध्यान दिखाएँ; अविवाहित हैं तो नई बातचीत को अपनी गति से आगे बढ़ने दें।', en: 'Make space for cooperation and easy conversation. With a partner, show attention in small ways; if single, let new conversations develop at their own pace.' },
        step: { hi: 'किसी अपने के एक छोटे प्रयास की सराहना करें।', en: 'Appreciate one small effort someone has made.' },
      },
      mixed: {
        body: { hi: 'निकटता के साथ व्यक्तिगत समय की ज़रूरत भी समझें। कोई बात अधूरी लगे तो अनुमान लगाने के बजाय पूछें; नई बातचीत और पुराने रिश्ते, दोनों में सुनना मददगार हो सकता है।', en: 'Balance closeness with room for personal time. If something feels unfinished, ask rather than assume; listening can help in both new conversations and established relationships.' },
        step: { hi: 'बिना फोन देखे किसी अपने की बात पूरी सुनें।', en: 'Hear someone out without checking your phone.' },
      },
      reflective: {
        body: { hi: 'रिश्तों के विषयों में प्रतिक्रिया से पहले थोड़ा ठहरें। अपनी अपेक्षा साफ शब्दों में रखें और सामने वाले को उत्तर देने का समय दें; किसी नए परिचय पर जल्द निष्कर्ष न निकालें।', en: 'Pause before reacting in relationship matters. Express an expectation clearly and give the other person time to reply; allow a new acquaintance time before drawing conclusions.' },
        step: { hi: 'एक अनुमान को शांत प्रश्न में बदलें।', en: 'Turn one assumption into a calm question.' },
      },
    },
  },
  {
    id: 'work', title: { hi: 'काम और पढ़ाई', en: 'Work and studies' },
    houses: [3, 6, 10], grahas: ['sun', 'mercury', 'saturn'],
    copies: {
      supportive: {
        body: { hi: 'क्रमबद्ध प्रयास और स्पष्ट संवाद के लिए समय रखें। काम में अगला कदम तय करें; पढ़ाई में एक कठिन विषय को उदाहरणों के साथ समझने पर ध्यान दें।', en: 'Set aside time for orderly effort and clear communication. Define the next step at work; in studies, give one difficult topic attention through concrete examples.' },
        step: { hi: 'दिन का एक मुख्य काम चुनकर उसके लिए समय रखें।', en: 'Choose one main task and reserve time for it.' },
      },
      mixed: {
        body: { hi: 'आगे बढ़ने के साथ जाँचने की गुंजाइश रखें। जिम्मेदारी लेने से पहले अपेक्षाएँ स्पष्ट करें; पढ़ाई में नया विषय शुरू करने से पहले पिछली कठिनाई दोहराएँ।', en: 'Leave room to review while making progress. Clarify expectations before taking on a responsibility; revisit a difficult point before starting a new topic in your studies.' },
        step: { hi: 'किसी काम में पूरा होने का अर्थ पहले तय करें।', en: 'Agree on what finished means for one task.' },
      },
      reflective: {
        body: { hi: 'काम और पढ़ाई में अपनी गति पर ध्यान दें। एक साथ कई जिम्मेदारियाँ उठाने के बजाय अधूरे हिस्से पहचानें और जहाँ समझ कम हो वहाँ प्रश्न पूछें।', en: 'Pay attention to your pace in work and studies. Notice unfinished pieces before taking on several responsibilities, and ask questions where your understanding is incomplete.' },
        step: { hi: 'अगला काम शुरू करने से पहले एक अधूरा हिस्सा पूरा करें।', en: 'Finish one incomplete piece before starting another task.' },
      },
    },
  },
  {
    id: 'money', title: { hi: 'धन और खर्च', en: 'Money and spending' },
    houses: [2, 11, 12], grahas: ['jupiter'],
    copies: {
      supportive: {
        body: { hi: 'संसाधनों के विषय में व्यवस्थित ध्यान को स्थान दें। नियमित खर्च और आने वाली जिम्मेदारियों को साथ देखकर अपनी प्राथमिकताएँ समझें।', en: 'Give resources some organised attention. Look at recurring expenses alongside upcoming responsibilities to understand your priorities.' },
        step: { hi: 'किसी नियमित खर्च का विवरण व्यवस्थित करें।', en: 'Organise the details of one recurring expense.' },
      },
      mixed: {
        body: { hi: 'इच्छाओं और जिम्मेदारियों को एक साथ देखें। किसी प्रस्ताव या खरीद के बारे में जल्दबाज़ी महसूस हो तो आवश्यक जानकारी और अपनी ज़रूरत पर लौटें।', en: 'Consider wishes alongside responsibilities. If an offer or purchase feels urgent, return to the information you need and the purpose it serves.' },
        step: { hi: 'किसी लंबित खरीद के बारे में अपना एक प्रश्न लिखें।', en: 'Write down one question about a pending purchase.' },
      },
      reflective: {
        body: { hi: 'खर्च और साझा संसाधनों के विषय में ठहरकर समझना उपयोगी हो सकता है। अनुमानित रकम और वास्तविक विवरण को अलग रखें; अधूरी जानकारी को पहचानें।', en: 'Allow time to understand spending and shared resources. Keep estimated amounts separate from recorded details, and notice where information is missing.' },
        step: { hi: 'एक लंबित भुगतान का विवरण जाँचें।', en: 'Check the details of one pending payment.' },
      },
    },
  },
  {
    id: 'wellbeing', title: { hi: 'स्वास्थ्य और दिनचर्या', en: 'Wellbeing and routine' },
    houses: [1, 6, 12], grahas: ['moon'],
    copies: {
      supportive: {
        body: { hi: 'दिनचर्या में सहज नियमितता को स्थान दें। भोजन, विश्राम और अपनी सुविधा के अनुसार हल्की गतिविधि के लिए समय देखें; यह आदतों पर चिंतन है।', en: 'Make room for comfortable consistency in your routine. Notice the time available for meals, rest and gentle activity that suits you; this is a reflection on habits.' },
        step: { hi: 'दिन में एक सहज विराम के लिए समय रखें।', en: 'Leave time for a comfortable pause in your day.' },
      },
      mixed: {
        body: { hi: 'व्यस्तता के बीच अपनी दिनचर्या की ज़रूरतें नज़र में रखें। ध्यान दें कि कौन-सा काम आपकी ऊर्जा लेता है और कहाँ विश्राम की जगह बचती है।', en: 'Keep the needs of your routine in view amid activity. Notice which tasks take your energy and where there is room for rest.' },
        step: { hi: 'स्क्रीन से कुछ देर का सहज विराम लें।', en: 'Take a comfortable break from your screen.' },
      },
      reflective: {
        body: { hi: 'दिन की गति को समझने के लिए थोड़ा ठहरें। हर खाली समय में नया काम भरने से पहले देखें कि आपके लिए विश्राम और नियमितता का क्या अर्थ है।', en: 'Pause to notice the pace of your day. Before filling every gap with another task, reflect on what rest and regularity mean for you.' },
        step: { hi: 'एक छोटा समय बिना काम तय किए छोड़ें।', en: 'Leave a short stretch of time unscheduled.' },
      },
    },
  },
  {
    id: 'family', title: { hi: 'परिवार और घर', en: 'Family and home' },
    houses: [2, 4, 7], grahas: ['moon'],
    copies: {
      supportive: {
        body: { hi: 'घर और परिवार में छोटी मदद को महत्व दें। मिलकर काम करने से जिम्मेदारियाँ समझना आसान हो सकता है; पूछें कि किस सहयोग की ज़रूरत है।', en: 'Give small acts of help a place at home. Working together can make responsibilities easier to understand; ask what support would be useful.' },
        step: { hi: 'एक साझा जिम्मेदारी में हाथ बँटाएँ।', en: 'Help with one shared responsibility.' },
      },
      mixed: {
        body: { hi: 'परिवार की ज़रूरतों के साथ अपने समय की सीमा भी स्पष्ट करें। अलग राय को तुरंत असहमति मानने के बजाय उसके पीछे की ज़रूरत समझें।', en: 'Make your time boundaries clear alongside family needs. Rather than treating a different view as opposition, try to understand the need behind it.' },
        step: { hi: 'घर के एक काम पर मिलकर सहमति बनाएँ।', en: 'Agree together on one household task.' },
      },
      reflective: {
        body: { hi: 'घर के विषयों में पुराने निष्कर्ष दोहराने से पहले वर्तमान बात सुनें। मदद की ज़रूरत को स्पष्ट और छोटा अनुरोध बनाकर कहना उपयोगी हो सकता है।', en: 'Listen to the present situation before repeating an old conclusion about home matters. It may help to express a need for help as a clear, manageable request.' },
        step: { hi: 'अपनी ज़रूरत एक शांत वाक्य में कहें।', en: 'Express one need in a calm sentence.' },
      },
    },
  },
  {
    id: 'practice', title: { hi: 'मन और साधना', en: 'Reflection and practice' },
    houses: [5, 8, 9, 12], grahas: ['jupiter', 'ketu'],
    copies: {
      supportive: {
        body: { hi: 'सीख और साधना के लिए सहज समय रखें। परिचित पाठ में एक विचार चुनें और देखें कि उसे दिन के व्यवहार से कैसे जोड़ सकते हैं।', en: 'Make easy space for learning and practice. Choose one thought from a familiar reading and consider how it relates to your day.' },
        step: { hi: 'किसी परिचित पाठ का एक विचार याद रखें।', en: 'Carry one thought from a familiar reading with you.' },
      },
      mixed: {
        body: { hi: 'साधना में नियमितता के साथ लचीलापन रखें। ध्यान भटके तो उसे दोष देने के बजाय सहजता से अपने पाठ या श्वास पर लौटें।', en: 'Balance regularity with flexibility in practice. When attention wanders, return gently to your reading or breath without judging it.' },
        step: { hi: 'कुछ शांत श्वासों के बाद छोटा पाठ करें।', en: 'Read a short passage after a few quiet breaths.' },
      },
      reflective: {
        body: { hi: 'मन में चल रहे विचारों को समझने के लिए छोटा विराम लें। साधना की अवधि मापने के बजाय परिचित प्रार्थना के साथ सहज उपस्थिति को स्थान दें।', en: 'Take a short pause to notice the thoughts you are carrying. Give a familiar prayer your presence rather than measuring the length of your practice.' },
        step: { hi: 'एक परिचित प्रार्थना बिना जल्दबाज़ी पढ़ें।', en: 'Read a familiar prayer without rushing.' },
      },
    },
  },
];

export const READING_TONE_LABELS: Record<ReadingTone, ReadingText> = {
  supportive: { hi: 'सहज प्रयास', en: 'Steady effort' },
  mixed: { hi: 'संतुलित ध्यान', en: 'Balanced attention' },
  reflective: { hi: 'ठहरकर समझें', en: 'Pause and reflect' },
};

export type LifeAreaEvidence = {
  graha: Graha;
  houseFromMoon: number;
  houseFromLagna: number | null;
  supportive: boolean;
  relation: 'house' | 'significator' | 'both';
  description: ReadingText;
};
export type RashifalLifeArea = {
  id: LifeAreaId;
  title: ReadingText;
  tone: ReadingTone;
  body: ReadingText;
  step: ReadingText;
  evidence: readonly LifeAreaEvidence[];
  personalNote: ReadingText | null;
};
export type DetailedRashifal = {
  dateKey: string;
  rashiIndex: number;
  isPersonal: boolean;
  headline: ReadingText;
  summary: ReadingText;
  areas: readonly RashifalLifeArea[];
};

/** Shared support table determines each observation; mixed signals stay mixed. */
export function readingTone(evidence: readonly { supportive: boolean }[]): ReadingTone {
  if (!evidence.length) return 'reflective';
  const support = evidence.some((item) => item.supportive);
  const pause = evidence.some((item) => !item.supportive);
  return support && pause ? 'mixed' : support ? 'supportive' : 'reflective';
}

/** One anchored reading, with birth-derived context only on the natal selection. */
export function computeDetailedRashifal(
  date: Date, rashiIndex: number, chart?: KundaliChart | null,
): DetailedRashifal {
  const transits = computeRashiTransits(date, rashiIndex);
  const natalMoon = chart?.grahas.find((position) => position.graha === 'moon');
  const personalChart = natalMoon?.rashiIndex === rashiIndex ? chart : null;
  const dasha = personalChart ? getCurrentDasha(personalChart, indiaDayAnchor(date)) : null;
  const areas = AREAS.map((area): RashifalLifeArea => {
    const relevant = transits.filter((transit) =>
      area.houses.includes(transit.house) || area.grahas.includes(transit.graha));
    const evidence = relevant.map((transit): LifeAreaEvidence => {
      const houseMatch = area.houses.includes(transit.house);
      const significator = area.grahas.includes(transit.graha);
      const houseFromLagna = personalChart
        ? houseForRashi(transit.transitRashi, personalChart.lagnaRashiIndex) : null;
      return {
        graha: transit.graha, houseFromMoon: transit.house, houseFromLagna,
        supportive: transit.supportive,
        relation: houseMatch && significator ? 'both' : houseMatch ? 'house' : 'significator',
        description: {
          hi: `${GRAHA_NAMES_HI[transit.graha]} · चन्द्र से ${transit.house} भाव${houseFromLagna === null ? '' : ` · लग्न से ${houseFromLagna} भाव`}। ${HOUSE_THEME_HI[transit.house - 1]}: ${transit.supportive ? 'पारम्परिक गोचर तालिका सहज प्रयास का संकेत देती है।' : 'पारम्परिक गोचर तालिका ठहरकर ध्यान देने का संकेत देती है।'}`,
          en: `${GRAHA_NAMES_EN[transit.graha]} · house ${transit.house} from Moon${houseFromLagna === null ? '' : ` · house ${houseFromLagna} from Lagna`}. ${HOUSE_THEME_EN[transit.house - 1]}: ${transit.supportive ? 'the traditional transit table suggests steady effort.' : 'the traditional transit table suggests patient attention.'}`,
        },
      };
    });
    const tone = readingTone(evidence);
    const active = [
      { lord: dasha?.maha.lord, hi: 'महादशा', en: 'Mahadasha' },
      { lord: dasha?.antar?.lord, hi: 'अन्तर्दशा', en: 'Antardasha' },
    ].filter((period) => period.lord && relevant.some((t) => t.graha === period.lord));
    const personalNote = active.length ? {
      hi: `${active.map((p) => `${GRAHA_NAMES_HI[p.lord!]} ${p.hi}`).join(' · ')}: यह ग्रह इस पहलू के गोचर संकेतों में भी शामिल है। परम्परा में इसे नियमित ध्यान का अतिरिक्त संदर्भ माना जाता है।`,
      en: `${active.map((p) => `${GRAHA_NAMES_EN[p.lord!]} ${p.en}`).join(' · ')}: this planet also appears in this area's transit signals. Tradition treats this as additional context for regular attention.`,
    } : null;
    const focus = relevant.find((t) => t.graha === 'moon' && area.houses.includes(t.house))
      ?? relevant.find((t) => area.houses.includes(t.house)) ?? relevant[0];
    const copy = area.copies[tone];
    const body = {
      hi: `${GRAHA_NAMES_HI[focus.graha]} का चन्द्र राशि से ${focus.house} भाव ${HOUSE_THEME_HI[focus.house - 1]} का संदर्भ जोड़ता है। ${copy.body.hi}`,
      en: `${GRAHA_NAMES_EN[focus.graha]} in house ${focus.house} from the Moon sign adds the theme of ${HOUSE_THEME_EN[focus.house - 1]}. ${copy.body.en}`,
    };
    return { id: area.id, title: area.title, tone, body, step: copy.step, evidence, personalNote };
  });
  // Moon's current house chooses the day's entry theme, not a date-seeded rotation.
  const moonHouse = transits.find((t) => t.graha === 'moon')!.house;
  const focus = areas[AREAS.findIndex((area) => area.houses.includes(moonHouse))];
  const tone = READING_TONE_LABELS[focus.tone];
  return {
    dateKey: indiaDateKey(date), rashiIndex, isPersonal: !!personalChart,
    headline: { hi: `${focus.title.hi} · ${tone.hi}`, en: `${focus.title.en} · ${tone.en}` },
    summary: {
      hi: `आज चन्द्र का ${moonHouse} भाव ${HOUSE_THEME_HI[moonHouse - 1]} पर ध्यान का संदर्भ देता है। ${focus.step.hi}`,
      en: `Today's Moon in house ${moonHouse} offers a reflection on ${HOUSE_THEME_EN[moonHouse - 1]}. ${focus.step.en}`,
    },
    areas,
  };
}
