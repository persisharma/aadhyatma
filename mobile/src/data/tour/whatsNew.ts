/**
 * "What's new" content per app version.
 *
 * Show only NEW features of a version — not a full re-tour. The What's New
 * modal fires on the first launch after an app update (not on fresh install),
 * gated on a release having a non-empty entry here.
 *
 * When you bump `app.json` `expo.version`, also bump `APP_TOUR_VERSION` below
 * and add a new keyed entry with the new features. Omit a version (or leave
 * its `items` empty) to skip the modal for that release.
 */

export type WhatsNewItem = {
  titleHi: string;
  titleEn: string;
  bodyHi: string;
  bodyEn: string;
};

export type WhatsNewEntry = {
  version: string;
  items: readonly WhatsNewItem[];
};

/**
 * Current app version. Must match `expo.version` in `mobile/app.json`. This is
 * the key against which the user's "last seen what's new" is compared.
 */
export const APP_TOUR_VERSION = '1.4.0';

/**
 * Per-version what's-new content. The latest entry is shown when the user
 * first opens this version of the app after updating.
 */
export const whatsNew: Readonly<Record<string, WhatsNewEntry>> = {
  '1.4.0': {
    version: '1.4.0',
    items: [
      {
        titleHi: 'दैनिक श्लोक कार्ड पर साझा एवं सूची',
        titleEn: 'Share & wishlist on the daily verse',
        bodyHi:
          'दैनिक भक्ति टैब पर अब श्लोक के नीचे साझा एवं हृदय बटन हैं — सीधे कार्ड बनाकर भेजें या सूची में सहेजें।',
        bodyEn:
          'The Daily Bhakti verse now has share and wishlist buttons — compose a card or save it without leaving the tab.',
      },
    ],
  },
} as const;

export function getWhatsNewForVersion(version: string): WhatsNewEntry | null {
  const entry = whatsNew[version];
  if (!entry || entry.items.length === 0) return null;
  return entry;
}
