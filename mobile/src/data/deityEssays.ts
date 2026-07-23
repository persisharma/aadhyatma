import type { Deity } from './texts';

export type DeityEssay = {
  deityId: Deity;
  titleHi: string;
  titleEn: string;
  bodyHi: string;
  bodyEn: string;
  source: string;
};

const source =
  'Curated deity overview from bundled text provenance and standard devotional catalog context; browse copy only.';

export const deityEssays: Partial<Record<Deity, DeityEssay>> = {
  hanuman: {
    deityId: 'hanuman',
    titleHi: 'भक्ति, बल और निर्भयता के आराध्य',
    titleEn: 'Devotion, Strength, and Fearlessness',
    bodyHi:
      'हनुमान जी रामभक्ति, सेवा, साहस और संकट-निवारण के प्रमुख देवता माने जाते हैं। इस पृष्ठ पर चालीसा, अष्टकम्, आरती और स्तोत्र एक ही स्थान पर मिलते हैं।',
    bodyEn:
      'Hanuman is worshipped for Rama-bhakti, service, courage, and relief from distress. This page gathers his chalisas, ashtakams, aartis, and hymns in one place.',
    source,
  },
  rama: {
    deityId: 'rama',
    titleHi: 'मर्यादा, करुणा और रक्षा',
    titleEn: 'Dharma, Grace, and Protection',
    bodyHi:
      'श्रीराम धर्म, मर्यादा और करुणा के आदर्श हैं। रामरक्षा, राम चालीसा और मंगलाचरण पाठ परिवार-कल्याण और शांत साधना के लिए साथ रखे गए हैं।',
    bodyEn:
      'Shri Rama embodies dharma, restraint, and compassion. Rama Raksha, Ram Chalisa, and mangalacharan texts are grouped for peaceful family practice.',
    source,
  },
  krishna: {
    deityId: 'krishna',
    titleHi: 'गीता, माधुर्य और प्रेमभक्ति',
    titleEn: 'Gita, Sweetness, and Loving Devotion',
    bodyHi:
      'श्रीकृष्ण गीता के उपदेशक, लीला-माधुर्य और प्रेमभक्ति के केन्द्र हैं। गीता, स्तोत्र, चालीसा और आरती को ज्ञान और भक्ति के मार्ग से जोड़ा गया है।',
    bodyEn:
      'Shri Krishna is the teacher of the Gita and the center of loving bhakti. Gita, stotra, chalisa, and aarti entries are grouped around knowledge and devotion.',
    source,
  },
  shiva: {
    deityId: 'shiva',
    titleHi: 'शांति, तप और कल्याण',
    titleEn: 'Peace, Tapas, and Auspiciousness',
    bodyHi:
      'भगवान शिव तप, वैराग्य और कल्याण के देव हैं। स्तोत्र, कवच, चालीसा और लिङ्गाष्टकम् शिव-साधना के अलग-अलग रूप दिखाते हैं।',
    bodyEn:
      'Lord Shiva is revered for tapas, detachment, and auspicious grace. Stotram, kavacham, chalisa, and Lingashtakam show complementary forms of Shiva practice.',
    source,
  },
  durga: {
    deityId: 'durga',
    titleHi: 'शक्ति, संरक्षण और विजय',
    titleEn: 'Shakti, Protection, and Victory',
    bodyHi:
      'माँ दुर्गा शक्ति, रक्षा और दुष्ट-विनाश की आराध्या हैं। दुर्गा कवच, देवी सूक्त और स्तुतियाँ संरक्षण और विजय के उद्देश्य से साथ रखी गई हैं।',
    bodyEn:
      'Maa Durga is worshipped as shakti, protection, and the destroyer of evil. Durga Kavach, Devi Suktam, and stutis are grouped for protection and victory.',
    source,
  },
  ganesha: {
    deityId: 'ganesha',
    titleHi: 'विघ्नहर्ता और शुभारम्भ',
    titleEn: 'Remover of Obstacles and Auspicious Beginnings',
    bodyHi:
      'श्रीगणेश किसी भी शुभ कार्य के प्रथम पूज्य हैं। गणेश चालीसा, स्तोत्र, कवच और आरती शुभारम्भ और विघ्न-निवारण की सतह पर जोड़े गए हैं।',
    bodyEn:
      'Shri Ganesha is invoked before auspicious work. Ganesh Chalisa, stotram, kavacham, and aarti are grouped for beginnings and obstacle removal.',
    source,
  },
  vishnu: {
    deityId: 'vishnu',
    titleHi: 'पालन, शांति और परम पथ',
    titleEn: 'Sustenance, Peace, and the Supreme Path',
    bodyHi:
      'भगवान विष्णु पालन और धर्म-संरक्षण के देव हैं। सहस्रनाम, सूक्त और चालीसा शांति, समृद्धि और मोक्ष-मार्ग से सम्बद्ध हैं।',
    bodyEn:
      'Lord Vishnu is revered as sustainer and protector of dharma. Sahasranama, suktam, and chalisa entries connect to peace, prosperity, and moksha.',
    source,
  },
  saraswati: {
    deityId: 'saraswati',
    titleHi: 'विद्या, वाणी और कला',
    titleEn: 'Learning, Speech, and the Arts',
    bodyHi:
      'माँ सरस्वती विद्या, वाणी और कला की देवी हैं। स्तोत्र, चालीसा, आरती और विद्यारम्भ प्रार्थना अध्ययन-साधना के लिए संगठित हैं।',
    bodyEn:
      'Maa Saraswati presides over learning, speech, and the arts. Stotram, chalisa, aarti, and Vidyarambha prayers are grouped for study practice.',
    source,
  },
};
