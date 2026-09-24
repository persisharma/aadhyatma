import type { TempleDetail } from '../temples';

/**
 * Extended §12.6 readings — Maha Shakti Peethas D.
 *
 * One chunk file per enrichment session (RULEBOOK §12.6, "one temple at a
 * time"): each file is owned by exactly one authoring pass so parallel waves
 * never collide in the same module. Entries here REPLACE the legacy two-line
 * detail carried inline in `temples.ts` — supply the whole `TempleDetail`
 * (expanded significance + origin story, `sources` ≥ 2, and the five fixed
 * sections in order: sthapana, svarup, parampara, mela, yatra).
 *
 * Temples still to author in this chunk: tripura-sundari
 */
export const details: Record<string, TempleDetail> = {
  danteshwari: {
    significanceHi:
      'शंखिनी और डंकिनी नदियों के संगम पर खड़ी दंतेवाड़ा की दंतेश्वरी 52 शक्ति पीठों में गिनी जाती हैं और बस्तर की कुलदेवी हैं। सन् 1324 (विक्रम संवत् 1381) के आसपास वारंगल से आए काकतीय राजकुमार अन्नमदेव अपनी कुलदेवी को साथ लाए और यहाँ प्रतिष्ठित किया; उन्हीं के वंशजों ने बस्तर राज्य चलाया और देवी राज्य की अधिष्ठात्री बनीं। विश्व के सबसे लम्बे उत्सवों में गिना जाने वाला पचहत्तर दिन का बस्तर दशहरा इन्हीं देवी को समर्पित है।',
    significanceEn:
      'Danteshwari of Dantewada, at the confluence of the Shankhini and Dankini rivers, is counted among the 52 Shakti Peethas and is the kuldevi of Bastar. Around 1324 CE (Vikram Samvat 1381) the Kakatiya prince Annamadeva came from Warangal bringing his family goddess with him and enshrined her here; his descendants ruled the Bastar kingdom and the goddess became its presiding deity. Bastar Dussehra, a seventy-five-day observance counted among the longest festivals in the world, is kept in her name.',
    originStoryHi:
      'परम्परा के अनुसार दक्ष-यज्ञ के बाद सती का दाँत इस स्थान पर गिरा, इसलिए देवी दंतेश्वरी कहलाईं और बस्तर का यह नगर दंतेवाड़ा। दूसरी कथा राज-परम्परा की है: काकतीय राजकुमार अन्नमदेव दण्डकारण्य की ओर बढ़ रहे थे और देवी उनके पीछे-पीछे चलीं, इस वचन के साथ कि जहाँ वे मुड़कर देखेंगे वहीं रुक जाएँगी। शंखिनी-डंकिनी के संगम पर उन्होंने पीछे देखा, देवी वहीं ठहर गईं, और उसी भूमि पर मंदिर बना।',
    originStoryEn:
      'By tradition the tooth — danta — of Sati fell at this place after Daksha’s sacrifice, which gave the goddess her name Danteshwari and the Bastar town its name Dantewada. A second story belongs to the royal line: as the Kakatiya prince Annamadeva pressed into the Dandakaranya forest the goddess walked behind him, on the promise that she would halt wherever he turned to look. At the confluence of the Shankhini and Dankini he looked back, she stayed where she stood, and the temple was raised on that ground.',
    sources: [
      { label: 'Incredible India - Danteshwari Temple', url: 'https://www.incredibleindia.gov.in/en/chhattisgarh/jagdalpur/danteshwari-temple' },
      { label: 'District Dantewada, Government of Chhattisgarh - Tourist Places', url: 'https://dantewada.nic.in/en/tourist-place/dantewada/' },
      { label: 'Utsav, Ministry of Tourism - Phagun Madai', url: 'https://utsav.gov.in/view-event/phagun-madai' },
      { label: 'Danteshwari Temple - Reference', url: 'https://en.wikipedia.org/wiki/Danteshwari_Temple' },
    ],
    sections: [
      {
        id: 'sthapana',
        titleHi: 'मंदिर स्थापना कथा',
        titleEn: 'Sthapana Katha',
        bodyHi:
          'वारंगल के काकतीय वंश का अंत होने पर अंतिम राजा प्रतापरुद्र द्वितीय के भाई अन्नमदेव ने सिंहासन भतीजे को सौंपकर दक्षिण-पूर्व के घने दण्डकारण्य वन की ओर प्रस्थान किया; वे अपनी कुलदेवी को साथ ले गए। यह यात्रा सामान्यतः सन् 1324 (विक्रम संवत् 1381) के आसपास मानी जाती है, यद्यपि विवरण तिथि में थोड़ा अंतर रखते हैं। परम्परा कहती है कि देवी उनके पीछे चलती रहीं और शंखिनी-डंकिनी के संगम पर, जहाँ राजकुमार ने मुड़कर देखा, वहीं ठहर गईं — उसी भूमि पर मंदिर बना और स्थान दंतेवाड़ा कहलाया। शक्ति-पीठ परम्परा इसी स्थान को सती के दाँत के गिरने से जोड़ती है, इसलिए दोनों कथाएँ यहाँ एक हो जाती हैं। अन्नमदेव ने आगे चलकर बस्तर राज्य की स्थापना की, जिस पर उनके वंशज सन् 1947 तक शासन करते रहे, और दंतेश्वरी राजपरिवार तथा समूचे बस्तर की कुलदेवी बनी रहीं। वर्तमान मंदिर चौदहवीं शताब्दी का माना जाता है और बाद की शताब्दियों में उसका विस्तार होता रहा; प्रतिष्ठा की तिथि, वार और प्रतिष्ठा कराने वाले आचार्य का नाम उपलब्ध अभिलेखों में दर्ज नहीं है। मंदिर की सेवा आज छत्तीसगढ़ शासन के अधीन माँ दंतेश्वरी मंदिर समिति तथा परम्परागत पुजारी-परिवार करते हैं।',
        bodyEn:
          'When the Kakatiya line at Warangal fell, Annamadeva, brother of the last king Prataprudra II, left the throne to his nephew and set out southeast into the deep Dandakaranya forest, carrying his family goddess with him. That journey is generally placed around 1324 CE (Vikram Samvat 1381), though accounts differ a little on the year. Tradition holds that the goddess walked behind him and halted at the meeting of the Shankhini and Dankini where the prince turned to look — the temple was built on that ground and the place became Dantewada. The Shakti Peeth tradition ties the same spot to the falling of Sati’s tooth, so the two stories meet here. Annamadeva went on to found the kingdom of Bastar, which his descendants ruled until 1947, and Danteshwari remained kuldevi both to the royal house and to Bastar at large. The present temple is held to be of the fourteenth century, enlarged over later centuries; no available record preserves the consecration tithi, the weekday, or the name of the acharya who performed it. The shrine is administered today by the Maa Danteshwari temple committee under the Chhattisgarh government, with hereditary priestly families in attendance.',
      },
      {
        id: 'svarup',
        titleHi: 'दंतेश्वरी का स्वरूप',
        titleEn: 'The Form of Danteshwari',
        bodyHi:
          'गर्भगृह में देवी की प्रतिमा काले पाषाण की है और उसे प्रतिदिन रंग-बिरंगे पुष्पों, आभूषणों तथा बस्तर की परम्परागत वेशभूषा से सजाया जाता है; भक्त देवी के मुख और नेत्रों के ही दर्शन करते हैं, शेष शृंगार में ढँका रहता है। मंदिर परकोटे से घिरा है और भीतर सज्जित आँगन के आगे तीन तलों में उठता गर्भगृह है; भवन गर्भगृह, महामंडप, मुख्य मंडप और सभा मंडप — इन चार भागों में बँटा है। मुख्य प्रवेश पर खड़ा गरुड़ स्तम्भ मंदिर की सबसे विशिष्ट पहचान है, और उसी के आगे शंखिनी तथा डंकिनी का संगम है, जहाँ यात्री दर्शन से पहले स्नान करते हैं। परिसर की पत्थर-गढ़न और मूर्तियाँ बस्तर की देवगुड़ी-परम्परा और मैदानी मंदिर-शैली दोनों का मेल दिखाती हैं।',
        bodyEn:
          'The image in the sanctum is carved of black stone and is dressed each day in flowers of many colours, in ornaments and in the traditional attire of Bastar; what devotees see is the face and the eyes, the rest covered by the shringar. The temple stands within a walled precinct, an ornamented courtyard opening onto a sanctum that rises in three tiers, and the building divides into four parts — garbha griha, maha mandap, mukhya mandap and sabha mandap. The Garuda pillar at the main entrance is its most distinctive feature, and just beyond it lies the confluence of the Shankhini and Dankini, where pilgrims bathe before darshan. The stonework and images around the precinct show the meeting of Bastar’s own devgudi tradition with the temple idiom of the plains.',
      },
      {
        id: 'parampara',
        titleHi: 'ज्योति कलश और छत्र-डोली परम्परा',
        titleEn: 'Jyoti Kalash and the Chhatra-Doli Tradition',
        bodyHi:
          'दंतेवाड़ा की सबसे पहचानी परम्परा ज्योति कलश है — नवरात्र आरम्भ होने पर भक्त अपनी मनोकामना के साथ मंदिर परिसर में मिट्टी के कलश में दीप प्रज्वलित कराते हैं, जो नौ दिन अखंड जलते हैं; कलश की संख्या हज़ारों में पहुँचती है और उन्हें एक साथ जलते देखना यहाँ का सबसे स्मरणीय दृश्य है। दूसरी परम्परा छत्र और डोली की है: देवी मंदिर में स्थिर नहीं रहतीं, उनका छत्र डोली में बिठाकर आसपास के गाँवों और उत्सवों तक ले जाया जाता है, और बस्तर की सैकड़ों ग्राम-देवियाँ इसी छत्र के साथ जुड़ती हैं — यही बस्तर की “देवी-मिलन” परम्परा का आधार है। अर्पण में नारियल, चुनरी, सिन्दूर और स्थानीय पुष्प चढ़ते हैं। दर्शन प्रातः की आरती से आरम्भ होकर मध्याह्न के विश्राम के बाद संध्या आरती तक चलते हैं, और मंगलवार, शुक्रवार तथा नवरात्र के दिन सबसे व्यस्त रहते हैं।',
        bodyEn:
          'Dantewada’s most recognisable custom is the jyoti kalash — at the start of Navratri devotees have an earthen lamp-pot lit in the precinct with a wish attached to it, and it burns unbroken through the nine nights; the pots run into thousands, and the sight of them alight together is the image visitors carry away. The second custom is that of the chhatra and the doli: the goddess does not stay fixed in her sanctum but travels as her umbrella, carried in a palanquin to surrounding villages and gatherings, and hundreds of Bastar’s village goddesses attach themselves to that umbrella — this is the ground of the region’s tradition of deities meeting one another. Offerings are coconut, a chunari, sindoor and local flowers. Darshan opens with the morning aarti, pauses at midday and runs to the evening aarti, with Tuesdays, Fridays and the Navratri days busiest.',
      },
      {
        id: 'mela',
        titleHi: 'मेले और उत्सव',
        titleEn: 'Melas and Festivals',
        bodyHi:
          'दंतेवाड़ा का अपना बड़ा उत्सव फागुन मड़ई है: इसका औपचारिक आरम्भ माघ शुक्ल पंचमी यानी बसंत पंचमी को मंदिर के आँगन में त्रिशूल-स्तम्भ गाड़कर और देवी के छत्र पर आम्र-मंजरी अर्पित कर होता है, और फिर फाल्गुन मास के अंतिम दस दिनों में समूचे बस्तर से आए समुदाय यहाँ लोकनृत्य, मड़ई और देवी-अनुष्ठान के साथ जुटते हैं। दूसरा बड़ा पर्व बस्तर दशहरा है, जो लगभग पचहत्तर दिन चलता है और जिसमें रावण-वध नहीं, देवी और बस्तर के ग्राम-देवताओं का सम्मिलन मनाया जाता है; इसकी शुरुआत पन्द्रहवीं शताब्दी में — विवरण सन् 1408 (विक्रम संवत् 1465) बताते हैं — काकतीय राजा पुरुषोत्तम देव से जोड़ी जाती है। दशहरे से पहले जगदलपुर से आया निमंत्रण दंतेवाड़ा पहुँचता है और देवी माँवली का डोला जगदलपुर ले जाया जाता है, जहाँ चार सौ से अधिक हाथों से खींचा जाने वाला विशाल रथ चलता है। चैत्र और शारदीय दोनों नवरात्रों में ज्योति कलश और विशेष पूजा होती है।',
        bodyEn:
          'Dantewada’s own great gathering is the Phagun Madai. It opens formally on Basant Panchami, the fifth tithi of the bright fortnight of Magh, when a trident pillar is set in the temple courtyard and mango blossom is offered on the goddess’s umbrella; then, through the last ten days of the month of Phalgun, communities from across Bastar gather here for folk dance, the madai fair and the goddess’s rites. The second is Bastar Dussehra, which runs some seventy-five days and marks not the killing of Ravana but the coming together of the goddess with Bastar’s village deities; its founding is credited to the Kakatiya ruler Purushottam Dev in the fifteenth century, with accounts giving 1408 CE (Vikram Samvat 1465). Before Dussehra an invitation travels from Jagdalpur to Dantewada and the doli of the goddess Mavli is carried there, where a great chariot is drawn by more than four hundred pairs of hands. Both Navratris, Chaitra and Sharad, bring the jyoti kalash and special puja.',
      },
      {
        id: 'yatra',
        titleHi: 'यात्रा और आसपास',
        titleEn: 'Journey and Around',
        bodyHi:
          'मंदिर छत्तीसगढ़ के दंतेवाड़ा ज़िले में शंखिनी और डंकिनी नदियों के संगम पर है और सड़क मार्ग से जुड़ा है। जगदलपुर लगभग 80–85 किमी दूर है और वहीं से बस तथा टैक्सी नियमित चलती हैं; रायपुर सड़क से लगभग 350 किमी है। दंतेवाड़ा का अपना रेलवे स्टेशन है पर गाड़ियाँ सीमित हैं, इसलिए अधिकांश यात्री जगदलपुर स्टेशन का उपयोग करते हैं, जो विशाखापत्तनम, राउरकेला और हावड़ा से जुड़ा है। निकटतम हवाई अड्डा जगदलपुर है, लगभग 85–90 किमी; बड़ी उड़ानों के लिए रायपुर और विशाखापत्तनम लगभग समान दूरी पर, सड़क से लगभग 400 किमी, पड़ते हैं। अधिकांश यात्री दंतेवाड़ा के साथ जगदलपुर की दंतेश्वरी और बस्तर राजमहल, तथा चित्रकोट व तीरथगढ़ जलप्रपात एक ही यात्रा में जोड़ते हैं। सभी दूरियाँ अनुमानित हैं।',
        bodyEn:
          'The temple lies in Dantewada district of Chhattisgarh at the confluence of the Shankhini and Dankini, and is reached by road. Jagdalpur is about 80–85 km away with regular buses and taxis; Raipur is roughly 350 km by road. Dantewada has its own railway station but few services, so most pilgrims use Jagdalpur station, which is connected to Visakhapatnam, Rourkela and Howrah. The nearest airport is Jagdalpur, about 85–90 km off; for wider connections Raipur and Visakhapatnam lie at a comparable distance, roughly 400 km by road. Most visitors pair Dantewada with the Danteshwari shrine and old palace at Jagdalpur, and with the Chitrakote and Tirathgarh falls, in a single journey. All distances are approximate.',
      },
    ],
  },
  vishalakshi: {
    significanceHi:
      'काशी की विशालाक्षी गंगा तट की प्रमुख शक्ति हैं और 51 शक्ति पीठों में गिनी जाती हैं; नाम का अर्थ है “विशाल नेत्रों वाली”। काञ्ची की कामाक्षी और मदुरै की मीनाक्षी के साथ मिलकर वे देवी के नेत्र-नामों की उस त्रयी में आती हैं जिसे उत्तर और दक्षिण दोनों परम्पराएँ मानती हैं। मीर घाट पर खड़ा वर्तमान मंदिर तमिलनाडु के नाट्टुकोट्टै नागरत्तार व्यापारी समुदाय ने सन् 1893 (विक्रम संवत् 1950) में बनवाया और सन् 1971 (विक्रम संवत् 2028) में उसका जीर्णोद्धार कराया।',
    significanceEn:
      'Vishalakshi of Kashi is a principal Shakti of the Ganga ghats and is counted among the 51 Shakti Peethas; her name means “she of the wide eyes”. With Kamakshi of Kanchi and Meenakshi of Madurai she completes the triad of eye-named goddesses honoured by northern and southern traditions alike. The temple that stands at Mir Ghat today was built by the Nattukottai Nagarathar merchant community of Tamil Nadu in 1893 CE (Vikram Samvat 1950) and renovated by them again in 1971 CE (Vikram Samvat 2028).',
    originStoryHi:
      'परम्परा के अनुसार दक्ष-यज्ञ के बाद सती के देह-अंग और आभूषण जहाँ-जहाँ गिरे वहाँ शक्ति पीठ बने; काशी में सती का कर्ण-आभूषण गिरा माना जाता है — कुछ विवरण इसे कुण्डल कहते हैं तो कुछ दाहिने कान की मणि। इसीलिए देवी यहाँ पार्वती के विशालाक्षी स्वरूप में पूजित हैं और स्थान को विशाल तीर्थ कहा गया। स्कन्द पुराण का काशी खण्ड विशालाक्षी को काशी की नव गौरियों में गिनता है, इसलिए यह पीठ नगर की गौरी-परम्परा का भी अंग है।',
    originStoryEn:
      'By tradition, Shakti Peethas arose wherever a limb or an ornament of Sati fell after Daksha’s sacrifice; at Kashi it is the ornament of her ear that is held to have fallen — some accounts call it an earring, others the jewel of her right ear. The goddess is therefore worshipped here in Parvati’s Vishalakshi form, and the spot is named Vishal Teerth. The Kashi Khand of the Skanda Purana counts Vishalakshi among the nine Gauris of Kashi, so the peeth belongs to the city’s own Gauri tradition as well.',
    sources: [
      { label: 'Incredible India - Vishalakshi Temple, Varanasi', url: 'https://www.incredibleindia.gov.in/en/uttar-pradesh/varanasi/vishalakshi-temple' },
      { label: 'Kashi Official Web Portal - Vishalakshi Devi Temple', url: 'https://kashi.gov.in/listing-details/vishalakshi-devi-temple' },
      { label: 'Kashi Official Web Portal - Nav Gauri Yatra', url: 'https://kashi.gov.in/varanasi-yatra/nav-gauri-yatra' },
      { label: 'Vishalakshi Temple - Reference', url: 'https://en.wikipedia.org/wiki/Vishalakshi_Temple' },
    ],
    sections: [
      {
        id: 'sthapana',
        titleHi: 'मंदिर स्थापना कथा',
        titleEn: 'Sthapana Katha',
        bodyHi:
          'विशालाक्षी की उपासना काशी में उतनी ही पुरानी है जितनी नगर की शक्ति-परम्परा — स्कन्द पुराण के काशी खण्ड में देवी को विशाल तीर्थ की अधिष्ठात्री और नगर की नव गौरियों में गिना गया है। परम्परा के अनुसार दक्ष-यज्ञ के बाद सती का कर्ण-आभूषण इसी स्थान पर गिरा, और तभी से यह पीठ बना। जो इमारत आज मीर घाट पर खड़ी है वह अपेक्षाकृत नई है: तमिलनाडु के चेट्टिनाड क्षेत्र का नाट्टुकोट्टै नागरत्तार व्यापारी समुदाय, जो काशी-यात्रा को अपनी कुल-परम्परा मानता है, उन्नीसवीं शताब्दी से इस मंदिर की सेवा करता आया है और उसी ने सन् 1893 (विक्रम संवत् 1950) में वर्तमान मंदिर बनवाया। सन् 1971 (विक्रम संवत् 2028) में उसी समुदाय के सहयोग से जीर्णोद्धार हुआ और उसी समय काले पाषाण की नई प्रतिमा उत्कीर्ण कर स्थापित की गई; प्रतिष्ठा की तिथि और वार किसी उपलब्ध अभिलेख में दर्ज नहीं हैं। मंदिर की सेवा-व्यवस्था आज भी उसी नागरत्तार न्यास के हाथ में है, इसलिए गंगा तट के इस पीठ में दक्षिण भारत की आगम-पद्धति और उत्तर की घाट-परम्परा साथ-साथ चलती हैं।',
        bodyEn:
          'Worship of Vishalakshi is as old in Kashi as the city’s Shakta tradition itself — the Kashi Khand of the Skanda Purana names her as the presiding goddess of Vishal Teerth and one of the city’s nine Gauris. By tradition the ear ornament of Sati fell at this spot after Daksha’s sacrifice, and the peeth dates from then. The building now standing at Mir Ghat is comparatively recent: the Nattukottai Nagarathar merchant community of the Chettinad country in Tamil Nadu, for whom the Kashi pilgrimage is a family tradition, has served this shrine since the nineteenth century and raised the present temple in 1893 CE (Vikram Samvat 1950). A renovation followed in 1971 CE (Vikram Samvat 2028) under the same community’s patronage, and a new black stone image was carved and installed at that time; no available record preserves the tithi or weekday of either consecration. The shrine’s administration remains with that Nagarathar trust, so on this Ganga-ghat peeth the agamic usage of the south runs alongside the ghat custom of the north.',
      },
      {
        id: 'svarup',
        titleHi: 'विशालाक्षी का स्वरूप',
        titleEn: 'The Form of Vishalakshi',
        bodyHi:
          'गर्भगृह में देवी की दो प्रतिमाएँ हैं। पीछे बाईं ओर काले पाषाण की छोटी और प्राचीन प्रतिमा है, जिसे आदि विशालाक्षी कहा जाता है; सामने काले पाषाण की बड़ी प्रतिमा है, जो बाद में स्थापित हुई और जिसे प्रतिदिन वस्त्र, स्वर्णाभूषण और पुष्प-मालाओं से सजाया जाता है। दोनों में देवी के विशाल, चौड़े नेत्र ही सबसे पहले दृष्टि खींचते हैं — यही नाम का आधार है। मंदिर बाहर से काशी की हवेली-शैली का उत्तर भारतीय भवन दिखता है, पर भीतर दक्षिण भारतीय मंदिर-विन्यास है और प्रवेश पर छोटा द्रविड़ शैली का गोपुर बना है — नागरत्तार निर्माण की पहचान। गंगा की ओर उतरता मीर घाट कुछ ही क़दम दूर है, इसलिए स्नान के बाद सीधे दर्शन की परम्परा बनी रही।',
        bodyEn:
          'The sanctum holds two images. Set back on the left is a small, older figure of black stone known as Adi Vishalakshi, the original; in front of it stands a larger black stone image installed later, dressed daily in cloth, gold ornament and flower garlands. In both, it is the goddess’s wide, far-set eyes that the gaze meets first — the feature her name records. From the lane the temple reads as a North Indian haveli of the Kashi kind, but its interior follows a South Indian plan and a modest Dravidian gopura marks the entrance, the signature of its Nagarathar builders. Mir Ghat drops to the Ganga only a few steps away, which is why the custom of bathing first and taking darshan straight after has held.',
      },
      {
        id: 'parampara',
        titleHi: 'नव गौरी यात्रा और नागरत्तार सेवा',
        titleEn: 'The Nav Gauri Yatra and the Nagarathar Service',
        bodyHi:
          'काशी की नव गौरी यात्रा — स्कन्द पुराण के काशी खण्ड में वर्णित नौ गौरी-स्थानों की परिक्रमा — वासन्तिक यानी चैत्र नवरात्र में की जाती है, और उसमें पाँचवें दिन विशालाक्षी गौरी के दर्शन का विधान है; अनेक यात्री इस क्रम को शुक्ल तृतीया पर भी दोहराते हैं। दूसरी जीवित परम्परा नागरत्तार समुदाय की है: चेट्टिनाड से आने वाले परिवार काशी-यात्रा में यहाँ अभिषेक और अर्चना कराते हैं, और मंदिर में तमिल पद्धति के अनुसार कुंकुम-अर्चना होती है, जिसका कुंकुम प्रसाद-रूप में दिया जाता है। देवी को लाल चुनरी, सिन्दूर, चूड़ियाँ और सोलह शृंगार की वस्तुएँ चढ़ाने का चलन है, विशेषकर सौभाग्य की कामना से। दर्शन प्रातः मंगला आरती से आरम्भ होकर मध्याह्न विश्राम के बाद संध्या आरती तक चलते हैं; शुक्रवार और नवरात्र के दिन सबसे व्यस्त रहते हैं।',
        bodyEn:
          'Kashi’s Nav Gauri Yatra — the round of nine Gauri shrines set out in the Kashi Khand of the Skanda Purana — is walked during Vasantik, that is Chaitra, Navratri, and its fifth day is given to the darshan of Vishalakshi Gauri; many pilgrims repeat the round on a Shukla Tritiya as well. The second living tradition is the Nagarathars’ own: families travelling up from Chettinad have abhishekam and archana performed here on their Kashi yatra, and the shrine keeps the Tamil usage of kumkum archana, whose kumkum is given back as prasad. Devotees offer the goddess a red chunari, sindoor, bangles and the sixteen articles of shringar, most often with a prayer for saubhagya. Darshan opens with the morning aarti, pauses at midday and runs to the evening aarti; Fridays and the Navratri days are busiest.',
      },
      {
        id: 'mela',
        titleHi: 'मेले और उत्सव',
        titleEn: 'Melas and Festivals',
        bodyHi:
          'मंदिर का वार्षिक उत्सव कजली तीज है, जो भाद्रपद कृष्ण तृतीया को मनाया जाता है; इस दिन मीर घाट की गली भक्तों से भर जाती है और स्त्रियाँ वर्षा-ऋतु के कजली गीत गाती हुई देवी के दर्शन करती हैं। चैत्र और आश्विन दोनों नवरात्रों में नौ दिन विशेष श्रृंगार और अर्चना होती है, और चैत्र नवरात्र की पंचमी को नव गौरी यात्रा का जत्था यहीं पहुँचता है। आश्विन की दुर्गा पूजा में भी काशी के शक्ति-उपासक इस पीठ के दर्शन को अनिवार्य मानते हैं। इनके अतिरिक्त वर्ष भर की हर शुक्ल तृतीया गौरी-तिथि मानी जाती है और उस दिन विशेष अर्चना होती है।',
        bodyEn:
          'The temple’s annual festival is Kajali Teej, kept on the third tithi of the dark fortnight of Bhadrapada; on that day the lane at Mir Ghat fills with pilgrims and women come for darshan singing the Kajali songs of the rains. Both Navratris, Chaitra and Ashwin, bring nine days of special shringar and archana, and the Nav Gauri party arrives here on the fifth day of Chaitra Navratri. During the Durga Puja of Ashwin, Kashi’s Shakta households likewise count a darshan at this peeth as owed. Beyond these, every Shukla Tritiya through the year is kept as a Gauri tithi with its own archana.',
      },
      {
        id: 'yatra',
        titleHi: 'यात्रा और आसपास',
        titleEn: 'Journey and Around',
        bodyHi:
          'मंदिर वाराणसी की घाट-गलियों में मीर घाट पर है और वहाँ पैदल ही पहुँचा जा सकता है — काशी विश्वनाथ मंदिर से लगभग 250 मीटर और अन्नपूर्णा मंदिर से लगभग 200 मीटर की दूरी पर; दशाश्वमेध घाट लगभग 600 मीटर दूर है। मणिकर्णिका घाट और मणिकर्णिका कुंड पास ही उत्तर की ओर हैं, इसलिए अधिकांश यात्री विश्वनाथ, अन्नपूर्णा और विशालाक्षी के दर्शन एक ही परिक्रमा में कर लेते हैं। निकटतम रेलवे स्टेशन वाराणसी जंक्शन लगभग 5 किमी और लाल बहादुर शास्त्री अंतर्राष्ट्रीय हवाई अड्डा लगभग 25 किमी दूर है; गलियों में वाहन नहीं जाते, इसलिए गोदौलिया तक आकर आगे पैदल चलना पड़ता है। सारनाथ लगभग 10 किमी दूर है और कई यात्री उसे भी इसी प्रवास में जोड़ते हैं। सभी दूरियाँ अनुमानित हैं।',
        bodyEn:
          'The temple stands at Mir Ghat in the lanes above the Varanasi waterfront and is reached on foot — roughly 250 m from the Kashi Vishwanath temple and about 200 m from the Annapurna temple, with Dashashwamedh Ghat some 600 m away. Manikarnika Ghat and its kund lie a short way north, so most pilgrims take Vishwanath, Annapurna and Vishalakshi in a single round. Varanasi Junction, the nearest railhead, is about 5 km off and Lal Bahadur Shastri International Airport about 25 km; vehicles cannot enter the lanes, so visitors come as far as Godowlia and walk. Sarnath is roughly 10 km away and is commonly added to the same visit. All distances are approximate.',
      },
    ],
  },
  'mangala-gauri': {
    significanceHi:
      'गया की मंगला गौरी अष्टादश महाशक्ति पीठों में गिनी जाती हैं और देवी को यहाँ पोषण देने वाली “सर्वमंगला” शक्ति के रूप में पूजा जाता है। पहाड़ी पर खड़ा वर्तमान मंदिर पंद्रहवीं शताब्दी का माना जाता है — एक विवरण इसे विक्रम संवत् 1516 (सन् 1459) में बना बताता है। पद्म, वायु, अग्नि और देवी भागवत पुराणों में इस स्थान का स्मरण है, और पिंडदान के लिए गया आने वाले परिवार विष्णुपद के बाद यहाँ चढ़कर देवी के दर्शन करते हैं।',
    significanceEn:
      'Mangala Gauri of Gaya is counted among the eighteen Maha Shakti Peethas, and the goddess is worshipped here as Sarvamangala, the Shakti who nourishes. The present hill temple is held to be a fifteenth-century structure — one account dates it to Vikram Samvat 1516 (1459 CE). The site is remembered in the Padma, Vayu, Agni and Devi Bhagavata Puranas, and families who come to Gaya for pind-daan climb here for the goddess’s darshan after Vishnupad.',
    originStoryHi:
      'परम्परा के अनुसार दक्ष-यज्ञ के बाद शिव सती के शरीर को लेकर भटकते रहे और विष्णु के चक्र से कटे अंग जहाँ-जहाँ गिरे वहाँ शक्ति पीठ बने। गया की इस पहाड़ी पर सती के वक्ष का अंश गिरा माना जाता है, इसीलिए देवी यहाँ स्तन्य और पोषण की शक्ति मंगला गौरी कहलाईं। भस्मकूट कही जाने वाली इसी पहाड़ी की चोटी पर पूर्वाभिमुख मंदिर खड़ा है, जहाँ देवी पिंडी रूप में विराजती हैं।',
    originStoryEn:
      'By tradition, after Daksha’s sacrifice Shiva wandered bearing Sati’s body, and wherever a severed limb fell a Shakti Peeth arose. On this hill at Gaya the breast of Sati is held to have fallen, and so the goddess here is Mangala Gauri, the Shakti of milk and nourishment. The east-facing shrine stands on the crest of that hill, called Bhasmakoot, where the goddess is worshipped in pindi form rather than as a carved image.',
    sources: [
      { label: 'Bihar Tourism - Mangala Gauri, Gaya', url: 'https://tourism.bihar.gov.in/en/destinations/gaya/mangala-gauri' },
      { label: 'Incredible India - Mangla Gauri Temple, Gaya', url: 'https://www.incredibleindia.gov.in/en/bihar/gaya/mangla-gauri-temple' },
      { label: 'Mangla Gauri Temple - Reference', url: 'https://en.wikipedia.org/wiki/Mangla_Gauri_Temple' },
    ],
    sections: [
      {
        id: 'sthapana',
        titleHi: 'मंदिर स्थापना कथा',
        titleEn: 'Sthapana Katha',
        bodyHi:
          'मंगला गौरी का स्थान गया के सबसे पुराने तीर्थों में गिना जाता है — पद्म, वायु, अग्नि और देवी भागवत पुराणों में इसका उल्लेख मिलता है, इसलिए यहाँ देवी-उपासना मंदिर की वर्तमान इमारत से कहीं पुरानी है। परम्परा के अनुसार दक्ष-यज्ञ के विध्वंस के बाद सती के वक्ष का अंश इसी भस्मकूट पहाड़ी पर गिरा, और तभी से यह स्थान अष्टादश महाशक्ति पीठों में गिना जाने लगा। जो पूर्वाभिमुख मंदिर आज खड़ा है उसे विवरण सामान्यतः पंद्रहवीं शताब्दी का बताते हैं, और एक विवरण इसे विक्रम संवत् 1516 (सन् 1459) का कहता है; स्थापना की तिथि, वार और प्रतिष्ठा करने वाले आचार्य का नाम किसी उपलब्ध अभिलेख में दर्ज नहीं है। गया की विशेषता यह है कि यह मुख्यतः वैष्णव पिंडदान-क्षेत्र है, फिर भी नगर के शिखरों पर देवी और शिव के प्राचीन स्थान बने रहे — मंगला गौरी उनमें सबसे ऊँचा और सबसे व्यस्त है। मंदिर की देखरेख आज स्थानीय पुजारी-परिवार और न्यास करते हैं, और बिहार सरकार का पर्यटन विभाग इसे गया के प्रमुख धार्मिक स्थलों में सूचीबद्ध करता है।',
        bodyEn:
          'Mangala Gauri is among the oldest sacred sites of Gaya — the Padma, Vayu, Agni and Devi Bhagavata Puranas all name it, so worship of the goddess here long predates the building that now stands. By tradition, after the destruction of Daksha’s sacrifice the breast of Sati fell on this hill, called Bhasmakoot, and from then the place was counted among the eighteen Maha Shakti Peethas. The east-facing temple visible today is generally described as a fifteenth-century structure, with one account giving Vikram Samvat 1516 (1459 CE); no available record preserves the consecration tithi, the weekday, or the name of the acharya who performed it. What marks Gaya out is that it is above all a Vaishnava pind-daan kshetra, yet ancient Devi and Shiva seats survive on its hilltops — and Mangala Gauri is the highest and busiest of them. The shrine is looked after today by local priestly families and its trust, and the Bihar government’s tourism department lists it among Gaya’s principal religious sites.',
      },
      {
        id: 'svarup',
        titleHi: 'मंगला गौरी का स्वरूप',
        titleEn: 'The Form of Mangala Gauri',
        bodyHi:
          'गर्भगृह में देवी की कोई मानव-आकृति प्रतिमा नहीं है — दो गोल उभरे पाषाण-रूप पूजे जाते हैं, जो सती के वक्ष के प्रतीक माने जाते हैं; इसी पिंडी पर देवी का मुख अंकित है और उसे ही श्रृंगार, चुनरी और पुष्प अर्पित होते हैं। पोषण का यह स्वरूप ही मंगला गौरी को अन्य पीठों से अलग करता है। मंदिर पत्थर का बना छोटा, सघन और पूर्वाभिमुख है, और गर्भगृह के आसपास प्राचीन उत्कीर्ण शिलाफलक लगे हैं। परिसर में परमेश्वर शिव के दो छोटे मंदिर तथा महिषासुरमर्दिनी, दुर्गा और दक्षिण काली की मूर्तियाँ हैं; गणेश और हनुमान के स्थान भी यहीं हैं, इसलिए एक ही चोटी पर देवी, शिव और उनके परिवार के दर्शन पूरे हो जाते हैं।',
        bodyEn:
          'The sanctum holds no human-formed image of the goddess — worship is offered to two rounded stone swellings understood as the breasts of Sati, and it is on this pindi that the Devi’s face is marked and her shringar, chunari and flowers are laid. That form, the form of nourishment, is what sets Mangala Gauri apart from the other peethas. The shrine itself is small, compact, stone-built and faces east, with old carved relief panels set around the sanctum. Within the precinct stand two smaller shrines of Parmeshwar Shiva and images of Mahishasura Mardini, Durga and Dakshina Kali; Ganesha and Hanuman have their places here as well, so a single hilltop completes the darshan of the goddess, of Shiva, and of their household.',
      },
      {
        id: 'parampara',
        titleHi: 'मंगला गौरी व्रत और पिंडदान-दर्शन',
        titleEn: 'The Mangala Gauri Vrat and the Pind-daan Darshan',
        bodyHi:
          'यहाँ की सबसे पहचानी परम्परा मंगला गौरी व्रत है — श्रावण मास के प्रत्येक मंगलवार को स्त्रियाँ पति और परिवार के कल्याण की कामना से यह व्रत रखती हैं, देवी को सोलह शृंगार की वस्तुएँ, लाल चुनरी, सिंदूर और पुष्प अर्पित करती हैं; इसीलिए श्रावण के मंगलवार वर्ष के सबसे व्यस्त दिन होते हैं। दूसरी परम्परा गया की अपनी है: जो परिवार पितरों के लिए विष्णुपद या फल्गु के घाटों पर पिंडदान करते हैं, वे कर्म पूरा कर पहाड़ी चढ़कर मंगला गौरी के दर्शन से यात्रा का समापन करते हैं। पहाड़ी तक लगभग दो सौ सीढ़ियाँ चढ़नी पड़ती हैं, और दर्शन प्रातः की आरती से आरम्भ होकर संध्या आरती तक चलते हैं। मंगलवार के अतिरिक्त शुक्रवार और नवरात्र के दिनों में भी विशेष भीड़ रहती है।',
        bodyEn:
          'The custom most closely tied to this hill is the Mangala Gauri Vrat — on every Tuesday of the month of Shravan women keep the fast for the wellbeing of husband and household, offering the goddess the sixteen articles of shringar, a red chunari, sindoor and flowers; those Tuesdays are the busiest days of the temple’s year. A second custom belongs to Gaya itself: families who have performed pind-daan for their ancestors at Vishnupad or on the Phalgu ghats climb the hill afterwards and close the rite with Mangala Gauri’s darshan. The ascent is roughly two hundred steps, and darshan runs from the morning aarti through to the evening aarti. Beyond Tuesdays, Fridays and the Navratri days also draw dense crowds.',
      },
      {
        id: 'mela',
        titleHi: 'मेले और उत्सव',
        titleEn: 'Melas and Festivals',
        bodyHi:
          'वर्ष के दो बड़े अवसर चैत्र नवरात्र (चैत्र शुक्ल प्रतिपदा से नवमी) और शारदीय नवरात्र (आश्विन शुक्ल प्रतिपदा से नवमी) हैं, जब पहाड़ी पर दिन-रात दर्शनार्थियों की कतार रहती है और अष्टमी-नवमी को हवन तथा कन्या-पूजन होते हैं। श्रावण मास के मंगलवार व्रत-दिवस की तरह मनाए जाते हैं और उन दिनों मंदिर के नीचे छोटा बाज़ार लग जाता है। आश्विन कृष्ण पक्ष यानी पितृ पक्ष के पंद्रह दिन गया का सबसे बड़ा तीर्थ-काल है; देश भर से आए परिवार पिंडदान के बाद यहाँ चढ़ते हैं, इसलिए यह शक्ति-पीठ होते हुए भी पितृ पक्ष में सबसे अधिक भरा रहता है। नवरात्रों में रात्रि-जागरण और भजन-संध्याएँ भी होती हैं।',
        bodyEn:
          'Two seasons dominate the year: Chaitra Navratri (Chaitra Shukla Pratipada to Navami) and Sharad Navratri (Ashwin Shukla Pratipada to Navami), when the queue up the hill runs day and night and the Ashtami and Navami days bring havan and kanya-pujan. The Tuesdays of Shravan are kept as vrat days, and a small bazaar sets up below the temple for them. The fifteen days of Pitru Paksha, the dark fortnight of Ashwin, are Gaya’s greatest pilgrim season; families arriving from across the country climb here once their pind-daan is done, so this Shakti Peeth is at its fullest during a fortnight given to the ancestors. Night-long jagrans and bhajan evenings fill the Navratri weeks as well.',
      },
      {
        id: 'yatra',
        titleHi: 'यात्रा और आसपास',
        titleEn: 'Journey and Around',
        bodyHi:
          'मंदिर गया ज़िले में नगर के दक्षिणी छोर की मंगलागौरी पहाड़ी पर है; ऊपर तक सड़क जाती है और सीढ़ियों का मार्ग भी है। गया जंक्शन लगभग 4–5 किमी दूर निकटतम रेलवे स्टेशन है और गया हवाई अड्डा लगभग 8–9 किमी; पटना सड़क मार्ग से लगभग 100 किमी है। नगर के भीतर ही विष्णुपद मंदिर और फल्गु के घाट हैं, जिनके साथ अधिकांश यात्री इसी दिन दर्शन जोड़ते हैं। गया की पहाड़ियों पर बने तीर्थ — ब्रह्मयोनि, रामशिला और शृंग-स्थान — मिलकर नगर का शिखर-परिक्रमा पथ बनाते हैं, और बौद्ध गया की महाबोधि पास ही है, इसलिए कई यात्री एक ही प्रवास में दोनों परम्पराओं के स्थान देख लेते हैं। सभी दूरियाँ अनुमानित हैं।',
        bodyEn:
          'The temple sits on Mangalagauri hill at the southern edge of Gaya city, in Gaya district, reached either by a motorable road to the top or by the flight of steps. Gaya Junction, the nearest railhead, is about 4–5 km away and Gaya airport about 8–9 km; Patna is roughly 100 km by road. Vishnupad temple and the Phalgu ghats lie within the same city, and most pilgrims pair them with this darshan on the same day. Gaya’s other hilltop shrines — Brahmayoni, Rama Shila and Shringa Sthan — together form the city’s circuit of peaks, and the Mahabodhi complex at Bodh Gaya is close enough that many visitors take in both traditions on one trip. All distances are approximate.',
      },
    ],
  },
};
