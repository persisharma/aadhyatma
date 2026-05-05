export const SUPPORT_EMAIL = 'askvedansh.app@gmail.com';

export type HelpCopy = {
  title: string;
  disclaimerHeading: string;
  disclaimerParagraphs: string[];
  reportHeading: string;
  reportIntro: string;
  reportButtonLabel: string;
  fallbackLabel: string;
};

export const helpContent: { hi: HelpCopy; en: HelpCopy } = {
  hi: {
    title: 'सहायता',
    disclaimerHeading: 'अस्वीकरण एवं उचित प्रयोग',
    disclaimerParagraphs: [
      'वेदांश़ में प्रस्तुत समस्त ग्रंथ भारतीय परंपरा के सार्वजनिक डोमेन में उपलब्ध शास्त्रों से लिए गए हैं। अनुवाद एवं भावार्थ केवल शैक्षणिक एवं भक्तिमय उद्देश्य से प्रस्तुत हैं तथा संपादक के सर्वश्रेष्ठ प्रयास का प्रतिफल हैं; इनमें त्रुटियाँ हो सकती हैं अथवा अन्य सम्मानित टीकाओं से व्याख्या में अंतर भी हो सकता है।',
      'यह ऐप किसी प्रकार की विद्वत्तापूर्ण अथवा सांप्रदायिक प्रामाणिकता का दावा नहीं करता। पाठकों से अनुरोध है कि किसी भी निर्णायक पाठ हेतु प्रामाणिक गुरुजनों एवं मूल संस्कृत, अवधी अथवा व्रजभाषा स्रोतों का संदर्भ लें।',
      'समस्त सामग्री व्यक्तिगत अध्ययन एवं भक्ति हेतु उचित प्रयोग (Fair Use) तथा अव्यावसायिक उद्देश्य से प्रस्तुत है। यदि किसी सामग्री के प्रयोग में आपको आपत्ति हो अथवा आपके अधिकारों का उल्लंघन प्रतीत हो, तो कृपया askvedansh.app@gmail.com पर सम्पर्क करें ताकि शीघ्र समीक्षा एवं सुधार किया जा सके।',
      'इस ऐप का उपयोग करके आप स्वीकार करते हैं कि सामग्री "जैसी है वैसी" प्रदान की गई है, बिना किसी प्रकार की वारंटी के। वेदांश़, इसके अनुरक्षक एवं योगदानकर्ता इस सामग्री के उपयोग से उत्पन्न किसी भी निर्णय, कार्यवाही अथवा व्याख्या के लिए उत्तरदायी नहीं हैं।',
    ],
    reportHeading: 'त्रुटि की सूचना दें',
    reportIntro:
      'किसी श्लोक, चौपाई अथवा अर्थ में त्रुटि मिले तो कृपया हमें सूचित करें। नीचे दिए बटन से आपका मेल ऐप खुल जाएगा, जिसमें विषय एवं संरचना पहले से भरी होगी — आप केवल विवरण जोड़कर भेज सकते हैं।',
    reportButtonLabel: 'ईमेल खोलें',
    fallbackLabel: 'ईमेल भेजें — ',
  },
  en: {
    title: 'Help',
    disclaimerHeading: 'Disclaimer & Fair Use',
    disclaimerParagraphs: [
      'The texts presented in Vedansh are drawn from public-domain spiritual classics of Bharatiya tradition. Translations and explanatory notes are offered for educational and devotional purposes only and reflect the editor’s best effort; they may contain errors or interpretive choices that differ from other respected commentaries.',
      'Vedansh does not claim scholarly or sectarian authority. Readers are encouraged to consult qualified teachers and original Sanskrit, Awadhi, or Vraj-Bhasha sources for definitive readings.',
      'All material is presented under a fair-use, non-commercial framework for personal study and devotion. If you believe content has been used incorrectly or violates your rights, please write to askvedansh.app@gmail.com so we can review and correct it promptly.',
      'By using this app you agree that the content is provided “as is” without warranty of any kind. Vedansh, its maintainers, and contributors accept no liability for any decisions, actions, or interpretations arising from use of this material.',
    ],
    reportHeading: 'Report a Discrepancy',
    reportIntro:
      'Spotted an error in a verse, chaupai, or meaning? Let us know. The button below opens your mail app with a prefilled subject and template — just add the details and send.',
    reportButtonLabel: 'Open Email',
    fallbackLabel: 'Email us — ',
  },
};

export function buildDiscrepancyMailto(): string {
  const subject = encodeURIComponent('Vedansh App – Discrepancy Report');
  const body = encodeURIComponent(
    [
      'Please describe the discrepancy:',
      '',
      'Section / verse:',
      'What is wrong:',
      'Suggested correction:',
      '',
      '— Sent from Vedansh',
    ].join('\n')
  );
  return `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
}
