// Card elevation tokens — implements design.md §4 "Elevation" for React Native.
// The warm parchment palette has very low figure-ground contrast (cards, the
// background, and toggles all sit within a couple shades of cream), so cards
// get a soft shadow to read as lifted off the page rather than floating
// invisibly. Shadow colour is the warm rgba(60,30,10) from the spec.
//
// Cross-platform trap: React Native honours the iOS `shadow*` props ONLY on iOS.
// On Android it ignores them entirely and draws its own shadow from the integer
// `elevation` prop — a hard grey box cast on all four sides (including the top),
// which reads nothing like the soft warm downward lift the design intends. So
// each tier keeps the iOS `shadow*` props AND adds an Android-only `boxShadow`
// carrying the same offset/blur/colour. Android renders the boxShadow; iOS
// ignores it (it uses shadow*). We deliberately DO NOT set the integer
// `elevation` — Android would then draw BOTH the native grey box and the
// boxShadow, doubling the shadow. (Requires the New Architecture, which this app
// runs; boxShadow is a no-op on the legacy renderer.)
//
// The scale was widened in Jul 2026: an audit found 14 files hand-rolling their
// own shadows, so cards floated at slightly different heights across the app and
// the warm hex was re-typed by hand (with casing drift, plus one off-palette
// '#0a0604'). The tiers below are the clusters that audit actually found, so
// every real surface has a token and none needs a literal. Enforced by the
// no-restricted-syntax shadowColor rule in eslint.config.js.

import { Platform } from 'react-native';

// One definition of the warm shadow. Never inline this hex at a call site.
const WARM_SHADOW = '#3C1E0A';

// Android-only soft shadow matching a companion set of iOS shadow* props.
// Android ignores shadow* and would otherwise draw the integer `elevation` as a
// hard grey box on all four sides, so give it a matching boxShadow and set no
// `elevation`. `color` is the full CSS colour (with opacity baked in). Empty on
// iOS, where the shadow* props already carry the shadow. Requires the New
// Architecture; boxShadow is a no-op on the legacy renderer.
//
// Exported so bespoke non-token surfaces (e.g. the routine banner and audio
// mini-player, which use an ink-tinted shadow rather than the warm token
// shadow) can reuse the exact same cross-platform pattern.
export const androidBoxShadow = (offsetY: number, blur: number, color: string) =>
  Platform.select({
    android: { boxShadow: `0px ${offsetY}px ${blur}px ${color}` },
    default: null,
  });

export const elevation = {
  // Dim / inactive card — present but barely lifted (unselected category and
  // library cards, the More hub rows).
  subtle: {
    shadowColor: WARM_SHADOW,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    ...androidBoxShadow(1, 4, 'rgba(60, 30, 10, 0.06)'),
  },
  // Default card — lifts an off-white surface off the parchment background.
  card: {
    shadowColor: WARM_SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    ...androidBoxShadow(2, 6, 'rgba(60, 30, 10, 0.1)'),
  },
  // Mid tier — an active/selected catalog tile or chapter card. Reads clearly
  // lifted without claiming the focal position `raised` holds.
  lifted: {
    shadowColor: WARM_SHADOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.11,
    shadowRadius: 12,
    ...androidBoxShadow(4, 12, 'rgba(60, 30, 10, 0.11)'),
  },
  // Emphasised card — the one focal element on a screen (e.g. the Tithi/Nakshatra
  // tiles, the My Vrat door, an active deity/track/theerth card).
  raised: {
    shadowColor: WARM_SHADOW,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    ...androidBoxShadow(6, 14, 'rgba(60, 30, 10, 0.16)'),
  },
  // Floats above a scrim — the feature-tour spotlight card. Deeper than `raised`
  // because it must separate from a dimmed backdrop, not from parchment.
  overlay: {
    shadowColor: WARM_SHADOW,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    ...androidBoxShadow(6, 14, 'rgba(60, 30, 10, 0.25)'),
  },
} as const;

export type ElevationScale = typeof elevation;
