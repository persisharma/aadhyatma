# Complete Saptashati chapter text: 18 November 2026

This extends the same PR #702 from its former opening-only collection to all thirteen chapters. The earlier four-part delivery was incomplete relative to the requested scope; it was not an established provenance blocker for the remaining ancient Sanskrit chapters.

## Exact coverage and editorial basis

Chapter counts: **104, 69, 44, 42, 129, 24, 27, 63, 41, 32, 55, 41, 29 = 700** traditional numbered text units. Speaker announcements, half-verses and the short repeated salutations are counted, so this is not a claim of 700 full metrical shlokas. Full Kavach (56), Argala (27) and Kilak (14) remain separate preliminaries: 797 units in the collection. Chapters 2–13 add 596 units. Across this PR there are now twenty new payloads and 888 units, plus Vishnu's separate 79-unit extension.

Underlying ancient Sanskrit was collated end-to-end between [Drik Panchang](https://www.drikpanchang.com/lyrics/durga-saptashati/chapters/second-chapter/durga-saptashati-second-chapter.html) (chapter-specific URLs are in every payload) and [Baba Rampuri's complete text](https://rampuri.com/durga-saptashati-text/). This reuses the ancient composition, not publisher translations, page layout or recordings. Hindi and English meanings were written anew for every unit. Romanization is generated from the selected Sanskrit using the existing reader's diacritic/digraph convention and checked for line parity and leftover Devanagari. This does not claim specialist oral-recitation certification or new Gujarati/Kannada translations: those views use the existing script/fallback contract.

Drik's complete numbered text was retrieved through the web tool; direct Python requests returned 403 and were not treated as missing chapters. Rampuri's HTML was available. Every unit of chapters 2–7 was parsed, compared after whitespace/danda normalization, and read while writing meanings. Chapter 5's grouped ranges were expanded for comparison against all 129 numbered units. Chapters 8–13 have their complete separate comparison in [the companion report](saptashati-chapters-8-13-sources.md). Chapter 1 is preserved unchanged; its previous report remains applicable.

Unnumbered dhyana, nyasa, viniyoga, optional bija framing and prose colophons are outside the numbered chapter payloads. The collection is complete chapter text with its three named preliminary readings, not a complete ritual manual. Audio remains deferred.

## Source choices, chapters 2–7

Drik is the base reading at the differences below, except the stated typography corrections. Removed its chapter 3 opening typo ऋषिररुवाच → ऋषिरुवाच (Rampuri); chapter 3.15 युद्ध्यमानौ → युध्यमानौ (Rampuri); chapter 7.20 split महासिं हं → महासिंहं (Rampuri). Removed publisher hyphens within Sanskrit words by joining only the affected adjacent lines in chapter 4. Removed optional closing ह्रीं ॐ from chapter 4.42. These changes do not add/remove numbered units.

At 7.20, महासिंहं is rendered as the great lion, not an unverified roar. The [Śabdakalpadruma dictionary entry](https://sa.wiktionary.org/wiki/महासिंह) explicitly defines it as the Goddess's lion mount and cites this exact line. This is a dictionary transcription, not inspection of a historical scan. At 2.42–44, retain the traditional large-number expressions niyuta and ayuta-ayuta where edition conventions are uncertain instead of inventing a conversion. The explicit 1,000 ayutas for Mahahanu and 600 ayutas for Bashkala are rendered as ten million and six million respectively.

Chapter 5 has 22 three-unit salutation groups (14–76 and 78–80). The opening unit has the invocation and first salutation, the next only नमस्तस्यै, and the third नमस्तस्यै नमो नमः. The app does not duplicate the entire stanza three times. Repeated short meanings correspond to genuine repeated text.

The following full-text differences preserve the evidence, including orthographic/sandhi differences and optional extra lines; they are not all substantive recension differences.

### Chapter 2

| Unit | Drik base | Rampuri witness |
|---|---|---|
| 19 | ततः समस्तदेवानां तेजोराशिसमुद्भवाम्। तां विलोक्य मुदं प्रापुरमरा महिषार्दिताः॥ | ततः समस्तदेवानां तेजोराशिसमुद्भवाम् । तां विलोक्य मुदं प्रापुरमरा महिषार्दिताः । ततो देवा ददुस्तस्यै स्वानि स्वान्यायुधानि च |
| 24 | समस्तरोमकूपेषु निजरश्मीन् दिवाकरः। कालश्च दत्तवान् खड्गं तस्याश्चर्म च निर्मलम्॥ | समस्तरोमकूपेषु निजरश्मीन् दिवाकरः । कालश्च दत्तवान् खड्गं तस्यै चर्म च निर्मलम् |
| 35 | तुष्टुवुर्मुनयश्चैनां भक्तिनम्रात्ममूर्तयः। दृष्ट्वा समस्तं संक्षुब्धं त्रैलोक्यममरारयः॥ | तुष्टुवुर्मुनयश्चैनां भक्तिनम्रात्ममूर्तयः । दृष्ट्वा समस्तं सङ्क्षुब्धं त्रैलोक्यममरारयः |
| 51 | मुमोचासुरदेहेषु शस्त्राण्यस्त्राणि चेश्वरी। सोऽपि क्रुद्धो धुतसटो देव्या वाहनकेशरी॥ | मुमोचासुरदेहेषु शस्त्राण्यस्त्राणि चेश्वरी । सोऽपि क्रुद्धो धुतसटो देव्या वाहनकेसरी |
| 69 | देव्या गणैश्च तैस्तत्र कृतं युद्धं महासुरैः। यथैषां तुतुषुर्देवाः पुष्पवृष्टिमुचो दिवि॥ | देव्या गणैश्च तैस्तत्र कृतं युद्धं तथासुरैः । यथैषां तुतुषुर्देवाः पुष्पवृष्टिमुचो दिवि |

### Chapter 3

| Unit | Drik base | Rampuri witness |
|---|---|---|
| 4 | तस्यच्छित्त्वा ततो देवी लीलयैव शरोत्करान्। जघान तुरगान् बाणैर्यन्तारं चैव वाजिनाम्॥ | तस्य छित्वा ततो देवी लीलयैव शरोत्करान् । जघान तुरगान्बाणैर्यन्तारं चैव वाजिनाम् |
| 10 | दृष्ट्वा तदापतच्छूलं देवी शूलममुञ्चत। तच्छूलं शतधा तेन नीतं स च महासुरः॥ | दृष्ट्वा तदापतच्छूलं देवी शूलममुञ्चत । तेन तच्छतधा नीतं शूलं स च महासुरः |
| 12 | सोऽपि शक्तिं मुमोचाथ देव्यास्तामम्बिका द्रुतम्। हुंकाराभिहतां भूमौ पातयामास निष्प्रभाम्॥ | सोऽपि शक्तिं मुमोचाथ देव्यास्तामम्बिका द्रुतम् । हुङ्काराभिहतां भूमौ पातयामास निष्प्रभाम् |
| 15 | युद्ध्यमानौ ततस्तौ तु तस्मान्नागान्महीं गतौ। युयुधातेऽतिसंरब्धौ प्रहारैरतिदारुणैः॥ | युध्यमानौ ततस्तौ तु तस्मान्नागान्महीं गतौ । युयुधातेऽतिसंरब्धौ प्रहारैरतिदारुणैः |
| 21 | एवं संक्षीयमाणे तु स्वसैन्ये महिषासुरः। माहिषेण स्वरूपेण त्रासयामास तान् गणान्॥ | एवं सङ्क्षीयमाणे तु स्वसैन्ये महिषासुरः । माहिषेण स्वरूपेण त्रासयामास तान् गणान् |
| 22 | कांश्चित्तुण्डप्रहारेण खुरक्षेपैस्तथापरान्। लाङ्गूलताडितांश्चान्याञ्छृङ्गाभ्यां च विदारितान्॥ | कांश्चित्तुण्डप्रहारेण खुरक्षेपैस्तथापरान् । लाङ्गूलताडितांश्चान्यान् शृङ्गाभ्यां च विदारितान् |
| 40 | एवमुक्त्वा समुत्पत्य साऽऽरूढा तं महासुरम्। पादेनाक्रम्य कण्ठे च शूलेनैनमताडयत्॥ | एवमुक्त्वा समुत्पत्य सारूढा तं महासुरम् । पादेनाक्रम्य कण्ठे च शूलेनैनमताडयत् |
| 41 | ततः सोऽपि पदाऽऽक्रान्तस्तया निजमुखात्ततः। अर्धनिष्क्रान्त एवासीद् देव्या वीर्येण संवृतः॥ | ततः सोऽपि पदाक्रान्तस्तया निजमुखात्तदा । अर्धनिष्क्रान्त एवासीद्देव्या वीर्येण संवृतः |

### Chapter 4

| Unit | Drik base | Rampuri witness |
|---|---|---|
| 3 | देव्या यया ततमिदं जगदात्मशक्त्या निश्शेषदेवगणशक्तिसमूहमूर्त्या। तामम्बिकामखिलदेवमहर्षिपूज्यां भक्त्या नताः स्म विदधातु शुभानि सा नः॥ | देव्या यया ततमिदं जगदात्मशक्त्या निःशेषदेवगणशक्तिसमूहमूर्त्या । तामम्बिकामखिलदेवमहर्षिपूज्यां भक्त्या नताः स्म विदधातु शुभानि सा नः |
| 6 | किं वर्णयाम तव रूपमचिन्त्यमेतत् किं चातिवीर्यमसुरक्षयकारि भूरि। किं चाहवेषु चरितानि तवाद्भुतानि सर्वेषु देव्यसुरदेवगणादिकेषु॥ | किं वर्णयाम तव रूपमचिन्त्यमेतत् किञ्चातिवीर्यमसुरक्षयकारि भूरि । किं चाहवेषु चरितानि तवाति यानि सर्वेषु देव्यसुरदेवगणादिकेषु |
| 7 | हेतुः समस्तजगतां त्रिगुणापि दोषैर्न ज्ञायसे हरिहरादिभिरप्यपारा। सर्वाश्रयाखिलमिदं जगदंशभूत- मव्याकृता हि परमा प्रकृतिस्त्वमाद्या॥ | हेतुः समस्तजगतां त्रिगुणापि दोषै- र्न ज्ञायसे हरिहरादिभिरप्यपारा । सर्वाश्रयाखिलमिदं जगदंशभूत- मव्याकृता हि परमा प्रकृतिस्त्वमाद्या |
| 9 | या मुक्तिहेतुरविचिन्त्यमहाव्रता त्व- मभ्यस्यसे सुनियतेन्द्रियतत्त्वसारैः। मोक्षार्थिभिर्मुनिभिरस्तसमस्तदोषै- र्विद्यासि सा भगवती परमा हि देवि॥ | या मुक्तिहेतुरविचिन्त्यमहाव्रता त्वं अभ्यस्यसे सुनियतेन्द्रियतत्त्वसारैः । मोक्षार्थिभिर्मुनिभिरस्तसमस्तदोषै- र्विद्यासि सा भगवती परमा हि देवि |
| 10 | शब्दात्मिका सुविमलर्ग्यजुषां निधान- मुद्गीथरम्यपदपाठवतां च साम्नाम्। देवी त्रयी भगवती भवभावनाय वार्ता च सर्वजगतां परमार्तिहन्त्री॥ | शब्दात्मिका सुविमलर्ग्यजुषां निधान- मुद्गीथरम्यपदपाठवतां च साम्नाम् । देवी त्रयी भगवती भवभावनाय वार्तासि सर्वजगतां परमार्तिहन्त्री |
| 15 | ते सम्मता जनपदेषु धनानि तेषां तेषां यशांसि न च सीदति धर्मवर्गः। धन्यास्त एव निभृतात्मजभृत्यदारा येषां सदाभ्युदयदा भवती प्रसन्ना॥ | ते सम्मता जनपदेषु धनानि तेषां तेषां यशांसि न च सीदति बन्धुवर्गः । धन्यास्त एव निभृतात्मजभृत्यदारा येषां सदाभ्युदयदा भवती प्रसन्ना |
| 17 | दुर्गे स्मृता हरसि भीतिमशेषजन्तोः स्वस्थैः स्मृता मतिमतीव शुभां ददासि। दारिद्र्यदुःखभयहारिणि का त्वदन्या सर्वोपकारकरणाय सदाऽऽर्द्रचित्ता॥ | दुर्गे स्मृता हरसि भीतिमशेषजन्तोः स्वस्थैः स्मृता मतिमतीव शुभां ददासि । दारिद्र्यदुःखभयहारिणि का त्वदन्या सर्वोपकारकरणाय सदार्द्रचित्ता |
| 19 | दृष्ट्वैव किं न भवती प्रकरोति भस्म सर्वासुरानरिषु यत्प्रहिणोषि शस्त्रम्। लोकान् प्रयान्तु रिपवोऽपि हि शस्त्रपूता इत्थं मतिर्भवति तेष्वपि तेऽतिसाध्वी॥ | दृष्ट्वैव किं न भवती प्रकरोति भस्म सर्वासुरानरिषु यत्प्रहिणोषि शस्त्रम् । लोकान्प्रयान्तु रिपवोऽपि हि शस्त्रपूता इत्थं मतिर्भवति तेष्वहितेषु साध्वी |
| 23 | त्रैलोक्यमेतदखिलं रिपुनाशनेन त्रातं त्वया समरमूर्धनि तेऽपि हत्वा। नीता दिवं रिपुगणा भयमप्यपास्त- मस्माकमुन्मदसुरारिभवं नमस्ते॥ | त्रैलोक्यमेतदखिलं रिपुनाशनेन त्रातं त्वया समरमूर्धनि तेऽपि हत्वा । नीता दिवं रिपुगणा भयमप्यपास्तम् अस्माकमुन्मदसुरारिभवं नमस्ते |
| 26 | सौम्यानि यानि रूपाणि त्रैलोक्ये विचरन्ति ते। यानि चात्यर्थघोराणि तै रक्षास्मांस्तथा भुवम्॥ | सौम्यानि यानि रूपाणि त्रैलोक्ये विचरन्ति ते । यानि चात्यन्तघोराणि तै रक्षास्मांस्तथा भुवम् |
| 30 | भक्त्या समस्तैस्त्रिदशैर्दिव्यैर्धूपैस्तु धूपिता। प्राह प्रसादसुमुखी समस्तान् प्रणतान् सुरान्॥ | भक्त्या समस्तैस्त्रिदशैर्दिव्यैर्धूपैः सुधूपिता । प्राह प्रसादसुमुखी समस्तान् प्रणतान् सुरान् |
| 39 | इति प्रसादिता देवैर्जगतोऽर्थे तथाऽऽत्मनः। तथेत्युक्त्वा भद्रकाली बभूवान्तर्हिता नृप॥ | इति प्रसादिता देवैर्जगतोऽर्थे तथात्मनः । तथेत्युक्त्वा भद्रकाली बभूवान्तर्हिता नृप |
| 42 | रक्षणाय च लोकानां देवानामुपकारिणी। तच्छृणुष्व मयाऽऽख्यातं यथावत्कथयामि ते ॥ह्रीं ॐ॥ | रक्षणाय च लोकानां देवानामुपकारिणी । तच्छृणुष्व मयाख्यातं यथावत्कथयामि ते |

### Chapter 5

| Unit | Drik base | Rampuri witness |
|---|---|---|
| 6-6 | तयास्माकं वरो दत्तो यथाऽऽपत्सु स्मृताखिलाः। भवतां नाशयिष्यामि तत्क्षणात्परमापदः॥ | तयास्माकं वरो दत्तो यथापत्सु स्मृताखिलाः । भवतां नाशयिष्यामि तत्क्षणात्परमापदः |
| 11-11 | कल्याण्यै प्रणतां वृद्ध्यै सिद्ध्यै कुर्मो नमो नमः। नैर्ऋत्यै भूभृतां लक्ष्म्यै शर्वाण्यै ते नमो नमः॥ | कल्याण्यै प्रणतां वृद्ध्यै सिद्ध्यै कुर्मो नमो नमः । नैरृत्यै भूभृतां लक्ष्म्यै शर्वाण्यै ते नमो नमः |
| 29-31 | या देवी सर्वभूतेषुच्छायारूपेण संस्थिता॥ नमस्तस्यै॥ नमस्तस्यै॥ नमस्तस्यै नमो नमः॥ | या देवी सर्वभूतेषु छायारूपेण संस्थिता । नमस्तस्यै नमस्तस्यै नमस्तस्यै नमो नमः |
| 77-77 | इन्द्रियाणामधिष्ठात्री भूतानां चाखिलेषु या। भूतेषु सततं तस्यै व्याप्तिदेव्यै नमो नमः॥ | इन्द्रियाणामधिष्ठात्री भूतानां चाखिलेषु या । भूतेषु सततं तस्यै व्याप्त्यै देव्यै नमो नमः |
| 84-84 | एवं स्तवादियुक्तानां देवानां तत्र पार्वती। स्नातुमभ्याययौ तोये जाह्नव्या नृपनन्दन॥ | एवं स्तवाभियुक्तानां देवानां तत्र पार्वती । स्नातुमभ्याययौ तोये जाह्नव्या नृपनन्दन |
| 90-90 | ताभ्यां शुम्भाय चाख्याता अतीव सुमनोहरा। काप्यास्ते स्त्री महाराज भासयन्ती हिमाचलम्॥ | ताभ्यां शुम्भाय चाख्याता सातीव सुमनोहरा । काप्यास्ते स्त्री महाराज भासयन्ती हिमाचलम् |
| 97-97 | छत्रं ते वारुणं गेहे काञ्चनस्रावि तिष्ठति। तथायं स्यन्दनवरो यः पुराऽऽसीत्प्रजापतेः॥ | छत्रं ते वारुणं गेहे काञ्चनस्रावि तिष्ठति । तथायं स्यन्दनवरो यः पुरासीत्प्रजापतेः |
| 104-104 | स तत्र गत्वा यत्रास्ते शैलोद्देशेऽतिशोभने। सा देवी तां ततः प्राह श्लक्ष्णं मधुरया गिरा॥ | स तत्र गत्वा यत्रास्ते शैलोद्देशेऽतिशोभने । तां च देवीं ततः प्राह श्लक्ष्णं मधुरया गिरा |
| 109-109 | त्रैलोक्ये वररत्नानि मम वश्यान्यशेषतः। तथैव गजरत्नं च हृत्वा देवेन्द्रवाहनम्॥ | त्रैलोक्ये वररत्नानि मम वश्यान्यशेषतः । तथैव गजरत्नं च हृतं देवेन्द्रवाहनम् |
| 113-113 | मां वा ममानुजं वापि निशुम्भमुरुविक्रमम्। भज त्वं च चञ्चलापाङ्गि रत्नभूतासि वै यतः॥ | मां वा ममानुजं वापि निशुम्भमुरुविक्रमम् । भज त्वं चञ्चलापाङ्गि रत्नभूतासि वै यतः |
| 128-128 | एवमेतद् बली शुम्भो निशुम्भश्चातिवीर्यवान्। किं करोमि प्रतिज्ञा मे यदनालोचिता पुरा॥ | एवमेतद् बली शुम्भो निशुम्भश्चापितादृशः । किं करोमि प्रतिज्ञा मे यदनालोचिता पुरा |
| 129-129 | स त्वं गच्छ मयोक्तं ते यदेतत्सर्वमादृतः। तदाचक्ष्वासुरेन्द्राय स च युक्तं करोतु तत्॥ | स त्वं गच्छ मयोक्तं ते यदेतत्सर्वमादृतः । तदाचक्ष्वासुरेन्द्राय स च युक्तं करोतु यत् |

### Chapter 6

| Unit | Drik base | Rampuri witness |
|---|---|---|
| 13 | इत्युक्तः सोऽभ्यधावत्तामसुरो धूम्रलोचनः। हुंकारेणैव तं भस्म सा चकाराम्बिका ततः॥ | इत्युक्तः सोऽभ्यधावत्तामसुरो धूम्रलोचनः । हुङ्कारेणैव तं भस्म सा चकाराम्बिका तदा |
| 16 | कांश्चित् करप्रहारेण दैत्यानास्येन चापरान्। आक्रम्य चाधरेणान्यान् स जघान महासुरान्॥ | कांश्चित्करप्रहारेण दैत्यानास्येन चापरान् । आक्रान्त्या चाधरेणान्यान् जघान स महासुरान् |

### Chapter 7

| Unit | Drik base | Rampuri witness |
|---|---|---|
| 10 | पार्ष्णिग्राहाङ्कुशग्राहियोधघण्टासमन्वितान्। समादायैकहस्तेन मुखे चिक्षेप वारणान्॥ | पार्ष्णिग्राहाङ्कुशग्राहयोधघण्टासमन्वितान् । समादायैकहस्तेन मुखे चिक्षेप वारणान् |
| 19 | ततो जहासातिरुषा भीमं भैरवनादिनी। कालीकरालवक्त्रान्तर्दुर्दर्शदशनोज्ज्वला॥ | ततो जहासातिरुषा भीमं भैरवनादिनी । काली करालवदना दुर्दर्शदशनोज्ज्वला |
| 27 | यस्माच्चण्डं च मुण्डं च गृहीत्वा त्वमुपागता। चामुण्डेति ततो लोके ख्याता देवि भविष्यसि॥ | यस्माच्चण्डं च मुण्डं च गृहीत्वा त्वमुपागता । चामुण्डेति ततो लोके ख्याता देवी भविष्यसि |

## Integration and preservation

All thirteen chapters have lazy Stuti loaders, active catalog entries, static totals, search indexing, devotional share artwork, background/discovery metadata and eligible verse-to-japa sources. Daily Bhakti entries are appended after every existing entry, preserving prior pool offsets. The collection lists the three preliminaries followed by chapters 1–13. Existing chapter 1 and legacy Kavach IDs are untouched. The Home-stack collection route and canonical-link ID remain unchanged. No aarti positional registry, deity ID, asset publication or native dependency is changed.

## Verification status

- PASS: full local reader/component suite: 4,646 tests across 413 suites; full data/content/route/startup suite: 248 tests. Focused 153 reader/discovery tests, including first/final units in all four existing scripts and navigation to every chapter; TypeScript.
- PASS: explicit 700-unit count, contiguous stable IDs, catalog counts, all units searchable, no empty meanings, Sanskrit/romanized line parity, final chapter conclusion and chapter 5 refrain boundaries.
- Broader final-head CI and actual-component screenshots: recorded in the PR once completed; previous screenshots of the four-part collection are superseded for this scope.
- PENDING: native iOS/Android lifecycle, Back/restore, sharing/export, offline/cache, accessibility/system scaling and low-memory performance. Local native tools are absent; fresh native builds were not authorized under RULEBOOK §0.3. No browser screenshot is native evidence. Keep draft.
- A6 Kubera Chalisa / B2 Kali Aarti remain excluded for the exact provenance/reuse evidence gaps in source-native-recheck.md. G3/G4 remain research, audio deferred. These exclusions do not apply to the now implemented thirteen Saptashati chapters.
