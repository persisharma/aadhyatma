/**
 * First-launch feature tour content.
 *
 * The tour drives the user through the *actual* screens — each step
 * navigates the user to a real surface, then overlays a tooltip
 * anchored to the relevant region. Copy is bilingual since the user has
 * not yet picked a reading language at first launch (design.md §1).
 */

import type { HomeStackParamList, MoreStackParamList, TabParamList } from '@/navigation/types';

/**
 * Where to send the user for this step. Mirrors the nested-route shape
 * expected by `navigationRef.dispatch(CommonActions.navigate(...))`.
 */
export type TourNavTarget =
  | { name: 'HomeTab'; params?: { screen: keyof HomeStackParamList; params?: object } }
  | { name: 'MoreTab'; params?: { screen: keyof MoreStackParamList; params?: object } }
  | { name: 'DailyBhaktiTab' }
  | { name: 'PanchangTab' }
  | { name: 'AudioTab' };

/** Where the tooltip card sits relative to the screen. */
export type TourAnchor = 'top' | 'center' | 'bottom';

/** Direction the pointer arrow on the tooltip card points. */
export type TourPointer = 'up' | 'down' | 'none';

export type TourStep = {
  id: string;
  /** Screen to navigate to before showing this step's tooltip. */
  navigateTo: TourNavTarget;
  /** Where the tooltip card sits on the screen. */
  anchor: TourAnchor;
  /** Direction the pointer triangle on the card points. */
  pointer: TourPointer;
  titleHi: string;
  titleEn: string;
  bodyHi: string;
  bodyEn: string;
};

export const tourSteps: readonly TourStep[] = [
  {
    id: 'home',
    navigateTo: { name: 'HomeTab', params: { screen: 'Home' } },
    anchor: 'bottom',
    pointer: 'up',
    titleHi: 'मुख पृष्ठ',
    titleEn: 'Home',
    bodyHi:
      'ऊपर सभी श्रेणियाँ — चालीसा, ग्रंथ, स्तोत्रम्, आरती, जप — साथ ही "आज की खोज" कार्ड नए-नए पाठ सुझाते हैं।',
    bodyEn:
      'These tiles group every text by category. The Discover carousel at the top surfaces new content each day — swipe to see suggested reads.',
  },
  {
    id: 'panchang',
    navigateTo: { name: 'PanchangTab' },
    anchor: 'bottom',
    pointer: 'up',
    titleHi: 'पंचांग',
    titleEn: 'Panchang',
    bodyHi:
      'आज की तिथि, नक्षत्र, व्रत और मुहूर्त। किसी व्रत को "अनुसरण" करके स्मरण-सूचना पाएँ और कथा पढ़ें।',
    bodyEn:
      "Today's tithi, nakshatra, vrats, and muhurat. Follow any vrat to get reminders and read its katha.",
  },
  {
    id: 'sadhana',
    navigateTo: { name: 'HomeTab', params: { screen: 'RoutineToday' } },
    anchor: 'top',
    pointer: 'down',
    titleHi: 'आज की साधना',
    titleEn: "Today's Practice",
    bodyHi:
      'दैनिक साधना बनाएँ — पाठ, जप, आरती। संकल्प कार्यक्रम भी चुनें — नौ दिन, चालीस दिन। पूर्ण होते ही मुहर।',
    bodyEn:
      "Build a daily practice — reading, japa, aarti. Or pick a Sankalp program (9-day, 40-day). Complete each item to earn today's seal.",
  },
  {
    id: 'audio',
    navigateTo: { name: 'AudioTab' },
    anchor: 'center',
    pointer: 'none',
    titleHi: 'भजन',
    titleEn: 'Bhajan',
    bodyHi:
      'भजन एवं मंत्रों का पुस्तकालय। कोई भी ट्रैक चलाएँ — नीचे मिनी-प्लेयर से जहाँ भी जाएँ, संगीत साथ चलेगा।',
    bodyEn:
      'A library of bhajans and mantras. Tap any track — a mini-player pins to the bottom so the audio follows you across the app.',
  },
  {
    id: 'bhakti',
    navigateTo: { name: 'DailyBhaktiTab' },
    anchor: 'top',
    pointer: 'down',
    titleHi: 'भक्ति',
    titleEn: 'Bhakti',
    bodyHi:
      'यहाँ हर बार एक नया श्लोक खुलता है — गीता, चालीसा, स्तोत्र, संस्कार — दैनिक चिंतन के लिए एक शांत क्षण।',
    bodyEn:
      'One random verse opens here every visit — from the Gita, chalisas, stotrams, or sanskars. A quiet moment for daily reflection.',
  },
  {
    id: 'japa',
    navigateTo: { name: 'HomeTab', params: { screen: 'Home' } },
    anchor: 'bottom',
    pointer: 'up',
    titleHi: 'जप एवं अलार्म',
    titleEn: 'Japa & Alarms',
    bodyHi:
      '"जप" टाइल से मंत्र चुनें — प्रत्येक स्पर्श पर माला आगे, १०८ पर आवृत्ति पूर्ण। "अन्य" में समय-समय पर बजने वाले अलार्म भी सेट करें।',
    bodyEn:
      'Open the "Japa & Mantras" tile above to count on a mala — 108 beads per round. Add scheduled japam alarms from More → Japam Alarms.',
  },
  {
    id: 'wishlist',
    navigateTo: { name: 'MoreTab', params: { screen: 'Wishlist' } },
    anchor: 'center',
    pointer: 'none',
    titleHi: 'मेरी सूची एवं पुनरारंभ',
    titleEn: 'Wishlist & Resume',
    bodyHi:
      'किसी भी श्लोक पर हृदय दबाकर यहाँ सहेजें। ऐप स्वयं याद रखता है कि आपने कहाँ छोड़ा था — अगली बार वहीं से आरंभ हो जाएगा।',
    bodyEn:
      'Tap the heart on any verse to save it here. The app also remembers where you left off — pick up right from there next time.',
  },
  {
    id: 'reminders',
    navigateTo: { name: 'MoreTab', params: { screen: 'Reminders' } },
    anchor: 'center',
    pointer: 'none',
    titleHi: 'दैनिक स्मरण',
    titleEn: 'Daily Reminder',
    bodyHi:
      'अपनी पसंद का समय चुनें — हर रोज़ एक श्लोक की सूचना मिलेगी। कभी भी बंद कर सकते हैं।',
    bodyEn:
      "Pick a time and you'll get one verse a day at that time. Toggle it off any time you like.",
  },
  {
    id: 'share',
    navigateTo: { name: 'DailyBhaktiTab' },
    anchor: 'top',
    pointer: 'down',
    titleHi: 'साझा करें',
    titleEn: 'Share',
    bodyHi:
      'किसी भी श्लोक के नीचे साझा बटन से सुंदर श्लोक कार्ड बनाकर WhatsApp या अन्य ऐप पर भेजें।',
    bodyEn:
      'The share icon below any verse composes a beautifully typeset verse card — send it via WhatsApp or any other app.',
  },
] as const;

// Compile-time sanity: every navigateTo names a tab on TabParamList.
type _TabNameCheck = TourStep['navigateTo']['name'] extends keyof TabParamList ? true : never;
const _tabNameCheck: _TabNameCheck = true;
void _tabNameCheck;
