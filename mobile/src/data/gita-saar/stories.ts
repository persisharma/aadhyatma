import type { LearningCopy } from './experience';

export type GitaSaarStory = {
  kind: 'narrative' | 'scriptural-example';
  title: LearningCopy;
  imageStem: string;
  imageCaption: LearningCopy;
  beats: readonly { title: LearningCopy; body: LearningCopy }[];
  connection: LearningCopy;
  everyday: LearningCopy;
  gitaRefs: readonly string[];
  sources: readonly { title: LearningCopy; passage: string; passageHi?: string; url: string }[];
};
const c = (hi: string, en: string): LearningCopy => ({ hi, en });
const b = (hi: string, en: string, bodyHi: string, bodyEn: string) => ({
  title: c(hi, en),
  body: c(bodyHi, bodyEn),
});
const sb = (passage: string, url: string) => ({
  title: c('श्रीमद्भागवत', 'Srimad Bhagavatam'),
  passage,
  url,
});
const ram = (passage: string, url: string) => ({
  title: c('वाल्मीकि रामायण', 'Valmiki Ramayana'),
  passage: passage.replace('बालकाण्ड', 'Bala Kanda').replace('युद्धकाण्ड', 'Yuddha Kanda'),
  passageHi: passage,
  url,
});
const bg = (passage: string, url: string) => ({
  title: c('भगवद्गीता', 'Bhagavad Gita'),
  passage,
  url,
});

/** Original, abridged bilingual adaptations, researched 2026-10-26.
 * Story passages are separate from the Gita references used to discuss them.
 * Connections and everyday situations are editorial, never scripture quotations.
 * Full claim/scene collation: docs/evaluations/gita-saar-stories-2026-10-26/research/.
 */
export const gitaSaarStories: Readonly<Record<string, GitaSaarStory>> = {
  'true-prema': {
    kind: 'narrative',
    title: c('कृष्ण और सुदामा का मिलना', 'When Krishna met Sudama'),
    imageStem: 'gita-saar-story-true-prema',
    imageCaption: c(
      'चित्र में: कृष्ण अपने पुराने मित्र को गले लगाते हैं।',
      'In the painting: Krishna embraces his old friend.'
    ),
    beats: [
      b(
        'एक संकोची आगमन',
        'An uncertain arrival',
        'सुदामा थोड़े-से चिउड़े की भेंट लेकर द्वारका पहुँचे। साधारण वस्त्रों में आए पुराने मित्र और राजमहल के वैभव में बड़ा अंतर था।',
        'Sudama arrived in Dvaraka with a small gift of flattened rice. His simple clothing stood in sharp contrast to the palace around him.'
      ),
      b(
        'पहले मित्र, फिर बाकी सब',
        'The friend comes first',
        'कृष्ण ने उन्हें देखा तो तुरंत उठकर गले लगाया। उन्होंने सुदामा को आदर से बैठाया और स्वयं उनके चरण धोए।',
        'Krishna rose to embrace him, offered him an honoured seat and personally washed his feet.'
      ),
      b(
        'साझी स्मृतियाँ',
        'A shared past',
        'दोनों ने हाथ थामकर गुरुकुल के दिन याद किए। इस मिलन में प्रेम का रूप किसी की हैसियत से पहले उसे पहचानना और सम्मान देना है।',
        'They held hands and remembered their school days. Their meeting shows affection through recognition and respect before social position.'
      ),
    ],
    connection: c(
      'गीता 6.32 दूसरे के सुख-दुःख को अपने समान देखने की दृष्टि देती है। यह प्रसंग उस संवेदना को एक संबंध में देखने का अवसर है।',
      'Gita 6.32 invites us to regard another person’s joy and pain as our own. This meeting gives that sensitivity a human setting.'
    ),
    everyday: c(
      'किसी पुराने मित्र से बात करते समय उसकी नौकरी या उपलब्धि से पहले उसके हाल के बारे में पूछें।',
      'When reconnecting with a friend, ask how they are before asking about their job or achievements.'
    ),
    gitaRefs: ['6.32', '12.13'],
    sources: [
      sb('10.80.18–27', 'https://vedabase.io/en/library/sb/10/80/18/'),
      sb('10.80.27', 'https://vedabase.io/en/library/sb/10/80/27/'),
    ],
  },
  'bhay-chinta': {
    kind: 'narrative',
    title: c(
      'जब गजेन्द्र ने सहायता पुकारकर माँगी',
      'When Gajendra called for help'
    ),
    imageStem: 'gita-saar-story-bhay-chinta',
    imageCaption: c(
      'चित्र में: संकट के बीच गजेन्द्र कमल उठाकर प्रार्थना करते हैं।',
      'In the painting: Gajendra raises a lotus in the midst of danger.'
    ),
    beats: [
      b(
        'शक्ति की भी सीमा',
        'Strength reaches a limit',
        'सरोवर में मगर ने गजेन्द्र का पैर पकड़ लिया। हाथी ने बहुत संघर्ष किया, पर केवल अपने बल से छूटना कठिन हो गया।',
        'A crocodile caught Gajendra’s leg in a lake. The elephant struggled, but his own strength could not free him.'
      ),
      b(
        'मन को एक दिशा',
        'Attention finds a direction',
        'गजेन्द्र ने मन को एकाग्र करके पहले सीखी हुई प्रार्थना का स्मरण किया। संकट मिटने से पहले ही उनकी प्रतिक्रिया की दिशा बदली।',
        'He gathered his attention and recalled a prayer he had learned before. His response changed before his circumstances did.'
      ),
      b(
        'सहायता का स्वीकार',
        'Accepting help',
        'नारायण के आगमन पर उन्होंने कमल उठाकर प्रणाम किया। भागवत में नारायण उन्हें संकट से छुड़ाते हैं। यह मोड़ स्मरण और सहायता स्वीकार करने का प्रसंग बनता है।',
        'He raised a lotus when Narayana arrived. The Bhagavatam narrates his rescue. This turn in the story brings remembrance and the acceptance of help together.'
      ),
    ],
    connection: c(
      'गीता 6.35 अभ्यास और वैराग्य की बात करती है। गजेन्द्र का स्मरण अभ्यास से जुड़ा है: डर के बीच भी मन को एक सहारे की ओर लौटाना।',
      'Gita 6.35 speaks of practice and dispassion. Gajendra’s recollection offers a setting for returning attention to a support even amid fear.'
    ),
    everyday: c(
      'कल की परीक्षा या किसी कठिन बातचीत की चिंता में, अभी की एक तैयारी और सहायता माँगने योग्य एक बात अलग लिखें।',
      'Before an exam or a difficult conversation, separate one preparation you can make now from one thing you can ask for help with.'
    ),
    gitaRefs: ['6.35', '9.22'],
    sources: [
      sb('8.2.27', 'https://vedabase.io/en/library/sb/8/2/27/'),
      sb('8.3.1, 32–33', 'https://vedabase.io/en/library/sb/8/3/32/'),
    ],
  },
  shok: {
    kind: 'narrative',
    title: c(
      'चित्रकेतु के शोक में एक संवाद',
      'A conversation in Chitraketu’s grief'
    ),
    imageStem: 'gita-saar-story-shok',
    imageCaption: c(
      'चित्र में: नारद और अंगिरा शोकाकुल चित्रकेतु के साथ संवाद करते हैं।',
      'In the painting: Narada and Angira speak with the grieving king.'
    ),
    beats: [
      b(
        'प्रिय का वियोग',
        'A painful loss',
        'पुत्र की मृत्यु से राजा चित्रकेतु गहरे शोक में थे। नारद और अंगिरा उसी अवस्था में उनके पास आए और आत्मा के विषय में समझाने लगे।',
        'King Chitraketu was overwhelmed by his son’s death. Narada and Angira approached him in his grief and began a conversation about the Self.'
      ),
      b(
        'रिश्ते और यात्रा',
        'Relationship and continuity',
        'कथा में नारद दिवंगत जीव को संबोधित करते हैं। जीव विभिन्न जन्मों और बदलते संबंधों का प्रश्न उठाता है। यह भागवत का आध्यात्मिक कथानक है।',
        'In the narrative, Narada addresses the departed being, who raises questions about changing relationships across births. This belongs to the Bhagavatam’s spiritual account.'
      ),
      b(
        'एक नया दृष्टिकोण',
        'A different perspective',
        'इस संवाद से शरीर, संबंध और जीव के भेद पर विचार खुलता है। शोक के बीच आत्मविचार का एक नया प्रश्न सामने आता है।',
        'The conversation opens a distinction between the body, relationship and living self. A question about the Self opens within the experience of grief.'
      ),
    ],
    connection: c(
      'गीता 2.13 और 2.20 शरीर के बदलने और आत्मा की नित्यता का विवेचन करती हैं। यह कथा उसी प्रश्न के सामने बैठे एक शोकाकुल व्यक्ति को दिखाती है।',
      'Gita 2.13 and 2.20 discuss the changing body and enduring Self. The story places a grieving person before that same spiritual question.'
    ),
    everyday: c(
      'किसी प्रिय की याद आए तो उसकी एक बात लिखें जिसे अपने जीवन में सँजोना चाहते हैं।',
      'When remembering someone dear, write one thing about them you would like to carry into your life.'
    ),
    gitaRefs: ['2.13', '2.20'],
    sources: [
      sb('6.15.1', 'https://vedabase.io/en/library/sb/6/15/1/'),
      sb('6.16.4–9', 'https://vedabase.io/en/library/sb/6/16/6/'),
    ],
  },
  krodh: {
    kind: 'narrative',
    title: c(
      'अम्बरीष ने क्रोध का उत्तर कैसे दिया?',
      'How did Ambarisha answer anger?'
    ),
    imageStem: 'gita-saar-story-krodh',
    imageCaption: c(
      'चित्र में: अम्बरीष दुर्वासा की रक्षा के लिए प्रार्थना करते हैं।',
      'In the painting: Ambarisha prays for Durvasa’s safety.'
    ),
    beats: [
      b(
        'एक बात से बढ़ा क्रोध',
        'Anger grows from an interpretation',
        'व्रत खोलने के समय अम्बरीष ने जल लिया। दुर्वासा ने इसे अपना अनादर माना और क्रोधित हुए। विवाद एक घटना के अर्थ से बढ़ा।',
        'Ambarisha took water at the time for ending his fast. Durvasa saw this as disrespect and became angry. An interpretation of an event fed the conflict.'
      ),
      b(
        'प्रतिशोध का अवसर',
        'An opportunity to retaliate',
        'कथा में सुदर्शन चक्र से संकट में पड़े दुर्वासा वापस अम्बरीष के पास आए। राजा अब उनकी सहायता कर सकते थे या उनके अपराध को पकड़े रह सकते थे।',
        'When the Sudarshana disc endangered Durvasa, he returned to Ambarisha. The king faced a choice between helping him and holding on to the offense.'
      ),
      b(
        'दूसरे की रक्षा',
        'Choosing protection',
        'अम्बरीष ने चक्र से शांत होने की प्रार्थना की। संकट टलने पर दुर्वासा ने राजा की करुणा स्वीकार की। अम्बरीष ने अपमान को आगे बढ़ती हिंसा का कारण नहीं बनाया।',
        'Ambarisha prayed for the disc to become peaceful. Durvasa later acknowledged his compassion. The king did not turn an offense into further retaliation.'
      ),
    ],
    connection: c(
      'गीता 2.62–63 इच्छा, क्रोध और विवेक के बिगड़ने की कड़ी दिखाती है। अम्बरीष का उत्तर उस कड़ी को आगे न बढ़ाने का एक उदाहरण है।',
      'Gita 2.62–63 traces desire, anger and the loss of discernment. Ambarisha’s response offers an example of not extending that chain.'
    ),
    everyday: c(
      'किसी तीखे संदेश का जवाब देने से पहले लिखें: मुझे कौन-सी बात अपमान लगी, और इस बातचीत में वास्तव में क्या सुलझाना है?',
      'Before replying to a sharp message, name what felt insulting and what the conversation actually needs to resolve.'
    ),
    gitaRefs: ['2.62', '2.63'],
    sources: [
      sb('9.4.37–51', 'https://vedabase.io/en/library/sb/9/4/'),
      sb('9.5.12–17', 'https://vedabase.io/en/library/sb/9/5/12/'),
    ],
  },
  karma: {
    kind: 'narrative',
    title: c('भगीरथ का प्रयत्न, एक कदम और', 'Bhagiratha’s next step'),
    imageStem: 'gita-saar-story-karma',
    imageCaption: c(
      'चित्र में: शिव गंगा का वेग सँभालते हैं; भगीरथ प्रार्थना करते हैं।',
      'In the painting: Shiva receives Ganga as Bhagiratha offers his prayer.'
    ),
    beats: [
      b(
        'एक उद्देश्य, कई चरण',
        'One purpose, several stages',
        'पूर्वजों के उद्धार के लिए भगीरथ गंगा को पृथ्वी पर लाना चाहते थे। मार्ग में गंगा का वेग सँभालने के लिए शिव की सहायता आवश्यक हुई।',
        'Bhagiratha sought to bring Ganga to earth for his ancestors. The task required Shiva’s help to receive the force of her descent.'
      ),
      b(
        'बाधा के बाद फिर प्रयत्न',
        'Effort after an obstacle',
        'गंगा शिव की जटाओं में रुक गईं तो भगीरथ ने फिर प्रार्थना की। आगे जाह्नु के प्रसंग में भी प्रवाह रुका और पुनः प्रार्थना से मार्ग खुला।',
        'When Ganga remained in Shiva’s hair, Bhagiratha prayed again. A further interruption involving Jahnu also required another appeal before the journey continued.'
      ),
      b(
        'अपने हिस्से का कर्म',
        'Doing the part available',
        'अंततः गंगा पूर्वजों के अवशेषों तक पहुँचीं। कथा में भगीरथ अकेले सब कुछ नियंत्रित नहीं करते; उनका योगदान है उद्देश्य के साथ अगला आवश्यक कर्म करते रहना।',
        'Ganga eventually reached the ancestors’ remains. Bhagiratha did not control every force involved; his part was to keep taking the next necessary step.'
      ),
    ],
    connection: c(
      'गीता 2.47 और 3.19 कर्म में लगने और फल की आसक्ति छोड़ने की बात करती हैं। इस कथा से प्रयत्न, सहयोग और परिणाम के बीच का अंतर समझ सकते हैं।',
      'Gita 2.47 and 3.19 join action with freedom from attachment to its fruits. This story helps distinguish effort, cooperation and the eventual result.'
    ),
    everyday: c(
      'एक कठिन काम में अगला कदम तय करें: क्या तैयार करना है, किससे सहयोग माँगना है, और किस परिणाम की प्रतीक्षा करनी होगी?',
      'For a difficult task, identify the next preparation, the help to seek and the outcome that will still take time.'
    ),
    gitaRefs: ['2.47', '3.19'],
    sources: [
      ram(
        'बालकाण्ड 43',
        'https://www.valmikiramayan.net/utf8/baala/sarga43/balasans43.htm'
      ),
      ram(
        'बालकाण्ड 44',
        'https://www.valmikiramayan.net/utf8/baala/sarga44/balasans44.htm'
      ),
    ],
  },
  guna: {
    kind: 'scriptural-example',
    title: c('एक दान, तीन अलग भाव', 'One gift, three different motives'),
    imageStem: 'gita-saar-story-guna',
    imageCaption: c(
      'चित्र में बाएँ से: सम्मान, प्रतिफल की अपेक्षा, और उपेक्षा के साथ देना।',
      'From left: giving respectfully, expecting a return, and giving without care.'
    ),
    beats: [
      b(
        'सत्त्व: सम्मान के साथ',
        'Sattva: with respect',
        'गीता 17.20 में उचित व्यक्ति, समय और स्थान पर कर्तव्य समझकर, प्रतिफल की अपेक्षा बिना दिए दान का वर्णन है। चित्र का पहला प्रसंग इसी भाव का कलात्मक उदाहरण है।',
        'Gita 17.20 describes giving as a duty, at a fitting time and place, to a suitable recipient, without expecting repayment. The first painted moment illustrates that motive.'
      ),
      b(
        'रजस्: बदले में क्या मिलेगा?',
        'Rajas: what comes back?',
        '17.21 में प्रतिफल की इच्छा या अनिच्छा के साथ दिए दान की बात है। बाहर से कर्म मिलता-जुलता दिख सकता है, पर भीतर अपेक्षा काम कर रही है।',
        'Verse 17.21 considers a gift made for a return, a result or grudgingly. The outward action may look similar while expectation drives it.'
      ),
      b(
        'तमस्: ध्यान और आदर बिना',
        'Tamas: without care',
        '17.22 अनुचित ढंग से, बिना सत्कार दिए दान को अलग करती है। ये तीन स्थायी व्यक्तित्व नहीं; एक ही व्यक्ति अलग अवसरों पर इन भावों को पहचान सकता है।',
        'Verse 17.22 distinguishes giving in an unsuitable way or without respect. These are not three fixed personalities; one person can notice different motives at different times.'
      ),
    ],
    connection: c(
      'अध्याय 14 में गुणों की प्रकृति पढ़ी जाती है। अध्याय 17 का यह उदाहरण दिखाता है कि गुण केवल नाम नहीं, कर्म की प्रेरणा और ढंग में भी दिखाई देते हैं।',
      'Chapter 14 describes the gunas. This example from chapter 17 shows how they can be noticed in an action’s motive and manner.'
    ),
    everyday: c(
      'किसी की मदद करते समय अपना भाव देखें: उसकी जरूरत, मिलने वाली प्रशंसा, या बस जल्दी काम निपटाना?',
      'When helping someone, notice your motive: their need, the praise you might receive, or simply getting it over with.'
    ),
    gitaRefs: ['14.6', '14.7', '14.8'],
    sources: [
      bg('17.20', 'https://vedabase.io/en/library/bg/17/20/'),
      bg('17.21', 'https://vedabase.io/en/library/bg/17/21/'),
      bg('17.22', 'https://vedabase.io/en/library/bg/17/22/'),
    ],
  },
  man: {
    kind: 'narrative',
    title: c('बाज ने पकड़ छोड़ी, पीछा छूटा', 'The hawk loosened its grip'),
    imageStem: 'gita-saar-story-man',
    imageCaption: c(
      'चित्र में: छोटा बाज भोजन छोड़ता है; दूसरे पक्षी उसके पीछे जाना छोड़ते हैं।',
      'In the painting: the smaller hawk releases its food and the other birds turn away.'
    ),
    beats: [
      b(
        'जिसे पकड़ा, वही उलझन बना',
        'The grip becomes a struggle',
        'अवधूत एक बाज को भोजन का टुकड़ा पकड़े देखते हैं। अधिक शक्तिशाली पक्षी उसे पाने के लिए छोटे बाज को घेर लेते हैं।',
        'The avadhuta observes a hawk holding a morsel of food. Stronger birds surround it, trying to take what it carries.'
      ),
      b(
        'उड़ान की दूसरी दिशा',
        'Another direction',
        'बाज उस टुकड़े को छोड़ देता है। दूसरे पक्षियों का ध्यान अब भोजन पर चला जाता है और उसका पीछा छूटता है।',
        'The hawk releases the morsel. The other birds turn toward the food, and the pursuit ends.'
      ),
      b(
        'हल्का होने की सीख',
        'A lesson in releasing',
        'अवधूत इस घटना से पकड़ छोड़ने की शिक्षा लेते हैं। इस उदाहरण में मन को उलझाने वाली पकड़ पहचानकर उसे ढीला करने का एक संकेत है।',
        'The avadhuta learns from letting go. The example invites us to recognise a grip that creates struggle and consider loosening it.'
      ),
    ],
    connection: c(
      'गीता 6.35 अभ्यास के साथ वैराग्य रखती है। बाज का प्रसंग वैराग्य का दृश्य उदाहरण है; भटके मन को लौटाना अभ्यास का हिस्सा बना रहता है।',
      'Gita 6.35 places dispassion alongside practice. The hawk gives dispassion a visible form; returning a wandering mind remains a matter of practice.'
    ),
    everyday: c(
      'एक बहस में आखिरी शब्द कहने की इच्छा पहचानें। क्या उसे छोड़कर भी जरूरी बात स्पष्ट कही जा सकती है?',
      'In a disagreement, notice the urge to have the last word. Could you let it go and still say what matters?'
    ),
    gitaRefs: ['6.35', '6.26'],
    sources: [sb('11.9.1–2', 'https://vedabase.io/en/library/sb/11/9/2/')],
  },
  sanshay: {
    kind: 'narrative',
    title: c(
      'अर्जुन ने अपना प्रश्न छिपाया नहीं',
      'Arjuna did not hide his question'
    ),
    imageStem: 'gita-saar-story-sanshay',
    imageCaption: c(
      'चित्र में: धनुष रखकर अर्जुन कृष्ण से अपनी उलझन कहते हैं।',
      'In the painting: with his bow at rest, Arjuna asks Krishna for guidance.'
    ),
    beats: [
      b(
        'उलझन को नाम देना',
        'Naming the confusion',
        'कुरुक्षेत्र में अर्जुन अपने कर्तव्य को लेकर उलझे थे। गीता 2.7 में वे अपनी स्थिति साफ कहते हैं और कृष्ण से पूछते हैं कि उनके लिए श्रेय क्या है।',
        'At Kurukshetra, Arjuna was uncertain about his duty. In Gita 2.7 he states his difficulty openly and asks Krishna what would truly be good.'
      ),
      b(
        'समझने का समय',
        'Time to understand',
        'इसके बाद एक लंबा संवाद होता है। अंत में कृष्ण 18.63 में अर्जुन को कही हुई बातों पर पूरा विचार करने और फिर अपनी इच्छा से कर्म करने को कहते हैं।',
        'A long conversation follows. In 18.63, Krishna invites Arjuna to reflect fully on what has been taught and then choose how to act.'
      ),
      b(
        'अपने निर्णय की जिम्मेदारी',
        'Owning the decision',
        '18.73 में अर्जुन कहते हैं कि उनका मोह दूर हुआ, स्मृति लौटी और संशय मिटा। प्रश्न से शुरू हुई बातचीत उनके अपने संकल्प तक पहुँचती है।',
        'In 18.73 Arjuna says his confusion has cleared, understanding has returned and doubt has gone. The conversation leads from a question to his own resolve.'
      ),
    ],
    connection: c(
      'इस विषय का आधार यही संवाद है। श्रद्धा और प्रश्न विरोधी नहीं रखे गए: पूछना, सुनना, विचार करना और निर्णय लेना साथ आते हैं।',
      'This dialogue grounds the theme itself. Faith and questioning are not set against each other: asking, listening, reflecting and deciding belong together.'
    ),
    everyday: c(
      'किसी निर्णय पर सलाह माँगते समय केवल विकल्प न गिनाएँ। अपना असली प्रश्न भी कहें: मैं किस मूल्य या जिम्मेदारी को लेकर उलझा हूँ?',
      'When asking for advice, go beyond listing options. State the real question: which value or responsibility am I uncertain about?'
    ),
    gitaRefs: ['2.7', '18.63', '18.73'],
    sources: [
      bg('2.7', 'https://www.holy-bhagavad-gita.org/chapter/2/verse/7/'),
      bg('18.63–73', 'https://www.holy-bhagavad-gita.org/chapter/18/verse/73/'),
    ],
  },
  sharanagati: {
    kind: 'narrative',
    title: c('विभीषण को मिला आश्रय', 'A place of refuge for Vibhishana'),
    imageStem: 'gita-saar-story-sharanagati',
    imageCaption: c(
      'चित्र में: समुद्रतट पर राम विभीषण का स्वागत करते हैं।',
      'In the painting: Rama welcomes Vibhishana on the seashore.'
    ),
    beats: [
      b(
        'एक कठिन दिशा-परिवर्तन',
        'A difficult change of direction',
        'रावण का साथ छोड़कर विभीषण राम के पास आश्रय लेने आए। उनका संबंध विरोधी पक्ष से था, इसलिए उनके आगमन पर संदेह भी उठे।',
        'Vibhishana left Ravana and sought refuge with Rama. His connection to the opposing side caused others to question whether he could be trusted.'
      ),
      b(
        'संशय को सुनना',
        'Hearing the concern',
        'सुग्रीव अपनी शंका रखते हैं। राम दूसरों की बात सुनकर आश्रय माँगने वाले के प्रति अपना धर्म स्पष्ट करते हैं।',
        'Sugriva voiced his concerns. Rama heard the discussion and explained his duty toward a person who came seeking protection.'
      ),
      b(
        'स्वीकार का आश्वासन',
        'An assurance of acceptance',
        'राम ने शरण में आने वाले को अभय देने की प्रतिज्ञा कही और विभीषण को बुलाने को कहा। इस प्रसंग में शरणागति एक सचेत दिशा-परिवर्तन और स्वीकार का संबंध है।',
        'Rama declared his pledge to offer safety to one seeking refuge and asked that Vibhishana be brought to him. Refuge becomes a relationship of a deliberate change and acceptance.'
      ),
    ],
    connection: c(
      'गीता 18.66 का शरण का सूत्र यहाँ रामायण के एक अलग प्रसंग के साथ पढ़ा जा रहा है। दोनों ग्रंथों के संदर्भ अलग रखते हुए इनके बीच मनन का एक सूत्र खुलता है।',
      'The refuge described in Gita 18.66 is considered alongside a separate Ramayana episode. Keeping each work’s context distinct opens a thread for reflection between them.'
    ),
    everyday: c(
      'जब अपना कोई रास्ता गलत लगे, भरोसेमंद मार्गदर्शन के सामने उसे स्पष्ट कहने और एक जिम्मेदार अगला कदम लेने पर विचार करें।',
      'When a path feels wrong, consider naming it honestly to someone whose guidance you trust and taking a responsible next step.'
    ),
    gitaRefs: ['18.66'],
    sources: [
      ram(
        'युद्धकाण्ड 18',
        'https://www.valmikiramayan.net/yuddha/sarga18/yuddha_18_prose.htm'
      ),
    ],
  },
  sthitaprajna: {
    kind: 'narrative',
    title: c(
      'अवन्ति के भिक्षु का ठहराव',
      'The steadiness of the Avanti mendicant'
    ),
    imageStem: 'gita-saar-story-sthitaprajna',
    imageCaption: c(
      'चित्र में: दूसरों की कटुता के बीच भिक्षु अपनी प्रतिक्रिया देखते हैं।',
      'In the painting: the mendicant considers his response amid harsh behaviour.'
    ),
    beats: [
      b(
        'धन के साथ बँधा मन',
        'A mind bound to possessions',
        'अवन्ति का एक धनी व्यक्ति धन की पकड़ में कठोर और क्रोधी हो गया था। संपत्ति चली जाने पर उसे अपनी जीवन-दिशा पर विचार हुआ।',
        'A wealthy man of Avanti had become harsh and angry through his attachment to money. After losing his wealth, he reconsidered how he had lived.'
      ),
      b(
        'बाहरी कठिनाई बनी रही',
        'Difficulty did not vanish',
        'वैराग्य लेकर भिक्षु बनने पर भी लोग उसका उपहास और अपमान करते रहे। नया वस्त्र या नई भूमिका कठिन अनुभवों को अपने आप समाप्त नहीं कर सकी।',
        'Even after becoming a mendicant, he faced ridicule and insults. A change of clothing or role did not make difficult experiences disappear.'
      ),
      b(
        'प्रतिक्रिया की ओर ध्यान',
        'Attention turns to the response',
        'अपने गीत में वह मन की भूमिका पर विचार करता है और कृष्ण में निष्ठा का संकल्प रखता है। कठिन परिस्थिति में भी वे अपनी प्रतिक्रिया को देखने का संकल्प रखते हैं।',
        'In his song he considers the mind’s role and resolves to remain devoted to Krishna. Amid difficult circumstances, he resolves to examine his own response.'
      ),
    ],
    connection: c(
      'गीता 2.56 दुःख में उद्विग्न न होने और सुख में स्पृहा न रखने की बात करती है। यह प्रसंग उस स्थिरता को एक कठिन अनुभव के बीच रखता है।',
      'Gita 2.56 describes steadiness amid sorrow and freedom from craving amid pleasure. The story places that quality within a difficult experience.'
    ),
    everyday: c(
      'आलोचना सुनकर उसके उपयोगी तथ्य और अपने भीतर उठी पहली प्रतिक्रिया को अलग-अलग लिखकर देखें।',
      'After receiving criticism, separate the useful facts from the first reaction that arose within you.'
    ),
    gitaRefs: ['2.56'],
    sources: [
      sb('11.23.6–31', 'https://vedabase.io/en/library/sb/11/23/'),
      sb('11.23.42, 57', 'https://vedabase.io/en/library/sb/11/23/42/'),
    ],
  },
  'kamna-santosh': {
    kind: 'narrative',
    title: c('पिंगला की लंबी प्रतीक्षा', 'Pingala’s long evening'),
    imageStem: 'gita-saar-story-kamna-santosh',
    imageCaption: c(
      'चित्र में: रात की प्रतीक्षा से हटकर पिंगला अपने भीतर की ओर लौटती हैं।',
      'In the painting: Pingala turns away from waiting and reflects inwardly.'
    ),
    beats: [
      b(
        'मन अगले आगमन पर',
        'Waiting for the next arrival',
        'विदेह की गणिका पिंगला रात को किसी धनवान ग्राहक की प्रतीक्षा कर रही थीं। आते-जाते लोगों को देखकर उनकी आशा बार-बार बँधती और टूटती रही।',
        'Pingala, a courtesan in Videha, waited for a wealthy customer that night. Each passer-by brought another rise and fall of expectation.'
      ),
      b(
        'बेचैनी को पहचानना',
        'Noticing the restlessness',
        'लंबी निराशा के बीच उन्होंने उस अपेक्षा पर ही विचार किया जिसने उन्हें बाँध रखा था। कथा में उनका ध्यान बाहर मिलने वाले सुख से भीतर के आध्यात्मिक आश्रय की ओर मुड़ता है।',
        'In her disappointment she examined the expectation that held her. The narrative turns her attention from an outward reward toward spiritual refuge within.'
      ),
      b(
        'उसी रात विश्राम',
        'Rest that same night',
        'ग्राहक की आस छोड़कर पिंगला शांति से सो गईं। परिस्थिति में कोई धनवर्षा नहीं हुई; बदली उस रात की उनकी पकड़ और प्रतीक्षा।',
        'She let go of waiting for a customer and slept peacefully. No wealth appeared; what changed was her grip on that evening’s expectation.'
      ),
    ],
    connection: c(
      'गीता 2.71 कामनाओं और ममता की पकड़ छोड़ने को शांति से जोड़ती है। पिंगला का प्रसंग उस पकड़ को एक रात की कथा में दिखाता है।',
      'Gita 2.71 connects peace with releasing desire and possessiveness. Pingala’s evening gives that attachment a concrete narrative form.'
    ),
    everyday: c(
      'किसी उत्तर या प्रशंसा की प्रतीक्षा में बार-बार फोन देख रहे हों तो एक बार अपना जरूरी काम पूरा करके प्रतीक्षा से विराम लें।',
      'If you keep checking for a reply or praise, complete the action you needed to take and allow yourself a pause from waiting.'
    ),
    gitaRefs: ['2.71'],
    sources: [
      sb('11.8.22–29', 'https://vedabase.io/en/library/sb/11/8/23/'),
      sb('11.8.30–44', 'https://vedabase.io/en/library/sb/11/8/44/'),
    ],
  },
  safalta: {
    kind: 'narrative',
    title: c('राज्य गया, वचन का क्या?', 'When a kingdom was no longer his'),
    imageStem: 'gita-saar-story-safalta',
    imageCaption: c(
      'चित्र में: बलि अपने वचन के प्रति संकल्प व्यक्त करते हैं।',
      'In the painting: Bali expresses his resolve to keep his promise.'
    ),
    beats: [
      b(
        'तीन पग का वचन',
        'A promise of three paces',
        'बलि ने वामन को तीन पग भूमि देने का वचन दिया। कथा में वामन का विराट रूप दो पगों में उसके अधिकार का सब क्षेत्र नाप लेता है।',
        'Bali promised Vamana three paces of land. In the narrative, Vamana’s expanded form covered the realm of Bali’s possessions in two steps.'
      ),
      b(
        'हानि के बीच निर्णय',
        'A choice amid loss',
        'जब तीसरे पग का प्रश्न आया तो बलि के पास पहले जैसा वैभव नहीं था। फिर भी उन्होंने अपने वचन को असत्य न होने देने का संकल्प कहा।',
        'When the third step was asked for, Bali no longer held his former wealth. He nevertheless resolved that his promise should not become false.'
      ),
      b(
        'संपत्ति से अलग संकल्प',
        'Resolve beyond possessions',
        'बलि ने तीसरे पग के लिए अपना सिर प्रस्तुत किया। मनन का बिंदु है हानि के बीच भी अपने चुने मूल्य के प्रति उनका उत्तर देखना।',
        'He offered his head for the third step. The reflection concerns his response to a chosen value even amid loss.'
      ),
    ],
    connection: c(
      'गीता 2.38 लाभ-हानि और जय-पराजय के बीच समता का सूत्र देती है। बलि का प्रसंग परिणाम और व्यक्ति के नैतिक उत्तर को अलग देखने में सहायक है।',
      'Gita 2.38 considers evenness amid gain, loss, victory and defeat. Bali’s response helps distinguish an outcome from a person’s ethical choice.'
    ),
    everyday: c(
      'किसी प्रयास का परिणाम मनमाफिक न आए तो देखें: क्या नहीं मिला, और फिर भी कौन-सा मूल्य या सीख अपने साथ रख सकते हैं?',
      'After a disappointing result, distinguish what was not achieved from the value or learning you can still carry forward.'
    ),
    gitaRefs: ['2.38', '2.48'],
    sources: [
      sb('8.19–21', 'https://vedabase.io/en/library/sb/8/21/'),
      sb('8.22.2', 'https://vedabase.io/en/library/sb/8/22/2/'),
    ],
  },
  atma: {
    kind: 'narrative',
    title: c('नचिकेता का तीसरा प्रश्न', 'Nachiketa’s third question'),
    imageStem: 'gita-saar-story-atma',
    imageCaption: c(
      'चित्र में: नचिकेता यम से आत्मा का प्रश्न पूछते हैं।',
      'In the painting: Nachiketa asks Yama about the Self.'
    ),
    beats: [
      b(
        'जो जानना कठिन है',
        'A difficult question',
        'कठोपनिषद् में नचिकेता अपने तीसरे वर में मृत्यु के बाद मनुष्य के अस्तित्व का प्रश्न पूछते हैं। वे अलग-अलग धारणाएँ सुन चुके हैं और स्पष्ट जानना चाहते हैं।',
        'In the Katha Upanishad, Nachiketa uses his third boon to ask about existence after death. He has heard different views and seeks understanding.'
      ),
      b(
        'आसान विकल्प का आकर्षण',
        'The appeal of an easier choice',
        'यम धन, दीर्घ जीवन और भोग जैसे दूसरे विकल्प सामने रखते हैं। नचिकेता अपने मूल प्रश्न से नहीं हटते।',
        'Yama offers alternatives such as wealth, long life and pleasures. Nachiketa does not turn away from his original question.'
      ),
      b(
        'आत्मा का विवेचन',
        'The teaching of the Self',
        'इसके बाद यम आत्मा को जन्म-मरण से भिन्न रूप में समझाते हैं। कथा जिज्ञासा से आत्मविवेक तक का संवाद बनती है।',
        'Yama then teaches the Self as distinct from birth and death. The story moves from inquiry toward discernment.'
      ),
    ],
    connection: c(
      'कठोपनिषद् 1.2.18 और गीता 2.20 में आत्मा के न जन्मने और न मरने का समान सूत्र आता है। यहाँ दो अलग ग्रंथों की शिक्षाएँ साथ पढ़ी जा रही हैं।',
      'Katha Upanishad 1.2.18 and Gita 2.20 share the teaching of the Self as unborn and undying. These are passages from two distinct works.'
    ),
    everyday: c(
      'अपने परिचय से पद, उम्र या उपलब्धि हटाकर देखें। अपने बारे में कौन-सा प्रश्न तब भी बचा रहता है?',
      'Set aside your job title, age and achievements for a moment. What question about yourself still remains?'
    ),
    gitaRefs: ['2.20'],
    sources: [
      {
        title: c('कठोपनिषद्', 'Katha Upanishad'),
        passage: '1.1.20–29; 1.2.18–20',
        url: 'https://arshabodha.org/wp-content/uploads/abc/teachings/Kathopanishad/kathaTrans1.pdf',
      },
    ],
  },
  akela: {
    kind: 'narrative',
    title: c(
      'प्रह्लाद और स्तम्भ का प्रश्न',
      'Prahlada and the question of the pillar'
    ),
    imageStem: 'gita-saar-story-akela',
    imageCaption: c(
      'चित्र में: पिता के प्रश्न के सामने प्रह्लाद अपने विश्वास की बात कहते हैं।',
      'In the painting: Prahlada answers his father’s question with trust.'
    ),
    beats: [
      b(
        'एक चुनौती',
        'A challenge',
        'हिरण्यकशिपु ने प्रह्लाद से पूछा: यदि तुम्हारे भगवान् सर्वत्र हैं, तो इस स्तम्भ में कहाँ हैं? प्रश्न बाहरी प्रमाण का था।',
        'Hiranyakashipu challenged Prahlada: if the Divine is everywhere, where is He in this pillar? The question demanded an outward proof.'
      ),
      b(
        'उपस्थिति की दृष्टि',
        'A perspective of presence',
        'प्रह्लाद का विश्वास किसी एक स्थान तक सीमित नहीं था। वे भगवान् की उपस्थिति को सर्वत्र मानते थे, भले सामने का व्यक्ति उनसे सहमत न हो।',
        'Prahlada’s trust was not confined to a single place. He regarded the Divine as present everywhere, even when the person before him disagreed.'
      ),
      b(
        'कथा का उत्तर',
        'The narrative’s answer',
        'भागवत में उसी स्तम्भ से नृसिंह के प्रकट होने का वर्णन है। इस प्रसंग में प्रह्लाद की सर्वत्र उपस्थिति की दृष्टि कथा का रूप लेती है।',
        'The Bhagavatam narrates Narasimha’s appearance from that pillar. The event gives narrative form to Prahlada’s trust in a presence that reaches everywhere.'
      ),
    ],
    connection: c(
      'गीता 6.30 सबमें भगवान् को देखने की दृष्टि देती है। प्रह्लाद का प्रसंग उसी आध्यात्मिक जुड़ाव को एक संवाद के रूप में सामने लाता है।',
      'Gita 6.30 describes seeing the Divine everywhere. Prahlada’s dialogue gives a narrative setting to that spiritual connection.'
    ),
    everyday: c(
      'ऐसा एक व्यक्ति, स्थान या अभ्यास याद करें जहाँ अपनापन मिलता है। संभव हो तो आज उस जुड़ाव की ओर एक छोटा कदम बढ़ाएँ।',
      'Recall a person, place or practice in which you feel belonging, and consider one small way to reconnect today.'
    ),
    gitaRefs: ['6.30', '18.61'],
    sources: [
      sb('7.8.12', 'https://vedabase.io/en/library/sb/7/8/12/'),
      sb('7.8.17', 'https://vedabase.io/en/library/sb/7/8/17/'),
    ],
  },
  daivi: {
    kind: 'narrative',
    title: c('रन्तिदेव का बचा हुआ जल', 'Rantideva’s remaining water'),
    imageStem: 'gita-saar-story-daivi',
    imageCaption: c(
      'चित्र में: रन्तिदेव प्यासे अतिथि को आदर से जल देते हैं।',
      'In the painting: Rantideva respectfully offers water to a thirsty guest.'
    ),
    beats: [
      b(
        'अपनी जरूरत भी थी',
        'He had a need of his own',
        'लंबे उपवास के बाद रन्तिदेव और उनके परिवार को भोजन और थोड़ा जल मिला। एक-एक करके आए अतिथियों को वे भोजन देते गए।',
        'After a long fast, Rantideva and his family received food and a little water. As guests arrived, he shared the food with them.'
      ),
      b(
        'सामने एक प्यासा व्यक्ति',
        'A thirsty person before him',
        'जब जल बचा था, एक थका हुआ अतिथि पानी माँगने आया। रन्तिदेव स्वयं प्यासे थे, फिर भी उसकी पीड़ा देखकर अपना जल उसे दिया।',
        'When only water remained, a weary guest asked for a drink. Though thirsty himself, Rantideva saw the guest’s distress and offered his share.'
      ),
      b(
        'गुण का एक कर्म में दिखना',
        'A quality made visible',
        'कथा में अतिथि बाद में देवताओं के रूप में प्रकट होते हैं। पर रन्तिदेव का करुणापूर्ण कर्म उन्हें साधारण अतिथि मानकर पहले ही हो चुका था।',
        'The guests later revealed divine identities. Rantideva’s compassionate act had already happened while he regarded them as ordinary visitors.'
      ),
    ],
    connection: c(
      'गीता 16.1–2 में दान, दया और अद्रोह जैसे गुण आते हैं। यह प्रसंग करुणा को सामने वाले की जरूरत पहचानने और अपनी सामर्थ्य से उत्तर देने के भाव में दिखाता है।',
      'Gita 16.1–2 includes generosity, compassion and absence of malice. The episode makes compassion visible in noticing another person’s need and responding with what one can offer.'
    ),
    everyday: c(
      'किसी साझा काम में ऐसा व्यक्ति देखें जिसकी जरूरत अनदेखी रह गई है। मदद की शुरुआत उससे पूछने से भी हो सकती है।',
      'In a shared task, notice whose needs may have been overlooked. Help can begin by asking them.'
    ),
    gitaRefs: ['16.1', '16.2'],
    sources: [
      sb('9.21.2–11', 'https://vedabase.io/en/library/sb/9/21/11/'),
      sb('9.21.14–15', 'https://vedabase.io/en/library/sb/9/21/14/'),
    ],
  },
  dhyan: {
    kind: 'scriptural-example',
    title: c('बाण बनाने वाले का ध्यान', 'The arrow-maker’s attention'),
    imageStem: 'gita-saar-story-dhyan',
    imageCaption: c(
      'चित्र में: कारीगर बाण सीधा करता है; पीछे राजा की सवारी गुजरती है।',
      'In the painting: the artisan straightens a shaft as a royal party passes.'
    ),
    beats: [
      b(
        'एक साधारण काम',
        'An ordinary task',
        'भागवत में बाण बनाने वाले कारीगर का उदाहरण आता है। उसका ध्यान एक बाण को ठीक बनाने में लगा हुआ था।',
        'The Bhagavatam gives the example of an arrow-maker whose attention was absorbed in working carefully on a shaft.'
      ),
      b(
        'बाहर का बड़ा आकर्षण',
        'A passing attraction',
        'राजा उसके पास से गुजर गए, पर काम में एकाग्र कारीगर ने उन्हें देखा भी नहीं। बाहर की घटना बड़ी थी; उसका चुना हुआ ध्यान दूसरी ओर था।',
        'A king passed close by, but the absorbed artisan did not notice him. The outward event was grand; his chosen attention was elsewhere.'
      ),
      b(
        'उदाहरण की सीमा',
        'What the example illustrates',
        'ग्रंथ इस प्रसंग से एकाग्र चित्त समझाता है। किसी एक विषय पर चुने हुए समय में टिकने की क्षमता इसका बिंदु है।',
        'The text uses this to illustrate concentration. The point is the capacity to stay with one chosen object of attention for a period of time.'
      ),
    ],
    connection: c(
      'गीता 6.19 वायु-रहित स्थान में स्थिर दीपक का उदाहरण देती है। दीपक और कारीगर, दोनों चित्त की एकाग्रता को दृश्य बनाते हैं; ध्यान की दिनचर्या में 6.17 का संतुलन भी साथ है।',
      'Gita 6.19 uses a lamp in a windless place. Both lamp and artisan make concentration visible, alongside the balance in daily living described in 6.17.'
    ),
    everyday: c(
      'एक छोटा काम चुनें और कुछ देर उसे अकेले करें। ध्यान भटके तो उसे पहचानकर उसी काम पर लौटें।',
      'Choose a small task and give it a period of undivided attention. When attention wanders, notice it and return.'
    ),
    gitaRefs: ['6.19', '6.17'],
    sources: [sb('11.9.11–13', 'https://vedabase.io/en/library/sb/11/9/13/')],
  },
};
