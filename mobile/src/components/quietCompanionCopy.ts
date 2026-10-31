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
