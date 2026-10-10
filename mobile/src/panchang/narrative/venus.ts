/**
 * Venus — the narrative-voice reading (design.md §78).
 * 12 houses × 4 dignity buckets. Draft until the jyotishi signs it off
 * (`GRAHA_NARRATIVE_REVIEW`, RULEBOOK §14.7.10).
 */
import type { GrahaModifiers, GrahaNarrativeTable } from './types';

export const VENUS_NARRATIVE: GrahaNarrativeTable = [
  // 1st — self, body, nature, confidence
  {
    strong: {
      leadHi: 'अपने बल में शुक्र आपके पहले भाव — स्वयं आप — में है, और यह बचपन से एक सहज सौंदर्यबोध व आकर्षक व्यक्तित्व गढ़ता है। लोग आपकी उपस्थिति में एक स्वाभाविक गर्मजोशी महसूस करते हैं।',
      leadEn: 'In its strength Venus sits on your first house — you yourself — and shapes a natural grace and appealing presence from early on. People feel an easy warmth around you.',
      tendHi: 'अपने आकर्षण को दिखावे में न बदलने दें — असली गर्मजोशी भीतर से आती है।',
      tendEn: 'Don’t let that charm turn into display — the real warmth comes from within.',
    },
    friendly: {
      leadHi: 'शुक्र आपके पहले भाव में एक मित्र राशि में है, तो सुरुचि और सौम्यता सहज रूप से आपके स्वभाव में बसती है। आपकी शैली में एक अपनी, बिना बनावट की सुंदरता होती है।',
      leadEn: 'Venus is in your first house in a friendly sign, so refinement and gentleness settle into your nature without strain. Your style carries a beauty that is your own, not put on.',
      tendHi: 'अपनी सहज सुंदरता पर भरोसा रखें — उसे साबित करने की ज़रूरत नहीं।',
      tendEn: 'Trust your natural grace — it doesn’t need proving.',
    },
    neutral: {
      leadHi: 'शुक्र आपके पहले भाव पर है, और आत्मविश्वास तथा सौंदर्यबोध धीरे-धीरे, अनुभव से निखरते हैं। शुरुआत में अपने बारे में अनिश्चय लग सकता है, पर एक अपनी शैली समय के साथ उभरती है।',
      leadEn: 'Venus sits on your first house, and confidence and a sense of style refine gradually, through experience. Early on you may feel unsure of yourself, but a style of your own emerges with time.',
      tendHi: 'अपनी तुलना दूसरों की चमक से न करें।',
      tendEn: 'Don’t measure yourself against someone else’s shine.',
    },
    weak: {
      leadHi: 'निर्बल शुक्र आपके पहले भाव में है, और आरम्भिक वर्षों में अपने आकर्षण या मूल्य पर अनिश्चय महसूस हो सकता है — बाहरी सराहना की तलाश ज़्यादा रहना। पर यही शुक्र, समय के साथ, एक शांत, भीतर से उपजी गरिमा गढ़ता है।',
      leadEn: 'A weakened Venus is in your first house, and the early years can bring self-doubt about your own appeal or worth — leaning too much on outside approval. Yet this same Venus, given time, shapes a quiet grace that rises from within rather than from others’ eyes.',
      tendHi: 'अपनी कीमत दूसरों की नज़र से नहीं, अपनी नज़र से आँकें।',
      tendEn: 'Measure your worth by your own eyes, not by others’.',
    },
  },
  // 2nd — family, savings, speech, food
  {
    strong: {
      leadHi: 'अपने बल में शुक्र आपके दूसरे भाव — परिवार, बचत और वाणी — में है, और यह घर में सुख-साधन, मधुर वाणी और अच्छे स्वाद का आनंद लाता है। धन आराम से, पर ठहराव से जुड़ता है।',
      leadEn: 'In its strength Venus is in your second house — family, savings and speech — and it brings comfort at home, sweet speech and a real enjoyment of good taste. Wealth comes with ease, but settles steadily.',
      tendHi: 'आराम के साथ बचत की आदत भी बनाए रखें।',
      tendEn: 'Alongside the comfort, keep the habit of saving too.',
    },
    friendly: {
      leadHi: 'शुक्र आपके दूसरे भाव में एक मित्र राशि में है, तो परिवार और वाणी में एक सहज मिठास रहती है। घर में सुरुचि और सुविधा दोनों सँवरती हैं।',
      leadEn: 'Venus is in your second house in a friendly sign, so family and speech carry an easy sweetness. Both taste and comfort settle well at home.',
      tendHi: 'मिठास के साथ स्पष्टता भी कहें — दोनों ज़रूरी हैं।',
      tendEn: 'Alongside the sweetness, say the clear things too — both matter.',
    },
    neutral: {
      leadHi: 'शुक्र आपके दूसरे भाव में है, और परिवार तथा बचत के विषयों में आराम और संयम का संतुलन धीरे-धीरे बनता है। खर्च करने की इच्छा सहज रहती है, पर समझदारी समय के साथ आती है।',
      leadEn: 'Venus is in your second house, and the balance between comfort and restraint in family and savings builds gradually. The pull to spend is natural, but good sense arrives with time.',
      tendHi: 'खर्च और बचत के बीच एक सचेत संतुलन रखें।',
      tendEn: 'Keep a conscious balance between spending and saving.',
    },
    weak: {
      leadHi: 'निर्बल शुक्र आपके दूसरे भाव में है, और शुरुआत में आराम की चाह बचत पर भारी पड़ सकती है — या पारिवारिक मेल-मिलाप में सुर बिगड़ जाना। यह शुक्र अंततः एक परखी हुई, समझदार भोगशैली सिखाता है।',
      leadEn: 'A weakened Venus is in your second house, and the pull toward comfort can outweigh saving at first — or family harmony can go a little off-key. This Venus finally teaches a tested, discerning way of enjoying what you have.',
      tendHi: 'खर्च करने से पहले एक बार ज़रूरत और चाह का भेद कर लें।',
      tendEn: 'Before spending, tell apart what you need from what you simply want.',
    },
  },
  // 3rd — courage, effort, siblings, self-expression
  {
    strong: {
      leadHi: 'अपने बल में शुक्र आपके तीसरे भाव — साहस और अभिव्यक्ति — में है, और यह प्रयास को एक सुरुचिपूर्ण, कलात्मक रूप देता है। आपकी बात कहने का ढंग ही आपका सबसे बड़ा हथियार बनता है।',
      leadEn: 'In its strength Venus is in your third house — courage and self-expression — and it gives effort a graceful, artistic shape. The way you say things becomes your strongest tool.',
      tendHi: 'सुरुचि के साथ थोड़ा परिश्रम भी जोड़ें — दोनों मिलकर टिकते हैं।',
      tendEn: 'Alongside the grace, add a little grit too — together they last.',
    },
    friendly: {
      leadHi: 'शुक्र आपके तीसरे भाव में एक मित्र राशि में है — साहस और संवाद का भाव — जहाँ यह सहज बल पाता है। भाई-बहनों और साथियों से आपका रिश्ता गर्मजोशी से भरा रहता है।',
      leadEn: 'Venus is in your third house in a friendly sign — courage and communication — where it gains strength easily. Your bond with siblings and peers stays warm and easy.',
      tendHi: 'सहजता के साथ निरंतरता भी बनाए रखें।',
      tendEn: 'Keep up the follow-through alongside the ease.',
    },
    neutral: {
      leadHi: 'शुक्र आपके तीसरे भाव में है, और यहाँ प्रयास और साहस सहज नहीं आते — सुविधा की चाह मेहनत पर भारी पड़ सकती है। पर जो थोड़ा कलात्मक ढंग आप लाते हैं, वह धीरे-धीरे असर दिखाता है।',
      leadEn: 'Venus is in your third house, where effort and courage don’t come naturally — a pull toward ease can outweigh the grind. But the touch of artistry you bring to things slowly starts to show.',
      tendHi: 'आराम की चाह के आगे रोज़ के छोटे प्रयास को न छोड़ें।',
      tendEn: 'Don’t let the pull toward ease crowd out the small daily effort.',
    },
    weak: {
      leadHi: 'निर्बल शुक्र आपके तीसरे भाव में है, और साहस या पहल में शुरुआत में कमी खल सकती है — आराम को मेहनत पर तरजीह देना। यह शुक्र सिखाता है कि असली सुंदरता परिश्रम से निखरती है, सुविधा से नहीं।',
      leadEn: 'A weakened Venus is in your third house, and courage or initiative can feel thin at first — a preference for ease over effort. This Venus teaches that real beauty is polished through effort, not through comfort.',
      tendHi: 'आराम और मेहनत के बीच छोटे, नियमित कदम चुनें।',
      tendEn: 'Between comfort and effort, choose the small, regular steps.',
    },
  },
  // 4th — home, mother, property, peace of mind (digbala — directional strength for Venus)
  {
    strong: {
      leadHi: 'अपने बल में शुक्र आपके चौथे भाव — घर, माँ और मन की शांति — में है, जहाँ इसे दिशा-बल मिलता है। आपका घर सुंदर, सुखद और प्रेम से भरा होता है, और माँ से आपका नाता कोमल व गहरा रहता है।',
      leadEn: 'In its strength Venus is in your fourth house — home, mother and peace of mind — where it gains directional strength. Your home turns out beautiful, comfortable and full of warmth, and your bond with your mother runs tender and deep.',
      tendHi: 'सुंदरता के साथ घर में सहजता भी बनी रहने दें — हर चीज़ सँवरी हुई न हो तो भी ठीक है।',
      tendEn: 'Alongside the beauty, let home stay easy too — it’s fine if not everything is perfectly arranged.',
    },
    friendly: {
      leadHi: 'शुक्र आपके चौथे भाव में एक मित्र राशि में है, तो घर एक सुखद, सौम्य शरणस्थल बनता है। मन की शांति यहाँ सहज रूप से मिलती है।',
      leadEn: 'Venus is in your fourth house in a friendly sign, so home becomes a pleasant, gentle refuge. Peace of mind comes to you here with ease.',
      tendHi: 'आराम को अलगाव में न बदलने दें — घर को खुला भी रखें।',
      tendEn: 'Don’t let comfort turn into withdrawal — keep home open too.',
    },
    neutral: {
      leadHi: 'शुक्र आपके चौथे भाव में है, और घर की शांति तथा सुंदरता धीरे-धीरे, अपने ढंग से सँवरती है। शुरुआत में घर में कुछ बेचैनी लग सकती है, पर आराम अंततः बनता है।',
      leadEn: 'Venus is in your fourth house, and the peace and beauty of home take shape gradually, in their own time. Home can feel a little restless at first, but comfort does settle in eventually.',
      tendHi: 'घर की शांति बाहर से नहीं, अपने भीतर के संतोष से आती है — उसे वहीं ढूँढ़ें।',
      tendEn: 'Peace at home comes less from outside and more from inner contentment — look for it there.',
    },
    weak: {
      leadHi: 'निर्बल शुक्र आपके चौथे भाव में है, और घर या माँ से जुड़े विषयों में शुरुआत में बेचैनी या असंतोष महसूस हो सकता है — मन को आराम जल्दी नहीं मिलता। यह शुक्र अंततः एक ऐसी शांति सिखाता है जो बाहरी सुख-साधन पर नहीं, भीतर की तृप्ति पर टिकी होती है।',
      leadEn: 'A weakened Venus is in your fourth house, and matters tied to home or mother can bring an early unease or discontent — the mind slow to find comfort. This Venus finally teaches a peace that rests not on outer comforts but on inner contentment.',
      tendHi: 'आराम की तलाश में बाहर भटकने से पहले भीतर एक बार झाँक लें।',
      tendEn: 'Before searching outward for comfort, look within first.',
    },
  },
  // 5th — studies, intelligence, creativity, children
  {
    strong: {
      leadHi: 'अपने बल में शुक्र आपके पाँचवें भाव — बुद्धि, सृजन और संतान — में है, और यह एक सुरुचिपूर्ण, कलात्मक मेधा देता है। सीखना और सृजन करना आपके लिए सहज आनंद का विषय बनता है।',
      leadEn: 'In its strength Venus is in your fifth house — intellect, creativity and children — and it gives a graceful, artistic mind. Learning and creating become a natural source of joy for you.',
      tendHi: 'कला के साथ अनुशासन भी जोड़ें — तभी वह निखरती है।',
      tendEn: 'Pair the art with discipline too — that is what lets it shine.',
    },
    friendly: {
      leadHi: 'शुक्र आपके पाँचवें भाव में एक मित्र राशि में है, तो सृजनात्मकता और सुरुचि सहजता से खिलती हैं। आपकी सीख में एक सौंदर्यबोध रहता है।',
      leadEn: 'Venus is in your fifth house in a friendly sign, so creativity and refinement bloom with ease. Your learning carries a natural sense of beauty.',
      tendHi: 'सहज आए हुए हुनर को भी अभ्यास से माँजें।',
      tendEn: 'Polish even the talent that comes easily, with practice.',
    },
    neutral: {
      leadHi: 'शुक्र आपके पाँचवें भाव में है, और सृजनात्मकता तथा सीख में सुरुचि तो रहती है, पर निखार धीरे-धीरे आता है। मन कला की ओर खिंचता है, पर अनुशासन समय के साथ जुड़ता है।',
      leadEn: 'Venus is in your fifth house, and creativity and learning carry taste, but refinement builds gradually. The mind leans toward art, but discipline joins in over time.',
      tendHi: 'रुचि के साथ नियमित अभ्यास को भी जगह दें।',
      tendEn: 'Alongside the interest, make room for regular practice too.',
    },
    weak: {
      leadHi: 'निर्बल शुक्र आपके पाँचवें भाव में है, और सृजनात्मकता में शुरुआत में बिखराव या अधूरापन खल सकता है — रुचि बहुत पर अनुशासन कम। यह शुक्र सिखाता है कि कच्ची प्रतिभा को तराशने से ही असली कला बनती है।',
      leadEn: 'A weakened Venus is in your fifth house, and creativity can feel scattered or unfinished at first — plenty of interest, less discipline. This Venus teaches that real art comes only from shaping raw talent with care.',
      tendHi: 'हर नए शौक़ को पूरा करने से पहले एक को पूरी तरह निभाएँ।',
      tendEn: 'Before chasing a new interest, see one through to completion.',
    },
  },
  // 6th — work, routine, competition, service, debts
  {
    strong: {
      leadHi: 'अपने बल में शुक्र आपके छठे भाव — रोज़ का काम और प्रतियोगिता — में है, और यह कठिन स्थितियों को भी सौम्यता व समझदारी से सुलझा लेता है। विवादों में भी आप सुंदर, संतुलित रास्ता निकाल लेते हैं।',
      leadEn: 'In its strength Venus is in your sixth house — daily work and competition — and it settles even hard situations with grace and good sense. You find an elegant, balanced way through disputes too.',
      tendHi: 'सौम्यता के साथ अपनी बात पर दृढ़ भी रहें।',
      tendEn: 'Alongside the grace, stay firm on what matters to you too.',
    },
    friendly: {
      leadHi: 'शुक्र आपके छठे भाव में एक मित्र राशि में है — सेवा और प्रतिस्पर्धा का भाव — जहाँ यह सहज बल पाता है। आपकी सौम्यता कठिन सहकर्मियों के साथ भी काम आती है।',
      leadEn: 'Venus is in your sixth house in a friendly sign — service and competition — where it gains strength easily. Your tact proves useful even with difficult colleagues.',
      tendHi: 'सौम्यता को दब जाने में न बदलने दें।',
      tendEn: 'Don’t let the tact slide into being overrun.',
    },
    neutral: {
      leadHi: 'शुक्र आपके छठे भाव में है, और यहाँ सद्भाव का ग्रह प्रतिस्पर्धा के माहौल में थोड़ा असहज रहता है। रिश्ते और सहयोग समय के साथ, धैर्य से सँवरते हैं।',
      leadEn: 'Venus is in your sixth house, where this planet of harmony sits a little uneasily in a competitive setting. Working relationships and collaborations settle with patience, over time.',
      tendHi: 'काम में किस पर भरोसा करना है, यह जल्दी तय न करें।',
      tendEn: 'Don’t decide too quickly who to trust at work.',
    },
    weak: {
      leadHi: 'निर्बल शुक्र आपके छठे भाव में है, और सहयोग या प्रतिस्पर्धा में शुरुआत में तनाव या निराशा महसूस हो सकती है — भरोसा टूटना, या मेल न बैठना। यह शुक्र अंततः एक परखी हुई, सहनशील सौम्यता सिखाता है।',
      leadEn: 'A weakened Venus is in your sixth house, and collaboration or competition can bring early strain or disappointment — trust that breaks, or ties that don’t quite fit. This Venus finally teaches a tested, resilient grace.',
      tendHi: 'हर असहमति को निजी चोट न मानें।',
      tendEn: 'Don’t take every disagreement as a personal blow.',
    },
  },
  // 7th — marriage, partner, partnerships (Venus's own natural house)
  {
    strong: {
      leadHi: 'अपने बल में शुक्र आपके सातवें भाव — साझेदारी और विवाह — के शिखर पर है, जो शुक्र का अपना सबसे प्रिय घर है। रिश्तों में प्रेम, सौहार्द और गहरा साथ यहाँ उदारता से मिलता है।',
      leadEn: 'In its strength Venus sits at the peak of your seventh house — partnership and marriage — Venus’s own most favoured seat. Love, harmony and deep companionship come generously in relationships here.',
      tendHi: 'गहरे साथ के बीच अपनी अलग पहचान भी बनाए रखें।',
      tendEn: 'Amid the deep companionship, keep your own separate identity too.',
    },
    friendly: {
      leadHi: 'शुक्र आपके सातवें भाव में एक मित्र राशि में है, तो साझेदारियाँ सहज सौहार्द और समझ पर टिकती हैं। आप साथी में सद्भाव और सौंदर्य दोनों खोजते हैं।',
      leadEn: 'Venus is in your seventh house in a friendly sign, so partnerships rest on easy harmony and understanding. You look for both warmth and grace in a partner.',
      tendHi: 'सौहार्द के साथ स्पष्ट बातचीत भी ज़रूरी है।',
      tendEn: 'Alongside the harmony, plain conversation matters too.',
    },
    neutral: {
      leadHi: 'शुक्र आपके सातवें भाव में है — साझेदारी का अपना घर — और यहाँ यह कमज़ोर हो तब भी सहारा पाता है। रिश्तों में सद्भाव धीरे-धीरे, समझ से बनता है।',
      leadEn: 'Venus is in your seventh house — its own natural home — a seat that supports it even when otherwise unsupported. Harmony in relationships builds gradually, through understanding.',
      tendHi: 'रिश्ते में शांति बनाए रखने के लिए अपनी ज़रूरतों को दबाएँ नहीं।',
      tendEn: 'Don’t suppress your own needs just to keep the peace in a relationship.',
    },
    weak: {
      leadHi: 'निर्बल शुक्र आपके सातवें भाव में है, और रिश्तों में शुरुआत में अति-मोह या असहजता महसूस हो सकती है — बहुत जल्दी झुक जाना, या अपने मूल्य पर संदेह। यह शुक्र अंततः एक परिपक्व, विवेकपूर्ण प्रेम सिखाता है।',
      leadEn: 'A weakened Venus is in your seventh house, and relationships can carry an early over-indulgence or unease — bending too quickly, or doubting your own worth in the bond. This Venus finally teaches a mature, discerning love.',
      tendHi: 'रिश्ते में अपनी सीमाएँ स्पष्ट रखें, भले शुरुआत में असहज लगे।',
      tendEn: 'Keep your boundaries clear in the relationship, even if it feels awkward at first.',
    },
  },
  // 8th — hidden matters, transformation, shared resources, in-laws
  {
    strong: {
      leadHi: 'अपने बल में शुक्र आपके आठवें भाव — गहरी अंतरंगता और साझे संसाधन — में है, और यह छिपे रिश्तों व साझी पूँजी को सौम्यता व समझ से सँभालता है। घनिष्ठता यहाँ गहरी और सार्थक होती है।',
      leadEn: 'In its strength Venus is in your eighth house — deep intimacy and shared resources — and it handles hidden bonds and shared wealth with grace and understanding. Closeness here runs deep and meaningful.',
      tendHi: 'गहरी अंतरंगता में भी अपनी निजता का कोना बचाए रखें।',
      tendEn: 'Even in deep closeness, keep a corner of your own privacy.',
    },
    friendly: {
      leadHi: 'शुक्र आपके आठवें भाव में एक मित्र राशि में है, तो साझे संसाधन और घनिष्ठता सहजता से सँवरते हैं। आप गहराई में भी सहज रहते हैं।',
      leadEn: 'Venus is in your eighth house in a friendly sign, so shared resources and intimacy settle with ease. You stay at ease even in the depths.',
      tendHi: 'पारदर्शिता बनाए रखें, खासकर साझे धन के विषयों में।',
      tendEn: 'Keep things transparent, especially around shared money matters.',
    },
    neutral: {
      leadHi: 'शुक्र आपके आठवें भाव में है, और घनिष्ठता तथा साझे संसाधनों से जुड़े विषय समय माँगते हैं। भरोसा तुरंत नहीं, अनुभव से गहरा बनता है।',
      leadEn: 'Venus is in your eighth house, and matters of intimacy and shared resources take time to settle. Trust deepens here through experience, not all at once.',
      tendHi: 'साझे संसाधनों में शर्तें साफ़ रखें।',
      tendEn: 'Keep the terms clear in anything shared.',
    },
    weak: {
      leadHi: 'निर्बल शुक्र आपके आठवें भाव में है, और घनिष्ठता या साझे संसाधनों में शुरुआत में असहजता या भरोसे की परीक्षा महसूस हो सकती है। यह शुक्र एक कठिन राह से एक गहरी, परखी हुई अंतरंगता सिखाता है।',
      leadEn: 'A weakened Venus is in your eighth house, and intimacy or shared resources can bring an early unease or a test of trust. This Venus teaches, through a hard road, a deep and tested kind of closeness.',
      tendHi: 'भरोसा टूटने के डर से दूरी बनाने के बजाय, धीरे-धीरे फिर से भरोसा करना सीखें।',
      tendEn: 'Instead of pulling away from fear of a broken trust, learn to trust again slowly.',
    },
  },
  // 9th — fortune, father, dharma, teachers, long journeys
  {
    strong: {
      leadHi: 'अपने बल में शुक्र आपके नवें भाव — भाग्य, धर्म और गुरुजन — में है, और यह श्रद्धा को सौंदर्य व कला के माध्यम से गहरा करता है। दूर की यात्राएँ अक्सर आनंद और संस्कृति दोनों लाती हैं।',
      leadEn: 'In its strength Venus is in your ninth house — fortune, dharma and teachers — and it deepens faith through beauty and art. Long journeys often bring both pleasure and culture.',
      tendHi: 'सौंदर्य के प्रति प्रेम के साथ श्रद्धा की गहराई भी बनाए रखें।',
      tendEn: 'Alongside the love of beauty, keep the depth of faith too.',
    },
    friendly: {
      leadHi: 'शुक्र आपके नवें भाव में एक मित्र राशि में है, तो भाग्य और श्रद्धा के विषय सौम्यता से सँवरते हैं। पिता या गुरुजनों से आपका रिश्ता गर्मजोशी से भरा रहता है।',
      leadEn: 'Venus is in your ninth house in a friendly sign, so fortune and faith settle with grace. Your bond with your father or teachers stays warm.',
      tendHi: 'सौम्यता के साथ अपनी सच्ची श्रद्धा को भी बोलें।',
      tendEn: 'Alongside the warmth, speak your real convictions too.',
    },
    neutral: {
      leadHi: 'शुक्र आपके नवें भाव में है, और भाग्य तथा श्रद्धा के विषय धीरे-धीरे, सुंदरता और समझ के साथ गहराते हैं। शुरुआत में राह स्पष्ट न लगे, पर एक अपना रास्ता बनता है।',
      leadEn: 'Venus is in your ninth house, and fortune and faith deepen gradually, alongside an appreciation for beauty and understanding. The path may feel unclear at first, but one of your own takes shape.',
      tendHi: 'सुख-सुविधा की तलाश में अपनी श्रद्धा को गौण न बनाएँ।',
      tendEn: 'Don’t let the search for comfort push your convictions to the side.',
    },
    weak: {
      leadHi: 'निर्बल शुक्र आपके नवें भाव में है, और भाग्य, श्रद्धा या पिता से सम्बन्ध में शुरुआत में असंतोष या दूरी खल सकती है। यह शुक्र सिखाता है कि गहरा आनंद सुविधा से नहीं, सच्चे मूल्यों से मिलता है।',
      leadEn: 'A weakened Venus is in your ninth house, and fortune, faith or the bond with your father can carry an early discontent or distance. This Venus teaches that deep joy comes not from comfort but from true values.',
      tendHi: 'आसान राह और सही राह में भेद करना सीखें।',
      tendEn: 'Learn to tell the easy path apart from the right one.',
    },
  },
  // 10th — career, reputation, standing
  {
    strong: {
      leadHi: 'अपने बल में शुक्र आपके दसवें भाव — करियर और मान-सम्मान — में है, और यह कला, सौंदर्य या कूटनीति से जुड़े क्षेत्रों में एक सुरुचिपूर्ण प्रतिष्ठा देता है। लोग आपके काम में सहज सौंदर्यबोध को सराहते हैं।',
      leadEn: 'In its strength Venus is in your tenth house — career and reputation — and it gives a graceful standing, often in fields tied to art, beauty or diplomacy. People appreciate the natural sense of taste you bring to your work.',
      tendHi: 'सुरुचि के साथ निरंतर निखार भी लाते रहें — प्रतिष्ठा हुनर से बनती है।',
      tendEn: 'Alongside the taste, keep refining the craft too — a name is built on real skill.',
    },
    friendly: {
      leadHi: 'शुक्र आपके दसवें भाव में एक मित्र राशि में है — कर्म और प्रतिष्ठा का भाव — जहाँ यह सहज बल पाता है। आपका नाम सौम्यता और अच्छे काम दोनों से जुड़ता है।',
      leadEn: 'Venus is in your tenth house in a friendly sign — work and reputation — where it gains strength easily. Your name becomes linked with both grace and good work.',
      tendHi: 'सौम्यता को झिझक में न बदलने दें — अपनी बात कहें।',
      tendEn: 'Don’t let the grace turn into hesitation — speak up when it matters.',
    },
    neutral: {
      leadHi: 'शुक्र आपके दसवें भाव में है, और करियर में प्रतिष्ठा धीरे-धीरे, निखरे हुए काम से बनती है। शुरुआत में दिशा सहज न लगे, पर आपकी अपनी शैली समय के साथ पहचानी जाती है।',
      leadEn: 'Venus is in your tenth house, and standing in career builds gradually, through polished work. Direction may not feel easy at first, but your own style gets recognised over time.',
      tendHi: 'आकर्षण भर पर निर्भर न रहें — हुनर को भी उतना ही समय दें।',
      tendEn: 'Don’t lean on charm alone — give the craft equal time.',
    },
    weak: {
      leadHi: 'निर्बल शुक्र आपके दसवें भाव में है, और करियर में शुरुआत में अनिश्चितता या सतहीपन का आरोप खटक सकता है। यह शुक्र सिखाता है कि असली प्रतिष्ठा आकर्षण से नहीं, निखारे हुए हुनर से बनती है।',
      leadEn: 'A weakened Venus is in your tenth house, and career can carry an early uncertainty or the charge of being surface-level. This Venus teaches that real standing is built not on charm but on polished skill.',
      tendHi: 'आलोचना को निजी तौर पर लेने के बजाय उसमें से सीखें।',
      tendEn: 'Instead of taking criticism personally, learn from it.',
    },
  },
  // 11th — income, gains, friends, elder siblings, wishes
  {
    strong: {
      leadHi: 'अपने बल में शुक्र आपके ग्यारहवें भाव — आय, लाभ और मित्र — में है, और यह कला, सौंदर्य या रिश्तों के माध्यम से उदार लाभ लाता है। आपके मित्रों का दायरा गर्मजोश और विस्तृत होता है।',
      leadEn: 'In its strength Venus is in your eleventh house — income, gains and friends — and it brings generous gains, often through art, beauty or relationships. Your circle of friends runs warm and wide.',
      tendHi: 'मात्रा के साथ मित्रता की गहराई को भी सँजोएँ।',
      tendEn: 'Alongside the number of friends, cherish the depth of the bonds too.',
    },
    friendly: {
      leadHi: 'शुक्र आपके ग्यारहवें भाव में एक मित्र राशि में है, तो आय और मित्रता दोनों सहजता से बढ़ते हैं। आपकी इच्छाएँ अक्सर सुंदरता और आराम की ओर झुकती हैं।',
      leadEn: 'Venus is in your eleventh house in a friendly sign, so both income and friendships grow with ease. Your wishes often lean toward beauty and comfort.',
      tendHi: 'विस्तृत दायरे में भी असली दोस्तों को पहचानते रहें।',
      tendEn: 'Even in a wide circle, keep sight of who the real friends are.',
    },
    neutral: {
      leadHi: 'शुक्र आपके ग्यारहवें भाव में है, और लाभ तथा मित्रता धीरे-धीरे, अनुभव से सँवरते हैं। इच्छाएँ तुरंत नहीं, समय के साथ पूरी होती हैं।',
      leadEn: 'Venus is in your eleventh house, and gains and friendships settle gradually, through experience. Wishes come true not all at once but over time.',
      tendHi: 'मित्रता को सिर्फ़ सुख के साझेपन पर न टिकाएँ।',
      tendEn: 'Don’t build a friendship on shared pleasure alone.',
    },
    weak: {
      leadHi: 'निर्बल शुक्र आपके ग्यारहवें भाव में है, और आय या मित्रता में शुरुआत में निराशा या असंतुलन खल सकता है — दोस्ती में छल का अनुभव, या अनियमित लाभ। यह शुक्र अंततः गुणवत्ता को मात्रा से ऊपर रखना सिखाता है।',
      leadEn: 'A weakened Venus is in your eleventh house, and income or friendships can bring an early disappointment or imbalance — a friendship that disappoints, or gains that feel uneven. This Venus finally teaches you to put quality above quantity, in both income and friends.',
      tendHi: 'हर नए परिचय को तुरंत करीबी मित्र न मान लें।',
      tendEn: 'Don’t take every new acquaintance for a close friend right away.',
    },
  },
  // 12th — expenses, rest, foreign lands, solitude, moksha
  {
    strong: {
      leadHi: 'अपने बल में शुक्र आपके बारहवें भाव — विश्राम, दूर देश और मुक्ति — में है, और यह एक गहरा, सौंदर्य से भरा आध्यात्मिक अनुराग देता है। एकांत के सुख और निजी आनंद यहाँ उदारता से मिलते हैं।',
      leadEn: 'In its strength Venus is in your twelfth house — rest, foreign lands and release — and it gives a deep, beauty-filled devotion. The pleasures of solitude and private joy come generously here.',
      tendHi: 'निजी सुखों के साथ अपने खर्च पर भी एक नज़र रखें।',
      tendEn: 'Alongside the private pleasures, keep an eye on your spending too.',
    },
    friendly: {
      leadHi: 'शुक्र आपके बारहवें भाव में एक मित्र राशि में है, तो एकांत और विश्राम सहजता से सुखद बनते हैं। भीतर की शांति सौंदर्य और भक्ति दोनों से जुड़ती है।',
      leadEn: 'Venus is in your twelfth house in a friendly sign, so solitude and rest come easily and pleasantly. Inner peace links with both beauty and devotion.',
      tendHi: 'आराम को पलायन में न बदलने दें।',
      tendEn: 'Don’t let the rest slide into escape.',
    },
    neutral: {
      leadHi: 'शुक्र आपके बारहवें भाव में है, और विश्राम, खर्च या एकांत में सुख की तलाश धीरे-धीरे एक गहरी समझ में बदलती है। शुरुआत में आराम पकड़ में न आए, पर एक निजी शांति अंततः बनती है।',
      leadEn: 'Venus is in your twelfth house, and the search for pleasure in rest, spending or solitude slowly turns into a deeper understanding. Comfort may feel elusive at first, but a private peace does take shape.',
      tendHi: 'खर्च और विश्राम दोनों में एक सजग संतुलन रखें।',
      tendEn: 'Keep a mindful balance in both spending and rest.',
    },
    weak: {
      leadHi: 'निर्बल शुक्र आपके बारहवें भाव में है, और विश्राम या एकांत में शुरुआत में अति-भोग या बेचैनी खल सकती है — सुख की तलाश जो तृप्त नहीं करती। यह शुक्र अंततः एक परिपक्व, भीतर से उपजा संतोष सिखाता है।',
      leadEn: 'A weakened Venus is in your twelfth house, and rest or solitude can bring early over-indulgence or restlessness — a search for pleasure that doesn’t quite satisfy. This Venus finally teaches a mature contentment that rises from within.',
      tendHi: 'सुख की तलाश में बाहर भटकने से पहले भीतर एक बार ठहरें।',
      tendEn: 'Before chasing pleasure outward, pause and sit with yourself first.',
    },
  },
];

export const VENUS_MODIFIERS: GrahaModifiers = {
  lordship: {
    hi: (houses: string) =>
      `और चूँकि यही शुक्र आपके ${houses} का भी स्वामी है, इसकी गर्मजोशी और सौंदर्यबोध चुपचाप उन पक्षों को भी सँवारते हैं।`,
    en: (houses: string) =>
      `And because this same Venus also rules your ${houses}, the warmth and sense of beauty it brings quietly touch those corners of life too.`,
  },
  combust: {
    hi: 'सूर्य के निकट होने से इसकी सहजता कुछ दब जाती है — इसकी गर्मजोशी दिखावे में कम, निजी घेरे में अधिक दिखती है।',
    en: 'Sitting close to the Sun, its ease is a little overshadowed — its warmth shows up more in private than in display.',
  },
  retrograde: {
    hi: 'और वक्री होने से यह पुराने स्नेह और मूल्यों को फिर सतह पर लाता है, नए के बसने से पहले उन्हें समझे जाने की माँग करते हुए।',
    en: 'And turning retrograde, it brings old affections and values back to the surface, asking to be understood before new ones settle.',
  },
};
