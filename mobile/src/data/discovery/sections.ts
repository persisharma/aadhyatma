import type { HomeStackParamList, MoreStackParamList, PanchangStackParamList } from '@/navigation/types';
export type ExploreTarget = {
    tab: 'HomeTab';
    screen: keyof HomeStackParamList;
    params?: object;
} | {
    tab: 'MoreTab';
    screen: keyof MoreStackParamList;
    params?: object;
} | {
    tab: 'PanchangTab';
    screen: keyof PanchangStackParamList;
    params?: object;
};
export type ExploreSection = {
    id: string;
    title: [
        string,
        string
    ];
    hook: [
        string,
        string
    ];
    description: [
        string,
        string
    ];
    cta: [
        string,
        string
    ];
    examples: [
        string,
        string
    ][];
    target: ExploreTarget;
    routes: readonly string[];
    kind: 'list' | 'mala' | 'days' | 'questions' | 'chart' | 'steps' | 'chips' | 'wish' | 'compass' | 'widgets';
    priority: number;
};
const home = (screen: keyof HomeStackParamList, params?: object): ExploreTarget => ({ tab: 'HomeTab', screen, params });
const more = (screen: keyof MoreStackParamList): ExploreTarget => ({ tab: 'MoreTab', screen });
const sky = (screen: keyof PanchangStackParamList): ExploreTarget => ({ tab: 'PanchangTab', screen });
export const EXPLORE_SECTIONS: readonly ExploreSection[] = [
    { id: 'routine', title: ['नित्य साधना', 'Daily Practice'], hook: ['हर दिन, भक्ति का साथ।', 'A little devotion. Every day.'], description: ['पाठ और जप को अपनी दिनचर्या का हिस्सा बनाएँ।', 'Make daily readings and japa part of your routine.'], cta: ['अपनी साधना चुनें', 'Choose your practice'], examples: [['हनुमान चालीसा', 'Hanuman Chalisa']], target: home('RoutineToday'), routes: ['RoutineToday', 'RoutineList', 'RoutineCreate', 'RoutineDetail', 'RoutineAddItems'], kind: 'list', priority: 90 },
    { id: 'japam', title: ['जप माला', 'Japa Mala'], hook: ['मन को एक विराम दें।', 'A quiet moment. One mantra.'], description: ['108 मनकों की माला। हर मंत्र की गिनती अलग रखें।', 'A 108-bead mala, with a separate count for each mantra.'], cta: ['जप आरम्भ करें', 'Begin japa'], examples: [['ॐ नमः शिवाय', 'Om Namah Shivaya']], target: home('CategoryList', { categoryId: 'japam' }), routes: ['JapamCounter'], kind: 'mala', priority: 85 },
    { id: 'puja', title: ['पूजा विधि', 'Guided Pujas'], hook: ['पूजा में हर चरण साथ।', 'Your devotion. A little guidance.'], description: ['सामग्री से आरती तक, पूजा का हर चरण साथ पाएँ।', 'Follow every step, from preparation to aarti.'], cta: ['पूजा चुनें', 'Choose a puja'], examples: [['श्री सत्यनारायण पूजा', 'Shri Satyanarayan Puja']], target: home('VidhiCatalog'), routes: ['VidhiCatalog', 'VidhiDetail', 'VidhiConduct'], kind: 'list', priority: 75 },
    { id: 'sankalp', title: ['संकल्प', 'Sadhana Programs'], hook: ['एक संकल्प से शुरुआत।', 'Begin with an intention.'], description: ['तैयार साधना चुनें और हर दिन एक कदम आगे बढ़ें।', 'Choose a guided practice and take one step each day.'], cta: ['संकल्प देखें', 'Explore programs'], examples: [['हनुमान चालीसा · 41 दिन', 'Hanuman Chalisa · 41 days']], target: home('SadhanaPrograms'), routes: ['SadhanaPrograms', 'SadhanaProgramDetail'], kind: 'days', priority: 70 },
    { id: 'gita', title: ['गीता सार', 'Gita Saar'], hook: ['आज के प्रश्न, गीता के साथ।', 'Ancient wisdom. Everyday questions.'], description: ['जीवन के प्रश्नों पर गीता की सीख सरल भाषा में पढ़ें।', 'Find the Gita’s wisdom on everyday questions, in simple words.'], cta: ['गीता सार पढ़ें', 'Read Gita Saar'], examples: [['भय और चिंता', 'Fear and worry']], target: home('GitaSaarChapters'), routes: ['GitaSaarChapters', 'GitaSaarReader'], kind: 'list', priority: 70 },
    { id: 'jijnasa', title: ['जिज्ञासा', 'Ask Vedansh'], hook: ['मन में प्रश्न है?', 'What’s on your mind?'], description: ['तिथि, व्रत और मुहूर्त से जुड़े प्रश्न पूछें।', 'Ask about tithi, vrat and auspicious times.'], cta: ['अपना प्रश्न पूछें', 'Ask a question'], examples: [['आज कौन सी तिथि है?', 'What is today’s tithi?']], target: home('TodayVidhan'), routes: ['TodayVidhan', 'Prashna'], kind: 'questions', priority: 65 },
    { id: 'kundali', title: ['कुंडली', 'Kundali'], hook: ['अपनी कुंडली को जानें।', 'Discover your birth chart.'], description: ['जन्म तिथि, समय और स्थान से अपनी कुंडली देखें।', 'Explore your birth chart using your birth date, time and place.'], cta: ['कुंडली बनाएँ', 'Create your kundali'], examples: [['तिथि · समय · स्थान', 'Date · time · place']], target: sky('Kundali'), routes: ['Kundali', 'KundaliReport'], kind: 'chart', priority: 60 },
    { id: 'pitru', title: ['पितृ स्मरण', 'Pitru Smaran'], hook: ['स्मृतियाँ रहें साथ।', 'Keep their memory close.'], description: ['प्रियजनों की तिथि सहेजें। हर वर्ष श्राद्ध की तारीख़ जानें।', 'Save a loved one’s tithi and find the shraddha date each year.'], cta: ['स्मरण जोड़ें', 'Add a remembrance'], examples: [['तिथि चुनें', 'Choose tithi'], ['विवरण सहेजें', 'Save details'], ['वार्षिक तिथि देखें', 'See yearly date']], target: more('PitruSmaranList'), routes: ['PitruSmaranList', 'PitruSmaranEdit', 'PitruSmaranDetail'], kind: 'steps', priority: 55 },
    { id: 'muhurat', title: ['शुभ मुहूर्त', 'Muhurat Finder'], hook: ['शुभ शुरुआत का समय।', 'A time for new beginnings.'], description: ['अपने अवसर के लिए आने वाले दिनों में शुभ समय खोजें।', 'Find an auspicious time for your occasion in the days ahead.'], cta: ['मुहूर्त खोजें', 'Find a muhurat'], examples: [['गृह प्रवेश', 'Griha pravesh'], ['विवाह', 'Vivah'], ['वाहन क्रय', 'New vehicle']], target: sky('MuhuratFinder'), routes: ['MuhuratFinder', 'MuhuratResults'], kind: 'chips', priority: 55 },
    { id: 'daan', title: ['दान-पुण्य', 'Daan Punya'], hook: ['श्रद्धा से एक छोटा प्रयास।', 'A small act. A heartfelt intention.'], description: ['जप, व्रत और दान का महत्व समझें और अपनी यात्रा चुनें।', 'Understand japa, vrat and daan, and choose your journey.'], cta: ['दान-पुण्य जानें', 'Explore Daan Punya'], examples: [['जप', 'Japa'], ['व्रत', 'Vrat'], ['दान', 'Daan']], target: home('DaanPunya'), routes: ['DaanPunya', 'DaanJourney', 'DaanLedger'], kind: 'chips', priority: 50 },
    { id: 'theerth', title: ['तीर्थ यात्रा', 'Sacred Journeys'], hook: ['एक यात्रा, भीतर तक।', 'A journey that stays with you.'], description: ['भारत के पवित्र धामों और मंदिरों से परिचय करें।', 'Discover sacred temples and dhams across Bharat.'], cta: ['तीर्थ देखें', 'Explore sacred places'], examples: [['ज्योतिर्लिंग', 'Jyotirlingas'], ['चार धाम', 'Char Dham']], target: home('TheerthMap'), routes: ['TheerthMap', 'TheerthDetail'], kind: 'list', priority: 50 },
    { id: 'rashifal', title: ['दैनिक राशिफल', 'Daily Rashifal'], hook: ['आपकी राशि, आज का साथ।', 'Your rashi. A daily reading.'], description: ['अपनी राशि चुनें और आज का राशिफल पढ़ें।', 'Choose your rashi and read today’s rashifal.'], cta: ['राशि चुनें', 'Choose your rashi'], examples: [['मेष', 'Aries'], ['वृषभ', 'Taurus'], ['मिथुन', 'Gemini']], target: sky('Rashifal'), routes: ['Rashifal'], kind: 'chips', priority: 50 },
    { id: 'kids', title: ['बच्चों की कहानियाँ', 'Stories for Kids'], hook: ['कहानी में सीख, साथ में प्यार।', 'Little stories. Shared moments.'], description: ['चित्रों वाली देव-कथाएँ बच्चों के साथ पढ़ें। चार भाषाओं में।', 'Read illustrated devotional stories together, in four languages.'], cta: ['कहानियाँ देखें', 'Explore stories'], examples: [['माँ दुर्गा के नौ रूप', 'Nine Forms of Maa Durga']], target: home('KidsStoryLibrary'), routes: ['KidsStoryLibrary', 'KidsStoryDeity', 'KidsStoryReader'], kind: 'list', priority: 45 },
    { id: 'suvichar', title: ['सुविचार', 'Suvichar Wishes'], hook: ['शुभ भाव, अपनों के नाम।', 'A thoughtful wish. Made yours.'], description: ['भक्ति भरा संदेश चुनें और अपने नाम से साझा करें।', 'Choose a devotional greeting and share it with your name.'], cta: ['संदेश बनाएँ', 'Create a greeting'], examples: [['जय श्री राम', 'Jai Shri Ram']], target: home('Suvichar'), routes: ['Suvichar'], kind: 'wish', priority: 45 },
    { id: 'vastu', title: ['वास्तु दिशा', 'Vastu Compass'], hook: ['दिशाओं से परिचय करें।', 'Find your bearings.'], description: ['कम्पास से दिशा पहचानें और गृह वास्तु के बारे में जानें।', 'Use the compass to find directions and explore home vastu.'], cta: ['दिशा देखें', 'Open compass'], examples: [['दिशा कम्पास', 'Direction compass']], target: more('VastuDisha'), routes: ['VastuDisha', 'GharVastuList', 'GharVastuDetail', 'GharVastuCapture'], kind: 'compass', priority: 40 },
    { id: 'widgets', title: ['होम-स्क्रीन विजेट', 'Home-Screen Widgets'], hook: ['भक्ति, एक नज़र में।', 'Devotion at a glance.'], description: ['श्लोक और पंचांग को अपनी होम स्क्रीन पर जगह दें।', 'Keep a verse and Panchang on your home screen.'], cta: ['विजेट देखें', 'Explore widgets'], examples: [['आज का श्लोक', 'Daily verse'], ['पंचांग', 'Panchang']], target: more('WidgetGallery'), routes: ['WidgetGallery'], kind: 'widgets', priority: 35 },
];
export function sectionForRoute(name: string, params?: object): string | undefined {
    if (name.startsWith('GharVastu'))
        return 'vastu';
    if (name === 'CategoryList' && params && 'categoryId' in params && params.categoryId === 'japam')
        return 'japam';
    return EXPLORE_SECTIONS.find(s => s.routes.includes(name))?.id;
}
