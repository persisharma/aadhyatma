import type { VidhiEntry } from './types';

const DRIK_VISARJAN =
  'https://www.drikpanchang.com/festivals/ganesh-chaturthi/ganesha-visarjan-puja-vidhi.html?lang=en';
const DRIK_VISARJAN_DATE = 'https://www.drikpanchang.com/festivals/ganesh-chaturthi/ganesha-visarjan-date-time.html';

/**
 * गणेश विसर्जन · उत्तर पूजा — the concluding rite of the household Ganesh arc
 * (PRD-28 Phase B). Offered by the arc strip on the family's OWN visarjan day
 * (1½ / 3 / 5 / 7 / 10 days from their sthapana), never tied to one calendar
 * date — which is why it hooks to Anant Chaturdashi only as the customary
 * ten-day conclusion.
 *
 * STATUS: DRAFT — user-invisible until the RULEBOOK §26 two-source review
 * clears. Instruction-only by design: no visarjan/uttarapuja mantra is
 * transcribed until its exact text is verbatim-verified (§11.3).
 */
export const ganeshVisarjanUttarPuja: VidhiEntry = {
  id: 'ganesh-visarjan-uttar-puja',
  status: 'draft',
  titleHi: 'गणेश विसर्जन · उत्तर पूजा',
  titleEn: 'Ganesh Visarjan · Uttar Puja',
  festivalIds: ['anant-chaturdashi'],
  deities: ['ganesha'],
  conventionLineHi: 'गृह उत्सव-प्रतिमा की उत्तर पूजा व विसर्जन',
  conventionLineEn: 'Household festival-murti uttar puja and immersion',
  durationHintMin: 30,
  samagri: [
    { itemHi: 'अक्षत व पुष्प', itemEn: 'Akshat & flowers' },
    { itemHi: 'दूर्वा', itemEn: 'Durva' },
    { itemHi: 'रोली · हल्दी · चन्दन', itemEn: 'Roli · turmeric · chandan' },
    { itemHi: 'धूप · दीप · कपूर', itemEn: 'Dhoop · lamp · camphor' },
    { itemHi: 'मोदक या लड्डू व दही-भात', itemEn: 'Modak or laddoo & curd-rice', optional: true },
    { itemHi: 'ऋतुफल व नारियल', itemEn: 'Seasonal fruit & coconut' },
    { itemHi: 'विसर्जन के लिए स्वच्छ जल-पात्र (घर पर विसर्जन हो तो)', itemEn: 'A clean water vessel (for home immersion)', optional: true },
    { itemHi: 'नया वस्त्र या थैली — प्रतिमा ले जाने हेतु', itemEn: 'New cloth or bag to carry the murti', optional: true },
  ],
  steps: [
    {
      id: 'sankalp', phase: 'prep', titleHi: 'उत्तर पूजा का संकल्प', titleEn: 'Sankalp for the uttar puja',
      instructionHi: 'जल, अक्षत और पुष्प लेकर उत्सव-काल पूर्ण होने और विदाई पूजन का संकल्प बोलें।',
      instructionEn: 'Hold water, akshat and a flower; state that the festival period is complete and resolve to perform the farewell worship.',
    },
    {
      id: 'panchopachara', phase: 'main', titleHi: 'पंचोपचार पूजन', titleEn: 'Panchopachara worship',
      instructionHi: 'गन्ध, पुष्प व दूर्वा, धूप, दीप और नैवेद्य — पाँच उपचार क्रम से अर्पित करें; मिट्टी की प्रतिमा पर द्रव न लगाएँ।',
      instructionEn: 'Offer the five upacharas in order — gandha, flowers with durva, dhoop, lamp and naivedya; put no liquid on a clay murti.',
    },
    {
      id: 'aarti', phase: 'main', titleHi: 'अन्तिम आरती', titleEn: 'Final aarti',
      instructionHi: 'परिवार सहित अन्तिम आरती करें।',
      instructionEn: 'Offer the final aarti with the whole family.',
      ref: { kind: 'section', id: 'jai-ganesh-deva' },
    },
    {
      id: 'kshama-prarthana', phase: 'main', titleHi: 'क्षमा-प्रार्थना', titleEn: 'Forgiveness prayer',
      instructionHi: 'उत्सव-काल में जाने-अनजाने हुई त्रुटियों के लिए क्षमा माँगें और सबके मंगल की प्रार्थना करें।',
      instructionEn: 'Ask forgiveness for lapses known and unknown during the festival days, and pray for everyone’s well-being.',
    },
    {
      id: 'utthapana', phase: 'main', titleHi: 'उत्थापन', titleEn: 'Utthapana (raising the murti)',
      instructionHi: 'अक्षत छिड़ककर प्रतिमा को उसके स्थान से थोड़ा सरकाएँ — यह विदाई का संकेत है — और अगले वर्ष पुनः पधारने की प्रार्थना करें।',
      instructionEn: 'Sprinkle akshat and gently shift the murti from its seat — the sign of leave-taking — and pray for the return next year.',
    },
    {
      id: 'yatra', phase: 'closing', titleHi: 'विसर्जन यात्रा', titleEn: 'Visarjan procession',
      instructionHi: 'प्रतिमा को स्वच्छ वस्त्र में सम्मान से उठाकर विसर्जन-स्थल तक ले जाएँ; घर पर विसर्जन हो तो जल-पात्र के पास लाएँ।',
      instructionEn: 'Carry the murti respectfully in clean cloth to the immersion place; for a home immersion, bring it to the water vessel.',
    },
    {
      id: 'visarjan', phase: 'closing', titleHi: 'विसर्जन', titleEn: 'Immersion',
      instructionHi: 'केवल उत्सव की मिट्टी की प्रतिमा का विसर्जन करें — स्थायी प्रतिमा का कभी नहीं। बहते या स्वच्छ जल में, अथवा घर के पात्र में धीरे-धीरे विसर्जित करें।',
      instructionEn: 'Immerse only the festival clay murti — never a permanent one — slowly, in flowing or clean water, or in the household vessel.',
    },
    {
      id: 'mitti-prasad', phase: 'closing', titleHi: 'मिट्टी व प्रसाद', titleEn: 'The clay and the prasad',
      instructionHi: 'घर पर विसर्जन हुआ हो तो घुली मिट्टी तुलसी या किसी पौधे में डालें; बचा प्रसाद परिवार व पड़ोस में बाँटें।',
      instructionEn: 'After a home immersion, return the dissolved clay to a tulsi or garden plant; share the remaining prasad with family and neighbours.',
    },
  ],
  source: {
    canonicalEdition: 'Gita Press Nitya Karma Puja Prakash — Ganapati Puja chapter (uttara-puja / visarjana section)',
    canonicalEditionUrls: ['https://archive.org/details/NityaKarmaPujaPrakashGitaPressGorakhpur'],
    canonicalEditionStatus:
      'DRAFT — NOT VERIFIED. Authored 2026-09-03 in a session whose outbound network was refused (proxy 403), so no source was opened. Outstanding before status may flip to verified (RULEBOOK §26): open the code 592 Ganapati chapter’s concluding section and collate this instruction-only sequence against it; open both referenceUrls and confirm concordance on the uttara-puja → aarti → utthapana (akshat) → immersion order and the clay-vs-permanent-murti distinction; named reviewer + dated note.',
    referenceUrls: [DRIK_VISARJAN, DRIK_VISARJAN_DATE],
    retrievedOn: '2026-09-03',
    notes:
      'Candidate review sources only — none opened yet. Instructions are freshly authored from widely practised household custom (RULEBOOK §9); no mantra is transcribed. The utthapana step deliberately describes the act (akshat, shifting the murti, praying for the return) without quoting the customary “punaragamanaya cha” formula until its exact wording is verbatim-verified (§11.3). Home immersion and the return of the clay to a plant are recorded as practice, not as a rule.',
  },
};
