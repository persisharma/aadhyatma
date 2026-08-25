/**
 * Public app-store URLs and caption builder for the share-verse feature (PRD-05).
 *
 * Bundle-only: no runtime fetch — the links and templates are baked into the JS bundle.
 * Update the store URLs here when the iOS / Play Store listings are finalised.
 */

import type { Lang } from '@/data/gita/language';
import { contentByLang, pick, type LocalizedStrings } from '@/utils/localize';
import {
  buildVerseHashtags,
  formatHashtags,
  type TimelyContext,
} from '@/data/shareHashtags';

const IOS_APP_ID = '6766086529';

export const APP_STORE_URL = `https://apps.apple.com/app/id${IOS_APP_ID}`;
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.prashantsharma.vedansh';

export const SMART_LINK = 'https://persisharma.github.io/get-vedansh/';

/**
 * Public Instagram profile, opened from the More hub's "Follow on Instagram" row (§37).
 *
 * Canonical `https://` form on purpose — not the `instagram://user?username=…` scheme.
 * `Linking.canOpenURL` on a custom scheme needs `LSApplicationQueriesSchemes` (iOS) /
 * `android.queries` (Android) in `app.json`, i.e. a store rebuild; the https URL is
 * claimed by the installed Instagram app via universal/app links anyway, and degrades
 * to the browser when it isn't installed — so this ships over OTA.
 */
export const INSTAGRAM_HANDLE = 'vedansh.app';
export const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}`;

export type ShareCaptionParams = {
  sectionNameHi: string;
  sectionNameEn: string;
  verseLabelHi: string;
  verseLabelEn: string;
  firstLineHi: string;
  firstLineEn: string;
  lang: Lang;
};

const SHARE_CTA: LocalizedStrings = {
  hi: 'Vedansh ऐप पर पढ़ें:',
  en: 'Read on Vedansh:',
  gu: 'Vedansh ઍપ પર વાંચો:',
  kn: 'Vedansh ಆ್ಯಪ್‌ನಲ್ಲಿ ಓದಿ:',
};

export function buildShareCaption(p: ShareCaptionParams): string {
  // Header + first line are content: gu/kn re-script the Devanagari (which is the
  // recitation text for the verse line too). hi/en outputs are byte-identical to before.
  const header = `${contentByLang(p.lang, p.sectionNameHi, p.sectionNameEn)} · ${contentByLang(p.lang, p.verseLabelHi, p.verseLabelEn)}`;
  const firstLine = contentByLang(p.lang, p.firstLineHi, p.firstLineEn);
  return [`${header}`, `"${firstLine}"`, '', `${pick(p.lang, SHARE_CTA)} ${SMART_LINK}`].join('\n');
}

/** "Follow" line that precedes the @handle in the Instagram caption. */
const IG_FOLLOW: LocalizedStrings = {
  hi: 'और भी पढ़ें',
  en: 'More verses daily',
  gu: 'વધુ વાંચો',
  kn: 'ಇನ್ನಷ್ಟು ಓದಿ',
};

export type InstagramCaptionParams = ShareCaptionParams & {
  /** `LibraryEntry.id` of the text — the hashtag block is derived from it. */
  sourceId: string;
  /** Festival / vrat / vaar inputs for the share date; absent → a date-free block. */
  timely?: TimelyContext;
};

/**
 * Instagram caption: the same verse caption WhatsApp gets, then the @handle, then a
 * hashtag block derived from *this* verse (`buildVerseHashtags`, `shareHashtags.ts`).
 *
 * The blank line before the tags is deliberate — Instagram collapses a caption after
 * the third line, so the reader sees the verse and the tags stay out of the preview.
 */
export function buildInstagramCaption(p: InstagramCaptionParams): string {
  const hashtags = formatHashtags(
    buildVerseHashtags({
      sourceId: p.sourceId,
      sectionNameHi: p.sectionNameHi,
      sectionNameEn: p.sectionNameEn,
      verseLabelEn: p.verseLabelEn,
      lang: p.lang,
      timely: p.timely,
    })
  );
  return [
    buildShareCaption(p),
    `${pick(p.lang, IG_FOLLOW)} @${INSTAGRAM_HANDLE}`,
    '',
    hashtags,
  ].join('\n');
}

// Multi-line feature-list invite (no emoji — §5 house style; plain • bullets).
// Each string ends with the download CTA + colon so buildAppShareMessage can
// append SMART_LINK on the same line.
const APP_SHARE_INVITE: LocalizedStrings = {
  hi: [
    'Vedansh — संपूर्ण भक्ति, एक ही ऐप में।',
    '• गीता, सुंदरकांड, चालीसा, आरती व स्तोत्र',
    '• जप माला व जप अलार्म',
    '• पंचांग — व्रत-त्योहार, मुहूर्त, कुंडली व राशिफल',
    '• भजन ऑडियो व दैनिक भक्ति',
    '• नित्य साधना — अपनी दैनिक पूजा की दिनचर्या',
    'हिंदी · English · ગુજરાતી · ಕನ್ನಡ में पढ़ें।',
    'डाउनलोड करें:',
  ].join('\n'),
  en: [
    'Vedansh — complete bhakti in one app.',
    '• Gita, Sundarkand, Chalisa, Aarti & Stotra',
    '• Japa mala counter & japa alarms',
    '• Panchang — vrat & festivals, muhurat, kundali, rashifal',
    '• Bhajan audio & a daily verse',
    '• Nitya sadhana — your own daily puja routine',
    'Read in हिंदी · English · ગુજરાતી · ಕನ್ನಡ.',
    'Download:',
  ].join('\n'),
  gu: [
    'Vedansh — સંપૂર્ણ ભક્તિ, એક જ ઍપમાં.',
    '• ગીતા, સુંદરકાંડ, ચાલીસા, આરતી અને સ્તોત્ર',
    '• જપ માળા અને જપ અલાર્મ',
    '• પંચાંગ — વ્રત-તહેવાર, મુહૂર્ત, કુંડળી અને રાશિફળ',
    '• ભજન ઑડિયો અને દૈનિક ભક્તિ',
    '• નિત્ય સાધના — તમારી દૈનિક પૂજાની દિનચર્યા',
    'હિંદી · English · ગુજરાતી · ಕನ್ನಡમાં વાંચો.',
    'ડાઉનલોડ કરો:',
  ].join('\n'),
  kn: [
    'Vedansh — ಸಂಪೂರ್ಣ ಭಕ್ತಿ, ಒಂದೇ ಆ್ಯಪ್‌ನಲ್ಲಿ.',
    '• ಗೀತಾ, ಸುಂದರಕಾಂಡ, ಚಾಲೀಸಾ, ಆರತಿ ಮತ್ತು ಸ್ತೋತ್ರ',
    '• ಜಪ ಮಾಲಾ ಮತ್ತು ಜಪ ಅಲಾರಂ',
    '• ಪಂಚಾಂಗ — ವ್ರತ-ಹಬ್ಬ, ಮುಹೂರ್ತ, ಕುಂಡಲಿ ಮತ್ತು ರಾಶಿಫಲ',
    '• ಭಜನ್ ಆಡಿಯೊ ಮತ್ತು ದೈನಿಕ ಭಕ್ತಿ',
    '• ನಿತ್ಯ ಸಾಧನಾ — ನಿಮ್ಮ ದೈನಂದಿನ ಪೂಜಾ ದಿನಚರಿ',
    'ಹಿಂದಿ · English · ગુજરાતી · ಕನ್ನಡದಲ್ಲಿ ಓದಿ.',
    'ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ:',
  ].join('\n'),
};

/** App-invite message — feature list + download link, no verse attached (shared from More). */
export function buildAppShareMessage(lang: Lang): string {
  return `${pick(lang, APP_SHARE_INVITE)} ${SMART_LINK}`;
}
