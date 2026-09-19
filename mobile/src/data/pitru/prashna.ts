/**
 * प्रश्नोत्तर — the honest answers of पितृ पक्ष परिचय (PRD-44 §5.5).
 *
 * Every verified answer is either the shipped engine's own behaviour or one
 * of the dossier's recorded concordant facts. The stance rules of RULEBOOK
 * §28 apply hardest here: no fear copy, no "must", no auspicious/inauspicious
 * verdicts on the fortnight — questions the opened sources do not answer are
 * simply not in this list. ⚠ `source` blocks are review-only provenance.
 */
import type { PitruPrashnaEntry } from './types';

const DHARMA_SINDHU_SHRADDHA =
  'https://www.kamakoti.org/kamakoti/dharmasindhu/bookview.php?chapnum=26';
const DRIK_SHRADDHA_DATES =
  'https://www.drikpanchang.com/shraddha/pitru-paksha-shraddha-dates.html';
const IN_REPO_ENGINE = 'repo:mobile/src/panchang/pitruSmaran.ts';
const IN_REPO_DOSSIER = 'repo:docs/roadmap/conventions/shraddha-tarpan-source-dossier.md';

const DOSSIER_NOTE =
  '2026-09-19: answer limited to the shraddha-tarpan source dossier\'s recorded facts (Dharma Sindhu ch. 26 + DrikPanchang, opened 2026-08-19) and the shipped engine; no source re-opened this session (no outbound network).';

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
];

export function getPitruPrashna(): readonly PitruPrashnaEntry[] {
  return PITRU_PRASHNA_ENTRIES.filter((entry) => entry.status === 'verified');
}
