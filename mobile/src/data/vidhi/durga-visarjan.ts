import type { VidhiEntry } from './types';

const DRIK_DURGA_VISARJAN = 'https://www.drikpanchang.com/navratri/durga-visarjan-date-time.html?lang=en';
const DRIK_NAVRATRI_PARANA = 'https://www.drikpanchang.com/navratri/navratri-parana-date-time.html?lang=en';

/**
 * नवरात्रि विसर्जन · कलश उत्थापन — the concluding rite of the household
 * Navratri arc (PRD-28 Phase B): raising the ghatasthapana kalash, the last
 * aarti, the jawara (barley shoots) and, where a festival murti was installed,
 * its immersion. Offered by the arc strip on Vijayadashami.
 *
 * STATUS: DRAFT — user-invisible until the RULEBOOK §26 two-source review
 * clears. Instruction-only; deliberately narrow — no Aparajita puja, Shami
 * puja or Bengali dhunuchi/sindoor-khela sequence is claimed.
 */
export const durgaVisarjan: VidhiEntry = {
  id: 'durga-visarjan',
  status: 'draft',
  titleHi: 'नवरात्रि विसर्जन · कलश उत्थापन',
  titleEn: 'Navratri Visarjan · Kalash Utthapana',
  festivalIds: ['dussehra'],
  deities: ['durga'],
  conventionLineHi: 'उत्तर भारतीय गृह-परम्परा — घट उत्थापन, जवारे व प्रतिमा विसर्जन',
  conventionLineEn: 'North Indian household form — kalash raising, jawara and murti immersion',
  durationHintMin: 30,
  samagri: [
    { itemHi: 'अक्षत व पुष्प', itemEn: 'Akshat & flowers' },
    { itemHi: 'रोली · हल्दी · कुमकुम', itemEn: 'Roli · turmeric · kumkum' },
    { itemHi: 'धूप · दीप · कपूर', itemEn: 'Dhoop · lamp · camphor' },
    { itemHi: 'भोग — हलवा, चना, पूरी या फल', itemEn: 'Bhog — halwa, chana, puri or fruit', optional: true },
    { itemHi: 'स्वच्छ जल-पात्र (घर पर विसर्जन हो तो)', itemEn: 'A clean water vessel (for home immersion)', optional: true },
    { itemHi: 'लाल वस्त्र — जवारे व प्रतिमा ले जाने हेतु', itemEn: 'Red cloth to carry the jawara and murti', optional: true },
  ],
  steps: [
    {
      id: 'sankalp', phase: 'prep', titleHi: 'विसर्जन संकल्प', titleEn: 'Sankalp for the conclusion',
      instructionHi: 'जल, अक्षत और पुष्प लेकर नवरात्रि व्रत-पूजन पूर्ण होने और घट उत्थापन का संकल्प बोलें।',
      instructionEn: 'Hold water, akshat and a flower; state that the Navratri worship is complete and resolve to raise the kalash.',
    },
    {
      id: 'antim-puja', phase: 'main', titleHi: 'देवी की अन्तिम पूजा', titleEn: 'Final worship of the Devi',
      instructionHi: 'गन्ध, पुष्प, धूप, दीप और भोग क्रम से अर्पित करें; नौ दिनों की सेवा के लिए कृतज्ञता प्रकट करें।',
      instructionEn: 'Offer gandha, flowers, dhoop, lamp and bhog in order; give thanks for the nine days of seva.',
    },
    {
      id: 'aarti', phase: 'main', titleHi: 'अन्तिम आरती', titleEn: 'Final aarti',
      instructionHi: 'परिवार सहित अन्तिम आरती करें।',
      instructionEn: 'Offer the final aarti with the whole family.',
      ref: { kind: 'section', id: 'jai-ambe-gauri' },
    },
    {
      id: 'kshama-prarthana', phase: 'main', titleHi: 'क्षमा-प्रार्थना', titleEn: 'Forgiveness prayer',
      instructionHi: 'व्रत व पूजा में जाने-अनजाने हुई त्रुटियों के लिए क्षमा माँगें और परिवार के मंगल की प्रार्थना करें।',
      instructionEn: 'Ask forgiveness for lapses known and unknown in the vrat and worship, and pray for the family’s well-being.',
    },
    {
      id: 'kalash-utthapana', phase: 'main', titleHi: 'कलश उत्थापन', titleEn: 'Raising the kalash',
      instructionHi: 'अक्षत छिड़ककर घटस्थापना का कलश उसके स्थान से उठाएँ; कलश का जल घर के कोनों में छिड़कें और शेष तुलसी या पौधे में डालें।',
      instructionEn: 'Sprinkle akshat and lift the ghatasthapana kalash from its seat; sprinkle its water in the corners of the home and pour the rest on a tulsi or garden plant.',
    },
    {
      id: 'jawara', phase: 'closing', titleHi: 'जवारे', titleEn: 'Jawara (barley shoots)',
      instructionHi: 'जवारे काटकर कुछ दल देवी को और परिवार के सदस्यों को दें; शेष जवारे जल में या मिट्टी में विसर्जित करें।',
      instructionEn: 'Cut the barley shoots; offer a few blades to the Devi and to family members, and return the rest to water or soil.',
    },
    {
      id: 'visarjan', phase: 'closing', titleHi: 'प्रतिमा विसर्जन', titleEn: 'Murti immersion',
      instructionHi: 'उत्सव के लिए स्थापित मिट्टी की प्रतिमा ही विसर्जित करें — घर की स्थायी प्रतिमा नहीं। लाल वस्त्र में सम्मान से लेकर स्वच्छ जल या घर के पात्र में धीरे-धीरे विसर्जन करें।',
      instructionEn: 'Immerse only a clay murti installed for the festival — never the household’s permanent one. Carry it respectfully in red cloth and immerse slowly in clean water or the household vessel.',
    },
    {
      id: 'prasad', phase: 'closing', titleHi: 'प्रसाद वितरण', titleEn: 'Prasad',
      instructionHi: 'भोग का प्रसाद परिवार व पड़ोस में बाँटें; व्रत हो तो परम्परा अनुसार पारण करें।',
      instructionEn: 'Share the bhog as prasad with family and neighbours; if fasting, break the fast as your tradition keeps it.',
    },
  ],
  source: {
    canonicalEdition: 'Gita Press Nitya Karma Puja Prakash — Navaratra kalash worship chapter (concluding section)',
    canonicalEditionUrls: ['https://archive.org/details/NityaKarmaPujaPrakashGitaPressGorakhpur'],
    canonicalEditionStatus:
      'DRAFT — NOT VERIFIED. Authored 2026-09-03 in a session whose outbound network was refused (proxy 403), so no source was opened. Outstanding before status may flip to verified (RULEBOOK §26): open the code 592 Navaratra chapter’s concluding section (kalash worship begins printed p. 202) and collate this instruction-only sequence; open both referenceUrls and confirm concordance on Dashami as the visarjan day and the kalash/jawara handling; record the regional scope (North Indian household) in a variantNote; named reviewer + dated note.',
    referenceUrls: [DRIK_DURGA_VISARJAN, DRIK_NAVRATRI_PARANA],
    retrievedOn: '2026-09-03',
    notes:
      'Candidate review sources only — none opened yet. Deliberately narrow: this is the household kalash-utthapana and murti farewell; it does not claim Aparajita or Shami puja, Bengali dhunuchi/sindoor khela, or any regional visarjan liturgy. Instructions are freshly authored (§9), no mantra is transcribed (§11.3). The Kanya Pujan preparation that the arc surfaces a day early comes from the shipped navratri-ghatasthapana vidhi + PRD-23 navratri-bhog profile, not from this entry.',
  },
};
