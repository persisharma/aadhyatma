/**
 * Ketu — the narrative-voice reading (design.md §78).
 *
 * A shadow graha: no dignity, no sign it owns, always retrograde and never
 * combust in the chart, so it only ever reaches the `neutral` bucket and carries
 * no modifier sentences. One authored reading per house, shared across the four
 * buckets via `nodeCell`. Draft until the jyotishi signs it off
 * (`GRAHA_NARRATIVE_REVIEW`, RULEBOOK §14.7.10).
 */
import { nodeCell, type GrahaModifiers, type GrahaNarrativeTable } from './types';

export const KETU_MODIFIERS: GrahaModifiers = {};

export const KETU_NARRATIVE: GrahaNarrativeTable = [
  // 1st — self, body, nature
  nodeCell({
    leadHi: 'केतु आपके पहले भाव — स्वयं आप — में है, और यह अपनी छवि से एक सहज वैराग्य देता है: भीतर मुड़ा, अंतर्मुखी, कभी-कभी यहाँ पूरी तरह न होने का भाव। आपमें एक मौन गहराई रहती है।',
    leadEn: 'Ketu is in your first house — you yourself — and it gives a natural detachment from your own image: inward, introspective, at times a sense of not being quite fully here. A quiet depth runs through you.',
    tendHi: 'अपनी एक कोमल, स्पष्ट पहचान गढ़ें — भीतर मुड़ते हुए संसार से नाता भी रखें।',
    tendEn: 'Build a gentle, clear sense of self — stay connected to the world even as you turn inward.',
  }),
  // 2nd — family, savings, speech, food
  nodeCell({
    leadHi: 'केतु आपके दूसरे भाव — परिवार, बचत और वाणी — में है, और यह धन और शब्दों पर ढीली पकड़ तथा संचय से एक वैराग्य देता है। वाणी कम, पर गहरी हो सकती है।',
    leadEn: 'Ketu is in your second house — family, savings and speech — and it gives a loose grip on wealth and words, and a detachment from accumulation. Your speech may be sparing but deep.',
    tendHi: 'जो आपके पास है उसका मूल्य पहचानें — उदासीनता को उपेक्षा न बनने दें।',
    tendEn: 'Value what you already have — don’t let detachment slide into neglect.',
  }),
  // 3rd — courage, effort, siblings, communication
  nodeCell({
    leadHi: 'केतु आपके तीसरे भाव — साहस, प्रयास और संवाद — में है, और यह एक शांत, सहज-बोध से भरा प्रयास देता है: आप बिना शोर के, भीतर की प्रेरणा से काम करते हैं।',
    leadEn: 'Ketu is in your third house — courage, effort and communication — and it gives a quiet, intuitive way of working: you act from inner prompting, without noise.',
    tendHi: 'अपनी क्षमता पर भरोसा रखें और जब ज़रूरी हो, बोलें।',
    tendEn: 'Trust your own capability, and speak up when it matters.',
  }),
  // 4th — home, mother, property, peace
  nodeCell({
    leadHi: 'केतु आपके चौथे भाव — घर, माँ और मन की शांति — में है, और यह कहीं पूरी तरह न बसने का भाव और भीतर की ओर एक खोज ला सकता है। शांति बाहर से कम, भीतर से अधिक आती है।',
    leadEn: 'Ketu is in your fourth house — home, mother and peace of mind — and it can bring a sense of not fully belonging and an inward search. Peace comes less from outside, more from within.',
    tendHi: 'शांति को भीतर से उगने दें; अपनों से जुड़ाव सहेजें।',
    tendEn: 'Let peace grow from within; keep the bonds with your people tended.',
  }),
  // 5th — studies, creativity, children
  nodeCell({
    leadHi: 'केतु आपके पाँचवें भाव — बुद्धि, सृजन और संतान — में है, और यह एक सहज-बोध से भरी, मानो पहले से आई हुई मेधा देता है, तथा श्रेय से एक वैराग्य। आप गहराई से समझते हैं।',
    leadEn: 'Ketu is in your fifth house — intellect, creativity and children — and it gives an intuitive, as-if-already-known intelligence, and a detachment from recognition. You understand deeply.',
    tendHi: 'अपनी देन को खुलकर बाँटें — उसे भीतर ही न रखें।',
    tendEn: 'Share your gift openly — don’t keep it only to yourself.',
  }),
  // 6th — work, routine, competition, service, debts
  nodeCell({
    leadHi: 'केतु आपके छठे भाव — रोज़ का काम, सेवा और प्रतियोगिता — में है, और यहाँ यह प्रायः सहायक होता है: समस्याएँ सुलझाने की सहज सूझ और प्रतिद्वंद्विता से एक निर्लिप्तता।',
    leadEn: 'Ketu is in your sixth house — daily work, service and competition — and here it often helps: an instinct for solving problems and a detachment from rivalry.',
    tendHi: 'जो शुरू करें उसे पूरा करें — निर्लिप्ति को अधूरेपन में न बदलने दें।',
    tendEn: 'Finish what you begin — don’t let detachment become things left half-done.',
  }),
  // 7th — marriage, partner, partnerships
  nodeCell({
    leadHi: 'केतु आपके सातवें भाव — विवाह और साझेदारी — में है, और यह रिश्तों में एक गहराई या दूरी ला सकता है — मानो साझेदारी कोई पुराना, गहरा नाता हो।',
    leadEn: 'Ketu is in your seventh house — marriage and partnership — and it can bring a depth or a distance in relationships — as if partnership were an old, deep tie.',
    tendHi: 'पास रहें, दूर नहीं — साथी के साथ पूरी तरह उपस्थित रहें।',
    tendEn: 'Stay close rather than distant — be fully present with your partner.',
  }),
  // 8th — hidden matters, research, transformation
  nodeCell({
    leadHi: 'केतु आपके आठवें भाव — गहरे बदलाव, शोध और छिपे विषय — में है, और यह एक स्वाभाविक गहराई, अंतर्दृष्टि और आध्यात्मिक खोज देता है। रहस्य आपको सहज लगते हैं।',
    leadEn: 'Ketu is in your eighth house — deep change, research and hidden matters — and it gives a natural depth, insight and spiritual seeking. Mysteries come easily to you.',
    tendHi: 'खोज को रोज़मर्रा के जीवन में ज़मीन दें।',
    tendEn: 'Ground the seeking in everyday life.',
  }),
  // 9th — fortune, father, dharma, long journeys
  nodeCell({
    leadHi: 'केतु आपके नवें भाव — भाग्य, धर्म और गुरु — में है, और यह एक जन्मजात आस्था देता है, पर बाहरी कर्मकांड से भीतरी सत्य की ओर खिंचाव। आप अपने अनुभव से सत्य खोजते हैं।',
    leadEn: 'Ketu is in your ninth house — fortune, dharma and teachers — and it gives an inborn faith, yet a pull from outer ritual toward inner truth. You seek truth through your own experience.',
    tendHi: 'जिस परम्परा ने आपको गढ़ा, उसका भी आदर रखें।',
    tendEn: 'Honour the tradition that shaped you, too.',
  }),
  // 10th — career, reputation, standing
  nodeCell({
    leadHi: 'केतु आपके दसवें भाव — करियर और मान-सम्मान — में है, और यह सांसारिक महत्वाकांक्षा से एक वैराग्य देता है: काम सेवा जैसा लगता है, और राह सीधी नहीं, घुमावदार हो सकती है।',
    leadEn: 'Ketu is in your tenth house — career and reputation — and it gives a detachment from worldly ambition: work feels like service, and the path may wind rather than run straight.',
    tendHi: 'तुलना नहीं, एक भीतरी पुकार को राह दिखाने दें।',
    tendEn: 'Let a calling, not comparison, guide the way.',
  }),
  // 11th — income, gains, friends, wishes
  nodeCell({
    leadHi: 'केतु आपके ग्यारहवें भाव — आय, लाभ और मित्र — में है, और यह लाभ पर ढीली पकड़, कम पर गहरे नाते और इच्छाओं से एक वैराग्य देता है।',
    leadEn: 'Ketu is in your eleventh house — income, gains and friends — and it gives a loose hold on gains, fewer but deeper ties, and a detachment from desire.',
    tendHi: 'सहारा सहजता से स्वीकार करें — सब अकेले करने की आवश्यकता नहीं।',
    tendEn: 'Receive support graciously — you need not do it all alone.',
  }),
  // 12th — expenses, foreign lands, solitude, moksha
  nodeCell({
    leadHi: 'केतु आपके बारहवें भाव — व्यय, एकांत और मुक्ति — में है, और यहाँ यह अपने घर जैसा है: मुक्ति की ओर गहरा खिंचाव, एकांत का सुख और आध्यात्मिक या दूर-देश का जीवन।',
    leadEn: 'Ketu is in your twelfth house — expenses, solitude and release — and here it is at home: a deep pull toward liberation, an ease in solitude, and a spiritual or faraway life.',
    tendHi: 'जीवित संसार से नाता बनाए रखें — एकांत को पूरी तरह कटाव न बनने दें।',
    tendEn: 'Keep your thread to the living world — don’t let solitude become full withdrawal.',
  }),
];
