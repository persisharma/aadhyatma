/**
 * पितृ पक्ष परिचय — the concept, per-tithi and glossary lessons (PRD-44 §5).
 *
 * VERIFIED rows are limited to what the two sources already opened and pinned
 * for the tila-tarpana guide support (docs/roadmap/conventions/
 * shraddha-tarpan-source-dossier.md — Dharma Sindhu ch. 26 and DrikPanchang's
 * shraddha pages, opened 2026-08-19) plus what the shipped engine itself
 * computes (`panchang/pitruSmaran.ts`). Everything that needs a source this
 * repo has not opened — the per-tithi assignments, the three-debts teaching,
 * the Mahalaya legend — is DRAFT and invisible until a reviewer opens the
 * source and flips the status. ⚠ `source` blocks are review-only provenance.
 */
import type { PitruLessonEntry } from './types';

const DHARMA_SINDHU_SHRADDHA =
  'https://www.kamakoti.org/kamakoti/dharmasindhu/bookview.php?chapnum=26';
const DRIK_SHRADDHA_DATES =
  'https://www.drikpanchang.com/shraddha/pitru-paksha-shraddha-dates.html';
const DRIK_SHRADDHA_DAYS =
  'https://www.drikpanchang.com/shraddha/info/shraddha-days.html';
const IN_REPO_ENGINE = 'repo:mobile/src/panchang/pitruSmaran.ts';
const IN_REPO_DOSSIER = 'repo:docs/roadmap/conventions/shraddha-tarpan-source-dossier.md';

const DOSSIER_NOTE =
  '2026-09-19: statement limited to the "concordant source facts safe to use" recorded in the shraddha-tarpan source dossier (Dharma Sindhu ch. 26 + DrikPanchang shraddha pages, opened 2026-08-19). No source was re-opened this session (no outbound network).';

const DRAFT_NOTE =
  '2026-09-19: DRAFT — NOT VERIFIED. Widely published tradition, but no source was opened this session (no outbound network). Needs two concordant references (Dharma Sindhu ch. 26 / Nirnaya Sindhu / DrikPanchang shraddha pages) opened and recorded before the status flips.';

export const PITRU_LESSON_ENTRIES: readonly PitruLessonEntry[] = [
  // ── परिचय — the concept lessons ─────────────────────────────────────────
  {
    id: 'kya-hai',
    kind: 'parichay',
    titleHi: 'पितृ पक्ष क्या है',
    titleEn: 'What Pitru Paksha is',
    bodyHi: [
      'भाद्रपद पूर्णिमा से आश्विन अमावस्या तक का पखवाड़ा पितृ पक्ष कहलाता है — इसे महालय पक्ष भी कहते हैं। पूर्णिमान्त गणना में यह आश्विन कृष्ण पक्ष है; अमान्त गणना में भाद्रपद कृष्ण पक्ष। दोनों नाम एक ही सोलह दिनों के हैं।',
      'इन दिनों में परिवार अपने दिवंगत पूर्वजों — पितरों — का स्मरण करता है। जिस तिथि को किसी का देहान्त हुआ, इस पक्ष की उसी तिथि पर उनका श्राद्ध किया जाता है; इसीलिए यह पक्ष तिथियों का कैलेण्डर है, तारीख़ों का नहीं।',
      'जिनकी तिथि परिवार को ज्ञात नहीं, उनके लिए पक्ष का अन्तिम दिन — सर्वपितृ अमावस्या — रखा गया है।',
    ],
    bodyEn: [
      'The fortnight from Bhadrapada Purnima to Ashwin Amavasya is Pitru Paksha — also called the Mahalaya paksha. In the purnimant reckoning it is Ashwin krishna paksha; in the amanta reckoning, Bhadrapada krishna paksha. Both names point to the same sixteen days.',
      'Through these days a family remembers its departed forebears — the pitrs. Each ancestor is remembered on the tithi of their passing, mapped into this fortnight; which is why the paksha is a calendar of tithis, not of dates.',
      'For those whose tithi the family no longer knows, the last day of the paksha — Sarvapitri Amavasya — is kept.',
    ],
    status: 'verified',
    source: {
      referenceUrls: [DRIK_SHRADDHA_DATES, DHARMA_SINDHU_SHRADDHA, IN_REPO_ENGINE],
      verificationNote: `${DOSSIER_NOTE} The window definition and the Sarvapitri fallback are the shipped engine's own rules (pitruPakshaWindow, pakshaShraddhaDay).`,
    },
  },
  {
    id: 'shraddha-aur-tarpan',
    kind: 'parichay',
    titleHi: 'श्राद्ध और तर्पण — दो शब्द, दो कर्म',
    titleEn: 'Shraddha and tarpana — two words, two acts',
    bodyHi: [
      'तर्पण जल का अर्पण है — प्रायः तिल मिले जल का — जो पितरों की तृप्ति के भाव से किया जाता है। यह श्राद्ध का एक अंग है, या विशेष परिस्थितियों में उसका अनुकल्प (सरल विकल्प) — पर स्वयं पूर्ण श्राद्ध नहीं।',
      'पूर्ण पार्वण श्राद्ध में इससे बहुत अधिक है: अग्नौकरण, पिण्डदान और ब्राह्मण-भोजन इसके अभिन्न अंग माने गए हैं। इनका क्रम और विधान परिवार की शाखा और पुरोहित के अनुसार भिन्न होता है।',
      'इसीलिए इस ऐप की तिल-तर्पण मार्गदर्शिका अपने को सीमित गृहस्थ स्मरण कहती है — वह श्राद्ध की जगह नहीं लेती।',
    ],
    bodyEn: [
      'Tarpana is an offering of water — usually water with sesame — made in the spirit of satisfying the pitrs. It is one limb of shraddha, or in defined circumstances its anukalpa (a permitted simpler form) — but not the whole shraddha by itself.',
      'A full parvana shraddha holds much more: agnaukarana, pinda-dana and brahmana-bhojana are counted as integral to it, and their order and form vary by the family’s branch and its officiant.',
      'That is why this app’s tila-tarpana guide calls itself a limited household remembrance — it does not stand in for shraddha.',
    ],
    status: 'verified',
    source: {
      referenceUrls: [DHARMA_SINDHU_SHRADDHA, DRIK_SHRADDHA_DATES, IN_REPO_DOSSIER],
      verificationNote: `${DOSSIER_NOTE} Tila-tarpana vs parvana distinction and the agnaukarana / pinda / bhojana enumeration are the dossier's recorded Dharma Sindhu facts.`,
    },
  },
  {
    id: 'samay',
    kind: 'parichay',
    titleHi: 'दिन का कौन-सा समय',
    titleEn: 'Which part of the day',
    bodyHi: [
      'श्राद्ध का समय दिन का उत्तरार्ध माना गया है — कुतप काल (मध्याह्न के आसपास का मुहूर्त), रौहिण और उसके बाद का अपराह्न। यह सूर्योदय का कर्म नहीं है।',
      'इसी कारण किसी तिथि का श्राद्ध उस नागरिक दिन पर पड़ता है जिसके अपराह्न में वह तिथि व्याप्त हो — और कभी-कभी वह दिन पंचांग में सूर्योदय पर छपी तिथि से एक दिन आगे-पीछे दिखता है।',
      'ये खिड़कियाँ स्थान और दिनांक के अनुसार बदलती हैं; निश्चित समय के लिए अपने स्थान का पंचांग या पुरोहित देखें।',
    ],
    bodyEn: [
      'Shraddha belongs to the later part of the day — the Kutapa muhurta around midday, Rohina, and the aparahna that follows. It is not a sunrise act.',
      'That is why a tithi’s shraddha falls on the civil day whose afternoon that tithi covers — and why that day can sit a day off from the tithi printed at sunrise in an almanac.',
      'These windows shift with place and date; for exact times consult the panchang for your location or your officiant.',
    ],
    status: 'verified',
    source: {
      referenceUrls: [DRIK_SHRADDHA_DATES, DHARMA_SINDHU_SHRADDHA, IN_REPO_DOSSIER],
      verificationNote: `${DOSSIER_NOTE} Kutapa / Rohina / Aparahna and the location-dependence are the dossier's recorded concordant facts.`,
    },
  },
  {
    id: 'kis-din-kiska',
    kind: 'parichay',
    titleHi: 'किस दिन किसका श्राद्ध — तिथि कैसे मिलती है',
    titleEn: 'Whose day is which — how a tithi is matched',
    bodyHi: [
      'देहान्त की तिथि — मास, पक्ष और तिथि — इस पक्ष की उसी संख्या की कृष्ण-पक्ष तिथि पर उतारी जाती है। माघ कृष्ण अष्टमी को गए पितर का महालय श्राद्ध पितृ पक्ष की अष्टमी को होता है।',
      'पूर्णिमा को दिवंगत हुए पितरों का श्राद्ध पक्ष के आरम्भ की पूर्णिमा को ही किया जाता है। किसी वर्ष कोई तिथि क्षय हो जाए — सूर्योदय पर दो तिथियाँ एक ही दिन में सिमट जाएँ — तो वह दिन दोनों नामों से जाना जाता है, जैसा छपे श्राद्ध-कैलेण्डर करते हैं।',
      'इस ऐप की पितृ पक्ष तालिका इसी सूर्योदय-तिथि पद्धति से बनी है; अपराह्न-आधारित परिवार-परम्परा हो तो उसे ही प्राथमिकता दें।',
    ],
    bodyEn: [
      'The tithi of passing — month, paksha and tithi — is carried onto the same-numbered krishna tithi of this fortnight. An ancestor who left on Magha krishna ashtami has their Mahalaya shraddha on the paksha’s ashtami.',
      'Those who passed on a purnima are remembered on the opening purnima of the paksha itself. When a tithi is kshaya in a given year — two tithis fold into one sunrise day — that day carries both names, exactly as printed shraddha calendars do.',
      'This app’s Pitru Paksha table is built on that sunrise-tithi convention; where the family follows an aparahna-based reckoning, that takes precedence.',
    ],
    status: 'verified',
    source: {
      referenceUrls: [IN_REPO_ENGINE, DRIK_SHRADDHA_DATES, DRIK_SHRADDHA_DAYS],
      verificationNote: `${DOSSIER_NOTE} The mapping, the purnima rule and the kshaya two-name row are the shipped engine and overview screen's own behaviour (pakshaShraddhaDay; PitruPakshaOverviewScreen).`,
    },
  },
  {
    id: 'parampara',
    kind: 'parichay',
    titleHi: 'हर परिवार की अपनी रीति',
    titleEn: 'Every family has its own way',
    bodyHi: [
      'दिशा, यज्ञोपवीत की स्थिति, किन पितरों को किस क्रम में स्मरण किया जाए, और कौन-से वाक्य कहे जाएँ — यह सब शाखा, प्रदेश और कुल-परम्परा से बदलता है। इन्हें एक सामान्य विधान में समेटा नहीं जा सकता।',
      'इसलिए यह परिचय बताता है कि पक्ष क्या है और क्यों है — यह विधान की सूची नहीं है। जहाँ परिवार की रीति और यहाँ लिखा भिन्न हो, वहाँ परिवार की रीति ही सही है।',
    ],
    bodyEn: [
      'Orientation, the position of the sacred thread, which ancestors are addressed in what order, and what words are spoken — all of this varies by branch, region and family lineage. It cannot be flattened into one generic procedure.',
      'So this introduction explains what the paksha is and why it is kept — it is not a set of instructions. Where your family’s practice and this text differ, the family’s practice is the right one.',
    ],
    status: 'verified',
    source: {
      referenceUrls: [DHARMA_SINDHU_SHRADDHA, DRIK_SHRADDHA_DATES, IN_REPO_DOSSIER],
      verificationNote: `${DOSSIER_NOTE} The branch-variation statement is the dossier's recorded fact ("orientation, sacred-thread position, addressee order and formulas vary by branch and rite").`,
    },
  },
  {
    id: 'pitru-rin',
    kind: 'parichay',
    titleHi: 'पितृ-ऋण और पञ्च महायज्ञ — स्मरण क्यों',
    titleEn: 'Pitru-rina and the five great yajnas — why remember',
    bodyHi: [
      'वैदिक परम्परा मनुष्य पर तीन ऋण बताती है — देव-ऋण, ऋषि-ऋण और पितृ-ऋण। पितरों का स्मरण और सन्तान-परम्परा पितृ-ऋण के प्रति कृतज्ञता है।',
      'गृहस्थ के लिए बताए गए पाँच नित्य महायज्ञों में पितृ-यज्ञ एक है — देव, पितृ, भूत, मनुष्य और ब्रह्म यज्ञ। पितृ पक्ष उसी नित्य कृतज्ञता का वार्षिक विस्तार है।',
    ],
    bodyEn: [
      'The Vedic tradition speaks of three debts a person carries — to the devas, to the rishis, and to the ancestors (pitru-rina). Remembering the pitrs, and continuing the family line, is gratitude toward the third.',
      'Among the five daily great yajnas prescribed for a householder — to the devas, the pitrs, all beings, guests and Brahman — pitru-yajna is one. Pitru Paksha is that everyday gratitude extended into a fortnight each year.',
    ],
    status: 'draft',
    source: {
      referenceUrls: ['https://www.wisdomlib.org/hinduism/book/manusmriti-with-the-commentary-of-medhatithi'],
      verificationNote: `${DRAFT_NOTE} Candidates: Taittiriya Samhita 6.3.10.5 (three debts) and Manusmriti 3.70 (pancha-mahayajna) — both need the exact text opened and a second concordant reference recorded.`,
    },
  },
  {
    id: 'mahalaya-naam',
    kind: 'parichay',
    titleHi: 'महालय — नाम का अर्थ',
    titleEn: 'Mahalaya — what the name carries',
    bodyHi: [
      'महालय का अर्थ पितरों का महान आलय — निवास — भी लिया जाता है, और वह काल भी जब परम्परा के अनुसार पितर अपने वंशजों के समीप आते हैं। बंगाल और पूर्वी भारत में महालया अमावस्या दुर्गापूजा के आरम्भ की भी सूचना देती है।',
    ],
    bodyEn: [
      'Mahalaya is read both as the great abode of the pitrs, and as the season when, by tradition, the ancestors draw near their descendants. In Bengal and eastern India, Mahalaya Amavasya also heralds the beginning of Durga Puja.',
    ],
    status: 'draft',
    source: {
      referenceUrls: [DRIK_SHRADDHA_DATES],
      verificationNote: DRAFT_NOTE,
    },
  },

  // ── षोडश तिथियाँ — one row per day of the fortnight ─────────────────────
  {
    id: 'tithi-purnima',
    kind: 'tithi',
    fortnightDay: 'purnima',
    titleHi: 'पूर्णिमा श्राद्ध',
    titleEn: 'Purnima Shraddha',
    bodyHi: [
      'पक्ष का पहला दिन — भाद्रपद पूर्णिमा। जिन पितरों का देहान्त किसी पूर्णिमा को हुआ, उनका महालय श्राद्ध इसी दिन किया जाता है। यही दिन प्रोष्ठपदी पूर्णिमा भी है।',
    ],
    bodyEn: [
      'The first day of the paksha — Bhadrapada Purnima. Ancestors who passed on any purnima are remembered on this day. It is also the Proshthapadi Purnima.',
    ],
    status: 'verified',
    source: {
      referenceUrls: [IN_REPO_ENGINE, DRIK_SHRADDHA_DATES, DRIK_SHRADDHA_DAYS],
      verificationNote: `${DOSSIER_NOTE} The purnima rule is the shipped engine's pakshaShraddhaDay behaviour.`,
    },
  },
  {
    id: 'tithi-1',
    kind: 'tithi',
    fortnightDay: 1,
    titleHi: 'प्रतिपदा श्राद्ध',
    titleEn: 'Pratipada Shraddha',
    bodyHi: ['कृष्ण प्रतिपदा को दिवंगत पितरों का दिन। कुछ परम्पराओं में नाना-नानी पक्ष के पितरों का श्राद्ध भी इसी दिन किया जाता है।'],
    bodyEn: ['The day for ancestors who passed on a krishna pratipada. Some traditions also remember maternal grandparents on this day.'],
    status: 'draft',
    source: { referenceUrls: [DRIK_SHRADDHA_DAYS], verificationNote: DRAFT_NOTE },
  },
  {
    id: 'tithi-4-5-bharani',
    kind: 'tithi',
    fortnightDay: 4,
    titleHi: 'चतुर्थी–पञ्चमी · भरणी श्राद्ध',
    titleEn: 'Chaturthi–Panchami · Bharani Shraddha',
    bodyHi: ['जिस दिन पक्ष में भरणी नक्षत्र पड़े — प्रायः चतुर्थी या पञ्चमी — वह भरणी श्राद्ध कहलाता है; इसे देहान्त के प्रथम वर्ष के श्राद्ध से जोड़ा जाता है।'],
    bodyEn: ['The day in the paksha carrying the Bharani nakshatra — usually chaturthi or panchami — is the Bharani Shraddha, associated with the first-year remembrance after a passing.'],
    status: 'draft',
    source: { referenceUrls: [DRIK_SHRADDHA_DAYS], verificationNote: DRAFT_NOTE },
  },
  {
    id: 'tithi-9-matri-navami',
    kind: 'tithi',
    fortnightDay: 9,
    titleHi: 'नवमी · मातृ नवमी',
    titleEn: 'Navami · Matri Navami',
    bodyHi: ['नवमी को माता और कुल की दिवंगत स्त्रियों का स्मरण किया जाता है; इसे अविधवा नवमी भी कहते हैं — पति के जीवनकाल में दिवंगत स्त्रियों के लिए।'],
    bodyEn: ['Navami is kept for mothers and the departed women of the family; it is also called Avidhava Navami — for women who passed in their husband’s lifetime.'],
    status: 'draft',
    source: { referenceUrls: [DRIK_SHRADDHA_DAYS], verificationNote: DRAFT_NOTE },
  },
  {
    id: 'tithi-12-sannyasi',
    kind: 'tithi',
    fortnightDay: 12,
    titleHi: 'द्वादशी · सन्यासी श्राद्ध',
    titleEn: 'Dwadashi · Sannyasi Shraddha',
    bodyHi: ['द्वादशी को कुल के उन पितरों का स्मरण किया जाता है जिन्होंने सन्यास लिया था।'],
    bodyEn: ['Dwadashi is kept for those of the family who had taken sannyasa.'],
    status: 'draft',
    source: { referenceUrls: [DRIK_SHRADDHA_DAYS], verificationNote: DRAFT_NOTE },
  },
  {
    id: 'tithi-14-ghata',
    kind: 'tithi',
    fortnightDay: 14,
    titleHi: 'चतुर्दशी · घात चतुर्दशी',
    titleEn: 'Chaturdashi · Ghata Chaturdashi',
    bodyHi: ['चतुर्दशी उन पितरों के लिए है जिनका देहान्त अस्त्र, दुर्घटना या अकाल मृत्यु से हुआ — तिथि चाहे कोई हो। सामान्य चतुर्दशी-तिथि के पितरों का श्राद्ध कुछ परम्पराएँ अमावस्या को करती हैं।'],
    bodyEn: ['Chaturdashi is kept for ancestors who died by weapon, accident or untimely death — whatever their tithi. For an ordinary chaturdashi passing, some traditions move the remembrance to the amavasya.'],
    status: 'draft',
    source: { referenceUrls: [DRIK_SHRADDHA_DAYS], verificationNote: DRAFT_NOTE },
  },
  {
    id: 'tithi-amavasya',
    kind: 'tithi',
    fortnightDay: 'amavasya',
    titleHi: 'सर्वपितृ अमावस्या',
    titleEn: 'Sarvapitri Amavasya',
    bodyHi: [
      'पक्ष का अन्तिम दिन। अमावस्या को दिवंगत पितरों का दिन — और उन सभी पितरों का भी जिनकी तिथि ज्ञात नहीं, या जिनका श्राद्ध पक्ष में किसी कारण छूट गया। इसी कारण इसे सर्वपितृ — सब पितरों की — अमावस्या कहते हैं।',
    ],
    bodyEn: [
      'The last day of the paksha. The day for those who passed on an amavasya — and for every ancestor whose tithi is unknown, or whose day in the paksha was missed. Hence Sarvapitri: the amavasya of all the pitrs.',
    ],
    status: 'verified',
    source: {
      referenceUrls: [IN_REPO_ENGINE, DRIK_SHRADDHA_DATES, DHARMA_SINDHU_SHRADDHA],
      verificationNote: `${DOSSIER_NOTE} The unknown-tithi fallback is the shipped engine's own rule ('sarvapitri' tithiRule).`,
    },
  },

  // ── शब्द — glossary ─────────────────────────────────────────────────────
  {
    id: 'shabd-pitr',
    kind: 'shabd',
    titleHi: 'पितर',
    titleEn: 'Pitr',
    bodyHi: ['दिवंगत पूर्वज — जिनका स्मरण श्राद्ध और तर्पण में किया जाता है। बहुवचन: पितर; संस्कृत मूल पितृ।'],
    bodyEn: ['A departed forebear — the ones remembered in shraddha and tarpana. Sanskrit pitṛ; plural pitaraḥ.'],
    status: 'verified',
    source: {
      referenceUrls: [DHARMA_SINDHU_SHRADDHA, DRIK_SHRADDHA_DATES, IN_REPO_DOSSIER],
      verificationNote: DOSSIER_NOTE,
    },
  },
  {
    id: 'shabd-tarpan',
    kind: 'shabd',
    titleHi: 'तर्पण',
    titleEn: 'Tarpana',
    bodyHi: ['तृप्त करने का भाव — जल (प्रायः तिल-युक्त) का अर्पण। श्राद्ध का अंग या अनुकल्प; स्वयं पूर्ण श्राद्ध नहीं।'],
    bodyEn: ['From tṛp, to satisfy — the offering of water, usually with sesame. A limb or anukalpa of shraddha; not the whole shraddha.'],
    status: 'verified',
    source: {
      referenceUrls: [DHARMA_SINDHU_SHRADDHA, DRIK_SHRADDHA_DATES, IN_REPO_DOSSIER],
      verificationNote: DOSSIER_NOTE,
    },
  },
  {
    id: 'shabd-pinda',
    kind: 'shabd',
    titleHi: 'पिण्ड',
    titleEn: 'Pinda',
    bodyHi: ['पितरों को अर्पित अन्न का गोला — प्रायः चावल, तिल आदि से बना। पिण्डदान पार्वण श्राद्ध का अंग है; इसकी सामग्री और विधि कुल-परम्परा से तय होती है।'],
    bodyEn: ['A ball of food offered to the pitrs — typically of rice with sesame and other grains. Pinda-dana is part of the parvana shraddha; its materials and manner are set by family tradition.'],
    status: 'verified',
    source: {
      referenceUrls: [DHARMA_SINDHU_SHRADDHA, DRIK_SHRADDHA_DATES, IN_REPO_DOSSIER],
      verificationNote: `${DOSSIER_NOTE} Materials list kept to what DrikPanchang describes and the dossier records must not be imposed on a tarpana-only checklist.`,
    },
  },
  {
    id: 'shabd-kutapa',
    kind: 'shabd',
    titleHi: 'कुतप काल',
    titleEn: 'Kutapa kaal',
    bodyHi: ['मध्याह्न के आसपास का वह मुहूर्त जिसे श्राद्ध के लिए विशेष माना गया है; इसके बाद रौहिण और अपराह्न आते हैं।'],
    bodyEn: ['The muhurta around midday held especially fit for shraddha; Rohina and the aparahna follow it.'],
    status: 'verified',
    source: {
      referenceUrls: [DRIK_SHRADDHA_DATES, DHARMA_SINDHU_SHRADDHA, IN_REPO_DOSSIER],
      verificationNote: DOSSIER_NOTE,
    },
  },
  {
    id: 'shabd-anukalpa',
    kind: 'shabd',
    titleHi: 'अनुकल्प',
    titleEn: 'Anukalpa',
    bodyHi: ['मुख्य विधान सम्भव न हो तो शास्त्र द्वारा बताया गया सरल विकल्प — जैसे विशेष परिस्थितियों में पूर्ण श्राद्ध के स्थान पर तिल-तर्पण।'],
    bodyEn: ['The simpler alternative the texts allow when the principal rite cannot be performed — such as tila-tarpana in place of a full shraddha, in defined circumstances.'],
    status: 'verified',
    source: {
      referenceUrls: [DHARMA_SINDHU_SHRADDHA, DRIK_SHRADDHA_DATES, IN_REPO_DOSSIER],
      verificationNote: DOSSIER_NOTE,
    },
  },
  {
    id: 'shabd-gotra',
    kind: 'shabd',
    titleHi: 'गोत्र',
    titleEn: 'Gotra',
    bodyHi: ['ऋषि-मूल वंश-नाम जिससे परिवार की पहचान होती है; संकल्प और तर्पण के वाक्यों में इसका उच्चार परिवार की रीति से किया जाता है।'],
    bodyEn: ['The lineage name traced to a rishi, by which a family is identified; it is spoken in sankalpa and tarpana formulas according to the family’s own practice.'],
    status: 'draft',
    source: { referenceUrls: [DHARMA_SINDHU_SHRADDHA], verificationNote: DRAFT_NOTE },
  },
];

export function getPitruLessons(): readonly PitruLessonEntry[] {
  return PITRU_LESSON_ENTRIES.filter((entry) => entry.status === 'verified');
}
