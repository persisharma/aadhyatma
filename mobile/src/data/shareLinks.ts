/**
 * Public app-store URLs and caption builder for the share-verse feature (PRD-05).
 *
 * Bundle-only: no runtime fetch — the links and templates are baked into the JS bundle.
 * Update the store URLs here when the iOS / Play Store listings are finalised.
 */

const IOS_APP_ID = '6766086529';

export const APP_STORE_URL = `https://apps.apple.com/app/id${IOS_APP_ID}`;
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.prashantsharma.vedansh';

/**
 * Smart link — until a static landing page exists, point to the App Store URL.
 * Swap this constant with the redirector URL once shipped; nothing else needs to change.
 */
export const SMART_LINK = APP_STORE_URL;

export type ShareCaptionParams = {
  sectionNameHi: string;
  sectionNameEn: string;
  verseLabelHi: string;
  verseLabelEn: string;
  firstLineHi: string;
  firstLineEn: string;
  lang: 'hi' | 'en';
};

export function buildShareCaption(p: ShareCaptionParams): string {
  if (p.lang === 'hi') {
    return [
      `${p.sectionNameHi} · ${p.verseLabelHi}`,
      `"${p.firstLineHi}"`,
      '',
      `Vedansh ऐप पर पढ़ें: ${SMART_LINK}`,
    ].join('\n');
  }
  return [
    `${p.sectionNameEn} · ${p.verseLabelEn}`,
    `"${p.firstLineEn}"`,
    '',
    `Read on Vedansh: ${SMART_LINK}`,
  ].join('\n');
}
