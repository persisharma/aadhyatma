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
