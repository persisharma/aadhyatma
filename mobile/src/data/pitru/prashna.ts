/**
 * प्रश्नोत्तर — the honest answers of पितृ पक्ष परिचय (PRD-44 §5.5).
 *
 * Every verified answer rests on one of the three rungs of the §28.4 ladder:
 * the bundled corpus, the shipped engine, or the 2026-08-19 dossier. The
 * stance rules of RULEBOOK §28.1 apply hardest here: no prescription, no fear,
 * no auspicious/forbidden verdicts on the fortnight. A question the opened
 * sources do not answer is either absent, or present as a draft that says what
 * has to be opened. ⚠ `source` blocks are review-only provenance.
 */
import type { PitruPrashnaEntry } from './types';

const DHARMA_SINDHU_SHRADDHA =
  'https://www.kamakoti.org/kamakoti/dharmasindhu/bookview.php?chapnum=26';
const DRIK_SHRADDHA_DATES =
  'https://www.drikpanchang.com/shraddha/pitru-paksha-shraddha-dates.html';
const DRIK_SHRADDHA_DAYS =
  'https://www.drikpanchang.com/shraddha/info/shraddha-days.html';
const IN_REPO_ENGINE = 'repo:mobile/src/panchang/pitruSmaran.ts';
const IN_REPO_DOSSIER = 'repo:docs/roadmap/conventions/shraddha-tarpan-source-dossier.md';
const IN_REPO_VIDHI = 'repo:mobile/src/data/vidhi/shraddha-tarpan-vidhi.ts';
const VALMIKI_BALA = 'repo:mobile/src/data/valmiki-ramayan/chapter-01.json';
const VALMIKI_ARANYA = 'repo:mobile/src/data/valmiki-ramayan/chapter-03.json';
const VALMIKI_NET_BALA = 'https://www.valmikiramayan.net/utf8/baala/sarga41/bala_41_frame.htm';

const DOSSIER_NOTE =
  "2026-09-19: answer limited to the shraddha-tarpan source dossier's recorded facts (Dharma Sindhu ch. 26 + DrikPanchang, opened 2026-08-19) and the shipped engine; no source re-opened this session (egress proxy 403 on every domain).";

const CORPUS_NOTE =
  '2026-09-19: answer rests on the BUNDLED corpus verses named below, which the reviewer can open; the corpus carries its own published source line as the second reference.';

export const PITRU_PRASHNA_ENTRIES: readonly PitruPrashnaEntry[] = [
  {
    id: 'tithi-agyat',
    questionHi: 'हमें अपने पितरों की तिथि नहीं मालूम — क्या करें?',
    questionEn: 'We don’t know our ancestors’ tithi — what then?',
    answerHi:
      'परम्परा ने इसके लिए ही सर्वपितृ अमावस्या रखी है — पक्ष का अन्तिम दिन, जब अज्ञात तिथि वाले और छूटे हुए सब पितरों का स्मरण किया जाता है। पितृ स्मरण में किसी व्यक्ति को "तिथि अज्ञात" के रूप में सहेजने पर ऐप उन्हें इसी दिन पर रखता है।',
    answerEn:
      'The tradition keeps Sarvapitri Amavasya for exactly this — the paksha’s last day, when all ancestors of unknown tithi, and any whose day was missed, are remembered together. Saving a person in Pitru Smaran as “tithi unknown” places them on this day.',
    status: 'verified',
    source: {
      referenceUrls: [IN_REPO_ENGINE, DRIK_SHRADDHA_DATES, DHARMA_SINDHU_SHRADDHA],
      verificationNote: `${DOSSIER_NOTE} The 'sarvapitri' tithiRule is the engine's own fallback.`,
    },
  },
  {
    id: 'calendar-antar',
    questionHi: 'छपे पंचांग में श्राद्ध की तारीख़ एक दिन अलग क्यों दिखती है?',
    questionEn: 'Why does a printed almanac show the shraddha a day apart?',
    answerHi:
      'श्राद्ध अपराह्न का कर्म है, इसलिए शास्त्रीय गणना उस दिन को चुनती है जिसके अपराह्न में तिथि व्याप्त हो — जबकि अधिकांश तालिकाएँ सूर्योदय की तिथि से दिन नाम देती हैं। जब तिथि दोपहर के बाद बदलती है, दोनों पद्धतियाँ एक दिन का अन्तर दिखा सकती हैं। ऐप की तालिका सूर्योदय-तिथि पद्धति पर है; अपने परिवार या पुरोहित की पद्धति को प्राथमिकता दें।',
    answerEn:
      'Shraddha is an afternoon rite, so the classical reckoning picks the day whose afternoon the tithi covers — while most tables name a day by its sunrise tithi. When a tithi changes after midday the two methods can differ by a day. The app’s table follows the sunrise-tithi convention; give your family’s or officiant’s reckoning precedence.',
    status: 'verified',
    source: {
      referenceUrls: [DRIK_SHRADDHA_DATES, DHARMA_SINDHU_SHRADDHA, IN_REPO_ENGINE],
      verificationNote: `${DOSSIER_NOTE} Aparahna timing is the dossier's recorded fact; the sunrise convention is the shipped table's documented behaviour.`,
    },
  },
  {
    id: 'ghar-par-tarpan',
    questionHi: 'क्या घर पर किया गया तिल-तर्पण पूरा श्राद्ध है?',
    questionEn: 'Is tila-tarpana at home a complete shraddha?',
    answerHi:
      'नहीं। धर्मसिन्धु तिल-तर्पण को श्राद्ध का अंग या विशेष परिस्थितियों में उसका अनुकल्प मानता है; पूर्ण पार्वण श्राद्ध में पिण्डदान, अग्नौकरण और ब्राह्मण-भोजन भी हैं। ऐप की मार्गदर्शिका इसीलिए अपने को सीमित गृहस्थ स्मरण कहती है।',
    answerEn:
      'No. Dharma Sindhu treats tila-tarpana as a limb of shraddha, or as its anukalpa in defined circumstances; a full parvana shraddha also holds pinda-dana, agnaukarana and brahmana-bhojana. That is why the app’s guide calls itself a limited household remembrance.',
    status: 'verified',
    source: {
      referenceUrls: [DHARMA_SINDHU_SHRADDHA, DRIK_SHRADDHA_DATES, IN_REPO_DOSSIER],
      verificationNote: DOSSIER_NOTE,
    },
  },
  {
    id: 'do-log-ek-tithi',
    questionHi: 'दो पितरों की तिथि एक ही है — क्या दोनों एक दिन?',
    questionEn: 'Two ancestors share a tithi — the same day for both?',
    answerHi:
      'हाँ — पक्ष में एक तिथि का एक ही दिन होता है, और उस दिन उस तिथि के सभी पितरों का स्मरण होता है। ऐप की पितृ पक्ष तालिका उस दिन के नीचे दोनों नाम दिखाती है।',
    answerEn:
      'Yes — a tithi has one day in the paksha, and every ancestor of that tithi is remembered on it. The app’s Pitru Paksha table lists both names beneath that day.',
    status: 'verified',
    source: {
      referenceUrls: [IN_REPO_ENGINE, DRIK_SHRADDHA_DATES, DHARMA_SINDHU_SHRADDHA],
      verificationNote: `${DOSSIER_NOTE} Per-day family grouping is the overview screen's shipped behaviour.`,
    },
  },
  {
    id: 'kya-arpan-karein',
    questionHi: 'हमारे पास वह सब सामग्री नहीं है — क्या तब भी स्मरण होगा?',
    questionEn: 'We don’t have all the materials — can we still remember them?',
    answerHi:
      'रामायण का उत्तर सीधा है। वन में श्रीराम के पास राजसी पदार्थ नहीं थे; उन्होंने वहीं मिले इंगुदी के गूदे में बेर मिलाकर पिता के लिए पिण्ड बनाया और कहा — जो हम खाते हैं, वही आपको अर्पित है। जटायु के लिए भी उन्होंने वन के कन्द ही अर्पित किए।',
    answerEn:
      'The Ramayana answers this plainly. In the forest Rama had no royal fare; he made his father’s pinda from the ingudi pulp at hand mixed with jujube and said — what we eat is what we offer you. For Jatayu too, he offered only the roots the forest gave.',
    status: 'verified',
    source: {
      referenceUrls: ['repo:mobile/src/data/valmiki-ramayan/chapter-02.json', VALMIKI_ARANYA, VALMIKI_NET_BALA],
      verificationNote: `${CORPUS_NOTE} Bundled Ayodhya 2.102.20 and 2.102.29–30 ("yad-annaḥ puruṣo bhavati tad-annās tasya devatāḥ"); Aranya 3.68.32–33.`,
    },
  },
  {
    id: 'jal-hi-kyon',
    questionHi: 'तर्पण में जल ही क्यों अर्पित किया जाता है?',
    questionEn: 'Why is water the thing offered in tarpana?',
    answerHi:
      'तर्पण शब्द का अर्थ ही तृप्त करना है, और परम्परा में जल वही माध्यम है जो पितरों तक पहुँचता है। रामायण में यही रूप बार-बार आता है — दशरथ के लिए मन्दाकिनी में, जटायु के लिए गोदावरी में। और सगरपुत्रों के प्रसंग में तो जल का प्रश्न ही तीन पीढ़ियों की कथा बन जाता है, जब गरुड़ कहते हैं कि इनके लिए लौकिक जल पर्याप्त नहीं, गंगा का जल चाहिए।',
    answerEn:
      'The word tarpana itself means to satisfy, and in the tradition water is the medium that reaches the ancestors. The Ramayana shows this form again and again — in the Mandakini for Dasharatha, in the Godavari for Jatayu. And in the episode of Sagara’s sons the question of water becomes a story spanning three generations, when Garuda says that ordinary water will not serve for them: the water of the Ganga is needed.',
    status: 'verified',
    source: {
      referenceUrls: [VALMIKI_BALA, VALMIKI_ARANYA, VALMIKI_NET_BALA],
      verificationNote: `${CORPUS_NOTE} Bundled Bala 1.41.15 and 1.41.18–20; Aranya 3.68.35–36; Ayodhya 2.102.26–27.`,
    },
  },
  {
    id: 'shubh-karya',
    questionHi: 'क्या इन दिनों में नया काम या ख़रीदारी की जा सकती है?',
    questionEn: 'Can new work or purchases be undertaken during these days?',
    answerHi:
      'इस विषय में परिवार और प्रदेश की रीतियाँ अलग-अलग हैं, और यह ऐप किसी दिन पर कोई निर्णय नहीं सुनाता — न पक्ष में, न बाहर। जो स्रोत इस परिचय के लिए खोले गए, वे पक्ष का विधान बताते हैं, कोई निषेध-सूची नहीं। अपने परिवार की रीति या पुरोहित से पूछना ही यहाँ सही उत्तर है।',
    answerEn:
      'Family and regional practice differ here, and this app passes no judgement on any day — inside this fortnight or outside it. The sources opened for this introduction describe how the paksha is kept; they do not carry a list of things withheld. Your family’s practice, or your officiant, is the right answer to this one.',
    status: 'verified',
    source: {
      referenceUrls: [IN_REPO_DOSSIER, DHARMA_SINDHU_SHRADDHA, DRIK_SHRADDHA_DATES],
      verificationNote: `${DOSSIER_NOTE} This row deliberately issues NO verdict and makes no claim about what any source prohibits — it states only that the opened sources are procedural and defers to family practice (RULEBOOK §28.1). If a reviewer later opens a source that DOES treat this question, the answer still may not become a verdict.`,
    },
  },
  {
    id: 'kaun-kare',
    questionHi: 'परिवार में श्राद्ध कौन कर सकता है?',
    questionEn: 'Who in the family may perform the shraddha?',
    answerHi:
      'अधिकार और क्रम शाखा, प्रदेश और कुल-परम्परा से तय होते हैं, इसलिए यह परिचय इस पर कोई नियम नहीं देता — यह प्रश्न परिवार और पुरोहित का है।',
    answerEn:
      'Eligibility and order are set by branch, region and family lineage, so this introduction lays down no rule on it — the question belongs to the family and its officiant.',
    status: 'draft',
    source: {
      referenceUrls: [DHARMA_SINDHU_SHRADDHA, DRIK_SHRADDHA_DAYS],
      verificationNote:
        '2026-09-19: DRAFT — NOT VERIFIED, and deliberately so. Even the deferral needs a source opened at the chapter that treats adhikara before it renders, because a bare "ask your family" on this question reads as evasion on the surface where people most want an answer. To flip: open Dharma Sindhu ch. 26 on adhikara plus one independent published reference, and record what varies. Never convert this into a rule (RULEBOOK §28.1, §28.5).',
    },
  },
  {
    id: 'vidhi-kahan',
    questionHi: 'उस दिन क्या करें — क्या ऐप में कोई मार्गदर्शिका है?',
    questionEn: 'What do we do on the day — is there a guide in the app?',
    answerHi:
      'हाँ, एक सीमित मार्गदर्शिका है: पितृ तिल-तर्पण स्मरण। उसमें सामग्री की सूची और चरण हैं, पर कोई मन्त्र, गोत्र-वाक्य या दिशा-विधान नहीं — क्योंकि वे शाखा और परिवार से बदलते हैं। वह पूर्ण श्राद्ध का स्थान नहीं लेती, और यह बात उसका पहला चरण स्वयं कहता है।',
    answerEn:
      'Yes, a limited one: the Pitru Tila-Tarpana Remembrance. It carries a materials list and steps, but no mantra, gotra formula or prescribed orientation — those vary by branch and family. It does not stand in for a full shraddha, and its own first step says so.',
    status: 'verified',
    source: {
      referenceUrls: [IN_REPO_VIDHI, IN_REPO_DOSSIER, DHARMA_SINDHU_SHRADDHA],
      verificationNote:
        '2026-09-19: describes the shipped entry in data/vidhi/shraddha-tarpan-vidhi.ts exactly — its scope step, its samagri list, and its stated omissions (mantra, gotra/name formula, direction, sacred-thread position, pinda/bhojana/homa). Nothing is claimed about the guide that the entry does not itself carry.',
    },
  },
];

export function getPitruPrashna(): readonly PitruPrashnaEntry[] {
  return PITRU_PRASHNA_ENTRIES.filter((entry) => entry.status === 'verified');
}
