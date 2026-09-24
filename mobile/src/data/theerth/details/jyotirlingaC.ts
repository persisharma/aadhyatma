import type { TempleDetail } from '../temples';

const source = (label: string, url: string) => ({ label, url });

/**
 * Extended §12.6 readings — Jyotirlingas C.
 *
 * One chunk file per enrichment session (RULEBOOK §12.6, "one temple at a
 * time"): each file is owned by exactly one authoring pass so parallel waves
 * never collide in the same module. Entries here REPLACE the legacy two-line
 * detail carried inline in `temples.ts` — supply the whole `TempleDetail`
 * (expanded significance + origin story, `sources` ≥ 2, and the five fixed
 * sections in order: sthapana, svarup, parampara, mela, yatra).
 *
 * Temples still to author in this chunk: rameshwaram grishneshwar
 */
export const details: Record<string, TempleDetail> = {
  vaidyanath: {
    significanceHi:
      'देवघर का बाबा वैद्यनाथ धाम भारत का एकमात्र ऐसा तीर्थ माना जाता है जहाँ द्वादश ज्योतिर्लिङ्गों में से एक और शक्तिपीठ — दोनों एक ही परिसर में विराजते हैं। यहाँ का लिङ्ग “कामना लिङ्ग” कहलाता है, क्योंकि लोक-मान्यता है कि यहाँ की गई प्रार्थना अधूरी नहीं रहती। मंदिर के अग्रभाग का निर्माण गिद्धौर के पूरनमल ने सन् 1596 (विक्रम संवत् 1653) में कराया बताया जाता है — कुछ वृत्तान्त इसे सन् 1562 भी बताते हैं — और श्रावण मास की कांवड़ परम्परा इसे पूर्वी भारत का सबसे जीवंत शिव-तीर्थ बनाती है। परम्परागत सूची में वैद्यनाथ का स्थान देवघर और महाराष्ट्र के परली वैजनाथ के बीच विवादित है; यह ऐप देवघर को अंकित करता है।',
    significanceEn:
      'Baba Vaidyanath Dham at Deoghar is held to be the one shrine in India where a Jyotirlinga and a Shakti Peeth stand within the same precinct. Its linga is called the Kamana Linga, the wish-fulfilling linga, because tradition holds that no prayer offered here goes unanswered. The front portion of the present temple is credited to Puran Mal of the Gidhaur line in 1596 CE (Vikram Samvat 1653), though some accounts give 1562 CE, and the Shravan month Kanwar pilgrimage makes it the most crowded Shiva shrine of eastern India. In the traditional list, the identity of Vaidyanath is contested between Deoghar in Jharkhand and Parli Vaijnath in Maharashtra; this app pins Deoghar.',
    originStoryHi:
      'पुराण-परम्परा के अनुसार रावण ने कठोर तप से शिव को प्रसन्न कर ज्योतिर्लिङ्ग लंका ले जाने का वर पाया, इस शर्त के साथ कि मार्ग में उसे भूमि पर न रखा जाए। कथा कहती है कि देवताओं की युक्ति से विष्णु ब्राह्मण-वेश में प्रकट हुए और रावण ने उन्हें लिङ्ग थमा दिया; ब्राह्मण ने उसे भूमि पर रख दिया और लिङ्ग वहीं अचल हो गया। जिस स्थान पर वह स्थिर हुआ, वही आज का देवघर — देवताओं का घर — कहलाता है।',
    originStoryEn:
      'By Puranic tradition Ravana won the Jyotirlinga from Shiva through severe penance, on the condition that he must not set it on the ground anywhere along the way to Lanka. The story tells that the gods contrived a delay and Vishnu appeared as a Brahmin, to whom Ravana handed the linga; the Brahmin set it down and it took root in the earth and could not be lifted again. The place where it stayed became Deoghar, the house of the gods, and the linga there is worshipped as Baba Vaidyanath.',
    sources: [
      source('Jharkhand Tourism — Baidyanath Dham', 'https://tourism.jharkhand.gov.in/how-to-reach/53/1'),
      source('District Deoghar, Government of Jharkhand — History', 'https://deoghar.nic.in/history/'),
      source('District Deoghar, Government of Jharkhand — Shrawani Mela', 'https://deoghar.nic.in/shrawani-mela/'),
      source('Incredible India — Baba Baidyanath Dham', 'https://www.incredibleindia.gov.in/en/jharkhand/deoghar/baba-baidyanath-dham'),
      source('Baidyanath Temple — Reference', 'https://en.wikipedia.org/wiki/Baidyanath_Temple'),
    ],
    sections: [
      {
        id: 'sthapana',
        titleHi: 'मंदिर स्थापना कथा',
        titleEn: 'Sthapana Katha',
        bodyHi:
          'देवघर के तीर्थ की आरम्भिक तिथि किसी अभिलेख में दर्ज नहीं है; संस्कृत ग्रन्थों में यह क्षेत्र हारीतकीवन और केतकीवन नामों से आता है, और सातवीं शताब्दी में आए चीनी यात्री ह्वेनसांग ने इस अंचल के एक बड़े शिव-स्थान का उल्लेख किया है। परम्परा में रावण द्वारा लाए गए ज्योतिर्लिङ्ग की कथा ही स्थापना-कथा है, इसलिए यहाँ प्रतिष्ठा की कोई तिथि, तिथि-वार या प्रतिष्ठाकर्ता आचार्य अभिलिखित नहीं मिलता। वर्तमान मंदिर के अग्रभाग का निर्माण गिद्धौर राजवंश के पूर्वज पूरनमल ने कराया; मंदिर का एक संस्कृत शिलालेख उन्हें “नृपति” कहता है और बताता है कि यह निर्माण पुरोहित रघुनाथ ओझा के आग्रह पर हुआ। देवघर ज़िला प्रशासन इस निर्माण को सन् 1596 (विक्रम संवत् 1653) में रखता है, जबकि कुछ लोकप्रिय वृत्तान्त सन् 1562 (विक्रम संवत् 1619) बताते हैं — बेहतर प्रमाणित तिथि 1596 है। मंदिर की पूजा-व्यवस्था परम्परा से तीर्थपुरोहित पंडा परिवारों के हाथ में है, और प्रशासनिक देखरेख राज्य द्वारा गठित मंदिर प्रबंध समिति करती है।',
        bodyEn:
          'No inscription records when worship began at Deoghar. Sanskrit texts know the tract as Haritakivan and Ketakivan, and the seventh-century Chinese traveller Hiuen Tsang noted a major Shiva shrine in this region, so the site is plainly old. Because the founding narrative here is the Ravana katha rather than a dated consecration, no tithi, weekday or consecrating acharya is on record. The front portion of the temple standing today was built by Puran Mal, an ancestor of the Gidhaur chieftains; a Sanskrit inscription at the temple calls him nripati, lord of men, and states that he raised it at the request of the priest Raghunath Ojha. The Deoghar district administration dates that work to 1596 CE (Vikram Samvat 1653), while some popular accounts give 1562 CE (Vikram Samvat 1619); 1596 is the better attested of the two. Worship has long been carried out by the hereditary tirtha-purohit pandas of Deoghar, with the temple managed today through a state-constituted management committee.',
      },
      {
        id: 'svarup',
        titleHi: 'बाबा वैद्यनाथ का स्वरूप',
        titleEn: 'The Form of Baba Vaidyanath',
        bodyHi:
          'गर्भगृह में लिङ्ग एक विस्तृत चबूतरे के बीच स्थापित है और ऊपरी भाग कुछ घिसा हुआ है — भक्त इसे रावण के बल से दबाए जाने की कथा से जोड़ते हैं। मंदिर पूर्वाभिमुख है, लगभग 72 फुट ऊँचा, और नागर शैली के शिखर पर पंचशूल विराजता है; पुरोहित-परम्परा इसे काम, क्रोध, लोभ, मोह और मद — इन पाँच विकारों के नाश का प्रतीक मानती है, और भारत के अन्य शिव-मंदिरों में यह पंचशूल दुर्लभ है। मुख्य मंदिर के साथ परिसर में इक्कीस अन्य देवालय हैं, जिनमें पार्वती मंदिर सबसे महत्वपूर्ण है, और यहीं सती के हृदय-पात की मान्यता से शक्तिपीठ का भाव जुड़ा है। लिङ्ग पर जल, बेलपत्र, भाँग, धतूरा और दूध अर्पित होता है; भक्त स्वयं गर्भगृह तक पहुँचकर जलार्पण कर सकते हैं, जो इस धाम की अलग पहचान है।',
        bodyEn:
          'In the sanctum the linga rises from the centre of a broad stone platform, its top worn smooth — devotees connect this with the story of Ravana pressing down on it. The east-facing temple stands about 72 feet high in the Nagara manner, and its shikhara is crowned by a panchshool, a five-pointed trident that temple priests read as the destruction of the five failings of lust, anger, greed, attachment and pride; the panchshool is rare among Shiva temples elsewhere in India. Twenty-one further shrines fill the walled complex around the main temple, the Parvati shrine chief among them, and it is through the belief that Sati fell here that the Shakti Peeth character of the site is held. Water, bel leaves, bhang, dhatura and milk are offered on the linga, and pilgrims are able to reach the sanctum and pour the water themselves — an intimacy unusual among the great Jyotirlingas.',
      },
      {
        id: 'parampara',
        titleHi: 'कांवड़ और गठबंधन',
        titleEn: 'The Kanwar and the Gathbandhan',
        bodyHi:
          'देवघर की सबसे प्रसिद्ध परम्परा कांवड़ है — भक्त बिहार के सुल्तानगंज स्थित अजगैबीनाथ घाट से गंगाजल भरकर बाँस की कांवड़ में लगभग 105 किमी पैदल चलकर बाबा वैद्यनाथ पर जलार्पण करते हैं। यात्रा भर कांवड़ भूमि पर नहीं रखी जाती और यात्री केसरिया वस्त्र धारण कर “बोल बम” का उद्घोष करते चलते हैं; डाक बम कहलाने वाले व्रती यह दूरी बिना रुके एक ही बार में पूरी करते हैं। दूसरी विशिष्ट परम्परा गठबंधन है — मुख्य मंदिर और पार्वती मंदिर के शिखरों को लाल पवित्र धागों से बाँधा जाता है, जिसे शिव-शक्ति के मिलन का प्रतीक मानकर विवाहित दम्पती विशेष रूप से अर्पित करते हैं। भक्त मंदिर के शिखर पर चढ़ने वाले सेवकों के हाथ यह धागा भेजते हैं, और दर्शन प्रातःकालीन सरकारी पूजा से रात्रि शृंगार-आरती तक चलते हैं।',
        bodyEn:
          'Deoghar’s signature practice is the Kanwar. Pilgrims fill their pots with Ganga water at the Ajgaibinath ghat in Sultanganj, Bihar, sling them from a decorated bamboo pole and walk roughly 105 km on foot to pour the water over Baba Vaidyanath. The kanwar may not be set on the ground at any point of the walk; the walkers wear saffron and call out "Bol Bam", and those known as dak bams cover the whole distance in a single unbroken run. The second custom peculiar to this shrine is the gathbandhan, in which the shikharas of the main temple and the Parvati temple are joined by long red sacred threads that devotees — married couples above all — offer to be tied, reading in it the union of Shiva and Shakti. The threads are carried up by temple servitors who climb the spires, and darshan runs from the morning sarkari puja through to the night shringar aarti.',
      },
      {
        id: 'mela',
        titleHi: 'मेले और उत्सव',
        titleEn: 'Melas and Festivals',
        bodyHi:
          'वर्ष का सबसे बड़ा आयोजन श्रावणी मेला है, जो श्रावण मास भर — प्रायः जुलाई से अगस्त तक — चलता है और इसे विश्व का सबसे लम्बा धार्मिक मेला कहा जाता है; इस अवधि में लाखों कांवड़िये सुल्तानगंज से देवघर पहुँचते हैं और जल चढ़ाने की कतार कई किलोमीटर लम्बी हो जाती है। महाशिवरात्रि (फाल्गुन कृष्ण चतुर्दशी) दूसरा बड़ा पर्व है, जब शिव-पार्वती विवाह के भाव से विशेष शृंगार और रात्रि-जागरण होता है। भादों मास में भी जलार्पण की परम्परा है, और बसंत पंचमी से मंदिर में विवाह-उत्सव की तैयारियाँ आरम्भ मानी जाती हैं। झारखंड और बिहार सरकारें श्रावणी मेले के लिए मार्ग भर टेंट-नगरी, जलसेवा और चिकित्सा शिविर लगाती हैं।',
        bodyEn:
          'The year turns on the Shrawani Mela, which fills the whole month of Shravan, usually spanning July and August, and is often described as the longest religious fair in the world; lakhs of kanwariyas arrive from Sultanganj in that month and the queue for jalarpan stretches for kilometres. Mahashivaratri, on Phalgun Krishna Chaturdashi, is the second great observance, kept here as the wedding of Shiva and Parvati with special shringar and a night-long vigil. Offering water in the month of Bhadon is also customary, and Basant Panchami is taken as the opening of the temple’s marriage-season observances. For the Shrawani Mela the Jharkhand and Bihar governments raise tent settlements, water points and medical camps along the entire walking route.',
      },
      {
        id: 'yatra',
        titleHi: 'यात्रा और आसपास',
        titleEn: 'Journey and Around',
        bodyHi:
          'देवघर झारखंड के संथाल परगना प्रमंडल में है। निकटतम बड़ा रेलवे स्टेशन जसीडीह जंक्शन है, जो मंदिर से लगभग 7 किमी दूर है; बैद्यनाथधाम स्टेशन मंदिर के और पास पड़ता है। देवघर हवाई अड्डा नगर से लगभग 10 किमी दूर है, और रांची तथा गया के हवाई अड्डे क्रमशः लगभग 250 किमी और 220 किमी दूर पड़ते हैं। कांवड़ यात्रा का आरम्भ-स्थल सुल्तानगंज (बिहार) यहाँ से लगभग 105 किमी है। अधिकांश तीर्थयात्री वैद्यनाथ धाम के साथ दुमका ज़िले के बासुकीनाथ को जोड़ते हैं, जो देवघर–दुमका मार्ग पर लगभग 45 किमी दूर है — लोक-मान्यता है कि बासुकीनाथ के दर्शन बिना यात्रा पूर्ण नहीं होती। समीप ही त्रिकूट पर्वत, नौलखा मंदिर, तपोवन और शिवगंगा सरोवर भी दर्शनीय हैं, और परिसर के भीतर पार्वती मंदिर सहित इक्कीस देवालय परिक्रमा में आते हैं।',
        bodyEn:
          'Deoghar lies in the Santhal Pargana division of Jharkhand. The main railhead is Jasidih Junction, roughly 7 km from the temple, with Baidyanathdham station closer to the shrine itself. Deoghar airport is about 10 km from the town, while the airports at Ranchi and Gaya lie approximately 250 km and 220 km away. Sultanganj in Bihar, where the Kanwar walk begins, is about 105 km distant. Most pilgrims pair Vaidyanath Dham with Basukinath in Dumka district, about 45 km along the Deoghar–Dumka road, since tradition holds that the yatra is incomplete without that darshan. Trikut hill, the Naulakha temple, Tapovan and the Shivganga tank are the usual nearby visits, and within the walled complex the Parvati shrine and the twenty-one subsidiary temples are taken in on the circumambulation.',
      },
    ],
  },
  nageshwar: {
    significanceHi:
      'देवभूमि द्वारका ज़िले का नागेश्वर ज्योतिर्लिङ्ग शिव को भक्तों के रक्षक — नागों के ईश्वर — रूप में स्मरण कराता है। शिवपुराण की रुद्रसंहिता इसे “दारुकावन नागेश्वरम्” कहती है और परम्परा मानती है कि यहाँ का स्मरण विष और भय दोनों से रक्षा करता है। मंदिर की मूल प्रतिष्ठा की कोई तिथि अभिलिखित नहीं है; स्वयम्भू लिङ्ग सदियों तक बालू में दबा रहा और वर्तमान भव्य मंदिर तथा लगभग अस्सी फुट ऊँची ध्यानस्थ शिव-प्रतिमा बीसवीं सदी के उत्तरार्ध में संगीत-निर्माता गुलशन कुमार के सहयोग से बनी। द्वारका यात्रा करने वाले अधिकांश तीर्थयात्री द्वारकाधीश के दर्शन के बाद यहीं आते हैं।',
    significanceEn:
      'Nageshwar in Devbhumi Dwarka district remembers Shiva as the protector of his devotees, the lord of the nagas. The Rudra Samhita of the Shiva Purana names the shrine "Darukavana Nageshwaram", and tradition holds that remembrance here guards against poison and against fear alike. No date of first consecration is recorded; the swayambhu linga lay buried in the sand for centuries, and the present spacious temple with its roughly eighty-foot seated Shiva in meditation was raised in the later twentieth century with the support of the music producer Gulshan Kumar. Most pilgrims on the Dwarka circuit come here after the darshan of Dwarkadhish.',
    originStoryHi:
      'शिवपुराण की कथा में दारुका नामक राक्षसी और उसके पति दारुक ने दारुकावन में आतंक फैलाया और शिव-भक्त सुप्रिय को अन्य यात्रियों सहित बंदी बना लिया। बंदीगृह में भी सुप्रिय ने सबको “ॐ नमः शिवाय” का जप कराया, जिससे क्रुद्ध दारुक ने उनके वध का आदेश दिया। कथा कहती है कि उसी क्षण शिव ज्योतिर्लिङ्ग रूप में प्रकट हुए, बंदियों की रक्षा की और नागेश्वर नाम से वहीं विराजमान हो गए।',
    originStoryEn:
      'The Shiva Purana tells of the demoness Daruka and her husband Daruka who terrorised the forest of Darukavana and seized the Shiva devotee Supriya along with fellow travellers. Even in the prison Supriya led the captives in the chant of Om Namah Shivaya, and the enraged demon ordered them killed. At that moment, the story says, Shiva appeared as a column of light, defended the captives and remained at the spot under the name Nageshwar, the lord of serpents.',
    sources: [
      source('Gujarat Tourism — Nageshwar Jyotirlinga', 'https://gujarattourism.com/saurashtra/devbhoomi-dwarka/nageshwar-jyotirlinga.html'),
      source('District Devbhumi Dwarka, Government of Gujarat — Nageshwar Temple', 'https://devbhumidwarka.nic.in/tourist-place/nageshwar-temple/'),
      source('Incredible India — Nageshwar Jyotirlinga', 'https://www.incredibleindia.gov.in/en/gujarat/dwarka/nageshwar-jyotirlinga'),
      source('Nageshwar Jyotirlinga — Reference', 'https://en.wikipedia.org/wiki/Nageshvara_Jyotirlinga'),
    ],
    sections: [
      {
        id: 'sthapana',
        titleHi: 'मंदिर स्थापना कथा',
        titleEn: 'Sthapana Katha',
        bodyHi:
          'नागेश्वर की स्थापना-कथा पुराण-परम्परा की है, किसी शिलालेख की नहीं — इसलिए यहाँ प्रतिष्ठा-तिथि, तिथि-वार अथवा प्रतिष्ठाकर्ता का कोई अभिलेख उपलब्ध नहीं है। शिवपुराण की रुद्रसंहिता में यह क्षेत्र दारुकावन कहलाता है, और सुप्रिय की रक्षा के लिए शिव के प्रकट होने की कथा ही इस स्थान की आधारशिला मानी जाती है। द्वारका अंचल के पुरातात्त्विक उत्खनन इस तट पर एक के नीचे एक बसी कई प्राचीन बस्तियों की ओर संकेत करते हैं, जिससे यहाँ की बसावट की प्राचीनता प्रमाणित होती है। परम्परा कहती है कि मध्यकाल की उथल-पुथल और समुद्री कटाव के बीच स्वयम्भू लिङ्ग लम्बे समय तक बालू में ढँका रहा और बाद में पुनः प्रकट हुआ। वर्तमान विशाल मंदिर, परिसर और लगभग अस्सी फुट ऊँची ध्यानस्थ शिव-प्रतिमा का निर्माण बीसवीं सदी के उत्तरार्ध में संगीत-निर्माता गुलशन कुमार के सहयोग से हुआ, और सेवा-पूजा की व्यवस्था मंदिर न्यास देखता है। नागेश्वर की पहचान को लेकर महाराष्ट्र का औंढा नागनाथ और उत्तराखंड का जागेश्वर भी दावा करते हैं; लोक-प्रचलित गणना द्वारका के इसी मंदिर को द्वादश ज्योतिर्लिङ्ग में रखती है, जिसे यह ऐप अंकित करता है।',
        bodyEn:
          'Nageshwar’s founding account is Puranic rather than epigraphic, so no consecration date, tithi, weekday or consecrating acharya survives for this shrine. The Rudra Samhita of the Shiva Purana calls the tract Darukavana, and the appearance of Shiva to save Supriya is taken as the shrine’s beginning. Archaeological work along the Dwarka coast has shown successive ancient settlements layered at this site, which attests to how long the place has been inhabited. Tradition holds that through medieval upheaval and coastal erosion the swayambhu linga lay buried in sand for a long period before being recovered. The wide temple, precinct and the roughly eighty-foot seated figure of Shiva in meditation that dominate the site today were built in the later twentieth century with the support of the music producer Gulshan Kumar, and the temple trust now runs the worship. The identity of Nageshwar is also claimed by Aundha Nagnath in Maharashtra and Jageshwar in Uttarakhand; popular reckoning counts this Dwarka shrine among the twelve, and that is the pin this app follows.',
      },
      {
        id: 'svarup',
        titleHi: 'नागेश्वर महादेव का स्वरूप',
        titleEn: 'The Form of Nageshwar Mahadev',
        bodyHi:
          'नागेश्वर का गर्भगृह भूमि-तल से कुछ नीचे बना है, इसलिए दर्शनार्थी सीढ़ियाँ उतरकर लिङ्ग तक पहुँचते हैं — यही इस धाम की सबसे विशिष्ट रचना है। लिङ्ग दक्षिणाभिमुख है, जो ज्योतिर्लिङ्गों में असाधारण माना जाता है, और उसका पत्थर द्वारका-शिला कहलाता है, जिस पर छोटे-छोटे चक्र-चिह्न उभरे रहते हैं। परम्परा उसके आकार की तुलना त्रिमुखी रुद्राक्ष से करती है, और भक्त उसे नागों के स्वामी के रूप में पूजते हैं। गर्भगृह के भीतर सीमित संख्या में ही श्रद्धालु एक साथ जा पाते हैं, जिससे दर्शन शान्त और निकट का अनुभव देता है। परिसर के बाहर खुले प्रांगण में ध्यानमग्न शिव की विशाल प्रतिमा दूर से ही दिखाई देती है और अरब सागर की ओर खुलता यह तट मंदिर की पहचान बन गया है।',
        bodyEn:
          'The sanctum at Nageshwar sits a little below ground level, so worshippers step down to reach the linga — the most distinctive feature of the shrine. The linga faces south, which is unusual among the Jyotirlingas, and is cut from the stone called Dwarka Shila, whose surface carries small raised chakra markings. Tradition likens its shape to a three-faced rudraksha, and devotees revere it as the lord of the serpents. Only a limited number of people can stand in the sanctum at once, which keeps the darshan quiet and close. Outside, in the open forecourt, the vast seated figure of Shiva in meditation is visible from far off, and this stretch of coast facing the Arabian Sea has become the temple’s public face.',
      },
      {
        id: 'parampara',
        titleHi: 'रुद्राभिषेक और नाग-रक्षा',
        titleEn: 'Rudrabhishek and the Serpent’s Protection',
        bodyHi:
          'नागेश्वर की मुख्य परम्परा रुद्राभिषेक है — जल, दूध, दही, घी, मधु और शर्करा के पंचामृत से लिङ्ग का अभिषेक, जिसके लिए मंदिर प्रातःकाल का अलग समय निर्धारित करता है और श्रद्धालु पहले से बुकिंग कराते हैं। बेलपत्र, धतूरा और सफेद पुष्प यहाँ का सामान्य अर्पण हैं। लोक-मान्यता है कि नागेश्वर का स्मरण सर्प-विष, भय और कालसर्प-दोष से रक्षा करता है, इसलिए अनेक भक्त यहाँ नाग-सम्बन्धी संकल्प और पाठ कराते हैं। मंदिर प्रातः लगभग पाँच बजे खुलता है और रात्रि तक दर्शन चलते हैं, बीच में दोपहर का विराम प्रायः नहीं होता; सोमवार और श्रावण के सोमवार सबसे व्यस्त रहते हैं, जब अभिषेक की कतार लम्बी हो जाती है।',
        bodyEn:
          'The central practice at Nageshwar is the Rudrabhishek, the bathing of the linga with the panchamrit of water, milk, curd, ghee, honey and sugar, for which the temple sets aside an early-morning slot that devotees usually reserve in advance. Bel leaves, dhatura and white flowers are the ordinary offerings. Popular belief holds that remembering Nageshwar protects against snake venom, against fear and against the kaal-sarp affliction, so many devotees have serpent-related sankalpas and recitations performed here. The temple opens around five in the morning and darshan continues into the night, generally without a midday closure; Mondays and the Mondays of Shravan are the busiest, when the queue for abhishek runs long.',
      },
      {
        id: 'mela',
        titleHi: 'मेले और उत्सव',
        titleEn: 'Melas and Festivals',
        bodyHi:
          'वर्ष का सबसे बड़ा पर्व महाशिवरात्रि (फाल्गुन कृष्ण चतुर्दशी) है, जब रातभर चार प्रहर की पूजा, निरन्तर अभिषेक और जागरण होता है और सौराष्ट्र-भर से श्रद्धालु उमड़ते हैं। श्रावण मास पूरा उत्सव-काल रहता है — विशेषकर सोमवार, जब विशेष शृंगार और सामूहिक रुद्राभिषेक होते हैं। नागपंचमी (श्रावण शुक्ल पंचमी) का यहाँ अलग महत्त्व है, क्योंकि नागेश्वर नागों के अधिपति माने जाते हैं। कार्तिक पूर्णिमा और प्रदोष तिथियों पर भी विशेष आरती होती है, और द्वारका की जन्माष्टमी भीड़ का प्रभाव इस मंदिर तक पहुँचता है।',
        bodyEn:
          'The great observance of the year is Mahashivaratri on Phalgun Krishna Chaturdashi, kept with the four watches of night worship, continuous abhishek and a vigil, drawing devotees from across Saurashtra. The whole month of Shravan is festive, the Mondays especially, with elaborate shringar and collective Rudrabhishek. Nag Panchami on Shravan Shukla Panchami carries particular weight here, since Nageshwar is held to be the lord of serpents. Kartik Purnima and the Pradosh days also bring special aartis, and the Janmashtami crowds at Dwarka spill over to this shrine as well.',
      },
      {
        id: 'yatra',
        titleHi: 'यात्रा और आसपास',
        titleEn: 'Journey and Around',
        bodyHi:
          'नागेश्वर गुजरात के देवभूमि द्वारका ज़िले में, द्वारका से बेट द्वारका जाने वाले तटीय मार्ग पर है — द्वारका नगर से लगभग 17–18 किमी। निकटतम रेलवे स्टेशन द्वारका है, जो लगभग इतनी ही दूरी पर पड़ता है; निकटतम हवाई अड्डे पोरबंदर (लगभग 107 किमी) और जामनगर (लगभग 126 किमी) हैं। लगभग सभी तीर्थयात्री नागेश्वर को द्वारकाधीश मंदिर, बेट द्वारका और रुक्मिणी देवी मंदिर के साथ एक ही परिक्रमा में जोड़ते हैं, और अनेक इसे सोमनाथ–द्वारका ज्योतिर्लिङ्ग यात्रा की कड़ी बनाते हैं। मंदिर के पास ही गोपी तालाब तीर्थ है, जिसे गोपियों की स्मृति से जोड़ा जाता है; तट पर शिवराजपुर समुद्र-तट भी निकट पड़ता है।',
        bodyEn:
          'Nageshwar stands in Devbhumi Dwarka district of Gujarat on the coastal road that runs from Dwarka towards Bet Dwarka, roughly 17–18 km from Dwarka town. Dwarka is the nearest railhead at about the same distance; the closest airports are Porbandar, some 107 km away, and Jamnagar, about 126 km. Nearly every pilgrim takes Nageshwar together with the Dwarkadhish temple, Bet Dwarka and the Rukmini Devi shrine in one circuit, and many fold it into the Somnath–Dwarka Jyotirlinga journey. Close by lies Gopi Talav, a tank associated in tradition with the gopis, and the Shivrajpur beach is a short distance along the same coast.',
      },
    ],
  },
};
