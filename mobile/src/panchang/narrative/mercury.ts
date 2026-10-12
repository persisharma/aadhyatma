/**
 * Mercury — the narrative-voice reading (design.md §78).
 * 12 houses × 4 dignity buckets. Draft until the jyotishi signs it off
 * (`GRAHA_NARRATIVE_REVIEW`, RULEBOOK §14.7.10).
 */
import type { GrahaModifiers, GrahaNarrativeTable } from './types';

export const MERCURY_NARRATIVE: GrahaNarrativeTable = [
  // 1st — self, body, nature, confidence (digbala — directional strength for Mercury)
  {
    strong: {
      leadHi: 'बुध अपनी शक्ति में आपके पहले भाव — स्वयं आप, शरीर और स्वभाव — के शिखर पर बैठा है, जहाँ इसे दिशा-बल मिलता है। आपकी बुद्धि तेज़ और वाणी स्पष्ट है; आप किसी भी बातचीत में जल्दी अपनी जगह बना लेते हैं।',
      leadEn: 'Mercury sits in its strength at the peak of your first house — you yourself, body and nature — where it gains directional strength. Your mind is quick and your speech clear; you find your footing fast in any conversation.',
      tendHi: 'तेज़ बुद्धि के साथ सुनने का धैर्य भी रखें।',
      tendEn: 'Alongside the quick mind, keep the patience to listen too.',
    },
    friendly: {
      leadHi: 'बुध आपके पहले भाव में एक मित्र राशि में है, तो बुद्धि और वाणी सहज रूप से सध जाती हैं। आप बात को आसानी से समझाने और समझने में माहिर हैं।',
      leadEn: 'Mercury is in your first house in a friendly sign, so intellect and speech settle into your nature with ease. You’re skilled at both grasping an idea and explaining it simply.',
      tendHi: 'हर बात पर राय देने से पहले एक पल सोचें।',
      tendEn: 'Take a moment before offering an opinion on everything.',
    },
    neutral: {
      leadHi: 'बुध आपके पहले भाव में है, और मन कई दिशाओं में एक साथ दौड़ सकता है — ध्यान बँट जाता है। पर यही चंचलता, एक दिशा मिलने पर, तेज़ सीखने की क्षमता में बदल जाती है।',
      leadEn: 'Mercury is in your first house, and the mind can run in several directions at once — attention scatters. But that same restlessness, once given a direction, turns into a quick capacity to learn.',
      tendHi: 'एक समय में एक ही काम पर टिकने का अभ्यास करें।',
      tendEn: 'Practise staying with one task at a time.',
    },
    weak: {
      leadHi: 'निर्बल बुध आपके पहले भाव में है, और आरम्भ में बोलने या अपनी बात रखने में झिझक महसूस हो सकती है — मन जल्दी उलझता है या आत्म-संशय घेर लेता है। पर यही बुध, समय और अभ्यास के साथ, एक सोची-समझी, गहरी सोच गढ़ता है जो तेज़ बुद्धि से कम नहीं।',
      leadEn: 'A weakened Mercury is in your first house, and speaking up or putting your thoughts into words may feel hesitant at first — the mind tangles easily, or self-doubt creeps in. Yet this same Mercury, given time and practice, shapes a careful, deep thinking that is no less than quick wit.',
      tendHi: 'अपने को जल्दबाज़ लोगों से न नापें — आपकी सोच की गहराई अलग है।',
      tendEn: 'Don’t measure yourself against the quick talkers — your depth of thought is its own kind.',
    },
  },
  // 2nd — family, savings, speech, food
  {
    strong: {
      leadHi: 'अपने बल में बुध आपके दूसरे भाव — परिवार, बचत और वाणी — में है, और यह एक मधुर, स्पष्ट वाणी तथा हिसाब-किताब की पकड़ देता है। आप धन को सोच-समझकर बढ़ाते हैं, और आपकी बात सुनने में अच्छी लगती है।',
      leadEn: 'In its strength Mercury is in your second house — family, savings and speech — and it gives a pleasant, clear way of speaking and a sharp grip on accounts. You grow your money thoughtfully, and people enjoy listening to you.',
      tendHi: 'वाणी की चतुराई को चापलूसी में न बदलने दें।',
      tendEn: 'Don’t let clever speech slide into flattery.',
    },
    friendly: {
      leadHi: 'बुध आपके दूसरे भाव में एक मित्र राशि में है, तो धन और वाणी के विषय सहजता से सँभलते हैं। आप हिसाब में सतर्क रहते हैं और शब्द नापकर बोलते हैं।',
      leadEn: 'Mercury is in your second house in a friendly sign, so matters of money and speech settle with ease. You stay careful with accounts and measured in your words.',
      tendHi: 'बचत के साथ उदारता की जगह भी रखें।',
      tendEn: 'Alongside saving, leave room for generosity too.',
    },
    neutral: {
      leadHi: 'बुध आपके दूसरे भाव में है, और वाणी या धन के विषय में एक चंचलता रह सकती है — बात जल्दी बदलती है, खर्च का हिसाब ढीला रह जाता है। ध्यान और अभ्यास से यह चंचलता एक सधी हुई समझ में बदल जाती है।',
      leadEn: 'Mercury is in your second house, and speech or money matters can carry a restlessness — words shift quickly, accounts stay loose. With attention and practice, that restlessness turns into a steady grasp.',
      tendHi: 'खर्च का हिसाब लिखकर रखने की आदत डालें।',
      tendEn: 'Build the habit of writing down what you spend.',
    },
    weak: {
      leadHi: 'निर्बल बुध आपके दूसरे भाव में है, और वाणी में उलझन या धन के हिसाब में भूल-चूक खल सकती है, और परिवार में बात ग़लत समझी जा सकती है। यह बुध कहता है कि शब्दों को जाँच-परखकर कहना होगा — और यह आदत अंततः एक भरोसेमंद वाणी गढ़ती है।',
      leadEn: 'A weakened Mercury is in your second house, and speech can tangle, money accounts can slip, and words at home can be misread. This Mercury says words must be weighed before they’re spoken — and that habit finally shapes a trustworthy way of speaking.',
      tendHi: 'ज़रूरी बात कहने से पहले एक बार और सोच लें।',
      tendEn: 'Before an important word, think it through once more.',
    },
  },
  // 3rd — courage, effort, siblings, communication
  {
    strong: {
      leadHi: 'अपने बल में बुध आपके तीसरे भाव — साहस, मेहनत और संवाद — में है, और यह संवाद के हर रूप में निपुणता देता है — लिखना, बोलना, समझाना। छोटे भाई-बहनों के साथ आपका तालमेल बातचीत और समझ पर टिका होता है।',
      leadEn: 'In its strength Mercury is in your third house — courage, effort and communication — and it gives skill in every form of expression: writing, speaking, explaining. Your bond with younger siblings rests on conversation and understanding.',
      tendHi: 'बोलने की कुशलता के साथ करने का साहस भी जोड़ें।',
      tendEn: 'Pair your skill with words with the courage to also act on them.',
    },
    friendly: {
      leadHi: 'बुध आपके तीसरे भाव में एक मित्र राशि में है, तो विचारों को शब्दों में ढालना आपके लिए सहज है। आपकी बातचीत स्पष्ट और असरदार होती है।',
      leadEn: 'Mercury is in your third house in a friendly sign, so turning thoughts into words comes naturally to you. Your conversation is clear and lands well.',
      tendHi: 'सलाह देने के साथ उस पर खुद भी अमल करें।',
      tendEn: 'Alongside giving advice, follow it yourself too.',
    },
    neutral: {
      leadHi: 'बुध आपके तीसरे भाव में है, और विचार तो कई आते हैं, पर उन्हें पूरा करने में मेहनत लगती है। समय के साथ सोच और प्रयास का यह तालमेल एक असरदार कौशल बन जाता है।',
      leadEn: 'Mercury is in your third house, and ideas come easily, but carrying them through takes effort. Over time, this coordination of thought and effort becomes a real skill.',
      tendHi: 'एक विचार को अंत तक ले जाने का अभ्यास रखें।',
      tendEn: 'Practise carrying one idea all the way through.',
    },
    weak: {
      leadHi: 'निर्बल होते हुए भी बुध आपके तीसरे भाव में है — और यह राहत की बात है, क्योंकि यह भाव बुध को सँभाल लेता है। आरम्भ में अपनी बात कहने में झिझक या भाई-बहनों से संवाद में उलझन खल सकती है, पर अभ्यास यहाँ अंततः जीतता है।',
      leadEn: 'Even weakened, Mercury is in your third house — and that is a mercy, since this house carries Mercury well. Early on, finding your words or talking things through with siblings may feel tangled, but practice wins out here in the end.',
      tendHi: 'बोलने का अभ्यास करते रहें, भले शुरुआत धीमी लगे।',
      tendEn: 'Keep practising speaking up, even if the start feels slow.',
    },
  },
  // 4th — home, mother, property, peace of mind
  {
    strong: {
      leadHi: 'अपने बल में बुध आपके चौथे भाव — घर, माँ और मन की शांति — में है, और यह घर में एक सहज, समझदार माहौल देता है जहाँ बातचीत से मसले सुलझते हैं। आपका मन तर्कसंगत ढंग से शांत रहना सीखता है।',
      leadEn: 'In its strength Mercury is in your fourth house — home, mother and peace of mind — and it gives home an easy, understanding atmosphere where talking things through settles matters. Your mind learns to find calm in a reasoned way.',
      tendHi: 'घर के मसलों को सुलझाते हुए भावनाओं को भी जगह दें, सिर्फ़ तर्क को नहीं।',
      tendEn: 'While reasoning through home matters, leave room for feeling too, not logic alone.',
    },
    friendly: {
      leadHi: 'बुध आपके चौथे भाव में एक मित्र राशि में है, तो घर और मन के विषय बातचीत से सुलझ जाते हैं। आप घर में एक हल्का, समझदार माहौल बनाए रखते हैं।',
      leadEn: 'Mercury is in your fourth house in a friendly sign, so home and inner matters settle through conversation. You keep a light, understanding atmosphere at home.',
      tendHi: 'सोचने के साथ घर में आराम करना भी सीखें।',
      tendEn: 'Alongside thinking things through, learn to simply rest at home too.',
    },
    neutral: {
      leadHi: 'बुध आपके चौथे भाव में है, और मन घर के भीतर भी कई विचारों में उलझा रह सकता है — शांति जल्दी नहीं मिलती। पर यही चिंतनशीलता, समय के साथ, घर को एक समझदार जगह बना देती है।',
      leadEn: 'Mercury is in your fourth house, and the mind can stay tangled in thought even at home — calm is slow to arrive. But that same reflectiveness, over time, makes home a place of understanding.',
      tendHi: 'सोने से पहले मन के विचारों को लिख लेने की आदत डालें।',
      tendEn: 'Build the habit of writing down your thoughts before sleep.',
    },
    weak: {
      leadHi: 'निर्बल बुध आपके चौथे भाव में है, और घर में बात ग़लत समझी जा सकती है, या मन भीतर उलझा रहता है, शांति देर से मिलती है। यह बुध कहता है कि घर में साफ़ और सीधी बातचीत ज़रूरी है — और यही आदत अंततः एक समझदार शांति गढ़ती है।',
      leadEn: 'A weakened Mercury is in your fourth house, and words at home can be misread, or the mind stays tangled within, slow to find quiet. This Mercury says clear, direct conversation at home matters — and that habit finally shapes an understanding kind of calm.',
      tendHi: 'घर में बात को मान लेने के बजाय साफ़ पूछ लें।',
      tendEn: 'At home, ask plainly rather than assume.',
    },
  },
  // 5th — studies, intelligence, creativity, children
  {
    strong: {
      leadHi: 'अपने बल में बुध आपके पाँचवें भाव — बुद्धि, सृजन और संतान — में है, और यह तीव्र, बहुमुखी मेधा देता है जो नए विषयों को आसानी से पकड़ लेती है। आपकी रचनात्मकता विचारों से भरी और चतुर है।',
      leadEn: 'In its strength Mercury is in your fifth house — intellect, creativity and children — and it gives a sharp, versatile mind that picks up new subjects with ease. Your creativity is full of ideas and clever in its expression.',
      tendHi: 'हर विषय को छूने के साथ कुछ में गहराई तक भी जाएँ।',
      tendEn: 'Alongside touching many subjects, let yourself go deep in a few.',
    },
    friendly: {
      leadHi: 'बुध आपके पाँचवें भाव में एक मित्र राशि में है, तो सीखना और सिखाना दोनों सहज लगते हैं। आपकी बुद्धि नए विचारों के लिए खुली रहती है।',
      leadEn: 'Mercury is in your fifth house in a friendly sign, so both learning and teaching come easily. Your mind stays open to new ideas.',
      tendHi: 'सीखने की गति को गहराई पर हावी न होने दें।',
      tendEn: 'Don’t let the pace of learning crowd out depth.',
    },
    neutral: {
      leadHi: 'बुध आपके पाँचवें भाव में है, और मन कई विषयों में भटक सकता है — एक जगह टिककर गहराई में जाना चुनौती लगता है। अनुशासित अभ्यास से यही चंचलता असली बुद्धि में बदल जाती है।',
      leadEn: 'Mercury is in your fifth house, and the mind can wander across many subjects — settling into one and going deep feels like a challenge. With disciplined practice, that same restlessness turns into real intelligence.',
      tendHi: 'एक समय में एक ही विषय चुनने का अभ्यास करें।',
      tendEn: 'Practise choosing one subject at a time.',
    },
    weak: {
      leadHi: 'निर्बल बुध आपके पाँचवें भाव में है, और पढ़ाई में ध्यान टिकाना या संतान के साथ संवाद कठिन लग सकता है। यह बुध कहता है कि बुद्धि को जल्दी नहीं, अभ्यास से तराशना होगा — और यह सीख अंततः एक गहरी, भरोसेमंद समझ देती है।',
      leadEn: 'A weakened Mercury is in your fifth house, and holding focus in studies or communicating with children can feel hard. This Mercury says the mind is sharpened not by speed but by practice — and that lesson finally gives a deep, dependable understanding.',
      tendHi: 'पढ़ाई को छोटे-छोटे हिस्सों में बाँट लें।',
      tendEn: 'Break study down into small, manageable pieces.',
    },
  },
  // 6th — work, routine, competition, service, debts
  {
    strong: {
      leadHi: 'अपने बल में बुध आपके छठे भाव — रोज़ का काम, प्रतियोगिता और कर्ज़ — में है, और यह बारीकियों पर गहरी पकड़ देता है। आप हिसाब-किताब और उलझी समस्याओं को सुलझाने में माहिर हैं; यही कौशल आपको प्रतिद्वंद्वियों से आगे रखता है।',
      leadEn: 'In its strength Mercury is in your sixth house — daily work, competition and debts — and it gives a sharp grip on detail. You’re skilled at untangling accounts and knotty problems; that skill keeps you ahead of rivals.',
      tendHi: 'बारीकियों में उलझकर बड़ी तस्वीर न भूलें।',
      tendEn: 'Don’t lose the big picture while chasing the small details.',
    },
    friendly: {
      leadHi: 'बुध आपके छठे भाव में एक मित्र राशि में है, तो रोज़ का काम सूझ-बूझ से निपटता है। आप समस्याओं को सुलझाने का रास्ता जल्दी खोज लेते हैं।',
      leadEn: 'Mercury is in your sixth house in a friendly sign, so daily work moves forward with good sense. You find your way to a solution quickly.',
      tendHi: 'काम के बोझ के बीच थोड़ा विश्राम भी रखें।',
      tendEn: 'Keep a little rest in the middle of a heavy workload.',
    },
    neutral: {
      leadHi: 'बुध आपके छठे भाव में है, और रोज़ के काम में छोटी-छोटी उलझनें या भूल-चूक हो सकती है। ध्यान और व्यवस्था से यही काम धीरे-धीरे सध जाता है।',
      leadEn: 'Mercury is in your sixth house, and daily work can bring small tangles or slips. With attention and order, that same work gradually settles.',
      tendHi: 'काम को सूची बनाकर व्यवस्थित करने की आदत रखें।',
      tendEn: 'Keep the habit of listing and organising your tasks.',
    },
    weak: {
      leadHi: 'निर्बल बुध आपके छठे भाव में है, और काम में उलझन, हिसाब में भूल या प्रतिद्वंद्वियों से तुलना का दबाव खल सकता है। यह बुध कहता है कि व्यवस्था और धैर्य से काम को सुलझाना होगा — और यह आदत अंततः एक भरोसेमंद, सावधान कार्यशैली गढ़ती है।',
      leadEn: 'A weakened Mercury is in your sixth house, and work can bring confusion, slips in accounts, or the pressure of comparing yourself to rivals. This Mercury says the work is untangled through order and patience — and that habit finally shapes a careful, dependable way of working.',
      tendHi: 'काम की भूल को दोहराने से बचने के लिए नोट बनाने की आदत डालें।',
      tendEn: 'Build the habit of noting down mistakes so they aren’t repeated.',
    },
  },
  // 7th — marriage, partner, partnerships
  {
    strong: {
      leadHi: 'अपने बल में बुध आपके सातवें भाव — साझेदारी और दूसरों से व्यवहार — में है, और यह रिश्तों में खुली, समझदार बातचीत लाता है। आप साथी के साथ विचारों का आदान-प्रदान करते हुए रिश्ता बढ़ाते हैं, और व्यापारिक साझेदारियों में आपकी सूझ-बूझ काम आती है।',
      leadEn: 'In its strength Mercury is in your seventh house — partnership and dealings with others — and it brings open, thoughtful conversation into relationships. You grow a bond through the exchange of ideas, and your good sense serves you well in business partnerships.',
      tendHi: 'बातचीत के साथ साथी की भावनाओं को भी महसूस करें, सिर्फ़ तर्क से न तौलें।',
      tendEn: 'Alongside the conversation, feel your partner’s emotions too, not just weigh them by logic.',
    },
    friendly: {
      leadHi: 'बुध आपके सातवें भाव में एक मित्र राशि में है, तो साझेदारियाँ समझ और संवाद पर टिकती हैं। आप साथी के विचारों को आसानी से समझ लेते हैं।',
      leadEn: 'Mercury is in your seventh house in a friendly sign, so partnerships rest on understanding and conversation. You grasp a partner’s thinking with ease.',
      tendHi: 'हर मतभेद को बहस में बदलने से बचें।',
      tendEn: 'Avoid turning every disagreement into a debate.',
    },
    neutral: {
      leadHi: 'बुध आपके सातवें भाव में है, और साझेदारी में बातचीत कभी उलझ सकती है — एक की बात दूसरे तक ठीक से नहीं पहुँचती। धैर्य से की गई बातचीत यहाँ रिश्ते को गहरा बनाती है।',
      leadEn: 'Mercury is in your seventh house, and conversation in a partnership can sometimes get tangled — one person’s meaning doesn’t quite land with the other. Patient conversation deepens the bond here.',
      tendHi: 'जो समझ नहीं आया, उसे दोबारा साफ़ शब्दों में पूछें।',
      tendEn: 'What isn’t understood, ask again in plainer words.',
    },
    weak: {
      leadHi: 'निर्बल बुध आपके सातवें भाव में है, और साझेदारी में ग़लतफ़हमी या बातचीत में खिंचाव खल सकता है। यह बुध कहता है कि साफ़ और धीमी बातचीत ही रिश्ते को सुलझाती है — और यह आदत अंततः एक गहरी समझ वाला बंधन गढ़ती है।',
      leadEn: 'A weakened Mercury is in your seventh house, and misunderstanding or strained conversation can trouble a partnership. This Mercury says only clear, unhurried conversation untangles the bond — and that habit finally shapes a deeply understanding relationship.',
      tendHi: 'जल्दबाज़ी में कही बात को साफ़ करने से न हिचकें।',
      tendEn: 'Don’t hesitate to clarify something said in haste.',
    },
  },
  // 8th — sudden change, research, hidden matters, shared resources
  {
    strong: {
      leadHi: 'अपने बल में बुध आपके आठवें भाव — अचानक बदलाव, शोध और छिपे विषय — में है, और यह गहरे शोध और जटिल विषयों को सुलझाने की क्षमता देता है। आप उलझे हुए सवालों के जवाब खोजने में माहिर हैं।',
      leadEn: 'In its strength Mercury is in your eighth house — sudden change, research and hidden matters — and it gives a capacity for deep research and untangling complex subjects. You’re skilled at finding answers to knotty questions.',
      tendHi: 'विश्लेषण में डूबकर भावनात्मक पक्ष को नज़रअंदाज़ न करें।',
      tendEn: 'Don’t let analysis crowd out the emotional side of things.',
    },
    friendly: {
      leadHi: 'बुध आपके आठवें भाव में एक मित्र राशि में है, तो गहरे शोध और साझी संपत्ति के हिसाब-किताब सहजता से सँभलते हैं। आप सतह के नीचे देखने में सहज हैं।',
      leadEn: 'Mercury is in your eighth house in a friendly sign, so deep research and shared-resource accounts settle with ease. You’re at ease looking beneath the surface.',
      tendHi: 'हर रहस्य को तुरंत सुलझाने की ज़िद न रखें।',
      tendEn: 'Don’t insist on untangling every mystery right away.',
    },
    neutral: {
      leadHi: 'बुध आपके आठवें भाव में है, और अचानक बदलाव के बीच मन उलझ सकता है — स्पष्टता देर से आती है। पर यही भाव बुध को गहरे, सावधान विश्लेषण की ओर मोड़ता है।',
      leadEn: 'Mercury is in your eighth house, and the mind can tangle amid sudden change — clarity arrives late. Yet this house turns Mercury toward a deep, careful analysis.',
      tendHi: 'उलझन के बीच जल्दबाज़ी में निष्कर्ष न निकालें।',
      tendEn: 'In the middle of confusion, don’t jump to a conclusion.',
    },
    weak: {
      leadHi: 'निर्बल बुध आपके आठवें भाव में है, और अचानक बदलाव या साझी संपत्ति के हिसाब में उलझन खल सकती है, और मन अफ़वाह या अनिश्चितता में भटक सकता है। यह बुध कहता है कि सच को जल्दी नहीं, सावधानी से खोजना होगा — और यही आदत अंततः एक सधी हुई समझ देती है।',
      leadEn: 'A weakened Mercury is in your eighth house, and sudden change or shared-resource accounts can tangle, and the mind can drift into rumour or uncertainty. This Mercury says the truth is found not quickly but carefully — and that habit finally gives a settled understanding.',
      tendHi: 'सुनी-सुनाई बात पर भरोसा करने से पहले खुद जाँच लें।',
      tendEn: 'Before trusting hearsay, check it yourself.',
    },
  },
  // 9th — fortune, father, dharma, teachers, long journeys
  {
    strong: {
      leadHi: 'अपने बल में बुध आपके नवें भाव — भाग्य, धर्म और गुरु — में है, और यह श्रद्धा को तर्क और समझ से जोड़ता है। आप प्रश्न पूछकर सीखते हैं, और गुरुओं से संवाद आपकी श्रद्धा को गहरा करता है।',
      leadEn: 'In its strength Mercury is in your ninth house — fortune, dharma and teachers — and it joins faith with reason and understanding. You learn by asking questions, and conversation with teachers deepens your faith.',
      tendHi: 'तर्क के साथ श्रद्धा के लिए भी जगह रखें — हर बात बुद्धि से नहीं नपती।',
      tendEn: 'Alongside reason, leave room for faith too — not everything is measured by logic.',
    },
    friendly: {
      leadHi: 'बुध आपके नवें भाव में एक मित्र राशि में है, तो धर्म और सीखने के विषय जिज्ञासा से गहराते हैं। आप प्रश्न पूछने से नहीं हिचकते।',
      leadEn: 'Mercury is in your ninth house in a friendly sign, so matters of faith and learning deepen through curiosity. You don’t hesitate to ask a question.',
      tendHi: 'सीखे हुए को व्यवहार में भी उतारें, सिर्फ़ जान लेने तक न रुकें।',
      tendEn: 'Put what you learn into practice too, not just into knowing.',
    },
    neutral: {
      leadHi: 'बुध आपके नवें भाव में है, और श्रद्धा के विषय में मन शंका और जिज्ञासा के बीच डोल सकता है। धीरे-धीरे यही प्रश्न एक गहरी, अपनी समझ में बदल जाते हैं।',
      leadEn: 'Mercury is in your ninth house, and matters of faith can leave the mind swinging between doubt and curiosity. Slowly, those very questions turn into a deep understanding of your own.',
      tendHi: 'हर उत्तर तुरंत पाने की ज़िद छोड़ें — कुछ सवाल समय माँगते हैं।',
      tendEn: 'Let go of needing every answer at once — some questions take time.',
    },
    weak: {
      leadHi: 'निर्बल बुध आपके नवें भाव में है, और पिता या गुरु के साथ संवाद में ग़लतफ़हमी, या श्रद्धा में उलझन खल सकती है। यह बुध कहता है कि समझ जल्दी नहीं, लगातार प्रश्न पूछने से आती है — और यह राह अंततः अपनी, परखी हुई श्रद्धा देती है।',
      leadEn: 'A weakened Mercury is in your ninth house, and conversation with your father or a teacher can carry misunderstanding, or faith can feel tangled. This Mercury says understanding comes not quickly but through steady questioning — and this road finally gives a tested faith of your own.',
      tendHi: 'उलझन के दौर में भी प्रश्न पूछना न छोड़ें।',
      tendEn: 'Even in a tangled season, don’t stop asking the question.',
    },
  },
  // 10th — career, reputation, standing
  {
    strong: {
      leadHi: 'अपने बल में बुध आपके दसवें भाव — करियर और मान-सम्मान — में है, और यह एक ऐसा करियर गढ़ता है जहाँ बुद्धि, संवाद या व्यापार-कौशल आगे ले जाता है। आपका नाम आपकी सूझ-बूझ और स्पष्ट सोच से बनता है।',
      leadEn: 'In its strength Mercury is in your tenth house — career and reputation — and it shapes a career where intellect, communication or trade sense carries you forward. Your name is built on good sense and clear thinking.',
      tendHi: 'चतुराई के साथ ईमानदारी बनाए रखें — यही भरोसा टिकाती है।',
      tendEn: 'Keep honesty alongside the cleverness — that is what keeps trust intact.',
    },
    friendly: {
      leadHi: 'बुध आपके दसवें भाव में एक मित्र राशि में है — कर्म और प्रतिष्ठा का भाव, जहाँ यह सहज बल पाता है। आपका काम बुद्धिमत्ता और स्पष्ट संवाद से पहचाना जाता है।',
      leadEn: 'Mercury is in your tenth house in a friendly sign — work and reputation, where it gains strength with ease. Your work is recognised for its intelligence and clear communication.',
      tendHi: 'नए विचारों के साथ उन्हें पूरा करने का धैर्य भी रखें।',
      tendEn: 'Alongside new ideas, keep the patience to see them through.',
    },
    neutral: {
      leadHi: 'बुध आपके दसवें भाव में है, और करियर में शुरुआत में दिशा तय करना मुश्किल लग सकता है — कई राहें आकर्षित करती हैं। समय के साथ यही जिज्ञासा एक स्पष्ट, कुशल राह में बदल जाती है।',
      leadEn: 'Mercury is in your tenth house, and early in your career, settling on a direction can feel hard — many paths look tempting. Over time, that same curiosity turns into a clear, skilled path.',
      tendHi: 'हर दिशा आज़माने के बजाय एक राह चुनकर उस पर टिकें।',
      tendEn: 'Rather than trying every direction, pick one path and stay with it.',
    },
    weak: {
      leadHi: 'निर्बल बुध आपके दसवें भाव में है, और करियर में दिशा बदलना या बातचीत में ग़लतफ़हमी भारी पड़ सकती है। यह बुध कहता है कि प्रतिष्ठा चतुराई से नहीं, सतत और सावधान काम से बनती है — और यह राह अंततः एक भरोसेमंद नाम गढ़ती है।',
      leadEn: 'A weakened Mercury is in your tenth house, and shifting direction in your career or misunderstandings in communication can cost you. This Mercury says reputation is built not by cleverness but by steady, careful work — and this road finally shapes a trustworthy name.',
      tendHi: 'हर बदलाव से पहले एक राह पर टिके रहने का मौक़ा दें।',
      tendEn: 'Before every change, give one path a real chance first.',
    },
  },
  // 11th — income, gains, friends, elder siblings, wishes
  {
    strong: {
      leadHi: 'अपने बल में बुध आपके ग्यारहवें भाव — आय, लाभ और मित्र — में है, और यह उसके फलदायी भावों में से एक है। बातचीत और सूझ-बूझ से लाभ के रास्ते खुलते हैं, और मित्र आपकी बुद्धि की वजह से आपकी ओर खिंचते हैं।',
      leadEn: 'In its strength Mercury is in your eleventh house — income, gains and friends — one of its fruitful seats. Conversation and good sense open the way to gains, and friends are drawn to you for your wit.',
      tendHi: 'लाभ के हिसाब में उतनी ही सतर्कता मित्रता में भी रखें।',
      tendEn: 'Keep as much care in friendship as you do in counting your gains.',
    },
    friendly: {
      leadHi: 'बुध आपके ग्यारहवें भाव में एक मित्र राशि में है, तो लाभ और मित्रता बातचीत से सहजता से बनते हैं। आपके मित्र आपकी सलाह को महत्व देते हैं।',
      leadEn: 'Mercury is in your eleventh house in a friendly sign, so gains and friendships build easily through conversation. Your friends value your advice.',
      tendHi: 'सलाह देने के साथ ख़ुद भी किसी की सुनें।',
      tendEn: 'Alongside giving advice, also take some from someone else.',
    },
    neutral: {
      leadHi: 'बुध आपके ग्यारहवें भाव में है, और लाभ के कई रास्ते दिख सकते हैं, पर किसी एक पर टिकना मुश्किल लगता है। धैर्य से चुना गया एक रास्ता यहाँ सबसे अच्छा फल देता है।',
      leadEn: 'Mercury is in your eleventh house, and many paths to gain may show themselves, yet settling on one feels hard. One path chosen with patience bears the best fruit here.',
      tendHi: 'हर नए अवसर के पीछे भागने के बजाय एक को पूरा करें।',
      tendEn: 'Instead of chasing every new opportunity, see one through.',
    },
    weak: {
      leadHi: 'निर्बल होते हुए भी बुध आपके ग्यारहवें भाव में है — एक अनुकूल भाव। आय में अनिश्चितता या मित्रता में ग़लतफ़हमी खल सकती है, पर दीर्घकाल में स्पष्ट बातचीत ही लाभ और मित्रता दोनों को सँभालती है।',
      leadEn: 'Even weakened, Mercury is in your eleventh house — a favourable seat. Income may feel uncertain and friendships may see misunderstanding, but over the long run, clear conversation is what steadies both gains and friendship.',
      tendHi: 'मित्रता में शक़ से पहले सीधे पूछ लेना बेहतर है।',
      tendEn: 'In friendship, a plain question beats a silent doubt.',
    },
  },
  // 12th — expenses, rest, faraway places, release
  {
    strong: {
      leadHi: 'अपने बल में बुध आपके बारहवें भाव — खर्च, विश्राम और दूर देश — में है, और यह एकांत में भी एक सक्रिय, जिज्ञासु मन देता है — पढ़ना, लिखना, सोचना। विदेश में पढ़ाई या काम आपके लिए सहज राह हो सकती है।',
      leadEn: 'In its strength Mercury is in your twelfth house — expenses, rest and faraway places — and it gives an active, curious mind even in solitude — reading, writing, thinking. Study or work abroad can be a natural path for you.',
      tendHi: 'सोचने में इतना न डूबें कि आराम करना भूल जाएँ।',
      tendEn: 'Don’t get so lost in thought that you forget to simply rest.',
    },
    friendly: {
      leadHi: 'बुध आपके बारहवें भाव में एक मित्र राशि में है, तो एकांत में मन शांति से काम करता है। पढ़ना और मनन करना आपको सहज लगता है।',
      leadEn: 'Mercury is in your twelfth house in a friendly sign, so the mind works calmly in solitude. Reading and reflection come naturally to you.',
      tendHi: 'खर्च का हिसाब रखते हुए मन को भी खुला छोड़ें।',
      tendEn: 'Keep track of spending, but let the mind wander freely too.',
    },
    neutral: {
      leadHi: 'बुध आपके बारहवें भाव में है, और मन एकांत में भी बेचैन घूमता रह सकता है — विचार थमते नहीं। पर यही भाव बुध को एक गहरी, मननशील आदत की ओर मोड़ता है।',
      leadEn: 'Mercury is in your twelfth house, and the mind can keep restlessly turning even in solitude — thoughts don’t settle easily. Yet this house turns Mercury toward a deep, reflective habit.',
      tendHi: 'सोने से पहले मन को शांत करने की एक आदत बनाएँ।',
      tendEn: 'Build one habit that quiets the mind before sleep.',
    },
    weak: {
      leadHi: 'निर्बल बुध आपके बारहवें भाव में है, और मन अनावश्यक चिंता या उलझे विचारों में भटक सकता है, और नींद भी प्रभावित हो सकती है। यह बुध कहता है कि मन को विश्राम देना भी एक कौशल है — और जो इसे सीखते हैं, वे एक दुर्लभ स्पष्टता पाते हैं।',
      leadEn: 'A weakened Mercury is in your twelfth house, and the mind can wander into needless worry or tangled thoughts, and sleep too can suffer. This Mercury says giving the mind rest is also a skill — and those who learn it find a rare clarity.',
      tendHi: 'सोने से पहले फ़ोन और स्क्रीन से मन को विश्राम दें।',
      tendEn: 'Before sleep, give the mind a rest from phone and screen.',
    },
  },
];

export const MERCURY_MODIFIERS: GrahaModifiers = {
  lordship: {
    hi: (houses: string) =>
      `और चूँकि यही बुध आपके ${houses} का भी स्वामी है, इसकी सोच और वाणी उन पक्षों को भी छूती है।`,
    en: (houses: string) =>
      `And because this same Mercury also rules your ${houses}, its thinking and speech touch those parts of life too.`,
  },
  combust: {
    hi: 'सूर्य के निकट होने से इसकी स्पष्टता कुछ धुँधली पड़ जाती है — इसकी बुद्धि मनन और एकांत में सबसे अच्छा काम करती है।',
    en: 'Sitting close to the Sun, its clarity is a little overshadowed, so its mind works best in reflection and quiet, not in the open glare.',
  },
  retrograde: {
    hi: 'और वक्री होने से यह सोच को बार-बार पुरानी बातों पर लौटाता है — यह आगे की दौड़ से अधिक समीक्षा और फिर से सीखने के लिए बेहतर समय है।',
    en: 'And turning retrograde, it turns thinking back over old ground — better suited to review and re-learning than to racing ahead.',
  },
};
