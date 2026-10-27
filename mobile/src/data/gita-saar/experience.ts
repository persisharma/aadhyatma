/** Editorial learning frames. The verified scripture and Saar remain unchanged. */
export type LearningCopy = { hi: string; en: string };
export type GitaSaarExperience = {
  question: LearningCopy;
  category: 'mind' | 'life' | 'heart';
  title: LearningCopy;
  first: { title: LearningCopy; body: LearningCopy };
  second: { title: LearningCopy; body: LearningCopy };
  takeaway: LearningCopy;
  reflection: LearningCopy;
  refs: readonly string[];
};
const c = (hi: string, en: string): LearningCopy => ({ hi, en });
export const gitaSaarExperiences: Readonly<Record<string, GitaSaarExperience>> =
  {
    'true-prema': {
      question: c(
        'रिश्तों में प्रेम कैसे बढ़े?',
        'How can I love more deeply?'
      ),
      category: 'heart',
      title: c(
        'प्रेम, देखने का एक ढंग भी है।',
        'Love is also a way of seeing.'
      ),
      first: {
        title: c('अपने अनुभव को पहचानना', 'Recognise your experience'),
        body: c(
          'सुख में साथ और दुःख में सहारा हम अपने लिए चाहते हैं। अपना अनुभव दूसरे के अनुभव को समझने की शुरुआत हो सकता है।',
          'We want companionship in joy and support in difficulty. Our own experience can be a beginning for understanding another person.'
        ),
      },
      second: {
        title: c('दूसरे के लिए जगह', 'Make room for another'),
        body: c(
          'करुणा, मैत्री, क्षमा और प्रतिफल की अपेक्षा के बिना देना इस विषय में साथ आते हैं। प्रेम को व्यवहार में देखने का यह एक अवसर है।',
          'Compassion, friendship, forgiveness and giving without expecting a return meet in this reading. It invites us to notice love in how we act.'
        ),
      },
      takeaway: c(
        'आज किसी की बात पूरी सुनने का एक अवसर पहचानें।',
        'Notice one opportunity to hear someone out today.'
      ),
      reflection: c(
        'आज किसके सुख-दुःख को थोड़ा बेहतर समझना चाहता हूँ?',
        'Whose joy or difficulty would I like to understand better?'
      ),
      refs: ['6.32', '12.13', '17.20'],
    },
    'bhay-chinta': {
      question: c('भविष्य की चिंता होती है', 'I worry about the future'),
      category: 'mind',
      title: c(
        'बदलती परिस्थिति। लौटता हुआ मन।',
        'Changing circumstances. A mind that returns.'
      ),
      first: {
        title: c('जो आता-जाता है', 'What comes and goes'),
        body: c(
          'सुख-दुःख और अनुकूल-प्रतिकूल अनुभव बदलते रहते हैं। इस पढ़ने में पहले उनकी अनित्यता की ओर ध्यान जाता है।',
          'Pleasure, pain and favourable or difficult experiences change. This reading first turns our attention to their impermanence.'
        ),
      },
      second: {
        title: c('जिसका अभ्यास हो सकता है', 'What can be practised'),
        body: c(
          'कृष्ण चंचल मन की कठिनाई को स्वीकार करते हैं। अभ्यास, वैराग्य और भगवान् की ओर चित्त लौटाना इस विषय के अलग-अलग सूत्र हैं।',
          'Krishna acknowledges the difficulty of the restless mind. Practice, dispassion and turning toward the Divine are distinct threads in this reading.'
        ),
      },
      takeaway: c(
        'अभी की एक चिंता और अभी सम्भव एक छोटा कर्म अलग करके देखें।',
        'Notice one current worry and one small action available now.'
      ),
      reflection: c(
        'आज किस चिंता से मन बार-बार जुड़ रहा है?',
        'Which worry keeps drawing my attention today?'
      ),
      refs: ['2.14', '6.35', '9.22'],
    },
    shok: {
      question: c('किसी अपने की याद आती है', 'I miss someone I love'),
      category: 'heart',
      title: c(
        'वियोग के बीच, गीता का दृष्टिकोण।',
        'A Gita perspective in the midst of loss.'
      ),
      first: {
        title: c('बदलता शरीर', 'The changing body'),
        body: c(
          'बाल्यावस्था, युवावस्था और वृद्धावस्था का उदाहरण शरीर के बदलने की ओर ध्यान दिलाता है। यह विषय उसी से आगे बढ़ता है।',
          'Childhood, youth and old age draw attention to the body’s changes. This reading develops from that example.'
        ),
      },
      second: {
        title: c('आत्मा के बारे में शिक्षा', 'The teaching about the Self'),
        body: c(
          'इन श्लोकों में शरीर और आत्मा के बीच भेद समझाया गया है। यह आध्यात्मिक दृष्टि है; अपने दुःख को दबाने की परीक्षा नहीं।',
          'These verses distinguish the body from the Self. This is a spiritual perspective, not a test of whether you can suppress your grief.'
        ),
      },
      takeaway: c(
        'अपनी गति से पढ़ें। किसी प्रिय की याद को शब्द देने का स्थान यहाँ है।',
        'Read at your own pace. There is room to put a memory into words.'
      ),
      reflection: c(
        'आज अपने प्रिय की कौन-सी बात साथ रखना चाहता हूँ?',
        'What would I like to carry with me about someone dear?'
      ),
      refs: ['2.13', '2.20', '2.22'],
    },
    krodh: {
      question: c('क्रोध पर काबू कैसे पाऊँ?', 'How do I meet my anger?'),
      category: 'mind',
      title: c(
        'प्रतिक्रिया से पहले की कड़ी देखें।',
        'Notice the link before the reaction.'
      ),
      first: {
        title: c('जहाँ ध्यान अटकता है', 'Where attention gets caught'),
        body: c(
          'विषय का बार-बार चिंतन, आसक्ति, कामना और फिर क्रोध की कड़ी इन श्लोकों में खुलती है। अंतिम प्रतिक्रिया पूरी कहानी नहीं है।',
          'These verses trace dwelling on an object, attachment, desire and anger. The final reaction is only part of that sequence.'
        ),
      },
      second: {
        title: c('पहचान का अवसर', 'An opportunity to notice'),
        body: c(
          'इन्द्रियों और मन की ओर ध्यान देना उस कड़ी को पहले पहचानने का तरीका बन सकता है। यह मनन है, तुरंत क्रोध मिटने का वादा नहीं।',
          'Attention to the senses and mind can help us notice the sequence earlier. This is a reflection, not a promise that anger will disappear at once.'
        ),
      },
      takeaway: c(
        'एक तीखी प्रतिक्रिया के पीछे की अपेक्षा को पहचानकर देखें।',
        'Look for the expectation behind one sharp reaction.'
      ),
      reflection: c(
        'कौन-सी अपेक्षा पूरी न होने पर मेरे भीतर क्रोध उठता है?',
        'Which unmet expectation tends to bring up anger in me?'
      ),
      refs: ['2.62', '2.63', '3.41'],
    },
    karma: {
      question: c(
        'मेहनत करूँ, पर फल की चिंता?',
        'What if my effort is not enough?'
      ),
      category: 'life',
      title: c(
        'आप सींच सकते हैं। खिलना समय के साथ होता है।',
        'You can tend the garden. Growth takes its own time.'
      ),
      first: {
        title: c('आपका कर्म', 'Your effort'),
        body: c(
          'जैसे पौधे को पानी देना और मिट्टी की देखभाल करना। अपने काम में तैयारी, ईमानदारी और पूरा प्रयास देना।',
          'Like watering a plant and caring for the soil: bring preparation, honesty and wholehearted effort to your work.'
        ),
      },
      second: {
        title: c('परिणाम', 'The outcome'),
        body: c(
          'मौसम और फल आने का समय पूरी तरह आपके बस में नहीं। परिणाम की आसक्ति को अपने प्रयास पर हावी न होने देना इस उदाहरण का आशय है।',
          'The weather and season of fruit are not fully in your hands. The example invites us not to let attachment to results overwhelm our effort.'
        ),
      },
      takeaway: c(
        'एक काम चुनें जिसे आज पूरे मन से करना सम्भव है।',
        'Choose one task you can give your whole attention to today.'
      ),
      reflection: c(
        'आज किस कर्म पर अपना पूरा ध्यान देना चाहता हूँ?',
        'Which action would I like to give my full attention to today?'
      ),
      refs: ['2.47', '2.48', '3.19'],
    },
    guna: {
      question: c('कभी उत्साह, कभी आलस क्यों?', 'Why does my energy change?'),
      category: 'life',
      title: c(
        'मनःस्थिति को पहचानें, पहचान न बना लें।',
        'Notice a state without making it your identity.'
      ),
      first: {
        title: c('तीन प्रवृत्तियों का वर्णन', 'Three tendencies described'),
        body: c(
          'सत्त्व की स्पष्टता, रजस् की तृष्णा और तमस् के मोह का वर्णन यहाँ आता है। अलग-अलग समय पर उनका प्रभाव बदलता है।',
          'This reading describes sattva’s clarity, rajas’s craving and tamas’s delusion. Their influence changes at different times.'
        ),
      },
      second: {
        title: c('देखने की दूरी', 'Room to observe'),
        body: c(
          'इन नामों को किसी का स्थायी मूल्यांकन बनाने के बजाय अभी के अनुभव को देखने की भाषा की तरह पढ़ें।',
          'Read these terms as a language for observing current experience, rather than a permanent judgement of anyone.'
        ),
      },
      takeaway: c(
        'आज स्पष्टता, बेचैनी या जड़ता में से क्या दिख रहा है?',
        'What do you notice today: clarity, restlessness or inertia?'
      ),
      reflection: c(
        'अभी अपने मन और दिनचर्या में क्या देख रहा हूँ?',
        'What am I noticing in my mind and routine right now?'
      ),
      refs: ['14.6', '14.7', '14.8', '14.10'],
    },
    man: {
      question: c('मन बार-बार भटकता है', 'My mind keeps wandering'),
      category: 'mind',
      title: c('भटकना देखें। फिर लौटें।', 'Notice the wandering. Then return.'),
      first: {
        title: c('चंचलता का स्वीकार', 'Acknowledge restlessness'),
        body: c(
          'अर्जुन मन को हवा की तरह चंचल बताते हैं। कृष्ण इस कठिनाई को नकारते नहीं। शुरुआत यहीं से होती है।',
          'Arjuna describes the mind as restless as the wind. Krishna does not deny the difficulty. That is where this reading begins.'
        ),
      },
      second: {
        title: c('बार-बार लौटने का अभ्यास', 'Practise returning'),
        body: c(
          'मन जहाँ भटके, वहाँ से लौटाने और अभ्यास-वैराग्य के सूत्र साथ पढ़ें। दिनचर्या में संतुलन भी इस विषय का हिस्सा है।',
          'Read bringing the wandering mind back alongside practice and dispassion. Balance in daily life is part of the theme too.'
        ),
      },
      takeaway: c(
        'अगली बार ध्यान भटके, पहचानने के उस क्षण को देखें।',
        'The next time attention wanders, notice the moment of recognition.'
      ),
      reflection: c(
        'मन भटकने पर किस अभ्यास की ओर लौटना चाहता हूँ?',
        'What practice would I like to return to when my mind wanders?'
      ),
      refs: ['6.17', '6.26', '6.34', '6.35'],
    },
    sanshay: {
      question: c('सही निर्णय कैसे लूँ?', 'How do I make a decision?'),
      category: 'mind',
      title: c('प्रश्न से समझ की ओर।', 'From a question toward understanding.'),
      first: {
        title: c('प्रश्न रखने का साहस', 'Make room for the question'),
        body: c(
          'अर्जुन अपनी उलझन बताते हैं और मार्गदर्शन माँगते हैं। प्रश्न छिपाने के बजाय उसे स्पष्ट रखने का स्थान यहाँ है।',
          'Arjuna names his confusion and asks for guidance. This reading makes room for stating a question clearly.'
        ),
      },
      second: {
        title: c('समझकर निर्णय', 'Reflect before deciding'),
        body: c(
          'अंतिम अध्याय में विचार करने और फिर इच्छा के अनुसार कर्म करने का निमंत्रण है। प्रश्न, विवेक और जिम्मेदारी साथ रहते हैं।',
          'The final chapter invites reflection and then action according to one’s choice. Questions, discernment and responsibility remain together.'
        ),
      },
      takeaway: c(
        'निर्णय से पहले अपना असली प्रश्न एक वाक्य में लिखकर देखें।',
        'Try putting your actual question into one sentence before deciding.'
      ),
      reflection: c(
        'जिस निर्णय में उलझा हूँ, उसमें क्या स्पष्ट करना है?',
        'What needs to become clearer in the decision I am facing?'
      ),
      refs: ['2.7', '18.63', '18.73'],
    },
    sharanagati: {
      question: c('भरोसा कैसे करूँ?', 'How can I learn to trust?'),
      category: 'heart',
      title: c(
        'श्रद्धा और समर्पित कर्म साथ।',
        'Faith alongside dedicated action.'
      ),
      first: {
        title: c('श्रद्धा की दिशा', 'The direction of faith'),
        body: c(
          'श्रद्धा, ज्ञान और भगवान् की ओर चित्त देने की बातें इस विषय में साथ आती हैं। वे एक सूत्र के अलग-अलग पहलू हैं।',
          'Faith, knowledge and directing the mind toward the Divine appear as different aspects of a shared thread.'
        ),
      },
      second: {
        title: c('कर्म का अर्पण', 'Offering one’s work'),
        body: c(
          'कर्मों का अर्पण और शरण में जाना यहाँ प्रमुख सूत्र हैं। यह संपादकीय मनन अपने कर्म की जिम्मेदारी छोड़ने का प्रस्ताव नहीं है।',
          'Offering actions and taking refuge are central threads here. This editorial reflection does not suggest abandoning responsibility for one’s actions.'
        ),
      },
      takeaway: c(
        'आज किस कर्म को समर्पण के भाव से करना चाहेंगे?',
        'What action would you like to approach with dedication today?'
      ),
      reflection: c(
        'मेरे लिए श्रद्धा आज के व्यवहार में कैसी दिख सकती है?',
        'What might faith look like in my actions today?'
      ),
      refs: ['4.39', '12.6', '18.66'],
    },
    sthitaprajna: {
      question: c('भीतर से स्थिर कैसे रहूँ?', 'How do I stay steady within?'),
      category: 'mind',
      title: c(
        'परिस्थिति बदलती है। दृष्टि को देखें।',
        'Circumstances change. Notice your response.'
      ),
      first: {
        title: c('सुख और दुःख', 'Pleasure and difficulty'),
        body: c(
          'अर्जुन स्थिर बुद्धि वाले व्यक्ति का व्यवहार पूछते हैं। उत्तर सुख की लालसा और दुःख की उद्विग्नता से आरम्भ होता है।',
          'Arjuna asks how a person of steady wisdom behaves. The answer begins with craving pleasure and being shaken by difficulty.'
        ),
      },
      second: {
        title: c('स्थिरता का चित्र', 'A portrait of steadiness'),
        body: c(
          'कछुए और समुद्र के उदाहरण अपने अनुभव को देखने के संकेत हो सकते हैं। उन्हें अपनी प्रगति की कठोर परीक्षा बनाना आवश्यक नहीं।',
          'The tortoise and ocean can help us observe experience without becoming a harsh test of our progress.'
        ),
      },
      takeaway: c(
        'आज की प्रशंसा या आलोचना पर अपनी प्रतिक्रिया को एक बार देखें।',
        'Notice your response to one moment of praise or criticism today.'
      ),
      reflection: c(
        'किस परिस्थिति में थोड़ी समता याद रखना चाहता हूँ?',
        'In which situation would I like to remember a little evenness?'
      ),
      refs: ['2.54', '2.56', '2.58', '2.70'],
    },
    'kamna-santosh': {
      question: c('जो है, उसमें संतोष कैसे हो?', 'How do I find contentment?'),
      category: 'life',
      title: c(
        'इच्छा उठती है। आसक्ति को पहचानें।',
        'Desire arises. Notice attachment.'
      ),
      first: {
        title: c('बार-बार और की चाह', 'A craving that keeps growing'),
        body: c(
          'अग्नि का उदाहरण उस कामना के लिए आता है जो और माँगती है। बाहरी सुखों के आरम्भ और अंत की ओर भी ध्यान दिलाया गया है।',
          'Fire illustrates a craving that keeps asking for more. The reading also draws attention to the beginning and end of outward pleasures.'
        ),
      },
      second: {
        title: c('भीतर की ओर दृष्टि', 'Turn attention inward'),
        body: c(
          'चाह की पकड़ और भीतर के सुख की बात साथ पढ़ें। यह अपनी सभी व्यावहारिक आवश्यकताएँ छोड़ने की सूची नहीं है।',
          'Read the grip of desire alongside inward joy. This is not a checklist for giving up every practical need.'
        ),
      },
      takeaway: c(
        'एक आवश्यकता और एक बार-बार लौटती चाह में अंतर देखें।',
        'Notice the difference between one need and one recurring craving.'
      ),
      reflection: c(
        'किस चाह के साथ मेरी बेचैनी सबसे अधिक जुड़ती है?',
        'Which recurring desire is most connected with my restlessness?'
      ),
      refs: ['3.39', '5.21', '5.22', '2.70'],
    },
    safalta: {
      question: c('असफलता से कैसे उबरूँ?', 'How do I meet failure?'),
      category: 'life',
      title: c(
        'प्रयास पूरा। दृष्टि में समता।',
        'Wholehearted effort. An even perspective.'
      ),
      first: {
        title: c('कर्म की ओर ध्यान', 'Attention to action'),
        body: c(
          'कर्म में लगना और कुशलता इस विषय में साथ हैं। परिणाम के विचारों के साथ किए जा सकने वाले कर्म को भी देखा जा सकता है।',
          'Action and skill belong together here. We can notice available work alongside our thoughts about results.'
        ),
      },
      second: {
        title: c('जय और पराजय', 'Success and failure'),
        body: c(
          'जय-पराजय और सिद्धि-असिद्धि में समता की शिक्षा आती है। इसे भावनाएँ न होने की शर्त की जगह अपना व्यवहार देखने का निमंत्रण समझें।',
          'The verses teach evenness in victory and defeat, success and failure. Read this as an invitation to examine your response, not a demand to have no feelings.'
        ),
      },
      takeaway: c(
        'परिणाम से अलग, अपने प्रयास से सीखी एक बात देखें।',
        'Notice something learned from your effort, apart from the result.'
      ),
      reflection: c(
        'परिणाम चाहे जो रहा हो, इस प्रयास से मैंने क्या सीखा?',
        'Whatever the outcome, what did I learn from this effort?'
      ),
      refs: ['2.38', '2.47', '2.48', '18.26'],
    },
    atma: {
      question: c('मैं वास्तव में कौन हूँ?', 'Who am I, really?'),
      category: 'heart',
      title: c(
        'बदलने वाले से, आत्मा के प्रश्न तक।',
        'From what changes to the question of the Self.'
      ),
      first: {
        title: c('शरीर का परिवर्तन', 'The body’s changes'),
        body: c(
          'शरीर के अंत और पुराने वस्त्रों के उदाहरण शरीर और आत्मा के बीच भेद को समझाने के लिए आते हैं।',
          'The end of the body and the example of worn clothes explain the distinction between the body and the Self.'
        ),
      },
      second: {
        title: c('आत्मा का स्वरूप', 'The nature of the Self'),
        body: c(
          'अजन्मा, अविनाशी और अव्यक्त जैसे शब्द यहाँ आत्मा के लिए प्रयुक्त हैं। पूरे श्लोक और व्याख्या के साथ पढ़ने का मार्ग उपलब्ध है।',
          'Unborn, imperishable and unmanifest describe the Self here. The full verse and commentary remain available for context.'
        ),
      },
      takeaway: c(
        'एक शब्द चुनें जिसे गीता की विस्तृत व्याख्या में समझना चाहेंगे।',
        'Choose one term to explore in the full Gita commentary.'
      ),
      reflection: c(
        'आत्मा के बारे में किस प्रश्न को और समझना चाहता हूँ?',
        'Which question about the Self would I like to explore further?'
      ),
      refs: ['2.18', '2.20', '2.22', '2.25'],
    },
    akela: {
      question: c('क्या मैं अकेला हूँ?', 'Am I alone?'),
      category: 'heart',
      title: c(
        'सबमें उपस्थिति का सूत्र।',
        'The thread of presence in all beings.'
      ),
      first: {
        title: c('भीतर की उपस्थिति', 'Presence within'),
        body: c(
          'भगवान् के सब प्राणियों के हृदय में स्थित होने का कथन इस विषय का आधार है। स्मृति, ज्ञान और आत्मा के सूत्र भी साथ आते हैं।',
          'The Divine dwelling in the hearts of all beings grounds this theme, alongside memory, knowledge and the Self.'
        ),
      },
      second: {
        title: c('जुड़ाव की दृष्टि', 'A perspective of connection'),
        body: c(
          'सबमें भगवान् को देखने की शिक्षा आध्यात्मिक जुड़ाव का दृष्टिकोण देती है। अपना अनुभव किसी विश्वसनीय व्यक्ति से बाँटने के लिए भी स्थान है।',
          'Seeing the Divine in all offers a spiritual perspective on connection. There is also room to share your experience with someone you trust.'
        ),
      },
      takeaway: c(
        'ऐसा एक जुड़ाव याद करें जिसमें अपनापन महसूस होता है।',
        'Recall one connection in which you feel a sense of belonging.'
      ),
      reflection: c(
        'आज किसके साथ अपना एक विचार बाँटना चाहूँगा?',
        'Who would I like to share a thought with today?'
      ),
      refs: ['6.30', '10.20', '18.61'],
    },
    daivi: {
      question: c('अच्छा जीवन कैसे जिऊँ?', 'How can I live well?'),
      category: 'life',
      title: c(
        'गुणों को छोटे व्यवहार में देखें।',
        'Notice qualities in small everyday actions.'
      ),
      first: {
        title: c('शरीर और वाणी', 'Body and speech'),
        body: c(
          'अहिंसा, सत्य और वाणी के संयम जैसे गुण यहाँ आते हैं। उन्हें केवल नामों की सूची की जगह व्यवहार में भी देखा जा सकता है।',
          'Non-harm, truth and restraint in speech appear here. We can notice them in actions rather than only as names in a list.'
        ),
      },
      second: {
        title: c('मन का भाव', 'The disposition of the mind'),
        body: c(
          'विनम्रता, सरलता और मन की प्रसन्नता के सूत्र भी साथ हैं। एक गुण को अपने दिन के छोटे प्रसंग से जोड़कर देखें।',
          'Humility, straightforwardness and serenity of mind are connected threads. Consider one quality through a small moment in your day.'
        ),
      },
      takeaway: c(
        'एक बातचीत में सत्य और कोमलता को साथ रखने का अवसर देखें।',
        'Notice an opportunity to bring truth and gentleness together in conversation.'
      ),
      reflection: c(
        'आज किस गुण को अपने व्यवहार में याद रखना चाहता हूँ?',
        'Which quality would I like to remember in my actions today?'
      ),
      refs: ['16.1', '16.2', '17.14', '17.15', '17.16'],
    },
    dhyan: {
      question: c('ध्यान कहाँ से शुरू करूँ?', 'Where do I begin meditation?'),
      category: 'mind',
      title: c(
        'स्थान, अभ्यास और दिनचर्या का संतुलन।',
        'A setting, a practice and a balanced day.'
      ),
      first: {
        title: c('अभ्यास का वातावरण', 'The setting for practice'),
        body: c(
          'शांत स्थान, आसन और एकाग्रता से यह विषय शुरू होता है। आगे दीपक की लौ का उदाहरण चित्त की स्थिरता के लिए आता है।',
          'A quiet place, a seat and concentration open this reading. A lamp in a windless place later illustrates steadiness of attention.'
        ),
      },
      second: {
        title: c('दिनभर का संतुलन', 'Balance through the day'),
        body: c(
          'आहार, विहार, कर्म, नींद और जागने का संतुलन भी ध्यान के साथ रखा गया है। अभ्यास दिनचर्या से अलग खड़ा नहीं है।',
          'Food, rest, work, sleep and waking are considered alongside meditation. Practice is connected with daily life.'
        ),
      },
      takeaway: c(
        'अभ्यास के लिए अपने अनुकूल एक शांत समय और स्थान पहचानें।',
        'Notice a quiet time and place that suit your practice.'
      ),
      reflection: c(
        'मेरी दिनचर्या में अभ्यास के लिए कौन-सा छोटा स्थान बन सकता है?',
        'Where could a small space for practice fit into my day?'
      ),
      refs: ['6.10', '6.11', '6.19', '6.17'],
    },
  };
