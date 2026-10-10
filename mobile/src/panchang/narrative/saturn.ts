/**
 * Saturn — the narrative-voice reading (nav-voice pilot, design.md §78).
 * 12 houses × 4 dignity buckets. Draft until the jyotishi signs it off
 * (`GRAHA_NARRATIVE_REVIEW`, RULEBOOK §14.7.10).
 */
import type { GrahaModifiers, GrahaNarrativeTable } from './types';

export const SATURN_NARRATIVE: GrahaNarrativeTable = [
  // 1st — self, body, nature, confidence
  {
    strong: {
      leadHi: 'अपने बल में शनि आपके पहले भाव — स्वयं आपके — पर बैठा है, और यह बचपन से एक गंभीर, टिकाऊ स्वभाव गढ़ता है। लोग आप पर उस उम्र में भरोसा करते हैं जब औरों को हल्का समझा जाता है; आपकी बात में वज़न है।',
      leadEn: 'In its strength Saturn sits on your first house — you yourself — and shapes a serious, durable nature from early on. People trust you with weight at an age when others are taken lightly; your word carries.',
      tendHi: 'इस गंभीरता को कठोरता न बनने दें — हँसना और विश्राम भी अनुशासन का हिस्सा है।',
      tendEn: 'Don’t let that seriousness harden into severity — rest and lightness are part of discipline too.',
    },
    friendly: {
      leadHi: 'शनि आपके पहले भाव में एक मित्र राशि में है, तो अनुशासन सहज रूप से आपके स्वभाव का अंग बनता है। आप धीरे खिलते हैं, पर जो बनता है वह टिकता है।',
      leadEn: 'Saturn is in your first house in a friendly sign, so discipline settles into your nature without much strain. You bloom slowly, but what forms in you lasts.',
      tendHi: 'अपनी धीमी गति को कमी न समझें — यही आपकी मज़बूती है।',
      tendEn: 'Don’t read your slower pace as a shortfall — it is where your steadiness comes from.',
    },
    neutral: {
      leadHi: 'शनि आपके पहले भाव पर है, और जीवन आरम्भ में कुछ भार माँगता है — ज़िम्मेदारी जल्दी आती है। यह स्वभाव को गहरा और संयत बनाता है, भले शुरुआती वर्ष हल्के न लगें।',
      leadEn: 'Saturn sits on your first house, and life asks for some weight early — responsibility arrives young. It deepens and steadies your nature, even if the early years feel heavier than most.',
      tendHi: 'अपने प्रति उतनी ही करुणा रखें जितनी आप दूसरों को देते हैं।',
      tendEn: 'Keep for yourself the same patience you extend to others.',
    },
    weak: {
      leadHi: 'निर्बल शनि आपके पहले भाव पर है, और आरम्भ के वर्ष आत्मविश्वास की परीक्षा ले सकते हैं — अपने को कम आँकना या देर से खिलना। पर यही शनि, समय के साथ, एक गहरी सहनशीलता देता है जो सहज आत्मविश्वास से अधिक टिकती है।',
      leadEn: 'A weakened Saturn sits on your first house, and the early years can test your confidence — self-doubt, or a late bloom. Yet this same Saturn, given time, grows a deep resilience that outlasts easy confidence.',
      tendHi: 'अपने को औरों से न नापें — आपकी घड़ी अलग चलती है, और देर का अर्थ असफलता नहीं।',
      tendEn: 'Don’t measure yourself against others — your clock runs differently, and late is not the same as failed.',
    },
  },
  // 2nd — family, savings, speech, food
  {
    strong: {
      leadHi: 'अपने बल में शनि आपके दूसरे भाव — परिवार, बचत और वाणी — में है, और यह धन को धीरे पर पक्के ढंग से जोड़ता है। आपकी वाणी नपी-तुली होती है, और लोग उसे गम्भीरता से लेते हैं।',
      leadEn: 'In its strength Saturn is in your second house — family, savings and speech — and it builds wealth slowly but solidly. Your words are measured, and people take them seriously.',
      tendHi: 'मितभाषिता को रूखापन न बनने दें — अपनों से गर्मजोशी भी कहें।',
      tendEn: 'Don’t let few words turn cold — say the warm things to your people too.',
    },
    friendly: {
      leadHi: 'शनि आपके दूसरे भाव में एक मित्र राशि में है, तो बचत और परिवार के विषय धैर्य से सँभलते हैं। जो आप जोड़ते हैं, वह बिखरता नहीं।',
      leadEn: 'Saturn is in your second house in a friendly sign, so savings and family matters hold together with patience. What you gather does not scatter.',
      tendHi: 'कंजूसी और मितव्ययिता का भेद याद रखें।',
      tendEn: 'Keep the line clear between thrift and holding back.',
    },
    neutral: {
      leadHi: 'शनि आपके दूसरे भाव में है, और धन तथा परिवार के विषय समय और श्रम माँगते हैं — कुछ भी जल्दी नहीं आता। पर जो धीरे बनता है, वह स्थायी होता है।',
      leadEn: 'Saturn is in your second house, and money and family matters ask for time and effort — nothing comes quickly. But what builds slowly, stays.',
      tendHi: 'कमी के पुराने डर को आज के निर्णय न चलाने दें।',
      tendEn: 'Don’t let an old fear of scarcity drive today’s choices.',
    },
    weak: {
      leadHi: 'निर्बल शनि आपके दूसरे भाव में है, और आरम्भिक वर्षों में बचत या परिवार के विषयों में तंगी व खिंचाव दिख सकता है। यह शनि कर्ज़ और कमी की सीख कठिन राह से देता है, पर अंततः एक सधी हुई मितव्ययिता गढ़ता है।',
      leadEn: 'A weakened Saturn is in your second house, and the early years can show strain around savings or family — tightness, hard words. This Saturn teaches the lessons of lack the hard way, but it finally shapes a steady thrift.',
      tendHi: 'वाणी में ठहराव रखें — कठिन समय में कहे कड़वे शब्द देर तक चुभते हैं।',
      tendEn: 'Keep a pause in your speech — sharp words said in a hard season sting for a long time.',
    },
  },
  // 3rd — courage, effort, siblings, communication (upachaya — grows well)
  {
    strong: {
      leadHi: 'शनि आपके तीसरे भाव — साहस और परिश्रम — में अपने बल में है, और यह उसका सबसे उपजाऊ स्थानों में से एक है। लगातार, बिना थके किया गया प्रयास यहाँ फल देता है; आप स्व-निर्मित हैं।',
      leadEn: 'Saturn is in your third house — courage and effort — in its strength, and this is one of its most fruitful seats. Steady, tireless effort pays here; you are self-made.',
      tendHi: 'इतनी मेहनत के बीच साथियों और भाई-बहनों के लिए भी समय रखें।',
      tendEn: 'Amid all the effort, keep time for siblings and companions too.',
    },
    friendly: {
      leadHi: 'शनि आपके तीसरे भाव में एक मित्र राशि में है — साहस और संवाद का भाव, जहाँ शनि सहज रूप से बल पाता है। आपका प्रयास दिखावे का नहीं, टिकाऊ होता है।',
      leadEn: 'Saturn is in your third house in a friendly sign — courage and communication, where it gains strength easily. Your effort is not for show; it endures.',
      tendHi: 'पहल करने से न हिचकें — यहाँ शनि आपका साथ देता है।',
      tendEn: 'Don’t hesitate to take initiative — here Saturn is on your side.',
    },
    neutral: {
      leadHi: 'शनि आपके तीसरे भाव में है, और यह उन भावों में से है जहाँ शनि समय के साथ सुधरता है। आरम्भ में पहल करने में झिझक लग सकती है, पर दृढ़ प्रयास धीरे-धीरे साहस में बदलता है।',
      leadEn: 'Saturn is in your third house, one of the seats where it improves with time. Initiative may feel hesitant at first, but persistent effort slowly turns into real courage.',
      tendHi: 'छोटे, नियमित कदम बड़े इरादों से अधिक दूर ले जाते हैं।',
      tendEn: 'Small, regular steps carry you further here than grand intentions.',
    },
    weak: {
      leadHi: 'निर्बल होते हुए भी शनि आपके तीसरे भाव में है — और यह एक राहत की बात है, क्योंकि यह भाव शनि को समय के साथ सँभाल लेता है। आरम्भ में आत्मविश्वास या भाई-बहनों से दूरी खले, पर दृढ़ता यहाँ अंततः जीतती है।',
      leadEn: 'Even weakened, Saturn is in your third house — and that is a mercy, for this house carries Saturn well in time. Confidence or sibling ties may feel strained at first, but persistence wins out here in the end.',
      tendHi: 'पहल करते रहें, भले धीरे — यहाँ रुकना ही असली जोखिम है।',
      tendEn: 'Keep taking initiative, however slowly — here, stopping is the only real risk.',
    },
  },
  // 4th — home, mother, property, peace of mind
  {
    strong: {
      leadHi: 'अपने बल में शनि आपके चौथे भाव — घर, माँ और मन की शांति — में है, और यह देर से पर पक्की जड़ें देता है: ज़मीन, घर, स्थायित्व, श्रम से अर्जित। आप बड़ों के प्रति कर्तव्य गहराई से निभाते हैं।',
      leadEn: 'In its strength Saturn is in your fourth house — home, mother and peace of mind — and it gives roots that come late but hold: land, a home, stability, earned through labour. You carry duty to elders deeply.',
      tendHi: 'घर में कर्तव्य के साथ कोमलता भी लाएँ — दोनों साथ रह सकते हैं।',
      tendEn: 'Bring tenderness home alongside duty — the two can live together.',
    },
    friendly: {
      leadHi: 'शनि आपके चौथे भाव में एक मित्र राशि में है, तो घर और मन के विषय धैर्य से स्थिर होते हैं। शांति शोर से नहीं, ठहराव से आती है।',
      leadEn: 'Saturn is in your fourth house in a friendly sign, so home and inner life steady with patience. Peace comes to you through quiet, not noise.',
      tendHi: 'विश्राम को अपराध न समझें — मन को भी मरम्मत चाहिए।',
      tendEn: 'Don’t treat rest as idleness — the mind needs repair too.',
    },
    neutral: {
      leadHi: 'शनि आपके चौथे भाव में है — घर और मन का भाव — और यहाँ यह एक बेचैनी ला सकता है: घर जल्दी नहीं जमता, मन जल्दी शांत नहीं होता। पर धैर्य से बनी नींव सबसे गहरी होती है।',
      leadEn: 'Saturn is in your fourth house — home and the heart — and here it can bring a restlessness: a home that settles late, a mind slow to quiet. But a foundation built with patience is the deepest kind.',
      tendHi: 'भीतर की शांति के लिए एक नियमित अभ्यास रखें — यह मन को लौटने की जगह देता है।',
      tendEn: 'Keep one steady practice for inner quiet — it gives the mind a place to return to.',
    },
    weak: {
      leadHi: 'निर्बल शनि आपके चौथे भाव में है, और यह घर या माँ से एक दूरी, या भीतर एक भारीपन ला सकता है जो जल्दी नहीं छँटता। यह शनि सुख-सुविधा नहीं, आत्मनिर्भर शांति सिखाता है — वह शांति जो किसी पर निर्भर नहीं।',
      leadEn: 'A weakened Saturn is in your fourth house, and it can bring a distance from home or mother, or a heaviness within that is slow to lift. This Saturn teaches not comfort but a self-standing peace — the kind that depends on no one.',
      tendHi: 'भारी दौर को अकेले न ढोएँ — सहारा माँगना भी शक्ति है।',
      tendEn: 'Don’t carry the heavy stretches alone — asking for support is also strength.',
    },
  },
  // 5th — studies, intelligence, creativity, children
  {
    strong: {
      leadHi: 'अपने बल में शनि आपके पाँचवें भाव — बुद्धि, सृजन और संतान — में है, और यह एक गहरी, अनुशासित मेधा देता है जो समय लेकर पकती है। आपका सीखना टिकाऊ है, सतही नहीं।',
      leadEn: 'In its strength Saturn is in your fifth house — intellect, creativity and children — and it gives a deep, disciplined mind that ripens with time. Your learning is lasting, not surface.',
      tendHi: 'पूर्णता की माँग को सृजन के आनंद को निगलने न दें।',
      tendEn: 'Don’t let the demand for perfection swallow the joy of creating.',
    },
    friendly: {
      leadHi: 'शनि आपके पाँचवें भाव में एक मित्र राशि में है, तो बुद्धि गम्भीर विषयों की ओर सहज झुकती है। धैर्य से किया अध्ययन यहाँ गहरा फल देता है।',
      leadEn: 'Saturn is in your fifth house in a friendly sign, so the mind leans naturally toward serious subjects. Study done with patience bears deep fruit here.',
      tendHi: 'खेल और हल्केपन के लिए भी जगह रखें — मन को साँस चाहिए।',
      tendEn: 'Leave room for play and lightness too — the mind needs to breathe.',
    },
    neutral: {
      leadHi: 'शनि आपके पाँचवें भाव में है, और सीखना, सृजन या संतान के विषय धैर्य माँगते हैं — फल देर से आता है। पर यही देरी गहराई देती है; आप जो समझते हैं, पूरी तरह समझते हैं।',
      leadEn: 'Saturn is in your fifth house, and learning, creativity or children ask for patience — results arrive late. But that delay gives depth; what you grasp, you grasp fully.',
      tendHi: 'तुलना को अपनी गति का न्यायाधीश न बनने दें।',
      tendEn: 'Don’t let comparison be the judge of your pace.',
    },
    weak: {
      leadHi: 'निर्बल शनि आपके पाँचवें भाव में है, और बुद्धि, सृजन या संतान के विषयों में रुकावट या देरी खल सकती है। यह शनि कहता है कि प्रतिभा को श्रम से सींचना होगा — और जो इस तरह अर्जित होता है, वह किसी से छिना नहीं जाता।',
      leadEn: 'A weakened Saturn is in your fifth house, and blocks or delays may weigh on learning, creativity or children. This Saturn says talent must be watered with labour — and what is earned that way can be taken from you by no one.',
      tendHi: 'आरम्भिक असफलताओं को अपनी योग्यता का फ़ैसला न मानें।',
      tendEn: 'Don’t read early setbacks as a verdict on your ability.',
    },
  },
  // 6th — work, routine, competition, service, debts (upachaya — Saturn's own kind of ground)
  {
    strong: {
      leadHi: 'शनि आपके छठे भाव — रोज़ का काम, प्रतियोगिता और कर्ज़ — में अपने बल में है, और यह उसके सबसे सशक्त स्थानों में से एक है। आप प्रतिद्वंद्वियों को धैर्य से हराते हैं और कर्ज़ को अनुशासन से चुकाते हैं; कठिनाई आपको तोड़ती नहीं, गढ़ती है।',
      leadEn: 'Saturn is in your sixth house — daily work, competition and debts — in its strength, and this is one of its most powerful seats. You outlast rivals through patience and clear debts through discipline; hardship does not break you, it forms you.',
      tendHi: 'अपनी सहनशक्ति को अति-परिश्रम में न बदलें — शरीर भी एक सीमा रखता है।',
      tendEn: 'Don’t turn your stamina into overwork — the body keeps a limit too.',
    },
    friendly: {
      leadHi: 'शनि आपके छठे भाव में एक मित्र राशि में है — श्रम और सेवा का भाव, जहाँ शनि सहज बल पाता है। कठिन कामों में आपकी दृढ़ता चमकती है।',
      leadEn: 'Saturn is in your sixth house in a friendly sign — labour and service, where it gains strength easily. Your persistence shines in the hard tasks others avoid.',
      tendHi: 'दूसरों की सेवा में अपनी देखभाल को न भूलें।',
      tendEn: 'In serving others, don’t forget to tend yourself.',
    },
    neutral: {
      leadHi: 'शनि आपके छठे भाव में है, और यह शनि के अनुकूल भावों में से है — यह रोज़ की मेहनत, प्रतियोगिता और कर्ज़ को समय के साथ आपके पक्ष में मोड़ता है। धीरज रखने वाला यहाँ जीतता है।',
      leadEn: 'Saturn is in your sixth house, one of the seats that suits it — it turns daily grind, rivalry and debts to your favour over time. The one who endures wins here.',
      tendHi: 'धीमे दौर को हार न पढ़ें — यह अक्सर कर्ज़ चुकाने का समय होता है।',
      tendEn: 'Don’t read a slow stretch as defeat — it is often the season of clearing debts.',
    },
    weak: {
      leadHi: 'निर्बल होते हुए भी शनि आपके छठे भाव में है, और यह एक अनुकूल भाव है — यहाँ शनि कठिनाई को शक्ति में बदल देता है। काम निष्फल लग सकता है और प्रतिद्वंद्वी परीक्षा लें, पर आपका उपहार सहजता नहीं, सहनशीलता है।',
      leadEn: 'Even weakened, Saturn is in your sixth house — a seat that favours it, where it turns difficulty into strength. Work may feel thankless and rivals may test you, but your gift here is resilience, not ease.',
      tendHi: 'भारी दौर को असफलता न पढ़ें — नियमित दिनचर्या, न कि नाटकीय धक्का, इसे आगे बढ़ाती है।',
      tendEn: 'Don’t read a heavy stretch as failure — steady routine, not a dramatic push, is what moves it.',
    },
  },
  // 7th — marriage, partner, partnerships (digbala — directional strength)
  {
    strong: {
      leadHi: 'अपने बल में शनि आपके सातवें भाव — विवाह और साझेदारी — में है, और यहाँ इसे दिशा-बल मिलता है। आपके रिश्ते देर से पर गहरे बनते हैं: वफ़ादार, परिपक्व, समय की कसौटी पर खरे।',
      leadEn: 'In its strength Saturn is in your seventh house — marriage and partnership — where it gains directional strength. Your bonds form late but run deep: loyal, mature, proven over time.',
      tendHi: 'गम्भीरता के साथ रिश्ते में हल्के क्षण भी रहने दें।',
      tendEn: 'Alongside the seriousness, let light moments live in the bond too.',
    },
    friendly: {
      leadHi: 'शनि आपके सातवें भाव में एक मित्र राशि में है, तो साझेदारियाँ धैर्य और निष्ठा पर टिकती हैं। आप साथी में स्थायित्व खोजते हैं, चमक नहीं।',
      leadEn: 'Saturn is in your seventh house in a friendly sign, so partnerships rest on patience and loyalty. You seek steadiness in a partner, not dazzle.',
      tendHi: 'अपेक्षाएँ स्पष्ट कहें — मौन को सहमति न मानें।',
      tendEn: 'Say your expectations plainly — don’t mistake silence for agreement.',
    },
    neutral: {
      leadHi: 'शनि आपके सातवें भाव में है, और विवाह तथा साझेदारी में समय और ठहराव माँगता है — रिश्ते देर से जमते हैं, पर जमते हैं पक्के। परिपक्वता यहाँ आकर्षण से अधिक टिकती है।',
      leadEn: 'Saturn is in your seventh house, and it asks for time and steadiness in marriage and partnership — bonds settle late, but settle firm. Maturity lasts here longer than attraction.',
      tendHi: 'देरी को अस्वीकार न पढ़ें — शनि सही को पकने का समय देता है।',
      tendEn: 'Don’t read delay as rejection — Saturn gives the right thing time to ripen.',
    },
    weak: {
      leadHi: 'निर्बल शनि आपके सातवें भाव में है, और रिश्तों में दूरी, देरी या भारीपन का अनुभव हो सकता है। यह शनि साझेदारी को एक साधना बनाता है — धैर्य, कर्तव्य और निभाव की — और जो इसे सीखते हैं, वे गहरा बंधन पाते हैं।',
      leadEn: 'A weakened Saturn is in your seventh house, and relationships can carry distance, delay or weight. This Saturn makes partnership a practice — of patience, duty and staying — and those who learn it find a deep bond.',
      tendHi: 'अकेलेपन के डर से नहीं, स्पष्ट मन से साथी चुनें।',
      tendEn: 'Choose a partner from clarity, not from a fear of being alone.',
    },
  },
  // 8th — longevity, hidden matters, transformation, shared resources
  {
    strong: {
      leadHi: 'अपने बल में शनि आपके आठवें भाव — गहरे बदलाव, शोध और छिपे विषय — में है, और यह धीरज तथा धीमे, गहरे रूपांतरण का बल देता है। आप वहाँ टिकते हैं जहाँ औरों का धीरज चुक जाता है।',
      leadEn: 'In its strength Saturn is in your eighth house — deep change, research and hidden matters — and it gives endurance and a slow, profound power to transform. You hold on where others’ patience runs out.',
      tendHi: 'पुराने को पकड़े न रहें — शनि यहाँ छोड़ना सिखाता है।',
      tendEn: 'Don’t cling to the old — Saturn here teaches you to let go.',
    },
    friendly: {
      leadHi: 'शनि आपके आठवें भाव में एक मित्र राशि में है, तो गहराई और रहस्य के विषय धैर्य से खुलते हैं। आप सतह से नीचे देखने में सहज हैं।',
      leadEn: 'Saturn is in your eighth house in a friendly sign, so matters of depth and mystery open with patience. You are at ease looking beneath the surface.',
      tendHi: 'गहराई में उतरते हुए सतह पर भी साँस लेते रहें।',
      tendEn: 'As you go deep, keep breathing at the surface too.',
    },
    neutral: {
      leadHi: 'शनि आपके आठवें भाव में है, और जीवन अचानक मोड़ और लम्बी, धीमी प्रक्रियाएँ ला सकता है जो धैर्य माँगती हैं। पर यही भाव शनि को गहरी स्थिरता और सहने की शक्ति देता है।',
      leadEn: 'Saturn is in your eighth house, and life can bring sudden turns and long, slow processes that ask for patience. Yet this house gives Saturn a deep steadiness and the power to endure.',
      tendHi: 'अनिश्चय को शत्रु न मानें — शनि आपको उसमें टिकना सिखा रहा है।',
      tendEn: 'Don’t treat uncertainty as an enemy — Saturn is teaching you to stand within it.',
    },
    weak: {
      leadHi: 'निर्बल शनि आपके आठवें भाव में है, और लम्बे, कठिन दौर या विलम्बित परिणाम खल सकते हैं। यह शनि कहता है कि हर कठिन मोड़ एक रूपांतरण है — जो इसमें से गुज़रते हैं, वे अधिक गहरे होकर निकलते हैं।',
      leadEn: 'A weakened Saturn is in your eighth house, and long, hard spells or delayed outcomes can weigh. This Saturn says every hard turn is a transformation — those who pass through it come out deeper.',
      tendHi: 'लम्बे संघर्ष को अकेले न ढोएँ — साथ और सहारा ढूँढ़ें।',
      tendEn: 'Don’t carry a long struggle alone — seek company and support.',
    },
  },
  // 9th — fortune, father, dharma, teachers, long journeys
  {
    strong: {
      leadHi: 'अपने बल में शनि आपके नवें भाव — भाग्य, धर्म और गुरु — में है, और यह श्रद्धा को परम्परा तथा कर्तव्य में गहराई से जड़ता है। आपका भाग्य उपहार से नहीं, निभाए गए कर्म से बनता है।',
      leadEn: 'In its strength Saturn is in your ninth house — fortune, dharma and teachers — and it roots faith deeply in tradition and duty. Your fortune is built not by gift but by obligations kept.',
      tendHi: 'अनुशासित श्रद्धा के साथ नम्रता भी रखें — हर प्रश्न का उत्तर अभी नहीं होता।',
      tendEn: 'Alongside disciplined faith, keep humility — not every question has an answer yet.',
    },
    friendly: {
      leadHi: 'शनि आपके नवें भाव में एक मित्र राशि में है, तो धर्म और सीखने के विषय धैर्य से गहराते हैं। आपकी श्रद्धा दिखावे की नहीं, निभाव की है।',
      leadEn: 'Saturn is in your ninth house in a friendly sign, so faith and learning deepen with patience. Your belief is lived, not displayed.',
      tendHi: 'परम्परा का आदर करते हुए अपने प्रश्नों को भी जगह दें।',
      tendEn: 'Honour tradition, but give your own questions room too.',
    },
    neutral: {
      leadHi: 'शनि आपके नवें भाव में है, और भाग्य, श्रद्धा या पिता से सम्बन्ध धैर्य माँगते हैं — आशीर्वाद जल्दी नहीं, निभाए कर्तव्य से आता है। समय के साथ एक गहरी, परखी हुई आस्था बनती है।',
      leadEn: 'Saturn is in your ninth house, and fortune, faith or the bond with your father ask for patience — blessing comes not quickly but through duty kept. In time a deep, tested faith takes shape.',
      tendHi: 'भाग्य की प्रतीक्षा में कर्म न रोकें — शनि चलते हुए को फल देता है।',
      tendEn: 'Don’t pause your effort waiting on fortune — Saturn rewards the one who keeps walking.',
    },
    weak: {
      leadHi: 'निर्बल शनि आपके नवें भाव में है, और श्रद्धा, भाग्य या पिता से सम्बन्ध परीक्षा ले सकते हैं — उत्तर देर से मिलते हैं, राह अकेली लगती है। पर इस राह से आई आस्था किसी उधार की नहीं, आपकी अपनी होती है।',
      leadEn: 'A weakened Saturn is in your ninth house, and faith, fortune or the bond with your father can be tested — answers come late, the road feels solitary. But the faith that comes this way is your own, not borrowed.',
      tendHi: 'उत्तर न मिलने के दौर में भी अपनी साधना न छोड़ें।',
      tendEn: 'Even in the seasons without answers, don’t abandon your practice.',
    },
  },
  // 10th — career, reputation, standing (digbala — Saturn's showcase)
  {
    strong: {
      leadHi: 'शनि अपनी शक्ति में आपके दसवें भाव — करियर और मान-सम्मान — के शिखर पर बैठा है, जहाँ इसे दिशा-बल मिलता है। यह जल्दी की जीत नहीं, वह प्रतिष्ठा देता है जो धीरे बनती है और सहज नहीं डिगती; लोग आप पर वह भार सौंपते हैं जो औरों से नहीं उठता।',
      leadEn: 'Saturn sits in its strength at the peak of your tenth house — career and reputation — where it gains directional strength. It gives not quick wins but a standing that builds slowly and does not easily fall; people trust you with weight others cannot carry.',
      tendHi: 'यहाँ फल शनि की घड़ी से आता है, आपकी नहीं — जो वर्ष बिना फल के लगते हैं, वही नींव रख रहे होते हैं।',
      tendEn: 'The reward here runs on Saturn’s clock, not yours — the years that feel unrewarded are the ones doing the building.',
    },
    friendly: {
      leadHi: 'शनि आपके दसवें भाव में एक मित्र राशि में है — कर्म और प्रतिष्ठा का भाव, जहाँ शनि सहज बल पाता है। आपका नाम श्रम और निभाव से बनता है, न कि शोर से।',
      leadEn: 'Saturn is in your tenth house in a friendly sign — work and reputation, where it gains strength easily. Your name is built on labour and reliability, not noise.',
      tendHi: 'धीमी चढ़ाई पर धीरज रखें — यहाँ शनि आपके पक्ष में है।',
      tendEn: 'Keep patience on the slow climb — here Saturn is on your side.',
    },
    neutral: {
      leadHi: 'शनि आपके दसवें भाव में है — कर्म और मान-सम्मान का शिखर — और यह शनि के अनुकूल भावों में से है। उन्नति धीरे आती है, सीढ़ी-दर-सीढ़ी, पर जो स्थान आप पाते हैं वह टिकता है।',
      leadEn: 'Saturn is in your tenth house — the peak of career and standing — one of the seats that suits it. Advancement comes slowly, rung by rung, but the place you reach holds.',
      tendHi: 'दूसरों की तेज़ उड़ान से अपनी गति को न नापें।',
      tendEn: 'Don’t measure your pace against others’ faster rise.',
    },
    weak: {
      leadHi: 'निर्बल होते हुए भी शनि आपके दसवें भाव में है — एक भाव जो शनि को सँभाल लेता है। करियर में देरी और कठिन दौर आ सकते हैं, पर आपकी प्रतिष्ठा चमक से नहीं, निभाव और सहनशीलता से बनती है।',
      leadEn: 'Even weakened, Saturn is in your tenth house — a seat that carries it. Career may bring delays and hard spells, but your reputation is built on reliability and endurance, not shine.',
      tendHi: 'शुरुआती असफलता को अंत न मानें — यहाँ जो टिकता है, वही अंततः खड़ा रहता है।',
      tendEn: 'Don’t take an early setback as the end — here, the one who stays is the one left standing.',
    },
  },
  // 11th — income, gains, friends, elder siblings, wishes (upachaya)
  {
    strong: {
      leadHi: 'अपने बल में शनि आपके ग्यारहवें भाव — आय, लाभ और मित्र — में है, और यह उसके फलदायी भावों में से है। लाभ धीरे पर लगातार जुड़ता है, और बड़े, भरोसेमंद लोग आपके मित्र बनते हैं।',
      leadEn: 'In its strength Saturn is in your eleventh house — income, gains and friends — one of its fruitful seats. Gains accrue slowly but steadily, and older, dependable people become your allies.',
      tendHi: 'इच्छाओं को लक्ष्य बनने दें, बोझ नहीं।',
      tendEn: 'Let your wishes become goals, not a weight.',
    },
    friendly: {
      leadHi: 'शनि आपके ग्यारहवें भाव में एक मित्र राशि में है, तो लाभ और संबंध धैर्य से बनते हैं। आपके मित्र कम पर पक्के होते हैं।',
      leadEn: 'Saturn is in your eleventh house in a friendly sign, so gains and ties form with patience. Your friends are few but firm.',
      tendHi: 'संख्या नहीं, निष्ठा से मित्र आँकें।',
      tendEn: 'Judge friendships by loyalty, not by number.',
    },
    neutral: {
      leadHi: 'शनि आपके ग्यारहवें भाव में है, और यह शनि के अनुकूल भावों में से है — लाभ और इच्छाओं की पूर्ति समय लेती है, पर जो आता है वह ठहरता है। दीर्घकालीन लक्ष्य यहाँ सबसे अच्छे फलते हैं।',
      leadEn: 'Saturn is in your eleventh house, one of the seats that suits it — gains and wishes take time, but what arrives stays. Long-horizon goals do best here.',
      tendHi: 'धीमे लाभ को कमी न समझें — यही टिकाऊ संपत्ति है।',
      tendEn: 'Don’t read slow gains as scarcity — this is the lasting kind of wealth.',
    },
    weak: {
      leadHi: 'निर्बल होते हुए भी शनि आपके ग्यारहवें भाव में है — एक अनुकूल भाव। आय अनियमित लग सकती है और मित्रता में देरी, पर दीर्घकाल में शनि यहाँ धैर्यवान को लाभ देता है।',
      leadEn: 'Even weakened, Saturn is in your eleventh house — a favourable seat. Income may feel uneven and friendships slow to form, but over the long run Saturn rewards the patient here.',
      tendHi: 'शीघ्र लाभ के पीछे न भागें — यहाँ धीरज ही सबसे बड़ा निवेश है।',
      tendEn: 'Don’t chase quick gains — here, patience is the largest investment.',
    },
  },
  // 12th — expenses, rest, foreign lands, solitude, moksha
  {
    strong: {
      leadHi: 'अपने बल में शनि आपके बारहवें भाव — व्यय, एकांत और मुक्ति — में है, और यह अनुशासित वैराग्य देता है: सधा हुआ खर्च, सार्थक एकांत, और अध्यात्म या दूर देश की ओर एक गहरा झुकाव।',
      leadEn: 'In its strength Saturn is in your twelfth house — expenses, solitude and release — and it gives a disciplined detachment: controlled spending, meaningful solitude, and a deep pull toward the spiritual or faraway lands.',
      tendHi: 'एकांत को अलगाव न बनने दें — संसार से जुड़े भी रहें।',
      tendEn: 'Don’t let solitude slide into isolation — stay connected to the world too.',
    },
    friendly: {
      leadHi: 'शनि आपके बारहवें भाव में एक मित्र राशि में है, तो एकांत और भीतर की यात्रा सहज लगती है। आप शांति शोर में नहीं, ठहराव में पाते हैं।',
      leadEn: 'Saturn is in your twelfth house in a friendly sign, so solitude and the inward journey come naturally. You find peace in quiet, not in noise.',
      tendHi: 'भीतर मुड़ते हुए अपनों से नाता बनाए रखें।',
      tendEn: 'As you turn inward, keep the thread to your people.',
    },
    neutral: {
      leadHi: 'शनि आपके बारहवें भाव में है, और खर्च, नींद या एकांत के विषय ध्यान माँगते हैं — ऊर्जा और संसाधन बिना सोचे बह सकते हैं। पर यही भाव शनि को गहरी आंतरिक साधना की ओर मोड़ता है।',
      leadEn: 'Saturn is in your twelfth house, and expenses, rest or solitude ask for attention — energy and resources can drain unnoticed. Yet this house turns Saturn toward a deep inner practice.',
      tendHi: 'खर्च और विश्राम दोनों पर एक सजग नज़र रखें।',
      tendEn: 'Keep a watchful eye on both spending and rest.',
    },
    weak: {
      leadHi: 'निर्बल शनि आपके बारहवें भाव में है, और व्यय, अनिद्रा या एकाकीपन का भार खल सकता है। यह शनि कहता है कि छोड़ना भी एक साधना है — और जो अनावश्यक को छोड़ना सीखते हैं, वे एक दुर्लभ हल्कापन पाते हैं।',
      leadEn: 'A weakened Saturn is in your twelfth house, and the weight of expenses, broken sleep or isolation can press. This Saturn says letting go is also a practice — and those who learn to release the needless find a rare lightness.',
      tendHi: 'अकेलेपन के भार को अकेले न ढोएँ — सहारा माँगना कमज़ोरी नहीं।',
      tendEn: 'Don’t carry the weight of isolation alone — reaching for support is not weakness.',
    },
  },
];

export const SATURN_MODIFIERS: GrahaModifiers = {
  lordship: {
    hi: (houses: string) =>
      `और चूँकि यही शनि आपके ${houses} का भी स्वामी है, इसका अनुशासन चुपचाप उन पक्षों को भी सँभालता है।`,
    en: (houses: string) =>
      `And because this same Saturn also rules your ${houses}, the discipline it asks for quietly steadies those corners of life too.`,
  },
  combust: {
    hi: 'सूर्य के निकट होने से इसकी आवाज़ कुछ दबी रहती है — इसका अनुशासन दिखते अधिकार से अधिक एक शांत दृढ़ता के रूप में आता है।',
    en: 'Sitting close to the Sun, its voice is a little drowned out — its discipline shows up more as quiet persistence than visible authority.',
  },
  retrograde: {
    hi: 'और वक्री होने से यह बार-बार पुराने, अधूरे दायित्वों की ओर लौटाता है, जब तक वे ठीक से पूरे न हों।',
    en: 'And turning retrograde, it keeps pulling you back to old, unfinished duties until they are properly closed.',
  },
};
