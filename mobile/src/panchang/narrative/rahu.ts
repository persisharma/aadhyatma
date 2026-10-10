/**
 * Rahu — the narrative-voice reading (design.md §78).
 *
 * A shadow graha: no dignity, no sign it owns, and in the chart it is always
 * retrograde and never combust, so it only ever reaches the `neutral` bucket and
 * carries no modifier sentences. One authored reading per house, shared across
 * the four buckets via `nodeCell`. Draft until the jyotishi signs it off
 * (`GRAHA_NARRATIVE_REVIEW`, RULEBOOK §14.7.10).
 */
import { nodeCell, type GrahaModifiers, type GrahaNarrativeTable } from './types';

export const RAHU_MODIFIERS: GrahaModifiers = {};

export const RAHU_NARRATIVE: GrahaNarrativeTable = [
  // 1st — self, body, nature
  nodeCell({
    leadHi: 'राहु आपके पहले भाव — स्वयं आप — में है, और यह एक तीव्र, चुम्बकीय पर बेचैन पहचान देता है: कुछ बड़ा बनने और दिखने की भूख। लोग आपकी ओर खिंचते हैं, पर भीतर एक अधूरापन भी बना रह सकता है।',
    leadEn: 'Rahu is in your first house — you yourself — and it gives an intense, magnetic but restless identity: a hunger to become something larger and to be seen. People are drawn to you, though a sense of never-quite-enough can sit underneath.',
    tendHi: 'छवि को नहीं, अपने सच्चे स्वभाव को आगे चलने दें — बेचैनी को एक नियमित अभ्यास में बाँधें।',
    tendEn: 'Let your real nature lead, not the image — give the restlessness one steady practice to settle into.',
  }),
  // 2nd — family, savings, speech, food
  nodeCell({
    leadHi: 'राहु आपके दूसरे भाव — परिवार, बचत और वाणी — में है, और यह धन व प्रभाव की तीव्र चाह और एक असरदार, मनवाने वाली वाणी देता है। कमाई अपरम्परागत राहों से आ सकती है।',
    leadEn: 'Rahu is in your second house — family, savings and speech — and it gives a strong appetite for wealth and influence, and a persuasive, carrying voice. Earning can come by unconventional routes.',
    tendHi: 'और पाने की भूख को संतोष से आगे न बढ़ने दें; वाणी को सधा रखें।',
    tendEn: 'Don’t let the appetite for more outrun contentment; keep the speech measured.',
  }),
  // 3rd — courage, effort, siblings, communication
  nodeCell({
    leadHi: 'राहु आपके तीसरे भाव — साहस, प्रयास और संवाद — में है, और यह साहसी, अपरम्परागत उद्यमों और नए माध्यमों में पहल देता है। यहाँ राहु अक्सर सहायक होता है: बेचैनी बल बन जाती है।',
    leadEn: 'Rahu is in your third house — courage, effort and communication — and it gives bold, unconventional ventures and a flair for new media. Rahu often helps here: the restlessness becomes drive.',
    tendHi: 'बेचैनी को छलाँगों में नहीं, नियमित प्रयास में लगाएँ।',
    tendEn: 'Pour the restlessness into steady effort, not into leaps.',
  }),
  // 4th — home, mother, property, peace
  nodeCell({
    leadHi: 'राहु आपके चौथे भाव — घर, माँ और मन की शांति — में है, और यह घर में एक बेचैनी, दूर देश की ओर खिंचाव और आधुनिक सुख-सुविधा की चाह ला सकता है। मन जल्दी ठहरता नहीं।',
    leadEn: 'Rahu is in your fourth house — home, mother and peace of mind — and it can bring a restlessness at home, a pull toward faraway places and modern comforts. The mind does not settle quickly.',
    tendHi: 'बदलते बाहरी हालात के बीच भीतर एक ठहराव बनाएँ।',
    tendEn: 'Build an inner ground amid the shifting outer circumstances.',
  }),
  // 5th — studies, creativity, children
  nodeCell({
    leadHi: 'राहु आपके पाँचवें भाव — बुद्धि, सृजन और संतान — में है, और यह अपरम्परागत मेधा, साहसी सृजन और त्वरित परिणामों की ओर खिंचाव देता है। मन असाधारण विषयों में रमता है।',
    leadEn: 'Rahu is in your fifth house — intellect, creativity and children — and it gives an unconventional mind, bold creativity and a pull toward quick results. The mind takes to the unusual.',
    tendHi: 'सीखने में धैर्य रखें और शॉर्टकट से बचें — गहराई समय माँगती है।',
    tendEn: 'Keep patience with learning and avoid shortcuts — depth asks for time.',
  }),
  // 6th — work, routine, competition, service, debts
  nodeCell({
    leadHi: 'राहु आपके छठे भाव — रोज़ का काम, प्रतियोगिता और सेवा — में है, और यहाँ यह अक्सर बल देता है: आप कठिन मुक़ाबले में खिलते हैं और अपरम्परागत या विदेशी क्षेत्रों में राह बनाते हैं।',
    leadEn: 'Rahu is in your sixth house — daily work, competition and service — and here it often empowers: you thrive in hard contests and make your way in unconventional or foreign fields.',
    tendHi: 'साधन साफ़ रखें; प्रतिद्वंद्विता को अपने भीतर हावी न होने दें।',
    tendEn: 'Keep your means clean; don’t let rivalry take you over.',
  }),
  // 7th — marriage, partner, partnerships
  nodeCell({
    leadHi: 'राहु आपके सातवें भाव — विवाह और साझेदारी — में है, और यह अपरम्परागत या भिन्न पृष्ठभूमि के साथी तथा तीव्र, खींचने वाली साझेदारियों की ओर ले जाता है।',
    leadEn: 'Rahu is in your seventh house — marriage and partnership — and it draws you toward unconventional or very different partners and intense, magnetic bonds.',
    tendHi: 'आकर्षण के पीछे के व्यक्ति को देखें, केवल मोह को नहीं।',
    tendEn: 'See the person behind the fascination, not only the pull.',
  }),
  // 8th — hidden matters, research, transformation
  nodeCell({
    leadHi: 'राहु आपके आठवें भाव — गहरे बदलाव, शोध और छिपे विषय — में है, और यह रहस्यों, शोध और अचानक मोड़ों की ओर गहरा खिंचाव देता है। आप सतह के नीचे देखना चाहते हैं।',
    leadEn: 'Rahu is in your eighth house — deep change, research and hidden matters — and it gives a strong pull toward mysteries, research and sudden turns. You want to see beneath the surface.',
    tendHi: 'नियंत्रण की पकड़ ढीली करें और खोज को रोज़मर्रा में ज़मीन दें।',
    tendEn: 'Loosen the grip on control and ground the seeking in daily life.',
  }),
  // 9th — fortune, father, dharma, long journeys
  nodeCell({
    leadHi: 'राहु आपके नवें भाव — भाग्य, धर्म और गुरु — में है, और यह परम्परा को प्रश्न करने, विदेशी विचारों और अपने ढंग की आस्था की ओर ले जाता है। आप बनी-बनाई राह से हटकर अर्थ खोजते हैं।',
    leadEn: 'Rahu is in your ninth house — fortune, dharma and teachers — and it leads you to question tradition, to foreign ideas and to a belief of your own shaping. You seek meaning off the beaten path.',
    tendHi: 'खोज के बीच मूल्यों का एक लंगर बनाए रखें।',
    tendEn: 'Keep one anchor of values amid the seeking.',
  }),
  // 10th — career, reputation, standing
  nodeCell({
    leadHi: 'राहु आपके दसवें भाव — करियर और मान-सम्मान — में है, और यह बड़ी महत्वाकांक्षा और सांसारिक, तकनीकी या विदेशी क्षेत्रों में तेज़ उभार देता है। दृश्यता आपको खींचती है।',
    leadEn: 'Rahu is in your tenth house — career and reputation — and it gives large ambition and a fast rise in worldly, technical or foreign fields. Visibility draws you.',
    tendHi: 'चढ़ाई के साथ उतना ही सार भी रखें — नाम को काम से मेल खाने दें।',
    tendEn: 'Let substance match the climb — keep the name backed by real work.',
  }),
  // 11th — income, gains, friends, wishes
  nodeCell({
    leadHi: 'राहु आपके ग्यारहवें भाव — आय, लाभ और मित्र — में है, और यहाँ यह प्रायः फलदायी होता है: बड़े लाभ, विस्तृत व अपरम्परागत नेटवर्क और इच्छाओं की पूर्ति।',
    leadEn: 'Rahu is in your eleventh house — income, gains and friends — and here it is often fruitful: large gains, wide and unconventional networks, and wishes met.',
    tendHi: 'इच्छाएँ बढ़ती ही जा सकती हैं — ‘पर्याप्त’ क्या है, यह स्वयं तय करें।',
    tendEn: 'Desires can keep expanding — decide for yourself what “enough” is.',
  }),
  // 12th — expenses, foreign lands, solitude, moksha
  nodeCell({
    leadHi: 'राहु आपके बारहवें भाव — व्यय, दूर देश और मुक्ति — में है, और यह विदेश, आध्यात्मिक खोज, कल्पनाशीलता और असामान्य खर्च की ओर ले जाता है। मन दूर क्षितिजों पर रमता है।',
    leadEn: 'Rahu is in your twelfth house — expenses, faraway places and release — and it leads toward foreign lands, spiritual seeking, imagination and unusual spending. The mind roams distant horizons.',
    tendHi: 'खोज को भीतर की ओर मोड़ें और धन के बहाव पर नज़र रखें।',
    tendEn: 'Turn the seeking inward and keep an eye on where resources flow.',
  }),
];
