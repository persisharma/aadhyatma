/**
 * Public app-store URLs and caption builder for the share-verse feature (PRD-05).
 *
 * Bundle-only: no runtime fetch — the links and templates are baked into the JS bundle.
 * Update the store URLs here when the iOS / Play Store listings are finalised.
 */

import type { Lang } from '@/data/gita/language';
import { contentByLang, pick, type LocalizedStrings } from '@/utils/localize';

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

const APP_SHARE_INVITE: LocalizedStrings = {
  hi: 'Vedansh — गीता, चालीसा, आरती और नित्य साधना, एक ही ऐप में। पढ़ें और सुनें:',
  en: 'Vedansh — Gita, Chalisa, Aarti & daily sadhana in one app. Read and listen:',
  gu: 'Vedansh — ગીતા, ચાલીસા, આરતી અને નિત્ય સાધના, એક જ ઍપમાં. વાંચો અને સાંભળો:',
  kn: 'Vedansh — ಗೀತಾ, ಚಾಲೀಸಾ, ಆರತಿ ಮತ್ತು ನಿತ್ಯ ಸಾಧನೆ ಒಂದೇ ಆ್ಯಪ್‌ನಲ್ಲಿ. ಓದಿ ಮತ್ತು ಕೇಳಿ:',
};

/** Plain app-invite message — the download link with no verse attached (shared from More). */
export function buildAppShareMessage(lang: Lang): string {
  return `${pick(lang, APP_SHARE_INVITE)} ${SMART_LINK}`;
}
