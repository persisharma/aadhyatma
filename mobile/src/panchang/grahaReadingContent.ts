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
    'GRAHA_PLAIN, BHAVA_PLAIN, GRAHA_BHAVA_READINGS (9 × 12), the strength, reason and tone phrases, GRAHA_UPAY (9 rows), and the tone convention in docs/roadmap/conventions/graha-reading-v1.md',
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

/** Each house's life areas in everyday words — `short` names it inside a sentence. */
export const BHAVA_PLAIN: readonly { hi: string; en: string; shortHi: string; shortEn: string }[] = [
  {
    hi: 'स्वयं आप — शरीर, स्वभाव, आत्मविश्वास और काम शुरू करने का ढंग',
    en: 'you yourself — body, nature, confidence and how you begin things',
    shortHi: 'स्वयं आप',
    shortEn: 'you yourself',
  },
  {
    hi: 'परिवार, जमा-पूँजी, वाणी और खान-पान',
    en: 'family, savings, speech and food',
    shortHi: 'परिवार और बचत',
    shortEn: 'family and savings',
  },
  {
    hi: 'साहस, मेहनत, छोटे भाई-बहन, छोटी यात्राएँ और अपनी बात रखने का कौशल',
    en: 'courage, effort, younger siblings, short trips and how you express yourself',
    shortHi: 'साहस और मेहनत',
    shortEn: 'courage and effort',
  },
  {
    hi: 'घर, माँ, वाहन, ज़मीन-जायदाद और मन की शांति',
    en: 'home, mother, vehicles, property and peace of mind',
    shortHi: 'घर और माँ',
    shortEn: 'home and mother',
  },
  {
    hi: 'पढ़ाई, बुद्धि, रचनात्मकता, संतान और पूर्व-पुण्य',
    en: 'studies, intelligence, creativity, children and past good deeds',
    shortHi: 'पढ़ाई और संतान',
    shortEn: 'studies and children',
  },
  {
    hi: 'रोज़ का काम, दिनचर्या, प्रतियोगिता, सेवा और कर्ज़',
    en: 'daily work, routine, competition, service and debts',
    shortHi: 'काम और प्रतियोगिता',
    shortEn: 'work and competition',
  },
  {
    hi: 'विवाह, जीवनसाथी, साझेदारी और दूसरों से व्यवहार',
    en: 'marriage, your partner, partnerships and dealings with others',
    shortHi: 'विवाह और साझेदारी',
    shortEn: 'marriage and partnerships',
  },
  {
    hi: 'अचानक बदलाव, शोध, छिपे विषय और ससुराल या साझी सम्पत्ति',
    en: 'sudden changes, research, hidden matters and in-laws’ or shared resources',
    shortHi: 'अचानक बदलाव और छिपे विषय',
    shortEn: 'sudden changes and hidden matters',
  },
  {
    hi: 'भाग्य, पिता, गुरु, श्रद्धा, धर्म और लंबी यात्राएँ',
    en: 'fortune, father, teachers, faith, dharma and long journeys',
    shortHi: 'भाग्य और धर्म',
    shortEn: 'fortune and dharma',
  },
  {
    hi: 'करियर, काम-काज, मान-सम्मान और समाज में स्थान',
    en: 'career, work, reputation and standing in society',
    shortHi: 'करियर और मान-सम्मान',
    shortEn: 'career and reputation',
  },
  {
    hi: 'आमदनी, लाभ, मित्र, बड़े भाई-बहन और इच्छाओं की पूर्ति',
    en: 'income, gains, friends, elder siblings and wishes fulfilled',
    shortHi: 'आमदनी और लाभ',
    shortEn: 'income and gains',
  },
  {
    hi: 'खर्च, नींद और विश्राम, दूर देश या विदेश, और आध्यात्मिक मुक्ति',
    en: 'expenses, sleep and rest, faraway places or abroad, and spiritual release',
    shortHi: 'खर्च और दूर देश',
    shortEn: 'expenses and faraway places',
  },
];

export type GrahaBhavaReading = { givesHi: string; givesEn: string; careHi: string; careEn: string };

/**
 * What a graha gives in each house, and where to take care — index 0 is the
 * 1st house. Generic to the placement: the sign's strength, the Lagna's
 * lordship and combustion are stated by the card's own strength and reason
 * lines, so these sentences never repeat or contradict them.
 */
export const GRAHA_BHAVA_READINGS: Readonly<Record<Graha, readonly GrahaBhavaReading[]>> = {
  sun: [
    {
      givesHi: 'आत्मविश्वासी, स्वाभिमानी स्वभाव और स्वाभाविक नेतृत्व; लोग आप पर ध्यान देते हैं और आपसे आगे बढ़कर ज़िम्मेदारी लेने की आशा रखते हैं।',
      givesEn: 'A confident, self-respecting nature and natural leadership; people notice you and look to you to take charge.',
      careHi: 'अहंकार और जल्दी गुस्सा लोगों को दूर कर सकता है — निर्णय से पहले सुनें।',
      careEn: 'Pride and a quick temper can push people away — listen before you decide.',
    },
    {
      givesHi: 'सरकार, अधिकार या परिवार के नाम से जुड़ी कमाई, और ऐसी वाणी जिसका वज़न होता है।',
      givesEn: 'Earnings linked to government, authority or your family’s name, and speech that carries weight.',
      careHi: 'कठोर या हुक्म भरे शब्द परिवार में खिंचाव ला सकते हैं — अपनेपन से बोलें और बचत नियमित रखें।',
      careEn: 'Harsh or commanding words can strain family ties — speak with warmth and keep savings regular.',
    },
    {
      givesHi: 'भरपूर साहस और इच्छाशक्ति; जिस मेहनत से दूसरे पीछे हट जाते हैं, आप उसे पूरा करते हैं, और संवाद, मीडिया या साहसिक कामों में अच्छा करते हैं।',
      givesEn: 'Strong courage and willpower; you finish efforts others give up on, and do well in communication, media or bold ventures.',
      careHi: 'होड़ की भावना छोटे भाई-बहनों या साथियों से रिश्तों में खिंचाव न लाए।',
      careEn: 'Do not let a competitive streak strain ties with younger siblings or colleagues.',
    },
    {
      givesHi: 'घर और अपनी जड़ों से जुड़ी गरिमा, और मेहनत या अधिकार से ज़मीन-जायदाद या वाहन के अवसर।',
      givesEn: 'Dignity around your home and roots, and chances of property or vehicles through effort or authority.',
      careHi: 'घर का माहौल औपचारिक या तनाव भरा लग सकता है — माँ और परिवार के साथ अपनापन बढ़ाएँ, और मन को आराम दें।',
      careEn: 'Home life can feel formal or tense — make room for warmth with your mother and family, and give your mind rest.',
    },
    {
      givesHi: 'तेज़ और आत्मविश्वासी बुद्धि, पढ़ाई या रचनात्मक काम में नेतृत्व, और राजनीति, प्रबंधन या धर्म में रुचि।',
      givesEn: 'A sharp, confident mind, leadership in studies or creative work, and interest in politics, management or dharma.',
      careHi: 'प्रेम-संबंधों या अपनी रचना के अभिमान में अहं को नरम करें — श्रेय बाँटें और दूसरों के विचारों के लिए खुले रहें।',
      careEn: 'Soften ego in romance and in pride over your work — share credit and stay open to others’ ideas.',
    },
    {
      givesHi: 'प्रतियोगिता और विरोधियों पर विजय का बल, और सेवा, प्रशासन या न्याय से जुड़े कामों में सफलता।',
      givesEn: 'The strength to win over competition and rivals, and success in service, administration or legal work.',
      careHi: 'हर विवाद को व्यक्तिगत न लें; झगड़ों से अधिक नियमित दिनचर्या आपका साथ देती है।',
      careEn: 'Do not take every dispute personally; a steady routine serves you better than battles.',
    },
    {
      givesHi: 'प्रतिष्ठित और दृढ़ व्यक्तित्व वाले जीवनसाथी या साथी; सार्वजनिक व्यवहार और साझेदारी से लाभ।',
      givesEn: 'A partner or associates with standing and a strong personality; gains through public dealings and partnerships.',
      careHi: 'दो मज़बूत अहं टकरा सकते हैं — विवाह और व्यापार में नियंत्रण के बजाय लेन-देन का संतुलन रखें।',
      careEn: 'Two strong egos can clash — in marriage and business, keep a balance of give-and-take instead of control.',
    },
    {
      givesHi: 'शोध, गूढ़ ज्ञान और गहरे प्रश्नों में रुचि; अचानक बदलावों को भीतरी बल से सँभालने की क्षमता।',
      givesEn: 'Interest in research, deep knowledge and big questions; the inner strength to handle sudden change.',
      careHi: 'मान-सम्मान देर से या चुपचाप मिल सकता है — अधिकारियों से टकराव के बजाय धैर्य रखें।',
      careEn: 'Recognition can come late or quietly — patience with people in authority serves you better than confrontation.',
    },
    {
      givesHi: 'धर्म, गुरु और पिता के प्रति आदर; सिद्धांत, उच्च शिक्षा और लंबी यात्राओं से बढ़ता भाग्य।',
      givesEn: 'Respect for dharma, teachers and father; fortune that grows through principles, higher learning and long journeys.',
      careHi: 'दृढ़ विचार कठोर हो सकते हैं — असहमति में भी पिता और गुरुओं के प्रति विनम्र रहें।',
      careEn: 'Firm views can turn rigid — stay humble with your father and teachers, even when you disagree.',
    },
    {
      givesHi: 'सूर्य की सबसे अच्छी जगहों में से एक: करियर, सरकार या नेतृत्व की भूमिकाओं में अधिकार, पहचान और सफलता।',
      givesEn: 'One of the Sun’s best seats: authority, recognition and success in career, government or leadership roles.',
      careHi: 'सफलता अभिमान ला सकती है — अपने से छोटों से अच्छा व्यवहार करें और आचरण साफ़ रखें; मान-सम्मान ही असली पूँजी है।',
      careEn: 'Success can bring pride — treat juniors well and keep your conduct clean; your reputation is your real capital.',
    },
    {
      givesHi: 'स्थिर लाभ, प्रभावशाली मित्र और अधिकार वाले लोगों का साथ; मेहनत से इच्छाएँ पूरी होती हैं।',
      givesEn: 'Steady gains, influential friends and support from people in authority; wishes come true through effort.',
      careHi: 'मित्र उनके पद से नहीं, चरित्र से चुनें, और अपने साथियों के साथ श्रेय बाँटें।',
      careEn: 'Choose friends for their character, not their position, and share credit with your circle.',
    },
    {
      givesHi: 'आध्यात्मिकता, दान-पुण्य और दूर-दराज़, विदेश या पर्दे के पीछे के कामों की ओर झुकाव।',
      givesEn: 'A leaning toward spirituality, charity and work in faraway places, abroad or behind the scenes.',
      careHi: 'खर्च बढ़ सकते हैं और पहचान पर्दे के पीछे रह सकती है — दिनचर्या नियमित रखें और शांत सेवा का मूल्य समझें।',
      careEn: 'Expenses can rise and recognition can stay behind the scenes — keep a regular routine and value quiet service.',
    },
  ],
  moon: [
    {
      givesHi: 'कोमल, देखभाल करने वाला और आकर्षक स्वभाव; लोग आपसे जल्दी घुल-मिल जाते हैं और आप दूसरों की भावनाएँ समझते हैं।',
      givesEn: 'A gentle, caring and attractive nature; people warm to you quickly and you understand how others feel.',
      careHi: 'मन जल्दी बदल सकता है — नियमित दिनचर्या और शांत समय मन को स्थिर रखते हैं।',
      careEn: 'Moods can change quickly — a regular routine and quiet time keep the mind steady.',
    },
    {
      givesHi: 'मधुर, शांत करने वाली वाणी, स्नेही परिवार और स्थिर सुख-सुविधा; जनता से जुड़े काम से आमदनी।',
      givesEn: 'Sweet, soothing speech, a loving family and steady comforts; income through work with the public.',
      careHi: 'सुख-सुविधा पर खर्च मन के साथ बदल सकता है — बचत नियमित रखें।',
      careEn: 'Spending on comforts can follow your mood — keep savings regular.',
    },
    {
      givesHi: 'रचनात्मक और अपनी बात खुलकर कहने वाला मन; लेखन, बोलने, यात्रा और जनता से जुड़े कामों में अच्छा।',
      givesEn: 'A creative, expressive mind; good at writing, speaking, travel and work with the public.',
      careHi: 'साहस मन के साथ घट-बढ़ सकता है — नया काम शुरू करने से पहले पुराना पूरा करें।',
      careEn: 'Courage can rise and fall with your mood — finish one task before starting the next.',
    },
    {
      givesHi: 'चन्द्र की सबसे अच्छी जगहों में से एक: सुखी घर, माँ से गहरा जुड़ाव, सुख-सुविधा, वाहन और मन की शांति।',
      givesEn: 'One of the Moon’s best seats: a happy home, a deep bond with your mother, comforts, vehicles and peace of mind.',
      careHi: 'आपकी शांति घर के माहौल पर बहुत निर्भर है — बाहर का तनाव घर में न लाएँ।',
      careEn: 'Your peace depends a lot on home life — do not carry outside stress into the house.',
    },
    {
      givesHi: 'कल्पनाशक्ति, भावनात्मक समझ और सीखने का प्रेम; रचनात्मक काम और संतान से आनंद।',
      givesEn: 'Imagination, emotional understanding and a love of learning; joy through creative work and children.',
      careHi: 'प्रेम और पढ़ाई में भावनाएँ निर्णय पर हावी हो सकती हैं — दिल के साथ नियमित मेहनत का संतुलन रखें।',
      careEn: 'Feelings can cloud judgement in love and studies — balance the heart with steady effort.',
    },
    {
      givesHi: 'सेवा भाव वाला स्वभाव जो दूसरों की अच्छी मदद करता है; सेवा, देखभाल और धैर्य वाले कामों के लिए अच्छा।',
      givesEn: 'A caring nature that helps others well; good for service, caregiving and work that needs patience.',
      careHi: 'काम की चिंताएँ या छोटे विवाद मन पर भारी पड़ सकते हैं — अपना बोझ बाँटें और दिनचर्या शांत रखें।',
      careEn: 'Work worries or small disputes can weigh on the mind — share your load and keep a calm routine.',
    },
    {
      givesHi: 'स्नेही, आकर्षक जीवनसाथी और लोगों से सहज व्यवहार; सार्वजनिक काम और साझेदारी में सफलता।',
      givesEn: 'A caring, attractive partner and an easy way with people; success in public work and partnerships.',
      careHi: 'मन की उथल-पुथल रिश्तों को अस्थिर कर सकती है — जीवनसाथी से अनुमान की आशा के बजाय खुलकर बात करें।',
      careEn: 'Mood swings can unsettle relationships — talk openly instead of expecting your partner to guess.',
    },
    {
      givesHi: 'गहरा अंतर्ज्ञान और छिपे विषयों, शोध या साधना में रुचि; बदलाव के बाद फिर से खड़े होने की क्षमता।',
      givesEn: 'Deep intuition and interest in hidden matters, research or spiritual practice; the ability to rebuild after change.',
      careHi: 'मन चिंता से बेचैन हो सकता है — नियमित प्रार्थना, अच्छी संगत और मन की बात बाँटना स्थिर रखते हैं।',
      careEn: 'The mind can grow restless with worry — regular prayer, good company and sharing your thoughts keep you steady.',
    },
    {
      givesHi: 'श्रद्धा, भक्ति और दयालु, सिद्धांतवादी मन; माँ और गुरुओं का साथ, और तीर्थ व यात्रा में आनंद।',
      givesEn: 'Faith, devotion and a kind, principled mind; support from your mother and teachers, and joy in pilgrimage and travel.',
      careHi: 'विश्वास भावनाओं के साथ बदल सकता है — अपनी श्रद्धा को नियमित साधना से जोड़े रखें।',
      careEn: 'Beliefs can shift with feelings — anchor your faith in a regular practice.',
    },
    {
      givesHi: 'लोकप्रियता और जनता से जुड़े काम में सफलता; लोगों की देखभाल से बढ़ने वाला करियर।',
      givesEn: 'Popularity and success in public-facing work; a career that grows by caring for people.',
      careHi: 'मन के साथ काम बार-बार बदल सकता है — बदलने से पहले एक स्थिर राह बनाएँ।',
      careEn: 'Work can change often with your mood — build one steady path before switching.',
    },
    {
      givesHi: 'अच्छा लाभ, अनेक मित्र और स्त्रियों व जनता का सहयोग; इच्छाएँ सहजता से पूरी होती हैं।',
      givesEn: 'Good gains, many friends and support from women and the public; wishes come true with ease.',
      careHi: 'दूसरों की स्वीकृति को अपने निर्णय तय न करने दें — अपनी स्थिर समझ पर भरोसा रखें।',
      careEn: 'Do not let others’ approval make your choices — trust your own steady judgement.',
    },
    {
      givesHi: 'समृद्ध भीतरी जीवन, करुणा, गहरी कल्पना और आध्यात्मिकता, दान या दूर देशों की ओर खिंचाव।',
      givesEn: 'A rich inner life, compassion, vivid imagination and a pull toward spirituality, charity or faraway places.',
      careHi: 'खर्च और विश्राम दोनों पर ध्यान चाहिए — आदतें नियमित रखें और भावना में किए खर्च पर नज़र रखें।',
      careEn: 'Spending and rest both need attention — keep regular habits and watch spending done on impulse.',
    },
  ],
  mars: [
    {
      givesHi: 'ऊर्जा, साहस और मज़बूत, सक्रिय स्वभाव; आप तेज़ी से काम करते हैं और पीछे नहीं हटते।',
      givesEn: 'Energy, courage and a strong, active nature; you act fast and do not back down.',
      careHi: 'गुस्सा और जल्दबाज़ी मुख्य जाल हैं — प्रतिक्रिया से पहले रुकें, और ऊर्जा व्यायाम या सेवा में लगाएँ।',
      careEn: 'Anger and haste are the main traps — pause before reacting, and put your energy into exercise or seva.',
    },
    {
      givesHi: 'मेहनत, ज़मीन-जायदाद या तकनीकी काम से कमाने और धन बनाने का जोश।',
      givesEn: 'Drive to earn and build wealth through effort, property or technical work.',
      careHi: 'तीखे शब्द परिवार और अपनों को चोट पहुँचा सकते हैं — शांति से बोलें, और जल्दबाज़ी में खर्च न करें।',
      careEn: 'Sharp words can hurt family and loved ones — speak calmly, and avoid spending in haste.',
    },
    {
      givesHi: 'बेहतरीन साहस, पहल और दमखम; साहसी प्रयास, खेल, तकनीकी कौशल या अपने बल पर खड़े किए कामों से सफलता।',
      givesEn: 'Excellent courage, initiative and stamina; success through bold effort, sports, technical skill or self-made ventures.',
      careHi: 'छोटे भाई-बहनों या साथियों पर हावी न हों — उन्हें धकेलें नहीं, राह दिखाएँ।',
      careEn: 'Do not dominate younger siblings or colleagues — lead them instead of pushing them.',
    },
    {
      givesHi: 'ज़मीन, जायदाद और वाहन पाने का जोश; घर और परिवार की रक्षा करने वाला स्वभाव।',
      givesEn: 'Drive to own land, property and vehicles; a protective nature toward home and family.',
      careHi: 'घर में बेचैनी या बहस शांति भंग कर सकती है — माँ और परिवार के साथ धैर्य रखें।',
      careEn: 'Restlessness or arguments at home can disturb its peace — be patient with your mother and family.',
    },
    {
      givesHi: 'तेज़, प्रतिस्पर्धी बुद्धि; तकनीकी पढ़ाई, खेल, रणनीति और साहसी रचनात्मक काम के लिए अच्छा।',
      givesEn: 'A quick, competitive mind; good for technical studies, sports, strategy and bold creative work.',
      careHi: 'पढ़ाई या प्रेम में अधीरता उलटी पड़ सकती है — गति धीमी करें और एक कदम आगे सोचें।',
      careEn: 'Impatience in studies or romance can backfire — slow down and think a step ahead.',
    },
    {
      givesHi: 'मंगल के लिए मज़बूत स्थान: आप प्रतियोगिता और बाधाओं को जीतते हैं, और रक्षा, खेल, कानून, पुलिस या तकनीकी सेवा में अच्छा करते हैं।',
      givesEn: 'A strong seat for Mars: you overcome competition and obstacles, and do well in defence, sports, law, police or technical service.',
      careHi: 'हर बहस जीतना ज़रूरी नहीं — अपनी जुझारू भावना काम में लगाएँ, झगड़ों में नहीं।',
      careEn: 'You need not win every argument — use your fighting spirit for work, not quarrels.',
    },
    {
      givesHi: 'ऊर्जावान, जोशीला जीवनसाथी और व्यापारिक साझेदारी में उत्साह।',
      givesEn: 'An energetic, passionate partner and drive in business partnerships.',
      careHi: 'विवाह या साझेदारी में बहस भड़क सकती है — धैर्य रखें, और विवाद शांति से सुलझाएँ।',
      careEn: 'Arguments can flare up in marriage or partnerships — be patient, and settle disputes calmly.',
    },
    {
      givesHi: 'कठिन समय में साहस, और शोध, तकनीकी जाँच या गूढ़ विषयों में रुचि।',
      givesEn: 'Courage in hard times, and interest in research, technical investigation or deep subjects.',
      careHi: 'जल्दबाज़ी अचानक रुकावटें ला सकती है — जोखिम भरे फ़ैसलों में गति धीमी रखें।',
      careEn: 'Haste can bring sudden setbacks — slow down before risky choices.',
    },
    {
      givesHi: 'अपने सिद्धांतों के लिए डटकर खड़े रहने का बल; साहसिक काम, लंबी यात्राओं और सेवा जैसे सक्रिय धर्म के लिए ऊर्जा।',
      givesEn: 'The strength to stand up for your principles; energy for adventure, long journeys and active dharma such as seva.',
      careHi: 'पिता या गुरुओं से मान्यताओं पर बहस से बचें — मतभेद में भी आदर रखें।',
      careEn: 'Avoid arguing over beliefs with your father or teachers — keep respect even where you differ.',
    },
    {
      givesHi: 'मंगल की सबसे अच्छी जगहों में से एक: महत्वाकांक्षा, नेतृत्व और इंजीनियरिंग, रक्षा, खेल, ज़मीन-जायदाद या प्रबंधन में सफलता।',
      givesEn: 'One of Mars’s best seats: ambition, leadership and success in engineering, defence, sports, property or management.',
      careHi: 'पूरी ताक़त लगाएँ, पर दूसरों को कुचलकर नहीं — न्यायप्रियता की साख अधिक टिकती है।',
      careEn: 'Push hard, but not over others — a name for fairness lasts longer.',
    },
    {
      givesHi: 'मेहनत, ज़मीन-जायदाद या तकनीकी काम से अच्छा लाभ, और सक्रिय, वफ़ादार मित्र।',
      givesEn: 'Good gains through effort, property or technical work, and active, loyal friends.',
      careHi: 'बड़े भाई-बहनों या मित्रों से होड़ को दोस्ताना ही रखें।',
      careEn: 'Keep any rivalry with elder siblings or friends a friendly one.',
    },
    {
      givesHi: 'विदेश, दूर-दराज़ या पर्दे के पीछे के कामों के लिए ऊर्जा, और अनुशासित साधना का बल।',
      givesEn: 'Energy for work abroad, in faraway places or behind the scenes, and strength for disciplined spiritual practice.',
      careHi: 'खर्च और भीतर दबी झुंझलाहट बढ़ सकती है — खर्च की योजना बनाएँ, और गुस्सा मन में दबाने के बजाय शारीरिक काम में निकालें।',
      careEn: 'Expenses and bottled-up frustration can build — plan spending, and let anger out through physical work instead of holding it in.',
    },
  ],
  mercury: [
    {
      givesHi: 'तेज़, हाज़िरजवाब और युवा मन; आप जल्दी सीखते हैं और अपनी बात अच्छे से रखते हैं।',
      givesEn: 'A sharp, witty and youthful mind; you learn fast and express yourself well.',
      careHi: 'ज़्यादा सोचने की बेचैनी ऊर्जा बिखेर सकती है — एक समय में एक काम पर ध्यान दें।',
      careEn: 'Restless overthinking can scatter your energy — focus on one task at a time.',
    },
    {
      givesHi: 'कुशल, मधुर वाणी और धन की समझ; व्यापार, अध्यापन, हिसाब-किताब या संवाद से लाभ।',
      givesEn: 'Skilled, pleasant speech and a head for money; gains through business, teaching, accounts or communication.',
      careHi: 'चतुर बातों में सावधान रहें — वादे निभाएँ और पैसों के मामलों में ईमानदार रहें।',
      careEn: 'Be careful with clever talk — keep promises and stay honest in money matters.',
    },
    {
      givesHi: 'बेहतरीन संवाद-कौशल; लेखन, मीडिया, बिक्री, छोटी यात्राओं और तेज़ सोच वाले हर काम में सफलता।',
      givesEn: 'Excellent communication skills; success in writing, media, sales, short trips and anything that needs quick thinking.',
      careHi: 'एक साथ बहुत सारी योजनाएँ काम अधूरा छोड़ सकती हैं — अगला शुरू करने से पहले पिछला पूरा करें।',
      careEn: 'Too many plans at once can leave work half-done — finish one before starting the next.',
    },
    {
      givesHi: 'पढ़ा-लिखा घर, अच्छी बुनियादी शिक्षा और बुद्धि से सुख-सुविधा; समझदार योजना से ज़मीन-जायदाद या वाहन का लाभ।',
      givesEn: 'A learned home, a good basic education and comforts through intelligence; property or vehicles through smart planning.',
      careHi: 'व्यस्त मन भीतर की शांति भंग कर सकता है — घर पर शांत समय निकालें।',
      careEn: 'A busy mind can disturb inner peace — make quiet time at home.',
    },
    {
      givesHi: 'तेज़ बुद्धि और पढ़ाई, गणित, लेखन व विश्लेषण की प्रतिभा; चतुर, रचनात्मक विचार।',
      givesEn: 'Sharp intelligence and a talent for studies, mathematics, writing and analysis; clever, creative ideas.',
      careHi: 'गहराई के बिना चतुराई भटका सकती है — जल्दी के उपायों के बजाय गहराई से पढ़ें।',
      careEn: 'Cleverness without depth can mislead — study thoroughly instead of relying on quick tricks.',
    },
    {
      givesHi: 'समस्याएँ सुलझाने, बारीकियों, हिसाब-किताब, कानून या सेवा में कुशलता; आप विरोधियों से आगे की सोचते हैं।',
      givesEn: 'Skill in solving problems, handling details, accounts, law or service; you think a step ahead of rivals.',
      careHi: 'छोटी बातों की चिंता और दूसरों की कड़ी आलोचना आपको थका सकती है — शब्द नरम रखें।',
      careEn: 'Worrying over small things and criticising others harshly can wear you out — keep your words kind.',
    },
    {
      givesHi: 'युवा, बुद्धिमान जीवनसाथी और व्यापार, साझेदारी व बातचीत में सफलता।',
      givesEn: 'A youthful, intelligent partner and success in trade, partnerships and negotiation.',
      careHi: 'समझौते स्पष्ट रखें; विवाह में चतुर तर्क से अधिक सच्ची बातचीत को महत्व दें।',
      careEn: 'Keep agreements clear; in marriage, value honest talk over clever arguments.',
    },
    {
      givesHi: 'शोध करने वाला मन, और गूढ़ विषयों, ज्योतिष, बीमा, कर या जाँच-पड़ताल में रुचि।',
      givesEn: 'A research mind, and interest in deep subjects, astrology, insurance, taxes or investigation.',
      careHi: 'ज़्यादा सोचना चिंता बढ़ा सकता है — अपने विचार बाँटें और काग़ज़ात व्यवस्थित रखें।',
      careEn: 'Overthinking can feed worry — share your thoughts and keep your papers in order.',
    },
    {
      givesHi: 'सीखने, उच्च शिक्षा और शास्त्रों का प्रेम; अध्यापन, लेखन, प्रकाशन या यात्रा से भाग्य।',
      givesEn: 'A love of learning, higher studies and scriptures; fortune through teaching, writing, publishing or travel.',
      careHi: 'तर्क को श्रद्धा की जगह न लेने दें — प्रश्न करते हुए भी गुरुओं का आदर करें।',
      careEn: 'Do not let debate replace faith — respect your teachers even while you question them.',
    },
    {
      givesHi: 'संवाद, व्यापार, हिसाब-किताब, आईटी, अध्यापन या लेखन के करियर में सफलता; बुद्धिमत्ता की साख।',
      givesEn: 'Success in careers of communication, business, accounts, IT, teaching or writing; a name for intelligence.',
      careHi: 'बार-बार काम बदलना उन्नति धीमी कर सकता है — एक कौशल को पूरा परिपक्व होने दें।',
      careEn: 'Changing jobs too often can slow growth — let one skill mature fully.',
    },
    {
      givesHi: 'व्यापार, संपर्कों और बुद्धिमान मित्रों से लाभ; आमदनी के अनेक स्रोत।',
      givesEn: 'Gains through business, networking and intelligent friends; several sources of income.',
      careHi: 'संगत सोच-समझकर चुनें — चतुर मित्र अच्छे हैं, ईमानदार मित्र और भी अच्छे।',
      careEn: 'Choose your company with care — clever friends are good, honest friends are better.',
    },
    {
      givesHi: 'कल्पनाशील, भीतर की ओर मुड़ा मन; शोध, विदेशी भाषाओं, विदेश में काम या आध्यात्मिक अध्ययन के लिए अच्छा।',
      givesEn: 'An imaginative, inward-looking mind; good for research, foreign languages, work abroad or spiritual study.',
      careHi: 'चिंता और बिखरे खर्च पर नज़र चाहिए — बातें लिख लें और खर्च की योजना बनाएँ।',
      careEn: 'Worry and scattered spending need watching — write things down and plan expenses.',
    },
  ],
  jupiter: [
    {
      givesHi: 'गुरु की सबसे अच्छी जगहों में से एक: ज्ञान, अच्छे संस्कार, दूसरों से सम्मान और जीवन पर रक्षक कृपा।',
      givesEn: 'One of Jupiter’s best seats: wisdom, good values, respect from others and a protecting grace over life.',
      careHi: 'अधिक आराम या अति-आत्मविश्वास ढील ला सकता है — सीखते रहें और विनम्र रहें।',
      careEn: 'Too much comfort or overconfidence can make you lax — keep learning and stay humble.',
    },
    {
      givesHi: 'सम्मानित परिवार, अच्छी बचत, सच्ची वाणी, और धीरे-धीरे बढ़ता अन्न-धन।',
      givesEn: 'A respected family, good savings, truthful speech, and food and wealth that grow steadily.',
      careHi: 'उदारता अच्छी है, पर संतुलन रखें — जितना दे सकें उससे अधिक का वादा न करें।',
      careEn: 'Generosity is good, but keep balance — do not promise more than you can give.',
    },
    {
      givesHi: 'समझदारी भरा संवाद और भाई-बहनों से अच्छे संबंध; अध्यापन, लेखन, परामर्श या सलाह के कामों में सफलता।',
      givesEn: 'Wise communication and good relations with siblings; success in teaching, writing, counselling or advisory work.',
      careHi: 'मेहनत का फल धीमा लग सकता है — लगे रहें, और काम के लिए उत्तम परिस्थिति की प्रतीक्षा न करें।',
      careEn: 'Effort can seem slow to pay off — keep at it, and do not wait for perfect conditions to act.',
    },
    {
      givesHi: 'आशीर्वाद भरा घर, माँ से अच्छा जुड़ाव, सुख-सुविधा, ज़मीन-जायदाद या वाहन, और शांत, समझदार मन; शिक्षा के लिए अच्छा।',
      givesEn: 'A blessed home, a good bond with your mother, comforts, property or vehicles, and a calm, wise mind; good for education.',
      careHi: 'सुख मोह में बदल सकता है — घर के सुख दूसरों के साथ भी बाँटें।',
      careEn: 'Comfort can turn into attachment — share your home’s blessings with others too.',
    },
    {
      givesHi: 'उत्तम बुद्धि, पढ़ाई में सफलता, अच्छी सलाह देने की क्षमता, श्रद्धा, और संतान व शिष्यों से आनंद।',
      givesEn: 'Excellent intelligence, success in studies, the gift of good advice, faith, and joy through children and students.',
      careHi: 'बहुत जानना उपदेशक बना सकता है — दूसरों को भाषण से नहीं, उदाहरण से राह दिखाएँ।',
      careEn: 'Knowing a lot can make you preachy — guide others by example, not lectures.',
    },
    {
      givesHi: 'विवादों को न्याय से सुलझाने की क्षमता, और सेवा, कानून, अध्यापन या परामर्श में अच्छा।',
      givesEn: 'The ability to settle disputes fairly, and good work in service, law, teaching or counselling.',
      careHi: 'कर्ज़ और ज़रूरत से अधिक ज़िम्मेदारियों पर नज़र रखें — स्वयं पर बोझ डाले बिना दूसरों की मदद करें।',
      careEn: 'Watch debts and over-commitment — help others without overloading yourself.',
    },
    {
      givesHi: 'समझदार, दयालु और सम्मानित जीवनसाथी; विवाह, साझेदारी और दूसरों से व्यवहार में सौभाग्य।',
      givesEn: 'A wise, kind and respected partner; good fortune through marriage, partnerships and dealings with others.',
      careHi: 'जीवनसाथी के साथ को हल्के में न लें — आदर और कृतज्ञता बनाए रखें।',
      careEn: 'Do not take your partner’s support for granted — keep respect and gratitude alive.',
    },
    {
      givesHi: 'आध्यात्मिकता, शोध और गूढ़ ज्ञान में गहरी रुचि; बदलाव के समय परिवार या साझी सम्पत्ति से सहारा।',
      givesEn: 'Deep interest in spirituality, research and hidden knowledge; support from family or shared resources in times of change.',
      careHi: 'लाभ देर से या दूसरों के माध्यम से आ सकता है — धैर्य रखें, और साझे धन के मामले स्पष्ट रखें।',
      careEn: 'Gains can come late or through others — be patient, and keep shared money matters clear.',
    },
    {
      givesHi: 'सबसे शुभ स्थितियों में से एक: भाग्य, श्रद्धा, अच्छे गुरु, सम्मानित पिता और उच्च शिक्षा में सफलता।',
      givesEn: 'One of the most blessed placements: fortune, faith, good teachers, a respected father and success in higher learning.',
      careHi: 'आशीर्वाद बाँटने से बढ़ते हैं — उदार रहें और साधना नियमित रखें।',
      careEn: 'Blessings grow when shared — stay generous and keep your practice regular.',
    },
    {
      givesHi: 'काम में सम्मान और ईमानदार साख; अध्यापन, कानून, वित्त, सलाह या धार्मिक कामों में सफलता।',
      givesEn: 'Respect at work and an honest name; success in teaching, law, finance, advisory or religious work.',
      careHi: 'यहाँ नैतिकता ही आपकी ताक़त है — जल्दी आगे बढ़ने के लिए सिद्धांत कभी न छोड़ें।',
      careEn: 'Your ethics are your strength here — never trade principles for quick advancement.',
    },
    {
      givesHi: 'भरपूर लाभ, अच्छे मित्र और मार्गदर्शक, और इच्छाओं की पूर्ति; समझदार संपर्कों से आमदनी बढ़ती है।',
      givesEn: 'Plentiful gains, good friends and mentors, and wishes fulfilled; income grows through wise contacts.',
      careHi: 'धन का सदुपयोग सबसे अच्छा है — लाभ का कुछ भाग दान में दें।',
      careEn: 'Wealth is best used well — give part of your gains in daan.',
    },
    {
      givesHi: 'आध्यात्मिक, उदार स्वभाव; अच्छे कामों और तीर्थ पर खर्च, और दूर देशों या शांत अध्ययन से उन्नति।',
      givesEn: 'A spiritual, generous nature; spending on good causes and pilgrimage, and growth through faraway places or quiet study.',
      careHi: 'खर्च आमदनी से आगे निकल सकता है — दिल खोलकर दें, पर समझदारी से योजना बनाएँ।',
      careEn: 'Spending can run ahead of income — give freely, but plan wisely.',
    },
  ],
  venus: [
    {
      givesHi: 'आकर्षण, सुंदर व्यक्तित्व और कलात्मक, सौम्य स्वभाव; लोग आपका साथ पसंद करते हैं।',
      givesEn: 'Charm, a pleasing presence and an artistic, graceful nature; people enjoy your company.',
      careHi: 'सुख का प्रेम भोग-विलास में बदल सकता है — आनंद में संतुलन रखें।',
      careEn: 'A love of comfort can slide into indulgence — keep balance in pleasures.',
    },
    {
      givesHi: 'मधुर वाणी, अच्छा भोजन, सुखी पारिवारिक जीवन, और कला, सौन्दर्य या विलास की वस्तुओं से धन।',
      givesEn: 'Sweet speech, good food, a happy family life, and wealth through art, beauty or fine goods.',
      careHi: 'विलासिता पर खर्च बढ़ सकता है — आनंद लें, पर बचत बनाए रखें।',
      careEn: 'Spending on luxury can run high — enjoy, but keep your savings intact.',
    },
    {
      givesHi: 'लेखन, संगीत, डिज़ाइन या प्रस्तुति में कलात्मक प्रतिभा; भाई-बहनों और पड़ोसियों से मधुर संबंध।',
      givesEn: 'Artistic talent in writing, music, design or performance; warm ties with siblings and neighbours.',
      careHi: 'आराम जोश कम कर सकता है — अपनी प्रतिभा के साथ नियमित अभ्यास जोड़ें।',
      careEn: 'Comfort can dull your drive — pair your talent with regular practice.',
    },
    {
      givesHi: 'सुंदर, आरामदायक घर, वाहन, स्नेही माँ और संतुष्ट मन।',
      givesEn: 'A beautiful, comfortable home, vehicles, a loving mother and a contented heart.',
      careHi: 'घर का सुख आशीर्वाद है — इसे बाहर निकलकर आगे बढ़ने में रुकावट न बनने दें।',
      careEn: 'Comfort at home is a blessing — do not let it keep you from stepping out to grow.',
    },
    {
      givesHi: 'रचनात्मकता, कलात्मक बुद्धि, और प्रेम, मनोरंजन व संतान से आनंद।',
      givesEn: 'Creativity, artistic intelligence, and joy through romance, entertainment and children.',
      careHi: 'प्रेम और आनंद पढ़ाई या कर्तव्यों से ध्यान हटा सकते हैं — प्राथमिकताएँ स्पष्ट रखें।',
      careEn: 'Romance and pleasure can pull attention from studies or duties — keep priorities clear.',
    },
    {
      givesHi: 'सेवा, आतिथ्य, डिज़ाइन या सौन्दर्य से जुड़े कामों में कुशलता; सहकर्मियों से अच्छी निभती है।',
      givesEn: 'Skill in service, hospitality, design or beauty-related work; you get on well with colleagues.',
      careHi: 'रिश्ते काम की उलझनों से मिल सकते हैं — निजी और कामकाजी मामले अलग रखें, और अति-भोग से बचें।',
      careEn: 'Relationships can get tangled with work troubles — keep personal and work matters apart, and avoid overindulgence.',
    },
    {
      givesHi: 'आकर्षक, प्रेमी जीवनसाथी और सुखद वैवाहिक जीवन; साझेदारी, कला, फ़ैशन या व्यापार में सफलता।',
      givesEn: 'An attractive, loving partner and a pleasant married life; success in partnerships, art, fashion or trade.',
      careHi: 'प्रेम से अपेक्षाएँ बहुत ऊँची हो सकती हैं — जीवनसाथी को जैसे हैं वैसे सराहें।',
      careEn: 'Romantic expectations can run high — appreciate your partner as they are.',
    },
    {
      givesHi: 'जीवनसाथी, विरासत या साझी सम्पत्ति से लाभ, और गूढ़ कलाओं व रहस्य-विद्या में रुचि।',
      givesEn: 'Gains through a partner, inheritance or shared resources, and interest in hidden arts and mysticism.',
      careHi: 'साझे धन और निजी संबंधों को ईमानदार और स्पष्ट रखें; रिश्तों में छिपाव से बचें।',
      careEn: 'Keep shared money and close relationships honest and clear; avoid secrecy between you.',
    },
    {
      givesHi: 'कला, संबंधों और यात्रा से भाग्य; संगीत, सौन्दर्य या सेवा के माध्यम से भक्ति।',
      givesEn: 'Fortune through art, relationships and travel; devotion expressed through music, beauty or seva.',
      careHi: 'आराम श्रद्धा को उथला न बनाए — अपनी साधना में कुछ सरल अनुशासन रखें।',
      careEn: 'Do not let comfort make faith shallow — keep some simple discipline in your practice.',
    },
    {
      givesHi: 'कला, मीडिया, फ़ैशन, सौन्दर्य, आतिथ्य या विलास से जुड़े करियर में सफलता और सम्मान; मधुर साख।',
      givesEn: 'Success and grace in careers in art, media, fashion, beauty, hospitality or fine goods; a pleasant name.',
      careHi: 'आकर्षण दरवाज़े खोलता है — उसके साथ लगातार मेहनत भी जोड़ें।',
      careEn: 'Charm opens doors — back it with steady hard work.',
    },
    {
      givesHi: 'अच्छा लाभ, सुख-सुविधा, और कलात्मक या प्रभावशाली लोगों से मित्रता; सुख की इच्छाएँ पूरी होती हैं।',
      givesEn: 'Good gains, comforts, and friendships with artistic or influential people; wishes for comfort come true.',
      careHi: 'आनंद पर खर्च करें, पर मित्रता को उपहारों से न तौलें।',
      careEn: 'Spend on joy, but do not measure friendship by gifts.',
    },
    {
      givesHi: 'सुख-सुविधा, यात्रा और विदेश का आनंद; देने वाला, भक्ति भरा मन।',
      givesEn: 'Enjoyment of comforts, travel and foreign places; a giving, devotional heart.',
      careHi: 'भोग-विलास पर खर्च बढ़ सकता है — आनंद लें, पर सीमा तय करें।',
      careEn: 'Spending on pleasures can run high — enjoy, but set limits.',
    },
  ],
  saturn: [
    {
      givesHi: 'गंभीर, धैर्यवान और ज़िम्मेदार स्वभाव; आप धीरे पर मज़बूती से बनाते हैं, और उम्र के साथ और दृढ़ होते हैं।',
      givesEn: 'A serious, patient and responsible nature; you build slowly but solidly, and grow firmer with the years.',
      careHi: 'निराशा और अकेलापन घर कर सकता है — लोगों से जुड़े रहें और स्वयं पर बहुत कठोर न हों।',
      careEn: 'Gloom and loneliness can creep in — stay connected with people and do not be too hard on yourself.',
    },
    {
      givesHi: 'अनुशासन से धीरे-धीरे बढ़ती बचत; नपी-तुली, सच्ची वाणी।',
      givesEn: 'Savings that grow slowly through discipline; measured, truthful speech.',
      careHi: 'पारिवारिक जीवन या आमदनी कभी-कभी सीमित लग सकती है — धैर्य रखें और कठोर शब्दों से बचें।',
      careEn: 'Family life or income can feel tight at times — be patient and avoid harsh words.',
    },
    {
      givesHi: 'भरपूर लगन और स्थिर साहस; लंबी, कड़ी मेहनत और तकनीकी या हाथ के कौशल से सफलता।',
      givesEn: 'Great persistence and steady courage; success through long, hard effort and technical or hands-on skill.',
      careHi: 'भाई-बहनों से संबंध दूर लग सकते हैं — पास रहने के लिए पहल आप करें।',
      careEn: 'Ties with siblings can feel distant — make the first move to stay close.',
    },
    {
      givesHi: 'मेहनत से धीरे-धीरे बनी ज़मीन-जायदाद और स्थिरता; घर के प्रति गंभीर कर्तव्य-भाव।',
      givesEn: 'Property and stability built slowly through hard work; a serious sense of duty toward home.',
      careHi: 'घर का जीवन भारी या केवल कर्तव्य जैसा लग सकता है — आनंद के लिए जगह बनाएँ और माँ से जुड़ाव मधुर रखें।',
      careEn: 'Home life can feel heavy or all duty — make room for joy and keep your bond with your mother warm.',
    },
    {
      givesHi: 'गंभीर, गहरे विचारक; अनुशासित, व्यावहारिक या लंबी अवधि की पढ़ाई में सफलता।',
      givesEn: 'A serious, deep thinker; success in disciplined, practical or long-term studies.',
      careHi: 'पढ़ाई और रचनात्मक योजनाएँ धीमी चल सकती हैं — धैर्य और नियमित प्रयास से फल मिलता है।',
      careEn: 'Studies and creative plans can move slowly — patience and regular effort bring results.',
    },
    {
      givesHi: 'शनि के लिए मज़बूत स्थान: आप प्रतियोगिता में टिके रहते हैं, कड़ा काम सँभालते हैं, और सेवा, कानून, श्रम या प्रशासन में सफल होते हैं।',
      givesEn: 'A strong seat for Saturn: you outlast competition, handle hard work and succeed in service, law, labour or administration.',
      careHi: 'काम को ही पूरा जीवन न बनने दें — विश्राम और कर्मचारियों से उचित व्यवहार ज़रूरी है।',
      careEn: 'Do not let work become your whole life — rest, and fair treatment of the people who work with you, matter.',
    },
    {
      givesHi: 'परिपक्व, वफ़ादार और ज़िम्मेदार जीवनसाथी; समय के साथ टिकने वाली साझेदारी।',
      givesEn: 'A mature, loyal and responsible partner; partnerships that last through time.',
      careHi: 'रिश्ते गंभीर या धीरे-धीरे खुलने वाले लग सकते हैं — धैर्य और साझा ज़िम्मेदारी उन्हें मज़बूत बनाते हैं।',
      careEn: 'Relationships can feel serious or slow to warm — patience and shared duty make them strong.',
    },
    {
      givesHi: 'लंबी चुनौतियों में टिके रहने का बल, और शोध, इतिहास या गहरी साधना में रुचि।',
      givesEn: 'The endurance to see long challenges through, and interest in research, history or deep spiritual discipline.',
      careHi: 'बदलाव के साथ देरी और भारी ज़िम्मेदारियाँ आ सकती हैं — धैर्य, ईमानदारी और नियमित दिनचर्या रखें।',
      careEn: 'Change can bring delays and heavy duties — keep patience, honesty and a regular routine.',
    },
    {
      givesHi: 'अनुशासित, व्यावहारिक श्रद्धा और परम्परा के प्रति आदर; कर्तव्य से धीरे-धीरे बनता भाग्य।',
      givesEn: 'A disciplined, practical faith and respect for tradition; fortune that builds slowly through duty.',
      careHi: 'भाग्य धीमा लग सकता है — श्रद्धा न छोड़ें, और पिता व गुरुओं का आदर बनाए रखें।',
      careEn: 'Fortune can seem slow — do not give up faith, and keep respect for your father and teachers.',
    },
    {
      givesHi: 'मेहनत और ज़िम्मेदारी से टिकाऊ सफलता; करियर में आप स्थिरता से ऊपर उठते हैं और सम्मान कमाते हैं।',
      givesEn: 'Lasting success through hard work and responsibility; you rise steadily in your career and earn respect.',
      careHi: 'उन्नति धीमी और मेहनत से कमाई हुई होती है — ईमानदार रहें; शनि ईमानदारी का फल देता है और शॉर्टकट को सुधारता है।',
      careEn: 'The rise is slow and earned — stay honest; Saturn rewards integrity and corrects shortcuts.',
    },
    {
      givesHi: 'स्थिर, टिकाऊ लाभ जो समय के साथ बढ़ता है; वफ़ादार, बड़े या अनुभवी मित्र।',
      givesEn: 'Steady, lasting gains that grow with time; loyal, older or experienced friends.',
      careHi: 'लाभ धीरे आता है — शॉर्टकट से धैर्य बेहतर है।',
      careEn: 'Gains come slowly — patience beats shortcuts.',
    },
    {
      givesHi: 'एकांत, सेवा और आध्यात्मिक अनुशासन की ओर खिंचाव; दूर-दराज़ या संस्थाओं में काम के लिए अच्छा।',
      givesEn: 'A pull toward solitude, service and spiritual discipline; good for work in faraway places or institutions.',
      careHi: 'खर्च और अकेलापन भारी पड़ सकते हैं — दूसरों की सेवा करें और अनुशासित दिनचर्या रखें।',
      careEn: 'Expenses and loneliness can weigh on you — serve others and keep a disciplined routine.',
    },
  ],
  rahu: [
    {
      givesHi: 'बड़ी महत्वाकांक्षाओं वाला साहसी, अलग तरह का व्यक्तित्व; आप भीड़ में अलग दिखते हैं और जल्दी ध्यान खींचते हैं।',
      givesEn: 'A bold, unconventional personality with big ambitions; you stand out in a crowd and draw attention easily.',
      careHi: 'अपनी पहचान को लेकर उलझन और बेचैन इच्छाएँ भटका सकती हैं — सरल मूल्यों से जुड़े रहें।',
      careEn: 'Confusion about who you are and restless desires can mislead — stay rooted in simple values.',
    },
    {
      givesHi: 'असामान्य स्रोतों, विदेशी संपर्कों या तकनीक से लाभ; प्रभावशाली ढंग से बोलने की कला।',
      givesEn: 'Gains from unusual sources, foreign contacts or technology; a persuasive way of speaking.',
      careHi: 'बढ़ा-चढ़ाकर कहने और जल्दी पैसे के विचारों से सावधान रहें; परिवार में बात ईमानदार रखें।',
      careEn: 'Be careful with exaggeration and quick-money ideas; keep talk within the family honest.',
    },
    {
      givesHi: 'राहु के लिए अच्छा स्थान: निडर प्रयास, और मीडिया, तकनीक, मार्केटिंग व साहसी कामों में सफलता।',
      givesEn: 'A good seat for Rahu: fearless effort, and success in media, technology, marketing and bold ventures.',
      careHi: 'साहस एक वरदान है — इसे नैतिकता के साथ प्रयोग करें, और भाई-बहनों से अच्छे संबंध रखें।',
      careEn: 'Courage is a gift — use it with ethics, and keep good ties with your siblings.',
    },
    {
      givesHi: 'नई या दूर की जगहों पर घर या जायदाद के अवसर, और आधुनिक साधनों से सुख-सुविधा।',
      givesEn: 'Chances of a home or property in new or faraway places, and comforts through modern means.',
      careHi: 'भीतरी बेचैनी और घर के बदलाव शांति भंग कर सकते हैं — माँ के साथ और घर पर शांत समय बिताएँ।',
      careEn: 'Inner restlessness and moves of home can disturb peace — spend calm time with your mother and at home.',
    },
    {
      givesHi: 'अलग तरह का, आविष्कारशील मन; तकनीक, शोध या असामान्य विषयों में रुचि।',
      givesEn: 'An unconventional, inventive mind; interest in technology, research or unusual subjects.',
      careHi: 'पढ़ाई में शॉर्टकट और प्रेम में जल्दबाज़ी वाले फ़ैसलों में सावधानी रखें — लंबी अवधि का सोचें।',
      careEn: 'Take care with shortcuts in studies and hasty choices in romance — think long-term.',
    },
    {
      givesHi: 'राहु के लिए अच्छा स्थान: आप विरोधियों और बाधाओं को चतुराई से पार करते हैं, और प्रतियोगी क्षेत्रों में अच्छा करते हैं।',
      givesEn: 'A good seat for Rahu: you get past rivals and obstacles cleverly, and do well in competitive fields.',
      careHi: 'किसी भी तरह जीतना असली जीत नहीं — न्यायपूर्ण रहें और दिनचर्या स्थिर रखें।',
      careEn: 'Winning by any means is not winning — stay fair and keep your routine steady.',
    },
    {
      givesHi: 'अलग पृष्ठभूमि वाले जीवनसाथी या साथी; विदेशी या असामान्य साझेदारियों से लाभ।',
      givesEn: 'A partner or associates from a different background; gains through foreign or unusual partnerships.',
      careHi: 'रिश्तों में गलतफ़हमियाँ हो सकती हैं — अपेक्षाएँ व्यावहारिक रखें और बातचीत पारदर्शी रखें।',
      careEn: 'Misunderstandings can arise in relationships — keep expectations realistic and conversations open.',
    },
    {
      givesHi: 'छिपे विषयों, शोध, गूढ़ विद्या या तकनीक में रुचि; अचानक लाभ की संभावना।',
      givesEn: 'Interest in hidden subjects, research, the occult or technology; the chance of sudden gains.',
      careHi: 'अचानक उतार-चढ़ाव सावधानी माँगते हैं — गुप्त लेन-देन और जल्दबाज़ी के जोखिम से बचें।',
      careEn: 'Sudden ups and downs ask for care — avoid secretive dealings and hasty risks.',
    },
    {
      givesHi: 'विदेशी संस्कृतियों, नए दर्शन और लंबी यात्राओं में रुचि; अलग राहों से भाग्य।',
      givesEn: 'Interest in foreign cultures, new philosophies and long journeys; fortune through unconventional paths.',
      careHi: 'परम्परा पर संदेह या गुरुओं से टकराव हो सकता है — आदर के साथ प्रश्न करें।',
      careEn: 'Doubts about tradition or clashes with teachers can arise — ask your questions with respect.',
    },
    {
      givesHi: 'प्रबल महत्वाकांक्षा और करियर में उन्नति, अक्सर तकनीक, विदेशी संपर्क, राजनीति या बड़ी संस्थाओं के माध्यम से।',
      givesEn: 'Strong ambition and a rise in career, often through technology, foreign contacts, politics or large organisations.',
      careHi: 'प्रसिद्धि जल्दी आ सकती है — तरीके साफ़ रखें ताकि वह टिके।',
      careEn: 'Fame can come fast — keep your methods clean so that it lasts.',
    },
    {
      givesHi: 'राहु की सबसे अच्छी जगहों में से एक: बड़ा लाभ, बड़ा संपर्क-जाल और बड़ी इच्छाओं की पूर्ति।',
      givesEn: 'One of Rahu’s best seats: large gains, a wide network and big wishes fulfilled.',
      careHi: 'इच्छाएँ बढ़ती रह सकती हैं — जानें कि कब पर्याप्त है, और मित्र सावधानी से चुनें।',
      careEn: 'Desires can keep growing — know when enough is enough, and choose friends with care.',
    },
    {
      givesHi: 'विदेश और यात्रा से जुड़ाव, और आध्यात्मिकता या छिपे विषयों में रुचि।',
      givesEn: 'Links with foreign lands and travel, and interest in spirituality or hidden matters.',
      careHi: 'छिपे खर्च बढ़ सकते हैं — फ़िज़ूलखर्ची से बचें और प्रार्थना से मन शांत रखें।',
      careEn: 'Hidden expenses can grow — avoid wasteful spending and keep the mind calm with prayer.',
    },
  ],
  ketu: [
    {
      givesHi: 'अंतर्ज्ञानी, आध्यात्मिक और स्वतंत्र स्वभाव; आप सतह के पार देखते हैं।',
      givesEn: 'An intuitive, spiritual and independent nature; you see beneath the surface.',
      careHi: 'स्वयं को लेकर असमंजस या विरक्ति महसूस हो सकती है — लोगों और रोज़ के कर्तव्यों से जुड़े रहें।',
      careEn: 'You can feel unsure of yourself or detached — stay engaged with people and daily duties.',
    },
    {
      givesHi: 'सादी पसंद और धन के प्रति विरक्त दृष्टि; ऐसे शब्द जिनमें आध्यात्मिक गहराई हो सकती है।',
      givesEn: 'Simple tastes and a detached view of wealth; words that can carry spiritual depth.',
      careHi: 'बचत और वाणी पर ध्यान चाहिए — सोचकर बोलें और धन-व्यवस्था व्यवस्थित रखें।',
      careEn: 'Savings and speech need attention — think before you speak and keep your money matters organised.',
    },
    {
      givesHi: 'केतु के लिए अच्छा स्थान: शांत साहस, तेज़ अंतःप्रेरणा और अपने बल पर किए प्रयास से सफलता।',
      givesEn: 'A good seat for Ketu: quiet courage, sharp instincts and success through your own independent effort.',
      careHi: 'भाई-बहनों और पड़ोसियों से संपर्क बनाए रखें — विरक्ति को दूरी न बनने दें।',
      careEn: 'Stay in touch with siblings and neighbours — do not let detachment turn into distance.',
    },
    {
      givesHi: 'भीतरी विरक्ति और आध्यात्मिक जड़ों में रुचि; घर साधना का स्थान बन सकता है।',
      givesEn: 'Inner detachment and interest in spiritual roots; your home can become a place of practice.',
      careHi: 'घर में बेचैनी या सुखों से दूरी महसूस हो सकती है — माँ की देखभाल करें और प्रार्थना के लिए एक शांत कोना बनाएँ।',
      careEn: 'You can feel restless at home or distant from comforts — care for your mother and make a quiet corner for prayer.',
    },
    {
      givesHi: 'गहरा अंतर्ज्ञान, और मंत्र, आध्यात्मिकता व शोध में रुचि; पुरानी सीख से अंतर्दृष्टि।',
      givesEn: 'Deep intuition, and interest in mantra, spirituality and research; insight from earlier learning.',
      careHi: 'पढ़ाई बिखरी हुई लग सकती है — नियमित दिनचर्या और गुरु का मार्गदर्शन मदद करते हैं।',
      careEn: 'Studies can feel scattered — a regular routine and a teacher’s guidance help.',
    },
    {
      givesHi: 'केतु के लिए अच्छा स्थान: आप विरोधियों और बाधाओं को चुपचाप पार करते हैं, और सेवा या देखभाल के कामों में अच्छा करते हैं।',
      givesEn: 'A good seat for Ketu: you quietly get past rivals and obstacles, and do well in service or caring work.',
      careHi: 'रोज़ के छोटे कामों को अनदेखा न करें — नियमित दिनचर्या सब कुछ सहज रखती है।',
      careEn: 'Do not neglect small daily tasks — a regular routine keeps things smooth.',
    },
    {
      givesHi: 'आध्यात्मिक झुकाव वाले या अलग तरह के जीवनसाथी; ऐसे रिश्ते जो विरक्ति और गहरे मूल्य सिखाते हैं।',
      givesEn: 'A spiritually inclined or unusual partner; relationships that teach detachment and deeper values.',
      careHi: 'कभी-कभी जीवनसाथी दूर लग सकते हैं — अपनी परवाह खुलकर जताएँ और पीछे न हटें।',
      careEn: 'Your partner can seem distant at times — show your care openly and do not withdraw.',
    },
    {
      givesHi: 'प्रबल अंतर्ज्ञान, और रहस्य-विद्या, शोध व आध्यात्मिक परिवर्तन में रुचि।',
      givesEn: 'Strong intuition, and interest in mysticism, research and spiritual transformation.',
      careHi: 'अचानक बदलाव आपको अस्थिर कर सकते हैं — श्रद्धा, दिनचर्या और साझे धन की स्पष्टता बनाए रखें।',
      careEn: 'Sudden changes can unsettle you — hold on to faith, routine and clarity in shared money.',
    },
    {
      givesHi: 'कर्मकांड से आगे गहरी, निजी आध्यात्मिकता; दर्शन और तीर्थ में रुचि।',
      givesEn: 'A deep, personal spirituality beyond ritual; interest in philosophy and pilgrimage.',
      careHi: 'आप गुरुओं या परम्परा पर प्रश्न कर सकते हैं — खोजते हुए भी विनम्रता और आदर रखें।',
      careEn: 'You may question teachers or tradition — keep humility and respect while you search.',
    },
    {
      givesHi: 'विरक्ति और कौशल से किया गया काम; तकनीकी, शोध या आध्यात्मिक क्षेत्रों में सफलता।',
      givesEn: 'Work done with skill and detachment; success in technical, research or spiritual fields.',
      careHi: 'करियर की दिशा अचानक बदल सकती है — कौशल पैने रखें और बीच में रुचि न खोएँ।',
      careEn: 'Career direction can change suddenly — keep your skills sharp and do not lose interest midway.',
    },
    {
      givesHi: 'अचानक आने वाला लाभ और कुछ सच्चे मित्र; सरल और आध्यात्मिक इच्छाएँ।',
      givesEn: 'Gains that arrive unexpectedly and a few true friends; simple, spiritual wishes.',
      careHi: 'अपने मित्र-मंडल से दूर न हों — थोड़ा प्रयास अच्छी मित्रता बनाए रखता है।',
      careEn: 'Do not drift from your circle — a little effort keeps good friendships alive.',
    },
    {
      givesHi: 'आध्यात्मिकता के लिए केतु की सबसे अच्छी जगहों में से एक: ध्यान, एकांत, तीर्थ और भीतरी मुक्ति।',
      givesEn: 'One of Ketu’s best seats for spiritual life: meditation, retreat, pilgrimage and inner freedom.',
      careHi: 'व्यावहारिक काम और खर्च पर अब भी ध्यान चाहिए — आध्यात्मिक खिंचाव और रोज़ के कर्तव्यों में संतुलन रखें।',
      careEn: 'Practical tasks and expenses still need attention — balance the spiritual pull with daily duties.',
    },
  ],
};

/** The sign's strength, meaning first and the term after it. */
export const SIGN_STRENGTH: Readonly<Record<'exalted' | 'own' | 'debilitated' | 'friend' | 'neutral' | 'enemy' | 'node', Bilingual>> = {
  exalted: { hi: 'अपनी सबसे मज़बूत राशि (उच्च)', en: 'its strongest sign — exalted (uchcha)' },
  own: { hi: 'अपनी ही राशि, जैसे अपने घर में (स्वराशि)', en: 'its own sign — at home (swarashi)' },
  debilitated: { hi: 'अपनी सबसे कमज़ोर राशि (नीच)', en: 'its weakest sign — debilitated (neecha)' },
  friend: { hi: 'मित्र ग्रह की राशि (मित्र राशि)', en: 'a friendly sign (mitra rashi)' },
  neutral: { hi: 'सम राशि — न मित्र, न शत्रु', en: 'a neutral sign (sama rashi)' },
  enemy: { hi: 'शत्रु ग्रह की राशि (शत्रु राशि)', en: 'an unfriendly sign (shatru rashi)' },
  node: { hi: 'छाया ग्रह — इसका फल मुख्य रूप से भाव से पढ़ा जाता है', en: 'a shadow graha — read mainly through its house' },
};

export const RETROGRADE_NOTE: Bilingual = { hi: 'वक्री — उल्टी चाल में दिखता है', en: 'appears to move backwards (vakri)' };
export const COMBUST_NOTE: Bilingual = { hi: 'सूर्य के बहुत पास, इसलिए तेज मंद (अस्त)', en: 'very close to the Sun, so its light is dimmed (asta)' };

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
  /** The occupied house: `चतुर्थ भाव` / `4th house`. */
  houseHi: string;
  houseEn: string;
  /** The ruled houses that cast this vote, with their short life areas. */
  ruledHi: string;
  ruledEn: string;
  /** Whole degrees from the Sun (combustion only). */
  degreesFromSun: number;
};

/** One plain "why" line per vote — the card's reasons list. */
export const FACTOR_REASON: Readonly<Record<GrahaFactorId, (ctx: ReasonContext) => Bilingual>> = {
  'sign-exalted': () => ({
    hi: 'यह अपनी सबसे मज़बूत राशि (उच्च) में है, इसलिए अपने फल पूरे बल से देता है।',
    en: 'It sits in its strongest sign (uchcha), so it gives its results in full.',
  }),
  'sign-own': () => ({
    hi: 'यह अपनी ही राशि (स्वराशि) में है — अपने घर की तरह सहज।',
    en: 'It sits in its own sign (swarashi) — at home and at ease.',
  }),
  'sign-friend': () => ({
    hi: 'यह मित्र ग्रह की राशि (मित्र राशि) में है, इसलिए सहजता से काम करता है।',
    en: 'It sits in a friendly sign (mitra rashi), so it works with ease.',
  }),
  'sign-enemy': () => ({
    hi: 'यह शत्रु ग्रह की राशि (शत्रु राशि) में है, इसलिए इसके काम में अधिक प्रयास लगता है।',
    en: 'It sits in an unfriendly sign (shatru rashi), so its work takes more effort.',
  }),
  'sign-debilitated': () => ({
    hi: 'यह अपनी सबसे कमज़ोर राशि (नीच) में है, इसलिए इसके फल अतिरिक्त प्रयास से मिलते हैं।',
    en: 'It sits in its weakest sign (neecha), so its results come with extra effort.',
  }),
  'house-digbala': (ctx) => ({
    hi: `${ctx.grahaHi} को ${ctx.houseHi} में दिशा का बल (दिग्बल) मिलता है।`,
    en: `${ctx.grahaEn} gains directional strength (dig-bala) in the ${ctx.houseEn}.`,
  }),
  'house-gains': () => ({
    hi: 'एकादश भाव लाभ का घर है — यहाँ हर ग्रह कुछ न कुछ देता है।',
    en: 'The 11th house is the house of gains — every graha gives something here.',
  }),
  'house-benefic-strong': (ctx) => ({
    hi: `शुभ ग्रह कुंडली के मुख्य भावों (केन्द्र और त्रिकोण) में अच्छा फल देते हैं, और ${ctx.houseHi} उन्हीं में से एक है।`,
    en: `Kind planets (shubh graha) do well in the main houses of a chart (kendra and trikona), and the ${ctx.houseEn} is one of them.`,
  }),
  'house-malefic-growth': (ctx) => ({
    hi: `सख़्त स्वभाव के ग्रह (क्रूर ग्रह) मेहनत और बढ़त के भावों में अच्छा करते हैं, और ${ctx.houseHi} ऐसा ही भाव है — यहाँ इसका बल प्रगति में बदलता है।`,
    en: `Strict planets (krur graha) do well in houses of effort and growth, and the ${ctx.houseEn} is one — here its force turns into progress.`,
  }),
  'house-benefic-dusthana': (ctx) => ({
    hi: `${ctx.houseHi} चुनौतियों का भाव है, जहाँ शुभ ग्रह के फल धीरे मिलते हैं।`,
    en: `The ${ctx.houseEn} is a house of challenges, where a kind planet’s gifts come more slowly.`,
  }),
  'house-malefic-hidden': (ctx) => ({
    hi: `${ctx.houseHi} छिपे और खर्च कराने वाले विषयों का भाव है, इसलिए यहाँ सख़्त ग्रह के बल को सावधानी से सँभालना होता है।`,
    en: `The ${ctx.houseEn} holds hidden and draining matters, so a strict planet’s force needs careful handling here.`,
  }),
  'lord-lagna': () => ({
    hi: 'आपके लग्न के लिए यह लग्नेश है — स्वयं आपका ग्रह — इसलिए इसका बल आपका अपना बल है।',
    en: 'For your Lagna it is the Lagna lord — your own planet — so its strength is your own strength.',
  }),
  'lord-yogakaraka': (ctx) => ({
    hi: `आपके लग्न के लिए यह ${ctx.ruledHi} का स्वामी है — एक केन्द्र और एक त्रिकोण, यानी योगकारक: आपकी कुंडली का सबसे सहायक ग्रह।`,
    en: `For your Lagna it rules the ${ctx.ruledEn} — a pillar house and a blessing house together, a yogakaraka: the most helpful planet for your chart.`,
  }),
  'lord-trikona': (ctx) => ({
    hi: `आपके लग्न के लिए यह ${ctx.ruledHi} का स्वामी है — शुभ त्रिकोण भाव, इसलिए इसकी भूमिका सहायक है।`,
    en: `For your Lagna it rules the ${ctx.ruledEn} — a blessing house (trikona), so its role is a helpful one.`,
  }),
  'lord-demanding': (ctx) => ({
    hi: `आपके लग्न के लिए यह ${ctx.ruledHi} का स्वामी है — मेहनत माँगने वाले विषय, इसलिए इसे प्रयास चाहिए।`,
    en: `For your Lagna it rules the ${ctx.ruledEn} — areas that ask for effort, so it needs work from you.`,
  }),
  combust: (ctx) => ({
    hi: `यह सूर्य से लगभग ${ctx.degreesFromSun}° दूर है, इसलिए इसका तेज मंद (अस्त) है और इसे सहारे की ज़रूरत है।`,
    en: `It is about ${ctx.degreesFromSun}° from the Sun, so its light is dimmed (asta) and it needs support.`,
  }),
};

export const TONE_LABEL: Readonly<Record<KundaliGrahaTone, Bilingual>> = {
  supportive: { hi: 'सहायक', en: 'Helps you' },
  mixed: { hi: 'मिश्रित', en: 'Mixed' },
  care: { hi: 'ध्यान दें', en: 'Needs care' },
};

/** The label's one-line meaning; `quiet` is a mixed card that drew no vote. */
export const TONE_LINE: Readonly<Record<KundaliGrahaTone | 'quiet', Bilingual>> = {
  supportive: { hi: 'बल के सारे संकेत एक ही सहायक दिशा में हैं।', en: 'Every sign of strength points the same helpful way.' },
  mixed: { hi: 'कुछ संकेत सहारा देते हैं, कुछ सावधानी माँगते हैं — नीचे दोनों पंक्तियाँ पढ़ें।', en: 'Some signs help and some ask for care — read both lines below.' },
  quiet: { hi: 'किसी ओर विशेष झुकाव नहीं — यह ग्रह यहाँ शांत रूप से काम करता है।', en: 'No strong pull either way — this graha works quietly here.' },
  care: { hi: 'इसके बल के संकेत सावधानी माँगते हैं — नीचे का उपाय इसे संतुलित करने में सहायक है।', en: 'Its signs of strength ask for care — the practice below helps steady it.' },
};

export const UPAY_INTRO: Readonly<Record<'keep' | 'steady', Bilingual>> = {
  keep: { hi: 'इस बल को बनाए रखने के लिए', en: 'To keep this strength' },
  steady: { hi: 'इस ग्रह को संतुलित रखने के लिए', en: 'To steady this graha' },
};

export const MANTRA_COUNT: Bilingual = { hi: '108 बार (एक माला)', en: '108 times (one mala)' };

/** The section's own copy: what the cards are, how the label is counted, what an upaya is. */
export const GRAHA_SECTION_COPY = {
  eyebrow: { hi: 'नवग्रह', en: 'Nine grahas' },
  title: { hi: 'आपके नौ ग्रह, एक-एक करके', en: 'Your nine grahas, one by one' },
  body: [
    {
      hi: 'हर ग्रह जीवन के किसी एक हिस्से की देखभाल करता है। हर ग्रह के लिए यहाँ लिखा है कि वह आपकी कुंडली में कहाँ बैठा है, वहाँ कितना मज़बूत है, क्या देता है, कहाँ सावधानी चाहिए, और उसका एक सरल उपाय।',
      en: 'Each graha (planet) looks after one part of life. For each one, this shows where it sits in your chart, how strong it is there, what it gives, where to take care, and one simple practice (upay) for it.',
    },
    {
      hi: 'हर ग्रह का लेबल अनुमान से नहीं, गिनकर तय होता है — राशि, भाव, आपके लग्न के लिए उसकी भूमिका, और सूर्य से दूरी। सब संकेत सहारा दें तो ‘सहायक’, सब सावधानी माँगें तो ‘ध्यान दें’, और संकेत अलग-अलग हों तो ‘मिश्रित’।',
      en: 'Each label is counted, not guessed — from the sign, the house, the graha’s role for your Lagna, and its distance from the Sun. When every sign helps it reads ‘Helps you’, when every sign asks for care it reads ‘Needs care’, and when they differ it reads ‘Mixed’.',
    },
    {
      hi: 'उपाय मन को स्थिर रखने और अच्छी आदतें बनाने का अभ्यास है — कोई वादा या तुरंत हल नहीं।',
      en: 'An upay is a practice that steadies the mind and builds good habits — not a promise or an instant fix.',
    },
  ],
  snapshotLabel: { hi: 'ग्रह एक नज़र में', en: 'Grahas at a glance' },
  snapshotNone: { hi: 'सभी ग्रह मिश्रित — हर ग्रह का विवेचन देखें', en: 'All mixed — open each graha’s reading' },
} as const;

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
