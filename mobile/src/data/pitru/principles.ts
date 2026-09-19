/**
 * शास्त्र-वचन — the verse spine of पितृ पक्ष परिचय (PRD-44 §5.3).
 *
 * Every verified row here is a POINTER into a bundled reader: the Gita rows
 * deep-link `GitaReader {chapter, initialIndex}` and the Valmiki row deep-links
 * `ValmikiRamayanReader`. Verse text is quoted only where it is short, and
 * always alongside the hand-off — this registry never becomes a second copy of
 * scripture. A row is verified when its `ref` resolves to the bundled verse
 * whose number it names (pinned by pitruShikshaContent.test.ts) — the in-repo
 * corpus is one reference and the corpus's own published source the other.
 * ⚠ `source` blocks are review-only provenance.
 */
import type { PitruPrincipleEntry } from './types';

const GITA_CORPUS = 'repo:mobile/src/data/gita/';
const GITA_HOLY = 'https://www.holy-bhagavad-gita.org/chapter/';
const VALMIKI_CORPUS = 'repo:mobile/src/data/valmiki-ramayan/chapter-02.json';
const VALMIKI_NET = 'https://www.valmikiramayan.net/utf8/ayodhya/sarga103/ayodhya_103_frame.htm';

const CORPUS_NOTE =
  '2026-09-19: verse identity (chapter · number · Sanskrit lines) checked against the bundled corpus JSON; the row only points at that verse. The meaning line paraphrases the bundled Hindi/English meaning, adding nothing.';

export const PITRU_PRINCIPLE_ENTRIES: readonly PitruPrincipleEntry[] = [
  {
    id: 'gita-1-42',
    titleHi: 'पिण्ड-उदक क्रिया का लोप — अर्जुन की चिन्ता',
    titleEn: 'When pinda and water lapse — Arjuna’s concern',
    verseLines: ['पतन्ति पितरो ह्येषां लुप्तपिण्डोदकक्रियाः ॥'],
    iastLines: ['patanti pitaro hy eṣāṁ lupta-piṇḍodaka-kriyāḥ'],
    citeHi: 'श्रीमद्भगवद्गीता १.४२',
    citeEn: 'Bhagavad Gita 1.42',
    meaningHi:
      'युद्ध के आरम्भ में अर्जुन कुल-नाश के परिणाम गिनते हुए कहते हैं कि जिस कुल में श्राद्ध और तर्पण — पिण्ड और जल की क्रिया — लुप्त हो जाती है, उसके पितर अपने स्थान से गिर जाते हैं। यह परम्परा का अपना वाक्य है कि पितृ-कर्म क्यों बचाए रखा जाता है।',
    meaningEn:
      'At the battle’s edge, counting the consequences of a family’s ruin, Arjuna says that where the rites of pinda and water lapse, that family’s forebears fall from their place. It is the tradition’s own statement of why pitru-karma is kept alive.',
    ref: { kind: 'gita', chapter: 1, verseIndex: 41 },
    status: 'verified',
    source: {
      referenceUrls: [`${GITA_CORPUS}chapter-01.json`, `${GITA_HOLY}1`],
      verificationNote: `${CORPUS_NOTE} bg-1-42 is verses[41] of chapter-01.json.`,
    },
  },
  {
    id: 'gita-9-25',
    titleHi: 'पितृव्रता पितरों को पाते हैं',
    titleEn: 'Those devoted to the pitrs reach the pitrs',
    verseLines: ['यान्ति देवव्रता देवान् पितृन् यान्ति पितृव्रताः ।'],
    iastLines: ['yānti deva-vratā devān pitṝn yānti pitṛ-vratāḥ'],
    citeHi: 'श्रीमद्भगवद्गीता ९.२५',
    citeEn: 'Bhagavad Gita 9.25',
    meaningHi:
      'श्रीकृष्ण कहते हैं कि देवताओं के उपासक देवताओं को, पितरों के उपासक पितरों को प्राप्त होते हैं — और जो उन्हें भजते हैं, वे उन्हें। यह श्लोक पितृ-उपासना को स्वीकार करता है और उसे भगवद्भक्ति के व्यापक सन्दर्भ में रखता है।',
    meaningEn:
      'Krishna says that worshippers of the devas go to the devas and worshippers of the pitrs go to the pitrs — and those who worship Him come to Him. The verse acknowledges pitru-worship and sets it within the wider frame of devotion.',
    ref: { kind: 'gita', chapter: 9, verseIndex: 24 },
    status: 'verified',
    source: {
      referenceUrls: [`${GITA_CORPUS}chapter-09.json`, `${GITA_HOLY}9`],
      verificationNote: `${CORPUS_NOTE} bg-9-25 is verses[24] of chapter-09.json.`,
    },
  },
  {
    id: 'gita-2-20',
    titleHi: 'न जायते म्रियते वा — अध्याय २ क्यों पढ़ा जाता है',
    titleEn: 'Never born, never dying — why Chapter 2 is read',
    verseLines: ['न जायते म्रियते वा कदाचिन्', 'नायं भूत्वा भविता वा न भूयः ।'],
    iastLines: ['na jāyate mriyate vā kadācin', 'nāyaṁ bhūtvā bhavitā vā na bhūyaḥ'],
    citeHi: 'श्रीमद्भगवद्गीता २.२०',
    citeEn: 'Bhagavad Gita 2.20',
    meaningHi:
      'शरीरी न जन्मता है, न मरता है; वह नित्य, शाश्वत और पुराण है। परिवार शोक और श्राद्ध के दिनों में गीता का दूसरा अध्याय इसी आश्वासन के लिए पढ़ते हैं — यह पाठ स्मरण है, विधि का स्थानापन्न नहीं।',
    meaningEn:
      'The embodied one is never born and never dies; it is eternal, everlasting, ancient. Families read the Gita’s second chapter in days of grief and shraddha for this assurance — as remembrance, not as a substitute for the rite.',
    ref: { kind: 'gita', chapter: 2, verseIndex: 19 },
    status: 'verified',
    source: {
      referenceUrls: [`${GITA_CORPUS}chapter-02.json`, `${GITA_HOLY}2`],
      verificationNote: `${CORPUS_NOTE} bg-2-20 is verses[19] of chapter-02.json. Chapter 2 is already the shipped PRD-17 गीता पाठ hand-off.`,
    },
  },
  {
    id: 'valmiki-2-102-27',
    titleHi: 'श्रीराम की जलाञ्जलि — मन्दाकिनी तट पर',
    titleEn: 'Rama’s water-offering on the Mandakini bank',
    verseLines: ['एतत्ते राजशार्दूल विमलं तोयमक्षयम् ।', 'पितृलोकगतस्याद्य मद्दत्तमुपतिष्ठतु ॥'],
    iastLines: ['etat te rājaśārdūla vimalaṁ toyam akṣayam', 'pitṛloka-gatasyādya mad-dattam upatiṣṭhatu'],
    citeHi: 'वाल्मीकि रामायण · अयोध्याकाण्ड २.१०२.२७',
    citeEn: 'Valmiki Ramayana · Ayodhya Kanda 2.102.27',
    meaningHi:
      'पिता के देहान्त का समाचार पाकर श्रीराम भरत और लक्ष्मण के साथ मन्दाकिनी में उतरते हैं, दक्षिण दिशा की ओर मुख कर जल की अञ्जलि लेते हैं और कहते हैं — पितृलोक में गए हुए आपको मेरा दिया यह निर्मल, अक्षय जल आज प्राप्त हो। तर्पण का यह भाव — तृप्ति की कामना — हज़ारों वर्ष से यही है।',
    meaningEn:
      'Hearing of his father’s passing, Rama descends into the Mandakini with Bharata and Lakshmana, faces south with cupped hands full of water, and says: to you who have gone to the world of the pitrs, may this clear, undiminishing water I give reach you today. The spirit of tarpana — the wish that they be satisfied — has been this for thousands of years.',
    ref: { kind: 'valmiki', chapter: 2, verseIndex: 3715 },
    status: 'verified',
    source: {
      referenceUrls: [VALMIKI_CORPUS, VALMIKI_NET],
      verificationNote: `${CORPUS_NOTE} valmiki-2-102-27 is verses[3715] of chapter-02.json (reference 2.102.27). Sarga numbering follows the bundled Southern-recension text; the Gita Press edition numbers this sarga 103.`,
    },
  },
  {
    id: 'manu-3-70',
    titleHi: 'पञ्च महायज्ञ — पितृ-यज्ञ नित्य कर्म है',
    titleEn: 'The five great yajnas — pitru-yajna as daily duty',
    citeHi: 'मनुस्मृति ३.७०',
    citeEn: 'Manusmriti 3.70',
    meaningHi:
      'गृहस्थ के पाँच नित्य महायज्ञ — ब्रह्मयज्ञ (अध्ययन), पितृयज्ञ (तर्पण), देवयज्ञ (होम), भूतयज्ञ (बलि) और नृयज्ञ (अतिथि-सत्कार)। पितरों का नित्य तर्पण इनमें दूसरा है।',
    meaningEn:
      'The householder’s five daily great yajnas — study (brahma), tarpana for the pitrs (pitru), homa for the devas (deva), offerings to all beings (bhuta) and hospitality (nri). Daily tarpana for the ancestors is the second of them.',
    status: 'draft',
    source: {
      referenceUrls: ['https://www.wisdomlib.org/hinduism/book/manusmriti-with-the-commentary-of-medhatithi'],
      verificationNote:
        '2026-09-19: DRAFT — NOT VERIFIED. Verse text and the yajna enumeration must be opened at the cited edition and a second concordant reference recorded; no source was opened this session (no outbound network). Not in any bundled reader, so the verse is not quoted.',
    },
  },
];

export function getPitruPrinciples(): readonly PitruPrincipleEntry[] {
  return PITRU_PRINCIPLE_ENTRIES.filter((entry) => entry.status === 'verified');
}
