/**
 * पितृ पक्ष परिचय — the concept, per-tithi and glossary lessons (PRD-44 §5).
 *
 * THE VERIFICATION LADDER (RULEBOOK §28.4), in the order it is preferred:
 *   1. **Bundled corpus** — a statement the shipped Gita / Valmiki JSON itself
 *      carries. Strongest: the reviewer can open the file. Counts as one
 *      reference; the corpus's own published `source` line is the second.
 *   2. **The shipped engine** — what `panchang/pitruSmaran.ts` actually solves.
 *   3. **The dossier** — facts recorded as opened on 2026-08-19 in
 *      docs/roadmap/conventions/shraddha-tarpan-source-dossier.md.
 * Anything outside those three is DRAFT and invisible until a reviewer opens
 * the sources its note names. The 2026-09-19 session could not open any
 * external page (egress policy 403 on every source domain), so the per-tithi
 * assignments below are authored in full but stay draft — a reviewer flips
 * `status` and the surfaces light up with zero code change.
 * ⚠ `source` blocks are review-only provenance — never rendered.
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
const VALMIKI_CORPUS = 'repo:mobile/src/data/valmiki-ramayan/chapter-01.json';
const VALMIKI_ARANYA = 'repo:mobile/src/data/valmiki-ramayan/chapter-03.json';
const VALMIKI_NET = 'https://www.valmikiramayan.net/utf8/baala/sarga41/bala_41_frame.htm';
const VALMIKI_NET_ARANYA = 'https://www.valmikiramayan.net/utf8/aranya/sarga68/aranya_68_frame.htm';
const GITA_CORPUS_09 = 'repo:mobile/src/data/gita/chapter-09.json';
const GITA_CORPUS_10 = 'repo:mobile/src/data/gita/chapter-10.json';
const GITA_HOLY_09 = 'https://www.holy-bhagavad-gita.org/chapter/9';
const GITA_HOLY_10 = 'https://www.holy-bhagavad-gita.org/chapter/10';
const NITYA_KARMA_SCAN = 'https://archive.org/details/NityaKarmaPujaPrakashGitaPressGorakhpur';
const IN_REPO_PANCHABALI_DOSSIER = 'repo:docs/roadmap/conventions/panchabali-source-dossier.md';

const DOSSIER_NOTE =
  '2026-09-19: statement limited to the "concordant source facts safe to use" recorded in the shraddha-tarpan source dossier (Dharma Sindhu ch. 26 + DrikPanchang shraddha pages, opened 2026-08-19). No source was re-opened this session — the egress proxy returned 403 for every external domain.';

const CORPUS_NOTE =
  '2026-09-19: statement checked against the BUNDLED corpus JSON named in referenceUrls (the reviewer can open the file and the cited verse); the corpus carries its own published source line as the second reference. Nothing is asserted beyond what those verses say.';

/**
 * Every per-tithi row below is authored but DRAFT. The 2026-09-19 session
 * could not open an external page; a web search did surface concordant
 * candidate pages (drikpanchang.com/shraddha/tithi/*.html and the Holy Voyages
 * / Muhurat Choghadiya shraddha-day listings), but a search summary is not an
 * opened source and this repo does not certify from one.
 */
const TITHI_DRAFT_NOTE =
  '2026-09-19: DRAFT — NOT VERIFIED. The tithi-to-who assignment is widely published household tradition, but no page was opened this session (egress proxy 403 on every domain). To flip: open DrikPanchang\'s per-tithi shraddha pages (drikpanchang.com/shraddha/tithi/<tithi>-shraddha-date-time.html) AND one independent published almanac (Nirnaya Sindhu or Dharma Sindhu ch. 26\'s own tithi table), record the date and where they agree, and keep any regional divergence stated rather than flattened.';

const DRAFT_NOTE =
  '2026-09-19: DRAFT — NOT VERIFIED. Widely published tradition, but no source was opened this session (egress proxy 403 on every domain). Needs two concordant references opened and recorded before the status flips.';

/**
 * Panchabali rows. Gathered 2026-09-21 in
 * docs/roadmap/conventions/panchabali-source-dossier.md from web-search
 * summaries only — every primary domain (archive.org scan of Gita Press
 * Nitya Karma Puja Prakash, kamakoti.org Dharma Sindhu ch. 26, wisdomlib)
 * returned EGRESS_BLOCKED. The five recipients and their order are concordant
 * across eight summaries; nothing else is asserted. No mantra, placement,
 * direction or thread position enters the copy (RULEBOOK §28.5).
 */
const PANCHABALI_DRAFT_NOTE =
  '2026-09-21: DRAFT — NOT VERIFIED. Five recipients and their order are concordant across the search summaries recorded in the panchabali dossier, but no page was opened (EGRESS_BLOCKED on archive.org, kamakoti.org, wisdomlib.org). To flip: open the Gita Press Nitya Karma Puja Prakash scan at its पञ्चबलि section and record the page range, then re-open Dharma Sindhu ch. 26 specifically for bali; keep the copy free of placement, direction, thread position and mantra.';

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
    id: 'jal-kyon',
    kind: 'parichay',
    titleHi: 'जल ही क्यों — तर्पण का सबसे पुराना रूप',
    titleEn: 'Why water — the oldest form of the offering',
    bodyHi: [
      'रामायण में पितृ-कर्म बार-बार एक ही रूप में मिलता है: अञ्जलि भर जल, दक्षिण दिशा की ओर मुख, और यह भाव कि यह जल उन तक पहुँचे। श्रीराम ने पिता दशरथ के लिए मन्दाकिनी में यही किया, और जटायु के लिए गोदावरी में।',
      'बालकाण्ड में गरुड़ अंशुमान् से कहते हैं कि सगर के पुत्रों के लिए लौकिक जल की अञ्जलि पर्याप्त नहीं — उनके लिए गंगा का जल चाहिए। तीन पीढ़ियाँ इसी एक प्रश्न में बीत गईं, और भगीरथ ने गंगा को उतारकर उसे पूरा किया।',
      'इसलिए तर्पण में जल कोई औपचारिकता नहीं है; परम्परा में वही पितरों तक पहुँचने वाला माध्यम है। तिल, दर्भ और दिशा उसी अर्पण के अंग हैं।',
    ],
    bodyEn: [
      'In the Ramayana the rite for the ancestors appears again and again in one form: cupped hands full of water, the face turned south, and the wish that this water reach them. Rama did exactly this for his father Dasharatha in the Mandakini, and for Jatayu in the Godavari.',
      'In the Bala Kanda, Garuda tells Amshuman that ordinary water will not serve for Sagara’s sons — for them the water of the Ganga is needed. Three generations passed on that single question, and Bhagiratha answered it by bringing the Ganga down.',
      'So the water in tarpana is not a formality; in the tradition it is the medium that reaches the pitrs. The sesame, the darbha and the direction are limbs of that same offering.',
    ],
    status: 'verified',
    source: {
      referenceUrls: [VALMIKI_CORPUS, VALMIKI_ARANYA, VALMIKI_NET],
      verificationNote: `${CORPUS_NOTE} Bundled Bala Kanda 1.41.15 (no water found for the jalakriya), 1.41.18 ("laukikam salilam" will not do), 1.41.19 (use the Ganga), 1.42.6 (Dilipa's lifelong question), 1.42.18–19 (Bhagiratha's boon); Aranya 3.68.35–36 (jalanjali for Jatayu at the Godavari); Ayodhya 2.102.26–27 (facing south for Dasharatha).`,
    },
  },
  {
    id: 'kiske-liye',
    kind: 'parichay',
    titleHi: 'किसके लिए — स्मरण रक्त का बन्धन नहीं माँगता',
    titleEn: 'For whom — remembrance does not ask for blood',
    bodyHi: [
      'अरण्यकाण्ड में श्रीराम जटायु का दाह-संस्कार स्वयं करते हैं। जटायु न उनके कुल के थे, न मनुष्य — वे पिता के मित्र एक पक्षी थे। राम ने लकड़ी इकट्ठी की, चिता सजाई, दर्भ बिछाकर वन के कन्द से पिण्ड बनाया, और गोदावरी जाकर जलाञ्जलि दी।',
      'उन्होंने जो वचन कहा वह किसी वंश की बात नहीं करता: "यज्ञ करने वालों, अग्निहोत्रियों, युद्ध में पीठ न दिखाने वालों और भूमिदान करने वालों को जो गति मिलती है, तुम भी उन्हीं लोकों में जाओ।"',
      'परम्पराएँ यह तय करती हैं कि परिवार में कौन क्या करे — और वह परिवार का विषय है। पर स्मरण का द्वार इस प्रसंग में किसी सूची से नहीं, भाव से खुलता है।',
    ],
    bodyEn: [
      'In the Aranya Kanda, Rama performs Jatayu’s last rites himself. Jatayu was not of his line, and not even human — he was a bird, his father’s friend. Rama gathered the wood, raised the pyre, spread darbha and made a pinda from forest roots, then went to the Godavari and offered the jalanjali.',
      'The words he spoke name no lineage at all: “May you go to those same highest worlds attained by those who perform yajna, who keep the sacred fire, who never turned their back in battle, and who gave away land.”',
      'Traditions decide who in a family does what, and that belongs to the family. But in this episode the door of remembrance is opened by the bond, not by a list.',
    ],
    status: 'verified',
    source: {
      referenceUrls: [VALMIKI_ARANYA, VALMIKI_NET_ARANYA, VALMIKI_CORPUS],
      verificationNote: `${CORPUS_NOTE} Bundled Aranya Kanda 3.67.27 (Jatayu named as his father's friend), 3.68.27–28 (gathering wood, the pyre), 3.68.29–30 (the gati verse, quoted in paraphrase), 3.68.32–33 (kusha spread, pinda of forest roots), 3.68.34 (the pitru mantras), 3.68.35–37. The closing paragraph deliberately asserts NO rule about who may officiate — that is branch-specific and out of scope (RULEBOOK §28.5).`,
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
      verificationNote: `${DRAFT_NOTE} Candidates: Taittiriya Samhita 6.3.10.5 (three debts) and Manusmriti 3.70 (pancha-mahayajna) — both need the exact text opened at a named edition and a second concordant reference recorded.`,
    },
  },
  {
    id: 'panchabali',
    kind: 'parichay',
    titleHi: 'पञ्चबलि — पाँच ग्रास किनके लिए',
    titleEn: 'Panchabali — five portions, and for whom',
    bodyHi: [
      'श्राद्ध के भोजन में, ब्राह्मण-भोजन से पहले, गृहस्थ-परम्परा अन्न के पाँच भाग अलग रखती है — इन्हें पञ्चबलि या पञ्चग्रास कहते हैं। पाँच भाग पाँच वर्गों के प्राणियों के लिए हैं: गौ, श्वान, काक, देव आदि, और पिपीलिका आदि — यानी चींटी और छोटे जीव।',
      'इस क्रम में एक ही भाव बार-बार मिलता है: पितरों के दिन घर का अन्न केवल घर के लोगों का नहीं होता। जो प्राणी न धन्यवाद दे सकते हैं, न प्रत्युपकार, उनका भाग भी रखा जाता है। गृहस्थ के पाँच नित्य महायज्ञों में इसी को भूत-यज्ञ कहा गया है।',
      'किस भाग को कहाँ और किस वाक्य के साथ रखा जाए, यह शाखा और कुल-परम्परा तय करती है; यह परिचय उसे नहीं बताता। कई परिवार इस पक्ष में छत पर दाना और आँगन में जल-पात्र भी रखते हैं — वह इसी भाव का घरेलू रूप है।',
    ],
    bodyEn: [
      'Before the brahmana-bhojana of a shraddha meal, householder tradition sets aside five portions of the cooked food — the panchabali, or panchagrasa. The five are for five classes of beings: the cow, the dog, the crow, the devas and others, and the ants and small creatures.',
      'One idea repeats through the sequence: on the ancestors’ day the food of the house is not for the household alone. A share is kept for those who can neither thank nor repay. Among the householder’s five daily great yajnas this is what is called the bhuta-yajna.',
      'Which portion is placed where, and with what words, is settled by branch and family lineage; this introduction does not supply it. Many families also keep grain on the roof and a bowl of water in the courtyard through the fortnight — the same idea in its everyday household form.',
    ],
    status: 'draft',
    source: {
      referenceUrls: [NITYA_KARMA_SCAN, DHARMA_SINDHU_SHRADDHA, IN_REPO_PANCHABALI_DOSSIER],
      verificationNote: `${PANCHABALI_DRAFT_NOTE} The bhuta-yajna clause depends on the draft manu-3-70 principle and inherits its status. The roof-grain / courtyard-water sentence mirrors the shipped Daan pashu-paksh cause copy (data/daan/causes.ts) and is the one household observation in the row.`,
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
  // Authored in full (PRD-44 §5 bucket C). Only the two the engine itself
  // decides are verified; the fourteen tithi-to-who assignments are draft
  // until a reviewer opens their sources — see TITHI_DRAFT_NOTE.
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
    bodyHi: ['कृष्ण प्रतिपदा को दिवंगत पितरों का दिन। कुछ परम्पराओं में नाना-नानी पक्ष के पितरों का स्मरण भी इसी दिन किया जाता है।'],
    bodyEn: ['The day for ancestors who passed on a krishna pratipada. Some traditions also remember the maternal grandparents’ side on this day.'],
    status: 'draft',
    source: { referenceUrls: [DRIK_SHRADDHA_DAYS], verificationNote: TITHI_DRAFT_NOTE },
  },
  {
    id: 'tithi-2',
    kind: 'tithi',
    fortnightDay: 2,
    titleHi: 'द्वितीया श्राद्ध',
    titleEn: 'Dwitiya Shraddha',
    bodyHi: ['द्वितीया तिथि को दिवंगत पितरों का दिन — शुक्ल या कृष्ण, दोनों पक्षों की द्वितीया इसी दिन पर आती है।'],
    bodyEn: ['The day for those who passed on a dwitiya — a dwitiya of either paksha maps onto this one day.'],
    status: 'draft',
    source: { referenceUrls: [DRIK_SHRADDHA_DAYS], verificationNote: TITHI_DRAFT_NOTE },
  },
  {
    id: 'tithi-3',
    kind: 'tithi',
    fortnightDay: 3,
    titleHi: 'तृतीया श्राद्ध',
    titleEn: 'Tritiya Shraddha',
    bodyHi: ['तृतीया तिथि को दिवंगत पितरों का दिन।'],
    bodyEn: ['The day for those who passed on a tritiya.'],
    status: 'draft',
    source: { referenceUrls: [DRIK_SHRADDHA_DAYS], verificationNote: TITHI_DRAFT_NOTE },
  },
  {
    id: 'tithi-4',
    kind: 'tithi',
    fortnightDay: 4,
    titleHi: 'चतुर्थी श्राद्ध · भरणी श्राद्ध',
    titleEn: 'Chaturthi Shraddha · Bharani Shraddha',
    bodyHi: [
      'चतुर्थी तिथि को दिवंगत पितरों का दिन। पक्ष में जिस दिन भरणी नक्षत्र पड़े — प्रायः चतुर्थी या पञ्चमी — वह महा भरणी श्राद्ध कहलाता है, और वह नक्षत्र से तय होता है, तिथि से नहीं; इसलिए उसकी तारीख़ अपने पंचांग में देखें।',
    ],
    bodyEn: [
      'The day for those who passed on a chaturthi. Whichever day of the paksha carries the Bharani nakshatra — usually chaturthi or panchami — is the Maha Bharani Shraddha; it is fixed by the nakshatra rather than the tithi, so look its date up in your own panchang.',
    ],
    status: 'draft',
    source: { referenceUrls: [DRIK_SHRADDHA_DAYS], verificationNote: TITHI_DRAFT_NOTE },
  },
  {
    id: 'tithi-5',
    kind: 'tithi',
    fortnightDay: 5,
    titleHi: 'पञ्चमी श्राद्ध · कुँवारा पञ्चमी',
    titleEn: 'Panchami Shraddha · Kunwara Panchami',
    bodyHi: ['पञ्चमी तिथि को दिवंगत पितरों का दिन। कई परम्पराओं में यह उन युवकों के लिए रखा जाता है जिनका विवाह से पूर्व देहान्त हुआ — इसीलिए इसे कुँवारा पञ्चमी भी कहा जाता है।'],
    bodyEn: ['The day for those who passed on a panchami. In many traditions it is kept for those who died unmarried, which is why it is also called Kunwara Panchami.'],
    status: 'draft',
    source: { referenceUrls: [DRIK_SHRADDHA_DAYS], verificationNote: TITHI_DRAFT_NOTE },
  },
  {
    id: 'tithi-6',
    kind: 'tithi',
    fortnightDay: 6,
    titleHi: 'षष्ठी श्राद्ध',
    titleEn: 'Shashthi Shraddha',
    bodyHi: ['षष्ठी तिथि को दिवंगत पितरों का दिन।'],
    bodyEn: ['The day for those who passed on a shashthi.'],
    status: 'draft',
    source: { referenceUrls: [DRIK_SHRADDHA_DAYS], verificationNote: TITHI_DRAFT_NOTE },
  },
  {
    id: 'tithi-7',
    kind: 'tithi',
    fortnightDay: 7,
    titleHi: 'सप्तमी श्राद्ध',
    titleEn: 'Saptami Shraddha',
    bodyHi: ['सप्तमी तिथि को दिवंगत पितरों का दिन।'],
    bodyEn: ['The day for those who passed on a saptami.'],
    status: 'draft',
    source: { referenceUrls: [DRIK_SHRADDHA_DAYS], verificationNote: TITHI_DRAFT_NOTE },
  },
  {
    id: 'tithi-8',
    kind: 'tithi',
    fortnightDay: 8,
    titleHi: 'अष्टमी श्राद्ध',
    titleEn: 'Ashtami Shraddha',
    bodyHi: ['अष्टमी तिथि को दिवंगत पितरों का दिन — पक्ष की सबसे अधिक स्मरण की जाने वाली तिथियों में एक।'],
    bodyEn: ['The day for those who passed on an ashtami — one of the most widely observed tithis of the paksha.'],
    status: 'draft',
    source: { referenceUrls: [DRIK_SHRADDHA_DAYS], verificationNote: TITHI_DRAFT_NOTE },
  },
  {
    id: 'tithi-9',
    kind: 'tithi',
    fortnightDay: 9,
    titleHi: 'नवमी · मातृ नवमी',
    titleEn: 'Navami · Matri Navami',
    bodyHi: ['नवमी को माता और कुल की दिवंगत स्त्रियों का स्मरण किया जाता है; इसे अविधवा नवमी भी कहते हैं — उन स्त्रियों के लिए जिनका देहान्त पति के जीवनकाल में हुआ।'],
    bodyEn: ['Navami is kept for mothers and the departed women of the family; it is also called Avidhava Navami — for women who passed in their husband’s lifetime.'],
    status: 'draft',
    source: { referenceUrls: [DRIK_SHRADDHA_DAYS], verificationNote: TITHI_DRAFT_NOTE },
  },
  {
    id: 'tithi-10',
    kind: 'tithi',
    fortnightDay: 10,
    titleHi: 'दशमी श्राद्ध',
    titleEn: 'Dashami Shraddha',
    bodyHi: ['दशमी तिथि को दिवंगत पितरों का दिन।'],
    bodyEn: ['The day for those who passed on a dashami.'],
    status: 'draft',
    source: { referenceUrls: [DRIK_SHRADDHA_DAYS], verificationNote: TITHI_DRAFT_NOTE },
  },
  {
    id: 'tithi-11',
    kind: 'tithi',
    fortnightDay: 11,
    titleHi: 'एकादशी श्राद्ध',
    titleEn: 'Ekadashi Shraddha',
    bodyHi: ['एकादशी तिथि को दिवंगत पितरों का दिन। पक्ष की यह एकादशी इन्दिरा एकादशी भी कहलाती है।'],
    bodyEn: ['The day for those who passed on an ekadashi. The paksha’s ekadashi is also known as Indira Ekadashi.'],
    status: 'draft',
    source: { referenceUrls: [DRIK_SHRADDHA_DAYS], verificationNote: TITHI_DRAFT_NOTE },
  },
  {
    id: 'tithi-12',
    kind: 'tithi',
    fortnightDay: 12,
    titleHi: 'द्वादशी · सन्यासी श्राद्ध',
    titleEn: 'Dwadashi · Sannyasi Shraddha',
    bodyHi: ['द्वादशी तिथि को दिवंगत पितरों का दिन; कई परम्पराओं में कुल के उन पितरों का स्मरण भी इसी दिन होता है जिन्होंने सन्यास लिया था।'],
    bodyEn: ['The day for those who passed on a dwadashi; in many traditions it also holds the remembrance of those of the family who had taken sannyasa.'],
    status: 'draft',
    source: { referenceUrls: [DRIK_SHRADDHA_DAYS], verificationNote: TITHI_DRAFT_NOTE },
  },
  {
    id: 'tithi-13',
    kind: 'tithi',
    fortnightDay: 13,
    titleHi: 'त्रयोदशी श्राद्ध',
    titleEn: 'Trayodashi Shraddha',
    bodyHi: ['त्रयोदशी तिथि को दिवंगत पितरों का दिन। कुछ परम्पराओं में इस दिन कुल के दिवंगत बालकों का स्मरण भी किया जाता है।'],
    bodyEn: ['The day for those who passed on a trayodashi. Some traditions also remember the family’s departed children on this day.'],
    status: 'draft',
    source: { referenceUrls: [DRIK_SHRADDHA_DAYS], verificationNote: TITHI_DRAFT_NOTE },
  },
  {
    id: 'tithi-14',
    kind: 'tithi',
    fortnightDay: 14,
    titleHi: 'चतुर्दशी · घात चतुर्दशी',
    titleEn: 'Chaturdashi · Ghata Chaturdashi',
    bodyHi: ['कई परम्पराओं में चतुर्दशी उन पितरों के लिए रखी जाती है जिनका देहान्त शस्त्र, दुर्घटना या अकाल मृत्यु से हुआ — तिथि चाहे कोई रही हो। सामान्य चतुर्दशी-तिथि के पितरों का स्मरण कुछ परम्पराएँ अमावस्या को करती हैं।'],
    bodyEn: ['In many traditions chaturdashi is kept for ancestors who died by weapon, accident or an untimely death — whatever their tithi. For an ordinary chaturdashi passing, some traditions move the remembrance to the amavasya.'],
    status: 'draft',
    source: { referenceUrls: [DRIK_SHRADDHA_DAYS], verificationNote: TITHI_DRAFT_NOTE },
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
    bodyHi: ['दिवंगत पूर्वज — जिनका स्मरण श्राद्ध और तर्पण में किया जाता है। संस्कृत मूल पितृ; बहुवचन पितरः।'],
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
    id: 'shabd-jalanjali',
    kind: 'shabd',
    titleHi: 'जलाञ्जलि',
    titleEn: 'Jalanjali',
    bodyHi: ['अञ्जलि — दोनों हथेलियों का दोना — भर जल, जो पितरों के लिए छोड़ा जाता है। रामायण में दशरथ, जटायु और सगरपुत्रों के प्रसंग इसी शब्द से चलते हैं।'],
    bodyEn: ['Water held in the anjali — the two cupped palms — and let fall for the ancestors. The Ramayana’s episodes for Dasharatha, Jatayu and Sagara’s sons all turn on this word.'],
    status: 'verified',
    source: {
      referenceUrls: [VALMIKI_CORPUS, VALMIKI_ARANYA, VALMIKI_NET],
      verificationNote: `${CORPUS_NOTE} Bundled 1.41.15, 3.68.35–36 and 2.102.26 use jalakriyā / jalāñjali for exactly this act.`,
    },
  },
  {
    id: 'shabd-pinda',
    kind: 'shabd',
    titleHi: 'पिण्ड',
    titleEn: 'Pinda',
    bodyHi: ['पितरों को अर्पित अन्न का गोला। पिण्डदान पार्वण श्राद्ध का अंग है; इसकी सामग्री और विधि कुल-परम्परा से तय होती है — वन में श्रीराम ने वहीं उपलब्ध कन्द से पिण्ड बनाया था।'],
    bodyEn: ['A ball of food offered to the pitrs. Pinda-dana is part of the parvana shraddha; its materials and manner are set by family tradition — in the forest Rama made the pinda from what the forest itself gave.'],
    status: 'verified',
    source: {
      referenceUrls: [DHARMA_SINDHU_SHRADDHA, VALMIKI_ARANYA, DRIK_SHRADDHA_DATES],
      verificationNote: `${DOSSIER_NOTE} The forest-materials clause is bundled Aranya 3.68.32–33 and Ayodhya 2.102.29. DrikPanchang's pinda material list is deliberately NOT imposed on a tarpana-only checklist (dossier rule).`,
    },
  },
  {
    id: 'shabd-til',
    kind: 'shabd',
    titleHi: 'तिल',
    titleEn: 'Tila',
    bodyHi: ['काला तिल — तर्पण के जल में मिलाया जाने वाला वह द्रव्य जो खोले गए स्रोतों में सर्वत्र आता है। इसी से इस क्रिया को तिल-तर्पण कहते हैं।'],
    bodyEn: ['Black sesame — the one material attested across every opened source for the water of tarpana. It is what gives tila-tarpana its name.'],
    status: 'verified',
    source: {
      referenceUrls: [DHARMA_SINDHU_SHRADDHA, DRIK_SHRADDHA_DATES, IN_REPO_DOSSIER],
      verificationNote: `${DOSSIER_NOTE} "Clean water and vessel, darbha/kusha, black sesame" is the dossier's recorded core-materials fact.`,
    },
  },
  {
    id: 'shabd-darbha',
    kind: 'shabd',
    titleHi: 'दर्भ · कुश',
    titleEn: 'Darbha · Kusha',
    bodyHi: ['पवित्र घास, जिसका आसन बिछाकर अर्पण किया जाता है। श्रीराम ने पिता के लिए पिण्ड दर्भ के इसी आसन पर रखा था। इसका प्रयोग परिवार की रीति जानने पर ही करें।'],
    bodyEn: ['The sacred grass spread as a seat for the offering. Rama set his father’s pinda on exactly such a bed of darbha. Use it only where your family practice knows its proper use.'],
    status: 'verified',
    source: {
      referenceUrls: [VALMIKI_CORPUS, DHARMA_SINDHU_SHRADDHA, IN_REPO_DOSSIER],
      verificationNote: `${CORPUS_NOTE} Bundled Ayodhya 2.102.29 ("darbha-saṁstare") and Aranya 3.68.32; darbha/kusha is also the dossier's recorded core material.`,
    },
  },
  {
    id: 'shabd-aryama',
    kind: 'shabd',
    titleHi: 'अर्यमा',
    titleEn: 'Aryaman',
    bodyHi: ['पितरों के अधिपति माने गए आदित्य। गीता में श्रीकृष्ण कहते हैं — "पितरों में मैं अर्यमा हूँ" (१०.२९)। तर्पण के सम्बोधनों में यह नाम इसी कारण आता है।'],
    bodyEn: ['The Aditya held to be lord of the pitrs. In the Gita, Krishna says “among the pitrs I am Aryaman” (10.29) — which is why the name appears among tarpana’s addressees.'],
    status: 'verified',
    source: {
      referenceUrls: [GITA_CORPUS_10, GITA_HOLY_10, IN_REPO_DOSSIER],
      verificationNote: `${CORPUS_NOTE} bg-10-29 is verses[28] of chapter-10.json. The tarpana-addressee clause is kept general — the ordered addressee list is branch-specific (RULEBOOK §28.5) and is not supplied.`,
    },
  },
  {
    id: 'shabd-svadha',
    kind: 'shabd',
    titleHi: 'स्वधा',
    titleEn: 'Svadha',
    bodyHi: ['पितरों को दिए जाने वाले अर्पण का वह वचन, जो देवताओं के "स्वाहा" के समानान्तर है। गीता ९.१६ में श्रीकृष्ण स्वयं को स्वधा कहते हैं।'],
    bodyEn: ['The word that carries an offering to the ancestors, the counterpart of svāhā for the devas. In Gita 9.16 Krishna names himself svadhā.'],
    status: 'verified',
    source: {
      referenceUrls: [GITA_CORPUS_09, GITA_HOLY_09, IN_REPO_DOSSIER],
      verificationNote: `${CORPUS_NOTE} bg-9-16 is verses[15] of chapter-09.json; the bundled English renders svadhā as "the offering to the manes".`,
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
    id: 'shabd-aparahna',
    kind: 'shabd',
    titleHi: 'अपराह्न',
    titleEn: 'Aparahna',
    bodyHi: ['दिन का उत्तरार्ध — वह काल जिसमें श्राद्ध का विधान बताया गया है। इसीलिए तिथि का चुनाव सूर्योदय से नहीं, इसी काल की व्याप्ति से होता है।'],
    bodyEn: ['The later part of the day — the span in which shraddha is enjoined. That is why the day is chosen by which tithi covers this span, not by the tithi at sunrise.'],
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
  {
    id: 'shabd-panchabali',
    kind: 'shabd',
    titleHi: 'पञ्चबलि',
    titleEn: 'Panchabali',
    bodyHi: ['श्राद्ध-भोजन के पाँच ग्रास, जो ब्राह्मण-भोजन से पहले गौ, श्वान, काक, देव आदि और पिपीलिका आदि के लिए अलग रखे जाते हैं। भूत-यज्ञ का ही एक रूप; इसका विधान कुल-परम्परा से चलता है।'],
    bodyEn: ['The five portions of the shraddha meal set aside before the brahmana-bhojana — for the cow, the dog, the crow, the devas and others, and the ants and small creatures. A form of bhuta-yajna; its manner follows family tradition.'],
    status: 'draft',
    source: {
      referenceUrls: [NITYA_KARMA_SCAN, IN_REPO_PANCHABALI_DOSSIER],
      verificationNote: PANCHABALI_DRAFT_NOTE,
    },
  },
];

export function getPitruLessons(): readonly PitruLessonEntry[] {
  return PITRU_LESSON_ENTRIES.filter((entry) => entry.status === 'verified');
}
