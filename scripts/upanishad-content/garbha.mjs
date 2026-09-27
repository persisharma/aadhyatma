/**
 * Authored content for one Upanishad — consumed by scripts/build-upanishad.mjs.
 * `muktika` is the text's fixed number in the Muktika canon (1–108) and is the
 * reader's `chapter` id forever; `slug` must match `registry.ts`.
 *
 * Garbha — Kṛṣṇa Yajurveda, Sāmānya-Vedānta group. Five prose sections (the
 * last with the embryo's verses): 1 the body of five elements and its six
 * tastes and seven notes; 2 the seven colours and seven dhātus; 3 embryology
 * month by month, sex and defects of the child; 4 the embryo's lament and
 * resolve in the ninth month and its forgetting at birth; 5 the three fires,
 * the body as a sacrifice, and the body's measures. Total 5 mantras.
 */
const M = (lines, meaningHi, meaningEn) => ({ lines, meaningHi, meaningEn });

export default {
  slug: 'garbha',
  muktika: 17,
  vedaHi: 'कृष्ण यजुर्वेद',
  vedaEn: 'Krishna Yajurveda',
  source: {
    baseText:
      'Kṛṣṇa Yajurveda recension as printed in the Adyar Library "Sāmānya Vedānta Upaniṣads" (with Upaniṣad-brahmayogin\'s commentary) and the Gita Press one-hundred-eight Upaniṣad collection; Devanagari written out from the printed text.',
    canonicalEdition: 'Adyar Library, The Sāmānya Vedānta Upaniṣads (ed. A. Mahadeva Sastri, 1921); Gita Press, उपनिषद् अंक',
    referenceUrls: [
      'https://sanskritdocuments.org/doc_upanishhat/garbha.html',
      'https://www.wisdomlib.org/hinduism/book/garbha-upanishad',
      'https://archive.org/details/SamanyaVedantaUpanishads',
    ],
    notes:
      '5 sections: 1 the opening definition (पञ्चात्मकं पञ्चसु वर्तमानम्) with the five elements, their functions, the senses, the six tastes and the seven notes; 2 the seven colours and the chain of dhātus from rasa to śukra; 3 embryology from the first night to the ninth month, with the determination of sex, twins and defects; 4 the embryo’s verses of lament and resolve, and its forgetting at birth when touched by the Vaiṣṇava wind; 5 why it is called śarīra (the three fires), the body as a sacrifice, and the body’s measures, ending with the colophon पैप्पलादं मोक्षशास्त्रम्. The Kṛṣṇa-Yajurvedic śānti-pāṭha (सह नाववतु) is page 1. Readings vary between prints in several places (e.g. नानायोनिसहस्राणि / पूर्वयोनिसहस्राणि; the counts of marmas, sinews and veins). Devanagari was authored from memory of the printed text because the network policy blocks the Sanskrit source hosts — a line-by-line scan check against the printed edition (including the section division) is still owed.',
    retrievedOn: '2026-09-27',
  },
  shanti: M(
    ['ॐ सह नाववतु सह नौ भुनक्तु सह वीर्यं करवावहै।', 'तेजस्वि नावधीतमस्तु मा विद्विषावहै॥', 'ॐ शान्तिः शान्तिः शान्तिः॥'],
    'वह (ब्रह्म) हम दोनों (गुरु-शिष्य) की साथ-साथ रक्षा करे, हम दोनों का साथ-साथ पालन करे; हम दोनों साथ-साथ सामर्थ्य प्राप्त करें। हमारा पढ़ा हुआ तेजस्वी हो; हम परस्पर द्वेष न करें। ॐ शान्तिः शान्तिः शान्तिः।',
    'May That protect us both together; may That nourish us both together; may we work together with vigour. May what we study be luminous; may we never hate one another. Om, peace, peace, peace.'
  ),
  mantras: [
    M(
      [
        'ॐ पञ्चात्मकं पञ्चसु वर्तमानं षडाश्रयं षड्गुणयोगयुक्तम्।',
        'तं सप्तधातुं त्रिमलं द्वियोनिं चतुर्विधाहारमयं शरीरं भवति।',
        'पञ्चात्मकमिति कस्मात्।',
        'पृथिव्यापस्तेजो वायुराकाशमित्यस्मिन्पञ्चात्मके शरीरे का पृथिवी का आपः किं तेजः को वायुः किमाकाशम्।',
        'तत्र यत्कठिनं सा पृथिवी यद्द्रवं ता आपो यदुष्णं तत्तेजो यत्सञ्चरति स वायुर्यत्सुषिरं तदाकाशमित्युच्यते।',
        'तत्र पृथिवी धारणे आपः पिण्डीकरणे तेजः प्रकाशने वायुर्व्यूहने आकाशमवकाशप्रदाने।',
        'पृथक् श्रोत्रे शब्दोपलब्धौ त्वक्स्पर्शे चक्षुषी रूपे जिह्वा रसने नासिकाघ्राणे उपस्थश्चानन्दनेऽपानमुत्सर्गे।',
        'बुद्ध्या बुध्यति मनसा सङ्कल्पयति वाचा वदति।',
        'षडाश्रयमिति कस्मात्।',
        'मधुराम्ललवणतिक्तकटुकषायरसान्विन्दतीति।',
        'षड्जर्षभगान्धारमध्यमपञ्चमधैवतनिषादाश्चेतीष्टानिष्टशब्दसंज्ञाः प्रणिधानाद्दशविधा भवन्ति॥',
      ],
      'यह शरीर पाँच (तत्त्वों) से बना है, पाँच (विषयों) में बरतता है, छः (रसों) का आश्रय है, छः गुणों के योग से युक्त है; वह सात धातुओं वाला, तीन मलों वाला, दो योनियों (माता-पिता के रज-वीर्य) से उत्पन्न और चार प्रकार के आहार से बना होता है। "पञ्चात्मक" क्यों कहते हैं? पृथ्वी, जल, तेज, वायु और आकाश — इस पञ्चात्मक शरीर में पृथ्वी क्या है, जल क्या है, तेज क्या है, वायु क्या है, आकाश क्या है? इसमें जो कठोर है वह पृथ्वी है, जो द्रव है वह जल है, जो उष्ण है वह तेज है, जो संचरण करता है वह वायु है, जो छिद्रमय (खोखला) है वह आकाश कहलाता है। इनमें पृथ्वी धारण करने में, जल पिण्ड बनाने (अंगों को जोड़े रखने) में, तेज प्रकाशित करने में, वायु (अंगों को) यथास्थान व्यवस्थित करने में और आकाश अवकाश (स्थान) देने में (काम आता है)। अलग-अलग — कान शब्द ग्रहण करने में, त्वचा स्पर्श में, आँखें रूप में, जीभ स्वाद में, नासिका गन्ध में, उपस्थ आनन्द (सन्तानोत्पत्ति के सुख) में और अपान मल-त्याग में (लगे हैं)। (मनुष्य) बुद्धि से जानता है, मन से संकल्प करता है, वाणी से बोलता है। "षडाश्रय" क्यों कहते हैं? क्योंकि यह मधुर, खट्टा, नमकीन, तीखा, कड़वा और कसैला — (इन छः) रसों का अनुभव करता है। षड्ज, ऋषभ, गान्धार, मध्यम, पञ्चम, धैवत और निषाद — ये (सात स्वर) तथा प्रिय-अप्रिय शब्दों के नाम — ध्यान देने से ये दस प्रकार के होते हैं।',
      'The body is made of five, abides in five, has six supports, is joined with six qualities; it has seven constituents (dhātus), three impurities, two sources (the father’s and the mother’s seed), and is made of four kinds of food. Why “made of five”? Earth, water, fire, air and space — in this body made of five, what is earth, what is water, what is fire, what is air, what is space? In it, what is hard is earth; what is liquid is water; what is hot is fire; what moves about is air; what is hollow is called space. Of these, earth serves for holding up, water for binding into a mass, fire for illumining, air for arranging (the parts), space for giving room. Severally: the ears serve for catching sound, the skin for touch, the eyes for form, the tongue for taste, the nose for smell, the organ of generation for pleasure, the apāna for excretion. One understands with the intellect, intends with the mind, speaks with speech. Why “six supports”? Because it experiences the tastes sweet, sour, salty, bitter, pungent and astringent. Ṣaḍja, ṛṣabha, gāndhāra, madhyama, pañcama, dhaivata and niṣāda (the seven notes), together with the names of pleasant and unpleasant sounds — by attention these become tenfold.'
    ),
    M(
      [
        'शुक्लो रक्तः कृष्णो धूम्रः पीतः कपिलः पाण्डुर इति।',
        'सप्तधातुकमिति कस्मात्।',
        'यदा देवदत्तस्य द्रव्यादिविषया जायन्ते।',
        'परस्परं सौम्यगुणत्वात्षड्विधो रसो रसाच्छोणितं शोणितान्मांसं मांसान्मेदो मेदसः स्नावा स्नाव्नोऽस्थीन्यस्थिभ्यो मज्जा मज्ज्ञः शुक्रम्।',
        'शुक्रशोणितसंयोगादावर्तते गर्भो हृदि व्यवस्थां नयति।',
        'हृदयेऽन्तराग्निरग्निस्थाने पित्तं पित्तस्थाने वायुर्वायुस्थाने हृदयं प्राजापत्यात्क्रमात्॥',
      ],
      '(सात रंग हैं —) श्वेत, लाल, काला, धूम्र, पीला, कपिल (भूरा) और पाण्डुर (पीला-सफ़ेद)। "सप्तधातुक" क्यों कहते हैं? जब देवदत्त (किसी भी व्यक्ति) के लिए अन्न आदि विषय उत्पन्न होते हैं, तो उनके परस्पर अनुकूल गुण होने से छः प्रकार का रस (बनता है); रस से रक्त, रक्त से मांस, मांस से मेद (चर्बी), मेद से स्नायु, स्नायु से हड्डियाँ, हड्डियों से मज्जा और मज्जा से शुक्र (वीर्य) बनता है। शुक्र और शोणित (रज) के संयोग से गर्भ बनता है; (प्राण उसे) हृदय में स्थित करता है। हृदय में भीतरी अग्नि है, अग्नि के स्थान में पित्त, पित्त के स्थान में वायु, और वायु के स्थान में हृदय — (यह) प्रजापति के (रचे) क्रम से (होता है)।',
      '(The colours are) white, red, black, smoke-grey, yellow, tawny and pale. Why “of seven constituents”? When the objects such as food arise for Devadatta (any person), then, because their qualities agree with one another, the sixfold juice (rasa) is formed; from rasa comes blood, from blood flesh, from flesh fat, from fat sinew, from sinew bones, from bones marrow, from marrow semen. From the union of semen and (the mother’s) blood the embryo is formed; it is settled in the heart. In the heart is the inner fire; in the seat of fire, bile; in the seat of bile, wind; in the seat of wind, the heart — in the order laid down by Prajāpati.'
    ),
    M(
      [
        'ऋतुकाले सम्प्रयोगादेकरात्रोषितं कलिलं भवति सप्तरात्रोषितं बुद्बुदं भवत्यर्धमासाभ्यन्तरेण पिण्डो भवति मासाभ्यन्तरेण कठिनो भवति मासद्वयेन शिरः कुरुते मासत्रयेण पादप्रदेशो भवति।',
        'अथ चतुर्थे मासे गुल्फजठरकटिप्रदेशा भवन्ति पञ्चमे मासे पृष्ठवंशो भवति षष्ठे मासे मुखनासिकाक्षिश्रोत्राणि भवन्ति सप्तमे मासे जीवेन संयुक्तो भवत्यष्टमे मासे सर्वसम्पूर्णो भवति।',
        'पितू रेतोऽतिरेकात्पुरुषो मातू रेतोऽतिरेकात्स्त्र्युभयोर्बीजतुल्यत्वान्नपुंसको भवति।',
        'व्याकुलितमनसोऽन्धाः खञ्जाः कुब्जा वामना भवन्ति।',
        'अन्योन्यवायुपरिपीडितशुक्रद्वैध्याद्द्विधा तनुः स्यात्ततो युग्माः प्रजायन्ते।',
        'पञ्चात्मकः समर्थः पञ्चात्मिका चेतसा बुद्धिर्गन्धरसादिज्ञानाक्षराक्षरमोङ्कारं चिन्तयतीति।',
        'तदेतदेकाक्षरं ज्ञात्वाष्टौ प्रकृतयः षोडश विकाराः शरीरे तस्यैव देहिनाम्।',
        'अथ मात्राशितपीतनाडीसूत्रगतेन प्राण आप्यायते।',
        'अथ नवमे मासि सर्वलक्षणज्ञानकरणसम्पूर्णो भवति पूर्वजातिं स्मरति कृताकृतं च कर्म विभाति शुभाशुभं च कर्म विन्दति॥',
      ],
      'ऋतुकाल में (स्त्री-पुरुष के) संयोग से (गर्भ) एक रात रहने पर कलल (तरल मिश्रण) होता है, सात रातों में बुलबुले जैसा होता है, आधे महीने के भीतर पिण्ड (गोला) बन जाता है, एक महीने के भीतर कठोर हो जाता है; दो महीनों में सिर बनता है, तीन महीनों में पैरों का भाग बनता है। चौथे महीने में टखने, पेट और कमर के भाग बनते हैं; पाँचवें महीने में रीढ़ बनती है; छठे महीने में मुँह, नाक, आँखें और कान बनते हैं; सातवें महीने में (गर्भ) जीव से संयुक्त होता है; आठवें महीने में सब (अंगों) से पूर्ण हो जाता है। पिता का वीर्य अधिक होने से पुत्र, माता का रज अधिक होने से कन्या, और दोनों के बीज बराबर होने से नपुंसक होता है। (संयोग के समय माता-पिता का) मन व्याकुल होने से (सन्तान) अन्धी, लँगड़ी, कुबड़ी या बौनी होती है। परस्पर (दोनों की) वायु से दबकर शुक्र के दो भाग हो जाने से शरीर दो हो जाता है, तब जुड़वाँ उत्पन्न होते हैं। पाँच तत्त्वों वाला (शरीर जब) समर्थ होता है, (तब) पाँच (ज्ञानेन्द्रियों) से युक्त बुद्धि, जो चित्त के द्वारा गन्ध, रस आदि को जानती है, अविनाशी अक्षर ओंकार का चिन्तन करती है। उस एक अक्षर को जानकर (जाना जाता है कि) आठ प्रकृतियाँ और सोलह विकार उसी देहधारी के शरीर में हैं। फिर माता के खाए-पिए अन्न-जल से, नाड़ी रूपी सूत्र (नाल) के द्वारा पहुँचे (रस) से, (गर्भ का) प्राण पुष्ट होता है। फिर नौवें महीने में वह सब लक्षणों, ज्ञान और इन्द्रियों से पूर्ण हो जाता है; वह पूर्व जन्म का स्मरण करता है, उसे किया-न-किया कर्म दिखता है, और वह शुभ-अशुभ कर्म को जानता है।',
      'From union in the fertile season, (the seed) after one night is a fluid mixture (kalala); after seven nights it is a bubble; within half a month it is a lump; within a month it is firm; in two months it forms the head; in three months the region of the feet appears. Then in the fourth month the ankles, belly and hips appear; in the fifth month the spine; in the sixth month the mouth, nose, eyes and ears; in the seventh month it is joined with the living self (jīva); in the eighth month it is complete in every part. From excess of the father’s seed a male is born, from excess of the mother’s seed a female, and from the two seeds being equal a eunuch. When (the parents’) minds are agitated, (the children) are born blind, lame, hunchbacked or dwarfed. When the seed is split in two, pressed by the winds of each upon the other, the body becomes twofold, and then twins are born. When the (body) of five elements is capable, the intellect of five (senses), which knows smell, taste and the rest through the mind, meditates on the imperishable syllable Om. Knowing that one syllable, (one knows that) the eight prakṛtis and sixteen modifications are in the body of that same embodied being. Then its life-breath is nourished by what the mother eats and drinks, reaching it through the cord of the channel (the navel-cord). Then in the ninth month it is complete with all its marks, knowledge and organs; it remembers its former birth, what it did and did not do shines before it, and it knows its good and evil deeds.'
    ),
    M(
      [
        'नानायोनिसहस्राणि दृष्ट्वा चैव ततो मया।',
        'आहारा विविधा भुक्ताः पीताश्च विविधाः स्तनाः।',
        'जातश्चैव मृतश्चैव जन्म चैव पुनः पुनः।',
        'यन्मया परिजनस्यार्थे कृतं कर्म शुभाशुभम्।',
        'एकाकी तेन दह्येऽहं गतास्ते फलभोगिनः।',
        'अहो दुःखोदधौ मग्नो न पश्यामि प्रतिक्रियाम्।',
        'यदि योन्याः प्रमुच्येऽहं तत्प्रपद्ये महेश्वरम्।',
        'अशुभक्षयकर्तारं फलमुक्तिप्रदायकम्।',
        'यदि योन्याः प्रमुच्येऽहं तत्प्रपद्ये नारायणम्।',
        'अशुभक्षयकर्तारं फलमुक्तिप्रदायकम्।',
        'यदि योन्याः प्रमुच्येऽहं तत्साङ्ख्यं योगमभ्यसे।',
        'अशुभक्षयकर्तारं फलमुक्तिप्रदायकम्।',
        'यदि योन्याः प्रमुच्येऽहं ध्याये ब्रह्म सनातनम्।',
        'अथ जन्तुः स्त्रीयोनिशतं योनिद्वारि सम्प्राप्तो यन्त्रेणापीड्यमानो महता दुःखेन जातमात्रस्तु वैष्णवेन वायुना संस्पृश्यते।',
        'तदा न स्मरति जन्ममरणानि न च कर्म शुभाशुभं विन्दति॥',
      ],
      '(गर्भस्थ जीव सोचता है —) "मैंने हज़ारों तरह की योनियाँ देखीं, नाना प्रकार के आहार खाए और अनेक (माताओं के) स्तनों का दूध पिया। मैं बार-बार जन्मा और मरा, बार-बार जन्म हुआ। अपने परिजनों के लिए मैंने जो शुभ-अशुभ कर्म किए, उनसे मैं अकेला ही जल रहा हूँ; उनके फल भोगने वाले तो चले गए। अहो! मैं दुःख के समुद्र में डूबा हूँ, इसका कोई उपाय नहीं देखता। यदि मैं इस योनि (गर्भ) से छूट जाऊँ, तो महेश्वर की शरण लूँगा, जो अशुभ का नाश करने वाले और (कर्म-)फल से मुक्ति देने वाले हैं। यदि मैं इस योनि से छूट जाऊँ, तो नारायण की शरण लूँगा, जो अशुभ का नाश करने वाले और फल से मुक्ति देने वाले हैं। यदि मैं इस योनि से छूट जाऊँ, तो सांख्य और योग का अभ्यास करूँगा, जो अशुभ का नाश करने वाले और फल से मुक्ति देने वाले हैं। यदि मैं इस योनि से छूट जाऊँ, तो सनातन ब्रह्म का ध्यान करूँगा।" फिर वह जीव, जो सैकड़ों स्त्री-योनियों से गुज़र चुका है, योनि के द्वार पर पहुँचकर, यन्त्र (प्रसव के दबाव) से पीड़ित होता हुआ बड़े दुःख के साथ जन्म लेता है; और जन्म लेते ही वैष्णवी वायु उसका स्पर्श करती है। तब वह अपने जन्मों और मृत्युओं को याद नहीं रखता, और न शुभ-अशुभ कर्म को जानता है।',
      '(The embryo thinks:) “I have seen thousands of different wombs; I have eaten many kinds of food and sucked many breasts. Again and again I was born and died; again and again came birth. The good and evil deeds I did for the sake of my kin — by them I alone am burnt, while those who enjoyed their fruits are gone. Alas, sunk in an ocean of sorrow, I see no remedy. If I am freed from this womb, I shall take refuge in Maheśvara, who destroys evil and grants release from (the bondage of) fruits. If I am freed from this womb, I shall take refuge in Nārāyaṇa, who destroys evil and grants release from fruits. If I am freed from this womb, I shall practise Sāṃkhya and Yoga, which destroy evil and grant release from fruits. If I am freed from this womb, I shall meditate on the eternal Brahman.” Then the creature, having passed through a hundred wombs of women, reaches the door of the womb; squeezed as in a press, it is born with great pain, and as soon as it is born it is touched by the Vaiṣṇava wind. Then it no longer remembers its births and deaths, nor does it know its good and evil deeds.'
    ),
    M(
      [
        'शरीरमिति कस्मात्।',
        'साक्षादग्नयो ह्यत्र श्रियन्ते ज्ञानाग्निर्दर्शनाग्निः कोष्ठाग्निरिति।',
        'तत्र कोष्ठाग्निर्नामाशितपीतलेह्यचोष्यं पचतीति।',
        'दर्शनाग्नी रूपादीनां दर्शनं करोति।',
        'ज्ञानाग्निः शुभाशुभं च कर्म विन्दति।',
        'तत्र त्रीणि स्थानानि भवन्ति हृदये दक्षिणाग्निरुदरे गार्हपत्यं मुखमाहवनीयम्।',
        'आत्मा यजमानो बुद्धिं पत्नीं निधाय मनो ब्रह्मा लोभादयः पशवो धृतिर्दीक्षा सन्तोषश्च बुद्धीन्द्रियाणि यज्ञपात्राणि कर्मेन्द्रियाणि हवींषि शिरः कपालं केशा दर्भा मुखमन्तर्वेदिः।',
        'चतुष्कपालं शिरः षोडश पार्श्वदन्तपटलानि सप्तोत्तरं मर्मशतं साशीतिकं सन्धिशतं सनवकं स्नायुशतं सप्त शिराशतानि पञ्च मज्जाशतान्यस्थीनि च ह वै त्रीणि शतानि षष्टिः।',
        'सार्धचतस्रो रोमाणि कोट्यो हृदयं पलान्यष्टौ द्वादश पलानि जिह्वा पित्तप्रस्थं कफस्याढकं शुक्लं कुडवं मेदः प्रस्थौ द्वावनियतं मूत्रपुरीषमाहारपरिमाणात्।',
        'पैप्पलादं मोक्षशास्त्रं परिसमाप्तं पैप्पलादं मोक्षशास्त्रं परिसमाप्तमिति॥',
      ],
      '"शरीर" क्यों कहते हैं? क्योंकि इसमें साक्षात् तीन अग्नियाँ आश्रय लेती हैं — ज्ञानाग्नि, दर्शनाग्नि और कोष्ठाग्नि। इनमें कोष्ठाग्नि (जठराग्नि) वह है जो खाए, पिए, चाटे और चूसे गए (अन्न) को पचाती है। दर्शनाग्नि रूप आदि का दर्शन कराती है। ज्ञानाग्नि शुभ-अशुभ कर्म को जानती है। इनके तीन स्थान हैं — हृदय में दक्षिणाग्नि, उदर में गार्हपत्य और मुख में आहवनीय अग्नि। (इस शरीर-यज्ञ में) आत्मा यजमान है, बुद्धि को पत्नी के स्थान पर रखकर; मन ब्रह्मा (पुरोहित) है; लोभ आदि पशु (बलि) हैं; धैर्य और सन्तोष दीक्षा हैं; ज्ञानेन्द्रियाँ यज्ञ के पात्र हैं; कर्मेन्द्रियाँ हवि (आहुति) हैं; सिर कपाल (पात्र) है; केश दर्भ (कुशा) हैं; मुख अन्तर्वेदी है। सिर चार कपालों (हड्डियों) वाला है; पार्श्वों और दाँतों के सोलह पटल हैं; एक सौ सात मर्मस्थान हैं; एक सौ अस्सी जोड़ हैं; एक सौ नौ स्नायु हैं; सात सौ शिराएँ हैं; पाँच सौ मज्जाएँ हैं; और हड्डियाँ तीन सौ साठ हैं। रोम साढ़े तीन करोड़ हैं; हृदय आठ पल (तौल) का है; जीभ बारह पल की; पित्त एक प्रस्थ, कफ एक आढक, शुक्र एक कुडव और मेद दो प्रस्थ है; मूत्र और मल की मात्रा नियत नहीं है, वह आहार की मात्रा पर (निर्भर) है। पिप्पलाद का (कहा) यह मोक्षशास्त्र पूर्ण हुआ, पिप्पलाद का मोक्षशास्त्र पूर्ण हुआ।',
      'Why is it called śarīra (body)? Because in it the fires themselves take shelter (śriyante): the fire of knowledge, the fire of sight and the fire of the belly. Of these, the fire of the belly is the one that digests what is eaten, drunk, licked and sucked. The fire of sight gives the seeing of forms and the rest. The fire of knowledge knows good and evil deeds. They have three seats: in the heart the southern fire (dakṣiṇāgni), in the belly the householder’s fire (gārhapatya), and the mouth is the offering fire (āhavanīya). (In this sacrifice of the body) the self is the sacrificer, having set the intellect in the place of his wife; the mind is the Brahman priest; greed and the like are the victims; steadiness and contentment are the consecration; the organs of knowledge are the sacrificial vessels; the organs of action are the offerings; the head is the skull-bowl; the hair is the darbha grass; the mouth is the inner altar. The head has four skull-plates; there are sixteen rows of side-teeth; a hundred and seven vital points (marmas); a hundred and eighty joints; a hundred and nine sinews; seven hundred veins; five hundred (portions of) marrow; and the bones are three hundred and sixty. The hairs of the body are three and a half crores; the heart weighs eight palas; the tongue twelve palas; bile is one prastha, phlegm one āḍhaka, semen one kuḍava, fat two prasthas; urine and faeces are not fixed, depending on the amount of food. The Paippalāda teaching of liberation is complete; the Paippalāda teaching of liberation is complete.'
    ),
  ],
};
