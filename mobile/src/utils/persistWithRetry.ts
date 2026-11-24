import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Lang } from '@/data/gita/language';
import { isLangValue } from '@/data/gita/langValues';
import { pick, type LocalizedStrings } from './localize';

/**
 * Failed-write handling for the contexts that persist user data to AsyncStorage.
 *
 * A bare `setItem(...).catch(() => undefined)` shows the change in the UI and
 * silently loses it on the next launch when the write fails (a full disk). Here a
 * failed write gets ONE bounded retry; if that fails too it is logged and the user
 * gets a brief Alert — the app's existing message pattern for failed actions — at
 * most once per `NOTICE_INTERVAL_MS`, so a stream of failing writes (reading
 * progress, japam beads) cannot spam dialogs.
 */
const RETRY_DELAY_MS = 500;
const NOTICE_INTERVAL_MS = 5 * 60 * 1000;
const LANG_STORAGE_KEY = '@vedansh/language';

let lastSaveNoticeAt = 0;
// Latest write issued per key. A retry for an older value must not land after a
// newer write and overwrite it with stale data.
const latestWrite = new Map<string, number>();
let writeCounter = 0;

/** Contexts sit above any language hook, so read the stored language directly (default Hindi). */
async function storedLang(): Promise<Lang> {
  try {
    const v = await AsyncStorage.getItem(LANG_STORAGE_KEY);
    return isLangValue(v) ? v : 'hi';
  } catch {
    return 'hi';
  }
}

export async function showNotice(title: LocalizedStrings, body: LocalizedStrings): Promise<void> {
  const lang = await storedLang();
  Alert.alert(pick(lang, title), pick(lang, body));
}

const SAVE_FAILED_TITLE: LocalizedStrings = {
  hi: 'सहेजा नहीं जा सका',
  en: 'Could not save',
  gu: 'સાચવી શકાયું નહીં',
  kn: 'ಉಳಿಸಲಾಗಲಿಲ್ಲ',
  mr: 'जतन करता आले नाही',
  te: 'సేవ్ చేయడం సాధ్యపడలేదు',
};
const SAVE_FAILED_BODY: LocalizedStrings = {
  hi: 'फ़ोन में जगह कम हो सकती है। ऐप बंद करने पर यह बदलाव खो सकता है।',
  en: 'Your phone may be low on storage. This change could be lost when the app closes.',
  gu: 'ફોનમાં જગ્યા ઓછી હોઈ શકે છે. ઍપ બંધ થતાં આ ફેરફાર ગુમાઈ શકે છે.',
  kn: 'ಫೋನ್‌ನಲ್ಲಿ ಜಾಗ ಕಡಿಮೆ ಇರಬಹುದು. ಆ್ಯಪ್ ಮುಚ್ಚಿದಾಗ ಈ ಬದಲಾವಣೆ ಕಳೆದುಹೋಗಬಹುದು.',
  mr: 'फोनमध्ये जागा कमी असू शकते. ॲप बंद केल्यावर हा बदल हरवू शकतो.',
  te: 'ఫోన్‌లో స్టోరేజ్ తక్కువగా ఉండవచ్చు. యాప్ మూసివేసినప్పుడు ఈ మార్పు పోవచ్చు.',
};

const LOADING_TITLE: LocalizedStrings = {
  hi: 'अभी लोड हो रहा है',
  en: 'Still loading',
  gu: 'હજી લોડ થઈ રહ્યું છે',
  kn: 'ಇನ್ನೂ ಲೋಡ್ ಆಗುತ್ತಿದೆ',
  mr: 'अजून लोड होत आहे',
  te: 'ఇంకా లోడ్ అవుతోంది',
};
const BOOKMARKS_LOADING_BODY: LocalizedStrings = {
  hi: 'आपके बुकमार्क लोड हो रहे हैं। कृपया एक पल बाद फिर दबाएँ।',
  en: 'Your bookmarks are still loading. Please tap again in a moment.',
  gu: 'તમારા બુકમાર્ક લોડ થઈ રહ્યા છે. કૃપા કરીને થોડી વાર પછી ફરી ટૅપ કરો.',
  kn: 'ನಿಮ್ಮ ಬುಕ್‌ಮಾರ್ಕ್‌ಗಳು ಲೋಡ್ ಆಗುತ್ತಿವೆ. ದಯವಿಟ್ಟು ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ಮತ್ತೆ ಟ್ಯಾಪ್ ಮಾಡಿ.',
  mr: 'तुमचे बुकमार्क लोड होत आहेत. कृपया थोड्या वेळाने पुन्हा टॅप करा.',
  te: 'మీ బుక్‌మార్క్‌లు లోడ్ అవుతున్నాయి. దయచేసి కొద్దిసేపటి తర్వాత మళ్లీ ట్యాప్ చేయండి.',
};

/** A bookmark tap that arrives before the saved list has hydrated used to do nothing at all. */
export function showBookmarksLoadingNotice(): void {
  void showNotice(LOADING_TITLE, BOOKMARKS_LOADING_BODY);
}

/** Test seam: forget the notice throttle. */
export function resetSaveNoticeThrottle(): void {
  lastSaveNoticeAt = 0;
}

/** `AsyncStorage.setItem` with one retry; on a second failure, log and tell the user (throttled). */
export async function setItemWithRetry(key: string, value: string): Promise<boolean> {
  const mine = ++writeCounter;
  latestWrite.set(key, mine);
  try {
    await AsyncStorage.setItem(key, value);
    return true;
  } catch {
    await new Promise<void>((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
  }
  // A newer write for this key is already in flight and carries the newer state.
  if (latestWrite.get(key) !== mine) return false;
  try {
    await AsyncStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn(`[persist] write failed twice for ${key}`, error);
    const now = Date.now();
    if (now - lastSaveNoticeAt >= NOTICE_INTERVAL_MS) {
      lastSaveNoticeAt = now;
      void showNotice(SAVE_FAILED_TITLE, SAVE_FAILED_BODY);
    }
    return false;
  }
}
