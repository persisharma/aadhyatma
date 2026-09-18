/**
 * नया — the lifecycle-driven feature strip that replaced the DISCOVER carousel
 * (TRD-42 §4).
 *
 * DISCOVER showed all eight cards forever, reshuffled on every open, with four
 * of them hardcoding `hasNew: true` so their badge could never clear. It taught
 * the user nothing and moved under their thumb. नया inverts that: it shows only
 * what this user has not opened yet, at most three, in a stable order, and each
 * card disappears for good once tapped.
 *
 * **Why no new content registry.** `data/tour/whatsNew.ts` already curates
 * "what shipped in version X" in both languages, and bumping it is already
 * mandatory on any release that moves `APP_TOUR_VERSION`. Inventing a fourth
 * is-this-new mechanism beside that, `addedInVersion`, and the tour keys would
 * guarantee drift. So a feed entry carries only what the What's-New sheet
 * cannot: a stable id, an icon, and a route target. `featureFeed.test.ts` fails
 * if any entry names a version `whatsNew` does not know.
 */
import { compareSemver } from '@/utils/semverCompare';
import { whatsNew } from '@/data/tour/whatsNew';

/** Where a नया card sends the user. Resolved by the section, not here. */
export type FeatureTarget =
  | { tab: 'home'; screen: 'TodayVidhan' | 'VidhiCatalog' | 'SadhanaPrograms' | 'Library' | 'TheerthMap' | 'DaanPunya' }
  | { tab: 'more'; screen: 'WidgetGallery' | 'PitruSmaranList' | 'VastuDisha' | 'KulParampara' }
  | { tab: 'panchang'; screen: 'MuhuratFinder' | 'GunaMilan' | 'Namkaran' };

export type FeatureFeedEntry = {
  /** Stable forever. Never reuse an id for a different feature. */
  id: string;
  /** The app version that introduced it. Must be a key of `whatsNew`. */
  version: string;
  titleHi: string;
  titleEn: string;
  descHi: string;
  descEn: string;
  /** One Devanagari grapheme for the card thumb, matching LibraryEntry.thumb. */
  thumb: string;
  target: FeatureTarget;
};

/**
 * Newest first. A feature leaves this list only when the feature itself is
 * removed from the app — never to "make room", since the cap already does that.
 */
export const FEATURE_FEED: readonly FeatureFeedEntry[] = [
  {
    /**
     * दान-पुण्य shipped with a hardcoded `hasNew: true` on both a grid tile and
     * a DISCOVER card — a badge that could never clear, the exact pattern नया
     * exists to replace. The standing door is the उपकरण tile; this card is the
     * announcement, and it goes away the moment the user opens it.
     */
    id: 'daan-punya',
    version: '1.4.9',
    titleHi: 'दान-पुण्य',
    titleEn: 'Daan Punya',
    descHi: 'जप · व्रत · दान — पहले महत्व, फिर देना। कभी भी।',
    descEn: 'Japa, vrat, daan — understand first, then give. Any day.',
    thumb: 'दा',
    target: { tab: 'home', screen: 'DaanPunya' },
  },
  {
    id: 'vastu-disha',
    version: '1.4.8',
    titleHi: 'वास्तु दिशा',
    titleEn: 'Vastu Disha',
    descHi: 'मंदिर, रसोई और द्वार की शास्त्रीय दिशा — कारण सहित।',
    descEn: 'Classical directions for the mandir, kitchen and door, each with its reason.',
    thumb: 'वा',
    target: { tab: 'more', screen: 'VastuDisha' },
  },
  {
    id: 'home-widgets',
    version: '1.4.7',
    titleHi: 'होम-स्क्रीन विजेट',
    titleEn: 'Home-screen widgets',
    descHi: 'आज का श्लोक, पंचांग और जप — होम स्क्रीन पर।',
    descEn: "Today's verse, Panchang and japa, on your home screen.",
    thumb: 'वि',
    target: { tab: 'more', screen: 'WidgetGallery' },
  },
  {
    id: 'guna-milan',
    version: '1.4.7',
    titleHi: 'गुण मिलान',
    titleEn: 'Guna Milan',
    descHi: 'दो कुंडलियों के ३६ गुण — हर कूट का स्पष्ट हिसाब।',
    descEn: 'A private 36-point match, with every koota explained.',
    thumb: 'मि',
    target: { tab: 'panchang', screen: 'GunaMilan' },
  },
];

/**
 * The cards to show, newest version first, already filtered by what this user
 * has opened.
 *
 * `appVersion` gates the feed against the running build: an entry authored for
 * an unreleased version must never advertise a screen that is not there yet.
 */
export function pendingFeatures(
  seen: Readonly<Record<string, string>>,
  appVersion: string,
  feed: readonly FeatureFeedEntry[] = FEATURE_FEED,
  limit = 3,
): FeatureFeedEntry[] {
  return feed
    .filter((f) => compareSemver(f.version, appVersion) <= 0)
    .filter((f) => seen[f.id] === undefined)
    .slice(0, limit);
}

/**
 * The seen-map a **fresh install** starts from: everything, already seen.
 *
 * A first-time user has no history against which anything is "new", and they
 * are about to be walked through the whole app by the 24-step tour. Showing
 * them three नया cards would be a second, worse tour. Only a genuine upgrade
 * accumulates pending entries — the same install-vs-upgrade split
 * `NewContentContext` draws with `UPGRADER_SIGNAL_KEYS`.
 */
export function seedSeenForFreshInstall(
  appVersion: string,
  feed: readonly FeatureFeedEntry[] = FEATURE_FEED,
): Record<string, string> {
  const seen: Record<string, string> = {};
  for (const entry of feed) seen[entry.id] = appVersion;
  return seen;
}

/** Every feed version must exist in `whatsNew`; pinned by the feed test. */
export function feedVersionsMissingFromWhatsNew(
  feed: readonly FeatureFeedEntry[] = FEATURE_FEED,
): string[] {
  return [...new Set(feed.map((f) => f.version))].filter((v) => whatsNew[v] === undefined);
}
