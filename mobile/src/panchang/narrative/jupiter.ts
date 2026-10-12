/**
 * Jupiter — the narrative-voice reading (design.md §78).
 * 12 houses × 4 dignity buckets. Draft until the jyotishi signs it off
 * (`GRAHA_NARRATIVE_REVIEW`, RULEBOOK §14.7.10).
 */
import type { GrahaModifiers, GrahaNarrativeTable } from './types';

export const JUPITER_NARRATIVE: GrahaNarrativeTable = [
  // 1st — self, body, nature, confidence (digbala — directional strength for Jupiter)
  {
    strong: {
      leadHi: 'अपने बल में गुरु आपके पहले भाव — स्वयं आप — में बैठा है, और यह बचपन से ही एक उदार, समझदार स्वभाव गढ़ता है। लोग सहज ही आपकी सलाह माँगते हैं, और आपकी उपस्थिति में एक गुरुजन जैसी गरिमा रहती है।',
      leadEn: 'In its strength Jupiter sits on your first house — you yourself — and shapes a generous, wise nature from early on. People naturally turn to you for counsel, and your presence carries a teacher’s quiet dignity.',
      tendHi: 'इस उदारता को आत्म-संतोष में न बदलने दें — सीखना जारी रखें।',
      tendEn: 'Don’t let that generosity settle into self-satisfaction — keep learning too.',
    },
    friendly: {
      leadHi: 'गुरु आपके पहले भाव में एक मित्र राशि में है, तो आशावाद और भलमनसाहत सहज रूप से आपके स्वभाव में बसते हैं। आपकी उपस्थिति में एक सहज गर्मजोशी रहती है जो लोगों को भाती है।',
      leadEn: 'Jupiter is in your first house in a friendly sign, so optimism and good nature settle into you without much effort. Your presence carries an easy warmth that people are drawn to.',
      tendHi: 'अपनी सहजता को ओढ़ी हुई सहजता न समझें — यह सच में आपकी अपनी है।',
      tendEn: 'Don’t mistake your ease for something put on — it is genuinely your own.',
    },
    neutral: {
      leadHi: 'गुरु आपके पहले भाव पर है, और आत्मविश्वास तथा जीवन-दृष्टि धीरे-धीरे, अनुभव से बनती है। शुरुआती वर्षों में राह थोड़ी टटोलती-सी लग सकती है, पर यही टटोलना आगे चलकर एक सच्ची समझ में बदलता है।',
      leadEn: 'Jupiter sits on your first house, and confidence and outlook take shape gradually, through experience. The early years can feel like you’re still finding your footing, but that searching turns into real understanding later on.',
      tendHi: 'अपनी राय बनाने में जल्दबाज़ी न करें — समय के साथ बनी समझ अधिक टिकती है।',
      tendEn: 'Don’t rush to form your views — understanding built over time holds up better.',
    },
    weak: {
      leadHi: 'निर्बल गुरु आपके पहले भाव में है, और आरम्भिक वर्षों में श्रद्धा या आत्मविश्वास डगमगा सकता है — कभी बहुत आशावादी, कभी बहुत अनिश्चित। पर यही गुरु, समय के साथ, एक नम्र और परखी हुई समझ गढ़ता है जो सतही आत्मविश्वास से अधिक गहरी होती है।',
      leadEn: 'A weakened Jupiter is in your first house, and the early years can swing between too much optimism and too much self-doubt about your own judgment. Yet this same Jupiter, given time, shapes a humble, well-tested wisdom that runs deeper than easy confidence ever could.',
      tendHi: 'अपनी राय पर तुरंत भरोसा करने से पहले उसे परखने की आदत डालें।',
      tendEn: 'Build the habit of testing a view before trusting it right away.',
    },
  },
  // 2nd — family, savings, speech, food
  {
    strong: {
      leadHi: 'अपने बल में गुरु आपके दूसरे भाव — परिवार, बचत और वाणी — में है, और यह धन व ज्ञान दोनों को उदारता से बढ़ाता है। आपकी वाणी में एक सहज सीख होती है, और परिवार आपकी सलाह पर भरोसा करता है।',
      leadEn: 'In its strength Jupiter is in your second house — family, savings and speech — and it grows both wealth and wisdom generously. Your words carry easy guidance, and family leans on your counsel.',
      tendHi: 'उदारता के साथ बचत की आदत भी रखें — दोनों साथ चल सकते हैं।',
      tendEn: 'Keep a habit of saving alongside the generosity — the two can live together.',
    },
    friendly: {
      leadHi: 'गुरु आपके दूसरे भाव में एक मित्र राशि में है, तो परिवार और वाणी के विषय सहजता से सँवरते हैं। आप जो कहते हैं, उसमें भलाई और समझ दोनों झलकते हैं।',
      leadEn: 'Jupiter is in your second house in a friendly sign, so family and speech settle with ease. What you say carries both kindness and good sense.',
      tendHi: 'अच्छी सलाह को उपदेश में न बदलने दें।',
      tendEn: 'Don’t let good advice turn into a lecture.',
    },
    neutral: {
      leadHi: 'गुरु आपके दूसरे भाव में है, और परिवार तथा बचत के विषयों में समझ धीरे-धीरे बनती है। वाणी में उदारता रहती है, भले उसका असर तुरंत न दिखे।',
      leadEn: 'Jupiter is in your second house, and understanding around family and savings builds gradually. Your speech carries generosity, even when its effect isn’t immediate.',
      tendHi: 'बचत के मामलों में अपनी उदारता पर एक नज़र रखें।',
      tendEn: 'Keep half an eye on your generosity when it comes to savings.',
    },
    weak: {
      leadHi: 'निर्बल गुरु आपके दूसरे भाव में है, और बचत या पारिवारिक मेल-मिलाप में शुरुआत में बिखराव दिख सकता है — बहुत उदार हाथ, या बात कहने में अतिशयोक्ति। यह गुरु अंततः एक सधी हुई, तोली-माँपी उदारता सिखाता है।',
      leadEn: 'A weakened Jupiter is in your second house, and savings or family harmony can feel scattered at first — too open a hand, or words that run ahead of sense. This Jupiter finally teaches a measured, well-weighed generosity.',
      tendHi: 'देने से पहले एक बार अपनी सामर्थ्य को भी तौल लें।',
      tendEn: 'Before giving, weigh your own means too.',
    },
  },
  // 3rd — courage, effort, siblings, self-expression
  {
    strong: {
      leadHi: 'अपने बल में गुरु आपके तीसरे भाव — साहस और अभिव्यक्ति — में है, और यह प्रयास को एक बड़े, उदार उद्देश्य से जोड़ देता है। आपकी मेहनत के पीछे एक सोच-समझी दिशा होती है, महज़ दिखावा नहीं।',
      leadEn: 'In its strength Jupiter is in your third house — courage and self-expression — and it ties effort to a larger, generous purpose. Behind your hard work sits real direction, not just display.',
      tendHi: 'बड़े उद्देश्य के साथ रोज़ के छोटे कदम भी न भूलें।',
      tendEn: 'Alongside the big purpose, don’t forget the small daily steps.',
    },
    friendly: {
      leadHi: 'गुरु आपके तीसरे भाव में एक मित्र राशि में है — साहस और संवाद का भाव — जहाँ यह सहज समर्थन देता है। आपकी बात में एक सहज भरोसा होता है जो दूसरों को जोड़ता है।',
      leadEn: 'Jupiter is in your third house in a friendly sign — courage and communication — where it lends easy support. Your words carry a natural confidence that draws people in.',
      tendHi: 'भाई-बहनों और साथियों के साथ अपनी सलाह सुनाने से पहले उनकी भी सुनें।',
      tendEn: 'With siblings and peers, listen before you offer the counsel.',
    },
    neutral: {
      leadHi: 'गुरु आपके तीसरे भाव में है, और पहल करने का साहस समय के साथ, अनुभव से मज़बूत होता है। शुरुआत में झिझक लग सकती है, पर दिशा धीरे-धीरे स्पष्ट होती जाती है।',
      leadEn: 'Jupiter is in your third house, and the courage to take initiative strengthens with experience over time. Hesitation may show up early, but direction becomes clearer gradually.',
      tendHi: 'छोटे प्रयासों को भी अपनी बड़ी सीख का हिस्सा मानें।',
      tendEn: 'Count even the small attempts as part of your larger learning.',
    },
    weak: {
      leadHi: 'निर्बल गुरु आपके तीसरे भाव में है, और साहस या भाई-बहनों से तालमेल में शुरुआत में कमी खल सकती है — उत्साह जल्दी बुझ जाना, या बात ज़्यादा, काम कम। यह गुरु सिखाता है कि असली भरोसा बोलने से नहीं, करके दिखाने से बनता है।',
      leadEn: 'A weakened Jupiter is in your third house, and courage or ties with siblings can feel thin at first — enthusiasm that fades quickly, or more talk than follow-through. This Jupiter teaches that real confidence is built by doing, not by saying.',
      tendHi: 'सलाह देने से पहले खुद करके दिखाने की आदत डालें।',
      tendEn: 'Before giving advice, build the habit of showing it in your own actions first.',
    },
  },
  // 4th — home, mother, property, peace of mind
  {
    strong: {
      leadHi: 'अपने बल में गुरु आपके चौथे भाव — घर, माँ और मन की शांति — में है, और यह एक उदार, भरा-पूरा घर देता है जहाँ श्रद्धा और सीख दोनों पलते हैं। माँ या घर के बड़ों से आपका रिश्ता गहरा और सम्मान से भरा रहता है।',
      leadEn: 'In its strength Jupiter is in your fourth house — home, mother and peace of mind — and it gives a generous, full household where faith and learning both flourish. Your bond with your mother or home’s elders runs deep, full of respect.',
      tendHi: 'घर की शांति को हल्के में न लें — उसे सींचते रहें।',
      tendEn: 'Don’t take the peace at home for granted — keep tending it.',
    },
    friendly: {
      leadHi: 'गुरु आपके चौथे भाव में एक मित्र राशि में है, तो घर एक ऐसी जगह बनता है जहाँ भरोसा और सहजता दोनों रहते हैं। मन की शांति यहाँ स्वाभाविक रूप से मिलती है।',
      leadEn: 'Jupiter is in your fourth house in a friendly sign, so home becomes a place where trust and ease both live. Peace of mind comes to you here without much effort.',
      tendHi: 'घर की शांति को बाहर की भाग-दौड़ में न खो दें।',
      tendEn: 'Don’t let the outside rush eat into the calm you have at home.',
    },
    neutral: {
      leadHi: 'गुरु आपके चौथे भाव में है, और मन की शांति तथा घर की जड़ें धीरे-धीरे, समय के साथ गहरी होती हैं। शुरुआत में घर थोड़ा बदलता-सा लग सकता है, पर स्थायित्व आता ज़रूर है।',
      leadEn: 'Jupiter is in your fourth house, and peace of mind and roots at home deepen gradually, with time. Home may feel a little unsettled early on, but stability does arrive.',
      tendHi: 'शांति के लिए बाहर न भटकें — उसकी जड़ें भीतर हैं।',
      tendEn: 'Don’t search outward for peace — its roots are within.',
    },
    weak: {
      leadHi: 'निर्बल गुरु आपके चौथे भाव में है, और घर या माँ से जुड़े विषयों में शुरुआत में एक दूरी या असंतोष महसूस हो सकता है — मन जल्दी शांत नहीं होता। यह गुरु अंततः एक ऐसी शांति सिखाता है जो परिस्थितियों पर नहीं, भीतर की श्रद्धा पर टिकी होती है।',
      leadEn: 'A weakened Jupiter is in your fourth house, and matters tied to home or mother can carry an early distance or discontent — the mind slow to settle. This Jupiter finally teaches a peace that rests not on circumstances but on inner faith.',
      tendHi: 'घर में असंतोष के क्षणों में भी कृतज्ञता का एक छोटा कोना रखें।',
      tendEn: 'Even in restless moments at home, keep a small corner of gratitude.',
    },
  },
  // 5th — studies, intelligence, creativity, children
  {
    strong: {
      leadHi: 'अपने बल में गुरु आपके पाँचवें भाव — बुद्धि, सृजन और संतान — में है, और यह उसके सबसे प्रिय स्थानों में से एक है। समझ गहरी और उदार होती है, और सिखाने व सीखने दोनों में आपको सच्चा आनंद मिलता है।',
      leadEn: 'In its strength Jupiter is in your fifth house — intellect, creativity and children — one of its most favoured seats. Understanding runs deep and generous, and you find real joy in both teaching and learning.',
      tendHi: 'अपनी समझ को औरों पर थोपने के बजाय साझा करें।',
      tendEn: 'Share your understanding rather than impose it on others.',
    },
    friendly: {
      leadHi: 'गुरु आपके पाँचवें भाव में एक मित्र राशि में है, तो बुद्धि और सृजन के विषय सहजता से खिलते हैं। आपकी सीख में एक स्वाभाविक गहराई होती है।',
      leadEn: 'Jupiter is in your fifth house in a friendly sign, so intellect and creativity bloom with ease. Your learning carries a natural depth.',
      tendHi: 'जो सहज आता है, उसे भी अभ्यास से सँवारें।',
      tendEn: 'Even what comes easily deserves the polish of practice.',
    },
    neutral: {
      leadHi: 'गुरु आपके पाँचवें भाव में है, और सीखना, सृजन या संतान से जुड़े विषय समय के साथ गहराते हैं। समझ तुरंत नहीं, अनुभव से बनती है — और वही टिकाऊ होती है।',
      leadEn: 'Jupiter is in your fifth house, and learning, creativity or the life area of children deepen over time. Understanding is not instant — it forms through experience, and that is the kind that lasts.',
      tendHi: 'अपनी पढ़ाई या सृजन की गति दूसरों से न नापें।',
      tendEn: 'Don’t measure your pace of study or creating against others.',
    },
    weak: {
      leadHi: 'निर्बल गुरु आपके पाँचवें भाव में है, और बुद्धि या सृजन के विषयों में शुरुआत में बिखराव या अधूरापन खल सकता है — बहुत ज़्यादा भरोसा, या ध्यान का टिकना मुश्किल। यह गुरु सिखाता है कि गहरी समझ श्रम से आती है, आसानी से नहीं।',
      leadEn: 'A weakened Jupiter is in your fifth house, and intellect or creativity can feel scattered or unfinished at first — too much self-belief, or focus that won’t hold. This Jupiter teaches that real understanding comes through labour, not ease.',
      tendHi: 'आधी समझी बात को पूरी मानने से पहले उसे फिर से जाँचें।',
      tendEn: 'Before treating a half-grasped idea as complete, check it again.',
    },
  },
  // 6th — work, routine, competition, service, debts (upachaya)
  {
    strong: {
      leadHi: 'अपने बल में गुरु आपके छठे भाव — रोज़ का काम, प्रतियोगिता और कर्ज़ — में है, और यह निष्पक्षता तथा उदार बुद्धि से कठिन स्थितियों को सुलझाता है। आप विवादों में सही और भला दोनों रास्ता ढूँढ़ लेते हैं।',
      leadEn: 'In its strength Jupiter is in your sixth house — daily work, competition and debts — and it settles hard situations through fairness and generous good sense. You find the path that is both right and kind, even in disputes.',
      tendHi: 'निष्पक्षता के साथ अपनी सीमाएँ भी स्पष्ट रखें।',
      tendEn: 'Alongside the fairness, keep your own boundaries clear too.',
    },
    friendly: {
      leadHi: 'गुरु आपके छठे भाव में एक मित्र राशि में है — सेवा और प्रतिस्पर्धा का भाव — जहाँ यह सहज बल पाता है। आपकी सलाह कठिन समय में भी काम आती है।',
      leadEn: 'Jupiter is in your sixth house in a friendly sign — service and competition — where it gains strength easily. Your counsel proves useful even in hard stretches.',
      tendHi: 'दूसरों की मदद करते हुए अपने काम का बोझ भी बाँट लें।',
      tendEn: 'While helping others, share out your own workload too.',
    },
    neutral: {
      leadHi: 'गुरु आपके छठे भाव में है, और यह उन भावों में से है जो समय के साथ गुरु के पक्ष में मुड़ते हैं। रोज़ के काम और कर्ज़ शुरुआत में भारी लग सकते हैं, पर उदारता और धैर्य इन्हें धीरे सुलझा देते हैं।',
      leadEn: 'Jupiter is in your sixth house, one of the seats that turns in Jupiter’s favour over time. Daily work and debts can feel heavy at first, but generosity and patience ease them along.',
      tendHi: 'उधार देने या लेने में, शर्तें साफ़-साफ़ कह दें।',
      tendEn: 'Whether lending or borrowing, state the terms plainly.',
    },
    weak: {
      leadHi: 'निर्बल गुरु आपके छठे भाव में है, और कर्ज़ या प्रतिद्वंद्विता में शुरुआत में अनावश्यक उदारता महँगी पड़ सकती है — भरोसा जल्दी कर देना, सीमा न बाँधना। यह गुरु अंततः एक सजग, सोच-समझकर दी गई उदारता सिखाता है।',
      leadEn: 'A weakened Jupiter is in your sixth house, and unguarded generosity around debts or rivalry can cost you early on — trusting too soon, not setting a limit. This Jupiter finally teaches a watchful, considered generosity.',
      tendHi: 'मदद करने से पहले एक बार रुककर सोच लें।',
      tendEn: 'Before offering help, pause and think it through once.',
    },
  },
  // 7th — marriage, partner, partnerships
  {
    strong: {
      leadHi: 'अपने बल में गुरु आपके सातवें भाव — साझेदारी और विवाह — में है, और यह रिश्तों में निष्ठा, उदारता और साझी समझ लाता है। आप साथी में सम्मान और विकास दोनों खोजते हैं।',
      leadEn: 'In its strength Jupiter is in your seventh house — partnership and marriage — and it brings loyalty, generosity and shared understanding to relationships. You look for both respect and growth in a partner.',
      tendHi: 'उदारता के साथ अपनी भी ज़रूरतों को कहना न भूलें।',
      tendEn: 'Alongside the generosity, don’t forget to voice your own needs too.',
    },
    friendly: {
      leadHi: 'गुरु आपके सातवें भाव में एक मित्र राशि में है, तो साझेदारियाँ भरोसे और साझी समझ पर टिकती हैं। आप रिश्ते में एक सहज उदारता लाते हैं।',
      leadEn: 'Jupiter is in your seventh house in a friendly sign, so partnerships rest on trust and shared understanding. You bring an easy generosity into the bond.',
      tendHi: 'देने और लेने का संतुलन दोनों ओर से रखें।',
      tendEn: 'Keep the give-and-take balanced from both sides.',
    },
    neutral: {
      leadHi: 'गुरु आपके सातवें भाव में है, और साझेदारी में समझ धीरे-धीरे, अनुभव से गहरी होती है। शुरुआती उम्मीदें ऊँची हो सकती हैं, पर समय के साथ एक व्यावहारिक, टिकाऊ समझ बनती है।',
      leadEn: 'Jupiter is in your seventh house, and understanding in partnership deepens gradually, through experience. Early expectations can run high, but a practical, lasting understanding builds over time.',
      tendHi: 'साथी से उतनी ही ईमानदारी रखें जितनी आप उनसे चाहते हैं।',
      tendEn: 'Keep the same honesty with your partner that you hope for in return.',
    },
    weak: {
      leadHi: 'निर्बल गुरु आपके सातवें भाव में है, और साझेदारी में शुरुआत में बहुत आदर्शवादी उम्मीदें या भरोसे की परीक्षा महसूस हो सकती है। यह गुरु सिखाता है कि असली साझेदारी आदर्श से नहीं, निभाव और यथार्थ समझ से बनती है।',
      leadEn: 'A weakened Jupiter is in your seventh house, and partnership can carry overly idealistic expectations or a test of trust early on. This Jupiter teaches that real partnership is built not on ideals but on follow-through and realistic understanding.',
      tendHi: 'साथी को जैसा आप चाहते हैं वैसा नहीं, जैसा वे हैं वैसा देखने की कोशिश करें।',
      tendEn: 'Try to see your partner as they are, not as you wish them to be.',
    },
  },
  // 8th — hidden matters, transformation, shared resources, in-laws
  {
    strong: {
      leadHi: 'अपने बल में गुरु आपके आठवें भाव — गहरे बदलाव और छिपे विषय — में है, और यह अनिश्चितता के बीच भी एक स्थिर श्रद्धा देता है। आप कठिन मोड़ों में भी अर्थ और सीख ढूँढ़ लेते हैं।',
      leadEn: 'In its strength Jupiter is in your eighth house — deep change and hidden matters — and it gives a steady faith even amid uncertainty. You find meaning and a lesson even in the hard turns.',
      tendHi: 'गहरी सोच के साथ फैसले को ज़्यादा देर न टालें।',
      tendEn: 'Alongside the deep reflection, don’t put off the decision too long.',
    },
    friendly: {
      leadHi: 'गुरु आपके आठवें भाव में एक मित्र राशि में है, तो साझे संसाधन और छिपे विषय श्रद्धा और समझ से सँभलते हैं। आप अनिश्चितता में भी भरोसा बनाए रखते हैं।',
      leadEn: 'Jupiter is in your eighth house in a friendly sign, so shared resources and hidden matters are handled with faith and good sense. You hold on to trust even within uncertainty.',
      tendHi: 'छिपे विषयों में भी पारदर्शिता बनाए रखें।',
      tendEn: 'Keep things transparent even in the matters held close.',
    },
    neutral: {
      leadHi: 'गुरु आपके आठवें भाव में है, और अचानक बदलाव या साझे संसाधनों से जुड़े विषय समय माँगते हैं। श्रद्धा तुरंत नहीं, अनुभव से गहरी बनती है।',
      leadEn: 'Jupiter is in your eighth house, and sudden change or matters of shared resources take time to settle. Faith here deepens through experience, not all at once.',
      tendHi: 'अनिश्चय के दौर में भी अपनी साधना या विश्वास को न छोड़ें।',
      tendEn: 'Don’t let go of your practice or faith during the uncertain stretches.',
    },
    weak: {
      leadHi: 'निर्बल गुरु आपके आठवें भाव में है, और अचानक मोड़ों या साझे संसाधनों पर शुरुआत में श्रद्धा डगमगा सकती है। यह गुरु एक कठिन राह से सिखाता है — जो इससे गुज़रते हैं, उनकी समझ ओढ़ी हुई नहीं, कमाई हुई होती है।',
      leadEn: 'A weakened Jupiter is in your eighth house, and faith can waver early on around sudden turns or shared resources. This Jupiter teaches through a hard road — the understanding that comes out of it is earned, not borrowed.',
      tendHi: 'अनिश्चय के समय धैर्य रखें — जल्दबाज़ी समझ को और उलझा देती है।',
      tendEn: 'Stay patient through uncertainty — haste only tangles the understanding further.',
    },
  },
  // 9th — fortune, father, dharma, teachers, long journeys (Jupiter's own natural house)
  {
    strong: {
      leadHi: 'अपने बल में गुरु आपके नवें भाव — भाग्य, धर्म और गुरुजन — के शिखर पर है, जो गुरु का अपना सबसे प्रिय घर है। श्रद्धा, ज्ञान और मार्गदर्शन यहाँ उदारता से बहते हैं, और आप स्वयं एक गुरु-तुल्य भूमिका में आते हैं।',
      leadEn: 'In its strength Jupiter sits at the peak of your ninth house — fortune, dharma and teachers — Jupiter’s own most favoured seat. Faith, wisdom and guidance flow generously here, and you naturally step into a teacher-like role yourself.',
      tendHi: 'अपने ज्ञान को नम्रता से बाँटें — यही इसे और गहरा करता है।',
      tendEn: 'Share your wisdom with humility — that is what deepens it further.',
    },
    friendly: {
      leadHi: 'गुरु आपके नवें भाव में एक मित्र राशि में है — भाग्य और धर्म का भाव — जहाँ यह सहज बल पाता है। आपकी श्रद्धा निभाव और समझ दोनों से बनी होती है।',
      leadEn: 'Jupiter is in your ninth house in a friendly sign — fortune and dharma — where it gains strength easily. Your faith is built of both practice and understanding.',
      tendHi: 'परम्परा का आदर करते हुए अपने प्रश्नों को भी जगह दें।',
      tendEn: 'Honour tradition, but give your own questions room too.',
    },
    neutral: {
      leadHi: 'गुरु आपके नवें भाव में है, और यह गुरु का अपना स्वाभाविक घर है — यहाँ यह कमज़ोर हो तब भी सहारा पाता है। भाग्य और श्रद्धा धीरे-धीरे, अनुभव से गहरे होते हैं।',
      leadEn: 'Jupiter is in your ninth house — its own natural home — a seat that carries it well even when otherwise unsupported. Fortune and faith deepen gradually, through experience.',
      tendHi: 'भाग्य की प्रतीक्षा में कर्म न रोकें।',
      tendEn: 'Don’t pause your effort while waiting on fortune.',
    },
    weak: {
      leadHi: 'निर्बल होते हुए भी गुरु आपके नवें भाव में है — और यह एक राहत की बात है, क्योंकि यह गुरु का अपना घर है, जो इसे समय के साथ सँभाल लेता है। शुरुआत में श्रद्धा या पिता से सम्बन्ध में दूरी खल सकती है, पर समझ अंततः गहरी बनती है।',
      leadEn: 'Even weakened, Jupiter is in your ninth house — and that is a mercy, for this is Jupiter’s own home, which carries it well over time. Faith or the bond with your father may feel distant at first, but understanding finally runs deep.',
      tendHi: 'उत्तर न मिलने के दौर में भी अपनी साधना जारी रखें।',
      tendEn: 'Even in seasons without answers, keep your practice going.',
    },
  },
  // 10th — career, reputation, standing
  {
    strong: {
      leadHi: 'अपने बल में गुरु आपके दसवें भाव — करियर और मान-सम्मान — में है, और यह एक ऐसी प्रतिष्ठा देता है जो ज्ञान और नैतिकता पर टिकी होती है। लोग आपको सलाहकार और मार्गदर्शक दोनों मानते हैं।',
      leadEn: 'In its strength Jupiter is in your tenth house — career and reputation — and it gives a standing built on knowledge and principle. People see you as both counsellor and guide.',
      tendHi: 'सलाह देने के साथ दूसरों को अपनी राह खुद चुनने भी दें।',
      tendEn: 'Alongside the counsel, let others choose their own path too.',
    },
    friendly: {
      leadHi: 'गुरु आपके दसवें भाव में एक मित्र राशि में है — कर्म और प्रतिष्ठा का भाव — जहाँ यह सहज बल पाता है। आपका नाम समझ और भलाई दोनों से जुड़ता है।',
      leadEn: 'Jupiter is in your tenth house in a friendly sign — work and reputation — where it gains strength easily. Your name becomes linked with both wisdom and good conduct.',
      tendHi: 'अपनी उन्नति के साथ दूसरों को भी आगे बढ़ाते रहें।',
      tendEn: 'As you rise, keep lifting others along with you.',
    },
    neutral: {
      leadHi: 'गुरु आपके दसवें भाव में है, और करियर में प्रतिष्ठा धीरे-धीरे, अनुभव और समझ से बनती है। शुरुआत में दिशा स्पष्ट न लगे, पर एक सार्थक राह अंततः उभरती है।',
      leadEn: 'Jupiter is in your tenth house, and standing in career builds gradually, through experience and good sense. Direction may feel unclear at first, but a meaningful path does emerge.',
      tendHi: 'करियर के फैसलों में अपने मूल्यों को भी तौलें, न कि सिर्फ़ लाभ को।',
      tendEn: 'Weigh your values in career choices, not just the gain.',
    },
    weak: {
      leadHi: 'निर्बल गुरु आपके दसवें भाव में है, और करियर में शुरुआत में दिशा का अभाव या अति-आशावाद खटक सकता है। यह गुरु सिखाता है कि असली प्रतिष्ठा दिखावे से नहीं, निभाई गई ज़िम्मेदारी से बनती है।',
      leadEn: 'A weakened Jupiter is in your tenth house, and career can feel short on direction or weighed down by over-optimism at first. This Jupiter teaches that real standing is built not on display but on responsibility kept.',
      tendHi: 'बड़े वादों से पहले छोटे, निभाए जा सकने वाले वादे चुनें।',
      tendEn: 'Before big promises, choose the smaller ones you can actually keep.',
    },
  },
  // 11th — income, gains, friends, elder siblings, wishes (upachaya)
  {
    strong: {
      leadHi: 'अपने बल में गुरु आपके ग्यारहवें भाव — आय, लाभ और मित्र — में है, और यह उसके फलदायी स्थानों में से एक है। लाभ उदारता से आता है, और आपके मित्र व बड़े भाई-बहन समझदार, भरोसेमंद लोग होते हैं।',
      leadEn: 'In its strength Jupiter is in your eleventh house — income, gains and friends — one of its fruitful seats. Gains arrive generously, and your friends and elder siblings tend to be wise, dependable people.',
      tendHi: 'लाभ के साथ साझा करने की आदत भी बनाए रखें।',
      tendEn: 'Alongside the gains, keep up the habit of sharing too.',
    },
    friendly: {
      leadHi: 'गुरु आपके ग्यारहवें भाव में एक मित्र राशि में है, तो आय और मित्रता दोनों सहजता से बढ़ते हैं। आपकी इच्छाएँ अक्सर उदारता के साथ पूरी होती हैं।',
      leadEn: 'Jupiter is in your eleventh house in a friendly sign, so both income and friendships grow with ease. Your wishes often come true alongside a sense of generosity.',
      tendHi: 'लाभ को सिर्फ़ अपने लिए न रखें।',
      tendEn: 'Don’t keep the gains only for yourself.',
    },
    neutral: {
      leadHi: 'गुरु आपके ग्यारहवें भाव में है, और यह गुरु के अनुकूल भावों में से है — लाभ और इच्छाएँ समय लेकर, पर ठोस रूप से पूरी होती हैं। मित्रता भी धीरे-धीरे गहरी बनती है।',
      leadEn: 'Jupiter is in your eleventh house, one of the seats that suits it — gains and wishes take their time but arrive solidly. Friendships, too, deepen gradually.',
      tendHi: 'जल्दी लाभ की उम्मीद में धैर्य न खोएँ।',
      tendEn: 'Don’t lose patience chasing a quick gain.',
    },
    weak: {
      leadHi: 'निर्बल होते हुए भी गुरु आपके ग्यारहवें भाव में है — एक अनुकूल भाव। आय अनियमित लग सकती है और मित्रता में शुरुआत में निराशा हो सकती है, पर दीर्घकाल में यहाँ धैर्यवान को ही फल मिलता है।',
      leadEn: 'Even weakened, Jupiter is in your eleventh house — a favourable seat. Income may feel uneven and friendships can disappoint early on, but over the long run it is the patient one who is rewarded here.',
      tendHi: 'मित्रता और लाभ दोनों में जल्दबाज़ी से भरोसा न करें।',
      tendEn: 'Don’t rush to trust, whether in friendship or in gain.',
    },
  },
  // 12th — expenses, rest, foreign lands, solitude, moksha
  {
    strong: {
      leadHi: 'अपने बल में गुरु आपके बारहवें भाव — एकांत, दूर देश और मुक्ति — में है, और यह एक उदार, श्रद्धा से भरा आध्यात्मिक झुकाव देता है। दूर की यात्राएँ या विदेश अक्सर सीख और विस्तार लाते हैं।',
      leadEn: 'In its strength Jupiter is in your twelfth house — solitude, foreign lands and release — and it gives a generous, faith-filled spiritual leaning. Travel or time abroad often brings learning and growth.',
      tendHi: 'उदारता के साथ अपने खर्च पर भी एक नज़र रखें।',
      tendEn: 'Alongside the generosity, keep an eye on your own spending too.',
    },
    friendly: {
      leadHi: 'गुरु आपके बारहवें भाव में एक मित्र राशि में है, तो एकांत और भीतर की खोज सहज लगती है। आध्यात्मिक समझ धीरे-धीरे पर पक्के ढंग से गहराती है।',
      leadEn: 'Jupiter is in your twelfth house in a friendly sign, so solitude and the inner search come naturally. Spiritual understanding deepens slowly but surely.',
      tendHi: 'भीतर की खोज के बीच व्यावहारिक ज़िम्मेदारियों को न भूलें।',
      tendEn: 'Amid the inner search, don’t forget the practical responsibilities.',
    },
    neutral: {
      leadHi: 'गुरु आपके बारहवें भाव में है, और खर्च, विश्राम या एकांत के विषय समय के साथ एक गहरी समझ में बदलते हैं। शुरुआत में दिशा धुँधली लग सकती है, पर भीतर की खोज अंततः फल देती है।',
      leadEn: 'Jupiter is in your twelfth house, and expenses, rest or solitude turn into a deeper understanding over time. Direction may feel hazy at first, but the inner search bears fruit eventually.',
      tendHi: 'खर्च और विश्राम दोनों पर एक सजग नज़र रखें।',
      tendEn: 'Keep a watchful eye on both spending and rest.',
    },
    weak: {
      leadHi: 'निर्बल गुरु आपके बारहवें भाव में है, और खर्च या एकांत में शुरुआत में अति या बिखराव खल सकता है — बहुत उदार हाथ, या दिशाहीन एकांत। यह गुरु अंततः एक सच्ची, भीतर से कमाई हुई श्रद्धा देता है।',
      leadEn: 'A weakened Jupiter is in your twelfth house, and expenses or solitude can feel excessive or unmoored at first — too open a hand, or solitude without direction. This Jupiter finally gives a real, inwardly earned faith.',
      tendHi: 'एकांत को दिशा दें — बिना उद्देश्य का खालीपन बोझ बन जाता है।',
      tendEn: 'Give your solitude a direction — emptiness without purpose becomes a weight.',
    },
  },
];

export const JUPITER_MODIFIERS: GrahaModifiers = {
  lordship: {
    hi: (houses: string) =>
      `और चूँकि यही गुरु आपके ${houses} का भी स्वामी है, इसकी बुद्धि और उदारता चुपचाप उन पक्षों को भी सँवारती है।`,
    en: (houses: string) =>
      `And because this same Jupiter also rules your ${houses}, the wisdom and generosity it offers quietly nourish those corners of life too.`,
  },
  combust: {
    hi: 'सूर्य के निकट होने से इसकी आवाज़ कुछ दबी रहती है — इसकी सलाह भीतर की ओर मुड़ जाती है, बाहर कम दिखती है।',
    en: 'Sitting close to the Sun, its voice is a little drowned out — its counsel grows quieter and more inward, less visible on the outside.',
  },
  retrograde: {
    hi: 'और वक्री होने से यह बार-बार आपको यह जाँचने के लिए लौटाता है कि आप सच में क्या मानते हैं, उसे बाहर सिखाने से पहले।',
    en: 'And turning retrograde, it keeps pulling you back to re-examine what you truly believe, before you teach it outward.',
  },
};
