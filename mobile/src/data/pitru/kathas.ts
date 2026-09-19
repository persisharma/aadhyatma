/**
 * पितृ-कथाएँ — the teaching stories of पितृ पक्ष परिचय (PRD-44 §5.4).
 *
 * The verified katha is retold verse-by-verse from the BUNDLED Valmiki
 * Ramayana (Ayodhya Kanda 2.102.20–30 in the shipped Southern-recension
 * numbering) and hands off into that reader — nothing in it is invented. The
 * Karna legend that popular tellings attach to the paksha's origin is DRAFT:
 * it is not in the Mahabharata's critical text, and its provenance must be
 * named honestly (लोक-कथा) before it can render. ⚠ `source` blocks are
 * review-only provenance — never rendered; `canon*` is the rendered line.
 */
import type { PitruKathaEntry } from './types';

const VALMIKI_CORPUS = 'repo:mobile/src/data/valmiki-ramayan/chapter-02.json';
const VALMIKI_NET = 'https://www.valmikiramayan.net/utf8/ayodhya/sarga103/ayodhya_103_frame.htm';

export const PITRU_KATHA_ENTRIES: readonly PitruKathaEntry[] = [
  {
    id: 'rama-jalanjali',
    titleHi: 'चित्रकूट में श्रीराम का पितृ-कर्म',
    titleEn: 'Rama’s rite for his father at Chitrakoot',
    subtitleHi: 'अयोध्याकाण्ड — मन्दाकिनी तट पर जलाञ्जलि और पिण्ड',
    subtitleEn: 'Ayodhya Kanda — water and pinda on the Mandakini bank',
    sections: [
      {
        id: 'katha',
        paragraphsHi: [
          'भरत चित्रकूट पहुँचे और श्रीराम को महाराज दशरथ के देहान्त का समाचार दिया। शोक से व्याकुल राम ने सबसे पहले वही किया जो पुत्र का धर्म था — उन्होंने लक्ष्मण से कहा: इंगुदी का पिण्याक और उत्तरीय वस्त्र ले आओ; मैं महात्मा पिता की जलक्रिया के लिए नदी तट पर जाऊँगा।',
          'सीता आगे चलीं, लक्ष्मण उनके साथ, और राम सबके पीछे — क्योंकि मार्ग कठिन था। सुमन्त्र ने राजकुमारों को ढाढस बँधाया और उन्हें मन्दाकिनी के पावन तट पर उतारा। निर्मल, तीव्र धारा के पास पहुँचकर उन्होंने राजा के लिए जल छोड़ा — "तात, यह आपके लिए है।"',
          'फिर राम ने अञ्जलि में जल भरा, दक्षिण दिशा — पितरों की दिशा — की ओर मुख किया और रोते हुए कहा: हे राजशार्दूल! पितृलोक में गए हुए आपको मेरा दिया यह निर्मल, अक्षय जल आज प्राप्त हो।',
          'तट से बाहर आकर तेजस्वी राघव ने भाइयों के साथ पिता के लिए निवाप — पिण्डदान — किया। वन में उनके पास जो था, वही अर्पित किया: इंगुदी के गूदे में बेर मिलाकर दर्भ के आसन पर रखा, और दुःख से आर्त होकर बोले — महाराज, प्रसन्न होकर इसे ग्रहण करें; जो हम खाते हैं, वही आपको अर्पित है — क्योंकि मनुष्य जैसा अन्न स्वयं खाता है, उसके पितर भी वही पाते हैं।',
          'चारों भाइयों और वैदेही के रुदन की प्रतिध्वनि पर्वत में गूँज उठी, और भरत की सेना समझ गई कि भाई मिल गए हैं और पिता का शोक कर रहे हैं।',
        ],
        paragraphsEn: [
          'Bharata reached Chitrakoot and told Rama that King Dasharatha had died. Stricken, Rama turned first to a son’s duty — he told Lakshmana: bring the pulp of the ingudi fruit and an upper cloth of bark; I will go to the river for my noble father’s water-rite.',
          'Sita walked ahead, Lakshmana beside her, and Rama behind them both, for the path was hard. Sumantra steadied the princes and led them down to the Mandakini’s sacred bank. Reaching the clear, swift stream they let fall water for the king — “Father, this is for you.”',
          'Then Rama filled his cupped hands, turned to the south — the direction of the pitrs — and said through tears: O tiger among kings, to you who have gone to the world of the ancestors, may this clear, undiminishing water that I give reach you today.',
          'Coming up from the bank, the radiant Raghava made the nivapa — the pinda offering — for his father with his brothers. He offered what the forest had given them: ingudi pulp mixed with jujube, set on a bed of darbha grass, and said in grief — great king, accept this gladly; what we eat is what we offer you, for whatever food a man himself eats, that is what his ancestors receive.',
          'The weeping of the four brothers and of Vaidehi echoed from the mountain, and Bharata’s soldiers understood that the brothers had met, and were mourning their father.',
        ],
      },
    ],
    teachingHi:
      'श्राद्ध का मूल भाव सामग्री में नहीं, श्रद्धा में है — राम ने राजसी पदार्थ नहीं, वन का इंगुदी-पिण्याक अर्पित किया, और वही पर्याप्त था। जो परिवार के पास है, वही अर्पण है।',
    teachingEn:
      'The heart of shraddha is shraddha — faith — not the materials. Rama offered no royal fare but the forest’s ingudi pulp, and it was enough. What the family has is what the family offers.',
    canonHi: 'वाल्मीकि रामायण · अयोध्याकाण्ड, सर्ग १०२–१०३',
    canonEn: 'Valmiki Ramayana · Ayodhya Kanda, sargas 102–103',
    ref: { kind: 'valmiki', chapter: 2, verseIndex: 3708 },
    status: 'verified',
    source: {
      referenceUrls: [VALMIKI_CORPUS, VALMIKI_NET],
      verificationNote:
        '2026-09-19: retelling drawn sentence-by-sentence from the bundled corpus verses 2.102.20–35 (verses[3708..3723] of chapter-02.json — the ingudi request, the order of walking, Sumantra, the jalanjali facing south, the nivapa of ingudi + badari on darbha, "yad-annaḥ puruṣo bhavati tad-annās tasya devatāḥ", the echo). No episode added. Sarga numbering follows the bundled Southern-recension text; Gita Press numbers it 103 — the external URL points at that sarga.',
    },
  },
  {
    id: 'karna-mahalaya',
    titleHi: 'कर्ण और पितृ पक्ष के सोलह दिन',
    titleEn: 'Karna and the sixteen days',
    subtitleHi: 'लोक-कथा — पक्ष के आरम्भ की प्रचलित कथा',
    subtitleEn: 'A folk katha — the popular story of the paksha’s origin',
    sections: [
      {
        id: 'katha',
        paragraphsHi: [
          'कथा कहती है कि कुरुक्षेत्र में देह त्यागने के बाद दानवीर कर्ण स्वर्ग पहुँचे, तो वहाँ भोजन के स्थान पर उन्हें सोना और रत्न ही परोसे गए। कर्ण ने कारण पूछा। उत्तर मिला — जीवन भर आपने सोना ही दान किया, अन्न नहीं; और अपने पितरों को कभी जल-अन्न अर्पित नहीं किया, क्योंकि आप उन्हें जानते ही नहीं थे।',
          'कर्ण ने कहा कि यह उनका अज्ञान था, अपराध नहीं। तब उन्हें सोलह दिन के लिए पृथ्वी पर लौटने की अनुमति मिली, ताकि वे अपने पितरों का स्मरण कर उन्हें अन्न-जल अर्पित कर सकें। वही सोलह दिन, कथा के अनुसार, पितृ पक्ष कहलाए।',
        ],
        paragraphsEn: [
          'The story goes that when Karna, the great giver, reached the heavens after Kurukshetra, he was served gold and jewels in place of food. He asked why. The answer: all your life you gave gold, never food — and you never offered water or food to your own ancestors, for you did not know who they were.',
          'Karna replied that this was ignorance, not fault. He was then allowed to return to the earth for sixteen days, to remember his forebears and offer them food and water. Those sixteen days, the katha says, became Pitru Paksha.',
        ],
      },
    ],
    teachingHi:
      'पितरों का स्मरण अन्न-जल का ही भाव है — सोने का नहीं। और जो अपने पितरों को न जानता हो, उसके लिए भी सर्वपितृ अमावस्या का द्वार खुला है।',
    teachingEn:
      'Remembering the ancestors is a matter of food and water — not gold. And for one who does not know their forebears, the door of Sarvapitri Amavasya still stands open.',
    canonHi: 'लोक-परम्परा — महाभारत के मूल पाठ में नहीं',
    canonEn: 'Folk tradition — not in the Mahabharata’s critical text',
    status: 'draft',
    source: {
      referenceUrls: ['https://www.drikpanchang.com/shraddha/pitru-paksha-shraddha-dates.html'],
      verificationNote:
        '2026-09-19: DRAFT — NOT VERIFIED. Widely told; provenance is popular tradition, not the critical Mahabharata (the Karna–Indra kavach episode in data/daan/kathas.ts is a different, canonical story). Before flipping: record two published tellings that agree on the gold-not-food and the sixteen-day return, and keep the "folk katha" label on the rendered canon line.',
    },
  },
];

export function getPitruKathas(): readonly PitruKathaEntry[] {
  return PITRU_KATHA_ENTRIES.filter((entry) => entry.status === 'verified');
}

export function getPitruKatha(id: string): PitruKathaEntry | null {
  return getPitruKathas().find((entry) => entry.id === id) ?? null;
}
