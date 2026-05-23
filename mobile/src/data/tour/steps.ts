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
  | { name: 'DailyBhaktiTab' };

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
    bodyHi: 'ऊपर श्रेणियों के टाइल देखें — चालीसा, ग्रंथ, स्तोत्रम्, आरती, जप। किसी भी टाइल को दबाकर पाठ खोलें।',
    bodyEn:
      'These tiles group every text by category. Tap any tile — or use "By Deity" — to browse what is inside.',
  },
  {
    id: 'wishlist',
    navigateTo: { name: 'MoreTab', params: { screen: 'Wishlist' } },
    anchor: 'center',
    pointer: 'none',
    titleHi: 'मेरी सूची',
    titleEn: 'Wishlist',
    bodyHi: 'यह आपकी सूची है। किसी भी श्लोक पर हृदय चिह्न दबाकर यहाँ सहेज लें — फिर एक स्पर्श में वापस पहुँचें।',
    bodyEn:
      'This is your wishlist. Tap the heart on any verse to save it here, then tap an entry to jump straight back to it.',
  },
  {
    id: 'reminders',
    navigateTo: { name: 'MoreTab', params: { screen: 'Reminders' } },
    anchor: 'center',
    pointer: 'none',
    titleHi: 'दैनिक स्मरण',
    titleEn: 'Daily Reminder',
    bodyHi: 'अपनी पसंद का समय चुनें — हर रोज़ एक श्लोक की सूचना मिलेगी। कभी भी बंद कर सकते हैं।',
    bodyEn:
      'Pick a time and you will get one verse a day at that time. Toggle it off any time you like.',
  },
  {
    id: 'bhakti',
    navigateTo: { name: 'DailyBhaktiTab' },
    anchor: 'top',
    pointer: 'down',
    titleHi: 'भक्ति',
    titleEn: 'Bhakti',
    bodyHi: 'भक्ति टैब पर हर बार एक नया श्लोक खुलता है। "नवीन" से दूसरा देखें — दैनिक चिंतन के लिए सरल।',
    bodyEn:
      'The Bhakti tab opens one random verse every visit. Tap refresh for another — a quiet way to start the day.',
  },
  {
    id: 'japa',
    navigateTo: { name: 'HomeTab', params: { screen: 'Home' } },
    anchor: 'bottom',
    pointer: 'up',
    titleHi: 'जप',
    titleEn: 'Japa & Mantras',
    bodyHi: 'ऊपर "जप" टाइल से मंत्र चुनें। प्रत्येक स्पर्श पर माला आगे बढ़ती है, १०८ मनकों पर एक आवृत्ति पूर्ण।',
    bodyEn:
      'Open the "Japa & Mantras" tile above to pick a mantra. Each tap moves the mala; 108 beads complete one round. Progress saves automatically.',
  },
  {
    id: 'share',
    navigateTo: { name: 'DailyBhaktiTab' },
    anchor: 'top',
    pointer: 'down',
    titleHi: 'साझा करें',
    titleEn: 'Share',
    bodyHi: 'श्लोक के नीचे साझा बटन से सुंदर श्लोक कार्ड बनाकर WhatsApp या अन्य ऐप पर भेजें।',
    bodyEn:
      'Below every verse you will see a share icon — tap it to compose a verse card and send it via WhatsApp or any app.',
  },
] as const;

// Compile-time sanity: every navigateTo names a tab on TabParamList.
type _TabNameCheck = TourStep['navigateTo']['name'] extends keyof TabParamList ? true : never;
const _tabNameCheck: _TabNameCheck = true;
void _tabNameCheck;
