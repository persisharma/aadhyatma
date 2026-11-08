import type { Lang } from '@/data/gita/language';
const keys = {
  language: [
    'भाषा चुनें',
    'Choose your language',
    'ભાષા પસંદ કરો',
    'ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ',
  ],
  welcome: [
    'आपकी भाषा में, आपका अध्यात्म।',
    'Your language. Your spiritual journey.',
    'તમારી ભાષામાં, તમારું અધ્યાત્મ.',
    'ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ, ನಿಮ್ಮ ಆಧ್ಯಾತ್ಮಿಕ ಪಯಣ.',
  ],
  languageNote: [
    'पढ़ने और सुनने के लिए अपनी भाषा चुनें।',
    'Choose how you would like to read and listen.',
    'વાંચવા અને સાંભળવા માટે તમારી ભાષા પસંદ કરો.',
    'ಓದಲು ಮತ್ತು ಕೇಳಲು ನಿಮ್ಮ ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ.',
  ],
  city: ['आपका शहर', 'Your city', 'તમારું શહેર', 'ನಿಮ್ಮ ನಗರ'],
  cityTitle: [
    'आपके शहर का सही पंचांग।',
    'Your city. Your Panchang.',
    'તમારા શહેરનું સાચું પંચાંગ.',
    'ನಿಮ್ಮ ನಗರದ ನಿಖರ ಪಂಚಾಂಗ.',
  ],
  cityNote: [
    'सूर्योदय और शुभ समय स्थान के साथ बदलते हैं।',
    'Sunrise and auspicious timings vary by location.',
    'સૂર્યોદય અને શુભ સમય સ્થાન પ્રમાણે બદલાય છે.',
    'ಸೂರ್ಯೋದಯ ಮತ್ತು ಶುಭ ಸಮಯ ಸ್ಥಳಕ್ಕೆ ಅನುಗುಣವಾಗಿ ಬದಲಾಗುತ್ತವೆ.',
  ],
  search: [
    'दूसरा शहर खोजें',
    'Find another city',
    'બીજું શહેર શોધો',
    'ಬೇರೆ ನಗರ ಹುಡುಕಿ',
  ],
  gps: [
    'मेरा स्थान उपयोग करें',
    'Use my location',
    'મારું સ્થાન વાપરો',
    'ನನ್ನ ಸ್ಥಳವನ್ನು ಬಳಸಿ',
  ],
  gpsFailed: [
    'स्थान नहीं मिला। शहर चुनकर आगे बढ़ सकते हैं।',
    'Location unavailable. Choose a city to continue.',
    'સ્થાન મળ્યું નથી. શહેર પસંદ કરો.',
    'ಸ್ಥಳ ಸಿಗಲಿಲ್ಲ. ನಗರ ಆಯ್ಕೆಮಾಡಿ.',
  ],
  next: ['आगे बढ़ें', 'Continue', 'આગળ વધો', 'ಮುಂದುವರಿಯಿರಿ'],
  widgets: ['आपकी होम स्क्रीन पर', 'On your Home Screen', 'તમારી હોમ સ્ક્રીન પર', 'ನಿಮ್ಮ ಹೋಮ್ ಸ್ಕ್ರೀನ್‌ನಲ್ಲಿ'],
  widgetsTitle: ['हर नज़र में थोड़ा अध्यात्म।', 'A little devotion, at a glance.', 'દરેક નજરમાં થોડું અધ્યાત્મ.', 'ಪ್ರತಿ ನೋಟದಲ್ಲಿ ಸ್ವಲ್ಪ ಅಧ್ಯಾತ್ಮ.'],
  widgetsNextAndroid: [
    'आगे बढ़ने पर फ़ोन श्लोक और पंचांग विजेट जोड़ने के लिए पूछेगा।',
    'Continue to set up Verse and Panchang widgets. Your phone will ask you to confirm.',
    'આગળ વધતાં ફોન શ્લોક અને પંચાંગ વિજેટ ઉમેરવાની પુષ્ટિ માગશે.',
    'ಮುಂದುವರಿದಾಗ ಶ್ಲೋಕ ಮತ್ತು ಪಂಚಾಂಗ ವಿಜೆಟ್ ಸೇರಿಸಲು ಫೋನ್ ದೃಢೀಕರಣ ಕೇಳುತ್ತದೆ.',
  ],
  widgetsNextIos: [
    'अगले पन्ने पर श्लोक और पंचांग विजेट जोड़ने का तरीका देखें।',
    'Next, see how to add Verse and Panchang widgets to your Home Screen.',
    'આગળ શ્લોક અને પંચાંગ વિજેટ ઉમેરવાની રીત જુઓ.',
    'ಮುಂದೆ ಹೋಮ್ ಸ್ಕ್ರೀನ್‌ಗೆ ಶ್ಲೋಕ ಮತ್ತು ಪಂಚಾಂಗ ವಿಜೆಟ್ ಸೇರಿಸುವ ವಿಧಾನ ನೋಡಿ.',
  ],
  widgetsManual: [
    'iPhone पर विजेट होम स्क्रीन से जोड़ें। फिर वेदांश में लौटकर आगे बढ़ें।',
    'Add widgets from your iPhone Home Screen, then return to Vedansh to continue.',
    'iPhoneની હોમ સ્ક્રીન પરથી વિજેટ ઉમેરો, પછી વેદાંશમાં પાછા આવી આગળ વધો.',
    'iPhone ಹೋಮ್ ಸ್ಕ್ರೀನ್‌ನಿಂದ ವಿಜೆಟ್ ಸೇರಿಸಿ, ನಂತರ ವೇದಾಂಶಕ್ಕೆ ಮರಳಿ ಮುಂದುವರಿಯಿರಿ.',
  ],
  reminder: [
    'आपके लिए एक स्मरण',
    'A moment for you',
    'તમારા માટે એક સ્મરણ',
    'ನಿಮಗಾಗಿ ಒಂದು ನೆನಪು',
  ],
  reminderTitle: [
    'दिन की शुरुआत, एक अच्छी सीख से।',
    'A calmer start. A little daily wisdom.',
    'દિવસની શરૂઆત, એક સારી શીખથી.',
    'ದಿನದ ಆರಂಭ, ಒಂದು ಒಳ್ಳೆಯ ಕಲಿಕೆಯಿಂದ.',
  ],
  reminderNote: [
    'भक्ति और पर्व के स्मरण चालू होंगे। सेटिंग्स से बंद कर सकते हैं।',
    'Enables devotional and festival reminders. Turn them off in Settings.',
    'ભક્તિ અને પર્વના સ્મરણ ચાલુ થશે. સેટિંગ્સમાં બંધ કરી શકો છો.',
    'ಭಕ್ತಿ ಮತ್ತು ಹಬ್ಬದ ನೆನಪುಗಳು ಆರಂಭವಾಗುತ್ತವೆ. ಸೆಟ್ಟಿಂಗ್‌ಗಳಲ್ಲಿ ನಿಲ್ಲಿಸಬಹುದು.',
  ],
  verse: [
    'रोज़ का श्लोक',
    'Your daily verse',
    'રોજનો શ્લોક',
    'ಪ್ರತಿದಿನದ ಶ್ಲೋಕ',
  ],
  daily: [
    'हर सुबह, अर्थ सहित',
    'Every morning, with meaning',
    'દરરોજ સવારે, અર્થ સાથે',
    'ಪ್ರತಿ ಬೆಳಿಗ್ಗೆ, ಅರ್ಥದೊಂದಿಗೆ',
  ],
  festivals: [
    'प्रमुख पर्व',
    'Major festivals',
    'મુખ્ય પર્વો',
    'ಪ್ರಮುಖ ಹಬ್ಬಗಳು',
  ],
  yes: ['हाँ, याद दिलाएँ', 'Yes, remind me', 'હા, યાદ અપાવો', 'ಹೌದು, ನೆನಪಿಸಿ'],
  later: ['अभी नहीं', 'Not now', 'હમણાં નહીં', 'ಈಗ ಬೇಡ'],
  never: ['फिर न पूछें', 'Don’t ask again', 'ફરી પૂછશો નહીં', 'ಮತ್ತೆ ಕೇಳಬೇಡಿ'],
  os: [
    'इसके बाद फ़ोन अनुमति माँगेगा',
    'Your phone will ask for permission next',
    'આ પછી ફોન પરવાનગી માગશે',
    'ಮುಂದೆ ಫೋನ್ ಅನುಮತಿ ಕೇಳುತ್ತದೆ',
  ],
  preview: [
    'सूचना की झलक',
    'Notification preview',
    'સૂચનાની ઝલક',
    'ಅಧಿಸೂಚನೆಯ ಮುನ್ನೋಟ',
  ],
  settings: [
    'सेटिंग्स में कभी भी बदल सकते हैं',
    'You can change this in Settings',
    'સેટિંગ્સમાં ગમે ત્યારે બદલી શકો છો',
    'ಸೆಟ್ಟಿಂಗ್‌ಗಳಲ್ಲಿ ಯಾವಾಗ ಬೇಕಾದರೂ ಬದಲಿಸಬಹುದು',
  ],
} as const;
export function quietCopy(lang: Lang, key: keyof typeof keys) {
  return keys[key][{ hi: 0, en: 1, gu: 2, kn: 3 }[lang]];
}
