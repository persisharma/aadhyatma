/**
 * First-launch feature tour content.
 *
 * The tour drives the user through the *actual* screens — each step
 * navigates to a real surface, then overlays a tooltip anchored to the
 * relevant region. It is a **non-interactive** walkthrough (a scrim swallows
 * touches), so steps *describe* the affordances they ring rather than expecting
 * the user to tap them. Copy is bilingual since the user has not yet picked a
 * reading language at first launch (design.md §1, §47).
 *
 * Shape of the walkthrough: the five bottom tabs → the Home routine card &
 * categories (Japa and Theerth split out with their inside views) → what's
 * inside each section (Bhakti, a Panchang vrat drill, Bhajan, and a More
 * reminder/alarm drill).
 */

import type {
  HomeStackParamList,
  MoreStackParamList,
  PanchangStackParamList,
  TabParamList,
} from '@/navigation/types';
import type { TourTargetId } from '@/components/tour/tourTargets';
import { panchangTabTarget } from '@/navigation/entryRoutes';

/**
 * Where to send the user for this step. Mirrors the nested-route shape
 * expected by `navigationRef.dispatch(CommonActions.navigate(...))`.
 */
export type TourNavTarget =
  | { name: 'HomeTab'; params?: { screen: keyof HomeStackParamList; params?: object } }
  | { name: 'MoreTab'; params?: { screen: keyof MoreStackParamList; params?: object } }
  | {
      name: 'PanchangTab';
      // `initial?: false` — deep Panchang-stack steps must be built with
      // panchangTabTarget (entryRoutes.ts) so a lazily-mounted tab doesn't take
      // the step's screen as its initial route (calendar unreachable after).
      params?: { screen: keyof PanchangStackParamList; params?: object; initial?: false };
    }
  | { name: 'DailyBhaktiTab' }
  | { name: 'AudioTab' };

/** Where the tooltip card sits relative to the screen. */
export type TourAnchor = 'top' | 'center' | 'bottom';

/** Direction the pointer arrow on the tooltip card points. */
export type TourPointer = 'up' | 'down' | 'none';

export type TourStep = {
  id: string;
  /** Screen to navigate to before showing this step's tooltip. */
  navigateTo: TourNavTarget;
  /**
   * On-screen element to ring with the spotlight, registered via
   * `useTourTarget`. Omitted when the step has no stable element — the tour then
   * rings the destination tab instead. See design.md §47.
   */
  targetId?: TourTargetId;
  /** Fallback card position when `targetId` can't be measured. */
  anchor: TourAnchor;
  /** Fallback pointer direction when `targetId` can't be measured. */
  pointer: TourPointer;
  titleHi: string;
  titleEn: string;
  bodyHi: string;
  bodyEn: string;
};

/**
 * Tab order in `TabNavigator` — used to ring the destination tab when a step
 * has no measurable element target. Must mirror the `Tab.Screen` order.
 */
export const TAB_ORDER: Record<TourNavTarget['name'], number> = {
  HomeTab: 0,
  DailyBhaktiTab: 1,
  PanchangTab: 2,
  AudioTab: 3,
  MoreTab: 4,
};

export const tourSteps: readonly TourStep[] = [
  // ── The five bottom tabs (tab-ring: no element target) ──────────────────────
  {
    id: 'tab-home',
    navigateTo: { name: 'HomeTab', params: { screen: 'Home' } },
    anchor: 'bottom',
    pointer: 'up',
    titleHi: 'मुख पृष्ठ',
    titleEn: 'Home',
    bodyHi: 'यहीं से सब शुरू — श्रेणियाँ, नित्य साधना और "आज की खोज"।',
    bodyEn: 'Your starting point — categories, daily practice, and today\'s picks.',
  },
  {
    id: 'tab-bhakti',
    navigateTo: { name: 'DailyBhaktiTab' },
    anchor: 'bottom',
    pointer: 'up',
    titleHi: 'भक्ति',
    titleEn: 'Daily Bhakti',
    bodyHi: 'हर दिन एक नया श्लोक — दैनिक चिंतन के लिए एक शांत क्षण।',
    bodyEn: 'A fresh verse every day — a quiet moment for daily reflection.',
  },
  {
    id: 'tab-panchang',
    navigateTo: { name: 'PanchangTab' },
    anchor: 'bottom',
    pointer: 'up',
    titleHi: 'पंचांग',
    titleEn: 'Panchang',
    bodyHi: 'आज की तिथि, नक्षत्र, मुहूर्त और व्रत-पर्व।',
    bodyEn: "Today's tithi, nakshatra, muhurat, and vrats & festivals.",
  },
  {
    id: 'tab-bhajan',
    navigateTo: { name: 'AudioTab' },
    anchor: 'bottom',
    pointer: 'up',
    titleHi: 'भजन',
    titleEn: 'Bhajan',
    bodyHi: 'भजन व मंत्रों का पुस्तकालय — मिनी-प्लेयर साथ-साथ चलता है।',
    bodyEn: 'A library of bhajans & mantras — a mini-player follows you around.',
  },
  {
    id: 'tab-more',
    navigateTo: { name: 'MoreTab' },
    anchor: 'bottom',
    pointer: 'up',
    titleHi: 'अधिक',
    titleEn: 'More',
    bodyHi: 'प्रोफ़ाइल, दैनिक स्मरण, जप-अलार्म और भाषा — सब यहाँ।',
    bodyEn: 'Profile, daily reminders, japam alarms, and language — all here.',
  },

  // ── Home: routine card + categories (Japa & Theerth drilled in) ─────────────
  {
    id: 'routine',
    navigateTo: { name: 'HomeTab', params: { screen: 'Home' } },
    targetId: 'routineCard',
    anchor: 'top',
    pointer: 'down',
    titleHi: 'नित्य साधना',
    titleEn: 'Daily Practice',
    bodyHi: 'अपनी दैनिक साधना यहाँ देखें और पूरी करें — हर पाठ पूर्ण होते ही आज की मुहर।',
    bodyEn: "See and complete your daily practice here — finish each item to earn today's seal.",
  },
  {
    id: 'categories',
    navigateTo: { name: 'HomeTab', params: { screen: 'Home' } },
    targetId: 'categoriesGrid',
    anchor: 'center',
    pointer: 'none',
    titleHi: 'श्रेणियाँ',
    titleEn: 'Categories',
    bodyHi: 'ग्रन्थ, स्तोत्रम्, चालीसा, जप, आरती, तीर्थ, संस्कार, व्रत और देवता — नौ द्वार, हर पाठ श्रेणी के अनुसार।',
    bodyEn: 'Granth, stotram, chalisa, japa, aarti, theerth, sanskar, vrat and deities — nine doors, every text grouped by category.',
  },
  {
    id: 'japa',
    navigateTo: { name: 'HomeTab', params: { screen: 'Home' } },
    targetId: 'japaTile',
    anchor: 'bottom',
    pointer: 'up',
    titleHi: 'जप',
    titleEn: 'Japa',
    bodyHi: '"जप" टाइल से मंत्र चुनें और माला पर गिनें।',
    bodyEn: 'Open the Japa tile to pick a mantra and count on a mala.',
  },
  {
    id: 'japa-inside',
    navigateTo: { name: 'HomeTab', params: { screen: 'CategoryList', params: { categoryId: 'japam' } } },
    targetId: 'japamInside',
    anchor: 'top',
    pointer: 'down',
    titleHi: 'जप — मंत्र सूची',
    titleEn: 'Japa — Mantras',
    bodyHi: 'कोई भी मंत्र चुनें — प्रत्येक स्पर्श पर माला आगे, १०८ पर आवृत्ति पूर्ण।',
    bodyEn: 'Pick any mantra — each tap advances the mala; 108 beads complete a round.',
  },
  {
    id: 'theerth',
    navigateTo: { name: 'HomeTab', params: { screen: 'Home' } },
    targetId: 'theerthTile',
    anchor: 'bottom',
    pointer: 'up',
    titleHi: 'तीर्थ',
    titleEn: 'Pilgrimage',
    bodyHi: '"तीर्थ" टाइल से भारत के पवित्र मंदिर और धाम खोजें।',
    bodyEn: 'Open the Theerth tile to explore sacred temples and dhams across Bharat.',
  },
  {
    id: 'theerth-inside',
    navigateTo: { name: 'HomeTab', params: { screen: 'TheerthMap', params: {} } },
    targetId: 'theerthInside',
    anchor: 'top',
    pointer: 'down',
    titleHi: 'तीर्थ यात्रा',
    titleEn: 'Sacred Journeys',
    bodyHi: 'श्रेणी या राज्य से मंदिर ढूँढें और प्रत्येक का दर्शन-विवरण पढ़ें।',
    bodyEn: "Find temples by category or state and read each one's details.",
  },

  // ── Bhakti: what's inside ───────────────────────────────────────────────────
  {
    id: 'bhakti-verse',
    navigateTo: { name: 'DailyBhaktiTab' },
    targetId: 'dailyVerse',
    anchor: 'top',
    pointer: 'down',
    titleHi: 'दैनिक श्लोक',
    titleEn: 'Daily Verse',
    bodyHi: 'यहाँ हर बार एक नया श्लोक खुलता है — गीता, चालीसा, स्तोत्र, संस्कार से।',
    bodyEn: 'A new verse opens here every visit — from the Gita, chalisas, stotrams, or sanskars.',
  },
  {
    id: 'bhakti-share',
    navigateTo: { name: 'DailyBhaktiTab' },
    targetId: 'shareButton',
    anchor: 'top',
    pointer: 'down',
    titleHi: 'साझा करें',
    titleEn: 'Share',
    bodyHi: 'साझा बटन से सुंदर श्लोक-कार्ड बनाकर WhatsApp या अन्य ऐप पर भेजें।',
    bodyEn: 'The share button composes a beautiful verse card for WhatsApp or any other app.',
  },

  // ── Panchang: muhurat → vrat & parv → vrat list → follow → My Vrat ──────────
  {
    id: 'panchang-muhurat',
    navigateTo: { name: 'PanchangTab', params: { screen: 'PanchangHome' } },
    targetId: 'muhuratCard',
    anchor: 'top',
    pointer: 'down',
    titleHi: 'आज का मुहूर्त',
    titleEn: 'Daily Muhurat',
    bodyHi: 'चौघड़िया, राहु काल और अभिजित — एक नज़र में; पूरा देखने के लिए टैप करें।',
    bodyEn: 'Choghadiya, Rahu Kaal, and Abhijit at a glance — tap to see the full muhurat.',
  },
  {
    id: 'panchang-segment',
    navigateTo: { name: 'PanchangTab', params: { screen: 'PanchangHome' } },
    targetId: 'panchangSegment',
    anchor: 'top',
    pointer: 'down',
    titleHi: 'व्रत-पर्व',
    titleEn: 'Vrat & Parv',
    bodyHi: 'यहाँ "व्रत-पर्व" पर जाकर सभी व्रत और त्योहार देखें।',
    bodyEn: 'Switch to "Vrat & Parv" here to browse all vrats and festivals.',
  },
  {
    id: 'vrat-list',
    navigateTo: { name: 'PanchangTab', params: panchangTabTarget('ObservanceList', { category: 'vrat' }) },
    targetId: 'vratList',
    anchor: 'top',
    pointer: 'down',
    titleHi: 'व्रत सूची',
    titleEn: 'Vrat List',
    bodyHi: 'आने वाले व्रत व पर्व — किसी को खोलकर उसकी कथा पढ़ें।',
    bodyEn: 'Upcoming vrats and festivals — open any one to read its katha.',
  },
  {
    id: 'vrat-follow',
    navigateTo: { name: 'PanchangTab', params: panchangTabTarget('ObservanceList', { category: 'vrat' }) },
    targetId: 'vratFollow',
    anchor: 'top',
    pointer: 'down',
    titleHi: 'व्रत फ़ॉलो करें',
    titleEn: 'Follow a Vrat',
    bodyHi: '★ दबाकर व्रत फ़ॉलो करें — यह "मेरे व्रत" में जुड़ जाएगा।',
    bodyEn: 'Tap ★ to follow a vrat — it is added to your "My Vrat" list.',
  },
  {
    id: 'my-vrat',
    navigateTo: { name: 'PanchangTab', params: panchangTabTarget('MyVrat') },
    targetId: 'myVrat',
    anchor: 'top',
    pointer: 'down',
    titleHi: 'मेरे व्रत व स्मरण',
    titleEn: 'My Vrat & Reminders',
    bodyHi: 'फ़ॉलो किए व्रत यहाँ रहते हैं; 🔔 से हर व्रत का स्मरण चालू करें।',
    bodyEn: 'Followed vrats live here; use the 🔔 to set a reminder for each one.',
  },

  // ── Bhajan: what's inside ───────────────────────────────────────────────────
  {
    id: 'bhajan-library',
    navigateTo: { name: 'AudioTab' },
    targetId: 'bhajanInside',
    anchor: 'top',
    pointer: 'down',
    titleHi: 'भजन पुस्तकालय',
    titleEn: 'Bhajan Library',
    bodyHi: 'कोई भी ट्रैक चलाएँ — नीचे मिनी-प्लेयर टिका रहता है, जहाँ भी जाएँ संगीत साथ।',
    bodyEn: 'Play any track — a mini-player docks at the bottom so the audio follows you.',
  },

  // ── More: daily reminder → reminder times → japam alarm ─────────────────────
  {
    id: 'reminder-toggle',
    navigateTo: { name: 'MoreTab', params: { screen: 'Reminders' } },
    targetId: 'reminderToggle',
    anchor: 'top',
    pointer: 'down',
    titleHi: 'दैनिक स्मरण',
    titleEn: 'Daily Reminder',
    bodyHi: 'दैनिक श्लोक की सूचना यहाँ से चालू या बंद करें।',
    bodyEn: 'Turn the daily-verse notification on or off here.',
  },
  {
    id: 'reminder-times',
    navigateTo: { name: 'MoreTab', params: { screen: 'Reminders' } },
    targetId: 'reminderTimes',
    anchor: 'top',
    pointer: 'down',
    titleHi: 'स्मरण समय',
    titleEn: 'Reminder Times',
    bodyHi: 'अपनी पसंद के समय जोड़ें — हर रोज़ उसी समय एक श्लोक मिलेगा।',
    bodyEn: 'Add the times you like — a verse arrives each day at each one.',
  },
  {
    id: 'japam-alarm',
    navigateTo: { name: 'MoreTab', params: { screen: 'JapamAlarms' } },
    targetId: 'japamAdd',
    anchor: 'top',
    pointer: 'down',
    titleHi: 'जप अलार्म',
    titleEn: 'Japam Alarm',
    bodyHi: 'समय-समय पर जप की याद के लिए अलार्म जोड़ें।',
    bodyEn: 'Add alarms to remind you to chant japam through the day.',
  },
] as const;

// Compile-time sanity: every navigateTo names a tab on TabParamList.
type _TabNameCheck = TourStep['navigateTo']['name'] extends keyof TabParamList ? true : never;
const _tabNameCheck: _TabNameCheck = true;
void _tabNameCheck;
