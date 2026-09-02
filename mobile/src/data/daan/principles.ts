/**
 * The educate layer's verse/teaching spine (PRD-26 §10) — deliberately small:
 * Veda → Upanishad → Gita → Itihasa, plus the giver's-viveka teachings. New
 * verse content is limited to the short, universally attested Veda/Upanishad
 * rows; the Gita row deep-links into the bundled reader instead of duplicating
 * it. ⚠ `source` blocks are review-only provenance — never rendered.
 */
import type { DaanPrincipleEntry } from './types';

export const DAAN_PRINCIPLE_ENTRIES: readonly DaanPrincipleEntry[] = [
  {
    id: 'dana-sukta',
    titleHi: 'दान-सूक्त — बिना बाँटा अन्न व्यर्थ है',
    titleEn: 'The Dana Sukta — food unshared is gained in vain',
    verseLines: [
      'मोघमन्नं विन्दते अप्रचेताः',
      'सत्यं ब्रवीमि वध इत्स तस्य ।',
      'नार्यमणं पुष्यति नो सखायं',
      'केवलाघो भवति केवलादी ॥',
    ],
    iastLines: [
      'mogham annaṁ vindate apracetāḥ',
      'satyaṁ bravīmi vadha it sa tasya ·',
      'nāryamaṇaṁ puṣyati no sakhāyaṁ',
      'kevalāgho bhavati kevalādī',
    ],
    citeHi: 'ऋग्वेद १०.११७.६',
    citeEn: 'Ṛgveda 10.117.6',
    meaningHi:
      'जो समझ रखते हुए भी नहीं बाँटता, उसका अन्न व्यर्थ जाता है — जो अकेला खाता है, वह केवल दोष ही खाता है। दान कृपा नहीं, धर्म है: अन्न पाने का अर्थ ही उसे बाँटना है।',
    meaningEn:
      'One who, though able, does not share, gains food in vain — the one who eats alone eats only sin. Giving is not a favour but dharma: to receive food is already a call to share it.',
    status: 'verified',
    source: {
      referenceUrls: [
        'https://www.wisdomlib.org/hinduism/book/rig-veda-english-translation/d/doc839964.html',
        'https://sri-aurobindo.co.in/workings/matherials/rigveda/10/10-117.htm',
      ],
      verificationNote:
        '2026-09-01: verse text and sense checked against both published translations (Wilson/wisdomlib and the Sri Aurobindo workings text); "mogham annam vindate apracetah / kevalagho bhavati kevaladi" concordant.',
    },
  },
  {
    id: 'shraddhaya-deyam',
    titleHi: 'श्रद्धया देयम् — कैसे दें',
    titleEn: 'Shraddhaya deyam — how to give',
    verseLines: [
      'श्रद्धया देयम् । अश्रद्धया अदेयम् ।',
      'श्रिया देयम् । ह्रिया देयम् ।',
      'भिया देयम् । संविदा देयम् ॥',
    ],
    iastLines: [
      'śraddhayā deyam · aśraddhayā adeyam ·',
      'śriyā deyam · hriyā deyam ·',
      'bhiyā deyam · saṁvidā deyam',
    ],
    citeHi: 'तैत्तिरीय उपनिषद् १.११.३',
    citeEn: 'Taittirīya Upaniṣad 1.11.3',
    meaningHi:
      'श्रद्धा से दो; बिना श्रद्धा के मत दो। अपने सामर्थ्य के अनुसार दो। विनम्रता से दो — लेने वाले को छोटा मत समझो। संकोच सहित दो, और समझ के साथ दो। मात्रा नहीं, भाव मापदण्ड है।',
    meaningEn:
      'Give with faith; never without faith. Give according to your means. Give with humility — never looking down on the receiver. Give with awe, and give with understanding. The measure is bhaav, never the amount.',
    status: 'verified',
    source: {
      referenceUrls: [
        'https://shlokam.org/texts/taittiriya-1-11-3/',
        'https://culturalsamvaad.com/thought/on-giving-taittiriya-upanishad-%E0%A4%B6%E0%A5%8D%E0%A4%B0%E0%A4%A6%E0%A5%8D%E0%A4%A7%E0%A4%AF%E0%A4%BE-%E0%A4%A6%E0%A5%87%E0%A4%AF%E0%A4%AE%E0%A5%8D%E0%A5%A4-%E0%A4%85%E0%A4%B6%E0%A5%8D%E0%A4%B0/',
      ],
      verificationNote:
        '2026-09-01: verse text (śraddhayā/śriyā/hriyā/bhiyā/saṁvidā deyam) and the six-clause reading checked against both pages; concordant with the Śāṅkara-bhāṣya reading on shlokam.org.',
    },
  },
  {
    id: 'sattvik-daan',
    titleHi: 'सात्त्विक दान — देश, काल और पात्र',
    titleEn: 'Sattvik daan — place, time and patra',
    verseLines: [
      'दातव्यमिति यद्दानं दीयतेऽनुपकारिणे।',
      'देशे काले च पात्रे च तद्दानं सात्त्विकं स्मृतम्।।',
    ],
    iastLines: [
      "dātavyam iti yad dānaṁ dīyate 'nupakāriṇe",
      'deśhe kāle cha pātre cha tad dānaṁ sāttvikaṁ smṛitam',
    ],
    citeHi: 'श्रीमद्भगवद्गीता १७.२०',
    citeEn: 'Bhagavad Gītā 17.20',
    meaningHi:
      '"देना कर्तव्य है" — इस भाव से, प्रत्युपकार की आशा के बिना, उचित देश, काल और पात्र को दिया गया दान सात्त्विक कहा गया है। आगे के दो श्लोक राजसिक और तामसिक दान बताते हैं — reader में पूरा प्रसंग है।',
    meaningEn:
      'The gift given as a duty, to one who can make no return, at the right place and time and to a worthy patra — that daan is called sattvik. The next two verses name the rajasik and tamasik gifts; the full passage is in the reader.',
    gitaRef: { chapter: 17, verseIndex: 19 },
    status: 'verified',
    source: {
      referenceUrls: [
        'mobile/src/data/gita/chapter-17.json (bundled, verse bg-17-20)',
        'https://www.gitasupersite.iitk.ac.in/srimad?language=dv&field_chapter_value=17&field_nsutra_value=20',
      ],
      verificationNote:
        '2026-09-01: Devanagari and transliteration copied verbatim from the app’s own verified Gita bundle (bg-17-20); external cross-check against Gita Supersite ch.17 v.20.',
    },
  },
  {
    id: 'anna-daan-supremacy',
    titleHi: 'अन्न-दान सर्वोपरि क्यों',
    titleEn: 'Why anna-daan comes first',
    citeHi: 'महाभारत · अनुशासन (दानधर्म) पर्व',
    citeEn: 'Mahābhārata · Anuśāsana (Dāna-dharma) Parva',
    meaningHi:
      'शरशय्या पर भीष्म युधिष्ठिर से दान-धर्म कहते हैं — अन्न-दान से बड़ा कोई दान नहीं, क्योंकि प्राणी अन्न से ही जन्मते और अन्न से ही जीते हैं। इसीलिए हर दान-सूची में अन्न पहले आता है, और दान-द्वार में अन्नक्षेत्र पहले।',
    meaningEn:
      'From the bed of arrows, Bhīṣma teaches Yudhiṣṭhira the dharma of giving — no gift is greater than anna-daan, for beings are born of food and live by food. This is why anna leads every occasion list, and anna-kshetras lead the directory.',
    status: 'verified',
    source: {
      referenceUrls: [
        'https://www.wisdomlib.org/hinduism/essay/annadatri-carita-study/d/doc1187478.html',
        'https://sacred-texts.com/hin/m13/m13a022.htm',
      ],
      verificationNote:
        '2026-09-01: the Anuśāsana-parva annadana teaching (greatness of food-gift, beings born of and sustained by anna) checked as a summary against the wisdomlib essay and the Ganguli translation; ships as teaching summary with citation, no verse transcription.',
    },
  },
  {
    id: 'gupt-daan',
    titleHi: 'गुप्त दान',
    titleEn: 'Gupt daan — the unannounced gift',
    citeHi: 'परम्परा-वचन',
    citeEn: 'The tradition',
    meaningHi:
      'परम्परा उस दान को सबसे ऊँचा कहती है जो बिना बताए दिया जाए — जिसका उल्लेख देने वाला स्वयं भी न करे। इसीलिए इस खाते में "गुप्त" पहला विकल्प है: केवल तिथि दर्ज होती है, राशि-विवरण-पात्र कुछ नहीं।',
    meaningEn:
      'Tradition holds the unannounced gift highest — the one the giver never mentions, even to themselves. That is why "gupt" is a first-class mode in this ledger: only the tithi is recorded, never amount, detail or recipient.',
    status: 'verified',
    source: {
      referenceUrls: [
        'https://www.wisdomlib.org/definition/gupta-dana',
        'https://shlokam.org/texts/taittiriya-1-11-3/',
      ],
      verificationNote:
        '2026-09-01: stated as the traditional convention (gupta-dāna as the higher mode), anchored to hriyā deyam (give with humility/modesty) in TU 1.11.3; no fruit-claims made.',
    },
  },
  {
    id: 'dasa-dana',
    titleHi: 'दश-दान',
    titleEn: 'The ten traditional danas',
    citeHi: 'स्मृति-परम्परा',
    citeEn: 'Smṛti tradition',
    meaningHi:
      'स्मृति-ग्रन्थ दस महादानों की सूची देते हैं — गौ, भूमि, तिल, स्वर्ण, घृत, वस्त्र, धान्य, गुड़, रजत, लवण — पर सूची स्रोत-भेद से बदलती है।',
    meaningEn:
      'The smṛti texts enumerate ten great danas — go, bhūmi, tila, gold, ghee, cloth, grain, jaggery, silver, salt — but the list varies across sources.',
    status: 'draft',
    source: {
      referenceUrls: ['https://www.wisdomlib.org/definition/dashadana'],
      verificationNote:
        '2026-09-01: DRAFT — the daśa-dāna enumeration is regionally split (source lists disagree on 2–3 items); needs a second concordant source naming one list, or ships with the variance stated. Invisible until then (RULEBOOK §24 draft rule).',
      variantNote: 'Lists differ across Garuḍa-purāṇa-linked and regional smṛti traditions.',
    },
  },
];

export function getDaanPrinciples(): readonly DaanPrincipleEntry[] {
  return DAAN_PRINCIPLE_ENTRIES.filter((entry) => entry.status === 'verified');
}
