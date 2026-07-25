// Card elevation tokens — implements design.md §4 "Elevation" for React Native.
// The warm parchment palette has very low figure-ground contrast (cards, the
// background, and toggles all sit within a couple shades of cream), so cards
// get a soft shadow to read as lifted off the page rather than floating
// invisibly. Shadow colour is the warm rgba(60,30,10) from the spec; both iOS
// (shadow*) and Android (elevation) props are set so a single spread works
// cross-platform. The card must have a solid (non-transparent) background — the
// parchmentSoft card surface is opaque — for the shadow to render on Android.
//
// The scale was widened in Jul 2026: an audit found 14 files hand-rolling their
// own shadows, so cards floated at slightly different heights across the app and
// the warm hex was re-typed by hand (with casing drift, plus one off-palette
// '#0a0604'). The tiers below are the clusters that audit actually found, so
// every real surface has a token and none needs a literal. Enforced by the
// no-restricted-syntax shadowColor rule in eslint.config.js.

// One definition of the warm shadow. Never inline this hex at a call site.
const WARM_SHADOW = '#3C1E0A';

export const elevation = {
  // Dim / inactive card — present but barely lifted (unselected category and
  // library cards, the More hub rows).
  subtle: {
    shadowColor: WARM_SHADOW,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  // Default card — lifts an off-white surface off the parchment background.
  card: {
    shadowColor: WARM_SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  // Mid tier — an active/selected catalog tile or chapter card. Reads clearly
  // lifted without claiming the focal position `raised` holds.
  lifted: {
    shadowColor: WARM_SHADOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.11,
    shadowRadius: 12,
    elevation: 3,
  },
  // Emphasised card — the one focal element on a screen (e.g. the Tithi/Nakshatra
  // tiles, the My Vrat door, an active deity/track/theerth card).
  raised: {
    shadowColor: WARM_SHADOW,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 5,
  },
  // Floats above a scrim — the feature-tour spotlight card. Deeper than `raised`
  // because it must separate from a dimmed backdrop, not from parchment.
  overlay: {
    shadowColor: WARM_SHADOW,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 10,
  },
} as const;

export type ElevationScale = typeof elevation;
