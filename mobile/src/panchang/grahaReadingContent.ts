import type { Graha } from './kundali';
import type { KundaliGrahaTone, KundaliReportPracticeId } from './kundaliReportModel';
import { DAAN_VAAR_ENTRIES } from '../data/daan/vaar';

/**
 * Graha-by-graha reading content — RULEBOOK §14.7. DRAFT: every table in this
 * file waits on a jyotishi's review (`GRAHA_READING_REVIEW`), and until it is
 * approved the report screen shows the cards in development builds only.
 *
 * The register is a family pandit speaking plainly: the life meaning first,
 * the classical term after it in brackets, behavioural care lines, and one
 * practice per graha. Nothing here names an event, an illness, a date, or a
 * fate — §14.3.5's bans hold over every string (vocabulary-scanned by
 * `grahaReading.engine.test.ts`).
 *
 * Sources the reviewer is asked to check against: Brihat Parashara Hora
 * Shastra (bhava-phala chapters; graha shanti for the daan items), Phaladeepika
 * ch. 8 and Saravali for placement results, the shared vaar-daan table
 * (`data/daan/vaar.ts`, already two-source checked), and the folk seva
 * practices (gau-gras, roti for a dog) flagged in the review sheet. Edit this
 * file, then regenerate the sheet: `npm run export:graha-review`.
 */

export type GrahaReadingReview = {
  status: 'draft' | 'approved';
  /**
   * Where the sign-off is recorded — the review artifact's link or a ticket id.
   * Never the reviewer's name or contact: no personal details live in the repo.
   */
  signOffRef: string | null;
  /** India civil date of the sign-off (YYYY-MM-DD). */
  reviewedOn: string | null;
  scope: string;
};

export const GRAHA_READING_REVIEW: GrahaReadingReview = {
  status: 'draft',
  signOffRef: null,
  reviewedOn: null,
  scope:
    'GRAHA_PLAIN, BHAVA_PLAIN, GRAHA_BHAVA_READINGS (9 × 12), the strength, reason and tone phrases, the empty-houses copy, GRAHA_UPAY (9 rows), and the tone convention in docs/roadmap/conventions/graha-reading-v1.md',
};

/** A store build may show the cards only once a recorded, dated sign-off exists. */
export function grahaReadingsApproved(review: GrahaReadingReview = GRAHA_READING_REVIEW): boolean {
  return review.status === 'approved' && review.signOffRef !== null && review.reviewedOn !== null;
}

export type Bilingual = { hi: string; en: string };

/** What each graha stands for — the first line of its card. */
export const GRAHA_PLAIN: Readonly<Record<Graha, { nameHi: string; nameEn: string; meaningHi: string; meaningEn: string }>> = {
  sun: {
    nameHi: 'सूर्य',
    nameEn: 'Sun (Surya)',
    meaningHi: 'आत्मविश्वास, आत्म-सम्मान, पिता और अधिकार का ग्रह',
    meaningEn: 'the planet of confidence, self-respect, father and authority',
  },
  moon: {
    nameHi: 'चन्द्र',
    nameEn: 'Moon (Chandra)',
    meaningHi: 'मन, भावनाओं, माँ और भीतर की शांति का ग्रह',
    meaningEn: 'the planet of the mind, feelings, mother and inner peace',
  },
  mars: {
    nameHi: 'मंगल',
    nameEn: 'Mars (Mangal)',
    meaningHi: 'ऊर्जा, साहस, जोश, भाइयों और भूमि का ग्रह',
    meaningEn: 'the planet of energy, courage, drive, brothers and land',
  },
  mercury: {
    nameHi: 'बुध',
    nameEn: 'Mercury (Budh)',
    meaningHi: 'बुद्धि, वाणी, सीखने और व्यापार की समझ का ग्रह',
    meaningEn: 'the planet of intelligence, speech, learning and business sense',
  },
  jupiter: {
    nameHi: 'गुरु (बृहस्पति)',
    nameEn: 'Jupiter (Guru)',
    meaningHi: 'ज्ञान, गुरुजनों, संतान, श्रद्धा और सौभाग्य का ग्रह',
    meaningEn: 'the planet of wisdom, teachers, children, faith and good fortune',
  },
  venus: {
    nameHi: 'शुक्र',
    nameEn: 'Venus (Shukra)',
    meaningHi: 'प्रेम, विवाह, सुख-सुविधा, सौन्दर्य और कला का ग्रह',
    meaningEn: 'the planet of love, marriage, comforts, beauty and art',
  },
  saturn: {
    nameHi: 'शनि',
    nameEn: 'Saturn (Shani)',
    meaningHi: 'मेहनत, अनुशासन, धैर्य और न्याय का ग्रह',
    meaningEn: 'the planet of hard work, discipline, patience and justice',
  },
  rahu: {
    nameHi: 'राहु',
    nameEn: 'Rahu',
    meaningHi: 'बड़ी इच्छाओं, महत्वाकांक्षा, विदेशी चीज़ों और अचानक मोड़ों का छाया ग्रह',
    meaningEn: 'a shadow graha (chhaya graha) of big desires, ambition, foreign things and sudden turns',
  },
  ketu: {
    nameHi: 'केतु',
    nameEn: 'Ketu',
    meaningHi: 'त्याग, आध्यात्मिकता और अंतर्ज्ञान का छाया ग्रह',
    meaningEn: 'a shadow graha (chhaya graha) of letting go, spirituality and intuition',
  },
};

/**
 * Each house's life areas in everyday words — `short` names it inside a
 * sentence — and its karaka: the graha that naturally looks after the house's
 * matters (BPHS sthira bhava-karakas; the reviewer confirms the list).
 */
export const BHAVA_PLAIN: readonly { hi: string; en: string; shortHi: string; shortEn: string; karakas: readonly Graha[] }[] = [
  {
    hi: 'स्वयं आप — शरीर, स्वभाव, आत्मविश्वास और काम शुरू करने का ढंग',
    en: 'you yourself — body, nature, confidence and how you begin things',
    shortHi: 'स्वयं आप',
    shortEn: 'you yourself',
    karakas: ['sun'],
  },
  {
    hi: 'परिवार, जमा-पूँजी, वाणी और खान-पान',
    en: 'family, savings, speech and food',
    shortHi: 'परिवार और बचत',
    shortEn: 'family and savings',
    karakas: ['jupiter'],
  },
  {
    hi: 'साहस, मेहनत, छोटे भाई-बहन, छोटी यात्राएँ और अपनी बात रखने का कौशल',
    en: 'courage, effort, younger siblings, short trips and how you express yourself',
    shortHi: 'साहस और मेहनत',
    shortEn: 'courage and effort',
    karakas: ['mars'],
  },
  {
    hi: 'घर, माँ, वाहन, ज़मीन-जायदाद और मन की शांति',
    en: 'home, mother, vehicles, property and peace of mind',
    shortHi: 'घर और माँ',
    shortEn: 'home and mother',
    karakas: ['moon'],
  },
  {
    hi: 'पढ़ाई, बुद्धि, रचनात्मकता, संतान और पूर्व-पुण्य',
    en: 'studies, intelligence, creativity, children and past good deeds',
    shortHi: 'पढ़ाई और संतान',
    shortEn: 'studies and children',
    karakas: ['jupiter'],
  },
  {
    hi: 'रोज़ का काम, दिनचर्या, प्रतियोगिता, सेवा और कर्ज़',
    en: 'daily work, routine, competition, service and debts',
    shortHi: 'काम और प्रतियोगिता',
    shortEn: 'work and competition',
    karakas: ['mars', 'saturn'],
  },
  {
    hi: 'विवाह, जीवनसाथी, साझेदारी और दूसरों से व्यवहार',
    en: 'marriage, your partner, partnerships and dealings with others',
    shortHi: 'विवाह और साझेदारी',
    shortEn: 'marriage and partnerships',
    karakas: ['venus'],
  },
  {
    hi: 'अचानक बदलाव, शोध, छिपे विषय और ससुराल या साझी सम्पत्ति',
    en: 'sudden changes, research, hidden matters and in-laws’ or shared resources',
    shortHi: 'अचानक बदलाव और छिपे विषय',
    shortEn: 'sudden changes and hidden matters',
    karakas: ['saturn'],
  },
  {
    hi: 'भाग्य, पिता, गुरु, श्रद्धा, धर्म और लंबी यात्राएँ',
    en: 'fortune, father, teachers, faith, dharma and long journeys',
    shortHi: 'भाग्य और धर्म',
    shortEn: 'fortune and dharma',
    karakas: ['jupiter', 'sun'],
  },
  {
    hi: 'करियर, काम-काज, मान-सम्मान और समाज में स्थान',
    en: 'career, work, reputation and standing in society',
    shortHi: 'करियर और मान-सम्मान',
    shortEn: 'career and reputation',
    karakas: ['sun', 'mercury', 'jupiter', 'saturn'],
  },
  {
    hi: 'आमदनी, लाभ, मित्र, बड़े भाई-बहन और इच्छाओं की पूर्ति',
    en: 'income, gains, friends, elder siblings and wishes fulfilled',
    shortHi: 'आमदनी और लाभ',
    shortEn: 'income and gains',
    karakas: ['jupiter'],
  },
  {
    hi: 'खर्च, नींद और विश्राम, दूर देश या विदेश, और आध्यात्मिक मुक्ति',
    en: 'expenses, sleep and rest, faraway places or abroad, and spiritual release',
    shortHi: 'खर्च और दूर देश',
    shortEn: 'expenses and faraway places',
    karakas: ['saturn'],
  },
];

export type GrahaBhavaReading = {
  givesHi: readonly string[];
  givesEn: readonly string[];
  careHi: readonly string[];
  careEn: readonly string[];
};

/**
 * What a graha gives in each house, and where to take care — index 0 is the
 * 1st house. Short bullets, one idea each (review note, 3 Oct 2026: "too much
 * text in a paragraph"). Generic to the placement: the sign's strength, the
 * Lagna's lordship and combustion are stated by the card's own lines, so these
 * bullets never repeat or contradict them.
 */
export const GRAHA_BHAVA_READINGS: Readonly<Record<Graha, readonly GrahaBhavaReading[]>> = {
  sun: [
    {
      givesHi: [
        'आत्मविश्वासी, स्वाभिमानी स्वभाव',
        'स्वाभाविक नेतृत्व',
        'लोग आप पर ध्यान देते हैं और आपसे आगे आने की आशा रखते हैं',
      ],
      givesEn: [
        'A confident, self-respecting nature',
        'Natural leadership',
        'People notice you and look to you to lead',
      ],
      careHi: ['अहंकार और जल्दी गुस्सा लोगों को दूर कर सकता है', 'निर्णय से पहले सुनें'],
      careEn: ['Pride and a quick temper can push people away', 'Listen before you decide'],
    },
    {
      givesHi: ['सरकार या अधिकार से जुड़ी कमाई', 'परिवार के नाम से मान', 'वज़नदार वाणी'],
      givesEn: [
        'Earnings linked to government or authority',
        'Respect through your family’s name',
        'Speech that carries weight',
      ],
      careHi: [
        'कठोर या हुक्म भरे शब्द परिवार में खिंचाव ला सकते हैं',
        'अपनेपन से बोलें',
        'बचत नियमित रखें',
      ],
      careEn: [
        'Harsh or commanding words can strain family ties',
        'Speak with warmth',
        'Keep savings regular',
      ],
    },
    {
      givesHi: [
        'भरपूर साहस और इच्छाशक्ति',
        'जिस मेहनत से दूसरे हटते हैं, आप उसे पूरा करते हैं',
        'संवाद, मीडिया और साहसी कामों में सफलता',
      ],
      givesEn: [
        'Strong courage and willpower',
        'You finish efforts others give up on',
        'Success in communication, media and bold ventures',
      ],
      careHi: [
        'होड़ की भावना रिश्तों में खिंचाव ला सकती है',
        'छोटे भाई-बहनों और साथियों से मेल रखें',
      ],
      careEn: [
        'A competitive streak can strain ties',
        'Stay close to younger siblings and colleagues',
      ],
    },
    {
      givesHi: ['घर और अपनी जड़ों से जुड़ी गरिमा', 'मेहनत से ज़मीन-जायदाद या वाहन के अवसर'],
      givesEn: [
        'Dignity around your home and roots',
        'Chances of property or vehicles through effort',
      ],
      careHi: [
        'घर का माहौल औपचारिक या तनाव भरा लग सकता है',
        'माँ और परिवार के साथ अपनापन बढ़ाएँ',
        'मन को आराम दें',
      ],
      careEn: [
        'Home life can feel formal or tense',
        'Make room for warmth with your mother and family',
        'Give your mind rest',
      ],
    },
    {
      givesHi: [
        'तेज़, आत्मविश्वासी बुद्धि',
        'पढ़ाई और रचनात्मक काम में नेतृत्व',
        'राजनीति, प्रबंधन या धर्म में रुचि',
      ],
      givesEn: [
        'A sharp, confident mind',
        'Leadership in studies and creative work',
        'Interest in politics, management or dharma',
      ],
      careHi: [
        'प्रेम और अपनी रचना के अभिमान में अहं नरम करें',
        'श्रेय बाँटें, दूसरों के विचार सुनें',
      ],
      careEn: [
        'Soften ego in romance and in pride over your work',
        'Share credit and stay open to others’ ideas',
      ],
    },
    {
      givesHi: [
        'प्रतियोगिता और विरोधियों पर विजय',
        'सेवा, प्रशासन या न्याय के कामों में सफलता',
      ],
      givesEn: [
        'Wins over competition and rivals',
        'Success in service, administration or legal work',
      ],
      careHi: ['हर विवाद को व्यक्तिगत न लें', 'झगड़ों से अधिक नियमित दिनचर्या साथ देती है'],
      careEn: [
        'Do not take every dispute personally',
        'A steady routine serves you better than battles',
      ],
    },
    {
      givesHi: [
        'प्रतिष्ठित, दृढ़ व्यक्तित्व वाले जीवनसाथी या साथी',
        'सार्वजनिक व्यवहार और साझेदारी से लाभ',
      ],
      givesEn: [
        'A partner or associates with standing',
        'Gains through public dealings and partnerships',
      ],
      careHi: [
        'दो मज़बूत अहं टकरा सकते हैं',
        'विवाह और व्यापार में नियंत्रण नहीं, लेन-देन का संतुलन रखें',
      ],
      careEn: [
        'Two strong egos can clash',
        'In marriage and business, keep give-and-take instead of control',
      ],
    },
    {
      givesHi: [
        'शोध और गूढ़ ज्ञान में रुचि',
        'अचानक बदलाव को भीतरी बल से सँभालने की क्षमता',
      ],
      givesEn: [
        'Interest in research and deep knowledge',
        'Inner strength to handle sudden change',
      ],
      careHi: [
        'मान-सम्मान देर से या चुपचाप मिल सकता है',
        'अधिकारियों से टकराव के बजाय धैर्य रखें',
      ],
      careEn: [
        'Recognition can come late or quietly',
        'Patience with authority works better than confrontation',
      ],
    },
    {
      givesHi: [
        'धर्म, गुरु और पिता के प्रति आदर',
        'सिद्धांत, उच्च शिक्षा और लंबी यात्राओं से भाग्य',
      ],
      givesEn: [
        'Respect for dharma, teachers and father',
        'Fortune through principles, higher learning and long journeys',
      ],
      careHi: [
        'दृढ़ विचार कठोर हो सकते हैं',
        'असहमति में भी पिता और गुरुओं से विनम्र रहें',
      ],
      careEn: [
        'Firm views can turn rigid',
        'Stay humble with your father and teachers, even when you disagree',
      ],
    },
    {
      givesHi: [
        'सूर्य की सबसे अच्छी जगहों में से एक',
        'करियर और सरकार में अधिकार और पहचान',
        'नेतृत्व की भूमिकाओं में सफलता',
      ],
      givesEn: [
        'One of the Sun’s best seats',
        'Authority and recognition in career or government',
        'Success in leadership roles',
      ],
      careHi: [
        'सफलता अभिमान ला सकती है',
        'अपने से छोटों से अच्छा व्यवहार करें',
        'आचरण साफ़ रखें — मान-सम्मान ही असली पूँजी है',
      ],
      careEn: [
        'Success can bring pride',
        'Treat juniors well',
        'Keep your conduct clean — your reputation is your real capital',
      ],
    },
    {
      givesHi: [
        'स्थिर लाभ',
        'प्रभावशाली मित्र और अधिकार वाले लोगों का साथ',
        'मेहनत से इच्छाएँ पूरी',
      ],
      givesEn: [
        'Steady gains',
        'Influential friends and support from people in authority',
        'Wishes come true through effort',
      ],
      careHi: ['मित्र पद से नहीं, चरित्र से चुनें', 'साथियों के साथ श्रेय बाँटें'],
      careEn: [
        'Choose friends for character, not position',
        'Share credit with your circle',
      ],
    },
    {
      givesHi: [
        'आध्यात्मिकता और दान-पुण्य की ओर झुकाव',
        'विदेश, दूर-दराज़ या पर्दे के पीछे के काम',
      ],
      givesEn: [
        'A leaning toward spirituality and charity',
        'Work abroad, far away or behind the scenes',
      ],
      careHi: [
        'खर्च बढ़ सकते हैं',
        'पहचान पर्दे के पीछे रह सकती है',
        'दिनचर्या नियमित रखें और शांत सेवा को महत्व दें',
      ],
      careEn: [
        'Expenses can rise',
        'Recognition can stay behind the scenes',
        'Keep a regular routine and value quiet service',
      ],
    },
  ],
  moon: [
    {
      givesHi: [
        'कोमल, देखभाल करने वाला स्वभाव',
        'लोग आपसे जल्दी घुल-मिल जाते हैं',
        'दूसरों की भावनाएँ समझते हैं',
      ],
      givesEn: [
        'A gentle, caring nature',
        'People warm to you quickly',
        'You understand how others feel',
      ],
      careHi: ['मन जल्दी बदल सकता है', 'नियमित दिनचर्या और शांत समय रखें'],
      careEn: ['Moods can change quickly', 'Keep a regular routine and some quiet time'],
    },
    {
      givesHi: [
        'मधुर, शांत करने वाली वाणी',
        'स्नेही परिवार और स्थिर सुख-सुविधा',
        'जनता से जुड़े काम से आमदनी',
      ],
      givesEn: [
        'Sweet, soothing speech',
        'A loving family and steady comforts',
        'Income through work with the public',
      ],
      careHi: ['सुख-सुविधा पर खर्च मन के साथ बदल सकता है', 'बचत नियमित रखें'],
      careEn: ['Spending on comforts can follow your mood', 'Keep savings regular'],
    },
    {
      givesHi: [
        'रचनात्मक, खुलकर कहने वाला मन',
        'लेखन, बोलने और यात्रा में अच्छा',
        'जनता से जुड़े कामों में सफलता',
      ],
      givesEn: [
        'A creative, expressive mind',
        'Good at writing, speaking and travel',
        'Success in work with the public',
      ],
      careHi: [
        'साहस मन के साथ घट-बढ़ सकता है',
        'नया काम शुरू करने से पहले पुराना पूरा करें',
      ],
      careEn: [
        'Courage can rise and fall with your mood',
        'Finish one task before starting the next',
      ],
    },
    {
      givesHi: [
        'चन्द्र की सबसे अच्छी जगहों में से एक',
        'सुखी घर और माँ से गहरा जुड़ाव',
        'सुख-सुविधा, वाहन और मन की शांति',
      ],
      givesEn: [
        'One of the Moon’s best seats',
        'A happy home and a deep bond with your mother',
        'Comforts, vehicles and peace of mind',
      ],
      careHi: ['आपकी शांति घर के माहौल पर बहुत निर्भर है', 'बाहर का तनाव घर में न लाएँ'],
      careEn: [
        'Your peace depends a lot on home life',
        'Do not carry outside stress into the house',
      ],
    },
    {
      givesHi: [
        'कल्पनाशक्ति और भावनात्मक समझ',
        'सीखने का प्रेम',
        'रचनात्मक काम और संतान से आनंद',
      ],
      givesEn: [
        'Imagination and emotional understanding',
        'A love of learning',
        'Joy through creative work and children',
      ],
      careHi: [
        'प्रेम और पढ़ाई में भावनाएँ निर्णय पर हावी हो सकती हैं',
        'दिल के साथ नियमित मेहनत का संतुलन रखें',
      ],
      careEn: [
        'Feelings can cloud judgement in love and studies',
        'Balance the heart with steady effort',
      ],
    },
    {
      givesHi: ['सेवा भाव वाला स्वभाव', 'सेवा, देखभाल और धैर्य वाले कामों में अच्छा'],
      givesEn: [
        'A caring, service-minded nature',
        'Good at service, caregiving and patient work',
      ],
      careHi: [
        'काम की चिंताएँ मन पर भारी पड़ सकती हैं',
        'अपना बोझ बाँटें और दिनचर्या शांत रखें',
      ],
      careEn: [
        'Work worries can weigh on the mind',
        'Share your load and keep a calm routine',
      ],
    },
    {
      givesHi: [
        'स्नेही, आकर्षक जीवनसाथी',
        'लोगों से सहज व्यवहार',
        'सार्वजनिक काम और साझेदारी में सफलता',
      ],
      givesEn: [
        'A caring, attractive partner',
        'An easy way with people',
        'Success in public work and partnerships',
      ],
      careHi: [
        'मन की उथल-पुथल रिश्तों को अस्थिर कर सकती है',
        'अनुमान की आशा के बजाय खुलकर बात करें',
      ],
      careEn: [
        'Mood swings can unsettle relationships',
        'Talk openly instead of expecting your partner to guess',
      ],
    },
    {
      givesHi: [
        'गहरा अंतर्ज्ञान',
        'छिपे विषयों, शोध या साधना में रुचि',
        'बदलाव के बाद फिर से खड़े होने की क्षमता',
      ],
      givesEn: [
        'Deep intuition',
        'Interest in hidden matters, research or spiritual practice',
        'The ability to rebuild after change',
      ],
      careHi: [
        'मन चिंता से बेचैन हो सकता है',
        'प्रार्थना, अच्छी संगत और मन की बात बाँटना स्थिर रखते हैं',
      ],
      careEn: [
        'The mind can grow restless with worry',
        'Prayer, good company and sharing your thoughts keep you steady',
      ],
    },
    {
      givesHi: [
        'श्रद्धा, भक्ति और दयालु मन',
        'माँ और गुरुओं का साथ',
        'तीर्थ और यात्रा में आनंद',
      ],
      givesEn: [
        'Faith, devotion and a kind mind',
        'Support from your mother and teachers',
        'Joy in pilgrimage and travel',
      ],
      careHi: [
        'विश्वास भावनाओं के साथ बदल सकता है',
        'श्रद्धा को नियमित साधना से जोड़े रखें',
      ],
      careEn: [
        'Beliefs can shift with feelings',
        'Anchor your faith in a regular practice',
      ],
    },
    {
      givesHi: [
        'लोकप्रियता',
        'जनता से जुड़े काम में सफलता',
        'लोगों की देखभाल से बढ़ने वाला करियर',
      ],
      givesEn: [
        'Popularity',
        'Success in public-facing work',
        'A career that grows by caring for people',
      ],
      careHi: ['मन के साथ काम बार-बार बदल सकता है', 'बदलने से पहले एक स्थिर राह बनाएँ'],
      careEn: [
        'Work can change often with your mood',
        'Build one steady path before switching',
      ],
    },
    {
      givesHi: [
        'अच्छा लाभ और अनेक मित्र',
        'स्त्रियों और जनता का सहयोग',
        'इच्छाएँ सहजता से पूरी',
      ],
      givesEn: [
        'Good gains and many friends',
        'Support from women and the public',
        'Wishes come true with ease',
      ],
      careHi: [
        'दूसरों की स्वीकृति को अपने निर्णय तय न करने दें',
        'अपनी स्थिर समझ पर भरोसा रखें',
      ],
      careEn: [
        'Do not let others’ approval make your choices',
        'Trust your own steady judgement',
      ],
    },
    {
      givesHi: [
        'समृद्ध भीतरी जीवन और करुणा',
        'गहरी कल्पना',
        'आध्यात्मिकता, दान या दूर देशों की ओर खिंचाव',
      ],
      givesEn: [
        'A rich inner life and compassion',
        'Vivid imagination',
        'A pull toward spirituality, charity or faraway places',
      ],
      careHi: ['खर्च और विश्राम दोनों पर ध्यान चाहिए', 'भावना में किए खर्च पर नज़र रखें'],
      careEn: ['Spending and rest both need attention', 'Watch spending done on impulse'],
    },
  ],
  mars: [
    {
      givesHi: [
        'ऊर्जा और साहस',
        'मज़बूत, सक्रिय स्वभाव',
        'तेज़ी से काम करते हैं, पीछे नहीं हटते',
      ],
      givesEn: [
        'Energy and courage',
        'A strong, active nature',
        'You act fast and do not back down',
      ],
      careHi: [
        'गुस्सा और जल्दबाज़ी मुख्य जाल हैं',
        'प्रतिक्रिया से पहले रुकें',
        'ऊर्जा व्यायाम या सेवा में लगाएँ',
      ],
      careEn: [
        'Anger and haste are the main traps',
        'Pause before reacting',
        'Put your energy into exercise or seva',
      ],
    },
    {
      givesHi: ['कमाने और धन बनाने का जोश', 'मेहनत, ज़मीन-जायदाद या तकनीकी काम से धन'],
      givesEn: [
        'Drive to earn and build wealth',
        'Wealth through effort, property or technical work',
      ],
      careHi: [
        'तीखे शब्द अपनों को चोट पहुँचा सकते हैं',
        'शांति से बोलें',
        'जल्दबाज़ी में खर्च न करें',
      ],
      careEn: ['Sharp words can hurt loved ones', 'Speak calmly', 'Avoid spending in haste'],
    },
    {
      givesHi: [
        'बेहतरीन साहस, पहल और दमखम',
        'खेल और तकनीकी कौशल',
        'अपने बल पर खड़े किए कामों में सफलता',
      ],
      givesEn: [
        'Excellent courage, initiative and stamina',
        'Sports and technical skill',
        'Success in self-made ventures',
      ],
      careHi: ['छोटे भाई-बहनों या साथियों पर हावी न हों', 'धकेलें नहीं, राह दिखाएँ'],
      careEn: [
        'Do not dominate younger siblings or colleagues',
        'Lead them instead of pushing them',
      ],
    },
    {
      givesHi: ['ज़मीन, जायदाद और वाहन पाने का जोश', 'घर-परिवार की रक्षा करने वाला स्वभाव'],
      givesEn: [
        'Drive to own land, property and vehicles',
        'A protective nature toward home and family',
      ],
      careHi: [
        'घर में बेचैनी या बहस शांति भंग कर सकती है',
        'माँ और परिवार के साथ धैर्य रखें',
      ],
      careEn: [
        'Restlessness or arguments can disturb home life',
        'Be patient with your mother and family',
      ],
    },
    {
      givesHi: [
        'तेज़, प्रतिस्पर्धी बुद्धि',
        'तकनीकी पढ़ाई, खेल और रणनीति में अच्छा',
        'साहसी रचनात्मक काम',
      ],
      givesEn: [
        'A quick, competitive mind',
        'Good for technical studies, sports and strategy',
        'Bold creative work',
      ],
      careHi: [
        'पढ़ाई या प्रेम में अधीरता उलटी पड़ सकती है',
        'गति धीमी करें, एक कदम आगे सोचें',
      ],
      careEn: [
        'Impatience in studies or romance can backfire',
        'Slow down and think a step ahead',
      ],
    },
    {
      givesHi: [
        'मंगल के लिए मज़बूत स्थान',
        'प्रतियोगिता और बाधाओं पर विजय',
        'रक्षा, खेल, कानून, पुलिस या तकनीकी सेवा में अच्छा',
      ],
      givesEn: [
        'A strong seat for Mars',
        'Wins over competition and obstacles',
        'Good in defence, sports, law, police or technical service',
      ],
      careHi: ['हर बहस जीतना ज़रूरी नहीं', 'जुझारू भावना काम में लगाएँ, झगड़ों में नहीं'],
      careEn: [
        'You need not win every argument',
        'Use your fighting spirit for work, not quarrels',
      ],
    },
    {
      givesHi: ['ऊर्जावान, जोशीला जीवनसाथी', 'व्यापारिक साझेदारी में उत्साह'],
      givesEn: ['An energetic, passionate partner', 'Drive in business partnerships'],
      careHi: [
        'विवाह या साझेदारी में बहस भड़क सकती है',
        'धैर्य रखें, विवाद शांति से सुलझाएँ',
      ],
      careEn: [
        'Arguments can flare up in marriage or partnerships',
        'Be patient and settle disputes calmly',
      ],
    },
    {
      givesHi: ['कठिन समय में साहस', 'शोध, तकनीकी जाँच या गूढ़ विषयों में रुचि'],
      givesEn: [
        'Courage in hard times',
        'Interest in research, investigation or deep subjects',
      ],
      careHi: [
        'जल्दबाज़ी अचानक रुकावटें ला सकती है',
        'जोखिम भरे फ़ैसलों में गति धीमी रखें',
      ],
      careEn: ['Haste can bring sudden setbacks', 'Slow down before risky choices'],
    },
    {
      givesHi: [
        'सिद्धांतों के लिए डटकर खड़े रहने का बल',
        'साहसिक काम और लंबी यात्राओं की ऊर्जा',
        'सेवा जैसा सक्रिय धर्म',
      ],
      givesEn: [
        'The strength to stand up for your principles',
        'Energy for adventure and long journeys',
        'Active dharma such as seva',
      ],
      careHi: ['पिता या गुरुओं से मान्यताओं पर बहस से बचें', 'मतभेद में भी आदर रखें'],
      careEn: [
        'Avoid arguing over beliefs with your father or teachers',
        'Keep respect even where you differ',
      ],
    },
    {
      givesHi: [
        'मंगल की सबसे अच्छी जगहों में से एक',
        'महत्वाकांक्षा और नेतृत्व',
        'इंजीनियरिंग, रक्षा, खेल, ज़मीन-जायदाद या प्रबंधन में सफलता',
      ],
      givesEn: [
        'One of Mars’s best seats',
        'Ambition and leadership',
        'Success in engineering, defence, sports, property or management',
      ],
      careHi: [
        'पूरी ताक़त लगाएँ, पर दूसरों को कुचलकर नहीं',
        'न्यायप्रियता की साख अधिक टिकती है',
      ],
      careEn: ['Push hard, but not over others', 'A name for fairness lasts longer'],
    },
    {
      givesHi: ['मेहनत, ज़मीन-जायदाद या तकनीकी काम से अच्छा लाभ', 'सक्रिय, वफ़ादार मित्र'],
      givesEn: [
        'Good gains through effort, property or technical work',
        'Active, loyal friends',
      ],
      careHi: ['बड़े भाई-बहनों या मित्रों से होड़ दोस्ताना ही रखें'],
      careEn: ['Keep any rivalry with elder siblings or friends a friendly one'],
    },
    {
      givesHi: [
        'विदेश या दूर-दराज़ के कामों के लिए ऊर्जा',
        'पर्दे के पीछे के काम',
        'अनुशासित साधना का बल',
      ],
      givesEn: [
        'Energy for work abroad or far away',
        'Work behind the scenes',
        'Strength for disciplined spiritual practice',
      ],
      careHi: [
        'खर्च और भीतर दबी झुंझलाहट बढ़ सकती है',
        'खर्च की योजना बनाएँ',
        'गुस्सा दबाएँ नहीं, शारीरिक काम में निकालें',
      ],
      careEn: [
        'Expenses and bottled-up frustration can build',
        'Plan your spending',
        'Let anger out through physical work instead of holding it in',
      ],
    },
  ],
  mercury: [
    {
      givesHi: ['तेज़, हाज़िरजवाब और युवा मन', 'जल्दी सीखते हैं', 'अपनी बात अच्छे से रखते हैं'],
      givesEn: [
        'A sharp, witty and youthful mind',
        'You learn fast',
        'You express yourself well',
      ],
      careHi: [
        'ज़्यादा सोचने की बेचैनी ऊर्जा बिखेर सकती है',
        'एक समय में एक काम पर ध्यान दें',
      ],
      careEn: [
        'Restless overthinking can scatter your energy',
        'Focus on one task at a time',
      ],
    },
    {
      givesHi: ['कुशल, मधुर वाणी', 'धन की समझ', 'व्यापार, अध्यापन, हिसाब-किताब या संवाद से लाभ'],
      givesEn: [
        'Skilled, pleasant speech',
        'A head for money',
        'Gains through business, teaching, accounts or communication',
      ],
      careHi: ['चतुर बातों में सावधान रहें', 'वादे निभाएँ', 'पैसों के मामलों में ईमानदार रहें'],
      careEn: [
        'Be careful with clever talk',
        'Keep your promises',
        'Stay honest in money matters',
      ],
    },
    {
      givesHi: [
        'बेहतरीन संवाद-कौशल',
        'लेखन, मीडिया और बिक्री में सफलता',
        'छोटी यात्राएँ और तेज़ सोच वाले काम',
      ],
      givesEn: [
        'Excellent communication skills',
        'Success in writing, media and sales',
        'Short trips and work that needs quick thinking',
      ],
      careHi: [
        'एक साथ बहुत सारी योजनाएँ काम अधूरा छोड़ सकती हैं',
        'अगला शुरू करने से पहले पिछला पूरा करें',
      ],
      careEn: [
        'Too many plans at once can leave work half-done',
        'Finish one before starting the next',
      ],
    },
    {
      givesHi: ['पढ़ा-लिखा घर', 'अच्छी बुनियादी शिक्षा', 'समझदार योजना से ज़मीन-जायदाद या वाहन'],
      givesEn: [
        'A learned home',
        'A good basic education',
        'Property or vehicles through smart planning',
      ],
      careHi: ['व्यस्त मन भीतर की शांति भंग कर सकता है', 'घर पर शांत समय निकालें'],
      careEn: ['A busy mind can disturb inner peace', 'Make quiet time at home'],
    },
    {
      givesHi: [
        'तेज़ बुद्धि',
        'पढ़ाई, गणित, लेखन और विश्लेषण की प्रतिभा',
        'चतुर, रचनात्मक विचार',
      ],
      givesEn: [
        'Sharp intelligence',
        'A talent for studies, mathematics, writing and analysis',
        'Clever, creative ideas',
      ],
      careHi: [
        'गहराई के बिना चतुराई भटका सकती है',
        'जल्दी के तरीकों के बजाय गहराई से पढ़ें',
      ],
      careEn: [
        'Cleverness without depth can mislead',
        'Study thoroughly instead of relying on quick tricks',
      ],
    },
    {
      givesHi: [
        'समस्याएँ सुलझाने और बारीकियों में कुशलता',
        'हिसाब-किताब, कानून या सेवा में अच्छा',
        'विरोधियों से आगे की सोच',
      ],
      givesEn: [
        'Skill in solving problems and handling details',
        'Good at accounts, law or service',
        'You think a step ahead of rivals',
      ],
      careHi: ['छोटी बातों की चिंता थका सकती है', 'कड़ी आलोचना से बचें, शब्द नरम रखें'],
      careEn: [
        'Worrying over small things can wear you out',
        'Avoid harsh criticism and keep your words kind',
      ],
    },
    {
      givesHi: ['युवा, बुद्धिमान जीवनसाथी', 'व्यापार, साझेदारी और बातचीत में सफलता'],
      givesEn: [
        'A youthful, intelligent partner',
        'Success in trade, partnerships and negotiation',
      ],
      careHi: [
        'समझौते स्पष्ट रखें',
        'विवाह में चतुर तर्क से अधिक सच्ची बातचीत को महत्व दें',
      ],
      careEn: [
        'Keep agreements clear',
        'In marriage, value honest talk over clever arguments',
      ],
    },
    {
      givesHi: [
        'शोध करने वाला मन',
        'गूढ़ विषयों, ज्योतिष, बीमा, कर या जाँच-पड़ताल में रुचि',
      ],
      givesEn: [
        'A research mind',
        'Interest in deep subjects, astrology, insurance, taxes or investigation',
      ],
      careHi: [
        'ज़्यादा सोचना चिंता बढ़ा सकता है',
        'अपने विचार बाँटें',
        'काग़ज़ात व्यवस्थित रखें',
      ],
      careEn: [
        'Overthinking can feed worry',
        'Share your thoughts',
        'Keep your papers in order',
      ],
    },
    {
      givesHi: [
        'सीखने, उच्च शिक्षा और शास्त्रों का प्रेम',
        'अध्यापन, लेखन, प्रकाशन या यात्रा से भाग्य',
      ],
      givesEn: [
        'A love of learning, higher studies and scriptures',
        'Fortune through teaching, writing, publishing or travel',
      ],
      careHi: [
        'तर्क को श्रद्धा की जगह न लेने दें',
        'प्रश्न करते हुए भी गुरुओं का आदर करें',
      ],
      careEn: [
        'Do not let debate replace faith',
        'Respect your teachers even while you question them',
      ],
    },
    {
      givesHi: [
        'संवाद, व्यापार, हिसाब-किताब, आईटी, अध्यापन या लेखन में सफलता',
        'बुद्धिमत्ता की साख',
      ],
      givesEn: [
        'Success in communication, business, accounts, IT, teaching or writing',
        'A name for intelligence',
      ],
      careHi: [
        'बार-बार काम बदलना उन्नति धीमी कर सकता है',
        'एक कौशल को पूरा परिपक्व होने दें',
      ],
      careEn: ['Changing jobs too often can slow growth', 'Let one skill mature fully'],
    },
    {
      givesHi: ['व्यापार और संपर्कों से लाभ', 'बुद्धिमान मित्र', 'आमदनी के अनेक स्रोत'],
      givesEn: [
        'Gains through business and networking',
        'Intelligent friends',
        'Several sources of income',
      ],
      careHi: ['संगत सोच-समझकर चुनें', 'चतुर मित्र अच्छे, ईमानदार मित्र और भी अच्छे'],
      careEn: [
        'Choose your company with care',
        'Clever friends are good, honest friends are better',
      ],
    },
    {
      givesHi: [
        'कल्पनाशील, भीतर की ओर मुड़ा मन',
        'शोध, विदेशी भाषाएँ या विदेश में काम',
        'आध्यात्मिक अध्ययन',
      ],
      givesEn: [
        'An imaginative, inward-looking mind',
        'Research, foreign languages or work abroad',
        'Spiritual study',
      ],
      careHi: ['चिंता और बिखरे खर्च पर नज़र रखें', 'बातें लिख लें, खर्च की योजना बनाएँ'],
      careEn: ['Watch worry and scattered spending', 'Write things down and plan expenses'],
    },
  ],
  jupiter: [
    {
      givesHi: [
        'गुरु की सबसे अच्छी जगहों में से एक',
        'ज्ञान और अच्छे संस्कार',
        'दूसरों से सम्मान',
        'जीवन पर रक्षक कृपा',
      ],
      givesEn: [
        'One of Jupiter’s best seats',
        'Wisdom and good values',
        'Respect from others',
        'A protecting grace over life',
      ],
      careHi: ['अधिक आराम या अति-आत्मविश्वास ढील ला सकता है', 'सीखते रहें, विनम्र रहें'],
      careEn: [
        'Too much comfort or overconfidence can make you lax',
        'Keep learning and stay humble',
      ],
    },
    {
      givesHi: ['सम्मानित परिवार', 'अच्छी बचत और सच्ची वाणी', 'धीरे-धीरे बढ़ता अन्न-धन'],
      givesEn: [
        'A respected family',
        'Good savings and truthful speech',
        'Food and wealth that grow steadily',
      ],
      careHi: ['उदारता में संतुलन रखें', 'जितना दे सकें, उससे अधिक का वादा न करें'],
      careEn: ['Keep balance in generosity', 'Do not promise more than you can give'],
    },
    {
      givesHi: [
        'समझदारी भरा संवाद',
        'भाई-बहनों से अच्छे संबंध',
        'अध्यापन, लेखन या परामर्श में सफलता',
      ],
      givesEn: [
        'Wise communication',
        'Good relations with siblings',
        'Success in teaching, writing or counselling',
      ],
      careHi: [
        'मेहनत का फल धीमा लग सकता है',
        'लगे रहें, उत्तम परिस्थिति की प्रतीक्षा न करें',
      ],
      careEn: [
        'Effort can seem slow to pay off',
        'Keep at it and do not wait for perfect conditions',
      ],
    },
    {
      givesHi: [
        'आशीर्वाद भरा घर',
        'माँ से अच्छा जुड़ाव',
        'सुख-सुविधा, ज़मीन-जायदाद या वाहन',
        'शांत, समझदार मन — शिक्षा के लिए अच्छा',
      ],
      givesEn: [
        'A blessed home',
        'A good bond with your mother',
        'Comforts, property or vehicles',
        'A calm, wise mind — good for education',
      ],
      careHi: ['सुख मोह में बदल सकता है', 'घर के सुख दूसरों के साथ भी बाँटें'],
      careEn: [
        'Comfort can turn into attachment',
        'Share your home’s blessings with others too',
      ],
    },
    {
      givesHi: [
        'उत्तम बुद्धि और पढ़ाई में सफलता',
        'अच्छी सलाह देने की क्षमता',
        'श्रद्धा, और संतान व शिष्यों से आनंद',
      ],
      givesEn: [
        'Excellent intelligence and success in studies',
        'The gift of good advice',
        'Faith, and joy through children and students',
      ],
      careHi: ['बहुत जानना उपदेशक बना सकता है', 'भाषण से नहीं, उदाहरण से राह दिखाएँ'],
      careEn: [
        'Knowing a lot can make you preachy',
        'Guide others by example, not lectures',
      ],
    },
    {
      givesHi: [
        'विवादों को न्याय से सुलझाने की क्षमता',
        'सेवा, कानून, अध्यापन या परामर्श में अच्छा',
      ],
      givesEn: [
        'The ability to settle disputes fairly',
        'Good work in service, law, teaching or counselling',
      ],
      careHi: [
        'कर्ज़ और ज़रूरत से अधिक ज़िम्मेदारियों पर नज़र रखें',
        'स्वयं पर बोझ डाले बिना मदद करें',
      ],
      careEn: [
        'Watch debts and over-commitment',
        'Help others without overloading yourself',
      ],
    },
    {
      givesHi: ['समझदार, दयालु और सम्मानित जीवनसाथी', 'विवाह और साझेदारी में सौभाग्य'],
      givesEn: [
        'A wise, kind and respected partner',
        'Good fortune through marriage and partnerships',
      ],
      careHi: ['जीवनसाथी के साथ को हल्के में न लें', 'आदर और कृतज्ञता बनाए रखें'],
      careEn: [
        'Do not take your partner’s support for granted',
        'Keep respect and gratitude alive',
      ],
    },
    {
      givesHi: [
        'आध्यात्मिकता, शोध और गूढ़ ज्ञान में गहरी रुचि',
        'बदलाव के समय परिवार या साझी सम्पत्ति से सहारा',
      ],
      givesEn: [
        'Deep interest in spirituality, research and hidden knowledge',
        'Support from family or shared resources in times of change',
      ],
      careHi: [
        'लाभ देर से या दूसरों के माध्यम से आ सकता है',
        'धैर्य रखें, साझे धन के मामले स्पष्ट रखें',
      ],
      careEn: [
        'Gains can come late or through others',
        'Be patient and keep shared money matters clear',
      ],
    },
    {
      givesHi: [
        'सबसे शुभ स्थितियों में से एक',
        'भाग्य, श्रद्धा और अच्छे गुरु',
        'सम्मानित पिता',
        'उच्च शिक्षा में सफलता',
      ],
      givesEn: [
        'One of the most blessed placements',
        'Fortune, faith and good teachers',
        'A respected father',
        'Success in higher learning',
      ],
      careHi: ['आशीर्वाद बाँटने से बढ़ते हैं', 'उदार रहें, साधना नियमित रखें'],
      careEn: [
        'Blessings grow when shared',
        'Stay generous and keep your practice regular',
      ],
    },
    {
      givesHi: [
        'काम में सम्मान और ईमानदार साख',
        'अध्यापन, कानून, वित्त, सलाह या धार्मिक कामों में सफलता',
      ],
      givesEn: [
        'Respect at work and an honest name',
        'Success in teaching, law, finance, advisory or religious work',
      ],
      careHi: [
        'यहाँ नैतिकता ही आपकी ताक़त है',
        'जल्दी आगे बढ़ने के लिए सिद्धांत कभी न छोड़ें',
      ],
      careEn: [
        'Your ethics are your strength here',
        'Never trade principles for quick advancement',
      ],
    },
    {
      givesHi: [
        'भरपूर लाभ',
        'अच्छे मित्र और मार्गदर्शक',
        'इच्छाओं की पूर्ति',
        'समझदार संपर्कों से बढ़ती आमदनी',
      ],
      givesEn: [
        'Plentiful gains',
        'Good friends and mentors',
        'Wishes fulfilled',
        'Income that grows through wise contacts',
      ],
      careHi: ['धन का सदुपयोग करें', 'लाभ का कुछ भाग दान में दें'],
      careEn: ['Use wealth well', 'Give part of your gains in daan'],
    },
    {
      givesHi: [
        'आध्यात्मिक, उदार स्वभाव',
        'अच्छे कामों और तीर्थ पर खर्च',
        'दूर देशों या शांत अध्ययन से उन्नति',
      ],
      givesEn: [
        'A spiritual, generous nature',
        'Spending on good causes and pilgrimage',
        'Growth through faraway places or quiet study',
      ],
      careHi: [
        'खर्च आमदनी से आगे निकल सकता है',
        'दिल खोलकर दें, पर समझदारी से योजना बनाएँ',
      ],
      careEn: ['Spending can run ahead of income', 'Give freely, but plan wisely'],
    },
  ],
  venus: [
    {
      givesHi: [
        'आकर्षण और सुंदर व्यक्तित्व',
        'कलात्मक, सौम्य स्वभाव',
        'लोग आपका साथ पसंद करते हैं',
      ],
      givesEn: [
        'Charm and a pleasing presence',
        'An artistic, graceful nature',
        'People enjoy your company',
      ],
      careHi: ['सुख का प्रेम भोग-विलास में बदल सकता है', 'आनंद में संतुलन रखें'],
      careEn: ['A love of comfort can slide into indulgence', 'Keep balance in pleasures'],
    },
    {
      givesHi: [
        'मधुर वाणी और अच्छा भोजन',
        'सुखी पारिवारिक जीवन',
        'कला, सौन्दर्य या विलास की वस्तुओं से धन',
      ],
      givesEn: [
        'Sweet speech and good food',
        'A happy family life',
        'Wealth through art, beauty or fine goods',
      ],
      careHi: ['विलासिता पर खर्च बढ़ सकता है', 'आनंद लें, पर बचत बनाए रखें'],
      careEn: ['Spending on luxury can run high', 'Enjoy, but keep your savings intact'],
    },
    {
      givesHi: [
        'लेखन, संगीत, डिज़ाइन या प्रस्तुति में प्रतिभा',
        'भाई-बहनों और पड़ोसियों से मधुर संबंध',
      ],
      givesEn: [
        'Talent in writing, music, design or performance',
        'Warm ties with siblings and neighbours',
      ],
      careHi: ['आराम जोश कम कर सकता है', 'प्रतिभा के साथ नियमित अभ्यास जोड़ें'],
      careEn: ['Comfort can dull your drive', 'Pair your talent with regular practice'],
    },
    {
      givesHi: ['सुंदर, आरामदायक घर', 'वाहन', 'स्नेही माँ और संतुष्ट मन'],
      givesEn: [
        'A beautiful, comfortable home',
        'Vehicles',
        'A loving mother and a contented heart',
      ],
      careHi: ['घर का सुख आशीर्वाद है', 'इसे आगे बढ़ने में रुकावट न बनने दें'],
      careEn: [
        'Comfort at home is a blessing',
        'Do not let it keep you from stepping out to grow',
      ],
    },
    {
      givesHi: ['रचनात्मकता और कलात्मक बुद्धि', 'प्रेम, मनोरंजन और संतान से आनंद'],
      givesEn: [
        'Creativity and artistic intelligence',
        'Joy through romance, entertainment and children',
      ],
      careHi: [
        'प्रेम और आनंद पढ़ाई या कर्तव्य से ध्यान हटा सकते हैं',
        'प्राथमिकताएँ स्पष्ट रखें',
      ],
      careEn: [
        'Romance and pleasure can pull attention from studies or duties',
        'Keep priorities clear',
      ],
    },
    {
      givesHi: [
        'सेवा, आतिथ्य, डिज़ाइन या सौन्दर्य के कामों में कुशलता',
        'सहकर्मियों से अच्छी निभती है',
      ],
      givesEn: [
        'Skill in service, hospitality, design or beauty work',
        'You get on well with colleagues',
      ],
      careHi: [
        'रिश्ते काम की उलझनों से मिल सकते हैं',
        'निजी और कामकाजी मामले अलग रखें',
        'अति-भोग से बचें',
      ],
      careEn: [
        'Relationships can get tangled with work troubles',
        'Keep personal and work matters apart',
        'Avoid overindulgence',
      ],
    },
    {
      givesHi: [
        'आकर्षक, प्रेमी जीवनसाथी',
        'सुखद वैवाहिक जीवन',
        'साझेदारी, कला, फ़ैशन या व्यापार में सफलता',
      ],
      givesEn: [
        'An attractive, loving partner',
        'A pleasant married life',
        'Success in partnerships, art, fashion or trade',
      ],
      careHi: [
        'प्रेम से अपेक्षाएँ बहुत ऊँची हो सकती हैं',
        'जीवनसाथी को जैसे हैं वैसे सराहें',
      ],
      careEn: ['Romantic expectations can run high', 'Appreciate your partner as they are'],
    },
    {
      givesHi: [
        'जीवनसाथी, विरासत या साझी सम्पत्ति से लाभ',
        'गूढ़ कलाओं और रहस्य-विद्या में रुचि',
      ],
      givesEn: [
        'Gains through a partner, inheritance or shared resources',
        'Interest in hidden arts and mysticism',
      ],
      careHi: ['साझे धन को ईमानदार और स्पष्ट रखें', 'रिश्तों में छिपाव से बचें'],
      careEn: [
        'Keep shared money honest and clear',
        'Avoid secrecy in close relationships',
      ],
    },
    {
      givesHi: ['कला, संबंधों और यात्रा से भाग्य', 'संगीत, सौन्दर्य या सेवा से भक्ति'],
      givesEn: [
        'Fortune through art, relationships and travel',
        'Devotion through music, beauty or seva',
      ],
      careHi: ['आराम श्रद्धा को उथला न बनाए', 'साधना में कुछ सरल अनुशासन रखें'],
      careEn: [
        'Do not let comfort make faith shallow',
        'Keep some simple discipline in your practice',
      ],
    },
    {
      givesHi: ['कला, मीडिया, फ़ैशन, सौन्दर्य या आतिथ्य के करियर में सफलता', 'मधुर साख'],
      givesEn: [
        'Success in art, media, fashion, beauty or hospitality careers',
        'A pleasant name',
      ],
      careHi: ['आकर्षण दरवाज़े खोलता है', 'उसके साथ लगातार मेहनत भी जोड़ें'],
      careEn: ['Charm opens doors', 'Back it with steady hard work'],
    },
    {
      givesHi: [
        'अच्छा लाभ और सुख-सुविधा',
        'कलात्मक या प्रभावशाली लोगों से मित्रता',
        'सुख की इच्छाएँ पूरी',
      ],
      givesEn: [
        'Good gains and comforts',
        'Friendships with artistic or influential people',
        'Wishes for comfort come true',
      ],
      careHi: ['आनंद पर खर्च करें', 'पर मित्रता को उपहारों से न तौलें'],
      careEn: ['Spend on joy', 'But do not measure friendship by gifts'],
    },
    {
      givesHi: ['सुख-सुविधा, यात्रा और विदेश का आनंद', 'देने वाला, भक्ति भरा मन'],
      givesEn: [
        'Enjoyment of comforts, travel and foreign places',
        'A giving, devotional heart',
      ],
      careHi: ['भोग-विलास पर खर्च बढ़ सकता है', 'आनंद लें, पर सीमा तय करें'],
      careEn: ['Spending on pleasures can run high', 'Enjoy, but set limits'],
    },
  ],
  saturn: [
    {
      givesHi: [
        'गंभीर, धैर्यवान और ज़िम्मेदार स्वभाव',
        'धीरे पर मज़बूती से बनाते हैं',
        'उम्र के साथ और दृढ़ होते हैं',
      ],
      givesEn: [
        'A serious, patient and responsible nature',
        'You build slowly but solidly',
        'You grow firmer with the years',
      ],
      careHi: [
        'निराशा और अकेलापन घर कर सकता है',
        'लोगों से जुड़े रहें',
        'स्वयं पर बहुत कठोर न हों',
      ],
      careEn: [
        'Gloom and loneliness can creep in',
        'Stay connected with people',
        'Do not be too hard on yourself',
      ],
    },
    {
      givesHi: ['अनुशासन से धीरे-धीरे बढ़ती बचत', 'नपी-तुली, सच्ची वाणी'],
      givesEn: ['Savings that grow slowly through discipline', 'Measured, truthful speech'],
      careHi: [
        'परिवार या आमदनी कभी-कभी सीमित लग सकती है',
        'धैर्य रखें, कठोर शब्दों से बचें',
      ],
      careEn: [
        'Family life or income can feel tight at times',
        'Be patient and avoid harsh words',
      ],
    },
    {
      givesHi: ['भरपूर लगन और स्थिर साहस', 'लंबी, कड़ी मेहनत से सफलता', 'तकनीकी या हाथ का कौशल'],
      givesEn: [
        'Great persistence and steady courage',
        'Success through long, hard effort',
        'Technical or hands-on skill',
      ],
      careHi: ['भाई-बहनों से संबंध दूर लग सकते हैं', 'पास रहने की पहल आप करें'],
      careEn: ['Ties with siblings can feel distant', 'Make the first move to stay close'],
    },
    {
      givesHi: [
        'मेहनत से धीरे-धीरे बनी ज़मीन-जायदाद',
        'स्थिरता',
        'घर के प्रति गंभीर कर्तव्य-भाव',
      ],
      givesEn: [
        'Property built slowly through hard work',
        'Stability',
        'A serious sense of duty toward home',
      ],
      careHi: [
        'घर का जीवन भारी या केवल कर्तव्य जैसा लग सकता है',
        'आनंद के लिए जगह बनाएँ',
        'माँ से जुड़ाव मधुर रखें',
      ],
      careEn: [
        'Home life can feel heavy or all duty',
        'Make room for joy',
        'Keep your bond with your mother warm',
      ],
    },
    {
      givesHi: ['गंभीर, गहरे विचारक', 'अनुशासित, व्यावहारिक पढ़ाई में सफलता'],
      givesEn: ['A serious, deep thinker', 'Success in disciplined, practical study'],
      careHi: [
        'पढ़ाई और रचनात्मक योजनाएँ धीमी चल सकती हैं',
        'धैर्य और नियमित प्रयास से फल मिलता है',
      ],
      careEn: [
        'Studies and creative plans can move slowly',
        'Patience and regular effort bring results',
      ],
    },
    {
      givesHi: [
        'शनि के लिए मज़बूत स्थान',
        'प्रतियोगिता में टिके रहते हैं',
        'सेवा, कानून, श्रम या प्रशासन में सफलता',
      ],
      givesEn: [
        'A strong seat for Saturn',
        'You outlast competition',
        'Success in service, law, labour or administration',
      ],
      careHi: [
        'काम को ही पूरा जीवन न बनने दें',
        'विश्राम करें',
        'साथ काम करने वालों से उचित व्यवहार करें',
      ],
      careEn: [
        'Do not let work become your whole life',
        'Take rest',
        'Treat the people who work with you fairly',
      ],
    },
    {
      givesHi: ['परिपक्व, वफ़ादार और ज़िम्मेदार जीवनसाथी', 'समय के साथ टिकने वाली साझेदारी'],
      givesEn: [
        'A mature, loyal and responsible partner',
        'Partnerships that last through time',
      ],
      careHi: [
        'रिश्ते गंभीर या धीरे खुलने वाले लग सकते हैं',
        'धैर्य और साझा ज़िम्मेदारी उन्हें मज़बूत बनाते हैं',
      ],
      careEn: [
        'Relationships can feel serious or slow to warm',
        'Patience and shared duty make them strong',
      ],
    },
    {
      givesHi: ['लंबी चुनौतियों में टिके रहने का बल', 'शोध, इतिहास या गहरी साधना में रुचि'],
      givesEn: [
        'The endurance to see long challenges through',
        'Interest in research, history or deep spiritual discipline',
      ],
      careHi: [
        'बदलाव के साथ देरी और भारी ज़िम्मेदारियाँ आ सकती हैं',
        'धैर्य, ईमानदारी और नियमित दिनचर्या रखें',
      ],
      careEn: [
        'Change can bring delays and heavy duties',
        'Keep patience, honesty and a regular routine',
      ],
    },
    {
      givesHi: [
        'अनुशासित, व्यावहारिक श्रद्धा',
        'परम्परा के प्रति आदर',
        'कर्तव्य से धीरे-धीरे बनता भाग्य',
      ],
      givesEn: [
        'A disciplined, practical faith',
        'Respect for tradition',
        'Fortune that builds slowly through duty',
      ],
      careHi: ['भाग्य धीमा लग सकता है', 'श्रद्धा न छोड़ें, पिता और गुरुओं का आदर रखें'],
      careEn: [
        'Fortune can seem slow',
        'Keep faith, and respect for your father and teachers',
      ],
    },
    {
      givesHi: ['मेहनत और ज़िम्मेदारी से टिकाऊ सफलता', 'करियर में स्थिर उन्नति और सम्मान'],
      givesEn: [
        'Lasting success through hard work and responsibility',
        'A steady rise and respect in your career',
      ],
      careHi: [
        'उन्नति धीमी और मेहनत से कमाई हुई होती है',
        'ईमानदार रहें — शनि ईमानदारी का फल देता है',
      ],
      careEn: ['The rise is slow and earned', 'Stay honest — Saturn rewards integrity'],
    },
    {
      givesHi: ['समय के साथ बढ़ता स्थिर, टिकाऊ लाभ', 'वफ़ादार, अनुभवी मित्र'],
      givesEn: ['Steady, lasting gains that grow with time', 'Loyal, experienced friends'],
      careHi: ['लाभ धीरे आता है', 'शॉर्टकट से धैर्य बेहतर है'],
      careEn: ['Gains come slowly', 'Patience beats shortcuts'],
    },
    {
      givesHi: [
        'एकांत, सेवा और आध्यात्मिक अनुशासन की ओर खिंचाव',
        'दूर-दराज़ या संस्थाओं में काम के लिए अच्छा',
      ],
      givesEn: [
        'A pull toward solitude, service and spiritual discipline',
        'Good for work far away or in institutions',
      ],
      careHi: [
        'खर्च और अकेलापन भारी पड़ सकते हैं',
        'दूसरों की सेवा करें, अनुशासित दिनचर्या रखें',
      ],
      careEn: [
        'Expenses and loneliness can weigh on you',
        'Serve others and keep a disciplined routine',
      ],
    },
  ],
  rahu: [
    {
      givesHi: [
        'बड़ी महत्वाकांक्षाओं वाला साहसी व्यक्तित्व',
        'भीड़ में अलग दिखते हैं',
        'जल्दी ध्यान खींचते हैं',
      ],
      givesEn: [
        'A bold personality with big ambitions',
        'You stand out in a crowd',
        'You draw attention easily',
      ],
      careHi: [
        'अपनी पहचान को लेकर उलझन हो सकती है',
        'बेचैन इच्छाएँ भटका सकती हैं',
        'सरल मूल्यों से जुड़े रहें',
      ],
      careEn: [
        'You can feel unsure about who you are',
        'Restless desires can mislead',
        'Stay rooted in simple values',
      ],
    },
    {
      givesHi: [
        'असामान्य स्रोतों, विदेशी संपर्कों या तकनीक से लाभ',
        'प्रभावशाली ढंग से बोलने की कला',
      ],
      givesEn: [
        'Gains from unusual sources, foreign contacts or technology',
        'A persuasive way of speaking',
      ],
      careHi: [
        'बढ़ा-चढ़ाकर कहने से बचें',
        'जल्दी पैसे के विचारों से सावधान रहें',
        'परिवार में बात ईमानदार रखें',
      ],
      careEn: [
        'Avoid exaggeration',
        'Be careful with quick-money ideas',
        'Keep talk within the family honest',
      ],
    },
    {
      givesHi: [
        'राहु के लिए अच्छा स्थान',
        'निडर प्रयास',
        'मीडिया, तकनीक, मार्केटिंग और साहसी कामों में सफलता',
      ],
      givesEn: [
        'A good seat for Rahu',
        'Fearless effort',
        'Success in media, technology, marketing and bold ventures',
      ],
      careHi: ['साहस को नैतिकता के साथ प्रयोग करें', 'भाई-बहनों से अच्छे संबंध रखें'],
      careEn: ['Use your courage with ethics', 'Keep good ties with your siblings'],
    },
    {
      givesHi: ['नई या दूर की जगहों पर घर या जायदाद', 'आधुनिक साधनों से सुख-सुविधा'],
      givesEn: [
        'A home or property in new or faraway places',
        'Comforts through modern means',
      ],
      careHi: [
        'भीतरी बेचैनी और घर के बदलाव शांति भंग कर सकते हैं',
        'माँ के साथ और घर पर शांत समय बिताएँ',
      ],
      careEn: [
        'Inner restlessness and moves of home can disturb peace',
        'Spend calm time with your mother and at home',
      ],
    },
    {
      givesHi: ['अलग तरह का, आविष्कारशील मन', 'तकनीक, शोध या असामान्य विषयों में रुचि'],
      givesEn: [
        'An unconventional, inventive mind',
        'Interest in technology, research or unusual subjects',
      ],
      careHi: [
        'पढ़ाई में शॉर्टकट से बचें',
        'प्रेम में जल्दबाज़ी के फ़ैसले न लें',
        'लंबी अवधि का सोचें',
      ],
      careEn: [
        'Avoid shortcuts in studies',
        'Avoid hasty choices in romance',
        'Think long-term',
      ],
    },
    {
      givesHi: [
        'राहु के लिए अच्छा स्थान',
        'विरोधियों और बाधाओं को चतुराई से पार करते हैं',
        'प्रतियोगी क्षेत्रों में अच्छा',
      ],
      givesEn: [
        'A good seat for Rahu',
        'You get past rivals and obstacles cleverly',
        'Good in competitive fields',
      ],
      careHi: ['किसी भी तरह जीतना असली जीत नहीं', 'न्यायपूर्ण रहें, दिनचर्या स्थिर रखें'],
      careEn: [
        'Winning by any means is not winning',
        'Stay fair and keep your routine steady',
      ],
    },
    {
      givesHi: [
        'अलग पृष्ठभूमि वाले जीवनसाथी या साथी',
        'विदेशी या असामान्य साझेदारियों से लाभ',
      ],
      givesEn: [
        'A partner or associates from a different background',
        'Gains through foreign or unusual partnerships',
      ],
      careHi: [
        'रिश्तों में गलतफ़हमियाँ हो सकती हैं',
        'अपेक्षाएँ व्यावहारिक रखें, बातचीत पारदर्शी रखें',
      ],
      careEn: [
        'Misunderstandings can arise in relationships',
        'Keep expectations realistic and conversations open',
      ],
    },
    {
      givesHi: ['छिपे विषयों, शोध, गूढ़ विद्या या तकनीक में रुचि', 'अचानक लाभ की संभावना'],
      givesEn: [
        'Interest in hidden subjects, research, the occult or technology',
        'A chance of sudden gains',
      ],
      careHi: [
        'अचानक उतार-चढ़ाव सावधानी माँगते हैं',
        'गुप्त लेन-देन और जल्दबाज़ी के जोखिम से बचें',
      ],
      careEn: [
        'Sudden ups and downs ask for care',
        'Avoid secretive dealings and hasty risks',
      ],
    },
    {
      givesHi: [
        'विदेशी संस्कृतियों और नए दर्शन में रुचि',
        'लंबी यात्राएँ',
        'अलग राहों से भाग्य',
      ],
      givesEn: [
        'Interest in foreign cultures and new philosophies',
        'Long journeys',
        'Fortune through unconventional paths',
      ],
      careHi: ['परम्परा पर संदेह या गुरुओं से टकराव हो सकता है', 'आदर के साथ प्रश्न करें'],
      careEn: [
        'Doubts about tradition or clashes with teachers can arise',
        'Ask your questions with respect',
      ],
    },
    {
      givesHi: [
        'प्रबल महत्वाकांक्षा',
        'तकनीक, विदेशी संपर्क, राजनीति या बड़ी संस्थाओं से करियर में उन्नति',
      ],
      givesEn: [
        'Strong ambition',
        'A rise in career through technology, foreign contacts, politics or large organisations',
      ],
      careHi: ['प्रसिद्धि जल्दी आ सकती है', 'तरीके साफ़ रखें ताकि वह टिके'],
      careEn: ['Fame can come fast', 'Keep your methods clean so that it lasts'],
    },
    {
      givesHi: [
        'राहु की सबसे अच्छी जगहों में से एक',
        'बड़ा लाभ और बड़ा संपर्क-जाल',
        'बड़ी इच्छाओं की पूर्ति',
      ],
      givesEn: [
        'One of Rahu’s best seats',
        'Large gains and a wide network',
        'Big wishes fulfilled',
      ],
      careHi: [
        'इच्छाएँ बढ़ती रह सकती हैं',
        'जानें कि कब पर्याप्त है',
        'मित्र सावधानी से चुनें',
      ],
      careEn: [
        'Desires can keep growing',
        'Know when enough is enough',
        'Choose friends with care',
      ],
    },
    {
      givesHi: ['विदेश और यात्रा से जुड़ाव', 'आध्यात्मिकता या छिपे विषयों में रुचि'],
      givesEn: [
        'Links with foreign lands and travel',
        'Interest in spirituality or hidden matters',
      ],
      careHi: ['छिपे खर्च बढ़ सकते हैं', 'फ़िज़ूलखर्ची से बचें', 'प्रार्थना से मन शांत रखें'],
      careEn: [
        'Hidden expenses can grow',
        'Avoid wasteful spending',
        'Keep the mind calm with prayer',
      ],
    },
  ],
  ketu: [
    {
      givesHi: ['अंतर्ज्ञानी, आध्यात्मिक और स्वतंत्र स्वभाव', 'सतह के पार देखने की दृष्टि'],
      givesEn: [
        'An intuitive, spiritual and independent nature',
        'You see beneath the surface',
      ],
      careHi: [
        'स्वयं को लेकर असमंजस या विरक्ति हो सकती है',
        'लोगों और रोज़ के कर्तव्यों से जुड़े रहें',
      ],
      careEn: [
        'You can feel unsure of yourself or detached',
        'Stay engaged with people and daily duties',
      ],
    },
    {
      givesHi: ['सादी पसंद', 'धन के प्रति विरक्त दृष्टि', 'आध्यात्मिक गहराई वाले शब्द'],
      givesEn: [
        'Simple tastes',
        'A detached view of wealth',
        'Words that can carry spiritual depth',
      ],
      careHi: ['बचत और वाणी पर ध्यान चाहिए', 'सोचकर बोलें', 'धन-व्यवस्था व्यवस्थित रखें'],
      careEn: [
        'Savings and speech need attention',
        'Think before you speak',
        'Keep your money matters organised',
      ],
    },
    {
      givesHi: [
        'केतु के लिए अच्छा स्थान',
        'शांत साहस और तेज़ अंतःप्रेरणा',
        'अपने बल पर किए प्रयास से सफलता',
      ],
      givesEn: [
        'A good seat for Ketu',
        'Quiet courage and sharp instincts',
        'Success through your own independent effort',
      ],
      careHi: ['भाई-बहनों और पड़ोसियों से संपर्क बनाए रखें', 'विरक्ति को दूरी न बनने दें'],
      careEn: [
        'Stay in touch with siblings and neighbours',
        'Do not let detachment turn into distance',
      ],
    },
    {
      givesHi: ['भीतरी विरक्ति', 'आध्यात्मिक जड़ों में रुचि', 'घर साधना का स्थान बन सकता है'],
      givesEn: [
        'Inner detachment',
        'Interest in spiritual roots',
        'Your home can become a place of practice',
      ],
      careHi: [
        'घर में बेचैनी या सुखों से दूरी हो सकती है',
        'माँ की देखभाल करें',
        'प्रार्थना के लिए एक शांत कोना बनाएँ',
      ],
      careEn: [
        'You can feel restless at home or distant from comforts',
        'Care for your mother',
        'Make a quiet corner for prayer',
      ],
    },
    {
      givesHi: [
        'गहरा अंतर्ज्ञान',
        'मंत्र, आध्यात्मिकता और शोध में रुचि',
        'पुरानी सीख से अंतर्दृष्टि',
      ],
      givesEn: [
        'Deep intuition',
        'Interest in mantra, spirituality and research',
        'Insight from earlier learning',
      ],
      careHi: [
        'पढ़ाई बिखरी हुई लग सकती है',
        'नियमित दिनचर्या और गुरु का मार्गदर्शन मदद करते हैं',
      ],
      careEn: [
        'Studies can feel scattered',
        'A regular routine and a teacher’s guidance help',
      ],
    },
    {
      givesHi: [
        'केतु के लिए अच्छा स्थान',
        'विरोधियों और बाधाओं को चुपचाप पार करते हैं',
        'सेवा या देखभाल के कामों में अच्छा',
      ],
      givesEn: [
        'A good seat for Ketu',
        'You quietly get past rivals and obstacles',
        'Good in service or caring work',
      ],
      careHi: ['रोज़ के छोटे कामों को अनदेखा न करें', 'नियमित दिनचर्या सब कुछ सहज रखती है'],
      careEn: ['Do not neglect small daily tasks', 'A regular routine keeps things smooth'],
    },
    {
      givesHi: [
        'आध्यात्मिक झुकाव वाले या अलग तरह के जीवनसाथी',
        'विरक्ति और गहरे मूल्य सिखाने वाले रिश्ते',
      ],
      givesEn: [
        'A spiritually inclined or unusual partner',
        'Relationships that teach detachment and deeper values',
      ],
      careHi: ['कभी-कभी जीवनसाथी दूर लग सकते हैं', 'अपनी परवाह खुलकर जताएँ, पीछे न हटें'],
      careEn: [
        'Your partner can seem distant at times',
        'Show your care openly and do not withdraw',
      ],
    },
    {
      givesHi: ['प्रबल अंतर्ज्ञान', 'रहस्य-विद्या, शोध और आध्यात्मिक परिवर्तन में रुचि'],
      givesEn: [
        'Strong intuition',
        'Interest in mysticism, research and spiritual transformation',
      ],
      careHi: [
        'अचानक बदलाव आपको अस्थिर कर सकते हैं',
        'श्रद्धा, दिनचर्या और साझे धन की स्पष्टता बनाए रखें',
      ],
      careEn: [
        'Sudden changes can unsettle you',
        'Hold on to faith, routine and clarity in shared money',
      ],
    },
    {
      givesHi: ['कर्मकांड से आगे गहरी, निजी आध्यात्मिकता', 'दर्शन और तीर्थ में रुचि'],
      givesEn: [
        'A deep, personal spirituality beyond ritual',
        'Interest in philosophy and pilgrimage',
      ],
      careHi: [
        'आप गुरुओं या परम्परा पर प्रश्न कर सकते हैं',
        'खोजते हुए भी विनम्रता और आदर रखें',
      ],
      careEn: [
        'You may question teachers or tradition',
        'Keep humility and respect while you search',
      ],
    },
    {
      givesHi: [
        'विरक्ति और कौशल से किया गया काम',
        'तकनीकी, शोध या आध्यात्मिक क्षेत्रों में सफलता',
      ],
      givesEn: [
        'Work done with skill and detachment',
        'Success in technical, research or spiritual fields',
      ],
      careHi: ['करियर की दिशा अचानक बदल सकती है', 'कौशल पैने रखें, बीच में रुचि न खोएँ'],
      careEn: [
        'Career direction can change suddenly',
        'Keep your skills sharp and do not lose interest midway',
      ],
    },
    {
      givesHi: ['अचानक आने वाला लाभ', 'कुछ सच्चे मित्र', 'सरल, आध्यात्मिक इच्छाएँ'],
      givesEn: [
        'Gains that arrive unexpectedly',
        'A few true friends',
        'Simple, spiritual wishes',
      ],
      careHi: ['अपने मित्र-मंडल से दूर न हों', 'थोड़ा प्रयास अच्छी मित्रता बनाए रखता है'],
      careEn: [
        'Do not drift from your circle',
        'A little effort keeps good friendships alive',
      ],
    },
    {
      givesHi: [
        'आध्यात्मिकता के लिए केतु की सबसे अच्छी जगहों में से एक',
        'ध्यान, एकांत और तीर्थ',
        'भीतरी मुक्ति',
      ],
      givesEn: [
        'One of Ketu’s best seats for spiritual life',
        'Meditation, retreat and pilgrimage',
        'Inner freedom',
      ],
      careHi: [
        'व्यावहारिक काम और खर्च पर अब भी ध्यान चाहिए',
        'आध्यात्मिक खिंचाव और रोज़ के कर्तव्यों में संतुलन रखें',
      ],
      careEn: [
        'Practical tasks and expenses still need attention',
        'Balance the spiritual pull with daily duties',
      ],
    },
  ],
};

/** Names used inside a sentence: `गुरु` / `Jupiter`, `the Sun`, `the Moon`. */
export type SignContext = {
  grahaHi: string;
  grahaEn: string;
  /** `कर्क` / `Karka (Cancer)`. */
  rashiHi: string;
  rashiEn: string;
  /** The sign's lord, sentence form. */
  lordHi: string;
  lordEn: string;
};

/**
 * The sign line — one bullet: the sign first, then how strong the graha is in
 * it, the term in brackets. It always says WHOSE sign it is and how this graha
 * regards that lord, so "an unfriendly sign" never stands alone (review note,
 * 2 Oct 2026).
 */
export const SIGN_STRENGTH: Readonly<Record<'exalted' | 'own' | 'debilitated' | 'friend' | 'neutral' | 'enemy' | 'node', (ctx: SignContext) => Bilingual>> = {
  exalted: (ctx) => ({
    hi: `${ctx.rashiHi} में — सबसे मज़बूत स्थिति (उच्च)`,
    en: `In ${ctx.rashiEn} — its strongest sign (exalted, uchcha)`,
  }),
  own: (ctx) => ({
    hi: `${ctx.rashiHi} में — अपनी ही राशि, जैसे अपने घर में (स्वराशि)`,
    en: `In ${ctx.rashiEn} — its own sign, at home (swarashi)`,
  }),
  debilitated: (ctx) => ({
    hi: `${ctx.rashiHi} में — सबसे कमज़ोर स्थिति (नीच)`,
    en: `In ${ctx.rashiEn} — its weakest sign (debilitated, neecha)`,
  }),
  friend: (ctx) => ({
    hi: `${ctx.rashiHi} में — राशि के स्वामी ${ctx.lordHi}, जिन्हें ${ctx.grahaHi} मित्र मानता है (मित्र राशि)`,
    en: `In ${ctx.rashiEn} — ruled by ${ctx.lordEn}, whom ${ctx.grahaEn} counts as a friend (mitra rashi)`,
  }),
  neutral: (ctx) => ({
    hi: `${ctx.rashiHi} में — राशि के स्वामी ${ctx.lordHi}, ${ctx.grahaHi} के लिए न मित्र, न शत्रु (सम राशि)`,
    en: `In ${ctx.rashiEn} — ruled by ${ctx.lordEn}, neither friend nor enemy to ${ctx.grahaEn} (sama rashi)`,
  }),
  enemy: (ctx) => ({
    hi: `${ctx.rashiHi} में — राशि के स्वामी ${ctx.lordHi}, जिन्हें ${ctx.grahaHi} शत्रु मानता है (शत्रु राशि)`,
    en: `In ${ctx.rashiEn} — ruled by ${ctx.lordEn}, whom ${ctx.grahaEn} counts as an enemy (shatru rashi)`,
  }),
  node: (ctx) => ({
    hi: `${ctx.rashiHi} में — छाया ग्रह, फल मुख्य रूप से भाव से; राशि के स्वामी ${ctx.lordHi}`,
    en: `In ${ctx.rashiEn} — a shadow graha, read mainly through its house; the sign’s lord is ${ctx.lordEn}`,
  }),
};

/** Each house's natural guardian, and each planet's friends and enemies — one bullet per line. */
export const KARAKA_LABEL: Bilingual = { hi: 'इस भाव का कारक (संरक्षक)', en: 'This house’s karaka (guardian)' };
export const MAITRI_LABELS = {
  friends: { hi: 'मित्र', en: 'Friends' },
  enemies: { hi: 'शत्रु', en: 'Enemies' },
  neutral: { hi: 'सम (न मित्र, न शत्रु)', en: 'Neutral' },
  none: { hi: 'कोई नहीं', en: 'none' },
} as const;

/**
 * Retrograde motion is a fact bullet; it casts no vote. Combustion needs no
 * note of its own: it votes, so its reason bullet already says it.
 */
export const RETROGRADE_NOTE: Bilingual = { hi: 'वक्री — उल्टी चाल में दिखता है', en: 'Appears to move backwards (vakri)' };

export type GrahaFactorId =
  | 'sign-exalted'
  | 'sign-own'
  | 'sign-friend'
  | 'sign-enemy'
  | 'sign-debilitated'
  | 'house-digbala'
  | 'house-gains'
  | 'house-benefic-strong'
  | 'house-malefic-growth'
  | 'house-benefic-dusthana'
  | 'house-malefic-hidden'
  | 'lord-lagna'
  | 'lord-yogakaraka'
  | 'lord-trikona'
  | 'lord-demanding'
  | 'combust';

export type ReasonContext = {
  grahaHi: string;
  grahaEn: string;
  /** The occupied sign and its lord, sentence form. */
  rashiHi: string;
  rashiEn: string;
  lordHi: string;
  lordEn: string;
  /** The occupied house: `चतुर्थ भाव` / `4th house`. */
  houseHi: string;
  houseEn: string;
  /** The ruled houses that cast this vote: `षष्ठ और एकादश भाव` / `6th and 11th houses`. */
  ruledHi: string;
  ruledEn: string;
  ruledCount: number;
  /** Whole degrees from the Sun (combustion only). */
  degreesFromSun: number;
};

/**
 * One short "why" bullet per vote — the card's reasons list. The sign line and
 * the ruled-houses list carry the detail, so a reason names only the cause and
 * its effect.
 */
export const FACTOR_REASON: Readonly<Record<GrahaFactorId, (ctx: ReasonContext) => Bilingual>> = {
  'sign-exalted': () => ({
    hi: 'उच्च राशि — फल पूरे बल से देता है',
    en: 'Exalted sign — gives its results in full',
  }),
  'sign-own': () => ({
    hi: 'अपनी राशि — सहज और स्थिर',
    en: 'Its own sign — steady and at ease',
  }),
  'sign-friend': (ctx) => ({
    hi: `मित्र ${ctx.lordHi} की राशि — सहजता से काम करता है`,
    en: `In a friend’s sign (${ctx.lordEn}) — works with ease`,
  }),
  'sign-enemy': (ctx) => ({
    hi: `शत्रु ${ctx.lordHi} की राशि — काम में अधिक प्रयास लगता है`,
    en: `In an enemy’s sign (${ctx.lordEn}) — its work takes more effort`,
  }),
  'sign-debilitated': () => ({
    hi: 'नीच राशि — फल अतिरिक्त प्रयास से मिलते हैं',
    en: 'Debilitated sign — its results need extra effort',
  }),
  'house-digbala': (ctx) => ({
    hi: `${ctx.houseHi} में दिशा का बल (दिग्बल)`,
    en: `Directional strength (dig-bala) in the ${ctx.houseEn}`,
  }),
  'house-gains': () => ({
    hi: 'एकादश भाव लाभ का घर — यहाँ हर ग्रह कुछ देता है',
    en: 'The 11th is the house of gains — every graha gives here',
  }),
  'house-benefic-strong': (ctx) => ({
    hi: `शुभ ग्रह ${ctx.houseHi} में — मुख्य भाव, अच्छा फल देता है`,
    en: `A kind planet in the ${ctx.houseEn} — a main house, so it does well`,
  }),
  'house-malefic-growth': (ctx) => ({
    hi: `सख़्त ग्रह ${ctx.houseHi} में — मेहनत का भाव, यहाँ बल प्रगति बनता है`,
    en: `A strict planet in the ${ctx.houseEn} — a house of effort, where its force becomes progress`,
  }),
  'house-benefic-dusthana': (ctx) => ({
    hi: `शुभ ग्रह ${ctx.houseHi} में — चुनौती का भाव, फल धीरे मिलते हैं`,
    en: `A kind planet in the ${ctx.houseEn} — a house of challenges, so its gifts come slowly`,
  }),
  'house-malefic-hidden': (ctx) => ({
    hi: `सख़्त ग्रह ${ctx.houseHi} में — छिपे और खर्च वाले विषयों का भाव, सँभलकर चलें`,
    en: `A strict planet in the ${ctx.houseEn} — a house of hidden and draining matters, so handle it with care`,
  }),
  'lord-lagna': () => ({
    hi: 'आपका लग्नेश — इसका बल आपका अपना बल है',
    en: 'Your Lagna lord — its strength is your own strength',
  }),
  'lord-yogakaraka': (ctx) => ({
    hi: `योगकारक — ${ctx.ruledHi} का स्वामी, एक केन्द्र और एक त्रिकोण`,
    en: `Yogakaraka — rules the ${ctx.ruledEn}, a pillar and a blessing house together`,
  }),
  'lord-trikona': (ctx) => ({
    hi: `शुभ त्रिकोण का स्वामी — ${ctx.ruledHi}`,
    en: `Rules a blessing house (trikona) — the ${ctx.ruledEn}`,
  }),
  'lord-demanding': (ctx) => ({
    hi: `मेहनत माँगने वाले ${ctx.ruledCount > 1 ? 'भावों' : 'भाव'} का स्वामी — ${ctx.ruledHi}`,
    en: `Rules ${ctx.ruledCount > 1 ? 'houses that ask' : 'a house that asks'} for effort — the ${ctx.ruledEn}`,
  }),
  combust: (ctx) => ({
    hi: `सूर्य से लगभग ${ctx.degreesFromSun}° — तेज मंद (अस्त)`,
    en: `About ${ctx.degreesFromSun}° from the Sun — its light is dimmed (asta)`,
  }),
};

export const TONE_LABEL: Readonly<Record<KundaliGrahaTone, Bilingual>> = {
  supportive: { hi: 'सहायक', en: 'Helps you' },
  mixed: { hi: 'मिश्रित', en: 'Mixed' },
  care: { hi: 'ध्यान दें', en: 'Needs care' },
};

/**
 * The label's one-line meaning; `quiet` is a mixed card that drew no vote. The
 * card shows it in place of the reasons when none voted.
 */
export const TONE_LINE: Readonly<Record<KundaliGrahaTone | 'quiet', Bilingual>> = {
  supportive: { hi: 'बल के सारे संकेत एक ही सहायक दिशा में हैं', en: 'Every sign of strength points the same helpful way' },
  mixed: { hi: 'कुछ संकेत सहारा देते हैं, कुछ सावधानी माँगते हैं', en: 'Some signs help and some ask for care' },
  quiet: { hi: 'किसी ओर विशेष झुकाव नहीं — यह ग्रह यहाँ शांत रूप से काम करता है', en: 'No strong pull either way — this graha works quietly here' },
  care: { hi: 'इसके बल के संकेत सावधानी माँगते हैं — नीचे का उपाय इसे संतुलित करने में सहायक है', en: 'Its signs of strength ask for care — the practice below helps steady it' },
};

export const UPAY_INTRO: Readonly<Record<'keep' | 'steady', Bilingual>> = {
  keep: { hi: 'इस बल को बनाए रखने के लिए', en: 'To keep this strength' },
  steady: { hi: 'इस ग्रह को संतुलित रखने के लिए', en: 'To steady this graha' },
};

export const MANTRA_COUNT: Bilingual = { hi: '108 बार (एक माला)', en: '108 times (one mala)' };

/**
 * The section's own copy: what the cards are, how the label is counted, what
 * an upaya is — short bullets, one idea each (review note, 3 Oct 2026).
 */
export const GRAHA_SECTION_COPY = {
  eyebrow: { hi: 'नवग्रह', en: 'Nine grahas' },
  title: { hi: 'आपके नौ ग्रह, एक-एक करके', en: 'Your nine grahas, one by one' },
  body: [
    {
      hi: 'हर ग्रह जीवन के एक हिस्से की देखभाल करता है',
      en: 'Each graha (planet) looks after one part of life',
    },
    {
      hi: 'हर ग्रह के लिए: वह कहाँ बैठा है, कितना मज़बूत है, क्या देता है, कहाँ सावधानी चाहिए, और एक उपाय',
      en: 'For each one: where it sits, how strong it is, what it gives, where to take care, and one upay',
    },
    {
      hi: 'लेबल अनुमान से नहीं, गिनकर तय होता है — राशि, भाव, आपके लग्न के लिए भूमिका और सूर्य से दूरी देखकर',
      en: 'The label is counted, not guessed — from the sign, the house, its role for your Lagna and its distance from the Sun',
    },
    {
      hi: '‘सहायक’ — सब संकेत सहारा दें (+) · ‘ध्यान दें’ — सब संकेत सावधानी माँगें (−) · ‘मिश्रित’ — दोनों तरह के संकेत',
      en: '‘Helps you’ — every sign helps (+) · ‘Needs care’ — every sign asks for care (−) · ‘Mixed’ — some of each',
    },
    {
      hi: 'मित्र और शत्रु: हर राशि का एक स्वामी है — मित्र की राशि में ग्रह सहज रहता है, शत्रु की राशि में अधिक प्रयास करता है',
      en: 'Friends and enemies: every sign has a lord — in a friend’s sign a graha works with ease, in an enemy’s sign it works harder',
    },
    {
      hi: 'कारक: वह ग्रह जो किसी भाव के विषयों का स्वाभाविक संरक्षक है',
      en: 'Karaka: the graha that naturally looks after a house’s matters',
    },
    {
      hi: 'उपाय मन को स्थिर रखने और अच्छी आदतें बनाने का अभ्यास है — कोई वादा या तुरंत हल नहीं',
      en: 'An upay is a practice that steadies the mind and builds good habits — not a promise or an instant fix',
    },
  ],
  snapshotLabel: { hi: 'ग्रह एक नज़र में', en: 'Grahas at a glance' },
  snapshotNone: { hi: 'सभी ग्रह मिश्रित — हर ग्रह का विवेचन देखें', en: 'All mixed — open each graha’s reading' },
} as const;

/**
 * The empty-houses block after the nine cards (review note, 4 Oct 2026: "can a
 * bhava stay empty?"). Nine grahas share twelve houses, so at least three are
 * always empty; each is read through its lord — where the lord sits. It is
 * information only: no label, no vote.
 */
export const EMPTY_HOUSES_COPY = {
  title: { hi: 'खाली भाव', en: 'Empty houses' },
  intro: [
    {
      hi: 'खाली भाव सामान्य हैं — नौ ग्रह बारह भावों में, इसलिए कुछ भाव हमेशा खाली रहते हैं',
      en: 'Empty houses are normal — nine grahas share twelve houses, so some always stay empty',
    },
    {
      hi: 'खाली होने से भाव कमज़ोर नहीं होता — उसके विषय उसके स्वामी ग्रह से चलते हैं',
      en: 'Being empty does not make a house weak — its matters follow its lord',
    },
  ],
} as const;

export type EmptyHouseContext = {
  /** The empty house: `तृतीय भाव` / `3rd house`, and its short life areas. */
  houseHi: string;
  houseEn: string;
  shortHi: string;
  shortEn: string;
  /** Its lord, sentence form. */
  lordHi: string;
  lordEn: string;
  /** The house the lord sits in, and its short life areas. */
  seatHi: string;
  seatEn: string;
  seatShortHi: string;
  seatShortEn: string;
};

/** One bullet per empty house: the house, its lord, and where the lord sits. */
export const EMPTY_HOUSE_LINE = (ctx: EmptyHouseContext): Bilingual => ({
  hi: `${ctx.houseHi} (${ctx.shortHi}) — स्वामी ${ctx.lordHi}, जो ${ctx.seatHi} (${ctx.seatShortHi}) में बैठा है`,
  en: `${ctx.houseEn} (${ctx.shortEn}) — ruled by ${ctx.lordEn}, who sits in your ${ctx.seatEn} (${ctx.seatShortEn})`,
});

export type GrahaUpay = {
  /** JS getDay(): 0 = Sunday. */
  weekday: number;
  vaarHi: string;
  vaarEn: string;
  daanHi: string;
  daanEn: string;
  sevaHi: string;
  sevaEn: string;
  mantraHi: string;
  mantraEn: string;
  practiceSourceId: KundaliReportPracticeId;
};

function vaarRow(weekday: number) {
  const row = DAAN_VAAR_ENTRIES.find((entry) => entry.weekday === weekday);
  if (!row) throw new Error(`no vaar-daan row for weekday ${weekday}`);
  return row;
}

/** The seven weekday grahas take their day and daan from the shared vaar table. */
function fromVaar(weekday: number): Pick<GrahaUpay, 'weekday' | 'vaarHi' | 'vaarEn' | 'daanHi' | 'daanEn'> {
  const row = vaarRow(weekday);
  return { weekday, vaarHi: row.vaarHi, vaarEn: row.vaarEn, daanHi: row.itemsHi, daanEn: row.itemsEn };
}

/** The nodes keep their own daan; their day follows the maxims शनिवत् राहु · कुजवत् केतु. */
function nodeDay(weekday: number, daanHi: string, daanEn: string): Pick<GrahaUpay, 'weekday' | 'vaarHi' | 'vaarEn' | 'daanHi' | 'daanEn'> {
  const row = vaarRow(weekday);
  return { weekday, vaarHi: row.vaarHi, vaarEn: row.vaarEn, daanHi, daanEn };
}

/**
 * The ONE upaya table (RULEBOOK §14.3.5): day, daan, seva, beej mantra and one
 * paath per graha. Seva lines are free, behavioural and dharmic; the paath is
 * an active library id opened through `buildEntryStartTarget()`.
 */
export const GRAHA_UPAY: Readonly<Record<Graha, GrahaUpay>> = {
  sun: {
    ...fromVaar(0),
    sevaHi: 'सुबह उगते सूर्य को ताँबे के पात्र से जल (अर्घ्य) दें, और पिता व बड़ों का सम्मान करें।',
    sevaEn: 'Offer water to the rising Sun from a copper vessel (arghya), and respect your father and elders.',
    mantraHi: 'ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः',
    mantraEn: 'Om Hraam Hreem Hraum Sah Suryaya Namah',
    practiceSourceId: 'surya-ashtakam',
  },
  moon: {
    ...fromVaar(1),
    sevaHi: 'माँ की सेवा और सम्मान करें; सोमवार को शिवलिंग पर जल या दूध चढ़ाएँ।',
    sevaEn: 'Serve and honour your mother; on Monday, offer water or milk on a Shivling.',
    mantraHi: 'ॐ श्रां श्रीं श्रौं सः चन्द्रमसे नमः',
    mantraEn: 'Om Shraam Shreem Shraum Sah Chandramase Namah',
    practiceSourceId: 'shiv-chalisa',
  },
  mars: {
    ...fromVaar(2),
    sevaHi: 'भाइयों की मदद करें, और अपनी ऊर्जा शारीरिक श्रम-सेवा में लगाएँ।',
    sevaEn: 'Help your brothers, and put your energy into hands-on seva.',
    mantraHi: 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः',
    mantraEn: 'Om Kraam Kreem Kraum Sah Bhaumaya Namah',
    practiceSourceId: 'hanuman-chalisa',
  },
  mercury: {
    ...fromVaar(3),
    sevaHi: 'बुधवार को गाय को हरा चारा खिलाएँ (गौ-ग्रास); मीठा बोलें और अपनी बात निभाएँ।',
    sevaEn: 'On Wednesday, feed green fodder to a cow (gau-gras); speak gently and keep your word.',
    mantraHi: 'ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः',
    mantraEn: 'Om Braam Breem Braum Sah Budhaya Namah',
    practiceSourceId: 'ganesh-chalisa',
  },
  jupiter: {
    ...fromVaar(4),
    sevaHi: 'गुरुजनों और बड़ों का सम्मान करें, और किसी की पढ़ाई में मदद करें।',
    sevaEn: 'Respect your teachers and elders, and help someone with their studies.',
    mantraHi: 'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः',
    mantraEn: 'Om Graam Greem Graum Sah Gurave Namah',
    practiceSourceId: 'vishnu-sahasranama',
  },
  venus: {
    ...fromVaar(5),
    sevaHi: 'घर की स्त्रियों का सम्मान करें, और घर को साफ़ व सुंदर रखें।',
    sevaEn: 'Honour the women of your family, and keep your home clean and pleasant.',
    mantraHi: 'ॐ द्रां द्रीं द्रौं सः शुक्राय नमः',
    mantraEn: 'Om Draam Dreem Draum Sah Shukraya Namah',
    practiceSourceId: 'mahalakshmi-ashtakam',
  },
  saturn: {
    ...fromVaar(6),
    sevaHi: 'मज़दूरों, बुज़ुर्गों और ज़रूरतमंदों की मदद करें; शनिवार को पीपल के नीचे सरसों के तेल का दीपक जलाएँ।',
    sevaEn: 'Help workers, the elderly and people in need; on Saturday, light a mustard-oil lamp under a peepal tree.',
    mantraHi: 'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः',
    mantraEn: 'Om Praam Preem Praum Sah Shanaishcharaya Namah',
    practiceSourceId: 'shani-ashtakam',
  },
  rahu: {
    ...nodeDay(6, 'उड़द दाल और कंबल', 'urad dal and a blanket'),
    sevaHi: 'लेन-देन साफ़ और ईमानदार रखें; पक्षियों को दाना डालें।',
    sevaEn: 'Keep your dealings clean and honest; scatter grain for birds.',
    mantraHi: 'ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः',
    mantraEn: 'Om Bhraam Bhreem Bhraum Sah Rahave Namah',
    practiceSourceId: 'durga-chalisa',
  },
  ketu: {
    ...nodeDay(2, 'कंबल और तिल', 'a blanket and til (sesame)'),
    sevaHi: 'कुत्ते को रोटी खिलाएँ, और कुछ समय शांत प्रार्थना या ध्यान को दें।',
    sevaEn: 'Feed a roti to a dog, and give some time to quiet prayer or meditation.',
    mantraHi: 'ॐ स्रां स्रीं स्रौं सः केतवे नमः',
    mantraEn: 'Om Sraam Sreem Sraum Sah Ketave Namah',
    practiceSourceId: 'ganesha-kavacham',
  },
};
