/**
 * पितृ-कथाएँ — the teaching stories of पितृ पक्ष परिचय (PRD-44 §5.4).
 *
 * The four verified kathas are each retold verse-by-verse from the BUNDLED
 * Valmiki Ramayana and hand off into that reader — nothing in them is
 * invented: Rama's rite for Dasharatha (Ayodhya 102), Bhagiratha and the sixty
 * thousand (Bala 38–44), Jatayu's last rites (Aranya 67–68), and Bharata's
 * twelfth-day shraddha for Dasharatha (Ayodhya 77). Sarga numbers
 * follow the shipped Southern-recension text. The
 * Karna legend that popular tellings attach to the paksha's origin is DRAFT:
 * it is not in the Mahabharata's critical text, and its provenance must be
 * named honestly (लोक-कथा) before it can render. ⚠ `source` blocks are
 * review-only provenance — never rendered; `canon*` is the rendered line.
 */
import type { PitruKathaEntry } from './types';

const VALMIKI_CORPUS = 'repo:mobile/src/data/valmiki-ramayan/chapter-02.json';
const VALMIKI_NET = 'https://www.valmikiramayan.net/utf8/ayodhya/sarga103/ayodhya_103_frame.htm';
const VALMIKI_BALA = 'repo:mobile/src/data/valmiki-ramayan/chapter-01.json';
const VALMIKI_NET_BALA = 'https://www.valmikiramayan.net/utf8/baala/sarga41/bala_41_frame.htm';
const VALMIKI_ARANYA = 'repo:mobile/src/data/valmiki-ramayan/chapter-03.json';
const VALMIKI_NET_ARANYA = 'https://www.valmikiramayan.net/utf8/aranya/sarga68/aranya_68_frame.htm';
const VALMIKI_NET_AYODHYA_77 = 'https://www.valmikiramayan.net/utf8/ayodhya/sarga77/ayodhya_77_frame.htm';

export const PITRU_KATHA_ENTRIES: readonly PitruKathaEntry[] = [
  {
    id: 'rama-jalanjali',
    titleHi: 'चित्रकूट में श्रीराम का पितृ-कर्म',
    titleEn: 'Rama’s rite for his father at Chitrakoot',
    subtitleHi: 'अयोध्याकाण्ड — मन्दाकिनी तट पर जलाञ्जलि और पिण्ड',
    subtitleEn: 'Ayodhya Kanda — water and pinda on the Mandakini bank',
    sections: [
      {
        id: 'katha',
        paragraphsHi: [
          'भरत चित्रकूट पहुँचे और श्रीराम को महाराज दशरथ के देहान्त का समाचार दिया। शोक से व्याकुल राम ने सबसे पहले वही किया जो पुत्र का धर्म था — उन्होंने लक्ष्मण से कहा: इंगुदी का पिण्याक और उत्तरीय वस्त्र ले आओ; मैं महात्मा पिता की जलक्रिया के लिए नदी तट पर जाऊँगा।',
          'सीता आगे चलीं, लक्ष्मण उनके साथ, और राम सबके पीछे — क्योंकि मार्ग कठिन था। सुमन्त्र ने राजकुमारों को ढाढस बँधाया और उन्हें मन्दाकिनी के पावन तट पर उतारा। निर्मल, तीव्र धारा के पास पहुँचकर उन्होंने राजा के लिए जल छोड़ा — "तात, यह आपके लिए है।"',
          'फिर राम ने अञ्जलि में जल भरा, दक्षिण दिशा — पितरों की दिशा — की ओर मुख किया और रोते हुए कहा: हे राजशार्दूल! पितृलोक में गए हुए आपको मेरा दिया यह निर्मल, अक्षय जल आज प्राप्त हो।',
          'तट से बाहर आकर तेजस्वी राघव ने भाइयों के साथ पिता के लिए निवाप — पिण्डदान — किया। वन में उनके पास जो था, वही अर्पित किया: इंगुदी के गूदे में बेर मिलाकर दर्भ के आसन पर रखा, और दुःख से आर्त होकर बोले — महाराज, प्रसन्न होकर इसे ग्रहण करें; जो हम खाते हैं, वही आपको अर्पित है — क्योंकि मनुष्य जैसा अन्न स्वयं खाता है, उसके पितर भी वही पाते हैं।',
          'चारों भाइयों और वैदेही के रुदन की प्रतिध्वनि पर्वत में गूँज उठी, और भरत की सेना समझ गई कि भाई मिल गए हैं और पिता का शोक कर रहे हैं।',
        ],
        paragraphsEn: [
          'Bharata reached Chitrakoot and told Rama that King Dasharatha had died. Stricken, Rama turned first to a son’s duty — he told Lakshmana: bring the pulp of the ingudi fruit and an upper cloth of bark; I will go to the river for my noble father’s water-rite.',
          'Sita walked ahead, Lakshmana beside her, and Rama behind them both, for the path was hard. Sumantra steadied the princes and led them down to the Mandakini’s sacred bank. Reaching the clear, swift stream they let fall water for the king — “Father, this is for you.”',
          'Then Rama filled his cupped hands, turned to the south — the direction of the pitrs — and said through tears: O tiger among kings, to you who have gone to the world of the ancestors, may this clear, undiminishing water that I give reach you today.',
          'Coming up from the bank, the radiant Raghava made the nivapa — the pinda offering — for his father with his brothers. He offered what the forest had given them: ingudi pulp mixed with jujube, set on a bed of darbha grass, and said in grief — great king, accept this gladly; what we eat is what we offer you, for whatever food a man himself eats, that is what his ancestors receive.',
          'The weeping of the four brothers and of Vaidehi echoed from the mountain, and Bharata’s soldiers understood that the brothers had met, and were mourning their father.',
        ],
      },
    ],
    teachingHi:
      'श्राद्ध का मूल भाव सामग्री में नहीं, श्रद्धा में है — राम ने राजसी पदार्थ नहीं, वन का इंगुदी-पिण्याक अर्पित किया, और वही पर्याप्त था। जो परिवार के पास है, वही अर्पण है।',
    teachingEn:
      'The heart of shraddha is shraddha — faith — not the materials. Rama offered no royal fare but the forest’s ingudi pulp, and it was enough. What the family has is what the family offers.',
    canonHi: 'वाल्मीकि रामायण · अयोध्याकाण्ड, सर्ग १०२–१०३',
    canonEn: 'Valmiki Ramayana · Ayodhya Kanda, sargas 102–103',
    ref: { kind: 'valmiki', chapter: 2, verseIndex: 3708 },
    status: 'verified',
    source: {
      referenceUrls: [VALMIKI_CORPUS, VALMIKI_NET],
      verificationNote:
        '2026-09-19: retelling drawn sentence-by-sentence from the bundled corpus verses 2.102.20–35 (verses[3708..3723] of chapter-02.json — the ingudi request, the order of walking, Sumantra, the jalanjali facing south, the nivapa of ingudi + badari on darbha, "yad-annaḥ puruṣo bhavati tad-annās tasya devatāḥ", the echo). No episode added. Sarga numbering follows the bundled Southern-recension text; Gita Press numbers it 103 — the external URL points at that sarga.',
    },
  },
  {
    id: 'bhagirath-sagar',
    titleHi: 'भगीरथ और साठ हजार — जल की प्रतीक्षा',
    titleEn: 'Bhagiratha and the sixty thousand — the long wait for water',
    subtitleHi: 'बालकाण्ड — तीन पीढ़ियाँ एक ही प्रश्न पर',
    subtitleEn: 'Bala Kanda — three generations on one question',
    sections: [
      {
        id: 'katha',
        paragraphsHi: [
          'राजा सगर के साठ हजार पुत्र यज्ञ का अश्व खोजते हुए पृथ्वी खोदते चले गए और कपिल मुनि के तप को भंग करने के अपराध में भस्म हो गए। उनका पता लगाने राजा ने अपने पौत्र अंशुमान् को भेजा।',
          'अंशुमान् उस स्थान पर पहुँचे जहाँ उनके चाचा राख के ढेर बने पड़े थे। वे उन्हें जलाञ्जलि देना चाहते थे — पर वहाँ दूर-दूर तक कोई जलाशय नहीं था। तभी उन्हें पक्षिराज गरुड़ दिखाई दिए, जो सगरपुत्रों के मामा थे।',
          'गरुड़ ने कहा — शोक मत करो, और इनके लिए लौकिक जल की अञ्जलि मत दो। हिमालय की ज्येष्ठ पुत्री गंगा हैं; उन्हीं के जल से इनका तर्पण करो। जिस दिन लोकपावनी गंगा इस भस्मराशि को भिगो देंगी, उसी दिन ये सब उत्तम लोक पा जाएँगे।',
          'अंशुमान् लौट आए। सगर तीस हजार वर्ष राज्य कर चुके, पर गंगा को उतारने का कोई उपाय न सूझा। अंशुमान् स्वयं बत्तीस हजार वर्ष तप करके चले गए। उनके पुत्र दिलीप जीवन भर इसी चिन्ता में डूबे रहे — गंगा कैसे उतरे, जलाञ्जलि कैसे हो, पितरों का उद्धार कैसे हो — और उत्तर पाए बिना ही चल बसे।',
          'तब दिलीप के पुत्र भगीरथ ने राज्य मन्त्रियों को सौंपकर गोकर्ण में घोर तप किया। ब्रह्माजी प्रसन्न होकर वर माँगने को कहा, तो उन्होंने अपने लिए कुछ नहीं माँगा: "सगर के सभी पुत्रों को मेरे हाथ से गंगाजी का जल प्राप्त हो; इनकी भस्म गंगाजल से भीग जाए और मेरे प्रपितामहों को अक्षय लोक मिले।"',
          'गंगा उतरीं — शिव की जटाओं से होकर, पृथ्वी पर कल-कल करती हुई। उनका जल जहाँ-जहाँ गया, वहाँ के लोग निष्पाप हुए; और अन्ततः वही जल उस भस्मराशि तक पहुँचा जिसके लिए तीन पीढ़ियाँ प्रतीक्षा करती रही थीं।',
        ],
        paragraphsEn: [
          'King Sagara’s sixty thousand sons, digging through the earth after the sacrificial horse, disturbed the sage Kapila’s penance and were burned to ash. The king sent his grandson Amshuman to find them.',
          'Amshuman reached the place where his uncles lay as heaps of ash. He wished to offer them the jalanjali — but there was no water anywhere in sight. Then he saw Garuda, king of birds, who was uncle to Sagara’s sons.',
          'Garuda said: do not grieve, and do not offer them ordinary water. There is Ganga, eldest daughter of Himavan; perform their tarpana with her water. On the day the world-purifying Ganga wets this ash, every one of them will reach the highest worlds.',
          'Amshuman returned. Sagara ruled thirty thousand years more and never found a way to bring the Ganga down. Amshuman himself performed penance for thirty-two thousand years and departed. His son Dilipa spent his whole life inside the same question — how shall the Ganga descend, how shall the water be offered, how shall my forefathers be freed — and died without an answer.',
          'Then Dilipa’s son Bhagiratha left the kingdom to his ministers and performed severe penance at Gokarna. When Brahma, pleased, offered him a boon, he asked nothing for himself: “May Sagara’s sons receive the water of the Ganga from my hand; may her water wet their ashes, and may my forefathers attain the unending worlds.”',
          'The Ganga came down — through Shiva’s matted hair, and onto the earth with a great roar. Wherever her water went, people were washed clean; and at last that same water reached the ash for which three generations had waited.',
        ],
      },
    ],
    teachingHi:
      'पितरों के लिए किया गया कर्म तुरन्त फल नहीं माँगता — भगीरथ ने वह पूरा किया जो उनके परदादा आरम्भ भी न कर सके थे। और ब्रह्मा से वर माँगने का अवसर मिलने पर उन्होंने अपने लिए कुछ नहीं माँगा।',
    teachingEn:
      'Work done for the ancestors does not ask for a quick result — Bhagiratha finished what his great-grandfather could not even begin. And given a boon by Brahma himself, he asked nothing for his own life.',
    canonHi: 'वाल्मीकि रामायण · बालकाण्ड, सर्ग ३८–४४',
    canonEn: 'Valmiki Ramayana · Bala Kanda, sargas 38–44',
    ref: { kind: 'valmiki', chapter: 1, verseIndex: 1240 },
    status: 'verified',
    source: {
      referenceUrls: [VALMIKI_BALA, VALMIKI_NET_BALA],
      verificationNote:
        '2026-09-19: retelling drawn verse-by-verse from the bundled corpus — 1.38.16/1.38.20 (Asamanja), 1.39.25–1.40.7 (the digging), 1.41.12–13 (the heaps of ash), 1.41.15 (no water for the jalakriya), 1.41.16–20 (Garuda: not laukika water; the Ganga; the ash wetted), 1.41.26 (Sagara rules thirty thousand years and departs), 1.42.4 (Amshuman thirty-two thousand years), 1.42.6–9 (Dilipa dies inside the question), 1.42.11–12 (Gokarna), 1.42.16–19 (the boon asked for the ancestors), 1.43.25–29 (the descent through Shiva, people washed clean). No episode added.',
    },
  },
  {
    id: 'jatayu-antim-sanskar',
    titleHi: 'जटायु का अन्तिम संस्कार — श्रीराम के हाथों',
    titleEn: 'Jatayu’s last rites, by Rama’s own hand',
    subtitleHi: 'अरण्यकाण्ड — जो कुल का नहीं था, उसके लिए पितृ-कर्म',
    subtitleEn: 'Aranya Kanda — the rite for one who was not of the family',
    sections: [
      {
        id: 'katha',
        paragraphsHi: [
          'सीता की खोज में निकले राम और लक्ष्मण को मार्ग में पक्षिराज जटायु मिले — रक्त से लथपथ, पंख कटे, पृथ्वी पर पड़े हुए। रावण को रोकते हुए वे घायल हुए थे। राम ने उन्हें गले से लगा लिया और लक्ष्मण से कहा — ये गृध्रराज मेरे पिता के मित्र थे।',
          'जटायु ने सीता का समाचार दिया और प्राण त्याग दिए। राम ने कहा — लक्ष्मण, सूखी लकड़ियाँ ले आओ; मैं मथकर अग्नि निकालूँगा और मेरे लिए मृत्यु पाने वाले इन पक्षिराज का दाह-संस्कार करूँगा।',
          'उन्होंने जटायु को चिता पर रखा और अपने बन्धु की भाँति उनका संस्कार किया, और यह वचन कहा: "यज्ञ करने वालों को, अग्निहोत्रियों को, युद्ध में पीठ न दिखाने वालों को और भूमिदान करने वालों को जो गति मिलती है — मेरी आज्ञा से तुम भी उन्हीं सर्वोत्तम लोकों में जाओ।"',
          'फिर दोनों भाई वन में गए, वहीं के कन्द-मूल काट लाए, पृथ्वी पर दर्भ बिछाया और उसी से जटायु के लिए पिण्ड बनाकर अर्पित किया। ब्राह्मण जिन पितृ-मन्त्रों का जप बताते हैं, राम ने उनका जप किया।',
          'इसके बाद वे गोदावरी गए और स्नान करके शास्त्रविधि से गृध्रराज के लिए जलाञ्जलि दी। कथा कहती है कि महर्षितुल्य श्रीराम के हाथों संस्कार पाकर जटायु को परम पवित्र गति प्राप्त हुई।',
        ],
        paragraphsEn: [
          'Searching for Sita, Rama and Lakshmana came upon Jatayu, king of birds — drenched in blood, his wings cut away, lying on the earth. He had been wounded trying to stop Ravana. Rama gathered him in his arms and told Lakshmana: this king of vultures was my father’s friend.',
          'Jatayu gave them news of Sita and died. Rama said: Lakshmana, bring dry wood; I will churn out fire and perform the last rites for this king of birds who met his death for my sake.',
          'He laid Jatayu on the pyre and performed the rite as for his own kin, and spoke these words: “Those highest worlds attained by those who perform yajna, who keep the sacred fire, who never turned their back in battle, and who gave away land — by my leave, go you to those same worlds.”',
          'Then the two brothers went into the forest, cut the roots that grew there, spread darbha grass on the ground, and from those roots made and offered a pinda for Jatayu. Rama recited the pitru mantras that the brahmanas prescribe.',
          'After that they went to the Godavari, bathed, and by the method the texts lay down offered the jalanjali for the king of birds. The katha says that, his rites performed by the hands of Rama, Jatayu attained a pure and auspicious course.',
        ],
      },
    ],
    teachingHi:
      'जो न कुल का था, न मनुष्य — उसके लिए भी राम ने वही किया जो पिता के लिए किया था, और वन में जो मिला वही अर्पित किया। स्मरण का अधिकार बन्धन से आता है, और अर्पण उसी से होता है जो पास है।',
    teachingEn:
      'For one who was neither of his line nor even human, Rama did exactly what he had done for his father, offering what the forest had to give. The claim to be remembered comes from the bond, and the offering is made from whatever is at hand.',
    canonHi: 'वाल्मीकि रामायण · अरण्यकाण्ड, सर्ग ६७–६८',
    canonEn: 'Valmiki Ramayana · Aranya Kanda, sargas 67–68',
    ref: { kind: 'valmiki', chapter: 3, verseIndex: 2188 },
    status: 'verified',
    source: {
      referenceUrls: [VALMIKI_ARANYA, VALMIKI_NET_ARANYA],
      verificationNote:
        '2026-09-19: retelling drawn verse-by-verse from the bundled corpus — 3.67.9–10 (found bloodied on the ground), 3.67.14 (he speaks), 3.67.21–22 (Rama embraces him), 3.67.27 ("my father\u2019s friend"), 3.68.27–28 (bring wood, churn fire, the pyre), 3.68.29–30 (the gati verse, quoted), 3.68.31 (cremated as a kinsman), 3.68.32–33 (forest roots, darbha spread, the pinda), 3.68.34 (the pitru mantras), 3.68.35–36 (Godavari, jalanjali by the shastric method), 3.68.37 (the pure gati). No episode added.',
    },
  },
  {
    id: 'bharat-dwadashah',
    titleHi: 'भरत का द्वादशाह — शोक के बीच श्राद्ध',
    titleEn: 'Bharata’s twelfth day — shraddha in the midst of grief',
    subtitleHi: 'अयोध्याकाण्ड — दशरथ के लिए ग्यारहवाँ, बारहवाँ और तेरहवाँ दिन',
    subtitleEn: 'Ayodhya Kanda — the eleventh, twelfth and thirteenth days for Dasharatha',
    sections: [
      {
        id: 'katha',
        paragraphsHi: [
          'महाराज दशरथ के दाह-संस्कार के बाद दस दिन का शोक-काल बीता। ग्यारहवें दिन राजकुमार भरत ने शुद्धि के लिए स्नान किया और एकादशाह श्राद्ध किया; बारहवाँ दिन आने पर उन्होंने शेष श्राद्ध-कर्म कराए।',
          'उस श्राद्ध में भरत ने ब्राह्मणों को धन, रत्न, प्रचुर अन्न, बहुमूल्य वस्त्र, बकरे, चाँदी और बहुत-सी गौएँ दीं — और राजा के पारलौकिक हित के लिए दास-दासियाँ, सवारियाँ और बड़े-बड़े घर भी।',
          'तेरहवें दिन प्रातः वे अस्थि-संचय के लिए पिता के चिता-स्थान पर आए। भस्म से भरा, दाह से लाल वह मण्डल और उसमें बिखरी जली हड्डियाँ देखकर उनका गला भर आया — "तात! जिन बड़े भाई के हाथ आपने मुझे सौंपा था, वे वन में हैं; अनाथ हुई माता कौसल्या को छोड़कर आप कहाँ चले गए?" — और वे इन्द्र के गिरे हुए ध्वज की तरह पृथ्वी पर गिर पड़े। मन्त्री दौड़कर उनके पास आए। शत्रुघ्न भी पिता का स्मरण करते हुए अचेत हो गए, और विलाप करते रहे — "जो हमें अपनी रुचि का भोजन, वस्त्र और आभूषण चुनने को कहते थे, अब वह कौन करेगा?"',
          'तब कुलपुरोहित वसिष्ठ ने भरत को उठाया और कहा — दाह का यह तेरहवाँ दिन है; अस्थि-संचय का जो कार्य शेष है, उसमें विलम्ब क्यों? भूख-प्यास, शोक-मोह और जरा-मृत्यु — ये तीन जोड़े सभी प्राणियों में समान हैं और इन्हें रोका नहीं जा सकता। सुमन्त्र ने शत्रुघ्न को उठाया और जन्म-मरण की अनिवार्यता समझाई।',
          'दोनों भाई उठे — वर्षा और धूप से मलिन हुए दो इन्द्रध्वजों के समान — आँसू पोंछते हुए। और मन्त्रियों ने उन्हें शेष क्रियाएँ शीघ्र पूरी करने को प्रेरित किया।',
        ],
        paragraphsEn: [
          'After King Dasharatha’s cremation the ten days of mourning passed. On the eleventh day prince Bharata bathed for purification and performed the ekadashaha shraddha; when the twelfth day came he had the remaining shraddha rites performed.',
          'In that shraddha Bharata gave the brahmanas wealth, gems, grain in abundance, costly garments, goats, silver and many cows — and, for the king’s good in the world beyond, servants, conveyances and spacious houses as well.',
          'On the morning of the thirteenth day he came to his father’s pyre to gather the bones. Seeing the circle of ash, reddened by the burning, with the charred bones scattered in it, his voice broke — “Father, the elder brother into whose hands you gave me is in the forest; where have you gone, leaving mother Kausalya without a protector?” — and he fell to the earth like a flagstaff of Indra toppling as it is raised. The ministers ran to him. Shatrughna too fell senseless remembering their father, and lamented — “He who would bid us choose the food, the clothes and the ornaments we liked — who will do that now?”',
          'Then Vasishtha, the family priest, raised Bharata and said: this is the thirteenth day since the cremation; the gathering of the bones remains — why the delay? Hunger and thirst, grief and delusion, old age and death — these three pairs come to every being alike and cannot be held back. Sumantra raised Shatrughna and spoke to him of the inevitability of birth and death.',
          'The two brothers rose — like two banners of Indra faded by rain and sun — wiping their tears. And the ministers urged them on to complete the rites that remained.',
        ],
      },
    ],
    teachingHi:
      'श्राद्ध का क्रम शोक को रोकता नहीं — भरत चिता-स्थान पर गिर पड़े। पर उसी क्रम ने, और वसिष्ठ जैसे बड़ों ने, उन्हें उठाया और आगे का कार्य दिखाया। परम्परा में ग्यारहवें, बारहवें, तेरहवें दिन के कर्म शोक के बीच चलने का सहारा हैं।',
    teachingEn:
      'The sequence of shraddha does not stop grief — Bharata collapsed at the pyre. But that same sequence, and elders like Vasishtha, lifted him and showed him the next thing to do. In the tradition the rites of the eleventh, twelfth and thirteenth days are what carries a mourner through.',
    canonHi: 'वाल्मीकि रामायण · अयोध्याकाण्ड, सर्ग ७७',
    canonEn: 'Valmiki Ramayana · Ayodhya Kanda, sarga 77',
    ref: { kind: 'valmiki', chapter: 2, verseIndex: 2958 },
    status: 'verified',
    source: {
      referenceUrls: [VALMIKI_CORPUS, VALMIKI_NET_AYODHYA_77],
      verificationNote:
        '2026-09-21: retelling drawn verse-by-verse from the bundled corpus — 2.77.1 (verses[2958] of chapter-02.json: ten days, purification on the eleventh, shraddha rites on the twelfth; the Gita Press Hindi names the ekadashaha, masika and sapindikarana), 2.77.2–3 (the gifts to brahmanas, "for the king’s other-worldly good"), 2.77.4–9 (the thirteenth dawn, asthi-sanchaya, the ash circle and burnt bones, the lament to the father and for Kausalya, the fall like Indra’s flagstaff), 2.77.10–12 (ministers; Shatrughna falls), 2.77.15 (who will bid us choose food, clothes, ornaments), 2.77.21–23 (Vasishtha raises him: thirteenth day, the remaining rite, the three pairs), 2.77.24 (Sumantra), 2.77.25–26 (they rise like faded banners; the ministers hasten the remaining rites). Shatrughna’s Manthara/Kaikeyi outburst and his fire/tapovan vow (13, 17–18) are deliberately left out — grief speech, not the rite. Bundled Hindi 2.77.5–6 carries one Gita Press prose block for both verses (corpus note). The external URL follows the bundled Southern-recension sarga number and could not be opened this session (egress policy) — the reviewer opens it and confirms the numbering, as the sarga-102/103 note above records for that katha.',
    },
  },
  {
    id: 'karna-mahalaya',
    titleHi: 'कर्ण और पितृ पक्ष के सोलह दिन',
    titleEn: 'Karna and the sixteen days',
    subtitleHi: 'लोक-कथा — पक्ष के आरम्भ की प्रचलित कथा',
    subtitleEn: 'A folk katha — the popular story of the paksha’s origin',
    sections: [
      {
        id: 'katha',
        paragraphsHi: [
          'कथा कहती है कि कुरुक्षेत्र में देह त्यागने के बाद दानवीर कर्ण स्वर्ग पहुँचे, तो वहाँ भोजन के स्थान पर उन्हें सोना और रत्न ही परोसे गए। कर्ण ने कारण पूछा। उत्तर मिला — जीवन भर आपने सोना ही दान किया, अन्न नहीं; और अपने पितरों को कभी जल-अन्न अर्पित नहीं किया, क्योंकि आप उन्हें जानते ही नहीं थे।',
          'कर्ण ने कहा कि यह उनका अज्ञान था, अपराध नहीं। तब उन्हें सोलह दिन के लिए पृथ्वी पर लौटने की अनुमति मिली, ताकि वे अपने पितरों का स्मरण कर उन्हें अन्न-जल अर्पित कर सकें। वही सोलह दिन, कथा के अनुसार, पितृ पक्ष कहलाए।',
        ],
        paragraphsEn: [
          'The story goes that when Karna, the great giver, reached the heavens after Kurukshetra, he was served gold and jewels in place of food. He asked why. The answer: all your life you gave gold, never food — and you never offered water or food to your own ancestors, for you did not know who they were.',
          'Karna replied that this was ignorance, not fault. He was then allowed to return to the earth for sixteen days, to remember his forebears and offer them food and water. Those sixteen days, the katha says, became Pitru Paksha.',
        ],
      },
    ],
    teachingHi:
      'पितरों का स्मरण अन्न-जल का ही भाव है — सोने का नहीं। और जो अपने पितरों को न जानता हो, उसके लिए भी सर्वपितृ अमावस्या का द्वार खुला है।',
    teachingEn:
      'Remembering the ancestors is a matter of food and water — not gold. And for one who does not know their forebears, the door of Sarvapitri Amavasya still stands open.',
    canonHi: 'लोक-परम्परा — महाभारत के मूल पाठ में नहीं',
    canonEn: 'Folk tradition — not in the Mahabharata’s critical text',
    status: 'draft',
    source: {
      referenceUrls: ['https://www.drikpanchang.com/shraddha/pitru-paksha-shraddha-dates.html'],
      verificationNote:
        '2026-09-19: DRAFT — NOT VERIFIED. Widely told; provenance is popular tradition, not the critical Mahabharata (the Karna–Indra kavach episode in data/daan/kathas.ts is a different, canonical story). Before flipping: record two published tellings that agree on the gold-not-food and the sixteen-day return, and keep the "folk katha" label on the rendered canon line.',
    },
  },
];

export function getPitruKathas(): readonly PitruKathaEntry[] {
  return PITRU_KATHA_ENTRIES.filter((entry) => entry.status === 'verified');
}

export function getPitruKatha(id: string): PitruKathaEntry | null {
  return getPitruKathas().find((entry) => entry.id === id) ?? null;
}
