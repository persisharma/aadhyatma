import { upvasEntry } from '../_helpers';

/** Annual Janmashtami only; monthly Krishna Ashtami needs its own sourced entry. */
export default upvasEntry({
  id: 'janmashtami-upvas',
  fastType: 'phalahar',
  fastTypeNoteHi: 'मध्यरात्रि की जन्म पूजा तक फलाहार',
  fastTypeNoteEn: 'Fruit fare until the midnight birth puja',
  window: {
    kind: 'sunrise-to-parana',
    textHi: 'प्रातः संकल्प से निशीथ काल की कृष्ण जन्म पूजा तक व्रत रखें। समर्थ व्रती पूर्ण उपवास रखते हैं; सरल रूप में फल, मूल और दूध लिया जाता है, अन्न वर्जित रहता है।',
    textEn: 'Keep the fast from the morning sankalpa through Krishna’s birth puja in the nishith hour. A complete fast is the stricter standard; the simpler form permits fruits, roots, and milk while abstaining from grains.',
  },
  parana: {
    kind: 'text-only',
    textHi:
      'वैष्णव परम्परा में मध्यरात्रि की आरती के बाद अनाज-रहित प्रसाद से व्रत खोला जाता है और अन्न अगले दिन लिया जाता है। धर्मसिंधु-आधारित स्मार्त रीति में अगले दिन सूर्योदय के बाद अष्टमी तिथि और रोहिणी नक्षत्र की समाप्ति देखकर पारण किया जाता है।',
    textEn:
      'In the Vaishnava practice, the fast is opened with non-grain prasad after the midnight arati and grains are taken the next day. In the Dharmasindhu-based Smarta practice, parana follows the next sunrise after considering the endings of Ashtami tithi and Rohini nakshatra.',
  },
  strictnessHi:
    'कोई निर्जल और कोई फलाहार रूप में रखता है; व्रत का केंद्र मध्यरात्रि की जन्म पूजा है। परंपरा अनुसार बालक, वृद्ध एवं अस्वस्थ छूट रख सकते हैं।',
  strictnessEn:
    'Some keep it waterless and some on fruit fare; the midnight birth puja is the vrat’s centre. Traditionally children, the elderly, and the unwell may observe leniently.',
  whoObservesHi: 'वार्षिक जन्माष्टमी व्रत रखने वाले कृष्ण उपासक।',
  whoObservesEn: 'Krishna devotees observing the annual Janmashtami vrat.',
  status: 'verified',
  source: {
    referenceUrls: [
      'https://www.drikpanchang.com/dashavatara/lord-krishna/krishna-janmashtami-date-time.html',
      'https://www.iskconbangalore.org/wp-content/uploads/2019/02/English-Janmashtami-Vrata-Manual.pdf',
      'https://www.iskconbangalore.org/blog/sri-krishna-janmashtami-vrata/',
    ],
    verificationNote:
      'Verified 2026-08-19 against DrikPanchang and ISKCON Bangalore’s published vrata manual/guide: morning sankalpa, grain abstention and fasting levels, nishith puja, and the Vaishnava versus Dharmasindhu-based Smarta parana divergence. This entry is annual-only because monthly Krishna Ashtami has a distinct procedure not covered by both sources.',
  },
});
