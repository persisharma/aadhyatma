# Kids story listing — short descriptions (draft)

Draft one-line descriptions for the story-shelf cards (`KidsStoryDeityScreen`), replacing the current 2–3 line `description` text. Not yet applied to `mobile/src/data/kidsStories/*.json`.

- **Fit:** every line measured at 12px in the app fonts (Noto Serif Devanagari / Gujarati / Kannada 500, Cormorant Garamond 500). Widest is 147px; the text column on a 360dp phone is 148px, so nothing is cut off.
- **Introductions** (Navaratri, Kushmanda, Kalaratri, Siddhidatri) keep परिचय / "Meet" / "introduced" in the line itself, replacing the separate कथा/परिचय label.
- **Mahagauri** keeps "related" (संबंधित) because its current description deliberately calls it a related Gauri story; dropping the word would overstate it.
- **Review needed:** Gujarati and Kannada lines are machine-drafted and need a native-speaker pass before they ship.

| Story | Kind | हिन्दी | English | ગુજરાતી | ಕನ್ನಡ | Current हिन्दी |
|---|---|---|---|---|---|---|
| `durga-navaratri` | introduction | नवदुर्गा का परिचय | Meet the nine forms | નવદુર્ગાનો પરિચય | ನವದುರ್ಗೆಯ ಪರಿಚಯ | नवदुर्गा से परिचय और नौ दिनों के चित्र-पाठ। |
| `durga-shailaputri` | story | पार्वती का जन्म और बचपन | Parvati’s birth and childhood | પાર્વતીનો જન્મ અને બાળપણ | ಪಾರ್ವತಿಯ ಜನನ ಮತ್ತು ಬಾಲ್ಯ | पर्वत के परिवार में पार्वती के जन्म और बचपन की कथा। |
| `durga-brahmacharini` | story | पार्वती की तपस्या और भक्ति | Parvati’s tapas and devotion | પાર્વતીની તપસ્યા અને ભક્તિ | ಪಾರ್ವತಿಯ ತಪಸ್ಸು ಮತ್ತು ಭಕ್ತಿ | पार्वती की दीर्घ तपस्या, वन की देखभाल और अडिग भक्ति। |
| `durga-chandraghanta` | story | शिव संग विवाह का उत्सव | A wedding and a celebration | શિવ સાથે લગ્નનો ઉત્સવ | ಶಿವನೊಂದಿಗೆ ವಿವಾಹದ ಸಂಭ್ರಮ | शिव-पार्वती का विवाह और परिवार का उत्सव। |
| `durga-kushmanda` | introduction | तेजस्वी रूप का परिचय | Meet the radiant form | તેજસ્વી રૂપનો પરિચય | ತೇಜಸ್ವಿ ರೂಪದ ಪರಿಚಯ | नवरात्रि के चौथे दिन पूजित तेजस्वी रूप का परिचय। |
| `durga-skandamata` | story | बेटे और पालक माताओं का स्वागत | Welcoming his foster mothers | પુત્ર અને પાલક માતાઓનું સ્વાગત | ಸಾಕುತಾಯಂದಿರ ಸ್ವಾಗತ | पार्वती ने कार्तिकेय और उनकी देखभाल करने वाली माताओं का स्वागत किया। |
| `durga-kalaratri` | introduction | अभय देने वाले रूप का परिचय | Meet the reassuring form | અભય આપતા રૂપનો પરિચય | ಅಭಯ ರೂಪದ ಪರಿಚಯ | सातवें दिन पूजित शक्तिशाली और अभय देने वाले रूप का परिचय। |
| `durga-mahagauri` | story | करुणा की संबंधित गौरी-कथा | A related tale of compassion | કરુણાની સંબંધિત ગૌરીકથા | ಕರುಣೆಯ ಸಂಬಂಧಿತ ಗೌರಿ ಕಥೆ | करुणा, परिवर्तन और नए रक्षक की संबंधित गौरी-कथा। |
| `durga-siddhidatri` | introduction | शिव-शक्ति परंपरा का परिचय | Shiva–Shakti, introduced | શિવ-શક્તિ પરંપરાનો પરિચય | ಶಿವ-ಶಕ್ತಿ ಸಂಪ್ರದಾಯದ ಪರಿಚಯ | नवदुर्गा के नौवें रूप और शिव-शक्ति की परंपरा का परिचय। |
| `durga-mahishasura` | story | महिषासुर के अत्याचार का अंत | Mahishasura’s rule ends | મહિષાસુરના અત્યાચારનો અંત | ಮಹಿಷಾಸುರನ ದೌರ್ಜನ್ಯದ ಅಂತ್ಯ | देवता सहायता माँगते हैं और माँ दुर्गा महिषासुर का अत्याचार समाप्त करती हैं। |
| `durga-raktabeej` | story | बढ़ती सेना के विरुद्ध एकजुट | Together, they stop an army | વધતી સેના સામે એકજૂટ | ಒಗ್ಗಟ್ಟಿನ ಹೋರಾಟ | बार-बार बढ़ती सेना को रोकने के लिए दुर्गा और काली/चामुंडा साथ कार्य करती हैं। |
| `durga-shakambhari` | story | जल, अन्न और ज्ञान का वरदान | Water, food and knowledge | જળ, અન્ન અને જ્ઞાનનું વરદાન | ನೀರು, ಆಹಾರ ಮತ್ತು ಜ್ಞಾನದ ವರ | माँ जल-अन्न देती हैं, संकट में रक्षा करती हैं और पवित्र ज्ञान लौटाती हैं। |
| `durga-shumbha-nishumbha` | story | दबाव ठुकराकर शांति की वापसी | She refuses force, brings peace | દબાણ ઠુકરાવી શાંતિની વાપસી | ಶಾಂತಿಯನ್ನು ಮರಳಿಸಿದ ದೇವಿ | देवी बलपूर्वक दबाव नहीं मानतीं, अपनी शक्तियों के साथ शांति लौटाती हैं। |
| `durga-suratha-samadhi` | story | राजा, व्यापारी और दो अलग वर | A king, a merchant, two boons | રાજા, વેપારી અને બે જુદા વર | ರಾಜ, ವ್ಯಾಪಾರಿ, ಎರಡು ವರ | राजा और व्यापारी अपने मन का लगाव समझते हैं और देवी से अलग वर माँगते हैं। |
| `ganesha-birth` | story | प्रिय पुत्र और नया आरंभ | A beloved son, a fresh start | વહાલો પુત્ર અને નવો આરંભ | ಪ್ರೀತಿಯ ಮಗ, ಹೊಸ ಆರಂಭ | पार्वती के प्रिय पुत्र के जन्म और नए आरंभ की कथा। |
| `ganesha-mahabharata` | story | महाभारत का लेखन और समझ | Composing the Mahabharata | મહાભારતનું લેખન અને સમજ | ಮಹಾಭಾರತದ ಬರವಣಿಗೆ | महाभारत के लेखन की परंपरा में सुनने और समझने का महत्व। |
| `ganesha-moon` | story | अभिमान, पछतावा और क्षमा | Pride, remorse and mercy | અભિમાન, પસ્તાવો અને ક્ષમા | ಅಹಂಕಾರ, ಪಶ್ಚಾತ್ತಾಪ ಮತ್ತು ಕ್ಷಮೆ | अभिमान, भूल स्वीकार करने और क्षमा की एक पारंपरिक कथा। |
| `ganesha-parikrama` | story | माता-पिता के सम्मान में उत्तर | An answer rooted in respect | માતા-પિતાના આદરમાં ઉત્તર | ತಂದೆತಾಯಿಯ ಗೌರವದಲ್ಲಿ ಉತ್ತರ | एक चुनौती और माता-पिता के सम्मान में छिपा उत्तर। |
| `hanuman-ocean` | story | सीता की खोज में साहस | Courage on the search for Sita | સીતાની શોધમાં હિંમત | ಸೀತೆಯ ಹುಡುಕಾಟದಲ್ಲಿ ಧೈರ್ಯ | सीता की खोज में साहस, विनम्रता और सूझबूझ की यात्रा। |
| `hanuman-sanjeevani` | story | लक्ष्मण के लिए त्वरित यात्रा | A race to heal Lakshmana | લક્ષ્મણ માટે ઝડપી યાત્રા | ಲಕ್ಷ್ಮಣನಿಗಾಗಿ ತುರ್ತು ಪಯಣ | लक्ष्मण के लिए हनुमान का प्रयास और वैद्य सुषेण की सहायता। |
| `hanuman-sita` | story | अशोक वाटिका में आशा का संदेश | Hope in Ashoka Grove | અશોકવાટિકામાં આશાનો સંદેશ | ಅಶೋಕವನದಲ್ಲಿ ಭರವಸೆ | अशोक वाटिका में विश्वास, राम की अँगूठी और आशा का संदेश। |
| `hanuman-sun` | story | नन्हे हनुमान की अद्भुत उड़ान | Little Hanuman takes flight | નાનકડા હનુમાનની અદ્ભુત ઉડાન | ಪುಟ್ಟ ಹನುಮಂತನ ಹಾರಾಟ | नन्हे हनुमान की अद्भुत उड़ान और देवताओं के आशीर्वाद। |
| `kaliya-nag` | story | यमुना में साहस और क्षमा | Courage and forgiveness | યમુનામાં સાહસ અને ક્ષમા | ಧೈರ್ಯ ಮತ್ತು ಕ್ಷಮೆ | यमुना में साहस, विनम्रता और क्षमा की कथा। |
| `krishna-govardhan` | story | तूफ़ान में गोकुल को आश्रय | Shelter from the storm | તોફાનમાં ગોકુળને આશ્રય | ಬಿರುಗಾಳಿಯಲ್ಲಿ ಆಶ್ರಯ | तूफ़ान में गोकुल को आश्रय देने वाले कृष्ण की कथा। |
| `krishna-janma` | story | कठिन रात में साहस और आशा | Courage and hope, one night | કઠિન રાતમાં સાહસ અને આશા | ಕಷ್ಟದ ರಾತ್ರಿಯಲ್ಲಿ ಧೈರ್ಯ, ಭರವಸೆ | एक कठिन रात में साहस, प्रेम और आशा की कहानी। |
| `krishna-makhan-chori` | story | गोकुल में बाल कृष्ण की शरारतें | Playful plans in Gokul | ગોકુળમાં બાળ કૃષ્ણની મસ્તી | ಬಾಲಕೃಷ್ಣನ ತುಂಟಾಟ | गोकुल की गलियों में बाल कृष्ण की शरारतों और सबके स्नेह की कथा। |
| `krishna-sudama` | story | एक पोटली और गहरी मित्रता | A gift of rice, a true friend | ચોખાની પોટલી અને અતૂટ મિત્રતા | ಅವಲಕ್ಕಿ, ಅಳಿಯದ ಸ್ನೇಹ | एक छोटी पोटली और समय से भी गहरी मित्रता। |
| `putana` | story | नन्हे कृष्ण की रक्षा और करुणा | Danger, protection and mercy | નાનકડા કૃષ્ણની રક્ષા અને કરુણા | ಪುಟ್ಟ ಕೃಷ್ಣನ ರಕ್ಷಣೆ ಮತ್ತು ಕರುಣೆ | नन्हे कृष्ण की रक्षा और प्रभु की करुणा की कथा। |
