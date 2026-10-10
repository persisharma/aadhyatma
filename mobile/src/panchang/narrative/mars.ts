/**
 * Mars — the narrative-voice reading (design.md §78).
 * 12 houses × 4 dignity buckets. Draft until the jyotishi signs it off
 * (`GRAHA_NARRATIVE_REVIEW`, RULEBOOK §14.7.10).
 */
import type { GrahaModifiers, GrahaNarrativeTable } from './types';

export const MARS_NARRATIVE: GrahaNarrativeTable = [
  // 1st — self, body, nature, confidence
  {
    strong: {
      leadHi: 'अपने बल में मंगल आपके पहले भाव — स्वयं आप, शरीर और स्वभाव — पर बैठा है, और यह बचपन से ही एक तेज़, सक्रिय स्वभाव गढ़ता है। आपमें एक सहज साहस है जो कठिन घड़ी में सबसे पहले आगे आता है; लोग स्वाभाविक रूप से आपकी ओर नेतृत्व के लिए देखते हैं।',
      leadEn: 'In its strength Mars sits on your first house — you yourself, body and nature — and shapes a quick, energetic temperament from early on. You carry a natural courage that steps forward first in a hard moment; people look to you for a lead without being asked.',
      tendHi: 'इस तेज़ी को जल्दबाज़ी न बनने दें — सोचकर उठाया कदम उतना ही असरदार होता है।',
      tendEn: 'Don’t let that quickness turn into haste — a considered step lands just as hard.',
    },
    friendly: {
      leadHi: 'मंगल आपके पहले भाव में एक मित्र राशि में है, तो आत्मविश्वास और ऊर्जा सहज रूप से साथ चलते हैं। आप जोखिम से नहीं डरते, पर सोच-समझकर आगे बढ़ते हैं।',
      leadEn: 'Mars is in your first house in a friendly sign, so confidence and energy walk together with ease. You are not afraid of risk, yet you move with a measure of thought.',
      tendHi: 'अपनी ऊर्जा को रोज़ किसी ठोस काम में लगाने की आदत रखें।',
      tendEn: 'Keep the habit of pointing your energy at something solid each day.',
    },
    neutral: {
      leadHi: 'मंगल आपके पहले भाव में है, और स्वभाव में एक बेचैनी रह सकती है — मन जल्दी उकता जाता है, कदम उठाने की हड़बड़ी रहती है। समय के साथ यही ऊर्जा धैर्य के साथ जुड़कर असली बल बनती है।',
      leadEn: 'Mars is in your first house, and your nature can carry a restlessness — the mind tires of waiting, and you’re quick to act before thinking it through. Over time this same energy, paired with patience, turns into real strength.',
      tendHi: 'कदम उठाने से पहले एक साँस रुकने की आदत डालें।',
      tendEn: 'Build the habit of one breath’s pause before you act.',
    },
    weak: {
      leadHi: 'निर्बल मंगल आपके पहले भाव पर है, और ऊर्जा बिखरी या भीतर उलझी हुई लग सकती है — गुस्सा जल्दी उठता है या आत्मविश्वास डगमगाता है। पर यही मंगल, समय के साथ, एक शांत, सधा हुआ संकल्प गढ़ता है जो दिखावटी दबंगई से कहीं अधिक टिकता है।',
      leadEn: 'A weakened Mars sits on your first house, and energy can feel scattered or turned inward — quick flares of frustration, or confidence that wavers. Yet this same Mars, given time, shapes a calm, disciplined resolve that outlasts any show of force.',
      tendHi: 'गुस्से को शब्द बनने से पहले एक पल रुककर देखें।',
      tendEn: 'Give anger a pause before it turns into words.',
    },
  },
  // 2nd — family, savings, speech, food
  {
    strong: {
      leadHi: 'अपने बल में मंगल आपके दूसरे भाव — परिवार, बचत और वाणी — में है, और यह परिवार की रक्षा व ज़रूरतों के लिए एक दृढ़, सक्रिय रुख देता है। आपकी बात सीधी होती है, और जब बात धन या अपनों की हो, आप निर्णय लेने में देर नहीं करते।',
      leadEn: 'In its strength Mars is in your second house — family, savings and speech — and it gives a firm, active readiness to protect and provide for family. Your words are direct, and when it comes to money or your people, you don’t delay a decision.',
      tendHi: 'सीधी बात कहते हुए स्वर की गर्माहट भी बनाए रखें।',
      tendEn: 'Keep warmth in your tone even when the words are direct.',
    },
    friendly: {
      leadHi: 'मंगल आपके दूसरे भाव में एक मित्र राशि में है, तो परिवार और धन के मामलों में आपका रुख सक्रिय पर संतुलित रहता है। आप जो तय करते हैं, पूरे मन से करते हैं।',
      leadEn: 'Mars is in your second house in a friendly sign, so your approach to family and money stays active but balanced. What you decide, you commit to fully.',
      tendHi: 'धन के फैसले जल्दबाज़ी में नहीं, सोचकर लें।',
      tendEn: 'Make money decisions with thought, not in a rush.',
    },
    neutral: {
      leadHi: 'मंगल आपके दूसरे भाव में है, और वाणी में एक तीखापन आ सकता है जो इरादे से ज़्यादा चुभता है। धन के विषय में भी जल्दबाज़ी के बजाय ठहराव सीखना पड़ता है।',
      leadEn: 'Mars is in your second house, and speech can carry an edge that stings more than you mean it to. Money matters too ask you to learn steadiness over quick moves.',
      tendHi: 'बोलने से पहले एक बार शब्द पलट कर सुनें।',
      tendEn: 'Before you speak, turn the words over once in your own ear.',
    },
    weak: {
      leadHi: 'निर्बल मंगल आपके दूसरे भाव में है, और परिवार में तीखी बातचीत या धन के मामलों में जल्दबाज़ी भारी पड़ सकती है। यह मंगल कठिन राह से सिखाता है कि ताक़त रक्षा में है, टकराव में नहीं — और यही सीख अंततः एक भरोसेमंद, संभालने वाला स्वभाव गढ़ती है।',
      leadEn: 'A weakened Mars is in your second house, and sharp exchanges at home or hasty money moves can cost you. This Mars teaches the hard way that strength lies in protecting, not in clashing — and that lesson finally shapes a dependable, steadying nature.',
      tendHi: 'कड़े शब्द कहने से पहले परिवार के साथ अपने रिश्ते को याद रखें।',
      tendEn: 'Before a hard word, remember the relationship you’re speaking into.',
    },
  },
  // 3rd — courage, effort, siblings, communication
  {
    strong: {
      leadHi: 'मंगल आपके तीसरे भाव — साहस, मेहनत और भाई-बहन — में अपने बल में है, और यह उसका सबसे अपना स्थान है, क्योंकि यह भाव स्वयं मंगल के स्वभाव से जुड़ा है। पहल करना, जोखिम उठाना और डटकर खड़े रहना आपके लिए सहज है; छोटे भाई-बहनों के लिए आप एक ढाल की तरह हैं।',
      leadEn: 'Mars is in its strength in your third house — courage, effort and siblings — and this is its most natural seat, since the house itself shares Mars’s own temperament. Taking initiative, taking a risk, standing your ground — these come easily to you; for younger siblings, you are a shield.',
      tendHi: 'अपनी ताक़त दिखाने से ज़्यादा उसका इस्तेमाल करने पर ध्यान दें।',
      tendEn: 'Focus less on showing your strength and more on putting it to use.',
    },
    friendly: {
      leadHi: 'मंगल आपके तीसरे भाव में एक मित्र राशि में है — साहस और संवाद का भाव, जहाँ इसे सहज बल मिलता है। आपका प्रयास दिखावे का नहीं, असरदार होता है।',
      leadEn: 'Mars is in your third house in a friendly sign — courage and communication, where it gains strength with ease. Your effort is not for show; it lands.',
      tendHi: 'भाई-बहनों और साथियों के साथ अपनी ऊर्जा बाँटना न भूलें।',
      tendEn: 'Don’t forget to share that energy with siblings and companions too.',
    },
    neutral: {
      leadHi: 'मंगल आपके तीसरे भाव में है, और साहस धीरे-धीरे बनता है — शुरुआत में पहल करने में झिझक लग सकती है। पर यह भाव मंगल को समय के साथ निखारता है, और लगातार कोशिश असली बल में बदल जाती है।',
      leadEn: 'Mars is in your third house, and courage builds gradually — initiative may feel hesitant at first. But this house sharpens Mars over time, and steady effort turns into real strength.',
      tendHi: 'छोटे, नियमित प्रयास बड़े साहस की नींव रखते हैं।',
      tendEn: 'Small, regular efforts lay the foundation for real courage.',
    },
    weak: {
      leadHi: 'निर्बल होते हुए भी मंगल आपके तीसरे भाव में है — और यह राहत की बात है, क्योंकि यह भाव मंगल को सँभाल लेता है। आरम्भ में पहल करने का मन न होना या भाई-बहनों से दूरी खल सकती है, पर दृढ़ता यहाँ अंततः जीतती है।',
      leadEn: 'Even weakened, Mars is in your third house — and that is a mercy, since this house carries Mars well. A reluctance to take the first step, or some distance from siblings, may show up early, but persistence wins out here in the end.',
      tendHi: 'पहल करने से न हिचकें, भले छोटी हो — यहाँ रुकना असली जोखिम है।',
      tendEn: 'Don’t hesitate to take the first step, however small — here, stopping is the real risk.',
    },
  },
  // 4th — home, mother, property, peace of mind
  {
    strong: {
      leadHi: 'अपने बल में मंगल आपके चौथे भाव — घर, माँ और ज़मीन-जायदाद — में है, और यह संपत्ति व घर बनाने की एक दृढ़ इच्छा देता है जिसे आप मेहनत से पूरा करते हैं। आप अपने घर और अपनों की रक्षा के लिए सक्रिय रहते हैं।',
      leadEn: 'In its strength Mars is in your fourth house — home, mother and property — and it gives a determined drive to build a home and acquire land, one you follow through with effort. You stay active in protecting your home and the people in it.',
      tendHi: 'घर में निर्णय लेते समय दूसरों की राय को भी जगह दें।',
      tendEn: 'When deciding things at home, leave room for others’ say too.',
    },
    friendly: {
      leadHi: 'मंगल आपके चौथे भाव में एक मित्र राशि में है, तो घर और संपत्ति के विषय सक्रिय प्रयास से सुलझते हैं। आप स्थिरता के लिए मेहनत करने से नहीं हिचकते।',
      leadEn: 'Mars is in your fourth house in a friendly sign, so matters of home and property move forward through active effort. You don’t shy from working hard for stability.',
      tendHi: 'घर को आराम की जगह भी रहने दें, सिर्फ़ काम की नहीं।',
      tendEn: 'Let home stay a place of rest too, not only of work.',
    },
    neutral: {
      leadHi: 'मंगल आपके चौथे भाव में है, और घर में कभी-कभी एक बेचैनी या तनातनी का माहौल बन सकता है — मन जल्दी शांत नहीं होता। पर सक्रिय प्रयास से घर और मन, दोनों धीरे-धीरे सध जाते हैं।',
      leadEn: 'Mars is in your fourth house, and home can sometimes carry a restlessness or friction — the mind is slow to settle. But active effort gradually steadies both the home and the heart.',
      tendHi: 'घर में मतभेद को शांत स्वर में रखने की कोशिश करें।',
      tendEn: 'Try to keep disagreements at home in a calm voice.',
    },
    weak: {
      leadHi: 'निर्बल मंगल आपके चौथे भाव में है, और घर में तनाव या माँ के साथ थोड़ी दूरी खल सकती है, या मन भीतर से बेचैन रहता है। यह मंगल सिखाता है कि असली ताक़त घर में शांति बनाए रखने में है — और जो यह सीखते हैं, वे एक गहरी, कमाई हुई स्थिरता पाते हैं।',
      leadEn: 'A weakened Mars is in your fourth house, and home can carry tension, or some distance with your mother, or a mind that stays restless within. This Mars teaches that real strength lies in keeping peace at home — and those who learn it earn a deep, hard-won steadiness.',
      tendHi: 'घर के भीतर गुस्से से पहले ठहरने का अभ्यास रखें।',
      tendEn: 'Practise pausing before anger finds its way into the home.',
    },
  },
  // 5th — studies, intelligence, creativity, children
  {
    strong: {
      leadHi: 'अपने बल में मंगल आपके पाँचवें भाव — बुद्धि, सृजन और संतान — में है, और यह एक तेज़, प्रतिस्पर्धी बुद्धि देता है जो चुनौतियों में सबसे अच्छा निखरती है। आपकी रचनात्मकता साहसिक है, डरपोक नहीं।',
      leadEn: 'In its strength Mars is in your fifth house — intellect, creativity and children — and it gives a sharp, competitive mind that shows its best under challenge. Your creativity is bold, not timid.',
      tendHi: 'जीतने की ललक को सीखने के आनंद से ऊपर न रखें।',
      tendEn: 'Don’t let the drive to win outrank the joy of learning itself.',
    },
    friendly: {
      leadHi: 'मंगल आपके पाँचवें भाव में एक मित्र राशि में है, तो बुद्धि साहसी विषयों की ओर सहज झुकती है। आप जो सीखते हैं, उसे व्यवहार में उतारने से नहीं डरते।',
      leadEn: 'Mars is in your fifth house in a friendly sign, so the mind leans naturally toward bold subjects. You’re not afraid to put what you learn into practice.',
      tendHi: 'संतान या रचनात्मक कामों में जल्दबाज़ी से बचें।',
      tendEn: 'Avoid rushing matters of children or creative work.',
    },
    neutral: {
      leadHi: 'मंगल आपके पाँचवें भाव में है, और सीखने या सृजन में बेचैनी आ सकती है — मन एक जगह टिककर गहराई में जाने में झिझकता है। धैर्य से किया अभ्यास यहाँ असली फल देता है।',
      leadEn: 'Mars is in your fifth house, and learning or creative work can carry a restlessness — the mind hesitates to settle and go deep in one place. Practice done with patience bears the real fruit here.',
      tendHi: 'एक विषय पर टिकने का अभ्यास रखें, भले मन भटके।',
      tendEn: 'Practise staying with one subject, even when the mind wants to wander.',
    },
    weak: {
      leadHi: 'निर्बल मंगल आपके पाँचवें भाव में है, और पढ़ाई या संतान के विषयों में रुकावट, झुँझलाहट या प्रतिस्पर्धा का दबाव खल सकता है। यह मंगल कहता है कि तेज़ी से नहीं, लगन से सीखी बात टिकती है — और यह सीख अंततः एक गहरी समझ देती है।',
      leadEn: 'A weakened Mars is in your fifth house, and studies or matters of children can bring blocks, frustration or the pressure of competing. This Mars says what is learned through steady effort, not speed, is what lasts — and that lesson finally gives a deeper understanding.',
      tendHi: 'असफलता पर झुँझलाने के बजाय फिर से कोशिश करने को चुनें।',
      tendEn: 'Choose trying again over frustration when something doesn’t land.',
    },
  },
  // 6th — work, routine, competition, service, debts
  {
    strong: {
      leadHi: 'मंगल आपके छठे भाव — रोज़ का काम, प्रतियोगिता और कर्ज़ — में अपने बल में है, और यह उसके सबसे सशक्त स्थानों में से एक है, क्योंकि प्रतिस्पर्धा मंगल का अपना क्षेत्र है। आप प्रतिद्वंद्वियों के सामने डटकर खड़े होते हैं, और कठिन काम आपको थकाता नहीं, उभारता है।',
      leadEn: 'Mars is in its strength in your sixth house — daily work, competition and debts — and this is one of its most powerful seats, since rivalry is Mars’s own territory. You stand your ground before rivals, and hard work doesn’t wear you down, it brings out your best.',
      tendHi: 'जीतने की होड़ में अपनी सेहत को नज़रअंदाज़ न करें।',
      tendEn: 'Don’t let the push to win come at the cost of your own health.',
    },
    friendly: {
      leadHi: 'मंगल आपके छठे भाव में एक मित्र राशि में है — श्रम और प्रतियोगिता का भाव, जहाँ इसे सहज बल मिलता है। कठिन कामों में आपकी दृढ़ता चमकती है।',
      leadEn: 'Mars is in your sixth house in a friendly sign — labour and competition, where it gains strength with ease. Your resolve shines through in the hard tasks.',
      tendHi: 'प्रतिद्वंद्विता को व्यक्तिगत दुश्मनी न बनने दें।',
      tendEn: 'Don’t let competition curdle into personal enmity.',
    },
    neutral: {
      leadHi: 'मंगल आपके छठे भाव में है, और यह उन भावों में से है जो मंगल के अनुकूल हैं — रोज़ की मेहनत और प्रतियोगिता समय के साथ आपके पक्ष में झुकती है। धैर्य रखने वाला यहाँ जीतता है।',
      leadEn: 'Mars is in your sixth house, one of the seats that suits it — daily effort and competition tip in your favour over time. The one who stays patient wins here.',
      tendHi: 'धीमी शुरुआत को हार न मानें — यह अक्सर ताक़त जुटाने का समय होता है।',
      tendEn: 'Don’t read a slow start as a loss — it is often the season of gathering strength.',
    },
    weak: {
      leadHi: 'निर्बल होते हुए भी मंगल आपके छठे भाव में है, और यह एक अनुकूल भाव है — यहाँ मंगल कठिनाई को शक्ति में बदल देता है। काम भारी लग सकता है और प्रतिद्वंद्वी परीक्षा लें, पर आपका उपहार लगातार डटे रहना है, आसान जीत नहीं।',
      leadEn: 'Even weakened, Mars is in your sixth house — a seat that favours it, where it turns difficulty into strength. Work may feel heavy and rivals may test you, but your gift here is staying the course, not an easy win.',
      tendHi: 'कठिन दौर में झुँझलाहट को काम पर न निकालें।',
      tendEn: 'In a hard stretch, don’t let frustration spill onto the work itself.',
    },
  },
  // 7th — marriage, partner, partnerships
  {
    strong: {
      leadHi: 'अपने बल में मंगल आपके सातवें भाव — साझेदारी और दूसरों से व्यवहार — में है, और यह रिश्तों में एक सक्रिय, सुरक्षात्मक ऊर्जा लाता है। आप अपने साथी और साझेदारों के लिए डटकर खड़े होते हैं, और रिश्ते में पहल करने से नहीं हिचकते।',
      leadEn: 'In its strength Mars is in your seventh house — partnership and dealings with others — and it brings an active, protective energy to your relationships. You stand firmly behind your partner and collaborators, and you don’t hesitate to take the lead in a relationship.',
      tendHi: 'साझेदारी में अपनी राय रखते हुए दूसरे की भी सुनें।',
      tendEn: 'As you voice your view in a partnership, make room to hear the other’s too.',
    },
    friendly: {
      leadHi: 'मंगल आपके सातवें भाव में एक मित्र राशि में है, तो साझेदारियाँ ऊर्जा और निष्ठा दोनों से बनती हैं। आप साथी के साथ खड़े रहने में पूरी ताक़त लगाते हैं।',
      leadEn: 'Mars is in your seventh house in a friendly sign, so partnerships form with both energy and loyalty. You put your full strength behind standing by a partner.',
      tendHi: 'हर बात को प्रतियोगिता न समझें — साझेदारी सहयोग से चलती है।',
      tendEn: 'Don’t treat every exchange as a contest — partnership runs on cooperation.',
    },
    neutral: {
      leadHi: 'मंगल आपके सातवें भाव में है, और साझेदारी में कभी तीखी नोकझोंक या जल्दबाज़ी के फ़ैसले आ सकते हैं। समय के साथ यही ऊर्जा साथी की रक्षा और सहयोग में बदल जाती है।',
      leadEn: 'Mars is in your seventh house, and partnership can sometimes bring sharp exchanges or hasty decisions. Over time, this same energy turns into protecting and supporting a partner.',
      tendHi: 'मतभेद के बीच भी शांत स्वर बनाए रखने की कोशिश करें।',
      tendEn: 'Try to keep a calm tone even in the middle of a disagreement.',
    },
    weak: {
      leadHi: 'निर्बल मंगल आपके सातवें भाव में है, और साझेदारी में घर्षण या जल्दबाज़ी के फ़ैसले भारी पड़ सकते हैं। यह मंगल साझेदारी को एक साधना बनाता है — धैर्य और संयम की — और जो यह सीखते हैं, वे एक मज़बूत, भरोसेमंद बंधन पाते हैं।',
      leadEn: 'A weakened Mars is in your seventh house, and partnership can carry friction or decisions made in haste. This Mars makes partnership a practice — of patience and restraint — and those who learn it find a strong, dependable bond.',
      tendHi: 'गर्म बहस के बीच एक पल रुककर साँस लें।',
      tendEn: 'In the middle of a heated exchange, pause for one breath.',
    },
  },
  // 8th — sudden change, research, hidden matters, shared resources
  {
    strong: {
      leadHi: 'अपने बल में मंगल आपके आठवें भाव — अचानक बदलाव, शोध और छिपे विषय — में है, और यह अचानक मोड़ों का सामना करने का साहस देता है। आप गहराई में उतरकर सच खोजने से नहीं डरते।',
      leadEn: 'In its strength Mars is in your eighth house — sudden change, research and hidden matters — and it gives the courage to meet sudden turns head-on. You’re not afraid to dig deep for the truth.',
      tendHi: 'हर बदलाव से जूझने के बजाय कुछ को बहने भी दें।',
      tendEn: 'Not every change needs a fight — let some simply flow.',
    },
    friendly: {
      leadHi: 'मंगल आपके आठवें भाव में एक मित्र राशि में है, तो गहरे शोध और साझी संपत्ति के विषय सक्रिय प्रयास से सुलझते हैं। आप अनजान राह से नहीं घबराते।',
      leadEn: 'Mars is in your eighth house in a friendly sign, so deep research and shared resources move forward through active effort. You don’t shrink from unfamiliar ground.',
      tendHi: 'जो अपने नियंत्रण में नहीं, उसे पकड़े रहने से बचें।',
      tendEn: 'Avoid holding tight to what isn’t yours to control.',
    },
    neutral: {
      leadHi: 'मंगल आपके आठवें भाव में है, और अचानक मोड़ या साझी संपत्ति के विषय थोड़ी बेचैनी ला सकते हैं। पर यही भाव मंगल को गहरी सहनशक्ति और साहस की ओर मोड़ता है।',
      leadEn: 'Mars is in your eighth house, and sudden turns or shared-resource matters can bring some unease. Yet this house turns Mars toward a deep endurance and courage.',
      tendHi: 'अनिश्चितता में जल्दबाज़ी के बजाय ठहराव चुनें।',
      tendEn: 'In uncertainty, choose steadiness over a hasty move.',
    },
    weak: {
      leadHi: 'निर्बल मंगल आपके आठवें भाव में है, और अचानक बदलाव या साझी संपत्ति के विषयों में घर्षण या भारीपन खल सकता है। यह मंगल कहता है कि हर कठिन मोड़ को ताक़त से नहीं, धैर्य से पार किया जाता है — और यही धैर्य अंततः एक गहरी सहनशक्ति गढ़ता है।',
      leadEn: 'A weakened Mars is in your eighth house, and sudden change or shared-resource matters can bring friction or a sense of weight. This Mars says a hard turn is crossed not by force but by patience — and that patience finally shapes a deep endurance.',
      tendHi: 'कठिन दौर में जल्दबाज़ी के फ़ैसले से बचें।',
      tendEn: 'In a hard stretch, hold back from a hurried decision.',
    },
  },
  // 9th — fortune, father, dharma, teachers, long journeys
  {
    strong: {
      leadHi: 'अपने बल में मंगल आपके नवें भाव — भाग्य, धर्म और गुरु — में है, और यह श्रद्धा को साहस से जोड़ता है — आप जो सही मानते हैं, उसके लिए डटकर खड़े होते हैं। लंबी यात्राएँ और नई राहें आपको आकर्षित करती हैं।',
      leadEn: 'In its strength Mars is in your ninth house — fortune, dharma and teachers — and it joins faith with courage: you stand firmly for what you believe is right. Long journeys and new paths draw you in.',
      tendHi: 'अपनी मान्यताओं को दूसरों पर थोपने से बचें।',
      tendEn: 'Hold your convictions without pressing them onto others.',
    },
    friendly: {
      leadHi: 'मंगल आपके नवें भाव में एक मित्र राशि में है, तो धर्म और यात्रा के विषय सक्रिय प्रयास से गहराते हैं। आपकी श्रद्धा साहस के साथ चलती है।',
      leadEn: 'Mars is in your ninth house in a friendly sign, so matters of faith and travel deepen through active effort. Your belief walks hand in hand with courage.',
      tendHi: 'गुरु और बड़ों की बात सुनने का धैर्य भी रखें।',
      tendEn: 'Keep the patience to also listen to teachers and elders.',
    },
    neutral: {
      leadHi: 'मंगल आपके नवें भाव में है, और भाग्य या पिता से सम्बन्ध में कभी तनाव या जल्दबाज़ी के निर्णय आ सकते हैं। समय के साथ यही ऊर्जा एक दृढ़, साहसी श्रद्धा में बदल जाती है।',
      leadEn: 'Mars is in your ninth house, and fortune or the bond with your father can sometimes carry tension or hasty decisions. Over time, this same energy settles into a firm, courageous faith.',
      tendHi: 'भाग्य पर भरोसा रखते हुए अपने प्रयास में कमी न आने दें।',
      tendEn: 'Trust your fortune, but don’t let your own effort slacken.',
    },
    weak: {
      leadHi: 'निर्बल मंगल आपके नवें भाव में है, और पिता से सम्बन्ध या श्रद्धा के विषयों में घर्षण खल सकता है। यह मंगल कहता है कि विश्वास टकराव से नहीं, स्थिर प्रयास से बनता है — और यह राह अंततः अपनी, कमाई हुई श्रद्धा देती है।',
      leadEn: 'A weakened Mars is in your ninth house, and the bond with your father or matters of faith can carry friction. This Mars says conviction is built not through clashing but through steady effort — and this road finally gives a faith that is your own, hard-earned.',
      tendHi: 'पिता या गुरु से मतभेद में संयम रखें।',
      tendEn: 'Keep your composure in a disagreement with your father or a teacher.',
    },
  },
  // 10th — career, reputation, standing (digbala — directional strength for Mars)
  {
    strong: {
      leadHi: 'मंगल अपनी शक्ति में आपके दसवें भाव — करियर और मान-सम्मान — के शिखर पर बैठा है, जहाँ इसे दिशा-बल मिलता है। यह आपको निर्णायक नेतृत्व और साहसिक कदम उठाने की क्षमता देता है; आप वहाँ आगे बढ़ते हैं जहाँ दूसरे हिचकते हैं।',
      leadEn: 'Mars sits in its strength at the peak of your tenth house — career and reputation — where it gains directional strength. It gives you decisive leadership and the readiness for a bold move; you step forward where others hesitate.',
      tendHi: 'निर्णायक होने के साथ टीम की राय सुनने की जगह भी रखें।',
      tendEn: 'Stay decisive, but leave room to hear your team out too.',
    },
    friendly: {
      leadHi: 'मंगल आपके दसवें भाव में एक मित्र राशि में है — कर्म और प्रतिष्ठा का भाव, जहाँ इसे सहज बल मिलता है। आपका नाम सक्रिय प्रयास और साहसिक फ़ैसलों से बनता है।',
      leadEn: 'Mars is in your tenth house in a friendly sign — work and reputation, where it gains strength with ease. Your name is built on active effort and bold decisions.',
      tendHi: 'तेज़ी से तय करते हुए भी परिणाम पर नज़र रखें।',
      tendEn: 'Even deciding fast, keep an eye on where it leads.',
    },
    neutral: {
      leadHi: 'मंगल आपके दसवें भाव में है — कर्म और मान-सम्मान का शिखर — और यहाँ शुरुआत में जल्दबाज़ी के फ़ैसले भारी पड़ सकते हैं। पर अनुभव के साथ यही ऊर्जा सधी हुई, प्रभावी नेतृत्व में बदल जाती है।',
      leadEn: 'Mars is in your tenth house — the peak of career and standing — and early on, hasty decisions here can cost you. But with experience, this same energy turns into steady, effective leadership.',
      tendHi: 'करियर में फैसले लेने से पहले एक बार रुककर सोचें।',
      tendEn: 'Pause and think once before a career decision.',
    },
    weak: {
      leadHi: 'निर्बल होते हुए भी मंगल आपके दसवें भाव में है — एक भाव जो मंगल को सँभाल लेता है। करियर में घर्षण या जल्दबाज़ी के क़दमों से रुकावट आ सकती है, पर आपकी प्रतिष्ठा अंततः सहनशीलता और डटे रहने से बनती है।',
      leadEn: 'Even weakened, Mars is in your tenth house — a seat that carries it. Career may bring friction or setbacks from a hurried move, but your reputation finally rests on endurance and staying the course.',
      tendHi: 'शुरुआती झटके को अंत न मानें — यहाँ डटे रहना ही जीत है।',
      tendEn: 'Don’t read an early setback as the end — here, staying the course is the win.',
    },
  },
  // 11th — income, gains, friends, elder siblings, wishes
  {
    strong: {
      leadHi: 'अपने बल में मंगल आपके ग्यारहवें भाव — आय, लाभ और मित्र — में है, और यह उसके फलदायी भावों में से एक है। आप लाभ के अवसर को पहचानकर तुरंत पकड़ लेते हैं, और बड़े भाई-बहन या मित्र आपके साथ डटकर खड़े रहते हैं।',
      leadEn: 'In its strength Mars is in your eleventh house — income, gains and friends — one of its fruitful seats. You spot a chance for gain and act on it without delay, and elder siblings or friends stand firmly by you.',
      tendHi: 'लाभ की दौड़ में पुराने रिश्तों की अनदेखी न करें।',
      tendEn: 'In the chase for gains, don’t lose sight of old relationships.',
    },
    friendly: {
      leadHi: 'मंगल आपके ग्यारहवें भाव में एक मित्र राशि में है, तो लाभ और मित्रता सक्रिय प्रयास से बनते हैं। आपके मित्र आपकी हिम्मत और साथ देने की भावना को पहचानते हैं।',
      leadEn: 'Mars is in your eleventh house in a friendly sign, so gains and friendships build through active effort. Your friends recognise your courage and your readiness to stand by them.',
      tendHi: 'हर इच्छा को तुरंत पाने की जल्दी में न रहें।',
      tendEn: 'Don’t rush to claim every wish right away.',
    },
    neutral: {
      leadHi: 'मंगल आपके ग्यारहवें भाव में है, और यह उन भावों में से है जो मंगल के अनुकूल हैं — लाभ और इच्छाओं की पूर्ति सक्रिय प्रयास से धीरे-धीरे बनती है। जल्दबाज़ी से अधिक लगातार कोशिश यहाँ फल देती है।',
      leadEn: 'Mars is in your eleventh house, one of the seats that suits it — gains and wishes build gradually through active effort. Steady persistence pays off here more than a quick move.',
      tendHi: 'लाभ में देरी को असफलता न मानें।',
      tendEn: 'Don’t read a delay in gains as failure.',
    },
    weak: {
      leadHi: 'निर्बल होते हुए भी मंगल आपके ग्यारहवें भाव में है — एक अनुकूल भाव। आय अनियमित लग सकती है और मित्रता में घर्षण आ सकता है, पर दीर्घकाल में डटे रहने वाले को यहाँ मंगल फल देता है।',
      leadEn: 'Even weakened, Mars is in your eleventh house — a favourable seat. Income may feel uneven and friendships may see some friction, but over the long run Mars rewards the one who stays the course here.',
      tendHi: 'मित्रता में मतभेद को अहं का मुद्दा न बनाएँ।',
      tendEn: 'Don’t let a disagreement with a friend become a matter of ego.',
    },
  },
  // 12th — expenses, rest, faraway places, release
  {
    strong: {
      leadHi: 'अपने बल में मंगल आपके बारहवें भाव — खर्च, विश्राम और दूर देश — में है, और यह दूर यात्रा या परदेस की ओर एक साहसिक झुकाव देता है। आप अकेले भी चुनौती का सामना करने से नहीं घबराते।',
      leadEn: 'In its strength Mars is in your twelfth house — expenses, rest and faraway places — and it gives a bold pull toward travel or life abroad. You don’t shy from facing a challenge alone.',
      tendHi: 'सक्रिय रहने के साथ पूरा विश्राम लेना भी सीखें।',
      tendEn: 'Alongside staying active, learn to take proper rest too.',
    },
    friendly: {
      leadHi: 'मंगल आपके बारहवें भाव में एक मित्र राशि में है, तो एकांत में भी आपकी ऊर्जा बनी रहती है। दूर देश या नई जगह आपको रास आती है।',
      leadEn: 'Mars is in your twelfth house in a friendly sign, so your energy holds steady even in solitude. Faraway places or new ground suit you well.',
      tendHi: 'खर्च में सक्रियता को संयम के साथ जोड़ें।',
      tendEn: 'Pair that active energy with some restraint in spending.',
    },
    neutral: {
      leadHi: 'मंगल आपके बारहवें भाव में है, और ऊर्जा बिना सोचे खर्च या विश्राम में बह सकती है — मन को ठहरना नहीं आता। पर यही भाव मंगल को भीतर की ओर मोड़कर एक गहरी एकाग्रता देता है।',
      leadEn: 'Mars is in your twelfth house, and energy can drain into spending or restlessness without much thought — the mind finds it hard to settle. Yet this house turns Mars inward and gives a deep focus.',
      tendHi: 'खर्च और नींद दोनों पर एक सजग नज़र रखें।',
      tendEn: 'Keep a watchful eye on both spending and rest.',
    },
    weak: {
      leadHi: 'निर्बल मंगल आपके बारहवें भाव में है, और बेचैनी, अनावश्यक खर्च या नींद में खलल का भार खल सकता है। यह मंगल कहता है कि असली ताक़त बाहर लड़ने में नहीं, भीतर ठहरने में है — और जो यह सीखते हैं, वे एक दुर्लभ शांति पाते हैं।',
      leadEn: 'A weakened Mars is in your twelfth house, and restlessness, needless spending or broken sleep can weigh on you. This Mars says real strength lies not in fighting outward but in settling within — and those who learn it find a rare calm.',
      tendHi: 'बेचैन रातों में शरीर को ज़बरदस्ती नहीं, आराम से सुनें।',
      tendEn: 'On restless nights, listen to the body gently, not by force.',
    },
  },
];

export const MARS_MODIFIERS: GrahaModifiers = {
  lordship: {
    hi: (houses: string) =>
      `और चूँकि यही मंगल आपके ${houses} का भी स्वामी है, इसका साहस और ऊर्जा उन पक्षों को भी छूती है।`,
    en: (houses: string) =>
      `And because this same Mars also rules your ${houses}, its drive and energy touch those parts of life too.`,
  },
  combust: {
    hi: 'सूर्य के निकट होने से इसकी ऊर्जा कुछ दबी रहती है — इसका साहस दिखते जोश से अधिक एक शांत, भीतर की दृढ़ता के रूप में आता है।',
    en: 'Sitting close to the Sun, its drive runs quieter — it shows up less as visible fire and more as a calm, inward resolve.',
  },
  retrograde: {
    hi: 'और वक्री होने से यह बार-बार पुराने संघर्षों या अधूरे प्रयासों की ओर लौटाता है, आगे बढ़ने से पहले उन्हें फिर से जीने के लिए।',
    en: 'And turning retrograde, it keeps pulling you back to old battles or unfinished efforts, to revisit them before moving ahead.',
  },
};
