/**
 * Sun — the narrative-voice reading (design.md §78).
 * 12 houses × 4 dignity buckets. Draft until the jyotishi signs it off
 * (`GRAHA_NARRATIVE_REVIEW`, RULEBOOK §14.7.10).
 */
import type { GrahaModifiers, GrahaNarrativeTable } from './types';

export const SUN_NARRATIVE: GrahaNarrativeTable = [
  // 1st — self, body, nature, confidence, how you begin
  {
    strong: {
      leadHi: 'अपने बल में सूर्य आपके पहले भाव — स्वयं आप — में है, और यह बचपन से एक उज्ज्वल, आत्मविश्वासी स्वभाव गढ़ता है। आप जहाँ खड़े होते हैं, वहाँ स्वाभाविक रूप से ध्यान खिंचता है, और यह ध्यान आपके भीतर के तेज से आता है, दिखावे से नहीं।',
      leadEn: 'In its strength the Sun sits on your first house — you yourself — and shapes a bright, confident nature from early on. Wherever you stand, attention naturally gathers, and it comes from an inner glow, not from display.',
      tendHi: 'इस तेज को अहंकार न बनने दें — असली अधिकार झुकने से भी आता है।',
      tendEn: 'Don’t let that glow harden into ego — real authority bends too.',
    },
    friendly: {
      leadHi: 'सूर्य आपके पहले भाव में एक मित्र राशि में है, तो आत्मविश्वास सहज रूप से बढ़ता है। आप बिना जोर दिए भी सम्मान पाते हैं।',
      leadEn: 'The Sun is in your first house in a friendly sign, so confidence grows without much strain. You earn respect without having to insist on it.',
      tendHi: 'अपनी सहजता को दूसरों की मेहनत कम आँकने में न बदलें।',
      tendEn: 'Don’t let your ease turn into underrating others’ effort.',
    },
    neutral: {
      leadHi: 'सूर्य आपके पहले भाव में है, और आत्मविश्वास तथा पहचान समय के साथ, अनुभव से बनते हैं — शुरुआत में थोड़ी झिझक रह सकती है। जो भी आत्म-सम्मान आप अर्जित करते हैं, वह ठोस होता है।',
      leadEn: 'The Sun is in your first house, and confidence and recognition build slowly, through experience — some hesitation may linger early on. But the self-respect you earn this way is solid.',
      tendHi: 'हर कमरे में सबसे तेज आवाज़ बनने की ज़रूरत नहीं — अपनी गति से बोलें।',
      tendEn: 'You don’t need to be the loudest voice in the room — speak at your own pace.',
    },
    weak: {
      leadHi: 'निर्बल सूर्य आपके पहले भाव में है, और आरम्भ के वर्ष आत्मविश्वास तथा पहचान को लेकर परीक्षा ले सकते हैं — अपने को कम आँकना, या पहचान के लिए भीतर कहीं प्यास बने रहना। पर यही सूर्य, समय के साथ, एक सच्ची नम्रता और भीतर से उठी हुई स्थिरता देता है जो दिखावटी आत्मविश्वास से अधिक गहरी होती है।',
      leadEn: 'A weakened Sun sits on your first house, and the early years can test your confidence and sense of recognition — underrating yourself, or an inner hunger for notice that lingers. Yet this same Sun, given time, grows a genuine humility and an inner steadiness that runs deeper than easy confidence.',
      tendHi: 'पहचान बाहर से माँगने से पहले, उसे भीतर से खुद को देना सीखें।',
      tendEn: 'Before seeking recognition from outside, learn to give it to yourself first.',
    },
  },
  // 2nd — family, savings, speech, food
  {
    strong: {
      leadHi: 'अपने बल में सूर्य आपके दूसरे भाव — परिवार, वाणी और खान-पान — में है, और आपकी बात में एक स्वाभाविक अधिकार होता है जिसे परिवार और समाज दोनों सुनते हैं। घर में आपकी उपस्थिति ही एक स्तम्भ जैसी होती है।',
      leadEn: 'In its strength the Sun is in your second house — family, speech and food — and your words carry a natural authority that both family and society listen to. Your presence at home stands like a pillar.',
      tendHi: 'अधिकार की वाणी को आदेश न बनने दें — सुनना भी नेतृत्व का हिस्सा है।',
      tendEn: 'Don’t let an authoritative voice turn into command — listening is part of leading too.',
    },
    friendly: {
      leadHi: 'सूर्य आपके दूसरे भाव में एक मित्र राशि में है, तो परिवार में आपकी बात का सहज आदर होता है। वाणी गर्मजोशी और अधिकार दोनों साथ रखती है।',
      leadEn: 'The Sun is in your second house in a friendly sign, so your word carries easy respect within the family. Your speech holds both warmth and authority together.',
      tendHi: 'घर के फैसलों में सबकी राय को भी जगह दें।',
      tendEn: 'Leave room for everyone’s voice in the family’s decisions too.',
    },
    neutral: {
      leadHi: 'सूर्य आपके दूसरे भाव में है, और परिवार में अपनी बात मनवाना या वाणी में अधिकार लाना समय तथा धैर्य माँगता है। जो सम्मान आप यहाँ कमाते हैं, वह दिखावे का नहीं होता।',
      leadEn: 'The Sun is in your second house, and winning a hearing in the family or bringing authority to your speech takes time and patience. The respect you earn here is not for show.',
      tendHi: 'अपनी बात रखने से पहले, पहले ध्यान से सुनें।',
      tendEn: 'Before stating your view, listen closely first.',
    },
    weak: {
      leadHi: 'निर्बल सूर्य आपके दूसरे भाव में है, और घर में आपकी बात को तौला जाना या परिवार से पहचान पाना कठिन लग सकता है — वाणी में झिझक, या अनसुना किए जाने का भाव। यह सूर्य आपको दिखावे के बिना अपनी वाणी पर भरोसा करना सिखाता है।',
      leadEn: 'A weakened Sun is in your second house, and having your word weighed at home, or feeling recognised by family, can feel hard — a hesitant voice, or the sense of going unheard. This Sun teaches you to trust your own voice without needing display.',
      tendHi: 'अनसुना महसूस होने पर चुप्पी नहीं, स्पष्ट शब्द चुनें।',
      tendEn: 'When you feel unheard, choose clear words, not silence.',
    },
  },
  // 3rd — courage, effort, younger siblings, short trips, self-expression (upachaya — suits the Sun too)
  {
    strong: {
      leadHi: 'अपने बल में सूर्य आपके तीसरे भाव — साहस और अपनी बात रखने की कला — में है, और यह भाव सूर्य को स्वाभाविक रूप से सूट करता है। आपका आत्मविश्वास पहल करने में, और अपनी बात स्पष्ट कहने में दिखता है।',
      leadEn: 'In its strength the Sun is in your third house — courage and self-expression — and this house suits the Sun naturally. Your confidence shows in taking initiative and in saying your mind plainly.',
      tendHi: 'बोलने के बल को भाई-बहनों पर रौब जमाने में न बदलें।',
      tendEn: 'Don’t let your strong voice turn into talking over siblings.',
    },
    friendly: {
      leadHi: 'सूर्य आपके तीसरे भाव में एक मित्र राशि में है, तो साहस और पहल सहज रूप से आते हैं। आप अपनी बात बिना झिझक रखते हैं, और यह दूसरों को भी प्रेरित करता है।',
      leadEn: 'The Sun is in your third house in a friendly sign, so courage and initiative come easily. You speak your mind without hesitation, and it inspires others too.',
      tendHi: 'पहल करते हुए भाई-बहनों की गति का भी ध्यान रखें।',
      tendEn: 'While taking the lead, stay mindful of your siblings’ own pace.',
    },
    neutral: {
      leadHi: 'सूर्य आपके तीसरे भाव में है, और यह उन भावों में से है जहाँ सूर्य समय के साथ निखरता है। आरम्भ में पहल करने या अपनी बात कहने में संकोच लग सकता है, पर यह धीरे-धीरे सच्चे साहस में बदलता है।',
      leadEn: 'The Sun is in your third house, one of the seats where it brightens with time. Taking initiative or speaking up may feel shy at first, but it slowly turns into real courage.',
      tendHi: 'छोटे प्रयास भी गिनती में आते हैं — हर पहल बड़ी होने की ज़रूरत नहीं।',
      tendEn: 'Small efforts count too — not every initiative needs to be a big one.',
    },
    weak: {
      leadHi: 'निर्बल होते हुए भी सूर्य आपके तीसरे भाव में है — और यह एक राहत है, क्योंकि यह भाव सूर्य को समय के साथ सँभाल लेता है। आरम्भ में आत्मविश्वास या भाई-बहनों से तालमेल में कमी खल सकती है, पर दृढ़ता यहाँ अंततः जीतती है।',
      leadEn: 'Even weakened, the Sun is in your third house — and that is a mercy, for this house carries the Sun well in time. Confidence or ease with siblings may feel lacking at first, but persistence wins out here in the end.',
      tendHi: 'आवाज़ धीमी लगे तो भी बोलना न छोड़ें।',
      tendEn: 'Even if your voice feels small, keep speaking up.',
    },
  },
  // 4th — home, mother, vehicles, property, peace of mind
  {
    strong: {
      leadHi: 'अपने बल में सूर्य आपके चौथे भाव — घर और मन की शांति — में है, और यह घर में एक मुखिया जैसी उपस्थिति देता है: अपनी ज़मीन, अपना नाम, पड़ोस में पहचान। भीतर की शांति आपके अपने अधिकार के भाव से आती है, दूसरों की स्वीकृति से नहीं।',
      leadEn: 'In its strength the Sun is in your fourth house — home and peace of mind — and it gives you a head-of-household presence: your own land, your own name, recognition in your neighbourhood. Inner peace comes from your own sense of standing, not from others’ approval.',
      tendHi: 'घर में अधिकार जताते हुए भी कोमलता की जगह रखें।',
      tendEn: 'Even while holding authority at home, leave room for tenderness.',
    },
    friendly: {
      leadHi: 'सूर्य आपके चौथे भाव में एक मित्र राशि में है, तो घर और संपत्ति के विषय सहजता से सँभलते हैं। आप अपने घर में सम्मानित महसूस करते हैं।',
      leadEn: 'The Sun is in your fourth house in a friendly sign, so home and property matters settle with ease. You feel respected within your own home.',
      tendHi: 'घर की शांति को अपने अकेले के अधिकार में न बाँधें — इसे साझा रखें।',
      tendEn: 'Don’t make the home’s peace solely about your own authority — keep it shared.',
    },
    neutral: {
      leadHi: 'सूर्य आपके चौथे भाव में है, और घर, माँ या मन की शांति के विषयों में कभी-कभी स्वभाव की टकराहट महसूस हो सकती है — आपकी तेज़ी, घर की नरमी से थोड़ी टकराती है। समय के साथ दोनों के बीच संतुलन बनता है।',
      leadEn: 'The Sun is in your fourth house, and matters of home, mother or peace of mind can sometimes carry a difference in temperament — your intensity meeting the home’s gentler pace. Over time the two find their balance.',
      tendHi: 'घर में अपनी गति नहीं, घर की गति को भी सुनें।',
      tendEn: 'At home, listen to the household’s pace, not only your own.',
    },
    weak: {
      leadHi: 'निर्बल सूर्य आपके चौथे भाव में है, और घर, माँ या मन की शांति के विषयों में कुछ दूरी या बेचैनी बनी रह सकती है — घर जल्दी सुकून की जगह नहीं लगता। यह सूर्य सिखाता है कि शांति बाहर की परिस्थितियों से नहीं, भीतर से गढ़नी पड़ती है।',
      leadEn: 'A weakened Sun is in your fourth house, and matters of home, mother or peace of mind can carry a lingering distance or restlessness — home is slow to feel like comfort. This Sun teaches that peace has to be built from within, not handed to you by circumstance.',
      tendHi: 'घर में शांति न मिले तो उसे भीतर खोजने की आदत डालें।',
      tendEn: 'When home doesn’t offer calm, practise finding it within yourself.',
    },
  },
  // 5th — studies, intelligence, creativity, children, past good deeds
  {
    strong: {
      leadHi: 'अपने बल में सूर्य आपके पाँचवें भाव — बुद्धि, सृजन और संतान — में है, और यह एक स्पष्ट, नेतृत्वकारी बुद्धि देता है। आप जो सीखते हैं उसे आत्मविश्वास से सामने रखते हैं, और रचनात्मकता में भी आपकी अपनी छाप दिखती है।',
      leadEn: 'In its strength the Sun is in your fifth house — intellect, creativity and children — and it gives a clear, leading mind. What you learn, you present with confidence, and your creative work carries your own stamp.',
      tendHi: 'अपनी चमक में दूसरों के विचारों की जगह बनाए रखें।',
      tendEn: 'Amid your own brightness, keep room for others’ ideas too.',
    },
    friendly: {
      leadHi: 'सूर्य आपके पाँचवें भाव में एक मित्र राशि में है, तो बुद्धि और रचनात्मकता सहज रूप से निखरती है। सीखना आपके लिए आनंद का विषय है, बोझ का नहीं।',
      leadEn: 'The Sun is in your fifth house in a friendly sign, so intellect and creativity shine with ease. Learning is a joy for you, not a burden.',
      tendHi: 'अपनी चमक को संतान या विद्यार्थियों पर दबाव न बनने दें।',
      tendEn: 'Don’t let your own brightness become pressure on children or students.',
    },
    neutral: {
      leadHi: 'सूर्य आपके पाँचवें भाव में है, और बुद्धि तथा रचनात्मकता में अपना भरोसा पाना समय माँगता है — शुरुआत में अपनी राय रखने में हिचक लग सकती है। पर जो विश्वास यहाँ बनता है, वह गहरा होता है।',
      leadEn: 'The Sun is in your fifth house, and gaining confidence in your own intellect and creativity takes time — voicing your opinion may feel hesitant at first. But the confidence that forms here runs deep.',
      tendHi: 'तुलना को अपनी बुद्धि का फ़ैसला न बनने दें।',
      tendEn: 'Don’t let comparison be the verdict on your own mind.',
    },
    weak: {
      leadHi: 'निर्बल सूर्य आपके पाँचवें भाव में है, और बुद्धि, सृजन या संतान के विषयों में आत्मविश्वास की कमी या पहचान न मिलने का भाव रह सकता है। यह सूर्य कहता है कि असली चमक दिखावे से नहीं, भीतर के भरोसे से आती है — और वह भरोसा यहाँ धीरे-धीरे अर्जित होता है।',
      leadEn: 'A weakened Sun is in your fifth house, and matters of intellect, creativity or children can carry a lack of confidence, or the sense of going unrecognised. This Sun says real brightness comes not from display but from inner conviction — and that conviction is earned here slowly.',
      tendHi: 'मान्यता न मिलने पर भी अपने काम में भरोसा रखें।',
      tendEn: 'Keep faith in your own work even when recognition is slow to arrive.',
    },
  },
  // 6th — daily work, routine, competition, service, debts (upachaya — a natural arena for the Sun)
  {
    strong: {
      leadHi: 'अपने बल में सूर्य आपके छठे भाव — रोज़ का काम और प्रतियोगिता — में है, और यह भाव सूर्य के लिए एक स्वाभाविक रणभूमि है। आप प्रतिद्वंद्विता में आत्मविश्वास से खड़े होते हैं, और विवादों या मुक़ाबलों में ऊपरी हाथ अक्सर आपका रहता है।',
      leadEn: 'In its strength the Sun is in your sixth house — daily work and competition — and this house is a natural arena for the Sun. You stand confidently in rivalry, and the upper hand in disputes or contests is often yours.',
      tendHi: 'जीतने की आदत को हर बहस में झगड़ा मोल लेने में न बदलें।',
      tendEn: 'Don’t let the habit of winning turn into picking a fight in every disagreement.',
    },
    friendly: {
      leadHi: 'सूर्य आपके छठे भाव में एक मित्र राशि में है — काम और सेवा का भाव, जहाँ सूर्य सहज बल पाता है। आप कठिन कामों में भी अपनी साख बनाए रखते हैं।',
      leadEn: 'The Sun is in your sixth house in a friendly sign — work and service, where it gains strength easily. You hold your standing even in difficult tasks.',
      tendHi: 'प्रतिस्पर्धा में जीतते हुए भी विनम्रता बनाए रखें।',
      tendEn: 'Even while winning the contest, keep your humility intact.',
    },
    neutral: {
      leadHi: 'सूर्य आपके छठे भाव में है, और यह सूर्य के भी अनुकूल भावों में से एक है — रोज़ की मेहनत और प्रतियोगिता समय के साथ आपके पक्ष में झुकती है। आरम्भ में प्रतिद्वंद्वी भारी लग सकते हैं, पर आपकी साख धीरे-धीरे बनती है।',
      leadEn: 'The Sun is in your sixth house, one of the seats that suits it too — daily effort and competition tilt in your favour over time. Rivals may feel daunting at first, but your standing builds steadily.',
      tendHi: 'हर मुक़ाबले को व्यक्तिगत अपमान की तरह न लें।',
      tendEn: 'Don’t take every contest as a personal insult.',
    },
    weak: {
      leadHi: 'निर्बल होते हुए भी सूर्य आपके छठे भाव में है — एक ऐसा भाव जो सूर्य को सँभाल लेता है। प्रतिद्वंद्विता और रोज़ के काम में शुरू में थकान या आत्मविश्वास की कमी खल सकती है, पर यहाँ आपका उपहार सहजता नहीं, लगातार डटे रहना है।',
      leadEn: 'Even weakened, the Sun is in your sixth house — a seat that carries it. Rivalry and daily work may bring early fatigue or a dip in confidence, but your gift here is not ease — it is staying in the fight.',
      tendHi: 'हार जैसा लगने वाला दौर भी अक्सर साख बनाने का समय होता है।',
      tendEn: 'A stretch that feels like losing is often, in truth, the season that builds your standing.',
    },
  },
  // 7th — marriage, partner, partnerships
  {
    strong: {
      leadHi: 'अपने बल में सूर्य आपके सातवें भाव — विवाह और साझेदारी — में है, और आप एक ऐसे साथी या साझेदार की ओर खिंचते हैं जो स्वयं भी प्रतिष्ठित और आत्मविश्वासी हो। रिश्ते में आपकी उपस्थिति बराबरी की होती है, दबी हुई नहीं।',
      leadEn: 'In its strength the Sun is in your seventh house — marriage and partnership — and you are drawn to a partner who is themselves accomplished and confident. Your presence in the relationship stands as an equal, never overshadowed.',
      tendHi: 'बराबरी चाहते हुए भी रिश्ते में अहं की होड़ न बनने दें।',
      tendEn: 'Even while seeking an equal footing, don’t let the bond turn into a contest of egos.',
    },
    friendly: {
      leadHi: 'सूर्य आपके सातवें भाव में एक मित्र राशि में है, तो साझेदारियाँ आदर और स्पष्टता पर टिकती हैं। आप जिससे जुड़ते हैं, उसे खुलकर अपनी राय भी बता पाते हैं।',
      leadEn: 'The Sun is in your seventh house in a friendly sign, so partnerships rest on respect and clarity. You can speak your mind openly to those you partner with.',
      tendHi: 'अपनी राय रखते हुए साथी की राय को भी बराबर जगह दें।',
      tendEn: 'While voicing your view, give your partner’s view equal room.',
    },
    neutral: {
      leadHi: 'सूर्य आपके सातवें भाव में है, और साझेदारी में दो अलग स्वभावों — दोनों की अपनी जगह चाहने वाली प्रवृत्ति — के बीच तालमेल समय माँगता है। धैर्य से यह तालमेल एक मज़बूत बराबरी में बदलता है।',
      leadEn: 'The Sun is in your seventh house, and partnership asks for time to balance two natures that each want their own space. With patience, that balancing turns into a strong equality.',
      tendHi: 'हर मतभेद को अधिकार की लड़ाई न बनने दें।',
      tendEn: 'Don’t let every disagreement turn into a contest for the upper hand.',
    },
    weak: {
      leadHi: 'निर्बल सूर्य आपके सातवें भाव में है, और साझेदारी तथा विवाह में अहं का टकराव या मान्यता की कमी महसूस हो सकती है — अपनी बात मनवाने की ज़िद, या साथी से अनसुना होने का भाव। यह सूर्य साझेदारी को झुकना सिखाता है — और जो यह सीखते हैं, वे एक सच्ची बराबरी पाते हैं।',
      leadEn: 'A weakened Sun is in your seventh house, and marriage or partnership can carry a clash of egos, or a sense of going unrecognised — insisting on being right, or feeling unheard by a partner. This Sun teaches partnership to bend — and those who learn it find a real equality.',
      tendHi: 'रिश्ते को जीतने की जगह नहीं, साझा करने की जगह समझें।',
      tendEn: 'Treat the relationship as a place to share, not a contest to win.',
    },
  },
  // 8th — sudden change, research, hidden matters, shared resources
  {
    strong: {
      leadHi: 'अपने बल में सूर्य आपके आठवें भाव — गहरे रहस्य और रूपांतरण — में है, और यह एक दुर्लभ आंतरिक शक्ति देता है: आप गहराई में जाकर भी अपना आत्मविश्वास नहीं खोते। छिपे सत्य खोजना आपके लिए सहज है।',
      leadEn: 'In its strength the Sun is in your eighth house — deep mystery and transformation — and it gives a rare inner strength: even in the depths, you don’t lose your confidence. Uncovering hidden truths comes naturally to you.',
      tendHi: 'गहराई में उतरते हुए भी अपनी रोशनी किसी एक कोने तक सीमित न रखें।',
      tendEn: 'As you go deep, don’t keep your own light confined to just one corner.',
    },
    friendly: {
      leadHi: 'सूर्य आपके आठवें भाव में एक मित्र राशि में है, तो शोध और छिपे विषयों में आपकी समझ सहजता से गहराती है। आप कठिन सच्चाइयों से भी नहीं घबराते।',
      leadEn: 'The Sun is in your eighth house in a friendly sign, so your understanding of research and hidden matters deepens with ease. Difficult truths don’t unsettle you.',
      tendHi: 'गहराई खोजते हुए दूसरों की निजता का भी आदर करें।',
      tendEn: 'While searching for depth, respect others’ privacy too.',
    },
    neutral: {
      leadHi: 'सूर्य आपके आठवें भाव में है, और आत्म-पहचान तथा अधिकार का भाव यहाँ अचानक मोड़ों से होकर गुज़रता है — स्थिरता देर से आती है। पर हर मोड़ के बाद जो आत्मविश्वास बचता है, वह असली होता है।',
      leadEn: 'The Sun is in your eighth house, and your sense of identity and standing passes through sudden turns here — steadiness comes late. But the confidence that survives each turn is the real kind.',
      tendHi: 'अनिश्चय के दौर में खुद को बार-बार साबित करने की ज़रूरत नहीं।',
      tendEn: 'In seasons of uncertainty, you don’t need to keep proving yourself.',
    },
    weak: {
      leadHi: 'निर्बल सूर्य आपके आठवें भाव में है, और आत्मविश्वास या पहचान को यहाँ बार-बार परीक्षा से गुज़रना पड़ सकता है — अचानक बदलाव अधिकार के भाव को हिला देते हैं। यह सूर्य कहता है कि असली ताक़त दिखावे में नहीं, भीतर टिके रहने में है।',
      leadEn: 'A weakened Sun is in your eighth house, and confidence or standing may be tested here again and again — sudden change can shake your sense of authority. This Sun says real strength is not in appearance but in holding steady within.',
      tendHi: 'हर उथल-पुथल को अपनी पहचान पर हमला न मानें।',
      tendEn: 'Don’t read every upheaval as an attack on who you are.',
    },
  },
  // 9th — fortune, father, teachers, faith, dharma, long journeys
  {
    strong: {
      leadHi: 'अपने बल में सूर्य आपके नवें भाव — भाग्य, पिता और धर्म — में है, और यह पिता तथा गुरुजनों से मिले आशीर्वाद को प्रतिष्ठा में बदल देता है। आपकी श्रद्धा दिखावे की नहीं, गहरी और स्पष्ट होती है।',
      leadEn: 'In its strength the Sun is in your ninth house — fortune, father and dharma — and it turns the blessing of father and teachers into standing. Your faith is not for show — it is deep and clear.',
      tendHi: 'अपने विश्वास को दूसरों पर थोपने से बचें।',
      tendEn: 'Be careful not to impose your own beliefs on others.',
    },
    friendly: {
      leadHi: 'सूर्य आपके नवें भाव में एक मित्र राशि में है, तो भाग्य और धर्म के विषय सहजता से उजागर होते हैं। पिता या गुरुओं से आपका नाता आदरपूर्ण होता है।',
      leadEn: 'The Sun is in your ninth house in a friendly sign, so matters of fortune and dharma unfold with ease. Your bond with father or teachers carries mutual respect.',
      tendHi: 'आशीर्वाद को आलस्य का बहाना न बनाएँ — कर्म जारी रखें।',
      tendEn: 'Don’t let a blessing become an excuse for ease — keep up the effort.',
    },
    neutral: {
      leadHi: 'सूर्य आपके नवें भाव में है, और भाग्य, श्रद्धा या पिता से सम्बन्ध धैर्य से, समय के साथ प्रगाढ़ होते हैं। आशीर्वाद तुरंत नहीं, निभाए कर्तव्य से मिलता है।',
      leadEn: 'The Sun is in your ninth house, and fortune, faith or the bond with your father deepen slowly, through patience. Blessing arrives not quickly, but through duty kept.',
      tendHi: 'भाग्य की प्रतीक्षा में अपना कर्म न रोकें।',
      tendEn: 'Don’t pause your own effort while waiting on fortune.',
    },
    weak: {
      leadHi: 'निर्बल सूर्य आपके नवें भाव में है, और पिता से सम्बन्ध, श्रद्धा या भाग्य से जुड़े विषय परीक्षा ले सकते हैं — दूरी, या मार्गदर्शन की कमी का भाव। यह सूर्य कहता है कि जो श्रद्धा आप स्वयं गढ़ते हैं, वह किसी से उधार ली हुई श्रद्धा से अधिक टिकाऊ होती है।',
      leadEn: 'A weakened Sun is in your ninth house, and matters of father, faith or fortune can be tested — a distance, or the feel of missing guidance. This Sun says the faith you build yourself outlasts any faith borrowed from someone else.',
      tendHi: 'मार्गदर्शन की कमी में भी अपनी राह खुद तय करना सीखें।',
      tendEn: 'Even without guidance, learn to chart your own path.',
    },
  },
  // 10th — career, reputation, standing (digbala — the Sun's showcase)
  {
    strong: {
      leadHi: 'सूर्य अपनी शक्ति में आपके दसवें भाव — करियर और मान-सम्मान — के शिखर पर बैठा है, जहाँ इसे दिशा-बल मिलता है। यह एक राजा जैसी प्रतिष्ठा देता है: नेतृत्व जो स्वाभाविक लगे, और एक नाम जिसे समाज खुद पहचान दे।',
      leadEn: 'The Sun sits in its strength at the peak of your tenth house — career and reputation — where it gains directional strength. It gives a king-like standing: leadership that feels natural, and a name that society recognises on its own.',
      tendHi: 'ऊँचे पद पर भी दूसरों का योगदान खुले दिल से मानें।',
      tendEn: 'Even at a high standing, acknowledge others’ contribution openly.',
    },
    friendly: {
      leadHi: 'सूर्य आपके दसवें भाव में एक मित्र राशि में है — करियर और प्रतिष्ठा का भाव, जहाँ सूर्य सहज बल पाता है। आपका नाम योग्यता से बनता है, पद से नहीं।',
      leadEn: 'The Sun is in your tenth house in a friendly sign — career and reputation, where it gains strength easily. Your name is built on merit, not on title alone.',
      tendHi: 'बढ़ते कद के साथ अपनों के लिए समय निकालना न भूलें।',
      tendEn: 'As your standing grows, don’t forget to make time for your own people.',
    },
    neutral: {
      leadHi: 'सूर्य आपके दसवें भाव में है — मान-सम्मान का शिखर — और यहाँ पहचान धीरे-धीरे, निभाए गए कामों से बनती है। उन्नति एक झटके में नहीं आती, पर जो स्थान आप पाते हैं वह टिकता है।',
      leadEn: 'The Sun is in your tenth house — the peak of reputation — and recognition here builds gradually, through work actually done. Advancement doesn’t arrive in one leap, but the standing you reach holds.',
      tendHi: 'दूसरों की तेज़ चमक से अपनी प्रगति को न नापें।',
      tendEn: 'Don’t measure your progress against someone else’s quicker shine.',
    },
    weak: {
      leadHi: 'निर्बल होते हुए भी सूर्य आपके दसवें भाव में है — एक भाव जो सूर्य को सँभाल लेता है। करियर में शुरुआती संघर्ष या पहचान की देरी खल सकती है, पर आपकी प्रतिष्ठा चमक से नहीं, निभाव और योग्यता से बनती है।',
      leadEn: 'Even weakened, the Sun is in your tenth house — a seat that carries it. Career may bring early struggle or slow recognition, but your standing is built on reliability and merit, not shine.',
      tendHi: 'शुरुआती अनदेखी को अंत न मानें — यहाँ जो डटा रहता है, वही अंततः पहचाना जाता है।',
      tendEn: 'Don’t take early neglect as the end — here, the one who stays is the one finally recognised.',
    },
  },
  // 11th — income, gains, friends, elder siblings, wishes (upachaya)
  {
    strong: {
      leadHi: 'अपने बल में सूर्य आपके ग्यारहवें भाव — आय, लाभ और मित्र — में है, और यह उसके फलदायी भावों में से एक है। लाभ आपकी स्थिति और नेतृत्व से जुड़े होते हैं, और प्रभावशाली लोग आपके मित्र बनते हैं।',
      leadEn: 'In its strength the Sun is in your eleventh house — income, gains and friends — one of its fruitful seats. Gains are tied to your standing and leadership, and influential people become your allies.',
      tendHi: 'लाभ और मित्रता दोनों में मित्रों को सिर्फ़ उपयोगिता से न आँकें।',
      tendEn: 'In both gains and friendship, don’t judge your friends only by their usefulness.',
    },
    friendly: {
      leadHi: 'सूर्य आपके ग्यारहवें भाव में एक मित्र राशि में है, तो लाभ और बड़े भाई-बहनों या वरिष्ठों से संबंध सहजता से बनते हैं। आपकी इच्छाएँ अक्सर मेहनत के साथ पूरी होती हैं।',
      leadEn: 'The Sun is in your eleventh house in a friendly sign, so gains and ties with elder siblings or seniors form with ease. Your wishes often meet fulfilment alongside your own effort.',
      tendHi: 'मिलते लाभ को अपनी मेहनत भुलाने का कारण न बनाएँ।',
      tendEn: 'Don’t let steady gains make you forget the effort behind them.',
    },
    neutral: {
      leadHi: 'सूर्य आपके ग्यारहवें भाव में है, और यह उन भावों में से है जहाँ सूर्य समय के साथ निखरता है — लाभ और इच्छाओं की पूर्ति धीरे आती है, पर टिकती है। बड़ा दायरा बनाने में समय लगता है।',
      leadEn: 'The Sun is in your eleventh house, one of the seats where it brightens with time — gains and wishes arrive slowly, but they stay. Building a wide circle takes time.',
      tendHi: 'छोटे लाभ को नज़रअंदाज़ न करें — वे बड़े की नींव हैं।',
      tendEn: 'Don’t overlook the small gains — they are the foundation for the larger ones.',
    },
    weak: {
      leadHi: 'निर्बल होते हुए भी सूर्य आपके ग्यारहवें भाव में है — एक अनुकूल भाव। लाभ और मित्रता में शुरू में देरी या अनदेखी खल सकती है, पर दीर्घकाल में सूर्य यहाँ डटे रहने वाले को पहचान देता है।',
      leadEn: 'Even weakened, the Sun is in your eleventh house — a favourable seat. Gains and friendships may feel slow or overlooked at first, but over the long run the Sun here recognises the one who stays the course.',
      tendHi: 'मित्रता में मान्यता मिलने का इंतज़ार किए बिना भी ईमानदार रहें।',
      tendEn: 'Stay genuine in friendship, even while waiting for it to be recognised.',
    },
  },
  // 12th — expenses, rest, foreign lands, spiritual release
  {
    strong: {
      leadHi: 'अपने बल में सूर्य आपके बारहवें भाव — एकांत और मुक्ति — में है, और यह आत्मविश्वास को शोर से हटाकर भीतर की ओर मोड़ देता है। विदेश या दूर की जगहों में आपको वह पहचान मिल सकती है जो घर पर देर से मिलती है।',
      leadEn: 'In its strength the Sun is in your twelfth house — solitude and release — and it turns confidence away from the crowd and inward. Recognition abroad or in faraway places may come to you sooner than it does at home.',
      tendHi: 'भीतर का तेज बनाए रखें, भले बाहर पहचान देर से मिले।',
      tendEn: 'Keep your inner glow steady, even if outer recognition takes its time.',
    },
    friendly: {
      leadHi: 'सूर्य आपके बारहवें भाव में एक मित्र राशि में है, तो एकांत और भीतर की यात्रा आपके आत्मविश्वास को कम नहीं करती, बल्कि गहराती है। दूर देश से आपका नाता सहज बनता है।',
      leadEn: 'The Sun is in your twelfth house in a friendly sign, so solitude and the inward journey don’t dim your confidence — they deepen it. Your connection with faraway lands comes easily.',
      tendHi: 'भीतर मुड़ते हुए अपनों से नाता बनाए रखें।',
      tendEn: 'As you turn inward, keep the thread to your own people alive.',
    },
    neutral: {
      leadHi: 'सूर्य आपके बारहवें भाव में है, और पहचान तथा आत्म-सम्मान यहाँ सार्वजनिक मंच से हटकर, भीतर के किसी शांत कोने में बनते हैं। बाहरी वाहवाही देर से आती है, या कभी नहीं आती — पर भीतर का भरोसा गहरा होता है।',
      leadEn: 'The Sun is in your twelfth house, and recognition and self-respect form away from the public stage, in some quiet corner within. Outer applause arrives late, or not at all — but the inner conviction runs deep.',
      tendHi: 'पहचान को बाहर ढूँढ़ने के बजाय भीतर गढ़ना सीखें।',
      tendEn: 'Learn to build recognition within, rather than searching for it outside.',
    },
    weak: {
      leadHi: 'निर्बल सूर्य आपके बारहवें भाव में है, और आत्मविश्वास तथा पहचान को लेकर एक भीतरी थकान या अनदेखे होने का भाव रह सकता है — मेहनत का श्रेय दूर, देर से, या कहीं और मिलता दिखे। यह सूर्य कहता है कि असली रोशनी को गवाह की ज़रूरत नहीं होती।',
      leadEn: 'A weakened Sun is in your twelfth house, and there can be an inner fatigue around confidence and recognition — credit for your effort seems to land far away, late, or elsewhere. This Sun says real light needs no witness.',
      tendHi: 'पहचान न मिलने पर भी अपने काम की कीमत खुद जानें।',
      tendEn: 'Even without recognition, know the worth of your own work.',
    },
  },
];

export const SUN_MODIFIERS: GrahaModifiers = {
  lordship: {
    hi: (houses: string) =>
      `और चूँकि यही सूर्य आपके ${houses} का भी स्वामी है, इसका प्रकाश और अधिकार उन पक्षों को भी छूता है।`,
    en: (houses: string) =>
      `And because this same Sun also rules your ${houses}, its light and authority touch those parts of life too.`,
  },
};
