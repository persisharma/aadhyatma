/**
 * Moon — the narrative-voice reading (design.md §78).
 * 12 houses × 4 dignity buckets. Draft until the jyotishi signs it off
 * (`GRAHA_NARRATIVE_REVIEW`, RULEBOOK §14.7.10).
 */
import type { GrahaModifiers, GrahaNarrativeTable } from './types';

export const MOON_NARRATIVE: GrahaNarrativeTable = [
  // 1st — self, body, nature, confidence, how you begin
  {
    strong: {
      leadHi: 'अपने बल में चन्द्र आपके पहले भाव — स्वयं आप — में है, और यह एक सहज, आकर्षक और भावनात्मक रूप से खुला स्वभाव गढ़ता है। लोग आपके पास सहज महसूस करते हैं; आपकी उपस्थिति में एक ठंडक और अपनापन है।',
      leadEn: 'In its strength the Moon sits on your first house — you yourself — and shapes an easy, likeable, emotionally open nature. People feel at ease around you; your presence carries a coolness and warmth both.',
      tendHi: 'सबकी भावनाएँ सहेजते हुए अपनी भावनाओं को भी जगह दें।',
      tendEn: 'While holding everyone else’s feelings, make room for your own too.',
    },
    friendly: {
      leadHi: 'चन्द्र आपके पहले भाव में एक मित्र राशि में है, तो मन सहज रूप से शांत और मिलनसार रहता है। आप बिना प्रयास के भी लोगों को अपनी ओर खींचते हैं।',
      leadEn: 'The Moon is in your first house in a friendly sign, so the mind stays calm and sociable with ease. You draw people in without much effort.',
      tendHi: 'सबको खुश रखने की आदत में अपनी ज़रूरतों को न भुलाएँ।',
      tendEn: 'In the habit of keeping everyone happy, don’t forget your own needs.',
    },
    neutral: {
      leadHi: 'चन्द्र आपके पहले भाव में है, और मनोदशा दिन-प्रतिदिन बदलती रह सकती है — कभी उत्साह, कभी उदासी। यह उतार-चढ़ाव समय के साथ एक गहरी समझदारी में बदलता है कि मन कैसे काम करता है।',
      leadEn: 'The Moon is in your first house, and your mood can shift from day to day — sometimes bright, sometimes low. Over time, that rise and fall turns into a deep understanding of how the mind works.',
      tendHi: 'हर मनोदशा को स्थायी सच न मानें — यह भी बदलेगी।',
      tendEn: 'Don’t take every mood as the permanent truth — this one, too, will lift.',
    },
    weak: {
      leadHi: 'निर्बल चन्द्र आपके पहले भाव में है, और मन असामान्य रूप से संवेदनशील या चंचल महसूस हो सकता है — छोटी बातें भी गहरा असर छोड़ जाती हैं। यही चन्द्र, सँभाला जाए तो, एक दुर्लभ सहानुभूति और गहरी संवेदनशीलता में बदल जाता है।',
      leadEn: 'A weakened Moon sits on your first house, and the mind can feel unusually sensitive or restless — small things leave a deep mark. This same Moon, when tended, turns into a rare empathy and a deep sensitivity.',
      tendHi: 'अपनी संवेदनशीलता को कमज़ोरी नहीं, एक उपहार की तरह देखें।',
      tendEn: 'See your sensitivity not as a flaw but as a gift.',
    },
  },
  // 2nd — family, savings, speech, food
  {
    strong: {
      leadHi: 'अपने बल में चन्द्र आपके दूसरे भाव — परिवार, वाणी और खान-पान — में है, और यह घर में एक गहरा भावनात्मक जुड़ाव और स्वाद व आराम की समझ देता है। आपकी वाणी में एक सहज मिठास होती है।',
      leadEn: 'In its strength the Moon is in your second house — family, speech and food — and it gives a deep emotional bond at home and a natural feel for comfort and taste. Your speech carries an easy sweetness.',
      tendHi: 'मिठास में सच्ची बात कहने से न बचें।',
      tendEn: 'Don’t let the sweetness stop you from saying the honest thing.',
    },
    friendly: {
      leadHi: 'चन्द्र आपके दूसरे भाव में एक मित्र राशि में है, तो परिवार और घर के भोजन से जुड़े सुख सहजता से मिलते हैं। आपकी बातें घर में सुकून भरती हैं।',
      leadEn: 'The Moon is in your second house in a friendly sign, so the comforts of family and home-cooked food come easily. Your words bring comfort at home.',
      tendHi: 'घर में सबका ख्याल रखते हुए अपनी थाली और अपनी बात को भी याद रखें।',
      tendEn: 'While caring for everyone at home, remember your own plate and your own voice too.',
    },
    neutral: {
      leadHi: 'चन्द्र आपके दूसरे भाव में है, और परिवार में भावनात्मक जुड़ाव या बचत के विषय मनोदशा के साथ ऊपर-नीचे होते रह सकते हैं। धैर्य से यह जुड़ाव स्थिर होता है।',
      leadEn: 'The Moon is in your second house, and emotional closeness in the family, or matters of saving, can rise and fall with your mood. With patience, that bond steadies.',
      tendHi: 'उदास दिन में परिवार से दूरी बनाने से पहले एक पल रुकें।',
      tendEn: 'On a low day, pause before pulling away from family.',
    },
    weak: {
      leadHi: 'निर्बल चन्द्र आपके दूसरे भाव में है, और घर में भावनात्मक उतार-चढ़ाव या वाणी में तल्ख़ी महसूस हो सकती है, खासकर मन के भारी दौर में। यह चन्द्र सिखाता है कि अपनी भावनाओं को शब्दों से पहले पहचानना ज़रूरी है।',
      leadEn: 'A weakened Moon is in your second house, and the home can feel emotional swings or an edge in speech, especially in heavier moods. This Moon teaches that recognising your feelings matters before you put them into words.',
      tendHi: 'तीखे दौर में कुछ कहने से पहले एक गहरी साँस लें।',
      tendEn: 'In a sharp mood, take one deep breath before you speak.',
    },
  },
  // 3rd — courage, effort, younger siblings, short trips, self-expression
  {
    strong: {
      leadHi: 'अपने बल में चन्द्र आपके तीसरे भाव — साहस और अपनी बात रखने की कला — में है, और भावनाएँ यहाँ साहस का स्रोत बनती हैं, बाधा नहीं। आप जो महसूस करते हैं, उसे शब्दों में सहजता से ढाल लेते हैं।',
      leadEn: 'In its strength the Moon is in your third house — courage and self-expression — and feeling becomes a source of courage here, not an obstacle. What you feel, you put into words with ease.',
      tendHi: 'भावुक होकर कही बात को भी उतनी ही ज़िम्मेदारी से निभाएँ।',
      tendEn: 'Honour what you say from feeling with the same care as anything else.',
    },
    friendly: {
      leadHi: 'चन्द्र आपके तीसरे भाव में एक मित्र राशि में है, तो भाई-बहनों से आपका नाता सहज और आत्मीय होता है। छोटी यात्राएँ और नई जगहें आपको सुकून देती हैं।',
      leadEn: 'The Moon is in your third house in a friendly sign, so your bond with siblings is warm and easy. Short trips and new places bring you a sense of comfort.',
      tendHi: 'आत्मीयता में भी अपनी सीमाएँ स्पष्ट रखें।',
      tendEn: 'Even in closeness, keep your own boundaries clear.',
    },
    neutral: {
      leadHi: 'चन्द्र आपके तीसरे भाव में है, और साहस तथा अपनी बात रखना मनोदशा पर निर्भर करता है — कुछ दिन सहज, कुछ दिन संकोची। धीरे-धीरे भावनाओं पर भरोसा करना एक कौशल बन जाता है।',
      leadEn: 'The Moon is in your third house, and courage or speaking up depends on your mood — some days easy, some days shy. Slowly, trusting your feelings becomes a skill in itself.',
      tendHi: 'संकोच के दिन को अक्षमता का प्रमाण न मानें।',
      tendEn: 'Don’t read a shy day as proof you can’t do it.',
    },
    weak: {
      leadHi: 'निर्बल चन्द्र आपके तीसरे भाव में है, और भाई-बहनों से तालमेल या अपनी बात कहने में उतार-चढ़ाव महसूस हो सकता है — कभी खुलकर बोलना, कभी भीतर ही सिमट जाना। यह चन्द्र धीरे-धीरे एक स्थिर भावनात्मक आवाज़ गढ़ता है।',
      leadEn: 'A weakened Moon is in your third house, and ease with siblings or in speaking up can swing — some days open, some days withdrawn. This Moon slowly shapes a steadier emotional voice.',
      tendHi: 'चुप हो जाने के दिनों में भी किसी अपने से जुड़े रहें।',
      tendEn: 'Even on the quiet days, stay connected to someone close.',
    },
  },
  // 4th — home, mother, vehicles, property, peace of mind (digbala — the Moon's home ground)
  {
    strong: {
      leadHi: 'चन्द्र अपनी शक्ति में आपके चौथे भाव — घर और माँ — के शिखर पर बैठा है, जहाँ इसे दिशा-बल मिलता है। घर आपके लिए सच्चे सुकून की जगह है, और माँ से आपका नाता गहरा तथा कोमल होता है।',
      leadEn: 'The Moon sits in its strength at the peak of your fourth house — home and mother — where it gains directional strength. Home is a place of real comfort for you, and your bond with your mother runs deep and tender.',
      tendHi: 'घर के सुकून में डूबते हुए बाहर की ज़िम्मेदारियाँ भी याद रखें।',
      tendEn: 'Even sunk in the comfort of home, keep your outer responsibilities in view.',
    },
    friendly: {
      leadHi: 'चन्द्र आपके चौथे भाव में एक मित्र राशि में है, तो मन की शांति घर से सहजता से मिलती है। आप अपने घोंसले में सहज हैं।',
      leadEn: 'The Moon is in your fourth house in a friendly sign, so peace of mind comes easily through home. You are at ease in your own nest.',
      tendHi: 'घर के आराम में बाहर की दुनिया से जुड़ना न छोड़ें।',
      tendEn: 'Don’t let the comfort of home pull you away from the wider world.',
    },
    neutral: {
      leadHi: 'चन्द्र आपके चौथे भाव में है — घर और माँ का भाव — और यहाँ मन की शांति घर की परिस्थितियों के साथ ऊपर-नीचे होती रहती है। एक स्थिर दिनचर्या इसे सहारा देती है।',
      leadEn: 'The Moon is in your fourth house — home and mother — and here peace of mind rises and falls with home circumstances. A steady routine gives it support.',
      tendHi: 'भीतर की शांति के लिए एक नियमित आदत बनाए रखें।',
      tendEn: 'Keep one steady habit that supports your inner calm.',
    },
    weak: {
      leadHi: 'निर्बल चन्द्र आपके चौथे भाव में है, और घर या माँ से जुड़े विषयों में मन अक्सर बेचैन या असंतुष्ट महसूस कर सकता है — सुकून देर से मिलता है। यह चन्द्र सिखाता है कि शांति को किसी जगह से नहीं, अपने भीतर से उगाना पड़ता है।',
      leadEn: 'A weakened Moon is in your fourth house, and matters tied to home or mother can leave the mind restless or unsettled more often — comfort is slow to arrive. This Moon teaches that calm has to be grown from within, not found in any one place.',
      tendHi: 'घर से सुकून न मिले तो भी अपने भीतर एक शांत कोना ज़रूर रखें।',
      tendEn: 'Even if home doesn’t offer comfort, keep one quiet corner within yourself.',
    },
  },
  // 5th — studies, intelligence, creativity, children, past good deeds
  {
    strong: {
      leadHi: 'अपने बल में चन्द्र आपके पाँचवें भाव — बुद्धि, सृजन और संतान — में है, और यह एक सहज, अंतर्ज्ञान से भरी रचनात्मकता देता है। आप भावनाओं को कला या विचार में सहजता से ढाल लेते हैं।',
      leadEn: 'In its strength the Moon is in your fifth house — intellect, creativity and children — and it gives an easy, intuition-led creativity. You translate feeling into art or thought with natural ease.',
      tendHi: 'भावना से बहते हुए भी अपने विचारों को आकार देने का अनुशासन रखें।',
      tendEn: 'Even while flowing with feeling, keep the discipline to shape your ideas.',
    },
    friendly: {
      leadHi: 'चन्द्र आपके पाँचवें भाव में एक मित्र राशि में है, तो सीखना और सृजन मन के साथ सहजता से जुड़ते हैं। संतान से आपका नाता कोमल और आत्मीय होता है।',
      leadEn: 'The Moon is in your fifth house in a friendly sign, so learning and creating flow easily alongside the heart. Your bond with children is tender and close.',
      tendHi: 'कोमलता के साथ ज़रूरी अनुशासन भी बनाए रखें।',
      tendEn: 'Alongside the tenderness, keep the needed discipline too.',
    },
    neutral: {
      leadHi: 'चन्द्र आपके पाँचवें भाव में है, और एकाग्रता तथा रचनात्मकता मनोदशा के साथ ऊपर-नीचे होती रहती है — कुछ दिन विचार सहज बहते हैं, कुछ दिन मन कहीं और रहता है। समय के साथ यह प्रवाह सँभलता है।',
      leadEn: 'The Moon is in your fifth house, and focus or creativity rises and falls with your mood — some days ideas flow easily, some days the mind is elsewhere. Over time this flow settles.',
      tendHi: 'मन भटके तो खुद को कोसने के बजाय एक ब्रेक लें।',
      tendEn: 'When your mind wanders, take a break instead of blaming yourself.',
    },
    weak: {
      leadHi: 'निर्बल चन्द्र आपके पाँचवें भाव में है, और पढ़ाई, सृजन या संतान से जुड़े विषयों में भावनात्मक उतार-चढ़ाव असर डाल सकता है — एकाग्रता बनाए रखना कठिन लगे। यह चन्द्र सिखाता है कि मन को ज़बरदस्ती नहीं, धैर्य से साधना है।',
      leadEn: 'A weakened Moon is in your fifth house, and emotional swings can affect studies, creativity or matters of children — focus may feel hard to hold. This Moon teaches that the mind is tamed with patience, not force.',
      tendHi: 'भटकते मन पर गुस्सा करने के बजाय उसे कोमलता से वापस लाएँ।',
      tendEn: 'Instead of getting frustrated with a wandering mind, bring it back gently.',
    },
  },
  // 6th — daily work, routine, competition, service, debts
  {
    strong: {
      leadHi: 'अपने बल में चन्द्र आपके छठे भाव — रोज़ का काम और सेवा — में है, और आपकी सहजबोध दूसरों की ज़रूरत को पहले ही भाँप लेती है। सेवा और देखभाल के काम में आप सहज रूप से निपुण हैं।',
      leadEn: 'In its strength the Moon is in your sixth house — daily work and service — and your instinct reads others’ needs before they ask. You are naturally skilled at work that involves care and service.',
      tendHi: 'दूसरों की देखभाल में अपनी थकान को नज़रअंदाज़ न करें।',
      tendEn: 'While caring for others, don’t overlook your own tiredness.',
    },
    friendly: {
      leadHi: 'चन्द्र आपके छठे भाव में एक मित्र राशि में है, तो रोज़ का काम भावनात्मक संतुलन के साथ चलता है। सेवा के काम में आपको एक सहज संतोष मिलता है।',
      leadEn: 'The Moon is in your sixth house in a friendly sign, so daily work proceeds with emotional balance. Work that involves service brings you a quiet satisfaction.',
      tendHi: 'औरों की सेवा करते हुए अपनी सीमाएँ भी तय रखें।',
      tendEn: 'While serving others, keep your own limits clear too.',
    },
    neutral: {
      leadHi: 'चन्द्र आपके छठे भाव में है, और रोज़ की दिनचर्या तथा प्रतियोगिता मनोदशा से प्रभावित होती रहती है — कुछ दिन ऊर्जा भरी, कुछ दिन भारी। एक सधी हुई दिनचर्या इसे सम्भालती है।',
      leadEn: 'The Moon is in your sixth house, and daily routine or competition stays sensitive to mood — some days full of energy, some days heavy. A steady routine helps hold it together.',
      tendHi: 'भारी दिन में भी अपनी बुनियादी दिनचर्या न टूटने दें।',
      tendEn: 'On a heavy day, don’t let your basic routine fall apart.',
    },
    weak: {
      leadHi: 'निर्बल चन्द्र आपके छठे भाव में है, और रोज़ का काम, प्रतियोगिता या आदतें भावनात्मक उतार-चढ़ाव से प्रभावित हो सकती हैं — मन भारी हो तो रोज़मर्रा का काम भी भारी लगता है। यह चन्द्र सिखाता है कि छोटे, नियमित कदम मन की लहरों से बड़े हैं।',
      leadEn: 'A weakened Moon is in your sixth house, and daily work, competition or habits can be shaped by emotional swings — when the mind feels heavy, even routine tasks feel heavy. This Moon teaches that small, regular steps outlast the mind’s waves.',
      tendHi: 'मन भारी होने पर भी एक छोटा-सा नियमित काम ज़रूर पूरा करें।',
      tendEn: 'Even on a heavy day, keep completing one small, regular task.',
    },
  },
  // 7th — marriage, partner, partnerships
  {
    strong: {
      leadHi: 'अपने बल में चन्द्र आपके सातवें भाव — विवाह और साझेदारी — में है, और आप एक ऐसे साथी की ओर खिंचते हैं जो भावनात्मक रूप से आपको समझे। रिश्ते में देखभाल और आत्मीयता स्वाभाविक रूप से बहती है।',
      leadEn: 'In its strength the Moon is in your seventh house — marriage and partnership — and you are drawn to a partner who understands you emotionally. Care and closeness flow naturally in the bond.',
      tendHi: 'साथी की भावनाओं को सहेजते हुए अपनी भी स्पष्ट रूप से कहें।',
      tendEn: 'While holding your partner’s feelings, voice your own clearly too.',
    },
    friendly: {
      leadHi: 'चन्द्र आपके सातवें भाव में एक मित्र राशि में है, तो साझेदारी में आत्मीयता और समझ सहजता से बनती है। आप साथी के मन की थाह जल्दी पा लेते हैं।',
      leadEn: 'The Moon is in your seventh house in a friendly sign, so closeness and understanding build easily in partnership. You read your partner’s mood quickly.',
      tendHi: 'साथी की हर मनोदशा को खुद पर न ले लें।',
      tendEn: 'Don’t take on every mood of your partner as your own.',
    },
    neutral: {
      leadHi: 'चन्द्र आपके सातवें भाव में है, और साझेदारी में भावनात्मक नज़दीकी समय के साथ, धैर्य से बनती है — कुछ दौर नज़दीकी के, कुछ दूरी के। यह उतार-चढ़ाव सामान्य है और रिश्ते को गहरा भी करता है।',
      leadEn: 'The Moon is in your seventh house, and emotional closeness in partnership builds with time and patience — some seasons near, some distant. This rise and fall is normal, and it deepens the bond too.',
      tendHi: 'दूरी के दौर को अलगाव का संकेत न मान बैठें।',
      tendEn: 'Don’t read a distant season as a sign of drifting apart.',
    },
    weak: {
      leadHi: 'निर्बल चन्द्र आपके सातवें भाव में है, और विवाह या साझेदारी में भावनात्मक उतार-चढ़ाव, या साथी के मन को समझने में दिक़्क़त महसूस हो सकती है। यह चन्द्र सिखाता है कि रिश्ते में भावनाओं को शब्दों में कहना ज़रूरी है, मान लेने से काम नहीं चलता।',
      leadEn: 'A weakened Moon is in your seventh house, and marriage or partnership can carry emotional ups and downs, or difficulty reading a partner’s mind. This Moon teaches that feelings in a relationship need to be spoken, not assumed.',
      tendHi: 'मन की बात मान लेने के बजाय साथी से पूछ लें।',
      tendEn: 'Instead of assuming, ask your partner what they feel.',
    },
  },
  // 8th — sudden change, research, hidden matters, shared resources
  {
    strong: {
      leadHi: 'अपने बल में चन्द्र आपके आठवें भाव — गहरे रहस्य और रूपांतरण — में है, और यह एक गहरी अंतर्दृष्टि देता है: आप जो अनकहा है, उसे भी भाँप लेते हैं। भावनात्मक गहराई यहाँ आपकी ताक़त है।',
      leadEn: 'In its strength the Moon is in your eighth house — deep mystery and transformation — and it gives a deep intuitive insight: you sense what is left unsaid. Emotional depth is your strength here.',
      tendHi: 'गहराई में उतरते हुए दूसरों की निजी भावनाओं का भी आदर करें।',
      tendEn: 'As you go deep, respect others’ private feelings too.',
    },
    friendly: {
      leadHi: 'चन्द्र आपके आठवें भाव में एक मित्र राशि में है, तो छिपे विषयों और भावनाओं की गहराई में उतरना आपके लिए सहज है। आप दूसरों के मन की उलझन को आसानी से समझ लेते हैं।',
      leadEn: 'The Moon is in your eighth house in a friendly sign, so going deep into hidden matters and feelings comes naturally. You read others’ emotional tangles with ease.',
      tendHi: 'दूसरों की उलझन सुलझाते हुए अपनी भी देखभाल करें।',
      tendEn: 'While untangling others’ knots, take care of your own too.',
    },
    neutral: {
      leadHi: 'चन्द्र आपके आठवें भाव में है, और मन यहाँ अचानक भावनात्मक मोड़ों से गुज़र सकता है — स्थिरता देर से आती है। पर हर मोड़ के साथ समझ गहरी होती जाती है।',
      leadEn: 'The Moon is in your eighth house, and the mind can pass through sudden emotional turns here — steadiness comes late. But with each turn, understanding grows deeper.',
      tendHi: 'भावनात्मक उथल-पुथल को हमेशा का सच न मानें।',
      tendEn: 'Don’t take an emotional upheaval as the permanent truth.',
    },
    weak: {
      leadHi: 'निर्बल चन्द्र आपके आठवें भाव में है, और मन असामान्य रूप से अस्थिर या भारी महसूस हो सकता है, खासकर अनिश्चितता के दौर में। यह चन्द्र कहता है कि सबसे अंधेरे मोड़ भी एक गहरी समझ में बदल जाते हैं, अगर उनसे होकर गुज़रा जाए।',
      leadEn: 'A weakened Moon is in your eighth house, and the mind can feel unusually unsteady or heavy, especially in seasons of uncertainty. This Moon says even the darkest turns become a deep understanding, if you pass through them.',
      tendHi: 'भारी दौर में अकेले मत रहें — किसी अपने से मन की बात कहें।',
      tendEn: 'In a heavy season, don’t stay alone — share what’s on your mind with someone close.',
    },
  },
  // 9th — fortune, father, teachers, faith, dharma, long journeys
  {
    strong: {
      leadHi: 'अपने बल में चन्द्र आपके नवें भाव — भाग्य और श्रद्धा — में है, और आपकी आस्था तर्क से नहीं, गहरे अंतर्ज्ञान से उपजती है। गुरुजनों और शिक्षकों से आपका नाता कोमल और भरोसे का होता है।',
      leadEn: 'In its strength the Moon is in your ninth house — fortune and faith — and your faith rises not from argument but from deep intuition. Your bond with teachers carries warmth and trust.',
      tendHi: 'अपनी आस्था को दूसरों पर परखने की कसौटी न बनाएँ।',
      tendEn: 'Don’t make your own faith the yardstick for judging others.',
    },
    friendly: {
      leadHi: 'चन्द्र आपके नवें भाव में एक मित्र राशि में है, तो श्रद्धा और भाग्य के विषय मन की शांति से जुड़ते हैं। लंबी यात्राएँ आपको भीतर से भर देती हैं।',
      leadEn: 'The Moon is in your ninth house in a friendly sign, so faith and fortune connect with a sense of inner peace. Long journeys fill you from within.',
      tendHi: 'आस्था को भावुकता में बहने न दें — विवेक साथ रखें।',
      tendEn: 'Don’t let faith drift into sentimentality — keep discernment alongside it.',
    },
    neutral: {
      leadHi: 'चन्द्र आपके नवें भाव में है, और श्रद्धा तथा भाग्य का भाव मनोदशा के साथ बदलता रह सकता है — कभी गहरा विश्वास, कभी संशय। समय के साथ यह एक स्थिर, अनुभव से गढ़ी आस्था में बदलता है।',
      leadEn: 'The Moon is in your ninth house, and your sense of faith or fortune can shift with your mood — deep belief some days, doubt on others. Over time it settles into a steady, experience-tested faith.',
      tendHi: 'संशय के दिन को अविश्वास का फ़ैसला न मानें।',
      tendEn: 'Don’t read a doubtful day as a final verdict against faith.',
    },
    weak: {
      leadHi: 'निर्बल चन्द्र आपके नवें भाव में है, और श्रद्धा या भाग्य को लेकर मन में अनिश्चितता बनी रह सकती है — कभी उत्तर साफ़ लगते हैं, कभी दूर। यह चन्द्र सिखाता है कि आस्था को बार-बार भीतर से ताज़ा करना पड़ता है।',
      leadEn: 'A weakened Moon is in your ninth house, and the mind can carry a lingering uncertainty about faith or fortune — answers feel clear some days, distant on others. This Moon teaches that faith has to be renewed from within, again and again.',
      tendHi: 'उत्तर धुंधले लगें तो भी अपनी साधना जारी रखें।',
      tendEn: 'Even when answers feel hazy, keep up your own practice.',
    },
  },
  // 10th — career, reputation, standing
  {
    strong: {
      leadHi: 'अपने बल में चन्द्र आपके दसवें भाव — करियर और मान-सम्मान — में है, और यह जनमानस से एक सहज जुड़ाव देता है। लोग आपके काम में अपनापन महसूस करते हैं, और आपकी लोकप्रियता स्वाभाविक रूप से बढ़ती है।',
      leadEn: 'In its strength the Moon is in your tenth house — career and reputation — and it gives an easy connection with the public mind. People feel a warmth in your work, and your popularity grows naturally.',
      tendHi: 'लोकप्रियता की माँग में अपने मन की ज़रूरतों को न भुलाएँ।',
      tendEn: 'In the pull of popularity, don’t forget your own mind’s needs.',
    },
    friendly: {
      leadHi: 'चन्द्र आपके दसवें भाव में एक मित्र राशि में है, तो करियर में देखभाल, सेवा या जनसंपर्क से जुड़े काम सहजता से फलते हैं। आपका नाम भरोसे से बनता है।',
      leadEn: 'The Moon is in your tenth house in a friendly sign, so work tied to care, service or public connection flourishes easily. Your name is built on trust.',
      tendHi: 'भरोसा बनाए रखते हुए अपने निर्णय भी स्पष्ट रखें।',
      tendEn: 'While keeping that trust, keep your own decisions clear too.',
    },
    neutral: {
      leadHi: 'चन्द्र आपके दसवें भाव में है, और करियर में प्रतिष्ठा मनोदशा और जनधारणा के साथ ऊपर-नीचे होती रह सकती है — कभी पहचान मिलती दिखे, कभी दूर लगे। धैर्य से एक स्थिर नाम बनता है।',
      leadEn: 'The Moon is in your tenth house, and career standing can rise and fall with mood and public perception — recognition feels close some days, distant on others. With patience a steady name takes shape.',
      tendHi: 'जनधारणा के उतार-चढ़ाव को अपने काम की सच्ची क़ीमत न मानें।',
      tendEn: 'Don’t take the public mood’s swings as the true measure of your work.',
    },
    weak: {
      leadHi: 'निर्बल चन्द्र आपके दसवें भाव में है, और करियर में पहचान या स्थिरता को लेकर मन अक्सर अस्थिर महसूस कर सकता है — आज की सराहना कल दूर लग सकती है। यह चन्द्र सिखाता है कि अपने काम का मोल जनधारणा से तय मत करो।',
      leadEn: 'A weakened Moon is in your tenth house, and the mind can feel unsteady about recognition or stability in career — today’s praise can feel distant tomorrow. This Moon teaches you not to let public opinion set the worth of your work.',
      tendHi: 'सराहना मिले या न मिले, अपने काम में निरंतरता बनाए रखें।',
      tendEn: 'Whether or not praise arrives, keep showing up for your work.',
    },
  },
  // 11th — income, gains, friends, elder siblings, wishes
  {
    strong: {
      leadHi: 'अपने बल में चन्द्र आपके ग्यारहवें भाव — आय, लाभ और मित्र — में है, और यह मित्रों का एक बड़ा, आत्मीय दायरा देता है। आपकी इच्छाएँ अक्सर भावनात्मक संतोष के साथ पूरी होती हैं।',
      leadEn: 'In its strength the Moon is in your eleventh house — income, gains and friends — and it gives a wide, warm circle of friends. Your wishes often come fulfilled alongside a sense of emotional contentment.',
      tendHi: 'बड़े दायरे में भी कुछ गहरे, भरोसे के रिश्ते चुनकर रखें।',
      tendEn: 'Even within a wide circle, keep a few deep, trusted bonds close.',
    },
    friendly: {
      leadHi: 'चन्द्र आपके ग्यारहवें भाव में एक मित्र राशि में है, तो मित्रता और आमदनी सहजता से बढ़ते हैं। लोग आपकी संगति में सहज महसूस करते हैं।',
      leadEn: 'The Moon is in your eleventh house in a friendly sign, so friendships and income grow with ease. People feel comfortable in your company.',
      tendHi: 'सबकी संगति में अपनी ज़रूरत के एकांत को भी जगह दें।',
      tendEn: 'Amid everyone’s company, make room for the solitude you need too.',
    },
    neutral: {
      leadHi: 'चन्द्र आपके ग्यारहवें भाव में है, और मित्रता तथा लाभ मनोदशा के साथ ऊपर-नीचे होते रह सकते हैं — कुछ दौर भरे-पूरे, कुछ सूने। धैर्य से एक स्थिर दायरा बनता है।',
      leadEn: 'The Moon is in your eleventh house, and friendships or gains can rise and fall with mood — some seasons full, some quiet. A steady circle forms with patience.',
      tendHi: 'सूने दौर को दोस्ती के अंत का संकेत न मानें।',
      tendEn: 'Don’t read a quiet season as the end of a friendship.',
    },
    weak: {
      leadHi: 'निर्बल चन्द्र आपके ग्यारहवें भाव में है, और मित्रता या इच्छाओं की पूर्ति को लेकर मन में अक्सर असंतोष या अकेलापन महसूस हो सकता है। यह चन्द्र सिखाता है कि कुछ गहरे, सच्चे रिश्ते बड़े दायरे से अधिक सुकून देते हैं।',
      leadEn: 'A weakened Moon is in your eleventh house, and the mind can often carry discontent or a sense of loneliness around friendship or unfulfilled wishes. This Moon teaches that a few deep, honest bonds bring more comfort than a wide circle.',
      tendHi: 'दायरे की चौड़ाई से नहीं, गहराई से मित्रता आँकें।',
      tendEn: 'Measure friendship by its depth, not by the size of the circle.',
    },
  },
  // 12th — expenses, rest, foreign lands, spiritual release
  {
    strong: {
      leadHi: 'अपने बल में चन्द्र आपके बारहवें भाव — एकांत और मुक्ति — में है, और यह एक गहरी, सहज आध्यात्मिकता तथा विश्राम की क्षमता देता है। नींद और सपने आपके लिए सुकून का स्रोत हैं, बेचैनी का नहीं।',
      leadEn: 'In its strength the Moon is in your twelfth house — solitude and release — and it gives a deep, natural spirituality and a capacity for rest. Sleep and dreams are a source of comfort for you, not unease.',
      tendHi: 'भीतर के सुकून में डूबते हुए अपनों से नाता बनाए रखें।',
      tendEn: 'Even sunk in inner comfort, keep the thread to your own people.',
    },
    friendly: {
      leadHi: 'चन्द्र आपके बारहवें भाव में एक मित्र राशि में है, तो एकांत और भीतर की यात्रा मन को सहज रूप से भर देती है। दूर देश से आपका भावनात्मक नाता गहरा हो सकता है।',
      leadEn: 'The Moon is in your twelfth house in a friendly sign, so solitude and the inward journey fill the mind with ease. Your emotional pull toward faraway lands can run deep.',
      tendHi: 'भीतर के सुकून को सांसारिक जीवन से कटने का कारण न बनाएँ।',
      tendEn: 'Don’t let inner comfort become a reason to cut off from the world.',
    },
    neutral: {
      leadHi: 'चन्द्र आपके बारहवें भाव में है, और नींद, विश्राम या मन की शांति के विषय मनोदशा के साथ बदलते रह सकते हैं — कुछ रातें गहरी नींद की, कुछ बेचैन। एक नियमित विश्राम-अभ्यास इसे सम्भालता है।',
      leadEn: 'The Moon is in your twelfth house, and matters of sleep, rest or inner calm can shift with mood — some nights deep rest, some restless. A regular rest practice helps hold it steady.',
      tendHi: 'बेचैन रातों के बाद खुद को जज करने के बजाय आराम दें।',
      tendEn: 'After a restless night, give yourself rest, not judgement.',
    },
    weak: {
      leadHi: 'निर्बल चन्द्र आपके बारहवें भाव में है, और मन अक्सर बेचैन, अकेला या भारी महसूस कर सकता है, खासकर रात के एकांत में। यह चन्द्र सिखाता है कि एकांत को डर की जगह नहीं, भीतर लौटने की जगह बनाया जा सकता है।',
      leadEn: 'A weakened Moon is in your twelfth house, and the mind can often feel restless, lonely or heavy, especially in the quiet of night. This Moon teaches that solitude can become a place to return within, not a place of fear.',
      tendHi: 'रात का भारीपन लगे तो किसी अपने से बात करने में संकोच न करें।',
      tendEn: 'If the night feels heavy, don’t hesitate to talk to someone close.',
    },
  },
];

export const MOON_MODIFIERS: GrahaModifiers = {
  lordship: {
    hi: (houses: string) =>
      `और चूँकि यही चन्द्र आपके ${houses} का भी स्वामी है, इसकी ममता और मनोदशा उन विषयों को भी रंगती है।`,
    en: (houses: string) =>
      `And because this same Moon also rules your ${houses}, its care and mood colour those matters too.`,
  },
  combust: {
    hi: 'सूर्य के निकट होने से मन का यह प्रकाश कुछ सिमट जाता है — भाव शांत रहते हैं, और भीतर की बात भीतर ही रहना पसंद करती है।',
    en: 'Close to the Sun, the mind’s light draws inward a little — feelings run quieter, and what is felt within prefers to stay there.',
  },
};
