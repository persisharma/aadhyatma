import type { VidhiEntry } from './types';

const DRIK_GANESH =
  'https://www.drikpanchang.com/festivals/ganesh-chaturthi/ganesha-chaturthi-puja-vidhi.html?lang=en';

/** गणेश चतुर्थी स्थापना — new clay murti installation and first-day worship. */
export const ganeshChaturthiSthapana: VidhiEntry = {
  id: 'ganesh-chaturthi-sthapana',
  titleHi: 'गणेश चतुर्थी स्थापना',
  titleEn: 'Ganesh Chaturthi Sthapana',
  festivalIds: ['ganesh-chaturthi'],
  deities: ['ganesha'],
  conventionLineHi: 'गृह स्थापना व प्रथम-दिवस पूजन',
  conventionLineEn: 'Household installation and first-day worship',
  durationHintMin: 45,
  samagri: [
    { itemHi: 'मिट्टी की श्री गणेश प्रतिमा', itemEn: 'Clay murti of Shri Ganesha', qty: '1' },
    { itemHi: 'चौकी व लाल/पीला वस्त्र', itemEn: 'Chowki & red/yellow cloth', qty: '1' },
    { itemHi: 'कलश, जल, पत्ते व नारियल', itemEn: 'Kalash, water, leaves & coconut' },
    { itemHi: 'अक्षत', itemEn: 'Akshat' },
    { itemHi: 'रोली · हल्दी · सिन्दूर · अष्टगन्ध', itemEn: 'Roli · turmeric · sindoor · ashtagandha' },
    { itemHi: 'मौली व छोटा वस्त्र', itemEn: 'Mauli & small cloth' },
    { itemHi: 'यज्ञोपवीत', itemEn: 'Yajnopavita', optional: true },
    { itemHi: 'लाल पुष्प व माला', itemEn: 'Red flowers & garland' },
    { itemHi: 'दूर्वा (21 दल हों तो उत्तम)', itemEn: 'Durva (preferably 21 blades)' },
    { itemHi: 'मोदक या लड्डू', itemEn: 'Modak or laddoo' },
    { itemHi: 'ऋतुफल व नारियल', itemEn: 'Seasonal fruit & coconut' },
    { itemHi: 'पंचामृत व शुद्ध जल', itemEn: 'Panchamrit & clean water' },
    { itemHi: 'धूप · दीप · घी · बाती · कपूर', itemEn: 'Dhoop · lamp · ghee · wicks · camphor' },
    { itemHi: 'पान · सुपारी · दक्षिणा', itemEn: 'Paan · betel nut · dakshina', optional: true },
  ],
  steps: [
    {
      id: 'sthana-sajja', phase: 'prep', titleHi: 'स्थान व चौकी सज्जा', titleEn: 'Prepare the shrine and chowki',
      instructionHi: 'स्वच्छ स्थान पर चौकी रखकर लाल या पीला वस्त्र बिछाएँ और अक्षत का आसन बनाएँ।',
      instructionEn: 'Place the chowki in a clean area, cover it with red or yellow cloth, and make a seat of akshat.',
    },
    {
      id: 'kalash-murti', phase: 'prep', titleHi: 'कलश व प्रतिमा तैयार करें', titleEn: 'Prepare the kalash and murti',
      instructionHi: 'कलश स्थापित करें और ढकी हुई मिट्टी की प्रतिमा चौकी के पास रखें; स्थापना से पहले प्रतिमा को स्नान न कराएँ।',
      instructionEn: 'Set the kalash and keep the covered clay murti beside the chowki; do not bathe a clay murti before installation.',
    },
    {
      id: 'sankalp', phase: 'prep', titleHi: 'संकल्प', titleEn: 'Sankalp (vow)',
      instructionHi: 'जल, अक्षत और पुष्प लेकर अपना नाम, गोत्र और तिथि बोलें तथा गणेश स्थापना और पूजन का संकल्प लें।',
      instructionEn: 'Hold water, akshat and a flower; state your name, gotra and tithi, and resolve to install and worship Shri Ganesha.',
    },
    {
      id: 'avahana-pratishtha', phase: 'main', titleHi: 'आवाहन व प्रतिष्ठापन', titleEn: 'Avahana & pratishthapana',
      instructionHi: 'प्रतिमा को अक्षत के आसन पर स्थापित कर श्री गणेश का आवाहन करें। घर में नित्य पूजित स्थायी प्रतिमा हो तो आवाहन-प्रतिष्ठा दोबारा न करें।',
      instructionEn: 'Seat the murti on the akshat and invoke Shri Ganesha. Skip a new avahana-pratishtha for a permanent murti already worshipped daily.',
    },
    {
      id: 'ganesh-vandana', phase: 'main', titleHi: 'गणेश वन्दना', titleEn: 'Ganesha vandana',
      instructionHi: 'स्थापना के बाद "वक्रतुण्ड महाकाय" गणेश वन्दना का पाठ करें — सभी विघ्नों के नाश की प्रार्थना।',
      instructionEn: 'After the installation, recite the "Vakratunda Mahakaya" Ganesha vandana — a prayer for the removal of all obstacles.',
      ref: { kind: 'section', id: 'ganesh-stotram' },
    },
    {
      id: 'asana-padya', phase: 'main', titleHi: 'आसन व पाद्य', titleEn: 'Asana & padya',
      instructionHi: 'पाँच पुष्प से आसन अर्पित करें और चरण प्रक्षालन के लिए थोड़ा जल प्रतीक रूप में अर्पित करें।',
      instructionEn: 'Offer a seat with five flowers and symbolically offer a little water for washing the feet.',
    },
    {
      id: 'arghya-achamana', phase: 'main', titleHi: 'अर्घ्य व आचमन', titleEn: 'Arghya & achamana',
      instructionHi: 'सुगन्धित जल से अर्घ्य दें और आचमन के लिए शुद्ध जल अर्पित करें।',
      instructionEn: 'Offer scented water as arghya and clean water for achamana.',
    },
    {
      id: 'snana', phase: 'main', titleHi: 'स्नान', titleEn: 'Snana',
      instructionHi: 'मिट्टी की प्रतिमा पर पुष्प से जल के छींटे देकर प्रतीकात्मक स्नान कराएँ; धातु की प्रतिमा हो तो ही पंचामृत और जल प्रयोग करें।',
      instructionEn: 'For a clay murti, offer symbolic snana by sprinkling water with a flower; use panchamrit and water only for a suitable metal murti.',
    },
    {
      id: 'vastra-yajnopavita', phase: 'main', titleHi: 'वस्त्र व यज्ञोपवीत', titleEn: 'Vastra & yajnopavita',
      instructionHi: 'छोटा वस्त्र या मौली और यज्ञोपवीत अर्पित करें; प्रतिमा पर बल लगाकर कुछ न बाँधें।',
      instructionEn: 'Offer a small cloth or mauli and the sacred thread; do not tie anything tightly around the murti.',
    },
    {
      id: 'gandha-sindura', phase: 'main', titleHi: 'गन्ध व सिन्दूर', titleEn: 'Gandha & sindoor',
      instructionHi: 'चन्दन या अष्टगन्ध, हल्दी, रोली और सिन्दूर अर्पित करें। मिट्टी की प्रतिमा पर बहुत कम द्रव लगाएँ।',
      instructionEn: 'Offer chandan or ashtagandha, turmeric, roli and sindoor. Use very little liquid on a clay murti.',
    },
    {
      id: 'pushpa-durva', phase: 'main', titleHi: 'पुष्प व दूर्वा', titleEn: 'Flowers & durva',
      instructionHi: 'लाल पुष्प, माला और स्वच्छ दूर्वा अर्पित करें; उपलब्ध हो तो 21 दूर्वा-दल चढ़ाएँ।',
      instructionEn: 'Offer red flowers, a garland and clean durva; offer 21 blades when available.',
    },
    {
      id: 'dhoop-deep', phase: 'main', titleHi: 'धूप व दीप', titleEn: 'Dhoop & dipa',
      instructionHi: 'धूप दिखाएँ और घी का दीपक घुमाकर प्रकाश अर्पित करें। दीप को प्रतिमा और वस्त्र से सुरक्षित दूरी पर रखें।',
      instructionEn: 'Present dhoop and circle the ghee lamp. Keep the flame a safe distance from the murti and cloth.',
    },
    {
      id: 'naivedya', phase: 'main', titleHi: 'मोदक नैवेद्य', titleEn: 'Modak naivedya',
      instructionHi: 'मोदक या लड्डू, फल, नारियल और जल अर्पित करें; थोड़ी देर बाद यही प्रसाद परिवार में बाँटें।',
      instructionEn: 'Offer modak or laddoo, fruit, coconut and water; later share this offering as prasad.',
    },
    {
      id: 'katha', phase: 'main', titleHi: 'गणेश चतुर्थी व्रत कथा', titleEn: 'Ganesh Chaturthi vrat katha',
      instructionHi: 'परिवार सहित गणेश चतुर्थी व्रत कथा पढ़ें या सुनें।',
      instructionEn: 'Read or listen to the Ganesh Chaturthi vrat katha with the family.',
      ref: { kind: 'katha', id: 'ganesha-chaturthi-vrat-katha' },
    },
    {
      id: 'aarti', phase: 'main', titleHi: 'आरती', titleEn: 'Aarti',
      instructionHi: 'कपूर या घी के दीप से आरती करें और परिवार सहित जय गणेश देवा गाएँ।',
      instructionEn: 'Offer aarti with camphor or a ghee lamp and sing Jai Ganesh Deva with the family.',
      ref: { kind: 'section', id: 'jai-ganesh-deva' },
    },
    {
      id: 'pushpanjali-kshama', phase: 'closing', titleHi: 'पुष्पांजलि व क्षमा-प्रार्थना', titleEn: 'Pushpanjali & forgiveness prayer',
      instructionHi: 'पुष्पांजलि अर्पित कर जाने-अनजाने हुई त्रुटियों के लिए क्षमा माँगें और सबके मंगल की प्रार्थना करें।',
      instructionEn: 'Offer pushpanjali, ask forgiveness for known and unknown lapses, and pray for everyone’s well-being.',
    },
    {
      id: 'daily-seva', phase: 'closing', titleHi: 'दैनिक सेवा का संकल्प', titleEn: 'Resolve the daily seva',
      instructionHi: 'विसर्जन तक प्रतिदिन दीप, पुष्प और नैवेद्य अर्पित करें। स्थायी प्रतिमा का विसर्जन न करें; उत्सव की मिट्टी की प्रतिमा का ही परम्परा अनुसार विसर्जन करें।',
      instructionEn: 'Offer a lamp, flowers and naivedya daily until visarjan. Never immerse a permanent murti; only the festival clay murti is immersed according to family tradition.',
    },
  ],
  source: {
    canonicalEdition: 'Gita Press Nitya Karma Puja Prakash — Ganapati Puja chapter',
    canonicalEditionUrls: ['https://archive.org/search?query=nitya+karma+puja+prakash+gita+press'],
    canonicalEditionStatus: 'PENDING — the named Gita Press scan has not yet been checked character-by-character; this entry therefore publishes no inline installation mantra. Re-attempted 2026-08-14: archive.org egress is blocked from this authoring environment as well.',
    referenceUrls: [DRIK_GANESH, 'https://ganeshchaturthi.com/important-how-tos/how-to-perform-ganesh-staphna/'],
    retrievedOn: '2026-08-13',
    notes: 'The sequence follows DrikPanchang’s Ganesha Chaturthi Shodashopachara order and the independent household sthapana guide. Clay-murti handling and the permanent-murti avahana/visarjan distinction are explicit. Instructions are freshly authored; exact installation mantras remain omitted pending canonical comparison. 2026-08-14: a Ganesha-vandana step now hands off to the shipped, verified ganesh-stotram section ("Vakratunda Mahakaya") — reference, never re-typed (§11.11/PRD-19 §3.3).',
  },
};
