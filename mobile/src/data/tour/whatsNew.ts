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
export const APP_TOUR_VERSION = '1.4.6';

/**
 * Per-version what's-new content. The latest entry is shown when the user
 * first opens this version of the app after updating.
 */
export const whatsNew: Readonly<Record<string, WhatsNewEntry>> = {
  '1.4.6': {
    version: '1.4.6',
    items: [
      {
        titleHi: 'पाठ सुनें',
        titleEn: 'Read aloud',
        bodyHi:
          'गीता और चालीसा पढ़ते समय ♪ दबाएँ — उपकरण की आवाज़ श्लोक और अर्थ पढ़ेगी, और पृष्ठ स्वयं आगे बढ़ते जाएँगे। गति व आवाज़ अन्य → पाठ सुनें में चुनें।',
        bodyEn:
          'Tap ♪ while reading the Gita or a Chalisa and your device voice reads the verse and its meaning, turning the pages as it goes. Pick the voice and speed in More → Read Aloud.',
      },
      {
        titleHi: 'वाल्मीकि रामायण',
        titleEn: 'Valmiki Ramayan',
        bodyHi:
          'सम्पूर्ण वाल्मीकि रामायण अब पुस्तकालय में — सातों काण्ड, 648 सर्ग एवं 23,000+ श्लोक, संस्कृत मूल तथा हिन्दी अनुवाद सहित।',
        bodyEn:
          'The complete Valmiki Ramayan is now in the library — all 7 kandas, 648 sargas and 23,000+ shlokas, with the Sanskrit original and translation.',
      },
      {
        titleHi: 'नए भजन',
        titleEn: 'New bhajans',
        bodyHi:
          'भजन प्लेयर में पाँच नए भजन जुड़े — गोविन्द बोलो, ॐ गं गणपतये नमः, नारायण हरि हरि, जय नंदलाल की एवं कृष्णाय वासुदेवाय।',
        bodyEn:
          'Five new bhajans in the player — Govind Bolo, Om Gam Ganapataye Namah, Narayan Hari Hari, Jai Nandlal Ki and Krishnaya Vasudevaya.',
      },
    ],
  },
  '1.4.5': {
    version: '1.4.5',
    items: [
      {
        titleHi: 'बेहतर ऐप टूर एवं पंचांग',
        titleEn: 'Smoother app tour & Panchang',
        bodyHi:
          'गाइडेड ऐप टूर अब हर सुविधा को सही जगह पर हाइलाइट करता है, और पंचांग का दैनिक मुहूर्त कार्ड बिना अटके तुरंत दिखता है।',
        bodyEn:
          'The guided app tour now highlights each feature in the right spot, and the Panchang Daily Muhurat card appears instantly without a jump.',
      },
    ],
  },
  '1.4.4': {
    version: '1.4.4',
    items: [
      {
        titleHi: 'बेहतर ऐप टूर एवं पंचांग',
        titleEn: 'Smoother app tour & Panchang',
        bodyHi:
          'गाइडेड ऐप टूर अब हर सुविधा को सही जगह पर हाइलाइट करता है, और पंचांग का दैनिक मुहूर्त कार्ड बिना अटके तुरंत दिखता है।',
        bodyEn:
          'The guided app tour now highlights each feature in the right spot, and the Panchang Daily Muhurat card appears instantly without a jump.',
      },
    ],
  },
  '1.4.3': {
    version: '1.4.3',
    items: [
      {
        titleHi: 'पंचांग · दैनिक मुहूर्त',
        titleEn: 'Panchang · Daily Muhurat',
        bodyHi:
          'पंचांग टैब पर अब चौघड़िया, राहु काल, और अभिजित मुहूर्त — पूरे दिन के शुभ-अशुभ समय एक ही जगह।',
        bodyEn:
          'The Panchang tab now shows Choghadiya, Rahu Kaal, and Abhijit Muhurat — the day\'s auspicious windows at a glance.',
      },
      {
        titleHi: 'जप अलार्म — पुनरावृत्ति एवं छोड़ें',
        titleEn: 'Japam Alarms — repeat & skip-next',
        bodyHi:
          'अपने जप के लिए कस्टम अलार्म — विशिष्ट दिनों में पुनरावृत्ति, अगली बार छोड़ें, या एक-बार का अलार्म।',
        bodyEn:
          'Custom japam alarms with day-of-week repeat, skip-next, and one-time triggers. Configure from More → Japam Alarms.',
      },
      {
        titleHi: 'गुजराती एवं कन्नड़ पाठ',
        titleEn: 'Gujarati & Kannada readers',
        bodyHi:
          'सभी पाठों के लिए दो नई भाषाएँ जुड़ीं — गुजराती और कन्नड़। "अन्य" → भाषा से चुनें।',
        bodyEn:
          'Two new reading scripts across the library: Gujarati and Kannada. Switch from More → Language.',
      },
    ],
  },
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
